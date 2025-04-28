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
    // Don't attempt verification if we don't have valid tokens
    if (!hasValidAuth()) {
      return false;
    }
    
    try {
      // Get user data from server
      const userData = await authAPI.getCurrentUser();
      
      // Dispatch success to update context
      context.dispatch({
        type: 'AUTH_SUCCESS',
        payload: userData
      });
      
      return true;
    } catch (error) {
      console.error('Auth verification failed:', error);
      
      // If error is due to token expiration, try refreshing once
      if (error.response?.status === 401) {
        try {
          await authAPI.refreshAuthToken();
          const userData = await authAPI.getCurrentUser();
          
          context.dispatch({
            type: 'AUTH_SUCCESS',
            payload: userData
          });
          
          return true;
        } catch (refreshError) {
          // If refresh fails, clear auth state
          context.dispatch({ type: 'AUTH_LOGOUT' });
          
          // Dispatch event for routing components
          // window.dispatchEvent(new Event('auth:expired'));
          return false;
        }
      }
      
      return false;
    }
  }, [context]);
  
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
    googleLogin
  };
};

export default useAuth;