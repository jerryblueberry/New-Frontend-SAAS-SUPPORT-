// src/App.jsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import PublicRoute from './components/common/PublicRoute';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import Dashboard from './pages/dashboard/Dashboard';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EmailVerifyInstruction from './pages/auth/EmailVerifyInstruction';
import Onboarding from './pages/Workers/Onboarding';
import { GoogleOAuthProvider } from '@react-oauth/google';
// import { GOOGLE_CLIENT_ID, TOKEN_REFRESH_INTERVAL } from './config/env';
import ErrorBoundary from './components/common/ErrorBoundary';
import PageNotFound from './components/common/PageNotFound';
import Profile from './pages/Workers/Profile';
// import CertificationManagement from './pages/CertificateCheck/CertificationManagement';
import CertificateSecond from './pages/CertificateCheck/CertificateSecond';
import CertificateThird from './pages/CertificateCheck/CertificateThird';
import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/AdminPages/AdminDashboard/AdminDashboard';
import AdminRoute from './components/common/AdminRoute';
import WorkerDetails from './pages/AdminPages/WorkerDetails/WorkerDetails';
import CertificationTypes from './pages/AdminPages/CertificationType/CertificationTypes';

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Make queryClient available for auth logout
if (typeof window !== 'undefined') {
  window.queryClient = queryClient;
}

function AppRoutes() {
  const navigate = useNavigate();

  // Global listener for auth expiration
  useEffect(() => {
    const handleAuthExpired = () => {
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [navigate]);
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes - accessible to anyone */}
        <Route index path="/" element={<Home />} />
        {/*  For the Forgot Password */}
        <Route path='/forgot-password' element = {<ForgotPassword/>}/>
        {/* <Route path='/certificate' element  = {<CertificationManagement/>}/> */}
        <Route path='/certificate-2' element = {<CertificateSecond/>}/>
        <Route path='/certificate-3' element = {<CertificateThird/>}/>
        {/* Auth routes - only accessible when NOT logged in */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/verify-email/:token" element={
          <PublicRoute>
            <VerifyEmail />
          </PublicRoute>
        } />
        <Route
          path="/verify-email-instructions"
          element={
            <PublicRoute>
              <EmailVerifyInstruction />
            </PublicRoute>
          }
        />

        {/* Protected routes - need authentication */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile/>
            </PrivateRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          }
        />
        {/* Admin Related Routes */}

        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        {/*  For viewing worker details by admin*/}
        <Route path='/worker-details/:workerId' element = {
          <AdminRoute>
            <WorkerDetails/>
          </AdminRoute>
        }
        />
        {/*  for the certification types related */}
        <Route path='/certification-types' element = {
          <AdminRoute>
            <CertificationTypes/>
          </AdminRoute>
        }
        />

        {/* 404 page */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
const Google_clientId  = '160514014170-ogsg5uhsp0972687sq9j822pm5lhfd7j.apps.googleusercontent.com'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GoogleOAuthProvider clientId={Google_clientId}>
          <AppRoutes />
        </GoogleOAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;