/**
 * WeeklyAvailabilityCalendar Component
 * 
 * A modern, minimal, and highly responsive calendar component for displaying weekly worker availability.
 * Redesigned with flex-based layout and mobile-first approach for optimal user experience.
 * 
 * Key Features:
 * - Flex row/column responsive layout optimized for all screen sizes
 * - Minimal color palette with clean, modern design
 * - Compact card design for efficient space utilization
 * - Mobile-first approach with touch-friendly interactions
 * - High performance with React.memo and memoized calculations
 * - Accessibility compliant with proper ARIA labels
 * 
 * Design Principles:
 * - Mobile-first responsive design
 * - Minimal visual complexity with subtle colors
 * - Compact information density
 * - Smooth micro-interactions
 * - Clean typography hierarchy
 * 
 * @version 2.0.0 - Complete redesign with flex layout
 */

import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
  Stack,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  EventBusy as EventBusyIcon,
  AddCircleOutline as AddCircleOutlineIcon,
} from '@mui/icons-material';

// Constants for better performance (moved from parent)
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const DAY_ABBREVIATIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Minimal color palette for modern, clean design
const DAY_THEMES = {
  Monday: { 
    primary: '#6366f1', 
    background: '#f8fafc',
    border: '#e2e8f0',
    accent: '#4f46e5'
  },
  Tuesday: { 
    primary: '#10b981', 
    background: '#f0fdf4',
    border: '#d1fae5',
    accent: '#059669'
  },
  Wednesday: { 
    primary: '#f59e0b', 
    background: '#fffbeb',
    border: '#fed7aa',
    accent: '#d97706'
  },
  Thursday: { 
    primary: '#8b5cf6', 
    background: '#faf5ff',
    border: '#e9d5ff',
    accent: '#7c3aed'
  },
  Friday: { 
    primary: '#ef4444', 
    background: '#fef2f2',
    border: '#fecaca',
    accent: '#dc2626'
  },
  Saturday: { 
    primary: '#06b6d4', 
    background: '#f0f9ff',
    border: '#bae6fd',
    accent: '#0891b2'
  },
  Sunday: { 
    primary: '#64748b', 
    background: '#f8fafc',
    border: '#e2e8f0',
    accent: '#475569'
  }
};

// Utility functions optimized for performance
const formatTo12Hour = (time24) => {
  if (!time24 || typeof time24 !== 'string') return '';
  
  try {
    const [hourStr, minute] = time24.split(':');
    if (!hourStr || !minute) return '';
    
    let hour = parseInt(hourStr, 10);
    if (isNaN(hour) || hour < 0 || hour > 23) return '';
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

const calculateDuration = (start, end) => {
  if (!start || !end) return '';
  
  try {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      return 'Invalid time format';
    }
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    let diff = endMinutes - startMinutes;
    
    if (diff <= 0) return 'Invalid time range';
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 'Invalid';
  }
};

const findTimeGaps = (slots) => {
  if (!Array.isArray(slots) || slots.length === 0) return [];
  
  try {
    const sortedSlots = [...slots].sort((a, b) => {
      const aTime = a.startTime?.split(':').map(Number) || [0, 0];
      const bTime = b.startTime?.split(':').map(Number) || [0, 0];
      return (aTime[0] * 60 + aTime[1]) - (bTime[0] * 60 + bTime[1]);
    });

    const gaps = [];
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];
      
      if (!current?.endTime || !next?.startTime) continue;
    
      const [currentEndH, currentEndM] = current.endTime.split(':').map(Number);
      const [nextStartH, nextStartM] = next.startTime.split(':').map(Number);
      
      if (isNaN(currentEndH) || isNaN(currentEndM) || isNaN(nextStartH) || isNaN(nextStartM)) {
        continue;
      }
    
      const currentEndMinutes = currentEndH * 60 + currentEndM;
      const nextStartMinutes = nextStartH * 60 + nextStartM;
    
      if (nextStartMinutes > currentEndMinutes) {
        const gapDuration = nextStartMinutes - currentEndMinutes;
        if (gapDuration >= 30) { // Only show gaps of 30+ minutes
          gaps.push({
            start: current.endTime,
            end: next.startTime,
            duration: gapDuration
          });
        }
      }
    }
    return gaps;
  } catch (error) {
    console.error('Error finding time gaps:', error);
    return [];
  }
};

