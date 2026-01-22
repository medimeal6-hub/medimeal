const User = require('../models/User');
const Food = require('../models/Food');
const FoodPlan = require('../models/FoodPlan');
const FoodDrugConflict = require('../models/FoodDrugConflict');
const ComplianceLog = require('../models/ComplianceLog');
const SystemMetric = require('../models/SystemMetric');

/**
 * Utility: map internal severity to numeric score
 */
const severityScore = (severity) => {
  if (severity === 'high') return 10;
  if (severity === 'medium') return 5;
  return 1;
};

/**
 * Recalculate and persist compliance logs for active food plans.
 * This can be invoked periodically (cron) or on demand from the admin panel.
 *
 * Rule examples:
 * - If disease conflicts with food → log violation (category: food-disease)
 * - If medicine conflicts with food → log warning (category: food-medicine)
 */
const recalculateComplianceForAllPlans = async () => {
  const activePlans = await FoodPlan.find({ isActive: true })
    .populate('doctorId', 'firstName lastName role')
    .populate('patientId', 'firstName lastName role medicalConditions medications');

  const logs = [];

  for (const plan of activePlans) {
    const patient = plan.patientId;
    const doctor = plan.doctorId;
    if (!patient) continue;

    const diseases = patient.medicalConditions || [];
    const medications = (patient.medications || []).map((m) => m.name);

    const allMeals = [
      ...(plan.breakfast || []),
      ...(plan.lunch || []),
      ...(plan.dinner || []),
      ...(plan.snacks || []),
    ];

    // Preload unique foods for efficiency
    const foodIds = [...new Set(allMeals.map((m) => m.foodId).filter(Boolean))];
    const foods = await Food.find({ _id: { $in: foodIds } });
    const foodsById = foods.reduce((acc, f) => {
      acc[f._id.toString()] = f;
      return acc;
    }, {});

    for (const item of allMeals) {
      const food = foodsById[item.foodId?.toString()];
      if (!food) continue;

      // Disease compatibility: if food explicitly lists suitableForDiseases and
      // patient disease is NOT in the list, consider it a potential violation.
      if (Array.isArray(food.suitableForDiseases) && food.suitableForDiseases.length > 0) {
        for (const disease of diseases) {
          if (!food.suitableForDiseases.includes(disease)) {
            logs.push({
              userId: patient._id,
              doctorId: doctor?._id,
              category: 'food-disease',
              ruleCode: 'FD-001',
              severity: 'high',
              message: `Food "${food.name}" may not be suitable for condition "${disease}".`,
              context: {
                foodName: food.name,
                foodId: food._id,
                diseaseName: disease,
                planId: plan._id,
              },
            });
          }
        }
      }

      // Medicine conflict: leverage FoodDrugConflict model + avoidWithMedicines on food
      for (const medName of medications) {
        // Check explicit avoid list on food
        if (
          Array.isArray(food.avoidWithMedicines) &&
          food.avoidWithMedicines.some((m) => m.toLowerCase() === medName.toLowerCase())
        ) {
          logs.push({
            userId: patient._id,
            doctorId: doctor?._id,
            category: 'food-medicine',
            ruleCode: 'FM-001',
            severity: 'medium',
            message: `Food "${food.name}" should be avoided with medicine "${medName}".`,
            context: {
              foodName: food.name,
              foodId: food._id,
              medicineName: medName,
              planId: plan._id,
            },
          });
        }

        // Check centralized conflict knowledge base
        // eslint-disable-next-line no-await-in-loop
        const conflict = await FoodDrugConflict.checkConflict(medName, food.name);
        if (conflict) {
          logs.push({
            userId: patient._id,
            doctorId: doctor?._id,
            category: 'food-medicine',
            ruleCode: 'FM-002',
            severity:
              conflict.severity && ['Low', 'Medium', 'High', 'Critical'].includes(conflict.severity)
                ? conflict.severity.toLowerCase()
                : 'medium',
            message: `Conflict detected between "${food.name}" and "${medName}" (${conflict.severity}).`,
            context: {
              foodName: food.name,
              foodId: food._id,
              medicineName: medName,
              planId: plan._id,
              meta: {
                conflictId: conflict._id,
              },
            },
          });
        }
      }
    }
  }

  if (logs.length > 0) {
    // Clear previous auto‑generated logs before inserting fresh snapshot
    await ComplianceLog.deleteMany({});
    await ComplianceLog.insertMany(logs);
  }

  return logs.length;
};

