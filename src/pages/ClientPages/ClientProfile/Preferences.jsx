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
  Diversity3 as Diversity3Icon,
  Restaurant as RestaurantIcon,
  Mosque as MosqueIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import { usePreferences, useClientProfile } from '../../../stores/useClientProfileStore'
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
  DAYS,
  TIME_SLOTS,
  DIETARY_RESTRICTIONS,
  DIETARY_RESTRICTION_LABELS,
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
  culturalPreferences: z.object({
    dietaryRequirements: z.object({
      restrictions: z.array(z.enum(DIETARY_RESTRICTIONS)).optional(),
      allergyDetails: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    religiousConsiderations: z.object({
      faith: z.string().optional(),
      observances: z.array(z.string()).optional(),
      genderSensitivity: z.boolean().optional(),
      notes: z.string().optional(),
    }).optional(),
    lifestyleNotes: z.object({
      habits: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      values: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }).optional(),
  }).optional(),
  availability: z.array(z.object({
    day: z.enum(DAYS),
    timeSlots: z.array(z.enum(TIME_SLOTS)),
  })).optional(),
  serviceDelivery: z.object({
    inPerson: z.boolean().optional(),
    remote: z.boolean().optional(),
    preferredStartDate: z.string().optional(),
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
  const [accessibilityInput, setAccessibilityInput] = useState('')
  const [observanceInput, setObservanceInput] = useState('')
  const [habitInput, setHabitInput] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [valueInput, setValueInput] = useState('')

  // TanStack Query hooks
  const { data: preferences, isLoading, isError, error, update, isUpdating } = usePreferences()
  const { data: profile } = useClientProfile() // Get profile to check account type

  // PRODUCTION-READY: Check account type - Organizations cannot access preferences
  const accountType = profile?.accountType || 'individual'
  const isOrganization = accountType === 'organization'

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
      culturalPreferences: {
        dietaryRequirements: {
          restrictions: preferences?.culturalPreferences?.dietaryRequirements?.restrictions || [],
          allergyDetails: preferences?.culturalPreferences?.dietaryRequirements?.allergyDetails || '',
          notes: preferences?.culturalPreferences?.dietaryRequirements?.notes || '',
        },
        religiousConsiderations: {
          faith: preferences?.culturalPreferences?.religiousConsiderations?.faith || '',
          observances: preferences?.culturalPreferences?.religiousConsiderations?.observances || [],
          genderSensitivity: preferences?.culturalPreferences?.religiousConsiderations?.genderSensitivity || false,
          notes: preferences?.culturalPreferences?.religiousConsiderations?.notes || '',
        },
        lifestyleNotes: {
          habits: preferences?.culturalPreferences?.lifestyleNotes?.habits || [],
          interests: preferences?.culturalPreferences?.lifestyleNotes?.interests || [],
          values: preferences?.culturalPreferences?.lifestyleNotes?.values || [],
          notes: preferences?.culturalPreferences?.lifestyleNotes?.notes || '',
        },
      },
      availability: preferences?.availability || [],
      serviceDelivery: {
        inPerson: preferences?.serviceDelivery?.inPerson ?? true,
        remote: preferences?.serviceDelivery?.remote ?? false,
        preferredStartDate: preferences?.serviceDelivery?.preferredStartDate 
          ? format(new Date(preferences.serviceDelivery.preferredStartDate), 'yyyy-MM-dd')
          : '',
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
  const watchedAvailability = watch('availability')
  const watchedDietaryRestrictions = watch('culturalPreferences.dietaryRequirements.restrictions')
  const watchedObservances = watch('culturalPreferences.religiousConsiderations.observances')
  const watchedHabits = watch('culturalPreferences.lifestyleNotes.habits')
  const watchedInterests = watch('culturalPreferences.lifestyleNotes.interests')
  const watchedValues = watch('culturalPreferences.lifestyleNotes.values')

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

  // Availability helpers
  const handleToggleAvailability = useCallback(
    (day, timeSlot) => {
      const current = watchedAvailability || []
      const dayIndex = current.findIndex((a) => a.day === day)
      
      if (dayIndex === -1) {
        // Add new day with time slot
        setValue('availability', [...current, { day, timeSlots: [timeSlot] }], { shouldValidate: true })
      } else {
        const dayData = current[dayIndex]
        const hasTimeSlot = dayData.timeSlots.includes(timeSlot)
        
        if (hasTimeSlot) {
          // Remove time slot
          const newTimeSlots = dayData.timeSlots.filter((ts) => ts !== timeSlot)
          if (newTimeSlots.length === 0) {
            // Remove day if no time slots left
            setValue('availability', current.filter((a) => a.day !== day), { shouldValidate: true })
          } else {
            // Update day with remaining time slots
            const updated = [...current]
            updated[dayIndex] = { ...dayData, timeSlots: newTimeSlots }
            setValue('availability', updated, { shouldValidate: true })
          }
        } else {
          // Add time slot to existing day
          const updated = [...current]
          updated[dayIndex] = { ...dayData, timeSlots: [...dayData.timeSlots, timeSlot] }
          setValue('availability', updated, { shouldValidate: true })
        }
      }
    },
    [watchedAvailability, setValue]
  )

  // Array input helpers
  const handleAddArrayItem = useCallback(
    (fieldPath, inputValue, setInput) => {
      if (inputValue.trim()) {
        const current = watch(fieldPath) || []
        if (!current.includes(inputValue.trim())) {
          setValue(fieldPath, [...current, inputValue.trim()], { shouldValidate: true })
          setInput('')
        }
      }
    },
    [watch, setValue]
  )

  const handleRemoveArrayItem = useCallback(
    (fieldPath, item) => {
      const current = watch(fieldPath) || []
      setValue(fieldPath, current.filter((i) => i !== item), { shouldValidate: true })
    },
    [watch, setValue]
  )

  // Form submission
  const onSubmit = useCallback(
    (values) => {
      const payload = {
        ...values,
        serviceDelivery: {
          ...values.serviceDelivery,
          preferredStartDate: values.serviceDelivery?.preferredStartDate
            ? new Date(values.serviceDelivery.preferredStartDate).toISOString()
            : undefined,
        },
      }
      update(payload, {
        onSuccess: () => {
          setIsEditMode(false)
          // Toast is handled in the store hook
        },
        onError: () => {
          // Toast is handled in the store hook
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
    setObservanceInput('')
    setHabitInput('')
    setInterestInput('')
    setValueInput('')
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
  // PRODUCTION-READY: Show error message for organizations
  if (isOrganization) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flex: 1,
              ml: { md: `${CLIENT_SIDEBAR_WIDTH}px` },
              pt: `${topOffset}px`,
              px: { xs: 2, sm: 3, md: 4 },
              py: 4,
            }}
          >
            <Alert severity="info" sx={{ borderRadius: 2, maxWidth: 800, mx: 'auto' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Preferences Not Available
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Organizations cannot set profile preferences. Each job you post can have unique requirements and preferences.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/client/dashboard')}
                sx={{ mt: 1 }}
              >
                Go to Dashboard
              </Button>
            </Alert>
          </Box>
        </Box>
      </Box>
    )
  }

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

                {/* Cultural Preferences */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Diversity3Icon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Cultural Preferences
                        </Typography>
                      </Stack>
                      <Chip size="small" label="Optional" color="info" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                    </Stack>

                    {isEditMode ? (
                      <Grid container spacing={2.5}>
                        {/* Dietary Requirements */}
                        <Grid item xs={12}>
                          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                            <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <RestaurantIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  Dietary Requirements
                                </Typography>
                              </Stack>
                              <Controller
                                name="culturalPreferences.dietaryRequirements.restrictions"
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    select
                                    fullWidth
                                    size={isMobile ? 'small' : 'medium'}
                                    label="Dietary Restrictions"
                                    SelectProps={{
                                      multiple: true,
                                      renderValue: (selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                          {selected.map((value) => (
                                            <Chip
                                              key={value}
                                              label={DIETARY_RESTRICTION_LABELS[value] || value}
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
                                    {...field}
                                    value={field.value || []}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                      },
                                    }}
                                  >
                                    {DIETARY_RESTRICTIONS.map((restriction) => (
                                      <MenuItem key={restriction} value={restriction}>
                                        {DIETARY_RESTRICTION_LABELS[restriction] || restriction}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                )}
                              />
                              <TextField
                                fullWidth
                                size={isMobile ? 'small' : 'medium'}
                                label="Allergy Details"
                                placeholder="e.g., Peanuts, Shellfish, Dairy"
                                {...register('culturalPreferences.dietaryRequirements.allergyDetails')}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                  },
                                }}
                              />
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                size={isMobile ? 'small' : 'medium'}
                                label="Dietary Notes (Optional)"
                                placeholder="Additional dietary information..."
                                {...register('culturalPreferences.dietaryRequirements.notes')}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                  },
                                }}
                              />
                            </Stack>
                          </Paper>
                        </Grid>

                        {/* Religious Considerations */}
                        <Grid item xs={12}>
                          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.02), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
                            <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <MosqueIcon sx={{ color: 'info.main', fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  Religious Considerations
                                </Typography>
                              </Stack>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    size={isMobile ? 'small' : 'medium'}
                                    label="Faith"
                                    placeholder="e.g., Christian, Muslim, Jewish, Hindu, Buddhist"
                                    {...register('culturalPreferences.religiousConsiderations.faith')}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                      },
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <FormControlLabel
                                    control={
                                      <Controller
                                        name="culturalPreferences.religiousConsiderations.genderSensitivity"
                                        control={control}
                                        render={({ field }) => (
                                          <Checkbox {...field} checked={field.value || false} />
                                        )}
                                      />
                                    }
                                    label="Gender Sensitivity Required"
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <Stack spacing={1}>
                                    <Stack direction="row" spacing={1}>
                                      <TextField
                                        fullWidth
                                        size={isMobile ? 'small' : 'medium'}
                                        label="Religious Observances"
                                        placeholder="e.g., Friday prayers, Ramadan, Sabbath"
                                        value={observanceInput}
                                        onChange={(e) => setObservanceInput(e.target.value)}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddArrayItem('culturalPreferences.religiousConsiderations.observances', observanceInput, setObservanceInput)
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
                                        onClick={() => handleAddArrayItem('culturalPreferences.religiousConsiderations.observances', observanceInput, setObservanceInput)}
                                        disabled={!observanceInput.trim()}
                                        sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
                                      >
                                        Add
                                      </Button>
                                    </Stack>
                                    {watchedObservances && watchedObservances.length > 0 && (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {watchedObservances.map((obs, idx) => (
                                          <Chip
                                            key={idx}
                                            label={obs}
                                            onDelete={() => handleRemoveArrayItem('culturalPreferences.religiousConsiderations.observances', obs)}
                                            size="small"
                                            color="info"
                                            variant="outlined"
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    size={isMobile ? 'small' : 'medium'}
                                    label="Religious Notes (Optional)"
                                    placeholder="Additional religious considerations..."
                                    {...register('culturalPreferences.religiousConsiderations.notes')}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                      },
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Stack>
                          </Paper>
                        </Grid>

                        {/* Lifestyle Notes */}
                        <Grid item xs={12}>
                          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.02), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
                            <Stack spacing={2}>
                              <Stack direction="row" alignItems="center" spacing={1.5}>
                                <PersonIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                <Typography variant="subtitle1" fontWeight={600}>
                                  Lifestyle Notes
                                </Typography>
                              </Stack>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                  <Stack spacing={1}>
                                    <Typography variant="caption" fontWeight={600}>Habits</Typography>
                                    <Stack direction="row" spacing={1}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="e.g., Early riser"
                                        value={habitInput}
                                        onChange={(e) => setHabitInput(e.target.value)}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddArrayItem('culturalPreferences.lifestyleNotes.habits', habitInput, setHabitInput)
                                          }
                                        }}
                                      />
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleAddArrayItem('culturalPreferences.lifestyleNotes.habits', habitInput, setHabitInput)}
                                        disabled={!habitInput.trim()}
                                      >
                                        <AddIcon />
                                      </Button>
                                    </Stack>
                                    {watchedHabits && watchedHabits.length > 0 && (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                        {watchedHabits.map((habit, idx) => (
                                          <Chip
                                            key={idx}
                                            label={habit}
                                            onDelete={() => handleRemoveArrayItem('culturalPreferences.lifestyleNotes.habits', habit)}
                                            size="small"
                                            sx={{ height: 24 }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Stack spacing={1}>
                                    <Typography variant="caption" fontWeight={600}>Interests</Typography>
                                    <Stack direction="row" spacing={1}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="e.g., Reading"
                                        value={interestInput}
                                        onChange={(e) => setInterestInput(e.target.value)}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddArrayItem('culturalPreferences.lifestyleNotes.interests', interestInput, setInterestInput)
                                          }
                                        }}
                                      />
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleAddArrayItem('culturalPreferences.lifestyleNotes.interests', interestInput, setInterestInput)}
                                        disabled={!interestInput.trim()}
                                      >
                                        <AddIcon />
                                      </Button>
                                    </Stack>
                                    {watchedInterests && watchedInterests.length > 0 && (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                        {watchedInterests.map((interest, idx) => (
                                          <Chip
                                            key={idx}
                                            label={interest}
                                            onDelete={() => handleRemoveArrayItem('culturalPreferences.lifestyleNotes.interests', interest)}
                                            size="small"
                                            sx={{ height: 24 }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                  <Stack spacing={1}>
                                    <Typography variant="caption" fontWeight={600}>Values</Typography>
                                    <Stack direction="row" spacing={1}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="e.g., Independence"
                                        value={valueInput}
                                        onChange={(e) => setValueInput(e.target.value)}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddArrayItem('culturalPreferences.lifestyleNotes.values', valueInput, setValueInput)
                                          }
                                        }}
                                      />
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleAddArrayItem('culturalPreferences.lifestyleNotes.values', valueInput, setValueInput)}
                                        disabled={!valueInput.trim()}
                                      >
                                        <AddIcon />
                                      </Button>
                                    </Stack>
                                    {watchedValues && watchedValues.length > 0 && (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                                        {watchedValues.map((value, idx) => (
                                          <Chip
                                            key={idx}
                                            label={value}
                                            onDelete={() => handleRemoveArrayItem('culturalPreferences.lifestyleNotes.values', value)}
                                            size="small"
                                            sx={{ height: 24 }}
                                          />
                                        ))}
                                      </Box>
                                    )}
                                  </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    size={isMobile ? 'small' : 'medium'}
                                    label="Lifestyle Notes (Optional)"
                                    placeholder="Additional lifestyle information..."
                                    {...register('culturalPreferences.lifestyleNotes.notes')}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                      },
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Stack>
                          </Paper>
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2.5}>
                        {preferences?.culturalPreferences && (
                          <>
                            {preferences.culturalPreferences.dietaryRequirements && (
                              <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                  <Stack spacing={1.5}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <RestaurantIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                                      <Typography variant="subtitle2" fontWeight={600}>Dietary Requirements</Typography>
                                    </Stack>
                                    {preferences.culturalPreferences.dietaryRequirements.restrictions?.length > 0 && (
                                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                        {preferences.culturalPreferences.dietaryRequirements.restrictions.map((r, idx) => (
                                          <Chip key={idx} label={DIETARY_RESTRICTION_LABELS[r] || r} size="small" />
                                        ))}
                                      </Stack>
                                    )}
                                    {preferences.culturalPreferences.dietaryRequirements.allergyDetails && (
                                      <Typography variant="body2">
                                        <strong>Allergies:</strong> {preferences.culturalPreferences.dietaryRequirements.allergyDetails}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Paper>
                              </Grid>
                            )}
                            {preferences.culturalPreferences.religiousConsiderations && (
                              <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                                  <Stack spacing={1.5}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <MosqueIcon sx={{ color: 'info.main', fontSize: 18 }} />
                                      <Typography variant="subtitle2" fontWeight={600}>Religious Considerations</Typography>
                                    </Stack>
                                    {preferences.culturalPreferences.religiousConsiderations.faith && (
                                      <Typography variant="body2">
                                        <strong>Faith:</strong> {preferences.culturalPreferences.religiousConsiderations.faith}
                                      </Typography>
                                    )}
                                    {preferences.culturalPreferences.religiousConsiderations.observances?.length > 0 && (
                                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                        {preferences.culturalPreferences.religiousConsiderations.observances.map((obs, idx) => (
                                          <Chip key={idx} label={obs} size="small" variant="outlined" />
                                        ))}
                                      </Stack>
                                    )}
                                    {preferences.culturalPreferences.religiousConsiderations.genderSensitivity && (
                                      <Chip label="Gender Sensitivity Required" size="small" color="info" />
                                    )}
                                  </Stack>
                                </Paper>
                              </Grid>
                            )}
                            {preferences.culturalPreferences.lifestyleNotes && (
                              <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                                  <Stack spacing={1.5}>
                                    <Typography variant="subtitle2" fontWeight={600}>Lifestyle Notes</Typography>
                                    {preferences.culturalPreferences.lifestyleNotes.habits?.length > 0 && (
                                      <Box>
                                        <Typography variant="caption" fontWeight={600}>Habits:</Typography>
                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                          {preferences.culturalPreferences.lifestyleNotes.habits.map((h, idx) => (
                                            <Chip key={idx} label={h} size="small" />
                                          ))}
                                        </Stack>
                                      </Box>
                                    )}
                                    {preferences.culturalPreferences.lifestyleNotes.interests?.length > 0 && (
                                      <Box>
                                        <Typography variant="caption" fontWeight={600}>Interests:</Typography>
                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                          {preferences.culturalPreferences.lifestyleNotes.interests.map((i, idx) => (
                                            <Chip key={idx} label={i} size="small" />
                                          ))}
                                        </Stack>
                                      </Box>
                                    )}
                                    {preferences.culturalPreferences.lifestyleNotes.values?.length > 0 && (
                                      <Box>
                                        <Typography variant="caption" fontWeight={600}>Values:</Typography>
                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                          {preferences.culturalPreferences.lifestyleNotes.values.map((v, idx) => (
                                            <Chip key={idx} label={v} size="small" />
                                          ))}
                                        </Stack>
                                      </Box>
                                    )}
                                  </Stack>
                                </Paper>
                              </Grid>
                            )}
                          </>
                        )}
                        {(!preferences?.culturalPreferences || 
                          (!preferences.culturalPreferences.dietaryRequirements && 
                           !preferences.culturalPreferences.religiousConsiderations && 
                           !preferences.culturalPreferences.lifestyleNotes)) && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              No cultural preferences set
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Availability Scheduling */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <ScheduleIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Availability Schedule
                        </Typography>
                      </Stack>
                      <Chip size="small" label="Optional" color="info" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                    </Stack>

                    {isEditMode ? (
                      <Grid container spacing={2}>
                        {DAYS.map((day) => {
                          const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
                          const dayAvailability = watchedAvailability?.find((a) => a.day === day)
                          const dayTimeSlots = dayAvailability?.timeSlots || []

                          return (
                            <Grid item xs={12} sm={6} md={4} key={day}>
                              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                                  {dayLabel}
                                </Typography>
                                <Stack spacing={1}>
                                  {TIME_SLOTS.map((timeSlot) => {
                                    const isSelected = dayTimeSlots.includes(timeSlot)
                                    const timeSlotLabel = timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)
                                    return (
                                      <FormControlLabel
                                        key={timeSlot}
                                        control={
                                          <Checkbox
                                            checked={isSelected}
                                            onChange={() => handleToggleAvailability(day, timeSlot)}
                                            size="small"
                                          />
                                        }
                                        label={timeSlotLabel}
                                        sx={{ m: 0 }}
                                      />
                                    )
                                  })}
                                </Stack>
                              </Paper>
                            </Grid>
                          )
                        })}
                      </Grid>
                    ) : (
                      <Grid container spacing={2}>
                        {preferences?.availability && preferences.availability.length > 0 ? (
                          preferences.availability.map((avail, idx) => (
                            <Grid item xs={12} sm={6} md={4} key={idx}>
                              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                  {avail.day.charAt(0).toUpperCase() + avail.day.slice(1)}
                                </Typography>
                                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                  {avail.timeSlots.map((slot, slotIdx) => (
                                    <Chip
                                      key={slotIdx}
                                      label={slot.charAt(0).toUpperCase() + slot.slice(1)}
                                      size="small"
                                      color="primary"
                                    />
                                  ))}
                                </Stack>
                              </Paper>
                            </Grid>
                          ))
                        ) : (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              No availability schedule set
                            </Typography>
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
                            name="serviceDelivery.preferredStartDate"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                fullWidth
                                type="date"
                                size={isMobile ? 'small' : 'medium'}
                                label="Preferred Start Date"
                                InputLabelProps={{ shrink: true }}
                                {...field}
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
                        {preferences?.serviceDelivery?.preferredStartDate && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                              Preferred Start Date
                            </Typography>
                            <Typography variant="body2">
                              {format(new Date(preferences.serviceDelivery.preferredStartDate), 'dd/MM/yyyy')}
                            </Typography>
                          </Grid>
                        )}
                        {preferences?.serviceDelivery?.sessionDurationMins && (
                          <Grid item xs={12} sm={4}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                              Session Duration
                            </Typography>
                            <Typography variant="body2">
                              {preferences.serviceDelivery.sessionDurationMins} mins
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Special Requirements */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        Special Requirements
                      </Typography>
                      <Chip size="small" label="Optional" color="info" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                    </Stack>

                    {isEditMode ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        size={isMobile ? 'small' : 'medium'}
                        label="Special Requirements"
                        placeholder="Any special requirements or additional notes about your care needs..."
                        {...register('specialRequirements')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {preferences?.specialRequirements || 'No special requirements specified'}
                      </Typography>
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

