import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import RegisterForm from '../../components/auth/RegisterForm';
import { register, googleAuth } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Button, 
  Divider, 
  useTheme, 
  useMediaQuery,
  Avatar,
  Fade,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link
} from '@mui/material';
import {
  People as PeopleIcon,
  Handshake as HandshakeIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
  Security as SecurityIcon,
  Lightbulb as LightbulbIcon,
  Google as GoogleIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import Logo from '../../assets/aecus-logo.png';
import { useState, useMemo } from 'react';

const Register = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState('');

  // Regular email/password registration mutation
  const { mutate: registerUser, error: registerError } = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      toast.success('Account created successfully! Please verify your email.');
      navigate('/verify-email-instructions', { 
        state: { email: data.email, verificationUrl: data.verificationUrl } 
      });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed';
      if (error.response?.status === 400 && message === 'Email already in use') {
        toast.error('This email is already registered. Please use a different email.');
      } else {
        toast.error(message);
      }
      setIsLoading(false);
    }
  });

  // Google registration/login mutation
  const { mutate: googleSignup, error: googleError } = useMutation({
    mutationFn: googleAuth,
    onSuccess: async (data) => {
      toast.success('Successfully connected with Google!');
      try {
        await signIn(data.data, true, true);
        navigate('/onboarding');
      } catch (error) {
        toast.error('Failed to sign in after Google authentication');
        setIsLoading(false);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Google authentication failed');
      setIsLoading(false);
    }
  });

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (response) => {
      setLoadingMessage('Connecting with Google...');
      setIsLoading(true);
      try {
        const authResult = await googleAuth(response.access_token);
        await signIn(authResult.data, true, true);
        navigate('/onboarding');
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
    if (!termsAccepted) {
      setTermsError('You must agree to the Terms and Conditions to register.');
      return;
    }
    setLoadingMessage('Creating your account...');
    setIsLoading(true);
    registerUser(formData);
  };

  const handleGoogleRegister = () => {
    if (!termsAccepted) {
      setTermsError('You must agree to the Terms and Conditions to register.');
      return;
    }
    
    googleLogin();
  };

  const errorMessage = useMemo(() => {
    if (registerError) {
      const message = registerError.response?.data?.message || 'Registration failed';
      if (registerError.response?.status === 400 && message === 'Email already in use') {
        return 'This email is already registered. Please use a different email.';
      }
      return message;
    }
    if (googleError) {
      return googleError.response?.data?.message || 'Google authentication failed';
    }
    return null;
  }, [registerError, googleError]);

  const benefits = [
    {
      icon: <PeopleIcon color="primary" />,
      title: 'Connect with Clients',
      description: 'Build meaningful relationships with those who need your support'
    },
    {
      icon: <HandshakeIcon color="primary" />,
      title: 'Flexible Work',
      description: 'Choose your own schedule and work on your terms'
    },
    {
      icon: <TrendingUpIcon color="primary" />,
      title: 'Career Growth',
      description: 'Access training and development opportunities'
    },
    {
      icon: <FavoriteIcon color="primary" />,
      title: 'Make an Impact',
      description: 'Create positive change in people\'s lives every day'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Secure Platform',
      description: 'Work with confidence on our trusted platform'
    },
    {
      icon: <LightbulbIcon color="primary" />,
      title: 'Continuous Learning',
      description: 'Stay updated with the latest care practices'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: isMobile ? 0 : 4
      }}
    >
      <Paper
        elevation={isMobile ? 0 : 8}
        sx={{
          width: '100%',
          maxWidth: 1200,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          borderRadius: isMobile ? 0 : theme.shape.borderRadius * 2
        }}
      >
        {/* Left Side - Benefits */}
        <Box
          sx={{
            flex: 1.2,
            bgcolor: 'primary.dark',
            p: isMobile ? 3 : 4,
            color: 'common.white',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              component="h1"
              sx={{ 
                fontWeight: 800,
                mb: 1,
                background: `linear-gradient(to right, ${theme.palette.common.white}, ${theme.palette.grey[300]})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Join Our Support Worker Community
            </Typography>
            <Typography 
              variant="subtitle1"
              sx={{ opacity: 0.9 }}
            >
              Start your journey to make a difference in people's lives
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 4,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderLeft: `4px solid ${theme.palette.secondary.main}`
            }}
          >
            <Typography variant="body1" fontStyle="italic">
              "The best way to find yourself is to lose yourself in the service of others."
            </Typography>
            <Typography variant="caption" component="footer" display="block" sx={{ mt: 1 }}>
              — Mahatma Gandhi
            </Typography>
          </Paper>

          <Grid container spacing={2}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      bgcolor: 'rgba(255, 255, 255, 0.15)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                      {benefit.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {benefit.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Right Side - Form */}
        <Box
          sx={{
            flex: 1,
            p: isMobile ? 3 : 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: 'background.paper'
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Avatar
              src={Logo}
              alt="AECUS Logo"
              sx={{
                width: 240,
                height: 'auto',
                maxWidth: 320,
                mx: 'auto',
                mb: 2,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              variant="square"
            />
            <Typography variant="h5" component="h2" fontWeight={700} gutterBottom fontFamily={'sans-serif'} color='#9d82db'>
              Create Your Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join our community of support workers
            </Typography>
          </Box>

          {errorMessage && (
            <Fade in={!!errorMessage}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'error.light',
                  color: 'error.dark',
                  p: 2,
                  mb: 3,
                  borderRadius: 1
                }}
              >
                <Typography variant="body2">
                  {errorMessage}
                </Typography>
              </Paper>
            </Fade>
          )}

          <RegisterForm 
            onSubmit={handleRegister}
            onGoogleRegister={handleGoogleRegister}
            loading={isLoading}
            loadingMessage={loadingMessage}
            error={errorMessage}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
            termsError={termsError}
          />

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link 
                href="/login" 
                color="primary"
                fontWeight={600}
                underline="hover"
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Register;