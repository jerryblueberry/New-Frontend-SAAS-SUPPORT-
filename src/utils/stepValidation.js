/**
 * Step Validation Utility
 * 
 * Validates required fields for each onboarding step by checking actual data,
 * not just completion flags. This ensures validation works even if fields
 * were completed but later removed/edited.
 */

/**
 * Field labels for user-friendly display
 */
const FIELD_LABELS = {
  // Step 1: Profile
  CV: 'Resume / CV',
  expectedHourlyRate: 'Expected Hourly Rate',
  languages: 'Languages Spoken',
  biography: 'Professional Summary',
  skillTags: 'Skills & Expertise',
  
  // Step 2: Work History
  workHistory: 'Work History',
  references: 'References',
  
  // Step 3: Availability
  customTimeSlots: 'Availability Time Slots',
  suburb: 'Suburb',
  kmWillingToTravel: 'Travel Distance',
  
  // Step 4: Certifications
  certifications: 'Certifications',
  residencyStatus: 'Residency Status',
  
  // Step 5: Health Information
  hasWorkersCompensation: 'Workers Compensation',
  hasMedicalConditions: 'Medical Conditions',
  covidVaccinated: 'COVID-19 Vaccination',
  fluVaccinated: 'Flu Vaccination',
  hasHealthClearance: 'Health Clearance',
  canLiftPatients: 'Lifting Ability',
};

/**
 * Validate Step 1: Profile (Basic Info)
 * @param {Object} profileData - Profile data from store
 * @returns {Object} Validation result with missing fields
 */
export const validateStep1 = (profileData) => {
  const missingFields = [];
  
  // CV is required
  if (!profileData?.CV || !profileData.CV.url || !profileData.CV.publicId) {
    missingFields.push('CV');
  }
  
  // Expected hourly rate is required and must be > 0
  if (!profileData?.expectedHourlyRate || profileData.expectedHourlyRate <= 0) {
    missingFields.push('expectedHourlyRate');
  }
  
  // Languages are required (at least one)
  if (!profileData?.languages || !Array.isArray(profileData.languages) || profileData.languages.length === 0) {
    missingFields.push('languages');
  }
  
  // Biography is optional but recommended
  // SkillTags are optional but recommended
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields.map(field => FIELD_LABELS[field] || field),
    stepName: 'Profile',
    stepNumber: 1
  };
};

/**
 * Validate Step 2: Work History
 * @param {Object} workHistoryData - Work history data from store
 * @returns {Object} Validation result with missing fields
 */
export const validateStep2 = (workHistoryData) => {
  const missingFields = [];
  
  // Work history is required (at least one job)
  if (!workHistoryData?.jobs || !Array.isArray(workHistoryData.jobs) || workHistoryData.jobs.length === 0) {
    missingFields.push('workHistory');
  }
  
  // References are required (exactly 2)
  if (!workHistoryData?.references || !Array.isArray(workHistoryData.references) || workHistoryData.references.length !== 2) {
    missingFields.push('references');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields.map(field => FIELD_LABELS[field] || field),
    stepName: 'Work History',
    stepNumber: 2
  };
};

/**
 * Validate Step 3: Availability
 * @param {Object} availabilityData - Availability data from store
 * @returns {Object} Validation result with missing fields
 */
export const validateStep3 = (availabilityData) => {
  const missingFields = [];
  
  // Custom time slots are required (at least one)
  if (!availabilityData?.customTimeSlots || !Array.isArray(availabilityData.customTimeSlots) || availabilityData.customTimeSlots.length === 0) {
    missingFields.push('customTimeSlots');
  }
  
  // Suburb is required
  if (!availabilityData?.suburb || availabilityData.suburb.trim() === '') {
    missingFields.push('suburb');
  }
  
  // Travel distance is required
  if (availabilityData?.kmWillingToTravel === undefined || availabilityData.kmWillingToTravel === null || availabilityData.kmWillingToTravel <= 0) {
    missingFields.push('kmWillingToTravel');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields.map(field => FIELD_LABELS[field] || field),
    stepName: 'Availability',
    stepNumber: 3
  };
};

/**
 * Validate Step 4: Certifications
 * @param {Object} certificationsData - Certifications data from store
 * @returns {Object} Validation result with missing fields
 */
