import api from './axios';

// ────────────────────────────────────────────────────────────
// Client Onboarding API (Following Worker Pattern)
// ────────────────────────────────────────────────────────────

/**
 * Fetch current onboarding progress and profile data
 * @returns {Promise} Profile data with completion status
 */
export const fetchClientOnboardingProgress = async () => {
  const response = await api.get('/client/onboarding/resume');
  return response.data;
};

/**
 * Save Step 1: Basic Information
 * @param {Object} basicInfoData - Account type, address, emergency contact
 * @returns {Promise} Updated profile with completion data
 */
export const saveBasicInformationStep = async (basicInfoData) => {
  const response = await api.post('/client/onboarding/step/basic-information', basicInfoData);
  return response.data;
};

/**
 * Save Step 2: Preferences & Care Requirements
 * @param {Object} preferencesData - Support categories, worker preferences, availability
 * @returns {Promise} Updated profile with completion data
 */
export const savePreferencesStep = async (preferencesData) => {
  const response = await api.post('/client/onboarding/step/preferences', preferencesData);
  return response.data;
};

/**
 * Manually submit complete profile for admin review
 * @returns {Promise} Submission confirmation
 */
export const submitProfileForReview = async () => {
  const response = await api.post('/client/onboarding/submit');
  return response.data;
};

// ────────────────────────────────────────────────────────────
// Legacy API (Keep for backward compatibility)
// ────────────────────────────────────────────────────────────

export const getClientProfile = () => api.get('/client/profile');
