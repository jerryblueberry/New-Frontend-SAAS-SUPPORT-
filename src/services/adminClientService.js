import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch clients with filters, pagination, sorting
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
export const getClients = async (params = {}) => {
  const response = await api.get('/admin/clients', { params });
  return response.data;
};

/**
 * Get single client by ID
 * @param {string} id - Client ID
 * @param {Object} options - Query options
 * @returns {Promise} API response
 */
export const getClientById = async (id, options = {}) => {
  const response = await api.get(`/admin/client/${id}`, { params: options });
  return response.data;
};

/**
 * Update client profile
 * @param {string} id - Client ID
 * @param {Object} data - Update payload
 * @returns {Promise} API response
 */
export const updateClient = async (id, data) => {
  const response = await api.patch(`/admin/client/${id}`, data);
  return response.data;
};

/**
 * Soft delete client
 * @param {string} id - Client ID
 * @returns {Promise} API response
 */
export const deleteClient = async (id) => {
  const response = await api.delete(`/admin/client/${id}`);
  return response.data;
};

/**
 * Export clients as CSV
 * @param {Object} params - Query parameters (same as getClients)
 * @returns {Promise} Blob response
 */
export const exportClients = async (params = {}) => {
  const response = await api.get('/admin/clients/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

export default api;

