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
  IconButton,
  Badge,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Dashboard,
  Analytics,
  People,
  Settings,
  Notifications,
  AccountCircle,
  ExpandLess,
  ExpandMore,
  Menu,
  Assignment,
  PersonAdd,
  Group,
  AdminPanelSettings,
  Storage,
  Timelapse,
  LockClock,
  Logout,
  CloudSync,
  Description,
  Backup,
  VpnKey,
  Email,
  Sms,
  Language,
  Palette,
  Security,
} from '@mui/icons-material';

const DEFAULT_TOP_OFFSET = 64;
const SIDEBAR_TOP_MARGIN = 5; // px gap between navbar and sidebar for a blended look
const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_MOBILE = 280;

const AdminSidebar = ({ topOffset = DEFAULT_TOP_OFFSET, navigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [selectedItem, setSelectedItem] = useState('dashboard');

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User';
  const roleLabel = user?.role ? String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1) : 'Admin';

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleMenuClick = (menuId) => {
    setOpenMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const handleItemClick = (itemId, path) => {
    setSelectedItem(itemId);
    if (path && navigate) navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  useEffect(() => {
    const currentPath = location.pathname;

    const findMenuItemByPath = (items, path) => {
      for (const item of items) {
        if (item.path === path) return item.id;
        if (item.children) {
          const childMatch = findMenuItemByPath(item.children, path);
          if (childMatch) return childMatch;
        }
      }
      return null;
    };

    const findParentMenu = (items, childId) => {
      for (const item of items) {
        if (item.children?.some((c) => c.id === childId)) return item.id;
      }
      return null;
    };

    const matchingItemId = findMenuItemByPath(menuItems, currentPath);
    if (matchingItemId) {
      setSelectedItem(matchingItemId);
      const parentMenuId = findParentMenu(menuItems, matchingItemId);
      if (parentMenuId) {
        setOpenMenus((prev) => ({ ...prev, [parentMenuId]: true }));
      }
    } else {
      if (currentPath.includes('admin-dashboard')) setSelectedItem('dashboard');
      else if (currentPath.includes('admin-reference')) setSelectedItem('questionnaire');
    }
  }, [location.pathname]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Dashboard />, path: '/admin-dashboard' },
    { id: 'questionnaire', label: 'Questionnaire', icon: <Assignment />, path: '/admin-reference/questions' },
    {
      id: 'Reference',
      label: 'Reference',
      icon: <Analytics />,
      children: [{ id: 'allReferences', label: 'All References', icon: <Assignment />, path: '/admin/all-references' }],
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <People />,
      children: [
        { id: 'all-users', label: 'All Users', icon: <Group />, path: '/users/all' },
        { id: 'add-user', label: 'Add User', icon: <PersonAdd />, path: '/users/add' },
        { id: 'user-roles', label: 'Roles & Permissions', icon: <AdminPanelSettings />, path: '/users/roles' },
      ],
    },
    {
      id: 'clients',
      label: 'Client Management',
      icon: <People />,
      children: [
        { id: 'all-clients', label: 'All Clients', icon: <Group />, path: '/admin/clients' },
        { id: 'add-client', label: 'Add Client', icon: <PersonAdd />, path: '/clients/add' },
        { id: 'client-roles', label: 'Roles & Permissions', icon: <AdminPanelSettings />, path: '/clients/roles' },
      ],
    },
    {
      id: 'timesheet',
      label: 'Timesheets',
      icon: <Timelapse />,
      children: [{ id: 'all-timesheets', label: 'View All', icon: <LockClock />, path: '/time-sheets' }],
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: <Storage />,
      children: [
        { id: 'cloudinary-documents', label: 'Cloudinary', icon: <CloudSync />, path: '/admin/cleanup-documents' },
        { id: 'document-tracking', label: 'Tracking', icon: <Description />, path: '/admin/document-tracking' },
        { id: 'Certification Types', label: 'Cert Types', icon: <Description />, path: '/certification-types' },
      ],
    },
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
        { id: 'email', label: 'Email', icon: <Email />, path: '/settings/email' },
        { id: 'sms', label: 'SMS', icon: <Sms />, path: '/settings/sms' },
        { id: 'localization', label: 'Localization', icon: <Language />, path: '/settings/localization' },
        { id: 'appearance', label: 'Appearance', icon: <Palette />, path: '/settings/appearance' },
      ],
    },
  ];

  const navItemSx = {
    borderRadius: 1.5,
    mx: 1,
    px: 1.5,
    py: 0.875,
    minHeight: 40,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    color: theme.palette.text.secondary,
    '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 36 },
    '& .MuiSvgIcon-root': { fontSize: '1.125rem' },
    '&.Mui-selected': {
      bgcolor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
      '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14) },
    },
    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
  };

  const childItemSx = {
    borderRadius: 1.25,
    mx: 1,
    px: 1.5,
    py: 0.65,
    pl: 3.5,
    minHeight: 36,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    color: theme.palette.text.secondary,
    '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 28 },
    '& .MuiSvgIcon-root': { fontSize: '1rem' },
    '&.Mui-selected': {
      bgcolor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
      '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14) },
    },
    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
  };

  const DrawerContent = () => (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper,
        borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        overflow: 'hidden',
      }}
    >
     

      {/* Compact User */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          flexShrink: 0,
        }}
      >
        <Avatar
          src={user?.profilePicture}
          sx={{
            width: 36,
            height: 36,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
          }}
        >
          {!user?.profilePicture &&
            ([user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('') || (
              <AccountCircle sx={{ fontSize: 20 }} />
            ))}
            </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: '0.8125rem' }}>
            {fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
            {roleLabel}
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1.25 }}>
        <List dense disablePadding sx={{ px: 0.5 }}>
          {menuItems.map((item) => (
            <Box key={item.id}>
              <ListItem disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() =>
                    item.children ? handleMenuClick(item.id) : handleItemClick(item.id, item.path)
                  }
                  selected={selectedItem === item.id}
                  sx={navItemSx}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                    }}
                  />
                  {item.badge && (
                    <Badge
                      badgeContent={item.badge}
                      sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}
                    />
                  )}
                  {item.children && (openMenus[item.id] ? <ExpandLess sx={{ fontSize: '1.1rem' }} /> : <ExpandMore sx={{ fontSize: '1.1rem' }} />)}
                </ListItemButton>
              </ListItem>

              {item.children && (
                <Collapse in={openMenus[item.id]} timeout={200} unmountOnExit>
                  <List component="div" disablePadding dense>
                    {item.children.map((child) => (
                      <ListItem key={child.id} disablePadding sx={{ mb: 0.15 }}>
                        <ListItemButton
                          onClick={() => handleItemClick(child.id, child.path)}
                          selected={selectedItem === child.id}
                          sx={childItemSx}
                        >
                          <ListItemIcon>{child.icon}</ListItemIcon>
                          <ListItemText
                            primary={child.label}
                            primaryTypographyProps={{
                              fontSize: '0.75rem',
                              fontWeight: 450,
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

      {/* Footer Logout */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          flexShrink: 0,
        }}
      >
        <ListItemButton
          onClick={() => handleItemClick('logout', '/logout')}
          sx={{
            borderRadius: 1.5,
            px: 1.5,
            py: 0.75,
            color: theme.palette.error.main,
            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
            '& .MuiListItemIcon-root': { minWidth: 36, color: 'inherit' },
            '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 500 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  const drawerWidth = isMobile ? DRAWER_WIDTH_MOBILE : DRAWER_WIDTH;

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            bgcolor: theme.palette.background.paper,
            boxShadow: 2,
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
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
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: isMobile ? 8 : `1px 0 0 ${alpha(theme.palette.divider, 0.08)}`,
            top: isMobile ? 0 : `${topOffset + SIDEBAR_TOP_MARGIN}px`,
            height: isMobile ? '100vh' : `calc(100vh - ${topOffset + SIDEBAR_TOP_MARGIN}px)`,
            mt: 0,
            background: theme.palette.background.paper,
            overflow: 'hidden',
          },
        }}
      >
        <DrawerContent />
      </Drawer>
    </>
  );
};

export default AdminSidebar;
