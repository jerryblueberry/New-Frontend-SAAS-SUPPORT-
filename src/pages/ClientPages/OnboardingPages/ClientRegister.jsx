import { useState, useMemo, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  alpha,
  Fade,
  Zoom,
  Divider,
} from '@mui/material';
import { 
  GroupsOutlined, 
  CalendarMonthOutlined, 
  HealthAndSafetyOutlined, 
  SecurityOutlined,
  AssessmentOutlined,
  VerifiedUserOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';
import { registerClient, googleAuthClient } from '../../../api/auth';
import RegisterForm from '../../../components/auth/RegisterForm';
import AECUSLogo from '../../../assets/aecus-logo.png';

const ClientRegister = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate: registerAsClient, error: registerError } = useMutation({
    mutationFn: registerClient,
    onSuccess: (response) => {
      toast.success('Client account created! Please verify your email.');
      
      // Store email in localStorage for verification page
      const emailToStore = response.data?.user?.email || response.data?.data?.user?.email;
      const verificationUrl = response.data?.verificationUrl || response.data?.data?.verificationUrl;
      
      if (emailToStore) {
        try {
          localStorage.setItem('pending_verification_email', emailToStore);
        } catch (error) {
          console.warn('Failed to store email in localStorage:', error);
        }
      }
      
      navigate('/verify-email-instructions', {
        state: { email: emailToStore, verificationUrl }
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed';
      if (error.response?.status === 409 && message === 'Email already in use') {
        toast.error('This email is already registered. Please use a different email.');
      } else {
        toast.error(message);
      }
      setIsLoading(false);
    }
  });

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (response) => {
      setLoadingMessage('Connecting with Google...');
      setIsLoading(true);
      try {
        const authResult = await googleAuthClient(response.access_token, { termsAndConditionsAccepted: true });
        await signIn(authResult.data, true, true);
        navigate('/client-onboarding', { replace: true });
      } catch (error) {
        console.error('Google auth failed:', error);
        toast.error(error.message || 'Google authentication failed');
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      toast.error(error.message || 'Google login failed');
      setIsLoading(false);
    },
  });

  const handleRegister = (formData) => {
    // Store email in localStorage before registration (as fallback)
    if (formData.email) {
      try {
        localStorage.setItem('pending_verification_email', formData.email.trim());
      } catch (error) {
        console.warn('Failed to store email in localStorage:', error);
      }
    }
    
    setLoadingMessage('Creating your client account...');
    setIsLoading(true);
    registerAsClient({ 
      ...formData, 
      role: 'client'
    });
  };

  const handleGoogleRegister = () => {
    googleLogin();
  };

  const errorMessage = useMemo(() => {
    if (registerError) {
      const message = registerError.response?.data?.message || 'Registration failed';
      if (registerError.response?.status === 409 && message === 'Email already in use') {
        return 'This email is already registered. Please use a different email.';
      }
      return message;
    }
    return null;
  }, [registerError]);

  const benefits = useMemo(() => [
    { icon: <GroupsOutlined />, text: 'Access verified support workers' },
    { icon: <CalendarMonthOutlined />, text: 'Flexible scheduling & booking' },
    { icon: <HealthAndSafetyOutlined />, text: 'Quality care assurance' },
    { icon: <AssessmentOutlined />, text: 'Easy management & reporting' },
    { icon: <VerifiedUserOutlined />, text: 'Background-checked professionals' },
    { icon: <SecurityOutlined />, text: 'Secure data & privacy protection' },
  ], []);

  const trustSignals = [
    'NDIS-ready platform',
    'Background-verified workers',
    'Healthcare-grade security',
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: '#fafafa', opacity: mounted ? 1 : 0, transition: 'opacity 0.8s' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 5, md: 6, lg: 10 }, alignItems: 'flex-start' }}>
          
          {/* Left: Trust & Value */}
          <Fade in={mounted} timeout={1000}>
            <Box sx={{ flex: { md: '0 0 45%' }, width: { xs: '100%', md: 'auto' } }}>
              <Stack spacing={4}>
                {/* Logo & Tagline */}
                <Box>
                  <Zoom in={mounted} timeout={1200}>
                    <Box component="img" src={AECUSLogo} alt="AECUS" sx={{ width: { xs: '140px', md: '160px' }, height: 'auto', mb: 3 }} />
                  </Zoom>
                  
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' }, fontWeight: 700, color: '#1a1a1a', mb: 1.5, lineHeight: 1.3 }}>
                    Access verified support workers with confidence
                  </Typography>
                  
                  <Typography variant="body1" sx={{ fontSize: { xs: '0.9375rem', md: '1rem' }, color: alpha('#000', 0.65), lineHeight: 1.6, fontWeight: 400 }}>
                    Connect with trusted, background-verified support workers. Manage care services with ease and confidence.
                  </Typography>
                </Box>

                {/* Key Benefits */}
                <Stack spacing={2}>
                  {benefits.map((benefit, index) => (
                    <Fade in={mounted} timeout={1200 + index * 100} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box sx={{ 
                          color: theme.palette.secondary.main, 
                          flexShrink: 0, 
                          mt: 0.25,
                          '& svg': { fontSize: '1.25rem' }
                        }}>
                          {benefit.icon}
                        </Box>
                        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: '#333', lineHeight: 1.5 }}>
                          {benefit.text}
                        </Typography>
                      </Box>
                    </Fade>
                  ))}
                </Stack>

                {/* Trust Signals */}
                <Box sx={{ pt: 2, borderTop: `1px solid ${alpha('#000', 0.08)}` }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                    <LockOutlined sx={{ fontSize: '1.125rem', color: alpha('#000', 0.5) }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: alpha('#000', 0.6), fontWeight: 600, display: 'block', mb: 0.5 }}>
                        Trusted Healthcare Platform
                      </Typography>
                      {trustSignals.map((signal, index) => (
                        <Typography key={index} variant="caption" sx={{ fontSize: '0.75rem', color: alpha('#000', 0.5), display: 'block', lineHeight: 1.6 }}>
                          • {signal}
                        </Typography>
                      ))}
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Fade>

          {/* Right: Registration Form */}
          <Zoom in={mounted} timeout={isMobile ? 800 : 1100}>
            <Box sx={{ flex: 1, width: '100%', maxWidth: { xs: '100%', sm: '480px', md: '100%' }, mx: { xs: 'auto', md: 0 } }}>
              <Box sx={{ 
                bgcolor: '#ffffff', 
                borderRadius: 2, 
                p: { xs: 3, sm: 4 }, 
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
                border: `1px solid ${alpha('#000', 0.06)}`
              }}>
                {/* Form Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                    Create your client account
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem', color: alpha('#000', 0.6) }}>
                    Start accessing quality care services
                  </Typography>
                </Box>

                {/* Error Message */}
                {errorMessage && (
                  <Fade in={!!errorMessage}>
                    <Box sx={{ mb: 3, p: 1.5, borderRadius: 1.5, bgcolor: alpha('#dc2626', 0.08), border: `1px solid ${alpha('#dc2626', 0.2)}` }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500, color: '#b91c1c', lineHeight: 1.5 }}>
                        {errorMessage}
                      </Typography>
                    </Box>
                  </Fade>
                )}

                {/* Form */}
                <RegisterForm
                  onSubmit={handleRegister}
                  onGoogleRegister={handleGoogleRegister}
                  loading={isLoading}
                  loadingMessage={loadingMessage}
                  error={errorMessage}
                  termsAccepted={termsAccepted}
                  onTermsChange={setTermsAccepted}
                  termsError={termsError}
                  setTermsError={setTermsError}
                  roleHint="client"
                />

                {/* Footer Links */}
                <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha('#000', 0.06)}` }}>
                  <Stack spacing={1.5} alignItems="center">
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: alpha('#000', 0.6), textAlign: 'center' }}>
                      Already have an account?{' '}
                      <RouterLink to="/client/login" style={{ color: theme.palette.secondary.main, fontWeight: 600, textDecoration: 'none' }}>
                        Sign in
                      </RouterLink>
                    </Typography>
                    
                    <Divider sx={{ width: '100%', maxWidth: '60px', borderColor: alpha('#000', 0.12) }} />
                    
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: alpha('#000', 0.5), textAlign: 'center' }}>
                      Are you a support worker?{' '}
                      <RouterLink to="/login" style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: 'none' }}>
                        Worker login
                      </RouterLink>
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Zoom>
        </Box>
      </Container>
    </Box>
  );
};

export default ClientRegister;
