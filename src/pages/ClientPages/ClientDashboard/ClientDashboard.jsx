import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Paper,
  Avatar,
  IconButton,
  Alert,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Skeleton
} from '@mui/material'
import Stack from '@mui/material/Stack'
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
  Warning,
  Info
} from '@mui/icons-material'
import { useAuth } from '../../../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { getClientProfile } from '../../../api/clientProfile'

const ClientDashboard = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()

  const { user } = useAuth()

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
  
  const { data: profileResp, isLoading, isError, error } = useQuery({
    queryKey: ['clientProfile'],
    queryFn: async () => {
      const res = await getClientProfile()
      // Log raw API response
      console.log('🔵 [ClientDashboard] Raw API Response:', res)
      console.log('🔵 [ClientDashboard] Response Data:', res.data)
      console.log('🔵 [ClientDashboard] Profile Data:', res.data?.profile)
      return res.data?.profile || null
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  })

  // Log profile response whenever it changes
  useEffect(() => {
    if (profileResp) {
      console.log('🟢 [ClientDashboard] Profile Response:', profileResp)
      console.log('🟢 [ClientDashboard] Profile Status:', profileResp?.status)
      console.log('🟢 [ClientDashboard] Profile Completeness:', profileResp?.profileCompleteness)
      console.log('🟢 [ClientDashboard] Engagement Metrics:', profileResp?.engagementMetrics)
      console.log('🟢 [ClientDashboard] Documents:', profileResp?.documents)
      console.log('🟢 [ClientDashboard] Preferences:', profileResp?.preferences)
      console.log('🟢 [ClientDashboard] Account Type:', profileResp?.accountType)
    }
  }, [profileResp])

  // Simple completion status - no percentage
  const isProfileComplete = useMemo(() => {
    return profileResp?.profileCompleteness?.completedSteps?.basicInformation === true
  }, [profileResp])

  const profileStatus = useMemo(() => {
    return profileResp?.status || 'draft'
  }, [profileResp])

  const isUnderVerification = useMemo(() => {
    return profileStatus === 'submitted'
  }, [profileStatus])

  const isVerified = useMemo(() => {
    return profileStatus === 'verified' || profileStatus === 'active'
  }, [profileStatus])


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
    
    // Calculate document stats
    const totalDocuments = documents.length
    const verifiedDocuments = documents.filter(doc => doc.verified).length
    const pendingDocuments = documents.filter(doc => !doc.verified).length
    const expiringSoon = documents.filter(doc => {
      if (!doc.expiresAt) return false
      const daysUntilExpiry = Math.ceil((new Date(doc.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 30 && daysUntilExpiry > 0
    }).length
    
    const stats = [
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
      }
    ]
    
    console.log('📈 [ClientDashboard] Quick Stats:', stats)
    console.log('📈 [ClientDashboard] Engagement Metrics:', engagement)
    console.log('📈 [ClientDashboard] Document Stats:', {
      totalDocuments,
      verifiedDocuments,
      pendingDocuments,
      expiringSoon
    })
    
    return stats
  }, [profileResp])

  // Generate dynamic action items based on profile data
  const upcomingTasks = useMemo(() => {
    const tasks = []
    const documents = profileResp?.documents || []
    const preferences = profileResp?.preferences || {}
    const accountType = profileResp?.accountType || 'individual'
    
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
    
    // Preferences are optional; only prompt individuals
    if (accountType === 'individual' && (!preferences.supportCategories || preferences.supportCategories.length === 0)) {
      tasks.push({
        title: 'Complete Care Preferences',
        status: 'pending',
        time: 'Optional: Helps prefill job postings',
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
    
    const finalTasks = tasks.slice(0, 5) // Limit to 5 tasks
    console.log('✅ [ClientDashboard] Upcoming Tasks:', finalTasks)
    return finalTasks
  }, [profileResp])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <WorkerNavbar />
      {isError && (
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 1 }}>
          <Alert severity="error" sx={{ borderRadius: 1 }}>
            <Typography variant="body2">
              Failed to load your profile. Please refresh and try again.
            </Typography>
          </Alert>
        </Box>
      )}

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
        
        {/* Welcome Header - Redesigned */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3, sm: 4, md: 5 },
            mb: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              transform: 'translate(30%, -30%)',
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
              <Box>
                <Typography 
                  variant={isMobile ? 'h5' : 'h4'} 
                  fontWeight="700" 
                  gutterBottom
                  sx={{ color: 'white', mb: 1 }}
                >
                  {`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}!`} 👋
                </Typography>
                {isLoading ? (
                  <Skeleton variant="text" width={260} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                ) : (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontWeight: 400
                    }}
                  >
                    {isProfileComplete 
                      ? isVerified 
                        ? 'Your profile is verified and ready for service matching'
                        : 'Your profile is under admin verification'
                      : "Complete your basic profile setup to unlock all features"
                    }
                  </Typography>
                )}
              </Box>
              {isLoading ? (
                <Skeleton variant="rounded" width={150} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              ) : (
                <Chip 
                  label={statusConfig.label} 
                  color={statusConfig.color}
                  icon={statusConfig.icon}
                  variant={isProfileComplete ? "filled" : "outlined"}
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: isProfileComplete ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '& .MuiChip-icon': {
                      color: 'white'
                    }
                  }}
                />
              )}
            </Box>
          </Box>
        </Paper>

        {/* Onboarding Prompt Card - Simplified Design */}
        {!isLoading && !isProfileComplete && (
          <Card 
            elevation={0} 
            sx={{ 
              mb: { xs: 3, sm: 4 }, 
              borderRadius: 3, 
              border: '2px solid',
              borderColor: 'primary.main',
              background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 4.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2.5, 
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 }
                }}>
                  <Timeline sx={{ fontSize: { xs: 24, sm: 28 } }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant={isMobile ? 'h6' : 'h5'} 
                    fontWeight="700" 
                    gutterBottom
                    sx={{ mb: 1 }}
                  >
                    Complete Your Basic Profile Setup
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                      lineHeight: 1.6,
                      mb: 2
                    }}
                  >
                    Complete your basic information to unlock all features and start finding the perfect support workers for your needs.
                  </Typography>
                  
                  {/* Status Badge */}
                  <Chip
                    icon={<RadioButtonUnchecked sx={{ fontSize: 16 }} />}
                    label="Incomplete"
                    size="small"
                    sx={{
                      bgcolor: 'warning.50',
                      color: 'warning.dark',
                      border: '1px solid',
                      borderColor: 'warning.main',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      height: 28,
                      '& .MuiChip-icon': {
                        color: 'warning.main'
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Action Button */}
              <Button 
                variant="contained"
                endIcon={<ChevronRight />}
                fullWidth
                size="large"
                sx={{ 
                  textTransform: 'none',
                  py: 1.75,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 600,
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.2s ease'
                }}
                onClick={() => navigate('/client-onboarding')}
              >
                Complete Profile Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Profile Completion Status Card - Enhanced Design */}
        {!isLoading && isProfileComplete && (
          <Card 
            elevation={0} 
            sx={{ 
              mb: { xs: 3, sm: 4 }, 
              borderRadius: 3, 
              border: `2px solid ${isVerified ? '#10b981' : '#f59e0b'}`,
              background: isVerified 
                ? 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f0fdf4 100%)'
                : 'linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fffbeb 100%)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: isVerified 
                  ? 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #10b981 100%)'
                  : 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 50%, #f59e0b 100%)',
              },
              '&:hover': {
                boxShadow: isVerified 
                  ? '0 12px 32px rgba(16, 185, 129, 0.2)'
                  : '0 12px 32px rgba(245, 158, 11, 0.2)',
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 4.5 } }}>
              <Grid container spacing={3} alignItems="center">
                {/* Icon and Status */}
                <Grid item xs={12} sm={4} md={3}>
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                  }}>
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: 3, 
                      bgcolor: isVerified ? 'success.50' : 'warning.50',
                      border: `2px solid ${isVerified ? '#10b981' : '#f59e0b'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: { xs: 80, sm: 96 },
                      height: { xs: 80, sm: 96 },
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: -4,
                        borderRadius: 3,
                        border: `2px solid ${isVerified ? '#10b981' : '#f59e0b'}`,
                        opacity: 0.2,
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      },
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.2 },
                        '50%': { opacity: 0.4 },
                      }
                    }}>
                      {React.cloneElement(statusConfig.icon, { 
                        sx: { 
                          color: isVerified ? 'success.main' : 'warning.main', 
                          fontSize: { xs: 40, sm: 48 },
                          zIndex: 1
                        } 
                      })}
                    </Box>
                    <Chip
                      label={statusConfig.label}
                      color={statusConfig.color}
                      icon={statusConfig.icon}
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        height: { xs: 28, sm: 32 },
                        px: 1
                      }}
                    />
                  </Box>
                </Grid>

                {/* Status Details */}
                <Grid item xs={12} sm={8} md={9}>
                  <Box>
                    <Typography 
                      variant={isMobile ? 'h6' : 'h5'} 
                      fontWeight="700" 
                      gutterBottom
                      sx={{ 
                        mb: 1.5,
                        color: isVerified ? 'success.dark' : 'warning.dark'
                      }}
                    >
                      {isVerified ? 'Profile Verified & Active' : 'Profile Under Review'}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2.5, 
                        fontWeight: 400,
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                        lineHeight: 1.7
                      }}
                    >
                      {statusConfig.message}
                    </Typography>

                    {/* Completion Badge */}
                    <Box sx={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      p: { xs: 1.5, sm: 2 },
                      pr: { xs: 2.5, sm: 3 },
                      borderRadius: 2.5,
                      bgcolor: 'success.50',
                      border: '2px solid',
                      borderColor: 'success.main',
                      mb: 2.5
                    }}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: { xs: 24, sm: 28 }, flexShrink: 0 }} />
                      <Box>
                        <Typography 
                          variant="body1" 
                          fontWeight="700" 
                          color="success.dark"
                          sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, lineHeight: 1.2 }}
                        >
                          Profile Complete
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' }, display: 'block' }}
                        >
                          All required information submitted
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status-specific Alert */}
                    {isUnderVerification && !isVerified && (
                      <Alert 
                        severity="warning" 
                        icon={<HourglassEmpty />}
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: 'warning.50',
                          border: '1px solid',
                          borderColor: 'warning.main',
                          '& .MuiAlert-icon': {
                            fontSize: { xs: 20, sm: 24 },
                            color: 'warning.main'
                          }
                        }}
                      >
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mb: 0.5 }}>
                          Under Admin Review
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}>
                          Verification typically takes 1-3 business days. You'll be notified once complete.
                        </Typography>
                      </Alert>
                    )}
                    {isVerified && (
                      <Alert 
                        severity="success" 
                        icon={<Verified />}
                        sx={{ 
                          borderRadius: 2,
                          bgcolor: 'success.50',
                          border: '1px solid',
                          borderColor: 'success.main',
                          '& .MuiAlert-icon': {
                            fontSize: { xs: 20, sm: 24 },
                            color: 'success.main'
                          }
                        }}
                      >
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, mb: 0.5 }}>
                          Ready for Service Matching
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}>
                          Your profile is active and you can now find support workers and post jobs.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Grid - Redesigned */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {quickStats.map((stat, index) => (
            <Grid item xs={6} sm={6} md={4} lg={4} xl={4} key={index}>
              <Tooltip title={stat.tooltip || stat.label} arrow placement="top">
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 3, 
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9ff 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                      transform: 'scaleX(0)',
                      transformOrigin: 'left',
                      transition: 'transform 0.3s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 24px ${stat.color}33`,
                      borderColor: stat.color,
                      '&::before': {
                        transform: 'scaleX(1)'
                      }
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 3.5 } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Box sx={{ color: stat.color }}>
                          {React.cloneElement(stat.icon, { sx: { fontSize: { xs: 32, sm: 36 } } })}
                        </Box>
                      </Box>
                    </Box>
                    <Typography 
                      variant={isMobile ? 'h4' : 'h3'} 
                      fontWeight="700" 
                      gutterBottom 
                      sx={{ 
                        color: stat.color,
                        mb: 0.5,
                        lineHeight: 1.2
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.875rem', sm: '0.9375rem' }
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {/* Care Plan Summary removed in minimal onboarding paradigm */}

        {/* Action Items & Notifications Grid - Redesigned */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Action Items */}
          <Grid item xs={12} md={7} lg={7} xl={7}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                height: '100%', 
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9ff 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.1)'
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 3.5, md: 4 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Timeline sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="700" color="text.primary">
                      Action Items
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${upcomingTasks.length} ${upcomingTasks.length === 1 ? 'item' : 'items'}`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 600,
                      borderColor: 'primary.main',
                      color: 'primary.main'
                    }}
                  />
                </Box>

                {upcomingTasks.map((task, index) => (
                  <React.Fragment key={index}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        py: 2.5,
                        px: 1,
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          mr: 2, 
                          width: { xs: 44, sm: 48 }, 
                          height: { xs: 44, sm: 48 },
                          bgcolor: task.status === 'urgent' 
                            ? 'error.main' 
                            : task.status === 'completed'
                            ? 'success.main'
                            : 'primary.main'
                        }}
                      >
                        {task.status === 'urgent' ? (
                          <Warning sx={{ fontSize: 24 }} />
                        ) : task.status === 'completed' ? (
                          <CheckCircle sx={{ fontSize: 24 }} />
                        ) : (
                          <Description sx={{ fontSize: 24 }} />
                        )}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="body1" 
                          fontWeight="600" 
                          sx={{ 
                            fontSize: { xs: '0.9375rem', sm: '1rem' },
                            mb: 0.5
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                            fontWeight: 400
                          }}
                        >
                          {task.time}
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small"
                        sx={{
                          color: 'text.secondary',
                          '&:hover': {
                            color: 'primary.main',
                            bgcolor: 'primary.50'
                          }
                        }}
                      >
                        <ChevronRight />
                      </IconButton>
                    </Box>
                    {index < upcomingTasks.length - 1 && (
                      <Divider sx={{ my: 0.5 }} />
                    )}
                  </React.Fragment>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Links - Redesigned */}
          <Grid item xs={12} md={5} lg={5} xl={5}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                height: '100%',
                border: '1px solid #e5e7eb',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 3.5, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <EmojiEvents sx={{ fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="700" sx={{ color: '#1a237e' }}>
                    Quick Actions
                  </Typography>
                </Box>

                <Stack spacing={1.5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Person />}
                    sx={{ 
                      py: 1.75,
                      borderRadius: 2,
                      borderColor: '#e0e7ff',
                      borderWidth: 2,
                      color: '#4f46e5',
                      textTransform: 'none',
                      fontWeight: 600,
                      justifyContent: 'flex-start',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#4f46e5',
                        bgcolor: '#f5f7ff',
                        transform: 'translateX(4px)',
                        borderWidth: 2
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
                      py: 1.75,
                      borderRadius: 2,
                      borderColor: '#e0e7ff',
                      borderWidth: 2,
                      color: '#4f46e5',
                      textTransform: 'none',
                      fontWeight: 600,
                      justifyContent: 'flex-start',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#4f46e5',
                        bgcolor: '#f5f7ff',
                        transform: 'translateX(4px)',
                        borderWidth: 2
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
                      py: 1.75,
                      borderRadius: 2,
                      borderColor: '#e0e7ff',
                      borderWidth: 2,
                      color: '#4f46e5',
                      textTransform: 'none',
                      fontWeight: 600,
                      justifyContent: 'flex-start',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#4f46e5',
                        bgcolor: '#f5f7ff',
                        transform: 'translateX(4px)',
                        borderWidth: 2
                      }
                    }}
                    onClick={() => navigate('/client/profile/documents')}
                  >
                    View Documents
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Shield />}
                    sx={{ 
                      py: 1.75,
                      borderRadius: 2,
                      borderColor: '#e0e7ff',
                      borderWidth: 2,
                      color: '#4f46e5',
                      textTransform: 'none',
                      fontWeight: 600,
                      justifyContent: 'flex-start',
                      fontSize: '0.9375rem',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#4f46e5',
                        bgcolor: '#f5f7ff',
                        transform: 'translateX(4px)',
                        borderWidth: 2
                      }
                    }}
                    onClick={() => navigate('/client/profile/preferences')}
                  >
                    Update Preferences
                  </Button>
                </Stack>

                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 3,
                    borderRadius: 2,
                    bgcolor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    '& .MuiAlert-icon': {
                      fontSize: { xs: 20, sm: 24 },
                      color: '#3b82f6'
                    }
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      fontWeight: 500,
                      color: '#1e40af'
                    }}
                  >
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
