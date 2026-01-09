/**
 * TimeslotList Component
 * 
 * A production-ready, responsive list component for displaying detailed worker availability.
 * Extracted from DashboardAvailability following industry best practices for:
 * - Component separation and single responsibility
 * - Performance optimization with React.memo and memoized calculations
 * - Responsive design for mobile, tablet, and desktop
 * - Accessibility features and semantic markup
 * - Error handling and validation
 * - Material-UI design system integration
 * 
 * Features:
 * - Detailed day-by-day schedule overview
 * - Real-time validation with visual feedback
 * - Responsive grid layout for time slots
 * - Mobile-optimized card layouts
 * - Loading and error states
 * - Comprehensive accessibility support
 * 
 * Performance Optimizations:
 * - Memoized DayListCard components to prevent unnecessary re-renders
 * - Optimized utility functions for time formatting and validation
 * - Efficient data processing with memoized calculations
 * - Smart rendering with conditional displays
 * 
 * @version 1.0.0
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
  Stack,
  Alert,
  Chip,
  alpha
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';

// Constants for better performance
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Enhanced day colors with gradients for visual consistency
const DAY_THEMES = {
  Monday: { 
    primary: '#1976d2', 
    gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
    light: '#e3f2fd',
    accent: '#0d47a1'
  },
  Tuesday: { 
    primary: '#388e3c', 
    gradient: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
    light: '#e8f5e8',
    accent: '#1b5e20'
  },
  Wednesday: { 
    primary: '#f57c00', 
    gradient: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
    light: '#fff3e0',
    accent: '#e65100'
  },
  Thursday: { 
    primary: '#7b1fa2', 
    gradient: 'linear-gradient(135deg, #7b1fa2 0%, #ab47bc 100%)',
    light: '#f3e5f5',
    accent: '#4a148c'
  },
  Friday: { 
    primary: '#d32f2f', 
    gradient: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
    light: '#ffebee',
    accent: '#b71c1c'
  },
  Saturday: { 
    primary: '#0288d1', 
    gradient: 'linear-gradient(135deg, #0288d1 0%, #29b6f6 100%)',
    light: '#e1f5fe',
    accent: '#01579b'
  },
  Sunday: { 
    primary: '#5d4037', 
    gradient: 'linear-gradient(135deg, #5d4037 0%, #8d6e63 100%)',
    light: '#efebe9',
    accent: '#3e2723'
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

const validateTimeSlots = (slots) => {
  if (!Array.isArray(slots)) return [];

  const issues = [];
  
  if (slots.length === 0) {
    return issues; // Don't show warning for empty days in list view
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

// Memoized Day List Card Component - Premium Clean Design
const DayListCard = React.memo(function DayListCard({ 
  day, 
  dayTheme, 
  slots, 
  issues, 
  isMobile,
  isTablet,
  theme 
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: { xs: 2, sm: 2.5 },
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        background: theme.palette.background.paper,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: `0 8px 24px ${alpha(dayTheme.primary, 0.12)}`,
          transform: 'translateY(-2px)',
          borderColor: alpha(dayTheme.primary, 0.2),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${dayTheme.primary} 0%, ${alpha(dayTheme.primary, 0.6)} 100%)`,
        }
      }}
    >
      {/* Day Header */}
      <Box 
        sx={{ 
          p: { xs: 2, sm: 2.5 },
          pb: slots.length > 0 ? { xs: 1.5, sm: 2 } : { xs: 2, sm: 2.5 },
          background: `linear-gradient(135deg, ${alpha(dayTheme.primary, 0.03)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        }}
      >
        <Stack 
          direction="row" 
          alignItems="center" 
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                borderRadius: 1.5,
                background: `linear-gradient(135deg, ${dayTheme.primary} 0%, ${alpha(dayTheme.primary, 0.8)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(dayTheme.primary, 0.25)}`,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  color: 'white',
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                }}
              >
                {day.substring(0, 3).toUpperCase()}
              </Typography>
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                sx={{ 
                  color: 'text.primary',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  lineHeight: 1.2,
                }}
              >
                {day}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.7rem', sm: '0.72rem' },
                  fontWeight: 500,
                }}
              >
                {slots.length} time {slots.length === 1 ? 'slot' : 'slots'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {slots.length > 0 && (
              <Chip
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        bgcolor: dayTheme.primary,
                        boxShadow: `0 0 6px ${alpha(dayTheme.primary, 0.6)}`,
                      }}
                    />
                    <Typography variant="caption" fontWeight={700} sx={{ fontSize: { xs: '0.7rem', sm: '0.72rem' } }}>
                      Active
                    </Typography>
                  </Box>
                }
                size="small"
                sx={{
                  height: { xs: 26, sm: 28 },
                  bgcolor: alpha(dayTheme.primary, 0.08),
                  color: dayTheme.primary,
                  border: `1px solid ${alpha(dayTheme.primary, 0.15)}`,
                  borderRadius: 1.5,
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
            )}
            {issues.length > 0 && (
              <Chip
                label={`${issues.length} Issue${issues.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  height: { xs: 26, sm: 28 },
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  color: 'warning.dark',
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
                  borderRadius: 1.5,
                  fontSize: { xs: '0.7rem', sm: '0.72rem' },
                  fontWeight: 700,
                }}
              />
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Time Slots Content */}
      <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: 0 }}>
        {slots.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: { xs: 1.25, sm: 1.5 },
            }}
          >
            {slots.map((slot, idx) => {
              const duration = calculateDuration(slot.startTime, slot.endTime);
              const isShort = duration && !duration.includes('h') && !duration.includes('Invalid');
              
              return (
                <Box
                  key={idx}
                  sx={{
                    position: 'relative',
                    p: { xs: 1.5, sm: 1.75 },
                    borderRadius: 1.5,
                    bgcolor: alpha(dayTheme.primary, 0.04),
                    border: `1px solid ${alpha(dayTheme.primary, 0.1)}`,
                    borderLeft: `3px solid ${dayTheme.primary}`,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: alpha(dayTheme.primary, 0.08),
                      borderColor: alpha(dayTheme.primary, 0.25),
                      transform: 'translateX(3px)',
                      boxShadow: `0 4px 12px ${alpha(dayTheme.primary, 0.15)}`,
                    }
                  }}
                >
                  <Stack spacing={1}>
                    {/* Time Range */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: { xs: 28, sm: 30 },
                          height: { xs: 28, sm: 30 },
                          borderRadius: 1,
                          bgcolor: alpha(dayTheme.primary, 0.12),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <AccessTimeIcon 
                          sx={{ 
                            fontSize: { xs: 14, sm: 16 },
                            color: dayTheme.primary,
                          }} 
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={700}
                          sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.85rem' },
                            color: 'text.primary',
                            lineHeight: 1.3,
                          }}
                        >
                          {formatTo12Hour(slot.startTime)}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.72rem' },
                            color: 'text.secondary',
                            fontWeight: 500,
                          }}
                        >
                          to {formatTo12Hour(slot.endTime)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Duration Badge */}
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: isShort 
                          ? alpha(theme.palette.warning.main, 0.1)
                          : alpha(dayTheme.primary, 0.1),
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: isShort ? theme.palette.warning.main : dayTheme.primary,
                          boxShadow: `0 0 6px ${isShort ? alpha(theme.palette.warning.main, 0.5) : alpha(dayTheme.primary, 0.5)}`,
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        fontWeight={700}
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.72rem' },
                          color: isShort ? 'warning.dark' : dayTheme.primary,
                          lineHeight: 1,
                        }}
                      >
                        {duration}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 3, sm: 4 },
              borderRadius: 2,
              bgcolor: alpha(theme.palette.grey[100], 0.4),
              border: `1px dashed ${alpha(theme.palette.divider, 0.15)}`,
            }}
          >
            <Typography 
              variant="body2"
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                fontWeight: 500,
                fontStyle: 'italic',
              }}
            >
              No time slots scheduled
            </Typography>
          </Box>
        )}
        
        {/* Issues Section */}
        {issues.length > 0 && (
          <Stack spacing={1} sx={{ mt: 2 }}>
            {issues.map((issue, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  p: { xs: 1, sm: 1.25 },
                  borderRadius: 1.5,
                  bgcolor: issue.type === 'error' 
                    ? alpha(theme.palette.error.main, 0.06)
                    : alpha(theme.palette.warning.main, 0.06),
                  border: `1px solid ${issue.type === 'error'
                    ? alpha(theme.palette.error.main, 0.12)
                    : alpha(theme.palette.warning.main, 0.12)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.72rem' },
                    color: issue.type === 'error' ? 'error.dark' : 'warning.dark',
                    fontWeight: 600,
                    flex: 1,
                    lineHeight: 1.5,
                  }}
                >
                  {issue.message}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
});

// Add PropTypes for DayListCard
DayListCard.propTypes = {
  day: PropTypes.string.isRequired,
  dayTheme: PropTypes.object.isRequired,
  slots: PropTypes.array.isRequired,
  issues: PropTypes.array.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isTablet: PropTypes.bool.isRequired,
  theme: PropTypes.object.isRequired,
};

const TimeslotList = ({ 
  groupedSlots = {}, 
  isLoading = false,
  error = null 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Memoized day data processing for performance
  const dayData = useMemo(() => {
    return DAYS_OF_WEEK.map((day) => {
      const dayTheme = DAY_THEMES[day];
      const slots = groupedSlots[day] || [];
      const issues = validateTimeSlots(slots);
      
      return {
        day,
        dayTheme,
        slots,
        issues
      };
    });
  }, [groupedSlots]);

  // Filter out days with no data for a cleaner view
  const daysWithData = useMemo(() => {
    return dayData.filter(({ slots }) => slots.length > 0);
  }, [dayData]);

  // Loading state
  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          Loading Detailed Schedule...
        </Typography>
        <Stack spacing={3}>
          {DAYS_OF_WEEK.slice(0, 3).map((day) => (
            <Card key={day} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" color="text.secondary">
                  Loading {day}...
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading time slots...
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Unable to load schedule details
          </Typography>
          <Typography variant="body2">
            {error || 'An error occurred while loading the schedule list. Please try again.'}
          </Typography>
        </Alert>
      </Paper>
    );
  }

  // Empty state
  if (daysWithData.length === 0) {
    return (
      <Box>
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 6, sm: 8 },
            borderRadius: { xs: 2.5, sm: 3 },
            border: `1px dashed ${alpha(theme.palette.divider, 0.2)}`,
            bgcolor: alpha(theme.palette.grey[50], 0.5),
          }}
        >
          <Box
            sx={{
              width: { xs: 64, sm: 72 },
              height: { xs: 64, sm: 72 },
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <AccessTimeIcon 
              sx={{ 
                fontSize: { xs: 32, sm: 36 }, 
                color: alpha(theme.palette.primary.main, 0.5),
              }} 
            />
          </Box>
          <Typography 
            variant="h6" 
            fontWeight={700}
            sx={{ 
              mb: 1,
              fontSize: { xs: '1rem', sm: '1.1rem' },
              color: 'text.secondary',
            }}
          >
            No Schedule Configured
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            Add time slots to your availability to see them listed here in detail
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={{ xs: 2, sm: 2.5 }}>
        {dayData.map(({ day, dayTheme, slots, issues }) => (
          <DayListCard
            key={day}
            day={day}
            dayTheme={dayTheme}
            slots={slots}
            issues={issues}
            isMobile={isMobile}
            isTablet={isTablet}
            theme={theme}
          />
        ))}
      </Stack>
    </Box>
  );
};

TimeslotList.propTypes = {
  groupedSlots: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        dayOfWeek: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
      })
    )
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

TimeslotList.defaultProps = {
  groupedSlots: {},
  isLoading: false,
  error: null,
};

export default TimeslotList;