// src/components/Onboarding/AvailabilityForm.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Stack,
  Tooltip,
  Alert,
  Autocomplete,
  Slider,
  Card,
  CardContent,
  CardActions,
  Fade,
  Container,
  FormControl,
  InputLabel,
  FormHelperText,
  LinearProgress,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  ClickAwayListener,
  Popper,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,     
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  DirectionsWalk as TravelIcon,
  DirectionsCar as CarIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  CalendarMonth as CalendarIcon,        
  Search as SearchIcon, 
  Place as PlaceIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import useOnboardingStore, { useAvailabilityMutation } from '../../stores/useOnboardingStore';
import { daysOfWeek } from '../../utils/constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserUpcomingHolidays, createUserUpcomingHoliday, deleteUserUpcomingHoliday, updateUserUpcomingHoliday } from '../../api/holidays';

import SuburbSelector from './SuburbSelector';
import api from '../../api/axios';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Day colors for visual distinction
const DAY_COLORS = {
  Monday: '#1976d2',
  Tuesday: '#388e3c',
  Wednesday: '#f57c00',
  Thursday: '#7b1fa2',
  Friday: '#d32f2f',
  Saturday: '#0288d1',
  Sunday: '#5d4037'
};

// Helper function to group and sort holidays by month
const groupHolidaysByMonth = (holidays) => {
  if (!holidays || holidays.length === 0) return [];

  // Sort holidays by start date (earliest first)
  const sortedHolidays = [...holidays].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA - dateB;
  });

  // Group by month
  const grouped = sortedHolidays.reduce((acc, holiday) => {
    const startDate = new Date(holiday.startDate);
    const monthKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    const monthName = startDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthKey,
        monthName,
        holidays: []
      };
    }
    acc[monthKey].holidays.push(holiday);
    return acc;
  }, {});

  // Convert to array and sort by month key (chronological order)
  return Object.values(grouped).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
};



// Enhanced custom time slot card with better visual design
const CustomTimeSlotCard = ({ slot, index, onEdit, onRemove, disabled }) => {
  const theme = useTheme();

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const dayColor = DAY_COLORS[slot.dayOfWeek] || theme.palette.primary.main;

  return (
    <Fade in timeout={300}>
      <Card
        variant="outlined"
        sx={{
          mb: 2,
          borderLeft: `4px solid ${dayColor}`,
          borderRadius: '8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[2],
            transform: 'translateY(-2px)'
          }
        }}
      >
        <CardContent sx={{ p: 2, pb: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: dayColor }}>
              {slot.dayOfWeek}
            </Typography>
            <Chip
              label={calculateDuration(slot.startTime, slot.endTime)}
              size="small"
              sx={{
                bgcolor: alpha(dayColor, 0.1),
                color: dayColor,
                fontWeight: 500
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={1.5} mb={1}>
            <AccessTimeIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ pt: 0, pb: 1, px: 2, justifyContent: 'flex-end' }}>
          <Tooltip title="Edit time slot" arrow>
            <IconButton
              size="small"
              onClick={() => onEdit(slot, index)}
              disabled={disabled}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: dayColor,
                  bgcolor: alpha(dayColor, 0.1)
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove time slot" arrow>
            <IconButton
              size="small"
              onClick={() => onRemove(index)}
              disabled={disabled}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: theme.palette.error.main,
                  bgcolor: alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Fade>
  );
};

