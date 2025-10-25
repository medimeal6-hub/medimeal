const FoodPlan = require('../models/FoodPlan');
const ExercisePlan = require('../models/ExercisePlan');
const Food = require('../models/Food');
const { auth } = require('../middleware/auth');

// @desc    Create food plan for patient
// @route   POST /api/plans/food
// @access  Private (Doctor only)
const createFoodPlan = async (req, res) => {
  try {
    const { patientId, planName, description, breakfast, lunch, dinner, snacks, generalInstructions, dietaryRestrictions, endDate } = req.body;

    // Validate required fields
    if (!patientId || !planName) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and plan name are required'
      });
    }

    // Check if patient exists and is assigned to this doctor
    const PatientAssignment = require('../models/PatientAssignment');
    const assignment = await PatientAssignment.checkAssignment(req.user._id, patientId);
    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Patient not assigned to you or assignment not found'
      });
    }

    // Create food plan
    const foodPlan = new FoodPlan({
      doctorId: req.user._id,
      patientId,
      planName,
      description,
      breakfast: breakfast || [],
      lunch: lunch || [],
      dinner: dinner || [],
      snacks: snacks || [],
      generalInstructions,
      dietaryRestrictions: dietaryRestrictions || [],
      endDate: endDate ? new Date(endDate) : null
    });

    await foodPlan.save();

    // Populate the created plan
    await foodPlan.populate('patientId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Food plan created successfully',
      data: { foodPlan }
    });

  } catch (error) {
    console.error('Create food plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create food plan',
      error: error.message
    });
  }
};

// @desc    Create exercise plan for patient
// @route   POST /api/plans/exercise
// @access  Private (Doctor only)
const createExercisePlan = async (req, res) => {
  try {
    const { patientId, planName, description, morning, afternoon, evening, generalInstructions, restrictions, endDate } = req.body;

    // Validate required fields
    if (!patientId || !planName) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and plan name are required'
      });
    }

    // Check if patient exists and is assigned to this doctor
    const PatientAssignment = require('../models/PatientAssignment');
    const assignment = await PatientAssignment.checkAssignment(req.user._id, patientId);
    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Patient not assigned to you or assignment not found'
      });
    }

    // Create exercise plan
    const exercisePlan = new ExercisePlan({
      doctorId: req.user._id,
      patientId,
      planName,
      description,
      morning: morning || {},
      afternoon: afternoon || {},
      evening: evening || {},
      generalInstructions,
      restrictions: restrictions || [],
      endDate: endDate ? new Date(endDate) : null
    });

    await exercisePlan.save();

    // Populate the created plan
    await exercisePlan.populate('patientId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Exercise plan created successfully',
      data: { exercisePlan }
    });

  } catch (error) {
    console.error('Create exercise plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exercise plan',
      error: error.message
    });
  }
};

// @desc    Get food plans for patient
// @route   GET /api/plans/food/patient/:patientId
// @access  Private
const getFoodPlansForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if user is the patient or their assigned doctor
    if (req.user.role === 'user' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'doctor') {
      const PatientAssignment = require('../models/PatientAssignment');
      const assignment = await PatientAssignment.checkAssignment(req.user._id, patientId);
      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Patient not assigned to you'
        });
      }
    }

    const foodPlans = await FoodPlan.findActiveForPatient(patientId);

    res.json({
      success: true,
      data: { foodPlans }
    });

  } catch (error) {
    console.error('Get food plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get food plans',
      error: error.message
    });
  }
};

// @desc    Get exercise plans for patient
// @route   GET /api/plans/exercise/patient/:patientId
// @access  Private
const getExercisePlansForPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check if user is the patient or their assigned doctor
    if (req.user.role === 'user' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'doctor') {
      const PatientAssignment = require('../models/PatientAssignment');
      const assignment = await PatientAssignment.checkAssignment(req.user._id, patientId);
      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Patient not assigned to you'
        });
      }
    }

    const exercisePlans = await ExercisePlan.findActiveForPatient(patientId);

    res.json({
      success: true,
      data: { exercisePlans }
    });

  } catch (error) {
    console.error('Get exercise plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exercise plans',
      error: error.message
    });
  }
};

// @desc    Get all plans for doctor
// @route   GET /api/plans/doctor
// @access  Private (Doctor only)
const getPlansForDoctor = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const [foodPlans, exercisePlans] = await Promise.all([
      FoodPlan.findByDoctor(doctorId),
      ExercisePlan.findByDoctor(doctorId)
    ]);

    res.json({
      success: true,
      data: {
        foodPlans,
        exercisePlans,
        totalPlans: foodPlans.length + exercisePlans.length
      }
    });

  } catch (error) {
    console.error('Get doctor plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor plans',
      error: error.message
    });
  }
};

// @desc    Update food plan
// @route   PUT /api/plans/food/:planId
// @access  Private (Doctor only)
const updateFoodPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updates = req.body;

    const foodPlan = await FoodPlan.findById(planId);
    if (!foodPlan) {
      return res.status(404).json({
        success: false,
        message: 'Food plan not found'
      });
    }

    // Check if doctor owns this plan
    if (foodPlan.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update plan
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        foodPlan[key] = updates[key];
      }
    });

    await foodPlan.save();

    res.json({
      success: true,
      message: 'Food plan updated successfully',
      data: { foodPlan }
    });

  } catch (error) {
    console.error('Update food plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update food plan',
      error: error.message
    });
  }
};

// @desc    Update exercise plan
// @route   PUT /api/plans/exercise/:planId
// @access  Private (Doctor only)
const updateExercisePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updates = req.body;

    const exercisePlan = await ExercisePlan.findById(planId);
    if (!exercisePlan) {
      return res.status(404).json({
        success: false,
        message: 'Exercise plan not found'
      });
    }

    // Check if doctor owns this plan
    if (exercisePlan.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update plan
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        exercisePlan[key] = updates[key];
      }
    });

    await exercisePlan.save();

    res.json({
      success: true,
      message: 'Exercise plan updated successfully',
      data: { exercisePlan }
    });

  } catch (error) {
    console.error('Update exercise plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update exercise plan',
      error: error.message
    });
  }
};

// @desc    Mark plan as completed
// @route   POST /api/plans/:planType/:planId/complete
// @access  Private
const markPlanCompleted = async (req, res) => {
  try {
    const { planType, planId } = req.params;

    let Plan;
    if (planType === 'food') {
      Plan = FoodPlan;
    } else if (planType === 'exercise') {
      Plan = ExercisePlan;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Check access
    if (req.user.role === 'user' && plan.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'doctor' && plan.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await plan.markCompleted();

    res.json({
      success: true,
      message: 'Plan marked as completed',
      data: { plan }
    });

  } catch (error) {
    console.error('Mark plan completed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark plan as completed',
      error: error.message
    });
  }
};

module.exports = {
  createFoodPlan,
  createExercisePlan,
  getFoodPlansForPatient,
  getExercisePlansForPatient,
  getPlansForDoctor,
  updateFoodPlan,
  updateExercisePlan,
  markPlanCompleted
};
