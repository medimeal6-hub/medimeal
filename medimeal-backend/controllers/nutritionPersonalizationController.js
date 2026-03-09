/**
 * Intelligent Nutrition Personalization Controller
 * Implements AI-based personalized meal recommendations
 */

const User = require('../models/User');
const FoodPlan = require('../models/FoodPlan');
const Food = require('../models/Food');
const HealthRecord = require('../models/HealthRecord');
const KNNRecommendationService = require('../services/knnService');

const knnService = new KNNRecommendationService();

/**
 * Calculate personalized nutritional requirements
 */
const calculateNutritionalNeeds = (userProfile) => {
  const { age, gender, weight, height, activityLevel, healthGoals, medicalConditions } = userProfile;
  
  // Base metabolic rate (Harris-Benedict equation)
  let bmr;
  if (gender === 'male') {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
  
  // Activity multiplier
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very-active': 1.9
  };
  
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  
  // Adjust for health goals
  let targetCalories = tdee;
  if (healthGoals?.includes('weight-loss')) {
    targetCalories = tdee * 0.8; // 20% deficit
  } else if (healthGoals?.includes('weight-gain')) {
    targetCalories = tdee * 1.15; // 15% surplus
  } else if (healthGoals?.includes('muscle-gain')) {
    targetCalories = tdee * 1.1; // 10% surplus
  }
  
  // Macronutrient distribution based on conditions
  let proteinPercent = 0.25;
  let carbPercent = 0.45;
  let fatPercent = 0.30;
  
  if (medicalConditions?.includes('diabetes')) {
    carbPercent = 0.35;
    proteinPercent = 0.30;
    fatPercent = 0.35;
  }
  
  if (medicalConditions?.includes('kidney-disease')) {
    proteinPercent = 0.15;
    carbPercent = 0.50;
    fatPercent = 0.35;
  }
  
  if (medicalConditions?.includes('heart-disease')) {
    fatPercent = 0.25;
    carbPercent = 0.50;
    proteinPercent = 0.25;
  }
  
  return {
    targetCalories: Math.round(targetCalories),
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    macros: {
      protein: Math.round((targetCalories * proteinPercent) / 4), // grams
      carbs: Math.round((targetCalories * carbPercent) / 4), // grams
      fats: Math.round((targetCalories * fatPercent) / 9) // grams
    },
    micronutrients: getMicronutrientRecommendations(medicalConditions)
  };
};

/**
 * Get micronutrient recommendations based on conditions
 */
const getMicronutrientRecommendations = (medicalConditions = []) => {
  const recommendations = {
    sodium: { max: 2300, unit: 'mg', reason: 'General health' },
    fiber: { min: 25, unit: 'g', reason: 'Digestive health' },
    sugar: { max: 50, unit: 'g', reason: 'General health' }
  };
  
  if (medicalConditions.includes('high-blood-pressure')) {
    recommendations.sodium = { max: 1500, unit: 'mg', reason: 'Blood pressure management' };
    recommendations.potassium = { min: 3500, unit: 'mg', reason: 'Blood pressure regulation' };
  }
  
  if (medicalConditions.includes('diabetes')) {
    recommendations.sugar = { max: 25, unit: 'g', reason: 'Blood sugar control' };
    recommendations.fiber = { min: 35, unit: 'g', reason: 'Glycemic control' };
  }
  
  if (medicalConditions.includes('high-cholesterol')) {
    recommendations.saturatedFat = { max: 13, unit: 'g', reason: 'Cholesterol management' };
    recommendations.omega3 = { min: 1, unit: 'g', reason: 'Heart health' };
  }
  
  if (medicalConditions.includes('pregnancy')) {
    recommendations.folicAcid = { min: 600, unit: 'mcg', reason: 'Fetal development' };
    recommendations.iron = { min: 27, unit: 'mg', reason: 'Maternal health' };
    recommendations.calcium = { min: 1000, unit: 'mg', reason: 'Bone health' };
  }
  
  return recommendations;
};

/**
 * Generate meal restrictions based on health profile
 */