export const validateStep4 = (certificationsData) => {
  const missingFields = [];
  
  // Certifications are required (at least one)
  if (!certificationsData?.certifications || !Array.isArray(certificationsData.certifications) || certificationsData.certifications.length === 0) {
    missingFields.push('certifications');
  }
  
  // Residency status is required
  if (!certificationsData?.residencyStatus || certificationsData.residencyStatus.trim() === '') {
    missingFields.push('residencyStatus');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields.map(field => FIELD_LABELS[field] || field),
    stepName: 'Certifications',
    stepNumber: 4
  };
};

/**
 * Validate Step 5: Health Information
 * @param {Object} healthData - Health information data from store
 * @returns {Object} Validation result with missing fields
 */
export const validateStep5 = (healthData) => {
  const missingFields = [];
  
  if (!healthData) {
    return {
      isValid: false,
      missingFields: ['All Health Information fields'],
      stepName: 'Health Information',
      stepNumber: 5
    };
  }
  
  // Required boolean fields must be explicitly set (not null/undefined)
  const requiredFields = [
    'hasWorkersCompensation',
    'hasMedicalConditions',
    'covidVaccinated',
    'fluVaccinated',
    'hasHealthClearance',
    'canLiftPatients',
  ];
  
  requiredFields.forEach(field => {
    if (healthData[field] === null || healthData[field] === undefined) {
      missingFields.push(field);
    }
  });
  
  // Conditional validation - if true, then description/details are required
  if (healthData.hasMedicalConditions === true && 
      (!healthData.medicalConditionsDescription || healthData.medicalConditionsDescription.trim() === '')) {
    missingFields.push('Medical Conditions Description');
  }
  
  if (healthData.hasWorkersCompensation === true && 
      (!healthData.workersCompensationDetails || healthData.workersCompensationDetails.trim() === '')) {
    missingFields.push('Workers Compensation Details');
  }
  
  if (healthData.requiresSpecialAccommodation === true && 
      (!healthData.conditionsAffectingWork || healthData.conditionsAffectingWork.trim() === '')) {
    missingFields.push('Conditions Affecting Work');
  }
  
  if (healthData.hasHealthClearance === true && !healthData.healthClearanceDate) {
    missingFields.push('Health Clearance Date');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields.map(field => FIELD_LABELS[field] || field),
    stepName: 'Health Information',
    stepNumber: 5
  };
};

/**
 * Validate all steps up to a target step
 * @param {number} targetStep - The step number to validate up to
 * @param {Object} storeData - All data from the onboarding store
 * @returns {Array} Array of validation results for incomplete steps
 */
export const validateStepsUpTo = (targetStep, storeData) => {
  const validationResults = [];
  
  // CRITICAL: Always validate ALL steps from 1 to targetStep - 1
  // This ensures that even if a step was previously completed, we check if it's still complete
  // (e.g., if CV was deleted from step 1, step 1 becomes incomplete and blocks step 2)
  for (let step = 1; step < targetStep; step++) {
    let result;
    
    switch (step) {
      case 1:
        result = validateStep1(storeData.profile || {});
        break;
      case 2:
        result = validateStep2(storeData.workHistory || {});
        break;
      case 3:
        result = validateStep3(storeData.availability || {});
        break;
      case 4:
        result = validateStep4({
          certifications: storeData.certifications || [],
          residencyStatus: storeData.residencyStatus || ''
        });
        break;
      case 5:
        result = validateStep5(storeData.healthInformation || {});
        break;
      default:
        continue;
    }
    
    // Add to results if step is invalid (has missing fields)
    if (!result.isValid) {
      validationResults.push(result);
    }
  }
  
  return validationResults;
};

/**
 * Get all missing fields across incomplete steps
 * @param {number} targetStep - The step number being navigated to
 * @param {Object} storeData - All data from the onboarding store
 * @returns {Object} Summary of all missing fields by step
 */
export const getMissingFieldsSummary = (targetStep, storeData) => {
  const incompleteSteps = validateStepsUpTo(targetStep, storeData);
  
  return {
    hasMissingFields: incompleteSteps.length > 0,
    incompleteSteps,
    totalMissingFields: incompleteSteps.reduce((sum, step) => sum + step.missingFields.length, 0)
  };
};

