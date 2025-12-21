// src/components/WorkerAvailabilityOnboarding/TimeSlotSelector.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  useTheme,
  useMediaQuery,
  Stack,
  Alert,
  Slide,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Clock, Plus, Calendar, Check } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { daysOfWeek } from '../../utils/constants';

// Premium neutral day colors - visible but not too dark
const DAY_COLORS = {
  Monday: '#3b82f6',    // Blue
  Tuesday: '#6366f1',   // Indigo
  Wednesday: '#8b5cf6', // Purple
  Thursday: '#0ea5e9',  // Sky
  Friday: '#14b8a6',    // Teal
  Saturday: '#64748b',  // Slate
  Sunday: '#78716c',    // Stone
};

// Short day names
const DAY_SHORT = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

// Utility functions
const formatTime = (timeString) => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
};

const formatTimeShort = (timeString) => {
  const [hours] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'p' : 'a';
  const displayHour = hour % 12 || 12;
  return `${displayHour}${ampm}`;
};

const calculateDuration = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (durationMinutes <= 0) return null;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

// Time slot chip component
const TimeSlotChip = ({ slot, index, onEdit, onRemove, disabled }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        py: 0.625,
        px: 1.25,
        borderRadius: '8px',
        bgcolor: '#f1f5f9',
        border: '1px solid #e2e8f0',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: '#e2e8f0',
          borderColor: '#cbd5e1',
        },
      }}
    >
      <Typography
        sx={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: '#334155',
          whiteSpace: 'nowrap',
        }}
      >
        {isMobile ? formatTimeShort(slot.startTime) : formatTime(slot.startTime)}
        <Box component="span" sx={{ mx: 0.5, color: '#94a3b8' }}>–</Box>
        {isMobile ? formatTimeShort(slot.endTime) : formatTime(slot.endTime)}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <IconButton
          size="small"
          onClick={() => onEdit(slot, index)}
          disabled={disabled}
          sx={{ p: 0.25, color: '#64748b', '&:hover': { color: '#3b82f6', bgcolor: 'transparent' } }}
        >
          <EditIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onRemove(index)}
          disabled={disabled}
          sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: 'transparent' } }}
        >
          <DeleteIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

TimeSlotChip.propTypes = {
  slot: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

// Time picker button
const TimeButton = ({ value, label, selected, onClick, color }) => (
  <Button
    onClick={onClick}
    sx={{
      minWidth: 'auto',
      px: 1.25,
      py: 0.625,
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: selected ? 600 : 500,
      color: selected ? '#fff' : '#475569',
      bgcolor: selected ? color : '#f1f5f9',
      border: 'none',
      textTransform: 'none',
      '&:hover': { bgcolor: selected ? color : '#e2e8f0' },
    }}
  >
    {label}
  </Button>
);

// Generate time options
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({ value: time24, label: formatTime(time24) });
    }
  }
  return options;
};

