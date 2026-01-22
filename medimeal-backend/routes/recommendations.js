const express = require('express');
const { auth } = require('../middleware/auth');
const FoodDrugConflict = require('../models/FoodDrugConflict');

const router = express.Router();

// Minimal catalog reused for recommendations
const CATALOG = [
  { type: 'breakfast', name: 'Oatmeal with Berries', calories: 320, tags: ['vegetarian', 'diabetic-friendly', 'mediterranean'], allergens: ['gluten'] },
  { type: 'breakfast', name: 'Greek Yogurt + Nuts', calories: 280, tags: ['mediterranean'], allergens: ['dairy', 'nuts'] },
  { type: 'breakfast', name: 'Veggie Omelette', calories: 350, tags: ['keto', 'low-sodium'], allergens: ['eggs'] },
  { type: 'lunch', name: 'Grilled Chicken Salad', calories: 450, tags: ['keto', 'low-sodium'], allergens: [] },
  { type: 'lunch', name: 'Dal, Brown Rice, Salad', calories: 520, tags: ['vegetarian', 'diabetic-friendly', 'indian'], allergens: [] },
  { type: 'lunch', name: 'Paneer Tikka + Quinoa', calories: 540, tags: ['vegetarian', 'mediterranean'], allergens: ['dairy'] },
  { type: 'dinner', name: 'Baked Salmon + Veggies', calories: 520, tags: ['mediterranean', 'low-sodium'], allergens: ['fish'] },
  { type: 'dinner', name: 'Tofu Stir-fry', calories: 480, tags: ['vegan', 'gluten-free'], allergens: ['soy'] },
  { type: 'dinner', name: 'Roti + Dal + Sabji', calories: 560, tags: ['vegetarian', 'indian'], allergens: ['gluten'] },
  { type: 'snack', name: 'Apple + Peanut Butter', calories: 220, tags: ['vegetarian'], allergens: ['nuts'] }
];

function estimateDailyCalories(user) {
  // Very rough estimate using Mifflin-St Jeor with defaults
  const weight = user.weight || 70; // kg
  const height = user.height || 170; // cm
  const age = user.age || 30; // years
  const sexFactor = (user.gender || '').toLowerCase() === 'female' ? -161 : 5;
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexFactor;
  const activity = (user.activityLevel || 'moderate').toLowerCase();
  const activityFactor = activity === 'sedentary' ? 1.2 : activity === 'light' ? 1.375 : activity === 'active' ? 1.55 : 1.725;
  return Math.round(bmr * activityFactor);
}

function perMealBudgets(total) {
  return {
    breakfast: Math.round(total * 0.25),
    lunch: Math.round(total * 0.35),
    dinner: Math.round(total * 0.30),
    snack: Math.round(total * 0.10)
  };
}

function scoreMealForUser(meal, ctx) {
  // KNN-like distance on calorie closeness + tag matches for conditions/preferences
  const budget = ctx.budgets[meal.type] || ctx.total / 3;
  const calDiff = Math.abs((meal.calories || budget) - budget);
  let tagScore = 0;
  const tags = meal.tags || [];
  for (const cond of ctx.conditions) if (tags.includes(cond)) tagScore += 2;
  for (const pref of ctx.preferences) if (tags.includes(pref)) tagScore += 1;
  // Lower distance is better; convert to score
  const distance = calDiff - tagScore * 50;
  return -distance;
}

async function filterByMedicineCompatibility(user, items) {
  const meds = (user.surveyData?.currentMedications || []).map(m => ({ name: m.name }));
  if (!meds.length) return items;
  const conflicts = [];
  for (const m of meds) {
    const rows = await FoodDrugConflict.findByMedicine(m.name);
    rows.forEach(r => conflicts.push(...(r.avoid || [])));
  }
  if (!conflicts.length) return items;
  const avoidSet = new Set(conflicts.map(s => String(s).toLowerCase()));
  return items.filter(it => {
    const n = it.name.toLowerCase();
    for (const a of avoidSet) {
      if (n.includes(a)) return false;
    }
    return true;
  });
}

// GET /api/recommendations/knn
router.get('/knn', auth, async (req, res) => {
  try {
    const user = req.user;
    const total = estimateDailyCalories({
      weight: user.weight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      activityLevel: user.surveyData?.activityLevel
    });
    const budgets = perMealBudgets(total);
    const conditions = (user.surveyData?.medicalConditions || []).map(c => c.toLowerCase());
    const preferences = (user.surveyData?.dietaryRestrictions || []).map(p => p.toLowerCase());

    // Pre-filter catalog by basic condition keywords
    let pool = CATALOG.filter(i => {
      // If diabetic, prefer diabetic-friendly
      if (conditions.includes('diabetes') && i.tags && !i.tags.includes('diabetic-friendly')) return false;
      return true;
    });

    // Filter by medicine-diet compatibility
    pool = await filterByMedicineCompatibility(user, pool);

    // Score and pick top-N per type
    const ctx = { budgets, total, conditions, preferences };
    const byType = { breakfast: [], lunch: [], dinner: [], snack: [] };
    for (const type of Object.keys(byType)) {
      const items = pool.filter(i => i.type === type)
        .map(i => ({ item: i, score: scoreMealForUser(i, ctx) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(x => x.item);
      byType[type] = items;
    }

    res.json({
      success: true,
      data: {
        totalCalories: total,
        budgets,
        recommendations: byType
      }
    });
  } catch (e) {
    console.error('KNN recommendations error:', e);
    res.status(500).json({ success: false, message: 'Failed to compute recommendations' });
  }
});

module.exports = router;



