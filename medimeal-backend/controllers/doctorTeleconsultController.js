const Appointment = require('../models/Appointment');
const PatientAssignment = require('../models/PatientAssignment');
const User = require('../models/User');

/**
 * POST /api/doctor/teleconsult/start
 * Start a teleconsultation session
 */
const startTeleconsult = async (req, res) => {
  try {
    const { appointmentId, patientId } = req.body;
    const doctorId = req.user._id;

    let appointment;
    
    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId);
      if (!appointment || appointment.userId.toString() !== patientId) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
    } else if (patientId) {
      // Verify patient assignment
      const assignment = await PatientAssignment.checkAssignment(doctorId, patientId);
      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Patient not assigned to you'
        });
      }

      // Create new teleconsultation appointment
      const doctor = await User.findById(doctorId);
      appointment = new Appointment({
        userId: patientId,
        provider: {
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          specialization: doctor.specialization,
          email: doctor.email
        },
        title: 'Teleconsultation',
        description: 'Video consultation session',
        appointmentDate: new Date(),
        duration: 30,
        type: 'consultation',
        status: 'scheduled',
        mode: 'telemedicine',
        meetingLink: `https://meet.medimeal.com/${doctorId}-${patientId}-${Date.now()}`,
        meetingId: `${doctorId}-${patientId}-${Date.now()}`,
        reasonForVisit: 'Teleconsultation'
      });
      await appointment.save();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either appointmentId or patientId is required'
      });
    }

    res.json({
      success: true,
      message: 'Teleconsultation session started',
      data: {
        appointmentId: appointment._id,
        meetingLink: appointment.meetingLink,
        meetingId: appointment.meetingId,
        patientId: appointment.userId,
        doctorId
      }
    });
  } catch (error) {
    console.error('Start teleconsult error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start teleconsultation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/doctor/teleconsult/:appointmentId/notes
 * Save consultation notes
 */
const saveConsultationNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { notes, diagnosis, prescriptions, followUpDate, attachments } = req.body;
    const doctorId = req.user._id;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Update appointment notes
    appointment.appointmentNotes = appointment.appointmentNotes || {};
    if (notes) appointment.appointmentNotes.userNotes = notes;
    if (diagnosis) appointment.appointmentNotes.diagnosis = diagnosis;
    if (prescriptions) appointment.appointmentNotes.prescriptions = prescriptions;
    if (followUpDate) {
      appointment.appointmentNotes.followUpRequired = true;
      appointment.appointmentNotes.followUpDate = new Date(followUpDate);
    }

    if (attachments && Array.isArray(attachments)) {
      appointment.attachments = [...(appointment.attachments || []), ...attachments];
    }

    appointment.status = 'completed';
    await appointment.save();

    res.json({
      success: true,
      message: 'Consultation notes saved successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Save consultation notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save consultation notes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/doctor/teleconsult/history/:patientId
 * Get teleconsultation history for a patient
 */
const getTeleconsultHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;

    const assignment = await PatientAssignment.checkAssignment(doctorId, patientId);
    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Patient not assigned to you'
      });
    }

    const consultations = await Appointment.find({
      userId: patientId,
      mode: 'telemedicine'
    })
    .populate('userId', 'firstName lastName email')
    .sort({ appointmentDate: -1 });

    res.json({
      success: true,
      data: consultations
    });
  } catch (error) {
    console.error('Get teleconsult history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get teleconsultation history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  startTeleconsult,
  saveConsultationNotes,
  getTeleconsultHistory
};

