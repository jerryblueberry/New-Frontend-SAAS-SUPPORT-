// src/hooks/useAuth.js
import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import * as authAPI from '../api/auth';
import { hasValidAuth } from '../utils/storage';

/**
 * Custom hook to access authentication context with enhanced functionality
 * @returns {Object} Auth context with additional utility methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  /**
   * Verifies current authentication state and refreshes user data if needed
   * @returns {Promise<boolean>} Authentication status
   */
  const verifyAuth = useCallback(async () => {
    try {
      // Check if we have valid tokens
      if (!hasValidAuth()) {
        return false;
      }

      // Verify token with backend
      await authAPI.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  }, []);

  /**
   * Handles token refresh and user data update
   * @returns {Promise<boolean>} Success status
   */
  const refreshUserData = useCallback(async () => {
    try {
      await authAPI.refreshAuthToken();
      const userData = await authAPI.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return false;
    }
  }, []);

  // Login with Google
  const googleLogin = useCallback(async (googleToken) => {
    try {
      const result = await authAPI.googleAuth(googleToken);
      // Note: token storage is handled in the API function
      
      context.dispatch({
        type: 'AUTH_SUCCESS',
        payload: result.data?.user
      });
      
      return result;
    } catch (error) {
      context.dispatch({
        type: 'AUTH_FAIL',
        payload: { message: error.response?.data?.message || 'Google login failed' }
      });
      throw error;
    }
  }, [context]);
  
  return {
    ...context,
    verifyAuth,
    refreshUserData,
    googleLogin
  };
};

export default useAuth;