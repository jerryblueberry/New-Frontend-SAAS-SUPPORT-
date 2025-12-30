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
  Menu,
  MenuItem,
  Chip,
  Checkbox,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { Clock, Plus, Check, Calendar } from 'lucide-react';
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

// Format condensed time ranges for weekly overview
const formatTimeRange = (slots) => {
  if (!slots || slots.length === 0) return null;
  const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const ranges = sorted.map(slot => `${formatTimeShort(slot.startTime)}–${formatTimeShort(slot.endTime)}`);
  return ranges.join(', ');
};

// Check if slot overlaps with existing slots for a given day
const wouldOverlap = (slot, existingSlots, excludeIndex = null) => {
  return existingSlots?.some((existing, idx) => {
    if (excludeIndex !== null && idx === excludeIndex) return false;
    if (existing.dayOfWeek !== slot.dayOfWeek) return false;
    return slot.startTime < existing.endTime && slot.endTime > existing.startTime;
  });
};

// Time presets
const TIME_PRESETS = [
  { label: 'Morning', startTime: '08:00', endTime: '12:00' },
  { label: 'Full Day', startTime: '09:00', endTime: '17:00' },
  { label: 'Afternoon', startTime: '12:00', endTime: '17:00' },
  { label: 'Evening', startTime: '17:00', endTime: '21:00' },
];

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

