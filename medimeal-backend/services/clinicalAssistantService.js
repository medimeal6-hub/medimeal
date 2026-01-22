/**
 * Clinical AI Assistant Service
 * Provides AI-powered clinical analysis and medicine recommendations
 */

const { searchMedicinesForSymptoms } = require('./medicineApiService');
const AuditLog = require('../models/AuditLog');

/**
 * Normalize symptoms and conditions
 * @param {string} symptoms - Raw symptom text
 * @returns {Array<string>} Normalized symptom list
 */
function normalizeSymptoms(symptoms) {
  if (!symptoms) return [];
  
  const normalized = symptoms
    .toLowerCase()
    .split(/[,\n\r]+/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
  
  return normalized;
}

/**
 * Identify possible disease categories based on symptoms
 * @param {Array<string>} symptoms - Normalized symptoms
 * @returns {Array<Object>} Possible disease categories with confidence
 */
function identifyDiseaseCategories(symptoms) {
  const diseaseMap = {
    'fever': { name: 'Infectious Disease', description: 'Possible viral or bacterial infection', confidence: 'Medium' },
    'headache': { name: 'Neurological Disorder', description: 'Headache may indicate migraine, tension, or other neurological conditions', confidence: 'Low' },
    'cough': { name: 'Respiratory Condition', description: 'Possible upper respiratory infection, bronchitis, or pneumonia', confidence: 'Medium' },
    'hypertension': { name: 'Cardiovascular Disease', description: 'High blood pressure condition', confidence: 'High' },
    'diabetes': { name: 'Metabolic Disorder', description: 'Diabetes mellitus - blood sugar regulation disorder', confidence: 'High' },
    'pain': { name: 'Pain Management', description: 'General pain condition requiring analgesic treatment', confidence: 'Low' },
    'infection': { name: 'Infectious Disease', description: 'Bacterial or viral infection', confidence: 'Medium' },
    'asthma': { name: 'Respiratory Disease', description: 'Chronic respiratory condition', confidence: 'High' }
  };

  const diseases = [];
  const seen = new Set();

  for (const symptom of symptoms) {
    for (const [key, disease] of Object.entries(diseaseMap)) {
      if (symptom.includes(key) || key.includes(symptom)) {
        const diseaseKey = disease.name;
        if (!seen.has(diseaseKey)) {
          seen.add(diseaseKey);
          diseases.push({ ...disease });
        }
      }
    }
  }

  // If no specific matches, add general category
  if (diseases.length === 0) {
    diseases.push({
      name: 'General Condition',
      description: 'Requires further clinical evaluation',
      confidence: 'Low'
    });
  }

  return diseases;
}

/**
 * Generate safety alerts based on patient information
 * @param {Object} patientInfo - Patient information
 * @returns {Array<Object>} Safety alerts
 */
function generateSafetyAlerts(patientInfo) {
  const alerts = [];

  // Age-based alerts
  if (patientInfo.age < 18) {
    alerts.push({
      type: 'Age Warning',
      message: 'Pediatric patient - special dosing considerations required'
    });
  }
  if (patientInfo.age > 65) {
    alerts.push({
      type: 'Age Warning',
      message: 'Elderly patient - may require dose adjustment and monitoring'
    });
  }

  // Allergy alerts
  if (patientInfo.allergies && patientInfo.allergies.length > 0) {
    alerts.push({
      type: 'Allergy Alert',
      message: `Patient has known allergies: ${patientInfo.allergies.join(', ')}. Verify all medications are safe.`
    });
  }

  // Medication interaction alerts
  if (patientInfo.currentMedicines && patientInfo.currentMedicines.length > 0) {
    alerts.push({
      type: 'Interaction Warning',
      message: `Patient is currently taking medications. Check for potential drug interactions.`
    });
  }

  // Existing conditions alerts
  if (patientInfo.existingConditions && patientInfo.existingConditions.length > 0) {
    alerts.push({
      type: 'Comorbidity Alert',
      message: `Patient has existing conditions: ${patientInfo.existingConditions.join(', ')}. Consider comorbidities in treatment plan.`
    });
  }

  return alerts;
}

/**
 * Perform clinical analysis
 * @param {Object} inputData - Patient input data
 * @returns {Promise<Object>} Analysis results
 */
async function performClinicalAnalysis(inputData) {
  try {
    // Normalize symptoms
    const symptoms = normalizeSymptoms(inputData.symptoms);
    const existingConditions = normalizeSymptoms(inputData.existingConditions || '');
    const allergies = normalizeSymptoms(inputData.allergies || '');
    const currentMedicines = normalizeSymptoms(inputData.currentMedicines || '');

    // Identify disease categories
    const allSymptoms = [...symptoms, ...existingConditions];
    const clinicalAnalysis = {
      possibleDiseases: identifyDiseaseCategories(allSymptoms)
    };

    // Prepare patient info for medicine search
    const patientInfo = {
      age: parseInt(inputData.age),
      gender: inputData.gender,
      symptoms: allSymptoms,
      allergies: allergies,
      currentMedicines: currentMedicines,
      existingConditions: existingConditions
    };

    // Search for medicines using live APIs
    const medicineSuggestions = await searchMedicinesForSymptoms(
      inputData.symptoms,
      patientInfo
    );

    // Format medicine suggestions
    const formattedMedicines = medicineSuggestions.map(med => ({
      name: med.name,
      brandName: med.brandName,
      purpose: med.indication || 'See indications',
      indication: med.indication,
      dosage: med.dosage || 'Consult physician for dosage',
      contraindications: med.contraindications || [],
      interactions: med.warnings || []
    }));

    // Generate safety alerts
    const safetyAlerts = generateSafetyAlerts(patientInfo);

    return {
      clinicalAnalysis,
      medicineSuggestions: formattedMedicines,
      safetyAlerts
    };
  } catch (error) {
    console.error('Clinical analysis error:', error);
    throw new Error('Failed to perform clinical analysis: ' + error.message);
  }
}

/**
 * Log clinical assistant usage
 * @param {Object} logData - Log data (doctorId, input, output, decision)
 */
async function logClinicalAssistantUsage(logData) {
  try {
    await AuditLog.create({
      userId: logData.doctorId,
      module: 'clinical_assistant',
      action: logData.decision ? 'medicine_assigned' : 'clinical_assistant_analysis',
      ipAddress: logData.ipAddress || 'unknown',
      metadata: {
        method: 'POST',
        path: '/api/doctor/clinical-assistant/' + (logData.decision ? 'assign-medicine' : 'analyze'),
        query: {},
        bodyPreview: {
          sessionId: logData.sessionId || 'unknown',
          input: logData.input ? {
            hasGender: !!logData.input.gender,
            hasAge: !!logData.input.age,
            hasSymptoms: !!logData.input.symptoms,
            symptomsCount: logData.input.symptoms ? logData.input.symptoms.split(',').length : 0
          } : {},
          decision: logData.decision || 'pending',
          medicineName: logData.output?.selectedMedicine?.name || null
        }
      },
      severity: logData.decision === 'approved' ? 'high' : 'medium'
    });
  } catch (error) {
    console.error('Failed to log clinical assistant usage:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

module.exports = {
  performClinicalAnalysis,
  logClinicalAssistantUsage,
  normalizeSymptoms,
  identifyDiseaseCategories,
  generateSafetyAlerts
};
