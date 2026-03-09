/**
 * Symptom Risk Modeling Controller
 * Implements AI-based symptom risk prediction and severity analysis
 */

const Symptom = require('../models/Symptom');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');

/**
 * Risk prediction using rule-based and ML-inspired logic
 */
const predictSymptomRisk = (symptomData, userProfile) => {
  let riskScore = 0;
  let riskFactors = [];
  
  // Severity-based scoring (0-40 points)
  const severityScore = (symptomData.severity / 10) * 40;
  riskScore += severityScore;
  if (symptomData.severity >= 8) {
    riskFactors.push('High severity level');
  }
  
  // Duration-based scoring (0-20 points)
  if (symptomData.duration) {
    const durationHours = symptomData.duration / 60;
    if (durationHours > 72) {
      riskScore += 20;
      riskFactors.push('Prolonged duration (>3 days)');
    } else if (durationHours > 24) {
      riskScore += 15;
      riskFactors.push('Extended duration (>1 day)');
    } else if (durationHours > 6) {
      riskScore += 10;
    }
  }
  
  // Frequency-based scoring (0-15 points)
  const frequencyScores = {
    'constant': 15,
    'frequent': 12,
    'occasional': 7,
    'once': 3
  };
  riskScore += frequencyScores[symptomData.frequency] || 0;
  if (symptomData.frequency === 'constant' || symptomData.frequency === 'frequent') {
    riskFactors.push(`${symptomData.frequency.charAt(0).toUpperCase() + symptomData.frequency.slice(1)} occurrence`);
  }
  
  // Category-based risk (0-15 points)
  const highRiskCategories = {
    'cardiovascular': 15,
    'respiratory': 12,
    'neurological': 12,
    'pain': 10,
    'fever': 10
  };
  riskScore += highRiskCategories[symptomData.category] || 5;
  if (highRiskCategories[symptomData.category] >= 12) {
    riskFactors.push(`High-risk category: ${symptomData.category}`);
  }
  
  // User health profile risk factors (0-10 points)
  if (userProfile.medicalConditions && userProfile.medicalConditions.length > 0) {
    const criticalConditions = ['diabetes', 'heart-disease', 'high-blood-pressure', 'kidney-disease'];
    const hasCritical = userProfile.medicalConditions.some(c => criticalConditions.includes(c));
    if (hasCritical) {
      riskScore += 10;
      riskFactors.push('Pre-existing critical conditions');
    } else {
      riskScore += 5;
    }
  }
  
  // Determine risk level
  let riskLevel = 'LOW';
  let recommendation = '';
  let urgency = 'routine';
  
  if (riskScore >= 70) {
    riskLevel = 'HIGH';
    urgency = 'immediate';
    recommendation = 'Seek immediate medical attention. This symptom pattern indicates high risk.';
  } else if (riskScore >= 45) {
    riskLevel = 'MEDIUM';
    urgency = 'soon';
    recommendation = 'Schedule a doctor consultation within 24-48 hours. Monitor symptoms closely.';
  } else {
    riskLevel = 'LOW';
    urgency = 'routine';
    recommendation = 'Monitor symptoms. Consult a doctor if symptoms persist or worsen.';
  }
  
  return {
    riskLevel,
    riskScore: Math.round(riskScore),
    urgency,
    recommendation,
    riskFactors,
    confidence: riskScore >= 70 ? 'high' : riskScore >= 45 ? 'medium' : 'low'
  };
};

/**
 * Analyze symptom patterns and trends
 */
const analyzeSymptomPatterns = async (userId) => {
  try {
    const symptoms = await Symptom.find({ userId }).sort({ onsetDate: -1 }).limit(30);
    
    if (symptoms.length === 0) {
      return {
        hasPatterns: false,
        message: 'No symptom history available'
      };
    }
    
    // Analyze frequency by category
    const categoryFrequency = {};
    symptoms.forEach(s => {
      categoryFrequency[s.category] = (categoryFrequency[s.category] || 0) + 1;
    });
    
    // Find recurring symptoms
    const symptomNames = {};
    symptoms.forEach(s => {
      symptomNames[s.name] = (symptomNames[s.name] || 0) + 1;
    });
    
    const recurringSymptoms = Object.entries(symptomNames)
      .filter(([_, count]) => count >= 3)
      .map(([name, count]) => ({ name, count }));
    
    // Calculate average severity
    const avgSeverity = symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length;
    
    // Identify worsening trends
    const recentSymptoms = symptoms.slice(0, 5);
    const olderSymptoms = symptoms.slice(5, 10);
    const recentAvgSeverity = recentSymptoms.reduce((sum, s) => sum + s.severity, 0) / recentSymptoms.length;
    const olderAvgSeverity = olderSymptoms.length > 0 
      ? olderSymptoms.reduce((sum, s) => sum + s.severity, 0) / olderSymptoms.length 
      : recentAvgSeverity;
    
    const trend = recentAvgSeverity > olderAvgSeverity + 1 ? 'worsening' : 
                  recentAvgSeverity < olderAvgSeverity - 1 ? 'improving' : 'stable';
    
    return {
      hasPatterns: true,
      totalSymptoms: symptoms.length,
      categoryFrequency,
      recurringSymptoms,
      averageSeverity: avgSeverity.toFixed(1),
      trend,
      recentAvgSeverity: recentAvgSeverity.toFixed(1),
      insights: generateInsights(categoryFrequency, recurringSymptoms, trend, avgSeverity)
    };
  } catch (error) {
    console.error('Error analyzing symptom patterns:', error);
    throw error;
  }
};

