import { Grid, Paper, Stack, Typography, Box, Chip, Button, alpha, useTheme, Fade } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VerificationDetails from './VerificationDetails';
import { getStatusIcon, getStatusText, getStatusColor } from './utils/statusHelpers';

/**
 * VerificationStatusCard Component
 * Displays verification status with details and unverified certifications (if applicable)
 */
const VerificationStatusCard = ({ 
    verificationStatus, 
    verificationDetail, 
    unverifiedCertifications = [],
    certStats = {},
    navigate 
}) => {
    const theme = useTheme();

    const getStatusConfig = () => {
        switch (verificationStatus) {
            case 'Unverified':
                return {
                    color: 'error',
                    icon: <WarningIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: 'white' }} />,
                    title: 'Profile Unverified',
                    description: 'Complete verification to access features'
                };
            case 'Partially Verified':
                return {
                    color: 'warning',
                    icon: <ScheduleIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: 'white' }} />,
                    title: 'Partially Verified',
                    description: 'Some items need attention'
                };
            default:
                return {
                    color: 'success',
                    icon: <VerifiedUserIcon sx={{ fontSize: { xs: 24, sm: 28, md: 32 }, color: 'white' }} />,
                    title: 'Fully Verified',
                    description: 'All checks complete'
                };
        }
    };

    const statusConfig = getStatusConfig();
    const statusColor = theme.palette[statusConfig.color]?.main || theme.palette.primary.main;

    return (
        <Grid item xs={12} lg={verificationStatus === 'Unverified' ? 8 : 6}>
            <Fade in timeout={300}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 1.75, sm: 2, md: 2.5 },
                        height: '100%',
                        border: '2px solid',
                        borderColor: alpha(statusColor, 0.3),
                        borderRadius: { xs: 2, sm: 2.5 },
                        bgcolor: 'background.paper',
                        background: `linear-gradient(135deg, ${alpha(statusColor, 0.08)} 0%, ${alpha(statusColor, 0.02)} 100%)`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: `linear-gradient(90deg, ${statusColor} 0%, ${alpha(statusColor, 0.6)} 100%)`,
                        },
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 12px 32px ${alpha(statusColor, 0.2)}`,
                            borderColor: statusColor,
                        }
                    }}
                >
                    <Stack spacing={{ xs: 1.5, sm: 2 }}>
                        <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            spacing={{ xs: 1.25, sm: 1.5 }} 
                            alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                            sx={{ width: '100%' }}
                        >
                            <Box 
                                sx={{
                                    width: { xs: 44, sm: 48, md: 52 },
                                    height: { xs: 44, sm: 48, md: 52 },
                                    borderRadius: { xs: 1.75, sm: 2 },
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`,
                                    flexShrink: 0,
                                    boxShadow: `0 6px 20px ${alpha(statusColor, 0.25)}`,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                {statusConfig.icon}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                                <Typography 
                                    variant="h6" 
                                    fontWeight={700} 
                                    sx={{ 
                                        mb: { xs: 0.375, sm: 0.5 },
                                        fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                        lineHeight: 1.3,
                                        letterSpacing: '-0.015em',
                                        color: 'text.primary',
                                        fontWeight: 700
                                    }}
                                >
                                    {statusConfig.title}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: 'text.secondary',
                                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                        lineHeight: 1.5,
                                        letterSpacing: '0.01em',
                                        fontWeight: 400
                                    }}
                                >
                                    {statusConfig.description}
                                </Typography>
                            </Box>
                        </Stack>

                        {verificationStatus !== 'Unverified' && (
                            <VerificationDetails verificationDetail={verificationDetail} />
                        )}

                        {verificationStatus === 'Unverified' && (
                            <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                                    {(certStats.pending || 0) > 0 && (
                                        <Chip 
                                            label={`Pending ${certStats.pending}`} 
                                            color="warning" 
                                            size="small" 
                                            variant="outlined" 
                                        />
                                    )}
                                    {(certStats.expiring || 0) > 0 && (
                                        <Chip 
                                            label={`Expiring ${certStats.expiring}`} 
                                            color="warning" 
                                            size="small" 
                                            variant="outlined" 
                                        />
                                    )}
                                    {((certStats.rejected || 0) + (certStats.expired || 0)) > 0 && (
                                        <Chip 
                                            label={`Issues ${(certStats.rejected || 0) + (certStats.expired || 0)}`} 
                                            color="error" 
                                            size="small" 
                                            variant="outlined" 
                                        />
                                    )}
                                </Stack>
                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                                    Unverified Certifications ({unverifiedCertifications.length})
                                </Typography>
                                {unverifiedCertifications.length > 0 ? (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1,
                                        maxHeight: { xs: 200, md: 240 },
                                        overflowY: 'auto',
                                        pr: 1,
                                        '&::-webkit-scrollbar': { width: 6 },
                                        '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 3 }
                                    }}>
                                        {unverifiedCertifications.slice(0, 6).map((cert, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    p: 1.25,
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    bgcolor: 'grey.50',
                                                    transition: 'all 0.2s',
                                                    '&:hover': { bgcolor: 'grey.100', transform: 'translateX(4px)' }
                                                }}
                                            >
                                                <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                                                    {cert.name}
                                                </Typography>
                                                <Chip
                                                    icon={getStatusIcon(cert.status)}
                                                    label={getStatusText(cert.status)}
                                                    color={getStatusColor(cert.status)}
                                                    size="small"
                                                    sx={{ fontSize: '0.7rem', height: 24 }}
                                                />
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No pending certifications.
                                    </Typography>
                                )}
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        fullWidth
                                        onClick={() => navigate('/my-certifications')}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Fix Now
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        fullWidth
                                        onClick={() => navigate('/my-certifications')}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        View All
                                    </Button>
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                </Paper>
            </Fade>
        </Grid>
    );
};

export default VerificationStatusCard;

