// src/App.jsx
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import ClientRoute from './components/common/ClientRoute';
import PublicRoute from './components/common/PublicRoute';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientRegister from './pages/ClientPages/OnboardingPages/ClientRegister';
import ClientDashboard from './pages/ClientPages/ClientDashboard/ClientDashboard';
import React, { Suspense } from 'react';
const ClientOnboarding = React.lazy(() => import('./pages/ClientPages/OnboardingPages/ClientOnboarding'));
import { useAuth } from './context/AuthContext';
import VerifyEmail from './pages/auth/VerifyEmail';


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmailVerifyInstruction from './pages/auth/EmailVerifyInstruction';
import Onboarding from './pages/Workers/Onboarding';
import { GoogleOAuthProvider } from '@react-oauth/google';
// import { GOOGLE_CLIENT_ID, TOKEN_REFRESH_INTERVAL } from './config/env';
import ErrorBoundary from './components/common/ErrorBoundary';
import AuthErrorBoundary from './components/common/AuthErrorBoundary';
import PageNotFound from './components/common/PageNotFound';
import Profile from './pages/Workers/Profile';
// import CertificationManagement from './pages/CertificateCheck/CertificationManagement';
import CertificateSecond from './pages/CertificateCheck/CertificateSecond';

import ForgotPassword from './pages/auth/ForgotPassword';
import AdminDashboard from './pages/AdminPages/AdminDashboard/AdminDashboard';
import AdminRoute from './components/common/AdminRoute';
import WorkerDetails from './pages/AdminPages/WorkerDetails/WorkerDetails';
import CertificationTypes from './pages/AdminPages/CertificationType/CertificationTypes';

