import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { daysOfWeek } from '../../../../utils/constants';
import useOnboardingStore, { useAvailabilityMutation } from '../../../../stores/useOnboardingStore';
import CircularProgress from '@mui/material/CircularProgress';

function EditAvailabilityModal({ open, onClose, initialData }) {
  const [suburb, setSuburb] = useState(initialData.suburb || '');
  const [kmWillingToTravel, setKmWillingToTravel] = useState(initialData.kmWillingToTravel || '');
  const [customTimeSlots, setCustomTimeSlots] = useState(initialData.customTimeSlots || []);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ suburb: '', km: '', slot: '', slots: '' });

  // For adding new slot
  const [newSlot, setNewSlot] = useState({ dayOfWeek: daysOfWeek[0], startTime: '', endTime: '' });

  // Zustand store and mutation
  const updateAvailability = useOnboardingStore((s) => s.updateAvailability);
  const { mutate: saveAvailability, isLoading } = useAvailabilityMutation();

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
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
              Custom Time Slots
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
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
                    label="Start Time"
                    type="time"
                    value={newSlot.startTime}
                    onChange={e => setNewSlot(s => ({ ...s, startTime: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="End Time"
                    type="time"
                    value={newSlot.endTime}
                    onChange={e => setNewSlot(s => ({ ...s, endTime: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    disabled={isLoading}
                  />
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
              <Stack spacing={1} sx={{ mt: 2 }}>
                {customTimeSlots.length === 0 && (
                  <Typography color="text.secondary" fontStyle="italic">
                    No custom time slots added.
                  </Typography>
                )}
                {customTimeSlots.map((slot, idx) => (
                  <Grid container spacing={1} alignItems="center" key={idx}>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        select
                        label="Day"
                        value={slot.dayOfWeek}
                        onChange={e => handleSlotChange(idx, 'dayOfWeek', e.target.value)}
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
                        label="Start Time"
                        type="time"
                        value={slot.startTime}
                        onChange={e => handleSlotChange(idx, 'startTime', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField
                        label="End Time"
                        type="time"
                        value={slot.endTime}
                        onChange={e => handleSlotChange(idx, 'endTime', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        disabled={isLoading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <IconButton color="error" onClick={() => handleDeleteSlot(idx)} disabled={isLoading}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </Stack>
              {fieldErrors.slots && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>{fieldErrors.slots}</Typography>
              )}
            </Paper>
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
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
    </Dialog>
  );
}

EditAvailabilityModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
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