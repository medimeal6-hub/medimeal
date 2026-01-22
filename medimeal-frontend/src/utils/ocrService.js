import Tesseract from 'tesseract.js';

/**
 * Process an image file using OCR to extract text
 * @param {File} imageFile - The image file to process
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string>} - Extracted text from the image
 */
export const processImageOCR = async (imageFile, onProgress = null) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageFile,
      'eng',
      {
        logger: onProgress ? (m) => {
          if (m.status === 'recognizing text') {
            onProgress(Math.round(m.progress * 100));
          }
        } : undefined
      }
    );
    
    return text.trim();
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process image with OCR. Please ensure the image is clear and readable.');
  }
};

/**
 * Extract medicine names from OCR text
 * Common patterns: Medicine names are usually capitalized, followed by dosage
 * @param {string} ocrText - Text extracted from OCR
 * @returns {Array<{name: string, dosage: string, frequency: string}>} - Extracted medicines
 */
export const extractMedicines = (ocrText) => {
  const medicines = [];
  
  // Common medicine name patterns (capitalized words, often followed by numbers/dosage)
  // This is a simplified parser - in production, you'd want a more sophisticated NLP approach
  const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Common medicine indicators
  const medicineIndicators = [
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+\d+[mg|mcg|ml|units|IU|%]+/i, // Medicine name followed by dosage
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+tablet/i,
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+capsule/i,
  ];
  
  // Common dosage patterns
  const dosagePattern = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units|IU|%)/gi;
  
  // Common frequency patterns
  const frequencyPatterns = [
    /(?:take|once|twice|thrice|daily|every|times)\s+(?:daily|day|week|hour|meal|morning|evening|night|bedtime)/gi,
    /(?:qd|bid|tid|qid|qod|prn)/gi, // Medical abbreviations
  ];
  
  const extractedNames = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip common non-medicine lines
    if (
      line.toLowerCase().includes('prescription') ||
      line.toLowerCase().includes('doctor') ||
      line.toLowerCase().includes('date') ||
      line.toLowerCase().includes('patient') ||
      line.toLowerCase().includes('signature') ||
      line.length < 3
    ) {
      continue;
    }
    
    // Check if line matches medicine pattern
    for (const pattern of medicineIndicators) {
      if (pattern.test(line)) {
        // Extract medicine name (usually first capitalized words)
        const words = line.split(/\s+/);
        let medicineName = '';
        let dosage = '';
        let frequency = '';
        
        // Find medicine name (capitalized words before numbers)
        for (let j = 0; j < words.length; j++) {
          const word = words[j];
          if (/^\d/.test(word)) {
            // Found a number, likely start of dosage
            dosage = line.substring(line.indexOf(word));
            // Extract just the dosage part
            const dosageMatch = dosage.match(dosagePattern);
            if (dosageMatch) {
              dosage = dosageMatch[0];
            }
            break;
          }
          if (/^[A-Z]/.test(word) || medicineName.length > 0) {
            medicineName += (medicineName ? ' ' : '') + word;
          }
        }
        
        // Look for frequency in current or next line
        const searchText = line + ' ' + (lines[i + 1] || '');
        for (const freqPattern of frequencyPatterns) {
          const freqMatch = searchText.match(freqPattern);
          if (freqMatch) {
            frequency = freqMatch[0];
            break;
          }
        }
        
        // Clean up medicine name
        medicineName = medicineName.trim();
        
        // Validate medicine name (should be at least 3 characters and not just numbers)
        if (medicineName.length >= 3 && !/^\d+$/.test(medicineName)) {
          // Avoid duplicates
          const key = medicineName.toLowerCase();
          if (!extractedNames.has(key)) {
            extractedNames.add(key);
            medicines.push({
              name: medicineName,
              dosage: dosage || 'N/A',
              frequency: frequency || 'As directed',
              rawLine: line
            });
          }
        }
      }
    }
  }
  
  // If no medicines found with patterns, try a simpler approach
  // Look for capitalized words that might be medicine names
  if (medicines.length === 0) {
    const capitalizedWords = ocrText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
    if (capitalizedWords) {
      const uniqueWords = [...new Set(capitalizedWords)];
      for (const word of uniqueWords.slice(0, 10)) { // Limit to first 10
        if (
          word.length >= 3 &&
          !['Prescription', 'Doctor', 'Patient', 'Date', 'Name', 'Address', 'Phone'].includes(word)
        ) {
          medicines.push({
            name: word,
            dosage: 'N/A',
            frequency: 'As directed',
            rawLine: word
          });
        }
      }
    }
  }
  
  return medicines;
};

/**
 * Enhanced medicine extraction using common medicine database
 * This is a more accurate approach that matches against known medicine names
 */
const COMMON_MEDICINES = [
  'Metformin', 'Warfarin', 'Aspirin', 'Atorvastatin', 'Lisinopril',
  'Levothyroxine', 'Amlodipine', 'Omeprazole', 'Metoprolol', 'Simvastatin',
  'Losartan', 'Albuterol', 'Gabapentin', 'Hydrochlorothiazide', 'Sertraline',
  'Montelukast', 'Tramadol', 'Trazodone', 'Furosemide', 'Pantoprazole',
  'Atenolol', 'Carvedilol', 'Clopidogrel', 'Diltiazem', 'Escitalopram',
  'Fluoxetine', 'Ibuprofen', 'Naproxen', 'Prednisone', 'Warfarin'
];

