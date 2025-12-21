import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    Card,
    CardContent,
    Box,
    Typography,
    Stack,
    Chip,
    Skeleton,
    useTheme,
    alpha,
    useMediaQuery,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { STAT_CARD_COLORS } from './utils/constants';
import ChipBadge from './ChipBadge';

/**
 * StatCard Component - Premium Compact Design with Material-UI
 * 
 * Best practice compact stat card with optimal typography, spacing, and responsive design.
 * Follows Material Design guidelines for dashboard statistics.
 */
const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'primary', 
    chips = [], 
    navigateTo, 
    isLoading = false,
    subtitle,
    valueColor
}) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const [hovered, setHovered] = useState(false);

    const colors = STAT_CARD_COLORS[color] || STAT_CARD_COLORS.primary;

    // MUI theme color mapping
    const muiColorMap = {
        primary: theme.palette.primary,
        success: theme.palette.success,
        warning: theme.palette.warning,
        error: theme.palette.error,
        info: theme.palette.info,
    };

    const muiColor = muiColorMap[color] || muiColorMap.primary;
    
    // Responsive font sizes following Material Design guidelines
    const titleVariant = isMobile ? 'caption' : 'caption';
    const valueVariant = isMobile ? 'h6' : isTablet ? 'h5' : 'h4';

    const handleClick = () => {
        if (navigateTo) {
            navigate(navigateTo);
        }
    };

    if (isLoading) {
        return (
            <Card 
                elevation={0}
                sx={{
                    height: { xs: 100, sm: 110, md: 120 },
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <CardContent sx={{ p: { xs: 1.5, sm: 1.75, md: 2 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between" mb={1.5}>
                        <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1.5 }} />
                        <Skeleton variant="text" width="60%" height={16} />
                    </Stack>
                    <Skeleton variant="text" width="50%" height={isMobile ? 28 : 32} />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            elevation={0}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleClick}
            sx={{
                height: { xs: 100, sm: 110, md: 120 },
                border: `1px solid ${alpha(muiColor.main, 0.2)}`,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                cursor: navigateTo ? 'pointer' : 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': navigateTo ? {
                    backgroundColor: alpha(muiColor.main, 0.04),
                    borderColor: alpha(muiColor.main, 0.35),
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)',
                } : {},
            }}
        >
            <CardContent 
                sx={{ 
                    p: { xs: 1.5, sm: 1.75, md: 2 }, 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:last-child': { pb: { xs: 1.5, sm: 1.75, md: 2 } } 
                }}
            >
                <Stack spacing={1.25} sx={{ flex: 1, height: '100%' }}>
                    {/* Header: Icon, Title & Chips */}
                    <Stack 
                        direction="row" 
                        spacing={1.25} 
                        alignItems="flex-start" 
                        justifyContent="space-between"
                        sx={{ flexShrink: 0 }}
                    >
                        {Icon && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: { xs: 28, sm: 32, md: 36 },
                                    height: { xs: 28, sm: 32, md: 36 },
                                    borderRadius: 1.5,
                                    background: `linear-gradient(135deg, ${muiColor.main}, ${muiColor.dark})`,
                                    color: 'white',
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: hovered ? 'scale(1.08)' : 'scale(1)',
                                    boxShadow: `0 2px 8px ${alpha(muiColor.main, 0.3)}`,
                                    flexShrink: 0,
                                }}
                            >
                                <Icon size={isMobile ? 16 : isTablet ? 18 : 20} />
                            </Box>
                        )}
                        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                            <Typography
                                variant={titleVariant}
                                sx={{
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    letterSpacing: { xs: '0.3px', sm: '0.5px' },
                                    color: 'text.secondary',
                                    display: 'block',
                                    lineHeight: 1.3,
                                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {title}
                            </Typography>
                            {/* Chips on mobile */}
                            {chips.length > 0 && isMobile && (
                                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
                                    {chips.slice(0, 2).map((chip, idx) => (
                                        <ChipBadge key={idx} chip={chip} size="sm" />
                                    ))}
                                </Stack>
                            )}
                        </Box>
                        {/* Chips on desktop */}
                        {chips.length > 0 && !isMobile && (
                            <Stack 
                                direction="row" 
                                spacing={0.5} 
                                flexWrap="wrap" 
                                justifyContent="flex-end"
                                sx={{ flexShrink: 0 }}
                            >
                                {chips.map((chip, idx) => (
                                    <ChipBadge key={idx} chip={chip} size="sm" />
                                ))}
                            </Stack>
                        )}
                    </Stack>

                    {/* Value Section */}
                    <Stack 
                        direction="row" 
                        alignItems="baseline" 
                        spacing={0.75} 
                        sx={{ 
                            flex: 1,
                            minHeight: 0,
                            justifyContent: 'flex-start',
                        }}
                    >
                        <Typography
                            variant={valueVariant}
                            component="span"
                            sx={{
                                fontWeight: 700,
                                color: valueColor || muiColor.main,
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                                fontSize: {
                                    xs: '1.25rem',
                                    sm: '1.5rem',
                                    md: '1.75rem',
                                },
                            }}
                        >
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography
                                variant="caption"
                                component="span"
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Stack>

                    {/* Hover indicator */}
                    {navigateTo && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                pt: 1,
                                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                opacity: hovered ? 1 : 0,
                                transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 500,
                                    color: muiColor.main,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                }}
                            >
                                View
                            </Typography>
                            <ArrowForward 
                                sx={{ 
                                    fontSize: { xs: 12, sm: 14 },
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: hovered ? 'translateX(2px)' : 'translateX(0)',
                                }} 
                            />
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
    icon: PropTypes.elementType,
    color: PropTypes.oneOf(['primary', 'success', 'warning', 'error', 'info']),
    chips: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        color: PropTypes.oneOf(['success', 'warning', 'error', 'default', 'info']),
    })),
    navigateTo: PropTypes.string,
    isLoading: PropTypes.bool,
    subtitle: PropTypes.string,
    valueColor: PropTypes.string,
};

export default StatCard;
