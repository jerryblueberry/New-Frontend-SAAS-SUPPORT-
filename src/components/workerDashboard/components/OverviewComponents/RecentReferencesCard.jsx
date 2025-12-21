import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Stack,
    Chip,
    Skeleton,
    Avatar,
    useTheme,
    alpha,
    Fade,
    Divider,
} from '@mui/material';
import {
    People as PeopleIcon,
    Business as BusinessIcon,
    Email as EmailIcon,
    CheckCircle as CheckCircleIcon,
    AccessTime as AccessTimeIcon,
    Cancel as CancelIcon,
    Warning as WarningIcon,
    ArrowForward as ArrowForwardIcon,
    Visibility as VisibilityIcon,
    Send as SendIcon,
} from '@mui/icons-material';

/**
 * Get status configuration for reference status
 */
const getStatusConfig = (status, theme) => {
    switch (status) {
        case 'Completed':
            return {
                color: theme.palette.success.main,
                bg: alpha(theme.palette.success.main, 0.15),
                icon: CheckCircleIcon,
                label: 'Completed',
                chipColor: 'success',
            };
        case 'EmailSent':
            return {
                color: theme.palette.info.main,
                bg: alpha(theme.palette.info.main, 0.15),
                icon: SendIcon,
                label: 'Email Sent',
                chipColor: 'info',
            };
        case 'Viewed':
            return {
                color: theme.palette.info.main,
                bg: alpha(theme.palette.info.main, 0.15),
                icon: VisibilityIcon,
                label: 'Viewed',
                chipColor: 'info',
            };
        case 'InProgress':
            return {
                color: theme.palette.info.main,
                bg: alpha(theme.palette.info.main, 0.15),
                icon: AccessTimeIcon,
                label: 'In Progress',
                chipColor: 'info',
            };
        case 'Rejected':
        case 'Bounced':
            return {
                color: theme.palette.error.main,
                bg: alpha(theme.palette.error.main, 0.15),
                icon: CancelIcon,
                label: status === 'Bounced' ? 'Bounced' : 'Rejected',
                chipColor: 'error',
            };
        case 'Expired':
            return {
                color: theme.palette.warning.main,
                bg: alpha(theme.palette.warning.main, 0.15),
                icon: WarningIcon,
                label: 'Expired',
                chipColor: 'warning',
            };
        default:
            return {
                color: theme.palette.text.secondary,
                bg: alpha(theme.palette.text.secondary, 0.1),
                icon: AccessTimeIcon,
                label: 'Pending',
                chipColor: 'default',
            };
    }
};

/**
 * RecentReferencesCard - Modern SaaS-Level Design
 * 
 * Premium references card built with Material-UI following industry best practices.
 * Features smooth animations, accessibility, and responsive design.
 * Displays recent references with company, email, and status information.
 * 
 * @param {Array} recentReferences - Array of reference objects
 * @param {boolean} isLoading - Loading state
 * @param {Function} navigate - Navigation function
 */
