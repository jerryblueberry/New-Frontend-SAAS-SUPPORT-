import { useState, useMemo } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { toast } from 'react-toastify'
import {
  Box,
  Grid,
  Typography,
  Paper,
  Avatar,
  Fade,
  Link,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { VerifiedUser as VerifiedUserIcon, Business as BusinessIcon, Security as SecurityIcon, Groups as GroupsIcon } from '@mui/icons-material'
import { useAuth } from '../../../hooks/useAuth'
import { registerClient, googleAuthClient } from '../../../api/auth'
import RegisterForm from '../../../components/auth/RegisterForm'
import Logo from '../../../assets/aecus-logo.png'

const ClientRegister = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState('')

  const { mutate: registerAsClient, error: registerError } = useMutation({
    mutationFn: registerClient,
    onSuccess: (data) => {
      toast.success('Client account created! Please verify your email.')
      navigate('/verify-email-instructions', {
        state: { email: data.email, verificationUrl: data.verificationUrl }
      })
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed'
      if (error.response?.status === 409 && message === 'Email already in use') {
        toast.error('This email is already registered. Please use a different email.')
      } else {
        toast.error(message)
      }
      setIsLoading(false)
    }
  })

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (response) => {
      setLoadingMessage('Connecting with Google...')
      setIsLoading(true)
      try {
        const authResult = await googleAuthClient(response.access_token, { termsAndConditionsAccepted: true })
        await signIn(authResult.data, true, true)
        navigate('/onboarding', { replace: true })
      } catch (error) {
        console.error('Google auth failed:', error)
        toast.error(error.message || 'Google authentication failed')
        setIsLoading(false)
      }
    },
    onError: (error) => {
      console.error('Google login error:', error)
      toast.error(error.message || 'Google login failed')
      setIsLoading(false)
    },
  })

  const handleRegister = (formData) => {
    setLoadingMessage('Creating your client account...')
    setIsLoading(true)
    // Explicitly pass role as client to the API
    registerAsClient({ 
      ...formData, 
      role: 'client' // Explicitly set role as client
    })
  }

  const handleGoogleRegister = () => {
    googleLogin()
  }

  const errorMessage = useMemo(() => {
    if (registerError) {
      const message = registerError.response?.data?.message || 'Registration failed'
      if (registerError.response?.status === 409 && message === 'Email already in use') {
        return 'This email is already registered. Please use a different email.'
      }
      return message
    }
    return null
  }, [registerError])

  const benefits = [
    {
      icon: <GroupsIcon color="primary" />,
      title: 'Find Vetted Support Workers',
      description: 'Discover and onboard verified workers matched to your care needs.'
    },
    {
      icon: <VerifiedUserIcon color="primary" />,
      title: 'Trust & Compliance',
      description: 'Profiles include checks, certifications, references, and history.'
    },
    {
      icon: <BusinessIcon color="primary" />,
      title: 'Simple Management',
      description: 'Manage bookings, timesheets, and communication in one place.'
    },
    {
      icon: <SecurityIcon color="primary" />,
      title: 'Secure by Design',
      description: 'Privacy-first platform with secure authentication and data handling.'
    }
  ]

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        bgcolor: '#f6f7f9',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Left - Value props for clients */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 5 },
          background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
          color: '#0f172a',
          order: isMobile ? 2 : 1
        }}
      >
        <Box sx={{ mb: 5 }}>
          <Typography variant={isMobile ? 'h4' : 'h2'} component="h1" sx={{ fontWeight: 800, mb: 1.5 }}>
            Create a Client Account
          </Typography>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: '#475569', fontWeight: 500 }}>
            Hire trusted support workers and manage care seamlessly
          </Typography>
        </Box>
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5, md: 3 }, bgcolor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
                <Box display="flex" alignItems="flex-start" gap={{ xs: 2, sm: 2.5 }}>
                  <Avatar sx={{ bgcolor: '#eef2ff' }}>{benefit.icon}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Right - Form */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          p: { xs: 3, sm: 4, md: 5 },
          order: isMobile ? 1 : 2
        }}
      >
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Avatar src={Logo} alt="AECUS Logo" sx={{ width: { xs: 140, sm: 180, md: 200 }, height: 'auto', mx: 'auto', mb: 1 }} variant="square" />
        </Box>

        {errorMessage && (
          <Fade in={!!errorMessage}>
            <Paper elevation={0} sx={{ bgcolor: '#fff1f2', color: '#b91c1c', p: { xs: 2, sm: 2.5 }, mb: 4, borderRadius: 2, border: '1px solid #fecdd3' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
          // Hint to the form for labeling or defaults if it supports it
          roleHint="client"
        />

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
            <Typography variant="body1" sx={{ color: '#475569', fontWeight: 500 }}>
              Already have an account?{' '}
              <Link href="/login" sx={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Sign in
              </Link>
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default ClientRegister