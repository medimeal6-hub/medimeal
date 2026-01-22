const mongoose = require('mongoose');
const PatientAssignment = require('../models/PatientAssignment');
const HealthRecord = require('../models/HealthRecord');
const Symptom = require('../models/Symptom');
const FoodPlan = require('../models/FoodPlan');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const LabReport = require('../models/LabReport');

/**
 * Helper: ensure doctor is assigned to patient
 */
async function ensureDoctorPatientAccess(doctorId, patientId) {
  const assignment = await PatientAssignment.checkAssignment(doctorId, patientId);
  if (!assignment) {
    const err = new Error('Patient not assigned to this doctor');
    err.statusCode = 403;
    throw err;
  }
}

/**
 * GET /api/doctor/patients/:patientId/timeline
 * Patient health timeline (visits, symptoms, diets, meds, labs)
 */
async function getPatientTimeline(req, res) {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;

    // Allow any doctor to view timeline (as per user request - all doctors can view all appointments)
    // Just verify patient exists
    const patientExists = await User.findById(patientId);
    if (!patientExists) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const [patient, appointments, symptoms, vitals, foodPlans, labReports] = await Promise.all([
      User.findById(patientId).select(
        'firstName lastName email dateOfBirth gender medicalConditions allergies medications dietaryPreferences'
      ),
      Appointment.find({ userId: patientId }).sort({ appointmentDate: -1 }).limit(100),
      Symptom.find({ userId: patientId }).sort({ onsetDate: -1 }).limit(100),
      HealthRecord.find({ userId: patientId }).sort({ recordedAt: -1 }).limit(100),
      FoodPlan.find({ patientId }).sort({ createdAt: -1 }).limit(50),
      LabReport ? LabReport.find({ patientId: patientId }).sort({ reportDate: -1 }).limit(100).catch(() => []) : Promise.resolve([]),
    ]);

    // Build a unified, time-ordered timeline
    const timeline = [];

    appointments.forEach((apt) => {
      timeline.push({
        type: 'appointment',
        id: apt._id,
        at: apt.appointmentDate || apt.createdAt,
        title: apt.title || `${apt.type || 'Appointment'}`,
        status: apt.status,
        priority: apt.priority,
        notes: apt.description || apt.reasonForVisit || '',
        provider: apt.provider?.name || 'Unknown Doctor',
        description: `${apt.type || 'Appointment'} - ${apt.reasonForVisit || 'No reason specified'}`
      });
    });

    (symptoms || []).forEach((sym) => {
      timeline.push({
        type: 'symptom',
        id: sym._id,
        at: sym.onsetDate || sym.createdAt,
        name: sym.name,
        category: sym.category,
        severity: sym.severity,
        status: sym.status,
        description: sym.description || `Symptom: ${sym.name}`,
      });
    });

    (vitals || []).forEach((rec) => {
      timeline.push({
        type: 'vital',
        id: rec._id,
        at: rec.recordedAt || rec.createdAt,
        metric: rec.type,
        values: rec.values,
        unit: rec.unit,
        description: `Vital sign: ${rec.type} - ${JSON.stringify(rec.values || {})} ${rec.unit || ''}`,
      });
    });

    (foodPlans || []).forEach((plan) => {
      timeline.push({
        type: 'diet-plan',
        id: plan._id,
        at: plan.createdAt,
        planName: plan.planName || 'Diet Plan',
        isActive: plan.isActive,
        isCompleted: plan.isCompleted,
        startDate: plan.startDate,
        endDate: plan.endDate,
        description: `${plan.isActive ? 'Active' : 'Inactive'} diet plan: ${plan.planName || 'Food Plan'}`,
        status: plan.isActive ? 'active' : plan.isCompleted ? 'completed' : 'inactive'
      });
    });

    (labReports || []).forEach((report) => {
      timeline.push({
        type: 'lab-report',
        id: report._id,
        at: report.reportDate || report.createdAt,
        title: report.title || 'Lab Report',
        laboratoryName: report.laboratoryName,
        typeLabel: report.type,
        description: `${report.type || 'Lab'} report from ${report.laboratoryName || 'Laboratory'}`,
      });
    });

    timeline.sort((a, b) => new Date(b.at) - new Date(a.at));

    res.json({
      success: true,
      data: {
        patient,
        timeline,
      },
    });
  } catch (error) {
    console.error('Get patient timeline error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to fetch patient timeline',
    });
  }
}

