// src/components/common/PrivateRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasValidAuth } from '../../utils/storage';
import LoadingSpinner from './LoadingSpinner';

/**
 * PrivateRoute component that protects routes from unauthenticated access
 * Redirects to login if user is not authenticated
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, verifyAuth } = useAuth();
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState({
    checked: false,
    isAllowed: false,
    isLoading: true
  });

  useEffect(() => {
    // Quick check using token first
    const hasToken = hasValidAuth();
    
    // If context says we're authenticated or we have a valid token
    if (isAuthenticated || hasToken) {
      setAuthStatus({
        checked: true,
        isAllowed: true,
        isLoading: false
      });
    } 
    // If loading finished and we're not authenticated
    else if (!loading) {
      setAuthStatus({
        checked: true,
        isAllowed: false,
        isLoading: false
      });
    }
    
    // Verify auth with the server if needed
    if (hasToken && !isAuthenticated && !loading) {
      verifyAuth()
        .then(isValid => {
          setAuthStatus({
            checked: true,
            isAllowed: isValid,
            isLoading: false
          });
        })
        .catch(() => {
          setAuthStatus({
            checked: true,
            isAllowed: false,
            isLoading: false
          });
        });
    }
    
    // Listen for logout events
    const handleLogout = () => {
      setAuthStatus({
        checked: true,
        isAllowed: false,
        isLoading: false
      });
    };
    
    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [isAuthenticated, loading, verifyAuth]);

  // Display loading spinner while checking authentication
  if (authStatus.isLoading || loading) {
    return <LoadingSpinner fullPage />;
  }

  // If not authenticated, redirect to login and remember the attempted URL
  return authStatus.isAllowed ? 
    children : 
    <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;