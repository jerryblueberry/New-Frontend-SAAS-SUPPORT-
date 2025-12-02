import { Paper, Stack, Typography, Box, Button, LinearProgress, Chip, Grid, alpha, useTheme } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import StatCard from './StatCard';

/**
 * ProfileVerificationCard Component
 * Compact card matching StatsSection design - displays Profile Completeness and Verification Status
 * SaaS-level design with perfect alignment and responsive behavior
 */
const ProfileVerificationCard = ({ 
    verificationStatus,
    verificationDetail,
    profileCompleteness = 0,
    unverifiedCertifications = [],
    certStats = {},
    onContinueProfile,
    navigate 
}) => {
    const theme = useTheme();

    // Ensure profileCompleteness is a valid number
    const percentage = typeof profileCompleteness === 'number' 
        ? Math.max(0, Math.min(100, profileCompleteness)) 
        : 0;

    // Get verification status configuration
    const getVerificationConfig = () => {
        switch (verificationStatus) {
            case 'Unverified':
                return {
                    color: 'error',
                    icon: <WarningIcon sx={{ fontSize: 16, color: 'inherit' }} />,
                    title: 'Unverified',
                    shortTitle: 'Unverified'
                };
            case 'Partially Verified':
                return {
                    color: 'warning',
                    icon: <ScheduleIcon sx={{ fontSize: 16, color: 'inherit' }} />,
                    title: 'Partially Verified',
                    shortTitle: 'Partial'
                };
            default:
                return {
                    color: 'success',
                    icon: <VerifiedUserIcon sx={{ fontSize: 16, color: 'inherit' }} />,
                    title: 'Fully Verified',
                    shortTitle: 'Verified'
                };
        }
    };

    // Get profile completeness status text
    const getCompletenessStatusText = () => {
        if (percentage === 100) return 'Complete';
        if (percentage >= 75) return 'Almost There';
        if (percentage >= 50) return 'In Progress';
        return 'Getting Started';
    };

    const verificationConfig = getVerificationConfig();
    
    // Build verification chips with icons
    const verificationChips = [];
    if (verificationDetail) {
        if (verificationDetail.identityVerified) {
            verificationChips.push({ 
                label: 'Identity', 
                color: 'success',
                icon: <CheckCircleIcon sx={{ fontSize: 12 }} />
            });
        } else {
            verificationChips.push({ 
                label: 'Identity', 
                color: 'default',
                icon: <RadioButtonUncheckedIcon sx={{ fontSize: 12 }} />
            });
        }
        if (verificationDetail.backgroundCheckPassed) {
            verificationChips.push({ 
                label: 'Background', 
                color: 'success',
                icon: <CheckCircleIcon sx={{ fontSize: 12 }} />
            });
        } else {
            verificationChips.push({ 
                label: 'Background', 
                color: 'default',
                icon: <RadioButtonUncheckedIcon sx={{ fontSize: 12 }} />
            });
        }
        if (verificationDetail.skillsVerified) {
            verificationChips.push({ 
                label: 'Skills', 
                color: 'success',
                icon: <CheckCircleIcon sx={{ fontSize: 12 }} />
            });
        } else {
            verificationChips.push({ 
                label: 'Skills', 
                color: 'default',
                icon: <RadioButtonUncheckedIcon sx={{ fontSize: 12 }} />
            });
        }
    }
    
    // Build certification issue chips
    const certIssueChips = [];
    if ((certStats.pending || 0) > 0) {
        certIssueChips.push({ label: `⏳ ${certStats.pending}`, color: 'warning' });
    }
    if ((certStats.expiring || 0) > 0) {
        certIssueChips.push({ label: `⚠ ${certStats.expiring}`, color: 'warning' });
    }
    if (((certStats.rejected || 0) + (certStats.expired || 0)) > 0) {
        certIssueChips.push({ label: `❌ ${(certStats.rejected || 0) + (certStats.expired || 0)}`, color: 'error' });
    }

    // Build profile completeness chips
    const profileChips = [];
    if (percentage === 100) {
        profileChips.push({ label: '✓ Complete', color: 'success' });
    } else {
        profileChips.push({ label: getCompletenessStatusText(), color: percentage >= 75 ? 'info' : percentage >= 50 ? 'warning' : 'error' });
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
            {/* Profile Completeness Card */}
            <Grid item xs={12} sm={6} lg={12} sx={{ display: 'flex' }}>
                        <Paper
                            elevation={0}
                            onClick={onContinueProfile && percentage < 100 ? onContinueProfile : undefined}
                            sx={{
                                p: { xs: 0.5, sm: 0.5, md: 0.875, lg: 1, xl: 1.25 },
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: { xs: 'row', sm: 'row', md: 'column' },
                                alignItems: { xs: 'center', sm: 'center', md: 'flex-start' },
                                justifyContent: { xs: 'space-between', sm: 'space-between', md: 'flex-start' },
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.15),
                                borderRadius: { xs: 3, sm: 2, md: 1.5, lg: 1.75 },
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: onContinueProfile && percentage < 100 ? 'pointer' : 'default',
                                overflow: 'hidden',
                                position: 'relative',
                                minHeight: { xs: 40, sm: 44, md: 80, lg: 90, xl: 100 },
                                '&:hover': onContinueProfile && percentage < 100 ? {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                                } : {},
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: { xs: 2, sm: 2.5, md: 3 },
                                    height: '100%',
                                    background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.5)} 100%)`,
                                },
                                // Mobile chip-like horizontal layout
                                '@media (max-width: 600px)': {
                                    p: 0.5,
                                    borderRadius: 3,
                                    minHeight: 40,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    '&::before': {
                                        width: 2,
                                    }
                                },
                            }}
                        >
                            {/* Mobile: Horizontal chip layout */}
                            <Box sx={{ 
                                display: { xs: 'flex', sm: 'flex', md: 'none' },
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 0.5,
                                flex: 1,
                                minWidth: 0,
                                width: '100%'
                            }}>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontSize: '0.5rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.2px',
                                            lineHeight: 1.2,
                                            display: 'block',
                                            mb: 0.1
                                        }}
                                    >
                                        Profile
                                    </Typography>
                                    <Stack direction="row" alignItems="baseline" spacing={0.2} sx={{ flexWrap: 'nowrap' }}>
                                        <Typography 
                                            variant="body2" 
                                            fontWeight={700}
                                            sx={{ 
                                                fontSize: '0.75rem',
                                                lineHeight: 1,
                                                color: 'primary.main'
                                            }}
                                        >
                                            {percentage}%
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: 'text.secondary',
                                                fontSize: '0.45rem',
                                                lineHeight: 1,
                                                fontWeight: 500
                                            }}
                                        >
                                            {getCompletenessStatusText()}
                                        </Typography>
                                    </Stack>
                                </Box>
                                {percentage < 100 && (
                                    <Box sx={{ flexShrink: 0 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={percentage}
                                            sx={{
                                                width: 40,
                                                height: 3,
                                                borderRadius: 1.5,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 1.5,
                                                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>

                            {/* Desktop: Vertical card layout */}
                            <Box sx={{ flex: 1, display: { xs: 'none', sm: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontSize: { md: '0.7rem', lg: '0.75rem', xl: '0.8rem' },
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: { md: '0.6px', lg: '0.7px' },
                                            mb: { md: 0.375, lg: 0.5 },
                                            display: 'block',
                                            lineHeight: 1.2,
                                            pl: { md: 0.75, lg: 1 }
                                        }}
                                    >
                                        Profile
                                    </Typography>
                                    <Stack direction="row" alignItems="baseline" spacing={0.25} sx={{ flexWrap: 'wrap', gap: 0.2, pl: { md: 0.75, lg: 1 }, mb: { md: 0.5, lg: 0.625 } }}>
                                        <Typography 
                                            variant="h6" 
                                            fontWeight={700}
                                            sx={{ 
                                                fontSize: { md: '1.25rem', lg: '1.5rem', xl: '1.75rem' },
                                                lineHeight: 1,
                                                color: 'primary.main'
                                            }}
                                        >
                                            {percentage}%
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: 'text.secondary',
                                                fontSize: { md: '0.65rem', lg: '0.7rem' },
                                                lineHeight: 1.2,
                                                fontWeight: 500
                                            }}
                                        >
                                            {getCompletenessStatusText()}
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ pl: { md: 0.75, lg: 1 } }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={percentage}
                                            sx={{
                                                height: { md: 3, lg: 3.5 },
                                                borderRadius: 0.5,
                                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 0.5,
                                                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                                                }
                                            }}
                                        />
                                    </Box>
                                </Box>
                                {percentage < 100 && onContinueProfile && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        fullWidth
                                        onClick={onContinueProfile}
                                        sx={{ 
                                            mt: { md: 0.5, lg: 0.625 },
                                            borderRadius: { md: 1 },
                                            textTransform: 'none', 
                                            fontWeight: 600,
                                            fontSize: { md: '0.7rem', lg: '0.75rem' },
                                            py: { md: 0.375, lg: 0.5 },
                                            px: { md: 1, lg: 1.25 },
                                            minHeight: { md: 28, lg: 32 }
                                        }}
                                    >
                                        Complete →
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

            {/* Verification Status Card */}
            <Grid item xs={12} sm={6} lg={12} sx={{ display: 'flex' }}>
                        <Paper
                            elevation={0}
                            onClick={verificationStatus === 'Unverified' && unverifiedCertifications.length > 0 ? () => navigate('/my-certifications') : undefined}
                            sx={{
                                p: { xs: 0.5, sm: 0.5, md: 0.875, lg: 1, xl: 1.25 },
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: { xs: 'row', sm: 'row', md: 'column' },
                                alignItems: { xs: 'center', sm: 'center', md: 'flex-start' },
                                justifyContent: { xs: 'space-between', sm: 'space-between', md: 'flex-start' },
                                border: '1px solid',
                                borderColor: alpha(theme.palette[verificationConfig.color]?.main || theme.palette.primary.main, 0.15),
                                borderRadius: { xs: 3, sm: 2, md: 1.5, lg: 1.75 },
                                background: `linear-gradient(135deg, ${alpha(theme.palette[verificationConfig.color]?.main || theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: verificationStatus === 'Unverified' && unverifiedCertifications.length > 0 ? 'pointer' : 'default',
                                overflow: 'hidden',
                                position: 'relative',
                                minHeight: { xs: 40, sm: 44, md: 80, lg: 90, xl: 100 },
                                '&:hover': verificationStatus === 'Unverified' && unverifiedCertifications.length > 0 ? {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    borderColor: alpha(theme.palette[verificationConfig.color]?.main || theme.palette.primary.main, 0.3),
                                    background: `linear-gradient(135deg, ${alpha(theme.palette[verificationConfig.color]?.main || theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette[verificationConfig.color]?.main || theme.palette.primary.main, 0.02)} 100%)`,
                                } : {},
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: { xs: 2, sm: 2.5, md: 3 },
                                    height: '100%',
                                    background: `linear-gradient(180deg, ${theme.palette[verificationConfig.color]?.main || theme.palette.primary.main} 0%, ${alpha(theme.palette[verificationConfig.color]?.main || theme.palette.primary.main, 0.5)} 100%)`,
                                },
                                // Mobile chip-like horizontal layout
                                '@media (max-width: 600px)': {
                                    p: 0.5,
                                    borderRadius: 3,
                                    minHeight: 40,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    '&::before': {
                                        width: 2,
                                    }
                                },
                            }}
                        >
                            {/* Mobile: Horizontal chip layout */}
                            <Box sx={{ 
                                display: { xs: 'flex', sm: 'flex', md: 'none' },
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 0.5,
                                flex: 1,
                                minWidth: 0
                            }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    color: theme.palette[verificationConfig.color]?.main || theme.palette.primary.main,
                                    flexShrink: 0,
                                    '& svg': { fontSize: 10 }
                                }}>
                                    {verificationConfig.icon}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontSize: '0.5rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.2px',
                                            lineHeight: 1.2,
                                            display: 'block',
                                            mb: 0.1
                                        }}
                                    >
                                        Verification
                                    </Typography>
                                    {(verificationChips.length > 0 || certIssueChips.length > 0) && (
                                        <Stack direction="row" spacing={0.1} sx={{ flexWrap: 'wrap', gap: 0.1 }}>
                                            {(verificationChips.length > 0 ? verificationChips : certIssueChips).slice(0, 2).map((chip, index) => (
                                                <Chip 
                                                    key={index}
                                                    size="small" 
                                                    label={chip.label}
                                                    icon={chip.icon}
                                                    color={chip.color} 
                                                    sx={{ 
                                                        height: 14,
                                                        fontSize: '0.45rem',
                                                        fontWeight: 600,
                                                        '& .MuiChip-label': { px: 0.3, py: 0 },
                                                        '& .MuiChip-icon': { fontSize: 8, ml: 0.3, color: 'inherit' }
                                                    }} 
                                                />
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                            </Box>

                            {/* Desktop: Vertical card layout */}
                            <Box sx={{ 
                                display: { xs: 'none', sm: 'none', md: 'flex' },
                                flexDirection: 'column',
                                flex: 1
                            }}>
                                <Stack direction="row" alignItems="center" spacing={0.25} sx={{ mb: { md: 0.5, lg: 0.625 }, pl: { md: 0.75, lg: 1 } }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        color: theme.palette[verificationConfig.color]?.main || theme.palette.primary.main,
                                        '& svg': { fontSize: { md: 14, lg: 15, xl: 16 } }
                                    }}>
                                        {verificationConfig.icon}
                                    </Box>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontSize: { md: '0.7rem', lg: '0.75rem', xl: '0.8rem' },
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: { md: '0.6px', lg: '0.7px' },
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        Verification
                                    </Typography>
                                </Stack>
                                {(verificationChips.length > 0 || certIssueChips.length > 0) && (
                                    <Stack 
                                        direction="row" 
                                        spacing={0.2} 
                                        sx={{ 
                                            flexWrap: 'wrap', 
                                            gap: { md: 0.375 }, 
                                            pl: { md: 0.75, lg: 1 },
                                            alignItems: 'center',
                                            flex: 1
                                        }}
                                    >
                                        {(verificationChips.length > 0 ? verificationChips : certIssueChips).map((chip, index) => (
                                            <Chip 
                                                key={index}
                                                size="small" 
                                                label={chip.label}
                                                icon={chip.icon}
                                                color={chip.color} 
                                                sx={{ 
                                                    height: { md: 20, lg: 22 },
                                                    fontSize: { md: '0.65rem', lg: '0.7rem', xl: '0.75rem' },
                                                    fontWeight: 600,
                                                    '& .MuiChip-label': { px: { md: 0.625, lg: 0.75 }, py: 0 },
                                                    '& .MuiChip-icon': { fontSize: { md: 12, lg: 13 }, ml: { md: 0.625 }, color: 'inherit' }
                                                }} 
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        </Paper>
            </Grid>
        </Grid>
    );
};

export default ProfileVerificationCard;
