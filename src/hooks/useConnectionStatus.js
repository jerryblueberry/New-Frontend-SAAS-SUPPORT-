import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for monitoring connection status
 * Provides real-time connection state and error handling
 * Only shows connection errors for genuine network issues, not API errors
 */
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionError, setConnectionError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const hasShownOfflineRef = useRef(false);
  const connectionTestTimeoutRef = useRef(null);
  const initialCheckTimeoutRef = useRef(null);

  // Test actual connectivity with a lightweight request
  const testConnection = async () => {
    try {
      // Use a lightweight endpoint or a small image/favicon
      if (typeof window === 'undefined' || !window.location) {
        return navigator.onLine; // Fallback to navigator.onLine
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      await fetch(`${window.location.origin}/favicon.ico`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      // If fetch fails, assume offline
      return false;
    }
  };

  // Initial connection check on mount
  useEffect(() => {
    // Wait a bit before initializing to avoid false positives on page load
    initialCheckTimeoutRef.current = setTimeout(async () => {
      if (navigator.onLine) {
        // If browser says we're online, trust it initially
        setIsOnline(true);
        setIsInitialized(true);
      } else {
        // If browser says we're offline, verify with a test
        const isActuallyOnline = await testConnection();
        setIsOnline(isActuallyOnline);
        setIsInitialized(true);
        
        // Only show error if we're actually offline
        if (!isActuallyOnline) {
          setConnectionError('No internet connection');
        }
      }
    }, 1000); // Wait 1 second before initial check

    return () => {
      if (initialCheckTimeoutRef.current) {
        clearTimeout(initialCheckTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setConnectionError(null);
      setRetryCount(0);
      setIsDismissed(false);
      hasShownOfflineRef.current = false;
      setIsInitialized(true);
    };

    const handleOffline = async () => {
      // Only show offline if we've initialized (avoid false positives on page load)
      if (!isInitialized) return;
      
      // Delay showing offline status to avoid false positives
      if (connectionTestTimeoutRef.current) {
        clearTimeout(connectionTestTimeoutRef.current);
      }
      
      connectionTestTimeoutRef.current = setTimeout(async () => {
        // Double-check with a connection test
        const isActuallyOnline = await testConnection();
        
        if (!isActuallyOnline && !hasShownOfflineRef.current) {
          setIsOnline(false);
          setConnectionError('No internet connection');
          hasShownOfflineRef.current = true;
        }
      }, 2000); // Wait 2 seconds before showing offline status
    };

    const handleConnectionError = (event) => {
      // Only show connection error if we've initialized and it's a real network issue
      if (!isInitialized) return;
      
      // Only show connection error if browser is actually offline
      // or if it's a genuine network error (not a 404, 500, etc.)
      const error = event.detail?.error;
      const isNetworkError = error?.code === 'ERR_NETWORK' || 
                            error?.code === 'ERR_CONNECTION_REFUSED' ||
                            error?.code === 'ERR_CONNECTION_TIMED_OUT' ||
                            error?.code === 'ERR_INTERNET_DISCONNECTED' ||
                            error?.message?.includes('Network Error') ||
                            error?.message?.includes('Connection refused');
      
      // Only set connection error if it's a real network issue
      if (!navigator.onLine || isNetworkError) {
        setConnectionError(error?.message || 'Connection failed');
        setRetryCount(event.detail?.retryCount || 0);
      }
    };

    const handleAuthConnectionError = (event) => {
      // Only show auth connection error if we've initialized
      if (!isInitialized) return;
      
      // Only show auth connection error if browser is offline or it's a network error
      const error = event.detail?.error;
      const isNetworkError = error?.code === 'ERR_NETWORK' || 
                            error?.code === 'ERR_CONNECTION_REFUSED' ||
                            error?.code === 'ERR_CONNECTION_TIMED_OUT' ||
                            error?.message?.includes('Network Error');
      
      if (!navigator.onLine || isNetworkError) {
        setConnectionError('Authentication service unavailable');
        setRetryCount(event.detail?.retryCount || 0);
      }
    };

    // Listen for browser online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for custom connection error events
    window.addEventListener('api:connection-error', handleConnectionError);
    window.addEventListener('auth:connection-error', handleAuthConnectionError);
    window.addEventListener('connection:restored', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('api:connection-error', handleConnectionError);
      window.removeEventListener('auth:connection-error', handleAuthConnectionError);
      window.removeEventListener('connection:restored', handleOnline);
      if (connectionTestTimeoutRef.current) {
        clearTimeout(connectionTestTimeoutRef.current);
      }
    };
  }, [isInitialized]);

  const clearError = () => {
    setConnectionError(null);
    setRetryCount(0);
  };

  const dismissAlert = () => {
    setIsDismissed(true);
    setConnectionError(null);
  };

  return {
    isOnline,
    connectionError,
    retryCount,
    clearError,
    dismissAlert,
    isDismissed,
    isInitialized,
    isOffline: !isOnline,
    hasConnectionError: !!connectionError && !isDismissed
  };
};

export default useConnectionStatus;
