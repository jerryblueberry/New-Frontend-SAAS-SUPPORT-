// src/hooks/useAuth.js
import { useCallback } from 'react';
import { useAuth as useAuthContext } from '../context/AuthContext';
import * as authAPI from '../api/auth';
import { hasValidAuth } from '../utils/storage';

/**
 * Custom hook to access authentication context with enhanced functionality
 * This is a wrapper around the base useAuth from AuthContext that adds utility methods
 * @returns {Object} Auth context with additional utility methods
 */
export const useAuth = () => {
  // Use the base useAuth hook from AuthContext
  const context = useAuthContext();
  
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
      // Use the refreshAuthToken from context if available, otherwise use API directly
      if (context.refreshAuthToken) {
        await context.refreshAuthToken();
      } else {
        await authAPI.refreshAuthToken();
      }
      
      // Refresh user data by calling /auth/me
      const userData = await authAPI.getCurrentUser();
      
      // Update context if needed (context should handle this automatically)
      return true;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return false;
    }
  }, [context]);

  /**
   * Login with Google OAuth
   * Uses the signIn method from context which handles state updates
   * @param {string} googleToken - Google OAuth access token
   * @returns {Promise<Object>} Auth result
   */
  const googleLogin = useCallback(async (googleToken) => {
    try {
      const result = await authAPI.googleAuth(googleToken);
      
      // Use signIn from context to update state properly
      if (context.signIn) {
        await context.signIn(result.data, true, true);
      }
      
      return result;
    } catch (error) {
      console.error('Google login failed:', error);
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