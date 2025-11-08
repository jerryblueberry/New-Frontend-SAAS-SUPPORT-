import React, { useMemo, useEffect, useState } from 'react'
import {
  Box, Grid, TextField, MenuItem, Button, Paper, Chip, Snackbar, Alert,
  LinearProgress, Typography, Stack, Divider, CircularProgress, useTheme, useMediaQuery,
  Card, CardContent, Tooltip, IconButton, alpha, Fade, Collapse
} from '@mui/material'
import {
  MyLocation as MyLocationIcon,
  LocationOn as LocationIcon,
  CheckCircle,
  Warning as WarningIcon,
  Info,
  Business as BusinessIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useClientOnboardingQuery, useBasicInformationMutation, useClientOnboarding } from '../../../stores/useClientOnboardingStore'
import { useAuth } from '../../../context/AuthContext'
import { toast } from 'react-hot-toast'
import { toE164Au, isValidAuPhone, formatAuInternational } from '../../../utils/phone'

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
const clientProfileSchema = z.object({
  accountType: z.enum(['individual', 'organization']),
  organizationName: z.string().optional(),
  abn: z.string().optional(),
  ndisNumber: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
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
  const { data: onboardingData } = useClientOnboardingQuery()
  const profile = onboardingData?.data?.profile || null
  const { mutate: saveBasicInfo, isPending: isSaving } = useBasicInformationMutation()
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

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

  const { register, handleSubmit, watch, reset, control, formState: { errors }, setValue } = useForm({ 
    defaultValues,
    resolver: zodResolver(clientProfileSchema),
    mode: 'onBlur'
  })
  const accountType = watch('accountType')

  const [addressMethod, setAddressMethod] = useState(
    profile?.address?.coordinates ? 'geolocation' : 'manual'
  )

  const [location, setLocation] = useState({
    coordinates: profile?.address?.coordinates || null,
    isLocating: false,
    addressInfo: null
  })

  useEffect(() => {
    if (profile) {
      reset(defaultValues)
      setAddressMethod(profile?.address?.coordinates ? 'geolocation' : 'manual')
      setLocation({
        coordinates: profile?.address?.coordinates || null,
        isLocating: false,
        addressInfo: null
      })
    }
  }, [profile, reset, defaultValues])

  const fetchAddressFromCoordinates = async (latitude, longitude) => {
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
  }

  const handleGetCurrentLocation = async () => {
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
  }

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
    if (values.accountType === 'individual') {
      values.organizationName = undefined
      values.abn = undefined
    }

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

    const addressData = {
      street: values.address?.street || '',
      suburb: values.address?.suburb || '',
      state: values.address?.state || '',
      postcode: values.address?.postcode || ''
    }

    if (location.coordinates && addressMethod === 'geolocation') {
      addressData.coordinates = location.coordinates
    }

    const payload = { ...values, address: addressData }
    const cleanedPayload = prune(payload)

    saveBasicInfo(cleanedPayload, {
      onSuccess: (data) => {
        toast.success(data.message || 'Profile saved successfully!')
        setSnack({ open: true, message: 'Profile saved successfully', severity: 'success' })
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'Save failed'
        toast.error(errorMessage)
        setSnack({ open: true, message: errorMessage, severity: 'error' })
      }
    })
  }

  const isStepComplete = profile?.profileCompleteness?.completedSteps?.basicInformation
  const isProfileComplete = profile?.profileCompleteness?.percentage === 100

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
                      Profile Completion
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="primary.main">
                      {localPct}%
                    </Typography>
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
                          ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`
                          : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {localPct === 100 ? '✓ All fields completed' : `${4 + (accountType === 'organization' ? 2 : 0) - Math.round(localPct / 100 * (4 + (accountType === 'organization' ? 2 : 0)))} fields remaining`}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <BusinessIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Account Information
              </Typography>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  label="Account Type"
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
                          <span>Individual</span>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <BusinessIcon fontSize="small" />
                          <span>Organization</span>
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
                      size={isMobile ? "small" : "medium"}
                      label="Organization Name"
                      {...register('organizationName')}
                      error={!!errors.organizationName}
                      helperText={errors.organizationName?.message}
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
                      size={isMobile ? "small" : "medium"}
                      label="ABN"
                      {...register('abn')}
                      error={!!errors.abn}
                      helperText={errors.abn?.message}
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  label="NDIS Number (Optional)"
                  {...register('ndisNumber')}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.paper'
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>

        <Divider />

        {/* Address Section */}
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <LocationIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Service Address
              </Typography>
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
                    label="Street Address"
                    placeholder="123 Main Street"
                    {...register('address.street')}
                    error={!!errors.address?.street}
                    helperText={errors.address?.street?.message}
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
                    size={isMobile ? "small" : "medium"}
                    label="Suburb / City"
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
                    size={isMobile ? "small" : "medium"}
                    label="State"
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
                        size={isMobile ? "small" : "medium"}
                        label="Postcode"
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

        {/* Emergency Contact Section */}
        <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.background.default, 0.3) }}>
          <Stack spacing={2.5}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <PhoneIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Emergency Contact
              </Typography>
              <Chip label="Optional" size="small" variant="outlined" />
            </Stack>

            <Grid container spacing={2.5}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  label="Contact Name"
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
                      label="Contact Phone"
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
                            : 'Australian format: +61 followed by 9 digits (mobile or landline)')
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
          </Stack>
        </Box>

        <Divider />

        {/* Submit Section */}
        <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              {localPct === 100 ? (
                <>
                  <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />
                  <Typography variant="body2" color="success.dark" fontWeight={600}>
                    All required fields completed
                  </Typography>
                </>
              ) : (
                <>
                  <Info sx={{ fontSize: 20, color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Complete all fields to proceed
                  </Typography>
                </>
              )}
            </Stack>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{
                minWidth: { xs: '100%', sm: 200 },
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  bgcolor: alpha(theme.palette.primary.main, 0.6),
                  color: 'white'
                }
              }}
            >
              {isSaving ? 'Saving Profile...' : 'Save & Continue'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        sx={{ mt: { xs: 7, sm: 8 } }}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}