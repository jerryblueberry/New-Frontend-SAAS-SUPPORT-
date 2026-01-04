// src/components/WorkerAvailabilityOnboarding/components/TimerPicker.jsx
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Clock } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { formatTime } from '../utils/timeSlotUtils';

/**
 * TimerPicker Component
 * 
 * A premium time picker component with:
 * - Large time display
 * - AM/PM toggle
 * - Hour and minute selectors
 * - Quick time presets (desktop)
 * - Validation support
 * - Responsive design
 * 
 * @param {string} label - Label for the time picker
 * @param {string} value - Time value in 24-hour format (HH:mm)
 * @param {function} onChange - Callback when time changes (receives HH:mm string)
 * @param {string} color - Theme color for the picker
 * @param {string} minTime - Minimum allowed time (HH:mm format, optional)
 * @param {string} maxTime - Maximum allowed time (HH:mm format, optional)
 * @param {node} icon - Custom icon (optional)
 * @param {boolean} disabled - Whether the picker is disabled
 * @param {boolean} compact - Whether to use compact layout
 * @param {function} onValidationChange - Callback for validation errors (optional)
 */
const TimerPicker = ({ 
  label, 
  value, 
  onChange, 
  color, 
  minTime, 
  maxTime, 
  icon, 
  disabled = false, 
  compact = false, 
  onValidationChange 
}) => {
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
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      '&:hover': !disabled ? {
                        bgcolor: isSelected ? color : alpha(color, 0.1),
                        borderColor: color,
                      } : {},
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
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      '&:hover': !disabled ? {
                        bgcolor: isSelected ? color : alpha(color, 0.1),
                        borderColor: color,
                      } : {},
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
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        '&:hover': !disabled ? {
                          bgcolor: isSelected ? color : alpha(color, 0.1),
                          borderColor: color,
                        } : {},
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

export default React.memo(TimerPicker);

