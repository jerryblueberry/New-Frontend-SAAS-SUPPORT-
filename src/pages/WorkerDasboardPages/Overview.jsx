import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Paper, Fade } from '@mui/material';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import OnboardingPrompt from '../../components/workerDashboard/components/OnboardingPrompt/OnboardingPrompt';

// Overview Components
import {
    HeaderSection,
    StatsSection,
    ProfileVerificationCard,
    // NotificationsCard, // Commented out - notifications removed from overview
} from '../../components/OverviewComponents';

// Custom Hooks
import { useOverview } from '../../hooks/useOverview';

/**
 * Overview Page Componentyou live in 
 * 
 * Main dashboard page for workers displaying:
 * - Profile statistics and completeness
 * - Verification status
 * - Recent notifications
 * - Recent references
 * - Quick access to key features
 * 
 * @component
 * @returns {JSX.Element} Overview page
 */
const Overview = () => {
    const navigate = useNavigate();
    const mainContentRef = useRef(null);

    // Safely handle scroll restoration
    useEffect(() => {
        // Ensure the main content element exists before accessing scroll properties
        if (mainContentRef.current) {
            try {
                // Reset scroll position on mount
                if (mainContentRef.current.scrollTop !== undefined) {
                    mainContentRef.current.scrollTop = 0;
                }
            } catch (error) {
                // Silently handle any scroll-related errors
                console.debug('Scroll restoration handled safely');
            }
        }
    }, []);

    // Fetch all overview data using custom hook
    const {
        user,
        profileStatus,
        verificationStatus,
        verificationDetail,
        profileCompleteness,
        needsOnboarding,
        nextOnboardingStep,
        certStats,
        unverifiedCertifications,
        referenceStats,
        recentReferences,
        // recentNotifications, // Commented out - notifications removed from overview
        // unreadNotifications, // Commented out - notifications removed from overview
        timesheetStats,
        hourlyRate,
        workHistoryCount,
        isLoading,
        isReferencesLoading,
        // isNotificationsLoading, // Commented out - notifications removed from overview
        isTimesheetsLoading,
        hasError,
    } = useOverview();

    // Memoized navigation handlers
    const handleContinueOnboarding = useCallback(() => {
        navigate('/onboarding');
    }, [navigate]);

    // Memoized component props to prevent unnecessary re-renders
    const headerProps = useMemo(
        () => ({
            user,
        }),
        [user]
    );

    const statsSectionProps = useMemo(
        () => ({
            certStats,
            hourlyRate,
            timesheetStats,
            isTimesheetsLoading,
            referenceStats,
            isReferencesLoading,
            recentReferences,
            workHistoryCount,
            navigate,
        }),
        [
            certStats,
            hourlyRate,
            timesheetStats,
            isTimesheetsLoading,
            referenceStats,
            isReferencesLoading,
            recentReferences,
            workHistoryCount,
            navigate,
        ]
    );


    const profileVerificationProps = useMemo(
        () => ({
            verificationStatus,
            verificationDetail,
            profileCompleteness,
            unverifiedCertifications,
            certStats,
            onContinueProfile: handleContinueOnboarding,
            navigate,
        }),
        [
            verificationStatus,
            verificationDetail,
            profileCompleteness,
            unverifiedCertifications,
            certStats,
            handleContinueOnboarding,
            navigate,
        ]
    );

    // Commented out - notifications removed from overview
    // const notificationsProps = useMemo(
    //     () => ({
    //         recentNotifications,
    //         unreadNotifications,
    //         isLoading: isNotificationsLoading,
    //         navigate,
    //     }),
    //     [recentNotifications, unreadNotifications, isNotificationsLoading, navigate]
    // );

    const onboardingPromptProps = useMemo(
        () => ({
            percentage: profileStatus?.profileCompleteness?.percentage || 0,
            nextStep: nextOnboardingStep,
            onContinue: handleContinueOnboarding,
        }),
        [profileStatus?.profileCompleteness?.percentage, nextOnboardingStep, handleContinueOnboarding]
    );

    // Loading state
    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.900',
                }}
            >
                <LoadingSpinner
                    size="lg"
                    showLogo={true}
                    text="Loading overview..."
                    fullPage={true}
                    variant="light"
                />
            </Box>
        );
    }

    // Error state (optional - can be enhanced with error boundary)
    if (hasError) {
        // Error handling can be improved with ErrorBoundary component
        console.error('Error loading overview data');
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
            <WorkerNavbar />
            <Box sx={{ display: 'flex' }}>
                <DashboardSidebar />
                <Box
                    ref={mainContentRef}
                    component="main"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: 0,
                        overflow: 'auto',
                    }}
                >
                 
                    {/* Main Content */}
                    
                       {/* Onboarding Prompt */}
                    {needsOnboarding ? (
                        <Box sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>
                            <OnboardingPrompt {...onboardingPromptProps} />
                        </Box>
                    ): (<Container
                        maxWidth="xl"
                        sx={{
                            pt: 0,
                            pb: { xs: 2.5, sm: 3 },
                            mt: { xs: 11, md: 10 },
                            position: 'relative',
                        }}
                    >
                        {/* Header Section */}
                        <HeaderSection {...headerProps} />

                        {/* Unified Stats & Verification Section - Premium Flex Layout */}
                        <Box sx={{ mb: { xs: 2, sm: 2, md: 2.5, lg: 3 } }}>
                            <Fade in timeout={400}>
                                <Grid 
                                    container 
                                    spacing={{ xs: 0.5, sm: 0.625, md: 1, lg: 1.5, xl: 2 }} 
                                    sx={{ 
                                        width: '100%',
                                        alignItems: 'stretch',
                                        // Mobile: Single column chip layout
                                        '@media (max-width: 600px)': {
                                            flexDirection: 'column',
                                        },
                                    }}
                                >
                                    {/* Stats Section - 5 Cards */}
                                    <Grid item xs={12} lg={8} xl={8} sx={{ display: 'flex' }}>
                                        <StatsSection {...statsSectionProps} />
                                    </Grid>

                                    {/* Profile Verification Section - 2 Cards */}
                                    <Grid item xs={12} lg={4} xl={4} sx={{ display: 'flex' }}>
                                        <ProfileVerificationCard {...profileVerificationProps} />
                                    </Grid>
                                </Grid>
                            </Fade>
                        </Box>
                    </Container>)}

                </Box>
            </Box>
        </Box>
    );
};

export default Overview;
