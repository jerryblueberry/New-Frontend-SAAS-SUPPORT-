import { Grid, Paper, Stack, Typography, Box, Button, Badge, Chip, Skeleton, alpha, useTheme, Fade } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { formatDate, formatTime } from './utils/dateHelpers';

/**
 * NotificationsCard Component
 * Displays recent notifications with unread count
 */
const NotificationsCard = ({ 
    recentNotifications = [], 
    unreadNotifications = 0, 
    isLoading = false,
    navigate 
}) => {
    const theme = useTheme();

    return (
        <Fade in timeout={400}>
            <Paper
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.15),
                    borderRadius: 1.25,
                    p: { xs: 0.875, sm: 1 },
                    width: '100%',
                    height: '100%',
                    minHeight: { xs: 200, sm: 240, md: 280 },
                    bgcolor: 'background.paper',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 3,
                        height: '100%',
                        background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.5)} 100%)`,
                    },
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                    }
                }}      
            >
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: { xs: 0.375, sm: 0.5 }, pl: 0.5 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: theme.palette.primary.main,
                            '& svg': { fontSize: { xs: 11, sm: 12 } }
                        }}>
                            <NotificationsActiveIcon />
                        </Box>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: 'text.secondary',
                                fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: { xs: '0.3px', sm: '0.5px' },
                                lineHeight: 1.2,
                            }}
                        >
                            Notifications
                        </Typography>
                        {unreadNotifications > 0 && (
                            <Badge 
                                badgeContent={unreadNotifications} 
                                color="error" 
                                max={99}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        fontSize: { xs: '0.575rem', sm: '0.6rem' },
                                        height: { xs: 14, sm: 16 },
                                        minWidth: { xs: 14, sm: 16 },
                                        fontWeight: 700
                                    }
                                }}
                            />
                        )}
                    </Stack>
                    <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        {isLoading && recentNotifications.length === 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.5, sm: 0.625 }, overflow: 'hidden' }}>
                                {[...Array(3)].map((_, i) => (
                                    <Box 
                                        key={i} 
                                        sx={{ 
                                            p: { xs: 0.625, sm: 0.75 }, 
                                            borderRadius: 1, 
                                            border: '1px solid', 
                                            borderColor: 'divider',
                                            bgcolor: alpha(theme.palette.grey[500], 0.04),
                                            flexShrink: 0
                                        }}
                                    >
                                        <Skeleton variant="text" width="70%" height={14} sx={{ mb: 0.25 }} />
                                        <Skeleton variant="text" width="40%" height={10} />
                                    </Box>
                                ))}
                            </Box>
                        ) : recentNotifications.length > 0 ? (
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: { xs: 0.5, sm: 0.625 },
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    maxHeight: { xs: 'none', sm: '280px' },
                                    pr: { xs: 0, sm: 0.5 },
                                    '&::-webkit-scrollbar': {
                                        width: { xs: 0, sm: 4 }
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        bgcolor: alpha(theme.palette.grey[500], 0.3),
                                        borderRadius: 2
                                    }
                                }}
                            >
                                {recentNotifications.slice(0, 3).map((notification, idx) => (
                                    <Paper
                                        key={notification.id || idx}
                                        elevation={0}
                                        onClick={() => navigate('/notifications')}
                                        sx={{
                                            p: { xs: 0.625, sm: 0.75 },
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: notification.read
                                                ? alpha(theme.palette.grey[500], 0.15)
                                                : alpha(theme.palette.primary.main, 0.2),
                                            bgcolor: notification.read
                                                ? 'background.paper'
                                                : alpha(theme.palette.primary.main, 0.04),
                                            '&:hover': {
                                                bgcolor: notification.read
                                                    ? alpha(theme.palette.primary.main, 0.02)
                                                    : alpha(theme.palette.primary.main, 0.08),
                                                borderColor: theme.palette.primary.main,
                                            },
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Typography
                                            variant="body2"
                                            fontWeight={notification.read ? 500 : 600}
                                            sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                color: notification.read ? 'text.secondary' : 'text.primary',
                                                lineHeight: 1.3,
                                                mb: 0.25,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {notification.title || 'Notification'}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ 
                                                fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                                color: 'text.secondary',
                                            }}
                                        >
                                            {formatDate(notification.createdAt)}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 }, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <NotificationsIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'text.disabled', mb: 0.5 }} />
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary"
                                    sx={{
                                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                        fontWeight: 400
                                    }}
                                >
                                    No notifications
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
        </Fade>
    );
};

export default NotificationsCard;

