import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Badge,
  Collapse,
  Pagination,
  Card,
  CardContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Search, Clear, Notifications as NotificationsIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationManagement, useNotifications } from '../../../hooks/useNotifications';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar';
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout';
import { useNavigate } from 'react-router-dom';

// Small helpers to keep UI consistent with worker view
const getNotificationIcon = (type) => {
  switch (type) {
    case 'application-status':
      return <NotificationsIcon />;
    case 'message':
      return <NotificationsIcon />;
    default:
      return <NotificationsIcon />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'application-status':
      return 'success';
    case 'payment':
      return 'warning';
    default:
      return 'default';
  }
};

const ClientNotification = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [topOffset, setTopOffset] = useState(64);

  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 20;

  const {
    unreadCount,
    recentNotifications,
    isLoadingUnreadCount,
    isLoadingRecent,
    markAsRead,
    markAllAsRead,
    refetchUnreadCount,
    refetchRecent
  } = useNotificationManagement();

  const { data: notificationsData, isLoading: isLoadingNotifications, error, refetch: refetchNotifications } = useNotifications({
    page,
    limit: perPage,
    unreadOnly: false,
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const notifications = notificationsData?.data?.notifications || [];
  const total = notificationsData?.data?.pagination?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  useEffect(() => {
    // initial fetches
    refetchUnreadCount();
    refetchRecent();
    refetchNotifications();
    // measure navbar height for sidebar offset
    const measureNavbar = () => {
      const headerEl = document.querySelector('.wrk-dashboard-header');
      if (headerEl) setTopOffset(headerEl.getBoundingClientRect().height || 64);
    };
    measureNavbar();
    window.addEventListener('resize', measureNavbar);
    return () => window.removeEventListener('resize', measureNavbar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.message || '').toLowerCase().includes(q)
    );
  }, [notifications, searchQuery]);

  const handleClick = (notification) => {
    setExpanded(prev => (prev === notification._id ? null : notification._id));
    if (!notification.read) {
      markAsRead(notification._id);
      // optimistic UI is handled by hooks; refetch for consistency
      setTimeout(() => {
        refetchUnreadCount();
        refetchNotifications();
      }, 300);
    }
  };

  const handlePageChange = (e, p) => {
    setPage(p);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <WorkerNavbar />

      <Box sx={{ display: 'flex', width: '100%' }}>
        <ClientSidebar topOffset={topOffset} navigate={navigate} />

        <Box
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
            pt: { xs: 10, md: 8.7 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 4, sm: 5, md: 6 },
            minWidth: 0
          }}
        >
          <Box sx={{ maxWidth: { lg: '1200px' }, mx: 'auto' }}>
            {/* Header */}
            <Card elevation={0} sx={{ borderRadius: 3, mb: 2 }}>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Badge badgeContent={unreadCount} color="error">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      <NotificationsIcon />
                    </Avatar>
                  </Badge>
                  <Box>
                    <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={800}>
                      Notifications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {filtered.length} items • {unreadCount} unread
                    </Typography>
                  </Box>
                </Stack>
                <Box>
                  {/* Future action buttons (mark all, settings) can go here */}
                </Box>
              </CardContent>
            </Card>

            {/* Search */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
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
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <Clear fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* List */}
            <Box sx={{ bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
              {isLoadingNotifications ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">Failed to load notifications.</Alert>
              ) : filtered.length === 0 ? (
                <Box sx={{ textAlign: 'center', p: 6 }}>
                  <Typography variant="h6">You're all caught up</Typography>
                  <Typography variant="body2" color="text.secondary">No notifications to show.</Typography>
                </Box>
              ) : (
                <Box>
                  {filtered.map((n) => (
                    <Box
                      key={n._id}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        p: 1.25,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        bgcolor: n.read ? 'inherit' : 'rgba(25,118,210,0.04)',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleClick(n)}
                    >
                      <Avatar sx={{ bgcolor: n.read ? 'grey.200' : 'primary.main' }}>
                        {getNotificationIcon(n.type)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography fontWeight={n.read ? 500 : 700} noWrap>{n.title}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </Typography>
                        </Box>
                        <Collapse in={expanded === n._id} collapsedSize={20}>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {n.message}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                            <Chip label={n.type} size="small" color={getNotificationColor(n.type)} />
                            {n.priority === 'high' && <Chip label="High" size="small" color="error" />}
                          </Stack>
                        </Collapse>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination count={totalPages} page={page} onChange={handlePageChange} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ClientNotification;