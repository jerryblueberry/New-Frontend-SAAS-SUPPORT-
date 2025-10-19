  // src/api/auth.js
import api from './axios';
import { 
  getAccessToken, 
  getRefreshToken, 
  setAccessToken, 
  setRefreshToken, 
  removeTokens,
  setAuthProvider,
  getAuthProvider
} from '../utils/storage';

// Constants
const TOKEN_REFRESH_RETRY_DELAY = 1000; // 1 second
const MAX_REFRESH_RETRIES = 3;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export const register = async(userData) => {
  try {
    const response = await api.post('/auth/signup', userData);
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      // Note: refresh token is managed by backend in cookies, no need to store in localStorage
      setAuthProvider('email');
      window.dispatchEvent(new Event('auth:login'));
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
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
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      // Note: refresh token is managed by backend in cookies, no need to store in localStorage
      setAuthProvider('email');
      window.dispatchEvent(new Event('auth:login'));
    }
      
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response?.status === 401) {
      removeTokens();
    }
    throw error;
  }
};

/**
 * Refresh the authentication token with retry logic
 * @returns {Promise<string>} New access token
 */
export const refreshAuthToken = async (retryCount = 0) => {
  try {
    // Cookie-based refresh - refresh token is automatically sent in cookies
    const response = await api.post('/auth/refresh-token');
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      // Note: refresh token is managed by backend in cookies, no need to store in localStorage
      return response.data.data.accessToken;
    }
    
    throw new Error('Invalid token response');
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Retry logic for network errors
    if (error.message === 'Network Error' && retryCount < MAX_REFRESH_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, TOKEN_REFRESH_RETRY_DELAY));
      return refreshAuthToken(retryCount + 1);
    }
    
    if (error.response?.status === 401) {
      removeTokens();
    }
    throw error;
  }
};

/**
 * Log out the current user with cleanup
 * @param {boolean} allDevices - Whether to log out from all devices
 * @returns {Promise<void>}
 */
export const logout = async (allDevices = false) => {
  const isGoogleUser = getAuthProvider() === 'google';
  
  try {
    // Cookie-based logout - refresh token is automatically sent in cookies
    await api.post('/auth/logout', { allDevices });
    
    // Handle Google logout
    if (isGoogleUser) {
      const googleToken = localStorage.getItem('google_token');
      if (googleToken) {
        try {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${googleToken}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
        } catch (googleError) {
          console.error('Google token revocation failed:', googleError);
        }
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clean up
    removeTokens();
    localStorage.removeItem('google_token');
    if (window.queryClient) {
      window.queryClient.clear();
    }
    window.dispatchEvent(new Event('auth:logout'));
  }
};

/**
 * Get the current user's profile with token validation
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  try {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  } catch (error) {
    if (error.response?.status === 401) {
      removeTokens();
    }
    throw error;
  }
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
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      setRefreshToken(response.data.data.refreshToken);
      setAuthProvider('email');
      window.dispatchEvent(new Event('auth:login'));
    }
    
    return response.data;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

/**
 * Authenticate with Google OAuth with enhanced error handling
 * @param {string} accessToken - Google OAuth access token
 * @returns {Promise<Object>} Auth response with user data
 */
export const googleAuth = async (accessToken, extra = {}) => {
  try {
    // Validate Google token
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    
    if (!googleResponse.ok) {
      throw new Error(`Google token validation failed: ${googleResponse.statusText}`);
    }
    
    const userData = await googleResponse.json();
    
    // Backend authentication
    const response = await api.post('/auth/google', { 
      access_token: accessToken,
      ...extra
    });
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      setRefreshToken(response.data.data.refreshToken);
      localStorage.setItem('google_token', accessToken);
      setAuthProvider('google');
      window.dispatchEvent(new Event('auth:login'));
    }
    
    return {
      ...response.data,
      isGoogleUser: true
    };
  } catch (error) {
    console.error('Google auth error:', error);
    
    const errorMessage = error.response?.data?.message || 
                        'Failed to authenticate with Google. Please try again.';
    
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.statusCode = error.response?.status;
    
    throw enhancedError;
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