// Time slot dialog
const TimeSlotDialog = ({ open, onClose, onSave, initialData, existingSlots, editingIndex }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const timeOptions = useMemo(() => generateTimeOptions(), []);

  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (initialData) {
        setSelectedDay(initialData.dayOfWeek);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
      } else {
        setSelectedDay(daysOfWeek[0]);
        setStartTime('09:00');
        setEndTime('17:00');
      }
      setErrors({});
    }
  }, [initialData, open]);

  const dayColor = DAY_COLORS[selectedDay] || '#3b82f6';
  const duration = calculateDuration(startTime, endTime);

  const validate = useCallback(() => {
    const newErrors = {};
    if (startTime >= endTime) {
      newErrors.time = 'End time must be after start time';
    }
    const isOverlapping = existingSlots?.some((slot, idx) => {
      if (editingIndex !== null && idx === editingIndex) return false;
      if (slot.dayOfWeek !== selectedDay) return false;
      return startTime < slot.endTime && endTime > slot.startTime;
    });
    if (isOverlapping) newErrors.time = 'Overlaps with existing slot';
    return newErrors;
  }, [startTime, endTime, selectedDay, existingSlots, editingIndex]);

  const handleSave = useCallback(() => {
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSave({ dayOfWeek: selectedDay, startTime, endTime });
    }
  }, [validate, onSave, selectedDay, startTime, endTime]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '16px',
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100%' : 'calc(100% - 64px)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} color="#475569" strokeWidth={2} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
              {initialData ? 'Edit Time Slot' : 'Add Time Slot'}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              Set your working hours
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ width: 36, height: 36, bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}>
          <CloseIcon sx={{ fontSize: 18, color: '#64748b' }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Day Selection */}
        <Box sx={{ px: 2, py: 2, borderBottom: '1px solid #f1f5f9' }}>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Day of Week
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {daysOfWeek.map((day) => {
              const isSelected = selectedDay === day;
              const color = DAY_COLORS[day];
              return (
                <Button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  sx={{
                    minWidth: { xs: 42, sm: 48 },
                    height: 40,
                    borderRadius: '10px',
                    px: 1,
                    bgcolor: isSelected ? color : '#f8fafc',
                    color: isSelected ? '#fff' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    border: `1px solid ${isSelected ? color : '#e2e8f0'}`,
                    '&:hover': { bgcolor: isSelected ? color : '#f1f5f9' },
                  }}
                >
                  {DAY_SHORT[day]}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Time Selection */}
        <Box sx={{ px: 2, py: 2 }}>
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', mb: 1.25, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Working Hours
          </Typography>

          {/* Start Time */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', mb: 0.75 }}>
              Start Time
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxHeight: 100, overflowY: 'auto', p: 1, borderRadius: '10px', bgcolor: '#fafafa' }}>
              {timeOptions.slice(0, 17).map((opt) => (
                <TimeButton
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  selected={startTime === opt.value}
                  onClick={() => { setStartTime(opt.value); setErrors({}); }}
                  color={dayColor}
                />
              ))}
            </Box>
          </Box>

          {/* End Time */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', mb: 0.75 }}>
              End Time
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', maxHeight: 100, overflowY: 'auto', p: 1, borderRadius: '10px', bgcolor: '#fafafa' }}>
              {timeOptions.slice(0, 17).map((opt) => (
                <TimeButton
                  key={opt.value}
                  value={opt.value}
                  label={opt.label}
                  selected={endTime === opt.value}
                  onClick={() => { setEndTime(opt.value); setErrors({}); }}
                  color={dayColor}
                />
              ))}
            </Box>
          </Box>

          {/* Duration Preview */}
          {duration && (
            <Box sx={{ mt: 2, p: 1.5, borderRadius: '10px', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', mb: 0.25, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Shift Duration
              </Typography>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: dayColor }}>
                {duration}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>
                {DAY_SHORT[selectedDay]} • {formatTime(startTime)} – {formatTime(endTime)}
              </Typography>
            </Box>
          )}

          {errors.time && (
            <Alert severity="error" sx={{ mt: 2, borderRadius: '8px', py: 0.25 }}>
              {errors.time}
            </Alert>
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <Box sx={{ px: 2, py: 2, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 1.5 }}>
        <Button
          fullWidth
          onClick={onClose}
          sx={{ py: 1.25, borderRadius: '10px', fontWeight: 600, color: '#64748b', bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#e2e8f0' } }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={!duration}
          sx={{
            py: 1.25,
            borderRadius: '10px',
            fontWeight: 600,
            bgcolor: dayColor,
            boxShadow: 'none',
            '&:hover': { bgcolor: alpha(dayColor, 0.9), boxShadow: `0 4px 12px ${alpha(dayColor, 0.3)}` },
            '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
          }}
        >
          {initialData ? 'Update' : 'Add Slot'}
        </Button>
      </Box>
    </Dialog>
  );
};

TimeSlotDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  existingSlots: PropTypes.array,
  editingIndex: PropTypes.number,
};

// Main component
const TimeSlotSelector = ({
  customTimeSlots = [],
  onAddSlot,
  onEditSlot,
  onRemoveSlot,
  disabled = false,
  error = null,
}) => {
  const theme = useTheme();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // Group slots by day
  const groupedSlots = useMemo(() => {
    const groups = {};
    customTimeSlots?.forEach((slot, idx) => {
      if (!groups[slot.dayOfWeek]) groups[slot.dayOfWeek] = [];
      groups[slot.dayOfWeek].push({ ...slot, index: idx });
    });
    Object.keys(groups).forEach((day) => {
      groups[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return groups;
  }, [customTimeSlots]);

  const totalSlots = customTimeSlots?.length || 0;
  const activeDays = Object.keys(groupedSlots).length;

  const handleAddSlot = useCallback(() => {
    setEditingSlot(null);
    setEditingIndex(null);
    setIsDialogOpen(true);
  }, []);

  const handleEditSlot = useCallback((slot, index) => {
    setEditingSlot({ ...slot });
    setEditingIndex(index);
    setIsDialogOpen(true);
  }, []);

  const handleSaveSlot = useCallback((slot) => {
    if (editingIndex !== null) {
      onEditSlot(editingIndex, slot);
    } else {
      onAddSlot(slot);
    }
    setIsDialogOpen(false);
    setEditingSlot(null);
    setEditingIndex(null);
  }, [editingIndex, onAddSlot, onEditSlot]);

  return (
    <Box>
      {/* Header Row - Remove since parent already has header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {totalSlots > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.5, borderRadius: '6px', bgcolor: '#dbeafe' }}>
              <Check size={12} color="#3b82f6" strokeWidth={3} />
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                {totalSlots} slot{totalSlots > 1 ? 's' : ''} • {activeDays} day{activeDays > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={16} strokeWidth={2.5} />}
          onClick={handleAddSlot}
          disabled={disabled}
          sx={{
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.8125rem',
            px: 2,
            py: 0.875,
            bgcolor: '#3b82f6',
            boxShadow: 'none',
            textTransform: 'none',
            '&:hover': { bgcolor: '#2563eb', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)' },
          }}
        >
          Add
        </Button>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', py: 0.25 }}>
          {error}
        </Alert>
      )}

      {/* Slots Grid */}
      {totalSlots > 0 ? (
        <Stack spacing={1.5}>
          {daysOfWeek
            .filter((day) => groupedSlots[day]?.length)
            .map((day) => {
              const dayColor = DAY_COLORS[day];
              return (
                <Box
                  key={day}
                  sx={{
                    p: 1.5,
                    borderRadius: '10px',
                    bgcolor: '#fafafa',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  {/* Day header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: dayColor }} />
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: '#334155' }}>
                      {day}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', ml: 'auto' }}>
                      {groupedSlots[day].length} slot{groupedSlots[day].length > 1 ? 's' : ''}
                    </Typography>
                  </Box>

                  {/* Slots */}
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {groupedSlots[day].map((slotObj) => (
                      <TimeSlotChip
                        key={slotObj.index}
                        slot={slotObj}
                        index={slotObj.index}
                        onEdit={handleEditSlot}
                        onRemove={onRemoveSlot}
                        disabled={disabled}
                      />
                    ))}
                  </Box>
                </Box>
              );
            })}
        </Stack>
      ) : (
        /* Empty State */
        <Box
          sx={{
            py: 4,
            px: 2,
            textAlign: 'center',
            borderRadius: '12px',
            border: '2px dashed #e2e8f0',
            bgcolor: '#fafafa',
          }}
        >
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
            <Clock size={20} color="#64748b" strokeWidth={2} />
          </Box>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#334155', mb: 0.25 }}>
            No time slots yet
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748b', mb: 2 }}>
            Add your available working hours
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={handleAddSlot}
            sx={{
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.8125rem',
              px: 2.5,
              py: 0.875,
              borderColor: '#cbd5e1',
              color: '#475569',
              textTransform: 'none',
              '&:hover': { borderColor: '#3b82f6', color: '#3b82f6', bgcolor: '#eff6ff' },
            }}
          >
            Add First Slot
          </Button>
        </Box>
      )}

      {/* Dialog */}
      <TimeSlotDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingSlot(null); setEditingIndex(null); }}
        onSave={handleSaveSlot}
        initialData={editingSlot}
        existingSlots={customTimeSlots}
        editingIndex={editingIndex}
      />
    </Box>
  );
};

TimeSlotSelector.propTypes = {
  customTimeSlots: PropTypes.arrayOf(
    PropTypes.shape({
      dayOfWeek: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
    })
  ),
  onAddSlot: PropTypes.func.isRequired,
  onEditSlot: PropTypes.func.isRequired,
  onRemoveSlot: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
};

export default React.memo(TimeSlotSelector);
