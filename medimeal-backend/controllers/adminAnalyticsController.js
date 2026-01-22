const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ComplianceLog = require('../models/ComplianceLog');
const FoodPlan = require('../models/FoodPlan');
const Meal = require('../models/Meal');
const HealthRecord = require('../models/HealthRecord');
const Subscription = require('../models/Subscription');

/**
 * GET /api/admin/analytics/user-growth
 * Get user growth and activity analytics
 */
const getUserGrowthAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Active users (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo }
    });

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // New users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // New users this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: monthAgo }
    });

    res.json({
      success: true,
      data: {
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        userGrowth,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        totalUsers: await User.countDocuments()
      }
    });
  } catch (error) {
    console.error('Get user growth analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user growth analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/admin/analytics/appointments
 * Get appointment and consultation statistics
 */
const getAppointmentAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total appointments
    const totalAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startDate }
    });

    // Appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Appointments by type
    const appointmentsByType = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Teleconsultation vs in-person
    const appointmentsByMode = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$mode',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average appointment duration
    const avgDuration = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: startDate },
          duration: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Completed appointments
    const completedAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startDate },
      status: 'completed'
    });

    // Cancelled appointments
    const cancelledAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startDate },
      status: 'cancelled'
    });

    res.json({
      success: true,
      data: {
        totalAppointments,
        appointmentsByStatus: appointmentsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        appointmentsByType: appointmentsByType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        appointmentsByMode: appointmentsByMode.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        avgDuration: avgDuration[0]?.avgDuration || 0,
        completedAppointments,
        cancelledAppointments,
        completionRate: totalAppointments > 0 
          ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Get appointment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/admin/analytics/diet-success
 * Get diet success and compliance rates
 */
const getDietSuccessAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total active food plans
    const totalPlans = await FoodPlan.countDocuments({
      isActive: true,
      createdAt: { $gte: startDate }
    });

    // Compliance logs
    const totalComplianceLogs = await ComplianceLog.countDocuments({
      createdAt: { $gte: startDate }
    });

    const resolvedComplianceLogs = await ComplianceLog.countDocuments({
      createdAt: { $gte: startDate },
      resolved: true
    });

    const complianceRate = totalComplianceLogs > 0
      ? ((resolvedComplianceLogs / totalComplianceLogs) * 100).toFixed(2)
      : 100;

    // Compliance by severity
    const complianceBySeverity = await ComplianceLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Compliance by category
    const complianceByCategory = await ComplianceLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Meal logging activity
    const totalMeals = await Meal.countDocuments({
      createdAt: { $gte: startDate }
    });

    const uniqueUsersWithMeals = await Meal.distinct('userId', {
      createdAt: { $gte: startDate }
    });

    // Weight loss success (patients with active plans who lost weight)
    const plansWithWeightData = await FoodPlan.find({
      isActive: true,
      createdAt: { $gte: startDate }
    }).populate('patientId');

    let weightLossSuccess = 0;
    for (const plan of plansWithWeightData) {
      const weightRecords = await HealthRecord.find({
        userId: plan.patientId?._id,
        type: 'weight',
        recordedAt: { $gte: plan.startDate }
      }).sort({ recordedAt: 1 });

      if (weightRecords.length >= 2) {
        const initialWeight = weightRecords[0].values.value;
        const latestWeight = weightRecords[weightRecords.length - 1].values.value;
        if (latestWeight < initialWeight) {
          weightLossSuccess++;
        }
      }
    }

    res.json({
      success: true,
      data: {
        totalPlans,
        complianceRate: parseFloat(complianceRate),
        totalComplianceLogs,
        resolvedComplianceLogs,
        complianceBySeverity: complianceBySeverity.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        complianceByCategory: complianceByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalMeals,
        uniqueUsersWithMeals: uniqueUsersWithMeals.length,
        weightLossSuccess,
        weightLossSuccessRate: plansWithWeightData.length > 0
          ? ((weightLossSuccess / plansWithWeightData.length) * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Get diet success analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get diet success analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/admin/analytics/ai-accuracy
 * Get AI recommendation accuracy metrics
 */
const getAIAccuracyMetrics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total recommendations generated
    // This would come from a recommendations log if you have one
    // For now, we'll use FoodPlan as a proxy
    const aiGeneratedPlans = await FoodPlan.countDocuments({
      createdAt: { $gte: startDate },
      // Assuming AI-generated plans have a flag or source field
    });

    // Plans that were approved (doctor approved = good recommendation)
    const approvedPlans = await FoodPlan.countDocuments({
      createdAt: { $gte: startDate },
      status: 'approved'
    });

    // Plans that were modified (needed adjustment)
    const modifiedPlans = await FoodPlan.countDocuments({
      createdAt: { $gte: startDate },
      status: 'modified'
    });

    // User engagement with recommendations
    // Meals logged that match recommended foods
    const mealsWithPlans = await Meal.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'foodplans',
          localField: 'userId',
          foreignField: 'patientId',
          as: 'plans'
        }
      },
      {
        $match: {
          plans: { $ne: [] }
        }
      },
      {
        $count: 'total'
      }
    ]);

    const engagementRate = aiGeneratedPlans > 0
      ? ((mealsWithPlans[0]?.total || 0) / aiGeneratedPlans * 100).toFixed(2)
      : 0;

    // Recommendation acceptance rate
    const acceptanceRate = aiGeneratedPlans > 0
      ? ((approvedPlans / aiGeneratedPlans) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        totalRecommendations: aiGeneratedPlans,
        approvedPlans,
        modifiedPlans,
        rejectedPlans: aiGeneratedPlans - approvedPlans - modifiedPlans,
        acceptanceRate: parseFloat(acceptanceRate),
        modificationRate: aiGeneratedPlans > 0
          ? ((modifiedPlans / aiGeneratedPlans) * 100).toFixed(2)
          : 0,
        engagementRate: parseFloat(engagementRate),
        mealsWithPlans: mealsWithPlans[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get AI accuracy metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI accuracy metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/admin/analytics/dashboard
 * Get comprehensive dashboard analytics
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all analytics in parallel
    const [
      userGrowthData,
      appointmentData,
      dietSuccessData,
      aiAccuracyData
    ] = await Promise.all([
      // User Growth
      (async () => {
        const usersByRole = await User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        const activeUsers = await User.countDocuments({
          lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });
        return {
          usersByRole: usersByRole.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          activeUsers,
          totalUsers: await User.countDocuments()
        };
      })(),
      // Appointments
      (async () => {
        const total = await Appointment.countDocuments({
          appointmentDate: { $gte: startDate }
        });
        const completed = await Appointment.countDocuments({
          appointmentDate: { $gte: startDate },
          status: 'completed'
        });
        return {
          totalAppointments: total,
          completedAppointments: completed,
          completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
        };
      })(),
      // Diet Success
      (async () => {
        const totalPlans = await FoodPlan.countDocuments({ isActive: true });
        const totalLogs = await ComplianceLog.countDocuments({
          createdAt: { $gte: startDate }
        });
        const resolvedLogs = await ComplianceLog.countDocuments({
          createdAt: { $gte: startDate },
          resolved: true
        });
        return {
          totalPlans,
          complianceRate: totalLogs > 0
            ? ((resolvedLogs / totalLogs) * 100).toFixed(2)
            : 100
        };
      })(),
      // AI Accuracy
      (async () => {
        const totalPlans = await FoodPlan.countDocuments({
          createdAt: { $gte: startDate }
        });
        const approved = await FoodPlan.countDocuments({
          createdAt: { $gte: startDate },
          status: 'approved'
        });
        return {
          totalRecommendations: totalPlans,
          approvedPlans: approved,
          acceptanceRate: totalPlans > 0
            ? ((approved / totalPlans) * 100).toFixed(2)
            : 0
        };
      })()
    ]);

    res.json({
      success: true,
      data: {
        userGrowth: userGrowthData,
        appointments: appointmentData,
        dietSuccess: dietSuccessData,
        aiAccuracy: aiAccuracyData
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserGrowthAnalytics,
  getAppointmentAnalytics,
  getDietSuccessAnalytics,
  getAIAccuracyMetrics,
  getDashboardAnalytics
};

