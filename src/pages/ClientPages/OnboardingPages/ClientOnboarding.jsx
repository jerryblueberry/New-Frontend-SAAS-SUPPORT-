import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, LinearProgress, Stepper, Step, StepLabel, StepButton, Chip, useMediaQuery, useTheme, Snackbar, Alert, Tooltip } from '@mui/material'
import { useClientProfileQuery, useClientOnboarding } from '../../../stores/useClientOnboardingStore'
import { CheckCircle, RadioButtonUnchecked, Lock, Info } from '@mui/icons-material'
import ClientProfile from '../../../components/ClientComponents/ClientOnboarding/ClientProfile'
import ClientCarePreferences from '../../../components/ClientComponents/ClientOnboarding/ClientCarePreferences'

const STEPS = [
  { label: 'Profile Setup', key: 'basicInformation' },
  { label: 'Care Preferences', key: 'preferences' }
]

// Status configuration from backend model
const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'default', description: 'Profile is being created' },
  unverified: { label: 'Unverified', color: 'warning', description: 'Awaiting admin verification' },
  submitted: { label: 'Submitted', color: 'info', description: 'Submitted for review' },
  verified: { label: 'Verified', color: 'success', description: 'Approved by admin' },
  rejected: { label: 'Rejected', color: 'error', description: 'Rejected - please review' },
  active: { label: 'Active', color: 'success', description: 'Profile is active' }
}

