import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Box,
    Typography,
    LinearProgress,
    Chip,
    Avatar,
    Stack,
    useTheme,
    alpha,
    Fade,
    Divider,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Shield as ShieldIcon,
    Warning as WarningIcon,
    AccessTime as AccessTimeIcon,
    RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { 
    getVerificationConfig, 
    buildVerificationItems, 
    calculateVerificationProgress,
    buildCertificationIssues 
} from './utils/helpers';

/**
 * Map verification status to MUI color palette
 */
const getStatusColorConfig = (status, theme) => {
    switch (status) {
        case 'Unverified':
            return {
                primary: theme.palette.error.main,
                light: theme.palette.error.light,
                dark: theme.palette.error.dark,
                bg: alpha(theme.palette.error.main, 0.08),
                border: alpha(theme.palette.error.main, 0.2),
                hoverBg: alpha(theme.palette.error.main, 0.12),
                chipColor: 'error',
            };
        case 'Partially Verified':
            return {
                primary: theme.palette.warning.main,
                light: theme.palette.warning.light,
                dark: theme.palette.warning.dark,
                bg: alpha(theme.palette.warning.main, 0.08),
                border: alpha(theme.palette.warning.main, 0.2),
                hoverBg: alpha(theme.palette.warning.main, 0.12),
                chipColor: 'warning',
            };
        case 'Verified':
        default:
            return {
                primary: theme.palette.success.main,
                light: theme.palette.success.light,
                dark: theme.palette.success.dark,
                bg: alpha(theme.palette.success.main, 0.08),
                border: alpha(theme.palette.success.main, 0.2),
                hoverBg: alpha(theme.palette.success.main, 0.12),
                chipColor: 'success',
            };
    }
};

/**
 * Map icon string to MUI icon component
 */
const getMuiIcon = (iconName) => {
    const iconMap = {
        AlertTriangle: WarningIcon,
        Clock: AccessTimeIcon,
        Shield: ShieldIcon,
    };
    return iconMap[iconName] || ShieldIcon;
};

/**
 * VerificationStatusCard - Modern SaaS-Level Design
 * 
 * Premium verification status card built with Material-UI following industry best practices.
 * Features smooth animations, accessibility, and responsive design.
 * 
 * @param {string} verificationStatus - Current verification status
 * @param {Object} verificationDetail - Verification detail object
 * @param {Object} verificationConfig - Optional pre-computed verification config
 * @param {React.ComponentType} VerificationIcon - Optional custom icon component
 * @param {Object} certStats - Certification statistics
 */