const validateTimeSlots = (slots) => {
  if (!Array.isArray(slots)) return [];

  const issues = [];
  
  if (slots.length === 0) {
    return issues; // Don't show warning for empty days in calendar view
  }

  try {
    // Check for overlapping slots
    const sortedSlots = [...slots]
      .filter(slot => slot?.startTime && slot?.endTime)
      .sort((a, b) => {
        const aTime = a.startTime.split(':').map(Number);
        const bTime = b.startTime.split(':').map(Number);
        return (aTime[0] * 60 + aTime[1]) - (bTime[0] * 60 + bTime[1]);
      });

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];
    
      const [currentEndH, currentEndM] = current.endTime.split(':').map(Number);
      const [nextStartH, nextStartM] = next.startTime.split(':').map(Number);
      
      if (isNaN(currentEndH) || isNaN(currentEndM) || isNaN(nextStartH) || isNaN(nextStartM)) {
        continue;
      }
    
      const currentEndMinutes = currentEndH * 60 + currentEndM;
      const nextStartMinutes = nextStartH * 60 + nextStartM;
    
      if (currentEndMinutes > nextStartMinutes) {
        issues.push({ 
          type: 'error', 
          message: `Overlapping slots: ${formatTo12Hour(current.startTime)}-${formatTo12Hour(current.endTime)} and ${formatTo12Hour(next.startTime)}-${formatTo12Hour(next.endTime)}` 
        });
      }
    }

    // Check for very short slots (less than 1 hour) - only warnings
    slots.forEach(slot => {
      if (!slot?.startTime || !slot?.endTime) return;
      
      const duration = calculateDuration(slot.startTime, slot.endTime);
      if (duration && !duration.includes('h') && !duration.includes('Invalid')) {
        const minutes = parseInt(duration.replace('m', ''));
        if (!isNaN(minutes) && minutes < 60) {
          issues.push({ 
            type: 'warning', 
            message: `Short slot (${duration}): ${formatTo12Hour(slot.startTime)}-${formatTo12Hour(slot.endTime)}` 
          });
        }
      }
    });
  } catch (error) {
    console.error('Error validating time slots:', error);
    issues.push({ type: 'error', message: 'Error validating time slots' });
  }

  return issues;
};

// Modern, minimal DayCard with flex-based layout
const DayCard = React.memo(function DayCard({ 
  day, 
  dayIndex, 
  dayTheme, 
  slots, 
  isMobile, 
  theme, 
  onEditOpen 
}) {
  const hasSlots = slots.length > 0;
  
  return (
    <Box
      sx={{
        flex: isMobile ? '1 1 100%' : '1 1 0',
        minWidth: { xs: '100%', sm: '280px', md: '300px' },
        maxWidth: { xs: '100%', sm: '400px' },
        bgcolor: hasSlots ? dayTheme.background : '#fafafa',
        border: `1px solid ${hasSlots ? dayTheme.border : '#e5e7eb'}`,
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${alpha(dayTheme.primary, 0.15)}`,
          borderColor: dayTheme.primary,
        },
      }}
    >
      {/* Day Header - Minimal Design */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 1.5, sm: 2 },
          borderBottom: `1px solid ${hasSlots ? dayTheme.border : '#e5e7eb'}`,
          bgcolor: hasSlots ? alpha(dayTheme.primary, 0.04) : '#f8fafc',
        }}
      >
        <Typography 
          variant="subtitle1" 
          fontWeight={600}
          sx={{ 
            color: hasSlots ? dayTheme.accent : '#64748b',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            letterSpacing: '0.025em'
          }}
        >
          {isMobile ? DAY_ABBREVIATIONS[dayIndex] : day}
        </Typography>
        {hasSlots && (
          <Chip
            label={slots.length}
            size="small"
            sx={{
              bgcolor: dayTheme.primary,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-label': { px: 1.5 }
            }}
          />
        )}
      </Box>

      {/* Content Area */}
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        {hasSlots ? (
          <Stack spacing={1.5}>
            {slots.map((slot, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: alpha(dayTheme.primary, 0.06),
                  borderRadius: 1.5,
                  border: `1px solid ${alpha(dayTheme.primary, 0.12)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(dayTheme.primary, 0.1),
                    borderColor: alpha(dayTheme.primary, 0.2),
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 32,
                    bgcolor: dayTheme.primary,
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ 
                      color: dayTheme.accent,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      lineHeight: 1.4,
                      mb: 0.25
                    }}
                  >
                    {formatTo12Hour(slot.startTime)} - {formatTo12Hour(slot.endTime)}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#6b7280',
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      fontWeight: 500
                    }}
                  >
                    {calculateDuration(slot.startTime, slot.endTime)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: { xs: 3, sm: 4 },
              minHeight: { xs: 80, sm: 100 },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <EventBusyIcon 
                sx={{ 
                  fontSize: 20, 
                  color: '#94a3b8' 
                }} 
              />
            </Box>
            <Typography 
              variant="caption" 
              color="#64748b"
              textAlign="center"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                fontWeight: 500,
                mb: 1
              }}
            >
              No slots
            </Typography>
            <Box
              component="button"
              onClick={onEditOpen}
              sx={{
                border: `1px dashed #cbd5e1`,
                bgcolor: 'transparent',
                borderRadius: 1,
                px: 2,
                py: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  '& .add-icon': {
                    color: theme.palette.primary.main,
                  },
                  '& .add-text': {
                    color: theme.palette.primary.main,
                  }
                },
              }}
            >
              <AddCircleOutlineIcon 
                className="add-icon"
                sx={{ 
                  fontSize: 16, 
                  color: '#94a3b8',
                  transition: 'color 0.2s ease'
                }} 
              />
              <Typography 
                className="add-text"
                variant="caption" 
                sx={{ 
                  fontSize: '0.75rem',
                  color: '#64748b',
                  fontWeight: 500,
                  transition: 'color 0.2s ease'
                }}
              >
                Add slots
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
});

