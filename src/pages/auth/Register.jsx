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
  TrendingUp as TrendingUpIcon,
  VerifiedUser as VerifiedUserIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon,
  School as SchoolIcon,
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
        const authResult = await googleAuth(response.access_token, { termsAndConditionsAccepted: true });
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
    // Terms validation is now handled in the RegisterForm component
    setLoadingMessage('Creating your account...');
    setIsLoading(true);
    registerUser(formData);
  };

  const handleGoogleRegister = () => {
    // Terms validation is now handled in the RegisterForm component
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
      icon: <VerifiedUserIcon color="primary" />,
      title: "Independent Onboarding",
      description: "Complete your certification and document verification without relying on an institution."
    },
    {
      icon: <AssignmentTurnedInIcon color="primary" />,
      title: "Automated Checks",
      description: "Streamlined CV, reference, and residency verification through our automated system."
    },
    {
      icon: <WorkIcon color="primary" />,
      title: "Professional Profile",
      description: "Build a trusted profile with your skills, certifications, and work history, ready to share with clients."
    },
    {
      icon: <ScheduleIcon color="primary" />,
      title: "Shift & Timesheet Management",
      description: "Track your shifts, manage timesheets, and log progress notes all in one place."
    },
    {
      icon: <PeopleIcon color="primary" />,
      title: "Client Connections",
      description: "Get discovered by clients looking for qualified support workers, no middleman required."
    },
    {
      icon: <TrendingUpIcon color="primary" />,
      title: "Career Growth",
      description: "Showcase your expertise, gain visibility, and unlock more opportunities as you grow."
    },
    {
      icon: <LockIcon color="primary" />,
      title: "Secure & Trusted",
      description: "Your data and certifications are protected on a safe, compliant platform."
    },
    {
      icon: <SchoolIcon color="primary" />,
      title: "Ongoing Learning",
      description: "Stay updated with care practices and add new skills to strengthen your profile."
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        bgcolor: '#f6f7f9',
        background: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern (disabled for cleaner look) */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'none',
          pointerEvents: 'none',
          zIndex: 0,
          display: 'none'
        }}
      />
      
      {/* Floating Elements (removed for minimal design) */}
      <Box
        sx={{
          display: 'none'
        }}
      />
      
      <Box
        sx={{
          display: 'none'
        }}
      />
      {/* Left Side - Benefits */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 5 },
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
          color: '#0f172a',
          position: 'relative',
          zIndex: 1,
          order: isMobile ? 2 : 1,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ mb: 5, position: 'relative', zIndex: 2 }}>
          <Typography 
            variant={isMobile ? 'h4' : 'h2'} 
            component="h1"
            sx={{ 
              fontWeight: 800,
              mb: 1.5,
              color: '#0f172a',
              fontSize: { xs: '1.6rem', sm: '2.2rem', md: '2.6rem' },
              letterSpacing: '-0.02em'
            }}
          >
            Join Our Support Worker Community
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'}
            sx={{ 
              color: '#475569',
              fontWeight: 500,
              lineHeight: 1.5
            }}
          >
            Start your journey to make a meaningful difference in people's lives
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3, md: 3 },
            mb: 5,
            bgcolor: '#ffffff',
            borderLeft: '4px solid #2563eb',
            borderRadius: 2,
            border: '1px solid #e5e7eb',
            position: 'relative',
            zIndex: 2
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#0f172a', 
              fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem' },
              fontWeight: 500,
              lineHeight: 1.6
            }}
          >
            "The best way to find yourself is to lose yourself in the service of others."
          </Typography>
          <Typography 
            variant="caption" 
            component="footer" 
            display="block" 
            sx={{ 
              mt: 1.5, 
              color: '#64748b',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            — Mahatma Gandhi
          </Typography>
        </Paper>

        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5, md: 3 },
                  height: '100%',
                  bgcolor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  position: 'relative',
                  zIndex: 2,
                  overflow: 'hidden'
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={{ xs: 2, sm: 2.5 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#eef2ff',
                      width: { xs: 48, sm: 52, md: 56 }, 
                      height: { xs: 48, sm: 52, md: 56 },
                      boxShadow: 'none'
                    }}
                  >
                    {benefit.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={700} 
                      sx={{ 
                        color: '#0f172a', 
                        mb: 0.5,
                        fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' }
                      }}
                    >
                      {benefit.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b', 
                        lineHeight: 1.6,
                        fontSize: { xs: '0.82rem', sm: '0.9rem', md: '0.95rem' }
                      }}
                    >
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        </Box>

      {/* Right Side - Form */
      }
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 5 },
          bgcolor: 'transparent',
          position: 'relative',
          zIndex: 1,
          order: isMobile ? 1 : 2,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'none',
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ mb: 5, textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <Avatar
            src={Logo}
            alt="AECUS Logo"
            sx={{
              width: { xs: 140, sm: 180, md: 200 },
              height: 'auto',
              maxWidth: 260,
              mx: 'auto',
              mb: 1,
              filter: 'none'
            }}
            variant="square"
          />
         
        </Box>

        {errorMessage && (
          <Fade in={!!errorMessage}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: '#fff1f2',
                color: '#b91c1c',
                p: { xs: 2, sm: 2.5 },
                mb: 4,
                borderRadius: 2,
                border: '1px solid #fecdd3',
                position: 'relative',
                zIndex: 2
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '0.95rem' },
                  lineHeight: 1.5
                }}
              >
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
          setTermsError={setTermsError}
        />

        <Box sx={{ mt: 5, textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              bgcolor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 2
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#475569', 
                fontWeight: 500,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Already have an account?{' '}
              <Link 
                href="/login" 
                sx={{ 
                  color: '#2563eb',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#1d4ed8'
                  }
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;