// Enhanced time slot dialog with simple and intuitive time picker
const TimeSlotDialog = ({ open, onClose, onSave, initialData, daysOfWeek, existingSlots, editingIndex }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState(
    initialData || {
      dayOfWeek: daysOfWeek[0],
      startTime: '09:00',
      endTime: '17:00',
    }
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Time conversion utilities
  const convert24To12 = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return {
      hours: displayHour,
      minutes,
      period
    };
  };

  const convert12To24 = (hours, minutes, period) => {
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Generate time options for 12-hour format
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = convert24To12(time24);
        options.push({
          value: time24,
          label: `${time12.hours}:${time12.minutes.toString().padStart(2, '0')} ${time12.period}`
        });
      }
    }
    return options;
  };

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ dayOfWeek: daysOfWeek[0], startTime: '09:00', endTime: '17:00' });
    }
    setErrors({});
    setTouched({});
  }, [initialData, daysOfWeek, open]);

  const validateForm = (data) => {
    const newErrors = {};

    // Time validation
    if (data.startTime >= data.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    // Duration validation (minimum 30 minutes)
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;

    if (durationMinutes < 30) {
      newErrors.endTime = 'Time slot must be at least 30 minutes long';
    }

    // Overlap validation
    const isOverlapping = existingSlots?.some((slot, idx) => {
      if (editingIndex !== null && idx === editingIndex) return false;
      if (slot.dayOfWeek !== data.dayOfWeek) return false;
      return data.startTime < slot.endTime && data.endTime > slot.startTime;
    });

    if (isOverlapping) {
      newErrors.general = 'This time slot overlaps with an existing slot for this day';
    }

    return newErrors;
  };

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setTouched(prev => ({ ...prev, [field]: true }));

    // Real-time validation
    const newErrors = validateForm(newData);
    setErrors(newErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    setTouched({ dayOfWeek: true, startTime: true, endTime: true });

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    }
  };

  const dayColor = DAY_COLORS[formData.dayOfWeek] || theme.palette.primary.main;

  // Calculate duration for display
  const calculateDuration = () => {
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: alpha(dayColor, 0.1), color: dayColor }}>
              <ScheduleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {initialData ? 'Edit Your Availability' : 'Add Your Availability'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set your availability for work.
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          <Stack spacing={3}>
            {/* Day Selection */}
            <FormControl fullWidth error={touched.dayOfWeek && errors.dayOfWeek}>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={formData.dayOfWeek}
                onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                label="Day of Week"
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                }}
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day} value={day}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: DAY_COLORS[day] || theme.palette.primary.main
                        }}
                      />
                      {day}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Quick Time Presets */}
            {/* <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Quick Presets
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {[
                  { label: 'Morning', start: '08:00', end: '12:00' },
                  { label: 'Afternoon', start: '12:00', end: '17:00' },
                  { label: 'Evening', start: '17:00', end: '21:00' },
                  { label: 'Full Day', start: '09:00', end: '17:00' },
                  { label: 'Half Day', start: '09:00', end: '13:00' },
                ].map((preset) => (
                  <Chip
                    key={preset.label}
                    label={preset.label}
                    onClick={() => {
                      handleChange('startTime', preset.start);
                      handleChange('endTime', preset.end);
                    }}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(dayColor, 0.2),
                        color: dayColor
                      }
                    }}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box> */}

            {/* Simple Time Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Time Range
              </Typography>
              
              <Grid container spacing={2}>
                {/* Start Time */}
                <Grid item xs={6}>
                  <FormControl fullWidth error={touched.startTime && errors.startTime}>
                    <InputLabel>Start Time</InputLabel>
                    <Select
                      value={formData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      label="Start Time"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            '& .MuiMenuItem-root': {
                              fontSize: '0.875rem',
                              padding: '8px 16px'
                            }
                          }
                        }
                      }}
                    >
                      {timeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.startTime && errors.startTime && (
                      <FormHelperText error>{errors.startTime}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* End Time */}
                <Grid item xs={6}>
                  <FormControl fullWidth error={touched.endTime && errors.endTime}>
                    <InputLabel>End Time</InputLabel>
                    <Select
                      value={formData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      label="End Time"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            '& .MuiMenuItem-root': {
                              fontSize: '0.875rem',
                              padding: '8px 16px'
                            }
                          }
                        }
                      }}
                    >
                      {timeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            {option.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.endTime && errors.endTime && (
                      <FormHelperText error>{errors.endTime}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              </Grid>

              {/* Duration Display */}
              {formData.startTime && formData.endTime && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(dayColor, 0.1),
                    border: `1px solid ${alpha(dayColor, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: dayColor }}>
                      {convert24To12(formData.startTime).hours}:{convert24To12(formData.startTime).minutes.toString().padStart(2, '0')} {convert24To12(formData.startTime).period}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      to
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: dayColor }}>
                      {convert24To12(formData.endTime).hours}:{convert24To12(formData.endTime).minutes.toString().padStart(2, '0')} {convert24To12(formData.endTime).period}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: dayColor }}>
                    Duration: {calculateDuration()}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Error Display */}
            {(errors.startTime || errors.endTime || errors.general) && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.startTime || errors.endTime || errors.general}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" size="large">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              minWidth: 100,
              bgcolor: dayColor,
              '&:hover': { bgcolor: alpha(dayColor, 0.8) }
            }}
          >
            {initialData ? 'Update' : 'Add'} Slot
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const AvailabilityForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Use these throughout the component
  const {
    availability,
  } = useOnboardingStore();

  // Remove holidays from Zustand, use TanStack Query instead
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userHolidays'] });
    },
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
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [holidayError, setHolidayError] = useState('');
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [dateOverlapWarning, setDateOverlapWarning] = useState('');

  // Helper function to check for date overlaps
  const checkDateOverlap = useCallback((startDate, endDate, excludeHolidayId = null) => {
    if (!startDate || !endDate) return false;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return upcomingHolidays.some(holiday => {
      if (excludeHolidayId && holiday._id === excludeHolidayId) {
        return false;
      }
      
      const existingStart = new Date(holiday.startDate);
      const existingEnd = new Date(holiday.endDate);
      
      return (
        (start <= existingEnd && end >= existingStart) ||
        (existingStart <= end && existingEnd >= start)
      );
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
    // Clear errors when dialog opens/closes or when editing changes
    setHolidayError('');
    setDateOverlapWarning('');
  }, [editingHoliday, openHolidayDialog]);

  const handleCreateOrEditHoliday = () => {
    // Clear any previous errors first
    setHolidayError('');
    
    if (!newHoliday.name || !newHoliday.startDate || !newHoliday.endDate) {
      setHolidayError('Name, start date, and end date are required.');
      return;
    }
    
    if (new Date(newHoliday.endDate) < new Date(newHoliday.startDate)) {
      setHolidayError('End date cannot be before start date.');
      return;
    }

    // Check for date overlap with existing holidays
    const startDate = new Date(newHoliday.startDate);
    const endDate = new Date(newHoliday.endDate);
    
    const hasOverlap = upcomingHolidays.some(holiday => {
      // Skip the current holiday being edited
      if (editingHoliday && holiday._id === editingHoliday._id) {
        return false;
      }
      
      const existingStart = new Date(holiday.startDate);
      const existingEnd = new Date(holiday.endDate);
      
      // Check if the new date range overlaps with existing date range
      return (
        (startDate <= existingEnd && endDate >= existingStart) ||
        (existingStart <= endDate && existingEnd >= startDate)
      );
    });

    if (hasOverlap) {
      setHolidayError('This date range overlaps with an existing holiday. Please choose different dates.');
      return;
    }

    if (editingHoliday) {
      editHoliday(
        { id: editingHoliday._id, data: newHoliday },
        {
          onSuccess: () => {
            setOpenHolidayDialog(false);
            setEditingHoliday(null);
            setNewHoliday({ name: '', startDate: '', endDate: '', description: '' });
            setHolidayError('');
          },
          onError: () => setHolidayError('Failed to update holiday.'),
        }
      );
    } else {
      createHoliday(newHoliday, {
        onSuccess: () => {
          setOpenHolidayDialog(false);
          setNewHoliday({ name: '', startDate: '', endDate: '', description: '' });
          setHolidayError('');
        },
        onError: () => setHolidayError('Failed to create holiday.'),
      });
    }
  };

  const updateAvailability = useOnboardingStore((state) => state.updateAvailability);
  const addCustomTimeSlot = useOnboardingStore((state) => state.addCustomTimeSlot);
  const removeCustomTimeSlot = useOnboardingStore((state) => state.removeCustomTimeSlot);
  const prevStep = useOnboardingStore((state) => state.prevStep);
  const { mutate: saveAvailability, isPending, error: mutationError } = useAvailabilityMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const inputRef = React.useRef(null);
  const dropdownRef = React.useRef(null);
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Initialize availability if not present
  useEffect(() => {
    if (!availability.customTimeSlots) {
      updateAvailability({ customTimeSlots: [] });
    }
    if (!availability.kmWillingToTravel) {
      updateAvailability({ kmWillingToTravel: 20 });
    }
  }, [availability, updateAvailability]);

  // Group custom slots by day for display
  const groupedCustomSlots = useMemo(() => {
    const groups = {};
    availability.customTimeSlots?.forEach((slot, idx) => {
      if (!groups[slot.dayOfWeek]) groups[slot.dayOfWeek] = [];
      groups[slot.dayOfWeek].push({ ...slot, index: idx });
    });
    // Sort each day's slots by startTime
    Object.keys(groups).forEach(day => {
      groups[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return groups;
  }, [availability.customTimeSlots]);

  // Group holidays by month for display
  const groupedHolidays = useMemo(() => {
    return groupHolidaysByMonth(upcomingHolidays);
  }, [upcomingHolidays]);

  const totalSlots = availability.customTimeSlots?.length || 0;
  const travelDistance = availability.kmWillingToTravel || 20;
  const suburb = availability.suburb || '';

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Time slots validation
    if (!availability.customTimeSlots || availability.customTimeSlots.length === 0) {
      newErrors.timeSlots = 'Please add at least one time slot to continue';
    }

    // Travel distance validation
    if (isNaN(travelDistance) || travelDistance < 1 || travelDistance > 100) {
      newErrors.travelDistance = 'Travel distance must be between 1 and 100 km';
    }

    // Suburb validation
    if (!suburb || !suburb.trim()) {
      newErrors.suburb = 'Please enter your suburb';
    } else if (suburb.trim().length < 2) {
      newErrors.suburb = 'Suburb name must be at least 2 characters long';
    }

    return newErrors;
  };

  // Form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      saveAvailability(availability);
    }
  }, [availability, saveAvailability, validateForm]);

  // Dialog handlers
  const handleAddCustomSlot = useCallback(() => {
    setEditingSlot(null);
    setEditingIndex(null);
    setIsDialogOpen(true);
  }, []);

  const handleEditCustomSlot = useCallback((slot, index) => {
    setEditingSlot({ ...slot });
    setEditingIndex(index);
    setIsDialogOpen(true);
  }, []);

  const handleSaveCustomSlot = useCallback((slot) => {
    if (editingIndex !== null && editingIndex !== undefined) {
      const updatedSlots = [...availability.customTimeSlots];
      updatedSlots[editingIndex] = slot;
      updateAvailability({ customTimeSlots: updatedSlots });
    } else {
      addCustomTimeSlot(slot);
    }
    setIsDialogOpen(false);
    setEditingSlot(null);
    setEditingIndex(null);
    setErrors(prev => ({ ...prev, timeSlots: null }));
  }, [editingIndex, availability.customTimeSlots, updateAvailability, addCustomTimeSlot]);

  const handleRemoveCustomSlot = useCallback((index) => {
    removeCustomTimeSlot(index);
    if (availability.customTimeSlots?.length <= 1) {
      setErrors(prev => ({ ...prev, timeSlots: 'Please add at least one time slot to continue' }));
    } else {
      setErrors(prev => ({ ...prev, timeSlots: null }));
    }
  }, [removeCustomTimeSlot, availability.customTimeSlots]);

  // Remove handleHolidaySelect, handleHolidayNoteChange, setHolidaySelections, and all selection/note logic for holidays

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Set Your Availability
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Define when you're available to work and how far you're willing to travel
        </Typography>
        {isPending && <LinearProgress sx={{ mt: 2 }} />}
      </Box> */}

      <form onSubmit={handleSubmit}>
        {/* Time Slots Section - Full Width */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            border: errors.timeSlots ? `2px solid ${theme.palette.error.main}` : '1px solid',
            borderColor: errors.timeSlots ? theme.palette.error.main : 'divider',
            overflow: 'hidden',
            boxShadow: theme.shadows[1]
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={3}
              flexWrap="wrap"
              gap={2}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
                  <CalendarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Your Availability
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {totalSlots > 0 ? `${totalSlots} time slot${totalSlots > 1 ? 's' : ''} added` : 'No time slots yet'}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddCustomSlot}
                disabled={isPending}
                size={isMobile ? 'medium' : 'large'}
                sx={{
                  borderRadius: 3,
                  fontWeight: 600,
                  minWidth: isMobile ? '100%' : 180,
                  mt: isMobile ? 1 : 0
                }}
              >
                Add Time Slot
              </Button>
            </Box>

            {errors.timeSlots && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errors.timeSlots}
              </Alert>
            )}

            <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 1 }}>
              {Object.keys(groupedCustomSlots).length > 0 ? (
                <Box>
                  {daysOfWeek.filter(day => groupedCustomSlots[day]?.length).map(day => (
                    <Box key={day} mb={4}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: DAY_COLORS[day] || theme.palette.primary.main
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {day}
                        </Typography>
                        <Badge
                          badgeContent={groupedCustomSlots[day].length}
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <Grid container spacing={2}>
                        {groupedCustomSlots[day].map(slotObj => (
                          <Grid item xs={12} sm={6} md={4} key={slotObj.index}>
                            <CustomTimeSlotCard
                              slot={slotObj}
                              index={slotObj.index}
                              onEdit={handleEditCustomSlot}
                              onRemove={handleRemoveCustomSlot}
                              disabled={isPending}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    borderStyle: 'dashed'
                  }}
                >
                  <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                    <Avatar sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      mb: 2
                    }}>
                      <AccessTimeIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      No time slots yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Add your first time slot to get started
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddCustomSlot}
                      size="large"
                      sx={{ borderRadius: 3 }}
                    >
                      Add Your First Time Slot
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Preferences Section - Three cards side by side on desktop, stacked on mobile */}
        <Grid
          container
          spacing={{ xs: 2, md: 4 }}
          sx={{
            mt: { xs: 2, md: 4 },
            mb: { xs: 2, md: 4 },
            px: { xs: 0, md: 2 },
            display: 'flex',
            alignItems: 'stretch',
          }}
        >
          {/* Suburb Card */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: errors.suburb ? `2px solid ${theme.palette.error.main}` : '1px solid',
                borderColor: errors.suburb ? theme.palette.error.main : 'divider',
                height: '100%',
                boxShadow: theme.shadows[1],
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <SuburbSelector
                  suburbInput={availability.suburb || ''}
                  setSuburbInput={(val) => updateAvailability({ suburb: val })}
                  updateAvailability={updateAvailability}
                  errors={errors}
                  setErrors={setErrors}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Travel Distance Card */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: errors.travelDistance ? `2px solid ${theme.palette.error.main}` : '1px solid',
                borderColor: errors.travelDistance ? theme.palette.error.main : 'divider',
                height: '100%',
                boxShadow: theme.shadows[1],
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main
                  }}>
                    <CarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Travel Distance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      How many km are you willing to travel from your place of residence
                    </Typography>
                  </Box>
                </Box>

                <Box mb={3}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.success.main,
                      mb: 2,
                      textAlign: 'center'
                    }}
                  >
                    {travelDistance} km
                  </Typography>

                  <Slider
                    value={travelDistance}
                    onChange={(_, val) => {
                      updateAvailability({ kmWillingToTravel: val });
                      setErrors(prev => ({ ...prev, travelDistance: null }));
                    }}
                    min={1}
                    max={100}
                    step={1}
                    valueLabelDisplay="auto"
                    sx={{
                      height: 8,
                      '& .MuiSlider-thumb': {
                        height: 24,
                        width: 24,
                        backgroundColor: '#fff',
                        border: `2px solid ${theme.palette.success.main}`,
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: `0 0 0 8px ${alpha(theme.palette.success.main, 0.16)}`,
                        },
                        '&.Mui-active': {
                          boxShadow: `0 0 0 14px ${alpha(theme.palette.success.main, 0.16)}`,
                        },
                      },
                      '& .MuiSlider-track': {
                        border: 'none',
                        bgcolor: theme.palette.success.main,
                      },
                      '& .MuiSlider-rail': {
                        opacity: 0.5,
                        bgcolor: theme.palette.grey[400],
                      },
                      '& .MuiSlider-valueLabel': {
                        lineHeight: 1.2,
                        fontSize: 12,
                        background: 'unset',
                        padding: 0,
                        width: 32,
                        height: 32,
                        borderRadius: '50% 50% 50% 0',
                        backgroundColor: theme.palette.success.main,
                        transformOrigin: 'bottom left',
                        transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
                        '&:before': { display: 'none' },
                        '&.MuiSlider-valueLabelOpen': {
                          transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
                        },
                        '& > *': {
                          transform: 'rotate(45deg)',
                        },
                      },
                    }}
                  />

                  <Box display="flex" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      1 km
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      100 km
                    </Typography>
                  </Box>
                </Box>

                {errors.travelDistance && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.travelDistance}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Holidays Card */}
          <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                boxShadow: theme.shadows[1],
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}> Here i am not impotyin the upcoming holdiay componentn  use that Upcoming Holiday</Typography>
                  <Typography variant="body2" color="text.secondary">
                    We will notify you about upcoming holidays. You can also add your own holidays below.
                  </Typography>
                  <Button onClick={() => setOpenHolidayDialog(true)} variant="outlined" sx={{ my: 2 }}>
                    Add Upcoming Holiday
                  </Button>
                  {holidaysLoading ? (
                    <LinearProgress sx={{ my: 2 }} />
                  ) : holidaysError ? (
                    <Alert severity="error" sx={{ my: 2 }}>Failed to load holidays</Alert>
                  ) : (
                    <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                      {upcomingHolidays.length === 0 ? (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 3,
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            borderStyle: 'dashed'
                          }}
                        >
                          <CalendarIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No upcoming holidays found.
                          </Typography>
                        </Paper>
                      ) : (
                        groupedHolidays.map((monthGroup) => (
                          <Box key={monthGroup.monthKey} sx={{ mb: 3 }}>
                            {/* Month Header */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 2,
                                p: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                              }}
                            >
                              <CalendarIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.primary.main
                                }}
                              >
                                {monthGroup.monthName}
                              </Typography>
                              <Chip
                                label={monthGroup.holidays.length}
                                size="small"
                                sx={{
                                  ml: 'auto',
                                  bgcolor: theme.palette.primary.main,
                                  color: 'white',
                                  fontWeight: 600
                                }}
                              />
                            </Box>

                            {/* Holidays in this month */}
                            <List sx={{ p: 0 }}>
                              {monthGroup.holidays.map((holiday) => {
                                const start = new Date(holiday.startDate);
                                const end = new Date(holiday.endDate);
                                const isSingleDay = start.toDateString() === end.toDateString();
                                const isToday = start.toDateString() === new Date().toDateString();
                                const isPast = start < new Date();
                                
                                return (
                                  <ListItem
                                    key={holiday._id}
                                    sx={{
                                      flexDirection: 'column',
                                      alignItems: 'stretch',
                                      mb: 1.5,
                                      borderRadius: 2,
                                      boxShadow: 1,
                                      bgcolor: 'background.paper',
                                      border: isToday ? `2px solid ${theme.palette.warning.main}` : '1px solid',
                                      borderColor: isToday ? theme.palette.warning.main : 'divider',
                                      opacity: isPast ? 0.7 : 1,
                                      transition: 'all 0.2s ease-in-out',
                                      '&:hover': {
                                        boxShadow: theme.shadows[3],
                                        transform: 'translateY(-1px)'
                                      }
                                    }}
                                  >
                                    <Box display="flex" alignItems="center" gap={2} justifyContent="space-between" width="100%">
                                      <Box display="flex" alignItems="center" gap={2} flex={1}>
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: isToday 
                                              ? alpha(theme.palette.warning.main, 0.1)
                                              : alpha(theme.palette.primary.main, 0.1),
                                            color: isToday 
                                              ? theme.palette.warning.main
                                              : theme.palette.primary.main
                                          }}
                                        >
                                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                            {start.getDate()}
                                          </Typography>
                                        </Box>
                                        <Box flex={1}>
                                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <Typography
                                              variant="subtitle2"
                                              sx={{ fontWeight: 600 }}
                                            >
                                              {holiday.name}
                                            </Typography>
                                            {isToday && (
                                              <Chip
                                                label="Today"
                                                size="small"
                                                sx={{
                                                  bgcolor: theme.palette.warning.main,
                                                  color: 'white',
                                                  fontSize: '0.7rem',
                                                  height: 20
                                                }}
                                              />
                                            )}
                                            {isPast && (
                                              <Chip
                                                label="Past"
                                                size="small"
                                                sx={{
                                                  bgcolor: theme.palette.grey[500],
                                                  color: 'white',
                                                  fontSize: '0.7rem',
                                                  height: 20
                                                }}
                                              />
                                            )}
                                          </Box>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontWeight: 500 }}
                                          >
                                            {isSingleDay
                                              ? start.toLocaleDateString('en-US', {
                                                  weekday: 'short',
                                                  month: 'short',
                                                  day: 'numeric'
                                                })
                                              : `${start.toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric'
                                                })} - ${end.toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric'
                                                })}`
                                            }
                                          </Typography>
                                          {holiday.description && (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              sx={{
                                                display: 'block',
                                                mt: 0.5,
                                                fontStyle: 'italic'
                                              }}
                                            >
                                              {holiday.description}
                                            </Typography>
                                          )}
                                        </Box>
                                      </Box>
                                      <Box display="flex" gap={0.5}>
                                        <Tooltip title="Edit holiday" arrow>
                                          <IconButton
                                            aria-label="edit"
                                            onClick={() => {
                                              setEditingHoliday(holiday);
                                              setOpenHolidayDialog(true);
                                            }}
                                            size="small"
                                            sx={{
                                              color: 'text.secondary',
                                              '&:hover': {
                                                color: theme.palette.primary.main,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1)
                                              }
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete holiday" arrow>
                                          <IconButton
                                            aria-label="delete"
                                            onClick={() => deleteHoliday(holiday._id)}
                                            size="small"
                                            sx={{
                                              color: 'text.secondary',
                                              '&:hover': {
                                                color: theme.palette.error.main,
                                                bgcolor: alpha(theme.palette.error.main, 0.1)
                                              }
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </Box>
                                  </ListItem>
                                );
                              })}
                            </List>
                          </Box>
                        ))
                      )}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
            {/* Holiday Creation Dialog */}
            <Dialog 
              open={openHolidayDialog} 
              onClose={() => { setOpenHolidayDialog(false); setEditingHoliday(null); }}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  boxShadow: theme.shadows[10]
                }
              }}
            >
              <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                    <CalendarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {editingHoliday ? 'Update your holiday details' : 'Add a new upcoming holiday'}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              
              <DialogContent dividers sx={{ px: 3, py: 2 }}>
                <Stack spacing={3}>
                  <TextField
                    label="Holiday Name"
                    value={newHoliday.name}
                    onChange={e => {
                      setNewHoliday({ ...newHoliday, name: e.target.value });
                      if (holidayError) setHolidayError('');
                    }}
                    fullWidth
                    required
                    placeholder="e.g., Christmas Break, Summer Vacation"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack direction="row" spacing={2}>
                      <DatePicker
                        label="Start Date"
                        value={newHoliday.startDate ? new Date(newHoliday.startDate) : null}
                        onChange={(date) => {
                          const iso = date ? date.toISOString().slice(0, 10) : '';
                          setNewHoliday({ ...newHoliday, startDate: iso });
                          if (holidayError) setHolidayError('');
                          // Check for overlap in real-time
                          if (iso && newHoliday.endDate) {
                            const hasOverlap = checkDateOverlap(
                              iso,
                              newHoliday.endDate,
                              editingHoliday?._id
                            );
                            setDateOverlapWarning(
                              hasOverlap ? 'Warning: This date range overlaps with an existing holiday' : ''
                            );
                          } else {
                            setDateOverlapWarning('');
                          }
                        }}
                        inputFormat="yyyy-MM-dd"
                        mask="____-__-__"
                        minDate={new Date()}
                        maxDate={new Date(new Date().getFullYear(), 11, 31)}
                        shouldDisableMonth={(month) => {
                          const now = new Date();
                          return (
                            month.getFullYear() === now.getFullYear() &&
                            month.getMonth() < now.getMonth()
                          );
                        }}
                        renderInput={(params) => <TextField {...params} fullWidth required InputLabelProps={{ shrink: true }} />}
                      />
                      <DatePicker
                        label="End Date"
                        value={newHoliday.endDate ? new Date(newHoliday.endDate) : null}
                        onChange={(date) => {
                          const iso = date ? date.toISOString().slice(0, 10) : '';
                          setNewHoliday({ ...newHoliday, endDate: iso });
                          if (holidayError) setHolidayError('');
                          // Check for overlap in real-time
                          if (newHoliday.startDate && iso) {
                            const hasOverlap = checkDateOverlap(
                              newHoliday.startDate,
                              iso,
                              editingHoliday?._id
                            );
                            setDateOverlapWarning(
                              hasOverlap ? 'Warning: This date range overlaps with an existing holiday' : ''
                            );
                          } else {
                            setDateOverlapWarning('');
                          }
                        }}
                        inputFormat="yyyy-MM-dd"
                        mask="____-__-__"
                        minDate={newHoliday.startDate ? new Date(newHoliday.startDate) : new Date()}
                        maxDate={new Date(new Date().getFullYear(), 11, 31)}
                        shouldDisableMonth={(month) => {
                          const now = new Date();
                          return (
                            month.getFullYear() === now.getFullYear() &&
                            month.getMonth() < now.getMonth()
                          );
                        }}
                        renderInput={(params) => <TextField {...params} fullWidth required InputLabelProps={{ shrink: true }} />}
                      />
                    </Stack>
                  </LocalizationProvider>
                  
                  <TextField
                    label="Description (Optional)"
                    value={newHoliday.description}
                    onChange={e => {
                      setNewHoliday({ ...newHoliday, description: e.target.value });
                      if (holidayError) setHolidayError('');
                    }}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Add any additional details about your holiday..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <InfoIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  {dateOverlapWarning && (
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mt: 1,
                        animation: 'fadeIn 0.3s ease-in-out',
                        '@keyframes fadeIn': {
                          '0%': { opacity: 0, transform: 'translateY(-10px)' },
                          '100%': { opacity: 1, transform: 'translateY(0)' }
                        }
                      }}
                      onClose={() => setDateOverlapWarning('')}
                    >
                      {dateOverlapWarning}
                    </Alert>
                  )}
                  
                  {(holidayError || createError) && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 1,
                        animation: 'fadeIn 0.3s ease-in-out',
                        '@keyframes fadeIn': {
                          '0%': { opacity: 0, transform: 'translateY(-10px)' },
                          '100%': { opacity: 1, transform: 'translateY(0)' }
                        }
                      }}
                      onClose={() => setHolidayError('')}
                    >
                      {holidayError || createError?.message}
                    </Alert>
                  )}
                </Stack>
              </DialogContent>
              
              <DialogActions sx={{ px: 3, py: 2 }}>
                <Button 
                  onClick={() => { setOpenHolidayDialog(false); setEditingHoliday(null); }}
                  color="inherit"
                  size="large"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateOrEditHoliday} 
                  variant="contained" 
                  disabled={isCreating || !newHoliday.name || !newHoliday.startDate || !newHoliday.endDate}
                  size="large"
                  sx={{ minWidth: 100 }}
                >
                  {isCreating ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          border: '2px solid',
                          borderColor: 'currentColor',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' }
                          }
                        }}
                      />
                      {editingHoliday ? 'Updating...' : 'Creating...'}
                    </Box>
                  ) : (
                    editingHoliday ? 'Update Holiday' : 'Add Holiday'
                  )}
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>

        {/* Form Actions */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column-reverse', sm: 'column-reverse' }}
          justifyContent="space-between"
          alignItems="center"
          mt={4}
          gap={2}
          sx={{
            p: 3,
            borderRadius: 3,

          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={prevStep}
            disabled={isPending}
            size="large"
            sx={{
              borderRadius: 3,
              minWidth: isMobile ? '100%' : 180
            }}
          >
            Back to Work History
          </Button>
          <Button
            type="submit"
            variant="contained"
            endIcon={!isPending && <ArrowForwardIcon />}
            disabled={isPending}
            size="large"
            sx={{
              minWidth: isMobile ? '100%' : 220,
              borderRadius: 3,
              fontWeight: 700,
              position: 'relative'
            }}
          >
            {isPending ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    border: '2px solid',
                    borderColor: 'currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }}
                />
                Saving...
              </Box>
            ) : (
              'Next: Certifications'
            )}
          </Button>
        </Box>

        {/* Global Error Display */}
        {mutationError && (
          <Box mt={3}>
            <Alert
              severity="error"
              sx={{
                borderRadius: 3,
                '& .MuiAlert-message': {
                  fontWeight: 500
                }
              }}
            >
              {mutationError}
            </Alert>
          </Box>
        )}
      </form>

      {/* Time Slot Dialog */}
      <TimeSlotDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingSlot(null);
          setEditingIndex(null);
        }}
        onSave={handleSaveCustomSlot}
        initialData={editingSlot}
        daysOfWeek={daysOfWeek}
        existingSlots={availability.customTimeSlots}
        editingIndex={editingIndex}
      />
    </Container>
  );
};

export default React.memo(AvailabilityForm);