/**
 * Generate actionable insights from symptom patterns
 */
const generateInsights = (categoryFrequency, recurringSymptoms, trend, avgSeverity) => {
  const insights = [];
  
  // Category insights
  const topCategory = Object.entries(categoryFrequency)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topCategory && topCategory[1] >= 3) {
    insights.push({
      type: 'pattern',
      severity: 'medium',
      message: `Frequent ${topCategory[0]} symptoms detected (${topCategory[1]} occurrences). Consider specialist consultation.`
    });
  }
  
  // Recurring symptoms
  if (recurringSymptoms.length > 0) {
    insights.push({
      type: 'recurring',
      severity: 'high',
      message: `Recurring symptoms identified: ${recurringSymptoms.map(s => s.name).join(', ')}. Requires medical evaluation.`
    });
  }
  
  // Trend insights
  if (trend === 'worsening') {
    insights.push({
      type: 'trend',
      severity: 'high',
      message: 'Symptom severity is worsening over time. Immediate medical consultation recommended.'
    });
  } else if (trend === 'improving') {
    insights.push({
      type: 'trend',
      severity: 'low',
      message: 'Symptoms are improving. Continue current treatment and monitoring.'
    });
  }
  
  // Severity insights
  if (avgSeverity >= 7) {
    insights.push({
      type: 'severity',
      severity: 'high',
      message: 'High average symptom severity. Comprehensive medical evaluation needed.'
    });
  }
  
  return insights;
};

/**
 * Create symptom with risk assessment
 */
exports.createSymptomWithRisk = async (req, res) => {
  try {
    const userId = req.user._id;
    const symptomData = req.body;
    
    // Get user profile for risk assessment
    const user = await User.findById(userId);
    const userProfile = {
      medicalConditions: user.surveyData?.medicalConditions || [],
      allergies: user.surveyData?.allergies || [],
      age: user.age || 30
    };
    
    // Predict risk
    const riskAssessment = predictSymptomRisk(symptomData, userProfile);
    
    // Create symptom with risk data
    const symptom = new Symptom({
      ...symptomData,
      userId,
      isUrgent: riskAssessment.urgency === 'immediate'
    });
    
    await symptom.save();
    
    res.status(201).json({
      success: true,
      data: symptom,
      riskAssessment
    });
  } catch (error) {
    console.error('Error creating symptom:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create symptom',
      error: error.message
    });
  }
};

/**
 * Get symptom risk dashboard
 */
exports.getSymptomRiskDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get active symptoms
    const activeSymptoms = await Symptom.getActiveSymptoms(userId);
    
    // Get urgent symptoms
    const urgentSymptoms = await Symptom.getUrgentSymptoms(userId);
    
    // Analyze patterns
    const patterns = await analyzeSymptomPatterns(userId);
    
    // Get user profile
    const user = await User.findById(userId);
    const userProfile = {
      medicalConditions: user.surveyData?.medicalConditions || [],
      allergies: user.surveyData?.allergies || [],
      age: user.age || 30
    };
    
    // Calculate risk for each active symptom
    const symptomsWithRisk = activeSymptoms.map(symptom => {
      const risk = predictSymptomRisk(symptom.toObject(), userProfile);
      return {
        ...symptom.toObject(),
        riskAssessment: risk
      };
    });
    
    res.json({
      success: true,
      data: {
        activeSymptoms: symptomsWithRisk,
        urgentSymptoms,
        patterns,
        summary: {
          totalActive: activeSymptoms.length,
          totalUrgent: urgentSymptoms.length,
          highRiskCount: symptomsWithRisk.filter(s => s.riskAssessment.riskLevel === 'HIGH').length,
          mediumRiskCount: symptomsWithRisk.filter(s => s.riskAssessment.riskLevel === 'MEDIUM').length
        }
      }
    });
  } catch (error) {
    console.error('Error getting symptom risk dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get symptom risk dashboard',
      error: error.message
    });
  }
};

/**
 * Analyze single symptom risk
 */
exports.analyzeSymptomRisk = async (req, res) => {
  try {
    const { symptomId } = req.params;
    const userId = req.user._id;
    
    const symptom = await Symptom.findOne({ _id: symptomId, userId });
    
    if (!symptom) {
      return res.status(404).json({
        success: false,
        message: 'Symptom not found'
      });
    }
    
    const user = await User.findById(userId);
    const userProfile = {
      medicalConditions: user.surveyData?.medicalConditions || [],
      allergies: user.surveyData?.allergies || [],
      age: user.age || 30
    };
    
    const riskAssessment = predictSymptomRisk(symptom.toObject(), userProfile);
    
    res.json({
      success: true,
      data: {
        symptom,
        riskAssessment
      }
    });
  } catch (error) {
    console.error('Error analyzing symptom risk:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze symptom risk',
      error: error.message
    });
  }
};

module.exports = exports;
