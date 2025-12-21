// src/components/Onboarding/AvailabilityForm.jsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Stack,
  Alert,
  Slider,
  Container,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { MapPin, Car, Calendar, Lightbulb, ChevronRight, Clock, CalendarOff } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useOnboardingStore, { useAvailabilityMutation } from '../../stores/useOnboardingStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserUpcomingHolidays, createUserUpcomingHoliday, deleteUserUpcomingHoliday, updateUserUpcomingHoliday } from '../../api/holidays';

import SuburbSelector from './SuburbSelector';
import UpcomingHolidayDatePicker from '../AvailabilityComponent/DatePicker/UpcomingHolidayDatePicker';
import HolidayDisplaySection from '../AvailabilityComponent/UpcomingHoliday/HolidayDisplaySection';
import TimeSlotSelector from '../WorkerAvailabilityOnboarding/TimeSlotSelector';

// Section Header Component
const SectionHeader = ({ icon: Icon, iconColor, iconBg, title, subtitle, step }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: '12px',
        bgcolor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <Icon size={20} color={iconColor} strokeWidth={2} />
      {step && (
        <Box
          sx={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: iconColor,
            color: '#fff',
            fontSize: '0.6875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {step}
        </Box>
      )}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: { xs: '1.0625rem', sm: '1.125rem' },
          fontWeight: 700,
          color: 'text.primary',
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            color: 'text.secondary',
            lineHeight: 1.4,
            mt: 0.25,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

// Tip Box Component
const TipBox = ({ color, text }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1,
      p: 1.5,
      borderRadius: '10px',
      bgcolor: alpha(color, 0.06),
      border: `1px solid ${alpha(color, 0.1)}`,
    }}
  >
    <Lightbulb size={14} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
    <Typography sx={{ fontSize: '0.8125rem', color: alpha(color, 0.9), lineHeight: 1.5 }}>
      {text}
    </Typography>
  </Box>
);

