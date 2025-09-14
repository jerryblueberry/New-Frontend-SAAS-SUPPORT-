import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';

import './css/Dashboard.css';
import OnboardingPrompt from '../../components/workerDashboard/components/OnboardingPrompt/OnboardingPrompt';

import { Box, Paper, Typography, Button } from '@mui/material';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';

const Dashboard = () => {
  const { signOut, isAuthenticated, user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isGoogleUser = localStorage.getItem('auth_provider') === 'google';
  const [activeTab, setActiveTab] = useState('overview');

  // Authentication guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  // Auto-redirect to overview when accessing /dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      navigate('/overview', { replace: true });
    }
  }, [location.pathname, navigate]);

  // User data fetching
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) {
        signOut();
        return false;
      }
      return failureCount < 2;
    },
  });

  // Worker profile status fetching
  const { data: profileStatus, isLoading: isProfileLoading } = useQuery({
    queryKey: ['workerProfileStatus'],
    queryFn: async () => {
      const response = await api.get('/onboarding/status');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: !!user,
  });

  // Onboarding information
  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingQuery();

  const handleSignOut = async () => {
    await signOut(false, isGoogleUser);
    navigate('/login', { replace: true });
  };

  const isLoading = isUserLoading || isProfileLoading || isOnboardingLoading;

  // If we need to complete onboarding
  const needsOnboarding =
    !profileStatus || // If profileStatus is null/undefined
    (profileStatus && !profileStatus.profileCompleteness) || // Or if profileCompleteness is missing
    profileStatus?.profileCompleteness?.percentage < 100; // Or if percentage is less than 100

  // Determine next step
  const getNextOnboardingStep = () => {
    if (!profileStatus || !profileStatus.profileCompleteness) return 1;

    const { completedSections } = profileStatus.profileCompleteness;

    if (!completedSections.basicInfo) return 1;
    if (!completedSections.workHistory) return 2;
    if (!completedSections.availability) return 3;
    if (!completedSections.certifications) return 4;
    if (!completedSections.healthInformation) return 5;

    return null;
  };

  const continueOnboarding = () => {
    navigate('/onboarding');
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <LoadingSpinner
        size="lg"
        showLogo={true}
        text="Loading dashboard..."
        fullPage={true}
        variant="light"
      />
    </div>
  );

  return (
    <div className="wrk-dashboard-container">
      <WorkerNavbar />
      <div className="wrk-dashboard-main">
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleSignOut={handleSignOut}
          needsOnboarding={needsOnboarding}
          profileStatus={profileStatus}
        />
        <main className="wrk-dashboard-content">
          {needsOnboarding && (
            <div style={{ marginTop: '2rem' }}>
              <OnboardingPrompt
                percentage={profileStatus?.profileCompleteness?.percentage || 0}
                nextStep={getNextOnboardingStep()}
                onContinue={continueOnboarding}
              />
            </div>
          )}

          {/* Render the overview content when activeTab is 'overview' */}
          {activeTab === 'overview' && (
            <Box sx={{ mt: 8, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight={700}>
                Welcome to Your Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Use the sidebar to navigate through different sections of your dashboard.
              </Typography>
            </Box>
          )}

          {/* Render other content based on activeTab */}
          {activeTab !== 'overview' && (
            <Box sx={{ mt: 8, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight={700}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                This section is under development.
              </Typography>
            </Box>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
