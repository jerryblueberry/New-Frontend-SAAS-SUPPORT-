  /**
   * ═══════════════════════════════════════════════════════════════════════════════
   * CLIENT BASIC INFORMATION - Step 1 of Onboarding
   * ═══════════════════════════════════════════════════════════════════════════════
   * 
   * Minimal, production-ready onboarding flow for NDIS clients.
   * 
   * REQUIRED FIELDS (For onboarding completion):
   * - Account Type: Individual or Organization
   * - Address: Street, Suburb, State, Postcode
   * - Organization Name (if organization account)
   * - ABN (if organization account)
   * 
   * OPTIONAL FIELDS (Can be added later via dashboard):
   * - NDIS Number
   * - Emergency Contact
   * - Location Coordinates (auto-detect or manual)
   * 
   * Features:
   * - Smart validation based on account type
   * - Auto-geolocation with fallback to manual entry
   * - Real-time form validation with helpful error messages
   * - Progress tracking and completion percentage
   * - Mobile-responsive design
   * 
   * @module components/ClientOnboarding/ClientProfile
   */

  import React, { useMemo, useEffect, useState, useCallback } from 'react'
  import { useNavigate } from 'react-router-dom'
  import {
    Box, Grid, TextField, MenuItem, Button, Paper, Chip, Alert,
    LinearProgress, Typography, Stack, Divider, CircularProgress, useTheme, useMediaQuery,
    Card, CardContent, alpha, Fade, Collapse, Accordion, AccordionSummary, AccordionDetails
  } from '@mui/material'
  import {
    MyLocation as MyLocationIcon,
    LocationOn as LocationIcon,
    CheckCircle,
    Info,
    Business as BusinessIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Badge as BadgeIcon,
    Edit as EditIcon,
    ExpandMore as ExpandMoreIcon,
    InfoOutlined as InfoOutlinedIcon
  } from '@mui/icons-material'
  import { useForm, Controller } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { z } from 'zod'
  import { useClientOnboardingQuery, useBasicInformationMutation } from '../../../stores/useClientOnboardingStore'
  import { useClientOnboardingStore } from '../../../stores/useClientOnboardingStore'
  import { useAuth } from '../../../context/AuthContext'
  import { toast } from 'react-hot-toast'
  import { toE164Au, isValidAuPhone, formatAuInternational } from '../../../utils/phone'
  import { buildBasicInfoPayload } from '../../../stores/clientStores/helpers'

  // ═══════════════════════════════════════════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════════════

  const ACCOUNT_TYPES = ['individual', 'organization']

  // Australian phone number validation schema (supports both mobile and landline)
  const australianPhoneSchema = z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true // Optional field
        return isValidAuPhone(val)
      },
      {
        message: 'Enter a valid Australian number: +61 followed by 9 digits (mobile: +61 4XX XXX XXX, landline: +61 2/3/7/8XX XXX XXX)'
      }
    )

  // Form validation schema
  // REQUIRED: accountType, address (suburb, state, postcode)
  // OPTIONAL: street, ndisNumber, emergencyContact
  // Organization: also requires organizationName and abn
  const clientProfileSchema = z.object({
    accountType: z.enum(['individual', 'organization'], {
      required_error: 'Account type is required',
    }),
    organizationName: z.string().optional(),
    abn: z.string().optional(),
    ndisNumber: z.string().optional(),
    address: z.object({
      street: z.string().optional(), // Street is OPTIONAL (not required by backend)
      suburb: z.string().min(1, 'Suburb is required'),
      state: z.string()
        .min(1, 'State is required')
        .max(50, 'State name is too long')
        .refine(
          (val) => val.trim().length > 0,
          { message: 'State cannot be empty' }
        ),
      postcode: z.string()
        .min(1, 'Postcode is required')
        .refine(
          (val) => /^\d{4,5}$/.test(val.trim()),
          { message: 'Postcode must be 4-5 digits' }
        ),
      coordinates: z.array(z.number()).length(2).optional()
    }),
    emergencyContact: z.object({
      name: z.string().optional(),
      phone: australianPhoneSchema
    })
  }).superRefine((data, ctx) => {
    if (data.accountType === 'organization') {
      if (!data.organizationName || data.organizationName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Organization name is required',
          path: ['organizationName']
        })
      }
      if (!data.abn || data.abn.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'ABN is required for organizations',
          path: ['abn']
        })
      }
    }
  })

  // Phone number formatter using utility function
  const formatAustralianPhone = (value) => {
    return formatAuInternational(value || '')
  }

  export default function ClientProfile() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    // TanStack Query - Source of truth for server data
    const { data: onboardingData, isLoading: isQueryLoading } = useClientOnboardingQuery()
    const profile = onboardingData?.data?.profile || null
    const profileStatus = profile?.status || 'draft'

    // Zustand Store - Derived/transformed state
    const onboarding = useClientOnboardingStore((state) => state.onboarding)
    const profileCompleteness = useClientOnboardingStore((state) => state.profileCompleteness)

    // Mutation hook
    const { mutate: saveBasicInfo, isPending: isSaving } = useBasicInformationMutation()

    // Form default values - memoized for performance
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

    const { register, handleSubmit, watch, reset, control, formState: { errors, isValid: formIsValid, isDirty }, setValue, trigger } = useForm({ 
      defaultValues,
      resolver: zodResolver(clientProfileSchema),
      mode: 'onChange' // Changed to onChange for real-time validation
    })
    const accountType = watch('accountType')
    
    // Watch all required fields for reactive validation
    const watchedSuburb = watch('address.suburb')
    const watchedState = watch('address.state')
    const watchedPostcode = watch('address.postcode')
    const watchedOrgName = watch('organizationName')
    const watchedAbn = watch('abn')

    const [addressMethod, setAddressMethod] = useState(
      profile?.address?.coordinates ? 'geolocation' : 'manual'
    )

    const [location, setLocation] = useState({
      coordinates: profile?.address?.coordinates || null,
      isLocating: false,
      addressInfo: null
    })

    // Sync form with profile data when it changes
    useEffect(() => {
      if (profile) {
        reset(defaultValues, { keepDefaultValues: true })
        if (profile?.address?.coordinates) {
          setAddressMethod('geolocation')
          setLocation({
            coordinates: profile.address.coordinates,
            isLocating: false,
            addressInfo: null
          })
        } else {
          setAddressMethod('manual')
        }
      }
    }, [profile, reset, defaultValues])
    
    // Trigger validation after form reset
    useEffect(() => {
      if (profile) {
        // Small delay to ensure form is reset before validation
        setTimeout(() => {
          trigger()
        }, 100)
      }
    }, [profile, trigger])

    // Fetch address from coordinates - memoized callback
    const fetchAddressFromCoordinates = useCallback(async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          { headers: { 'User-Agent': 'AecusCare/1.0' } }
        )
        if (!response.ok) throw new Error('Failed to fetch address')
        const data = await response.json()
        if (!data || !data.address) throw new Error('No address data found')

        const addressData = data.address
        const street = data.display_name?.split(',')[0]?.trim() || addressData.road || addressData.street || ''
        const suburb = addressData.city_district || addressData.town || addressData.municipality || addressData.suburb || ''
        const state = addressData.state || addressData.county || addressData.region || ''
        const postcode = addressData.postcode || addressData.postal_code || ''

        if (street) setValue('address.street', street, { shouldValidate: true })
        if (suburb) setValue('address.suburb', suburb, { shouldValidate: true })
        if (state) setValue('address.state', state, { shouldValidate: true })
        if (postcode) setValue('address.postcode', postcode, { shouldValidate: true })

        return {
          street, suburb, state, postcode,
          displayName: data.display_name || '',
          fullAddress: data.address
        }
      } catch (error) {
        console.error('Error fetching address:', error)
        throw error
      }
    }, [setValue])

    // Get current location - memoized callback
    const handleGetCurrentLocation = useCallback(async () => {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser')
        return
      }

      setLocation(prev => ({ ...prev, isLocating: true }))

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { longitude, latitude } = position.coords
            const coordinates = [longitude, latitude]

            toast.loading('Fetching address details...', { id: 'geolocation' })
            const addressInfo = await fetchAddressFromCoordinates(latitude, longitude)

            setLocation({ coordinates, isLocating: false, addressInfo })
            setValue('address.coordinates', coordinates, { shouldValidate: false })

            toast.success(`Address found: ${addressInfo.displayName || addressInfo.suburb || 'Location captured'}`, { id: 'geolocation' })
          } catch (error) {
            setLocation(prev => ({ ...prev, isLocating: false }))
            toast.error('Location captured but could not fetch address details', { id: 'geolocation' })
            const { longitude, latitude } = position.coords
            const coordinates = [longitude, latitude]
            setLocation({ coordinates, isLocating: false })
            setValue('address.coordinates', coordinates, { shouldValidate: false })
          }
        },
        (error) => {
          setLocation(prev => ({ ...prev, isLocating: false }))
          toast.error('Unable to get your location. Please use manual entry.', { id: 'geolocation' })
          setAddressMethod('manual')
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }, [fetchAddressFromCoordinates, setValue])

    // Calculate local completion percentage - based on REQUIRED fields only
    // Required: accountType, address (suburb, state, postcode)
    // Optional: street, ndisNumber, emergencyContact
    // Organization: also requires organizationName and abn
    const localPct = useMemo(() => {
      const formValues = watch()
      const data = { ...defaultValues, ...formValues }
      const isOrg = data.accountType === 'organization'
      
      // Required fields count
      let total = 4 // accountType + suburb + state + postcode
      if (isOrg) total += 2 // organizationName + abn
      
      let done = 0
      
      // Account type is always required
      if (data.accountType) done++
      
      // Address required fields (suburb, state, postcode) - street is OPTIONAL
      if (data.address?.suburb?.trim()) done++
      if (data.address?.state?.trim()) done++
      if (data.address?.postcode?.trim()) done++
      
      // Organization-specific required fields
      if (isOrg) {
        if (data.organizationName?.trim()) done++
        if (data.abn?.trim()) done++
      }
      
      return Math.round((done / total) * 100)
    }, [defaultValues, watch])
    
    // Check if required fields are valid (for button enable/disable)
    // Required: accountType, address (suburb, state, postcode)
    // Optional: street, ndisNumber, emergencyContact
    // Organization: also requires organizationName and abn
    const isFormValid = useMemo(() => {
      const isOrg = accountType === 'organization'
      
      // Check account type (always required)
      if (!accountType) {
        return false
      }
      
      // Check address required fields (suburb, state, postcode) - street is OPTIONAL
      const suburbValid = watchedSuburb?.trim() && watchedSuburb.trim().length > 0
      const stateValid = watchedState?.trim() && watchedState.trim().length > 0
      const postcodeValid = watchedPostcode?.trim() && /^\d{4,5}$/.test(watchedPostcode.trim())
      
      if (!suburbValid || !stateValid || !postcodeValid) {
        return false
      }
      
      // Check organization-specific required fields
      if (isOrg) {
        const orgNameValid = watchedOrgName?.trim() && watchedOrgName.trim().length > 0
        const abnValid = watchedAbn?.trim() && watchedAbn.trim().length > 0
        if (!orgNameValid || !abnValid) {
          return false
        }
      }
      
      return true
    }, [accountType, watchedSuburb, watchedState, watchedPostcode, watchedOrgName, watchedAbn])
    
    // Trigger validation when account type changes
    useEffect(() => {
      if (accountType) {
        trigger('accountType')
        if (accountType === 'organization') {
          trigger('organizationName')
          trigger('abn')
        }
      }
    }, [accountType, trigger])

    // Form submission - uses domain helper for payload building
    const onSubmit = useCallback((values) => {
      // Determine if this is onboarding (new profile or draft status)
      const isOnboarding = !profile || profile.status === 'draft' || !profile._id
      
      // Check if profile status allows editing (before building payload)
      const editableStatuses = ['draft', 'unverified', 'rejected']
      const canEdit = !profile || editableStatuses.includes(profileStatus)
      
      // If profile exists and status doesn't allow editing, show error
      if (profile && !canEdit) {
        let errorMessage = 'Your profile cannot be edited at this time.'
        if (profileStatus === 'submitted') {
          errorMessage = 'Your profile has been submitted for review and cannot be edited. Please wait for admin approval or contact support if you need to make changes.'
        } else if (profileStatus === 'verified' || profileStatus === 'active') {
          errorMessage = 'Your profile has been verified and is currently active. Please contact support if you need to make changes.'
        }
        
        toast.error(errorMessage, { duration: 6000 })
        return
      }
      
      // Build payload using domain helper (handles field restrictions and cleanup)
      // For onboarding endpoint: accountType is required if status allows editing
      const payload = buildBasicInfoPayload(values, profileStatus, location, addressMethod, isOnboarding)
      
      // Ensure accountType is included if we're allowed to edit (required by onboarding endpoint)
      if (canEdit && values.accountType && !payload.accountType) {
        payload.accountType = values.accountType
      }
      
      // Debug logging
      console.log('Submitting profile:', {
        isOnboarding,
        profileStatus,
        canEdit,
        hasAccountType: !!payload.accountType,
        payloadKeys: Object.keys(payload),
        payload,
      })

      saveBasicInfo(payload, {
        onSuccess: (data) => {
          // Check if onboarding is complete (ONE-STEP: basic info = 100%)
          const isBasicInfoComplete = data?.data?.onboardingComplete === true || 
                                      data?.data?.isBasicInfoComplete === true ||
                                      data?.data?.profileCompletion?.completedSections?.basicInformation === true
          const wasAutoSubmitted = data?.data?.wasAutoSubmitted === true
          const profileStatus = data?.data?.profile?.status
          
          // For onboarding: Navigate to dashboard when profile is complete
          // This happens when basic info is complete (ONE-STEP onboarding)
          if (isBasicInfoComplete) {
            // Navigate to dashboard after a short delay to show success message
            setTimeout(() => {
              navigate('/client-dashboard', { replace: true })
            }, wasAutoSubmitted ? 2000 : 1500) // Longer delay if auto-submitted
          }
          
          // Log for debugging
          console.log('Profile save success:', {
            isBasicInfoComplete,
            wasAutoSubmitted,
            profileStatus,
            willNavigate: isBasicInfoComplete
          })
        },
        onError: (error) => {
          // Enhanced error logging for debugging
          console.error('Profile save error:', {
            error: error.message,
            code: error.response?.data?.code,
            status: error.response?.status,
            responseData: error.response?.data,
            payload: payload, // Log the payload that was sent
            isOnboarding,
            profileStatus,
          })
        }
      })
    }, [saveBasicInfo, profileStatus, location, addressMethod, navigate, profile])

    // ONE-STEP ONBOARDING: Check completion status from store (derived state)
    const isStepComplete = useMemo(() => 
      profileCompleteness?.completedSections?.basicInformation || onboarding?.isBasicInfoComplete,
      [profileCompleteness?.completedSections?.basicInformation, onboarding?.isBasicInfoComplete]
    )
    
    const isProfileComplete = useMemo(() => 
      onboarding?.onboardingComplete === true || profileCompleteness?.percentage >= 100,
      [onboarding?.onboardingComplete, profileCompleteness?.percentage]
    )
    
    const canAddPreferences = onboarding?.canAddPreferences === true

    // Show loading state if query is loading
    if (isQueryLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={48} />
        </Box>
      )
    }

    return (
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{
          maxWidth: 1000,
          margin: '0 auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 }
        }}
      >
        {/* Hero Header Card */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              pointerEvents: 'none'
            }
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                      }}
                    >
                      <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                    <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} color="text.primary">
                      Client Profile
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      icon={<PersonIcon sx={{ fontSize: 16 }} />}
                      label={user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Name'}
                      size="small"
                      sx={{
                        bgcolor: 'background.paper',
                        fontWeight: 600,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }}
                    />
                    <Chip
                      label={user?.email || 'Email'}
                      size="small"
                      sx={{
                        bgcolor: 'background.paper',
                        fontWeight: 500,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      }}
                    />
                    {user?.phone && (
                      <Chip
                        icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                        label={user.phone}
                        size="small"
                        sx={{
                          bgcolor: 'background.paper',
                          fontWeight: 500,
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                      />
                    )}
                    {isStepComplete && (
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: 16 }} />}
                        label="Verified"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    bgcolor: 'background.paper',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" fontWeight={700} color="text.secondary">
                        {isProfileComplete ? 'Profile Status' : 'Required Fields'}
                      </Typography>
                      {isProfileComplete ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
                          <Typography variant="h6" fontWeight={800} color="success.main">
                            Complete
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="h6" fontWeight={800} color="primary.main">
                          {localPct === 100 ? 'Ready' : 'Incomplete'}
                        </Typography>
                      )}
                    </Stack>
                    {!isProfileComplete && (
                      <>
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
                                ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`
                                : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {localPct === 100 
                            ? '✓ All required fields completed' 
                            : `${Math.max(0, (4 + (accountType === 'organization' ? 2 : 0)) - Math.round(localPct / 100 * (4 + (accountType === 'organization' ? 2 : 0))))} required field${Math.max(0, (4 + (accountType === 'organization' ? 2 : 0)) - Math.round(localPct / 100 * (4 + (accountType === 'organization' ? 2 : 0)))) === 1 ? '' : 's'} remaining`}
                        </Typography>
                      </>
                    )}
                    {isProfileComplete && (
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        ✓ Your profile is complete and ready to use
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Info Alert - Minimal Onboarding */}
        <Fade in>
          <Alert
            icon={<InfoOutlinedIcon />}
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              bgcolor: alpha(theme.palette.info.main, 0.05)
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
              Quick Start Onboarding
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We only need essential details to get you started. Optional fields (like NDIS Number and Emergency Contact) can be added later from your dashboard.
            </Typography>
          </Alert>
        </Fade>

        {/* Success Alert */}
        {isProfileComplete && isStepComplete && (
          <Fade in>
            <Alert
              icon={<CheckCircle />}
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                bgcolor: alpha(theme.palette.success.main, 0.05)
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Your profile is complete and verified. Update information anytime as needed.
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Main Form Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden'
          }}
        >
          {/* Account Type Section */}
          <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Stack spacing={2.5}>
              <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <BusinessIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    Account Information
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label="Required"
                  color="error"
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                />
              </Stack>

              <Grid container spacing={2.5}>
                <Grid item xs={12} md={accountType === 'individual' ? 12 : 6}>
                  <TextField
                    select
                    fullWidth
                    required
                    size={isMobile ? "small" : "medium"}
                    label="Account Type *"
                    defaultValue={defaultValues.accountType}
                    {...register('accountType')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`
                        }
                      }
                    }}
                  >
                    {ACCOUNT_TYPES.map(v => (
                      <MenuItem key={v} value={v}>
                        {v === 'individual' ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon fontSize="small" />
                            <span>Individual Client</span>
                          </Stack>
                        ) : (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <BusinessIcon fontSize="small" />
                            <span>Organization / Care Provider</span>
                          </Stack>
                        )}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {accountType !== 'individual' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        size={isMobile ? "small" : "medium"}
                        label="Organization Name *"
                        placeholder="Enter your organization's legal name"
                        {...register('organizationName')}
                        error={!!errors.organizationName}
                        helperText={errors.organizationName?.message || 'Required for organization accounts'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper'
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        size={isMobile ? "small" : "medium"}
                        label="ABN (Australian Business Number) *"
                        placeholder="11 digits"
                        {...register('abn')}
                        error={!!errors.abn}
                        helperText={errors.abn?.message || 'Required for organization accounts'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper'
                          }
                        }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Stack>
          </Box>

          <Divider />

          {/* Address Section */}
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <LocationIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    Service Address
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label="Required"
                  color="error"
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                />
              </Stack>

              {/* Address Method Selection */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    onClick={() => setAddressMethod('geolocation')}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: `2px solid ${addressMethod === 'geolocation' ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                      bgcolor: addressMethod === 'geolocation' ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: addressMethod === 'geolocation'
                            ? theme.palette.primary.main
                            : alpha(theme.palette.primary.main, 0.1),
                          transition: 'all 0.25s ease'
                        }}
                      >
                        <MyLocationIcon
                          sx={{
                            fontSize: 24,
                            color: addressMethod === 'geolocation' ? 'white' : 'primary.main'
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={700} color={addressMethod === 'geolocation' ? 'primary.main' : 'text.primary'}>
                          GPS Location
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Quick & accurate
                        </Typography>
                      </Box>
                      {addressMethod === 'geolocation' && (
                        <CheckCircle sx={{ fontSize: 24, color: 'primary.main' }} />
                      )}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={0}
                    onClick={() => setAddressMethod('manual')}
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: `2px solid ${addressMethod === 'manual' ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`,
                      bgcolor: addressMethod === 'manual' ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.12)}`
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: addressMethod === 'manual'
                            ? theme.palette.primary.main
                            : alpha(theme.palette.primary.main, 0.1),
                          transition: 'all 0.25s ease'
                        }}
                      >
                        <EditIcon
                          sx={{
                            fontSize: 24,
                            color: addressMethod === 'manual' ? 'white' : 'primary.main'
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={700} color={addressMethod === 'manual' ? 'primary.main' : 'text.primary'}>
                          Manual Entry
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Type your address
                        </Typography>
                      </Box>
                      {addressMethod === 'manual' && (
                        <CheckCircle sx={{ fontSize: 24, color: 'primary.main' }} />
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* GPS Button */}
              {addressMethod === 'geolocation' && (
                <Fade in>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleGetCurrentLocation}
                    disabled={location.isLocating}
                    startIcon={location.isLocating ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
                    sx={{
                      py: 1.75,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '1rem',
                      boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    {location.isLocating ? 'Detecting Location...' : location.coordinates ? 'Update My Location' : 'Detect My Location'}
                  </Button>
                </Fade>
              )}

              {/* Location Success Message */}
              {addressMethod === 'geolocation' && location.coordinates && location.addressInfo && (
                <Fade in>
                  <Alert
                    icon={<CheckCircle />}
                    severity="success"
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      bgcolor: alpha(theme.palette.success.main, 0.05)
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Location Detected Successfully
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {location.addressInfo.displayName}
                    </Typography>
                  </Alert>
                </Fade>
              )}

              {/* Address Fields */}
              <Collapse in={addressMethod === 'manual' || (addressMethod === 'geolocation' && location.coordinates)}>
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size={isMobile ? "small" : "medium"}
                      label="Street Address (Optional)"
                      placeholder="123 Main Street"
                      {...register('address.street')}
                      error={!!errors.address?.street}
                      helperText={errors.address?.street?.message || 'Optional - can be added later'}
                      InputProps={{
                        startAdornment: (
                          <LocationIcon sx={{ color: 'action.active', mr: 1, fontSize: 20 }} />
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.background.paper, 0.5)
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      size={isMobile ? "small" : "medium"}
                      label="Suburb / City *"
                      placeholder="Perth"
                      {...register('address.suburb')}
                      error={!!errors.address?.suburb}
                      helperText={errors.address?.suburb?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.background.paper, 0.5)
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      required
                      size={isMobile ? "small" : "medium"}
                      label="State *"
                      placeholder="WA"
                      {...register('address.state')}
                      error={!!errors.address?.state}
                      helperText={errors.address?.state?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.background.paper, 0.5)
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Controller
                      name="address.postcode"
                      control={control}
                      render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
                        <TextField
                          fullWidth
                          required
                          size={isMobile ? "small" : "medium"}
                          label="Postcode *"
                          placeholder="6000"
                          value={value || ''}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 5)
                            onChange(digits)
                          }}
                          onBlur={onBlur}
                          error={!!error}
                          helperText={error?.message}
                          inputProps={{ maxLength: 5 }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.background.paper, 0.5)
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Stack>
          </Box>

          <Divider />

          {/* Optional Fields - Collapsible */}
          <Accordion
            elevation={0}
            disableGutters
            sx={{
              '&:before': { display: 'none' },
              bgcolor: alpha(theme.palette.grey[100], 0.4),
              borderRadius: 0,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: { xs: 2.5, sm: 3.5 },
                py: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.02)
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <InfoOutlinedIcon sx={{ color: 'info.main', fontSize: 20 }} />
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                  Additional Information (Optional)
                </Typography>
                <Chip
                  label="Can be added later"
                  size="small"
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2.5, sm: 3.5 }, pt: 0 }}>
              <Stack spacing={3}>
                {/* NDIS Number */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <BadgeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                      NDIS Number
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    label="NDIS Number (Optional)"
                    placeholder="Enter your NDIS participant number"
                    {...register('ndisNumber')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: 'background.paper'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    You can add this later from your dashboard if you don't have it handy.
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Emergency Contact */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                      Emergency Contact
                    </Typography>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        size={isMobile ? "small" : "medium"}
                        label="Contact Name (Optional)"
                        placeholder="John Doe"
                        {...register('emergencyContact.name')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper'
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Controller
                        name="emergencyContact.phone"
                        control={control}
                        render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
                          <TextField
                            fullWidth
                            size={isMobile ? "small" : "medium"}
                            label="Contact Phone (Optional)"
                            placeholder="+61 4XX XXX XXX or +61 2XX XXX XXX"
                            value={formatAustralianPhone(value || '')}
                            onChange={(e) => {
                              const e164 = toE164Au(e.target.value)
                              onChange(e164)
                            }}
                            onBlur={onBlur}
                            error={!!error || (!!value && !isValidAuPhone(value))}
                            helperText={
                              error?.message 
                                || (!!value && !isValidAuPhone(value) 
                                  ? 'Enter a valid Australian number (mobile: +61 4XX XXX XXX, landline: +61 2/3/7/8XX XXX XXX)' 
                                  : 'Australian format: +61 followed by 9 digits')
                            }
                            inputProps={{ maxLength: 18 }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper'
                              }
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Emergency contact details can be updated anytime from your dashboard.
                  </Typography>
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Divider />

          {/* Submit Section */}
          <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                {localPct === 100 ? (
                  <>
                    <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                    <Typography variant="body2" color="success.dark" fontWeight={600}>
                      {isProfileComplete 
                        ? 'Profile is complete. Click to update information.' 
                        : 'All required fields completed. Ready to complete your profile.'}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Info sx={{ fontSize: 20, color: 'warning.main' }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Please complete all required fields to finish your profile setup.
                    </Typography>
                  </>
                )}
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSaving || !isFormValid}
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                sx={{
                  minWidth: { xs: '100%', sm: 220 },
                  py: 1.75,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.0625rem',
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    bgcolor: alpha(theme.palette.primary.main, 0.4),
                    color: 'white',
                    cursor: 'not-allowed'
                  }
                }}
              >
                {isSaving ? 'Completing Profile...' : isProfileComplete ? 'Update Profile' : 'Complete Profile'}
              </Button>
            </Stack>
          </Box>
        </Paper>

      </Box>
    )
  }