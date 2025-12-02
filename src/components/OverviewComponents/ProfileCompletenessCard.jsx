import { Paper, Stack, Typography, LinearProgress, Button, Box, alpha, useTheme } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';

/**
 * ProfileCompletenessCard Component
 * Compact profile completion card matching StatCard style
 * Displays percentage, progress bar, and completion status in a compact format
 */
const ProfileCompletenessCard = ({ profileCompleteness = 0, onContinue }) => {
    const theme = useTheme();
    const colorValue = theme.palette.primary.main;

    // Ensure profileCompleteness is a valid number
    const percentage = typeof profileCompleteness === 'number' ? Math.max(0, Math.min(100, profileCompleteness)) : 0;

    const getStatusText = () => {
        if (percentage === 100) return 'Complete';
        if (percentage >= 75) return 'Almost There';
        if (percentage >= 50) return 'In Progress';
        return 'Getting Started';
    };

    const getStatusColor = () => {
        if (profileCompleteness === 100) return 'success';
        if (profileCompleteness >= 75) return 'info';
        if (profileCompleteness >= 50) return 'warning';
        return 'error';
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                position: 'relative',
                '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, ${colorValue} 0%, ${alpha(colorValue, 0.5)} 100%)`,
                }
            }}
        >
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${colorValue} 0%, ${alpha(colorValue, 0.7)} 100%)`,
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                    }}
                >
                    <AssignmentIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            mb: 0.25,
                            display: 'block',
                            lineHeight: 1.2
                        }}
                    >
                        Profile Completeness
                    </Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.25}>
                        <Typography 
                            variant="h6" 
                            fontWeight={700}
                            sx={{ 
                                fontSize: '1.25rem',
                                lineHeight: 1.2,
                                color: 'primary.main'
                            }}
                        >
                            {percentage}%
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: 'text.secondary',
                                fontSize: '0.65rem',
                                lineHeight: 1.2,
                                ml: 0.5
                            }}
                        >
                            {getStatusText()}
                        </Typography>
                    </Stack>
                </Box>
            </Stack>

            <Box sx={{ mb: percentage < 100 ? 1 : 0 }}>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 6,
                        borderRadius: 1,
                        backgroundColor: alpha(colorValue, 0.1),
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 1,
                            background: `linear-gradient(90deg, ${colorValue} 0%, ${alpha(colorValue, 0.8)} 100%)`,
                        }
                    }}
                />
            </Box>

            {percentage < 100 && (
                <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={onContinue}
                    sx={{ 
                        mt: 'auto',
                        borderRadius: 1,
                        textTransform: 'none', 
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        py: 0.75,
                        px: 1.5
                    }}
                >
                    Complete Profile →
                </Button>
            )}
        </Paper>
    );
};

export default ProfileCompletenessCard;

