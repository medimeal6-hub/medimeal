const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const PatientAssignment = require('../models/PatientAssignment');
const DoctorSchedule = require('../models/DoctorSchedule');
const Appointment = require('../models/Appointment');
const {
  getPatientTimeline,
  getDiseaseWisePatients,
  getRiskAlertsForPatient,
  createLabReport,
  getLabReportsForPatient,
} = require('../controllers/doctorClinicalController');
const {
  getClinicalInsights,
  checkDietSuitability
} = require('../controllers/doctorClinicalSupportController');
const {
  getPendingDietPlans,
  approveDietPlan,
  modifyDietPlan,
  lockDietPlan,
  assignDietitian
} = require('../controllers/doctorDietReviewController');
const {
  getDoctorAlerts,
  resolveAlert
} = require('../controllers/doctorAlertsController');
const {
  createPrescription,
  getPatientPrescriptions,
  exportPrescriptionPDF
} = require('../controllers/doctorPrescriptionController');
const {
  startTeleconsult,
  saveConsultationNotes,
  getTeleconsultHistory
} = require('../controllers/doctorTeleconsultController');
const {
  getWorkloadMetrics
} = require('../controllers/doctorWorkloadController');
const {
  performClinicalAnalysis,
  logClinicalAssistantUsage
} = require('../services/clinicalAssistantService');

const router = express.Router();

// All doctor routes require auth and doctor role
router.use(auth, authorize('doctor'));

// -------- Clinical Intelligence (Patient Management) --------

// GET /api/doctor/patients/:patientId/timeline
router.get('/patients/:patientId/timeline', getPatientTimeline);

// GET /api/doctor/patients/disease-categories
router.get('/patients-disease-categories', getDiseaseWisePatients);

// GET /api/doctor/patients/:patientId/risk-alerts
router.get('/patients/:patientId/risk-alerts', getRiskAlertsForPatient);

// Lab reports
router.post('/patients/:patientId/lab-reports', createLabReport);
router.get('/patients/:patientId/lab-reports', getLabReportsForPatient);

// -------- Clinical Decision Support --------
router.get('/clinical-insights/:patientId', getClinicalInsights);
router.get('/diet-suitability/:patientId', checkDietSuitability);

// -------- Diet Plan Review & Approval --------
router.get('/diet-plans/pending', getPendingDietPlans);
router.post('/diet-plans/:planId/approve', approveDietPlan);
router.post('/diet-plans/:planId/modify', modifyDietPlan);
router.post('/diet-plans/:planId/lock', lockDietPlan);
router.post('/diet-plans/:planId/assign-dietitian', assignDietitian);

// -------- Alerts & Notifications --------
router.get('/alerts', getDoctorAlerts);
router.post('/alerts/:alertId/resolve', resolveAlert);

// -------- Prescription & Advice --------
router.post('/prescriptions', createPrescription);
router.get('/prescriptions/:patientId', getPatientPrescriptions);
router.post('/prescriptions/:prescriptionId/export-pdf', exportPrescriptionPDF);

// -------- Tele-Consultation --------
router.post('/teleconsult/start', startTeleconsult);
router.post('/teleconsult/:appointmentId/notes', saveConsultationNotes);
router.get('/teleconsult/history/:patientId', getTeleconsultHistory);

// -------- Workload & Performance --------
router.get('/workload', getWorkloadMetrics);

