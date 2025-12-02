import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../../api/auth';
import Toast from '../../components/common/Toast';
import {
  Box,
  Container,
  Typography,
  Button,
  Divider,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Grid,
  Stack,
  Avatar,
  alpha,
  Fade,
  Slide,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Handshake as HandshakeIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import AECUSLogo from '../../assets/aecus-logo.png';

const Login = () => {
  const formRef = useRef(null);
  const emailInputRef = useRef(null);
  const googleButtonRef = useRef(null);
  
  const { signIn, authError, isAuthenticated, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  
  const [toast, setToast] = useState(null);
  const [lastErrorMessage, setLastErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const toastTimeoutRef = useRef(null);
  const shownErrorRef = useRef(null); // Track which errors we've already shown

  const searchParams = new URLSearchParams(location.search);
  const from = useMemo(() =>
    location.state?.from?.pathname ||
    searchParams.get('returnTo') ||
    '/dashboard',
    [location.state?.from?.pathname, searchParams]
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Improved error display - only one toast at a time, auto-hide after timeout
  const showErrorToast = useCallback((message) => {
    // If same message is already showing, don't show again
    if (message === lastErrorMessage && toast) {
      return;
    }

    // Clear any existing toast timeout
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }

    // Clear current toast and show new one immediately
    setLastErrorMessage(message);
    const newToast = {
      message,
      type: 'error',
      duration: 4000, // 4 seconds
      id: Date.now(),
    };
    setToast(newToast);
    
    // Auto-hide after duration
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      setLastErrorMessage('');
      toastTimeoutRef.current = null;
      // Reset shown error ref when toast hides so same error can show again if needed
      shownErrorRef.current = null;
    }, newToast.duration);
  }, [lastErrorMessage, toast]);

  const hideToast = useCallback(() => {
    // Clear timeout if exists
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
    setLastErrorMessage('');
    // Reset shown error ref when manually closed
    shownErrorRef.current = null;
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Improved error handling in useEffect - only show once per error
  useEffect(() => {
    if (authError && authError.message) {
      const errorId = authError.message + (authError.response || '');
      
      // Only show if we haven't shown this exact error before
      if (shownErrorRef.current !== errorId) {
        shownErrorRef.current = errorId;
        // Show generic error message for security
        showErrorToast('Invalid email or password. Please check your credentials and try again.');
        // Clear the authError after showing toast to prevent re-triggering
        clearAuthError();
      }
    }
  }, [authError?.message, showErrorToast, clearAuthError]);

  const {
    mutate,
    isLoading,
    error: mutationError,
  } = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      clearAuthError();
      navigate(from, { replace: true });
    },
    onError: (error) => {
      // Show generic error message for security (don't reveal specific validation errors)
      const errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      console.log("Login error:", error);
      showErrorToast(errorMessage);
      setIsSubmitting(false);
    }
  });

  // Google login with improved error handling
  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (response) => {
      setIsGoogleLoading(true);
      try {
        const authResult = await googleAuth(response.access_token);
        await signIn(authResult.data, true, true);
        clearAuthError();
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Google auth failed:', error);
        showErrorToast('Authentication failed. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      showErrorToast('Authentication failed. Please try again.');
      setIsGoogleLoading(false);
    },
  });

  const handleLoginSubmit = useCallback(async (credentials, error) => {
    if (error) {
      // Show generic error message for security
      showErrorToast('Invalid email or password. Please check your credentials and try again.');
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(credentials);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      // Show generic error message for security
      showErrorToast('Invalid email or password. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [signIn, navigate, from, showErrorToast]);

  // Handle Google button click with focus management
  const handleGoogleButtonClick = useCallback((e) => {
    e.preventDefault();
    googleLogin();
  }, [googleLogin]);

  // Feature cards data
  const features = useMemo(() => [
    {
      icon: <PersonIcon />,
      title: 'Connect with Clients',
      description: 'Build meaningful relationships with clients who value your expertise and dedication',
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Career Growth',
      description: 'Access training, certifications, and opportunities to advance your career',
    },
    {
      icon: <HandshakeIcon />,
      title: 'Flexible Work',
      description: 'Choose your schedule and work with clients that match your expertise',
    },
    {
      icon: <CalendarTodayIcon />,
      title: 'Easy Management',
      description: 'Streamline your work with our intuitive scheduling and management tools',
    },
  ], []);

  return (
    <>
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
          duration={toast.duration}
        />
      )}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          background: isMobile
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: isMobile
              ? 'none'
              : `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                 radial-gradient(circle at 75% 75%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
            pointerEvents: 'none',
            zIndex: 0,
          },
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            width: '100%',
            padding: 0,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Grid container sx={{ minHeight: '100vh' }}>
            {/* Left Side - Branding Section */}
            {!isMobile && (
              <Grid
                item
                xs={false}
                md={6}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  padding: { md: 4, lg: 6 },
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `linear-gradient(45deg, ${alpha('#fff', 0.05)} 25%, transparent 25%),
                                     linear-gradient(-45deg, ${alpha('#fff', 0.05)} 25%, transparent 25%)`,
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 0 20px',
                    opacity: 0.3,
                    pointerEvents: 'none',
                  },
                }}
              >
                <Fade in timeout={800}>
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: '600px',
                      zIndex: 1,
                      position: 'relative',
                    }}
                  >
                    <Typography
                      variant="h3"
                      component="h1"
                      sx={{
                        fontSize: { md: '2.5rem', lg: '3rem' },
                        fontWeight: 800,
                        color: '#ffffff',
                        marginBottom: 3,
                        lineHeight: 1.2,
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      Independent Support Worker Platform
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: { md: '1.125rem', lg: '1.25rem' },
                        color: alpha('#ffffff', 0.9),
                        marginBottom: 4,
                        lineHeight: 1.6,
                        fontWeight: 400,
                      }}
                    >
                      Join our community of dedicated support workers and make a real difference in people's lives
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 4 }}>
                      {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Slide direction="up" in timeout={600 + index * 100}>
                            <Paper
                              elevation={0}
                              sx={{
                                padding: 3,
                                borderRadius: 3,
                                background: alpha('#ffffff', 0.1),
                                backdropFilter: 'blur(8px)',
                                border: `1px solid ${alpha('#ffffff', 0.15)}`,
                                transition: theme.transitions.create(['transform', 'background'], {
                                  duration: theme.transitions.duration.shorter,
                                }),
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  background: alpha('#ffffff', 0.15),
                                  boxShadow: `0 10px 20px ${alpha('#000', 0.2)}`,
                                },
                              }}
                            >
                              <Avatar
                                sx={{
                                  backgroundColor: alpha('#ffffff', 0.2),
                                  color: '#ffffff',
                                  width: 56,
                                  height: 56,
                                  marginBottom: 2,
                                  fontSize: '1.75rem',
                                }}
                              >
                                {feature.icon}
                              </Avatar>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontSize: { md: '1.125rem', lg: '1.25rem' },
                                  fontWeight: 700,
                                  color: '#ffffff',
                                  marginBottom: 1,
                                }}
                              >
                                {feature.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: { md: '0.875rem', lg: '0.9375rem' },
                                  color: alpha('#ffffff', 0.9),
                                  lineHeight: 1.6,
                                }}
                              >
                                {feature.description}
                              </Typography>
                            </Paper>
                          </Slide>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              </Grid>
            )}

            {/* Right Side - Login Form Section */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: { xs: 2, sm: 3, md: 4 },
              }}
            >
              <Fade in timeout={1000}>
                <Card
                  elevation={0}
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '520px', md: '480px', lg: '520px' },
                    borderRadius: { xs: 2, sm: 3 },
                    boxShadow: `0 20px 25px -5px ${alpha(theme.palette.common.black, 0.1)}, 0 8px 10px -6px ${alpha(theme.palette.common.black, 0.1)}`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      padding: { xs: 3, sm: 4, md: 4.5 },
                    }}
                  >
                    {/* Logo */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 3,
                        padding: 2,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.12)} 100%)`,
                      }}
                    >
                      <Box
                        component="img"
                        src={AECUSLogo}
                        alt="AECUS Logo"
                        sx={{
                          width: { xs: '160px', sm: '200px', md: '240px' },
                          height: 'auto',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>

                    {/* Header */}
                    <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
                      <Typography
                        variant="h4"
                        component="h2"
                        sx={{
                          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                          fontWeight: 800,
                          color: theme.palette.primary.main,
                          marginBottom: 1,
                        }}
                      >
                        Welcome Back
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.125rem' },
                          color: theme.palette.text.secondary,
                          lineHeight: 1.5,
                        }}
                      >
                        Sign in to continue your journey of making a difference
                      </Typography>
                    </Box>

                    {/* Login Form */}
                    <LoginForm
                      onSubmit={handleLoginSubmit}
                      setEmailInputRef={(el) => (emailInputRef.current = el)}
                      loading={isLoading || isSubmitting}
                      error={mutationError}
                    />

                    {/* Divider */}
                    <Box sx={{ marginY: 3 }}>
                      <Divider
                        sx={{
                          '&::before, &::after': {
                            borderColor: alpha(theme.palette.divider, 0.5),
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                            color: theme.palette.text.secondary,
                            textTransform: 'uppercase',
                            fontWeight: 500,
                            px: 2,
                          }}
                        >
                          Or continue with
                        </Typography>
                      </Divider>
                    </Box>

                    {/* Google Button */}
                    <LoadingButton
                      fullWidth
                      variant="outlined"
                      onClick={handleGoogleButtonClick}
                      disabled={isGoogleLoading || isLoading}
                      loading={isGoogleLoading}
                      size="large"
                      startIcon={
                        !isGoogleLoading && (
                          <GoogleIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                        )
                      }
                      ref={googleButtonRef}
                      sx={{
                        py: { xs: 1.25, sm: 1.5 },
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: alpha(theme.palette.divider, 0.5),
                        color: theme.palette.text.primary,
                        transition: theme.transitions.create(['border-color', 'box-shadow', 'transform', 'background'], {
                          duration: theme.transitions.duration.shorter,
                        }),
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                        '&:disabled': {
                          borderColor: theme.palette.action.disabled,
                          color: theme.palette.action.disabled,
                        },
                      }}
                    >
                      {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
                    </LoadingButton>

                    {/* Footer */}
                    <Box
                      sx={{
                        marginTop: 3,
                        textAlign: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          color: theme.palette.text.secondary,
                        }}
                      >
                        New to our platform?{' '}
                        <Typography
                          component={Link}
                          to="/register"
                          sx={{
                            fontSize: 'inherit',
                            fontWeight: 500,
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            transition: theme.transitions.create(['color', 'text-decoration'], {
                              duration: theme.transitions.duration.shorter,
                            }),
                            '&:hover': {
                              color: theme.palette.primary.dark,
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          Create an account
                        </Typography>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Login;
