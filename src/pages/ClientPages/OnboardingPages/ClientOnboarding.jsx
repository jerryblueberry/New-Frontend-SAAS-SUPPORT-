import React, { useMemo, useEffect, useCallback, useState } from 'react'
import { Box, Card, CardContent, Typography, LinearProgress, Stepper, Step, StepLabel, StepButton, Chip, useMediaQuery, useTheme, Snackbar, Alert, Tooltip } from '@mui/material'
import { useClientProfileQuery, useClientOnboarding } from '../../../stores/useClientOnboardingStore'
import { CheckCircle, RadioButtonUnchecked, Lock } from '@mui/icons-material'
import ClientProfile from '../../../components/ClientComponents/ClientOnboarding/ClientProfile'
import ClientDocumentUpload from '../../../components/ClientComponents/ClientOnboarding/ClientDocumentUpload'
import ClientCarePreferences from '../../../components/ClientComponents/ClientOnboarding/ClientCarePreferences'
import ClientReview from '../../../components/ClientComponents/ClientOnboarding/ClientReview'

const STEPS = [
  { label: 'Profile Setup', key: 'basicInformation' },
  { label: 'Document Upload', key: 'verification' },
  { label: 'Care Preferences', key: 'preferences' },
  { label: 'Review & Activate', key: 'review' }
]

const ClientOnboarding = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { data: profile, isLoading } = useClientProfileQuery()
  const store = useClientOnboarding()
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' })

  const {
    activeStep,
    getCompleteness,
    getCompletedStepIndices,
    getMaxReachableStepIndex,
    canGoTo,
    goTo,
    isStepCompleted
  } = store

  // Calculate overall progress percentage
  const progressPercentage = useMemo(() => {
    return profile?.profileCompleteness?.percentage ?? 0
  }, [profile])

  // Get prerequisite step name
  const getPrerequisiteStep = useCallback((targetStepIndex) => {
    for (let i = 0; i < targetStepIndex; i++) {
      if (!isStepCompleted(i)) {
        return { index: i, label: STEPS[i].label }
      }
    }
    return null
  }, [isStepCompleted])

  // Handle step click with navigation guards and feedback
  const handleStepClick = useCallback((stepIndex) => {
    // Same step - no action needed
    if (stepIndex === activeStep) {
      return
    }

    // Allow navigation if step is accessible
    if (canGoTo(stepIndex)) {
      goTo(stepIndex)
      
      // Optional: Show feedback for navigation to completed steps
      if (isStepCompleted(stepIndex) && stepIndex < activeStep) {
        setToast({
          open: true,
          message: `Navigated to "${STEPS[stepIndex].label}" - You can review and make changes`,
          severity: 'info'
        })
      }
      return
    }

    // User tried to access a locked step - provide helpful feedback
    const prerequisite = getPrerequisiteStep(stepIndex)
    const maxReachable = getMaxReachableStepIndex()
    
    if (stepIndex > maxReachable) {
      if (prerequisite) {
        // Show which step needs to be completed first
        setToast({
          open: true,
          message: `🔒 Please complete "${prerequisite.label}" (Step ${prerequisite.index + 1}) to access "${STEPS[stepIndex].label}"`,
          severity: 'warning'
        })
      } else {
        // Generic message if can't determine prerequisite
        setToast({
          open: true,
          message: `🔒 Please complete previous steps to access "${STEPS[stepIndex].label}"`,
          severity: 'warning'
        })
      }
    }
  }, [activeStep, canGoTo, goTo, getPrerequisiteStep, getMaxReachableStepIndex, isStepCompleted])

  // Get step status for styling
  const getStepStatus = useCallback((stepIndex) => {
    if (isStepCompleted(stepIndex)) return 'completed'
    if (stepIndex === activeStep) return 'active'
    if (canGoTo(stepIndex)) return 'available'
    return 'locked'
  }, [isStepCompleted, activeStep, canGoTo])

  // Memoize step components to prevent unnecessary re-renders
  const stepComponents = useMemo(() => ({
    0: <ClientProfile />,
    1: <ClientDocumentUpload />,
    2: <ClientCarePreferences />,
    3: <ClientReview />
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
        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} gutterBottom>
          Client Onboarding
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete your profile to get matched with the best support workers
        </Typography>
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
                const clickable = canGoTo(idx)
                const isLocked = status === 'locked'
                const prerequisite = isLocked ? getPrerequisiteStep(idx) : null
                
                const tooltipTitle = isLocked && prerequisite
                  ? `Complete "${prerequisite.label}" first`
                  : isStepCompleted(idx)
                  ? 'Completed ✓'
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
                              fontWeight: status === 'active' ? 600 : 400,
                              color: status === 'locked' ? 'text.disabled' : 'text.primary'
                            },
                            '& .MuiStepIcon-root': {
                              color: isLocked ? 'action.disabled' : undefined
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
                const clickable = canGoTo(idx)
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
              <Typography variant="body2" color="text.secondary">Loading...</Typography>
            </Box>
          ) : (
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