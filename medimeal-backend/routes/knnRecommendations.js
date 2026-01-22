const express = require('express');
const { auth } = require('../middleware/auth');
const KNNRecommendationService = require('../services/knnService');

const router = express.Router();
const knnService = new KNNRecommendationService();

// Helper function to estimate daily calories (moved before use)
function estimateDailyCalories(user) {
  const weight = user.weight || 70;
  const height = user.height || 170;
  const age = user.age || 30;
  const sexFactor = (user.gender || '').toLowerCase() === 'female' ? -161 : 5;
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexFactor;
  const activity = (user.activityLevel || 'moderate').toLowerCase();
  const activityFactor = activity === 'sedentary' ? 1.2 : activity === 'light' ? 1.375 : activity === 'active' ? 1.55 : 1.725;
  return Math.round(bmr * activityFactor);
}

// GET /api/recommendations/knn-python
router.get('/knn-python', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Convert user data to KNN format
    const userProfile = {
      targetCalories: estimateDailyCalories({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.surveyData?.activityLevel
      }),
      preferredMealType: 'lunch', // Default
      dietaryPreferences: (user.surveyData?.dietaryRestrictions || []).map(p => p.toLowerCase()),
      healthConditions: (user.surveyData?.medicalConditions || []).map(c => c.toLowerCase()),
      allergies: (user.surveyData?.allergies || []).map(a => a.toLowerCase()),
      nRecommendations: 10
    };

    // Check if KNN service is available first
    const healthCheck = await knnService.healthCheck();
    if (healthCheck.status !== 'healthy' || !healthCheck.model_loaded) {
      // Return 200 so the frontend can gracefully fall back without throwing Axios errors
      return res.status(200).json({
        success: false,
        message:
          'KNN recommendation service is not available. The Python API server may not be running.',
        error: 'KNN service unavailable',
      });
    }

    // Get KNN recommendations
    const knnResult = await knnService.getRecommendations(userProfile);
    
    if (!knnResult.success) {
      throw new Error(knnResult.message);
    }

    // Group recommendations by meal type
    const groupedRecommendations = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    };

    knnResult.data.recommendations.forEach(rec => {
      const mealType = rec.type.toLowerCase();
      if (groupedRecommendations[mealType]) {
        groupedRecommendations[mealType].push({
          name: rec.name,
          type: rec.type,
          calories: rec.calories,
          tags: rec.tags || [],
          allergens: rec.allergens || [],
          similarity_score: rec.similarity_score,
          rank: rec.rank
        });
      }
    });

    // Calculate per-meal budgets
    const totalCalories = userProfile.targetCalories;
    const budgets = {
      breakfast: Math.round(totalCalories * 0.25),
      lunch: Math.round(totalCalories * 0.35),
      dinner: Math.round(totalCalories * 0.30),
      snack: Math.round(totalCalories * 0.10)
    };

    res.json({
      success: true,
      data: {
        totalCalories: userProfile.targetCalories,
        budgets,
        recommendations: groupedRecommendations,
        knn_info: {
          total_recommendations: knnResult.data.total_recommendations,
          user_profile: userProfile
        }
      }
    });

  } catch (error) {
    console.error('Python KNN recommendations error:', error);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED') || error.message.includes('connect')) {
      // Return 200 so the frontend can gracefully fall back without throwing Axios errors
      return res.status(200).json({ 
        success: false, 
        message: 'KNN recommendation service is not available. Please ensure the Python API server is running on port 5001.',
        error: 'Connection refused - Python API server may not be running'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get KNN recommendations',
      error: error.message 
    });
  }
});

// POST /api/recommendations/train-knn
router.post('/train-knn', auth, async (req, res) => {
  try {
    // This endpoint would typically be admin-only
    const mealsData = req.body.meals;
    
    if (!mealsData || !Array.isArray(mealsData)) {
      return res.status(400).json({
        success: false,
        message: 'Meals data is required and must be an array'
      });
    }

    const result = await knnService.trainModel(mealsData);
    
    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('KNN training error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to train KNN model',
      error: error.message
    });
  }
});

// GET /api/recommendations/knn-status
router.get('/knn-status', auth, async (req, res) => {
  try {
    const health = await knnService.healthCheck();
    const modelInfo = await knnService.getModelInfo();
    
    res.json({
      success: true,
      data: {
        health,
        model_info: modelInfo.success ? modelInfo.data : null
      }
    });

  } catch (error) {
    console.error('KNN status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get KNN status',
      error: error.message
    });
  }
});

module.exports = router;




