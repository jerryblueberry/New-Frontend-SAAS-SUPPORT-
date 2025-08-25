import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  Stack,
  MenuItem,
  Paper,
  Card,
  CardContent,
  Avatar,
  Badge
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { daysOfWeek } from '../../../../utils/constants';
import useOnboardingStore, { useAvailabilityMutation } from '../../../../stores/useOnboardingStore';
import CircularProgress from '@mui/material/CircularProgress';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { alpha } from '@mui/material/styles';

// Day colors for visual distinction (kept consistent across app)
const DAY_COLORS = {
  Monday: '#1976d2',
  Tuesday: '#388e3c',
  Wednesday: '#f57c00',
  Thursday: '#7b1fa2',
  Friday: '#d32f2f',
  Saturday: '#0288d1',
  Sunday: '#5d4037'
};

function formatTo12Hour(time24) {
  if (!time24) return '';
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function calculateDuration(start, end) {
  if (!start || !end) return '';
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const diff = endMinutes - startMinutes;
  if (diff <= 0) return 'Invalid time';
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function EditAvailabilityModal({ open, onClose, initialData, onSave }) {
  const [suburb, setSuburb] = useState(initialData.suburb || '');
  const [kmWillingToTravel, setKmWillingToTravel] = useState(initialData.kmWillingToTravel || '');
  const [customTimeSlots, setCustomTimeSlots] = useState(initialData.customTimeSlots || []);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ suburb: '', km: '', slot: '', slots: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingData, setEditingData] = useState(null);

  // For adding new slot
  const [newSlot, setNewSlot] = useState({ dayOfWeek: daysOfWeek[0], startTime: '', endTime: '' });

  // Zustand store and mutation
  const updateAvailability = useOnboardingStore((s) => s.updateAvailability);
  const { mutate: saveAvailability, isLoading } = useAvailabilityMutation();

  // Generate 30-min time options (06:00 - 22:00)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        const value = `${h}:${m}`;
        options.push({ value, label: formatTo12Hour(value) });
      }
    }
    return options;
  }, []);

  // Group slots by day and sort by start time
  const groupedSlots = useMemo(() => {
    const groups = daysOfWeek.reduce((acc, d) => {
      acc[d] = [];
      return acc;
    }, {});
    customTimeSlots.forEach((s) => {
      if (groups[s.dayOfWeek]) {
        groups[s.dayOfWeek].push(s);
      }
    });
    daysOfWeek.forEach((d) => {
      groups[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return groups;
  }, [customTimeSlots]);

  const isOverlapping = (slots, candidate, excludeIndex = null) => {
    return slots.some((slot, idx) => {
      if (excludeIndex !== null && idx === excludeIndex) return false;
      if (slot.dayOfWeek !== candidate.dayOfWeek) return false;
      return candidate.startTime < slot.endTime && candidate.endTime > slot.startTime;
    });
  };

  const handleSlotChange = (idx, field, value) => {
    setCustomTimeSlots(slots =>
      slots.map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot))
    );
  };

  const validateFields = () => {
    let valid = true;
    const errors = { suburb: '', km: '', slot: '', slots: '' };
    if (!suburb.trim()) {
      errors.suburb = 'Suburb is required.';
      valid = false;
    }
    if (kmWillingToTravel === '' || isNaN(Number(kmWillingToTravel)) || Number(kmWillingToTravel) < 0) {
      errors.km = 'Distance must be 0 or greater.';
      valid = false;
    }
    // Validate all slots
    const slotSet = new Set();
    for (let i = 0; i < customTimeSlots.length; i++) {
      const slot = customTimeSlots[i];
      if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
        errors.slots = 'All slots must have day, start, and end time.';
        valid = false;
        break;
      }
      if (slot.startTime === slot.endTime) {
        errors.slots = 'Start and end time cannot be the same.';
        valid = false;
        break;
      }
      if (slot.startTime > slot.endTime) {
        errors.slots = 'Start time must be before end time.';
        valid = false;
        break;
      }
      const key = `${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`;
      if (slotSet.has(key)) {
        errors.slots = 'Duplicate time slot found.';
        valid = false;
        break;
      }
      slotSet.add(key);
      // Overlap validation per day
      const daySlots = customTimeSlots.filter((s, idx) => s.dayOfWeek === slot.dayOfWeek && idx !== i);
      if (isOverlapping(daySlots, slot)) {
        errors.slots = `Time slot overlaps with an existing slot on ${slot.dayOfWeek}.`;
        valid = false;
        break;
      }
    }
    setFieldErrors(errors);
    return valid;
  };

  const validateNewSlot = () => {
    if (!newSlot.startTime || !newSlot.endTime) {
      setFieldErrors(f => ({ ...f, slot: 'Start and end time required.' }));
      return false;
    }
    if (newSlot.startTime === newSlot.endTime) {
      setFieldErrors(f => ({ ...f, slot: 'Start and end time cannot be the same.' }));
      return false;
    }
    if (newSlot.startTime > newSlot.endTime) {
      setFieldErrors(f => ({ ...f, slot: 'Start time must be before end time.' }));
      return false;
    }
    const duplicate = customTimeSlots.some(
      slot => slot.dayOfWeek === newSlot.dayOfWeek && slot.startTime === newSlot.startTime && slot.endTime === newSlot.endTime
    );
    if (duplicate) {
      setFieldErrors(f => ({ ...f, slot: 'Duplicate slot.' }));
      return false;
    }
    if (isOverlapping(customTimeSlots, newSlot)) {
      setFieldErrors(f => ({ ...f, slot: `Overlaps with an existing time slot on ${newSlot.dayOfWeek}.` }));
      return false;
    }
    setFieldErrors(f => ({ ...f, slot: '' }));
    return true;
  };

  const handleAddSlot = () => {
    if (!validateNewSlot()) return;
    setCustomTimeSlots(slots => [...slots, newSlot]);
    setNewSlot({ dayOfWeek: daysOfWeek[0], startTime: '', endTime: '' });
  };

  const handleDeleteSlot = (idx) => {
    setCustomTimeSlots(slots => slots.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    setError(null);
    if (!validateFields()) return;
    // Update local store
    updateAvailability({ suburb, kmWillingToTravel: Number(kmWillingToTravel), customTimeSlots });
    // Save to backend
    saveAvailability(
      { suburb, kmWillingToTravel: Number(kmWillingToTravel), customTimeSlots },
      {
        onSuccess: () => {
          if (onSave) {
            onSave({ suburb, kmWillingToTravel: Number(kmWillingToTravel), customTimeSlots });
          }
          onClose();
        },
        onError: (err) => {
          setError(err.message || 'Failed to save availability');
        },
      }
    );
  };

  // Reset local state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setSuburb(initialData.suburb || '');
      setKmWillingToTravel(initialData.kmWillingToTravel || '');
      setCustomTimeSlots(initialData.customTimeSlots || []);
      setError(null);
    }
  }, [open, initialData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="body">
      <DialogTitle>Edit Availability</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Preferences */}
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>S</Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>Suburb</Typography>
                </Stack>
                <TextField
                  label="Suburb"
                  value={suburb}
                  onChange={e => setSuburb(e.target.value)}
                  fullWidth
                  variant="outlined"
                  autoFocus
                  disabled={isLoading}
                  error={!!fieldErrors.suburb}
                  helperText={fieldErrors.suburb}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', color: 'white' }}>KM</Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>Travel Distance (km)</Typography>
                </Stack>
                <TextField
                  label="Willing to travel (km)"
                  type="number"
                  value={kmWillingToTravel}
                  onChange={e => setKmWillingToTravel(e.target.value)}
                  fullWidth
                  variant="outlined"
                  inputProps={{ min: 0 }}
                  disabled={isLoading}
                  error={!!fieldErrors.km}
                  helperText={fieldErrors.km}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Add Time Slot */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', color: 'white' }}>
                    <AccessTimeIcon />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>Add Time Slot</Typography>
                </Stack>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <TextField
                      select
                      label="Day"
                      value={newSlot.dayOfWeek}
                      onChange={e => setNewSlot(s => ({ ...s, dayOfWeek: e.target.value }))}
                      fullWidth
                      disabled={isLoading}
                    >
                      {daysOfWeek.map(day => (
                        <MenuItem key={day} value={day}>{day}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      select
                      label="Start Time"
                      value={newSlot.startTime}
                      onChange={e => setNewSlot(s => ({ ...s, startTime: e.target.value }))}
                      fullWidth
                      disabled={isLoading}
                    >
                      {timeOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      select
                      label="End Time"
                      value={newSlot.endTime}
                      onChange={e => setNewSlot(s => ({ ...s, endTime: e.target.value }))}
                      fullWidth
                      disabled={isLoading}
                    >
                      {timeOptions.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddSlot}
                      fullWidth
                      disabled={!newSlot.startTime || !newSlot.endTime || isLoading}
                    >
                      Add Slot
                    </Button>
                  </Grid>
                  {fieldErrors.slot && (
                    <Grid item xs={12}>
                      <Typography color="error" variant="body2">{fieldErrors.slot}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Existing Time Slots */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', color: 'white' }}>TS</Avatar>
                  <Typography variant="subtitle1" fontWeight={700}>Your Time Slots</Typography>
                </Stack>

                {customTimeSlots.length === 0 ? (
                  <Typography color="text.secondary" fontStyle="italic">
                    No custom time slots added.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {daysOfWeek.filter((d) => groupedSlots[d].length > 0).map((day) => {
                      const dayColor = DAY_COLORS[day] || 'primary.main';
                      return (
                        <Grid item xs={12} md={6} key={day}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderLeft: `4px solid ${dayColor}` }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight={700}>{day}</Typography>
                              <Badge badgeContent={groupedSlots[day].length} color="primary" />
                            </Stack>
                            <Stack spacing={1.25}>
                              {groupedSlots[day].map((slot, idx) => (
                                <Paper
                                  key={`${day}-${idx}`}
                                  variant="outlined"
                                  sx={{
                                    p: 1.25,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderRadius: 2,
                                    bgcolor: alpha(dayColor, 0.04)
                                  }}
                                >
                                  <Stack direction="row" spacing={1.25} alignItems="center">
                                    <AccessTimeIcon sx={{ fontSize: 18, color: alpha(dayColor, 0.9) }} />
                                    <Typography variant="body2" fontWeight={700} sx={{ color: dayColor }}>
                                      {formatTo12Hour(slot.startTime)} - {formatTo12Hour(slot.endTime)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ({calculateDuration(slot.startTime, slot.endTime)})
                                    </Typography>
                                  </Stack>
                                  <Stack direction="row" spacing={1}>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => {
                                        // Prefill edit state by index within full list
                                        const absoluteIndex = customTimeSlots.findIndex(
                                          (s) => s.dayOfWeek === day && s.startTime === slot.startTime && s.endTime === slot.endTime
                                        );
                                        setEditingIndex(absoluteIndex);
                                        setEditingData({ ...slot });
                                        setEditOpen(true);
                                      }}
                                      disabled={isLoading}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDeleteSlot(customTimeSlots.findIndex((s) => s === slot))} disabled={isLoading}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </Paper>
                              ))}
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}

                {fieldErrors.slots && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>{fieldErrors.slots}</Typography>
                )}
                {error && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="primary" variant="contained" startIcon={<EditIcon />} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Confirm Edit'}
        </Button>
      </DialogActions>

      {/* Edit Slot Dialog */}
      <EditSlotDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(updated) => {
          if (editingIndex === null || editingIndex === undefined) return;
          // Validate overlap before applying
          if (isOverlapping(customTimeSlots.filter((_, i) => i !== editingIndex), updated)) {
            setFieldErrors((f) => ({ ...f, slots: `Updated time overlaps on ${updated.dayOfWeek}.` }));
            return;
          }
          setCustomTimeSlots((slots) => {
            const copy = [...slots];
            copy[editingIndex] = updated;
            return copy;
          });
          setEditOpen(false);
          setFieldErrors((f) => ({ ...f, slots: '' }));
        }}
        initialData={editingData}
        daysOfWeek={daysOfWeek}
        timeOptions={timeOptions}
      />
    </Dialog>
  );
}

EditAvailabilityModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  initialData: PropTypes.shape({
    suburb: PropTypes.string,
    kmWillingToTravel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    customTimeSlots: PropTypes.arrayOf(
      PropTypes.shape({
        dayOfWeek: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
      })
    ),
  }),
};

export default EditAvailabilityModal; 

// Inline compact edit dialog for a single slot
function EditSlotDialog({ open, onClose, onSave, initialData, daysOfWeek, timeOptions }) {
  const [data, setData] = useState(
    initialData || { dayOfWeek: daysOfWeek?.[0], startTime: '09:00', endTime: '17:00' }
  );
  const [err, setErr] = useState('');

  React.useEffect(() => {
    if (open) {
      setData(initialData || { dayOfWeek: daysOfWeek?.[0], startTime: '09:00', endTime: '17:00' });
      setErr('');
    }
  }, [open, initialData, daysOfWeek]);

  const validate = () => {
    if (!data.startTime || !data.endTime) {
      setErr('Start and end time required.');
      return false;
    }
    if (data.startTime >= data.endTime) {
      setErr('End time must be after start time.');
      return false;
    }
    setErr('');
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave?.(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Time Slot</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TextField
              select
              label="Day"
              value={data.dayOfWeek}
              onChange={(e) => setData((d) => ({ ...d, dayOfWeek: e.target.value }))}
              fullWidth
            >
              {daysOfWeek?.map((day) => (
                <MenuItem key={day} value={day}>{day}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="Start Time"
              value={data.startTime}
              onChange={(e) => setData((d) => ({ ...d, startTime: e.target.value }))}
              fullWidth
            >
              {timeOptions?.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              label="End Time"
              value={data.endTime}
              onChange={(e) => setData((d) => ({ ...d, endTime: e.target.value }))}
              fullWidth
            >
              {timeOptions?.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          {err && (
            <Grid item xs={12}>
              <Typography color="error" variant="body2">{err}</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">Cancel</Button>
        <Button onClick={handleSave} color="primary" variant="contained" startIcon={<EditIcon />}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

EditSlotDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    dayOfWeek: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }),
  daysOfWeek: PropTypes.arrayOf(PropTypes.string).isRequired,
  timeOptions: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })).isRequired,
};