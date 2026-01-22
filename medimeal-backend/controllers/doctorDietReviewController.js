const FoodPlan = require('../models/FoodPlan');
const PatientAssignment = require('../models/PatientAssignment');
const User = require('../models/User');

/**
 * GET /api/doctor/diet-plans/pending
 * Get all pending diet plans for review
 */
const getPendingDietPlans = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get all food plans that need review (created but not approved)
    const pendingPlans = await FoodPlan.find({
      doctorId,
      isActive: true,
      status: { $in: ['pending', 'draft', null] }
    })
    .populate('patientId', 'firstName lastName email medicalConditions allergies')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingPlans
    });
  } catch (error) {
    console.error('Get pending diet plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending diet plans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/doctor/diet-plans/:planId/approve
 * Approve a diet plan
 */
const approveDietPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const doctorId = req.user._id;
    const { notes } = req.body;

    const plan = await FoodPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    if (plan.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this plan'
      });
    }

    plan.status = 'approved';
    plan.approvedAt = new Date();
    plan.approvedBy = doctorId;
    if (notes) {
      plan.approvalNotes = notes;
    }
    await plan.save();

    res.json({
      success: true,
      message: 'Diet plan approved successfully',
      data: plan
    });
  } catch (error) {
    console.error('Approve diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve diet plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/doctor/diet-plans/:planId/modify
 * Modify a diet plan
 */
const modifyDietPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const doctorId = req.user._id;
    const { breakfast, lunch, dinner, snacks, generalInstructions, dietaryRestrictions, notes } = req.body;

    const plan = await FoodPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    if (plan.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this plan'
      });
    }

    // Update plan fields
    if (breakfast !== undefined) plan.breakfast = breakfast;
    if (lunch !== undefined) plan.lunch = lunch;
    if (dinner !== undefined) plan.dinner = dinner;
    if (snacks !== undefined) plan.snacks = snacks;
    if (generalInstructions !== undefined) plan.generalInstructions = generalInstructions;
    if (dietaryRestrictions !== undefined) plan.dietaryRestrictions = dietaryRestrictions;
    
    plan.status = 'modified';
    plan.modifiedAt = new Date();
    plan.modifiedBy = doctorId;
    if (notes) {
      plan.modificationNotes = notes;
    }

    await plan.save();

    res.json({
      success: true,
      message: 'Diet plan modified successfully',
      data: plan
    });
  } catch (error) {
    console.error('Modify diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to modify diet plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/doctor/diet-plans/:planId/lock
 * Lock a diet plan (prevent patient modifications)
 */
const lockDietPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const doctorId = req.user._id;
    const { locked } = req.body;

    const plan = await FoodPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    if (plan.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to lock this plan'
      });
    }

    plan.isLocked = locked !== undefined ? locked : true;
    plan.lockedAt = plan.isLocked ? new Date() : null;
    plan.lockedBy = plan.isLocked ? doctorId : null;

    await plan.save();

    res.json({
      success: true,
      message: `Diet plan ${plan.isLocked ? 'locked' : 'unlocked'} successfully`,
      data: plan
    });
  } catch (error) {
    console.error('Lock diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lock diet plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/doctor/diet-plans/:planId/assign-dietitian
 * Assign a dietitian to a diet plan
 */
const assignDietitian = async (req, res) => {
  try {
    const { planId } = req.params;
    const { dietitianId } = req.body;
    const doctorId = req.user._id;

    const plan = await FoodPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    if (plan.doctorId.toString() !== doctorId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign dietitian to this plan'
      });
    }

    // Verify dietitian exists and is a dietitian
    const dietitian = await User.findById(dietitianId);
    if (!dietitian || dietitian.role !== 'dietitian') {
      return res.status(400).json({
        success: false,
        message: 'Invalid dietitian ID or user is not a dietitian'
      });
    }

    plan.dietitianId = dietitianId;
    plan.assignedDietitianAt = new Date();
    await plan.save();

    await plan.populate('dietitianId', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Dietitian assigned successfully',
      data: plan
    });
  } catch (error) {
    console.error('Assign dietitian error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign dietitian',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getPendingDietPlans,
  approveDietPlan,
  modifyDietPlan,
  lockDietPlan,
  assignDietitian
};

