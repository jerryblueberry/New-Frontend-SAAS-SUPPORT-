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
// Enhanced Google Auth function with better debugging
export const googleAuth = async (accessToken) => {
  try {
    console.log('Starting Google authentication process');
    console.log('Access token present:', !!accessToken);
    
    // Test direct API call to Google first to verify token is valid
    try {
      console.log('Testing Google token directly with Google API...');
      const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      
      if (!googleResponse.ok) {
        console.error('Google API direct test failed:', googleResponse.status, googleResponse.statusText);
        const errorText = await googleResponse.text();
        console.error('Google error response:', errorText);
        throw new Error(`Google token validation failed: ${googleResponse.statusText}`);
      }
      
      const userData = await googleResponse.json();
      console.log('Google token is valid. User data received:', {
        email: userData.email,
        name: userData.name,
        verified: userData.email_verified
      });
    } catch (directTestError) {
      console.error('Direct Google API test failed:', directTestError);
      throw new Error('Invalid Google token. Please try logging in again.');
    }
    
    // Now try your backend API
    console.log('Sending token to backend...');
    try {
      const response = await api.post('/auth/google', { 
        access_token: accessToken 
      });
      
      console.log('Backend response received:', response.status);
      
      if (response.data?.data?.accessToken) {
        console.log('Authentication successful, storing tokens');
        setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
        setRefreshToken(response.data.data.refreshToken);
        
        // Store Google token for potential revocation
        localStorage.setItem('google_token', accessToken);
        setAuthProvider('google');
        
        // Dispatch login event
        window.dispatchEvent(new Event('auth:login'));
        
        console.log('Google authentication completed successfully');
      } else {
        console.warn('Missing tokens in successful response:', response.data);
      }
      
      return {
        ...response.data,
        isGoogleUser: true
      };
    } catch (backendError) {
      console.error('Backend API error:', backendError);
      console.error('Response data:', backendError.response?.data);
      console.error('Status code:', backendError.response?.status);
      
      // Try to extract the error message from the HTML response if it's a 500 error
      if (backendError.response?.status === 500 && backendError.response?.data) {
        try {
          const htmlError = backendError.response.data;
          
          // Check if it's HTML and try to extract the error message
          if (typeof htmlError === 'string' && htmlError.includes('<!DOCTYPE html>')) {
            // Try to extract error from HTML
            const errorMatch = htmlError.match(/<pre>([\s\S]*?)<\/pre>/);
            if (errorMatch && errorMatch[1]) {
              console.error('Server error details:', errorMatch[1].trim());
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
      }
      
      throw backendError;
    }
  } catch (error) {
    console.error('Google auth error:', error);
    
    // Format error for user display
    const errorMessage = error.response?.data?.message || 
                        'Failed to authenticate with Google. Please try again.';
    
    // Create a enhanced error object with more details
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