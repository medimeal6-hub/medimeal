const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const symptomRiskController = require('../controllers/symptomRiskController');

// All routes require authentication
router.use(auth);

// Create symptom with risk assessment
router.post('/with-risk', symptomRiskController.createSymptomWithRisk);

// Get symptom risk dashboard
router.get('/risk-dashboard', symptomRiskController.getSymptomRiskDashboard);

// Analyze specific symptom risk
router.get('/:symptomId/risk', symptomRiskController.analyzeSymptomRisk);

module.exports = router;
