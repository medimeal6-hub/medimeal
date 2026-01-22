const PatientAssignment = require('../models/PatientAssignment');
const Appointment = require('../models/Appointment');
const ComplianceLog = require('../models/ComplianceLog');
const FoodPlan = require('../models/FoodPlan');
const HealthRecord = require('../models/HealthRecord');

/**
 * GET /api/doctor/workload
 * Get doctor workload and performance metrics
 */
const getWorkloadMetrics = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all assigned patients
    const assignments = await PatientAssignment.find({
      doctor: doctorId,
      status: 'active'
    }).populate('patient', 'firstName lastName');

    const patientIds = assignments.map(a => a.patient._id);

    // 1. Patients seen today
    const appointmentsToday = await Appointment.find({
      userId: { $in: patientIds },
      appointmentDate: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    const patientsSeenToday = new Set(appointmentsToday.map(a => a.userId.toString())).size;

    // 2. Pending follow-ups
    const pendingFollowUps = await Appointment.find({
      userId: { $in: patientIds },
      'appointmentNotes.followUpRequired': true,
      'appointmentNotes.followUpDate': { $lte: new Date() },
      status: { $ne: 'completed' }
    }).countDocuments();

    // 3. Compliance success rate
    const totalComplianceLogs = await ComplianceLog.countDocuments({
      userId: { $in: patientIds },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const resolvedComplianceLogs = await ComplianceLog.countDocuments({
      userId: { $in: patientIds },
      resolved: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const complianceRate = totalComplianceLogs > 0 
      ? Math.round((resolvedComplianceLogs / totalComplianceLogs) * 100)
      : 100;

    // 4. Diet outcome tracking
    const activePlans = await FoodPlan.find({
      doctorId,
      isActive: true
    }).populate('patientId', 'firstName lastName');

    const dietOutcomes = await Promise.all(
      activePlans.map(async (plan) => {
        const patientId = plan.patientId._id;
        
        // Get weight records for the plan period
        const weightRecords = await HealthRecord.find({
          userId: patientId,
          type: 'weight',
          recordedAt: { $gte: plan.startDate }
        }).sort({ recordedAt: 1 });

        let weightChange = 0;
        let weightTrend = 'stable';
        
        if (weightRecords.length >= 2) {
          const initialWeight = weightRecords[0].values.value;
          const latestWeight = weightRecords[weightRecords.length - 1].values.value;
          weightChange = latestWeight - initialWeight;
          
          if (weightChange > 1) weightTrend = 'increasing';
          else if (weightChange < -1) weightTrend = 'decreasing';
        }

        // Get compliance for this plan
        const planCompliance = await ComplianceLog.countDocuments({
          userId: patientId,
          'context.planId': plan._id,
          resolved: false
        });

        return {
          planId: plan._id,
          planName: plan.planName,
          patientName: `${plan.patientId.firstName} ${plan.patientId.lastName}`,
          startDate: plan.startDate,
          weightChange,
          weightTrend,
          complianceIssues: planCompliance,
          status: planCompliance === 0 ? 'compliant' : 'needs-attention'
        };
      })
    );

    // 5. Upcoming appointments count
    const upcomingAppointments = await Appointment.countDocuments({
      userId: { $in: patientIds },
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // 6. High-risk patients count
    let highRiskCount = 0;
    for (const assignment of assignments) {
      const patientId = assignment.patient._id;
      const [latestBP, latestSugar] = await Promise.all([
        HealthRecord.getLatestByType(patientId, 'blood-pressure'),
        HealthRecord.getLatestByType(patientId, 'blood-sugar')
      ]);

      const isHighRisk = 
        (latestBP[0] && (latestBP[0].values.systolic >= 160 || latestBP[0].values.diastolic >= 100)) ||
        (latestSugar[0] && latestSugar[0].values.value >= 180);

      if (isHighRisk) highRiskCount++;
    }

    res.json({
      success: true,
      data: {
        today: {
          patientsSeen: patientsSeenToday,
          appointmentsCompleted: appointmentsToday.length,
          pendingFollowUps
        },
        performance: {
          complianceRate,
          totalPatients: assignments.length,
          highRiskPatients: highRiskCount,
          upcomingAppointments
        },
        dietOutcomes,
        summary: {
          totalPatients: assignments.length,
          activePlans: activePlans.length,
          complianceRate,
          highRiskPatients: highRiskCount
        }
      }
    });
  } catch (error) {
    console.error('Get workload metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workload metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getWorkloadMetrics
};

