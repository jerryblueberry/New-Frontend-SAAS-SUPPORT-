/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT CARE PLAN - Profile Management Page
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready care plan management page with view/edit modes.
 * Uses TanStack Query for efficient data fetching and caching.
 * 
 * @module pages/ClientPages/ClientProfile/CarePlan
 */

import React, { useMemo, useEffect, useState, useCallback } from 'react'
import {
  Box,
  Grid,
  TextField,
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
  Assessment as AssessmentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import { useCarePlan } from '../../../stores/useClientProfileStore'
import { useAuth } from '../../../context/AuthContext'
import { toast } from 'react-hot-toast'
import { formatApiError } from '../../../utils/errorFormatter'

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const carePlanSchema = z.object({
  planStartDate: z.string().optional(),
  planEndDate: z.string().optional(),
  totalBudget: z.number().min(0).optional(),
  goals: z.array(z.string().min(1)).optional(),
  notes: z.string().optional(),
})

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const CarePlan = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topOffset, setTopOffset] = useState(64)
  const [isEditMode, setIsEditMode] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  const { data: carePlan, isLoading, isError, error, update, isUpdating } = useCarePlan()

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
      planStartDate: carePlan?.planStartDate ? format(new Date(carePlan.planStartDate), 'yyyy-MM-dd') : '',
      planEndDate: carePlan?.planEndDate ? format(new Date(carePlan.planEndDate), 'yyyy-MM-dd') : '',
      totalBudget: carePlan?.totalBudget || 0,
      goals: carePlan?.goals || [],
      notes: carePlan?.notes || '',
    }),
    [carePlan]
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
    resolver: zodResolver(carePlanSchema),
    mode: 'onBlur',
  })

  const watchedGoals = watch('goals')

  useEffect(() => {
    if (carePlan && !isEditMode) {
      reset(defaultValues)
    }
  }, [carePlan, isEditMode, defaultValues, reset])

  const handleAddGoal = useCallback(() => {
    if (goalInput.trim()) {
      const current = watchedGoals || []
      if (!current.includes(goalInput.trim())) {
        setValue('goals', [...current, goalInput.trim()], { shouldValidate: true })
        setGoalInput('')
      }
    }
  }, [goalInput, watchedGoals, setValue])

  const handleRemoveGoal = useCallback(
    (goal) => {
      const current = watchedGoals || []
      setValue('goals', current.filter((g) => g !== goal), { shouldValidate: true })
    },
    [watchedGoals, setValue]
  )

  const onSubmit = useCallback(
    (values) => {
      const payload = {
        ...values,
        planStartDate: values.planStartDate ? new Date(values.planStartDate).toISOString() : undefined,
        planEndDate: values.planEndDate ? new Date(values.planEndDate).toISOString() : undefined,
      }
      update(payload, {
        onSuccess: () => {
          setIsEditMode(false)
          toast.success('Care plan updated successfully')
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
    setGoalInput('')
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
                Loading care plan...
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
                Error Loading Care Plan
              </Typography>
              <Typography variant="body2">{error?.message || 'Failed to load your care plan.'}</Typography>
            </Alert>
          </Box>
        </Box>
      </Box>
    )
  }

  const remainingBudget = carePlan?.totalBudget && carePlan?.usedBudget
    ? carePlan.totalBudget - carePlan.usedBudget
    : null

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
                        <AssessmentIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="text.primary">
                          Care Plan Summary
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Manage your NDIS care plan details and goals
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

              {/* Budget Summary Card */}
              {carePlan && (carePlan.totalBudget || carePlan.usedBudget) && (
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                      <StarIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        Budget Overview
                      </Typography>
                    </Stack>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                          Total Budget
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                          ${carePlan.totalBudget?.toLocaleString() || '0.00'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                          Used Budget
                        </Typography>
                        <Typography variant="h5" fontWeight={700} color="text.primary">
                          ${carePlan.usedBudget?.toLocaleString() || '0.00'}
                        </Typography>
                      </Grid>
                      {remainingBudget !== null && (
                        <Grid item xs={12} sm={4}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                            Remaining Budget
                          </Typography>
                          <Typography variant="h5" fontWeight={700} color="success.main">
                            ${remainingBudget.toLocaleString()}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              )}

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
                {/* Plan Dates */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Stack spacing={2.5}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Plan Dates
                    </Typography>

                    {isEditMode ? (
                      <Grid container spacing={2.5}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            size={isMobile ? 'small' : 'medium'}
                            label="Plan Start Date"
                            InputLabelProps={{ shrink: true }}
                            {...register('planStartDate')}
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
                            type="date"
                            size={isMobile ? 'small' : 'medium'}
                            label="Plan End Date"
                            InputLabelProps={{ shrink: true }}
                            {...register('planEndDate')}
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
                            type="number"
                            size={isMobile ? 'small' : 'medium'}
                            label="Total Budget (AUD)"
                            {...register('totalBudget', { valueAsNumber: true })}
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
                        {carePlan?.planStartDate && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                              Plan Start Date
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {format(new Date(carePlan.planStartDate), 'dd/MM/yyyy')}
                            </Typography>
                          </Grid>
                        )}
                        {carePlan?.planEndDate && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                              Plan End Date
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {format(new Date(carePlan.planEndDate), 'dd/MM/yyyy')}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* Goals */}
                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack spacing={2.5}>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      Goals
                    </Typography>

                    {isEditMode ? (
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            label="Add Goal"
                            placeholder="e.g., Improve mobility"
                            value={goalInput}
                            onChange={(e) => setGoalInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddGoal()
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
                            onClick={handleAddGoal}
                            disabled={!goalInput.trim()}
                            startIcon={<AddIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
                          >
                            Add
                          </Button>
                        </Stack>
                        {watchedGoals && watchedGoals.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {watchedGoals.map((goal, idx) => (
                              <Chip
                                key={idx}
                                label={goal}
                                onDelete={() => handleRemoveGoal(goal)}
                                deleteIcon={<DeleteIcon />}
                                size="small"
                                color="primary"
                              />
                            ))}
                          </Box>
                        )}
                      </Stack>
                    ) : (
                      <Stack spacing={1}>
                        {carePlan?.goals && carePlan.goals.length > 0 ? (
                          carePlan.goals.map((goal, idx) => (
                            <Typography
                              key={idx}
                              variant="body2"
                              sx={{ pl: 1, borderLeft: `2px solid ${theme.palette.primary.main}` }}
                            >
                              {goal}
                            </Typography>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No goals set
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
                      Notes
                    </Typography>

                    {isEditMode ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        size={isMobile ? 'small' : 'medium'}
                        label="Care Plan Notes"
                        placeholder="Additional notes about your care plan..."
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
                        {carePlan?.notes || 'No notes added'}
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

export default CarePlan

