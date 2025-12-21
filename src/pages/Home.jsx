import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  alpha,
  Chip,
  Avatar,
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  Heart,
  Briefcase,
  GraduationCap,
  Sparkles,
  Zap,
  Star,
  Award,
  X,
  AlertCircle,
} from 'lucide-react';
import PublicNavbar from '../components/Navbar/PublicNavbar';   

const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  success: '#10B981',
  successDark: '#059669',
  info: '#3B82F6',
  accent: '#8B5CF6',
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mounted, setMounted] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [authAlertMessage, setAuthAlertMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user was redirected due to auth issues
  useEffect(() => {
    const state = location.state;
    if (state?.sessionExpired) {
      setAuthAlertMessage('Your session has expired. Please sign in to continue.');
      setShowAuthAlert(true);
      // Clear the state
      window.history.replaceState({}, document.title);
    } else if (state?.requiresAuth) {
      setAuthAlertMessage('Please sign in to access this page.');
      setShowAuthAlert(true);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onboardingSteps = [
    { icon: User, title: 'Basic Info', desc: 'Create your profile', color: COLORS.primary },
    { icon: Briefcase, title: 'Experience', desc: 'Add work history', color: COLORS.primaryLight },
    { icon: Calendar, title: 'Schedule', desc: 'Set availability', color: COLORS.accent },
    { icon: GraduationCap, title: 'Certifications', desc: 'Upload credentials', color: COLORS.success },
    { icon: Heart, title: 'Health Info', desc: 'Compliance docs', color: '#F59E0B' },
  ];

  const workerBenefits = [
    { icon: TrendingUp, title: 'Higher Pay', desc: 'Competitive rates for qualified workers', stat: '30% more' },
    { icon: Calendar, title: 'Flexible Schedule', desc: 'Choose shifts that fit your life', stat: '24/7 access' },
    { icon: Shield, title: 'Verified Clients', desc: 'Work with trusted organizations', stat: '100% verified' },
    { icon: Users, title: 'Support Network', desc: 'Join a community of professionals', stat: '5K+ members' },
  ];

  const orgBenefits = [
    { icon: Users, title: 'Qualified Workers', desc: 'Pre-screened, certified professionals', stat: '95% qualified' },
    { icon: Clock, title: 'Quick Matching', desc: 'Find workers in days, not weeks', stat: '< 48 hours' },
    { icon: Shield, title: 'Compliance Ready', desc: 'All workers meet requirements', stat: '100% compliant' },
    { icon: FileText, title: 'Easy Management', desc: 'Streamlined hiring process', stat: 'One-click hire' },
  ];

  if (isAuthenticated) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: COLORS.neutral[50],
        opacity: mounted ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
    >
      <PublicNavbar />
      
      {/* Authentication Alert Banner */}
      <Collapse in={showAuthAlert}>
        <Box
          sx={{
            backgroundColor: alpha(COLORS.info, 0.1),
            borderBottom: `2px solid ${alpha(COLORS.info, 0.2)}`,
            py: 1.5,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <AlertCircle size={20} color={COLORS.info} />
                <Typography
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    color: COLORS.neutral[700],
                    fontWeight: 500,
                  }}
                >
                  {authAlertMessage}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: COLORS.primary,
                    color: COLORS.primary,
                    px: 2,
                    py: 0.5,
                    '&:hover': {
                      borderColor: COLORS.primaryDark,
                      backgroundColor: alpha(COLORS.primary, 0.08),
                    },
                  }}
                >
                  Worker Login
                </Button>
                <Button
                  component={Link}
                  to="/client/login"
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: COLORS.success,
                    color: COLORS.success,
                    px: 2,
                    py: 0.5,
                    '&:hover': {
                      borderColor: COLORS.successDark,
                      backgroundColor: alpha(COLORS.success, 0.08),
                    },
                  }}
                >
                  Client Login
                </Button>
                <IconButton
                  size="small"
                  onClick={() => setShowAuthAlert(false)}
                  sx={{
                    color: COLORS.neutral[600],
                    ml: 1,
                    '&:hover': {
                      backgroundColor: alpha(COLORS.neutral[900], 0.05),
                    },
                  }}
                >
                  <X size={18} />
                </IconButton>
              </Box>
            </Box>
          </Container>
        </Box>
      </Collapse>

      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 6, sm: 8, md: 10 },
          pb: { xs: 6, sm: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(COLORS.primary, 0.1)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(COLORS.accent, 0.08)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 6 } }}>
            <Chip
              icon={<Sparkles size={14} />}
              label="Powered by AecusTech"
              sx={{
                mb: 3,
                backgroundColor: alpha(COLORS.primary, 0.1),
                color: COLORS.primary,
                fontWeight: 700,
                fontSize: '0.813rem',
                height: 32,
                px: 1,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.25rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 900,
                color: COLORS.neutral[900],
                mb: 2,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              Connect Support Workers with
              <Box
                component="span"
                sx={{
                  color: COLORS.primary,
                  display: 'block',
                  background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Meaningful Opportunities
              </Box>
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.0625rem', sm: '1.25rem' },
                color: COLORS.neutral[600],
                maxWidth: 700,
                mx: 'auto',
                mb: 4,
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Whether you're a support worker seeking opportunities or an organization looking for
              qualified professionals, AecusTech makes the connection seamless and efficient.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 6 }}
            >
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={20} strokeWidth={2.5} />}
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  backgroundColor: COLORS.primary,
                  borderRadius: 2.5,
                  boxShadow: `0 4px 14px ${alpha(COLORS.primary, 0.4)}`,
                  '&:hover': {
                    backgroundColor: COLORS.primaryDark,
                    boxShadow: `0 6px 20px ${alpha(COLORS.primary, 0.5)}`,
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Join as Support Worker
              </Button>
              <Button
                component={Link}
                to="/client/register"
                variant="outlined"
                size="large"
                endIcon={<ArrowRight size={20} strokeWidth={2.5} />}
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                  color: COLORS.primary,
                  borderRadius: 2.5,
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: COLORS.primaryDark,
                    backgroundColor: alpha(COLORS.primary, 0.04),
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Register Organization
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Two Paths Section */}
      <Box
        sx={{
          py: { xs: 6, sm: 8, md: 10 },
          position: 'relative',
          backgroundColor: 'white',
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, sm: 7 } }}>
            <Chip
              label="Choose Your Path"
              sx={{
                mb: 2,
                height: 32,
                px: 1.5,
                fontSize: '0.813rem',
                fontWeight: 700,
                backgroundColor: alpha(COLORS.primary, 0.1),
                color: COLORS.primary,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                fontWeight: 900,
                mb: 1.5,
                color: COLORS.neutral[900],
                letterSpacing: '-0.03em',
              }}
            >
              Two Ways to Get Started
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: COLORS.neutral[600],
                maxWidth: 650,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Tailored experiences designed specifically for support workers and organizations
            </Typography>
          </Box>

          {/* Side by Side Layout */}
          <Grid container spacing={{ xs: 3, sm: 4 }}>
            {/* Support Worker Card - Left */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  boxShadow: `0 2px 8px ${alpha(COLORS.primary, 0.08)}`,
                  border: `1px solid ${alpha(COLORS.primary, 0.1)}`,
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(COLORS.primary, 0.12)}`,
                    transform: 'translateY(-4px)',
                    borderColor: alpha(COLORS.primary, 0.2),
                  },
                }}
              >
                <Stack spacing={3}>
                  {/* Header */}
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <User size={28} color="white" strokeWidth={2} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          fontWeight: 800,
                          color: COLORS.neutral[900],
                          mb: 0.25,
                        }}
                      >
                        Support Workers
                      </Typography>
                      <Typography sx={{ fontSize: '0.813rem', color: COLORS.neutral[500], fontWeight: 500 }}>
                        For Individuals
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography
                    sx={{
                      color: COLORS.neutral[600],
                      fontSize: '0.938rem',
                      lineHeight: 1.6,
                    }}
                  >
                    Find flexible, well-paying opportunities that match your skills and schedule.
                  </Typography>

                  {/* Benefits */}
                  <Stack spacing={1.5}>
                    {workerBenefits.map((benefit, idx) => {
                      const Icon = benefit.icon;
                      return (
                        <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1.5,
                              backgroundColor: alpha(COLORS.primary, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              mt: 0.25,
                            }}
                          >
                            <Icon size={18} color={COLORS.primary} strokeWidth={2} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: COLORS.neutral[900] }}>
                                {benefit.title}
                              </Typography>
                              <Chip
                                label={benefit.stat}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.688rem',
                                  fontWeight: 700,
                                  backgroundColor: alpha(COLORS.primary, 0.1),
                                  color: COLORS.primary,
                                }}
                              />
                            </Stack>
                            <Typography sx={{ fontSize: '0.813rem', color: COLORS.neutral[500], lineHeight: 1.5 }}>
                              {benefit.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    })}
                  </Stack>

                  {/* CTA */}
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowRight size={18} strokeWidth={2.5} />}
                    sx={{
                      py: 1.25,
                      fontSize: '0.938rem',
                      fontWeight: 700,
                      backgroundColor: COLORS.primary,
                      borderRadius: 2,
                      mt: 1,
                      '&:hover': {
                        backgroundColor: COLORS.primaryDark,
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Get Started
                  </Button>
                </Stack>
              </Box>
            </Grid>

            {/* Organization Card - Right */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: '100%',
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  backgroundColor: 'white',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  boxShadow: `0 2px 8px ${alpha(COLORS.success, 0.08)}`,
                  border: `1px solid ${alpha(COLORS.success, 0.1)}`,
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(COLORS.success, 0.12)}`,
                    transform: 'translateY(-4px)',
                    borderColor: alpha(COLORS.success, 0.2),
                  },
                }}
              >
                <Stack spacing={3}>
                  {/* Header */}
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${COLORS.success} 0%, ${COLORS.successDark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Building2 size={28} color="white" strokeWidth={2} />
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          fontWeight: 800,
                          color: COLORS.neutral[900],
                          mb: 0.25,
                        }}
                      >
                        Organizations
                      </Typography>
                      <Typography sx={{ fontSize: '0.813rem', color: COLORS.neutral[500], fontWeight: 500 }}>
                        For Businesses
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography
                    sx={{
                      color: COLORS.neutral[600],
                      fontSize: '0.938rem',
                      lineHeight: 1.6,
                    }}
                  >
                    Find qualified, certified support workers quickly with streamlined hiring.
                  </Typography>

                  {/* Benefits */}
                  <Stack spacing={1.5}>
                    {orgBenefits.map((benefit, idx) => {
                      const Icon = benefit.icon;
                      return (
                        <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1.5,
                              backgroundColor: alpha(COLORS.success, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              mt: 0.25,
                            }}
                          >
                            <Icon size={18} color={COLORS.success} strokeWidth={2} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: COLORS.neutral[900] }}>
                                {benefit.title}
                              </Typography>
                              <Chip
                                label={benefit.stat}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.688rem',
                                  fontWeight: 700,
                                  backgroundColor: alpha(COLORS.success, 0.1),
                                  color: COLORS.successDark,
                                }}
                              />
                            </Stack>
                            <Typography sx={{ fontSize: '0.813rem', color: COLORS.neutral[500], lineHeight: 1.5 }}>
                              {benefit.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      );
                    })}
                  </Stack>

                  {/* CTA */}
                  <Button
                    component={Link}
                    to="/client/register"
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowRight size={18} strokeWidth={2.5} />}
                    sx={{
                      py: 1.25,
                      fontSize: '0.938rem',
                      fontWeight: 700,
                      backgroundColor: COLORS.success,
                      borderRadius: 2,
                      mt: 1,
                      '&:hover': {
                        backgroundColor: COLORS.successDark,
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Register Now
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Onboarding Process */}
      <Box sx={{ py: { xs: 6, sm: 8, md: 10 }, backgroundColor: COLORS.neutral[50] }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5 } }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                fontWeight: 800,
                mb: 1,
                color: COLORS.neutral[900],
                letterSpacing: '-0.02em',
              }}
            >
              Simple Onboarding Process
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.938rem', sm: '1.0625rem' },
                color: COLORS.neutral[600],
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Get started in 5 easy steps. Complete your profile to unlock all features.
            </Typography>
          </Box>

          {/* Full Width Flex Layout - Perfectly Aligned */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              flexWrap: { xs: 'nowrap', sm: 'wrap', md: 'nowrap' },
              gap: { xs: 2, sm: 2.5, md: 3 },
              width: '100%',
            }}
          >
            {onboardingSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Box
                  key={idx}
                  sx={{
                    flex: { xs: '0 0 100%', sm: '0 0 calc(50% - 10px)', md: '1 1 0' },
                    minWidth: 0,
                    p: { xs: 2.5, sm: 2.75, md: 3 },
                    borderRadius: 2.5,
                    backgroundColor: 'white',
                    border: `1px solid ${COLORS.neutral[200]}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    boxShadow: `0 1px 3px ${alpha('#000', 0.04)}`,
                    '&:hover': {
                      borderColor: step.color,
                      boxShadow: `0 4px 16px ${alpha(step.color, 0.12)}`,
                      transform: 'translateY(-3px)',
                      '& .step-icon': {
                        transform: 'scale(1.1)',
                        backgroundColor: alpha(step.color, 0.15),
                      },
                    },
                  }}
                >
                  {/* Step Number Badge */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: step.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      boxShadow: `0 2px 8px ${alpha(step.color, 0.3)}`,
                    }}
                  >
                    {idx + 1}
                  </Box>

                  {/* Icon */}
                  <Box
                    className="step-icon"
                    sx={{
                      width: { xs: 48, sm: 52 },
                      height: { xs: 48, sm: 52 },
                      borderRadius: 2,
                      backgroundColor: alpha(step.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Icon size={24} color={step.color} strokeWidth={2.5} />
                  </Box>

                  {/* Title */}
                  <Typography
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '0.938rem' },
                      fontWeight: 700,
                      color: COLORS.neutral[900],
                      mb: 0.5,
                      lineHeight: 1.3,
                    }}
                  >
                    {step.title}
                  </Typography>

                  {/* Description */}
                  <Typography
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.813rem' },
                      color: COLORS.neutral[500],
                      lineHeight: 1.5,
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {step.desc}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Progress Indicator */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            {onboardingSteps.map((step, idx) => (
              <Box
                key={idx}
                sx={{
                  width: { xs: 8, sm: 10 },
                  height: { xs: 8, sm: 10 },
                  borderRadius: '50%',
                  backgroundColor: step.color,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 8, sm: 10, md: 12 },
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#fff', 0.1)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                backgroundColor: alpha('#fff', 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <Zap size={32} color="white" strokeWidth={2} />
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '3rem' },
                fontWeight: 800,
                mb: 2,
                letterSpacing: '-0.02em',
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.0625rem', sm: '1.25rem' },
                mb: 5,
                opacity: 0.95,
                maxWidth: 550,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Join thousands of support workers and organizations already using AecusTech to
              connect and grow.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2.5}
              justifyContent="center"
            >
              <Button
                component={Link}
                to="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={20} strokeWidth={2.5} />}
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  backgroundColor: 'white',
                  color: COLORS.primary,
                  borderRadius: 2.5,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  '&:hover': {
                    backgroundColor: COLORS.neutral[100],
                    boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Start as Worker
              </Button>
              <Button
                component={Link}
                to="/client/register"
                variant="outlined"
                size="large"
                endIcon={<ArrowRight size={20} strokeWidth={2.5} />}
                sx={{
                  px: 4,
                  py: 1.75,
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  borderWidth: 2,
                  borderColor: 'white',
                  color: 'white',
                  borderRadius: 2.5,
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: 'white',
                    backgroundColor: alpha('#fff', 0.1),
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Register Organization
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: COLORS.neutral[900], color: 'white' }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography sx={{ fontSize: '0.875rem', opacity: 0.8 }}>
              © 2024 AecusTech. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: 'white',
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: alpha('#fff', 0.1) },
                }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/register"
                sx={{
                  color: 'white',
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { backgroundColor: alpha('#fff', 0.1) },
                }}
              >
                Register
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
