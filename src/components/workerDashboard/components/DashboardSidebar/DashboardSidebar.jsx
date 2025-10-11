import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Toolbar,
  Typography,
  LinearProgress,
  Badge,
  Avatar,
  Chip
} from '@mui/material';

import { useAuth } from '../../../../hooks/useAuth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VerifiedIcon from '@mui/icons-material/Verified';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreTimeRoundedIcon from '@mui/icons-material/MoreTimeRounded';
import NotificationBadge from '../../../common/NotificationBadge';
import { useUnreadCount } from '../../../../hooks/useNotifications';

const drawerWidth = 260;

// Create navItems function to include dynamic notification count
const createNavItems = (unreadCount) => [
  { key: 'overview', label: 'Overview', icon: <DashboardIcon />, route: '/overview' },
  { key: 'profile', label: 'My Profile', icon: <PersonIcon />, route: '/my-profile' },
  { key: 'jobs', label: 'Available Jobs', icon: <WorkIcon />, route: '/available-jobs' },
  { key: 'schedule', label: 'My Schedule', icon: <ScheduleIcon />, route: '/my-schedule' },
  { key: 'certifications', label: 'Certifications', icon: <VerifiedIcon />, route: '/my-certifications' },
  { key: 'workHistory', label: 'Work History', icon: <HistoryIcon />, route: '/work-history' },
  { key: 'timesheet', label: 'Time Sheet', icon: <MoreTimeRoundedIcon />, route: '/worker/timesheets' },
  { 
    key: 'notifications', 
    label: 'Notifications', 
    icon: (
      <Badge 
        badgeContent={unreadCount} 
        color="error" 
        max={99}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.7rem',
            height: '16px',
            minWidth: '16px',
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
    ), 
    route: '/notifications' 
  },
];

