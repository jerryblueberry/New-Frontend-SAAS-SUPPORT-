import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner
          fullPage
          size="lg"
          color="primary"
          variant="gradient"
          showLogo
          logoSize="lg"
          text="Checking authentication..."
          overlayOpacity={0.8}
          gradientColors={['#3b82f6', '#10b981', '#ef4444']}
        />
      </div>
    );
  }

  if (isAuthenticated && !loading) {
    // Always send authenticated users to their role-specific home
    if (user?.role === 'client') return <Navigate to="/client-dashboard" replace />;
    if (user?.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/overview" replace />;
  }

  return children;
};

export default PublicRoute;