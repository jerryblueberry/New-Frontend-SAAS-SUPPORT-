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
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
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
  
  // Optimized auth verification
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Quick check for tokens first
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        // If no tokens at all, fail fast
        if (!accessToken && !refreshToken) {
          dispatch({ type: 'AUTH_LOGOUT' });
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        // If we have a valid access token, verify it immediately
        if (accessToken && isTokenValid(accessToken)) {
          try {
            const userResponse = await api.get('/auth/me');
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: userResponse.data.data.user 
            });
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          } catch (error) {
            // If token is invalid, try refresh
            console.error('Token validation failed:', error);
          }
        }

        // Only try refresh if we have a refresh token
        if (refreshToken) {
          try {
            await refreshAuthToken();
            const userResponse = await api.get('/auth/me');
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: userResponse.data.data.user 
            });
          } catch (error) {
            console.error('Token refresh failed:', error);
            removeTokens();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Execute auth verification
    verifyAuth();
    
    // Set up periodic token refresh check with longer interval
    const tokenCheckInterval = setInterval(checkAndRefreshToken, 5 * 60 * 1000); // Every 5 minutes
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [checkAndRefreshToken]);

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