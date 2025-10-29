import { Box, Typography, Paper, Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import WorkerNavbar from '../../components/Navbar/WorkerNavbar'
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar'
import OnboardingPrompt from '../../components/workerDashboard/components/OnboardingPrompt/OnboardingPrompt'
import '../../pages/dashboard/css/Dashboard.css'

const Overview = () => {
    const { signOut, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const isGoogleUser = localStorage.getItem('auth_provider') === 'google';

    // Authentication guard
    // React.useEffect(() => {
    //     if (!isAuthenticated) {
    //         navigate('/login', { replace: true, state: { from: location } });
    //     }
    // }, [isAuthenticated, navigate]);

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

    const verificationStatus =
        typeof profileStatus?.verificationStatus === 'object'
            ? profileStatus?.verificationStatus?.overall
            : profileStatus?.verificationStatus;


    const handleSignOut = async () => {
        try {
            await signOut(false);
            // Navigate to home page after successful logout
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
            // Still navigate even if logout API fails
            navigate('/', { replace: true });
        }
    };

    const isLoading = isUserLoading || isProfileLoading 

    // If we need to complete onboarding
    const needsOnboarding =
        !profileStatus || // If profileStatus is null/undefined
        (profileStatus && !profileStatus.profileCompleteness) || // Or if profileCompleteness is missing
        profileStatus?.profileCompleteness?.percentage < 100; // Or if percentage is less than 100

    const getMissingSections = () => {
        const completed = profileStatus?.profileCompleteness?.completedSections || {};
        const sectionNames = {
            basicInfo: 'Basic Information',
            workHistory: 'Work History',
            availability: 'Availability',
            certifications: 'Certifications',
            healthInformation: 'Health Information',
        };
        return Object.entries(completed)
            .filter(([_, done]) => !done)
            .map(([key]) => sectionNames[key]);
    };

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
                text="Loading overview..."
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
                    activeTab="overview"
                    setActiveTab={() => {}}
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

                    {verificationStatus === 'Unverified' ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: { xs: 400, sm: 500 },
                                width: '100%',
                                px: { xs: 2, sm: 0 },
                            }}
                        >
                            <Paper
                                elevation={3}
                                sx={{
                                    p: { xs: 3, sm: 5 },
                                    borderRadius: 4,
                                    maxWidth: 480,
                                    width: '100%',
                                    textAlign: 'center',
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 8px 32px rgba(80,80,120,0.08)',
                                    mb: 4,
                                }}
                            >
                                {/* Animated SVG Illustration */}
                                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                                    <Box
                                        sx={{
                                            width: { xs: 180, sm: 220 },
                                            height: { xs: 120, sm: 140 },
                                            mx: 'auto',
                                            mb: 2,
                                            animation: 'float 2.5s ease-in-out infinite',
                                            '@keyframes float': {
                                                '0%': { transform: 'translateY(0px)' },
                                                '50%': { transform: 'translateY(-16px)' },
                                                '100%': { transform: 'translateY(0px)' },
                                            },
                                        }}
                                    >
                                        {/* Simple SVG illustration */}
                                        <svg width="100%" height="100%" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <ellipse cx="110" cy="120" rx="80" ry="15" fill="#ede7f6" />
                                            <rect x="60" y="40" width="100" height="60" rx="16" fill="#b39ddb" />
                                            <rect x="75" y="55" width="70" height="30" rx="8" fill="#fff" />
                                            <rect x="90" y="65" width="40" height="10" rx="5" fill="#d1c4e9" />
                                            <circle cx="110" cy="55" r="8" fill="#7e57c2" />
                                            <rect x="100" y="90" width="20" height="8" rx="4" fill="#9575cd" />
                                        </svg>
                                    </Box>
                                </Box>
                                <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                                    Thank you for applying!
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                    Your profile is currently <b>under review</b> by our team. We appreciate your interest and the time you've invested in completing your application.
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    We will notify you via email as soon as your profile has been successfully verified and you are ready to begin your journey with us. In the meantime, feel free to explore your dashboard or update your information if needed.
                                </Typography>
                                {/* Show missing sections if any */}
                                {getMissingSections().length > 0 && (
                                    <Box sx={{ mt: 2, mb: 2 }}>
                                        <Typography variant="subtitle1" color="error" fontWeight={600}>
                                            Missing Sections:
                                        </Typography>
                                        <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: 300 }}>
                                            {getMissingSections().map((section) => (
                                                <li key={section} style={{ color: '#d32f2f', fontWeight: 500 }}>{section}</li>
                                            ))}
                                        </ul>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={() => navigate('/worker/my-profile')}
                                        sx={{ borderRadius: 2, fontWeight: 600, px: 4, boxShadow: 2 }}
                                    >
                                        View My Profile
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    ) : verificationStatus === 'Partially Verified' ? (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: { xs: 400, sm: 500 },
                                width: '100%',
                                px: { xs: 2, sm: 0 },
                            }}
                        >
                            <Paper
                                elevation={3}
                                sx={{
                                    p: { xs: 3, sm: 5 },
                                    borderRadius: 4,
                                    maxWidth: 480,
                                    width: '100%',
                                    textAlign: 'center',
                                    bgcolor: '#fffde7',
                                    boxShadow: '0 8px 32px rgba(255, 193, 7, 0.08)',
                                    mb: 4,
                                }}
                            >
                                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                                    <Box
                                        sx={{
                                            width: { xs: 180, sm: 220 },
                                            height: { xs: 120, sm: 140 },
                                            mx: 'auto',
                                            mb: 2,
                                        }}
                                    >
                                        {/* Partially verified SVG */}
                                        <svg width="100%" height="100%" viewBox="0 0 220 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <ellipse cx="110" cy="120" rx="80" ry="15" fill="#fffde7" />
                                            <rect x="60" y="40" width="100" height="60" rx="16" fill="#ffe082" />
                                            <rect x="75" y="55" width="70" height="30" rx="8" fill="#fffde7" />
                                            <rect x="90" y="65" width="40" height="10" rx="5" fill="#ffe082" />
                                            <circle cx="110" cy="55" r="8" fill="#ffd54f" />
                                            <rect x="100" y="90" width="20" height="8" rx="4" fill="#ffb300" />
                                        </svg>
                                    </Box>
                                </Box>
                                <Typography variant="h5" fontWeight={700} color="warning.main" gutterBottom>
                                    Profile Partially Verified
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                    Some sections of your profile are verified, but a few are still pending. Please complete the missing sections below to get fully verified.
                                </Typography>
                                {/* Show missing sections if any */}
                                {getMissingSections().length > 0 && (
                                    <Box sx={{ mt: 2, mb: 2 }}>
                                        <Typography variant="subtitle1" color="error" fontWeight={600}>
                                            Missing Sections:
                                        </Typography>
                                        <ul style={{ textAlign: 'left', margin: '0 auto', maxWidth: 300 }}>
                                            {getMissingSections().map((section) => (
                                                <li key={section} style={{ color: '#d32f2f', fontWeight: 500 }}>{section}</li>
                                            ))}
                                        </ul>
                                    </Box>
                                )}
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        size="large"
                                        onClick={() => navigate('/onboarding')}
                                        sx={{ borderRadius: 2, fontWeight: 600, px: 4, boxShadow: 2 }}
                                    >
                                        Complete My Profile
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>
                    ) : (
                        // Only show if fully verified AND profile is 100% complete
                        profileStatus?.profileCompleteness?.percentage === 100 ? (
                            <Box sx={{ textAlign: 'center' }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="60" cy="60" r="56" fill="#e8f5e9" stroke="#43a047" strokeWidth="4" />
                                        <path d="M40 65l15 15 25-35" stroke="#43a047" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </Box>
                                <Typography variant="h4" color="success.main" fontWeight={700}>
                                    Congratulations! 🎉
                                </Typography>
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                    Your profile is <b>fully verified</b>. You now have access to all dashboard features and can start applying for jobs!
                                </Typography>
                            </Box>
                        ) : (
                            // If not 100% complete, show a prompt to complete profile
                            null
                        )
                    )}
                </main>
            </div>
        </div>
    )
}

export default Overview