/**
 * GET /api/doctor/patients/disease-categories
 * Disease-wise patient categorization for this doctor
 */
async function getDiseaseWisePatients(req, res) {
  try {
    const doctorId = req.user._id;

    const assignments = await PatientAssignment.findPatientsForDoctor(doctorId);

    const byDisease = {};

    assignments.forEach((asgn) => {
      const patient = asgn.patientId;
      if (!patient) return;
      const diseases = patient.medicalConditions || [];
      if (!diseases.length) {
        const key = 'Unspecified';
        byDisease[key] = byDisease[key] || [];
        byDisease[key].push({
          id: patient._id,
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email,
          gender: patient.gender,
        });
      } else {
        diseases.forEach((d) => {
          const key = d || 'Unspecified';
          byDisease[key] = byDisease[key] || [];
          byDisease[key].push({
            id: patient._id,
            name: `${patient.firstName} ${patient.lastName}`,
            email: patient.email,
            gender: patient.gender,
          });
        });
      }
    });

    res.json({
      success: true,
      data: byDisease,
    });
  } catch (error) {
    console.error('Get disease-wise patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disease-wise patients',
    });
  }
}

/**
 * GET /api/doctor/patients/:patientId/risk-alerts
 * Risk alerts (high sugar, BP, cholesterol-like proxy via weight/BMI)
 */
async function getRiskAlertsForPatient(req, res) {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;
    await ensureDoctorPatientAccess(doctorId, patientId);

    const metrics = await Promise.all([
      HealthRecord.getLatestByType(patientId, 'blood-pressure'),
      HealthRecord.getLatestByType(patientId, 'blood-sugar'),
      HealthRecord.getLatestByType(patientId, 'weight'),
      HealthRecord.getLatestByType(patientId, 'bmi'),
    ]);

    const alerts = [];

    const bp = metrics[0][0];
    if (bp) {
      const { systolic, diastolic } = bp.values || {};
      if (systolic >= 140 || diastolic >= 90) {
        alerts.push({
          type: 'blood-pressure',
          level: 'high',
          message: `Blood pressure is high (${systolic}/${diastolic} ${bp.unit}).`,
        });
      }
    }

    const sugar = metrics[1][0];
    if (sugar) {
      const value = sugar.values?.value;
      if (value >= 180) {
        alerts.push({
          type: 'blood-sugar',
          level: 'high',
          message: `Blood sugar is high (${value} ${sugar.unit}).`,
        });
      }
    }

    const bmi = metrics[3][0];
    if (bmi) {
      const value = bmi.values?.value;
      if (value >= 30) {
        alerts.push({
          type: 'bmi',
          level: 'high',
          message: `BMI indicates obesity (${value.toFixed(1)}).`,
        });
      } else if (value >= 25) {
        alerts.push({
          type: 'bmi',
          level: 'elevated',
          message: `BMI is in overweight range (${value.toFixed(1)}).`,
        });
      }
    }

    res.json({
      success: true,
      data: {
        alerts,
      },
    });
  } catch (error) {
    console.error('Get risk alerts error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to fetch risk alerts',
    });
  }
}

/**
 * POST /api/doctor/patients/:patientId/lab-reports
 * Simple JSON-only lab report upload (file URL handled by frontend/cloud storage)
 */
async function createLabReport(req, res) {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;
    await ensureDoctorPatientAccess(doctorId, patientId);

    const {
      title,
      type,
      laboratoryName,
      reportDate,
      appointmentId,
      results = [],
      file = null,
      notes,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const report = await LabReport.create({
      userId: patientId,
      doctorId,
      title,
      type,
      laboratoryName,
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      appointmentId: appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)
        ? appointmentId
        : undefined,
      results,
      file,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Lab report created',
      data: report,
    });
  } catch (error) {
    console.error('Create lab report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lab report',
    });
  }
}

/**
 * GET /api/doctor/patients/:patientId/lab-reports
 */
async function getLabReportsForPatient(req, res) {
  try {
    const doctorId = req.user._id;
    const { patientId } = req.params;
    await ensureDoctorPatientAccess(doctorId, patientId);

    const reports = await LabReport.findForPatient(patientId, { limit: 100 });

    res.json({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error('Get lab reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab reports',
    });
  }
}

module.exports = {
  getPatientTimeline,
  getDiseaseWisePatients,
  getRiskAlertsForPatient,
  createLabReport,
  getLabReportsForPatient,
};


