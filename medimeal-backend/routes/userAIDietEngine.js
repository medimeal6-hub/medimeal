const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const FoodDiary = require('../models/FoodDiary');
const FoodPlan = require('../models/FoodPlan');
const Food = require('../models/Food');
const ComplianceLog = require('../models/ComplianceLog');

const router = express.Router();

// GET /api/user/ai-diet-engine - Get AI diet recommendations
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user health profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get recent food diary entries (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateString = sevenDaysAgo.toISOString().split('T')[0];
    
    const recentFoodDiary = await FoodDiary.find({
      userId,
      date: { $gte: dateString }
    }).sort({ date: -1, time: 1 });
    
    // Get active diet plan
    const activeDietPlan = await FoodPlan.findOne({
      patientId: userId,
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: { $gte: new Date() } }
      ]
    }).populate('breakfast.foodId lunch.foodId dinner.foodId', 'name calories');
    
    // Get compliance logs for conflicts
    const recentComplianceLogs = await ComplianceLog.find({
      userId,
      resolved: false,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 });
    
    // Generate recommended foods based on user profile
    const recommendedFoods = [];
    const foodsToAvoid = [];
    
    // Simple recommendation logic based on health conditions and medications
    if (user.medicalConditions && user.medicalConditions.length > 0) {
      // Add logic based on conditions
      if (user.medicalConditions.some(c => c.toLowerCase().includes('diabet'))) {
        recommendedFoods.push('Low glycemic index foods', 'High fiber vegetables', 'Whole grains');
        foodsToAvoid.push('High sugar foods', 'Refined carbohydrates', 'Processed foods');
      }
    }
    
    if (user.allergies && user.allergies.length > 0) {
      user.allergies.forEach(allergy => {
        foodsToAvoid.push(`Foods containing ${allergy}`);
      });
    }
    
    // Generate daily health tips
    const healthTips = [];
    
    if (user.medications && user.medications.length > 0) {
      healthTips.push('Take medications as prescribed with appropriate food timing');
      healthTips.push('Stay hydrated throughout the day');
    }
    
    if (recentComplianceLogs.length > 0) {
      healthTips.push('Review your compliance alerts and adjust your diet accordingly');
    }
    
    if (!healthTips.length) {
      healthTips.push('Maintain a balanced diet with variety');
      healthTips.push('Stay consistent with your meal timing');
    }
    
    res.status(200).json({
      success: true,
      data: {
        recommendedFoods,
        foodsToAvoid,
        dailyHealthTips: healthTips,
        recentFoodDiary: recentFoodDiary.slice(0, 10), // Last 10 entries
        activeDietPlan: activeDietPlan ? {
          planName: activeDietPlan.planName,
          breakfast: activeDietPlan.breakfast,
          lunch: activeDietPlan.lunch,
          dinner: activeDietPlan.dinner
        } : null,
        complianceAlerts: recentComplianceLogs.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('AI Diet Engine error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI recommendations'
    });
  }
});

// POST /api/user/ai-diet-engine/accept - Accept AI suggestion and update food diary
router.post('/accept', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { suggestion, mealType, date, time } = req.body;
    
    if (!suggestion || !mealType) {
      return res.status(400).json({
        success: false,
        message: 'suggestion and mealType are required'
      });
    }
    
    // Find the food item
    const food = await Food.findOne({ name: new RegExp(suggestion, 'i') });
    
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Suggested food not found in database'
      });
    }
    
    const mealDate = date || new Date().toISOString().split('T')[0];
    const mealTime = time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Create food diary entry
    const FoodDiary = require('../models/FoodDiary');
    const foodDiaryEntry = await FoodDiary.create({
      userId,
      date: mealDate,
      mealType,
      time: mealTime,
      foodItems: [{
        foodId: food._id,
        foodName: food.name,
        quantity: 1,
        unit: 'serving',
        calories: food.calories
      }],
      aiProcessed: true
    });
    
    // Update calendar (import the function from food diary routes)
    const CalendarEvent = require('../models/CalendarEvent');
    const eventDate = new Date(`${mealDate}T${mealTime}`);
    await CalendarEvent.create({
      userId,
      title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} - ${food.name}`,
      type: 'meal',
      date: eventDate,
      time: mealTime,
      duration: 30,
      priority: 'medium',
      completed: true,
      color: 'bg-green-100 text-green-700 border-green-200',
      mealDetails: {
        mealType: mealType.charAt(0).toUpperCase() + mealType.slice(1),
        calories: food.calories
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'AI suggestion accepted and logged',
      data: foodDiaryEntry
    });
  } catch (error) {
    console.error('Accept AI suggestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept suggestion'
    });
  }
});

module.exports = router;
