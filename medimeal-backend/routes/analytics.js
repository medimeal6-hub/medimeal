const express = require('express');
const { auth } = require('../middleware/auth');
const { getSystemAnalytics, getUserAnalytics, getDoctorAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

// @route   GET /api/analytics/system
// @desc    Get system analytics for admin dashboard
// @access  Private (Admin only)
router.get('/system', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    await getSystemAnalytics(req, res);
  } catch (error) {
    console.error('System analytics route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/user
// @desc    Get user analytics for patient dashboard
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    await getUserAnalytics(req, res);
  } catch (error) {
    console.error('User analytics route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/doctor
// @desc    Get doctor analytics for doctor dashboard
// @access  Private (Doctor only)
router.get('/doctor', auth, async (req, res) => {
  try {
    // Check if user is doctor
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor role required.'
      });
    }

    await getDoctorAnalytics(req, res);
  } catch (error) {
    console.error('Doctor analytics route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor analytics',
      error: error.message
    });
  }
});

module.exports = router;
