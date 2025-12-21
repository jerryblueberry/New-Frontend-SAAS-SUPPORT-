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
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',               
  // baseURL: import.meta.env.VITE_API_URL || 'https://backend-for-the-saas-short-job-finder.vercel.app/api/v1',
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

// Optimized token refresh logic with circuit breaker pattern
let isRefreshing = false;
let refreshSubscribers = [];
let refreshPromise = null;

// Circuit breaker state to prevent infinite refresh loops
const circuitBreaker = {
  failures: 0,
  lastFailureTime: null,
  isOpen: false,
  maxFailures: 3, // Open circuit after 3 consecutive failures
  resetTimeout: 60000, // Reset after 60 seconds
  cooldownPeriod: 30000, // Wait 30 seconds before retrying after circuit opens
};

// Rate limit tracking
const rateLimitState = {
  last429Time: null,
  consecutive429s: 0,
  max429Retries: 2, // Max 2 retries for 429 errors
  backoffDelay: 5000, // Start with 5 second delay
};

// Helper to check if circuit breaker should allow refresh attempt
const canAttemptRefresh = () => {
  // If circuit is closed, allow attempt
  if (!circuitBreaker.isOpen) {
    return true;
  }
  
  // If circuit is open, check if cooldown period has passed
  const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailureTime;
  if (timeSinceLastFailure > circuitBreaker.cooldownPeriod) {
    // Reset circuit breaker
    circuitBreaker.isOpen = false;
    circuitBreaker.failures = 0;
    return true;
  }
  
  return false;
};

// Helper to record refresh failure
const recordRefreshFailure = (error) => {
  circuitBreaker.failures++;
  circuitBreaker.lastFailureTime = Date.now();
  
  // Open circuit if max failures reached
  if (circuitBreaker.failures >= circuitBreaker.maxFailures) {
    circuitBreaker.isOpen = true;
    console.warn('Token refresh circuit breaker opened due to consecutive failures');
  }
  
  // Handle rate limiting (429 errors)
  if (error.response?.status === 429) {
    rateLimitState.last429Time = Date.now();
    rateLimitState.consecutive429s++;
    
    // If too many 429s, open circuit breaker
    if (rateLimitState.consecutive429s >= rateLimitState.max429Retries) {
      circuitBreaker.isOpen = true;
      console.warn('Token refresh circuit breaker opened due to rate limiting');
    }
  } else {
    // Reset 429 counter on non-429 errors
    rateLimitState.consecutive429s = 0;
  }
};

// Helper to record refresh success
const recordRefreshSuccess = () => {
  // Reset circuit breaker on successful refresh
  circuitBreaker.failures = 0;
  circuitBreaker.isOpen = false;
  circuitBreaker.lastFailureTime = null;
  rateLimitState.consecutive429s = 0;
  rateLimitState.last429Time = null;
};

// Helper to check if error indicates user doesn't exist
const isUserNotFoundError = (error) => {
  const message = error.response?.data?.message || error.message || '';
  return message.includes('User no longer exists') || 
         message.includes('user not found') ||
         (error.response?.status === 401 && message.includes('log in again'));
};

// Helper to add new requesters to queue
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Helper to notify all pending requesters on success
const onRefreshSuccess = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Helper to notify all pending requesters on failure
const onRefreshFail = (error) => {
  refreshSubscribers.forEach(callback => {
    // Call with error to reject the promise
    if (callback.length > 1) {
      callback(null, error);
    } else {
      // Fallback for callbacks that don't accept error
      callback(null);
    }
  });
  refreshSubscribers = [];
};

// Helper to reset refresh state
const resetRefreshState = () => {
  refreshSubscribers = [];
  isRefreshing = false;
  refreshPromise = null;
};

