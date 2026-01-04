// src/components/Onboarding/AvailabilityForm.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
  Alert,
  Container,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { MapPin, Car, Calendar, Clock, CalendarOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useOnboardingStore, { useAvailabilityMutation } from '../../stores/useOnboardingStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserUpcomingHolidays, createUserUpcomingHoliday, deleteUserUpcomingHoliday, updateUserUpcomingHoliday } from '../../api/holidays';

import HolidayDisplaySection from '../AvailabilityComponent/UpcomingHoliday/HolidayDisplaySection';
import TimeSlotSelector from '../WorkerAvailabilityOnboarding/TimeSlotSelector';
import SectionHeader from '../WorkerAvailabilityOnboarding/components/shared/SectionHeader';
import TipBox from '../WorkerAvailabilityOnboarding/components/shared/TipBox';
import SectionCard from '../WorkerAvailabilityOnboarding/components/shared/SectionCard';
import LocationTravelSection from './components/LocationTravelSection';
import HolidayDialog from './components/HolidayDialog';
import FormActions from './components/FormActions';

const AvailabilityForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { availability } = useOnboardingStore();

  // TanStack Query for holidays
  const queryClient = useQueryClient();
  const { data: upcomingHolidays = [], isLoading: holidaysLoading, isError: holidaysError } = useQuery({
    queryKey: ['userHolidays'],
    queryFn: fetchUserUpcomingHolidays,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
  });
  
  const { mutate: createHoliday, isPending: isCreating, error: createError } = useMutation({
    mutationFn: createUserUpcomingHoliday,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userHolidays'] }),
  });
  
  const { mutate: deleteHoliday } = useMutation({
    mutationFn: deleteUserUpcomingHoliday,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userHolidays'] }),
  });
  
  const { mutate: editHoliday } = useMutation({
    mutationFn: ({ id, data }) => updateUserUpcomingHoliday(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userHolidays'] }),
  });

  // Holiday dialog state
  const [openHolidayDialog, setOpenHolidayDialog] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', startDate: '', endDate: '', description: '' });
  const [holidayError, setHolidayError] = useState('');
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [dateOverlapWarning, setDateOverlapWarning] = useState('');

  const checkDateOverlap = useCallback((startDate, endDate, excludeHolidayId = null) => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return upcomingHolidays.some(holiday => {
      if (excludeHolidayId && holiday._id === excludeHolidayId) return false;
      const existingStart = new Date(holiday.startDate);
      const existingEnd = new Date(holiday.endDate);
      return (start <= existingEnd && end >= existingStart) || (existingStart <= end && existingEnd >= start);
    });
  }, [upcomingHolidays]);

  useEffect(() => {
    if (editingHoliday) {
      setNewHoliday({
        name: editingHoliday.name,
        startDate: editingHoliday.startDate.slice(0, 10),
        endDate: editingHoliday.endDate.slice(0, 10),
        description: editingHoliday.description || '',
      });
    } else {
      setNewHoliday({ name: '', startDate: '', endDate: '', description: '' });
    }
    setHolidayError('');
    setDateOverlapWarning('');
  }, [editingHoliday, openHolidayDialog]);

  const handleCreateOrEditHoliday = () => {
    setHolidayError('');
    if (!newHoliday.startDate || !newHoliday.endDate) {
      setHolidayError('Start date and end date are required.');
      return;
    }
    const holidayData = {
      ...newHoliday,
      name: newHoliday.name?.trim() || `Time Off (${new Date(newHoliday.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
    };
    if (new Date(newHoliday.endDate) < new Date(newHoliday.startDate)) {
      setHolidayError('End date cannot be before start date.');
      return;
    }
    const hasOverlap = upcomingHolidays.some(holiday => {
      if (editingHoliday && holiday._id === editingHoliday._id) return false;
      const existingStart = new Date(holiday.startDate);
      const existingEnd = new Date(holiday.endDate);
      const startDate = new Date(newHoliday.startDate);
      const endDate = new Date(newHoliday.endDate);
      return (startDate <= existingEnd && endDate >= existingStart);
    });
    if (hasOverlap) {
      setHolidayError('This date range overlaps with an existing holiday.');
      return;
    }
    if (editingHoliday) {
      editHoliday({ id: editingHoliday._id, data: holidayData }, {
        onSuccess: () => { setOpenHolidayDialog(false); setEditingHoliday(null); setNewHoliday({ name: '', startDate: '', endDate: '', description: '' }); },
        onError: () => setHolidayError('Failed to update holiday.'),
      });
    } else {
      createHoliday(holidayData, {
        onSuccess: () => { setOpenHolidayDialog(false); setNewHoliday({ name: '', startDate: '', endDate: '', description: '' }); },
        onError: () => setHolidayError('Failed to create holiday.'),
      });
    }
  };

  const updateAvailability = useOnboardingStore((state) => state.updateAvailability);
  const addCustomTimeSlot = useOnboardingStore((state) => state.addCustomTimeSlot);
  const removeCustomTimeSlot = useOnboardingStore((state) => state.removeCustomTimeSlot);
  const prevStep = useOnboardingStore((state) => state.prevStep);
  const { mutate: saveAvailability, isPending, error: mutationError } = useAvailabilityMutation();

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [validationState, setValidationState] = useState({});

  useEffect(() => {
    if (!availability.customTimeSlots) updateAvailability({ customTimeSlots: [] });
    if (!availability.kmWillingToTravel) updateAvailability({ kmWillingToTravel: 20 });
  }, [availability, updateAvailability]);

  const travelDistance = availability.kmWillingToTravel || 20;
  const suburb = availability.suburb || '';

  // Real-time validation with status tracking
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'timeSlots':
        if (!availability.customTimeSlots || availability.customTimeSlots.length === 0) {
          return { error: 'At least one time slot is required', status: 'error' };
        }
        return { error: null, status: 'success' };
      case 'suburb':
        if (!value || !value.trim()) {
          return { error: 'Please enter your suburb location', status: 'error' };
        }
        return { error: null, status: 'success' };
      case 'travelDistance':
        const dist = value || 20;
        if (isNaN(dist) || dist < 1 || dist > 100) {
          return { error: 'Travel distance must be between 1 and 100 km', status: 'error' };
        }
        if (dist < 10) {
          return { error: null, status: 'warning', message: 'A smaller radius may reduce your job match rate' };
        }
        return { error: null, status: 'success' };
      default:
        return { error: null, status: 'default' };
    }
  }, [availability.customTimeSlots]);

  // Dynamic validation on field changes
  useEffect(() => {
    const newValidationState = {};
    
    // Validate time slots
    const timeSlotsValidation = validateField('timeSlots', availability.customTimeSlots);
    if (touched.timeSlots || availability.customTimeSlots?.length > 0) {
      newValidationState.timeSlots = timeSlotsValidation;
    }

    // Validate suburb
    const suburbValidation = validateField('suburb', suburb);
    if (touched.suburb || suburb) {
      newValidationState.suburb = suburbValidation;
    }

    // Validate travel distance
    const travelValidation = validateField('travelDistance', travelDistance);
    if (touched.travelDistance || travelDistance !== 20) {
      newValidationState.travelDistance = travelValidation;
    }

    setValidationState(newValidationState);
  }, [availability.customTimeSlots, suburb, travelDistance, touched, validateField]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!availability.customTimeSlots || availability.customTimeSlots.length === 0) {
      newErrors.timeSlots = 'Please add at least one time slot';
    }
    const travelDist = availability.kmWillingToTravel || 20;
    if (isNaN(travelDist) || travelDist < 1 || travelDist > 100) {
      newErrors.travelDistance = 'Travel distance must be between 1 and 100 km';
    }
    const suburbValue = availability.suburb || '';
    if (!suburbValue || !suburbValue.trim()) {
      newErrors.suburb = 'Please enter your suburb';
    }
    return newErrors;
  }, [availability]);

  // Calculate form completion percentage
  const formCompletion = useMemo(() => {
    let completed = 0;
    let total = 3;
    
    if (availability.customTimeSlots && availability.customTimeSlots.length > 0) completed++;
    if (suburb && suburb.trim()) completed++;
    if (travelDistance >= 1 && travelDistance <= 100) completed++;
    
    return Math.round((completed / total) * 100);
  }, [availability.customTimeSlots, suburb, travelDistance]);

  const ToastCloseButton = useCallback(({ closeToast }) => (
    <IconButton aria-label="close" size="small" onClick={closeToast} sx={{ position: 'absolute', right: 8, top: 8 }}>
      <CloseIcon fontSize="small" />
    </IconButton>
  ), []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // Mark all fields as touched
    setTouched({
      timeSlots: true,
      suburb: true,
      travelDistance: true,
    });
    
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length === 0) {
      saveAvailability(availability);
    } else {
      const errorFields = Object.keys(formErrors);
      toast.error(
        `Please complete: ${errorFields.map(f => {
          if (f === 'timeSlots') return 'working hours';
          if (f === 'suburb') return 'location';
          if (f === 'travelDistance') return 'travel radius';
          return f;
        }).join(', ')}`,
        { position: 'top-center', autoClose: 4000 }
      );
    }
  }, [availability, saveAvailability, validateForm]);

  const handleAddSlot = useCallback((slot) => {
    addCustomTimeSlot(slot);
    setTouched(prev => ({ ...prev, timeSlots: true }));
    setErrors(prev => ({ ...prev, timeSlots: null }));
  }, [addCustomTimeSlot]);

  const handleEditSlot = useCallback((index, slot) => {
    const updatedSlots = [...availability.customTimeSlots];
    updatedSlots[index] = slot;
    updateAvailability({ customTimeSlots: updatedSlots });
    setTouched(prev => ({ ...prev, timeSlots: true }));
    setErrors(prev => ({ ...prev, timeSlots: null }));
  }, [availability.customTimeSlots, updateAvailability]);

  const handleRemoveSlot = useCallback((index) => {
    removeCustomTimeSlot(index);
    setTouched(prev => ({ ...prev, timeSlots: true }));
    if (availability.customTimeSlots?.length <= 1) {
      setErrors(prev => ({ ...prev, timeSlots: 'Please add at least one time slot' }));
    }
  }, [removeCustomTimeSlot, availability.customTimeSlots]);

  const handleSuburbChange = useCallback((val) => {
    updateAvailability({ suburb: val });
    setTouched(prev => ({ ...prev, suburb: true }));
    setErrors(prev => ({ ...prev, suburb: null }));
  }, [updateAvailability]);

  const handleTravelDistanceChange = useCallback((val) => {
    updateAvailability({ kmWillingToTravel: val });
    setTouched(prev => ({ ...prev, travelDistance: true }));
    setErrors(prev => ({ ...prev, travelDistance: null }));
  }, [updateAvailability]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeButton={<ToastCloseButton />}
        limit={2}
        transition={Slide}
        toastStyle={{ borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
      />

      {/* Page Header - Enhanced SaaS Design with Progress */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                flexShrink: 0,
              }}
            >
              <Calendar size={24} color="white" strokeWidth={2.5} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: '1.375rem', sm: '1.5rem' },
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Your Availability
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.25, lineHeight: 1.4 }}>
                Set your schedule to match with employers • Broader availability increases your job match rate
              </Typography>
            </Box>
          </Box>
          
          {/* Completion Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: '10px',
              bgcolor: formCompletion === 100 ? '#ecfdf5' : '#f0f9ff',
              border: `1px solid ${formCompletion === 100 ? '#10b981' : '#3b82f6'}20`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {formCompletion === 100 ? (
                <CheckCircle2 size={16} color="#10b981" strokeWidth={2.5} />
              ) : (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    border: '2px solid #3b82f6',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              )}
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: formCompletion === 100 ? '#10b981' : '#3b82f6' }}>
                {formCompletion}% Complete
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Form completion
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              {formCompletion}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={formCompletion}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                bgcolor: formCompletion === 100 ? '#10b981' : '#3b82f6',
                transition: 'all 0.3s ease',
              },
            }}
          />
        </Box>

        {/* Status Pills Row - Enhanced */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          <Tooltip title={`${availability.customTimeSlots?.length || 0} time slot${(availability.customTimeSlots?.length || 0) !== 1 ? 's' : ''} configured`} arrow>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.625,
                borderRadius: '8px',
                bgcolor: (availability.customTimeSlots?.length || 0) > 0 ? '#eff6ff' : '#f1f5f9',
                border: `1px solid ${(availability.customTimeSlots?.length || 0) > 0 ? '#3b82f640' : '#e2e8f0'}`,
                cursor: 'help',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: (availability.customTimeSlots?.length || 0) > 0 ? '#dbeafe' : '#e2e8f0',
                },
              }}
            >
              <Clock size={13} color={(availability.customTimeSlots?.length || 0) > 0 ? "#3b82f6" : "#94a3b8"} strokeWidth={2.5} />
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: (availability.customTimeSlots?.length || 0) > 0 ? '#3b82f6' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {availability.customTimeSlots?.length || 0} {availability.customTimeSlots?.length === 1 ? 'slot' : 'slots'}
              </Typography>
              {(availability.customTimeSlots?.length || 0) > 0 && (
                <CheckCircle2 size={12} color="#10b981" strokeWidth={2.5} />
              )}
            </Box>
          </Tooltip>
          
          <Tooltip title={suburb ? `Location: ${suburb}` : 'Location not set'} arrow>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.625,
                borderRadius: '8px',
                bgcolor: suburb ? '#ecfdf5' : '#fef3c7',
                border: `1px solid ${suburb ? '#10b98140' : '#f59e0b40'}`,
                cursor: 'help',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: suburb ? '#d1fae5' : '#fde68a',
                },
              }}
            >
              <MapPin size={13} color={suburb ? '#10b981' : '#f59e0b'} strokeWidth={2.5} />
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: suburb ? '#10b981' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {suburb ? 'Located' : 'Needed'}
              </Typography>
              {suburb && <CheckCircle2 size={12} color="#10b981" strokeWidth={2.5} />}
            </Box>
          </Tooltip>
          
          <Tooltip title={`Willing to travel up to ${travelDistance} km from your location`} arrow>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.625,
                borderRadius: '8px',
                bgcolor: '#f0fdf4',
                border: '1px solid #22c55e40',
                cursor: 'help',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#dcfce7',
                },
              }}
            >
              <Car size={13} color="#22c55e" strokeWidth={2.5} />
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {travelDistance}km
              </Typography>
              <CheckCircle2 size={12} color="#10b981" strokeWidth={2.5} />
            </Box>
          </Tooltip>
        </Box>

        {isPending && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress 
              sx={{ 
                borderRadius: 1,
                height: 4,
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#3b82f6',
                },
              }} 
            />
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', mt: 0.75, textAlign: 'center' }}>
              Saving your availability...
            </Typography>
          </Box>
        )}
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          
          {/* ═══════════════════════════════════════════════════════════════
              SECTION 1: TIME SLOTS
              What it does: Define your working hours for each day
          ═══════════════════════════════════════════════════════════════ */}
          <SectionCard error={errors.timeSlots} theme={theme}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <SectionHeader
                  icon={Clock}
                  iconColor="#6366f1"
                  iconBg={alpha('#6366f1', 0.1)}
                  title="Working Hours"
                  subtitle="Define when you're available to work each day of the week"
                  step="1"
                />
              </Box>
              {/* Validation Status */}
              {touched.timeSlots && validationState.timeSlots && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
                  {validationState.timeSlots.status === 'success' ? (
                    <Chip
                      icon={<CheckCircle2 size={14} color="#10b981" />}
                      label="Complete"
                      size="small"
                      sx={{
                        bgcolor: '#ecfdf5',
                        color: '#10b981',
                        fontWeight: 600,
                        fontSize: '0.6875rem',
                        height: 24,
                        '& .MuiChip-icon': { color: '#10b981' },
                      }}
                    />
                  ) : (
                    <Chip
                      icon={<AlertCircle size={14} color="#ef4444" />}
                      label="Required"
                      size="small"
                      sx={{
                        bgcolor: '#fef2f2',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.6875rem',
                        height: 24,
                        '& .MuiChip-icon': { color: '#ef4444' },
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>

            {/* Helper Text */}
            <Box sx={{ mb: 2, p: 1.5, borderRadius: '10px', bgcolor: alpha('#6366f1', 0.04), border: `1px solid ${alpha('#6366f1', 0.1)}` }}>
              <Typography sx={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6 }}>
                <strong>Tip:</strong> Add multiple time slots per day to increase your job matches. Employers search for workers available during specific hours.
              </Typography>
            </Box>

            <TimeSlotSelector
              customTimeSlots={availability.customTimeSlots || []}
              onAddSlot={handleAddSlot}
              onEditSlot={handleEditSlot}
              onRemoveSlot={handleRemoveSlot}
              disabled={isPending}
              error={errors.timeSlots}
            />

            {/* Dynamic Feedback */}
            {touched.timeSlots && validationState.timeSlots && (
              <Box sx={{ mt: 2 }}>
                {validationState.timeSlots.status === 'success' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 1.25, borderRadius: '8px', bgcolor: '#ecfdf5', border: '1px solid #10b98130' }}>
                    <CheckCircle2 size={16} color="#10b981" strokeWidth={2.5} />
                    <Typography sx={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 500 }}>
                      Great! You have {availability.customTimeSlots?.length || 0} time slot{(availability.customTimeSlots?.length || 0) !== 1 ? 's' : ''} configured.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, p: 1.25, borderRadius: '8px', bgcolor: '#fef2f2', border: '1px solid #ef444430' }}>
                    <AlertCircle size={16} color="#ef4444" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 600, mb: 0.25 }}>
                        Time slots required
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#991b1b', lineHeight: 1.5 }}>
                        Add at least one time slot to show when you're available. This helps employers find you for jobs.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ mt: 2.5 }}>
              <TipBox color="#6366f1" text="Pro tip: Configure separate availability for weekdays and weekends to maximize your job matches across different scheduling needs." />
            </Box>
          </SectionCard>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 2: LOCATION & TRAVEL
              What it does: Set your base location and travel radius
          ═══════════════════════════════════════════════════════════════ */}
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, mb: 1.5 }}>
                <strong>Why this matters:</strong> Your location and travel radius help employers find workers in their area. A larger radius expands your job match potential but may require more travel time.
              </Typography>
            </Box>
            <LocationTravelSection
              availability={availability}
              updateAvailability={updateAvailability}
              errors={errors}
              setErrors={setErrors}
              touched={touched}
              validationState={validationState}
              onSuburbChange={handleSuburbChange}
              onTravelDistanceChange={handleTravelDistanceChange}
            />
          </Box>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 3: TIME OFF / HOLIDAYS
              What it does: Block dates when you're unavailable
          ═══════════════════════════════════════════════════════════════ */}
          <SectionCard theme={theme}>
            <SectionHeader
              icon={CalendarOff}
              iconColor="#6366f1"
              iconBg={alpha('#6366f1', 0.1)}
              title="Upcoming Time Off"
              subtitle="Block dates when you won't be available for work (optional)"
              step="3"
            />
            
            {/* Helper Text */}
            <Box sx={{ mb: 2.5, p: 1.5, borderRadius: '10px', bgcolor: alpha('#6366f1', 0.04), border: `1px solid ${alpha('#6366f1', 0.1)}` }}>
              <Typography sx={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, mb: 0.75 }}>
                <strong>Why add time off?</strong> When you mark dates as unavailable, employers won't see you in search results for those days. This prevents scheduling conflicts and saves everyone time.
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>
                💡 <strong>Tip:</strong> Add holidays, vacations, or personal commitments in advance to avoid last-minute cancellations.
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2.5 }}>
              <HolidayDisplaySection
                upcomingHolidays={upcomingHolidays}
                holidaysLoading={holidaysLoading}
                holidaysError={holidaysError}
                setOpenHolidayDialog={setOpenHolidayDialog}
                setEditingHoliday={setEditingHoliday}
                deleteHoliday={deleteHoliday}
                minimal
              />
            </Box>

            {/* Status Summary */}
            {upcomingHolidays.length > 0 && (
              <Box sx={{ mb: 2, p: 1.25, borderRadius: '8px', bgcolor: '#ecfdf5', border: '1px solid #10b98130', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CheckCircle2 size={16} color="#10b981" strokeWidth={2.5} />
                <Typography sx={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 500 }}>
                  {upcomingHolidays.length} time off period{upcomingHolidays.length !== 1 ? 's' : ''} configured
                </Typography>
              </Box>
            )}

            <TipBox color="#6366f1" text="This section is optional. You can always add or remove time off periods later from your profile settings." />
          </SectionCard>

          {/* ═══════════════════════════════════════════════════════════════
              FORM ACTIONS - Premium SaaS Design with Enhanced Responsive Layout
          ═══════════════════════════════════════════════════════════════ */}
          <FormActions
            onBack={prevStep}
            onSubmit={handleSubmit}
            isPending={isPending}
            disabled={false}
          />

          {/* Global Error - Premium Design */}
          {mutationError && (
            <Box
              sx={{
                mt: { xs: 2, sm: 2.5 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                bgcolor: alpha(theme.palette.error.main, 0.06),
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: { xs: 40, sm: 44 },
                  height: { xs: 40, sm: 44 },
                  borderRadius: '10px',
                  bgcolor: theme.palette.error.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ErrorIcon sx={{ 
                  fontSize: { xs: 20, sm: 22 },
                  color: '#fff',
                }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    mb: 0.5,
                    color: theme.palette.error.main,
                    lineHeight: 1.3,
                  }}
                >
                  Unable to Save
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    lineHeight: 1.5,
                    color: theme.palette.error.dark,
                    fontWeight: 400,
                  }}
                >
                  {mutationError?.message || mutationError || 'An error occurred while saving your availability. Please try again.'}
                </Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </form>

      {/* ═══════════════════════════════════════════════════════════════
          HOLIDAY DIALOG
      ═══════════════════════════════════════════════════════════════ */}
      <HolidayDialog
        open={openHolidayDialog}
        onClose={() => setOpenHolidayDialog(false)}
        newHoliday={newHoliday}
        setNewHoliday={setNewHoliday}
        editingHoliday={editingHoliday}
        setEditingHoliday={setEditingHoliday}
        handleCreateOrEditHoliday={handleCreateOrEditHoliday}
        isCreating={isCreating}
        holidayError={holidayError || createError?.message}
        setHolidayError={setHolidayError}
        dateOverlapWarning={dateOverlapWarning}
        setDateOverlapWarning={setDateOverlapWarning}
        checkDateOverlap={checkDateOverlap}
      />
    </Container>
  );
};

export default React.memo(AvailabilityForm);