// GET /api/doctor/dashboard - get doctor dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Get ALL patients from ALL APPOINTMENTS (show all appointments)
    // This shows all patients with appointments (all statuses)
    const liveAppointments = await Appointment.find({})
    .populate('userId', 'firstName lastName email dateOfBirth gender profilePicture phone')
    .sort({ createdAt: -1 }) // Latest appointment requests first
    .limit(100); // Get more appointments for dashboard

    // Also get assigned patients from PatientAssignment (optional - for hospital ward system)
    const assignedPatientsFromWard = await PatientAssignment.find({ 
      doctor: doctorId, 
      status: 'active' 
    })
    .populate('patient', 'firstName lastName email dateOfBirth gender profilePicture')
    .sort({ priority: -1, assignedAt: -1 })
    .limit(10);

    // Combine and deduplicate patients from appointments and ward assignments
    const patientMap = new Map();

    // Add patients from live appointments (prioritize these)
    liveAppointments.forEach(apt => {
      if (apt.userId && !patientMap.has(apt.userId._id.toString())) {
        patientMap.set(apt.userId._id.toString(), {
          _id: apt._id,
          patient: apt.userId,
          patientId: apt.userId._id,
          source: 'appointment',
          appointmentId: apt._id,
          appointmentStatus: apt.status,
          priority: apt.status === 'PAID' ? 'high' : apt.status === 'APPROVED' ? 'medium' : 'low',
          wardNumber: null,
          diagnosis: apt.reasonForVisit || 'Appointment Consultation',
          startDate: apt.appointmentDate,
          endDate: null,
          assignedAt: apt.createdAt,
          consultationFee: apt.consultationFee,
          appointmentType: apt.type
        });
      }
    });

    // Add patients from ward assignments (if not already in map)
    assignedPatientsFromWard.forEach(assignment => {
      if (assignment.patient && !patientMap.has(assignment.patient._id.toString())) {
        patientMap.set(assignment.patient._id.toString(), {
          _id: assignment._id,
          patient: assignment.patient,
          patientId: assignment.patient._id,
          source: 'ward',
          priority: assignment.priority || 'medium',
          wardNumber: assignment.wardNumber,
          diagnosis: assignment.diagnosis || 'Ward Assignment',
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          assignedAt: assignment.assignedAt
        });
      }
    });

    // Convert map to array and sort by priority and date
    // Show ALL patients from appointments (no limit, show all)
    let assignedPatients = Array.from(patientMap.values())
      .sort((a, b) => {
        // Sort by: appointment source first, then priority, then date
        if (a.source === 'appointment' && b.source !== 'appointment') return -1;
        if (b.source === 'appointment' && a.source !== 'appointment') return 1;
        
        const priorityOrder = { high: 3, critical: 4, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 2;
        const bPriority = priorityOrder[b.priority] || 2;
        if (bPriority !== aPriority) return bPriority - aPriority;
        
        return new Date(b.assignedAt || b.startDate) - new Date(a.assignedAt || a.startDate);
      }); // No limit - show ALL patients on dashboard

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

    // Calculate dashboard metrics - count ALL unique patients from appointments
    // Get unique patient count from all appointments
    const uniquePatientsFromAppointments = await Appointment.distinct('userId', { userId: { $ne: null } });
    const totalPatients = uniquePatientsFromAppointments.length;
    
    // GET ALL APPOINTMENT STATISTICS (for all doctors)
    // Count ALL appointments by status (not just today's, not just this doctor's)
    const allAppointments = await Appointment.find({});
    
    // Get today's appointments count
    const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const todayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    const todayAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= todayStart && aptDate < todayEnd;
    });
    
    const todayAppointmentStats = {
      total: todayAppointments.length,
      requested: todayAppointments.filter(apt => apt.status?.toUpperCase() === 'REQUESTED').length,
      approved: todayAppointments.filter(apt => apt.status?.toUpperCase() === 'APPROVED').length,
      paid: todayAppointments.filter(apt => apt.status?.toUpperCase() === 'PAID').length,
      completed: todayAppointments.filter(apt => apt.status?.toLowerCase() === 'completed').length,
      pending: todayAppointments.filter(apt => ['REQUESTED', 'APPROVED'].includes(apt.status?.toUpperCase())).length
    };
    
    // Also get appointment counts for dashboard summary
    const completedToday = todayAppointmentStats.completed + todayAppointmentStats.paid;
    const pendingToday = todayAppointmentStats.pending;
    
    // Calculate ALL appointments statistics (for all doctors)
    const appointmentStats = {
      total: allAppointments.length,
      requested: allAppointments.filter(apt => apt.status?.toUpperCase() === 'REQUESTED').length,
      approved: allAppointments.filter(apt => apt.status?.toUpperCase() === 'APPROVED').length,
      paid: allAppointments.filter(apt => apt.status?.toUpperCase() === 'PAID').length,
      rejected: allAppointments.filter(apt => apt.status?.toUpperCase() === 'REJECTED').length
    };

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
          todayAppointments: todayAppointmentStats.total,
          completedAppointments: completedToday,
          pendingAppointments: pendingToday,
          requestedAppointments: todayAppointmentStats.requested,
          approvedAppointments: todayAppointmentStats.approved,
          paidAppointments: todayAppointmentStats.paid,
          // ALL appointments statistics (for all doctors)
          allAppointments: appointmentStats.total,
          allRequested: appointmentStats.requested,
          allApproved: appointmentStats.approved,
          allPaid: appointmentStats.paid,
          allRejected: appointmentStats.rejected,
          priorityBreakdown: priorityStats
        },
        hospitalStats,
        assignedPatients: assignedPatients.map(assignment => {
          const patient = assignment.patient || {};
          const isFromAppointment = assignment.source === 'appointment';
          
          return {
            id: assignment._id || assignment.patientId,
            patientId: patient._id || assignment.patientId,
            appointmentId: assignment.appointmentId || null,
            name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient',
            email: patient.email || null,
            phone: patient.phone || null,
            age: (() => {
              if (!patient.dateOfBirth) return 'N/A';
              try {
                const birthDate = new Date(patient.dateOfBirth);
                if (isNaN(birthDate.getTime())) return 'N/A';
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                return age > 0 ? age : 'N/A';
              } catch (e) {
                return 'N/A';
              }
            })(),
            gender: patient.gender || 'N/A',
            wardNumber: assignment.wardNumber || null,
            priority: assignment.priority || 'medium',
            startDate: assignment.startDate || new Date(),
            endDate: assignment.endDate || null,
            diagnosis: assignment.diagnosis || (isFromAppointment ? 'Appointment Consultation' : 'No diagnosis available'),
            profilePicture: patient.profilePicture || null,
            source: assignment.source || 'ward',
            appointmentStatus: assignment.appointmentStatus || null,
            consultationFee: assignment.consultationFee || null,
            appointmentType: assignment.appointmentType || null,
            appointmentDate: assignment.startDate || null
          };
        }),
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

