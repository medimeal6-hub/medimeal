const User = require('../models/User');
const Food = require('../models/Food');
const Medicine = require('../models/Medicine');
const FoodDrugConflict = require('../models/FoodDrugConflict');
const PatientAssignment = require('../models/PatientAssignment');
const ReminderLog = require('../models/ReminderLog');
const FoodPlan = require('../models/FoodPlan');
const ExercisePlan = require('../models/ExercisePlan');

// @desc    Get system analytics for admin dashboard
// @route   GET /api/analytics/system
// @access  Private (Admin only)
const getSystemAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalPatients,
      totalFoods,
      totalMedicines,
      totalConflicts,
      totalAssignments,
      totalReminders,
      recentUsers,
      activePlans
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'user', isActive: true }),
      Food.countDocuments({ isActive: true }),
      Medicine.countDocuments({ isActive: true }),
      FoodDrugConflict.countDocuments({ isActive: true }),
      PatientAssignment.countDocuments({ isActive: true }),
      ReminderLog.countDocuments(),
      User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('firstName lastName email createdAt'),
      FoodPlan.countDocuments({ isActive: true }) + ExercisePlan.countDocuments({ isActive: true })
    ]);

    // Get user growth over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Get reminder statistics
    const reminderStats = await ReminderLog.aggregate([
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          successful: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          read: { $sum: { $cond: ['$isRead', 1, 0] } }
        }
      }
    ]);

    const analytics = {
      overview: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalFoods,
        totalMedicines,
        totalConflicts,
        totalAssignments,
        totalReminders,
        activePlans
      },
      growth: {
        newUsersThisMonth,
        userGrowthRate: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(2) : 0
      },
      reminders: reminderStats[0] || {
        totalSent: 0,
        successful: 0,
        failed: 0,
        read: 0
      },
      recentUsers,
      systemHealth: {
        databaseConnected: true,
        lastBackup: new Date().toISOString(),
        uptime: process.uptime()
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('System analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system analytics',
      error: error.message
    });
  }
};

// @desc    Get user analytics for patient dashboard
// @route   GET /api/analytics/user
// @access  Private
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's medication adherence
    const reminderStats = await ReminderLog.getUserStats(userId);
    const recentReminders = await ReminderLog.getRecentReminders(userId, 10);

    // Get user's food plans
    const foodPlans = await FoodPlan.findActiveForPatient(userId);
    const exercisePlans = await ExercisePlan.findActiveForPatient(userId);

    // Calculate adherence percentage
    const stats = reminderStats[0] || {
      totalReminders: 0,
      takenMedications: 0,
      skippedMedications: 0
    };

    const adherenceRate = stats.totalReminders > 0 
      ? ((stats.takenMedications / stats.totalReminders) * 100).toFixed(1)
      : 0;

    // Get safe meal percentage (mock data for now)
    const safeMealPercentage = 85; // This would be calculated based on actual meal logs

    const analytics = {
      adherence: {
        rate: parseFloat(adherenceRate),
        totalReminders: stats.totalReminders,
        taken: stats.takenMedications,
        skipped: stats.skippedMedications
      },
      meals: {
        safeMealPercentage,
        totalMeals: 30, // Mock data
        safeMeals: 25 // Mock data
      },
      plans: {
        activeFoodPlans: foodPlans.length,
        activeExercisePlans: exercisePlans.length,
        completedPlans: 0 // Mock data
      },
      recentActivity: recentReminders,
      goals: {
        medicationAdherence: 90,
        safeMealRate: 80,
        exerciseCompletion: 70
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message
    });
  }
};

// @desc    Get doctor analytics for doctor dashboard
// @route   GET /api/analytics/doctor
// @access  Private (Doctor only)
const getDoctorAnalytics = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get doctor's patients
    const patients = await PatientAssignment.findPatientsForDoctor(doctorId);
    const patientIds = patients.map(p => p.patientId._id);

    // Get average adherence of all patients
    const patientStats = await ReminderLog.aggregate([
      { $match: { userId: { $in: patientIds } } },
      {
        $group: {
          _id: '$userId',
          totalReminders: { $sum: 1 },
          taken: { $sum: { $cond: [{ $eq: ['$userResponse', 'taken'] }, 1, 0] } }
        }
      },
      {
        $group: {
          _id: null,
          avgAdherence: { $avg: { $multiply: [{ $divide: ['$taken', '$totalReminders'] }, 100] } },
          totalPatients: { $sum: 1 }
        }
      }
    ]);

    // Get active plans
    const foodPlans = await FoodPlan.findByDoctor(doctorId);
    const exercisePlans = await ExercisePlan.findByDoctor(doctorId);

    const analytics = {
      patients: {
        total: patients.length,
        active: patients.filter(p => p.status === 'active').length
      },
      adherence: {
        average: patientStats[0]?.avgAdherence?.toFixed(1) || 0,
        totalPatients: patientStats[0]?.totalPatients || 0
      },
      plans: {
        activeFoodPlans: foodPlans.length,
        activeExercisePlans: exercisePlans.length,
        completedPlans: 0 // Mock data
      },
      recentActivity: patients.slice(0, 5).map(p => ({
        patientName: `${p.patientId.firstName} ${p.patientId.lastName}`,
        lastActivity: p.updatedAt,
        status: p.status
      }))
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Doctor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor analytics',
      error: error.message
    });
  }
};

module.exports = {
  getSystemAnalytics,
  getUserAnalytics,
  getDoctorAnalytics
};
