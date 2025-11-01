// src/api/references.js
import api from './axios';

// Reference API endpoints
export const referenceAPI = {
  // Get all references with filtering and pagination
  getAllReferences: (params = {}) => {
    const {
      page = 1,
      limit = 20,
      status = null,
      workerId = null,
      search = null,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom = null,
      dateTo = null
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    if (status) queryParams.append('status', status);
    if (workerId) queryParams.append('workerId', workerId);
    if (search) queryParams.append('search', search);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const url = `/references?${queryParams.toString()}`;
    
    // Log only in development mode
    if (process.env.NODE_ENV === 'development') {
      console.debug('References API call:', url, { params: { page, limit, status, workerId, search } });
    }
    
    return api.get(url)
      .catch(error => {
        // Always log errors for debugging
        console.error('References API Error:', {
          url,
          status: error.response?.status,
          message: error.response?.data?.message || error.message
        });
        throw error;
      });
  },

  // Get reference by ID
  getReferenceById: (id) => api.get(`/references/${id}`),

  // Get reference by token (for public access)
  getReferenceByToken: (token) => api.get(`/references/token/${token}`),

  // Get references for a specific worker
  getWorkerReferences: (workerId) => api.get(`/references/worker/${workerId}`),

  // Send reference check email
  sendReferenceEmail: (id) => api.post(`/references/${id}/send-email`),

  // Submit reference response (public endpoint)
  submitReferenceResponse: (token, responses) => 
    api.post(`/references/respond/${token}`, { responses }),

  // Sync references from worker profile
  syncReferences: (workerProfileId, questionnaireId) => 
    api.post('/references/sync', { workerProfileId, questionnaireId }),

  // Get reference statistics
  getReferenceStats: () => api.get('/references/stats'),

  // Get reference completion stats
  getCompletionStats: (dateRange = null) => {
    const params = dateRange ? { dateFrom: dateRange.start, dateTo: dateRange.end } : {};
    return api.get('/references/completion-stats', { params });
  },

  // Resend reference email
  resendReferenceEmail: (id) => api.post(`/references/${id}/resend-email`),

  // Update reference status (admin only)
  updateReferenceStatus: (id, status, notes = '') => 
    api.put(`/references/${id}/status`, { status, notes }),

  // Add admin notes to reference
  addAdminNote: (id, note, isPrivate = false) => 
    api.post(`/references/${id}/notes`, { note, isPrivate }),

  // Delete reference
  deleteReference: (id) => api.delete(`/references/${id}`),

  // Bulk operations
  bulkUpdateStatus: (ids, status, notes = '') => 
    api.put('/references/bulk/status', { ids, status, notes }),

  bulkSendEmails: (ids) => 
    api.post('/references/bulk/send-emails', { ids }),

  // Export references data
  exportReferences: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/references/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
  }
};

export default referenceAPI;
