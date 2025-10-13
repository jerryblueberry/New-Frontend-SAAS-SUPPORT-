// src/api/axios.js
import axios from 'axios';
import { getAccessToken, removeTokens } from '../utils/storage';

// Connection status tracking
let isOnline = navigator.onLine;
let connectionRetryCount = 0;
const MAX_CONNECTION_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

// Listen for online/offline events
window.addEventListener('online', () => {
  isOnline = true;
  connectionRetryCount = 0;
  window.dispatchEvent(new Event('connection:restored'));
});

window.addEventListener('offline', () => {
  isOnline = false;
  window.dispatchEvent(new Event('connection:lost'));
});

// Create API instance with enhanced settings
const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',               
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-for-the-saas-short-job-finder.vercel.app/api/v1',
  withCredentials: true,
  timeout: 30000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Enhanced retry logic with exponential backoff
const retryRequest = async (config, retryCount = 0) => {
  if (retryCount >= MAX_CONNECTION_RETRIES) {
    throw new Error('Max retry attempts reached');
  }

  const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
  await new Promise(resolve => setTimeout(resolve, delay));
  
  return api(config);
};

// Check if error is retryable
const isRetryableError = (error) => {
  if (!isOnline) return false;
  
  const retryableErrors = [
    'ERR_NETWORK',
    'ERR_CONNECTION_REFUSED',
    'ERR_CONNECTION_TIMED_OUT',
    'ERR_INTERNET_DISCONNECTED'
  ];
  
  return retryableErrors.some(errType => 
    error.code === errType || 
    error.message?.includes(errType) ||
    error.message?.includes('Network Error') ||
    error.message?.includes('Connection refused')
  );
};

// Optimized token refresh logic
let isRefreshing = false;
let refreshSubscribers = [];
let refreshPromise = null;

// Helper to add new requesters to queue
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Helper to notify all pending requesters
const onRefreshSuccess = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Helper to reset refresh state
const resetRefreshState = () => {
  refreshSubscribers = [];
  isRefreshing = false;
  refreshPromise = null;
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // Skip adding token for auth endpoints that don't need it
    const skipAuthPaths = ['/auth/login', '/auth/signup', '/auth/google'];
    const skipAuth = skipAuthPaths.some(path => config.url?.includes(path));
    
    if (!skipAuth) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    // Reset retry count on successful response
    connectionRetryCount = 0;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle connection errors with retry logic
    if (isRetryableError(error) && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
      try {
        return await retryRequest(originalRequest, originalRequest._retryCount);
      } catch (retryError) {
        // Emit connection error event for UI handling
        window.dispatchEvent(new CustomEvent('api:connection-error', {
          detail: { error: retryError, isOnline }
        }));
        return Promise.reject(retryError);
      }
    }
    
    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry auth endpoints
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/signup') ||
        originalRequest.url?.includes('refresh-token')
      ) {
        return Promise.reject(error);
      }
      
      // Mark as retried to avoid infinite loops
      originalRequest._retry = true;
      
      // Use existing refresh promise if one is in progress
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const authModule = await import('./auth');
          refreshPromise = authModule.refreshAuthToken();
          const newAccessToken = await refreshPromise;
          
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            onRefreshSuccess(newAccessToken);
            resetRefreshState();
            return api(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          resetRefreshState();
          removeTokens();
          window.dispatchEvent(new Event('auth:expired'));
          return Promise.reject(refreshError);
        }
      }
      
      // For other requests that come in while refreshing
      return new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }
    
    // Handle other HTTP errors
    if (error.response) {
      const status = error.response.status;
      
      // Emit specific error events for different status codes
      switch (status) {
        case 403:
          window.dispatchEvent(new CustomEvent('api:forbidden', { detail: error }));
          break;
        case 404:
          window.dispatchEvent(new CustomEvent('api:not-found', { detail: error }));
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          window.dispatchEvent(new CustomEvent('api:server-error', { detail: error }));
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;