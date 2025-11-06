import React, { useMemo, useEffect } from 'react'
import { Box, Grid, TextField, MenuItem, Button, Paper, Chip, Snackbar, Alert, LinearProgress, Typography, Stack, Divider } from '@mui/material'
import { useForm } from 'react-hook-form'
import { useClientProfileQuery, useUpsertClientStepMutation, useClientOnboarding } from '../../../stores/useClientOnboardingStore'
import { useAuth } from '../../../context/AuthContext'

const ACCOUNT_TYPES = ['individual', 'organization']

export default function ClientProfile() {
  const { user } = useAuth()
  const { data: profile } = useClientProfileQuery()
  const upsert = useUpsertClientStepMutation()
  const store = useClientOnboarding()
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })
  
  const defaultValues = useMemo(() => ({
    accountType: profile?.accountType || 'individual',
    organizationName: profile?.organizationName || '',
    abn: profile?.abn || '',
    ndisNumber: profile?.ndisNumber || '',
    address: {
      street: profile?.address?.street || '',
      suburb: profile?.address?.suburb || '',
      state: profile?.address?.state || '',
      postcode: profile?.address?.postcode || '',
    },
    emergencyContact: {
      name: profile?.emergencyContact?.name || '',
      phone: profile?.emergencyContact?.phone || '',
    },
  }), [profile])

  const { register, handleSubmit, watch, reset } = useForm({ defaultValues })
  const accountType = watch('accountType')

  // Rehydrate form when profile data loads/changes
  useEffect(() => {
    if (profile) {
      reset(defaultValues)
    }
  }, [profile, reset, defaultValues])

  const localPct = React.useMemo(() => {
    const data = { ...defaultValues, ...watch() }
    const isOrg = data.accountType === 'organization'
    let total = 4 + (isOrg ? 2 : 0)
    let done = 0
    if (data.address?.street) done++
    if (data.address?.suburb) done++
    if (data.address?.state) done++
    if (data.address?.postcode) done++
    if (isOrg) {
      if (data.organizationName) done++
      if (data.abn) done++
    }
    return Math.round((done / total) * 100)
  }, [defaultValues, watch])

  const onSubmit = (values) => {
    // Ensure conditional fields
    if (values.accountType === 'individual') {
      values.organizationName = undefined
      values.abn = undefined
    }
    // Prune empty strings for optional fields
    const prune = (obj) => {
      if (!obj || typeof obj !== 'object') return obj
      const out = Array.isArray(obj) ? [] : {}
      Object.keys(obj).forEach((k) => {
        const v = obj[k]
        if (v === '' || v === null) return
        if (typeof v === 'object') {
          const n = prune(v)
          if (n && ((Array.isArray(n) && n.length) || (!Array.isArray(n) && Object.keys(n).length))) out[k] = n
        } else {
          out[k] = v
        }
      })
      return out
    }
    const payload = prune(values)
    const isComplete = profile?.profileCompleteness?.percentage === 100
    
    upsert.mutate({ step: 1, payload }, {
      onSuccess: (data) => {
        setSnack({ open: true, message: 'Profile saved successfully', severity: 'success' })
        // Only auto-advance if profile is not already complete and step is now complete
        if (!isComplete && data?.profileCompleteness?.completedSteps?.basicInformation) {
          setTimeout(() => {
            store.goNext()
          }, 800)
        }
      },
      onError: (e) => setSnack({ open: true, message: e?.response?.data?.message || 'Save failed', severity: 'error' })
    })
  }

  const isStepComplete = profile?.profileCompleteness?.completedSteps?.basicInformation
  const isProfileComplete = profile?.profileCompleteness?.percentage === 100

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Chip label={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Name'} />
            <Chip label={user?.email || 'Email'} />
            {user?.phone ? <Chip label={user.phone} /> : null}
            {isStepComplete && (
              <Chip 
                label="Saved" 
                color="success" 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
          <Stack sx={{ minWidth: { xs: '100%', sm: 260 } }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="caption" fontWeight={600}>Step 1 progress</Typography>
              <Typography variant="caption" fontWeight={600}>{localPct}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={localPct} />
          </Stack>
        </Stack>
      </Paper>
      
      {isProfileComplete && isStepComplete && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Your profile data is loaded from the database. You can review and make changes without needing to save to navigate.
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField select fullWidth size="small" label="Account Type" defaultValue={defaultValues.accountType} {...register('accountType')}>
            {ACCOUNT_TYPES.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>
        </Grid>
        {accountType !== 'individual' ? (
          <>
            <Grid item xs={12} md={5}>
              <TextField fullWidth size="small" label="Organization Name" {...register('organizationName')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" label="ABN" {...register('abn')} />
            </Grid>
          </>
        ) : null}
        <Grid item xs={12} md={4}>
          <TextField fullWidth size="small" label="NDIS Number (optional)" {...register('ndisNumber')} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Street" {...register('address.street')} />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField fullWidth size="small" label="Suburb" {...register('address.suburb')} />
        </Grid>
        <Grid item xs={12} md={1.5}>
          <TextField fullWidth size="small" label="State" {...register('address.state')} />
        </Grid>
        <Grid item xs={12} md={1.5}>
          <TextField fullWidth size="small" label="Postcode" {...register('address.postcode')} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Emergency Contact Name (optional)" {...register('emergencyContact.name')} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField fullWidth size="small" label="Emergency Contact Phone (optional)" {...register('emergencyContact.phone')} />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 0.5 }} />
          <Stack direction="row" justifyContent="flex-end" alignItems="center" sx={{ mt: 1 }}>
            <Button type="submit" variant="contained" sx={{ textTransform: 'none' }} disabled={upsert.isLoading}>Save & Continue</Button>
          </Stack>
        </Grid>
      </Grid>
      <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}