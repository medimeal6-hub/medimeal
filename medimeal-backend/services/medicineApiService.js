/**
 * Medicine API Service
 * Integrates with live medicine databases for real-time drug information
 * Uses OpenFDA Drug API and RxNorm API for drug data
 */

const axios = require('axios');

// Cache for API responses to reduce API calls
const medicineCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Search for medicines using OpenFDA Drug API
 * @param {string} searchTerm - Medicine name or indication
 * @returns {Promise<Array>} Array of medicine information
 */
async function searchMedicinesOpenFDA(searchTerm) {
  try {
    const cacheKey = `openfda_${searchTerm.toLowerCase()}`;
    const cached = medicineCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // OpenFDA Drug Label API - Search by indication or drug name
    const response = await axios.get('https://api.fda.gov/drug/label.json', {
      params: {
        search: `openfda.generic_name:${searchTerm} OR openfda.brand_name:${searchTerm} OR indications_and_usage:${searchTerm}`,
        limit: 10
      },
      timeout: 10000
    });

    const medicines = (response.data.results || []).map(item => ({
      name: item.openfda?.generic_name?.[0] || item.openfda?.brand_name?.[0] || 'Unknown',
      brandName: item.openfda?.brand_name?.[0] || null,
      indication: item.indications_and_usage?.[0] || item.purpose?.[0] || 'N/A',
      dosage: item.dosage_and_administration?.[0] || 'Consult physician',
      contraindications: item.contraindications?.[0]?.split('\n').filter(c => c.trim()) || [],
      warnings: item.warnings?.[0]?.split('\n').filter(w => w.trim()) || [],
      source: 'openfda'
    }));

    medicineCache.set(cacheKey, { data: medicines, timestamp: Date.now() });
    return medicines;
  } catch (error) {
    console.error('OpenFDA API error:', error.message);
    return [];
  }
}

/**
 * Search for medicines using RxNorm API (alternative source)
 * @param {string} searchTerm - Medicine name
 * @returns {Promise<Array>} Array of medicine information
 */
async function searchMedicinesRxNorm(searchTerm) {
  try {
    const cacheKey = `rxnorm_${searchTerm.toLowerCase()}`;
    const cached = medicineCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    // RxNorm API - Search by drug name
    const response = await axios.get('https://rxnav.nlm.nih.gov/REST/drugs.json', {
      params: {
        name: searchTerm
      },
      timeout: 10000
    });

    const medicines = [];
    if (response.data?.drugGroup?.conceptGroup) {
      for (const group of response.data.drugGroup.conceptGroup) {
        if (group.conceptProperties) {
          for (const concept of group.conceptProperties) {
            medicines.push({
              name: concept.name,
              rxcui: concept.rxcui,
              source: 'rxnorm'
            });
          }
        }
      }
    }

    medicineCache.set(cacheKey, { data: medicines, timestamp: Date.now() });
    return medicines;
  } catch (error) {
    console.error('RxNorm API error:', error.message);
    return [];
  }
}

/**
 * Get drug interactions for a medicine
 * @param {string} drugName - Medicine name
 * @param {Array<string>} currentMedicines - List of current medicines
 * @returns {Promise<Array>} Array of interaction warnings
 */
