// src/api/axios.js
import axios from 'axios';
import { getAccessToken, removeTokens } from '../utils/storage';

// Create API instance with optimized settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  timeout: 20000, // Reduced timeout for faster failure
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

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

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if:
    // 1. It's not a 401 error
    // 2. It's already been retried
    // 3. It's a refresh token request that failed
    if (
      error.response?.status !== 401 || 
      originalRequest._retry ||
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
);

export default api;