/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT BILLING PREFERENCES - Profile Management Page
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready billing preferences management page with view/edit modes.
 * Uses TanStack Query for efficient data fetching and caching.
 * 
 * Features:
 * - View mode: Display current billing preferences
 * - Edit mode: Form with validation
 * - Funding type selection
 * - Payment method configuration
 * - Invoice email management
 * - Billing address form
 * - Notes field
 * 
 * @module pages/ClientPages/BillingAndPayment/BillingPreferences
 */

import React, { useMemo, useEffect, useState, useCallback } from 'react'
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  alpha,
  Alert,
} from '@mui/material'
import {
  Receipt as ReceiptIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import { useBilling } from '../../../stores/useClientProfileStore'
import { useAuth } from '../../../context/AuthContext'
import {
  FUNDING_TYPES,
  FUNDING_TYPE_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  AUSTRALIAN_STATES,
  AUSTRALIAN_STATE_LABELS,
} from '../../../components/ClientComponents/ClientOnboarding/constants'

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const billingPreferencesSchema = z.object({
  fundingType: z.enum(FUNDING_TYPES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  invoiceEmail: z.string().email('Invalid email format').optional().or(z.literal('')),
  billingAddress: z.object({
    street: z.string().optional(),
    suburb: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().regex(/^\d{4,5}$/, 'Postcode must be 4 or 5 digits').optional().or(z.literal('')),
  }).optional(),
  notes: z.string().optional(),
})

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const BillingPreferences = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topOffset, setTopOffset] = useState(64)
  const [isEditMode, setIsEditMode] = useState(false)

  // TanStack Query hook
  const { data: billingPreferences, isLoading, isError, error, update, isUpdating } = useBilling()

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
      fundingType: billingPreferences?.fundingType || '',
      paymentMethod: billingPreferences?.paymentMethod || '',
      invoiceEmail: billingPreferences?.invoiceEmail || '',
      billingAddress: {
        street: billingPreferences?.billingAddress?.street || '',
        suburb: billingPreferences?.billingAddress?.suburb || '',
        state: billingPreferences?.billingAddress?.state || '',
        postcode: billingPreferences?.billingAddress?.postcode || '',
      },
      notes: billingPreferences?.notes || '',
    }),
    [billingPreferences]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues,
    resolver: zodResolver(billingPreferencesSchema),
    mode: 'onBlur',
  })

  // Reset form when data changes
  useEffect(() => {
    if (billingPreferences && !isEditMode) {
      reset(defaultValues)
    }
  }, [billingPreferences, isEditMode, defaultValues, reset])

  // Form submission
  const onSubmit = useCallback(
    (values) => {
      // Build payload - only include fields that have values or are being cleared
      const payload = {}
      
      // Handle fundingType
      if (values.fundingType) {
        payload.fundingType = values.fundingType
      } else if (values.fundingType === '') {
        // Explicitly clearing the field
        payload.fundingType = null
      }
      
      // Handle paymentMethod
      if (values.paymentMethod) {
        payload.paymentMethod = values.paymentMethod
      } else if (values.paymentMethod === '') {
        payload.paymentMethod = null
      }
      
      // Handle invoiceEmail
      if (values.invoiceEmail && values.invoiceEmail.trim()) {
        payload.invoiceEmail = values.invoiceEmail.trim()
      } else if (values.invoiceEmail === '') {
        // Explicitly clearing the email
        payload.invoiceEmail = null
      }
      
      // Handle billingAddress
      const hasAddressFields = 
        (values.billingAddress?.street && values.billingAddress.street.trim()) ||
        (values.billingAddress?.suburb && values.billingAddress.suburb.trim()) ||
        (values.billingAddress?.state && values.billingAddress.state.trim()) ||
        (values.billingAddress?.postcode && values.billingAddress.postcode.trim())
      
      if (hasAddressFields) {
        payload.billingAddress = {}
        if (values.billingAddress.street?.trim()) {
          payload.billingAddress.street = values.billingAddress.street.trim()
        }
        if (values.billingAddress.suburb?.trim()) {
          payload.billingAddress.suburb = values.billingAddress.suburb.trim()
        }
        if (values.billingAddress.state?.trim()) {
          payload.billingAddress.state = values.billingAddress.state.trim()
        }
        if (values.billingAddress.postcode?.trim()) {
          payload.billingAddress.postcode = values.billingAddress.postcode.trim()
        }
      }
      
      // Handle notes
      if (values.notes && values.notes.trim()) {
        payload.notes = values.notes.trim()
      } else if (values.notes === '') {
        payload.notes = null
      }
      
      // Ensure at least one field is being updated
      if (Object.keys(payload).length === 0) {
        return
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
                Loading billing preferences...
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
                Error Loading Billing Preferences
              </Typography>
              <Typography variant="body2">{error?.message || 'Failed to load your billing preferences.'}</Typography>
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
                        <ReceiptIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="text.primary">
                          Billing Preferences
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manage your payment and billing settings
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
                {/* Funding Type */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Funding Type
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Optional
                      </Typography>
                    </Stack>

                    {isEditMode ? (
                      <Controller
                        name="fundingType"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            label="Funding Type"
                            {...field}
                            value={field.value || ''}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                              },
                            }}
                          >
                            <MenuItem value="">
                              <em>None selected</em>
                            </MenuItem>
                            {FUNDING_TYPES.map((type) => (
                              <MenuItem key={type} value={type}>
                                {FUNDING_TYPE_LABELS[type] || type}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {billingPreferences?.fundingType
                          ? FUNDING_TYPE_LABELS[billingPreferences.fundingType] || billingPreferences.fundingType
                          : 'Not specified'}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Payment Method */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <PaymentIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Payment Method
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Optional
                      </Typography>
                    </Stack>

                    {isEditMode ? (
                      <Controller
                        name="paymentMethod"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            label="Payment Method"
                            {...field}
                            value={field.value || ''}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                              },
                            }}
                          >
                            <MenuItem value="">
                              <em>None selected</em>
                            </MenuItem>
                            {PAYMENT_METHODS.map((method) => (
                              <MenuItem key={method} value={method}>
                                {PAYMENT_METHOD_LABELS[method] || method}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {billingPreferences?.paymentMethod
                          ? PAYMENT_METHOD_LABELS[billingPreferences.paymentMethod] || billingPreferences.paymentMethod
                          : 'Not specified'}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Invoice Email */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <EmailIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Invoice Email
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Optional
                      </Typography>
                    </Stack>

                    {isEditMode ? (
                      <TextField
                        fullWidth
                        type="email"
                        size={isMobile ? 'small' : 'medium'}
                        label="Invoice Email"
                        placeholder="billing@example.com"
                        {...register('invoiceEmail')}
                        error={!!errors.invoiceEmail}
                        helperText={errors.invoiceEmail?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body1" fontWeight={500}>
                        {billingPreferences?.invoiceEmail || 'Not specified'}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Billing Address */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <HomeIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          Billing Address
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Optional
                      </Typography>
                    </Stack>

                    {isEditMode ? (
                      <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            label="Street Address"
                            placeholder="123 Main Street"
                            {...register('billingAddress.street')}
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
                            label="Suburb"
                            placeholder="Suburb"
                            {...register('billingAddress.suburb')}
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
                            name="billingAddress.state"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                select
                                fullWidth
                                size={isMobile ? 'small' : 'medium'}
                                label="State"
                                {...field}
                                value={field.value || ''}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                  },
                                }}
                              >
                                <MenuItem value="">
                                  <em>Select state</em>
                                </MenuItem>
                                {AUSTRALIAN_STATES.map((state) => (
                                  <MenuItem key={state} value={state}>
                                    {AUSTRALIAN_STATE_LABELS[state] || state}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            label="Postcode"
                            placeholder="6000"
                            {...register('billingAddress.postcode')}
                            error={!!errors.billingAddress?.postcode}
                            helperText={errors.billingAddress?.postcode?.message}
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
                      <Box>
                        {billingPreferences?.billingAddress ? (
                          <Stack spacing={1}>
                            {billingPreferences.billingAddress.street && (
                              <Typography variant="body1" fontWeight={500}>
                                {billingPreferences.billingAddress.street}
                              </Typography>
                            )}
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {billingPreferences.billingAddress.suburb && (
                                <Typography variant="body2" color="text.secondary">
                                  {billingPreferences.billingAddress.suburb}
                                </Typography>
                              )}
                              {billingPreferences.billingAddress.state && (
                                <Typography variant="body2" color="text.secondary">
                                  {billingPreferences.billingAddress.state}
                                </Typography>
                              )}
                              {billingPreferences.billingAddress.postcode && (
                                <Typography variant="body2" color="text.secondary">
                                  {billingPreferences.billingAddress.postcode}
                                </Typography>
                              )}
                            </Stack>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No billing address set
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Notes */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        Notes
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Optional
                      </Typography>
                    </Stack>

                    {isEditMode ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        size={isMobile ? 'small' : 'medium'}
                        label="Billing Notes"
                        placeholder="Any additional notes about billing or payment preferences..."
                        {...register('notes')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {billingPreferences?.notes || 'No notes specified'}
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

export default BillingPreferences