const ClientOnboarding = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { data: profile, isLoading, error, refetch } = useClientProfileQuery({
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for status updates
  })
  const store = useClientOnboarding()
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })
  
  // Destructure store values first
  const {
    activeStep,
    setActiveStep,
  } = store

  // Get actual status from backend (not default 'draft')
  const currentStatus = useMemo(() => {
    return profile?.status || 'draft'
  }, [profile?.status])

  const statusConfig = useMemo(() => {
    return STATUS_CONFIG[currentStatus] || STATUS_CONFIG.draft
  }, [currentStatus])

  // Sync activeStep with backend progressStep when profile loads
  useEffect(() => {
    if (profile?.progressStep) {
      const backendStep = Math.max(1, Math.min(2, profile.progressStep))
      const nextStep = backendStep - 1 // Convert 1-based to 0-based
      
      // Only update if different and profile is not complete
      const completeness = profile?.profileCompleteness?.percentage ?? 0
      if (completeness < 100 && nextStep !== activeStep && nextStep >= activeStep) {
        setActiveStep(nextStep)
      }
    }
  }, [profile?.progressStep, activeStep, setActiveStep, profile?.profileCompleteness?.percentage])
  
  // Check URL params for step navigation
  const urlParams = new URLSearchParams(window.location.search)
  const stepParam = urlParams.get('step')
  
  // Sync step from URL if provided
  React.useEffect(() => {
    if (stepParam && profile) {
      const stepIndex = parseInt(stepParam, 10) - 1 // Convert 1-based to 0-based
      if (stepIndex >= 0 && stepIndex < STEPS.length) {
        const completed = profile?.profileCompleteness?.completedSteps || {}
        const completeness = profile?.profileCompleteness?.percentage ?? 0
        
        // Allow URL navigation if:
        // 1. Profile is complete (100%)
        // 2. OR the specific step is completed
        // 3. OR it's the first step
        if (completeness === 100 || completed[STEPS[stepIndex].key] || stepIndex === 0) {
          setActiveStep(stepIndex)
        }
      }
    }
  }, [stepParam, profile, setActiveStep])
  
  // Use profile data directly for step completion checks (not store cache)
  const isStepCompleted = useCallback((stepIndex) => {
    const stepKey = STEPS[stepIndex]?.key
    if (!stepKey || !profile?.profileCompleteness?.completedSteps) return false
    return profile.profileCompleteness.completedSteps[stepKey] === true
  }, [profile])
  
  const getMaxReachableStepIndex = useCallback(() => {
    if (!profile) return 0
    
    const completeness = profile?.profileCompleteness?.percentage ?? 0
    if (completeness === 100) return STEPS.length - 1
    
    const completed = profile?.profileCompleteness?.completedSteps || {}
    let maxReachable = activeStep
    
    for (let i = 0; i < STEPS.length; i++) {
      if (completed[STEPS[i].key]) {
        maxReachable = Math.max(maxReachable, i)
      }
    }
    
    if (maxReachable < STEPS.length - 1) {
      for (let i = 0; i <= maxReachable; i++) {
        if (completed[STEPS[i].key]) {
          maxReachable = Math.max(maxReachable, i + 1)
        }
      }
    }
    
    return Math.min(maxReachable, STEPS.length - 1)
  }, [profile, activeStep])

  // Calculate overall progress percentage - robust calculation
  const progressPercentage = useMemo(() => {
    if (!profile) return 0
    const percentage = profile?.profileCompleteness?.percentage ?? 0
    // Ensure percentage is between 0 and 100
    return Math.max(0, Math.min(100, percentage))
  }, [profile])
  
  // Check if profile is complete for free navigation
  const isProfileComplete = useMemo(() => {
    return progressPercentage === 100
  }, [progressPercentage])

  // Check if profile can be edited based on status
  const canEditProfile = useMemo(() => {
    // Can edit if: draft, unverified, or rejected
    return ['draft', 'unverified', 'rejected'].includes(currentStatus)
  }, [currentStatus])

  // Check if profile is pending admin review
  const isPendingReview = useMemo(() => {
    return ['submitted', 'unverified'].includes(currentStatus)
  }, [currentStatus])

  // Get prerequisite step name
  const getPrerequisiteStep = useCallback((targetStepIndex) => {
    for (let i = 0; i < targetStepIndex; i++) {
      if (!isStepCompleted(i)) {
        return { index: i, label: STEPS[i].label }
      }
    }
    return null
  }, [isStepCompleted])

  // Check if step is accessible based on profile data
  const canNavigateToStep = useCallback((stepIndex) => {
    if (stepIndex < 0 || stepIndex >= STEPS.length) return false
    if (stepIndex === activeStep) return true
    if (stepIndex === 0) return true // First step always accessible
    
    const completeness = profile?.profileCompleteness?.percentage ?? 0
    if (completeness === 100) return true // All steps accessible if complete
    
    const completed = profile?.profileCompleteness?.completedSteps || {}
    
    // Can navigate to any completed step
    if (completed[STEPS[stepIndex].key]) return true
    
    // Can navigate to next step if previous step is completed
    if (stepIndex > 0 && completed[STEPS[stepIndex - 1].key]) return true
    
    return false
  }, [profile, activeStep])
  
  // Handle step click with navigation guards and feedback
  const handleStepClick = useCallback((stepIndex) => {
    // Same step - no action needed
    if (stepIndex === activeStep) {
      return
    }

    // Check if navigation is allowed based on profile data
    if (canNavigateToStep(stepIndex)) {
      // Force navigation by directly setting the active step
      // This bypasses any store restrictions for completed steps
      store.setActiveStep(stepIndex)
      
      // Show feedback for navigation
      if (isStepCompleted(stepIndex)) {
        // Navigating to a completed step
        setToast({
          open: true,
          message: `Navigated to "${STEPS[stepIndex].label}" - Your saved data is loaded. You can review and edit.`,
          severity: 'success'
        })
      } else if (stepIndex > activeStep) {
        // Navigating forward to next incomplete step
        setToast({
          open: true,
          message: `Navigated to "${STEPS[stepIndex].label}" - Complete this step to continue`,
          severity: 'info'
        })
      }
      return
    }

    // User tried to access a locked step - provide helpful feedback
    if (!isProfileComplete) {
      const prerequisite = getPrerequisiteStep(stepIndex)
      const maxReachable = getMaxReachableStepIndex()
      
      if (stepIndex > maxReachable) {
        if (prerequisite) {
          setToast({
            open: true,
            message: `🔒 Please complete "${prerequisite.label}" (Step ${prerequisite.index + 1}) to access "${STEPS[stepIndex].label}"`,
            severity: 'warning'
          })
        } else {
          setToast({
            open: true,
            message: `🔒 Please complete previous steps to access "${STEPS[stepIndex].label}"`,
            severity: 'warning'
          })
        }
      }
    }
  }, [activeStep, store, isStepCompleted, isProfileComplete, getPrerequisiteStep, getMaxReachableStepIndex, canNavigateToStep])

  // Get step status for styling based on profile data
  const getStepStatus = useCallback((stepIndex) => {
    if (isStepCompleted(stepIndex)) {
      return stepIndex === activeStep ? 'active-completed' : 'completed'
    }
    if (stepIndex === activeStep) return 'active'
    if (canNavigateToStep(stepIndex)) return 'available'
    return 'locked'
  }, [isStepCompleted, activeStep, canNavigateToStep])

  // Memoize step components to prevent unnecessary re-renders
  const stepComponents = useMemo(() => ({
    0: <ClientProfile />,
    1: <ClientCarePreferences />
  }), [])

  return (
    <Box sx={{ 
      px: { xs: 2, sm: 3, md: 4 }, 
      py: { xs: 2, sm: 3 }, 
      maxWidth: 1000, 
      mx: 'auto',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
              Client Onboarding
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your profile to get matched with the best support workers
            </Typography>
          </Box>
          {/* Status Badge */}
          {profile && (
            <Chip
              icon={<Info fontSize="small" />}
              label={statusConfig.label}
              color={statusConfig.color}
              size="small"
              sx={{ 
                fontWeight: 600,
                height: 28,
                '& .MuiChip-icon': { fontSize: '0.875rem' }
              }}
            />
          )}
        </Box>
        {/* Status Message */}
        {isPendingReview && (
          <Alert 
            severity="info" 
            sx={{ mt: 2, borderRadius: 2 }}
            icon={<Info />}
          >
            <Typography variant="body2" fontWeight={600}>
              {statusConfig.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentStatus === 'submitted' 
                ? 'Your profile has been submitted and is awaiting admin review. You can still make edits if needed.'
                : 'Your profile is awaiting admin verification. You can continue editing your profile.'}
            </Typography>
          </Alert>
        )}
        {currentStatus === 'rejected' && (
          <Alert 
            severity="warning" 
            sx={{ mt: 2, borderRadius: 2 }}
          >
            <Typography variant="body2" fontWeight={600}>
              Profile Rejected
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {profile?.rejectionReason || 'Please review and update your profile information.'}
            </Typography>
          </Alert>
        )}
        {currentStatus === 'verified' && (
          <Alert 
            severity="success" 
            sx={{ mt: 2, borderRadius: 2 }}
          >
            <Typography variant="body2" fontWeight={600}>
              Profile Verified
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your profile has been verified by an admin. You can continue to update your information.
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Progress Card */}
      <Card elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                Overall Progress
              </Typography>
              <Chip 
                label={`${Math.round(progressPercentage)}%`}
                size="small"
                color={progressPercentage === 100 ? 'success' : 'primary'}
                sx={{ fontWeight: 600 }}
              />
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

          {/* Desktop Stepper */}
          {!isMobile && (
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 2 }}>
              {STEPS.map((step, idx) => {
                const status = getStepStatus(idx)
                const clickable = canNavigateToStep(idx)
                const isLocked = status === 'locked'
                const prerequisite = isLocked ? getPrerequisiteStep(idx) : null
                
                const tooltipTitle = isStepCompleted(idx)
                  ? idx === activeStep
                    ? 'Currently viewing (Completed ✓)'
                    : 'Completed ✓ - Click to review/edit'
                  : isLocked && prerequisite
                  ? `Complete "${prerequisite.label}" first`
                  : clickable
                  ? 'Click to navigate'
                  : ''
                
                return (
                  <Step 
                    key={step.key} 
                    completed={isStepCompleted(idx)}
                  >
                    <Tooltip 
                      title={tooltipTitle} 
                      arrow 
                      placement="top"
                      enterDelay={300}
                    >
                      <span>
                        <StepButton
                          onClick={() => handleStepClick(idx)}
                          disabled={!clickable}
                          icon={isLocked ? <Lock fontSize="small" /> : undefined}
                          sx={{
                            cursor: clickable ? 'pointer' : 'not-allowed',
                            '& .MuiStepLabel-label': {
                              fontSize: { sm: '0.875rem', md: '0.9375rem' },
                              fontWeight: status === 'active' || status === 'active-completed' ? 700 : isStepCompleted(idx) ? 600 : 400,
                              color: status === 'locked' ? 'text.disabled' : 'text.primary',
                              '&:hover': clickable ? {
                                color: 'primary.main',
                                textDecoration: isStepCompleted(idx) ? 'underline' : 'none'
                              } : {}
                            },
                            '& .MuiStepIcon-root': {
                              color: isLocked ? 'action.disabled' : undefined,
                              fontSize: isStepCompleted(idx) && idx !== activeStep ? '1.75rem' : undefined,
                              '&:hover': clickable && !isLocked ? {
                                transform: 'scale(1.15)',
                                transition: 'transform 0.2s ease'
                              } : {}
                            }
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
              {STEPS.map((step, idx) => {
                const status = getStepStatus(idx)
                const completed = isStepCompleted(idx)
                const clickable = canNavigateToStep(idx)
                const isLocked = status === 'locked'
                
                return (
                  <Box
                    key={step.key}
                    onClick={() => handleStepClick(idx)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1.5,
                      px: 1,
                      mb: 0.5,
                      borderRadius: 1,
                      cursor: clickable ? 'pointer' : 'not-allowed',
                      bgcolor: status === 'active' ? 'action.selected' : 'transparent',
                      '&:hover': clickable ? { bgcolor: 'action.hover' } : {},
                      transition: 'background-color 0.2s',
                      opacity: isLocked ? 0.6 : 1,
                      border: isLocked ? '1px dashed #e0e0e0' : 'none'
                    }}
                  >
                    {completed ? (
                      <CheckCircle sx={{ color: 'success.main', mr: 1.5, fontSize: 24 }} />
                    ) : isLocked ? (
                      <Lock sx={{ color: 'text.disabled', mr: 1.5, fontSize: 24 }} />
                    ) : (
                      <RadioButtonUnchecked 
                        sx={{ 
                          color: 'primary.main', 
                          mr: 1.5, 
                          fontSize: 24 
                        }} 
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: status === 'active' ? 600 : 400,
                          color: isLocked ? 'text.disabled' : 'text.primary'
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
                    {status === 'active' && (
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
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
              <Typography variant="body2" color="text.secondary">Loading profile...</Typography>
            </Box>
          ) : error ? (
            <Alert 
              severity="error" 
              action={
                <Typography 
                  variant="button" 
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => refetch()}
                >
                  Retry
                </Typography>
              }
            >
              <Typography variant="body2" fontWeight={600}>
                Failed to load profile
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {error?.message || 'An error occurred while loading your profile'}
              </Typography>
            </Alert>
          ) : !profile ? (
            <Alert severity="info">
              <Typography variant="body2">
                No profile found. Please start by completing the first step.
              </Typography>
            </Alert>
          ) : !canEditProfile && currentStatus !== 'draft' ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={600}>
                Profile Status: {statusConfig.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentStatus === 'verified' || currentStatus === 'active'
                  ? 'Your profile is verified. You can view and update your information.'
                  : 'Your profile is currently being reviewed.'}
              </Typography>
            </Alert>
          ) : null}
          
          {profile && (canEditProfile || currentStatus === 'draft') && (
            stepComponents[activeStep] || <Typography>Invalid step</Typography>
          )}
        </CardContent>
      </Card>

      {/* Toast Notification for Step Access Feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(prev => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{
            width: '100%',
            maxWidth: { xs: '90vw', sm: '500px' },
            '& .MuiAlert-message': {
              fontSize: { xs: '0.875rem', sm: '0.9375rem' }
            }
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ClientOnboarding