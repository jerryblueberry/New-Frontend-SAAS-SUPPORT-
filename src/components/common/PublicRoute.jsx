import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, verifyAuth } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      verifyAuth();
    }
  }, [verifyAuth, loading, isAuthenticated]);

  const from = location.state?.from?.pathname || '/dashboard';
  
  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return isAuthenticated ? <Navigate to={from} replace /> : children;
};

export default PublicRoute;