const VerificationStatusCard = ({ 
    verificationStatus, 
    verificationDetail, 
    verificationConfig: providedConfig,
    VerificationIcon: providedIcon,
    certStats 
}) => {
    const theme = useTheme();
    const [hovered, setHovered] = useState(false);

    // Get verification configuration
    const verificationConfig = providedConfig || getVerificationConfig(verificationStatus);
    const status = verificationStatus || 'Unverified';
    
    // Get MUI icon component based on verification status
    const IconComponent = useMemo(() => {
        if (providedIcon) return providedIcon;
        
        // Map verification status directly to MUI icons
        switch (status) {
            case 'Unverified':
                return WarningIcon;
            case 'Partially Verified':
                return AccessTimeIcon;
            case 'Verified':
            default:
                return ShieldIcon;
        }
    }, [providedIcon, status]);

    // Calculate verification data
    const verificationItems = useMemo(() => 
        buildVerificationItems(verificationDetail), 
        [verificationDetail]
    );
    
    const { verifiedCount, totalCount, percentage: verificationProgress } = useMemo(
        () => calculateVerificationProgress(verificationItems),
        [verificationItems]
    );

    const certIssues = useMemo(() => 
        buildCertificationIssues(certStats || {}), 
        [certStats]
    );
    
    const hasIssues = certIssues.length > 0;
    const isFullyVerified = status === 'Verified' || verificationProgress === 100;

    // Get color configuration based on status
    const colorConfig = useMemo(
        () => getStatusColorConfig(status, theme),
        [status, theme]
    );

    return (
        <Card
            elevation={0}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            sx={{
                height: '100%',
                minHeight: { xs: 140, sm: 160 },
                border: `1px solid ${colorConfig.border}`,
                borderRadius: 2.5,
                backgroundColor: 'background.paper',
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
                '&:hover': {
                    backgroundColor: colorConfig.hoverBg,
                    borderColor: colorConfig.primary,
                    boxShadow: `0 8px 24px ${alpha(colorConfig.primary, 0.15)}`,
                    transform: 'translateY(-2px)',
                    '&::before': {
                        opacity: 1,
                    },
                },
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
                        <IconComponent sx={{ fontSize: { xs: 22, sm: 24 } }} />
                    </Avatar>

                    {/* Verified Badge */}
                    {isFullyVerified && !hasIssues && (
                        <Fade in={isFullyVerified} timeout={500}>
                            <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                label="Verified"
                                size="small"
                                sx={{
                                    height: 24,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    backgroundColor: alpha(theme.palette.success.main, 0.15),
                                    color: theme.palette.success.dark,
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                    '& .MuiChip-icon': {
                                        color: theme.palette.success.main,
                                    },
                                }}
                            />
                        </Fade>
                    )}
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
                    Verification Status
                </Typography>

                {/* Status Badge */}
                <Box sx={{ mb: 2 }}>
                    <Chip
                        label={status}
                        size="small"
                        color={colorConfig.chipColor}
                        sx={{
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            backgroundColor: alpha(colorConfig.primary, 0.15),
                            color: colorConfig.dark,
                            border: `1px solid ${alpha(colorConfig.primary, 0.3)}`,
                        }}
                    />
                </Box>

                {/* Verification Checklist or Issues */}
                {verificationItems.length > 0 ? (
                    <Stack spacing={0.75} sx={{ mb: 2, flex: 1 }}>
                        {verificationItems.map((item, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                {item.verified ? (
                                    <CheckCircleIcon
                                        sx={{
                                            fontSize: 16,
                                            color: theme.palette.success.main,
                                            flexShrink: 0,
                                        }}
                                    />
                                ) : (
                                    <RadioButtonUncheckedIcon
                                        sx={{
                                            fontSize: 16,
                                            color: theme.palette.grey[400],
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.7rem',
                                        fontWeight: item.verified ? 600 : 500,
                                        color: item.verified 
                                            ? 'text.primary' 
                                            : 'text.secondary',
                                    }}
                                >
                                    {item.label}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                ) : certIssues.length > 0 ? (
                    <Stack spacing={0.75} sx={{ mb: 2, flex: 1 }}>
                        {certIssues.slice(0, 2).map((issue, idx) => (
                            <Chip
                                key={idx}
                                label={issue.label}
                                size="small"
                                color={issue.type === 'error' ? 'error' : 'warning'}
                                sx={{
                                    height: 22,
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    alignSelf: 'flex-start',
                                }}
                            />
                        ))}
                    </Stack>
                ) : (
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                            mb: 2,
                            fontStyle: 'italic',
                        }}
                    >
                        No data available
                    </Typography>
                )}

                {/* Progress Indicator */}
                {!isFullyVerified && verificationItems.length > 0 && (
                    <Box sx={{ mt: 'auto' }}>
                        <Divider sx={{ mb: 1.5 }} />
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 1,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.65rem',
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                }}
                            >
                                {verifiedCount}/{totalCount} verified
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.7rem',
                                    color: colorConfig.dark,
                                    fontWeight: 700,
                                }}
                            >
                                {verificationProgress}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={verificationProgress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: alpha(colorConfig.primary, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    background: `linear-gradient(90deg, ${colorConfig.primary}, ${colorConfig.light})`,
                                    transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                                },
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

VerificationStatusCard.propTypes = {
    verificationStatus: PropTypes.string,
    verificationDetail: PropTypes.shape({
        identityVerified: PropTypes.bool,
        backgroundCheckPassed: PropTypes.bool,
        skillsVerified: PropTypes.bool,
    }),
    verificationConfig: PropTypes.object,
    VerificationIcon: PropTypes.elementType,
    certStats: PropTypes.shape({
        pending: PropTypes.number,
        expiring: PropTypes.number,
        rejected: PropTypes.number,
        expired: PropTypes.number,
    }),
};

export default VerificationStatusCard;
