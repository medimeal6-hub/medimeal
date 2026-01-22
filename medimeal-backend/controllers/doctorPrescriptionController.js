const PatientAssignment = require('../models/PatientAssignment');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * POST /api/doctor/prescriptions
 * Create a prescription for a patient
 */
const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medications, nutritionalAdvice, followUpDate, notes } = req.body;
    const doctorId = req.user._id;

    // Verify patient assignment
    const assignment = await PatientAssignment.checkAssignment(doctorId, patientId);
    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'Patient not assigned to you'
      });
    }

    // If appointmentId provided, update appointment with prescription
    if (appointmentId) {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        userId: patientId
      });

      if (appointment) {
        appointment.appointmentNotes = appointment.appointmentNotes || {};
        appointment.appointmentNotes.prescriptions = medications || [];
        appointment.appointmentNotes.diagnosis = notes || appointment.appointmentNotes.diagnosis;
        
        if (followUpDate) {
          appointment.appointmentNotes.followUpRequired = true;
          appointment.appointmentNotes.followUpDate = new Date(followUpDate);
        }

        await appointment.save();
      }
    }

    // Also update patient's medications in their profile
    const patient = await User.findById(patientId);
    if (patient && medications && Array.isArray(medications)) {
      // Add new medications to patient profile
      for (const med of medications) {
        patient.medications.push({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          startDate: new Date(),
          ...(med.endDate && { endDate: new Date(med.endDate) })
        });
      }
      await patient.save();
    }

    res.json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        patientId,
        appointmentId,
        medications,
        nutritionalAdvice,
        followUpDate,
        notes,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/doctor/prescriptions/:patientId
 * Get all prescriptions for a patient
 */
const getPatientPrescriptions = async (req, res) => {
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

    // Get all appointments with prescriptions
    const appointments = await Appointment.find({
      userId: patientId,
      'appointmentNotes.prescriptions': { $exists: true, $ne: [] }
    })
    .sort({ appointmentDate: -1 });

    const prescriptions = appointments.map(apt => ({
      id: apt._id,
      appointmentDate: apt.appointmentDate,
      medications: apt.appointmentNotes.prescriptions || [],
      diagnosis: apt.appointmentNotes.diagnosis || '',
      nutritionalAdvice: apt.appointmentNotes.nutritionalAdvice || '',
      followUpDate: apt.appointmentNotes.followUpDate,
      notes: apt.description || ''
    }));

    res.json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    console.error('Get patient prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get prescriptions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/doctor/prescriptions/:prescriptionId/export-pdf
 * Export prescription as PDF (placeholder - would need PDF library)
 */
const exportPrescriptionPDF = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
    // This would use a PDF library like pdfkit or puppeteer
    // For now, return JSON that frontend can convert to PDF
    const appointment = await Appointment.findById(prescriptionId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      message: 'PDF export data (implement PDF generation on frontend or use PDF service)',
      data: {
        prescriptionId,
        patientName: appointment.userId ? `${appointment.userId.firstName} ${appointment.userId.lastName}` : 'Unknown',
        date: appointment.appointmentDate,
        medications: appointment.appointmentNotes?.prescriptions || [],
        diagnosis: appointment.appointmentNotes?.diagnosis || '',
        notes: appointment.description || ''
      }
    });
  } catch (error) {
    console.error('Export prescription PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export prescription',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createPrescription,
  getPatientPrescriptions,
  exportPrescriptionPDF
};

