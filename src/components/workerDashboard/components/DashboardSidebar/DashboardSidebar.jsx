import React, { useState } from 'react';
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
  LinearProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VerifiedIcon from '@mui/icons-material/Verified';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth = 260;

const navItems = [
  { key: 'overview', label: 'Overview', icon: <DashboardIcon /> },
  { key: 'profile', label: 'My Profile', icon: <PersonIcon /> },
  { key: 'jobs', label: 'Available Jobs', icon: <WorkIcon /> },
  { key: 'schedule', label: 'My Schedule', icon: <ScheduleIcon /> },
  { key: 'certifications', label: 'Certifications', icon: <VerifiedIcon /> },
  { key: 'workHistory', label: 'Work History', icon: <HistoryIcon /> },
];

const DashboardSidebar = ({
  activeTab,
  setActiveTab,
  handleSignOut,
  needsOnboarding,
  profileStatus
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {needsOnboarding && (
        <Box sx={{ px: 2, pt: 1, pb: 1 }}>
          {/* <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Profile Completion
          </Typography> */}
          {/* <LinearProgress
            variant="determinate"
            value={profileStatus?.profileCompleteness?.percentage || 0}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          /> */}
          {/* <Typography variant="caption" color="text.secondary">
            {profileStatus?.profileCompleteness?.percentage || 0}%
          </Typography> */}
        </Box>
      )}
      <List sx={{ flex: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={activeTab === item.key}
              onClick={() => {
                setActiveTab(item.key);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderLeft: activeTab === item.key ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                bgcolor: activeTab === item.key ? 'action.selected' : 'inherit',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItem disablePadding sx={{ mt: 'auto' }}>
          <ListItemButton onClick={handleSignOut}>
            <ListItemIcon sx={{ minWidth: 36 }}><LogoutIcon color="error" /></ListItemIcon>
            <ListItemText primary="Sign Out" primaryTypographyProps={{ color: 'error' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 16,
            zIndex: 1301,
            display: { xs: 'block', md: 'none' },
          }}
        >
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            size="large"
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              p: 0.5,
            }}
          >
            <MenuIcon fontSize="inherit" />
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
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, mt: '70px'},
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, mt: '90px' },
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
