const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const PatientAssignment = require('../models/PatientAssignment');
const DoctorSchedule = require('../models/DoctorSchedule');

const router = express.Router();

// All doctor routes require auth and doctor role
router.use(auth, authorize('doctor'));

// GET /api/doctor/dashboard - get doctor dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get assigned patients
    const assignedPatients = await PatientAssignment.find({ 
      doctor: doctorId, 
      status: 'active' 
    })
    .populate('patient', 'firstName lastName email dateOfBirth gender profilePicture')
    .sort({ priority: -1, assignedAt: -1 })
    .limit(10);

    // Get patient count by priority
    const patientStats = await PatientAssignment.aggregate([
      { $match: { doctor: doctorId, status: 'active' } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const priorityStats = patientStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, { high: 0, medium: 0, low: 0, critical: 0 });

    // Get today's schedule
    const todaySchedule = await DoctorSchedule.findOne({
      doctor: doctorId,
      date: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
      }
    });

    // Get monthly schedule overview
    const monthlySchedule = await DoctorSchedule.find({
      doctor: doctorId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    // Get recent activities (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivities = await PatientAssignment.find({
      doctor: doctorId,
      lastUpdated: { $gte: sevenDaysAgo }
    })
    .populate('patient', 'firstName lastName')
    .sort({ lastUpdated: -1 })
    .limit(5);

    // Calculate dashboard metrics
    const totalPatients = await PatientAssignment.countDocuments({ doctor: doctorId, status: 'active' });
    const completedToday = todaySchedule ? 
      todaySchedule.timeSlots.filter(slot => slot.status === 'completed').length : 0;
    const pendingToday = todaySchedule ? 
      todaySchedule.timeSlots.filter(slot => slot.status === 'scheduled').length : 0;

    // Mock hospital stats (in real app, these would come from hospital management system)
    const hospitalStats = {
      beds: {
        available: 86,
        total: 120,
        occupied: 34
      },
      doctors: {
        available: 126,
        total: 150,
        onDuty: 24
      },
      ambulances: {
        available: 32,
        total: 40,
        inUse: 8
      }
    };

    res.status(200).json({
      success: true,
      data: {
        doctor: {
          id: req.user._id,
          name: `Dr. ${req.user.firstName} ${req.user.lastName}`,
          specialization: req.user.specialization,
          email: req.user.email
        },
        stats: {
          totalPatients,
          completedToday,
          pendingToday,
          priorityBreakdown: priorityStats
        },
        hospitalStats,
        assignedPatients: assignedPatients.map(assignment => ({
          id: assignment._id,
          patientId: assignment.patient._id,
          name: `${assignment.patient.firstName} ${assignment.patient.lastName}`,
          age: assignment.patient.dateOfBirth ? 
            Math.floor((new Date() - new Date(assignment.patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A',
          gender: assignment.patient.gender,
          wardNumber: assignment.wardNumber,
          priority: assignment.priority,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          diagnosis: assignment.diagnosis,
          profilePicture: assignment.patient.profilePicture
        })),
        todaySchedule: todaySchedule ? {
          date: todaySchedule.date,
          timeSlots: todaySchedule.timeSlots.map(slot => ({
            id: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            activity: slot.activity,
            title: slot.title,
            patientId: slot.patientId,
            wardNumber: slot.wardNumber,
            priority: slot.priority,
            status: slot.status,
            description: slot.description
          }))
        } : null,
        monthlySchedule: monthlySchedule.map(schedule => ({
          date: schedule.date,
          totalSlots: schedule.timeSlots.length,
          totalHours: schedule.totalHours,
          activities: schedule.timeSlots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            activity: slot.activity,
            title: slot.title
          }))
        })),
        recentActivities: recentActivities.map(activity => ({
          id: activity._id,
          patientName: `${activity.patient.firstName} ${activity.patient.lastName}`,
          wardNumber: activity.wardNumber,
          priority: activity.priority,
          lastUpdated: activity.lastUpdated,
          status: activity.status
        }))
      }
    });
  } catch (error) {
    console.error('Doctor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/doctor/patients - get all assigned patients
router.get('/patients', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { status = 'active', priority, page = 1, limit = 10, sort = 'priority' } = req.query;
    
    const query = { doctor: doctorId };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const sortOptions = {};
    if (sort === 'priority') {
      sortOptions.priority = -1; // high to low
    } else if (sort === 'name') {
      sortOptions['patient.firstName'] = 1;
    } else if (sort === 'date') {
      sortOptions.assignedAt = -1;
    }

    const patients = await PatientAssignment.find(query)
      .populate('patient', 'firstName lastName email dateOfBirth gender profilePicture medicalConditions allergies')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PatientAssignment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: patients.map(assignment => ({
        id: assignment._id,
        patientId: assignment.patient._id,
        name: `${assignment.patient.firstName} ${assignment.patient.lastName}`,
        email: assignment.patient.email,
        age: assignment.patient.dateOfBirth ? 
          Math.floor((new Date() - new Date(assignment.patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A',
        gender: assignment.patient.gender,
        wardNumber: assignment.wardNumber,
        priority: assignment.priority,
        status: assignment.status,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        diagnosis: assignment.diagnosis,
        treatmentPlan: assignment.treatmentPlan,
        notes: assignment.notes,
        profilePicture: assignment.patient.profilePicture,
        medicalConditions: assignment.patient.medicalConditions,
        allergies: assignment.patient.allergies,
        assignedAt: assignment.assignedAt,
        lastUpdated: assignment.lastUpdated
      })),
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Fetch patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
});

// GET /api/doctor/patients/:id - get specific patient details
router.get('/patients/:id', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.id;

    const assignment = await PatientAssignment.findOne({
      patient: patientId,
      doctor: doctorId
    }).populate('patient', 'firstName lastName email dateOfBirth gender profilePicture medicalConditions allergies medications dietaryPreferences');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or not assigned to you'
      });
    }

    const patient = assignment.patient;

    res.status(200).json({
      success: true,
      data: {
        assignment: {
          id: assignment._id,
          wardNumber: assignment.wardNumber,
          priority: assignment.priority,
          status: assignment.status,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          diagnosis: assignment.diagnosis,
          treatmentPlan: assignment.treatmentPlan,
          notes: assignment.notes,
          assignedAt: assignment.assignedAt,
          lastUpdated: assignment.lastUpdated
        },
        patient: {
          id: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email,
          age: patient.dateOfBirth ? 
            Math.floor((new Date() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/A',
          gender: patient.gender,
          profilePicture: patient.profilePicture,
          medicalConditions: patient.medicalConditions,
          allergies: patient.allergies,
          medications: patient.medications,
          dietaryPreferences: patient.dietaryPreferences
        }
      }
    });
  } catch (error) {
    console.error('Fetch patient details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient details'
    });
  }
});

