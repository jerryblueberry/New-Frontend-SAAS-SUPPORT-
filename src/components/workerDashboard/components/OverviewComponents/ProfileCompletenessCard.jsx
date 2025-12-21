import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Box,
    Typography,
    LinearProgress,
    Button,
    Chip,
    Avatar,
    useTheme,
    alpha,
    Fade,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Person as PersonIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { getProfileCompletenessColors, getCompletenessStatusText } from './utils/helpers';

/**
 * ProfileCompletenessCard - Modern SaaS-Level Design
 * 
 * Premium profile completion card built with Material-UI following industry best practices.
 * Features smooth animations, accessibility, and responsive design.
 * 
 * @param {number} percentage - Profile completeness percentage (0-100)
 * @param {string} statusText - Optional custom status text
 * @param {Function} onContinue - Callback function when user clicks to complete profile
 */
const ProfileCompletenessCard = ({ percentage, statusText, onContinue }) => {
    const theme = useTheme();
    const [hovered, setHovered] = useState(false);
    
    // Normalize and validate percentage
    const normalizedPercentage = useMemo(() => {
        if (typeof percentage !== 'number' || isNaN(percentage)) return 0;
        return Math.max(0, Math.min(100, Math.round(percentage)));
    }, [percentage]);
    
    const isComplete = normalizedPercentage === 100;
    const displayStatusText = statusText || getCompletenessStatusText(normalizedPercentage);
    
    // Determine color scheme based on completion status
    const colorConfig = useMemo(() => {
        if (isComplete) {
            return {
                primary: theme.palette.success.main,
                light: theme.palette.success.light,
                dark: theme.palette.success.dark,
                bg: alpha(theme.palette.success.main, 0.08),
                border: alpha(theme.palette.success.main, 0.2),
                hoverBg: alpha(theme.palette.success.main, 0.12),
                text: theme.palette.success.dark,
            };
        }
        if (normalizedPercentage < 50) {
            return {
                primary: theme.palette.grey[600],
                light: theme.palette.grey[400],
                dark: theme.palette.grey[700],
                bg: alpha(theme.palette.grey[500], 0.06),
                border: alpha(theme.palette.grey[500], 0.2),
                hoverBg: alpha(theme.palette.grey[500], 0.1),
                text: theme.palette.grey[700],
            };
        }
        return {
            primary: theme.palette.primary.main,
            light: theme.palette.primary.light,
            dark: theme.palette.primary.dark,
            bg: alpha(theme.palette.primary.main, 0.08),
            border: alpha(theme.palette.primary.main, 0.2),
            hoverBg: alpha(theme.palette.primary.main, 0.12),
            text: theme.palette.primary.dark,
        };
    }, [normalizedPercentage, isComplete, theme]);

    const handleCardClick = () => {
        if (!isComplete && onContinue) {
            onContinue();
        }
    };

    const handleButtonClick = (e) => {
        e.stopPropagation();
        if (onContinue) {
            onContinue();
        }
    };

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
                cursor: !isComplete && onContinue ? 'pointer' : 'default',
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
                    opacity: hovered && !isComplete ? 1 : 0.6,
                    transition: 'opacity 0.3s ease',
                },
                '&:hover': !isComplete && onContinue ? {
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
                            transform: hovered && !isComplete ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                        }}
                    >
                        {isComplete ? (
                            <CheckCircleIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                        ) : (
                            <PersonIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                        )}
                    </Avatar>

                    {/* Complete Badge */}
                    {isComplete && (
                        <Fade in={isComplete} timeout={500}>
                            <Chip
                                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                label="Complete"
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
                    Profile Completeness
                </Typography>

                {/* Percentage & Status */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 1,
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="h4"
                        component="span"
                        sx={{
                            fontSize: { xs: '1.75rem', sm: '2rem' },
                            fontWeight: 800,
                            color: colorConfig.text,
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {normalizedPercentage}%
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '0.7rem',
                            color: 'text.secondary',
                            fontWeight: 500,
                        }}
                    >
                        {displayStatusText}
                    </Typography>
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 2.5 }}>
                    <LinearProgress
                        variant="determinate"
                        value={normalizedPercentage}
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

                {/* CTA Button or Complete State */}
                {!isComplete && onContinue ? (
                    <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        onClick={handleButtonClick}
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                        sx={{
                            py: 1.25,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            backgroundColor: 'grey.900',
                            color: 'white',
                            borderRadius: 1.5,
                            boxShadow: `0 2px 8px ${alpha(theme.palette.grey[900], 0.2)}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: 'grey.800',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.grey[900], 0.3)}`,
                                transform: 'translateY(-1px)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                            },
                        }}
                    >
                        Complete Profile
                    </Button>
                ) : isComplete ? (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 0.5,
                        }}
                    >
                        <CheckCircleIcon
                            sx={{
                                fontSize: 16,
                                color: theme.palette.success.main,
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: theme.palette.success.dark,
                            }}
                        >
                            Profile Complete
                        </Typography>
                    </Box>
                ) : null}
            </CardContent>
        </Card>
    );
};

ProfileCompletenessCard.propTypes = {
    percentage: PropTypes.number.isRequired,
    statusText: PropTypes.string,
    onContinue: PropTypes.func,
};

export default ProfileCompletenessCard;
