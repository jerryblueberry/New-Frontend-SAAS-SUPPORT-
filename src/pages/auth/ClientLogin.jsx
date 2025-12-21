import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuthClient } from '../../api/auth';
import Toast from '../../components/common/Toast';
import {
  Box,
  Container,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  Google as GoogleIcon,
  Groups,
  CalendarMonth,
  HealthAndSafety,
  Shield,
  Verified,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import AECUSLogo from '../../assets/aecus-logo.png';

const ClientLogin = () => {
  const emailInputRef = useRef(null);
  const googleButtonRef = useRef(null);
  
  const { signIn, authError, isAuthenticated, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [toast, setToast] = useState(null);
  const [lastErrorMessage, setLastErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const toastTimeoutRef = useRef(null);
  const shownErrorRef = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const from = useMemo(() =>
    location.state?.from?.pathname ||
    searchParams.get('returnTo') ||
    '/client-dashboard',
    [location.state?.from?.pathname, searchParams]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const showErrorToast = useCallback((message) => {
    if (message === lastErrorMessage && toast) return;
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setLastErrorMessage(message);
    const newToast = { message, type: 'error', duration: 4000, id: Date.now() };
    setToast(newToast);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      setLastErrorMessage('');
      toastTimeoutRef.current = null;
      shownErrorRef.current = null;
    }, newToast.duration);
  }, [lastErrorMessage, toast]);

  const hideToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
    setLastErrorMessage('');
    shownErrorRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (authError && authError.message) {
      const errorId = authError.message + (authError.response || '');
      if (shownErrorRef.current !== errorId) {
        shownErrorRef.current = errorId;
        showErrorToast('Invalid email or password. Please check your credentials and try again.');
        clearAuthError();
      }
    }
  }, [authError?.message, showErrorToast, clearAuthError]);

  const { isLoading, error: mutationError } = useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      clearAuthError();
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.log("Login error:", error);
      showErrorToast('Invalid email or password. Please check your credentials and try again.');
      setIsSubmitting(false);
    }
  });

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (response) => {
      setIsGoogleLoading(true);
      try {
        const authResult = await googleAuthClient(response.access_token, { termsAndConditionsAccepted: true });
        await signIn(authResult.data, true, true);
        clearAuthError();
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Google auth failed:', error);
        // Show specific error message from backend or user-friendly fallback
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Unable to sign in with Google. Please try again.';
        showErrorToast(errorMessage);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (error) => {
       console.error('Google login error:', error);
      showErrorToast('Google sign-in was cancelled or failed. Please try again.');
      setIsGoogleLoading(false);
    },
  });

  const handleLoginSubmit = useCallback(async (credentials, error) => {
    if (error) {
      showErrorToast('Please check your credentials and try again.');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try {
      // credentials already includes portal from LoginForm
      await signIn(credentials);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      // Show specific error message from backend or fallback
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Unable to sign in. Please try again.';
      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [signIn, navigate, from, showErrorToast]);

  const handleGoogleButtonClick = useCallback((e) => {
    e.preventDefault();
    googleLogin();
  }, [googleLogin]);

  const features = useMemo(() => [
    { icon: <Groups sx={{ fontSize: 20 }} />, text: 'Verified support workers' },
    { icon: <CalendarMonth sx={{ fontSize: 20 }} />, text: 'Flexible scheduling' },
    { icon: <HealthAndSafety sx={{ fontSize: 20 }} />, text: 'Quality care assurance' },
  ], []);

  return (
    <>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} duration={toast.duration} />}
      
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Subtle Gradient Background */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at top, ${alpha(theme.palette.secondary.main, 0.03)} 0%, transparent 50%)`, pointerEvents: 'none' }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 4, md: 8 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 6, md: 8, lg: 12 }, alignItems: 'center', justifyContent: 'center', maxWidth: '1200px', mx: 'auto' }}>
            
            {/* Left Side - Branding */}
            {!isMobile && (
              <Fade in={mounted} timeout={1200}>
                <Box sx={{ flex: 1, maxWidth: '480px' }}>
                  <Stack spacing={5}>
                    {/* Logo & Title */}
                    <Box>
                      <Zoom in={mounted} timeout={1400}>
                        <Box component="img" src={AECUSLogo} alt="AECUS" sx={{ width: '180px', height: 'auto', mb: 4, opacity: 0.92 }} />
                      </Zoom>
                      
                      <Typography variant="h1" sx={{ fontSize: { md: '2.5rem', lg: '3rem' }, fontWeight: 700, color: theme.palette.text.primary, mb: 2, lineHeight: 1.2, letterSpacing: '-0.04em' }}>
                        Client Care Portal
                      </Typography>
                      
                      <Typography variant="body1" sx={{ fontSize: '1.125rem', color: alpha(theme.palette.text.primary, 0.65), lineHeight: 1.7, fontWeight: 400 }}>
                        Access quality care services tailored to your needs.
                      </Typography>
                    </Box>

                    {/* Features */}
                    <Stack spacing={2}>
                      {features.map((feature, index) => (
                        <Zoom in={mounted} timeout={1600 + index * 100} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: alpha(theme.palette.secondary.main, 0.08), color: theme.palette.secondary.main, flexShrink: 0 }}>
                              {feature.icon}
                            </Box>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: theme.palette.text.primary }}>
                              {feature.text}
                            </Typography>
                          </Box>
                        </Zoom>
                      ))}
                    </Stack>

                    {/* Trust Indicators */}
                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', pt: 2 }}>
                      {[
                        { icon: <Shield sx={{ fontSize: 16 }} />, label: 'Secure' },
                        { icon: <Verified sx={{ fontSize: 16 }} />, label: 'Verified' },
                      ].map((badge, index) => (
                        <Zoom in={mounted} timeout={2000 + index * 100} key={index}>
                          <Chip icon={badge.icon} label={badge.label} size="small" sx={{ backgroundColor: alpha(theme.palette.text.primary, 0.04), color: alpha(theme.palette.text.primary, 0.7), fontWeight: 500, fontSize: '0.8125rem', border: 'none', height: 28 }} />
                        </Zoom>
                      ))}
                    </Box>
                  </Stack>
                </Box>
              </Fade>
            )}

            {/* Right Side - Login Form */}
            <Zoom in={mounted} timeout={isMobile ? 1000 : 1400}>
              <Box sx={{ flex: 1, width: '100%', maxWidth: { xs: '100%', sm: '420px' } }}>
                {/* Mobile Logo */}
                {isMobile && (
                  <Box sx={{ textAlign: 'center', mb: 5 }}>
                    <Box component="img" src={AECUSLogo} alt="AECUS" sx={{ width: '160px', height: 'auto', mb: 3, opacity: 0.92 }} />
                    <Typography variant="h4" sx={{ fontSize: '1.75rem', fontWeight: 700, color: theme.palette.text.primary, mb: 1, letterSpacing: '-0.02em' }}>
                      Client Care Portal
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.9375rem', color: alpha(theme.palette.text.primary, 0.6) }}>
                      Sign in to continue
                    </Typography>
                  </Box>
                )}

                {!isMobile && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontSize: '1.875rem', fontWeight: 700, color: theme.palette.text.primary, mb: 1, letterSpacing: '-0.02em' }}>
                      Welcome back
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.9375rem', color: alpha(theme.palette.text.primary, 0.6) }}>
                      Sign in to continue
                    </Typography>
                  </Box>
                )}

                <Box sx={{ background: '#ffffff', borderRadius: 0, border: 'none' }}>
                  <LoginForm onSubmit={handleLoginSubmit} setEmailInputRef={(el) => (emailInputRef.current = el)} loading={isLoading || isSubmitting} error={mutationError} portal="client" />

                  <Box sx={{ my: 3.5 }}>
                    <Divider sx={{ '&::before, &::after': { borderColor: alpha(theme.palette.divider, 0.12) } }}>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: alpha(theme.palette.text.primary, 0.4), textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em', px: 2 }}>
                        Or
                      </Typography>
                    </Divider>
                  </Box>

                  <LoadingButton fullWidth variant="outlined" onClick={handleGoogleButtonClick} disabled={isGoogleLoading || isLoading} loading={isGoogleLoading} size="large" startIcon={!isGoogleLoading && <GoogleIcon />} ref={googleButtonRef} sx={{ py: 1.5, fontSize: '0.9375rem', fontWeight: 600, borderRadius: 2, textTransform: 'none', borderWidth: '1.5px', borderColor: alpha(theme.palette.divider, 0.15), color: theme.palette.text.primary, background: 'transparent', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { borderWidth: '1.5px', borderColor: alpha(theme.palette.text.primary, 0.25), background: alpha(theme.palette.text.primary, 0.02) }, '&:active': { transform: 'scale(0.98)' } }}>
                    {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
                  </LoadingButton>

                  <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                    <Stack spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', color: alpha(theme.palette.text.primary, 0.55), textAlign: 'center' }}>
                        New to our platform?{' '}
                        <Typography component={Link} to="/client/register" sx={{ fontSize: 'inherit', fontWeight: 600, color: theme.palette.secondary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                          Sign up as client
                        </Typography>
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', color: alpha(theme.palette.text.primary, 0.55), textAlign: 'center' }}>
                        Are you a support worker?{' '}
                        <Typography component={Link} to="/login" sx={{ fontSize: 'inherit', fontWeight: 600, color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                          Worker login
                        </Typography>
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </Box>
            </Zoom>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ClientLogin;