const generateMealRestrictions = (userProfile) => {
  const restrictions = {
    avoid: [],
    limit: [],
    prefer: [],
    dietaryTags: []
  };
  
  const { medicalConditions = [], allergies = [] } = userProfile;
  
  // Medical condition restrictions
  if (medicalConditions.includes('diabetes')) {
    restrictions.avoid.push('high-sugar', 'refined-carbs');
    restrictions.prefer.push('low-glycemic', 'high-fiber');
    restrictions.dietaryTags.push('diabetic-friendly');
  }
  
  if (medicalConditions.includes('high-blood-pressure')) {
    restrictions.avoid.push('high-sodium', 'processed');
    restrictions.prefer.push('low-sodium', 'potassium-rich');
    restrictions.dietaryTags.push('heart-healthy');
  }
  
  if (medicalConditions.includes('kidney-disease')) {
    restrictions.avoid.push('high-protein', 'high-potassium', 'high-phosphorus');
    restrictions.limit.push('protein', 'sodium');
    restrictions.dietaryTags.push('kidney-friendly');
  }
  
  if (medicalConditions.includes('heart-disease')) {
    restrictions.avoid.push('saturated-fat', 'trans-fat', 'high-cholesterol');
    restrictions.prefer.push('omega-3', 'whole-grains');
    restrictions.dietaryTags.push('heart-healthy');
  }
  
  if (medicalConditions.includes('gluten-free')) {
    restrictions.avoid.push('gluten', 'wheat', 'barley', 'rye');
    restrictions.dietaryTags.push('gluten-free');
  }
  
  if (medicalConditions.includes('dairy-free')) {
    restrictions.avoid.push('dairy', 'lactose');
    restrictions.dietaryTags.push('dairy-free', 'lactose-free');
  }
  
  if (medicalConditions.includes('pregnancy')) {
    restrictions.avoid.push('raw-fish', 'unpasteurized', 'high-mercury');
    restrictions.prefer.push('folic-acid', 'iron-rich', 'calcium-rich');
    restrictions.dietaryTags.push('pregnancy-safe');
  }
  
  // Allergy restrictions
  allergies.forEach(allergy => {
    restrictions.avoid.push(allergy.toLowerCase());
  });
  
  return restrictions;
};

/**
 * Get personalized nutrition plan
 */
exports.getPersonalizedNutritionPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get latest health record
    const healthRecord = await HealthRecord.findOne({ userId }).sort({ recordedAt: -1 });
    
    // Build comprehensive user profile
    const userProfile = {
      age: user.age || 30,
      gender: user.gender || 'other',
      weight: healthRecord?.weight || user.weight || 70,
      height: healthRecord?.height || user.height || 170,
      activityLevel: user.activityLevel || 'moderate',
      healthGoals: user.healthGoals || [],
      medicalConditions: user.surveyData?.medicalConditions || [],
      allergies: user.surveyData?.allergies || []
    };
    
    // Calculate nutritional needs
    const nutritionalNeeds = calculateNutritionalNeeds(userProfile);
    
    // Generate restrictions
    const restrictions = generateMealRestrictions(userProfile);
    
    // Try to get KNN recommendations
    let mealRecommendations = null;
    try {
      const knnProfile = {
        targetCalories: nutritionalNeeds.targetCalories / 3, // Per meal
        preferredMealType: 'lunch',
        dietaryPreferences: restrictions.dietaryTags,
        healthConditions: userProfile.medicalConditions,
        allergies: userProfile.allergies,
        nRecommendations: 10
      };
      
      const knnResult = await knnService.getRecommendations(knnProfile);
      if (knnResult.success) {
        mealRecommendations = knnResult.data;
      }
    } catch (error) {
      console.log('KNN service unavailable, using rule-based recommendations');
    }
    
    res.json({
      success: true,
      data: {
        userProfile,
        nutritionalNeeds,
        restrictions,
        mealRecommendations,
        insights: generateNutritionInsights(userProfile, nutritionalNeeds, restrictions)
      }
    });
  } catch (error) {
    console.error('Error getting personalized nutrition plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get personalized nutrition plan',
      error: error.message
    });
  }
};

/**
 * Generate nutrition insights
 */
const generateNutritionInsights = (userProfile, nutritionalNeeds, restrictions) => {
  const insights = [];
  
  // Calorie insights
  if (nutritionalNeeds.targetCalories < 1500) {
    insights.push({
      type: 'warning',
      category: 'calories',
      message: 'Your target calorie intake is quite low. Ensure you\'re meeting minimum nutritional requirements.',
      priority: 'high'
    });
  }
  
  // Protein insights
  if (userProfile.healthGoals?.includes('muscle-gain') && nutritionalNeeds.macros.protein < 100) {
    insights.push({
      type: 'recommendation',
      category: 'protein',
      message: 'For muscle gain, consider increasing protein intake to 1.6-2.2g per kg body weight.',
      priority: 'medium'
    });
  }
  
  // Condition-specific insights
  if (userProfile.medicalConditions?.includes('diabetes')) {
    insights.push({
      type: 'info',
      category: 'carbs',
      message: 'Focus on complex carbohydrates and monitor portion sizes to maintain stable blood sugar.',
      priority: 'high'
    });
  }
  
  if (userProfile.medicalConditions?.includes('high-blood-pressure')) {
    insights.push({
      type: 'warning',
      category: 'sodium',
      message: 'Limit sodium intake to 1500mg per day. Avoid processed foods and add minimal salt.',
      priority: 'high'
    });
  }
  
  // Dietary diversity
  if (restrictions.avoid.length > 5) {
    insights.push({
      type: 'recommendation',
      category: 'variety',
      message: 'With multiple dietary restrictions, ensure you\'re getting nutrients from diverse sources.',
      priority: 'medium'
    });
  }
  
  return insights;
};

