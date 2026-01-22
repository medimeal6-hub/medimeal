const PatientAssignment = require('../models/PatientAssignment');
const ComplianceLog = require('../models/ComplianceLog');
const Appointment = require('../models/Appointment');
const HealthRecord = require('../models/HealthRecord');
const Symptom = require('../models/Symptom');
const FoodPlan = require('../models/FoodPlan');
const Meal = require('../models/Meal');

/**
 * GET /api/doctor/alerts
 * Get all alerts for the doctor
 */
const getDoctorAlerts = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const alerts = [];

    // Get all assigned patients
    const assignments = await PatientAssignment.find({
      doctor: doctorId,
      status: 'active'
    }).populate('patient', 'firstName lastName email');

    const patientIds = assignments.map(a => a.patient._id);

    // 1. Non-compliance Alerts
    const nonComplianceLogs = await ComplianceLog.find({
      userId: { $in: patientIds },
      resolved: false,
      severity: { $in: ['high', 'medium'] }
    })
    .populate('userId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(20);

    for (const log of nonComplianceLogs) {
      alerts.push({
        id: log._id,
        type: 'non-compliance',
        severity: log.severity,
        title: 'Diet Compliance Issue',
        message: log.message,
        patientId: log.userId._id,
        patientName: `${log.userId.firstName} ${log.userId.lastName}`,
        category: log.category,
        timestamp: log.createdAt,
        context: log.context
      });
    }

    // 2. High-Risk Patient Alerts
    for (const assignment of assignments) {
      const patientId = assignment.patient._id;
      
      // Check for critical vitals
      const [latestBP, latestSugar] = await Promise.all([
        HealthRecord.getLatestByType(patientId, 'blood-pressure'),
        HealthRecord.getLatestByType(patientId, 'blood-sugar')
      ]);

      if (latestBP[0]) {
        const bp = latestBP[0].values;
        if (bp.systolic >= 160 || bp.diastolic >= 100) {
          alerts.push({
            id: `bp-${patientId}`,
            type: 'high-risk',
            severity: 'high',
            title: 'Critical Blood Pressure',
            message: `Patient ${assignment.patient.firstName} ${assignment.patient.lastName} has critical BP: ${bp.systolic}/${bp.diastolic} mmHg`,
            patientId,
            patientName: `${assignment.patient.firstName} ${assignment.patient.lastName}`,
            vitalType: 'blood-pressure',
            value: `${bp.systolic}/${bp.diastolic}`,
            timestamp: latestBP[0].recordedAt
          });
        }
      }

      if (latestSugar[0]) {
        const sugar = latestSugar[0].values.value;
        if (sugar >= 180) {
          alerts.push({
            id: `sugar-${patientId}`,
            type: 'high-risk',
            severity: 'high',
            title: 'Critical Blood Sugar',
            message: `Patient ${assignment.patient.firstName} ${assignment.patient.lastName} has critical blood sugar: ${sugar} mg/dL`,
            patientId,
            patientName: `${assignment.patient.firstName} ${assignment.patient.lastName}`,
            vitalType: 'blood-sugar',
            value: `${sugar} mg/dL`,
            timestamp: latestSugar[0].recordedAt
          });
        }
      }

      // Check for urgent symptoms
      const urgentSymptoms = await Symptom.find({
        userId: patientId,
        $or: [
          { severity: { $gte: 8 } },
          { isUrgent: true },
          { status: 'worsening' }
        ]
      }).limit(5);

      for (const symptom of urgentSymptoms) {
        alerts.push({
          id: `symptom-${symptom._id}`,
          type: 'symptom',
          severity: 'high',
          title: 'Urgent Symptom',
          message: `Patient ${assignment.patient.firstName} ${assignment.patient.lastName} has urgent symptom: ${symptom.name} (Severity: ${symptom.severity}/10)`,
          patientId,
          patientName: `${assignment.patient.firstName} ${assignment.patient.lastName}`,
          symptomName: symptom.name,
          symptomSeverity: symptom.severity,
          timestamp: symptom.onsetDate
        });
      }
    }

    // 3. Appointment Reminders (upcoming in next 24 hours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const upcomingAppointments = await Appointment.find({
      userId: { $in: patientIds },
      appointmentDate: { $gte: new Date(), $lte: tomorrow },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .populate('userId', 'firstName lastName')
    .sort({ appointmentDate: 1 });

    for (const apt of upcomingAppointments) {
      const hoursUntil = Math.round((apt.appointmentDate - new Date()) / (1000 * 60 * 60));
      alerts.push({
        id: `appt-${apt._id}`,
        type: 'appointment',
        severity: hoursUntil <= 2 ? 'high' : 'medium',
        title: 'Upcoming Appointment',
        message: `Appointment with ${apt.userId.firstName} ${apt.userId.lastName} in ${hoursUntil} hour(s)`,
        patientId: apt.userId._id,
        patientName: `${apt.userId.firstName} ${apt.userId.lastName}`,
        appointmentId: apt._id,
        appointmentDate: apt.appointmentDate,
        hoursUntil,
        timestamp: new Date()
      });
    }

    // 4. Critical Nutrition Alerts
    for (const assignment of assignments) {
      const patientId = assignment.patient._id;
      const activePlans = await FoodPlan.find({
        patientId,
        isActive: true
      });

      // Check meal compliance
      const today = new Date().toISOString().split('T')[0];
      const todayMeals = await Meal.find({
        userId: patientId,
        date: today
      });

      if (activePlans.length > 0 && todayMeals.length === 0) {
        alerts.push({
          id: `nutrition-${patientId}-${today}`,
          type: 'nutrition',
          severity: 'medium',
          title: 'No Meals Logged Today',
          message: `Patient ${assignment.patient.firstName} ${assignment.patient.lastName} has not logged any meals today despite having an active diet plan`,
          patientId,
          patientName: `${assignment.patient.firstName} ${assignment.patient.lastName}`,
          timestamp: new Date()
        });
      }
    }

    // Sort by severity and timestamp
    const severityOrder = { high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => {
      const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json({
      success: true,
      data: {
        alerts,
        summary: {
          total: alerts.length,
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length,
          byType: {
            'non-compliance': alerts.filter(a => a.type === 'non-compliance').length,
            'high-risk': alerts.filter(a => a.type === 'high-risk').length,
            'appointment': alerts.filter(a => a.type === 'appointment').length,
            'nutrition': alerts.filter(a => a.type === 'nutrition').length,
            'symptom': alerts.filter(a => a.type === 'symptom').length
          }
        }
      }
    });
  } catch (error) {
    console.error('Get doctor alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * POST /api/doctor/alerts/:alertId/resolve
 * Mark an alert as resolved
 */
const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolutionNotes } = req.body;

    // Try to resolve as compliance log first
    const complianceLog = await ComplianceLog.findById(alertId);
    if (complianceLog) {
      complianceLog.resolved = true;
      complianceLog.resolvedAt = new Date();
      complianceLog.resolvedBy = req.user._id;
      if (resolutionNotes) {
        complianceLog.resolutionNotes = resolutionNotes;
      }
      await complianceLog.save();

      return res.json({
        success: true,
        message: 'Alert resolved successfully',
        data: complianceLog
      });
    }

    // For other alert types, we can create a resolution record
    res.json({
      success: true,
      message: 'Alert marked as resolved',
      data: { alertId }
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDoctorAlerts,
  resolveAlert
};

