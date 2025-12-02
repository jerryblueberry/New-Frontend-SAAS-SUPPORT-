import { Box, Typography, Stack, Chip, Paper, alpha, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * StatCard Component
 * Compact iconless stat card optimized for SaaS-level design
 * Perfect for flex row layouts with maximum space utilization
 */
const StatCard = ({ 
    title, 
    value, 
    icon, 
    color = 'primary', 
    chips = [], 
    navigateTo, 
    isLoading = false,
    subtitle,
    valueColor
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleClick = () => {
        if (navigateTo) {
            navigate(navigateTo);
        }
    };

    const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

    return (
        <Paper
            elevation={0}
            onClick={handleClick}
            sx={{
                p: { xs: 0.5, sm: 0.5, md: 0.875, lg: 1, xl: 1.25 },
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'row', md: 'column' },
                alignItems: { xs: 'center', sm: 'center', md: 'flex-start' },
                justifyContent: { xs: 'space-between', sm: 'space-between', md: 'flex-start' },
                border: '1px solid',
                borderColor: alpha(colorValue, 0.15),
                borderRadius: { xs: 3, sm: 2, md: 1.5, lg: 1.75 },
                background: `linear-gradient(135deg, ${alpha(colorValue, 0.05)} 0%, transparent 100%)`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: navigateTo ? 'pointer' : 'default',
                overflow: 'hidden',
                position: 'relative',
                minHeight: { xs: 40, sm: 44, md: 80, lg: 90, xl: 100 },
                '&:hover': navigateTo ? {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: alpha(colorValue, 0.3),
                    background: `linear-gradient(135deg, ${alpha(colorValue, 0.08)} 0%, ${alpha(colorValue, 0.02)} 100%)`,
                } : {},
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: { xs: 2, sm: 2.5, md: 3 },
                    height: '100%',
                    background: `linear-gradient(180deg, ${colorValue} 0%, ${alpha(colorValue, 0.5)} 100%)`,
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
                {icon && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: colorValue,
                        flexShrink: 0,
                        '& svg': { fontSize: 10 }
                    }}>
                        {icon}
                    </Box>
                )}
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
                        {title}
                    </Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.2} sx={{ flexWrap: 'nowrap' }}>
                        <Typography 
                            variant="body2" 
                            fontWeight={700}
                            sx={{ 
                                fontSize: '0.75rem',
                                lineHeight: 1,
                                color: valueColor || colorValue
                            }}
                        >
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontSize: '0.45rem',
                                    lineHeight: 1,
                                    fontWeight: 500
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Stack>
                </Box>
                {chips.length > 0 && (
                    <Stack direction="row" spacing={0.1} sx={{ flexShrink: 0 }}>
                        {chips.slice(0, 2).map((chip, index) => (
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

            {/* Desktop: Vertical card layout */}
            <Box sx={{ 
                flex: 1, 
                display: { xs: 'none', sm: 'none', md: 'flex' }, 
                flexDirection: 'column', 
                justifyContent: 'space-between' 
            }}>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={0.25} sx={{ mb: { md: 0.375, lg: 0.5 }, pl: { md: 0.75, lg: 1 } }}>
                        {icon && (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: colorValue,
                                '& svg': { fontSize: { md: 14, lg: 15, xl: 16 } }
                            }}>
                                {icon}
                            </Box>
                        )}
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
                            {title}
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="baseline" spacing={0.25} sx={{ flexWrap: 'wrap', gap: 0.2, pl: { md: 0.75, lg: 1 } }}>
                        <Typography 
                            variant="h6" 
                            fontWeight={700}
                            sx={{ 
                                fontSize: { md: '1.25rem', lg: '1.5rem', xl: '1.75rem' },
                                lineHeight: 1,
                                color: valueColor || colorValue
                            }}
                        >
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontSize: { md: '0.65rem', lg: '0.7rem' },
                                    lineHeight: 1.2,
                                    fontWeight: 500
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Stack>
                </Box>
                {chips.length > 0 && (
                    <Stack direction="row" spacing={0.2} sx={{ flexWrap: 'wrap', gap: { md: 0.375 }, mt: { md: 0.375, lg: 0.5 }, pl: { md: 0.75, lg: 1 } }}>
                        {chips.map((chip, index) => (
                            <Chip 
                                key={index}
                                size="small" 
                                label={chip.label}
                                icon={chip.icon}
                                color={chip.color} 
                                sx={{ 
                                    height: { md: 18, lg: 20 },
                                    fontSize: { md: '0.65rem', lg: '0.7rem', xl: '0.75rem' },
                                    fontWeight: 600,
                                    '& .MuiChip-label': { px: { md: 0.625, lg: 0.75 }, py: 0 },
                                    '& .MuiChip-icon': { fontSize: { md: 11, lg: 12 }, ml: { md: 0.625 }, color: 'inherit' }
                                }} 
                            />
                        ))}
                    </Stack>
                )}
            </Box>
        </Paper>
    );
};

export default StatCard;

