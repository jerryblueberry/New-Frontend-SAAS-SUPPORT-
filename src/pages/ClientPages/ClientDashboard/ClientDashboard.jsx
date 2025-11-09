import React, { useEffect, useMemo, useState } from 'react'
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
  Stack,
  useTheme,
  useMediaQuery,
  Tooltip
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
  RadioButtonUnchecked,
  Pending,
  Verified,
  Lock,
  HourglassEmpty,
  AttachMoney,
  Warning
} from '@mui/icons-material'
import { useAuth } from '../../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getClientProfile } from '../../../api/clientProfile'

const ClientDashboard = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()

  const { user } = useAuth()

  const [activeStep, setActiveStep] = useState(0)
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
    'Care Preferences'
  ]
  
  const { data: profileResp } = useQuery({
    queryKey: ['clientProfile'],
    queryFn: async () => {
      const res = await getClientProfile()
      return res.data?.profile || null
    },
    staleTime: 5 * 60 * 1000,
  })

  const progressPercentage = useMemo(() => {
    if (profileResp?.profileCompleteness?.percentage != null) {
      return profileResp.profileCompleteness.percentage
    }
    return (activeStep / onboardingSteps.length) * 100
  }, [profileResp, activeStep])

  const isProfileComplete = useMemo(() => {
    return progressPercentage === 100
  }, [progressPercentage])

  const profileStatus = useMemo(() => {
    return profileResp?.status || 'draft'
  }, [profileResp])

  const isUnderVerification = useMemo(() => {
    return profileStatus === 'submitted'
  }, [profileStatus])

  const isVerified = useMemo(() => {
    return profileStatus === 'verified' || profileStatus === 'active'
  }, [profileStatus])

  useEffect(() => {
    if (profileResp?.progressStep) {
      // Convert 1-based backend step to 0-based UI step
      const backendStep = Math.max(1, Math.min(2, profileResp.progressStep))
      setActiveStep(backendStep - 1)
    }
  }, [profileResp])

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      draft: {
        label: 'Draft',
        color: 'default',
        icon: <Description />,
        message: 'Your profile is saved as draft. Complete all steps to submit for review.',
        bgColor: 'grey.50',
        textColor: 'text.secondary',
        severity: 'info'
      },
      submitted: {
        label: 'Under Verification',
        color: 'warning',
        icon: <HourglassEmpty />,
        message: 'Your profile has been submitted and is awaiting admin verification. We will notify you once verified.',
        bgColor: 'warning.50',
        textColor: 'warning.dark',
        severity: 'warning'
      },
      verified: {
        label: 'Verified',
        color: 'success',
        icon: <Verified />,
        message: 'Your profile has been verified by admin. You can now access all features.',
        bgColor: 'success.50',
        textColor: 'success.dark',
        severity: 'success'
      },
      active: {
        label: 'Active',
        color: 'success',
        icon: <CheckCircle />,
        message: 'Your profile is active and ready for service matching.',
        bgColor: 'success.50',
        textColor: 'success.dark',
        severity: 'success'
      }
    }
    return configs[status] || configs.draft
  }

  const statusConfig = getStatusConfig(profileStatus)

  // Calculate real-time stats from profile data
  const quickStats = useMemo(() => {
    const engagement = profileResp?.engagementMetrics || {}
    const documents = profileResp?.documents || []
    const carePlan = profileResp?.carePlanSummary || {}
    
    // Calculate document stats
    const totalDocuments = documents.length
    const verifiedDocuments = documents.filter(doc => doc.verified).length
    const pendingDocuments = documents.filter(doc => !doc.verified).length
    const expiringSoon = documents.filter(doc => {
      if (!doc.expiresAt) return false
      const daysUntilExpiry = Math.ceil((new Date(doc.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }).length
    
    // Calculate care plan budget percentage
    const budgetUsed = carePlan.totalBudget && carePlan.usedBudget 
      ? Math.round((carePlan.usedBudget / carePlan.totalBudget) * 100)
      : 0
    
    return [
      { 
        icon: <Schedule sx={{ fontSize: 40 }} />, 
        value: engagement.jobsActive?.toString() || '0', 
        label: 'Active Jobs', 
        color: '#3f51b5',
        tooltip: 'Number of active job postings'
      },
      { 
        icon: <CalendarToday sx={{ fontSize: 40 }} />, 
        value: engagement.totalLogins?.toString() || '0', 
        label: 'Total Logins', 
        color: '#9c27b0',
        tooltip: 'Total number of times you\'ve logged in'
      },
      { 
        icon: <Description sx={{ fontSize: 40 }} />, 
        value: `${verifiedDocuments}/${totalDocuments}`, 
        label: 'Documents', 
        color: totalDocuments > 0 && pendingDocuments > 0 ? '#ff9800' : '#00bcd4',
        tooltip: `${verifiedDocuments} verified, ${pendingDocuments} pending${expiringSoon > 0 ? `, ${expiringSoon} expiring soon` : ''}`
      },
      { 
        icon: <TrendingUp sx={{ fontSize: 40 }} />, 
        value: carePlan.totalBudget ? `${budgetUsed}%` : 'N/A', 
        label: 'Budget Used', 
        color: budgetUsed > 80 ? '#f44336' : budgetUsed > 50 ? '#ff9800' : '#4caf50',
        tooltip: carePlan.totalBudget 
          ? `$${carePlan.usedBudget?.toLocaleString() || 0} of $${carePlan.totalBudget.toLocaleString()} used`
          : 'No care plan budget set'
      }
    ]
  }, [profileResp])

  // Generate dynamic action items based on profile data
  const upcomingTasks = useMemo(() => {
    const tasks = []
    const documents = profileResp?.documents || []
    const carePlan = profileResp?.carePlanSummary || {}
    const preferences = profileResp?.preferences || {}
    
    // Check for expiring documents
    documents.forEach(doc => {
      if (doc.expiresAt) {
        const daysUntilExpiry = Math.ceil((new Date(doc.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          tasks.push({
            title: `Renew ${doc.title || doc.type} Document`,
            status: daysUntilExpiry <= 7 ? 'urgent' : 'pending',
            time: daysUntilExpiry === 1 ? 'Due tomorrow' : `Due in ${daysUntilExpiry} days`,
            type: 'document',
            documentId: doc._id
          })
        }
      }
    })
    
    // Check for unverified documents
    const unverifiedDocs = documents.filter(doc => !doc.verified)
    if (unverifiedDocs.length > 0) {
      tasks.push({
        title: `${unverifiedDocs.length} Document${unverifiedDocs.length > 1 ? 's' : ''} Pending Verification`,
        status: 'pending',
        time: 'Awaiting admin review',
        type: 'verification'
      })
    }
    
    // Check for missing NDIS plan
    if (!carePlan.planStartDate || !carePlan.planEndDate) {
      tasks.push({
        title: 'Add NDIS Care Plan Details',
        status: 'pending',
        time: 'Optional but recommended',
        type: 'care-plan'
      })
    }
    
    // Check for missing support categories
    if (!preferences.supportCategories || preferences.supportCategories.length === 0) {
      tasks.push({
        title: 'Complete Care Preferences',
        status: 'pending',
        time: 'Required for job matching',
        type: 'preferences'
      })
    }
    
    // Default tasks if none generated
    if (tasks.length === 0) {
      tasks.push({
        title: 'All tasks completed!',
        status: 'completed',
        time: 'Great job keeping everything up to date',
        type: 'none'
      })
    }
    
    return tasks.slice(0, 5) // Limit to 5 tasks
  }, [profileResp])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <WorkerNavbar />

      {/* Layout container with sidebar */}
      <Box sx={{ display: 'flex', width: '100%' }}>
        <ClientSidebar topOffset={topOffset} navigate={navigate} />

        {/* Main content */}
        <Box sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
          minWidth: 0, // Prevents overflow
          pt: { xs: 10, md: 8.7 },
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }
        }}>
          <Box sx={{ 
            maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '1400px', xl: '1600px' }, 
            mx: 'auto',
            width: '100%'
          }}>
        
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
                {isProfileComplete 
                  ? isVerified 
                    ? 'Your profile is verified and ready for service matching'
                    : 'Your profile is under admin verification'
                  : "Let's complete your journey to personalized care"
                }
              </Typography>
            </Box>
            <Chip 
              label={statusConfig.label} 
              color={statusConfig.color}
              icon={statusConfig.icon}
              variant={isProfileComplete ? "filled" : "outlined"}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Paper>

        {/* Onboarding Progress Card - Show if incomplete */}
        {!isProfileComplete && (
          <Card elevation={0} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
              <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="700" gutterBottom>
                Complete Your Profile Setup
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {`Just ${Math.max(0, onboardingSteps.length - (activeStep + 1))} step${Math.max(0, onboardingSteps.length - (activeStep + 1)) !== 1 ? 's' : ''} away from your personalized care experience`}
              </Typography>

              {/* Progress Bar */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="600">Overall Progress</Typography>
                  <Typography variant="body2" fontWeight="600">{Math.round(progressPercentage)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                      bgcolor: progressPercentage === 100 ? 'success.main' : 'primary.main'
                    }
                  }}
                />
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
                    {index <= activeStep && profileResp?.profileCompleteness?.completedSteps?.[index === 0 ? 'basicInformation' : 'preferences'] ? (
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
                onClick={() => {
                  // Navigate to the next incomplete step
                  const nextStep = profileResp?.progressStep || 1
                  navigate(`/client-onboarding?step=${nextStep}`)
                }}
              >
                Continue Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Status Card - Show if profile is complete */}
        {isProfileComplete && (
          <Card elevation={0} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: statusConfig.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {React.cloneElement(statusConfig.icon, { 
                    sx: { color: `${statusConfig.color}.main`, fontSize: 32 } 
                  })}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="700" gutterBottom>
                    Profile Status: {statusConfig.label}
                  </Typography>
                  <Typography variant="body2" color={statusConfig.textColor} sx={{ mb: 2 }}>
                    {statusConfig.message}
                  </Typography>
                  {isUnderVerification && !isVerified && (
                    <Alert severity={statusConfig.severity} sx={{ mt: 1, borderRadius: 1 }}>
                      <Typography variant="body2">
                        Your profile is currently under admin review. This process typically takes 1-3 business days. 
                        You'll receive a notification once verification is complete.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </Box>

              {/* Progress Summary */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight="600">Profile Completion</Typography>
                  <Typography variant="body2" fontWeight="600">{Math.round(progressPercentage)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                      bgcolor: 'success.main'
                    }
                  }}
                />
              </Box>

              {/* Completed Steps */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>Completed Steps:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {onboardingSteps.map((step, index) => {
                    const stepKey = index === 0 ? 'basicInformation' : 'preferences'
                    const isCompleted = profileResp?.profileCompleteness?.completedSteps?.[stepKey]
                    return (
                      <Chip
                        key={step}
                        label={step}
                        size="small"
                        icon={isCompleted ? <CheckCircle /> : undefined}
                        color={isCompleted ? 'success' : 'default'}
                        variant={isCompleted ? 'filled' : 'outlined'}
                        sx={{ mb: 0.5 }}
                      />
                    )
                  })}
                </Stack>
              </Box>

              {/* Action Button based on status */}
              {isUnderVerification && !isVerified && (
                <Button 
                  variant="outlined"
                  fullWidth={isMobile}
                  sx={{ mt: 2, textTransform: 'none' }}
                  onClick={() => navigate('/client-onboarding')}
                >
                  View Profile
                </Button>
              )}
              {isVerified && (
                <Button 
                  variant="contained"
                  endIcon={<ChevronRight />}
                  fullWidth={isMobile}
                  sx={{ mt: 2, textTransform: 'none' }}
                  onClick={() => navigate('/client-onboarding')}
                >
                  Update Profile
                </Button>
              )}
              
              {/* Quick Navigation to Steps - Show when complete */}
              {isProfileComplete && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5, color: 'text.secondary' }}>
                    Quick Navigation:
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/client-onboarding?step=1')}
                      sx={{ textTransform: 'none', flex: 1 }}
                    >
                      Profile Setup
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/client-onboarding?step=2')}
                      sx={{ textTransform: 'none', flex: 1 }}
                    >
                      Care Preferences
                    </Button>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Grid */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3, lg: 3, xl: 4 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          {quickStats.map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} lg={3} xl={3} key={index}>
              <Tooltip title={stat.tooltip || stat.label} arrow>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 2, 
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                      borderColor: stat.color
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ color: stat.color, mr: 1 }}>
                        {stat.icon}
                      </Box>
                    </Box>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight="700" gutterBottom sx={{ color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {/* Care Plan Summary - Show if available */}
        {profileResp?.carePlanSummary?.totalBudget && (
          <Card elevation={0} sx={{ mb: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid #e5e7eb' }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ fontSize: 32, color: 'primary.main', mr: 1.5 }} />
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="700">
                  NDIS Care Plan Summary
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Budget
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="primary.main">
                    ${profileResp.carePlanSummary.totalBudget?.toLocaleString() || '0'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Used Budget
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="warning.main">
                    ${profileResp.carePlanSummary.usedBudget?.toLocaleString() || '0'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Remaining Budget
                  </Typography>
                  <Typography variant="h6" fontWeight="700" color="success.main">
                    ${(profileResp.carePlanSummary.totalBudget - (profileResp.carePlanSummary.usedBudget || 0)).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Budget Usage
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, Math.round(((profileResp.carePlanSummary.usedBudget || 0) / profileResp.carePlanSummary.totalBudget) * 100))}
                      sx={{
                        height: 8,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 1,
                          bgcolor: (profileResp.carePlanSummary.usedBudget || 0) / profileResp.carePlanSummary.totalBudget > 0.8 
                            ? 'error.main' 
                            : (profileResp.carePlanSummary.usedBudget || 0) / profileResp.carePlanSummary.totalBudget > 0.5
                            ? 'warning.main'
                            : 'success.main'
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {Math.round(((profileResp.carePlanSummary.usedBudget || 0) / profileResp.carePlanSummary.totalBudget) * 100)}% used
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {(profileResp.carePlanSummary.planStartDate || profileResp.carePlanSummary.planEndDate) && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e5e7eb' }}>
                  <Typography variant="body2" color="text.secondary">
                    Plan Period: {profileResp.carePlanSummary.planStartDate 
                      ? new Date(profileResp.carePlanSummary.planStartDate).toLocaleDateString() 
                      : 'Not set'} - {profileResp.carePlanSummary.planEndDate 
                      ? new Date(profileResp.carePlanSummary.planEndDate).toLocaleDateString() 
                      : 'Not set'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Items & Notifications Grid */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3, lg: 3, xl: 4 }}>
          {/* Action Items */}
          <Grid item xs={12} md={7} lg={7} xl={7}>
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
          <Grid item xs={12} md={5} lg={5} xl={5}>
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