//  FOr hte Reference Check 
import CompleteReferenceCheck from './pages/ReferenceCheck/CompleteReferenceCheck/CompleteReferenceCheck';
import ReferenceQuestion from './pages/AdminPages/ReferenceQuestonnaire/ReferenceQuestion';
import AdminReference from './pages/AdminPages/ReferenceSection/AdminReference';
import WorkerManagementDashboard from './pages/AdminPages/AdminDashboard/WorkerManagementDashboard';
import TermsandConditions from './pages/TermsandConditions/TermsandConditions';
import ViewAllTimesheets from './pages/AdminPages/Timesheets/ViewAllTimesheets';
import WorkerTimesheet from './pages/Timesheet/WorkerTimesheet/WorkerTimesheet';
import MyProfile from './pages/WorkerDasboardPages/MyProfile';
import AvailableJobs from './pages/WorkerDasboardPages/AvailableJobs';
import MySchedule from './pages/WorkerDasboardPages/MySchedule';
import MyCertifications from './pages/WorkerDasboardPages/MyCertifications';
import WorkHistory from './pages/WorkerDasboardPages/WorkHistory';
import Overview from './pages/WorkerDasboardPages/Overview';
import WorkerNotification from './pages/WorkerNotifications/WorkerNotification';
import ViewAllDocuments from './pages/AdminPages/CloudinaryDocuments/ViewAllDocuments';
import ViewAllReference from './pages/AdminPages/ReferenceSection/ViewAllReference/ViewAllReference';
import ViewAllClients from './pages/AdminPages/ClientManagement/ViewAllClients';
import ViewClientDetails from './pages/AdminPages/ClientManagement/ViewClientDetails';


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
  const { user } = useAuth();

  // Global listener for auth expiration
  useEffect(() => {
    const handleAuthExpired = () => {
      // Check if we're on a public route that doesn't require auth
      const publicRoutes = [
        '/login',
        '/register',
        '/reference-check',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/terms-and-conditions',
        // '/certificate'
      ];
      
      const currentPath = window.location.pathname;
      const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
      
      // Don't redirect to login if we're on a public route
      if (isPublicRoute) {
        console.log('Auth expired on public route, not redirecting');
        return;
      }
      
      // Clear any existing tokens
      localStorage.removeItem('accessToken');
      sessionStorage.clear();
      
      // Show user-friendly message about multiple sessions
      const message = 'Your session has expired. This can happen when you open multiple tabs. Please log in again.';
      console.log(message);
      
      // You could also show a toast notification here if you have a toast system
      // toast.info(message);
      
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [navigate]);
  return (
    <Routes>
        {/* Public routes - accessible to anyone */}
        <Route index path="/" element={<Home />} />
        {/*  For the Forgot Password */}
        <Route path='/forgot-password' element={<ForgotPassword />} />
        {/* <Route path='/certificate' element  = {<CertificationManagement/>}/> */}
        <Route path='/certificate-2' element={<CertificateSecond />} />

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
        <Route path="/client/register" element={
          <PublicRoute>
            <ClientRegister />
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



        {/* Reference check - accessible to anyone (no auth required) */}
        <Route path='/reference-check/:token' element={<CompleteReferenceCheck />} />

        {/*  For terms and conditions */}
        <Route path='/terms-and-conditions' element={
          <PublicRoute>
            <TermsandConditions />
          </PublicRoute>
        }
        />



        {/* Protected routes - need authentication */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {user?.role === 'client' ? (
                <Navigate to="/client-dashboard" replace />
              ) : user?.role === 'admin' ? (
                <Navigate to="/admin-dashboard" replace />
              ) : (
                <Navigate to="/overview" replace />
              )}
            </PrivateRoute>
          }
        />
        <Route
          path="/client-dashboard"
          element={
            <ClientRoute>
              <ClientDashboard />
            </ClientRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
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
        {/* FOr the refrence related */}
        {/* Reference question */}
        <Route path='/admin-reference/questions' element={
          <AdminRoute>
            <ReferenceQuestion />
          </AdminRoute>
        }
        />

        {/* Admin Reference Page */}
        <Route path='/admin-reference/:workerId' element={
          <AdminRoute>
            <AdminReference />
          </AdminRoute>
        }
        />

        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        {/*  For the workers management  */}
        <Route path='/admin/workers'
          element={
            <AdminRoute>
              <WorkerManagementDashboard />
            </AdminRoute>
          }
        />

        {/*  For viewing worker details by admin*/}
        <Route path='/worker-details/:workerId' element={
          <AdminRoute>
            <WorkerDetails />
          </AdminRoute>
        }
        />
        {/*  for the certification types related */}
        <Route path='/certification-types' element={
          <AdminRoute>
            <CertificationTypes />
          </AdminRoute>
        }
        />

        {/* For the Timesheets  (Admin)*/}
        {/* Get all Timsheets */}
        <Route path='/time-sheets' element={
          <AdminRoute>
            <ViewAllTimesheets />
          </AdminRoute>
        }
        />


        {/*  FOr the worker timehseet page */}
        <Route path='/worker/timesheets' element={
          <PrivateRoute>
            <WorkerTimesheet />
          </PrivateRoute>
        }
        />


        {/*  Worker Dashboard */}
        <Route path='/my-profile' element={
          <PrivateRoute>
            <MyProfile />
          </PrivateRoute>
        }
        />

        <Route path='/available-jobs' element={
          <PrivateRoute>
            <AvailableJobs />
          </PrivateRoute>
        }
        />
        {/* FOr the my-schedule for the dashboard route */}
        <Route path='/my-schedule' element={
          <PrivateRoute>
            <MySchedule />
          </PrivateRoute>
        }


        />
        {/*  For my Certifications seeing them  */}
        <Route path='/my-certifications' element = {
          <PrivateRoute>
            <MyCertifications/>
          </PrivateRoute>
        }
        />
        {/*  FOr the work history */}
        <Route path='/work-history' element = {
          <PrivateRoute>
            <WorkHistory/>
          </PrivateRoute>
        }
        />
        {/*  FOr the Overview */}
        <Route path='/overview' element = {
          <PrivateRoute>
            <Overview/>
          </PrivateRoute>
        }
        />

        {/*  FOr the Notifications */}
        <Route path='/notifications' element = {
          <PrivateRoute>
            <WorkerNotification/>
          </PrivateRoute>
        }
        />

        {/*  FOr admin cleanup the documents and cloduianry related cleanup */}
        <Route path='/admin/cleanup-documents' element = {
          <AdminRoute>
            <ViewAllDocuments/>
          </AdminRoute>
        }
        />

        {/*  View All Referebnces Page */}
        <Route path='/admin/all-references' element = {
          <AdminRoute>
            <ViewAllReference/>
          </AdminRoute>
        }
        />

        {/* 404 page */}
        <Route path="*" element={<PageNotFound />} />


        {/*  For the Client Onboarding */}
        <Route path="/client-onboarding" element={
          <ClientRoute>
            <Suspense fallback={<div />}> 
              <ClientOnboarding />
            </Suspense>
          </ClientRoute>
        }
        />

        {/*  FOr the admin client management pages */}
        <Route path='/admin/clients' element={
          <AdminRoute>
            <ViewAllClients/> 
          </AdminRoute>
        }
        />
        <Route path='/admin/clients/:id' element={
          <AdminRoute>
            <ViewClientDetails/>
          </AdminRoute>
        }
        />
      </Routes>
  );
}
const Google_clientId = '160514014170-ogsg5uhsp0972687sq9j822pm5lhfd7j.apps.googleusercontent.com'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthErrorBoundary>
          <AuthProvider>
            <GoogleOAuthProvider clientId={Google_clientId}>
              <AppRoutes />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ zIndex: 9999 }}
              />
            </GoogleOAuthProvider>
          </AuthProvider>
        </AuthErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;