// Timer-based Time Picker Component - Compact & Responsive with Validation
const TimerPicker = ({ label, value, onChange, color, minTime, maxTime, icon, disabled = false, compact = false, onValidationChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Safely parse time value with defaults
  const parseTime = useCallback((timeValue) => {
    if (!timeValue || typeof timeValue !== 'string') return { hours: 9, minutes: 0 };
    const parts = timeValue.split(':');
    if (parts.length !== 2) return { hours: 9, minutes: 0 };
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return { hours: 9, minutes: 0 };
    if (h < 0 || h > 23 || m < 0 || m > 59) return { hours: 9, minutes: 0 };
    return { hours: h, minutes: m };
  }, []);

  const { hours, minutes } = parseTime(value);
  const isPM = hours >= 12;
  const displayHour = hours % 12 || 12;
  
  const updateTime = useCallback((newHours, newMinutes, skipValidation = false) => {
    // Validate inputs
    const h = Number(newHours);
    const m = Number(newMinutes);
    if (isNaN(h) || isNaN(m)) return;
    if (h < 0 || h > 23 || m < 0 || m > 59) return;
    
    const time24 = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    
    // Validate against min/max constraints
    if (minTime && time24 < minTime) {
      if (onValidationChange) onValidationChange(`Time must be after ${formatTime(minTime)}`);
      return;
    }
    if (maxTime && time24 > maxTime) {
      if (onValidationChange) onValidationChange(`Time must be before ${formatTime(maxTime)}`);
      return;
    }
    
    // Clear validation error if time is valid
    if (onValidationChange && !skipValidation) {
      onValidationChange(null);
    }
    
    onChange(time24);
  }, [onChange, minTime, maxTime, onValidationChange]);

  const handleHourChange = useCallback((newHour) => {
    // Convert 12-hour format to 24-hour format
    let hour24;
    if (isPM) {
      // PM: 12 PM = 12, 1-11 PM = 13-23
      hour24 = newHour === 12 ? 12 : newHour + 12;
    } else {
      // AM: 12 AM = 0, 1-11 AM = 1-11
      hour24 = newHour === 12 ? 0 : newHour;
    }
    updateTime(hour24, minutes);
  }, [isPM, minutes, updateTime]);

  const handleMinuteChange = useCallback((newMinute) => {
    updateTime(hours, newMinute);
  }, [hours, updateTime]);

  const handleAMPMToggle = useCallback((targetPeriod) => {
    // Switch to specific AM/PM period - preserve display hour with validation
    if (disabled) return;
    
    const currentIsPM = hours >= 12;
    const targetIsPM = targetPeriod === 'PM';
    
    // If already in the target period, no change needed
    if (currentIsPM === targetIsPM) return;
    
    // Get the current display hour (1-12)
    const currentDisplayHour = displayHour;
    let newHour;
    
    if (targetPeriod === 'AM') {
      // Converting to AM - preserve display hour
      if (currentDisplayHour === 12) {
        newHour = 0; // 12 -> 12 AM (midnight = 0)
      } else {
        newHour = currentDisplayHour; // 1-11 -> 1-11 AM
      }
    } else {
      // Converting to PM - preserve display hour
      if (currentDisplayHour === 12) {
        newHour = 12; // 12 -> 12 PM (noon = 12)
      } else {
        newHour = currentDisplayHour + 12; // 1-11 -> 13-23 PM
      }
    }
    
    // Validate and update (skip validation here, will be validated by parent)
    if (newHour >= 0 && newHour <= 23) {
      const newTime24 = `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      
      // Check min/max constraints
      if (minTime && newTime24 < minTime) {
        if (onValidationChange) {
          onValidationChange(`Cannot switch to ${targetPeriod} - time would be before ${formatTime(minTime)}`);
        }
        return;
      }
      if (maxTime && newTime24 > maxTime) {
        if (onValidationChange) {
          onValidationChange(`Cannot switch to ${targetPeriod} - time would be after ${formatTime(maxTime)}`);
        }
        return;
      }
      
      // Clear validation and update
      if (onValidationChange) onValidationChange(null);
      updateTime(newHour, minutes, true);
    }
  }, [hours, minutes, displayHour, updateTime, disabled, minTime, maxTime, onValidationChange]);

  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = [0, 15, 30, 45];

  return (
    <Box>
      {/* Header - Compact */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: compact ? 1.5 : 2 }}>
        <Box
          sx={{
            width: compact ? 32 : 36,
            height: compact ? 32 : 36,
            borderRadius: '10px',
            bgcolor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon || <Clock size={compact ? 16 : 18} color={color} strokeWidth={2.5} />}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: compact ? '0.75rem' : '0.8125rem', fontWeight: 700, color: '#334155', mb: 0.25 }}>
            {label}
          </Typography>
          {!compact && (
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b' }}>
              Select time
            </Typography>
          )}
        </Box>
      </Box>

      {/* Timer Display - Compact Design */}
      <Box
        sx={{
          p: compact ? { xs: 2, sm: 2.5 } : { xs: 2.5, sm: 3 },
          borderRadius: '16px',
          bgcolor: disabled ? alpha('#f1f5f9', 0.5) : '#fafafa',
          border: `1px solid ${disabled ? alpha('#e2e8f0', 0.5) : alpha(color, 0.1)}`,
          textAlign: 'center',
          opacity: disabled ? 0.6 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          position: 'relative',
        }}
      >
        {disabled && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1,
              textAlign: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: 600 }}>
              Select start time first
            </Typography>
          </Box>
        )}
        {/* Large Time Display with Clean AM/PM Toggle */}
        <Box sx={{ mb: compact ? 1.5 : 2 }}>
          {/* Time Display */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'baseline', 
            justifyContent: 'center', 
            gap: 0.5,
            mb: 1.75,
          }}>
            <Typography
              sx={{
                fontSize: compact ? { xs: '2.5rem', sm: '2.75rem' } : { xs: '3rem', sm: '3.5rem' },
                fontWeight: 800,
                color: color,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(displayHour || 9).padStart(2, '0')}
            </Typography>
            <Typography
              sx={{
                fontSize: compact ? { xs: '1.75rem', sm: '2rem' } : { xs: '2rem', sm: '2.5rem' },
                fontWeight: 700,
                color: alpha(color, 0.6),
                lineHeight: 1,
              }}
            >
              :
            </Typography>
            <Typography
              sx={{
                fontSize: compact ? { xs: '2.5rem', sm: '2.75rem' } : { xs: '3rem', sm: '3.5rem' },
                fontWeight: 800,
                color: color,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(minutes || 0).padStart(2, '0')}
            </Typography>
          </Box>
          
          {/* AM/PM Segmented Control - Clean SaaS Design */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f8fafc',
              borderRadius: '10px',
              p: 0.5,
              border: `1px solid #e2e8f0`,
              gap: 0.5,
              maxWidth: 160,
              mx: 'auto',
            }}
          >
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAMPMToggle('AM');
              }}
              disabled={disabled}
              sx={{
                flex: 1,
                height: { xs: 38, sm: 42 },
                borderRadius: '8px',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 700,
                color: !isPM ? '#fff' : '#64748b',
                bgcolor: !isPM ? color : 'transparent',
                textTransform: 'uppercase',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: !isPM ? `0 2px 4px ${alpha(color, 0.2)}` : 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                '&:hover': !disabled ? {
                  bgcolor: !isPM ? color : alpha(color, 0.12),
                  transform: 'translateY(-1px)',
                } : {},
                '&:active': !disabled ? {
                  transform: 'translateY(0)',
                } : {},
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                },
              }}
            >
              AM
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAMPMToggle('PM');
              }}
              disabled={disabled}
              sx={{
                flex: 1,
                height: { xs: 38, sm: 42 },
                borderRadius: '8px',
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 700,
                color: isPM ? '#fff' : '#64748b',
                bgcolor: isPM ? color : 'transparent',
                textTransform: 'uppercase',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isPM ? `0 2px 4px ${alpha(color, 0.2)}` : 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                '&:hover': !disabled ? {
                  bgcolor: isPM ? color : alpha(color, 0.12),
                  transform: 'translateY(-1px)',
                } : {},
                '&:active': !disabled ? {
                  transform: 'translateY(0)',
                } : {},
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                },
              }}
            >
              PM
            </Button>
          </Box>
        </Box>

        {/* Selectors - Responsive Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: compact 
            ? { xs: '1fr 1fr', sm: '1fr 1fr' } 
            : { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, 
          gap: compact ? { xs: 1, sm: 1.25 } : { xs: 1.5, sm: 2 } 
        }}>
          {/* Hour Selector with AM/PM Context */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hour
              </Typography>
              <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: isPM ? color : '#94a3b8', textTransform: 'uppercase' }}>
                {isPM ? 'PM' : 'AM'}
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 0.5,
                p: compact ? 0.75 : 1,
                borderRadius: '12px',
                bgcolor: '#f8fafc',
                maxHeight: compact ? { xs: 120, sm: 140 } : { xs: 140, sm: 160 },
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: alpha(color, 0.3),
                  borderRadius: '2px',
                },
              }}
            >
              {hourOptions.map((hour) => {
                const isSelected = displayHour === hour;
                return (
                  <Button
                    key={hour}
                    onClick={() => handleHourChange(hour)}
                    disabled={disabled}
                    sx={{
                      minWidth: compact ? { xs: 40, sm: 44 } : { xs: 44, sm: 48 },
                      height: compact ? { xs: 36, sm: 40 } : { xs: 40, sm: 44 },
                      borderRadius: '8px',
                      fontSize: compact ? { xs: '0.8125rem', sm: '0.875rem' } : { xs: '0.875rem', sm: '0.9375rem' },
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? '#fff' : '#475569',
                      bgcolor: isSelected ? color : 'transparent',
                      border: isSelected ? `2px solid ${color}` : '2px solid transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? color : alpha(color, 0.1),
                        borderColor: color,
                      },
                    }}
                  >
                    {hour}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Minute Selector */}
          <Box>
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Minutes
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                p: compact ? 0.75 : 1,
                borderRadius: '12px',
                bgcolor: '#f8fafc',
              }}
            >
              {minuteOptions.map((minute) => {
                const isSelected = minutes === minute;
                return (
                  <Button
                    key={minute}
                    onClick={() => handleMinuteChange(minute)}
                    disabled={disabled}
                    sx={{
                      width: '100%',
                      height: compact ? { xs: 36, sm: 40 } : { xs: 40, sm: 44 },
                      borderRadius: '8px',
                      fontSize: compact ? { xs: '0.8125rem', sm: '0.875rem' } : { xs: '0.875rem', sm: '0.9375rem' },
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? '#fff' : '#475569',
                      bgcolor: isSelected ? color : 'transparent',
                      border: isSelected ? `2px solid ${color}` : '2px solid transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected ? color : alpha(color, 0.1),
                        borderColor: color,
                      },
                    }}
                  >
                    {String(minute).padStart(2, '0')}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Quick Times (Desktop only when not compact) */}
          {!isMobile && !compact && (
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {[
                  { label: '6:00', h: 6, m: 0 },
                  { label: '9:00', h: 9, m: 0 },
                  { label: '12:00', h: 12, m: 0 },
                  { label: '17:00', h: 17, m: 0 },
                ].map((quick) => {
                  const isSelected = hours === quick.h && minutes === quick.m;
                  return (
                    <Button
                      key={quick.label}
                      onClick={() => updateTime(quick.h, quick.m)}
                      disabled={disabled}
                      sx={{
                        width: '100%',
                        height: 40,
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: isSelected ? 700 : 600,
                        color: isSelected ? '#fff' : '#475569',
                        bgcolor: isSelected ? color : '#f8fafc',
                        border: isSelected ? `2px solid ${color}` : '2px solid #e2e8f0',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: isSelected ? color : alpha(color, 0.1),
                          borderColor: color,
                        },
                      }}
                    >
                      {quick.label}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

TimerPicker.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  minTime: PropTypes.string,
  maxTime: PropTypes.string,
  icon: PropTypes.node,
  disabled: PropTypes.bool,
  compact: PropTypes.bool,
  onValidationChange: PropTypes.func,
};

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

// Weekly Overview Component (Read-Only)
const WeeklyOverview = ({ groupedSlots }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        mb: 2.5,
        p: 1.5,
        borderRadius: '10px',
        bgcolor: '#fafafa',
        border: '1px solid #f1f5f9',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          color: '#64748b',
          mb: 1.25,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Weekly Overview
      </Typography>
      <Stack spacing={0.75}>
        {daysOfWeek.map((day) => {
          const daySlots = groupedSlots[day] || [];
          const dayColor = DAY_COLORS[day];
          const timeRange = formatTimeRange(daySlots);
          const isUnavailable = daySlots.length === 0;

          return (
            <Box
              key={day}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.75,
                px: 1,
                borderRadius: '6px',
                bgcolor: isUnavailable ? '#f8fafc' : 'transparent',
                border: isUnavailable ? '1px solid #e2e8f0' : 'none',
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  bgcolor: isUnavailable ? '#cbd5e1' : dayColor,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isUnavailable ? '#94a3b8' : '#334155',
                  minWidth: isMobile ? 60 : 80,
                  flexShrink: 0,
                }}
              >
                {DAY_SHORT[day]}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: isUnavailable ? '#94a3b8' : '#64748b',
                  fontStyle: isUnavailable ? 'italic' : 'normal',
                  flex: 1,
                }}
              >
                {isUnavailable ? 'Unavailable' : timeRange}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

WeeklyOverview.propTypes = {
  groupedSlots: PropTypes.object.isRequired,
};

// Bulk Actions Component
const BulkActions = ({ customTimeSlots, onBulkAction, disabled }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyMondayToWeekdays = () => {
    const mondaySlots = customTimeSlots?.filter(slot => slot.dayOfWeek === 'Monday') || [];
    if (mondaySlots.length === 0) {
      handleClose();
      return;
    }

    const weekdays = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const newSlots = [];

    weekdays.forEach(day => {
      mondaySlots.forEach(slot => {
        const newSlot = { ...slot, dayOfWeek: day };
        if (!wouldOverlap(newSlot, customTimeSlots)) {
          newSlots.push(newSlot);
        }
      });
    });

    if (newSlots.length > 0) {
      onBulkAction(newSlots);
    }
    handleClose();
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all availability? This cannot be undone.')) {
      // Remove from end to beginning to avoid index shifting issues
      const indicesToRemove = customTimeSlots?.map((_, idx) => idx).reverse() || [];
      indicesToRemove.forEach(idx => onBulkAction({ type: 'remove', index: idx }));
    }
    handleClose();
  };

  const handleMarkWeekendsUnavailable = () => {
    const weekendIndices = customTimeSlots
      ?.map((slot, idx) => (slot.dayOfWeek === 'Saturday' || slot.dayOfWeek === 'Sunday') ? idx : null)
      .filter(idx => idx !== null) || [];
    
    if (weekendIndices.length === 0) {
      handleClose();
      return;
    }

    // Remove from end to beginning to avoid index shifting issues
    weekendIndices.reverse().forEach(idx => onBulkAction({ type: 'remove', index: idx }));
    handleClose();
  };

  const hasSlots = customTimeSlots?.length > 0;
  const hasMondaySlots = customTimeSlots?.some(slot => slot.dayOfWeek === 'Monday');

  return (
    <>
      <Tooltip title="Bulk actions">
        <IconButton
          onClick={handleClick}
          disabled={disabled || !hasSlots}
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#f1f5f9',
            '&:hover': { bgcolor: '#e2e8f0' },
            '&:disabled': { bgcolor: '#f8fafc', color: '#cbd5e1' },
          }}
        >
          <ContentCopyIcon sx={{ fontSize: 16, color: '#64748b' }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            mt: 0.5,
            minWidth: 200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
      >
        <MenuItem
          onClick={handleCopyMondayToWeekdays}
          disabled={!hasMondaySlots}
          sx={{ fontSize: '0.8125rem', py: 1 }}
        >
          Copy Monday to Weekdays
        </MenuItem>
        <MenuItem
          onClick={handleMarkWeekendsUnavailable}
          disabled={!customTimeSlots?.some(slot => slot.dayOfWeek === 'Saturday' || slot.dayOfWeek === 'Sunday')}
          sx={{ fontSize: '0.8125rem', py: 1 }}
        >
          Mark Weekends Unavailable
        </MenuItem>
        <MenuItem
          onClick={handleClearAll}
          sx={{ fontSize: '0.8125rem', py: 1, color: '#ef4444' }}
        >
          Clear All Availability
        </MenuItem>
      </Menu>
    </>
  );
};

BulkActions.propTypes = {
  customTimeSlots: PropTypes.array,
  onBulkAction: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
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
  const [selectedDays, setSelectedDays] = useState([]);
  const [applyToMultipleDays, setApplyToMultipleDays] = useState(false);

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

  const handleDayToggle = useCallback((day) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      }
      return [...prev, day];
    });
  }, []);

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
            '&:hover': { bgcolor: '#e2e8f0' } 
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
              {errors.startTime && (
                <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem', py: 0.5 }}>
                  {errors.startTime}
                </Alert>
              )}
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
              {errors.endTime && (
                <Alert severity="error" sx={{ mt: 1, fontSize: '0.75rem', py: 0.5 }}>
                  {errors.endTime}
                </Alert>
              )}
            </Box>
          </Box>

          {/* Validation Error Display */}
          {errors.time && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: '10px',
                fontSize: '0.8125rem',
                '& .MuiAlert-icon': {
                  fontSize: '1.125rem',
                },
              }}
            >
              {errors.time}
            </Alert>
          )}

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

          {errors.time && (
            <Alert 
              severity={errors.time.includes('Skipped') ? 'warning' : 'error'} 
              sx={{ mt: 2, borderRadius: '8px', py: 0.25 }}
            >
              {errors.time}
            </Alert>
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
            '&:hover': { bgcolor: '#e2e8f0' } 
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
            '&:hover': { 
              bgcolor: alpha(dayColor, 0.9), 
              boxShadow: `0 4px 12px ${alpha(dayColor, 0.3)}`,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
            transition: 'all 0.2s ease',
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

  const handleBulkAction = useCallback((action) => {
    if (action.type === 'remove') {
      onRemoveSlot(action.index);
    } else if (Array.isArray(action)) {
      // Multiple slots to add
      action.forEach(slot => onAddSlot(slot));
    }
  }, [onAddSlot, onRemoveSlot]);

  return (
    <Box>
      {/* Weekly Overview */}
      <WeeklyOverview groupedSlots={groupedSlots} />

      {/* Header Row - Enhanced & Responsive */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: { xs: 2, sm: 2.5 },
        flexWrap: 'wrap',
        gap: { xs: 1.25, sm: 1.5 },
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          flex: { xs: '1 1 100%', sm: '0 1 auto' },
          minWidth: 0,
        }}>
          {totalSlots > 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.75, 
              px: { xs: 1.25, sm: 1.5 }, 
              py: { xs: 0.625, sm: 0.75 }, 
              borderRadius: '10px', 
              bgcolor: '#eff6ff',
              border: '1px solid #dbeafe',
              boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)',
            }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  bgcolor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                }}
              >
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </Box>
              <Box>
                <Typography sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                  fontWeight: 700, 
                  color: '#1e40af',
                  lineHeight: 1.2,
                }}>
                  {totalSlots} Time Slot{totalSlots > 1 ? 's' : ''}
                </Typography>
                <Typography sx={{ 
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' }, 
                  fontWeight: 500,
                  color: '#3b82f6',
                  lineHeight: 1.2,
                }}>
                  {activeDays} Active Day{activeDays > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.75, 
              px: { xs: 1.25, sm: 1.5 }, 
              py: { xs: 0.625, sm: 0.75 }, 
              borderRadius: '10px', 
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  bgcolor: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Clock size={14} color="#64748b" strokeWidth={2.5} />
              </Box>
              <Typography sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                fontWeight: 600, 
                color: '#64748b',
              }}>
                No slots added yet
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0.75, sm: 1 },
          flex: { xs: '1 1 100%', sm: '0 1 auto' },
          justifyContent: { xs: 'flex-end', sm: 'flex-start' },
        }}>
          {totalSlots > 0 && (
            <BulkActions
              customTimeSlots={customTimeSlots}
              onBulkAction={handleBulkAction}
              disabled={disabled}
            />
          )}
          <Button
            variant="contained"
            startIcon={<Plus size={16} strokeWidth={2.5} />}
            onClick={handleAddSlot}
            disabled={disabled}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              px: { xs: 1.75, sm: 2 },
              py: { xs: 0.875, sm: 1 },
              bgcolor: '#3b82f6',
              boxShadow: 'none',
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': { 
                bgcolor: '#2563eb', 
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            Add Slot
          </Button>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', py: 0.25 }}>
          {error}
        </Alert>
      )}

      {/* Slots Grid - Only show when there are slots */}
      {totalSlots > 0 && (
        <Stack spacing={1.5}>
          {daysOfWeek.map((day) => {
            const daySlots = groupedSlots[day] || [];
            if (daySlots.length === 0) return null;
            const dayColor = DAY_COLORS[day];
            return (
              <Box
                key={day}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    borderColor: alpha(dayColor, 0.2),
                },
                }}
              >
                {/* Day header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: dayColor,
                      boxShadow: `0 2px 4px ${alpha(dayColor, 0.3)}`,
                    }} 
                  />
                  <Typography sx={{ 
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
                    fontWeight: 700, 
                    color: '#334155' 
                  }}>
                    {day}
                  </Typography>
                  <Box
                    sx={{
                      ml: 'auto',
                      px: 1,
                      py: 0.375,
                      borderRadius: '6px',
                      bgcolor: alpha(dayColor, 0.1),
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ 
                      fontSize: { xs: '0.6875rem', sm: '0.75rem' }, 
                      fontWeight: 600,
                      color: dayColor,
                    }}>
                      {groupedSlots[day].length} slot{groupedSlots[day].length > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>

                {/* Slots */}
                <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 }, flexWrap: 'wrap' }}>
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
          }).filter(Boolean)}
        </Stack>
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
