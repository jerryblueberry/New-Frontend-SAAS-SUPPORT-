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

  // Enhanced token refresh with exponential backoff and connection monitoring
  const checkAndRefreshToken = useCallback(async (retryCount = 0) => {
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
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        handleAuthExpired();
      } else if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        // Network error - retry with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          setTimeout(() => {
            checkAndRefreshToken(retryCount + 1);
          }, delay);
          return;
        }
        // Max retries reached, emit connection error
        window.dispatchEvent(new CustomEvent('auth:connection-error', {
          detail: { error, retryCount }
        }));
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

  // Enhanced auth verification with connection monitoring
  useEffect(() => {
    const verifyAuth = async (retryCount = 0) => {
      try {
        const accessToken = getAccessToken();

        if (!accessToken) {
          // No access token, try to refresh using cookies
          try {
            await checkAndRefreshToken();
            const userResponse = await api.get('/auth/me');
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: userResponse.data.data.user 
            });
            return;
          } catch (refreshError) {
            handleAuthExpired();
            return;
          }
        }

        // Verify current token
        if (isTokenValid(accessToken)) {
          try {
            const userResponse = await api.get('/auth/me');
            dispatch({ 
              type: 'AUTH_SUCCESS', 
              payload: userResponse.data.data.user 
            });
            return;
          } catch (error) {
            if (error.response?.status === 401) {
              // Token is invalid, try to refresh using cookies
              try {
                await checkAndRefreshToken();
                const userResponse = await api.get('/auth/me');
                dispatch({ 
                  type: 'AUTH_SUCCESS', 
                  payload: userResponse.data.data.user 
                });
                return;
              } catch (refreshError) {
                handleAuthExpired();
                return;
              }
            }
            throw error;
          }
        }

        // Access token is expired, try to refresh using cookies
        try {
          await checkAndRefreshToken();
          const userResponse = await api.get('/auth/me');
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: userResponse.data.data.user 
          });
          return;
        } catch (refreshError) {
          handleAuthExpired();
          return;
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        
        // Handle connection errors with retry
        if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            setTimeout(() => {
              verifyAuth(retryCount + 1);
            }, delay);
            return;
          }
          // Max retries reached, show connection error but don't logout
          window.dispatchEvent(new CustomEvent('auth:connection-error', {
            detail: { error, retryCount }
          }));
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        
        handleAuthExpired();
      } finally {
        if (retryCount === 0) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    // Check if we're on a public route that doesn't need auth
    const publicRoutes = ['/login', '/register', '/reference-check', '/forgot-password', '/reset-password', '/verify-email'];
    const currentPath = window.location.pathname;
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
    
    // Only verify auth if not on a public route
    if (!isPublicRoute) {
      verifyAuth();
    } else {
      // On public route, just mark loading as complete without auth
      dispatch({ type: 'SET_LOADING', payload: false });
    }
    
    // Set up periodic token refresh (only if not on public route)
    const tokenCheckInterval = !isPublicRoute ? setInterval(checkAndRefreshToken, TOKEN_REFRESH_INTERVAL) : null;
    
    // Listen for connection events
    const handleConnectionRestored = () => {
      if (!state.isAuthenticated) {
        verifyAuth();
      }
    };
    
    window.addEventListener('connection:restored', handleConnectionRestored);
    
    return () => {
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval);
      }
      window.removeEventListener('connection:restored', handleConnectionRestored);
    };
  }, [checkAndRefreshToken, handleAuthExpired, state.isAuthenticated]);

  // Enhanced sign in with better error handling
  const signIn = async (credentials, skipApiCall = false, isGoogleUser = false) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      if (credentials?.accessToken || skipApiCall) {
        if (credentials?.accessToken) {
          setAccessToken(credentials.accessToken, credentials.expiresIn);
          // Note: refresh token is managed by backend in cookies, no need to store in localStorage
          
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
        // Note: refresh token is managed by backend in cookies, no need to store in localStorage
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