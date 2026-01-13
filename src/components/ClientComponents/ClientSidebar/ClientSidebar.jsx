import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  // Match navbar breakpoint: mobile at 768px (navbar uses max-width: 768px for 84px height)
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  const auth = useAuth();
  const { user } = auth || {};

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [selectedItem, setSelectedItem] = useState('dashboard');
  const isInitialized = useRef(false);

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
  const profileChildren = useMemo(() => [
    { id: 'basic-info', label: 'Basic Information', icon: <AccountCircle />, path: '/client/profile' },
    // Preferences only for Individual clients
    ...(!isOrganization ? [
      { id: 'preferences', label: 'Care Preferences', icon: <Favorite />, path: '/client/profile/preferences' },
    ] : []),
    // Care Plan removed from minimal onboarding (no longer applicable)
    // Communication settings available for all
    { id: 'communication', label: 'Communication', icon: <Phone />, path: '/client/profile/communication' }
  ], [isOrganization]);

  const menuItems = useMemo(() => [
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
  ], [isOrganization, profileChildren]);

  // Helper function to find menu item by path (works with both exact and partial matches)
  const findMenuItemByPath = (items, path) => {
    let bestMatch = null;
    let longestMatch = 0;
    
    // First, try to find exact matches (highest priority)
    for (const item of items) {
      if (item.path === path) {
        return { itemId: item.id, parentId: null };
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            return { itemId: child.id, parentId: item.id };
          }
        }
      }
    }
    
    // Then, find the longest matching path (prioritize child items over parent)
    for (const item of items) {
      if (item.children) {
        for (const child of item.children) {
          if (child.path && path.startsWith(child.path)) {
            const matchLength = child.path.length;
            if (matchLength > longestMatch) {
              longestMatch = matchLength;
              bestMatch = { itemId: child.id, parentId: item.id };
            }
          }
        }
      }
      // Check parent items only if no child match found
      if (!bestMatch && item.path && path.startsWith(item.path)) {
        const matchLength = item.path.length;
        if (matchLength > longestMatch) {
          longestMatch = matchLength;
          bestMatch = { itemId: item.id, parentId: null };
        }
      }
    }
    
    if (bestMatch) {
      return bestMatch;
    }
    
    // Default to dashboard if path includes 'client-dashboard'
    if (path.includes('client-dashboard') || path === '/client-dashboard') {
      return { itemId: 'dashboard', parentId: null };
    }
    
    return null;
  };

  // Initialize and update selected item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const match = findMenuItemByPath(menuItems, currentPath);
    
    if (match) {
      // Only update if different to prevent unnecessary re-renders
      setSelectedItem(prev => prev !== match.itemId ? match.itemId : prev);
      
      // Update open menus
      if (match.parentId) {
        setOpenMenus(prev => {
          // Only update if different to avoid unnecessary re-renders
          if (prev[match.parentId]) return prev;
          return { ...prev, [match.parentId]: true };
        });
      } else {
        // Close other menus if a top-level item is selected
        setOpenMenus(prev => {
          const hasOpenMenus = Object.keys(prev).length > 0;
          return hasOpenMenus ? {} : prev;
        });
      }
    } else {
      // Fallback to dashboard
      if (currentPath.includes('client-dashboard') || currentPath === '/client-dashboard') {
        setSelectedItem(prev => prev !== 'dashboard' ? 'dashboard' : prev);
        setOpenMenus(prev => {
          const hasOpenMenus = Object.keys(prev).length > 0;
          return hasOpenMenus ? {} : prev;
        });
      }
    }
  }, [location.pathname, menuItems]);

  const DrawerContent = () => (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#fff',
      color: '#2d3748',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      boxShadow: 'none',
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
        backgroundColor: alpha('#fff', 0.05),
        transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <Avatar sx={{
          width: 44,
          height: 44,
          border: '2px solid #e2e8f0',
          bgcolor: '#edf2f7',
          color: '#2d3748',
          transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }
        }}>
          <AccountCircle />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
           {user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : (user?.name || 'Welcome')}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.8,
              transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {isOrganization ? 'Organization' : 'Individual'}
          </Typography>
        </Box>
        <Chip
          label={isOrganization ? 'Org Client' : 'Client'}
          size="small"
          sx={{
            backgroundColor: '#e2e8f0',
            color: '#2d3748',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: '#cbd5e0',
              transform: 'scale(1.05)',
            }
          }}
        />
      </Box>

      <Divider sx={{ borderColor: '#e2e8f0' }} />

      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <List sx={{ px: 1, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
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
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiListItemIcon-root': { 
                      color: '#667eea',
                      transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    '& .MuiTypography-root': {
                      transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 0,
                      backgroundColor: '#1976d2',
                      borderRadius: '0 4px 4px 0',
                      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2',
                      '&::before': {
                        width: '4px',
                      },
                      '& .MuiListItemIcon-root': { 
                        color: '#1976d2',
                      },
                      '&:hover': { 
                        backgroundColor: '#bbdefb',
                      }
                    },
                    '&:hover': { 
                      backgroundColor: '#f3f6fa',
                      transform: 'translateX(2px)',
                    },
                    '&:active': {
                      transform: 'translateX(1px) scale(0.98)',
                    }
                  }}
                >
                  <ListItemIcon sx={{
                    color: 'inherit',
                    minWidth: 40,
                    transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '& .MuiSvgIcon-root': { 
                      fontSize: '1.3rem',
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: 'inherit',
                        transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }
                    }}
                  />
                  {item.children && (
                    <Box
                      sx={{
                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: openMenus[item.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {openMenus[item.id] ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>

              {item.children && (
                <Collapse 
                  in={openMenus[item.id]} 
                  timeout={300}
                  unmountOnExit
                  sx={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem 
                        key={child.id} 
                        disablePadding 
                        sx={{ 
                          mb: 0.2,
                        }}
                      >
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
                            position: 'relative',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& .MuiListItemIcon-root': { 
                              color: '#667eea',
                              transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            },
                            '& .MuiTypography-root': {
                              transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 0,
                              backgroundColor: '#1976d2',
                              borderRadius: '0 4px 4px 0',
                              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              '&::before': {
                                width: '4px',
                              },
                              '& .MuiListItemIcon-root': { 
                                color: '#1976d2',
                              },
                              '&:hover': { 
                                backgroundColor: '#bbdefb',
                              }
                            },
                            '&:hover': { 
                              backgroundColor: '#f3f6fa',
                              transform: 'translateX(2px)',
                            },
                            '&:active': {
                              transform: 'translateX(1px) scale(0.98)',
                            }
                          }}
                        >
                          <ListItemIcon sx={{
                            color: 'inherit',
                            minWidth: 32,
                            transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '& .MuiSvgIcon-root': { 
                              fontSize: '1.1rem',
                              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }
                          }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.label}
                            sx={{
                              '& .MuiTypography-root': {
                                fontSize: '0.85rem',
                                fontWeight: 400,
                                color: 'inherit',
                                transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
        <Box
          sx={{
            position: 'fixed',
            top: { xs: '20px', sm: '26px' },
            left: { xs: '16px', sm: '20px' },
            zIndex: 1301,
            display: { xs: 'block', md: 'none' },
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              bgcolor: 'transparent',
              border: '0px solid #e2e8f0',
              borderRadius: 2.5,
              p: { xs: 0.75, sm: 1 },
              width: { xs: 42, sm: 46 },
              height: { xs: 42, sm: 46 },
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                transform: 'translateX(2px)',
              },
              '&:active': {
                transform: 'scale(0.95)',
                bgcolor: 'rgba(0, 0, 0, 0.06)',
              }
            }}
          >
            <Menu 
              sx={{ 
                fontSize: { xs: '1.3rem', sm: '1.5rem' },
                color: '#2d3748',
              }} 
            />
          </IconButton>
        </Box>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ 
          keepMounted: true,
          BackdropProps: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0,0,0,0.4)',
              transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          },
          transitionDuration: { enter: 300, exit: 200 },
        }}
        sx={{
          width: CLIENT_SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: CLIENT_SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: isMobile 
              ? '4px 0 32px rgba(0, 0, 0, 0.15)' 
              : '2px 0 12px rgba(0, 0, 0, 0.05)',
            top: isMobile ? '84px' : '70px',
            height: isMobile ? 'calc(100vh - 84px)' : 'calc(100vh - 70px)',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            background: '#fff',
            color: '#2d3748',
            overflow: 'auto',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      >
        <DrawerContent />
      </Drawer>
    </>
  );
};

export default ClientSidebar;