import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import {
  CheckCircle,
  Schedule,
  CalendarToday,
  Description,
  TrendingUp,
  ChevronRight,
  Person,
  Shield,
  EmojiEvents,
  Timeline,
  RadioButtonUnchecked
} from '@mui/icons-material'
import { useAuth } from '../../../context/AuthContext'

const ClientDashboard = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()

  const { user } = useAuth()

  const [activeStep, setActiveStep] = useState(2)
  const [topOffset, setTopOffset] = useState(64)

  useEffect(() => {
    const measureNavbar = () => {
      const headerEl = document.querySelector('.wrk-dashboard-header')
      if (headerEl) {
        setTopOffset(headerEl.getBoundingClientRect().height || 64)
      }
    }
    measureNavbar()
    window.addEventListener('resize', measureNavbar)
    return () => window.removeEventListener('resize', measureNavbar)
  }, [])

  const onboardingSteps = [
    'Profile Setup',
    'Document Upload',
    'Care Preferences',
    'Schedule Setup'
  ]

  const progressPercentage = (activeStep / onboardingSteps.length) * 100

  const quickStats = [
    { icon: <Schedule sx={{ fontSize: 40 }} />, value: '12', label: 'Hours This Week', color: '#3f51b5' },
    { icon: <CalendarToday sx={{ fontSize: 40 }} />, value: '3', label: 'Upcoming Sessions', color: '#9c27b0' },
    { icon: <Description sx={{ fontSize: 40 }} />, value: '8', label: 'Documents', color: '#00bcd4' },
    { icon: <TrendingUp sx={{ fontSize: 40 }} />, value: '94%', label: 'Goal Progress', color: '#4caf50' }
  ]

  const upcomingTasks = [
    { title: 'Upload NDIS Plan Document', status: 'urgent', time: 'Due in 2 days' },
    { title: 'Complete Health Assessment', status: 'pending', time: 'Due in 5 days' },
    { title: 'Set Care Preferences', status: 'pending', time: 'Due in 1 week' }
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <WorkerNavbar />

      {/* Layout container with sidebar */}
      <Box sx={{ display: 'flex' }}>
        <ClientSidebar topOffset={topOffset} navigate={navigate} />

        {/* Main content */}
        <Box sx={{
          flexGrow: 0.5,
        // width: '100%',

          pt: { xs: '12px', md: '12px' },
          px: { xs: 2, sm: 3, md: 0}
        }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        
        {/* Welcome Header */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2.5, sm: 3, md: 4 },
            mb: { xs: 2, sm: 3 },
            borderRadius: 2,
            bgcolor: 'background.paper',
            border: '1px solid #e5e7eb'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
            <Box>
              <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="700" gutterBottom>
                {`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}!`} 👋
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                Let's complete your journey to personalized care
              </Typography>
            </Box>
            <Chip label="Active Plan" variant="outlined" />
          </Box>
        </Paper>

        {/* Onboarding Progress Card */}
        <Card elevation={0} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid #e5e7eb' }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="700" gutterBottom>
              Complete Your Profile Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {`Just ${onboardingSteps.length - activeStep} steps away from your personalized care experience`}
            </Typography>

            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="600">Overall Progress</Typography>
                <Typography variant="body2" fontWeight="600">{Math.round(progressPercentage)}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progressPercentage} />
            </Box>

            {/* Stepper */}
            <Box sx={{ mt: 2 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {onboardingSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Mobile Stepper */}
            <Box sx={{ display: { xs: 'block', sm: 'none' }, mt: 2 }}>
              {onboardingSteps.map((label, index) => (
                <Box key={label} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  {index < activeStep ? (
                    <CheckCircle sx={{ color: 'success.main', mr: 1.5, fontSize: 24 }} />
                  ) : (
                    <RadioButtonUnchecked sx={{ color: 'text.secondary', mr: 1.5, fontSize: 24 }} />
                  )}
                  <Typography variant="body2">
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Button 
              variant="contained"
              endIcon={<ChevronRight />}
              fullWidth={isMobile}
              sx={{ mt: 2, textTransform: 'none' }}
            >
              Continue Setup
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          {quickStats.map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                  <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="700" gutterBottom>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Action Items & Notifications Grid */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {/* Action Items */}
          <Grid item xs={12} md={7}>
            <Card elevation={0} sx={{ borderRadius: 2, height: '100%', border: '1px solid #e5e7eb' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="700">
                    Action Items
                  </Typography>
                  <Chip 
                    label={`${upcomingTasks.length} pending`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {upcomingTasks.map((task, index) => (
                  <React.Fragment key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                      <Avatar sx={{ mr: 2, width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>
                        <Description fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight="600" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {task.time}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <ChevronRight />
                      </IconButton>
                    </Box>
                    {index < upcomingTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={5}>
            <Card elevation={0} sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6" fontWeight="700" gutterBottom sx={{ color: '#1a237e', mb: 3 }}>
                  Quick Actions
                </Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Person />}
                  sx={{ 
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#e0e7ff',
                    color: '#4f46e5',
                    textTransform: 'none',
                    fontWeight: 600,
                    justifyContent: 'flex-start',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      bgcolor: '#f5f7ff'
                    }
                  }}
                >
                  Find Support Worker
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CalendarToday />}
                  sx={{ 
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#e0e7ff',
                    color: '#4f46e5',
                    textTransform: 'none',
                    fontWeight: 600,
                    justifyContent: 'flex-start',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      bgcolor: '#f5f7ff'
                    }
                  }}
                >
                  Schedule Session
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Description />}
                  sx={{ 
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#e0e7ff',
                    color: '#4f46e5',
                    textTransform: 'none',
                    fontWeight: 600,
                    justifyContent: 'flex-start',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      bgcolor: '#f5f7ff'
                    }
                  }}
                >
                  View Documents
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Shield />}
                  sx={{ 
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#e0e7ff',
                    color: '#4f46e5',
                    textTransform: 'none',
                    fontWeight: 600,
                    justifyContent: 'flex-start',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      bgcolor: '#f5f7ff'
                    }
                  }}
                >
                  Update Preferences
                </Button>

                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: { xs: 20, sm: 24 }
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Your support coordinator will contact you within 24 hours
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ClientDashboard
