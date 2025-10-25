const express = require('express');
const { auth } = require('../middleware/auth');
const {
  checkConflicts,
  getAllConflicts,
  getConflictsForMedicine,
  checkSpecificConflict,
  getSafeFoods
} = require('../controllers/conflictController');

const router = express.Router();

// @route   POST /api/conflicts/check
// @desc    Check food-drug conflicts for user's medications
// @access  Private
router.post('/check', auth, async (req, res) => {
  try {
    await checkConflicts(req, res);
  } catch (error) {
    console.error('Check conflicts route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check conflicts',
      error: error.message
    });
  }
});

// @route   GET /api/conflicts
// @desc    Get all food-drug conflicts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    await getAllConflicts(req, res);
  } catch (error) {
    console.error('Get all conflicts route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conflicts',
      error: error.message
    });
  }
});

// @route   GET /api/conflicts/medicine/:medicineName
// @desc    Get conflicts for specific medicine
// @access  Private
router.get('/medicine/:medicineName', auth, async (req, res) => {
  try {
    await getConflictsForMedicine(req, res);
  } catch (error) {
    console.error('Get conflicts for medicine route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conflicts for medicine',
      error: error.message
    });
  }
});

// @route   POST /api/conflicts/check-specific
// @desc    Check if specific food conflicts with medicine
// @access  Private
router.post('/check-specific', auth, async (req, res) => {
  try {
    await checkSpecificConflict(req, res);
  } catch (error) {
    console.error('Check specific conflict route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check specific conflict',
      error: error.message
    });
  }
});

// @route   POST /api/conflicts/safe-foods
// @desc    Get safe foods for user's medications
// @access  Private
router.post('/safe-foods', auth, async (req, res) => {
  try {
    await getSafeFoods(req, res);
  } catch (error) {
    console.error('Get safe foods route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get safe foods',
      error: error.message
    });
  }
});

module.exports = router;
