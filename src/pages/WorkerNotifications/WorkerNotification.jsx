import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Fade,
  useMediaQuery,
  useTheme,
  Fab,
  Tooltip,
  Badge,
  Collapse,
  ToggleButton,
  ToggleButtonGroup,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Description,
  Work,
  Payment,
  Info,
  MarkEmailRead,
  Search,
  Refresh,
  ArrowDownward,
  ArrowUpward,
  Clear,
  FilterList,
  Circle
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { useNotificationManagement, useNotifications } from '../../hooks/useNotifications';
import { useAutoMarkAsRead } from '../../hooks/useAutoMarkAsRead';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';

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

const WorkerNotification = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State management
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(isMobile ? 15 : 20);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Notification management hook with optimized settings
  const {
    unreadCount,
    recentNotifications,
    isLoadingUnreadCount,
    isLoadingRecent,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
    refetchUnreadCount,
    refetchRecent
  } = useNotificationManagement();

  // Auto mark as read functionality with controlled behavior
  const {
    markAsReadOnHover,
    clearViewedCache
  } = useAutoMarkAsRead(markAsRead, markAllAsRead);

  // Connection status monitoring
  const { isOnline, hasConnectionError, connectionError } = useConnectionStatus();

  // Fetch all notifications with filters and auto-refresh
  const { data: notificationsData, isLoading: isLoadingNotifications, error, refetch: refetchNotifications } = useNotifications({
    page: currentPage,
    limit: itemsPerPage,
    unreadOnly: false, // Always fetch all notifications
    type: filterType === 'all' ? null : filterType,
    sortBy,
    sortOrder,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true
  });

  const notifications = notificationsData?.data?.notifications || [];
  const totalPages = Math.ceil((notificationsData?.data?.pagination?.total || 0) / itemsPerPage);

  // Filter notifications based on search query and unread filter
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Apply unread filter if enabled
    if (showUnreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort unread notifications to the top
    return filtered.sort((a, b) => {
      if (a.read === b.read) return 0;
      return a.read ? 1 : -1;
    });
  }, [notifications, searchQuery, showUnreadOnly]);

  // Refetch notifications when component mounts or when returning from another page
  useEffect(() => {
    refetchUnreadCount();
    refetchRecent();
    refetchNotifications();
  }, [refetchUnreadCount, refetchRecent, refetchNotifications]);

  // Clear viewed cache when page changes
  useEffect(() => {
    clearViewedCache();
  }, [currentPage, filterType, searchQuery, clearViewedCache]);

  // Auto-show filters on desktop, hide on mobile
  useEffect(() => {
    setShowFilters(!isMobile);
  }, [isMobile]);

  // Reset expanded notification when filters change
  useEffect(() => {
    setExpandedNotification(null);
  }, [filterType, searchQuery, showUnreadOnly]);



  // Handle mark all as read with refetch
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Refetch after marking all as read to update UI
    setTimeout(() => {
      refetchUnreadCount();
      refetchRecent();
      refetchNotifications();
    }, 500);
  };

  // Handle refresh - refetch all notification data
  const handleRefresh = () => {
    refetchUnreadCount();
    refetchRecent();
    refetchNotifications();
  };

  // Handle notification click - mark as read and expand
  const handleNotificationClick = (notification) => {
    // Toggle expansion
    setExpandedNotification(
      expandedNotification === notification._id ? null : notification._id
    );
    
    // Mark as read if unread (on click interaction)
    if (!notification.read) {
      markAsRead(notification._id);
      // Refetch counts and list after short delay for smooth UX
      setTimeout(() => {
        refetchUnreadCount();
        refetchNotifications();
      }, 400);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setShowUnreadOnly(false);
  };

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };


  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <WorkerNavbar />
      <ConnectionStatus />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <DashboardSidebar />

        {/* Main Content */}
        <Box component="main" sx={{
          flexGrow: 1,
          mt: { xs: 0.5, sm: 1,md:0 },
          p: { xs: 1, sm: 1.5, md: 2 },
          minHeight: '100vh',
          maxWidth: { xs: '100%', md: 'calc(100% - 280px)' }
        }}>
          {/* Modern Header */}
          <Box sx={{ 
            mb: 2.25,
            mt: { xs: .5, sm: .5,md:1 },
            p: { xs: 1.5, sm: 1.5,md:1 },
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.04) 0%, rgba(255, 255, 255, 1) 100%)'
          }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge 
                  badgeContent={unreadCount} 
                  color="error"
                  max={99}
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      minWidth: 20,
                      height: 20
                    }
                  }}
                >
                  <Avatar sx={{ 
                    bgcolor: 'primary.main',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 }
                  }}>
                    <NotificationsIcon />
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h5" fontWeight="700" sx={{ 
                    lineHeight: 1.2,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}>
                    Notifications
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {filteredNotifications.length} total
                    </Typography>
                    <Circle sx={{ fontSize: 4, color: 'text.disabled' }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: unreadCount > 0 ? 'error.main' : 'success.main',
                        fontWeight: 600
                      }}
                    >
                      {unreadCount} unread
                    </Typography>
                  </Stack>
                </Box>
              </Box>
              
              {/* Action Buttons */}
              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh notifications">
                  <IconButton
                    size="medium"
                    onClick={handleRefresh}
                    disabled={isLoadingNotifications}
                    sx={{ 
                      bgcolor: 'background.default',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                {unreadCount > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<MarkEmailRead />}
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAllAsRead}
                    sx={{ 
                      px: { xs: 2, sm: 3 },
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 2
                    }}
                  >
                    {isMobile ? 'Mark All' : 'Mark All Read'}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>

          {/* Search and Filter Controls */}
          <Box sx={{ 
            mb: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            p: { xs: 1, sm: 1.25 },
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            position: 'sticky',
            top: { xs: 64, sm: 76 },
            zIndex: 5
          }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'action.active', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      edge="end"
                    >
                      <Clear fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: 'background.default'
                }
              }}
            />

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={1} 
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              {/* Unread segmented toggle */}
              <ToggleButtonGroup
                exclusive
                value={showUnreadOnly ? 'unread' : 'all'}
                onChange={(e, val) => {
                  if (val === 'unread') setShowUnreadOnly(true);
                  if (val === 'all') setShowUnreadOnly(false);
                }}
                size="small"
                sx={{
                  bgcolor: 'background.default',
                  borderRadius: 1.5,
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    px: 1.5,
                    py: 0.5,
                    fontWeight: 600
                  }
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="unread">Unread</ToggleButton>
              </ToggleButtonGroup>

              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="application-status">Application Status</MenuItem>
                  <MenuItem value="job-update">Job Updates</MenuItem>
                  <MenuItem value="document-verification">Documents</MenuItem>
                  <MenuItem value="payment">Payments</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="createdAt">Sort by Date</MenuItem>
                  <MenuItem value="title">Sort by Title</MenuItem>
                  <MenuItem value="type">Sort by Type</MenuItem>
                </Select>
              </FormControl>

              <Tooltip title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}>
                <IconButton
                  size="small"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  sx={{ 
                    bgcolor: 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  {sortOrder === 'desc' ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />}
                </IconButton>
              </Tooltip>

              {(searchQuery || filterType !== 'all' || sortBy !== 'createdAt' || sortOrder !== 'desc' || showUnreadOnly) && (
                <Tooltip title="Clear all filters">
                  <IconButton
                    size="small"
                    onClick={handleClearFilters}
                    sx={{ 
                      bgcolor: 'error.light',
                      color: 'error.main',
                      '&:hover': { bgcolor: 'error.main', color: 'white' }
                    }}
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>

          {/* Notifications List */}
          <Box sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            {isLoadingNotifications ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 6 }}>
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Loading notifications...
                </Typography>
              </Box>
            ) : error ? (
              <Alert 
                severity="error" 
                sx={{ 
                  m: 2, 
                  borderRadius: 2,
                  '& .MuiAlert-message': { width: '100%' }
                }}
                action={
                  <Button color="inherit" size="small" onClick={handleRefresh}>
                    Retry
                  </Button>
                }
              >
                Failed to load notifications. Please try again.
              </Alert>
            ) : filteredNotifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 6 }}>
                <Avatar sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'grey.100',
                  mx: 'auto',
                  mb: 2
                }}>
                  <NotificationsIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                </Avatar>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  {searchQuery || filterType !== 'all' || showUnreadOnly ? 'No notifications found' : 'You\'re all caught up!'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                  {searchQuery || filterType !== 'all' || showUnreadOnly
                    ? 'Try adjusting your search criteria or filters to see more results.' 
                    : 'You have no new notifications at the moment. Check back later!'
                  }
                </Typography>
                {(searchQuery || filterType !== 'all' || showUnreadOnly) && (
                  <Button
                    variant="contained"
                    onClick={handleClearFilters}
                    startIcon={<Clear />}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </Box>
            ) : (
              <Box sx={{ maxHeight: { xs: '55vh', sm: '65vh' }, overflow: 'auto' }}>
                  {filteredNotifications.map((notification, index) => (
                    <Fade in timeout={150 + (index * 20)} key={notification._id}>
                      <Box
                        sx={{
                          borderBottom: index < filteredNotifications.length - 1 ? 1 : 0,
                          borderColor: 'divider',
                          bgcolor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.04)',
                          borderLeft: notification.read ? 'none' : '3px solid',
                          borderLeftColor: 'primary.main',
                          position: 'relative',
                          '&:hover': { 
                            bgcolor: notification.read ? 'action.hover' : 'rgba(25, 118, 210, 0.08)',
                            transform: 'translateX(1px)'
                          },
                          transition: 'all 0.15s ease-in-out',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <Box sx={{ p: { xs: 1, sm: 1.25 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                            
                            {/* Avatar with Read/Unread Indicator */}
                            <Badge
                              variant="dot"
                              invisible={notification.read}
                              sx={{
                                '& .MuiBadge-badge': {
                                  bgcolor: 'error.main',
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  border: '2px solid white'
                                }
                              }}
                            >
                              <Avatar 
                                sx={{ 
                                  bgcolor: notification.read 
                                    ? `${getNotificationColor(notification.type)}.light` 
                                    : `${getNotificationColor(notification.type)}.main`,
                                  width: { xs: 30, sm: 34 },
                                  height: { xs: 30, sm: 34 },
                                  fontSize: '0.9rem'
                                }}
                              >
                                {getNotificationIcon(notification.type)}
                              </Avatar>
                            </Badge>

                            {/* Content */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                justifyContent: 'space-between',
                                mb: 0.5,
                                gap: 0.75
                              }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={notification.read ? 500 : 700}
                                  color={notification.read ? 'text.primary' : 'primary.main'}
                                  sx={{ 
                                    lineHeight: 1.3,
                                    fontSize: { xs: '0.9rem', sm: '0.92rem' },
                                    flex: 1,
                                    pr: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {notification.title}
                                </Typography>
                                
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    fontWeight: notification.read ? 400 : 600,
                                    whiteSpace: 'nowrap',
                                    ml: 0.5
                                  }}
                                >
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </Typography>
                              </Box>
                              
                              {/* Message */}
                              <Collapse in={expandedNotification === notification._id} collapsedSize={24}>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ 
                                    lineHeight: 1.4,
                                    fontSize: { xs: '0.82rem', sm: '0.85rem' },
                                    mb: 0.75
                                  }}
                                >
                                  {notification.message}
                                </Typography>
                                {!notification.read && expandedNotification === notification._id && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      color: 'primary.main',
                                      fontStyle: 'italic',
                                      fontSize: '0.68rem',
                                      display: 'block',
                                      mt: 0.25
                                    }}
                                  >
                                    ✓ Marked as read
                                  </Typography>
                                )}
                              </Collapse>
                              
                              {/* Tags and Priority */}
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                <Chip
                                  label={notification.type.replace('-', ' ')}
                                  size="small"
                                  color={getNotificationColor(notification.type)}
                                  variant={notification.read ? "outlined" : "filled"}
                                  sx={{ 
                                    fontSize: '0.65rem',
                                    height: 18,
                                    fontWeight: notification.read ? 500 : 600,
                                    textTransform: 'capitalize',
                                    borderRadius: 1
                                  }}
                                />
                                {notification.priority === 'high' && (
                                  <Chip
                                    label="High Priority"
                                    size="small"
                                    color="error"
                                    variant={notification.read ? "outlined" : "filled"}
                                    sx={{ 
                                      fontSize: '0.65rem',
                                      height: 18,
                                      fontWeight: 600,
                                      borderRadius: 1
                                    }}
                                  />
                                )}
                                {!notification.read && (
                                  <Chip
                                    label="New"
                                    size="small"
                                    sx={{ 
                                      fontSize: '0.62rem',
                                      height: 16,
                                      fontWeight: 700,
                                      bgcolor: 'primary.main',
                                      color: 'white',
                                      borderRadius: 1
                                    }}
                                  />
                                )}
                              </Stack>
                            </Box>

                          </Box>
                        </Box>
                      </Box>
                    </Fade>
                  ))}
                </Box>
            )}
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 3,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                    fontWeight: 600
                  }
                }}
              />
            </Box>
          )}

          {/* Floating Action Button for Mobile */}
          {isMobile && unreadCount > 0 && (
            <Fab
              color="primary"
              size="medium"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1000,
                boxShadow: 3
              }}
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
            >
              <Badge badgeContent={unreadCount} color="error">
                <MarkEmailRead />
              </Badge>
            </Fab>
          )}
        </Box>
      </Box>

    </Box>
  );
};

export default WorkerNotification;