const RecentReferencesCard = ({ recentReferences = [], isLoading, navigate }) => {
    const [hovered, setHovered] = useState(false);
    const theme = useTheme();
    
    // Display up to 2 references
    const displayReferences = useMemo(
        () => recentReferences.slice(0, 2),
        [recentReferences]
    );

    // Color configuration for the card
    const colorConfig = useMemo(
        () => ({
            primary: theme.palette.secondary.main,
            light: theme.palette.secondary.light,
            dark: theme.palette.secondary.dark,
            bg: alpha(theme.palette.secondary.main, 0.08),
            border: alpha(theme.palette.secondary.main, 0.2),
            hoverBg: alpha(theme.palette.secondary.main, 0.12),
        }),
        [theme]
    );

    const handleCardClick = () => {
        if (navigate) {
            navigate('/work-history');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Card
                elevation={0}
                sx={{
                    height: '100%',
                    minHeight: { xs: 140, sm: 160 },
                    border: `1px solid ${colorConfig.border}`,
                    borderRadius: 2.5,
                    backgroundColor: 'background.paper',
                }}
            >
                <CardContent
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Skeleton variant="circular" width={44} height={44} />
                            <Skeleton variant="text" width="60%" height={20} />
                        </Stack>
                        <Skeleton variant="text" width="100%" height={16} />
                        <Skeleton variant="text" width="75%" height={16} />
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            elevation={0}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleCardClick}
            sx={{
                height: '100%',
                minHeight: { xs: 140, sm: 160 },
                border: `1px solid ${colorConfig.border}`,
                borderRadius: 2.5,
                backgroundColor: 'background.paper',
                cursor: navigate ? 'pointer' : 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${colorConfig.primary}, ${colorConfig.light})`,
                    opacity: hovered ? 1 : 0.6,
                    transition: 'opacity 0.3s ease',
                },
                '&:hover': navigate ? {
                    backgroundColor: colorConfig.hoverBg,
                    borderColor: colorConfig.primary,
                    boxShadow: `0 8px 24px ${alpha(colorConfig.primary, 0.15)}`,
                    transform: 'translateY(-2px)',
                    '&::before': {
                        opacity: 1,
                    },
                } : {},
            }}
        >
            <CardContent
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:last-child': {
                        pb: { xs: 2, sm: 2.5 },
                    },
                }}
            >
                {/* Header Section */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        mb: 2,
                    }}
                >
                    {/* Icon Avatar */}
                    <Avatar
                        sx={{
                            width: { xs: 40, sm: 44 },
                            height: { xs: 40, sm: 44 },
                            background: `linear-gradient(135deg, ${colorConfig.primary}, ${colorConfig.dark})`,
                            boxShadow: `0 4px 12px ${alpha(colorConfig.primary, 0.3)}`,
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: hovered ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                        }}
                    >
                        <PeopleIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                    </Avatar>
                </Box>

                {/* Title */}
                <Typography
                    variant="caption"
                    sx={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'text.secondary',
                        mb: 1.5,
                    }}
                >
                    Recent References
                </Typography>

                {/* References List */}
                {displayReferences.length > 0 ? (
                    <Stack spacing={1.5} sx={{ flex: 1, mb: 2 }}>
                        {displayReferences.map((ref, idx) => {
                            const statusConfig = getStatusConfig(ref.status, theme);
                            const StatusIcon = statusConfig.icon;
                            const companyName = ref.company || ref.companyName || 'N/A';

                            return (
                                <Fade in key={idx} timeout={300 + idx * 100}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 1.5,
                                            backgroundColor: alpha(theme.palette.grey[500], 0.04),
                                            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: alpha(theme.palette.grey[500], 0.08),
                                                borderColor: alpha(colorConfig.primary, 0.3),
                                            },
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            {/* Company Name */}
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <BusinessIcon
                                                    sx={{
                                                        fontSize: 14,
                                                        color: 'text.secondary',
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: 'text.primary',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        flex: 1,
                                                    }}
                                                >
                                                    {companyName}
                                                </Typography>
                                            </Stack>

                                            {/* Email */}
                                            {ref.email && (
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 3 }}>
                                                    <EmailIcon
                                                        sx={{
                                                            fontSize: 12,
                                                            color: 'text.secondary',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontSize: '0.7rem',
                                                            color: 'text.secondary',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            flex: 1,
                                                        }}
                                                    >
                                                        {ref.email}
                                                    </Typography>
                                                </Stack>
                                            )}

                                            {/* Status Badge */}
                                            {ref.status && (
                                                <Box sx={{ pl: 3 }}>
                                                    <Chip
                                                        icon={<StatusIcon sx={{ fontSize: 12 }} />}
                                                        label={statusConfig.label}
                                                        size="small"
                                                        color={statusConfig.chipColor}
                                                        sx={{
                                                            height: 22,
                                                            fontSize: '0.65rem',
                                                            fontWeight: 600,
                                                            backgroundColor: statusConfig.bg,
                                                            color: statusConfig.color,
                                                            border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
                                                            '& .MuiChip-icon': {
                                                                color: statusConfig.color,
                                                                fontSize: 12,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>
                                </Fade>
                            );
                        })}
                    </Stack>
                ) : (
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 2,
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.75rem',
                                color: 'text.secondary',
                                fontStyle: 'italic',
                            }}
                        >
                            No recent references
                        </Typography>
                    </Box>
                )}

                {/* Footer - View All Link */}
                {navigate && (
                    <Box sx={{ mt: 'auto' }}>
                        <Divider sx={{ mb: 1.5 }} />
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                transition: 'opacity 0.3s ease',
                                opacity: hovered ? 1 : 0.7,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    color: colorConfig.primary,
                                }}
                            >
                                View all references
                            </Typography>
                            <ArrowForwardIcon
                                sx={{
                                    fontSize: 14,
                                    color: colorConfig.primary,
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: hovered ? 'translateX(4px)' : 'translateX(0)',
                                }}
                            />
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

RecentReferencesCard.propTypes = {
    recentReferences: PropTypes.arrayOf(PropTypes.shape({
        companyName: PropTypes.string,
        company: PropTypes.string,
        email: PropTypes.string,
        status: PropTypes.string,
        emailTracking: PropTypes.object,
    })),
    isLoading: PropTypes.bool,
    navigate: PropTypes.func.isRequired,
};

export default RecentReferencesCard;
