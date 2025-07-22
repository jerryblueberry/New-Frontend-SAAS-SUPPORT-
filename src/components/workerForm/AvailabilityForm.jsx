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
  Popper
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
  Place as PlaceIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import useOnboardingStore, { useAvailabilityMutation } from '../../stores/useOnboardingStore';
import { daysOfWeek } from '../../utils/constants';

import SuburbSelector from './SuburbSelector';

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

// Enhanced custom time slot card with better visual design
const CustomTimeSlotCard = ({ slot, index, onEdit, onRemove, disabled }) => {
  const theme = useTheme();
  
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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

// Enhanced time slot dialog with better validation
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
                {initialData ? 'Edit Time Slot' : 'Add Time Slot'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set your availability for work
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          <Stack spacing={3}>
            <FormControl fullWidth error={touched.dayOfWeek && errors.dayOfWeek}>
              <InputLabel>Day of Week</InputLabel>
              <Select
                value={formData.dayOfWeek}
                onChange={(e) => handleChange('dayOfWeek', e.target.value)}
                label="Day of Week"
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

            <Stack direction="row" spacing={2}>
              <TextField
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                error={touched.startTime && errors.startTime}
                helperText={touched.startTime && errors.startTime}
              />
              <TextField
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                error={touched.endTime && errors.endTime}
                helperText={touched.endTime && errors.endTime}
              />
            </Stack>

            {errors.general && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errors.general}
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
  
  const availability = useOnboardingStore((state) => state.availability);
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

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
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

        {/* Preferences Section - Two cards side by side on desktop, stacked on mobile */}
               {/* Suburb Card */}

        <Grid
          container
          spacing={{ xs: 2, md: 5 }}
          sx={{
            mt: { xs: 2, md: 4 },
            mb: { xs: 2, md: 4 },
            px: { xs: 0, md: 2 },
            display: 'flex',
            alignItems: 'stretch'
          }}
        >
<Grid item xs={12} md={6} sx={{ display: 'flex' }}>
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
                flexDirection: 'column'
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
          <Grid item xs={12} md={6} sx={{ display: 'flex', width: { xs: '100%', md: 'auto' } }}>
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
                width: { xs: '100%', md: 'auto' },
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
            Back to Profile
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