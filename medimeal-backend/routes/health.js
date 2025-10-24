const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const HealthRecord = require('../models/HealthRecord');
const HealthGoal = require('../models/HealthGoal');
const Symptom = require('../models/Symptom');
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/health/dashboard
// @desc    Get health dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 7 } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get latest vital signs
    const latestVitals = await Promise.all([
      HealthRecord.getLatestByType(userId, 'blood-pressure'),
      HealthRecord.getLatestByType(userId, 'blood-sugar'),
      HealthRecord.getLatestByType(userId, 'weight'),
      HealthRecord.getLatestByType(userId, 'heart-rate')
    ]);

    // Get active symptoms
    const activeSymptoms = await Symptom.getActiveSymptoms(userId);

    // Get active goals
    const activeGoals = await HealthGoal.getActiveGoals(userId);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.getUpcoming(userId, 5);

    // Get recent health records for trends
    const recentRecords = await HealthRecord.getRecordsInRange(userId, startDate, endDate);

    // Format vitals data
    const vitalsData = {
      bloodPressure: latestVitals[0][0] || null,
      bloodSugar: latestVitals[1][0] || null,
      weight: latestVitals[2][0] || null,
      heartRate: latestVitals[3][0] || null
    };

    // Calculate trends for each vital
    const trends = {};
    ['blood-pressure', 'blood-sugar', 'weight', 'heart-rate'].forEach(type => {
      const typeRecords = recentRecords.filter(record => record.type === type);
      if (typeRecords.length >= 2) {
        const latest = typeRecords[0];
        const previous = typeRecords[1];
        
        if (type === 'blood-pressure') {
          const latestSystolic = latest.values.systolic;
          const previousSystolic = previous.values.systolic;
          trends[type] = latestSystolic > previousSystolic ? 'increasing' : 
                         latestSystolic < previousSystolic ? 'decreasing' : 'stable';
        } else {
          const latestValue = latest.values.value;
          const previousValue = previous.values.value;
          trends[type] = latestValue > previousValue ? 'increasing' : 
                         latestValue < previousValue ? 'decreasing' : 'stable';
        }
      } else {
        trends[type] = 'stable';
      }
    });

    res.json({
      success: true,
      data: {
        vitals: vitalsData,
        trends,
        activeSymptoms: activeSymptoms.slice(0, 5), // Limit to 5 most recent
        activeGoals: activeGoals.slice(0, 3), // Limit to 3 most important
        upcomingAppointments,
        summary: {
          totalRecords: recentRecords.length,
          daysTracked: days,
          urgentSymptoms: activeSymptoms.filter(s => s.needsUrgentAttention()).length,
          goalsOnTrack: activeGoals.filter(g => g.achievementPercentage >= 70).length
        }
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   POST /api/health/records
// @desc    Create a new health record
// @access  Private
router.post('/records', auth, [
  body('type')
    .isIn(['blood-pressure', 'blood-sugar', 'weight', 'heart-rate', 'temperature', 'bmi'])
    .withMessage('Invalid health record type'),
  body('values')
    .isObject()
    .withMessage('Values must be an object'),
  body('unit')
    .isIn(['mmHg', 'mg/dL', 'kg', 'bpm', '°C', '°F', 'kg/m²'])
    .withMessage('Invalid unit'),
  body('recordedAt')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, values, unit, recordedAt, notes, source, deviceInfo } = req.body;

    // Validate values based on type
    if (type === 'blood-pressure') {
      if (!values.systolic || !values.diastolic || 
          typeof values.systolic !== 'number' || typeof values.diastolic !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Blood pressure requires systolic and diastolic values'
        });
      }
    } else {
      if (values.value === undefined || typeof values.value !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Single value required for this type'
        });
      }
    }

    const healthRecord = new HealthRecord({
      userId: req.user._id,
      type,
      values,
      unit,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
      notes,
      source: source || 'manual',
      deviceInfo
    });

    await healthRecord.save();

    res.status(201).json({
      success: true,
      message: 'Health record created successfully',
      data: healthRecord
    });

  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/health/records
// @desc    Get health records with filtering
// @access  Private
router.get('/records', auth, [
  query('type').optional().isIn(['blood-pressure', 'blood-sugar', 'weight', 'heart-rate', 'temperature', 'bmi']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('page').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, startDate, endDate, limit = 20, page = 1 } = req.query;
    const userId = req.user._id;

    let query = { userId };

    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      HealthRecord.find(query)
        .sort({ recordedAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      HealthRecord.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: records.length,
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   PUT /api/health/records/:id
// @desc    Update a health record
// @access  Private
router.put('/records/:id', auth, [
  param('id').isMongoId().withMessage('Invalid record ID'),
  body('values').optional().isObject(),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('recordedAt').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const record = await HealthRecord.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    const allowedUpdates = ['values', 'notes', 'recordedAt'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    Object.assign(record, updates);
    await record.save();

    res.json({
      success: true,
      message: 'Health record updated successfully',
      data: record
    });

  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   DELETE /api/health/records/:id
// @desc    Delete a health record
// @access  Private
router.delete('/records/:id', auth, [
  param('id').isMongoId().withMessage('Invalid record ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const record = await HealthRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    res.json({
      success: true,
      message: 'Health record deleted successfully'
    });

  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// @route   GET /api/health/vitals/latest
// @desc    Get latest vital signs
// @access  Private
router.get('/vitals/latest', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const vitals = await Promise.all([
      HealthRecord.getLatestByType(userId, 'blood-pressure'),
      HealthRecord.getLatestByType(userId, 'blood-sugar'),
      HealthRecord.getLatestByType(userId, 'weight'),
      HealthRecord.getLatestByType(userId, 'heart-rate')
    ]);

    const formattedVitals = {
      bloodPressure: vitals[0][0] ? {
        ...vitals[0][0].toObject(),
        status: vitals[0][0].getStatus(),
        target: vitals[0][0].getTargetRange()
      } : null,
      bloodSugar: vitals[1][0] ? {
        ...vitals[1][0].toObject(),
        status: vitals[1][0].getStatus(),
        target: vitals[1][0].getTargetRange()
      } : null,
      weight: vitals[2][0] ? {
        ...vitals[2][0].toObject(),
        status: vitals[2][0].getStatus(),
        target: vitals[2][0].getTargetRange()
      } : null,
      heartRate: vitals[3][0] ? {
        ...vitals[3][0].toObject(),
        status: vitals[3][0].getStatus(),
        target: vitals[3][0].getTargetRange()
      } : null
    };

    res.json({
      success: true,
      data: formattedVitals
    });

  } catch (error) {
    console.error('Get latest vitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;