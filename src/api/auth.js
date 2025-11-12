  // src/api/auth.js
import api from './axios';
import { 
  getAccessToken, 
  setAccessToken, 
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
    // Backend sets refresh token in HTTP-only cookie
    const response = await api.post('/auth/signup', userData, { withCredentials: true });
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      // Refresh token is in HTTP-only cookie (managed by backend)
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
 * Register a new client user
 * @param {Object} userData - Client registration data
 */
export const registerClient = async(userData) => {
  try {
    // Backend sets refresh token in HTTP-only cookie
    const response = await api.post('/auth/signup/client', { 
      ...userData, 
      role: 'client' // Explicitly set role as client
    }, { withCredentials: true });
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      // Refresh token is in HTTP-only cookie (managed by backend)
      setAuthProvider('email');
      window.dispatchEvent(new Event('auth:login'));
    }
    return response.data;
  } catch (error) {
    console.error('Client registration error:', error);
    throw error;
  }
};

/**
 * Log in a user with email/password
 * Backend sets refresh token in HTTP-only cookie and returns access token
 * @param {Object} credentials - Login credentials { email, password }
 * @returns {Promise<Object>} Login response with user data
 */
export const login = async (credentials) => {
  try {
    // Backend handles:
    // 1. Authentication
    // 2. Token generation (access + refresh)
    // 3. Setting refresh token in HTTP-only cookie
    // 4. Telemetry logging
    const response = await api.post('/auth/login', credentials, { withCredentials: true });
  
    if (response.data?.data?.accessToken) {
      // Store access token in localStorage (needed for Authorization header)
      // Refresh token is in HTTP-only cookie (managed by backend)
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      setAuthProvider('email');
      
      // Dispatch login event for other components
      window.dispatchEvent(new Event('auth:login'));
    }
      
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      removeTokens();
    } else if (error.response?.status === 403) {
      // Account locked or inactive
      throw new Error(error.response.data?.message || 'Account is locked or inactive');
    }
    
    throw error;
  }
};

/**
 * Refresh the authentication token with retry logic
 * Backend manages refresh token in HTTP-only cookies
 * @returns {Promise<string>} New access token
 */
export const refreshAuthToken = async (retryCount = 0) => {
  try {
    // Cookie-based refresh - refresh token is automatically sent in cookies
    // Backend handles token rotation and telemetry logging
    const response = await api.post('/auth/refresh-token', {}, { withCredentials: true });
    
    if (response.data?.data?.accessToken) {
      // Extract token expiration from JWT payload (more accurate)
      const token = response.data.data.accessToken;
      setAccessToken(token, response.data.data.expiresIn);
      
      // Note: refresh token is managed by backend in HTTP-only cookies
      // Backend automatically rotates refresh tokens and handles revocation
      
      return token;
    }
    
    throw new Error('Invalid token response');
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Handle specific error codes from backend
    if (error.response?.data?.code === 'NO_REFRESH_TOKEN') {
      // No refresh token cookie - session expired
      removeTokens();
      window.dispatchEvent(new Event('auth:expired'));
      throw new Error('Session expired. Please log in again.');
    }
    
    // Retry logic for network errors
    if ((error.message === 'Network Error' || error.code === 'ERR_NETWORK') && retryCount < MAX_REFRESH_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, TOKEN_REFRESH_RETRY_DELAY * (retryCount + 1)));
      return refreshAuthToken(retryCount + 1);
    }
    
    if (error.response?.status === 401) {
      removeTokens();
      window.dispatchEvent(new Event('auth:expired'));
    }
    
    throw error;
  }
};

/**
 * Log out the current user with cleanup and token revocation
 * @param {boolean} allDevices - Whether to log out from all devices
 * @returns {Promise<Object>} Logout response with tokensRevoked count
 */
export const logout = async (allDevices = false) => {
  const isGoogleUser = getAuthProvider() === 'google';
  let logoutResponse = null;
  
  try {
    // Cookie-based logout - refresh token is automatically sent in cookies
    // Backend will revoke tokens and return count of revoked tokens
    const response = await api.post('/auth/logout', { allDevices }, { withCredentials: true });
    logoutResponse = response.data;
    
    // Log logout success with token revocation info
    if (response.data?.tokensRevoked !== undefined) {
      console.log(`Logged out successfully. ${response.data.tokensRevoked} token(s) revoked.`);
    }
    
    // Handle Google token revocation
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
    // Even if server logout fails, proceed with local cleanup
  } finally {
    // Always clean up local state
    removeTokens();
    localStorage.removeItem('google_token');
    if (window.queryClient) {
      window.queryClient.clear();
    }
    window.dispatchEvent(new Event('auth:logout'));
  }
  
  return logoutResponse;
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
    // Backend sets refresh token in HTTP-only cookie
    const response = await api.get(`/auth/verify-email/${token}`, { withCredentials: true });
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      // Refresh token is in HTTP-only cookie (managed by backend)
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
    
    // Backend authentication - sets refresh token in HTTP-only cookie
    const response = await api.post('/auth/google', { 
      access_token: accessToken,
      ...extra
    }, { withCredentials: true });
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      // Refresh token is in HTTP-only cookie (managed by backend)
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

/**
 * Authenticate client with Google OAuth (client endpoint)
 */
export const googleAuthClient = async (accessToken, extra = {}) => {
  try {
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    if (!googleResponse.ok) {
      throw new Error(`Google token validation failed: ${googleResponse.statusText}`);
    }
    // Backend sets refresh token in HTTP-only cookie
    const response = await api.post('/auth/google/client', { 
      access_token: accessToken,
      role: 'client', // Explicitly set role as client
      ...extra
    }, { withCredentials: true });
    
    if (response.data?.data?.accessToken) {
      setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
      // Refresh token is in HTTP-only cookie (managed by backend)
      localStorage.setItem('google_token', accessToken);
      setAuthProvider('google');
      window.dispatchEvent(new Event('auth:login'));
    }
    return {
      ...response.data,
      isGoogleUser: true
    };
  } catch (error) {
    console.error('Google client auth error:', error);
    const errorMessage = error.response?.data?.message || 'Failed to authenticate with Google. Please try again.';
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.statusCode = error.response?.status;
    throw enhancedError;
  }
};

export default {
  register,
  registerClient,
  login,
  refreshAuthToken,
  logout,
  getCurrentUser,
  verifyEmail,
  googleAuth,
  googleAuthClient
};