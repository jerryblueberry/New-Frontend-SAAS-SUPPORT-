import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Zoom,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import { resendVerificationEmail } from '../../api/auth';
import AECUSLogo from '../../assets/aecus-logo.png';

// Storage key for pending verification email
const PENDING_VERIFICATION_EMAIL_KEY = 'pending_verification_email';

/**
 * Get email from multiple sources with priority:
 * 1. Location state (from navigation)
 * 2. URL query params
 * 3. localStorage (from previous session)
 */
const getEmailFromSources = (location, searchParams) => {
  // Priority 1: Location state (most reliable, from navigation)
  if (location?.state?.email) {
    return location.state.email;
  }
  
  // Priority 2: URL query params
  const urlEmail = searchParams.get('email');
  if (urlEmail) {
    return urlEmail;
  }
  
  // Priority 3: localStorage (from previous registration)
  try {
    const storedEmail = localStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY);
    if (storedEmail) {
      return storedEmail;
    }
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
  }
  
  return '';
};

/**
 * Store email in localStorage for future use
 */
const storeEmail = (email) => {
  if (!email) return;
  
  try {
    localStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, email);
  } catch (error) {
    console.warn('Failed to store email in localStorage:', error);
  }
};

/**
 * Clear stored email from localStorage
 */
const clearStoredEmail = () => {
  try {
    localStorage.removeItem(PENDING_VERIFICATION_EMAIL_KEY);
  } catch (error) {
    console.warn('Failed to clear email from localStorage:', error);
  }
};

/**
 * EmailVerifyInstruction - Modern SaaS-Level Design
 * 
 * Production-ready email verification instruction page with Material-UI.
 * Features company branding, smooth animations, and best practices.
 * Robust email handling from multiple sources with localStorage management.
 */
const EmailVerifyInstruction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(true);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Get email from multiple sources with priority and store it
  const email = useMemo(() => {
    const emailFromSources = getEmailFromSources(location, searchParams);
    
    // If we got email from sources, store it
    if (emailFromSources) {
      storeEmail(emailFromSources);
      return emailFromSources;
    }
    
    // Otherwise, get from localStorage
    try {
      const storedEmail = localStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY);
      if (storedEmail) {
        return storedEmail;
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }
    
    return '';
  }, [location, searchParams]);

  // Set verification email when email is available
  useEffect(() => {
    if (email) {
      setVerificationEmail(email);
    }
  }, [email]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown timer
  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isCounting]);

  // Resend verification email mutation
  const resendMutation = useMutation({
    mutationFn: (emailToResend) => {
      if (!emailToResend || !emailToResend.trim()) {
        throw new Error('Email address is required');
      }
      return resendVerificationEmail(emailToResend.trim());
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Verification email sent successfully!');
      setCountdown(60);
      setIsCounting(true);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 
        'Failed to resend verification email. Please try again later.';
      toast.error(errorMessage);
    },
  });

  const handleResendEmail = useCallback(() => {
    if (isCounting || resendMutation.isLoading) return;
    
    // Use the stored verification email
    if (!verificationEmail || !verificationEmail.trim()) {
      toast.error('Email address not found. Please register again.');
      return;
    }
    
    resendMutation.mutate(verificationEmail);
  }, [isCounting, resendMutation, verificationEmail]);

  const handleGoHome = useCallback(() => {
    // Clear stored email when navigating away (user can re-enter if needed)
    // Note: We keep it in case they come back, but clear on successful login
    navigate('/');
  }, [navigate]);

  // Clear stored email when user successfully logs in (listen for auth events)
  useEffect(() => {
    const handleAuthSuccess = () => {
      clearStoredEmail();
    };
    
    window.addEventListener('auth:login', handleAuthSuccess);
    window.addEventListener('auth:success', handleAuthSuccess);
    
    return () => {
      window.removeEventListener('auth:login', handleAuthSuccess);
      window.removeEventListener('auth:success', handleAuthSuccess);
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 50%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in={mounted} timeout={800}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              <Stack spacing={4} alignItems="center">
                {/* Logo */}
                <Zoom in={mounted} timeout={1000}>
                  <Box
                    component="img"
                    src={AECUSLogo}
                    alt="AECUS"
                    sx={{
                      width: { xs: 120, sm: 140 },
                      height: 'auto',
                      opacity: 0.95,
                    }}
                  />
                </Zoom>

                {/* Email Icon */}
                <Zoom in={mounted} timeout={1200}>
                  <Box
                    sx={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 100 },
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    <MarkEmailReadIcon
                      sx={{
                        fontSize: { xs: 40, sm: 50 },
                        color: 'white',
                      }}
                    />
                  </Box>
                </Zoom>

                {/* Title */}
                <Fade in={mounted} timeout={1400}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h4"
                      component="h1"
                      sx={{
                        fontSize: { xs: '1.75rem', sm: '2rem' },
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 1.5,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                      }}
                    >
                      Verify Your Email
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '0.9375rem', sm: '1rem' },
                        color: alpha(theme.palette.text.primary, 0.7),
                        lineHeight: 1.6,
                        maxWidth: '480px',
                        mx: 'auto',
                      }}
                    >
                      We have sent an email for your account verification to{' '}
                      {verificationEmail ? (
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                          }}
                        >
                          {verificationEmail}
                        </Typography>
                      ) : (
                        'your email address'
                      )}
                      .
                      <br />
                      <br />
                      Please check your inbox and click the verification link to activate your account.
                    </Typography>
                  </Box>
                </Fade>

                {/* Info Alert */}
                <Fade in={mounted} timeout={1600}>
                  <Alert
                    icon={<EmailIcon />}
                    severity="info"
                    sx={{
                      width: '100%',
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.info.main, 0.08),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                      '& .MuiAlert-icon': {
                        color: theme.palette.info.main,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        color: theme.palette.text.secondary,
                      }}
                    >
                      <strong>Didn't receive the email?</strong> Check your spam folder or click the button below to resend.
                    </Typography>
                  </Alert>
                </Fade>

                {/* Resend Button */}
                <Fade in={mounted} timeout={1800}>
                  <LoadingButton
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleResendEmail}
                    disabled={isCounting}
                    loading={resendMutation.isLoading}
                    loadingPosition="start"
                    startIcon={
                      resendMutation.isLoading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <RefreshIcon />
                      )
                    }
                    sx={{
                      py: 1.5,
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-2px)',
                      },
                      '&:disabled': {
                        background: alpha(theme.palette.text.secondary, 0.12),
                        color: alpha(theme.palette.text.secondary, 0.4),
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {isCounting
                      ? `Resend in ${countdown}s`
                      : 'Resend Verification Email'}
                  </LoadingButton>
                </Fade>

                {/* Back to Home Button */}
                <Fade in={mounted} timeout={2000}>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={handleGoHome}
                    startIcon={<HomeIcon />}
                    sx={{
                      py: 1.25,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      borderColor: alpha(theme.palette.divider, 0.3),
                      color: theme.palette.text.secondary,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    Back to Home
                  </Button>
                </Fade>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </Box>
  );
};

export default EmailVerifyInstruction;