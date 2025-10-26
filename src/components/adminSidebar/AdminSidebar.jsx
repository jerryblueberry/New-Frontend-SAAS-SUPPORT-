import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import {
  Dashboard,
  Analytics,
  People,
  Inventory,
  ShoppingCart,
  Settings,
  Notifications,
  AccountCircle,
  ExpandLess,
  ExpandMore,
  Menu,
  Close,
  TrendingUp,
  Assignment,
  Payment,
  Security,
  Support,
  Logout,
  PersonAdd,
  Group,
  AdminPanelSettings,
  Category,
  LocalShipping,
  Receipt,
  CreditCard,
  AccountBalance,
  ReportProblem,
  BugReport,
  Help,
  Description,
  Backup,
  CloudSync,
  VpnKey,
  Email,
  Sms,
  Language,
  Palette,
  Speed,
  Storage,
  Timelapse,
  LockClock
} from '@mui/icons-material';

// Add a prop for top offset (navbar height)
const DEFAULT_TOP_OFFSET = 64; // px

const AdminSidebar = ({ topOffset = DEFAULT_TOP_OFFSET, navigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [selectedItem, setSelectedItem] = useState('dashboard');

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

  // Update selected item based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Find the menu item that matches the current path
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
      
      // Also open the parent menu if it's a child item
      const findParentMenu = (items, childId) => {
        for (const item of items) {
          if (item.children && item.children.some(child => child.id === childId)) {
            return item.id;
          }
        }
        return null;
      };

      const parentMenuId = findParentMenu(menuItems, matchingItemId);
      if (parentMenuId) {
        setOpenMenus(prev => ({ ...prev, [parentMenuId]: true }));
      }
    } else {
      // Fallback: if no exact match, try to find partial matches
      if (currentPath.includes('admin-dashboard')) {
        setSelectedItem('dashboard');
      } else if (currentPath.includes('admin-reference')) {
        setSelectedItem('questionnaire');
      }
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin-dashboard'
    },
    {
      id: 'questionnaire',
      label: 'Manage Questionnaire',
      icon: <Assignment />,
      path: '/admin-reference/questions'
    },
    {
      id: 'Reference',
      label: 'Reference',
      icon: <Analytics />,
      // badge: 'New',
      children: [
       
        { id: 'allReferences', label: 'All References', icon: <Assignment />, path: '/admin/all-references' },
        // { id: 'insights', label: 'Insights', icon: <Speed />, path: '/analytics/insights' }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <People />,
      children: [
        { id: 'all-users', label: 'All Users', icon: <Group />, path: '/users/all' },
        { id: 'add-user', label: 'Add User', icon: <PersonAdd />, path: '/users/add' },
        { id: 'user-roles', label: 'Roles & Permissions', icon: <AdminPanelSettings />, path: '/users/roles' }
      ]
    },
    {
      id: 'timesheet',
      label: 'Timesheets',
      icon:  <Timelapse/>,
      children: [
        { id: 'all-timesheets', label: 'View All TimeSheets', icon: <LockClock />, path: '/time-sheets' },
        // { id: 'inventory', label: 'Inventory', icon: <Storage />, path: '/products/inventory' },
        // { id: 'categories', label: 'Categories', icon: <Category />, path: '/products/categories' }
      ]
    },
    {
      id: 'documents',
      label: 'Document Management',
      icon: <Storage />,
      children: [
        { id: 'cloudinary-documents', label: 'Cloudinary Documents', icon: <CloudSync />, path: '/admin/cleanup-documents' },
        // { id: 'document-tracking', label: 'Document Tracking', icon: <Description />, path: '/admin/document-tracking' }
      ]
    },
    // {
    //   id: 'orders',
    //   label: 'Orders',
    //   icon: <ShoppingCart />,
    //   badge: '12',
    //   children: [
    //     { id: 'order-list', label: 'Order List', icon: <Receipt />, path: '/orders/list' },
    //     { id: 'shipping', label: 'Shipping', icon: <LocalShipping />, path: '/orders/shipping' },
    //     { id: 'returns', label: 'Returns', icon: <ReportProblem />, path: '/orders/returns' }
    //   ]
    // },
    // {
    //   id: 'payments',
    //   label: 'Payments',
    //   icon: <Payment />,
    //   children: [
    //     { id: 'transactions', label: 'Transactions', icon: <CreditCard />, path: '/payments/transactions' },
    //     { id: 'billing', label: 'Billing', icon: <AccountBalance />, path: '/payments/billing' }
    //   ]
    // },
    // {
    //   id: 'support',
    //   label: 'Support',
    //   icon: <Support />,
    //   children: [
    //     { id: 'tickets', label: 'Tickets', icon: <BugReport />, path: '/support/tickets' },
    //     { id: 'knowledge-base', label: 'Knowledge Base', icon: <Help />, path: '/support/kb' },
    //     { id: 'documentation', label: 'Documentation', icon: <Description />, path: '/support/docs' }
    //   ]
    // },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings />,
      children: [
        { id: 'general', label: 'General', icon: <Settings />, path: '/settings/general' },
        { id: 'security', label: 'Security', icon: <Security />, path: '/settings/security' },
        { id: 'backup', label: 'Backup', icon: <Backup />, path: '/settings/backup' },
        { id: 'integrations', label: 'Integrations', icon: <CloudSync />, path: '/settings/integrations' },
        { id: 'api-keys', label: 'API Keys', icon: <VpnKey />, path: '/settings/api' },
        { id: 'notifications', label: 'Notifications', icon: <Notifications />, path: '/settings/notifications' },
        { id: 'email', label: 'Email Settings', icon: <Email />, path: '/settings/email' },
        { id: 'sms', label: 'SMS Settings', icon: <Sms />, path: '/settings/sms' },
        { id: 'localization', label: 'Localization', icon: <Language />, path: '/settings/localization' },
        { id: 'appearance', label: 'Appearance', icon: <Palette />, path: '/settings/appearance' }
      ]
    }
  ];

  const drawerWidth = 280;

  const DrawerContent = () => (
    <Box sx={{
      height: `calc(100vh - ${topOffset}px)` ,
      display: 'flex',
      flexDirection: 'column',
      background: '#fff', // Minimalist white background
      color: '#2d3748', // Dark text for visibility
      borderTopLeftRadius: 0, // Remove top border radius for flush look
      borderTopRightRadius: 0,
      boxShadow: { xs: 3, md: 6 },
      mt: 0,
      pt: 0,
      overflow: 'auto',
      pr: { xs: 1, md: 3 }, // Add more right padding for visual separation
      pl: { xs: 1, md: 2 }, // Slightly more left padding
      borderRight: '1px solid #e2e8f0', // Subtle border for separation
    }}>
      {/* Header */}
      <Box sx={{
        p: { xs: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha('#fff', 0.1)}`
      }}>
        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{
            bgcolor: '#edf2f7',
            color: '#2d3748',
            width: 40,
            height: 40,
            fontWeight: 700
          }}>
            A
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              v2.1.0
            </Typography>
          </Box>
        </Box> */}
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        )}
      </Box>

      {/* User Profile */}
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
            John Doe
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Super Admin
          </Typography>
        </Box>
        <Chip
          label="Pro"
          size="small"
          sx={{
            backgroundColor: '#e2e8f0',
            color: '#2d3748',
            fontWeight: 600
          }}
        />
      </Box>

      <Divider sx={{ borderColor: alpha('#fff', 0.1) }} />
      {/* Use a lighter divider for white background */}
      <Divider sx={{ borderColor: '#e2e8f0' }} />

      {/* Navigation */}
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
                      '&:hover': {
                        backgroundColor: '#bbdefb',
                      }
                    },
                    '&:hover': {
                      backgroundColor: '#f3f6fa',
                    }
                  }}
                >
                  <ListItemIcon sx={{
                    color: '#667eea',
                    minWidth: 40,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.3rem'
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
                        color: '#2d3748'
                      }
                    }}
                  />
                  {item.badge && (
                    <Badge
                      badgeContent={item.badge}
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#667eea',
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }
                      }}
                    />
                  )}
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
                              '&:hover': {
                                backgroundColor: '#bbdefb',
                              }
                            },
                            '&:hover': {
                              backgroundColor: '#f3f6fa',
                            }
                          }}
                        >
                          <ListItemIcon sx={{
                            color: '#667eea',
                            minWidth: 32,
                            '& .MuiSvgIcon-root': {
                              fontSize: '1.1rem'
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

      {/* Footer */}
      <Box sx={{
        p: { xs: 2, md: 3 },
        borderTop: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
      }}>
        <ListItemButton
          onClick={() => handleItemClick('logout', '/logout')}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1,
            color: '#e53e3e',
            '&:hover': {
              backgroundColor: '#fbe9e7',
              color: '#b71c1c',
            }
          }}
        >
          <ListItemIcon sx={{ color: '#e53e3e', minWidth: 40 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              '& .MuiTypography-root': {
                fontSize: '0.9rem',
                fontWeight: 500,
                color: '#e53e3e',
              }
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
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
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <Menu />
        </IconButton>
      )}

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: isMobile ? 3 : '4px 0 20px rgba(0,0,0,0.1)',
            top: { xs: `${topOffset + 8}px`, md: `${topOffset + 8}px` }, // 8px extra
            height: `calc(100vh - ${topOffset}px)` ,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            background: '#fff', // Minimalist white background
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

export default AdminSidebar;