const DashboardSidebar = ({
  activeTab,
  setActiveTab,
 
  needsOnboarding,
  profileStatus,
  modalOpen
}) => {
  const auth = useAuth();
  
  // Handle case where auth context might not be available
  if (!auth) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Loading...
          </Typography>
        </Toolbar>
        <Divider />
        <Box sx={{ p: 2 }}>
          <LinearProgress />
        </Box>
      </Drawer>
    );
  }
  
  const { signOut, user } = auth;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch unread notification count using the new hook
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.data?.unreadCount || 0;

  // Determine current active tab based on location
  const getCurrentActiveTab = () => {
    const currentPath = location.pathname;
    const currentItem = createNavItems(unreadCount).find(item => item.route === currentPath);
    return currentItem ? currentItem.key : 'overview';
  };

  // Update active tab when location changes
  useEffect(() => {
    const currentActiveTab = getCurrentActiveTab();
    if (setActiveTab) {
      setActiveTab(currentActiveTab);
    }
  }, [location.pathname, setActiveTab]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (item) => {
    if (item.route) {
      // Navigate to external route
      navigate(item.route);
    } else {
      // Set active tab for dashboard content
      if (setActiveTab) {
        setActiveTab(item.key);
      }
    }
    if (isMobile) setMobileOpen(false);
  };

  const currentActiveTab = getCurrentActiveTab();

  const handleSignOut = async () => {
    await signOut(false, isGoogleUser);
    navigate('/login', { replace: true });
  };


  const drawerContent = (
    
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      pt: { xs: 0.5, md: 0 }
    }}>
      {/* Header / User summary */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 1.5, sm: 2 },
          mx: { xs: 1.25, sm: 1.5 },
          mt: { xs: 1.5, sm: 2 },
          mb: { xs: 1.25, sm: 1.5 },
          borderRadius: 3,
          background: (theme) => theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.primary.dark}33 0%, ${theme.palette.primary.main}22 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.light}25 0%, ${theme.palette.primary.main}15 100%)`,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(59, 130, 246, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: (theme) => theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0,0,0,0.4)'
              : '0 4px 12px rgba(59, 130, 246, 0.12)',
            transform: 'translateY(-1px)',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 } }}>
          <Avatar
            sx={{ 
              width: { xs: 36, sm: 40 }, 
              height: { xs: 36, sm: 40 }, 
              bgcolor: (theme) => theme.palette.primary.main,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              border: (theme) => `2px solid ${theme.palette.background.paper}`,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              fontWeight: 700,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              }
            }}
          >
            {(user?.firstName?.[0] || user?.name?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              noWrap 
              fontWeight={600} 
              sx={{ 
                mb: 0.25,
                fontSize: { xs: '0.85rem', sm: '0.875rem' }
              }}
            >
              {user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : (user?.name || 'Welcome')}
            </Typography>
            <Chip 
              label="Worker" 
              size="small"
              sx={{ 
                height: { xs: 18, sm: 20 },
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                fontWeight: 600,
                bgcolor: (theme) => theme.palette.primary.main,
                color: 'white',
                '& .MuiChip-label': { px: { xs: 0.75, sm: 1 } }
              }}
            />
          </Box>
        </Box>
      </Box>
      
      <List sx={{ flex: 1, px: 1, overflow: 'auto', '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '10px' } }}>
        {createNavItems(unreadCount).map((item, index) => (
          <ListItem 
            key={item.key} 
            disablePadding
            sx={{
              animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateX(-10px)' },
                to: { opacity: 1, transform: 'translateX(0)' }
              }
            }}
          >
            <ListItemButton
              selected={currentActiveTab === item.key}
              onClick={() => handleNavigation(item)}
              sx={{
                my: 0.5,
                mx: 1,
                px: 2,
                py: 1.25,
                borderRadius: 2.5,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: currentActiveTab === item.key 
                  ? (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'rgba(59, 130, 246, 0.08)'
                  : 'transparent',
                boxShadow: currentActiveTab === item.key 
                  ? '0 2px 8px rgba(59, 130, 246, 0.15)' 
                  : 'none',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 4,
                  height: currentActiveTab === item.key ? '60%' : 0,
                  bgcolor: 'primary.main',
                  borderRadius: '0 4px 4px 0',
                  transition: 'height 0.25s ease',
                },
                '&:hover': {
                  bgcolor: (theme) => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
                  transform: 'translateX(4px)',
                  '&::before': {
                    height: '40%',
                  }
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: 40,
                  color: currentActiveTab === item.key ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.25s ease',
                  '& svg': {
                    fontSize: '1.4rem',
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontWeight: currentActiveTab === item.key ? 600 : 500,
                  fontSize: '0.9rem',
                  color: currentActiveTab === item.key ? 'text.primary' : 'text.secondary',
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Notification Badge removed - functionality moved to WorkerNotification page */}
        
        <Divider sx={{ my: 2, mx: 2, opacity: 0.6 }} />
        
        <ListItem disablePadding sx={{ mt: 'auto', mb: 1.5 }}>
          <ListItemButton
            onClick={handleSignOut}
            sx={{
              mx: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: 2.5,
              border: (theme) => `1.5px solid ${theme.palette.error.main}33`,
              bgcolor: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(239, 68, 68, 0.08)'
                : 'rgba(239, 68, 68, 0.05)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                bgcolor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(239, 68, 68, 0.1)',
                borderColor: (theme) => `${theme.palette.error.main}66`,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon sx={{ fontSize: '1.4rem' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Sign Out" 
              primaryTypographyProps={{ 
                color: 'error.main', 
                fontWeight: 600,
                fontSize: '0.9rem'
              }} 
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && !modalOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: { xs: '12px', sm: '26px' },
            left: { xs: '16px', sm: '20px' },
            zIndex: 1301,
            display: { xs: 'block', md: 'none' },
          }}
        >
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              bgcolor: 'transparent',
              border: (theme) => `0px solid ${theme.palette.divider}`,
              borderRadius: 2.5,
              p: { xs: 0.75, sm: 1 },
              width: { xs: 42, sm: 46 },
              height: { xs: 42, sm: 46 },
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.04)',
                borderColor: (theme) => theme.palette.primary.main,
                transform: 'translateX(2px)',
              },
              '&:active': {
                transform: 'scale(0.95)',
                bgcolor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
              }
            }}
          >
            <MenuIcon 
              sx={{ 
                fontSize: { xs: '1.3rem', sm: '1.5rem' },
                color: 'text.primary',
              }} 
            />
          </IconButton>
        </Box>
      )}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="dashboard navigation"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ 
            keepMounted: true,
            BackdropProps: {
              sx: {
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(0,0,0,0.4)',
                transition: 'all 0.3s ease',
              }
            }
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: { xs: '85%', sm: drawerWidth },
              maxWidth: drawerWidth,
              mt: '84px',
              height: 'calc(100vh - 84px)',
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              background: (theme) => theme.palette.mode === 'dark'
                ? `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
                : `linear-gradient(180deg, #ffffff 0%, ${theme.palette.grey[50]} 100%)`,
              boxShadow: '4px 0 32px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              mt: '70px',
              height: 'calc(100vh - 70px)',
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              background: (theme) => theme.palette.mode === 'dark'
                ? `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
                : `linear-gradient(180deg, #ffffff 0%, ${theme.palette.grey[50]} 100%)`,
              boxShadow: (theme) => theme.palette.mode === 'dark'
                ? '2px 0 12px rgba(0, 0, 0, 0.3)'
                : '2px 0 12px rgba(0, 0, 0, 0.05)',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
};

export default DashboardSidebar;
