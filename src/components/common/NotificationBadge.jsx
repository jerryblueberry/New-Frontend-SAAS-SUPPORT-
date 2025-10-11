import React, { useState } from 'react';
import { 
  Badge, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Typography, 
  Box, 
  Divider,
  Chip,
  Avatar,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  CheckCircle,
  Description,
  Work,
  Payment,
  Info,
  Close
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationManagement } from '../../hooks/useNotifications';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';

// Notification type icons and colors
const getNotificationIcon = (type) => {
  switch (type) {
    case 'application-status':
      return <CheckCircle sx={{ color: 'success.main' }} />;
    case 'job-update':
      return <Work sx={{ color: 'primary.main' }} />;
    case 'document-verification':
      return <Description sx={{ color: 'purple.main' }} />;
    case 'payment':
      return <Payment sx={{ color: 'warning.main' }} />;
    case 'system':
      return <Info sx={{ color: 'info.main' }} />;
    default:
      return <NotificationsIcon sx={{ color: 'grey.500' }} />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'application-status':
      return 'success';
    case 'job-update':
      return 'primary';
    case 'document-verification':
      return 'secondary';
    case 'payment':
      return 'warning';
    case 'system':
      return 'info';
    default:
      return 'default';
  }
};

const NotificationBadge = ({ onNavigateToNotifications }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Use the new notification management hook
  const {
    unreadCount,
    recentNotifications,
    isLoadingUnreadCount,
    isLoadingRecent,
    markAsRead,
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead
  } = useNotificationManagement();

  // Connection status monitoring
  const { isOnline, hasConnectionError } = useConnectionStatus();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    handleClose();
  };

  const handleViewAll = () => {
    handleClose();
    if (onNavigateToNotifications) {
      onNavigateToNotifications();
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          sx={{ 
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                height: '18px',
                minWidth: '18px',
                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' },
                  '100%': { transform: 'scale(1)' }
                }
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                size="small"
                color="error"
                variant="outlined"
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer', mt: 1 }}
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Typography>
          )}
        </Box>

        <Divider />

        {/* Notifications List */}
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {!isOnline || hasConnectionError ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {!isOnline ? 'No internet connection' : 'Connection error'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Notifications will appear when connection is restored
              </Typography>
            </Box>
          ) : isLoadingRecent ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Loading notifications...
              </Typography>
            </Box>
          ) : recentNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <NotificationsIcon sx={{ fontSize: 48, color: 'grey.300', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No recent notifications
              </Typography>
            </Box>
          ) : (
            recentNotifications.map((notification) => (
              <MenuItem
                key={notification._id}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
                onClick={() => !notification.read && handleMarkAsRead(notification._id)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={notification.read ? 'normal' : 'bold'}
                        sx={{ flex: 1 }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main'
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        component="div"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={notification.type.replace('-', ' ')}
                          size="small"
                          color={getNotificationColor(notification.type)}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                        <Typography variant="caption" color="text.secondary" component="span">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </MenuItem>
            ))
          )}
        </Box>

        <Divider />

        {/* Footer */}
        <Box sx={{ p: 1 }}>
          <MenuItem onClick={handleViewAll} sx={{ justifyContent: 'center' }}>
            <Typography variant="body2" color="primary" fontWeight="medium">
              View All Notifications
            </Typography>
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBadge;
