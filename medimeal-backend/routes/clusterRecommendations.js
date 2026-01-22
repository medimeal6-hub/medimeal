const express = require('express');
const { auth } = require('../middleware/auth');
const ClusterRecommendationService = require('../services/clusterService');

const router = express.Router();
const clusterService = new ClusterRecommendationService();

// GET /api/recommendations/cluster-python
router.get('/cluster-python', auth, async (req, res) => {
  try {
    const user = req.user;
    const userProfile = {
      targetCalories: estimateDailyCalories({
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        activityLevel: user.surveyData?.activityLevel
      }),
      preferredMealType: 'lunch',
      dietaryPreferences: (user.surveyData?.dietaryRestrictions || []).map(p => p.toLowerCase()),
      healthConditions: (user.surveyData?.medicalConditions || []).map(c => c.toLowerCase()),
      allergies: (user.surveyData?.allergies || []).map(a => a.toLowerCase()),
      nRecommendations: 10
    };

    const result = await clusterService.getRecommendations(userProfile);
    if (!result.success) {
      throw new Error(result.message);
    }

    // Group by meal type for UI parity
    const grouped = { breakfast: [], lunch: [], dinner: [], snack: [] };
    (result.data.recommendations || []).forEach(rec => {
      const t = (rec.type || '').toLowerCase();
      if (grouped[t]) {
        grouped[t].push({
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
        recommendations: grouped,
        cluster_info: {
          total_recommendations: result.data.total_recommendations,
          user_profile: userProfile
        }
      }
    });
  } catch (error) {
    console.error('Cluster recommendations error:', error);
    res.status(500).json({ success: false, message: 'Failed to get cluster recommendations', error: error.message });
  }
});

// Helper reused from knnRecommendations
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

module.exports = router;







