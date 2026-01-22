const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const FoodPlan = require('../models/FoodPlan');
const FoodDiary = require('../models/FoodDiary');
const Meal = require('../models/Meal');
const Appointment = require('../models/Appointment');
const CalendarEvent = require('../models/CalendarEvent');
const ComplianceLog = require('../models/ComplianceLog');

const router = express.Router();

// GET /api/user/dashboard - Get user dashboard data
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's diet plan
    const activeFoodPlan = await FoodPlan.findOne({
      patientId: userId,
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } }
      ]
    }).populate('doctorId', 'firstName lastName');
    
    // Get today's logged meals (from FoodDiary and Meal)
    const todayFoodDiary = await FoodDiary.find({
      userId,
      date: today
    }).sort({ time: 1 });
    
    const todayMeals = await Meal.find({
      userId,
      date: today
    }).sort({ time: 1 });
    
    // Get upcoming meals (from diet plan)
    const upcomingMeals = [];
    if (activeFoodPlan) {
      const mealTimes = {
        breakfast: '08:00',
        lunch: '12:30',
        dinner: '19:00'
      };
      
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const plannedMeal = activeFoodPlan[mealType] || [];
        if (plannedMeal.length > 0) {
          const logged = todayFoodDiary.some(fd => fd.mealType === mealType) ||
                        todayMeals.some(m => m.type === mealType);
          upcomingMeals.push({
            type: mealType,
            time: mealTimes[mealType],
            foods: plannedMeal.map(f => f.foodName),
            logged
          });
        }
      });
    }
    
    // Get next approved doctor appointment
    const nextAppointment = await Appointment.findOne({
      userId,
      status: { $in: ['approved', 'paid', 'confirmed'] },
      appointmentDate: { $gte: new Date() }
    }).sort({ appointmentDate: 1 });
    
    // Get health alerts (compliance logs)
    const recentAlerts = await ComplianceLog.find({
      userId,
      resolved: false
    })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Calculate compliance percentage
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const totalLogs = await ComplianceLog.countDocuments({
      userId,
      createdAt: { $gte: last30Days }
    });
    
    const resolvedLogs = await ComplianceLog.countDocuments({
      userId,
      createdAt: { $gte: last30Days },
      resolved: true
    });
    
    const compliancePercentage = totalLogs > 0 
      ? Math.round((resolvedLogs / totalLogs) * 100)
      : 100;
    
    // Count logged vs missed meals today
    const loggedMealsCount = todayFoodDiary.length + todayMeals.length;
    const missedMealsCount = Math.max(0, (activeFoodPlan ? 3 : 0) - loggedMealsCount);
    
    res.status(200).json({
      success: true,
      data: {
        todayDietPlan: activeFoodPlan ? {
          planName: activeFoodPlan.planName,
          breakfast: activeFoodPlan.breakfast,
          lunch: activeFoodPlan.lunch,
          dinner: activeFoodPlan.dinner,
          doctor: activeFoodPlan.doctorId ? {
            name: `${activeFoodPlan.doctorId.firstName} ${activeFoodPlan.doctorId.lastName}`
          } : null
        } : null,
        loggedMeals: {
          count: loggedMealsCount,
          meals: [...todayFoodDiary, ...todayMeals]
        },
        missedMeals: {
          count: missedMealsCount
        },
        upcomingMeals,
        nextAppointment: nextAppointment ? {
          id: nextAppointment._id,
          doctorName: nextAppointment.provider.name,
          date: nextAppointment.appointmentDate.toISOString().split('T')[0],
          time: nextAppointment.appointmentDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }),
          type: nextAppointment.type,
          status: nextAppointment.status
        } : null,
        healthAlerts: recentAlerts.map(alert => ({
          id: alert._id,
          category: alert.category,
          severity: alert.severity,
          message: alert.message,
          createdAt: alert.createdAt
        })),
        compliancePercentage
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data'
    });
  }
});

module.exports = router;
