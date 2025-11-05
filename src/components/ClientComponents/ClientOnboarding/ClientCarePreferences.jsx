import React, { useMemo, useEffect } from 'react'
import { Box, Grid, TextField, MenuItem, Button, Divider, Stack, Typography, LinearProgress, Snackbar, Alert } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { useClientProfileQuery, useUpsertClientStepMutation, useClientOnboarding } from '../../../stores/useClientOnboardingStore'

const SUPPORT_CATEGORIES = ['core_supports', 'capacity_building', 'capital_supports', 'support_coordination', 'community_participation']
const PREFERRED_WORKER_GENDER = ['any', 'male', 'female', 'non-binary']
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export default function ClientCarePreferences() {
  const { data: profile } = useClientProfileQuery()
  const upsert = useUpsertClientStepMutation()
  const store = useClientOnboarding()
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })

  const defaultValues = useMemo(() => ({
    supportCategories: profile?.preferences?.supportCategories || [],
    serviceRegions: profile?.preferences?.serviceRegions || [],
    preferredWorkerGender: profile?.preferences?.preferredWorkerGender || 'any',
    supportDays: profile?.preferences?.supportDays || [],
    specialRequirements: profile?.preferences?.specialRequirements || '',
  }), [profile])

  const { register, handleSubmit, control, watch, reset } = useForm({ defaultValues })

  useEffect(() => {
    if (profile?.preferences) reset(defaultValues)
  }, [profile, reset, defaultValues])

  const localPct = useMemo(() => {
    const vals = watch()
    let done = 0
    if (Array.isArray(vals.supportCategories) && vals.supportCategories.length > 0) done++
    if (Array.isArray(vals.serviceRegions) && vals.serviceRegions.length > 0) done++
    return Math.round((done / 2) * 100)
  }, [watch])

  const onSubmit = (values) => {
    const payload = { preferences: values }
    upsert.mutate({ step: 3, payload }, {
      onSuccess: (data) => {
        setSnack({ open: true, message: 'Preferences saved successfully', severity: 'success' })
        // Auto-advance to next step if this step is now complete
        if (data?.profileCompleteness?.completedSteps?.preferences) {
          setTimeout(() => {
            store.goNext()
          }, 800)
        }
      },
      onError: (e) => setSnack({ open: true, message: e?.response?.data?.message || 'Save failed', severity: 'error' })
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Typography variant="caption" fontWeight={600}>Step 3 progress</Typography>
          <Typography variant="caption" fontWeight={600}>{localPct}%</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={localPct} />
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Support Categories (select at least one)</Typography>
          <Controller
            name="supportCategories"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                size="small"
                label="Support Categories"
                SelectProps={{ multiple: true, renderValue: (sel) => (sel).join(', ') }}
                {...field}
              >
                {SUPPORT_CATEGORIES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Service Regions (comma-separated postcodes/suburbs)</Typography>
          <Controller
            name="serviceRegions"
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                size="small"
                label="Service Regions"
                placeholder="e.g., 2000, Sydney, Parramatta"
                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  field.onChange(arr)
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField select fullWidth size="small" label="Preferred Worker Gender" defaultValue={defaultValues.preferredWorkerGender} {...register('preferredWorkerGender')}>
            {PREFERRED_WORKER_GENDER.map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="supportDays"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                size="small"
                label="Support Days (optional)"
                SelectProps={{ multiple: true, renderValue: (sel) => (sel).join(', ') }}
                {...field}
              >
                {DAYS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth size="small" multiline rows={3} label="Special Requirements (optional)" {...register('specialRequirements')} />
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 0.5 }} />
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Button variant="outlined" onClick={() => store.goPrev()} sx={{ textTransform: 'none' }}>Back</Button>
            <Stack direction="row" spacing={1}>
              <Button onClick={() => reset(defaultValues)} variant="text" sx={{ textTransform: 'none' }} disabled={upsert.isLoading}>Reset</Button>
              <Button type="submit" variant="contained" sx={{ textTransform: 'none' }} disabled={upsert.isLoading || localPct < 100}>Save & Continue</Button>
            </Stack>
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
