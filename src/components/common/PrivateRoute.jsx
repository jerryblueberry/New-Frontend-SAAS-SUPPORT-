// src/components/common/PrivateRoute.jsx
import React, { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Loading fallback component
const LoadingFallback = () => (
  <div 
  
  className="min-h-screen flex items-center justify-center bg-gray-900"
  >
    <LoadingSpinner
      size="lg"
      showLogo={true}
      text="Loading"
      fullPage={true}
      variant="gradient"
      // color='light'
    />
  </div>
);

/**
 * PrivateRoute component that protects routes from unauthenticated access
 * Redirects to login if user is not authenticated
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show minimal loading state during initial auth check
  if (loading) {
    return <LoadingFallback />;
  }

  // If authenticated and user is admin, redirect to admin dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Only redirect if we're sure user is not authenticated
  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrap children in Suspense for better loading experience
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};

export default PrivateRoute;