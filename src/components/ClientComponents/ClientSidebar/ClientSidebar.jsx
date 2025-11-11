import React, { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Avatar,
  Typography,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getClientProfile } from '../../../api/clientProfile';
import { CLIENT_SIDEBAR_WIDTH, DEFAULT_TOP_OFFSET as DEFAULT_TOP_OFFSET_CONST } from '../../../constants/layout';
import {
  Dashboard,
  Group,
  Description,
  Settings,
  ExpandLess,
  ExpandMore,
  Menu,
  Close,
  Message,
  AssignmentTurnedIn,
  AccountCircle,
  Security,
  Backup,
  Notifications,
  Person,
  Favorite,
  Payment,
  Business,
  Analytics,
  History,
  Language,
  Phone,
  Receipt,
  People,
  Assessment,
  Flag,
  Schedule,
  LocalOffer,
  FolderSpecial,
  VerifiedUser,
  Edit,
  ViewList,
  TrendingUp
} from '@mui/icons-material';

const DEFAULT_TOP_OFFSET = DEFAULT_TOP_OFFSET_CONST; // px

const ClientSidebar = ({ topOffset = DEFAULT_TOP_OFFSET, navigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const auth = useAuth();
  const { user } = auth || {};

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [selectedItem, setSelectedItem] = useState('dashboard');

  // Fetch profile to get account type
  const { data: profileData } = useQuery({
    queryKey: ['clientProfile'],
    queryFn: async () => {
      try {
        const res = await getClientProfile();
        return res.data?.profile || null;
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (menuId) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleItemClick = (itemId, path) => {
    setSelectedItem(itemId);
    if (path && navigate) {
      navigate(path);
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Get account type from profile (if available)
  const accountType = profileData?.accountType || 'individual';
  const isOrganization = accountType === 'organization';

  // Build Profile submenu dynamically based on account type
  const profileChildren = [
    { id: 'basic-info', label: 'Basic Information', icon: <AccountCircle />, path: '/client/profile' },
    // Preferences only for Individual clients
    ...(!isOrganization ? [
      { id: 'preferences', label: 'Care Preferences', icon: <Favorite />, path: '/client/profile/preferences' },
    ] : []),
    // Care Plan removed from minimal onboarding (no longer applicable)
    // Communication settings available for all
    { id: 'communication', label: 'Communication', icon: <Phone />, path: '/client/profile/communication' }
  ];

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      path: '/client-dashboard'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <Person />,
      children: profileChildren
    },
    {
      id: 'workforce',
      label: 'Workforce',
      icon: <Group />,
      children: [
        { id: 'requests', label: 'Job Requests', icon: <AssignmentTurnedIn />, path: '/client/workforce/requests' },
        { id: 'messages', label: 'Messages', icon: <Message />, path: '/client/workforce/messages' },
        { id: 'sessions', label: 'Sessions', icon: <Schedule />, path: '/client/workforce/sessions' }
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <Description />,
      children: [
        { id: 'all-documents', label: 'All Documents', icon: <ViewList />, path: '/client/documents' },
        { id: 'pending-verification', label: 'Pending Verification', icon: <Flag />, path: '/client/documents/pending' },
        { id: 'expiring-soon', label: 'Expiring Soon', icon: <Schedule />, path: '/client/documents/expiring' }
      ]
    },
    {
      id: 'billing',
      label: 'Billing & Payments',
      icon: <Payment />,
      children: [
        { id: 'preferences', label: 'Billing Preferences', icon: <Receipt />, path: '/client/billing/preferences' },
        { id: 'invoices', label: 'Invoices', icon: <Description />, path: '/client/billing/invoices' },
        // { id: 'payment-methods', label: 'Payment Methods', icon: <Payment />, path: '/client/billing/payment-methods' }
      ]
    },
    ...(isOrganization ? [{
      id: 'team',
      label: 'Team Management',
      icon: <People />,
      children: [
        { id: 'members', label: 'Team Members', icon: <Group />, path: '/client/team/members' },
        { id: 'invitations', label: 'Invitations', icon: <AssignmentTurnedIn />, path: '/client/team/invitations' },
        { id: 'permissions', label: 'Roles & Permissions', icon: <Security />, path: '/client/team/permissions' }
      ]
    }] : []),
    {
      id: 'analytics',
      label: 'Analytics & Insights',
      icon: <Analytics />,
      children: [
        { id: 'engagement', label: 'Engagement Metrics', icon: <TrendingUp />, path: '/client/analytics/engagement' },
        { id: 'activity', label: 'Activity History', icon: <History />, path: '/client/analytics/activity' },
        { id: 'audit-log', label: 'Audit Log', icon: <History />, path: '/client/analytics/audit-log' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings />,
      children: [
        { id: 'general', label: 'General Settings', icon: <Settings />, path: '/client/settings/general' },
        { id: 'security', label: 'Security & Privacy', icon: <Security />, path: '/client/settings/security' },
        { id: 'notifications', label: 'Notifications', icon: <Notifications />, path: '/client/settings/notifications' },
        { id: 'consents', label: 'Consents & Privacy', icon: <VerifiedUser />, path: '/client/settings/consents' },
        { id: 'locale', label: 'Language & Region', icon: <Language />, path: '/client/settings/locale' }
      ]
    }
  ];

  // Update selected item based on current route
  useEffect(() => {
    const currentPath = location.pathname;

    const findMenuItemByPath = (items, path) => {
      for (const item of items) {
        if (item.path === path) {
          return item.id;
        }
        if (item.children) {
          const childMatch = findMenuItemByPath(item.children, path);
          if (childMatch) return childMatch;
        }
      }
      return null;
    };

    const matchingItemId = findMenuItemByPath(menuItems, currentPath);
    if (matchingItemId) {
      setSelectedItem(matchingItemId);

      const findParentMenu = (items, childId) => {
        for (const item of items) {
          if (item.children && item.children.some(child => child.id === childId)) {
            return item.id;
          }
          if (item.children) {
            const deepParent = findParentMenu(item.children, childId);
            if (deepParent) return deepParent;
          }
        }
        return null;
      };

      const parentMenuId = findParentMenu(menuItems, matchingItemId);
      if (parentMenuId) {
        setOpenMenus(prev => ({ ...prev, [parentMenuId]: true }));
      }
    } else {
      if (currentPath.includes('client-dashboard')) {
        setSelectedItem('dashboard');
      }
    }
  }, [location.pathname]);

  const DrawerContent = () => (
    <Box sx={{
      height: `calc(100vh - ${topOffset}px)`,
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      color: '#2d3748',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      boxShadow: { xs: 3, md: 6 },
      mt: 0,
      pt: 0,
      overflow: 'auto',
      pr: { xs: 1, md: 3 },
      pl: { xs: 1, md: 2 },
      borderRight: '1px solid #e2e8f0',
    }}>
      <Box sx={{
        p: { xs: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha('#fff', 0.1)}`
      }}>
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        )}
      </Box>

      <Box sx={{
        p: { xs: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        backgroundColor: alpha('#fff', 0.05)
      }}>
        <Avatar sx={{
          width: 44,
          height: 44,
          border: '2px solid #e2e8f0',
          bgcolor: '#edf2f7',
          color: '#2d3748',
        }}>
          <AccountCircle />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
           {user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : (user?.name || 'Welcome')}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {isOrganization ? 'Organization' : 'Individual'}
          </Typography>
        </Box>
        <Chip
          label={isOrganization ? 'Org Client' : 'Client'}
          size="small"
          sx={{
            backgroundColor: '#e2e8f0',
            color: '#2d3748',
            fontWeight: 600
          }}
        />
      </Box>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => (
            <Box key={item.id}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => item.children ? handleMenuClick(item.id) : handleItemClick(item.id, item.path)}
                  selected={selectedItem === item.id}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    px: 2,
                    py: 1,
                    color: '#2d3748',
                    '& .MuiListItemIcon-root': { color: '#667eea' },
                    '&.Mui-selected': {
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      borderLeft: '4px solid #1976d2',
                      '& .MuiListItemIcon-root': { color: '#1976d2' },
                      '&:hover': { backgroundColor: '#bbdefb' }
                    },
                    '&:hover': { backgroundColor: '#f3f6fa' }
                  }}
                >
                  <ListItemIcon sx={{
                    color: '#667eea',
                    minWidth: 40,
                    '& .MuiSvgIcon-root': { fontSize: '1.3rem' }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: '#2d3748'
                      }
                    }}
                  />
                  {item.children && (
                    openMenus[item.id] ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>

              {item.children && (
                <Collapse in={openMenus[item.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.id} disablePadding sx={{ mb: 0.2 }}>
                        <ListItemButton
                          onClick={() => handleItemClick(child.id, child.path)}
                          selected={selectedItem === child.id}
                          sx={{
                            borderRadius: 2,
                            mx: 2,
                            px: 2,
                            py: 0.8,
                            pl: 3,
                            color: '#2d3748',
                            '& .MuiListItemIcon-root': { color: '#667eea' },
                            '&.Mui-selected': {
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              borderLeft: '4px solid #1976d2',
                              '& .MuiListItemIcon-root': { color: '#1976d2' },
                              '&:hover': { backgroundColor: '#bbdefb' }
                            },
                            '&:hover': { backgroundColor: '#f3f6fa' }
                          }}
                        >
                          <ListItemIcon sx={{
                            color: '#667eea',
                            minWidth: 32,
                            '& .MuiSvgIcon-root': { fontSize: '1.1rem' }
                          }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.label}
                            sx={{
                              '& .MuiTypography-root': {
                                fontSize: '0.85rem',
                                fontWeight: 400,
                                color: '#2d3748'
                              }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: 'white',
            boxShadow: 2,
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          <Menu />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: CLIENT_SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: CLIENT_SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: isMobile ? 3 : '4px 0 20px rgba(0,0,0,0.1)',
            top: { xs: `${topOffset + 8}px`, md: `${topOffset + 8}px` },
            height: `calc(100vh - ${topOffset}px)`,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            background: '#fff',
            color: 'white',
            overflow: 'auto',
          },
        }}
      >
        <DrawerContent />
      </Drawer>
    </>
  );
};

export default ClientSidebar;