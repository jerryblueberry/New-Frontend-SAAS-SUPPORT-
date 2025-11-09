/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ERROR FORMATTER UTILITY
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Converts technical error responses into user-friendly messages
 * Handles various error formats from API responses
 * 
 * @module utils/errorFormatter
 */

/**
 * Field name mappings for user-friendly error messages
 */
const FIELD_NAME_MAP = {
  // Basic Information
  'accountType': 'Account Type',
  'organizationName': 'Organization Name',
  'abn': 'ABN',
  'ndisNumber': 'NDIS Number',
  'address.street': 'Street Address',
  'address.suburb': 'Suburb',
  'address.state': 'State',
  'address.postcode': 'Postcode',
  'emergencyContact.name': 'Emergency Contact Name',
  'emergencyContact.phone': 'Emergency Contact Phone',
  
  // Preferences
  'supportCategories': 'Support Categories',
  'serviceRegions': 'Service Regions',
  'preferences.supportCategories': 'Support Categories',
  'preferences.serviceRegions': 'Service Regions',
  'preferences.specialRequirements': 'Special Requirements',
  'preferences.workerPreferences.preferredGender': 'Preferred Gender',
  'preferences.workerPreferences.preferredAgeGroup': 'Preferred Age Group',
  'preferences.availability': 'Availability',
  'preferences.culturalPreferences': 'Cultural Preferences',
  'preferences.serviceDelivery': 'Service Delivery',
};

/**
 * HTTP status code to user-friendly message mapping
 */
const STATUS_CODE_MESSAGES = {
  400: 'Invalid information provided. Please check your entries and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This information already exists. Please check your details.',
  422: 'The information you provided is invalid. Please review and correct any errors.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again in a few moments.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service is currently unavailable. Please try again later.',
  504: 'Request timed out. Please try again.',
};

/**
 * Format validation errors from Zod or backend
 * @param {Array|Object} errors - Error array or object from API
 * @returns {string} User-friendly error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors) {
    return 'Please fill in all required fields correctly.';
  }

  // Handle string errors
  if (typeof errors === 'string') {
    return errors;
  }

  // Handle array of errors (Zod format)
  if (Array.isArray(errors)) {
    if (errors.length === 0) {
      return 'Please fill in all required fields correctly.';
    }

    const messages = errors.map((error) => {
      // Extract field path
      const fieldPath = error.path ? error.path.join('.') : error.field || '';
      const fieldName = FIELD_NAME_MAP[fieldPath] || 
                       fieldPath.split('.').pop() || 
                       'Field';
      
      // Format field name (capitalize first letter, add spaces)
      const displayName = fieldName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

      // Handle different error types
      if (error.code === 'invalid_type') {
        if (error.expected === 'array') {
          return `${displayName} is required. Please select at least one option.`;
        }
        return `${displayName} has an invalid format.`;
      }

      if (error.code === 'too_small' && error.minimum === 1) {
        return `${displayName} is required.`;
      }

      // Use custom message if available
      if (error.message) {
        // Remove technical details from message
        const cleanMessage = error.message
          .replace(/Expected .*?, received .*?/gi, '')
          .trim();
        return cleanMessage || `${displayName} is invalid.`;
      }

      return `${displayName} is invalid.`;
    });

    if (messages.length === 1) {
      return messages[0];
    }

    return `Please fix the following:\n• ${messages.join('\n• ')}`;
  }

  // Handle object format errors
  if (typeof errors === 'object') {
    const errorMessages = Object.entries(errors).map(([field, message]) => {
      const fieldName = FIELD_NAME_MAP[field] || field;
      return `${fieldName}: ${message}`;
    });

    if (errorMessages.length === 1) {
      return errorMessages[0];
    }

    return `Please fix the following:\n• ${errorMessages.join('\n• ')}`;
  }

  return 'Please fill in all required fields correctly.';
};

/**
 * Format API error response into user-friendly message
 * @param {Error} error - Error object from API call
 * @returns {string} User-friendly error message
 */
export const formatApiError = (error) => {
  // Handle cases where error is not an object
  if (!error || typeof error !== 'object') {
    return 'An unexpected error occurred. Please try again.';
  }

  // PRIORITY 1: Check for axios error.response structure FIRST (most common case)
  if (error.response && error.response !== null && error.response !== undefined) {
    const { status, data } = error.response;

  // Validate status is a number
  const statusCode = typeof status === 'number' ? status : parseInt(status, 10);
  
  // Always check for server message first (most specific)
  if (data?.message && typeof data.message === 'string' && data.message.trim()) {
    // Ensure message doesn't contain status codes or technical jargon
    const cleanMessage = data.message.trim();
    if (!/\d{3}/.test(cleanMessage) && !cleanMessage.toLowerCase().includes('status code')) {
      return cleanMessage;
    }
  }

  // Handle validation errors (400, 422)
  if (statusCode === 400 || statusCode === 422) {
    if (data?.errors) {
      return formatValidationErrors(data.errors);
    }
    if (data?.error) {
      return typeof data.error === 'string' ? data.error : 'Invalid information provided. Please check your entries and try again.';
    }
    return 'Please check your information and try again.';
  }

  // Handle authentication errors (401)
  if (statusCode === 401) {
    return 'Your session has expired. Please log in again.';
  }

  // Handle authorization errors (403) - with better context
  if (statusCode === 403) {
    // Check for specific error codes from backend
    if (data?.code === 'RESTRICTED_EDIT') {
      return 'Your profile has been submitted for review and cannot be edited at this time. Please wait for admin approval or contact support if you need to make changes.';
    }
    if (data?.code === 'PROFILE_DELETED') {
      return 'Your profile has been deactivated. Please contact support for assistance.';
    }
    return 'You don\'t have permission to perform this action.';
  }

  // Handle not found errors (404)
  if (statusCode === 404) {
    return 'The requested resource was not found.';
  }

  // Handle redirect status codes (3xx) - shouldn't happen in API calls, but handle gracefully
  if (statusCode >= 300 && statusCode < 400) {
    return 'The request was redirected. Please try again.';
  }

  // Handle server errors (500+)
  if (statusCode >= 500) {
    return 'Something went wrong on our end. Our team has been notified. Please try again in a few moments.';
  }

  // Handle specific status codes (use generic messages only if no server message)
  if (STATUS_CODE_MESSAGES[statusCode]) {
    return STATUS_CODE_MESSAGES[statusCode];
  }

  // Use server message if available (double-check)
  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }

  // Check for error object with message
  if (data?.error && typeof data.error === 'string') {
    return data.error;
  }

    // Generic fallback - never show status codes to users
    return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
  }

  // PRIORITY 2: Handle network errors (no response from server)
  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }
  if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
    return 'Request timed out. Please check your connection and try again.';
  }
  if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }
  // Only show error.message if it's user-friendly (not technical)
  const message = error.message || '';
  if (message && !message.includes('status') && !message.includes('code') && !/\d{3}/.test(message)) {
    return message;
  }
  return 'Unable to connect to the server. Please check your internet connection and try again.';
};

/**
 * Format success message
 * @param {string|Object} data - Success response data
 * @param {string} defaultMessage - Default success message
 * @returns {string} User-friendly success message
 */
export const formatSuccessMessage = (data, defaultMessage = 'Saved successfully!') => {
  if (typeof data === 'string') {
    return data;
  }
  if (data?.message) {
    return data.message;
  }
  return defaultMessage;
};