// GET /api/doctor/patients - get ALL patients from ALL appointment requests
router.get('/patients', auth, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const doctor = await User.findById(doctorId);
    const { page = 1, limit = 10000, sort = 'date' } = req.query; // Very high limit to get ALL appointments
    
    console.log('========================================');
    console.log('👥 DOCTOR PATIENTS ENDPOINT - ALL APPOINTMENTS');
    console.log(`✅ Doctor ID: ${doctorId}`);
    console.log(`✅ Fetching ALL appointments (limit: ${limit})`);
    console.log(`✅ Sort: ${sort} (default: date = chronological by request time)`);
    console.log('========================================');

    // Get ALL patients from ALL appointment requests (all statuses)
    // Sort by createdAt (when they sent the appointment request) - chronological order
    let sortOptions = {};
    if (sort === 'date' || sort === 'request-time') {
      sortOptions = { createdAt: 1 }; // Oldest appointment requests first (chronological)
    } else if (sort === 'date-desc') {
      sortOptions = { createdAt: -1 }; // Newest first
    } else if (sort === 'name') {
      sortOptions = { 'userId.firstName': 1 };
    } else if (sort === 'appointment-date') {
      sortOptions = { appointmentDate: 1 };
    } else {
      sortOptions = { createdAt: 1 }; // Default: chronological by request time
    }

    // Query ALL appointments - no doctor filter, show ALL appointments from ALL patients
    const appointments = await Appointment.find({})
    .populate('userId', 'firstName lastName email dateOfBirth gender profilePicture phone medicalConditions allergies')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Appointment.countDocuments({});

    // Convert appointments to patient format with original request time
    const patients = appointments
      .filter(apt => apt.userId) // Filter out null userIds
      .map(apt => {
        const patient = apt.userId;
        return {
          id: apt._id,
          appointmentId: apt._id,
          patientId: patient._id,
          name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient',
          email: patient.email || null,
          phone: patient.phone || null,
          age: (() => {
            if (!patient.dateOfBirth) return 'N/A';
            try {
              const birthDate = new Date(patient.dateOfBirth);
              if (isNaN(birthDate.getTime())) return 'N/A';
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              return age > 0 ? age : 'N/A';
            } catch (e) {
              return 'N/A';
            }
          })(),
          gender: patient.gender || 'N/A',
          wardNumber: null,
          priority: apt.status === 'PAID' ? 'high' : apt.status === 'APPROVED' ? 'medium' : 'low',
          status: apt.status.toLowerCase(),
          appointmentStatus: apt.status,
          startDate: apt.appointmentDate,
          endDate: null,
          diagnosis: apt.reasonForVisit || 'Appointment Consultation',
          treatmentPlan: null,
          notes: apt.description || null,
          profilePicture: patient.profilePicture || null,
          medicalConditions: patient.medicalConditions || [],
          allergies: patient.allergies || [],
          assignedAt: apt.createdAt, // When appointment request was sent
          lastUpdated: apt.updatedAt,
          consultationFee: apt.consultationFee || 0,
          appointmentType: apt.type || 'consultation',
          source: 'appointment',
          requestTime: apt.createdAt, // Original request time
          appointmentDate: apt.appointmentDate,
          requestDate: apt.createdAt // When patient sent the request
        };
      });

    console.log(`✅ Fetched ${patients.length} patients from appointments (sorted by request time)`);
    patients.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - Requested: ${new Date(p.requestTime).toLocaleString()}, Status: ${p.appointmentStatus}`);
    });
    console.log('========================================');

    res.status(200).json({
      success: true,
      data: patients,
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
          age: (() => {
            if (!patient.dateOfBirth) return 'N/A';
            try {
              const birthDate = new Date(patient.dateOfBirth);
              if (isNaN(birthDate.getTime())) return 'N/A';
              const today = new Date();
              let age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              return age > 0 ? age : 'N/A';
            } catch (e) {
              return 'N/A';
            }
          })(),
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

// GET /api/doctor/appointments - get all appointments for the doctor
router.get('/appointments', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { status, type, priority, startDate, endDate } = req.query;
    
    // Build query to find appointments where the doctor is the provider
    // We'll use the provider.name field to match the doctor's name
    const doctor = await User.findById(doctorId);
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    
    let query = {
      'provider.name': doctorName,
      'provider.specialization': doctor.specialization
    };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    
    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const appointments = await Appointment.find(query)
      .populate('userId', 'firstName lastName email phone dateOfBirth gender')
      .sort({ appointmentDate: 1 });
    
    // Transform appointments to match the frontend format
    const formattedAppointments = appointments.map(apt => ({
      id: apt._id,
      patientName: apt.userId ? `${apt.userId.firstName} ${apt.userId.lastName}` : 'Unknown Patient',
      patientEmail: apt.userId?.email || '',
      patientPhone: apt.userId?.phone || apt.provider.phone || '',
      date: apt.appointmentDate.toISOString().split('T')[0],
      time: apt.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      duration: apt.duration || 30,
      type: apt.type,
      status: apt.status,
      notes: apt.description || apt.reasonForVisit || '',
      wardNumber: apt.provider.clinic || '',
      priority: apt.priority || 'medium'
    }));
    
    res.status(200).json({
      success: true,
      data: formattedAppointments
    });
  } catch (error) {
    console.error('Fetch appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/doctor/appointments/:id - get specific appointment
router.get('/appointments/:id', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const appointmentId = req.params.id;
    
    const doctor = await User.findById(doctorId);
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      'provider.name': doctorName
    }).populate('userId', 'firstName lastName email phone dateOfBirth gender');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Fetch appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
});

// PATCH /api/doctor/appointments/:id - update appointment (status, notes, etc)
router.patch('/appointments/:id', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const appointmentId = req.params.id;
    const { status, notes, diagnosis, prescriptions } = req.body;
    
    const doctor = await User.findById(doctorId);
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      'provider.name': doctorName
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Update status if provided
    if (status) {
      appointment.status = status;
      if (status === 'approved' || status === 'confirmed') {
        // Send approval email to user
        try {
          const { sendAppointmentApprovalEmail } = require('../utils/mailer');
          const EmailLog = require('../models/EmailLog');
          const user = await User.findById(appointment.userId);
          if (user) {
            await sendAppointmentApprovalEmail(
              user.email,
              user.firstName,
              {
                doctorName: appointment.provider.name,
                date: appointment.appointmentDate.toISOString().split('T')[0],
                time: appointment.appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                type: appointment.type
              }
            );
            
            // Log email
            await EmailLog.create({
              userId: appointment.userId,
              email: user.email,
              subject: 'Appointment Approved - MediMeal',
              type: 'appointment_approval',
              status: 'sent',
              metadata: { appointmentId: appointment._id }
            });
          }
        } catch (emailError) {
          console.error('Failed to send appointment approval email:', emailError);
        }
      }
      if (status === 'completed' && appointment.appointmentNotes) {
        // You can add more logic here
      }
    }
    
    // Update notes
    if (notes !== undefined) {
      appointment.description = notes;
    }
    
    // Update appointment notes
    if (diagnosis && appointment.appointmentNotes) {
      appointment.appointmentNotes.diagnosis = diagnosis;
    }
    
    if (prescriptions && Array.isArray(prescriptions)) {
      appointment.appointmentNotes = appointment.appointmentNotes || {};
      appointment.appointmentNotes.prescriptions = prescriptions;
    }
    
    await appointment.save();
    
    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
});

// POST /api/doctor/appointments - create new appointment
router.post('/appointments', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const {
      patientId,
      date,
      time,
      duration,
      type,
      priority,
      notes,
      wardNumber,
      patientPhone,
      patientEmail
    } = req.body;
    
    const doctor = await User.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    // Combine date and time
    const appointmentDate = new Date(`${date}T${time}`);
    
    // Create new appointment
    const appointment = new Appointment({
      userId: patientId,
      provider: {
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization,
        clinic: wardNumber || `Ward #${wardNumber}`,
        email: doctor.email,
        phone: doctor.phone
      },
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Appointment`,
      description: notes || '',
      appointmentDate,
      duration: duration || 30,
      type,
      status: 'scheduled',
      priority: priority || 'medium',
      mode: 'in-person',
      reasonForVisit: notes || '',
      patientPhone,
      patientEmail
    });
    
    await appointment.save();
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// CLINICAL AI ASSISTANT ROUTES
// ============================================

// POST /api/doctor/clinical-assistant/analyze - AI clinical analysis
router.post('/clinical-assistant/analyze', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const inputData = req.body;

    // Validate required fields
    if (!inputData.gender || !inputData.age || !inputData.symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: gender, age, and symptoms are required'
      });
    }

    // Perform clinical analysis
    const analysisResult = await performClinicalAnalysis(inputData);

    // Log the analysis (async, don't wait)
    logClinicalAssistantUsage({
      doctorId,
      sessionId: `analysis_${Date.now()}`,
      input: inputData,
      output: analysisResult,
      decision: 'pending',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Logging error:', err));

    res.status(200).json({
      success: true,
      data: analysisResult,
      disclaimer: 'AI-assisted recommendation. Doctor decision required.'
    });
  } catch (error) {
    console.error('Clinical assistant analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform clinical analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/doctor/clinical-assistant/assign-medicine - Assign medicine (doctor confirmation)
router.post('/clinical-assistant/assign-medicine', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { selectedMedicine, patientInfo, doctorDecision } = req.body;

    console.log('Assign medicine request:', {
      hasSelectedMedicine: !!selectedMedicine,
      hasPatientInfo: !!patientInfo,
      selectedMedicineName: selectedMedicine?.name,
      doctorDecision
    });

    if (!selectedMedicine) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: selectedMedicine is required'
      });
    }

    if (!patientInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: patientInfo is required'
      });
    }

    // Validate patientInfo has at least basic fields
    if (!patientInfo.gender || !patientInfo.age || !patientInfo.symptoms) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patientInfo: gender, age, and symptoms are required'
      });
    }

    // Log doctor's decision
    await logClinicalAssistantUsage({
      doctorId,
      sessionId: `assignment_${Date.now()}`,
      input: patientInfo,
      output: { selectedMedicine, doctorDecision: doctorDecision || 'approved' },
      decision: doctorDecision || 'approved',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // In a real system, you would save the prescription here
    // For now, we just log the decision
    // TODO: Save prescription to database

    res.status(200).json({
      success: true,
      message: 'Medicine assignment logged successfully',
      data: {
        medicine: selectedMedicine,
        assignedBy: doctorId,
        assignedAt: new Date(),
        decision: doctorDecision || 'approved'
      }
    });
  } catch (error) {
    console.error('Medicine assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign medicine',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/doctor/appointments/:id - cancel appointment
router.delete('/appointments/:id', async (req, res) => {
  try {
    const doctorId = req.user._id;
    const appointmentId = req.params.id;
    const { reason } = req.body;
    
    const doctor = await User.findById(doctorId);
    const doctorName = `Dr. ${doctor.firstName} ${doctor.lastName}`;
    
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      'provider.name': doctorName
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    await appointment.cancel(reason || 'Cancelled by doctor', 'provider');
    
    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
});

module.exports = router;