/**
 * Known dangerous drug-drug interactions
 * Format: [medicine1, medicine2, severity, description]
 */
export const DRUG_DRUG_INTERACTIONS = [
  ['Warfarin', 'Aspirin', 'High', 'Combined use increases bleeding risk significantly'],
  ['Warfarin', 'Ibuprofen', 'High', 'Increases risk of bleeding'],
  ['Warfarin', 'Naproxen', 'High', 'Increases risk of bleeding'],
  ['Aspirin', 'Ibuprofen', 'Medium', 'May reduce aspirin\'s cardioprotective effects'],
  ['Metformin', 'Alcohol', 'High', 'Risk of lactic acidosis'],
  ['ACE Inhibitors', 'Potassium Supplements', 'High', 'Risk of hyperkalemia'],
  ['Digoxin', 'Furosemide', 'Medium', 'May increase digoxin toxicity'],
  ['Lithium', 'Diuretics', 'High', 'May increase lithium levels and toxicity'],
  ['Warfarin', 'Antibiotics', 'Medium', 'Some antibiotics can increase warfarin effects'],
];

/**
 * Check for drug-drug interactions between extracted medicines
 * @param {Array<{name: string}>} medicines - Array of extracted medicines
 * @returns {Array<string>} - Array of conflict messages
 */
export const checkDrugDrugInteractions = (medicines) => {
  const conflicts = [];
  const medicineNames = medicines.map(m => m.name.toLowerCase());
  
  // Check each known interaction
  for (const [med1, med2, severity, description] of DRUG_DRUG_INTERACTIONS) {
    const med1Lower = med1.toLowerCase();
    const med2Lower = med2.toLowerCase();
    
    // Check if both medicines are present
    const hasMed1 = medicineNames.some(name => name.includes(med1Lower) || med1Lower.includes(name));
    const hasMed2 = medicineNames.some(name => name.includes(med2Lower) || med2Lower.includes(name));
    
    if (hasMed1 && hasMed2) {
      // Find the actual medicine names from the extracted list
      const actualMed1 = medicines.find(m => m.name.toLowerCase().includes(med1Lower) || med1Lower.includes(m.name.toLowerCase()));
      const actualMed2 = medicines.find(m => m.name.toLowerCase().includes(med2Lower) || med2Lower.includes(m.name.toLowerCase()));
      
      if (actualMed1 && actualMed2) {
        conflicts.push(`${actualMed1.name} + ${actualMed2.name}: ${description} (${severity} risk)`);
      }
    }
  }
  
  // Also check for generic patterns
  // Multiple anticoagulants
  const anticoagulants = ['warfarin', 'aspirin', 'clopidogrel', 'heparin', 'enoxaparin'];
  const foundAnticoagulants = medicineNames.filter(name => 
    anticoagulants.some(anticoag => name.includes(anticoag))
  );
  
  if (foundAnticoagulants.length > 1) {
    const medNames = medicines
      .filter(m => foundAnticoagulants.includes(m.name.toLowerCase()))
      .map(m => m.name);
    if (medNames.length > 1) {
      conflicts.push(`${medNames.join(' + ')}: Multiple anticoagulants increase bleeding risk (High risk)`);
    }
  }
  
  return conflicts;
};

export const extractMedicinesEnhanced = (ocrText) => {
  const medicines = [];
  const text = ocrText.toLowerCase();
  const extractedNames = new Set();
  
  // Search for common medicine names in the text
  for (const medicine of COMMON_MEDICINES) {
    const medicineLower = medicine.toLowerCase();
    if (text.includes(medicineLower) && !extractedNames.has(medicineLower)) {
      extractedNames.add(medicineLower);
      
      // Try to extract dosage and frequency near the medicine name
      const medicineIndex = text.indexOf(medicineLower);
      const context = ocrText.substring(
        Math.max(0, medicineIndex - 50),
        Math.min(ocrText.length, medicineIndex + 200)
      );
      
      // Extract dosage
      const dosageMatch = context.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units|IU|%)/i);
      const dosage = dosageMatch ? `${dosageMatch[1]}${dosageMatch[2]}` : 'N/A';
      
      // Extract frequency
      const frequencyPatterns = [
        /(?:take|once|twice|thrice|daily|every|times)\s+(?:daily|day|week|hour|meal|morning|evening|night|bedtime)/gi,
        /(?:qd|bid|tid|qid)/gi,
      ];
      let frequency = 'As directed';
      for (const pattern of frequencyPatterns) {
        const match = context.match(pattern);
        if (match) {
          frequency = match[0];
          break;
        }
      }
      
      medicines.push({
        name: medicine,
        dosage: dosage,
        frequency: frequency,
        rawLine: context.substring(0, 100)
      });
    }
  }
  
  // If enhanced extraction found medicines, use it; otherwise fall back to pattern matching
  if (medicines.length > 0) {
    return medicines;
  }
  
  return extractMedicines(ocrText);
};