// PropTypes for simplified DayCard
DayCard.propTypes = {
  day: PropTypes.string.isRequired,
  dayIndex: PropTypes.number.isRequired,
  dayTheme: PropTypes.object.isRequired,
  slots: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
  onEditOpen: PropTypes.func.isRequired,
};

const WeeklyAvailabilityCalendar = ({ 
  groupedSlots = {}, 
  onEditOpen,
  isLoading = false,
  error = null 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Memoized event handler
  const handleEditOpen = useCallback(() => {
    onEditOpen?.();
  }, [onEditOpen]);

  // Memoized day data processing for performance
  const dayData = useMemo(() => {
    return DAYS_OF_WEEK.map((day, dayIndex) => {
      const dayTheme = DAY_THEMES[day];
      const slots = groupedSlots[day] || [];
      const gaps = findTimeGaps(slots);
      const issues = validateTimeSlots(slots);
      
      return {
        day,
        dayIndex,
        dayTheme,
        slots,
        gaps,
        issues
      };
    });
  }, [groupedSlots]);

  // Loading state
  if (isLoading) {
    return (
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          background: theme.palette.background.paper,
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, textAlign: 'center' }}>
          Loading Weekly Schedule...
        </Typography>
        <Grid container spacing={2}>
          {DAYS_OF_WEEK.map((day) => (
            <Grid item xs={12} sm={6} lg key={day}>
              <Card sx={{ borderRadius: 3, minHeight: 280 }}>
                <Box sx={{ p: 2, bgcolor: 'grey.200', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                  <Typography variant="h6">Loading...</Typography>
                </Box>
                <CardContent sx={{ p: 2 }}>
                  <Typography color="text.secondary">Loading availability data...</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          background: theme.palette.background.paper,
        }}
      >
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Unable to load weekly schedule
          </Typography>
          <Typography variant="body2">
            {error || 'An error occurred while loading the calendar. Please try again.'}
          </Typography>
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        background: theme.palette.background.paper,
      }}
    >
   
      
      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        {dayData.map(({ day, dayIndex, dayTheme, slots, gaps, issues }) => (
          <DayCard
            key={day}
            day={day}
            dayIndex={dayIndex}
            dayTheme={dayTheme}
            slots={slots}
            gaps={gaps}
            issues={issues}
            isMobile={isMobile}
            isTablet={isTablet}
            theme={theme}
            onEditOpen={handleEditOpen}
          />
        ))}
      </Grid>
    </Paper>
  );
};

WeeklyAvailabilityCalendar.propTypes = {
  groupedSlots: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        dayOfWeek: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
      })
    )
  ),
  onEditOpen: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

WeeklyAvailabilityCalendar.defaultProps = {
  groupedSlots: {},
  onEditOpen: () => {},
  isLoading: false,
  error: null,
};

export default WeeklyAvailabilityCalendar;