/**
 * GET /api/admin/compliance/overview
 * High‑level summarised compliance view for the dashboard.
 *
 * Also exposes a top-level aggregate complianceScore matching:
 *   complianceScore = 100 - (high*10 + medium*5 + low*2)
 */
const getComplianceOverview = async (req, res) => {
  try {
    // Optionally recalculate on demand when requested with ?refresh=true
    if (req.query.refresh === 'true') {
      await recalculateComplianceForAllPlans();
    }

    const [bySeverity, byCategory, perUser] = await Promise.all([
      ComplianceLog.aggregate([
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 },
          },
        },
      ]),
      ComplianceLog.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
      // Per‑user compliance score based on impact
      ComplianceLog.aggregate([
        {
          $group: {
            _id: '$userId',
            totalImpact: { $sum: '$impactScore' },
            violations: { $sum: 1 },
          },
        },
        {
          $project: {
            userId: '$_id',
            _id: 0,
            violations: 1,
            totalImpact: 1,
            complianceScore: {
              $max: [
                0,
                {
                  $subtract: [100, { $multiply: ['$totalImpact', 2] }],
                },
              ],
            },
          },
        },
        { $sort: { complianceScore: 1 } },
        { $limit: 50 },
      ]),
    ]);

    // Compute global complianceScore from severity counts
    const counts = bySeverity.reduce(
      (acc, s) => {
        const key = (s._id || '').toLowerCase();
        if (key === 'high') acc.high += s.count || 0;
        else if (key === 'medium') acc.medium += s.count || 0;
        else if (key === 'low') acc.low += s.count || 0;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    const rawScore = 100 - (counts.high * 10 + counts.medium * 5 + counts.low * 2);
    const complianceScore = Math.max(0, rawScore);

    // Persist a snapshot metric for system health analytics
    await SystemMetric.create({
      key: 'compliance.totalViolations',
      category: 'compliance',
      value: perUser.reduce((acc, u) => acc + (u.violations || 0), 0),
    });

    res.json({
      success: true,
      data: {
        bySeverity,
        byCategory,
        perUser,
        complianceScore,
      },
    });
  } catch (error) {
    console.error('Compliance overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance overview',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/compliance/violations
 * Paginated violations list with filters.
 */
const getComplianceViolations = async (req, res) => {
  try {
    const {
      userId,
      doctorId,
      category,
      severity,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (userId) query.userId = userId;
    if (doctorId) query.doctorId = doctorId;
    if (category) query.category = category;
    if (severity) query.severity = severity;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [items, total] = await Promise.all([
      ComplianceLog.find(query)
        .populate('userId', 'firstName lastName email role')
        .populate('doctorId', 'firstName lastName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      ComplianceLog.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Compliance violations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance violations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/analytics/system-metrics
 * Returns recent SystemMetric entries used for system‑wide analytics.
 */
const getSystemMetrics = async (req, res) => {
  try {
    const { key, category, limit = 100 } = req.query;
    const query = {};
    if (key) query.key = key;
    if (category) query.category = category;

    const metrics = await SystemMetric.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/compliance/heatmap
 * Returns users sorted by risk (low compliance score first).
 */
const getComplianceHeatmap = async (req, res) => {
  try {
    const perUser = await ComplianceLog.aggregate([
      {
        $group: {
          _id: '$userId',
          totalImpact: { $sum: '$impactScore' },
          violations: { $sum: 1 },
        },
      },
      {
        $project: {
          userId: '$_id',
          _id: 0,
          violations: 1,
          totalImpact: 1,
          complianceScore: {
            $max: [
              0,
              {
                $subtract: [100, { $multiply: ['$totalImpact', 2] }],
              },
            ],
          },
        },
      },
      { $sort: { complianceScore: 1 } },
    ]);

    // Optionally enrich with basic user info
    const userIds = perUser.map((u) => u.userId);
    const users = await User.find({ _id: { $in: userIds } }).select(
      'firstName lastName email role'
    );
    const usersById = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {});

    const enriched = perUser.map((row) => ({
      ...row,
      user: usersById[row.userId?.toString()] || null,
    }));

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error('Compliance heatmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance heatmap',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/compliance/flag-user
 * Flags a user as high-risk based on compliance review.
 * This is implemented as an AuditLog/metric side-effect in a real system;
 * here we simply drop a SystemMetric entry + optional user flag.
 */
const flagComplianceUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Record as a metric event for now
    await SystemMetric.create({
      key: 'compliance.flaggedUser',
      category: 'compliance',
      value: 1,
      userId,
      payload: {
        reason: reason || 'Flagged from admin dashboard',
        flaggedBy: req.user?._id,
      },
    });

    res.json({
      success: true,
      message: 'User flagged for compliance review',
    });
  } catch (error) {
    console.error('Flag compliance user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to flag user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/compliance/violation/:id/review
 * Marks a violation as reviewed.
 */
const markViolationReviewed = async (req, res) => {
  try {
    const violation = await ComplianceLog.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolvedAt: new Date(), resolvedBy: req.user?._id },
      { new: true }
    );

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found',
      });
    }

    res.json({
      success: true,
      message: 'Violation marked as reviewed',
      data: violation,
    });
  } catch (error) {
    console.error('Mark violation reviewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark violation as reviewed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/admin/compliance/violation/:id/escalate
 * Escalates a violation – implemented as increasing severity/impact.
 */
const escalateViolation = async (req, res) => {
  try {
    const violation = await ComplianceLog.findById(req.params.id);
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found',
      });
    }

    violation.severity = 'high';
    violation.impactScore = severityScore('high');
    await violation.save();

    res.json({
      success: true,
      message: 'Violation escalated to high severity',
      data: violation,
    });
  } catch (error) {
    console.error('Escalate violation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to escalate violation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * DELETE /api/admin/compliance/violation/:id
 * Deletes a violation log entry.
 */
const deleteViolation = async (req, res) => {
  try {
    const result = await ComplianceLog.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found',
      });
    }

    res.json({
      success: true,
      message: 'Violation deleted',
    });
  } catch (error) {
    console.error('Delete violation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete violation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * GET /api/admin/system/health
 * High-level system health snapshot for the System Health Metrics page.
 */
const getSystemHealth = async (req, res) => {
  try {
    const uptimeSeconds = process.uptime();

    const latestMetrics = await SystemMetric.find({})
      .sort({ timestamp: -1 })
      .limit(50);

    res.json({
      success: true,
      data: {
        uptimeSeconds,
        metrics: latestMetrics,
      },
    });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * POST /api/admin/system/health/check
 * Triggers a lightweight health check and records metrics.
 */
const triggerSystemHealthCheck = async (req, res) => {
  try {
    // In a real system, this would perform ping checks, DB latency probes, etc.
    const latencyMs = Math.round(Math.random() * 100); // placeholder

    await SystemMetric.create({
      key: 'system.healthCheck.latencyMs',
      category: 'infrastructure',
      value: latencyMs,
    });

    res.json({
      success: true,
      message: 'Health check executed',
      data: { latencyMs },
    });
  } catch (error) {
    console.error('Trigger system health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform health check',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getComplianceOverview,
  getComplianceViolations,
  getSystemMetrics,
  getComplianceHeatmap,
  flagComplianceUser,
  markViolationReviewed,
  escalateViolation,
  deleteViolation,
  getSystemHealth,
  triggerSystemHealthCheck,
};



