import React, { useEffect } from 'react'
import { Box, Grid, Typography, Button, Divider, Stack, Checkbox, FormControlLabel, Snackbar, Alert, Paper, Chip, LinearProgress } from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { useClientProfileQuery, useUpsertClientStepMutation, useClientOnboarding } from '../../../stores/useClientOnboardingStore'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ClientReview() {
  const { user } = useAuth()
  const { data: profile } = useClientProfileQuery()
  const upsert = useUpsertClientStepMutation()
  const store = useClientOnboarding()
  const navigate = useNavigate()
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      termsAccepted: profile?.agreements?.termsAccepted || false,
      privacyAccepted: profile?.agreements?.privacyAccepted || false,
    }
  })

  // Update form when profile loads
  useEffect(() => {
    if (profile?.agreements) {
      setValue('termsAccepted', profile.agreements.termsAccepted || false)
      setValue('privacyAccepted', profile.agreements.privacyAccepted || false)
    }
  }, [profile, setValue])

  const termsAccepted = watch('termsAccepted')
  const privacyAccepted = watch('privacyAccepted')
  const canSubmit = termsAccepted && privacyAccepted

  const onSubmit = (values) => {
    const payload = { agreements: values }
    upsert.mutate({ step: 4, payload }, {
      onSuccess: () => {
        setSnack({ open: true, message: 'Onboarding complete! Redirecting to dashboard...', severity: 'success' })
        // Redirect to dashboard after successful submission
        setTimeout(() => {
          navigate('/client-dashboard')
        }, 2000)
      },
      onError: (e) => setSnack({ open: true, message: e?.response?.data?.message || 'Submit failed', severity: 'error' })
    })
  }

  const isComplete = profile?.profileCompleteness?.percentage === 100

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Review & Submit
      </Typography>

      {/* Completion Status */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: isComplete ? 'success.50' : 'warning.50' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {isComplete ? (
            <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />
          ) : (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <LinearProgress variant="indeterminate" sx={{ width: 32, height: 32 }} />
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {isComplete ? 'Profile Complete!' : 'Profile In Progress'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isComplete 
                ? 'All required information has been provided. Review and submit for approval.'
                : 'Please complete all previous steps before final submission.'
              }
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Personal Information */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
          Personal Information
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip label={`${user?.firstName || ''} ${user?.lastName || ''}`} size="small" />
          <Chip label={user?.email || 'N/A'} size="small" />
          {user?.phone && <Chip label={user.phone} size="small" />}
        </Stack>
      </Paper>

      {/* Profile Details */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: profile?.profileCompleteness?.completedSteps?.basicInformation ? 'success.main' : 'text.disabled', fontSize: 20 }} />
          Profile Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary">Account Type</Typography>
            <Typography variant="body2" fontWeight={500}>{profile?.accountType || 'N/A'}</Typography>
          </Grid>
          {profile?.accountType === 'organization' && (
            <>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Organization Name</Typography>
                <Typography variant="body2" fontWeight={500}>{profile?.organizationName || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">ABN</Typography>
                <Typography variant="body2" fontWeight={500}>{profile?.abn || 'N/A'}</Typography>
              </Grid>
            </>
          )}
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Address</Typography>
            <Typography variant="body2" fontWeight={500}>
              {profile?.address 
                ? `${profile.address.street}, ${profile.address.suburb}, ${profile.address.state} ${profile.address.postcode}` 
                : 'N/A'
              }
            </Typography>
          </Grid>
          {profile?.ndisNumber && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">NDIS Number</Typography>
              <Typography variant="body2" fontWeight={500}>{profile.ndisNumber}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Care Preferences */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: profile?.profileCompleteness?.completedSteps?.preferences ? 'success.main' : 'text.disabled', fontSize: 20 }} />
          Care Preferences
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Support Categories</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {profile?.preferences?.supportCategories?.length > 0 
                ? profile.preferences.supportCategories.map((cat, idx) => (
                    <Chip key={idx} label={cat} size="small" variant="outlined" />
                  ))
                : <Typography variant="body2">Not specified</Typography>
              }
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Service Regions</Typography>
            <Typography variant="body2" fontWeight={500}>
              {profile?.preferences?.serviceRegions?.join(', ') || 'N/A'}
            </Typography>
          </Grid>
          {profile?.preferences?.preferredWorkerGender && (
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">Preferred Worker Gender</Typography>
              <Typography variant="body2" fontWeight={500}>{profile.preferences.preferredWorkerGender}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Agreements */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
          Final Agreements
        </Typography>
        <Stack spacing={1}>
          <FormControlLabel 
            control={<Checkbox {...register('termsAccepted')} />} 
            label={<Typography variant="body2">I accept the Terms and Conditions</Typography>}
          />
          <FormControlLabel 
            control={<Checkbox {...register('privacyAccepted')} />} 
            label={<Typography variant="body2">I accept the Privacy Policy</Typography>}
          />
        </Stack>
      </Paper>

      {/* Navigation Buttons */}
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" justifyContent="space-between">
        <Button 
          variant="outlined" 
          onClick={() => store.goPrev()} 
          sx={{ textTransform: 'none' }}
          disabled={upsert.isLoading}
        >
          Back
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          sx={{ textTransform: 'none' }} 
          disabled={upsert.isLoading || !canSubmit}
        >
          {upsert.isLoading ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </Stack>

      {/* Toast Notification */}
      <Snackbar 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
        open={snack.open} 
        autoHideDuration={5000} 
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      >
        <Alert 
          onClose={() => setSnack(s => ({ ...s, open: false }))} 
          severity={snack.severity} 
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