/**
 * Validate meal against user restrictions
 */
exports.validateMealForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { mealData } = req.body;
    
    const user = await User.findById(userId);
    const userProfile = {
      medicalConditions: user.surveyData?.medicalConditions || [],
      allergies: user.surveyData?.allergies || []
    };
    
    const restrictions = generateMealRestrictions(userProfile);
    
    // Check for conflicts
    const conflicts = [];
    const warnings = [];
    
    // Check allergens
    if (mealData.allergens) {
      mealData.allergens.forEach(allergen => {
        if (userProfile.allergies.includes(allergen)) {
          conflicts.push({
            type: 'allergy',
            severity: 'critical',
            message: `Contains ${allergen} - You have reported allergy to this ingredient`
          });
        }
      });
    }
    
    // Check dietary restrictions
    if (mealData.tags) {
      restrictions.avoid.forEach(avoid => {
        if (mealData.tags.includes(avoid)) {
          conflicts.push({
            type: 'restriction',
            severity: 'high',
            message: `Contains ${avoid} - Not recommended for your health conditions`
          });
        }
      });
    }
    
    // Check nutritional limits
    const nutritionalNeeds = calculateNutritionalNeeds({
      age: user.age || 30,
      gender: user.gender || 'other',
      weight: user.weight || 70,
      height: user.height || 170,
      activityLevel: user.activityLevel || 'moderate',
      healthGoals: user.healthGoals || [],
      medicalConditions: userProfile.medicalConditions
    });
    
    if (mealData.calories > nutritionalNeeds.targetCalories / 2) {
      warnings.push({
        type: 'calories',
        severity: 'medium',
        message: 'This meal is high in calories for a single serving'
      });
    }
    
    const isSafe = conflicts.length === 0;
    const recommendation = isSafe ? 
      (warnings.length === 0 ? 'Suitable for your profile' : 'Suitable with minor considerations') :
      'Not recommended for your health profile';
    
    res.json({
      success: true,
      data: {
        isSafe,
        recommendation,
        conflicts,
        warnings,
        nutritionalFit: calculateNutritionalFit(mealData, nutritionalNeeds)
      }
    });
  } catch (error) {
    console.error('Error validating meal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate meal',
      error: error.message
    });
  }
};

/**
 * Calculate how well a meal fits nutritional needs
 */
const calculateNutritionalFit = (mealData, nutritionalNeeds) => {
  const perMealTarget = {
    calories: nutritionalNeeds.targetCalories / 3,
    protein: nutritionalNeeds.macros.protein / 3,
    carbs: nutritionalNeeds.macros.carbs / 3,
    fats: nutritionalNeeds.macros.fats / 3
  };
  
  const caloriesFit = 100 - Math.abs((mealData.calories - perMealTarget.calories) / perMealTarget.calories * 100);
  const proteinFit = 100 - Math.abs((mealData.protein - perMealTarget.protein) / perMealTarget.protein * 100);
  const carbsFit = 100 - Math.abs((mealData.carbs - perMealTarget.carbs) / perMealTarget.carbs * 100);
  const fatsFit = 100 - Math.abs((mealData.fats - perMealTarget.fats) / perMealTarget.fats * 100);
  
  const overallFit = (Math.max(0, caloriesFit) + Math.max(0, proteinFit) + Math.max(0, carbsFit) + Math.max(0, fatsFit)) / 4;
  
  return {
    overall: Math.round(Math.max(0, Math.min(100, overallFit))),
    calories: Math.round(Math.max(0, Math.min(100, caloriesFit))),
    protein: Math.round(Math.max(0, Math.min(100, proteinFit))),
    carbs: Math.round(Math.max(0, Math.min(100, carbsFit))),
    fats: Math.round(Math.max(0, Math.min(100, fatsFit)))
  };
};

module.exports = exports;
