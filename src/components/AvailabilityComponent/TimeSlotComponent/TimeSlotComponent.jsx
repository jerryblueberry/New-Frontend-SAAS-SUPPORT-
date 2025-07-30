import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  Fade,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as AccessTimeIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { daysOfWeek } from '../../../utils/constants';

// Day colors for visual distinction
export const DAY_COLORS = {
  Monday: '#1976d2',
  Tuesday: '#388e3c',
  Wednesday: '#f57c00',
  Thursday: '#7b1fa2',
  Friday: '#d32f2f',
  Saturday: '#0288d1',
  Sunday: '#5d4037'
};

// Card for displaying a single custom time slot
export const CustomTimeSlotCard = ({ slot, index, onEdit, onRemove, disabled }) => {
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

// Dialog for adding/editing a time slot
export const TimeSlotDialog = ({ open, onClose, onSave, initialData, daysOfWeek, existingSlots, editingIndex }) => {
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
    if (data.startTime >= data.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;
    if (durationMinutes < 30) {
      newErrors.endTime = 'Time slot must be at least 30 minutes long';
    }
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
