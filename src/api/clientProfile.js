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

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOG API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch audit history for a client profile
 * @param {string} profileId - Client profile ID
 * @param {Object} options - Query options (limit, skip, sortBy)
 * @returns {Promise} Audit log entries
 */
export const fetchProfileAuditHistory = async (profileId, options = {}) => {
  const { limit = 50, skip = 0, sortBy = '-createdAt' } = options;
  const response = await api.get(`/client/profile/${profileId}/audit`, {
    params: { limit, skip, sortBy }
  });
  return response.data;
};

/**
 * Fetch audit summary for a client profile
 * @param {string} profileId - Client profile ID
 * @returns {Promise} Audit summary statistics
 */
export const fetchProfileAuditSummary = async (profileId) => {
  const response = await api.get(`/client/profile/${profileId}/audit/summary`);
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE MANAGEMENT API (PATCH Support for Partial Updates)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get basic information only
 */
export const getBasicInfo = async () => {
  const response = await api.get('/client/profile/basic');
  return response.data;
};

/**
 * Update basic information (partial update)
 */
export const updateBasicInfo = async (updates) => {
  const response = await api.patch('/client/profile/basic', updates);
  return response.data;
};

/**
 * Get preferences only
 */
export const getPreferences = async () => {
  const response = await api.get('/client/profile/preferences');
  return response.data;
};

/**
 * Update preferences (partial update)
 */
export const updatePreferences = async (updates) => {
  const response = await api.patch('/client/profile/preferences', updates);
  return response.data;
};

/**
 * Get care plan summary
 */
export const getCarePlan = async () => {
  const response = await api.get('/client/profile/care-plan');
  return response.data;
};

/**
 * Update care plan summary (partial update)
 */
export const updateCarePlan = async (updates) => {
  const response = await api.patch('/client/profile/care-plan', updates);
  return response.data;
};

/**
 * Get communication preferences
 */
export const getCommunication = async () => {
  const response = await api.get('/client/profile/communication');
  return response.data;
};

/**
 * Update communication preferences (partial update)
 */
export const updateCommunication = async (updates) => {
  const response = await api.patch('/client/profile/communication', updates);
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS MANAGEMENT API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * List all documents with optional filters
 */
export const listDocuments = async (params = {}) => {
  const response = await api.get('/client/documents', { params });
  return response.data;
};

/**
 * Upload a new document
 */
export const uploadDocument = async (documentData) => {
  const response = await api.post('/client/documents', documentData);
  return response.data;
};

/**
 * Get documents by status
 */
export const getDocumentsByStatus = async (status) => {
  const response = await api.get(`/client/documents/status/${status}`);
  return response.data;
};

/**
 * Get a single document by ID
 */
export const getDocument = async (id) => {
  const response = await api.get(`/client/documents/${id}`);
  return response.data;
};

/**
 * Update document metadata (partial update)
 */
export const updateDocument = async (id, updates) => {
  const response = await api.patch(`/client/documents/${id}`, updates);
  return response.data;
};

/**
 * Delete a document
 */
export const deleteDocument = async (id) => {
  const response = await api.delete(`/client/documents/${id}`);
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING & PAYMENTS API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get billing preferences
 */
export const getBillingPreferences = async () => {
  const response = await api.get('/client/billing/preferences');
  return response.data;
};

/**
 * Update billing preferences (partial update)
 */
export const updateBillingPreferences = async (updates) => {
  const response = await api.patch('/client/billing/preferences', updates);
  return response.data;
};

/**
 * List invoices
 */
export const listInvoices = async () => {
  const response = await api.get('/client/billing/invoices');
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEAM MANAGEMENT API (Organizations Only)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * List all team members
 */
export const listTeamMembers = async () => {
  const response = await api.get('/client/team/members');
  return response.data;
};

/**
 * Add/invite a new team member
 */
export const addTeamMember = async (memberData) => {
  const response = await api.post('/client/team/members', memberData);
  return response.data;
};

/**
 * Update team member (role, permissions, status)
 */
export const updateTeamMember = async (id, updates) => {
  const response = await api.patch(`/client/team/members/${id}`, updates);
  return response.data;
};

/**
 * Remove a team member
 */
export const removeTeamMember = async (id) => {
  const response = await api.delete(`/client/team/members/${id}`);
  return response.data;
};

/**
 * Get permissions matrix
 */
export const getTeamPermissions = async () => {
  const response = await api.get('/client/team/permissions');
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & INSIGHTS API (Read-Only)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get engagement metrics
 */
export const getEngagementMetrics = async () => {
  const response = await api.get('/client/analytics/engagement');
  return response.data;
};

/**
 * Get activity history
 */
export const getActivityHistory = async (params = {}) => {
  const response = await api.get('/client/analytics/activity', { params });
  return response.data;
};

/**
 * Get audit log with filters
 */
export const getAuditLog = async (params = {}) => {
  const response = await api.get('/client/analytics/audit-log', { params });
  return response.data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get consents
 */
export const getConsents = async () => {
  const response = await api.get('/client/settings/consents');
  return response.data;
};

/**
 * Update consents (partial update)
 */
export const updateConsents = async (updates) => {
  const response = await api.patch('/client/settings/consents', updates);
  return response.data;
};

/**
 * Get locale settings
 */
export const getLocaleSettings = async () => {
  const response = await api.get('/client/settings/locale');
  return response.data;
};

/**
 * Update locale settings (partial update)
 */
export const updateLocaleSettings = async (updates) => {
  const response = await api.patch('/client/settings/locale', updates);
  return response.data;
};

// ────────────────────────────────────────────────────────────
// Legacy API (Keep for backward compatibility)
// ────────────────────────────────────────────────────────────

export const getClientProfile = () => api.get('/client/profile');
