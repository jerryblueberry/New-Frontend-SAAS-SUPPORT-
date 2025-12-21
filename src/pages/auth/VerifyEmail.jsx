import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Container,
  Fade,
  Grow,
  Zoom,
  Alert,
  IconButton,
  LinearProgress,
  Backdrop,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Email,
  Refresh,
  ArrowForward,
  Close
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { verifyEmail } from '../../api/auth';

// Custom animations
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Animated components
const AnimatedIcon = ({ children, animation = 'pulse', ...props }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: `${animation === 'pulse' ? pulseAnimation : floatAnimation} 2s ease-in-out infinite`,
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

const ShimmerCard = ({ children, loading = false }) => {
  const theme = useTheme();
  return (
    <Card
      elevation={loading ? 8 : 4}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: loading
          ? `linear-gradient(90deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 50%, ${theme.palette.background.paper} 100%)`
          : theme.palette.background.paper,
        backgroundSize: loading ? '200px 100%' : 'auto',
        animation: loading ? `${shimmerAnimation} 1.5s ease-in-out infinite` : 'none',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[12]
        }
      }}
    >
      {children}
    </Card>
  );
};

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [status, setStatus] = useState('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  // Memoized navigation handler
  const handleNavigation = useCallback((path) => {
    try {
      navigate(path);
    } catch (navError) {
      console.error('Navigation failed:', navError);
      navigate('/');
    }
  }, [navigate]);

  // Real API call
  const mutation = useMutation({
    mutationFn: (token) => verifyEmail(token),
    onSuccess: useCallback((response) => {
      // Clear stored verification email on successful verification
      try {
        localStorage.removeItem('pending_verification_email');
      } catch (error) {
        console.warn('Failed to clear stored email:', error);
      }
      
      setStatus('success');
      setProgress(100);
      setTimeout(() => {
        try {
          if (response.data?.user?.onboardingStep &&
              response.data.user.onboardingStep !== 'completed') {
            handleNavigation('/onboarding');
          } else {
            handleNavigation('/dashboard');
          }
        } catch (navError) {
          console.error('Navigation after verification failed:', navError);
          handleNavigation('/login');
        }
      }, 2000);
    }, [handleNavigation]),
    onError: useCallback((err) => {
      console.error('Verification error:', err);
      const msg = err.response?.data?.message;
      if (msg?.includes('already verified')) {
        setStatus('success');
        setProgress(100);
        setTimeout(() => handleNavigation('/login'), 2500);
      } else {
        setErrorMessage(msg || 'The verification link is invalid or has expired.');
        setStatus('error');
        setProgress(0);
        setShowAlert(true);
      }
    }, [handleNavigation])
  });

  // Progress simulation for loading state
  useEffect(() => {
    if (status === 'loading') {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
      return () => clearInterval(timer);
    }
  }, [status]);

  // Main verification effect
  useEffect(() => {
    if (token && status === 'pending') {
      setStatus('loading');
      setProgress(10);
      const timeoutId = setTimeout(() => {
        if (status === 'loading') {
          setErrorMessage('Verification request timed out. Please try again later.');
          setStatus('error');
          setShowAlert(true);
        }
      }, 15000);
      mutation.mutate(token);
      return () => clearTimeout(timeoutId);
    }
  }, [token, status, mutation]);

  // Memoized status configurations
  const statusConfig = useMemo(() => ({
    loading: {
      title: 'Verifying Your Email',
      icon: <Email sx={{ fontSize: { xs: 48, sm: 64 } }} />,
      color: 'primary',
      showProgress: true
    },
    success: {
      title: 'Email Verified!',
      subtitle: 'Your email has been successfully verified. Redirecting you now...',
      icon: <CheckCircle sx={{ fontSize: { xs: 48, sm: 64 } }} />,
      color: 'success',
      showProgress: false
    },
    error: {
      title: 'Verification Failed',
      subtitle: errorMessage,
      icon: <ErrorIcon sx={{ fontSize: { xs: 48, sm: 64 } }} />,
      color: 'error',
      showProgress: false
    }
  }), [errorMessage]);

  const currentConfig = statusConfig[status];

  if (status === 'pending') {
    return (
      <Backdrop open sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <CircularProgress color="primary" size={60} />
      </Backdrop>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 3 }}>
      <Box sx={{ width: '100%' }}>
        <Fade in timeout={800}>
          <Box>
            <ShimmerCard loading={status === 'loading'}>
              <CardContent
                sx={{
                  textAlign: 'center',
                  py: { xs: 4, sm: 6 },
                  px: { xs: 2, sm: 4 }
                }}
              >
                {/* Progress Bar */}
                {currentConfig.showProgress && (
                  <Box sx={{ width: '100%', mb: 3 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.action.hover,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                        }
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {Math.round(progress)}% Complete
                    </Typography>
                  </Box>
                )}

                {/* Icon */}
                <Grow in timeout={1000}>
                  <Box sx={{ mb: 3 }}>
                    <AnimatedIcon
                      animation={status === 'loading' ? 'pulse' : 'float'}
                      sx={{
                        color: theme.palette[currentConfig.color].main,
                        mb: 2
                      }}
                    >
                      {currentConfig.icon}
                    </AnimatedIcon>
                  </Box>
                </Grow>

                {/* Title */}
                <Zoom in timeout={1200}>
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette[currentConfig.color].main,
                      mb: 2
                    }}
                  >
                    {currentConfig.title}
                  </Typography>
                </Zoom>

                {/* Subtitle */}
                {currentConfig.subtitle && (
                  <Fade in timeout={1400}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        mb: 4,
                        lineHeight: 1.6,
                        fontSize: { xs: '0.9rem', sm: '1rem' }
                      }}
                    >
                      {currentConfig.subtitle}
                    </Typography>
                  </Fade>
                )}

                {/* Loading Spinner */}
                {status === 'loading' && (
                  <Fade in timeout={1600}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <CircularProgress
                        size={isMobile ? 40 : 48}
                        thickness={4}
                        sx={{
                          color: theme.palette.primary.main,
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round'
                          }
                        }}
                      />
                    </Box>
                  </Fade>
                )}

                {/* Error Actions */}
                {status === 'error' && (
                  <Fade in timeout={1600}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleNavigation('/login')}
                        startIcon={<ArrowForward />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: theme.shadows[4],
                          '&:hover': {
                            boxShadow: theme.shadows[8],
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Go to Login
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => window.location.reload()}
                        startIcon={<Refresh />}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Retry
                      </Button>
                    </Box>
                  </Fade>
                )}

                {/* Success Animation */}
                {status === 'success' && (
                  <Fade in timeout={1600}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Redirecting in a moment...
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </ShimmerCard>
          </Box>
        </Fade>

        {/* Alert for additional feedback */}
        {showAlert && status === 'error' && (
          <Fade in timeout={500}>
            <Alert
              severity="error"
              sx={{ mt: 2, borderRadius: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setShowAlert(false)}
                >
                  <Close fontSize="inherit" />
                </IconButton>
              }
            >
              Need help? Contact our support team if this issue persists.
            </Alert>
          </Fade>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail;