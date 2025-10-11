import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Description,
  Work,
  Payment,
  Info,
  Close,
  Delete,
  MarkEmailRead,
  MarkEmailUnread,
  FilterList,
  Search,
  Refresh,
  MoreVert,
  CheckCircleOutline,
  RadioButtonUnchecked,
  DeleteOutline,
  Settings,
  Archive,
  ArrowDownward,
  ArrowUpward
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
  // State management
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'unread', 'read'

  // Notification management hook
  const {
    unreadCount,
    recentNotifications,
    isLoadingUnreadCount,
    isLoadingRecent,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
    deleteAllNotifications,
    markAsReadOnView,
    markMultipleAsReadOnView,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isMarkingAsUnread,
    isDeleting,
    isDeletingAll,
    refetchUnreadCount,
    refetchRecent
  } = useNotificationManagement();

  // Auto mark as read functionality
  const {
    markAllVisibleAsRead,
    markAsReadOnHover,
    clearViewedCache
  } = useAutoMarkAsRead(markAsRead, markAllAsRead);

  // Connection status monitoring
  const { isOnline, hasConnectionError, connectionError } = useConnectionStatus();

  // Fetch all notifications with filters
  const { data: notificationsData, isLoading: isLoadingNotifications, error } = useNotifications({
    page: currentPage,
    limit: itemsPerPage,
    unreadOnly: viewMode === 'unread', // Filter by read status
    type: filterType === 'all' ? null : filterType,
    sortBy,
    sortOrder
  });

  const notifications = notificationsData?.data?.notifications || [];
  const totalPages = Math.ceil((notificationsData?.data?.pagination?.total || 0) / itemsPerPage);

  // Filter notifications based on search query and view mode
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    // Apply view mode filter
    if (viewMode === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (viewMode === 'read') {
      filtered = filtered.filter(n => n.read);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [notifications, searchQuery, viewMode]);

  // Auto mark as read when page is first loaded
  useEffect(() => {
    // Mark all notifications as read when user first visits the page
    const timer = setTimeout(() => {
      if (notifications.length > 0) {
        markAllVisibleAsRead(notifications);
      }
    }, 2000); // 2 seconds delay to ensure user has seen the page

    return () => clearTimeout(timer);
  }, [notifications, markAllVisibleAsRead]);

  // Clear viewed cache when page changes
  useEffect(() => {
    clearViewedCache();
  }, [currentPage, filterType, searchQuery, clearViewedCache]);


  // Handle notification selection
  const handleNotificationSelect = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  // Handle mark as read
  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  // Handle mark as unread
  const handleMarkAsUnread = (notificationId) => {
    markAsUnread(notificationId);
  };

  // Handle mark selected as read
  const handleMarkSelectedAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id));
    setSelectedNotifications([]);
  };

  // Handle mark selected as unread
  const handleMarkSelectedAsUnread = () => {
    selectedNotifications.forEach(id => markAsUnread(id));
    setSelectedNotifications([]);
  };

  // Handle delete notification
  const handleDeleteNotification = (notificationId) => {
    setNotificationToDelete(notificationId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete);
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    }
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchUnreadCount();
    refetchRecent();
  };

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Check if all notifications are selected
  const isAllSelected = filteredNotifications.length > 0 && 
    selectedNotifications.length === filteredNotifications.length;

  // Check if some notifications are selected
  const isIndeterminate = selectedNotifications.length > 0 && 
    selectedNotifications.length < filteredNotifications.length;

  return (
    <Box>
      <WorkerNavbar />
      <ConnectionStatus />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <DashboardSidebar />

        {/* Main Content */}
        <Box component="main" sx={{
          flexGrow: 1,
          mt: { xs: 1, sm: 1 },
          p: { xs: 2, sm: 3 },
          minHeight: '100vh',
          bgcolor: 'grey.50'
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 3,
            mt: 10,
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Notifications
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                </Typography>
                {unreadCount > 0 && (
                  <Chip 
                    label={`${unreadCount} unread`} 
                    size="small" 
                    color="error" 
                  />
                )}
              </Box>
            </Box>
            
            {/* Action Buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={handleRefresh}
                disabled={isLoadingNotifications}
              >
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="contained"
                  startIcon={<MarkEmailRead />}
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                >
                  Mark All Read
                </Button>
              )}
            </Stack>
          </Box>

          {/* View Mode Tabs */}
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={viewMode} 
              onChange={(e, newValue) => setViewMode(newValue)}
              sx={{ 
                '& .MuiTab-root': { 
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: 40
                }
              }}
            >
              <Tab 
                label={`All (${notifications.length})`} 
                value="all"
                icon={<NotificationsIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Unread (${unreadCount})`} 
                value="unread"
                icon={<MarkEmailUnread />}
                iconPosition="start"
              />
              <Tab 
                label={`Read (${notifications.length - unreadCount})`} 
                value="read"
                icon={<MarkEmailRead />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Search and Filter Controls */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  size="small"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 250 }}
                />
                
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="application-status">Application Status</MenuItem>
                    <MenuItem value="job-update">Job Update</MenuItem>
                    <MenuItem value="document-verification">Document Verification</MenuItem>
                    <MenuItem value="payment">Payment</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="createdAt">Date</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="type">Type</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  startIcon={sortOrder === 'desc' ? <ArrowDownward /> : <ArrowUpward />}
                  sx={{ minWidth: 140 }}
                >
                  {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Card sx={{ minWidth: 120 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  {unreadCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unread
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 120 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.primary">
                  {notifications.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Box>



          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2">
                    {selectedNotifications.length} notification(s) selected
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<MarkEmailRead />}
                    onClick={handleMarkSelectedAsRead}
                    disabled={isMarkingAsRead}
                  >
                    Mark Read
                  </Button>
                  <Button
                    size="small"
                    startIcon={<MarkEmailUnread />}
                    onClick={handleMarkSelectedAsUnread}
                    disabled={isMarkingAsUnread}
                  >
                    Mark Unread
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Delete />}
                    onClick={handleDeleteSelected}
                    disabled={isDeleting}
                    color="error"
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Notifications List */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              {isLoadingNotifications ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ m: 2 }}>
                  Failed to load notifications. Please try again.
                </Alert>
              ) : filteredNotifications.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 4 }}>
                  <NotificationsIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No notifications found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'Try adjusting your search criteria' : 'You\'re all caught up!'}
                  </Typography>
                </Box>
              ) : (
                <List>
                  {/* Select All Header */}
                  <ListItem sx={{ bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={handleSelectAll}
                    />
                    <Box sx={{ flex: 1, ml: 2 }}>
                      <Typography variant="subtitle2" fontWeight="medium">
                        Select All
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedNotifications.length} of {filteredNotifications.length} selected
                      </Typography>
                    </Box>
                  </ListItem>

                  {/* Notifications */}
                  {filteredNotifications.map((notification) => (
                    <ListItem
                      key={notification._id}
                      sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: notification.read ? 'inherit' : 'primary.50',
                        borderLeft: notification.read ? 'none' : '4px solid',
                        borderLeftColor: 'primary.main',
                        '&:hover': { 
                          bgcolor: notification.read ? 'action.hover' : 'primary.100'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                      onMouseEnter={() => {
                        // Auto mark as read when user hovers over notification
                        markAsReadOnHover(notification._id, notification.read);
                      }}
                    >
                      <Checkbox
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleNotificationSelect(notification._id)}
                      />
                      
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.light` }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Primary content */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={notification.read ? 'normal' : 'bold'}
                              color={notification.read ? 'text.primary' : 'primary.main'}
                              sx={{ 
                                mb: 0.5,
                                lineHeight: 1.3
                              }}
                            >
                              {notification.title}
                            </Typography>
                            
                            {/* Secondary content */}
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                mb: 1,
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {notification.message}
                            </Typography>
                          </Box>
                          
                          {!notification.read && (
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                flexShrink: 0,
                                mt: 0.5,
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                  '0%': { opacity: 1 },
                                  '50%': { opacity: 0.5 },
                                  '100%': { opacity: 1 }
                                }
                              }}
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                          <Chip
                            label={notification.type.replace('-', ' ')}
                            size="small"
                            color={getNotificationColor(notification.type)}
                            variant={notification.read ? "outlined" : "filled"}
                            sx={{ 
                              fontSize: '0.75rem',
                              height: 24,
                              fontWeight: notification.read ? 'normal' : 'medium'
                            }}
                          />
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            component="span"
                            sx={{ 
                              fontWeight: notification.read ? 'normal' : 'medium'
                            }}
                          >
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </Typography>
                          {notification.priority === 'high' && (
                            <Chip
                              label="High Priority"
                              size="small"
                              color="error"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {notification.read ? (
                          <Tooltip title="Mark as unread">
                            <IconButton
                              size="small"
                              onClick={() => handleMarkAsUnread(notification._id)}
                              disabled={isMarkingAsUnread}
                            >
                              <MarkEmailUnread />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Mark as read">
                            <IconButton
                              size="small"
                              onClick={() => handleMarkAsRead(notification._id)}
                              disabled={isMarkingAsRead}
                            >
                              <MarkEmailRead />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteNotification(notification._id)}
                            disabled={isDeleting}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        disableEscapeKeyDown={false}
        disableScrollLock={false}
        keepMounted={false}
      >
        <DialogTitle id="delete-dialog-title">
          Delete Notification
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this notification? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkerNotification;