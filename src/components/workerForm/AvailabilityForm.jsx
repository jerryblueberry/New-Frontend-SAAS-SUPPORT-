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
  Alert as MuiAlert,
  Autocomplete,
  Slider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AccessTime as AccessTimeIcon, Info as InfoIcon, ArrowBack as ArrowBackIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import useOnboardingStore, { useAvailabilityMutation } from '../../stores/useOnboardingStore';
import { daysOfWeek } from '../../utils/constants';

// Popular Australian suburbs (sample, can be expanded)
const POPULAR_SUBURBS = [
  'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Geelong',
  'Hobart', 'Townsville', 'Cairns', 'Toowoomba', 'Darwin', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay',
  'Rockhampton', 'Bunbury', 'Coffs Harbour', 'Bundaberg', 'Wagga Wagga', 'Hervey Bay', 'Mildura', 'Shepparton', 'Gladstone', 'Port Macquarie'
];

// Compact custom time slot card
const CustomTimeSlotCard = ({ slot, index, onEdit, onRemove, disabled }) => {
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
  return (
    <Paper variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Chip label={slot.dayOfWeek.slice(0, 3)} size="small" sx={{ minWidth: 48 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          <AccessTimeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {calculateDuration(slot.startTime, slot.endTime)}
        </Typography>
      </Box>
      <Tooltip title="Edit">
        <span>
          <IconButton size="small" onClick={() => onEdit(slot, index)} disabled={disabled}>
            <EditIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Remove">
        <span>
          <IconButton size="small" color="error" onClick={() => onRemove(index)} disabled={disabled}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Paper>
  );
};

// MUI Dialog for adding/editing a custom time slot
const TimeSlotDialog = ({ open, onClose, onSave, initialData, daysOfWeek }) => {
  const [formData, setFormData] = useState(
    initialData || {
      dayOfWeek: daysOfWeek[0],
      startTime: '09:00',
      endTime: '17:00',
    }
  );
  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ dayOfWeek: daysOfWeek[0], startTime: '09:00', endTime: '17:00' });
  }, [initialData, daysOfWeek]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.startTime >= formData.endTime) return;
    onSave(formData);
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{initialData ? 'Edit Time Slot' : 'Add Custom Time Slot'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Select
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              fullWidth
              label="Day of Week"
              size="small"
            >
              {daysOfWeek.map((day) => (
                <MenuItem key={day} value={day}>{day}</MenuItem>
              ))}
            </Select>
            <Stack direction="row" spacing={2}>
              <TextField
                name="startTime"
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                name="endTime"
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const AvailabilityForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const availability = useOnboardingStore((state) => state.availability);
  const updateAvailability = useOnboardingStore((state) => state.updateAvailability);
  const addCustomTimeSlot = useOnboardingStore((state) => state.addCustomTimeSlot);
  const removeCustomTimeSlot = useOnboardingStore((state) => state.removeCustomTimeSlot);
  const prevStep = useOnboardingStore((state) => state.prevStep);
  const { mutate: saveAvailability, isPending, error: mutationError } = useAvailabilityMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [localError, setLocalError] = useState(null);
  // Group custom slots by day for display
  const groupedCustomSlots = useMemo(() => {
    const groups = {};
    availability.customTimeSlots.forEach((slot, idx) => {
      if (!groups[slot.dayOfWeek]) groups[slot.dayOfWeek] = [];
      groups[slot.dayOfWeek].push({ ...slot, index: idx });
    });
    return groups;
  }, [availability.customTimeSlots]);

  // Controlled values for kmWillingToTravel and suburb, always in sync with store
  const travelDistance = availability.kmWillingToTravel || 20;
  const suburb = availability.suburb || '';
  const [suburbInput, setSuburbInput] = useState(suburb);
  const [suburbError, setSuburbError] = useState('');

  // Keep local input in sync if store changes (e.g. navigation)
  useEffect(() => {
    setSuburbInput(suburb);
  }, [suburb]);

  // Form submission handler
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setLocalError(null);
    // Validation: at least one custom slot
    if (!availability.customTimeSlots || availability.customTimeSlots.length === 0) {
      setLocalError('Please select at least one time slot to continue.');
      return;
    }
    // Validation: kmWillingToTravel
    const km = Number(availability.kmWillingToTravel);
    if (isNaN(km) || km < 1 || km > 100) {
      setLocalError('Please enter a valid travel distance between 1 and 100 km.');
      return;
    }
    // Validation: suburb (optional, but recommended)
    if (!availability.suburb || !availability.suburb.trim()) {
      setLocalError('Please enter the suburb you live in.');
      return;
    }
    // All validations passed, submit
    saveAvailability(availability);
  }, [availability, saveAvailability]);
  // console.log("AVALABILITY",availability)
  // Modal handlers
  const handleAddCustomSlot = useCallback(() => {
    setEditingSlot(null);
    setIsDialogOpen(true);
  }, []);
  const handleEditCustomSlot = useCallback((slot, index) => {
    setEditingSlot({ ...slot, index });
    setIsDialogOpen(true);
  }, []);
  const handleSaveCustomSlot = useCallback((slot) => {
    if (editingSlot?.index !== undefined) {
      const updatedSlots = [...availability.customTimeSlots];
      updatedSlots[editingSlot.index] = slot;
      updateAvailability({ customTimeSlots: updatedSlots });
    } else {
      addCustomTimeSlot(slot);
    }
    setIsDialogOpen(false);
  }, [editingSlot, availability.customTimeSlots, updateAvailability, addCustomTimeSlot]);
  const handleRemoveCustomSlot = useCallback((index) => {
    removeCustomTimeSlot(index);
  }, [removeCustomTimeSlot]);
  const error = mutationError || localError;
  useEffect(() => {
    if (!availability.customTimeSlots) {
      updateAvailability({ customTimeSlots: [] });
    }
  }, [availability, updateAvailability]);
  return (
    <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left: Custom Time Slots (wider) */}
          <Grid item xs={12} md={9} lg={10}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, minHeight: 600, display: 'flex', flexDirection: 'column', gap: 2, boxShadow: 4 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.3rem' } }}>Your Custom Time Slots</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                    onClick={handleAddCustomSlot}
                    disabled={isPending}
                  size="small"
                  sx={{ borderRadius: 2, fontWeight: 600 }}
                >
                  Add Slot
                </Button>
              </Box>
              <Divider />
              <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: { xs: 320, sm: 480, md: 600 }, pr: 1 }}>
                {Object.keys(groupedCustomSlots).length > 0 ? (
                  daysOfWeek.filter(day => groupedCustomSlots[day]?.length).map(day => (
                    <Box key={day} mb={1.5}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>{day} ({groupedCustomSlots[day].length})</Typography>
                      <Stack spacing={0.5} direction="row" flexWrap="wrap" useFlexGap>
                          {groupedCustomSlots[day].map(slotObj => (
                              <CustomTimeSlotCard
                            key={slotObj.index}
                                slot={slotObj}
                                index={slotObj.index}
                                onEdit={handleEditCustomSlot}
                                onRemove={handleRemoveCustomSlot}
                                disabled={isPending}
                              />
                        ))}
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ height: 200, color: 'text.secondary' }}>
                    <AccessTimeIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body1">No custom slots yet</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddCustomSlot} sx={{ mt: 2 }}>
                      Add Your First Time Slot
                    </Button>
                  </Box>
                )}
              </Box>
              {error && (
                <MuiAlert severity="error" sx={{ mt: 2 }}>{error}</MuiAlert>
              )}
            </Paper>
          </Grid>
          {/* Right: Work Preferences (narrower) */}
          <Grid item xs={12} md={3} lg={2}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, minHeight: 500, display: 'flex', flexDirection: 'column', gap: 3, boxShadow: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>Work Preferences</Typography>
                {/* Travel Distance */}
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    How many km are you willing to travel for work?
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Slider
                      value={travelDistance}
                      onChange={(_, val) => updateAvailability({ kmWillingToTravel: val })}
                      min={1}
                      max={100}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{ flex: 1 }}
                      aria-label="Travel distance in kilometers"
                    />
                    <TextField
                      value={travelDistance}
                      onChange={e => {
                        let v = Number(e.target.value);
                        if (isNaN(v) || v < 1) v = 1;
                        if (v > 100) v = 100;
                        updateAvailability({ kmWillingToTravel: v });
                      }}
                      type="number"
                      inputProps={{ min: 1, max: 100, style: { width: 60, textAlign: 'center' } }}
                      size="small"
                      label="km"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Select the maximum distance (in kilometers) you are willing to travel for work.
                  </Typography>
                </Box>
                {/* Suburb Autocomplete */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Suburb you live in
                  </Typography>
                  <Autocomplete
                    freeSolo
                    options={POPULAR_SUBURBS}
                    value={suburb}
                    onChange={(_, newValue) => {
                      updateAvailability({ suburb: newValue || '' });
                      setSuburbError('');
                    }}
                    inputValue={suburbInput}
                    onInputChange={(_, newInputValue) => {
                      setSuburbInput(newInputValue);
                      updateAvailability({ suburb: newInputValue });
                      setSuburbError('');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Suburb"
                        variant="outlined"
                        size="small"
                        error={!!suburbError}
                        helperText={suburbError || 'Start typing or select from popular suburbs'}
                        sx={{ bgcolor: 'background.paper' }}
                      />
                    )}
                  />
                </Box>
              </Box>
              {error && (
                <MuiAlert severity="error" sx={{ mt: 2 }}>{error}</MuiAlert>
              )}
            </Paper>
          </Grid>
        </Grid>
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={prevStep}
            disabled={isPending}
          >
            Back to Profile
          </Button>
          <Button
            type="submit"
            variant="contained"
            endIcon={!isPending && <ArrowForwardIcon />}
            disabled={isPending}
            sx={{ minWidth: 180, position: 'relative' }}
          >
            {isPending ? (
              <CircularProgress size={24} color="inherit" sx={{ position: 'absolute', left: '50%', top: '50%', marginTop: '-12px', marginLeft: '-12px' }} />
            ) : (
              'Next: Certifications'
            )}
          </Button>
        </Box>
      </form>
      <TimeSlotDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSaveCustomSlot}
        initialData={editingSlot}
        daysOfWeek={daysOfWeek}
      />
    </Box>
  );
};

export default React.memo(AvailabilityForm);