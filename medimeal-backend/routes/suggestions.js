const express = require('express');
const { auth } = require('../middleware/auth');
const Meal = require('../models/Meal');

const router = express.Router();

// Very small built-in catalog. Each item has tags for filtering.
const CATALOG = [
  // Breakfast
  { type: 'breakfast', name: 'Oatmeal with Berries', calories: 320, tags: ['vegetarian', 'diabetic-friendly', 'mediterranean'], allergens: ['gluten'] },
  { type: 'breakfast', name: 'Greek Yogurt + Nuts', calories: 280, tags: ['mediterranean'], allergens: ['dairy', 'nuts'] },
  { type: 'breakfast', name: 'Veggie Omelette', calories: 350, tags: ['keto', 'low-sodium'], allergens: ['eggs'] },
  { type: 'breakfast', name: 'Smoothie: Spinach-Banana-Peanut', calories: 300, tags: ['vegetarian'], allergens: ['nuts'] },
  { type: 'breakfast', name: 'Poha', calories: 330, tags: ['vegetarian', 'indian'], allergens: ['nuts'] },

  // Lunch
  { type: 'lunch', name: 'Grilled Chicken Salad', calories: 450, tags: ['keto', 'low-sodium'], allergens: [] },
  { type: 'lunch', name: 'Dal, Brown Rice, Salad', calories: 520, tags: ['vegetarian', 'diabetic-friendly', 'indian'], allergens: [] },
  { type: 'lunch', name: 'Paneer Tikka + Quinoa', calories: 540, tags: ['vegetarian', 'mediterranean'], allergens: ['dairy'] },
  { type: 'lunch', name: 'Chickpea Bowl', calories: 480, tags: ['vegan', 'gluten-free', 'mediterranean'], allergens: [] },

  // Dinner
  { type: 'dinner', name: 'Baked Salmon + Veggies', calories: 520, tags: ['mediterranean', 'low-sodium'], allergens: ['fish'] },
  { type: 'dinner', name: 'Tofu Stir-fry', calories: 480, tags: ['vegan', 'gluten-free'], allergens: ['soy'] },
  { type: 'dinner', name: 'Roti + Dal + Sabji', calories: 560, tags: ['vegetarian', 'indian'], allergens: ['gluten'] },
  { type: 'dinner', name: 'Chicken Curry + Cauli Rice', calories: 500, tags: ['keto', 'indian'], allergens: [] },

  // Snack
  { type: 'snack', name: 'Apple + Peanut Butter', calories: 220, tags: ['vegetarian'], allergens: ['nuts'] },
  { type: 'snack', name: 'Roasted Chana', calories: 180, tags: ['vegan', 'gluten-free', 'diabetic-friendly'], allergens: [] },
  { type: 'snack', name: 'Yogurt + Fruit', calories: 200, tags: ['mediterranean'], allergens: ['dairy'] },
  { type: 'snack', name: 'Mixed Nuts (small handful)', calories: 230, tags: ['keto'], allergens: ['nuts'] },
];

const toDateKey = (d = new Date()) => d.toISOString().slice(0, 10);

function ageFromDOB(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  const a = new Date(diff);
  return Math.abs(a.getUTCFullYear() - 1970);
}

function estimateDailyTarget(user) {
  // Defaults if info is missing
  const weight = user?.weight; // kg
  const height = user?.height; // cm
  const age = ageFromDOB(user?.dateOfBirth) || 30;
  const gender = user?.gender || 'other';

  if (!weight || !height) {
    return 2000; // fallback
  }

  // Mifflin-St Jeor BMR
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = bmr * 1.3; // light activity assumption
  // Round to nearest 50
  return Math.round(tdee / 50) * 50;
}

function perMealBudget(total) {
  // 25% breakfast, 35% lunch, 30% dinner, 10% snack
  return {
    breakfast: Math.round(total * 0.25),
    lunch: Math.round(total * 0.35),
    dinner: Math.round(total * 0.30),
    snack: Math.round(total * 0.10),
  };
}

function passesPreferences(item, user) {
  const prefs = new Set(user?.dietaryPreferences || []);
  // If user marked 'none', allow all unless allergies/conditions block
  if (prefs.has('none') && prefs.size === 1) {
    return true;
  }
  // Otherwise, require that each non-'none' preference is compatible
  // We approximate: if preference tag exists in item tags, it's okay.
  for (const p of prefs) {
    if (p === 'none') continue;
    if (!item.tags.includes(p)) return false;
  }
  return true;
}

function passesAllergies(item, user) {
  const allergies = new Set(user?.allergies || []);
  if (allergies.size === 0) return true;
  return !item.allergens.some(a => allergies.has(a));
}

function passesConditions(item, user) {
  const conditions = new Set((user?.medicalConditions || []).map(s => s.toLowerCase()))
  // If user indicates diabetic, prefer diabetic-friendly items
  if (conditions.has('diabetes') || conditions.has('diabetic')) {
    if (!item.tags.includes('diabetic-friendly')) return false;
  }
  // If low-sodium condition appears, prefer low-sodium
  if (conditions.has('hypertension') || conditions.has('high blood pressure') || conditions.has('bp')) {
    if (!item.tags.includes('low-sodium')) return false;
  }
  return true;
}

function selectByCalorieBudget(items, target) {
  // Pick items closest but <= target if possible, else the minimum over
  const sorted = [...items].sort((a, b) => a.calories - b.calories);
  let best = sorted[0];
  let bestDiff = Math.abs(sorted[0].calories - target);
  for (const it of sorted) {
    const diff = Math.abs(it.calories - target);
    if (it.calories <= target && diff <= bestDiff) {
      best = it; bestDiff = diff;
    }
  }
  return best;
}

// GET /api/suggestions?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  try {
    const date = req.query.date || toDateKey();

    const user = req.user; // populated by auth middleware

    // Estimate daily target and per-meal budget
    const target = estimateDailyTarget(user);
    const budget = perMealBudget(target);

    // Fetch meals for the date to compute remaining per type
    const meals = await Meal.find({ userId: user._id, date });
    const consumed = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    for (const m of meals) consumed[m.type] += (m.calories || 0);
    const remaining = {
      breakfast: Math.max(0, budget.breakfast - consumed.breakfast),
      lunch: Math.max(0, budget.lunch - consumed.lunch),
      dinner: Math.max(0, budget.dinner - consumed.dinner),
      snack: Math.max(0, budget.snack - consumed.snack),
    };

    // Filter catalog by user profile
    const filtered = CATALOG.filter(item =>
      passesPreferences(item, user) &&
      passesAllergies(item, user) &&
      passesConditions(item, user)
    );

    const byType = { breakfast: [], lunch: [], dinner: [], snack: [] };
    for (const t of Object.keys(byType)) {
      const pool = filtered.filter(i => i.type === t);
      if (pool.length === 0) continue;
      // pick up to 4 suggestions around remaining budget
      const picked = new Set();
      const first = selectByCalorieBudget(pool, remaining[t] || budget[t]);
      if (first) picked.add(first);
      // add a couple nearby options
      const around = [...pool]
        .sort((a, b) => Math.abs(a.calories - remaining[t]) - Math.abs(b.calories - remaining[t]))
        .slice(0, 6);
      for (const it of around) {
        if (picked.size >= 4) break;
        picked.add(it);
      }
      byType[t] = Array.from(picked);
    }

    res.json({
      success: true,
      data: {
        date,
        targetCalories: target,
        budget,
        consumed,
        remaining,
        suggestions: byType
      }
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate suggestions' });
  }
});

module.exports = router;