import { Paper, Stack, Typography, Box, Chip, Skeleton, alpha, useTheme } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import { getStatusIcon, getStatusText, getStatusColor } from './utils/statusHelpers';

/**
 * RecentReferencesSection Component
 * Premium compact card with inline status chips aligned with company names
 * SaaS-level design with perfect space utilization and responsive behavior
 */
const RecentReferencesSection = ({ 
    recentReferences = [], 
    isLoading = false,
    navigate 
}) => {
    const theme = useTheme();
    const colorValue = theme.palette.secondary.main;
    const displayReferences = recentReferences.slice(0, 2);

    return (
        <Paper
            elevation={0}
            onClick={() => navigate('/work-history')}
            sx={{
                p: { xs: 0.5, sm: 0.5, md: 0.875, lg: 1, xl: 1.25 },
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'row', md: 'column' },
                alignItems: { xs: 'center', sm: 'center', md: 'flex-start' },
                border: '1px solid',
                borderColor: alpha(colorValue, 0.15),
                borderRadius: { xs: 3, sm: 2, md: 1.5, lg: 1.75 },
                background: `linear-gradient(135deg, ${alpha(colorValue, 0.05)} 0%, transparent 100%)`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                minHeight: { xs: 40, sm: 44, md: 80, lg: 90, xl: 100 },
                '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    borderColor: alpha(colorValue, 0.3),
                    background: `linear-gradient(135deg, ${alpha(colorValue, 0.08)} 0%, ${alpha(colorValue, 0.02)} 100%)`,
                },
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
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: colorValue,
                    flexShrink: 0,
                    '& svg': { fontSize: 10 }
                }}>
                    <BusinessIcon />
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
                        References
                    </Typography>
                    {displayReferences.length > 0 && (
                        <Stack direction="row" spacing={0.2} alignItems="center" sx={{ flexWrap: 'nowrap', gap: 0.2 }}>
                            <Typography
                                variant="caption"
                                sx={{ 
                                    fontSize: '0.5rem',
                                    color: 'text.secondary',
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: '1 1 auto',
                                    minWidth: 0,
                                }}
                            >
                                {displayReferences[0]?.name || 'No refs'}
                            </Typography>
                            {displayReferences[0]?.status && (
                                <Chip
                                    icon={getStatusIcon(displayReferences[0].status)}
                                    label={getStatusText(displayReferences[0].status)}
                                    color={getStatusColor(displayReferences[0].status)}
                                    size="small"
                                    sx={{ 
                                        fontSize: '0.45rem',
                                        height: 14,
                                        fontWeight: 500,
                                        flexShrink: 0,
                                        '& .MuiChip-label': { px: 0.3, py: 0 },
                                        '& .MuiChip-icon': { fontSize: 8, ml: 0.3, color: 'inherit' }
                                    }}
                                />
                            )}
                        </Stack>
                    )}
                </Box>
            </Box>

            {/* Desktop: Vertical card layout */}
            <Box sx={{ flex: 1, display: { xs: 'none', sm: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', minHeight: 0 }}>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                    <Stack direction="row" alignItems="center" spacing={0.25} sx={{ mb: { md: 0.375, lg: 0.5 }, pl: { md: 0.75, lg: 1 }, flexShrink: 0 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: colorValue,
                            '& svg': { fontSize: { md: 14, lg: 15, xl: 16 } }
                        }}>
                            <BusinessIcon />
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
                            References
                        </Typography>
                    </Stack>
                    
                    {isLoading && recentReferences.length === 0 ? (
                        <Box sx={{ 
                            pl: { xs: 0.375, sm: 0.5, md: 0.75, lg: 1 }, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: { xs: 0.3, sm: 0.4, md: 0.625, lg: 0.75 },
                            flex: 1,
                            overflow: 'hidden'
                        }}>
                            {[...Array(2)].map((_, i) => (
                                <Box key={i} sx={{ flexShrink: 0 }}>
                                    <Skeleton variant="text" width="70%" height={10} sx={{ mb: 0.1 }} />
                                    <Skeleton variant="text" width="50%" height={8} />
                                </Box>
                            ))}
                        </Box>
                    ) : displayReferences.length > 0 ? (
                        <Box sx={{ 
                            pl: { xs: 0.375, sm: 0.5, md: 0.75, lg: 1 }, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: { xs: 0.3, sm: 0.4, md: 0.625, lg: 0.75 },
                            flex: 1,
                            overflow: 'hidden',
                            minHeight: 0
                        }}>
                            {displayReferences.map((ref, idx) => (
                                <Box 
                                    key={idx}
                                    sx={{
                                        flexShrink: 0,
                                        minHeight: 0,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{
                                            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.85rem', lg: '0.95rem', xl: '1rem' },
                                            color: 'text.primary',
                                            lineHeight: 1.3,
                                            mb: { xs: 0.1, sm: 0.15, md: 0.25 },
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 1,
                                            WebkitBoxOrient: 'vertical',
                                            wordBreak: 'break-word',
                                        }}
                                    >
                                        {ref.name}
                                    </Typography>
                                    <Stack 
                                        direction="row" 
                                        alignItems="center" 
                                        spacing={0.3}
                                        sx={{ 
                                            flexWrap: 'nowrap',
                                            gap: { xs: 0.3, sm: 0.4 },
                                            minWidth: 0,
                                            width: '100%'
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{ 
                                                fontSize: { xs: '0.5rem', sm: '0.55rem', md: '0.65rem', lg: '0.7rem' },
                                                color: 'text.secondary',
                                                lineHeight: 1.3,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                flex: '1 1 auto',
                                                minWidth: 0,
                                            }}
                                        >
                                            {ref.company || 'Reference'}
                                        </Typography>
                                        <Chip
                                            icon={getStatusIcon(ref.status)}
                                            label={getStatusText(ref.status)}
                                            color={getStatusColor(ref.status)}
                                            size="small"
                                            sx={{ 
                                                fontSize: { xs: '0.45rem', sm: '0.5rem', md: '0.6rem', lg: '0.65rem' },
                                                height: { xs: 14, sm: 16, md: 20, lg: 22 },
                                                fontWeight: 500,
                                                flexShrink: 0,
                                                '& .MuiChip-label': { 
                                                    px: { xs: 0.4, sm: 0.5, md: 0.75 }, 
                                                    py: 0,
                                                    lineHeight: 1.2
                                                },
                                                '& .MuiChip-icon': { 
                                                    fontSize: { xs: 9, sm: 10, md: 12, lg: 13 }, 
                                                    ml: { xs: 0.4, sm: 0.5 }, 
                                                    mr: { xs: -0.2, sm: -0.25 },
                                                    color: 'inherit' 
                                                },
                                                // Media queries for chip sizing
                                                '@media (max-width: 600px)': {
                                                    height: 14,
                                                    fontSize: '0.45rem',
                                                    '& .MuiChip-label': { px: 0.4 },
                                                    '& .MuiChip-icon': { fontSize: 9, ml: 0.4 }
                                                },
                                                '@media (min-width: 601px) and (max-width: 960px)': {
                                                    height: 16,
                                                    fontSize: '0.5rem',
                                                    '& .MuiChip-label': { px: 0.5 },
                                                    '& .MuiChip-icon': { fontSize: 10, ml: 0.5 }
                                                },
                                            }}
                                        />
                                    </Stack>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box sx={{ 
                            pl: { xs: 0.375, sm: 0.5, md: 0.75, lg: 1 }, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            flex: 1
                        }}>
                            <Typography 
                                variant="caption" 
                                sx={{
                                    fontSize: { xs: '0.55rem', sm: '0.65rem', md: '0.75rem', lg: '0.8rem' },
                                    color: 'text.secondary',
                                    fontWeight: 400
                                }}
                            >
                                No references
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

export default RecentReferencesSection;

