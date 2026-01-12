/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT BASIC INFORMATION - Profile Management Page
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready profile management page with view/edit modes.
 * Uses TanStack Query for efficient data fetching and caching.
 * 
 * Features:
 * - View mode: Display current information
 * - Edit mode: Form with validation
 * - Auto-save draft capability
 * - GPS location picker
 * - Real-time validation
 * - Optimistic updates
 * 
 * @module pages/ClientPages/ClientProfile/BasicInformation
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
  LinearProgress,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  IconButton,
  alpha,
  Fade,
  Collapse,
  Alert,
  Container,
} from '@mui/material'
import {
  MyLocation as MyLocationIcon,
  LocationOn as LocationIcon,
  CheckCircle,
  Warning as WarningIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  InfoOutlined as InfoOutlinedIcon,
  Error as ErrorIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import { useBasicInfo, useClientProfile } from '../../../stores/useClientProfileStore'
import { useAuth } from '../../../context/AuthContext'
import { toast } from 'react-hot-toast'
import { toE164Au, isValidAuPhone, formatAuInternational } from '../../../utils/phone'
import { formatApiError } from '../../../utils/errorFormatter'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import { 
  canEditRestrictedFields as canEditRestrictedFieldsHelper,
  buildBasicInfoPayload 
} from '../../../stores/clientStores/helpers'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

const ACCOUNT_TYPES = ['individual', 'organization']

const australianPhoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true
      return isValidAuPhone(val)
    },
    {
      message: 'Enter a valid Australian number: +61 followed by 9 digits',
    }
  )

const clientProfileSchema = z.object({
  accountType: z.enum(['individual', 'organization']),
  organizationName: z.string().optional(),
  abn: z.string().optional(),
  ndisNumber: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    suburb: z.string().min(1, 'Suburb is required'),
    state: z.string().min(1, 'State is required').max(50, 'State name is too long'),
    postcode: z.string().min(1, 'Postcode is required').refine(
      (val) => /^\d{4,5}$/.test(val.trim()),
      { message: 'Postcode must be 4-5 digits' }
    ),
    coordinates: z.array(z.number()).length(2).optional(),
  }),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: australianPhoneSchema,
  }),
}).superRefine((data, ctx) => {
  if (data.accountType === 'organization') {
    if (!data.organizationName || data.organizationName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization name is required',
        path: ['organizationName'],
      })
    }
    if (!data.abn || data.abn.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ABN is required for organizations',
        path: ['abn'],
      })
    }
  }
})

