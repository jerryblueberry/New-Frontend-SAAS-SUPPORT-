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
import { Box, Card, CardContent, Typography, LinearProgress, Stepper, Step, StepLabel, StepButton, Chip, useMediaQuery, useTheme, Snackbar, Alert, Tooltip } from '@mui/material'
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

// Step Configuration (1-based)
const STEPS = [
  { number: 1, label: 'Profile Setup', key: 'basicInformation' },
  { number: 2, label: 'Care Preferences', key: 'preferences' },
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

  // Get state from store
  const currentStep = useClientOnboardingStore((state) => state.currentStep)
  const completedSteps = useClientOnboardingStore((state) => state.completedSteps)
  const profileCompleteness = useClientOnboardingStore((state) => state.profileCompleteness)
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
        navigate('/login')
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
  const { nextAvailableStep } = useMemo(() => {
    let nextStep = 1

    if (completedSteps.includes(1)) nextStep = 2
    if (completedSteps.includes(2)) nextStep = 2 // Stay on last step if all complete

    return { nextAvailableStep: nextStep }
  }, [completedSteps])

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

  // Check if profile is complete
  const isProfileComplete = useMemo(() => {
    return profileCompleteness.percentage === 100
  }, [profileCompleteness.percentage])

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
      // Only allow navigation to:
      // 1. Completed steps
      // 2. Current step
      // 3. Next available step
      if (
        completedSteps.includes(stepNumber) ||
        stepNumber === currentStep ||
        stepNumber === nextAvailableStep
      ) {
        setStep(stepNumber)
      } else {
        setSnackbar({
          open: true,
          message: `Please complete previous steps first`,
          severity: 'warning',
        })
      }
    },
    [completedSteps, currentStep, nextAvailableStep, setStep]
  )

  // Define step components
  const stepComponents = useMemo(
    () => ({
      1: <ClientProfile />,
      2: <ClientCarePreferences />,
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
              <Typography variant="body2" fontWeight={600} color="text.primary">
                Overall Progress
              </Typography>
              <Chip
                label={`${Math.round(profileCompleteness.percentage)}%`}
                size="small"
                color={profileCompleteness.percentage === 100 ? 'success' : 'primary'}
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <LinearProgress
              variant="determinate"
              value={profileCompleteness.percentage}
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1,
                  bgcolor:
                    profileCompleteness.percentage === 100 ? 'success.main' : 'primary.main',
                },
              }}
            />
          </Box>

          {/* Desktop Stepper */}
          {!isMobile && (
            <Stepper activeStep={currentStep - 1} alternativeLabel sx={{ mt: 2 }}>
              {STEPS.map((step) => {
                const isCompleted = isStepCompleted(step.number)
                const isCurrent = step.number === currentStep
                const isLocked =
                  !isCompleted && step.number !== currentStep && step.number !== nextAvailableStep

                return (
                  <Step key={step.number} completed={isCompleted}>
                    <Tooltip
                      title={
                        isCompleted
                          ? 'Completed ✓ - Click to review/edit'
                          : isLocked
                          ? 'Complete previous steps first'
                          : 'Click to navigate'
                      }
                      arrow
                      placement="top"
                    >
                      <span>
                        <StepButton
                          onClick={() => handleStepClick(step.number)}
                          disabled={isLocked}
                          icon={isLocked ? <Lock fontSize="small" /> : undefined}
                          sx={{
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                            '& .MuiStepLabel-label': {
                              fontSize: { sm: '0.875rem', md: '0.9375rem' },
                              fontWeight: isCurrent ? 700 : isCompleted ? 600 : 400,
                              color: isLocked ? 'text.disabled' : 'text.primary',
                            },
                          }}
                        >
                          {step.label}
                        </StepButton>
                      </span>
                    </Tooltip>
                  </Step>
                )
              })}
            </Stepper>
          )}

          {/* Mobile Step Indicators */}
          {isMobile && (
            <Box sx={{ mt: 2 }}>
              {STEPS.map((step) => {
                const isCompleted = isStepCompleted(step.number)
                const isCurrent = step.number === currentStep
                const isLocked =
                  !isCompleted && step.number !== currentStep && step.number !== nextAvailableStep

                return (
                  <Box
                    key={step.number}
                    onClick={() => handleStepClick(step.number)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1.5,
                      px: 1,
                      mb: 0.5,
                      borderRadius: 1,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      bgcolor: isCurrent ? 'action.selected' : 'transparent',
                      '&:hover': isLocked ? {} : { bgcolor: 'action.hover' },
                      transition: 'background-color 0.2s',
                      opacity: isLocked ? 0.6 : 1,
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle sx={{ color: 'success.main', mr: 1.5, fontSize: 24 }} />
                    ) : isLocked ? (
                      <Lock sx={{ color: 'text.disabled', mr: 1.5, fontSize: 24 }} />
                    ) : (
                      <RadioButtonUnchecked
                        sx={{ color: 'primary.main', mr: 1.5, fontSize: 24 }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isCurrent ? 600 : 400,
                          color: isLocked ? 'text.disabled' : 'text.primary',
                        }}
                      >
                        {step.label}
                      </Typography>
                      {isLocked && (
                        <Typography variant="caption" color="text.secondary">
                          Complete previous steps first
                        </Typography>
                      )}
                    </Box>
                    {isCurrent && (
                      <Chip
                        label="Current"
                        size="small"
                        color="primary"
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                )
              })}
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

