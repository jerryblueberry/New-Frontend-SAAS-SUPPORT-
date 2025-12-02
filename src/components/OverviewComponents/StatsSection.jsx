import { Grid, Typography, Paper, Skeleton, alpha, useTheme } from '@mui/material';
import StatCard from './StatCard';
import RecentReferencesSection from './RecentReferencesSection';

/**
 * StatsSection Component
 * Container for all stat cards (Certifications, Hourly Rate, Timesheets, References, Work History)
 */
const StatsSection = ({ 
    certStats, 
    hourlyRate, 
    timesheetStats, 
    isTimesheetsLoading,
    referenceStats, 
    isReferencesLoading,
    recentReferences,
    workHistoryCount,
    navigate 
}) => {
    const theme = useTheme();

    // Determine certification card color based on status
    const getCertColor = () => {
        if ((certStats.expired || 0) > 0 || (certStats.rejected || 0) > 0) return 'error';
        if ((certStats.expiring || 0) > 0 || (certStats.pending || 0) > 0) return 'warning';
        return 'primary';
    };

    const certChips = [];
    if ((certStats.verified || 0) > 0) {
        certChips.push({ label: `✓ ${certStats.verified}`, color: 'success' });
    }
    if ((certStats.pending || 0) > 0) {
        certChips.push({ label: `⏳ ${certStats.pending}`, color: 'warning' });
    }
    if (((certStats.rejected || 0) + (certStats.expired || 0)) > 0) {
        certChips.push({ label: `⚠ ${(certStats.rejected || 0) + (certStats.expired || 0)}`, color: 'error' });
    }

    const timesheetChips = [];
    if ((timesheetStats.approved || 0) > 0) {
        timesheetChips.push({ label: `✓ ${timesheetStats.approved}`, color: 'success' });
    }
    if ((timesheetStats.pending_review || 0) > 0) {
        timesheetChips.push({ label: `⏳ ${timesheetStats.pending_review}`, color: 'warning' });
    }
    if ((timesheetStats.draft || 0) > 0) {
        timesheetChips.push({ label: `📝 ${timesheetStats.draft}`, color: 'default' });
    }

    const referenceChips = [];
    if ((referenceStats.completed || 0) > 0) {
        referenceChips.push({ label: `✓ ${referenceStats.completed}`, color: 'success' });
    }
    if ((referenceStats.pending || 0) > 0) {
        referenceChips.push({ label: `⏳ ${referenceStats.pending}`, color: 'warning' });
    }
    if ((referenceStats.inProgress || 0) > 0) {
        referenceChips.push({ label: `🔄 ${referenceStats.inProgress}`, color: 'info' });
    }

    return (
        <Grid 
            container 
            spacing={{ xs: 0.5, sm: 0.625, md: 1, lg: 1.25, xl: 1.5 }} 
            sx={{ 
                width: '100%', 
                height: '100%',
                alignItems: 'stretch',
                // Mobile: Single column chip layout
                '@media (max-width: 600px)': {
                    spacing: 0.5,
                    flexDirection: 'column',
                },
            }}
        >
            {/* Certifications Card */}
            <Grid item xs={12} sm={6} md={2.4} lg={2.4} sx={{ display: 'flex' }}>
                {isTimesheetsLoading ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 0.5, sm: 0.625, md: 0.75 },
                            width: '100%',
                            height: '100%',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.info.main, 0.15),
                            borderRadius: 1.25,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Skeleton variant="text" width="60%" height={14} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="40%" height={24} />
                    </Paper>
                ) : (
                    <StatCard
                        title="Certifications"
                        value={certStats.total || 0}
                        color={getCertColor()}
                        chips={certChips}
                        navigateTo="/my-certifications"
                    />
                )}
            </Grid>

            {/* Hourly Rate Card */}
            <Grid item xs={12} sm={6} md={2.4} lg={2.4} sx={{ display: 'flex' }}>
                <StatCard
                    title="Hourly Rate"
                    value={
                        <>
                            {hourlyRate || 0}
                            <Typography component="span" variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem', lg: '1rem', xl: '1.1rem' }, fontWeight: 500, ml: 0.25 }}>
                                /hr
                            </Typography>
                        </>
                    }
                    color="success"
                    valueColor="success.main"
                />
            </Grid>

            {/* Timesheets Card */}
            <Grid item xs={12} sm={6} md={2.4} lg={2.4} sx={{ display: 'flex' }}>
                {isTimesheetsLoading ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 0.5, sm: 0.625, md: 0.75 },
                            width: '100%',
                            height: '100%',
                            border: '1px solid',
                            borderColor: alpha(theme.palette.info.main, 0.15),
                            borderRadius: 1.25,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Skeleton variant="text" width="60%" height={14} sx={{ mb: 0.5 }} />
                        <Skeleton variant="text" width="40%" height={24} />
                    </Paper>
                ) : (
                    <StatCard
                        title="Timesheets"
                        value={(timesheetStats.approved || 0) + (timesheetStats.submitted || 0) + (timesheetStats.pending_review || 0) + (timesheetStats.draft || 0)}
                        color="info"
                        chips={timesheetChips}
                        navigateTo="/timesheets"
                    />
                )}
            </Grid>

            {/* Recent References Card */}
            <Grid item xs={12} sm={6} md={2.4} lg={2.4} sx={{ display: 'flex' }}>
                <RecentReferencesSection
                    recentReferences={recentReferences || []}
                    isLoading={isReferencesLoading}
                    navigate={navigate}
                />
            </Grid>

            {/* Work History Card */}
            <Grid item xs={12} sm={6} md={2.4} lg={2.4} sx={{ display: 'flex' }}>
                <StatCard
                    title="Work History"
                    value={workHistoryCount || 0}
                    subtitle="Experiences"
                    color="warning"
                    navigateTo="/work-history"
                />
            </Grid>
        </Grid>
    );
};

export default StatsSection;

