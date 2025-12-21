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

// Restricts access to users with role 'client'
const ClientRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/client/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'client') {
    // Non-clients: send to default dashboard route for their role
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/overview" replace />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};

export default ClientRoute;