// PATCH /api/doctor/patients/:id - update patient assignment
router.patch('/patients/:id', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const assignmentId = req.params.id;
    const { diagnosis, treatmentPlan, notes, priority, status } = req.body;

    const assignment = await PatientAssignment.findOne({
      _id: assignmentId,
      doctor: doctorId
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found or not assigned to you'
      });
    }

    // Update fields
    if (diagnosis !== undefined) assignment.diagnosis = diagnosis;
    if (treatmentPlan !== undefined) assignment.treatmentPlan = treatmentPlan;
    if (notes !== undefined) assignment.notes = notes;
    if (priority) assignment.priority = priority;
    if (status) assignment.status = status;
    
    assignment.lastUpdated = new Date();
    await assignment.save();
    await assignment.populate('patient', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Patient assignment updated successfully',
      data: assignment.getSummary()
    });
  } catch (error) {
    console.error('Update patient assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient assignment'
    });
  }
});

// GET /api/doctor/schedule - get doctor's schedule
router.get('/schedule', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { startDate, endDate, date } = req.query;

    let query = { doctor: doctorId };
    
    if (date) {
      // Get schedule for specific date
      const targetDate = new Date(date);
      query.date = {
        $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
        $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1)
      };
    } else if (startDate && endDate) {
      // Get schedule for date range
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Get current month's schedule
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const schedules = await DoctorSchedule.find(query)
      .populate('doctor', 'firstName lastName specialization')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      data: schedules.map(schedule => schedule.getSummary())
    });
  } catch (error) {
    console.error('Fetch schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
});

// PATCH /api/doctor/schedule/:id - update schedule slot
router.patch('/schedule/:id', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const scheduleId = req.params.id;
    const { slotId, status, notes } = req.body;

    const schedule = await DoctorSchedule.findOne({
      _id: scheduleId,
      doctor: doctorId
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or not assigned to you'
      });
    }

    const slot = schedule.timeSlots.id(slotId);
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    // Update slot
    if (status) slot.status = status;
    if (notes !== undefined) slot.notes = notes;
    
    schedule.updatedAt = new Date();
    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule.getSummary()
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule'
    });
  }
});

// GET /api/doctor/profile - get doctor profile
router.get('/profile', async (req, res) => {
  try {
    const doctor = req.user;
    
    res.status(200).json({
      success: true,
      data: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialization: doctor.specialization,
        profilePicture: doctor.profilePicture,
        doctorInfo: doctor.doctorInfo,
        isActive: doctor.isActive,
        lastLogin: doctor.lastLogin,
        createdAt: doctor.createdAt
      }
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// PATCH /api/doctor/profile - update doctor profile
router.patch('/profile', async (req, res) => {
  try {
    const doctor = req.user;
    const { firstName, lastName, specialization, doctorInfo } = req.body;

    // Update basic info
    if (firstName) doctor.firstName = firstName;
    if (lastName) doctor.lastName = lastName;
    if (specialization) doctor.specialization = specialization;

    // Update doctor info
    if (doctorInfo) {
      doctor.doctorInfo = { ...doctor.doctorInfo, ...doctorInfo };
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        specialization: doctor.specialization,
        profilePicture: doctor.profilePicture,
        doctorInfo: doctor.doctorInfo
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;




