/**
 * Client Onboarding Component
 * Refactored to follow Worker Onboarding Pattern
 * - Uses separate mutations for each step
 * - 1-based step indexing (Step 1-2)
 * - Better progress tracking with completedSteps array
 * - Simpler state management
 */

import React, { useEffect, useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardContent, Typography, LinearProgress, Stepper, Step,Stack, StepLabel, StepButton, Chip, useMediaQuery, useTheme, Snackbar, Alert, Tooltip } from '@mui/material'
import { CheckCircle, RadioButtonUnchecked, Lock, Info, Error } from '@mui/icons-material'
import { Toaster, toast } from 'react-hot-toast'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import { formatApiError } from '../../../utils/errorFormatter'

// Store and API
import useClientOnboardingStore, {
  useClientOnboardingQuery,
} from '../../../stores/useClientOnboardingStore'

// Step Components
import ClientProfile from '../../../components/ClientComponents/ClientOnboarding/ClientProfile'
import ClientCarePreferences from '../../../components/ClientComponents/ClientOnboarding/ClientCarePreferences'
import LoadingSpinner from '../../../components/common/LoadingSpinner'

// Step Configuration (1-based) - ONE-STEP ONBOARDING
// NOTE: Preferences are managed via profile pages, not onboarding
const STEPS = [
  { number: 1, label: 'Basic Information', key: 'basicInformation', required: true },
]

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

  // Realtime refresh handled by TanStack Query refetchInterval in hook

  // Get state from store
  const currentStep = useClientOnboardingStore((state) => state.currentStep)
  const completedSteps = useClientOnboardingStore((state) => state.completedSteps)
  const profileCompleteness = useClientOnboardingStore((state) => state.profileCompleteness)
  const onboarding = useClientOnboardingStore((state) => state.onboarding)
  const setStep = useClientOnboardingStore((state) => state.setStep)
  const resetStore = useClientOnboardingStore((state) => state.resetStore)

  // Fetch onboarding data (similar to worker pattern)
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

  // Check persistence on mount
  useEffect(() => {
    const store = useClientOnboardingStore.getState()
    store.checkPersistence()
  }, [])

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
      
      // Show user-friendly error message
      const errorMessage = formatApiError(queryError)
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-line',
        }
      })
    }
  }, [queryError, navigate])

  // Calculate completed steps and next available step
  // ONE-STEP ONBOARDING: Step 1 is required, Step 2 is optional
  const { nextAvailableStep } = useMemo(() => {
    // Step 1 is always available
    if (!completedSteps.includes(1)) {
      return { nextAvailableStep: 1 }
    }
    
    // Step 2 is optional - only available for individual clients
    if (onboarding?.canAddPreferences) {
      return { nextAvailableStep: 2 }
    }
    
    // Stay on step 1 if can't add preferences (organizations)
    return { nextAvailableStep: 1 }
  }, [completedSteps, onboarding?.canAddPreferences])

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

  // Check if profile can be edited
  const canEditProfile = useMemo(() => {
    if (!profile) return true // New users can create profiles
    if (isProfileDeleted) return false // Deleted profiles cannot be edited

    const editableStatuses = ['draft', 'unverified', 'rejected']
    return editableStatuses.includes(currentStatus)
  }, [profile, isProfileDeleted, currentStatus])

  // Check if onboarding is complete (ONE-STEP: basic info = 100%)
  const isProfileComplete = useMemo(() => {
    return onboarding?.onboardingComplete === true
  }, [onboarding?.onboardingComplete])
  
  // Check if can add preferences (only individual clients)
  const canAddPreferences = useMemo(() => {
    return onboarding?.canAddPreferences === true
  }, [onboarding?.canAddPreferences])

  // Check if step is completed
  const isStepCompleted = useCallback(
    (stepNumber) => {
      return completedSteps.includes(stepNumber)
    },
    [completedSteps]
  )

  // Handle step click from progress bar
  const handleStepClick = useCallback(
    (stepNumber) => {
      // ONE-STEP ONBOARDING: Step 1 is required, Step 2 is optional
      if (stepNumber === 1) {
        // Step 1 is always accessible
        setStep(stepNumber)
      } else if (stepNumber === 2) {
        // Step 2 is optional - only accessible if:
        // 1. Basic info is complete (step 1 done)
        // 2. User is individual client (can add preferences)
        if (onboarding?.isBasicInfoComplete && onboarding?.canAddPreferences) {
          setStep(stepNumber)
        } else if (!onboarding?.isBasicInfoComplete) {
          setSnackbar({
            open: true,
            message: 'Please complete basic information first',
            severity: 'warning',
          })
        } else if (!onboarding?.canAddPreferences) {
          setSnackbar({
            open: true,
            message: 'Preferences are not available for organization accounts',
            severity: 'info',
          })
        }
      } else {
        setSnackbar({
          open: true,
          message: `Please complete previous steps first`,
          severity: 'warning',
        })
      }
    },
    [completedSteps, currentStep, nextAvailableStep, setStep, onboarding]
  )

  // Define step components - Only Step 1 (Basic Information)
  const stepComponents = useMemo(
    () => ({
      1: <ClientProfile />,
    }),
    []
  )

  // Show loading state
  if (isQueryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner
          size="lg"
          showLogo={true}
          text="Loading your profile..."
          fullPage={true}
          variant="gradient"
        />
      </div>
    )
  }

  // Show error state
  if (queryError && !isQueryLoading) {
    const errorMessage = formatApiError(queryError)
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Unable to Load Profile</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            {errorMessage}
          </Typography>
        </Alert>
      </Box>
    )
  }

  return (
    <>
    <WorkerNavbar />

<Box
      sx={{
        mt:13,
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        maxWidth: 1000,
        mx: 'auto',
        minHeight: '100vh',
      }}
    >
      <Toaster position="top-right" />

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
              Client Onboarding
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your profile to get matched with the best support workers
            </Typography>
          </Box>
          {/* Status Badge */}
          <Chip
            icon={<Info fontSize="small" />}
            label={profile ? statusConfig.label : 'Getting Started'}
            color={profile ? statusConfig.color : 'default'}
            size="small"
            sx={{
              fontWeight: 600,
              height: 28,
              '& .MuiChip-icon': { fontSize: '0.875rem' },
            }}
          />
        </Box>

        {/* Status Messages */}
        {isProfileDeleted && (
          <Alert
            severity="error"
            icon={<Error />}
            sx={{
              mt: 2,
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'error.main',
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Your profile has been deactivated
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Please contact support for assistance.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Profile deactivated on: {new Date(profile.deletedAt).toLocaleDateString()}
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Progress Card */}
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" fontWeight={700} color="text.primary">
                  Onboarding Progress
                </Typography>
                <Chip
                  label={onboarding?.onboardingComplete ? 'Complete' : 'Step 1 of 1'}
                  size="small"
                  color={onboarding?.onboardingComplete ? 'success' : 'default'}
                  sx={{ fontWeight: 600, height: 22 }}
                />
                {onboarding?.canAddPreferences && (
                  <Tooltip
                    title="Preferences are optional and can be added anytime"
                    placement="top"
                    arrow
                  >
                    <Chip
                      label="Preferences Optional"
                      size="small"
                      color="default"
                      sx={{ fontWeight: 600, height: 22, bgcolor: 'action.hover' }}
                    />
                  </Tooltip>
                )}
              </Stack>
              <Chip
                label={`${Math.min(100, Math.round(profileCompleteness.percentage))}%`}
                size="small"
                color={onboarding?.onboardingComplete ? 'success' : 'primary'}
                sx={{ fontWeight: 700 }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={onboarding?.isBasicInfoComplete ? 100 : Math.min(100, profileCompleteness.percentage)}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  bgcolor: onboarding?.onboardingComplete ? 'success.main' : 'primary.main',
                },
              }}
            />
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {onboarding?.onboardingComplete
                  ? 'Basic information complete. You can start posting jobs.'
                  : 'Complete basic information to finish onboarding.'}
              </Typography>
              {onboarding?.isBasicInfoComplete && onboarding?.canAddPreferences && (
                <Tooltip title="Optional: Add your preferences to speed up job posting" arrow>
                  <Chip
                    label="Add Preferences"
                    color="primary"
                    size="small"
                    onClick={() => navigate('/client/profile/preferences')}
                    sx={{ cursor: 'pointer', height: 24, fontWeight: 600 }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Desktop Stepper - Only show Step 1 */}
          {!isMobile && (
            <Stepper activeStep={0} alternativeLabel sx={{ mt: 2 }}>
              <Step key={1} completed={isStepCompleted(1)}>
                <Tooltip title="Basic Information" arrow placement="top">
                  <span>
                    <StepButton
                      onClick={() => handleStepClick(1)}
                      sx={{
                        cursor: 'pointer',
                        '& .MuiStepLabel-label': {
                          fontSize: { sm: '0.875rem', md: '0.9375rem' },
                          fontWeight: 700,
                        },
                      }}
                    >
                      Basic Information
                    </StepButton>
                  </span>
                </Tooltip>
              </Step>
            </Stepper>
          )}

          {/* Mobile Step Indicators - Only Step 1 */}
          {isMobile && (
            <Box sx={{ mt: 2 }}>
              <Box
                onClick={() => handleStepClick(1)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1.5,
                  px: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  bgcolor: 'action.selected',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background-color 0.2s',
                }}
              >
                <CheckCircle sx={{ color: isStepCompleted(1) ? 'success.main' : 'primary.main', mr: 1.5, fontSize: 24 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                </Box>
                <Chip
                  label="Current"
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Step Content Card */}
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {isProfileDeleted ? (
            <Alert severity="error">
              <Typography variant="body2" fontWeight={600}>
                Profile Deactivated
              </Typography>
              <Typography variant="caption">
                Your profile has been deactivated. Please contact support.
              </Typography>
            </Alert>
          ) : !profile && !isNewUser ? null : (
            stepComponents[currentStep] || <Typography>Invalid step</Typography>
          )}
        </CardContent>
      </Card>

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
    </Box>

    </>
  
  )
}

export default React.memo(ClientOnboarding)

