const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const nutritionPersonalizationController = require('../controllers/nutritionPersonalizationController');

// All routes require authentication
router.use(auth);

// Get personalized nutrition plan
router.get('/personalized-plan', nutritionPersonalizationController.getPersonalizedNutritionPlan);

// Validate meal for user
router.post('/validate-meal', nutritionPersonalizationController.validateMealForUser);

module.exports = router;