// Section Card Component
const SectionCard = ({ children, error, theme }) => (
  <Box
    sx={{
      p: { xs: 2.5, sm: 3 },
      borderRadius: '16px',
      bgcolor: 'background.paper',
      border: `1px solid ${error ? theme.palette.error.main : alpha(theme.palette.divider, 0.06)}`,
      boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.02)}`,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        borderColor: error ? theme.palette.error.main : alpha(theme.palette.divider, 0.12),
        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
      },
    }}
  >
    {children}
  </Box>
);

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

  useEffect(() => {
    if (!availability.customTimeSlots) updateAvailability({ customTimeSlots: [] });
    if (!availability.kmWillingToTravel) updateAvailability({ kmWillingToTravel: 20 });
  }, [availability, updateAvailability]);

  const travelDistance = availability.kmWillingToTravel || 20;
  const suburb = availability.suburb || '';

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!availability.customTimeSlots || availability.customTimeSlots.length === 0) {
      newErrors.timeSlots = 'Please add at least one time slot';
    }
    if (isNaN(travelDistance) || travelDistance < 1 || travelDistance > 100) {
      newErrors.travelDistance = 'Travel distance must be between 1 and 100 km';
    }
    if (!suburb || !suburb.trim()) {
      newErrors.suburb = 'Please enter your suburb';
    }
    return newErrors;
  }, [availability.customTimeSlots, travelDistance, suburb]);

  const ToastCloseButton = useCallback(({ closeToast }) => (
    <IconButton aria-label="close" size="small" onClick={closeToast} sx={{ position: 'absolute', right: 8, top: 8 }}>
      <CloseIcon fontSize="small" />
    </IconButton>
  ), []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);
    if (Object.keys(formErrors).length === 0) {
      saveAvailability(availability);
    } else {
      toast.error('Please complete all required fields', { position: 'top-center', autoClose: 3000 });
    }
  }, [availability, saveAvailability, validateForm]);

  const handleAddSlot = useCallback((slot) => {
    addCustomTimeSlot(slot);
    setErrors(prev => ({ ...prev, timeSlots: null }));
  }, [addCustomTimeSlot]);

  const handleEditSlot = useCallback((index, slot) => {
    const updatedSlots = [...availability.customTimeSlots];
    updatedSlots[index] = slot;
    updateAvailability({ customTimeSlots: updatedSlots });
    setErrors(prev => ({ ...prev, timeSlots: null }));
  }, [availability.customTimeSlots, updateAvailability]);

  const handleRemoveSlot = useCallback((index) => {
    removeCustomTimeSlot(index);
    if (availability.customTimeSlots?.length <= 1) {
      setErrors(prev => ({ ...prev, timeSlots: 'Please add at least one time slot' }));
    }
  }, [removeCustomTimeSlot, availability.customTimeSlots]);

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

      {/* Page Header - Compact SaaS Design */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
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
            }}
          >
            <Calendar size={24} color="white" strokeWidth={2.5} />
          </Box>
          <Box>
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
            <Typography sx={{ fontSize: '0.875rem', color: '#64748b', mt: 0.25 }}>
              Set your schedule • Get more jobs
            </Typography>
          </Box>
        </Box>

        {/* Status Pills Row */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: '8px',
              bgcolor: '#eff6ff',
            }}
          >
            <Clock size={13} color="#3b82f6" strokeWidth={2.5} />
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {availability.customTimeSlots?.length || 0} slots
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: '8px',
              bgcolor: suburb ? '#ecfdf5' : '#fef3c7',
            }}
          >
            <MapPin size={13} color={suburb ? '#10b981' : '#f59e0b'} strokeWidth={2.5} />
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: suburb ? '#10b981' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {suburb ? 'Located' : 'Needed'}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1.25,
              py: 0.5,
              borderRadius: '8px',
              bgcolor: '#f0fdf4',
            }}
          >
            <Car size={13} color="#22c55e" strokeWidth={2.5} />
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {travelDistance}km
            </Typography>
          </Box>
        </Box>

        {isPending && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
      </Box>

      <form onSubmit={handleSubmit}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          
          {/* ═══════════════════════════════════════════════════════════════
              SECTION 1: TIME SLOTS
              What it does: Define your working hours for each day
          ═══════════════════════════════════════════════════════════════ */}
          <SectionCard error={errors.timeSlots} theme={theme}>
            <SectionHeader
              icon={Clock}
              iconColor="#6366f1"
              iconBg={alpha('#6366f1', 0.1)}
              title="Working Hours"
              subtitle="Set the times you are available to work each day"
              step="1"
            />
            <TimeSlotSelector
              customTimeSlots={availability.customTimeSlots || []}
              onAddSlot={handleAddSlot}
              onEditSlot={handleEditSlot}
              onRemoveSlot={handleRemoveSlot}
              disabled={isPending}
              error={errors.timeSlots}
            />
            <Box sx={{ mt: 2.5 }}>
              <TipBox color="#6366f1" text="More availability means more job opportunities. Consider adding multiple time slots for flexibility." />
            </Box>
          </SectionCard>

          {/* ═══════════════════════════════════════════════════════════════
              SECTION 2: LOCATION & TRAVEL
              What it does: Set your base location and travel radius
          ═══════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 2, md: 3 },
            }}
          >
            {/* Location Card */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '14px',
                bgcolor: 'background.paper',
                border: `1px solid ${errors.suburb ? theme.palette.error.main : alpha(theme.palette.divider, 0.08)}`,
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MapPin size={18} color="#475569" strokeWidth={2} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
                    Your Location
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Where are you based?
                  </Typography>
                </Box>
              </Box>

              {/* Selector */}
              <Box sx={{ mb: 2 }}>
                <SuburbSelector
                  suburbInput={availability.suburb || ''}
                  setSuburbInput={(val) => updateAvailability({ suburb: val })}
                  updateAvailability={updateAvailability}
                  errors={errors}
                  setErrors={setErrors}
                />
              </Box>

              {/* Tip */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 1, borderRadius: '8px', bgcolor: '#f8fafc' }}>
                <Lightbulb size={12} color="#94a3b8" />
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  Helps employers find nearby workers
                </Typography>
              </Box>
            </Box>

            {/* Travel Distance Card */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '14px',
                bgcolor: 'background.paper',
                border: `1px solid ${errors.travelDistance ? theme.palette.error.main : alpha(theme.palette.divider, 0.08)}`,
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Car size={18} color="#475569" strokeWidth={2} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
                    Travel Radius
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                    How far will you go?
                  </Typography>
                </Box>
                {/* Distance Badge */}
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '8px',
                    bgcolor: '#3b82f6',
                  }}
                >
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
                    {travelDistance} km
                  </Typography>
                </Box>
              </Box>

              {/* Slider */}
              <Box sx={{ px: 0.5, mb: 1.5 }}>
                <Slider
                  value={travelDistance}
                  onChange={(_, val) => {
                    updateAvailability({ kmWillingToTravel: val });
                    setErrors(prev => ({ ...prev, travelDistance: null }));
                  }}
                  min={1}
                  max={100}
                  step={1}
                  sx={{
                    height: 6,
                    '& .MuiSlider-thumb': {
                      height: 20,
                      width: 20,
                      backgroundColor: '#fff',
                      border: '2px solid #3b82f6',
                      boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0 0 0 6px ${alpha('#3b82f6', 0.1)}`,
                      },
                    },
                    '& .MuiSlider-track': { bgcolor: '#3b82f6', border: 'none' },
                    '& .MuiSlider-rail': { bgcolor: '#e2e8f0' },
                  }}
                />
                {/* Range Labels */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>1 km</Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>100 km</Typography>
                </Box>
              </Box>

              {errors.travelDistance && (
                <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px', py: 0.25 }}>
                  {errors.travelDistance}
                </Alert>
              )}

              {/* Tip */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 1, borderRadius: '8px', bgcolor: '#f8fafc' }}>
                <Lightbulb size={12} color="#94a3b8" />
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
                  Larger radius = more opportunities
                </Typography>
              </Box>
            </Box>
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
              subtitle="Let employers know when you are not available"
              step="4"
            />
            
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

            <TipBox color="#6366f1" text="Adding planned time off helps avoid scheduling conflicts with employers." />
          </SectionCard>

          {/* ═══════════════════════════════════════════════════════════════
              FORM ACTIONS
          ═══════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 2,
              pt: 3,
              mt: 1,
            }}
          >
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={prevStep}
              disabled={isPending}
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '0.9375rem',
                px: 2.5,
                py: 1.25,
                borderRadius: '10px',
                order: { xs: 2, sm: 1 },
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.08) },
              }}
            >
              Back
            </Button>

            <Button
              type="submit"
              variant="contained"
              endIcon={!isPending && <ChevronRight size={20} />}
              disabled={isPending}
              sx={{
                bgcolor: '#0f172a',
                fontWeight: 600,
                fontSize: '0.9375rem',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                order: { xs: 1, sm: 2 },
                boxShadow: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#1e293b',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {isPending ? 'Saving...' : 'Continue to Certifications'}
            </Button>
          </Box>

          {/* Global Error */}
          {mutationError && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {mutationError}
            </Alert>
          )}
        </Stack>
      </form>

      {/* ═══════════════════════════════════════════════════════════════
          HOLIDAY DIALOG
      ═══════════════════════════════════════════════════════════════ */}
      <Dialog
        open={openHolidayDialog}
        onClose={() => { setOpenHolidayDialog(false); setEditingHoliday(null); }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: '20px 20px 0 0', sm: '20px' },
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: '92vh', sm: '90vh' },
            minHeight: { sm: 580 },
            width: { xs: '100%', sm: '90vw', md: '800px', lg: '860px' },
            maxWidth: { sm: 860 },
            position: { xs: 'fixed', sm: 'relative' },
            bottom: { xs: 0, sm: 'auto' },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Dialog Header */}
        <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: { xs: 2.5, sm: 3.5 }, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: { xs: 44, sm: 48 },
                  height: { xs: 44, sm: 48 },
                  borderRadius: '12px',
                  bgcolor: alpha('#6366f1', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarOff size={22} color="#6366f1" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {editingHoliday ? 'Edit Time Off' : 'Add Time Off'}
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, color: 'text.secondary' }}>
                  Block dates when you are unavailable
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={() => { setOpenHolidayDialog(false); setEditingHoliday(null); }} 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '10px',
                bgcolor: alpha(theme.palette.grey[500], 0.08), 
                '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.15) } 
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: { xs: 2, sm: 2.5 }, flex: 1, overflowY: 'auto' }}>
          <Stack spacing={2.5}>
            <TextField
              label="Name (optional)"
              value={newHoliday.name}
              onChange={e => { setNewHoliday({ ...newHoliday, name: e.target.value }); setHolidayError(''); }}
              fullWidth
              placeholder="e.g., Family vacation"
              size="small"
              helperText="Leave empty for auto-generated name"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
            
            <UpcomingHolidayDatePicker
              newHoliday={newHoliday}
              setNewHoliday={setNewHoliday}
              editingHoliday={editingHoliday}
              setHolidayError={setHolidayError}
              dateOverlapWarning={dateOverlapWarning}
              setDateOverlapWarning={setDateOverlapWarning}
              checkDateOverlap={checkDateOverlap}
            />

            <TextField
              label="Notes (optional)"
              value={newHoliday.description}
              onChange={e => setNewHoliday({ ...newHoliday, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
              placeholder="Any additional details..."
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            {(holidayError || createError) && (
              <Alert severity="error" sx={{ borderRadius: '10px', py: 0.5 }}>
                {holidayError || createError?.message}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2.5, sm: 3.5 }, pb: { xs: 2.5, sm: 3.5 }, pt: 1.5, gap: 1.5 }}>
          <Button
            onClick={() => { setOpenHolidayDialog(false); setEditingHoliday(null); }}
            sx={{ flex: 1, borderRadius: '10px', color: 'text.secondary', fontWeight: 600, py: 1.25 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateOrEditHoliday}
            variant="contained"
            disabled={isCreating || !newHoliday.startDate || !newHoliday.endDate}
            sx={{
              flex: 1,
              borderRadius: '10px',
              bgcolor: '#6366f1',
              fontWeight: 600,
              py: 1.25,
              '&:hover': { bgcolor: '#4f46e5' },
            }}
          >
            {isCreating ? 'Saving...' : editingHoliday ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default React.memo(AvailabilityForm);
