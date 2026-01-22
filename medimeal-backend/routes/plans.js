const express = require('express');
const { auth } = require('../middleware/auth');
const {
  createFoodPlan,
  createExercisePlan,
  getFoodPlansForPatient,
  getExercisePlansForPatient,
  getPlansForDoctor,
  updateFoodPlan,
  updateExercisePlan,
  markPlanCompleted
} = require('../controllers/planController');

const router = express.Router();

// @route   POST /api/plans/food
// @desc    Create food plan for patient
// @access  Private (Doctor only)
router.post('/food', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor role required.'
      });
    }
    await createFoodPlan(req, res);
  } catch (error) {
    console.error('Create food plan route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create food plan',
      error: error.message
    });
  }
});

// @route   POST /api/plans/exercise
// @desc    Create exercise plan for patient
// @access  Private (Doctor only)
router.post('/exercise', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor role required.'
      });
    }
    await createExercisePlan(req, res);
  } catch (error) {
    console.error('Create exercise plan route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exercise plan',
      error: error.message
    });
  }
});

// @route   GET /api/plans/food/patient/:patientId
// @desc    Get food plans for patient
// @access  Private
router.get('/food/patient/:patientId', auth, async (req, res) => {
  try {
    await getFoodPlansForPatient(req, res);
  } catch (error) {
    console.error('Get food plans route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get food plans',
      error: error.message
    });
  }
});

// @route   GET /api/plans/exercise/patient/:patientId
// @desc    Get exercise plans for patient
// @access  Private
router.get('/exercise/patient/:patientId', auth, async (req, res) => {
  try {
    await getExercisePlansForPatient(req, res);
  } catch (error) {
    console.error('Get exercise plans route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise plans',
      error: error.message
    });
  }
});

// @route   GET /api/plans/doctor
// @desc    Get all plans for doctor
// @access  Private (Doctor only)
router.get('/doctor', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor role required.'
      });
    }
    await getPlansForDoctor(req, res);
  } catch (error) {
    console.error('Get doctor plans route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor plans',
      error: error.message
    });
  }
});

// @route   PUT /api/plans/food/:planId
// @desc    Update food plan
// @access  Private (Doctor only)
router.put('/food/:planId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor role required.'
      });
    }
    await updateFoodPlan(req, res);
  } catch (error) {
    console.error('Update food plan route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update food plan',
      error: error.message
    });
  }
});

// @route   PUT /api/plans/exercise/:planId
// @desc    Update exercise plan
// @access  Private (Doctor only)
router.put('/exercise/:planId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor role required.'
      });
    }
    await updateExercisePlan(req, res);
  } catch (error) {
    console.error('Update exercise plan route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exercise plan',
      error: error.message
    });
  }
});

// @route   POST /api/plans/:planType/:planId/complete
// @desc    Mark plan as completed
// @access  Private
router.post('/:planType/:planId/complete', auth, async (req, res) => {
  try {
    await markPlanCompleted(req, res);
  } catch (error) {
    console.error('Mark plan completed route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark plan as completed',
      error: error.message
    });
  }
});

module.exports = router;


