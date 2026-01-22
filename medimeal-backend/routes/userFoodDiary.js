const express = require('express');
const { auth } = require('../middleware/auth');
const FoodDiary = require('../models/FoodDiary');
const CalendarEvent = require('../models/CalendarEvent');
const ComplianceLog = require('../models/ComplianceLog');
const FoodPlan = require('../models/FoodPlan');

const router = express.Router();

// Helper function to trigger AI Diet Engine processing
async function triggerAIDietEngine(userId, foodDiaryEntry) {
  // This would integrate with AI service
  // For now, we'll mark as processed
  return true;
}

// Helper function to update calendar with meal event
async function updateCalendarWithMeal(userId, foodDiaryEntry) {
  try {
    const eventDate = new Date(`${foodDiaryEntry.date}T${foodDiaryEntry.time}`);
    
    // Check if event already exists
    const existingEvent = await CalendarEvent.findOne({
      userId,
      type: 'meal',
      date: eventDate,
      'mealDetails.mealType': foodDiaryEntry.mealType
    });
    
    if (!existingEvent) {
      await CalendarEvent.create({
        userId,
        title: `${foodDiaryEntry.mealType.charAt(0).toUpperCase() + foodDiaryEntry.mealType.slice(1)} - ${foodDiaryEntry.foodItems.map(f => f.foodName).join(', ')}`,
        type: 'meal',
        date: eventDate,
        time: foodDiaryEntry.time,
        duration: 30,
        description: `Logged ${foodDiaryEntry.mealType}`,
        priority: 'medium',
        completed: true,
        color: 'bg-green-100 text-green-700 border-green-200',
        mealDetails: {
          mealType: foodDiaryEntry.mealType.charAt(0).toUpperCase() + foodDiaryEntry.mealType.slice(1),
          calories: foodDiaryEntry.totalCalories
        }
      });
    }
  } catch (error) {
    console.error('Error updating calendar:', error);
  }
}

// Helper function to recalculate compliance score
async function recalculateCompliance(userId, foodDiaryEntry) {
  try {
    // Compare with diet plan
    const activePlan = await FoodPlan.findOne({
      patientId: userId,
      isActive: true
    });
    
    if (activePlan) {
      // Check if logged meal matches plan
      const plannedMeals = activePlan[foodDiaryEntry.mealType] || [];
      
      // Simple compliance check - can be enhanced
      const complianceScore = 100; // Placeholder
      
      return complianceScore;
    }
    
    return 100;
  } catch (error) {
    console.error('Error recalculating compliance:', error);
    return 100;
  }
}

// POST /api/user/food-diary - Log a meal
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      date,
      mealType,
      time,
      foodItems,
      notes
    } = req.body;
    
    if (!mealType || !time || !foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'mealType, time, and foodItems array are required'
      });
    }
    
    const mealDate = date || new Date().toISOString().split('T')[0];
    
    // Create food diary entry
    const foodDiaryEntry = await FoodDiary.create({
      userId,
      date: mealDate,
      mealType,
      time,
      foodItems,
      notes: notes || ''
    });
    
    // Trigger AI Diet Engine
    await triggerAIDietEngine(userId, foodDiaryEntry);
    foodDiaryEntry.aiProcessed = true;
    await foodDiaryEntry.save();
    
    // Update calendar
    await updateCalendarWithMeal(userId, foodDiaryEntry);
    
    // Recalculate compliance
    await recalculateCompliance(userId, foodDiaryEntry);
    foodDiaryEntry.complianceChecked = true;
    await foodDiaryEntry.save();
    
    res.status(201).json({
      success: true,
      message: 'Meal logged successfully',
      data: foodDiaryEntry
    });
  } catch (error) {
    console.error('Log meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log meal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/user/food-diary - Get food diary entries
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { date, from, to } = req.query;
    
    let query = { userId };
    if (date) {
      query.date = date;
    } else if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }
    
    const entries = await FoodDiary.find(query)
      .sort({ date: -1, time: 1 });
    
    res.status(200).json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Get food diary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch food diary'
    });
  }
});

// PUT /api/user/food-diary/:id - Update food diary entry
router.put('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const entryId = req.params.id;
    
    const entry = await FoodDiary.findOneAndUpdate(
      { _id: entryId, userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Food diary entry not found'
      });
    }
    
    // Re-trigger connections
    await triggerAIDietEngine(userId, entry);
    await updateCalendarWithMeal(userId, entry);
    await recalculateCompliance(userId, entry);
    
    res.status(200).json({
      success: true,
      message: 'Food diary entry updated',
      data: entry
    });
  } catch (error) {
    console.error('Update food diary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update food diary entry'
    });
  }
});

// DELETE /api/user/food-diary/:id - Delete food diary entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const entryId = req.params.id;
    
    const entry = await FoodDiary.findOneAndDelete({
      _id: entryId,
      userId
    });
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Food diary entry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Food diary entry deleted'
    });
  } catch (error) {
    console.error('Delete food diary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete food diary entry'
    });
  }
});

module.exports = router;
