// src/api/auth.js
import api from './axios';
import { 
  getAccessToken, 
  getRefreshToken, 
  setAccessToken, 
  setRefreshToken, 
  removeTokens,
  setAuthProvider
} from '../utils/storage';

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export const register = async(userData) => {
  const response = await api.post('/auth/signup', userData);
  
  // Handle auto-login if tokens are returned upon registration
  if (response.data?.data?.accessToken) {
    setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
    setRefreshToken(response.data.data.refreshToken);
    setAuthProvider('email');
    
    // Dispatch login event for components listening
    window.dispatchEvent(new Event('auth:login'));
  }
  
  return response.data;
};

/**
 * Log in a user with email/password
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} Login response with user data
 */
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
  
    if (response.data?.data?.accessToken) {
      // Save tokens to storage
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      setRefreshToken(response.data.data.refreshToken);
      setAuthProvider('email');
      
      // Dispatch login event
      window.dispatchEvent(new Event('auth:login'));
    }
      
  return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      removeTokens();
    }
    throw error;
  }


};

/**
 * Refresh the authentication token
 * @returns {Promise<string>} New access token
 */
export const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    // Use axios directly to avoid interceptors triggering infinitely
    const response = await api.post('/auth/refresh-token', { 
      refreshToken: refreshToken
    });
    
    // Save new tokens
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      if (response.data.data.refreshToken) {
        setRefreshToken(response.data.data.refreshToken);
      }
      
      return response.data.data.accessToken;
    }
    
    throw new Error('Invalid token response');
  } catch (error) {
    if (error.response?.status === 401) {
      removeTokens();
    }
    throw error;
  }
};

/**
 * Log out the current user
 * @param {boolean} allDevices - Whether to log out from all devices
 * @returns {Promise<void>}
 */
export const logout = async (allDevices = false) => {
  const refreshToken = getRefreshToken();
  
  try {
    if (refreshToken) {
      // Send the refresh token in the request body
      await api.post('/auth/logout', { refreshToken, allDevices });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clean up local storage
    removeTokens();
    
    // Clear auth provider data
    localStorage.removeItem('google_token');
    
    // Clear query cache if available
    if (window.queryClient) {
      window.queryClient.clear();
    }
    
    // Dispatch logout event
    window.dispatchEvent(new Event('auth:logout'));
  }
};

/**
 * Get the current user's profile
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  // Ensure we have a valid token before making the request
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  const response = await api.get('/auth/me');
  return response.data.data.user;
};

/**
 * Verify a user's email address
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} Verification response
 */
export const verifyEmail = async(token) => {
  if (!token) throw new Error('Verification token is required');
   
  try {
    const response = await api.get(`/auth/verify-email/${token}`);
    
    // If login data is returned, store tokens
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      setRefreshToken(response.data.data.refreshToken);
      setAuthProvider('email');
      
      // Dispatch login event
      window.dispatchEvent(new Event('auth:login'));
    }
    
    return response.data;
  } catch (error) {
    console.error('Email verification error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Authenticate with Google OAuth
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<Object>} Auth response with user data
 */
export const googleAuth = async (accessToken) => {
  try {
    const response = await api.post('/auth/google', { access_token: accessToken });
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      setRefreshToken(response.data.data.refreshToken);
      
      // Store Google token for potential revocation
      localStorage.setItem('google_token', accessToken);
      setAuthProvider('google');
      
      // Dispatch login event
      window.dispatchEvent(new Event('auth:login'));
    }
    
    return {
      ...response.data,
      isGoogleUser: true
    };
  } catch (error) {
    console.error('Google auth error:', error);
    throw error;
  }
};

export default {
  register,
  login,
  refreshAuthToken,
  logout,
  getCurrentUser,
  verifyEmail,
  googleAuth
};