async function checkDrugInteractions(drugName, currentMedicines = []) {
  const interactions = [];
  
  if (currentMedicines.length === 0) {
    return interactions;
  }

  try {
    // Simple interaction checking based on known interactions
    // In production, use a dedicated drug interaction API
    const knownInteractions = {
      'warfarin': ['aspirin', 'ibuprofen', 'acetaminophen'],
      'metformin': ['alcohol', 'insulin'],
      'aspirin': ['warfarin', 'ibuprofen', 'alcohol'],
      'insulin': ['metformin', 'alcohol']
    };

    const drugLower = drugName.toLowerCase();
    for (const [drug, interactants] of Object.entries(knownInteractions)) {
      if (drugLower.includes(drug) || drug.includes(drugLower)) {
        for (const currentMed of currentMedicines) {
          const currentLower = currentMed.toLowerCase();
          if (interactants.some(i => currentLower.includes(i))) {
            interactions.push(`Potential interaction between ${drugName} and ${currentMed}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Interaction check error:', error.message);
  }

  return interactions;
}

/**
 * Filter medicines based on patient criteria
 * @param {Array} medicines - List of medicines
 * @param {Object} patientInfo - Patient information (age, gender, allergies, currentMedicines)
 * @returns {Promise<Array>} Filtered medicines with safety checks
 */
async function filterMedicinesByPatient(medicines, patientInfo) {
  const filtered = [];

  for (const medicine of medicines) {
    const warnings = [];
    
    // Age restrictions (example)
    if (patientInfo.age < 18) {
      warnings.push('Pediatric dosing may be required');
    }
    if (patientInfo.age > 65) {
      warnings.push('Elderly patients may require dose adjustment');
    }

    // Allergy checks
    if (patientInfo.allergies && patientInfo.allergies.length > 0) {
      const medicineLower = medicine.name.toLowerCase();
      const allergiesLower = patientInfo.allergies.map(a => a.toLowerCase());
      
      if (allergiesLower.some(allergy => medicineLower.includes(allergy))) {
        warnings.push(`Warning: Patient has known allergy - ${patientInfo.allergies.find(a => medicineLower.includes(a.toLowerCase()))}`);
        continue; // Skip this medicine
      }
    }

    // Drug interaction checks
    if (patientInfo.currentMedicines && patientInfo.currentMedicines.length > 0) {
      const interactions = await checkDrugInteractions(medicine.name, patientInfo.currentMedicines);
      warnings.push(...interactions);
    }

    filtered.push({
      ...medicine,
      warnings,
      safeForPatient: warnings.length === 0 || warnings.every(w => !w.toLowerCase().includes('allergy') && !w.toLowerCase().includes('contraindicated'))
    });
  }

  return filtered.filter(m => m.safeForPatient !== false);
}

/**
 * Search medicines for given symptoms/conditions
 * @param {string} symptoms - Patient symptoms or conditions
 * @param {Object} patientInfo - Patient information
 * @returns {Promise<Array>} Filtered medicine suggestions
 */
async function searchMedicinesForSymptoms(symptoms, patientInfo) {
  // Extract key terms from symptoms
  const symptomTerms = symptoms.toLowerCase().split(/[,\s]+/).filter(term => term.length > 2);
  
  // Common symptom-to-medicine mappings (fallback if API fails)
  const symptomMedicineMap = {
    'fever': ['acetaminophen', 'ibuprofen', 'paracetamol'],
    'headache': ['acetaminophen', 'ibuprofen', 'aspirin'],
    'cough': ['dextromethorphan', 'guaifenesin', 'codeine'],
    'pain': ['acetaminophen', 'ibuprofen', 'naproxen'],
    'hypertension': ['lisinopril', 'amlodipine', 'metoprolol'],
    'diabetes': ['metformin', 'insulin', 'glipizide'],
    'infection': ['amoxicillin', 'azithromycin', 'ciprofloxacin'],
    'asthma': ['albuterol', 'salbutamol', 'prednisone']
  };

  let allMedicines = [];

  // Try OpenFDA API first
  for (const term of symptomTerms) {
    const medicines = await searchMedicinesOpenFDA(term);
    allMedicines.push(...medicines);
  }

  // Fallback to symptom mapping if API fails
  if (allMedicines.length === 0) {
    for (const term of symptomTerms) {
      for (const [symptom, meds] of Object.entries(symptomMedicineMap)) {
        if (term.includes(symptom) || symptom.includes(term)) {
          for (const med of meds) {
            const fallbackMed = await searchMedicinesOpenFDA(med);
            allMedicines.push(...fallbackMed);
          }
        }
      }
    }
  }

  // Remove duplicates
  const uniqueMedicines = [];
  const seen = new Set();
  for (const med of allMedicines) {
    const key = med.name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMedicines.push(med);
    }
  }

  // Filter by patient criteria
  const filtered = await filterMedicinesByPatient(uniqueMedicines, patientInfo);

  return filtered.slice(0, 10); // Limit to top 10 suggestions
}

module.exports = {
  searchMedicinesOpenFDA,
  searchMedicinesRxNorm,
  checkDrugInteractions,
  filterMedicinesByPatient,
  searchMedicinesForSymptoms
};
