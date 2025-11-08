import React, { useMemo, useEffect } from 'react'
import { 
  Box, Grid, Button, Stack, Typography, 
  LinearProgress, Snackbar, Alert, Paper, Chip, alpha, useTheme,
  CircularProgress
} from '@mui/material'
import { useForm, FormProvider } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useClientOnboardingQuery, usePreferencesMutation, useClientOnboarding } from '../../../stores/useClientOnboardingStore'
import BasicPreferences from './components/BasicPreferences'
import WorkerPreferences from './components/WorkerPreferences'
import CulturalPreferences from './components/CulturalPreferences'

export default function ClientCarePreferences() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: onboardingData } = useClientOnboardingQuery()
  const profile = onboardingData?.data?.profile || null
  const { mutate: savePreferences, isPending: isSaving } = usePreferencesMutation()
  const store = useClientOnboarding()
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })
  
  const isStepComplete = profile?.profileCompleteness?.completedSteps?.preferences
  const isProfileComplete = profile?.profileCompleteness?.percentage === 100
  const accountType = profile?.accountType || 'individual'
  const isOrganization = accountType === 'organization'

  const defaultValues = useMemo(() => {
    const prefs = profile?.preferences || {}
    return {
      supportCategories: prefs.supportCategories || [],
      serviceRegions: prefs.serviceRegions || [],
      workerPreferences: {
        preferredGender: prefs.workerPreferences?.preferredGender || 'any',
        preferredAgeGroup: prefs.workerPreferences?.preferredAgeGroup || 'any',
        preferredExperienceAreas: prefs.workerPreferences?.preferredExperienceAreas || [],
        notes: prefs.workerPreferences?.notes || '',
      },
      culturalPreferences: {
        dietaryRequirements: {
          restrictions: prefs.culturalPreferences?.dietaryRequirements?.restrictions || [],
          allergyDetails: prefs.culturalPreferences?.dietaryRequirements?.allergyDetails || '',
        },
        religiousConsiderations: {
          faith: prefs.culturalPreferences?.religiousConsiderations?.faith || '',
          observances: prefs.culturalPreferences?.religiousConsiderations?.observances || [],
          genderSensitivity: prefs.culturalPreferences?.religiousConsiderations?.genderSensitivity || false,
        },
      },
      serviceDelivery: {
        inPerson: prefs.serviceDelivery?.inPerson ?? true,
        remote: prefs.serviceDelivery?.remote ?? false,
        preferredStartDate: prefs.serviceDelivery?.preferredStartDate || '',
        sessionDurationMins: prefs.serviceDelivery?.sessionDurationMins || 60,
      },
    }
  }, [profile])

  const methods = useForm({ defaultValues })
  const { handleSubmit, watch, reset, control } = methods

  useEffect(() => {
    if (profile?.preferences) reset(defaultValues)
  }, [profile, reset, defaultValues])

  const localPct = useMemo(() => {
    const vals = watch()
    let done = 0
    let total = 2 // supportCategories, serviceRegions
    if (Array.isArray(vals.supportCategories) && vals.supportCategories.length > 0) done++
    if (Array.isArray(vals.serviceRegions) && vals.serviceRegions.length > 0) done++
    return Math.round((done / total) * 100)
  }, [watch])

  // Helper function to format validation errors into user-friendly messages
  const formatValidationErrors = (errors) => {
    if (!Array.isArray(errors)) {
      return 'Please fill in all required fields correctly.'
    }

    const errorMap = {
      'supportCategories': 'Support Categories',
      'serviceRegions': 'Service Regions (Locations)'
    }

    const messages = errors.map((error) => {
      const field = error.path?.[error.path.length - 1]
      const fieldName = errorMap[field] || field || 'Field'
      
      if (error.code === 'invalid_type' && error.expected === 'array') {
        return `${fieldName} is required. Please select at least one option.`
      }
      if (error.message) {
        return `${fieldName}: ${error.message}`
      }
      return `${fieldName} is invalid.`
    })

    if (messages.length === 1) {
      return messages[0]
    }
    return `Please complete the following:\n• ${messages.join('\n• ')}`
  }

  // Form submission handler
  // Cleans up empty values and nested objects before sending to backend
  const onSubmit = (values) => {
    // Ensure required arrays are always arrays (not undefined)
    const sanitizedValues = {
      ...values,
      supportCategories: Array.isArray(values.supportCategories) ? values.supportCategories : [],
      serviceRegions: Array.isArray(values.serviceRegions) ? values.serviceRegions : []
    }

    // Helper function to prune empty values and nested empty objects
    const pruneEmptyValues = (obj) => {
      if (!obj || typeof obj !== 'object') return obj
      if (Array.isArray(obj)) {
        const filtered = obj.filter(item => item !== '' && item !== null && item !== undefined)
        return filtered.length > 0 ? filtered : undefined
      }
      const cleaned = {}
      Object.keys(obj).forEach((key) => {
        const value = obj[key]
        if (value === '' || value === null || value === undefined) return
        if (Array.isArray(value) && value.length === 0) return
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nested = pruneEmptyValues(value)
          if (nested && Object.keys(nested).length > 0) {
            cleaned[key] = nested
          }
        } else {
          cleaned[key] = value
        }
      })
      return Object.keys(cleaned).length > 0 ? cleaned : undefined
    }

    // Clean up cultural preferences nested structure
    const cleanedCulturalPreferences = pruneEmptyValues(sanitizedValues.culturalPreferences)
    
    const payload = { 
      preferences: {
        ...sanitizedValues,
        culturalPreferences: cleanedCulturalPreferences
      }
    }
    
    const wasComplete = profile?.profileCompleteness?.percentage === 100
    
    savePreferences(payload, {
      onSuccess: (data) => {
        const isNowComplete = data?.data?.isComplete || data?.data?.profileCompletion?.percentage === 100
        
        // Show appropriate message
        if (isNowComplete && !wasComplete) {
          // First time completion
          toast.success('Onboarding complete! Your profile has been submitted for review.')
          setSnack({ 
            open: true, 
            message: 'Onboarding complete! Redirecting to dashboard...', 
            severity: 'success',
            autoHideDuration: 2000
          })
          // Navigate to dashboard on first completion
          setTimeout(() => {
            navigate('/client-dashboard', { replace: true })
          }, 2000)
        } else {
          toast.success(data.message || 'Preferences saved successfully!')
          setSnack({ 
            open: true, 
            message: 'Preferences saved successfully!', 
            severity: 'success',
            autoHideDuration: 3000
          })
        }
      },
      onError: (error) => {
        // Handle validation errors from backend
        let errorMessage = 'Save failed. Please try again.'
        
        if (error?.response?.data?.errors) {
          // Zod validation errors
          errorMessage = formatValidationErrors(error.response.data.errors)
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        
        toast.error(errorMessage)
        setSnack({ 
          open: true, 
          message: errorMessage, 
          severity: 'error',
          autoHideDuration: 6000
        })
      }
    })
  }

  return (
    <FormProvider {...methods}>
      <Box 
        component="form" 
        onSubmit={handleSubmit(onSubmit)} 
        noValidate
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '1600px', xl: '1800px' },
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
          py: { xs: 3, sm: 4, md: 5 },
          minHeight: '100vh',
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        {/* Progress Header */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: { xs: 3, sm: 4, md: 5 },
            p: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="subtitle2" fontWeight={700} color="primary">
                Step 2: Care Preferences
              </Typography>
              {isStepComplete && (
                <Chip 
                  label="Saved" 
                  color="success" 
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
            <Chip 
              label={`${localPct}% Complete`} 
              size="small" 
              color={localPct === 100 ? 'success' : 'primary'}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={localPct} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: localPct === 100 
                  ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                  : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
              }
            }} 
          />
        </Paper>
        
        {isProfileComplete && isStepComplete && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: { xs: 3, sm: 4 }, 
              borderRadius: 3,
              fontSize: '0.95rem',
              '& .MuiAlert-icon': {
                fontSize: '1.5rem'
              }
            }}
          >
            Your preferences data is loaded from the database. You can review and make changes without needing to save to navigate.
          </Alert>
        )}

        <Grid container spacing={{ xs: 2.5, sm: 3, md: 4 }}>
          {/* Basic Preferences */}
          <Grid item xs={12}>
            <BasicPreferences isOrganization={isOrganization} />
          </Grid>

          {/* Worker Preferences */}
          <Grid item xs={12}>
            <WorkerPreferences isOrganization={isOrganization} />
          </Grid>

          {/* Cultural Preferences */}
          <Grid item xs={12}>
            <CulturalPreferences isOrganization={isOrganization} />
          </Grid>

          {/* Navigation Buttons */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                borderRadius: 4,
                mt: { xs: 3, sm: 4, md: 5 },
                bgcolor: alpha(theme.palette.grey[500], 0.06),
                border: `2px solid ${alpha(theme.palette.divider, 0.12)}`,
                boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`
              }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="space-between" 
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={2}
              >
                <Button 
                  variant="outlined" 
                  onClick={() => store.prevStep()} 
                  size="large"
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 3,
                    px: { xs: 4, sm: 5 },
                    py: { xs: 1.5, sm: 1.75 },
                    fontWeight: 700,
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    minWidth: { xs: '100%', sm: 140 },
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                    },
                    transition: 'all 0.2s ease'
                  }}
                  disabled={isSaving}
                >
                  Back
                </Button>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large"
                    sx={{ 
                      textTransform: 'none',
                      borderRadius: 3,
                      px: { xs: 4, sm: 5 },
                      py: { xs: 1.5, sm: 1.75 },
                      minWidth: { xs: '100%', sm: 200 },
                      fontWeight: 700,
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                      '&:hover': {
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.45)}`,
                        transform: 'translateY(-3px)'
                      },
                      transition: 'all 0.2s ease'
                    }} 
                    disabled={isSaving}
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={20} sx={{ color: 'inherit' }} />
                      ) : null
                    }
                  >
                    {isSaving 
                      ? 'Saving...' 
                      : localPct === 100 
                        ? 'Save & Complete' 
                        : 'Save & Continue'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Snackbar 
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
          open={snack.open} 
          autoHideDuration={snack.autoHideDuration || 3000}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
        >
          <Alert 
            onClose={() => setSnack(s => ({ ...s, open: false }))} 
            severity={snack.severity} 
            sx={{ 
              width: '100%',
              whiteSpace: 'pre-line', // Allow line breaks in error messages
              '& .MuiAlert-message': {
                maxWidth: 400
              }
            }}
          >
            {snack.message}
          </Alert>
        </Snackbar>
      </Box>
    </FormProvider>
  )
}
