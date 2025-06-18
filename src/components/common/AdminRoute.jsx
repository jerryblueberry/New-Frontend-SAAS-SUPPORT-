import React, { Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

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
      />
    </div>
  );

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show minimal loading state during initial auth check
  if (loading) {
    return <LoadingFallback />;
  }

  // Redirect if not authenticated
  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect if not admin
  if (isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Wrap children in Suspense for better loading experience
  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};

export default AdminRoute;