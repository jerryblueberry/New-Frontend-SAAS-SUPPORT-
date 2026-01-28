/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT COMMUNICATION PREFERENCES - Profile Management Page
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready communication preferences management page with view/edit modes.
 * Uses TanStack Query for efficient data fetching and caching.
 * 
 * @module pages/ClientPages/ClientProfile/Communication
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
  Chip,
  Alert,
} from '@mui/material'
import {
  Phone as PhoneIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Email as EmailIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import { useCommunication } from '../../../stores/useClientProfileStore'
import { useAuth } from '../../../context/AuthContext'
import { toast } from 'react-hot-toast'
import { formatApiError } from '../../../utils/errorFormatter'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const COMMUNICATION_METHODS = ['email', 'sms', 'phone', 'portal']
const COMMUNICATION_METHOD_LABELS = {
  email: 'Email',
  sms: 'SMS',
  phone: 'Phone',
  portal: 'Portal',
}

const LANGUAGES = ['English', 'Mandarin', 'Cantonese', 'Arabic', 'Vietnamese', 'Italian', 'Greek', 'Spanish', 'Other']

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const communicationSchema = z.object({
  preferredMethod: z.enum(COMMUNICATION_METHODS).optional(),
  preferredLanguage: z.string().optional(),
  accessibilityNeeds: z.array(z.string()).optional(),
  communicationNotes: z.string().optional(),
})

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const Communication = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topOffset, setTopOffset] = useState(64)
  const [isEditMode, setIsEditMode] = useState(false)
  const [accessibilityInput, setAccessibilityInput] = useState('')

  const { data: communication, isLoading, isError, error, update, isUpdating } = useCommunication()

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

  const defaultValues = useMemo(
    () => ({
      preferredMethod: communication?.preferredMethod || 'email',
      preferredLanguage: communication?.preferredLanguage || 'English',
      // Ensure accessibilityNeeds is always an array (best practice)
      accessibilityNeeds: Array.isArray(communication?.accessibilityNeeds) 
        ? communication.accessibilityNeeds.filter(need => need && need.trim()) // Filter out empty/null values
        : [],
      communicationNotes: communication?.communicationNotes || '',
    }),
    [communication]
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
    resolver: zodResolver(communicationSchema),
    mode: 'onBlur',
  })

  const watchedAccessibilityNeeds = watch('accessibilityNeeds')

  useEffect(() => {
    if (communication && !isEditMode) {
      reset(defaultValues)
    }
  }, [communication, isEditMode, defaultValues, reset])

  const handleAddAccessibilityNeed = useCallback(() => {
    if (accessibilityInput.trim()) {
      const current = Array.isArray(watchedAccessibilityNeeds) ? watchedAccessibilityNeeds : []
      const trimmedInput = accessibilityInput.trim()
      
      // Prevent duplicates (case-insensitive)
      const normalizedCurrent = current.map(need => need.toLowerCase())
      if (!normalizedCurrent.includes(trimmedInput.toLowerCase())) {
        setValue('accessibilityNeeds', [...current, trimmedInput], { shouldValidate: true })
        setAccessibilityInput('')
      } else {
        toast.error('This accessibility need is already added', { id: 'duplicate-accessibility' })
      }
    }
  }, [accessibilityInput, watchedAccessibilityNeeds, setValue])

  const handleRemoveAccessibilityNeed = useCallback(
    (need) => {
      const current = Array.isArray(watchedAccessibilityNeeds) ? watchedAccessibilityNeeds : []
      setValue('accessibilityNeeds', current.filter((n) => n !== need), { shouldValidate: true })
    },
    [watchedAccessibilityNeeds, setValue]
  )

  const onSubmit = useCallback(
    (values) => {
      // Ensure accessibilityNeeds is always an array (best practice)
      const normalizedValues = {
        ...values,
        accessibilityNeeds: Array.isArray(values.accessibilityNeeds) 
          ? values.accessibilityNeeds.filter(need => need && typeof need === 'string' && need.trim()) // Remove empty/invalid values
          : [],
      }

      // Backend accepts both flat and nested structures (best practice for flexibility)
      // Send flat structure for consistency with other profile updates
      // Backend will normalize and validate: { preferredMethod, preferredLanguage, accessibilityNeeds: string[], communicationNotes }
      const payload = {
        preferredMethod: normalizedValues.preferredMethod,
        preferredLanguage: normalizedValues.preferredLanguage,
        accessibilityNeeds: normalizedValues.accessibilityNeeds, // Array of strings - properly handled
        communicationNotes: normalizedValues.communicationNotes,
      }

      update(payload, {
        onSuccess: () => {
          setIsEditMode(false)
          toast.success('Communication preferences updated successfully')
        },
        onError: (error) => {
          const message = formatApiError(error)
          toast.error(message)
        },
      })
    },
    [update]
  )

  const handleEditClick = useCallback(() => {
    setIsEditMode(true)
    reset(defaultValues)
  }, [reset, defaultValues])

  const handleCancelClick = useCallback(() => {
    setIsEditMode(false)
    reset(defaultValues)
    setAccessibilityInput('')
  }, [reset, defaultValues])

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
                Loading communication preferences...
              </Typography>
            </Stack>
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
                Error Loading Communication Preferences
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
                        <PhoneIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="text.primary">
                          Communication Preferences
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manage how you prefer to be contacted
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
                {/* Preferred Method & Language */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Stack spacing={2.5}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Contact Preferences
                    </Typography>

                    {isEditMode ? (
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name="preferredMethod"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                select
                                fullWidth
                                size={isMobile ? 'small' : 'medium'}
                                label="Preferred Method"
                                {...field}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                  },
                                }}
                              >
                                {COMMUNICATION_METHODS.map((method) => (
                                  <MenuItem key={method} value={method}>
                                    {COMMUNICATION_METHOD_LABELS[method] || method}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name="preferredLanguage"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                select
                                fullWidth
                                size={isMobile ? 'small' : 'medium'}
                                label="Preferred Language"
                                {...field}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                  },
                                }}
                              >
                                {LANGUAGES.map((lang) => (
                                  <MenuItem key={lang} value={lang}>
                                    {lang}
                                  </MenuItem>
                                ))}
                              </TextField>
                            )}
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                            Preferred Method
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {COMMUNICATION_METHOD_LABELS[communication?.preferredMethod] || communication?.preferredMethod || 'Not set'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                            Preferred Language
                          </Typography>
                          <Typography variant="body1" fontWeight={500}>
                            {communication?.preferredLanguage || 'Not set'}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Accessibility Needs */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Accessibility Needs
                    </Typography>

                    {isEditMode ? (
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            label="Add Accessibility Need"
                            placeholder="e.g., Large print, Sign language, Screen reader"
                            value={accessibilityInput}
                            onChange={(e) => setAccessibilityInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddAccessibilityNeed()
                              }
                            }}
                            helperText="Press Enter or click Add to include an accessibility need"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                              },
                            }}
                          />
                          <Button
                            variant="contained"
                            onClick={handleAddAccessibilityNeed}
                            disabled={!accessibilityInput.trim()}
                            sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
                          >
                            Add
                          </Button>
                        </Stack>
                        {Array.isArray(watchedAccessibilityNeeds) && watchedAccessibilityNeeds.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {watchedAccessibilityNeeds.map((need, idx) => (
                              <Chip
                                key={`${need}-${idx}`} // Better key using value + index
                                label={need}
                                onDelete={() => handleRemoveAccessibilityNeed(need)}
                                size="small"
                                variant="outlined"
                                sx={{
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No accessibility needs added yet
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {Array.isArray(communication?.accessibilityNeeds) && communication.accessibilityNeeds.length > 0 ? (
                          communication.accessibilityNeeds.map((need, idx) => (
                            <Chip 
                              key={`${need}-${idx}`} 
                              label={need} 
                              size="small" 
                              variant="outlined"
                              sx={{
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                },
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No accessibility needs specified
                          </Typography>
                        )}
                      </Stack>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Notes */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.grey[100], 0.4) }}>
                  <Stack spacing={2.5}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Additional Notes
                    </Typography>

                    {isEditMode ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        size={isMobile ? 'small' : 'medium'}
                        label="Communication Notes"
                        placeholder="Any additional notes about your communication preferences..."
                        {...register('communicationNotes')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                          },
                        }}
                      />
                    ) : (
                      <Typography variant="body2">
                        {communication?.communicationNotes || 'No notes added'}
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

export default Communication

