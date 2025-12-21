import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Container,
  useMediaQuery,
  Typography,
  alpha,
  Stack,
  Divider,
  Menu,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
  Building2,
  Users,
  FileText,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Clock,
  Calendar,
  GraduationCap,
  Briefcase,
  DollarSign,
  Shield,
} from 'lucide-react';

const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  success: '#10B981',
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    500: '#6B7280',
    600: '#4B5563',
    800: '#1F2937',
    900: '#111827',
  },
};

export default function PublicNavbar() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInAnchor, setSignInAnchor] = useState(null);
  const [getStartedAnchor, setGetStartedAnchor] = useState(null);
  const [forWorkersAnchor, setForWorkersAnchor] = useState(null);
  const [forOrgsAnchor, setForOrgsAnchor] = useState(null);

  // Mobile state
  const [mobileSignInOpen, setMobileSignInOpen] = useState(false);
  const [mobileGetStartedOpen, setMobileGetStartedOpen] = useState(false);
  const [mobileForWorkersOpen, setMobileForWorkersOpen] = useState(false);
  const [mobileForOrgsOpen, setMobileForOrgsOpen] = useState(false);

  const handleClose = () => {
    setSignInAnchor(null);
    setGetStartedAnchor(null);
    setForWorkersAnchor(null);
    setForOrgsAnchor(null);
  };

  const workerFeatures = [
    { name: 'Find Jobs', desc: 'Browse available opportunities', icon: Briefcase, href: '/register' },
    { name: 'Manage Schedule', desc: 'Set your availability', icon: Calendar, href: '/register' },
    { name: 'Track Hours', desc: 'Submit timesheets', icon: Clock, href: '/register' },
    { name: 'Certifications', desc: 'Upload credentials', icon: GraduationCap, href: '/register' },
  ];

  const orgFeatures = [
    { name: 'Find Workers', desc: 'Search qualified professionals', icon: Users, href: '/client/register' },
    { name: 'Manage Staff', desc: 'Oversee your team', icon: Shield, href: '/client/register' },
    { name: 'Billing', desc: 'Track invoices & payments', icon: DollarSign, href: '/client/register' },
    { name: 'Compliance', desc: 'Verify worker credentials', icon: FileText, href: '/client/register' },
  ];

  const drawer = (
    <Box sx={{ width: 300, pt: 2, height: '100%', backgroundColor: COLORS.neutral[50] }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, mb: 3 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.125rem', color: COLORS.neutral[900] }}>
          Menu
        </Typography>
        <IconButton onClick={() => setMobileOpen(false)} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <List sx={{ px: 2 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} to="/" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.938rem' }}>Home</Typography>
          </ListItemButton>
        </ListItem>

        {/* For Workers */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton onClick={() => setMobileForWorkersOpen(!mobileForWorkersOpen)} sx={{ borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.938rem', flex: 1 }}>For Workers</Typography>
            {mobileForWorkersOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Box sx={{ pl: 2, display: mobileForWorkersOpen ? 'block' : 'none' }}>
          {workerFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <ListItemButton
                key={feature.name}
                component={Link}
                to={feature.href}
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <Box sx={{ color: COLORS.primary, mr: 1.5 }}>
                  <Icon size={16} />
                </Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{feature.name}</Typography>
              </ListItemButton>
            );
          })}
        </Box>

        {/* For Organizations */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton onClick={() => setMobileForOrgsOpen(!mobileForOrgsOpen)} sx={{ borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.938rem', flex: 1 }}>For Organizations</Typography>
            {mobileForOrgsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Box sx={{ pl: 2, display: mobileForOrgsOpen ? 'block' : 'none' }}>
          {orgFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <ListItemButton
                key={feature.name}
                component={Link}
                to={feature.href}
                onClick={() => setMobileOpen(false)}
                sx={{ borderRadius: 1.5, mb: 0.5 }}
              >
                <Box sx={{ color: COLORS.success, mr: 1.5 }}>
                  <Icon size={16} />
                </Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{feature.name}</Typography>
              </ListItemButton>
            );
          })}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Sign In */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton onClick={() => setMobileSignInOpen(!mobileSignInOpen)} sx={{ borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.938rem', flex: 1 }}>Sign In</Typography>
            {mobileSignInOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Box sx={{ pl: 2, display: mobileSignInOpen ? 'block' : 'none' }}>
          <ListItemButton component={Link} to="/login" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1.5, mb: 0.5 }}>
            <Box sx={{ color: COLORS.primary, mr: 1.5 }}>
              <Users size={16} />
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>As Worker</Typography>
          </ListItemButton>
          <ListItemButton component={Link} to="/client/login" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1.5 }}>
            <Box sx={{ color: COLORS.success, mr: 1.5 }}>
              <Building2 size={16} />
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>As Organization</Typography>
          </ListItemButton>
        </Box>

        {/* Get Started */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton onClick={() => setMobileGetStartedOpen(!mobileGetStartedOpen)} sx={{ borderRadius: 1.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.938rem', flex: 1 }}>Get Started</Typography>
            {mobileGetStartedOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Box sx={{ pl: 2, display: mobileGetStartedOpen ? 'block' : 'none' }}>
          <ListItemButton component={Link} to="/register" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1.5, mb: 0.5 }}>
            <Box sx={{ color: COLORS.primary, mr: 1.5 }}>
              <Users size={16} />
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>As Worker</Typography>
          </ListItemButton>
          <ListItemButton component={Link} to="/client/register" onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1.5 }}>
            <Box sx={{ color: COLORS.success, mr: 1.5 }}>
              <Building2 size={16} />
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>As Organization</Typography>
          </ListItemButton>
        </Box>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: alpha('#fff', 0.95),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${COLORS.neutral[200]}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 72, py: 1 }}>
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                mr: { xs: 'auto', md: 6 },
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                  boxShadow: `0 4px 12px ${alpha(COLORS.primary, 0.25)}`,
                }}
              >
                <Sparkles size={22} color="white" strokeWidth={2.5} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.125rem',
                    lineHeight: 1.2,
                    color: COLORS.neutral[900],
                  }}
                >
                  AecusTech
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.688rem',
                    color: COLORS.neutral[500],
                    mt: -0.25,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  Care Platform
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile ? (
              <>
                <Stack direction="row" spacing={0.5} sx={{ flex: 1 }}>
                  <Button
                    component={Link}
                    to="/"
                    sx={{
                      px: 2,
                      color: COLORS.neutral[800],
                      fontWeight: 600,
                      fontSize: '0.938rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: alpha(COLORS.primary, 0.06),
                      },
                    }}
                  >
                    Home
                  </Button>

                  <Button
                    onClick={(e) => setForWorkersAnchor(e.currentTarget)}
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      px: 2,
                      color: COLORS.neutral[800],
                      fontWeight: 600,
                      fontSize: '0.938rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: alpha(COLORS.primary, 0.06),
                      },
                    }}
                  >
                    For Workers
                  </Button>

                  <Button
                    onClick={(e) => setForOrgsAnchor(e.currentTarget)}
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      px: 2,
                      color: COLORS.neutral[800],
                      fontWeight: 600,
                      fontSize: '0.938rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: alpha(COLORS.success, 0.06),
                      },
                    }}
                  >
                    For Organizations
                  </Button>
                </Stack>

                {/* Auth CTAs */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Button
                    onClick={(e) => setSignInAnchor(e.currentTarget)}
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      px: 2.5,
                      color: COLORS.neutral[800],
                      fontWeight: 600,
                      fontSize: '0.938rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: alpha(COLORS.neutral[900], 0.04),
                      },
                    }}
                  >
                    Sign In
                  </Button>

                  <Button
                    onClick={(e) => setGetStartedAnchor(e.currentTarget)}
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
                    variant="contained"
                    sx={{
                      px: 3,
                      fontWeight: 700,
                      fontSize: '0.938rem',
                      textTransform: 'none',
                      backgroundColor: COLORS.primary,
                      borderRadius: 2,
                      boxShadow: `0 2px 8px ${alpha(COLORS.primary, 0.25)}`,
                      '&:hover': {
                        backgroundColor: COLORS.primaryDark,
                        boxShadow: `0 4px 12px ${alpha(COLORS.primary, 0.35)}`,
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Stack>
              </>
            ) : (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ color: COLORS.neutral[800] }}>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* For Workers Menu */}
      <Menu
        anchorEl={forWorkersAnchor}
        open={Boolean(forWorkersAnchor)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxWidth: 320,
            boxShadow: `0 12px 40px ${alpha('#000', 0.12)}`,
            borderRadius: 2.5,
            border: `1px solid ${COLORS.neutral[200]}`,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: COLORS.neutral[500],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 2,
            }}
          >
            Features for Support Workers
          </Typography>
          <Stack spacing={1}>
            {workerFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Box
                  key={feature.name}
                  component={Link}
                  to={feature.href}
                  onClick={handleClose}
                  sx={{
                    textDecoration: 'none',
                    display: 'block',
                    p: 1.5,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(COLORS.primary, 0.06),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        backgroundColor: alpha(COLORS.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color={COLORS.primary} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: COLORS.neutral[900],
                          mb: 0.25,
                        }}
                      >
                        {feature.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: COLORS.neutral[500] }}>
                        {feature.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Menu>

      {/* For Organizations Menu */}
      <Menu
        anchorEl={forOrgsAnchor}
        open={Boolean(forOrgsAnchor)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxWidth: 320,
            boxShadow: `0 12px 40px ${alpha('#000', 0.12)}`,
            borderRadius: 2.5,
            border: `1px solid ${COLORS.neutral[200]}`,
          },
        }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: COLORS.neutral[500],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 2,
            }}
          >
            Features for Organizations
          </Typography>
          <Stack spacing={1}>
            {orgFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Box
                  key={feature.name}
                  component={Link}
                  to={feature.href}
                  onClick={handleClose}
                  sx={{
                    textDecoration: 'none',
                    display: 'block',
                    p: 1.5,
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(COLORS.success, 0.06),
                    },
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        backgroundColor: alpha(COLORS.success, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} color={COLORS.success} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: COLORS.neutral[900],
                          mb: 0.25,
                        }}
                      >
                        {feature.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: COLORS.neutral[500] }}>
                        {feature.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Menu>

      {/* Sign In Menu */}
      <Menu
        anchorEl={signInAnchor}
        open={Boolean(signInAnchor)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            boxShadow: `0 12px 40px ${alpha('#000', 0.12)}`,
            borderRadius: 2.5,
            border: `1px solid ${COLORS.neutral[200]}`,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: COLORS.neutral[500],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 2,
            }}
          >
            Sign In As
          </Typography>
          <Stack spacing={1.5}>
            <Box
              component={Link}
              to="/login"
              onClick={handleClose}
              sx={{
                textDecoration: 'none',
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(COLORS.primary, 0.04),
                border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
                transition: 'all 0.2s ease',
                display: 'block',
                '&:hover': {
                  backgroundColor: alpha(COLORS.primary, 0.08),
                  borderColor: COLORS.primary,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(COLORS.primary, 0.15)}`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    backgroundColor: COLORS.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} color="white" strokeWidth={2} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.938rem',
                      fontWeight: 700,
                      color: COLORS.neutral[900],
                      mb: 0.25,
                    }}
                  >
                    Support Worker
                  </Typography>
                  <Typography sx={{ fontSize: '0.813rem', color: COLORS.neutral[500] }}>
                    Access your worker dashboard
                  </Typography>
                </Box>
                <ChevronRight size={18} color={COLORS.primary} />
              </Stack>
            </Box>

            <Box
              component={Link}
              to="/client/login"
              onClick={handleClose}
              sx={{
                textDecoration: 'none',
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(COLORS.success, 0.04),
                border: `1px solid ${alpha(COLORS.success, 0.15)}`,
                transition: 'all 0.2s ease',
                display: 'block',
                '&:hover': {
                  backgroundColor: alpha(COLORS.success, 0.08),
                  borderColor: COLORS.success,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(COLORS.success, 0.15)}`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    backgroundColor: COLORS.success,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={20} color="white" strokeWidth={2} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.938rem',
                      fontWeight: 700,
                      color: COLORS.neutral[900],
                      mb: 0.25,
                    }}
                  >
                    Organization
                  </Typography>
                  <Typography sx={{ fontSize: '0.813rem', color: COLORS.neutral[500] }}>
                    Access your organization portal
                  </Typography>
                </Box>
                <ChevronRight size={18} color={COLORS.success} />
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Menu>

      {/* Get Started Menu */}
      <Menu
        anchorEl={getStartedAnchor}
        open={Boolean(getStartedAnchor)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 320,
            boxShadow: `0 12px 40px ${alpha('#000', 0.12)}`,
            borderRadius: 2.5,
            border: `1px solid ${COLORS.neutral[200]}`,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2.5 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: COLORS.neutral[500],
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 2,
            }}
          >
            Get Started As
          </Typography>
          <Stack spacing={1.5}>
            <Box
              component={Link}
              to="/register"
              onClick={handleClose}
              sx={{
                textDecoration: 'none',
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(COLORS.primary, 0.04),
                border: `1px solid ${alpha(COLORS.primary, 0.15)}`,
                transition: 'all 0.2s ease',
                display: 'block',
                '&:hover': {
                  backgroundColor: alpha(COLORS.primary, 0.08),
                  borderColor: COLORS.primary,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(COLORS.primary, 0.15)}`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    backgroundColor: COLORS.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} color="white" strokeWidth={2} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.938rem',
                      fontWeight: 700,
                      color: COLORS.neutral[900],
                      mb: 0.25,
                    }}
                  >
                    Support Worker
                  </Typography>
                  <Typography sx={{ fontSize: '0.813rem', color: COLORS.neutral[500] }}>
                    Join as an individual
                  </Typography>
                </Box>
                <ChevronRight size={18} color={COLORS.primary} />
              </Stack>
            </Box>

            <Box
              component={Link}
              to="/client/register"
              onClick={handleClose}
              sx={{
                textDecoration: 'none',
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(COLORS.success, 0.04),
                border: `1px solid ${alpha(COLORS.success, 0.15)}`,
                transition: 'all 0.2s ease',
                display: 'block',
                '&:hover': {
                  backgroundColor: alpha(COLORS.success, 0.08),
                  borderColor: COLORS.success,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(COLORS.success, 0.15)}`,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    backgroundColor: COLORS.success,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Building2 size={20} color="white" strokeWidth={2} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '0.938rem',
                      fontWeight: 700,
                      color: COLORS.neutral[900],
                      mb: 0.25,
                    }}
                  >
                    Organization
                  </Typography>
                  <Typography sx={{ fontSize: '0.813rem', color: COLORS.neutral[500] }}>
                    Register your business
                  </Typography>
                </Box>
                <ChevronRight size={18} color={COLORS.success} />
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            boxShadow: `-4px 0 32px ${alpha('#000', 0.12)}`,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
