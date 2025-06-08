/* eslint-disable no-unused-vars */
import { createContext, useReducer, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { 
  getAccessToken, 
  getRefreshToken, 
  setAccessToken, 
  setRefreshToken, 
  removeTokens,
  isTokenExpiringSoon,
  hasValidAuth,
  setAuthProvider,
  getAuthProvider,
  isTokenValid
} from '../utils/storage';
import { refreshAuthToken } from '../api/auth';
import React from 'react';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  authError: null
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, authError: null };
    case 'AUTH_SUCCESS':
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: true, 
        loading: false, 
        authError: null 
      };
    case 'AUTH_FAIL':
      // Handle specific error cases
      { let errorMessage = action.payload?.message || 'Authentication failed';
      if (action.payload?.response?.status === 401) {
        errorMessage = 'Incorrect email or password';
      } else if (action.payload?.response?.status === 403) {
        errorMessage = 'Account not verified. Please check your email.';
      }
      
      return { 
        ...state, 
        loading: false, 
        authError: { message: errorMessage } 
      }; }
    case 'AUTH_LOGOUT':
      return { 
        ...initialState, 
        loading: false 
      };
    case 'CLEAR_ERROR':
      return { ...state, authError: null };
    default:
      return state;
  }
}
// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Proactive token refresh
  const checkAndRefreshToken = useCallback(async () => {
    try {
      // If token expires soon (within 5 minutes), refresh it proactively
      if (isTokenExpiringSoon(300)) {
        await refreshAuthToken();
      }
    } catch (error) {
      console.warn('Proactive token refresh failed:', error);
    }
  }, []);

  // Handle session expiry
  const handleAuthExpired = useCallback(() => {
    // console.log('Auth expired event received');
    dispatch({ type: 'AUTH_LOGOUT' });
    removeTokens();
  }, []);
  
  // Verify auth state on app load and set up listeners
  useEffect(() => {
    const verifyAuth = async () => {
      dispatch({ type: 'AUTH_START' });
      
      // Check if we have valid tokens using the enhanced token validation
      if (!hasValidAuth()) {
        const refreshToken = getRefreshToken();
        
        // If we have a refresh token, try to use it
        if (refreshToken) {
          try {
            await refreshAuthToken();
            
            // After refresh, check if we have a valid token now
            if (hasValidAuth()) {
              // Token refresh worked, get user profile
              try {
                const userResponse = await api.get('/auth/me');
                dispatch({ 
                  type: 'AUTH_SUCCESS', 
                  payload: userResponse.data.data.user 
                });
                return;
              } catch (userError) {
                console.error('User fetch failed after token refresh:', userError);
                // Fall through to logout
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed during auth verification:', refreshError);
            // Fall through to logout
          }
          
          // If we reach here with a refresh token, it means refresh failed
          // Clear tokens to avoid future failed attempts
          removeTokens();
        }
        
        // No valid tokens or refresh failed
        dispatch({ type: 'AUTH_LOGOUT' });
        return;
      }
      
      // We have a valid access token, get user profile
      try {
        const response = await api.get('/auth/me');
        
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: response.data.data.user 
        });
      } catch (error) {
        console.error('Auth verification error:', error.response?.data || error.message);
        
        // If token is valid but request failed, something else is wrong
        // Clear auth state and tokens
        dispatch({ type: 'AUTH_LOGOUT' });
        removeTokens();
      }
    };

    // Execute auth verification
    verifyAuth();
    
    // Set up auth expiration event listener
    // window.addEventListener('auth:expired', handleAuthExpired);
    
    // Set up periodic token refresh check
    const tokenCheckInterval = setInterval(checkAndRefreshToken, 3 * 60 * 1000); // Every 3 minutes
    
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      clearInterval(tokenCheckInterval);
    };
  }, [handleAuthExpired, checkAndRefreshToken]);

  /**
   * Sign in with credentials or token-based auth
   */
  const signIn = async (credentials, skipApiCall = false, isGoogleUser = false) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      // If we already have tokens (from Google auth or other external provider)
      if (credentials?.accessToken || skipApiCall) {
        // If we have tokens in the credentials, set them
        if (credentials?.accessToken) {
          setAccessToken(credentials.accessToken, credentials.expiresIn);
          if (credentials.refreshToken) {
            setRefreshToken(credentials.refreshToken);
          }
          
          // Store the auth provider
          if (isGoogleUser) {
            setAuthProvider('google');
            // Store google token separately if available
            if (credentials.googleToken) {
              localStorage.setItem('google_token', credentials.googleToken);
            }
          } else {
            setAuthProvider('email');
          }
        }
        
        // Get user profile
        const userResponse = await api.get('/auth/me');
        dispatch({ type: 'AUTH_SUCCESS', payload: userResponse.data.data.user });
        return userResponse.data.data.user;
      }
      
      // Normal login with credentials
      const response = await api.post('/auth/login', credentials);
      
      // Store tokens from response
      if (response.data?.data?.accessToken) {
        setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
        setRefreshToken(response.data.data.refreshToken);
        setAuthProvider('email'); // Default to email auth for regular login
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.data.data.user });
      return response.data.data.user;
    } catch (error) {
      console.log("Login error:", error.response.data.message);
    
      // Handle different error cases
      let errorMessage = 'Authentication failed';
      
      if (error.response) {
        // Use server-provided message if available
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
        // Special case for 401 (incorrect credentials)
        else if (error.response.status === 401) {
          errorMessage = 'Incorrect email or password';
        }
        // Special case for 403 (account not verified)
        else if (error.response.status === 403) {
          errorMessage = 'Account not verified. Please check your email.';
        }
      }
      dispatch({ type: 'AUTH_FAIL', payload: { message: errorMessage,response:error.response.data.message } });
      throw error;
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (allDevices = false) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const refreshToken = getRefreshToken();
      const isGoogleUser = getAuthProvider() === 'google';
      
      if (refreshToken) {
        await api.post('/auth/logout', { 
          refreshToken, 
          allDevices 
        });
      }
      
      // Handle Google-specific logout
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
    }
    
    // Always clear tokens locally
    removeTokens();
    localStorage.removeItem('google_token');
    
    // Clear query cache if available
    if (window.queryClient) {
      window.queryClient.clear();
    }
    
    // Dispatch logout event to all PrivateRoute components
    window.dispatchEvent(new Event('auth:logout'));
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  /**
   * Clear authentication errors
   */
  const clearAuthError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signOut,
      clearAuthError,
      refreshAuthToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };