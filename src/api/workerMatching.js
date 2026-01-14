/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WORKER MATCHING API
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * API functions for client-worker matching system.
 * Handles worker discovery, filtering, and profile viewing.
 * 
 * @module api/workerMatching
 */

import api from './axios';

/**
 * Get workers with filters and pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Results per page
 * @param {string} params.search - Search query
 * @param {string[]} params.skills - Array of skills
 * @param {string} params.location - Location filter
 * @param {number} params.minRating - Minimum rating
 * @param {number} params.maxHourlyRate - Maximum hourly rate
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @returns {Promise} API response
 */
export const getWorkers = async (params = {}) => {
  try {
    // Build query string
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.skills && params.skills.length > 0) {
      queryParams.append('skills', params.skills.join(','));
    }
    if (params.location) queryParams.append('location', params.location);
    if (params.minRating) queryParams.append('minRating', params.minRating);
    if (params.maxHourlyRate) queryParams.append('maxHourlyRate', params.maxHourlyRate);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get(`/client/matching/workers?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

/**
 * Get single worker by ID
 * @param {string} workerId - Worker profile ID
 * @returns {Promise} API response
 */
export const getWorkerById = async (workerId) => {
  try {
    const response = await api.get(`/client/matching/workers/${workerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching worker:', error);
    throw error;
  }
};

/**
 * Get matching statistics
 * @returns {Promise} API response
 */
export const getMatchingStats = async () => {
  try {
    const response = await api.get('/client/matching/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching matching stats:', error);
    throw error;
  }
};

/**
 * Add worker to favorites (Future implementation)
 * @param {string} workerId - Worker profile ID
 * @returns {Promise} API response
 */
export const addToFavorites = async (workerId) => {
  try {
    const response = await api.post('/client/favorites', { workerId });
    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

/**
 * Remove worker from favorites (Future implementation)
 * @param {string} workerId - Worker profile ID
 * @returns {Promise} API response
 */
export const removeFromFavorites = async (workerId) => {
  try {
    const response = await api.delete(`/client/favorites/${workerId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

/**
 * Save search preferences (Future implementation)
 * @param {Object} preferences - Search preferences
 * @returns {Promise} API response
 */
export const saveSearchPreferences = async (preferences) => {
  try {
    const response = await api.post('/client/search-preferences', preferences);
    return response.data;
  } catch (error) {
    console.error('Error saving search preferences:', error);
    throw error;
  }
};
