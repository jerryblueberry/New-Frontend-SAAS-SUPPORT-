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

// Constants for token management
const TOKEN_REFRESH_INTERVAL = 4 * 60 * 1000; // 4 minutes
const TOKEN_EXPIRY_BUFFER = 5 * 60; // 5 minutes in seconds

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  authError: null,
  tokenRefreshInProgress: false
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
        authError: null,
        tokenRefreshInProgress: false
      };
    case 'AUTH_FAIL':
      return { 
        ...state, 
        loading: false, 
        authError: action.payload,
        tokenRefreshInProgress: false
      };
    case 'AUTH_LOGOUT':
      return { 
        ...initialState, 
        loading: false 
      };
    case 'TOKEN_REFRESH_START':
      return {
        ...state,
        tokenRefreshInProgress: true
      };
    case 'TOKEN_REFRESH_END':
      return {
        ...state,
        tokenRefreshInProgress: false
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

  // Proactive token refresh with debouncing
  const checkAndRefreshToken = useCallback(async () => {
    if (state.tokenRefreshInProgress) return;

    try {
      dispatch({ type: 'TOKEN_REFRESH_START' });
      
      // Check if token is expiring soon
      if (isTokenExpiringSoon(TOKEN_EXPIRY_BUFFER)) {
        await refreshAuthToken();
        // Refresh user data after token refresh
        const userResponse = await api.get('/auth/me');
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: userResponse.data.data.user 
        });
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
      // Only logout if it's an authentication error
      if (error.response?.status === 401) {
        handleAuthExpired();
      }
    } finally {
      dispatch({ type: 'TOKEN_REFRESH_END' });
    }
  }, [state.tokenRefreshInProgress]);

  // Handle session expiry
  const handleAuthExpired = useCallback(() => {
    dispatch({ type: 'AUTH_LOGOUT' });
    removeTokens();
    // Clear any sensitive data
    localStorage.removeItem('google_token');
    sessionStorage.clear();
    // Clear query cache
    if (window.queryClient) {
      window.queryClient.clear();
    }
    // Dispatch logout event
    window.dispatchEvent(new Event('auth:logout'));
  }, []);

  // Optimized auth verification
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!accessToken && !refreshToken) {
          handleAuthExpired();
          return;
        }

        // Verify current token
        if (accessToken && isTokenValid(accessToken)) {
          try {
            const userResponse = await api.get('/auth/me');
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: userResponse.data.data.user 
            });
            return;
          } catch (error) {
            if (error.response?.status === 401) {
              // Token is invalid, try refresh
              if (refreshToken) {
                await refreshAuthToken();
                const userResponse = await api.get('/auth/me');
                dispatch({ 
                  type: 'AUTH_SUCCESS', 
                  payload: userResponse.data.data.user 
                });
                return;
              }
            }
            throw error;
          }
        }

        handleAuthExpired();
      } catch (error) {
        console.error('Auth verification error:', error);
        handleAuthExpired();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    verifyAuth();
    
    // Set up periodic token refresh
    const tokenCheckInterval = setInterval(checkAndRefreshToken, TOKEN_REFRESH_INTERVAL);
    
    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [checkAndRefreshToken, handleAuthExpired]);

  // Enhanced sign in with better error handling
  const signIn = async (credentials, skipApiCall = false, isGoogleUser = false) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      if (credentials?.accessToken || skipApiCall) {
        if (credentials?.accessToken) {
          setAccessToken(credentials.accessToken, credentials.expiresIn);
          if (credentials.refreshToken) {
            setRefreshToken(credentials.refreshToken);
          }
          
          if (isGoogleUser) {
            setAuthProvider('google');
            if (credentials.googleToken) {
              localStorage.setItem('google_token', credentials.googleToken);
            }
          } else {
            setAuthProvider('email');
          }
        }
        
        const userResponse = await api.get('/auth/me');
        dispatch({ type: 'AUTH_SUCCESS', payload: userResponse.data.data.user });
        return userResponse.data.data.user;
      }
      
      const response = await api.post('/auth/login', credentials);
      
      if (response.data?.data?.accessToken) {
        setAccessToken(response.data.data.accessToken, response.data.data.expiresIn);
        setRefreshToken(response.data.data.refreshToken);
        setAuthProvider('email');
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.data.data.user });
      return response.data.data.user;
    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = 'Authentication failed';
      
      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Incorrect email or password';
        } else if (error.response.status === 403) {
          errorMessage = 'Account not verified. Please check your email.';
        }
      }
      
      dispatch({ 
        type: 'AUTH_FAIL', 
        payload: { 
          message: errorMessage,
          response: error.response?.data?.message 
        } 
      });
      throw error;
    }
  };

  // Enhanced sign out with cleanup
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
      handleAuthExpired();
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      signIn,
      signOut,
      clearAuthError: () => dispatch({ type: 'CLEAR_ERROR' }),
      refreshAuthToken: checkAndRefreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };