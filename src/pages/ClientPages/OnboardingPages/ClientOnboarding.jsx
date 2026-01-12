/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT ONBOARDING PAGE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready single-step onboarding flow for NDIS clients.
 * 
 * Features:
 * - Single-step onboarding (Basic Information only)
 * - Clean, focused UI without progress bars (single step)
 * - Clear call-to-action with "Complete Profile" button
 * - Responsive design
 * - Error handling and loading states
 * 
 * @module pages/ClientPages/OnboardingPages/ClientOnboarding
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  useMediaQuery, 
  useTheme, 
  Snackbar, 
  Alert,
  Container,
  alpha,
  Fade
} from '@mui/material'
import { CheckCircle, Info, Error as ErrorIcon, Person } from '@mui/icons-material'
import { Toaster } from 'react-hot-toast'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import { formatApiError } from '../../../utils/errorFormatter'

// Store and API
import useClientOnboardingStore, {
  useClientOnboardingQuery,
} from '../../../stores/useClientOnboardingStore'

// Step Components
import ClientProfile from '../../../components/ClientComponents/ClientOnboarding/ClientProfile'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

// Status Configuration
const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'default', description: 'Profile is being created' },
  unverified: { label: 'Unverified', color: 'warning', description: 'Awaiting admin verification' },
  submitted: { label: 'Submitted', color: 'info', description: 'Submitted for review' },
  verified: { label: 'Verified', color: 'success', description: 'Approved by admin' },
  rejected: { label: 'Rejected', color: 'error', description: 'Rejected - please review' },
  active: { label: 'Active', color: 'success', description: 'Profile is active' },
}

const ClientOnboarding = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()

  // Get state from store
  const onboarding = useClientOnboardingStore((state) => state.onboarding)
  const resetStore = useClientOnboardingStore((state) => state.resetStore)

  // Fetch onboarding data
  const {
    data: onboardingData,
    isLoading: isQueryLoading,
    error: queryError,
  } = useClientOnboardingQuery()

  // Extract profile data
  const profile = onboardingData?.data?.profile || null
  const isNewUser = onboardingData?.isNewUser || false

  // Local UI state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })

  // Handle new user state
  useEffect(() => {
    if (!isQueryLoading && isNewUser) {
      resetStore()
    }
  }, [isQueryLoading, isNewUser, resetStore])

  // Auth redirect effect and error notifications
  useEffect(() => {
    if (queryError) {
      if (queryError?.response?.status === 401) {
        navigate('/client/login')
        return
      }
    }
  }, [queryError, navigate])

  // Check if profile is deleted
  const isProfileDeleted = useMemo(() => {
    return profile?.isDeleted === true
  }, [profile?.isDeleted])

  // Get profile status
  const currentStatus = useMemo(() => {
    return profile?.status || 'draft'
  }, [profile?.status])

  const statusConfig = useMemo(() => {
    return STATUS_CONFIG[currentStatus] || STATUS_CONFIG.draft
  }, [currentStatus])

  // Check if onboarding is complete (ONE-STEP: basic info = 100%)
  const isProfileComplete = useMemo(() => {
    return onboarding?.onboardingComplete === true || 
           profile?.profileCompleteness?.completedSteps?.basicInformation === true
  }, [onboarding?.onboardingComplete, profile?.profileCompleteness?.completedSteps?.basicInformation])

  // Redirect to dashboard if profile is complete (prevent access to onboarding)
  useEffect(() => {
    if (!isQueryLoading && isProfileComplete && profile && !isProfileDeleted) {
      navigate('/client-dashboard', { replace: true })
    }
  }, [isQueryLoading, isProfileComplete, profile, isProfileDeleted, navigate])
  
  // Check if can add preferences (only individual clients)
  const canAddPreferences = useMemo(() => {
    return onboarding?.canAddPreferences === true
  }, [onboarding?.canAddPreferences])

  // Show loading state
  if (isQueryLoading) {
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner
            size="lg"
            showLogo={true}
            text="Loading your profile..."
            fullPage={true} 
            variant="gradient"
            color="primary"
          />
        </Box>
      </>
    )
  }

  // Show error state
  if (queryError && !isQueryLoading) {
    const errorMessage = formatApiError(queryError)
    return (
      <>
        <WorkerNavbar />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            sx={{ 
              borderRadius: 2,
              border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Unable to Load Profile
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {errorMessage}
            </Typography>
          </Alert>
        </Container>
      </>
    )
  }

  return (
    <>
      <WorkerNavbar />
      <Toaster position="top-right" />
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: { xs: 10, sm: 13 },
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 4 },
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {/* Header Section */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 3,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                    }}
                  >
                    <Person sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
                  </Box>
                  <Box>
                    <Typography 
                      variant={isMobile ? 'h5' : 'h4'} 
                      fontWeight={700} 
                      gutterBottom
                      sx={{ 
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.dark} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      Complete Your Profile
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {isProfileComplete 
                        ? 'Your profile is complete. You can update information anytime.'
                        : 'Fill in your basic information to get started and connect with support workers.'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Status Badge */}
              {profile && (
                <Chip
                  icon={isProfileComplete ? <CheckCircle /> : <Info />}
                  label={isProfileComplete ? 'Complete' : statusConfig.label}
                  color={isProfileComplete ? 'success' : statusConfig.color}
                  size="medium"
                  sx={{
                    fontWeight: 600,
                    height: { xs: 32, sm: 36 },
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    '& .MuiChip-icon': { fontSize: { xs: '1rem', sm: '1.125rem' } },
                  }}
                />
              )}
            </Box>

            {/* Status Messages */}
            {isProfileDeleted && (
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{
                  borderRadius: 2,
                  border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Your profile has been deactivated
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Please contact support for assistance.
                </Typography>
                {profile?.deletedAt && (
                  <Typography variant="caption" color="text.secondary">
                    Profile deactivated on: {new Date(profile.deletedAt).toLocaleDateString()}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Success Message for Complete Profile */}
            {isProfileComplete && !isProfileDeleted && (
              <Fade in timeout={600}>
                <Alert
                  severity="success"
                  icon={<CheckCircle />}
                  sx={{
                    borderRadius: 2,
                    border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    🎉 Profile Complete!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    You can now start posting jobs and connecting with support workers. 
                    {canAddPreferences && ' Add preferences anytime from your profile settings.'}
                  </Typography>
                </Alert>
              </Fade>
            )}
          </Box>
        </Fade>

        {/* Main Content Card */}
        <Fade in timeout={700}>
          <Card 
            elevation={0} 
            sx={{ 
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              {isProfileDeleted ? (
                <Alert severity="error">
                  <Typography variant="body2" fontWeight={600}>
                    Profile Deactivated
                  </Typography>
                  <Typography variant="caption">
                    Your profile has been deactivated. Please contact support.
                  </Typography>
                </Alert>
              ) : (
                <ClientProfile />
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}

export default React.memo(ClientOnboarding)

