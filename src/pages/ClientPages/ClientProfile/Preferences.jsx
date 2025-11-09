/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT PREFERENCES - Profile Management Page
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready preferences management page with view/edit modes.
 * Uses TanStack Query for efficient data fetching and caching.
 * 
 * Features:
 * - View mode: Display current preferences
 * - Edit mode: Form with validation
 * - Support categories selection
 * - Service regions management
 * - Worker preferences configuration
 * - Service delivery options
 * 
 * @module pages/ClientPages/ClientProfile/Preferences
 */

import React, { useMemo, useEffect, useState, useCallback } from 'react'
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Chip,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  alpha,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material'
import {
  Favorite as FavoriteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  CheckCircle,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import { usePreferences } from '../../../stores/useClientProfileStore'
import { useAuth } from '../../../context/AuthContext'
import { toast } from 'react-hot-toast'
import { formatApiError } from '../../../utils/errorFormatter'
import {
  SUPPORT_CATEGORIES,
  SUPPORT_CATEGORY_LABELS,
  PREFERRED_WORKER_GENDER,
  PREFERRED_WORKER_GENDER_LABELS,
  PREFERRED_AGE_GROUP,
  PREFERRED_AGE_GROUP_LABELS,
} from '../../../components/ClientComponents/ClientOnboarding/constants'

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const preferencesSchema = z.object({
  supportCategories: z.array(z.enum(SUPPORT_CATEGORIES)).min(1, 'At least one support category is required'),
  serviceRegions: z.array(z.string().min(1)).min(1, 'At least one service region is required'),
  workerPreferences: z.object({
    preferredGender: z.enum(PREFERRED_WORKER_GENDER).optional(),
    preferredAgeGroup: z.enum(PREFERRED_AGE_GROUP).optional(),
    preferredExperienceAreas: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }).optional(),
  serviceDelivery: z.object({
    inPerson: z.boolean().optional(),
    remote: z.boolean().optional(),
    sessionDurationMins: z.number().int().positive().optional(),
  }).optional(),
  specialRequirements: z.string().optional(),
})

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Preferences = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topOffset, setTopOffset] = useState(64)
  const [isEditMode, setIsEditMode] = useState(false)
  const [serviceRegionInput, setServiceRegionInput] = useState('')

  // TanStack Query hook
  const { data: preferences, isLoading, isError, error, update, isUpdating } = usePreferences()

  // Measure navbar height
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

  // Form setup
  const defaultValues = useMemo(
    () => ({
      supportCategories: preferences?.supportCategories || [],
      serviceRegions: preferences?.serviceRegions || [],
      workerPreferences: {
        preferredGender: preferences?.workerPreferences?.preferredGender || 'any',
        preferredAgeGroup: preferences?.workerPreferences?.preferredAgeGroup || 'any',
        preferredExperienceAreas: preferences?.workerPreferences?.preferredExperienceAreas || [],
        notes: preferences?.workerPreferences?.notes || '',
      },
      serviceDelivery: {
        inPerson: preferences?.serviceDelivery?.inPerson ?? true,
        remote: preferences?.serviceDelivery?.remote ?? false,
        sessionDurationMins: preferences?.serviceDelivery?.sessionDurationMins || 60,
      },
      specialRequirements: preferences?.specialRequirements || '',
    }),
    [preferences]
  )

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
    setValue,
  } = useForm({
    defaultValues,
    resolver: zodResolver(preferencesSchema),
    mode: 'onBlur',
  })

  const watchedSupportCategories = watch('supportCategories')
  const watchedServiceRegions = watch('serviceRegions')

  // Reset form when data changes
  useEffect(() => {
    if (preferences && !isEditMode) {
      reset(defaultValues)
    }
  }, [preferences, isEditMode, defaultValues, reset])

  // Add service region
  const handleAddServiceRegion = useCallback(() => {
    if (serviceRegionInput.trim()) {
      const current = watchedServiceRegions || []
      if (!current.includes(serviceRegionInput.trim())) {
        setValue('serviceRegions', [...current, serviceRegionInput.trim()], { shouldValidate: true })
        setServiceRegionInput('')
      }
    }
  }, [serviceRegionInput, watchedServiceRegions, setValue])

  // Remove service region
  const handleRemoveServiceRegion = useCallback(
    (region) => {
      const current = watchedServiceRegions || []
      setValue('serviceRegions', current.filter((r) => r !== region), { shouldValidate: true })
    },
    [watchedServiceRegions, setValue]
  )

  // Form submission
  const onSubmit = useCallback(
    (values) => {
      update(values, {
        onSuccess: () => {
          setIsEditMode(false)
          toast.success('Preferences updated successfully')
        },
        onError: (error) => {
          const message = formatApiError(error)
          toast.error(message)
        },
      })
    },
    [update]
  )

  // Toggle edit mode
  const handleEditClick = useCallback(() => {
    setIsEditMode(true)
    reset(defaultValues)
  }, [reset, defaultValues])

  const handleCancelClick = useCallback(() => {
    setIsEditMode(false)
    reset(defaultValues)
    setServiceRegionInput('')
  }, [reset, defaultValues])

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={48} />
              <Typography variant="body1" color="text.secondary">
                Loading preferences...
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    )
  }

  // Error state
  if (isError) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
            }}
          >
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Error Loading Preferences
              </Typography>
              <Typography variant="body2">{error?.message || 'Failed to load your preferences.'}</Typography>
            </Alert>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <WorkerNavbar />

      <Box sx={{ display: 'flex', width: '100%' }}>
        <ClientSidebar topOffset={topOffset} navigate={navigate} />

        <Box
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
            minWidth: 0,
            pt: { xs: 10, md: 8.7 },
            px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
            pb: { xs: 4, sm: 5, md: 6 },
          }}
        >
          <Box
            sx={{
              maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '1400px', xl: '1600px' },
              mx: 'auto',
              width: '100%',
            }}
          >
            <Stack spacing={3}>
              {/* Header Card */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        <FavoriteIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="text.primary">
                          Care Preferences
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manage your support needs and worker preferences
                        </Typography>
                      </Box>
                    </Stack>
                    {!isEditMode && (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleEditClick}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              {/* Form Card */}
              <Paper
                component={isEditMode ? 'form' : 'div'}
                onSubmit={isEditMode ? handleSubmit(onSubmit) : undefined}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  overflow: 'hidden',
                }}
              >
                {/* Support Categories */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <CategoryIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Support Categories
                        </Typography>
                      </Stack>
                      <Chip size="small" label="Required" color="error" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                    </Stack>

                    {isEditMode ? (
                      <Controller
                        name="supportCategories"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            required
                            size={isMobile ? 'small' : 'medium'}
                            label="Support Categories *"
                            SelectProps={{
                              multiple: true,
                              renderValue: (selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                  {selected.map((value) => (
                                    <Chip
                                      key={value}
                                      label={SUPPORT_CATEGORY_LABELS[value] || value}
                                      size="small"
                                      sx={{
                                        height: 28,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                        color: theme.palette.primary.main,
                                      }}
                                    />
                                  ))}
                                </Box>
                              ),
                            }}
                            error={!!errors.supportCategories}
                            helperText={errors.supportCategories?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                              },
                            }}
                            {...field}
                          >
                            {SUPPORT_CATEGORIES.map((category) => (
                              <MenuItem key={category} value={category}>
                                {SUPPORT_CATEGORY_LABELS[category] || category}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    ) : (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {preferences?.supportCategories?.map((category, idx) => (
                          <Chip
                            key={idx}
                            label={SUPPORT_CATEGORY_LABELS[category] || category}
                            size="small"
                            color="primary"
                          />
                        ))}
                        {(!preferences?.supportCategories || preferences.supportCategories.length === 0) && (
                          <Typography variant="body2" color="text.secondary">
                            No support categories selected
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Service Regions */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <LocationOnIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Service Regions
                        </Typography>
                      </Stack>
                      <Chip size="small" label="Required" color="error" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                    </Stack>

                    {isEditMode ? (
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            label="Add Service Region"
                            placeholder="e.g., Perth, WA"
                            value={serviceRegionInput}
                            onChange={(e) => setServiceRegionInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddServiceRegion()
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                          <Button
                            variant="contained"
                            onClick={handleAddServiceRegion}
                            disabled={!serviceRegionInput.trim()}
                            sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
                          >
                            Add
                          </Button>
                        </Stack>
                        {watchedServiceRegions && watchedServiceRegions.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {watchedServiceRegions.map((region, idx) => (
                              <Chip
                                key={idx}
                                label={region}
                                onDelete={() => handleRemoveServiceRegion(region)}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                        {errors.serviceRegions && (
                          <Typography variant="caption" color="error">
                            {errors.serviceRegions.message}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {preferences?.serviceRegions?.map((region, idx) => (
                          <Chip key={idx} label={region} size="small" variant="outlined" />
                        ))}
                        {(!preferences?.serviceRegions || preferences.serviceRegions.length === 0) && (
                          <Typography variant="body2" color="text.secondary">
                            No service regions set
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Worker Preferences */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <PersonIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        Worker Preferences
                      </Typography>
                    </Stack>

                    {isEditMode ? (
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name="workerPreferences.preferredGender"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                select
                                fullWidth
                                size={isMobile ? 'small' : 'medium'}
                                label="Preferred Gender"
                                {...field}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                  },
                                }}
                              >
                                {PREFERRED_WORKER_GENDER.map((gender) => (
                                  <MenuItem key={gender} value={gender}>
                                    {PREFERRED_WORKER_GENDER_LABELS[gender] || gender}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name="workerPreferences.preferredAgeGroup"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                select
                                fullWidth
                                size={isMobile ? 'small' : 'medium'}
                                label="Preferred Age Group"
                                {...field}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                  },
                                }}
                              >
                                {PREFERRED_AGE_GROUP.map((age) => (
                                  <MenuItem key={age} value={age}>
                                    {PREFERRED_AGE_GROUP_LABELS[age] || age}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            size={isMobile ? 'small' : 'medium'}
                            label="Notes (Optional)"
                            placeholder="Any additional notes about worker preferences..."
                            {...register('workerPreferences.notes')}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                            Preferred Gender
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {PREFERRED_WORKER_GENDER_LABELS[preferences?.workerPreferences?.preferredGender] || 'Any'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                            Preferred Age Group
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {PREFERRED_AGE_GROUP_LABELS[preferences?.workerPreferences?.preferredAgeGroup] || 'Any'}
                          </Typography>
                        </Grid>
                        {preferences?.workerPreferences?.notes && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                              Notes
                            </Typography>
                            <Typography variant="body2">{preferences.workerPreferences.notes}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Service Delivery */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.grey[100], 0.4) }}>
                  <Stack spacing={2.5}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Service Delivery
                    </Typography>

                    {isEditMode ? (
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name="serviceDelivery.inPerson"
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Checkbox {...field} checked={field.value ?? true} />}
                                label="In Person"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name="serviceDelivery.remote"
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Checkbox {...field} checked={field.value ?? false} />}
                                label="Remote"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name="serviceDelivery.sessionDurationMins"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                fullWidth
                                type="number"
                                size={isMobile ? 'small' : 'medium'}
                                label="Session Duration (minutes)"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={4}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {preferences?.serviceDelivery?.inPerson ? (
                              <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                            ) : null}
                            <Typography variant="body2">In Person</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {preferences?.serviceDelivery?.remote ? (
                              <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                            ) : null}
                            <Typography variant="body2">Remote</Typography>
                          </Stack>
                        </Grid>
                        {preferences?.serviceDelivery?.sessionDurationMins && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2">
                              Duration: {preferences.serviceDelivery.sessionDurationMins} mins
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                {isEditMode && (
                  <>
                    <Divider />
                    <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={handleCancelClick}
                          disabled={isUpdating}
                          startIcon={<CancelIcon />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isUpdating || !isDirty}
                          startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                            minWidth: 120,
                          }}
                        >
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Stack>
                    </Box>
                  </>
                )}
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Preferences

