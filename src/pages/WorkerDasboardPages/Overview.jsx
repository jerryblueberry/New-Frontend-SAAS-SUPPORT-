import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  DollarSign,
  FileText,
  Briefcase,
} from 'lucide-react';
import {
  Box,
  Container,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import OnboardingPrompt from '../../components/workerDashboard/components/OnboardingPrompt/OnboardingPrompt';

// Overview Components
import {
  StatCard,
  ProfileCompletenessCard,
  VerificationStatusCard,
  RecentReferencesCard,
  getCertColor,
  getVerificationConfig,
  getCompletenessStatusText,
} from '../../components/workerDashboard/components/OverviewComponents';

// Custom Hooks
import { useOverview } from '../../hooks/useOverview';
import { getGreeting } from '../../components/OverviewComponents/utils/dateHelpers';

/**
 * Overview Page Component
 * 
 * Main dashboard page for workers displaying:
 * - Profile statistics and completeness
 * - Verification status
 * - Recent references
 * - Quick access to key features
 * 
 * @component
 * @returns {JSX.Element} Overview page
 */
const Overview = () => {
    const navigate = useNavigate();
    const mainContentRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    useEffect(() => {
        setMounted(true);
    }, []);

    // Safely handle scroll restoration
    useEffect(() => {
        if (mainContentRef.current) {
            try {
                if (mainContentRef.current.scrollTop !== undefined) {
                    mainContentRef.current.scrollTop = 0;
                }
            } catch (error) {
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
        timesheetStats,
        hourlyRate,
        workHistoryCount,
        isLoading,
        isReferencesLoading,
        isTimesheetsLoading,
        hasError,
    } = useOverview();

    // Memoized navigation handlers
    const handleContinueOnboarding = useCallback(() => {
        navigate('/onboarding');
    }, [navigate]);

    const onboardingPromptProps = useMemo(
        () => ({
            percentage: profileStatus?.profileCompleteness?.percentage || 0,
            nextStep: nextOnboardingStep,
            onContinue: handleContinueOnboarding,
            completedSections: profileStatus?.profileCompleteness?.completedSections || {},
        }),
        [profileStatus?.profileCompleteness?.percentage, profileStatus?.profileCompleteness?.completedSections, nextOnboardingStep, handleContinueOnboarding]
    );

    // All hooks must be called before any early returns
    // Helper functions for stats - computed values
    const certColor = useMemo(() => getCertColor(certStats || {}), [certStats]);
    
    const verificationConfig = useMemo(
        () => getVerificationConfig(verificationStatus),
        [verificationStatus]
    );
    const VerificationIcon = verificationConfig.icon;
    
    const percentage = useMemo(() => {
        return typeof profileCompleteness === 'number' 
            ? Math.max(0, Math.min(100, profileCompleteness)) 
            : 0;
    }, [profileCompleteness]);
    
    const completenessStatusText = useMemo(
        () => getCompletenessStatusText(percentage),
        [percentage]
    );

    // Loading state - early return AFTER all hooks
    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
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

    // Error state
    if (hasError) {
        console.error('Error loading overview data');
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <WorkerNavbar />
            <Box sx={{ display: 'flex', flex: 1 }}>
                <DashboardSidebar />
                <Box
                    component="main"
                    ref={mainContentRef}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        overflow: 'auto',
                        mt: '70px',
                        scrollBehavior: 'smooth',
                    }}
                >
                    {/* Onboarding Prompt */}
                    {needsOnboarding ? (
                        <Container
                            maxWidth="xl"
                            sx={{
                                py: { xs: 3, sm: 4, md: 5 },
                                px: { xs: 2, sm: 3, md: 4 },
                                minHeight: 'calc(100vh - 70px)',
                            }}
                        >
                            <OnboardingPrompt {...onboardingPromptProps} />
                        </Container>
                    ) : (
                        <Container
                            maxWidth={false}
                            sx={{
                                maxWidth: { lg: '1680px' },
                                py: { xs: 2.5, sm: 3, md: 3.5 },
                                px: { 
                                    xs: 2, 
                                    sm: 2.5, 
                                    md: 3, 
                                    lg: 4, 
                                    xl: 5 
                                },
                            }}
                        >
                            {/* Header Section - Engaging & Premium */}
                            <Fade in={mounted} timeout={700}>
                                <Box sx={{ mb: { xs: 3, sm: 3.5, md: 4 } }}>
                                    <Typography
                                        variant={isMobile ? 'h4' : isTablet ? 'h3' : 'h2'}
                                        component="h1"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'text.primary',
                                            mb: 1,
                                            letterSpacing: '-0.02em',
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {getGreeting()}, {user?.firstName || 'Worker'}
                                    </Typography>
                                    <Typography
                                        variant={isMobile ? 'body2' : 'body1'}
                                        sx={{
                                            color: 'text.secondary',
                                            fontWeight: 400,
                                            letterSpacing: '0.01em',
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        Here's your overview and activity
                                    </Typography>
                                </Box>
                            </Fade>

                            {/* Stats & Verification Grid - Compact Premium Layout */}
                            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                                {/* Stats Section - 4 Cards */}
                                <Grid item xs={12} lg={8}>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: 'repeat(2, 1fr)',
                                                sm: 'repeat(3, 1fr)',
                                                lg: 'repeat(4, 1fr)',
                                            },
                                            gap: { xs: 1.5, sm: 2, md: 2.5 },
                                        }}
                                    >
                                        {/* Certifications Card */}
                                        <StatCard
                                            title="Certifications"
                                            value={certStats?.total || 0}
                                            color={certColor}
                                            icon={Award}
                                            chips={[
                                                ...((certStats?.verified || 0) > 0 ? [{ label: `✓ ${certStats.verified}`, color: 'success' }] : []),
                                                ...((certStats?.pending || 0) > 0 ? [{ label: `⏳ ${certStats.pending}`, color: 'warning' }] : []),
                                                ...(((certStats?.rejected || 0) + (certStats?.expired || 0)) > 0 ? [{ label: `⚠ ${(certStats.rejected || 0) + (certStats.expired || 0)}`, color: 'error' }] : []),
                                            ]}
                                            navigateTo="/my-certifications"
                                            isLoading={isTimesheetsLoading}
                                        />

                                        {/* Hourly Rate Card */}
                                        <StatCard
                                            title="Hourly Rate"
                                            value={
                                                <Box component="span" sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                                    {hourlyRate || 0}
                                                    <Typography component="span" variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                                                        /hr
                                                    </Typography>
                                                </Box>
                                            }
                                            color="success"
                                            icon={DollarSign}
                                        />

                                        {/* Timesheets Card */}
                                        <StatCard
                                            title="Timesheets"
                                            value={(timesheetStats?.approved || 0) + (timesheetStats?.submitted || 0) + (timesheetStats?.pending_review || 0) + (timesheetStats?.draft || 0)}
                                            color="info"
                                            icon={FileText}
                                            chips={[
                                                ...((timesheetStats?.approved || 0) > 0 ? [{ label: `✓ ${timesheetStats.approved}`, color: 'success' }] : []),
                                                ...((timesheetStats?.pending_review || 0) > 0 ? [{ label: `⏳ ${timesheetStats.pending_review}`, color: 'warning' }] : []),
                                                ...((timesheetStats?.draft || 0) > 0 ? [{ label: `📝 ${timesheetStats.draft}`, color: 'default' }] : []),
                                            ]}
                                            navigateTo="/worker/timesheets"
                                            isLoading={isTimesheetsLoading}
                                        />

                                        {/* Work History Card */}
                                        <StatCard
                                            title="Work History"
                                            value={workHistoryCount || 0}
                                            subtitle="Experiences"
                                            color="warning"
                                            icon={Briefcase}
                                            navigateTo="/work-history"
                                        />
                                    </Box>
                                </Grid>

                                {/* Profile Verification Section - 3 Cards */}
                                <Grid item xs={12} lg={4}>
                                    <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                                        {/* Profile Completeness Card */}
                                        <Grid item xs={12}>
                                            <ProfileCompletenessCard
                                                percentage={percentage}
                                                statusText={completenessStatusText}
                                                onContinue={handleContinueOnboarding}
                                            />
                                        </Grid>

                                        {/* Recent References Card */}
                                        <Grid item xs={12}>
                                            <RecentReferencesCard
                                                recentReferences={recentReferences || []}
                                                isLoading={isReferencesLoading}
                                                navigate={navigate}
                                            />
                                        </Grid>

                                        {/* Verification Status Card */}
                                        <Grid item xs={12}>
                                            <VerificationStatusCard
                                                verificationStatus={verificationStatus}
                                                verificationDetail={verificationDetail}
                                                verificationConfig={verificationConfig}
                                                VerificationIcon={VerificationIcon}
                                                certStats={certStats}
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Container>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Overview;
