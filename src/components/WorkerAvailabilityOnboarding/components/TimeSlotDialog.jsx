// src/components/WorkerAvailabilityOnboarding/components/TimeSlotDialog.jsx
import React, { useState, useCallback, useEffect } from 'react';
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
  Alert,
  Slide,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { Clock, Calendar, Check } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { daysOfWeek } from '../../../utils/constants';
import { DAY_COLORS, DAY_SHORT, formatTime, calculateDuration, wouldOverlap } from '../utils/timeSlotUtils';
import TimerPicker from './TimerPicker';

/**
 * TimeSlotDialog Component
 * 
 * A premium dialog component for adding/editing time slots with:
 * - Day selection
 * - Start/End time pickers
 * - Multiple day application
 * - Overlap validation
 * - Responsive design
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onClose - Callback when dialog closes
 * @param {function} onSave - Callback when slot is saved (receives slot object)
 * @param {object} initialData - Initial slot data for editing (optional)
 * @param {array} existingSlots - Array of existing slots for overlap checking
 * @param {number} editingIndex - Index of slot being edited (null for new slots)
 */
const TimeSlotDialog = ({ 
  open, 
  onClose, 
  onSave, 
  initialData, 
  existingSlots, 
  editingIndex 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedDay, setSelectedDay] = useState(daysOfWeek[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [errors, setErrors] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);
  const [applyToMultipleDays, setApplyToMultipleDays] = useState(false);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setSelectedDay(initialData.dayOfWeek);
        setStartTime(initialData.startTime);
        setEndTime(initialData.endTime);
        setApplyToMultipleDays(false);
        setSelectedDays([]);
      } else {
        setSelectedDay(daysOfWeek[0]);
        setStartTime('09:00');
        setEndTime('17:00');
        setApplyToMultipleDays(false);
        setSelectedDays([]);
      }
      setErrors({});
    }
  }, [initialData, open]);

  const dayColor = DAY_COLORS[selectedDay] || '#3b82f6';
  const duration = calculateDuration(startTime, endTime);

  // Validation function
  const validate = useCallback((day = selectedDay, excludeIdx = editingIndex) => {
    const newErrors = {};
    
    // Validate start and end times exist
    if (!startTime || !endTime) {
      newErrors.time = 'Both start and end times are required';
      return newErrors;
    }
    
    // Validate start < end
    if (startTime >= endTime) {
      newErrors.time = 'End time must be after start time';
      return newErrors;
    }
    
    // Validate time format (should be HH:mm)
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      newErrors.time = 'Invalid time format';
      return newErrors;
    }
    
    // Check for overlaps
    const testSlot = { dayOfWeek: day, startTime, endTime };
    if (wouldOverlap(testSlot, existingSlots, excludeIdx)) {
      newErrors.time = 'Overlaps with existing slot';
      return newErrors;
    }
    
    return newErrors;
  }, [startTime, endTime, selectedDay, existingSlots, editingIndex]);

  // Toggle day selection for multiple days
  const handleDayToggle = useCallback((day) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      }
      return [...prev, day];
    });
  }, []);

  // Handle save action
  const handleSave = useCallback(() => {
    // When editing, only save to the selected day
    if (editingIndex !== null) {
      const dayErrors = validate(selectedDay, editingIndex);
      if (Object.keys(dayErrors).length > 0) {
        setErrors(dayErrors);
        return;
      }
      onSave({ dayOfWeek: selectedDay, startTime, endTime });
      onClose();
      return;
    }

    // When adding new slots, can apply to multiple days
    const baseSlot = { startTime, endTime };
    const daysToApply = applyToMultipleDays && selectedDays.length > 0
      ? [selectedDay, ...selectedDays]
      : [selectedDay];

    const slotsToSave = [];
    const skippedDays = [];

    daysToApply.forEach(day => {
      const dayErrors = validate(day, null);
      if (Object.keys(dayErrors).length === 0) {
        slotsToSave.push({ ...baseSlot, dayOfWeek: day });
      } else {
        skippedDays.push(day);
      }
    });

    if (slotsToSave.length === 0) {
      setErrors({ time: 'Cannot save: overlaps detected or invalid times' });
      return;
    }

    // Save all valid slots
    slotsToSave.forEach(slot => {
      onSave(slot);
    });

    if (skippedDays.length > 0) {
      setErrors({ 
        time: `Skipped ${skippedDays.length} day(s) due to overlaps: ${skippedDays.map(d => DAY_SHORT[d]).join(', ')}` 
      });
      // Don't close dialog if some days were skipped - let user see the warning
    } else {
      setErrors({});
      onClose();
    }
  }, [validate, onSave, selectedDay, startTime, endTime, applyToMultipleDays, selectedDays, editingIndex, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '20px',
          m: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100%' : '95vh',
          minHeight: isMobile ? '100%' : 'auto',
          height: isMobile ? '100%' : 'auto',
        },
      }}
    >
      {/* Header - Enhanced */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ 
            width: { xs: 40, sm: 44 }, 
            height: { xs: 40, sm: 44 }, 
            borderRadius: '12px', 
            bgcolor: alpha(dayColor, 0.1), 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Clock size={20} color={dayColor} strokeWidth={2.5} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
              {initialData ? 'Edit Time Slot' : 'Add Time Slot'}
            </Typography>
            <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' }, color: '#64748b' }}>
              Set your working hours
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            width: { xs: 40, sm: 44 }, 
            height: { xs: 40, sm: 44 }, 
            borderRadius: '10px',
            bgcolor: '#f1f5f9', 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { 
              bgcolor: '#e2e8f0',
              transform: 'scale(1.05)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: { xs: 20, sm: 22 }, color: '#64748b' }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0, overflowY: 'auto', maxHeight: 'calc(95vh - 140px)' }}>
        {/* Day Selection - Compact & Refined */}
        <Box sx={{ 
          px: { xs: 2, sm: 2.5 }, 
          py: { xs: 2, sm: 2.5 }, 
          borderBottom: '1px solid #f1f5f9',
        }}>
          {/* Section Header */}
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ 
              fontSize: '0.6875rem', 
              fontWeight: 700, 
              color: '#64748b', 
              mb: 1.25,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Day of Week
            </Typography>
          </Box>
          
          {/* Compact Grid Layout */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(7, 1fr)' },
            gap: { xs: 0.625, sm: 0.75 },
          }}>
            {daysOfWeek.map((day) => {
              const isSelected = selectedDay === day;
              const color = DAY_COLORS[day];
              
              return (
                <Button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  sx={{
                    width: '100%',
                    height: { xs: 48, sm: 52 },
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isSelected 
                      ? color 
                      : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#475569',
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    border: isSelected 
                      ? `2px solid ${color}` 
                      : '1px solid #e2e8f0',
                    boxShadow: isSelected 
                      ? `0 2px 8px ${alpha(color, 0.2)}` 
                      : 'none',
                    transition: 'all 0.2s ease',
                    textTransform: 'none',
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': { 
                      bgcolor: isSelected 
                        ? color 
                        : alpha(color, 0.1),
                      borderColor: isSelected ? color : color,
                      transform: 'translateY(-1px)',
                      boxShadow: isSelected 
                        ? `0 4px 12px ${alpha(color, 0.25)}` 
                        : `0 2px 6px ${alpha(color, 0.1)}`,
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  {DAY_SHORT[day]}
                </Button>
              );
            })}
          </Box>

          {/* Consolidated Error Display - Right below days for better visibility */}
          {(errors.time || errors.startTime || errors.endTime) && (
            <Alert 
              severity={errors.time?.includes('Skipped') ? 'warning' : 'error'} 
              sx={{ 
                mt: 2,
                mb: 0,
                borderRadius: '10px',
                fontSize: '0.8125rem',
                '& .MuiAlert-icon': {
                  fontSize: '1.125rem',
                },
              }}
            >
              {/* Prioritize: time errors > startTime > endTime */}
              {errors.time || errors.startTime || errors.endTime}
            </Alert>
          )}
        </Box>

        {/* Time Selection - Responsive Layout */}
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
          {/* Start & End Time - Side by Side on Desktop, Stacked on Mobile */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: { xs: 2.5, lg: 3 },
            mb: 2.5,
          }}>
            {/* Start Time - Timer Picker */}
            <Box sx={{ flex: { lg: 1 } }}>
              <TimerPicker
                label="Start Time"
                value={startTime}
                onChange={(time) => {
                  setStartTime(time);
                  // Validate start < end
                  if (endTime && time >= endTime) {
                    setErrors({ time: 'Start time must be before end time' });
                    // Auto-adjust end time if needed
                    const [startH, startM] = time.split(':').map(Number);
                    const adjustedEnd = `${String(startH).padStart(2, '0')}:${String(Math.min(startM + 30, 59)).padStart(2, '0')}`;
                    if (adjustedEnd <= '23:59') {
                      setEndTime(adjustedEnd);
                    }
                  } else {
                    setErrors({});
                  }
                }}
                onValidationChange={(error) => {
                  if (error) {
                    setErrors(prev => ({ ...prev, startTime: error }));
                  } else {
                    setErrors(prev => {
                      const { startTime: _, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                color={dayColor}
                maxTime={endTime || undefined}
                compact={!isMobile}
              />
            </Box>

            {/* End Time - Timer Picker */}
            <Box sx={{ flex: { lg: 1 } }}>
              <TimerPicker
                label="End Time"
                value={endTime || '17:00'}
                onChange={(time) => {
                  setEndTime(time);
                  // Validate end > start
                  if (startTime && time <= startTime) {
                    setErrors({ time: 'End time must be after start time' });
                  } else {
                    setErrors(prev => {
                      const { time: _, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                onValidationChange={(error) => {
                  if (error) {
                    setErrors(prev => ({ ...prev, endTime: error }));
                  } else {
                    setErrors(prev => {
                      const { endTime: _, ...rest } = prev;
                      return rest;
                    });
                  }
                }}
                color="#10b981"
                minTime={startTime || undefined}
                disabled={!startTime}
                compact={!isMobile}
              />
            </Box>
          </Box>

          {/* Duration Preview - Enhanced */}
          {duration && !errors.time && (
            <Box
              sx={{
                mt: 3,
                p: { xs: 2, sm: 2.5 },
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${alpha(dayColor, 0.08)} 0%, ${alpha(dayColor, 0.04)} 100%)`,
                border: `1px solid ${alpha(dayColor, 0.15)}`,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${dayColor} 0%, ${alpha(dayColor, 0.5)} 100%)`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <Clock size={18} color={dayColor} strokeWidth={2.5} />
                <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  Shift Duration
                </Typography>
              </Box>
              <Typography sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, fontWeight: 800, color: dayColor, mb: 0.5, lineHeight: 1.2 }}>
                {duration}
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, color: '#64748b', fontWeight: 500 }}>
                {DAY_SHORT[selectedDay]} • {formatTime(startTime)} – {formatTime(endTime)}
              </Typography>
            </Box>
          )}

          {/* Apply to Multiple Days - Premium Design */}
          {!initialData && (
            <Box sx={{ 
              mt: 3, 
              pt: 3, 
              borderTop: '1px solid #f1f5f9',
            }}>
              {/* Toggle Section */}
              <Box 
                onClick={() => {
                  setApplyToMultipleDays(!applyToMultipleDays);
                  if (applyToMultipleDays) setSelectedDays([]);
                }}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: applyToMultipleDays ? alpha(dayColor, 0.08) : '#f8fafc',
                  border: `1px solid ${applyToMultipleDays ? alpha(dayColor, 0.2) : '#e2e8f0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  mb: applyToMultipleDays ? 2 : 0,
                  '&:hover': {
                    bgcolor: applyToMultipleDays ? alpha(dayColor, 0.12) : '#f1f5f9',
                    borderColor: applyToMultipleDays ? alpha(dayColor, 0.3) : '#cbd5e1',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      bgcolor: applyToMultipleDays ? dayColor : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${applyToMultipleDays ? dayColor : '#e2e8f0'}`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Calendar 
                      size={18} 
                      color={applyToMultipleDays ? '#ffffff' : '#94a3b8'} 
                      strokeWidth={2.5} 
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ 
                      fontSize: '0.875rem', 
                      fontWeight: 700, 
                      color: '#334155',
                      mb: 0.25,
                    }}>
                      Apply to other days
                    </Typography>
                    <Typography sx={{ 
                      fontSize: '0.75rem', 
                      color: '#64748b',
                      fontWeight: 500,
                    }}>
                      {applyToMultipleDays 
                        ? `${selectedDays.length} day${selectedDays.length !== 1 ? 's' : ''} selected`
                        : 'Select additional days for this time slot'
                      }
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: 44,
                    height: 24,
                    borderRadius: '12px',
                    bgcolor: applyToMultipleDays ? dayColor : '#cbd5e1',
                    position: 'relative',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 2,
                      left: applyToMultipleDays ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: '#ffffff',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    },
                  }}
                />
              </Box>

              {/* Day Selection Grid - Premium */}
              {applyToMultipleDays && (
                <Box>
                  <Typography sx={{ 
                    fontSize: '0.6875rem', 
                    fontWeight: 700, 
                    color: '#64748b', 
                    mb: 1.5,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Select Days
                  </Typography>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(6, 1fr)' },
                    gap: { xs: 0.75, sm: 1 },
                  }}>
                    {daysOfWeek
                      .filter(day => day !== selectedDay)
                      .map((day) => {
                        const isSelected = selectedDays.includes(day);
                        const color = DAY_COLORS[day];
                        return (
                          <Button
                            key={day}
                            onClick={() => handleDayToggle(day)}
                            sx={{
                              width: '100%',
                              height: { xs: 56, sm: 64 },
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 0.5,
                              bgcolor: isSelected ? color : '#ffffff',
                              color: isSelected ? '#ffffff' : '#475569',
                              fontWeight: 700,
                              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                              border: `2px solid ${isSelected ? color : '#e2e8f0'}`,
                              boxShadow: isSelected 
                                ? `0 4px 12px ${alpha(color, 0.25)}` 
                                : '0 1px 2px rgba(0,0,0,0.04)',
                              transition: 'all 0.2s ease',
                              textTransform: 'none',
                              position: 'relative',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: isSelected ? color : alpha(color, 0.08),
                                borderColor: isSelected ? color : color,
                                transform: 'translateY(-2px)',
                                boxShadow: isSelected 
                                  ? `0 6px 16px ${alpha(color, 0.3)}` 
                                  : `0 4px 12px ${alpha(color, 0.15)}`,
                              },
                              '&:active': {
                                transform: 'translateY(0)',
                              },
                            }}
                          >
                            {/* Day Indicator */}
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: isSelected ? alpha('#ffffff', 0.3) : color,
                                opacity: isSelected ? 1 : 0.6,
                              }}
                            />
                            {/* Day Name */}
                            <Typography
                              sx={{
                                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                                fontWeight: 700,
                                lineHeight: 1.2,
                              }}
                            >
                              {DAY_SHORT[day]}
                            </Typography>
                            {/* Check Icon */}
                            {isSelected && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  bgcolor: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: `0 2px 4px ${alpha(color, 0.3)}`,
                                }}
                              >
                                <Check size={12} color={color} strokeWidth={3} />
                              </Box>
                            )}
                          </Button>
                        );
                      })}
                  </Box>
                  
                  {/* Selection Summary - Premium Card */}
                  {selectedDays.length > 0 && (
                    <Box
                      sx={{
                        mt: 2.5,
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: '14px',
                        background: `linear-gradient(135deg, ${alpha(dayColor, 0.12)} 0%, ${alpha(dayColor, 0.06)} 100%)`,
                        border: `1.5px solid ${alpha(dayColor, 0.25)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: `linear-gradient(90deg, ${dayColor} 0%, ${alpha(dayColor, 0.5)} 100%)`,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.25, sm: 1.5 } }}>
                        {/* Icon Badge */}
                        <Box
                          sx={{
                            width: { xs: 40, sm: 44 },
                            height: { xs: 40, sm: 44 },
                            borderRadius: '12px',
                            background: `linear-gradient(135deg, ${dayColor} 0%, ${alpha(dayColor, 0.9)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: `0 4px 12px ${alpha(dayColor, 0.3)}`,
                          }}
                        >
                          <Check size={18} color="#ffffff" strokeWidth={3} />
                        </Box>
                        
                        {/* Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography sx={{ 
                              fontSize: { xs: '0.875rem', sm: '0.9375rem' }, 
                              fontWeight: 700, 
                              color: '#334155',
                            }}>
                              {selectedDays.length} Day{selectedDays.length !== 1 ? 's' : ''} Selected
                            </Typography>
                            <Box
                              sx={{
                                px: 1,
                                py: 0.25,
                                borderRadius: '6px',
                                bgcolor: dayColor,
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <Typography sx={{ 
                                fontSize: '0.6875rem', 
                                fontWeight: 700, 
                                color: '#ffffff',
                              }}>
                                {selectedDays.length}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography sx={{ 
                            fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                            color: '#64748b',
                            fontWeight: 500,
                            mb: 1.5,
                            lineHeight: 1.5,
                          }}>
                            This time slot will be applied to the following days:
                          </Typography>
                          
                          {/* Selected Days Pills */}
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 0.75, 
                            flexWrap: 'wrap',
                          }}>
                            {selectedDays.map((day) => {
                              const color = DAY_COLORS[day];
                              return (
                                <Box
                                  key={day}
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    px: { xs: 1.25, sm: 1.5 },
                                    py: { xs: 0.625, sm: 0.75 },
                                    borderRadius: '8px',
                                    bgcolor: color,
                                    boxShadow: `0 2px 6px ${alpha(color, 0.25)}`,
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      transform: 'translateY(-1px)',
                                      boxShadow: `0 4px 10px ${alpha(color, 0.35)}`,
                                    },
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 4,
                                      height: 4,
                                      borderRadius: '50%',
                                      bgcolor: alpha('#ffffff', 0.4),
                                    }}
                                  />
                                  <Typography sx={{ 
                                    fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                                    fontWeight: 700, 
                                    color: '#ffffff',
                                  }}>
                                    {DAY_SHORT[day]}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      </Box>
                      
                      {/* Info Footer */}
                      <Box sx={{ 
                        mt: 1.5,
                        pt: 1.5,
                        borderTop: `1px solid ${alpha(dayColor, 0.15)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                      }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '6px',
                            bgcolor: alpha(dayColor, 0.15),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Calendar size={12} color={dayColor} strokeWidth={2.5} />
                        </Box>
                        <Typography sx={{ 
                          fontSize: '0.6875rem', 
                          color: '#64748b',
                          fontWeight: 500,
                          lineHeight: 1.4,
                        }}>
                          Days with existing overlapping slots will be automatically skipped
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Actions - Enhanced */}
      <Box sx={{ 
        px: { xs: 2, sm: 3 }, 
        py: { xs: 2, sm: 2.5 }, 
        borderTop: '1px solid #f1f5f9', 
        display: 'flex', 
        gap: { xs: 1.25, sm: 1.5 },
        bgcolor: '#fafafa',
      }}>
        <Button
          fullWidth
          onClick={onClose}
          sx={{ 
            py: { xs: 1.25, sm: 1.5 }, 
            borderRadius: '12px', 
            fontWeight: 600, 
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            color: '#64748b', 
            bgcolor: '#f1f5f9', 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': { 
              bgcolor: '#e2e8f0',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={!duration}
          sx={{
            py: { xs: 1.25, sm: 1.5 },
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            bgcolor: dayColor,
            boxShadow: 'none',
            cursor: duration ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            '&:hover:not(:disabled)': { 
              bgcolor: alpha(dayColor, 0.9), 
              boxShadow: `0 4px 12px ${alpha(dayColor, 0.3)}`,
              transform: 'translateY(-1px)',
            },
            '&:active:not(:disabled)': {
              transform: 'translateY(0)',
            },
            '&:disabled': { 
              bgcolor: '#e2e8f0', 
              color: '#94a3b8',
              cursor: 'not-allowed',
            },
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

export default React.memo(TimeSlotDialog);

