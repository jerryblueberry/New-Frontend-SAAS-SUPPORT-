import { useState, useEffect } from 'react';

/**
 * Custom hook for monitoring connection status
 * Provides real-time connection state and error handling
 */
export const useConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionError, setConnectionError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionError(null);
      setRetryCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionError('No internet connection');
    };

    const handleConnectionError = (event) => {
      setConnectionError(event.detail?.error?.message || 'Connection failed');
      setRetryCount(event.detail?.retryCount || 0);
    };

    const handleAuthConnectionError = (event) => {
      setConnectionError('Authentication service unavailable');
      setRetryCount(event.detail?.retryCount || 0);
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
    };
  }, []);

  const clearError = () => {
    setConnectionError(null);
    setRetryCount(0);
  };

  return {
    isOnline,
    connectionError,
    retryCount,
    clearError,
    isOffline: !isOnline,
    hasConnectionError: !!connectionError
  };
};

export default useConnectionStatus;
