/**
 * Enhanced storage utility for cross-platform auth token management
 * 
 * Features:
 * - Primary storage using localStorage with graceful fallbacks
 * - Memory storage backup when browser storage is unavailable
 * - Security improvements for token handling
 * - Token validation and expiration checks
 * - Compatible with web and mobile environments
 */

// Memory fallback when browser storage is unavailable
const memoryStorage = new Map();

// Multi-layer storage with feature detection and fallbacks
const storage = {
  /**
   * Attempts to use the best available storage option with fallbacks
   */
  get: (key) => {
    try {
      // Try localStorage first (persists across sessions)
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(key);
        if(item) return item;
      }
      
      // Fall back to sessionStorage (cleared when tab closes)
      if (typeof sessionStorage !== 'undefined') {
        const item = sessionStorage.getItem(key);
        if (item) return item;
      }
    } catch (error) {
      console.warn('Browser storage access denied, using memory fallback:', error);
    }
    
    // Memory fallback (lost on page refresh)
    return memoryStorage.get(key) || null;
  },

  set: (key, value) => {
    try {
      // Try localStorage first
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
      
      // Fall back to sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, value);
        return;
      }
    } catch (error) {
      console.warn('Browser storage access denied, using memory fallback:', error);
    }
    
    // Memory fallback
    memoryStorage.set(key, value);
  },

  remove: (key) => {
    try {
      // Try to clear from all storage types
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Browser storage access denied when removing item:', error);
    }
    
    // Always clear from memory fallback too
    memoryStorage.delete(key);
  },
  
  // Helper to clear all auth data
  clearAll: () => {
    const keysToRemove = [
      'access_token', 'refresh_token', 'auth_expiry',
      'app_access_token', 'app_refresh_token', 'app_token_expiry',
      'auth_provider', 'google_token'
    ];
    keysToRemove.forEach(key => storage.remove(key));
  }
};

// Token storage keys with namespace to avoid conflicts
const TOKEN_KEYS = {
  ACCESS: 'app_access_token',
  REFRESH: 'app_refresh_token',
  EXPIRY: 'app_token_expiry',
  AUTH_PROVIDER: 'auth_provider',
  GOOGLE_TOKEN: 'google_token'
};

/**
 * Helper to parse JWT payload without library dependencies
 * @param {string} token - JWT token to parse
 * @returns {object|null} Decoded payload or null if invalid
 */
export const parseJwtPayload = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

/**
 * Check if token is valid based on its structure and expiration
 * @param {string} token - The JWT token to validate
 * @returns {boolean} Whether the token appears valid
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Parse the token
    const payload = parseJwtPayload(token);
    if (!payload) return false;
    
    // Check if token has expiry and isn't expired
    if (payload.exp) {
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      if (currentTime >= expiryTime) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};

/**
 * Get stored access token if it's potentially valid
 * @returns {string|null} The access token or null if not found/invalid
 */
export const getAccessToken = () => {
  const token = storage.get(TOKEN_KEYS.ACCESS);
  return isTokenValid(token) ? token : null;
};

/**
 * Get stored refresh token
 * @returns {string|null} The refresh token or null if not found
 */
export const getRefreshToken = () => storage.get(TOKEN_KEYS.REFRESH);

/**
 * Store access token with optional expiry tracking
 * @param {string} token - The JWT access token to store
 * @param {number} expiresIn - Optional seconds until token expires
 */
export const setAccessToken = (token, expiresIn = null) => {
  storage.set(TOKEN_KEYS.ACCESS, token);
  
  // Extract expiration from JWT payload if available (more accurate)
  try {
    const payload = parseJwtPayload(token);
    if (payload?.exp) {
      // JWT exp is in seconds, convert to milliseconds
      const expiryTime = payload.exp * 1000;
      storage.set(TOKEN_KEYS.EXPIRY, expiryTime.toString());
      return; // Use JWT expiration if available
    }
  } catch (error) {
    // Fallback to provided expiresIn if JWT parsing fails
  }
  
  // Store expiry time if provided (useful for proactive token refresh)
  if (expiresIn) {
    const expiryTime = Date.now() + (expiresIn * 1000);
    storage.set(TOKEN_KEYS.EXPIRY, expiryTime.toString());
  }
};

/**
 * Store refresh token
 * @param {string} token - The JWT refresh token to store
 */
export const setRefreshToken = (token) => {
  storage.set(TOKEN_KEYS.REFRESH, token);
};

/**
 * Remove all authentication tokens
 */
export const removeTokens = () => {
  storage.clearAll();
};

/**
 * Check if the access token will expire soon
 * @param {number} thresholdSeconds - Seconds threshold to consider token as expiring soon
 * @returns {boolean} True if token exists and will expire within the threshold
 */
export const isTokenExpiringSoon = (thresholdSeconds = 300) => {
  // First try using the stored expiry time
  const expiryTime = storage.get(TOKEN_KEYS.EXPIRY);
  if (expiryTime) {
    const timeRemaining = parseInt(expiryTime, 10) - Date.now();
    return timeRemaining <= thresholdSeconds * 1000;
  }
  
  // Fallback: Try to extract expiration from token itself
  const token = storage.get(TOKEN_KEYS.ACCESS);
  if (!token) return false;
  
  try {
    const payload = parseJwtPayload(token);
    if (!payload || !payload.exp) return false;
    
    const tokenExpiryTime = payload.exp * 1000; // Convert to milliseconds
    const timeRemaining = tokenExpiryTime - Date.now();
    return timeRemaining <= thresholdSeconds * 1000;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return false;
  }
};

/**
 * Full auth check - validates complete auth state
 * @returns {boolean} Whether user has valid authentication
 */
export const hasValidAuth = () => {
  const accessToken = getAccessToken();
  // Valid access token = authenticated
  return !!accessToken;
};

/**
 * Get the authentication provider (e.g., 'google', 'email')
 * @returns {string|null} The auth provider or null if not stored
 */
export const getAuthProvider = () => {
  return storage.get(TOKEN_KEYS.AUTH_PROVIDER);
};

/**
 * Set the authentication provider
 * @param {string} provider - The authentication provider (e.g., 'google', 'email')
 */
export const setAuthProvider = (provider) => {
  storage.set(TOKEN_KEYS.AUTH_PROVIDER, provider);
};

export default {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  removeTokens,
  isTokenExpiringSoon,
  parseJwtPayload,
  isTokenValid,
  hasValidAuth,
  getAuthProvider,
  setAuthProvider
};