const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const Symptom = require('../models/Symptom');
const FoodPlan = require('../models/FoodPlan');
const ComplianceLog = require('../models/ComplianceLog');
const Appointment = require('../models/Appointment');
const PatientAssignment = require('../models/PatientAssignment');
const FoodDrugConflict = require('../models/FoodDrugConflict');
const Food = require('../models/Food');
const FoodDiary = require('../models/FoodDiary');

/**
 * GET /api/doctor/clinical-insights/:patientId
 * Get AI-powered clinical insights and decision support for a patient
 * Returns structured medical intelligence (NOT raw data or timelines)
 */
const getClinicalInsights = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user._id;

    // Allow any doctor to view insights (as per user request - all doctors can view all appointments)
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Calculate patient age
    let patientAge = 'N/A';
    if (patient.dateOfBirth) {
      try {
        const birthDate = new Date(patient.dateOfBirth);
        if (!isNaN(birthDate.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          patientAge = age > 0 ? age : 'N/A';
        }
      } catch (e) {
        // Age calculation failed, keep as N/A
      }
    }

    // A) Patient Health Summary
    const chronicConditions = patient.medicalConditions || [];
    let overallRisk = 'Low';
    
    if (chronicConditions.length >= 3 || (patientAge !== 'N/A' && patientAge > 65)) {
      overallRisk = 'High';
    } else if (chronicConditions.length >= 1 || (patientAge !== 'N/A' && patientAge > 50)) {
      overallRisk = 'Moderate';
    }

    const patientSummary = {
      age: patientAge,
      gender: patient.gender || 'N/A',
      chronicConditions: chronicConditions,
      overallRisk: overallRisk
    };

    // B) AI Health Pattern Detection
    const healthPatterns = [];
    
    // Get data for pattern detection
    const appointments = await Appointment.find({ userId: patientId }).sort({ createdAt: -1 }).limit(50);
    const symptoms = await Symptom.find({ userId: patientId }).sort({ onsetDate: -1 }).limit(50);
    const complianceLogs = await ComplianceLog.find({ userId: patientId }).sort({ createdAt: -1 }).limit(100);
    
    // Pattern 1: Repeated symptoms
    const symptomCounts = {};
    symptoms.forEach(s => {
      const name = s.name?.toLowerCase() || '';
      symptomCounts[name] = (symptomCounts[name] || 0) + 1;
    });
    for (const [symptomName, count] of Object.entries(symptomCounts)) {
      if (count >= 3) {
        healthPatterns.push({
          type: 'Repeated Symptoms',
          description: `Symptom "${symptomName}" has been reported ${count} time(s), indicating a recurring pattern`,
          severity: count >= 5 ? 'High' : 'Medium',
          occurrences: count
        });
      }
    }
    
    // Pattern 2: Diet non-compliance patterns
    const nonComplianceCount = complianceLogs.filter(log => log.category === 'diet-plan' && log.severity === 'high').length;
    if (nonComplianceCount >= 5) {
      healthPatterns.push({
        type: 'Diet Non-Compliance Pattern',
        description: `Patient has ${nonComplianceCount} high-severity diet plan violations, indicating consistent non-compliance`,
        severity: nonComplianceCount >= 10 ? 'High' : 'Medium',
        occurrences: nonComplianceCount
      });
    }
    
    // Pattern 3: Recurring medical complaints
    const complaintTypes = {};
    appointments.forEach(apt => {
      const reason = apt.reasonForVisit?.toLowerCase() || '';
      if (reason) {
        complaintTypes[reason] = (complaintTypes[reason] || 0) + 1;
      }
    });
    for (const [complaint, count] of Object.entries(complaintTypes)) {
      if (count >= 3) {
        healthPatterns.push({
          type: 'Recurring Medical Complaints',
          description: `Complaint "${complaint}" mentioned in ${count} appointment(s), suggesting ongoing issue`,
          severity: 'Medium',
          occurrences: count
        });
      }
    }

    // Pattern 4: Missed medications correlation
    const missedMedLogsCount = complianceLogs.filter(log => 
      log.message?.toLowerCase().includes('missed') || 
      log.message?.toLowerCase().includes('not taken')
    ).length;
    if (missedMedLogsCount >= 5) {
      healthPatterns.push({
        type: 'Medication Compliance Pattern',
        description: `Patient has ${missedMedLogsCount} missed medication events, indicating poor medication adherence`,
        severity: missedMedLogsCount >= 10 ? 'High' : 'Medium',
        occurrences: missedMedLogsCount
      });
    }

    // C) Clinical Risk Alerts
    const clinicalRisks = [];
    
    // Get patient medications (used in multiple sections)
    const patientMedications = (patient.medications || []).map(m => m.name);
    
    // Risk 1: Age + Disease risks
    if (patientAge !== 'N/A') {
      if (patientAge > 65 && chronicConditions.length > 0) {
        clinicalRisks.push({
          title: 'Elderly Patient with Chronic Conditions',
          description: `Patient age ${patientAge} with ${chronicConditions.length} chronic condition(s) increases risk for complications`,
          severity: chronicConditions.length >= 3 ? 'Red' : 'Yellow',
          factors: [`Age: ${patientAge} years`, `Conditions: ${chronicConditions.join(', ')}`]
        });
      }
      if (patientAge < 18 && chronicConditions.length > 0) {
        clinicalRisks.push({
          title: 'Pediatric Patient with Chronic Conditions',
          description: `Young patient with existing conditions requires specialized care and monitoring`,
          severity: 'Yellow',
          factors: [`Age: ${patientAge} years`, `Conditions: ${chronicConditions.join(', ')}`]
        });
      }
    }
    
    // Risk 2: Disease + Medicine risks
    if (chronicConditions.length > 0 && patientMedications.length > 0) {
      clinicalRisks.push({
        title: 'Disease-Medication Complexity',
        description: `Patient has ${chronicConditions.length} chronic condition(s) and is taking ${patientMedications.length} medication(s). Requires careful monitoring for interactions`,
        severity: patientMedications.length >= 5 ? 'Red' : 'Yellow',
        factors: [`Conditions: ${chronicConditions.join(', ')}`, `Medications: ${patientMedications.join(', ')}`]
      });
    }

    // Risk 3: Red-flag medical conditions
    const redFlagConditions = ['diabetes', 'hypertension', 'heart disease', 'kidney disease', 'liver disease'];
    const hasRedFlag = chronicConditions.some(cond => 
      redFlagConditions.some(flag => cond.toLowerCase().includes(flag))
    );
    if (hasRedFlag) {
      clinicalRisks.push({
        title: 'High-Risk Medical Condition Detected',
        description: `Patient has one or more high-risk conditions requiring specialized management and monitoring`,
        severity: 'Red',
        factors: chronicConditions.filter(cond => 
          redFlagConditions.some(flag => cond.toLowerCase().includes(flag))
        )
      });
    }

    // D) Medication Safety Insights
    const medicationSafety = [];
    
    const patientMedicationsLower = patientMedications.map(m => m.toLowerCase());
    
    // Drug-drug interactions
    if (patientMedications.length > 1) {
      const knownInteractions = {
        'warfarin': ['aspirin', 'ibuprofen'],
        'aspirin': ['warfarin', 'ibuprofen'],
        'metformin': ['insulin', 'alcohol']
      };
      
      for (let i = 0; i < patientMedicationsLower.length; i++) {
        for (let j = i + 1; j < patientMedicationsLower.length; j++) {
          const med1 = patientMedicationsLower[i];
          const med2 = patientMedicationsLower[j];
          
          if (knownInteractions[med1]?.some(m => med2.includes(m)) || 
              knownInteractions[med2]?.some(m => med1.includes(m))) {
            medicationSafety.push({
              type: 'interaction',
              title: 'Drug-Drug Interaction Warning',
              description: `Potential interaction between ${patientMedications[i]} and ${patientMedications[j]}`,
              medications: [patientMedications[i], patientMedications[j]],
              recommendation: 'Review medication combination and consider alternative or adjusted dosing'
            });
          }
        }
      }
    }
    
    // Allergy conflicts
    const allergies = (patient.allergies || []).map(a => a.toLowerCase());
    patientMedications.forEach(med => {
      const medLower = med.toLowerCase();
      allergies.forEach(allergy => {
        if (medLower.includes(allergy) || allergy.includes(medLower)) {
          medicationSafety.push({
            type: 'allergy',
            title: 'Medication Allergy Conflict',
            description: `Patient has known allergy to ${allergy} and medication ${med} may contain this allergen`,
            medications: [med],
            recommendation: 'DO NOT PRESCRIBE - Patient has allergy to this medication or its components'
          });
        }
      });
    });
    
    // Age/gender considerations
    if (patientAge !== 'N/A') {
      if (patientAge > 65 && patientMedications.length > 0) {
        medicationSafety.push({
          type: 'warning',
          title: 'Elderly Patient Medication Warning',
          description: `Patient is ${patientAge} years old. May require dose adjustments for age-related metabolism changes`,
          medications: patientMedications,
          recommendation: 'Consider lower starting doses and monitor for adverse effects'
        });
      }
      if (patientAge < 18 && patientMedications.length > 0) {
        medicationSafety.push({
          type: 'warning',
          title: 'Pediatric Medication Warning',
          description: `Pediatric patient (age ${patientAge}). Requires age-appropriate dosing`,
          medications: patientMedications,
          recommendation: 'Use pediatric dosing guidelines and weight-based calculations'
        });
      }
    }

    // Long-term medicine usage risks
    if (patientMedications.length > 0) {
      const longTermMeds = ['metformin', 'warfarin', 'aspirin', 'statins'];
      const hasLongTerm = patientMedicationsLower.some(med => 
        longTermMeds.some(lt => med.includes(lt))
      );
      if (hasLongTerm) {
        medicationSafety.push({
          type: 'warning',
          title: 'Long-Term Medication Usage',
          description: 'Patient is on long-term medication(s). Regular monitoring recommended for side effects',
          medications: patientMedications.filter(med => 
            longTermMeds.some(lt => med.toLowerCase().includes(lt))
          ),
          recommendation: 'Schedule periodic liver/kidney function tests and monitor for long-term effects'
        });
      }
    }

    // E) Diet & Lifestyle Insights
    const activePlans = await FoodPlan.find({
      patientId,
      isActive: true
    });

    // Calculate diet adherence score
    const totalComplianceChecks = complianceLogs.length;
    const compliantChecks = complianceLogs.filter(log => log.severity === 'low' || !log.category).length;
    const adherenceScore = totalComplianceChecks > 0 
      ? Math.round((compliantChecks / totalComplianceChecks) * 100)
      : 100;
    
    // Detect trigger foods
    const triggerFoods = [];
    const foodViolations = complianceLogs
      .filter(log => log.category === 'food-disease' || log.category === 'food-medicine')
      .map(log => log.foodName)
      .filter(Boolean);
    
    const foodCounts = {};
    foodViolations.forEach(food => {
      foodCounts[food] = (foodCounts[food] || 0) + 1;
    });
    
    for (const [food, count] of Object.entries(foodCounts)) {
      if (count >= 2) {
        triggerFoods.push(food);
      }
    }
    
    // Lifestyle risk factors
    const riskFactors = [];
    if (chronicConditions.includes('diabetes') && adherenceScore < 70) {
      riskFactors.push('Poor diet adherence may worsen diabetes control');
    }
    if (patientAge !== 'N/A' && patientAge > 65 && patientMedications.length >= 5) {
      riskFactors.push('Multiple medications in elderly patient increases fall and interaction risk');
    }
    if (complianceLogs.filter(log => log.severity === 'high').length >= 10) {
      riskFactors.push('High number of compliance violations indicates lifestyle management challenges');
    }
    if (patientMedications.length > 0 && missedMedLogsCount >= 5) {
      riskFactors.push('Poor medication adherence may affect treatment outcomes');
    }
    
    const dietLifestyle = {
      adherenceScore: adherenceScore,
      triggerFoods: [...new Set(triggerFoods)],
      riskFactors: riskFactors
    };

    // F) AI Recommendations (Advisory Only)
    const aiRecommendations = [];
    
    if (adherenceScore < 70) {
      aiRecommendations.push({
        category: 'Diet Improvements',
        suggestion: 'Patient shows low diet adherence. Consider simplified meal plans and patient education'
      });
    }
    
    if (chronicConditions.length > 0 && patientMedications.length === 0) {
      aiRecommendations.push({
        category: 'Medication Review',
        suggestion: `Patient has ${chronicConditions.length} chronic condition(s) but no current medications. Review if medication therapy is indicated`
      });
    }
    
    if (healthPatterns.length > 0) {
      aiRecommendations.push({
        category: 'Follow-up Care',
        suggestion: 'Recurring patterns detected. Consider scheduled follow-ups and comprehensive health review'
      });
    }
    
    if (patientAge !== 'N/A' && patientAge > 50) {
      const recentBP = await HealthRecord.getLatestByType(patientId, 'blood-pressure').catch(() => []);
      if (recentBP[0] && (recentBP[0].values.systolic >= 130 || recentBP[0].values.diastolic >= 85)) {
        aiRecommendations.push({
          category: 'Preventive Care',
          suggestion: 'Consider monitoring for early detection of hypertension or diabetes'
        });
      }
    }
    
    if (medicationSafety.length > 0) {
      aiRecommendations.push({
        category: 'Medication Safety',
        suggestion: 'Review medication safety alerts and consider medication reconciliation'
      });
    }

    // Return structured insights
    res.json({
      success: true,
      data: {
        patientSummary,
        healthPatterns,
        clinicalRisks,
        medicationSafety,
        dietLifestyle,
        aiRecommendations
      }
    });
  } catch (error) {
    console.error('Get clinical insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get clinical insights',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET /api/doctor/diet-suitability/:patientId
 * Check diet suitability for patient
 */
const checkDietSuitability = async (req, res) => {
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

    const patient = await User.findById(patientId);
    const activePlans = await FoodPlan.find({
      patientId,
      isActive: true
    }).populate('breakfast.foodId lunch.foodId dinner.foodId snacks.foodId');

    const suitability = {
      overall: 'suitable',
      score: 100,
      warnings: [],
      recommendations: []
    };

    const conditions = (patient.medicalConditions || []).map(c => c.toLowerCase());
    const allergies = (patient.allergies || []).map(a => a.toLowerCase());
    const medications = (patient.medications || []).map(m => m.name.toLowerCase());

    for (const plan of activePlans) {
      const allMeals = [
        ...(plan.breakfast || []),
        ...(plan.lunch || []),
        ...(plan.dinner || []),
        ...(plan.snacks || [])
      ];

      for (const meal of allMeals) {
        const foodName = meal.foodName || '';
        
        // Check allergies
        for (const allergy of allergies) {
          if (foodName.toLowerCase().includes(allergy)) {
            suitability.warnings.push({
              type: 'allergy',
              severity: 'high',
              message: `${foodName} contains ${allergy} which patient is allergic to`,
              foodName,
              allergy
            });
            suitability.score -= 20;
            suitability.overall = 'unsuitable';
          }
        }

        // Check food-drug conflicts
        for (const medName of medications) {
          const conflict = await FoodDrugConflict.checkConflict(medName, foodName).catch(() => null);
          if (conflict) {
            suitability.warnings.push({
              type: 'drug-interaction',
              severity: conflict.severity?.toLowerCase() || 'medium',
              message: `${foodName} interacts with ${medName}`,
              foodName,
              medicineName: medName,
              conflictDetails: conflict.description
            });
            suitability.score -= 15;
            if (suitability.overall === 'suitable') {
              suitability.overall = 'needs-review';
            }
          }
        }

        // Check condition compatibility
        if (conditions.includes('diabetes') || conditions.includes('diabetic')) {
          const food = await Food.findOne({ name: { $regex: foodName, $options: 'i' } });
          if (food && !food.tags?.includes('diabetic-friendly')) {
            suitability.warnings.push({
              type: 'condition-mismatch',
              severity: 'medium',
              message: `${foodName} may not be optimal for diabetic patients`,
              foodName,
              condition: 'diabetes'
            });
            suitability.score -= 10;
          }
        }
      }
    }

    if (suitability.score < 70) {
      suitability.overall = 'unsuitable';
      suitability.recommendations.push('Diet plan needs significant modifications');
    } else if (suitability.score < 85) {
      suitability.overall = 'needs-review';
      suitability.recommendations.push('Review and adjust problematic food items');
    } else {
      suitability.recommendations.push('Diet plan is generally suitable for patient');
    }

    res.json({
      success: true,
      data: suitability
    });
  } catch (error) {
    console.error('Check diet suitability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check diet suitability',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getClinicalInsights,
  checkDietSuitability
};