const formatAustralianPhone = (value) => formatAuInternational(value || '')

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const BasicInformation = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topOffset, setTopOffset] = useState(64)
  const [isEditMode, setIsEditMode] = useState(false)
  const [addressMethod, setAddressMethod] = useState('manual')
  const [location, setLocation] = useState({
    coordinates: null,
    isLocating: false,
    addressInfo: null,
  })

  // TanStack Query hooks
  const { data: basicInfo, isLoading, isError, error, update, isUpdating } = useBasicInfo()
  const { data: fullProfile } = useClientProfile() // Get profile status
  
  // Domain rules - computed from profile status (no memoization needed for simple values)
  const profileStatus = fullProfile?.status || 'draft'
  const canEditRestrictedFields = canEditRestrictedFieldsHelper(profileStatus)

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

  // Initialize address method and location from data
  useEffect(() => {
    if (basicInfo?.address?.coordinates) {
      setAddressMethod('geolocation')
      setLocation({
        coordinates: basicInfo.address.coordinates,
        isLocating: false,
        addressInfo: null,
      })
    }
  }, [basicInfo])

  // Form setup
  const defaultValues = useMemo(
    () => ({
      accountType: basicInfo?.accountType || 'individual',
      organizationName: basicInfo?.organizationName || '',
      abn: basicInfo?.abn || '',
      ndisNumber: basicInfo?.ndisNumber || '',
      address: {
        street: basicInfo?.address?.street || '',
        suburb: basicInfo?.address?.suburb || '',
        state: basicInfo?.address?.state || '',
        postcode: basicInfo?.address?.postcode || '',
      },
      emergencyContact: {
        name: basicInfo?.emergencyContact?.name || '',
        phone: basicInfo?.emergencyContact?.phone || '',
      },
    }),
    [basicInfo]
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
    resolver: zodResolver(clientProfileSchema),
    mode: 'onBlur',
  })

  const accountType = watch('accountType')

  // Reset form when data changes or edit mode toggles
  useEffect(() => {
    if (basicInfo && !isEditMode) {
      reset(defaultValues)
    }
  }, [basicInfo, isEditMode, defaultValues, reset])

  // Fetch address from coordinates
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
        street,
        suburb,
        state,
        postcode,
        displayName: data.display_name || '',
        fullAddress: data.address,
      }
    } catch (error) {
      console.error('Error fetching address:', error)
      throw error
    }
  }, [setValue])

  // Get current location
  const handleGetCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setLocation((prev) => ({ ...prev, isLocating: true }))

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { longitude, latitude } = position.coords
          const coordinates = [longitude, latitude]

          toast.loading('Fetching address details...', { id: 'geolocation' })
          const addressInfo = await fetchAddressFromCoordinates(latitude, longitude)

          setLocation({ coordinates, isLocating: false, addressInfo })
          setValue('address.coordinates', coordinates, { shouldValidate: false })

          toast.success(`Address found: ${addressInfo.displayName || addressInfo.suburb || 'Location captured'}`, {
            id: 'geolocation',
          })
        } catch (error) {
          setLocation((prev) => ({ ...prev, isLocating: false }))
          toast.error('Location captured but could not fetch address details', { id: 'geolocation' })
          const { longitude, latitude } = position.coords
          const coordinates = [longitude, latitude]
          setLocation({ coordinates, isLocating: false })
          setValue('address.coordinates', coordinates, { shouldValidate: false })
        }
      },
      (error) => {
        setLocation((prev) => ({ ...prev, isLocating: false }))
        toast.error('Unable to get your location. Please use manual entry.', { id: 'geolocation' })
        setAddressMethod('manual')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [fetchAddressFromCoordinates, setValue])

  // Form submission - uses domain helper for payload building
  const onSubmit = useCallback(
    (values) => {
      // Build payload using domain helper (handles field restrictions)
      const payload = buildBasicInfoPayload(values, profileStatus, location, addressMethod)

      update(payload, {
        onSuccess: () => {
          setIsEditMode(false)
          toast.success('Basic information updated successfully')
        },
        onError: (error) => {
          // Handle RESTRICTED_EDIT error with helpful message
          if (error?.response?.data?.code === 'RESTRICTED_EDIT') {
            const errorData = error.response.data
            let errorMessage = errorData.message || 
              'Account type, organization name, and ABN cannot be changed after verification. You can still update NDIS number, address, and emergency contact at any time.'
            
            // Add suggestion if provided
            if (errorData.suggestion) {
              errorMessage += ` ${errorData.suggestion}`
            }
            
            toast.error(errorMessage, { 
              duration: 8000,
              style: {
                maxWidth: '600px',
                whiteSpace: 'pre-line',
              }
            })
          } else {
            const message = formatApiError(error)
            toast.error(message)
          }
        },
      })
    },
    [update, location, addressMethod, profileStatus]
  )

  // Toggle edit mode
  const handleEditClick = useCallback(() => {
    setIsEditMode(true)
    reset(defaultValues)
  }, [reset, defaultValues])

  const handleCancelClick = useCallback(() => {
    setIsEditMode(false)
    reset(defaultValues)
  }, [reset, defaultValues])

  // Check if error is "not found" (should show empty state, not error)
  // ⚠️ CRITICAL: This computation MUST be done before any conditional returns
  const isNotFoundError = isError && error && (
    error?.response?.status === 404 ||
    error?.response?.data?.code === 'NO_PROFILE' ||
    (typeof (error?.response?.data?.message || error?.message || '') === 'string' && (
      (error?.response?.data?.message || error?.message || '').toLowerCase().includes('not found') ||
      (error?.response?.data?.message || error?.message || '').toLowerCase().includes('no profile')
    ))
  )

  // Full-screen loading state - Production-ready pattern
  if (isLoading) {
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner
            size="lg"
            showLogo={true}
            text="Loading your profile..."
            fullPage={true}
            variant="gradient"
            color="primary"
          />
        </Box>
      </>
    )
  }

  // Error state - Show empty state for "not found", error for other cases
  if (isError && !isNotFoundError) {
    const errorMessage = formatApiError(error)
    return (
      <>
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
            <Container maxWidth="sm">
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                sx={{
                  borderRadius: 2,
                  border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Unable to Load Profile
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {errorMessage || 'Failed to load your profile. Please try refreshing the page.'}
                </Typography>
              </Alert>
            </Container>
          </Box>
        </Box>
      </>
    )
  }

  // Empty state - No profile found (should complete onboarding)
  if (isError && isNotFoundError) {
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
            <Card
              elevation={0}
              sx={{
                maxWidth: 600,
                width: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                textAlign: 'center',
                p: { xs: 3, sm: 4, md: 5 },
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
                Profile Not Found
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                It looks like you haven't completed your profile setup yet. Complete your onboarding to access all features.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/client-onboarding')}
                startIcon={<PersonIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Complete Your Profile
              </Button>
            </Card>
          </Box>
        </Box>
      </Box>
    )
  }

  // Empty state - No data loaded yet (but not an error)
  if (!isLoading && !basicInfo && !isError) {
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
            <Card
              elevation={0}
              sx={{
                maxWidth: 600,
                width: '100%',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                textAlign: 'center',
                p: { xs: 3, sm: 4, md: 5 },
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
                No Profile Found
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                Complete your profile setup to get started. It only takes a few minutes.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/client-onboarding')}
                startIcon={<PersonIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Complete Your Profile
              </Button>
            </Card>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <>
      {/* Full-screen loading overlay during form submission */}
      {isUpdating && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(4px)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingSpinner
            size="lg"
            showLogo={true}
            text="Saving your changes..."
            fullPage={false}
            variant="gradient"
            color="primary"
          />
        </Box>
      )}

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
                        <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="text.primary">
                          Basic Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manage your account details and contact information
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
                      <Chip size="small" label="Required" color="error" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                    </Stack>

                    {isEditMode ? (
                      <>
                        {!canEditRestrictedFields && (
                          <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                            <Typography variant="body2">
                              Account type, organization name, and ABN cannot be changed while your profile is <strong>{profileStatus}</strong>.
                              You can still update NDIS number, address, and emergency contact at any time.
                            </Typography>
                          </Alert>
                        )}
                        <Grid container spacing={2.5}>
                          <Grid item xs={12} md={accountType === 'individual' ? 12 : 6}>
                            <TextField
                              select
                              fullWidth
                              required
                              disabled={!canEditRestrictedFields}
                              size={isMobile ? 'small' : 'medium'}
                              label="Account Type *"
                              {...register('accountType')}
                              helperText={
                                !canEditRestrictedFields 
                                  ? 'Cannot be changed after verification'
                                  : undefined
                              }
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  bgcolor: 'background.paper',
                                },
                              }}
                            >
                              {ACCOUNT_TYPES.map((v) => (
                                <MenuItem key={v} value={v}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {v === 'individual' ? <PersonIcon fontSize="small" /> : <BusinessIcon fontSize="small" />}
                                    <span>{v === 'individual' ? 'Individual Client' : 'Organization / Care Provider'}</span>
                                  </Stack>
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
                                  disabled={!canEditRestrictedFields}
                                  size={isMobile ? 'small' : 'medium'}
                                  label="Organization Name *"
                                  placeholder="Enter your organization's legal name"
                                  {...register('organizationName')}
                                  error={!!errors.organizationName}
                                  helperText={
                                    !canEditRestrictedFields 
                                      ? 'Cannot be changed after verification'
                                      : errors.organizationName?.message
                                  }
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      bgcolor: 'background.paper',
                                    },
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <TextField
                                  fullWidth
                                  required
                                  disabled={!canEditRestrictedFields}
                                  size={isMobile ? 'small' : 'medium'}
                                  label="ABN (Australian Business Number) *"
                                  placeholder="11 digits"
                                  {...register('abn')}
                                  error={!!errors.abn}
                                  helperText={
                                    !canEditRestrictedFields 
                                      ? 'Cannot be changed after verification'
                                      : errors.abn?.message
                                  }
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 2,
                                      bgcolor: 'background.paper',
                                    },
                                  }}
                                />
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </>
                    ) : (
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                            Account Type
                          </Typography>
                          <Chip
                            label={accountType === 'individual' ? 'Individual Client' : 'Organization / Care Provider'}
                            icon={accountType === 'individual' ? <PersonIcon /> : <BusinessIcon />}
                            color="primary"
                            size="small"
                          />
                        </Grid>
                        {basicInfo?.organizationName && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                              Organization Name
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {basicInfo.organizationName}
                            </Typography>
                          </Grid>
                        )}
                        {basicInfo?.abn && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                              ABN
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {basicInfo.abn}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
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
                      <Chip size="small" label="Required" color="error" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
                    </Stack>

                    {isEditMode ? (
                      <>
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
                                transition: 'all 0.25s',
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                                },
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
                                    bgcolor: addressMethod === 'geolocation' ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                                  }}
                                >
                                  <MyLocationIcon sx={{ fontSize: 24, color: addressMethod === 'geolocation' ? 'white' : 'primary.main' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" fontWeight={700}>
                                    GPS Location
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Quick & accurate
                                  </Typography>
                                </Box>
                                {addressMethod === 'geolocation' && <CheckCircle sx={{ fontSize: 24, color: 'primary.main' }} />}
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
                                transition: 'all 0.25s',
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                                },
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
                                    bgcolor: addressMethod === 'manual' ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.1),
                                  }}
                                >
                                  <EditIcon sx={{ fontSize: 24, color: addressMethod === 'manual' ? 'white' : 'primary.main' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" fontWeight={700}>
                                    Manual Entry
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Type your address
                                  </Typography>
                                </Box>
                                {addressMethod === 'manual' && <CheckCircle sx={{ fontSize: 24, color: 'primary.main' }} />}
                              </Stack>
                            </Paper>
                          </Grid>
                        </Grid>

                        {addressMethod === 'geolocation' && (
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
                            }}
                          >
                            {location.isLocating ? 'Detecting Location...' : location.coordinates ? 'Update My Location' : 'Detect My Location'}
                          </Button>
                        )}

                        {addressMethod === 'geolocation' && location.coordinates && location.addressInfo && (
                          <Alert severity="success" sx={{ borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                              Location Detected Successfully
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {location.addressInfo.displayName}
                            </Typography>
                          </Alert>
                        )}

                        <Collapse in={addressMethod === 'manual' || (addressMethod === 'geolocation' && location.coordinates)}>
                          <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                required
                                size={isMobile ? 'small' : 'medium'}
                                label="Street Address *"
                                placeholder="123 Main Street"
                                {...register('address.street')}
                                error={!!errors.address?.street}
                                helperText={errors.address?.street?.message}
                                InputProps={{
                                  startAdornment: <LocationIcon sx={{ color: 'action.active', mr: 1, fontSize: 20 }} />,
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                                  },
                                }}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                required
                                size={isMobile ? 'small' : 'medium'}
                                label="Suburb / City *"
                                placeholder="Perth"
                                {...register('address.suburb')}
                                error={!!errors.address?.suburb}
                                helperText={errors.address?.suburb?.message}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                                  },
                                }}
                              />
                            </Grid>

                            <Grid item xs={6} sm={3}>
                              <TextField
                                fullWidth
                                required
                                size={isMobile ? 'small' : 'medium'}
                                label="State *"
                                placeholder="WA"
                                {...register('address.state')}
                                error={!!errors.address?.state}
                                helperText={errors.address?.state?.message}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                                  },
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
                                    size={isMobile ? 'small' : 'medium'}
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
                                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                                      },
                                    }}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </Collapse>
                      </>
                    ) : (
                      basicInfo?.address && (
                        <Stack direction="row" alignItems="flex-start" spacing={1}>
                          <LocationIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                          <Box>
                            <Typography variant="body1" fontWeight={500}>
                              {basicInfo.address.street}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {basicInfo.address.suburb}, {basicInfo.address.state} {basicInfo.address.postcode}
                            </Typography>
                            {basicInfo.address.coordinates && basicInfo.address.coordinates.length === 2 && (
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                Coordinates: {basicInfo.address.coordinates[1].toFixed(6)}, {basicInfo.address.coordinates[0].toFixed(6)}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      )
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Optional Fields Section */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.grey[100], 0.4) }}>
                  <Stack spacing={3}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <InfoOutlinedIcon sx={{ color: 'info.main', fontSize: 20 }} />
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        Additional Information (Optional)
                      </Typography>
                    </Stack>

                    {isEditMode ? (
                      <>
                        <Grid container spacing={2.5}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              size={isMobile ? 'small' : 'medium'}
                              label="NDIS Number (Optional)"
                              placeholder="Enter your NDIS participant number"
                              {...register('ndisNumber')}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  bgcolor: 'background.paper',
                                },
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              size={isMobile ? 'small' : 'medium'}
                              label="Emergency Contact Name (Optional)"
                              placeholder="John Doe"
                              {...register('emergencyContact.name')}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  bgcolor: 'background.paper',
                                },
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Controller
                              name="emergencyContact.phone"
                              control={control}
                              render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
                                <TextField
                                  fullWidth
                                  size={isMobile ? 'small' : 'medium'}
                                  label="Emergency Contact Phone (Optional)"
                                  placeholder="+61 4XX XXX XXX"
                                  value={formatAustralianPhone(value || '')}
                                  onChange={(e) => {
                                    const e164 = toE164Au(e.target.value)
                                    onChange(e164)
                                  }}
                                  onBlur={onBlur}
                                  error={!!error || (!!value && !isValidAuPhone(value))}
                                  helperText={
                                    error?.message ||
                                    (!!value && !isValidAuPhone(value)
                                      ? 'Enter a valid Australian number'
                                      : 'Australian format: +61 followed by 9 digits')
                                  }
                                  inputProps={{ maxLength: 18 }}
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
                      </>
                    ) : (
                      <Grid container spacing={2.5}>
                        {basicInfo?.ndisNumber && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                              NDIS Number
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {basicInfo.ndisNumber}
                            </Typography>
                          </Grid>
                        )}
                        {basicInfo?.emergencyContact && (basicInfo.emergencyContact.name || basicInfo.emergencyContact.phone) && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                              Emergency Contact
                            </Typography>
                            <Stack spacing={0.5}>
                              {basicInfo.emergencyContact.name && (
                                <Typography variant="body1" fontWeight={500}>
                                  {basicInfo.emergencyContact.name}
                                </Typography>
                              )}
                              {basicInfo.emergencyContact.phone && (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <PhoneIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {basicInfo.emergencyContact.phone}
                                  </Typography>
                                </Stack>
                              )}
                            </Stack>
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
    </>
  )
}

// Export default component
export default BasicInformation