// Helper function to check if URL is a public endpoint
const isPublicEndpoint = (url) => {
  if (!url) return false;
  
  const publicPaths = [
    '/auth/login', 
    '/auth/signup', 
    '/auth/google',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/references/respond/' // Public reference check endpoint
  ];
  
  return publicPaths.some(path => url.includes(path));
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // Skip adding token for public endpoints
    if (!isPublicEndpoint(config.url)) {
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
    if (isRetryableError(error)) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      try {
        return await retryRequest(originalRequest, originalRequest._retryCount - 1);
      } catch (retryError) {
        // Emit connection error event for UI handling
        window.dispatchEvent(new CustomEvent('api:connection-error', {
          detail: { error: retryError, isOnline, retryCount: originalRequest._retryCount }
        }));
        return Promise.reject(retryError);
      }
    }
    
    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry public endpoints - just reject immediately
      if (isPublicEndpoint(originalRequest.url) || originalRequest.url?.includes('refresh-token')) {
        return Promise.reject(error);
      }
      
      // Check if error indicates user doesn't exist - immediate logout
      if (isUserNotFoundError(error)) {
        console.warn('User not found - clearing authentication');
        removeTokens();
        window.dispatchEvent(new Event('auth:expired'));
        return Promise.reject(new Error('User no longer exists. Please log in again.'));
      }
      
      // Check circuit breaker before attempting refresh
      if (!canAttemptRefresh()) {
        console.warn('Token refresh circuit breaker is open - skipping refresh attempt');
        removeTokens();
        window.dispatchEvent(new Event('auth:expired'));
        return Promise.reject(new Error('Too many refresh attempts. Please log in again.'));
      }
      
      // Check if we're rate limited and need to wait
      // Note: We can't await here in the interceptor, so we'll handle it in the refresh function
      if (rateLimitState.last429Time) {
        const timeSinceLast429 = Date.now() - rateLimitState.last429Time;
        if (timeSinceLast429 < rateLimitState.backoffDelay) {
          console.warn('Rate limited - circuit breaker will prevent refresh attempt');
          removeTokens();
          window.dispatchEvent(new Event('auth:expired'));
          return Promise.reject(new Error('Too many refresh attempts. Please log in again.'));
        }
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
            recordRefreshSuccess();
            onRefreshSuccess(newAccessToken);
            resetRefreshState();
            return api(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          // Record failure for circuit breaker
          recordRefreshFailure(refreshError);
          
          // Check if user doesn't exist in refresh error
          if (isUserNotFoundError(refreshError)) {
            console.warn('User not found during token refresh - clearing authentication');
            removeTokens();
            window.dispatchEvent(new Event('auth:expired'));
            onRefreshFail(refreshError);
            resetRefreshState();
            return Promise.reject(new Error('User no longer exists. Please log in again.'));
          }
          
          // Handle rate limiting (429) errors
          if (refreshError.response?.status === 429) {
            const retryAfter = refreshError.response.headers['retry-after'];
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : rateLimitState.backoffDelay;
            rateLimitState.backoffDelay = Math.min(waitTime * 2, 60000); // Max 60 seconds
            
            console.warn(`Rate limited on token refresh - circuit breaker will prevent further attempts`);
            removeTokens();
            window.dispatchEvent(new Event('auth:expired'));
            onRefreshFail(refreshError);
            resetRefreshState();
            return Promise.reject(new Error('Too many refresh attempts. Please log in again.'));
          }
          
          // Notify all queued requests of failure
          onRefreshFail(refreshError);
          resetRefreshState();
          removeTokens();
          
          // Only emit auth:expired if not on a public route
          const publicRoutes = ['/reference-check', '/forgot-password', '/reset-password'];
          const isPublicRoute = publicRoutes.some(route => window.location.pathname.startsWith(route));
          
          if (!isPublicRoute) {
            window.dispatchEvent(new Event('auth:expired'));
          }
          
          return Promise.reject(refreshError);
        }
      }
      
      // For other requests that come in while refreshing
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token, error) => {
          if (error) {
            reject(error);
          } else if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          } else {
            reject(new Error('Token refresh failed'));
          }
        });
      });
    }
    
    // Handle 429 rate limit errors
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const message = error.response.data?.message || 'Too many requests. Please try again later.';
      
      // Emit rate limit event for UI handling
      window.dispatchEvent(new CustomEvent('api:rate-limited', {
        detail: { 
          error, 
          retryAfter: retryAfter ? parseInt(retryAfter) : null,
          message 
        }
      }));
      
      // Don't retry refresh token endpoint on 429
      if (originalRequest.url?.includes('refresh-token')) {
        console.warn('Rate limited on refresh token endpoint - clearing authentication');
        removeTokens();
        window.dispatchEvent(new Event('auth:expired'));
        return Promise.reject(new Error('Too many refresh attempts. Please log in again.'));
      }
      
      return Promise.reject(error);
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
// Certification edit helpers (best-practice thin wrappers)
export const fetchCertificationByType = (typeId) => api.get(`/onboarding/certifications/${typeId}`);
export const updateCertificationByType = (typeId, payload) => api.put(`/onboarding/certifications/${typeId}`, payload);
export const deleteCertificationDocument = (typeId, publicId) => api.delete(`/onboarding/certifications/${typeId}/documents/${encodeURIComponent(publicId)}`);
// Other certifications helpers
export const fetchOtherCertificationById = (id) => api.get(`/onboarding/other-certifications/${id}`);
export const updateOtherCertificationById = (id, payload) => api.put(`/onboarding/other-certifications/${id}`, payload);
export const createOtherCertification = (payload) => api.post(`/onboarding/other-certifications`, payload);
export const deleteOtherCertificationById = (id) => api.delete(`/onboarding/other-certifications/${id}`);
// Work history section update (PATCH)
export const updateWorkHistorySection = (section, data) => api.patch(`/onboarding/work-history/${section}`, { data });