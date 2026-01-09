/**
 * WeeklyAvailabilityCalendar Component
 * 
 * A modern, clean weekly calendar with flex-based layout showing days in rows
 * with time slots displayed in columns. Features duplicate removal, validation,
 * and best practices for UX design.
 * 
 * @version 3.0.0 - Complete redesign with row/column layout
 */

import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Stack,
  Alert,
  Chip,
  Divider,
  alpha,
  Fade
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  EventBusy as EventBusyIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';

// Constants
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const DAY_ABBREVIATIONS = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun'
};

// Color scheme for each day
const DAY_COLORS = {
  Monday: '#6366f1',
  Tuesday: '#10b981', 
  Wednesday: '#f59e0b',
  Thursday: '#8b5cf6',
  Friday: '#ef4444',
  Saturday: '#06b6d4',
  Sunday: '#64748b'
};

// Utility functions
const formatTo12Hour = (time24) => {
  if (!time24 || typeof time24 !== 'string') return { time: '', period: '' };
  
  try {
    const [hourStr, minute] = time24.split(':');
    if (!hourStr || !minute) return { time: '', period: '' };
    
    let hour = parseInt(hourStr, 10);
    if (isNaN(hour) || hour < 0 || hour > 23) return { time: '', period: '' };
    
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return { time: `${hour}:${minute}`, period };
  } catch (error) {
    console.error('Error formatting time:', error);
    return { time: '', period: '' };
  }
};

const calculateDuration = (start, end) => {
  if (!start || !end) return '';
  
  try {
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return '';
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    let diff = endMinutes - startMinutes;
    
    if (diff <= 0) return '';
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  } catch (error) {
    return '';
  }
};

// Remove duplicate time slots
const removeDuplicates = (slots) => {
  if (!Array.isArray(slots) || slots.length === 0) return [];
  
  const seen = new Set();
  return slots.filter(slot => {
    if (!slot?.startTime || !slot?.endTime) return false;
    const key = `${slot.startTime}-${slot.endTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Validate and detect issues
const validateSlots = (slots) => {
  if (!Array.isArray(slots) || slots.length === 0) return { isValid: true, warnings: [], errors: [] };
  
  const warnings = [];
  const errors = [];
  
  try {
    const sortedSlots = [...slots].sort((a, b) => {
      const aTime = a.startTime?.split(':').map(Number) || [0, 0];
      const bTime = b.startTime?.split(':').map(Number) || [0, 0];
      return (aTime[0] * 60 + aTime[1]) - (bTime[0] * 60 + bTime[1]);
    });

    // Check for overlaps
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];
      
      const [currentEndH, currentEndM] = current.endTime.split(':').map(Number);
      const [nextStartH, nextStartM] = next.startTime.split(':').map(Number);
      
      const currentEndMinutes = currentEndH * 60 + currentEndM;
      const nextStartMinutes = nextStartH * 60 + nextStartM;
      
      if (currentEndMinutes > nextStartMinutes) {
        errors.push(`Overlap: ${formatTo12Hour(current.startTime)}-${formatTo12Hour(current.endTime)} & ${formatTo12Hour(next.startTime)}-${formatTo12Hour(next.endTime)}`);
      }
    }

    // Check for short slots
    slots.forEach(slot => {
      const duration = calculateDuration(slot.startTime, slot.endTime);
      if (duration && !duration.includes('h')) {
        const minutes = parseInt(duration.replace('m', ''));
        if (!isNaN(minutes) && minutes < 60) {
          warnings.push(`Short slot (${duration}): ${formatTo12Hour(slot.startTime)}-${formatTo12Hour(slot.endTime)}`);
        }
      }
    });
  } catch (error) {
    console.error('Error validating slots:', error);
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
};

// Individual Day Column Component
const DayColumn = React.memo(function DayColumn({ 
  day, 
  slots, 
  dayColor, 
  isMobile,
  onEditOpen,
  isLastOnRow = false,
  isLastDay = false
}) {
  const theme = useTheme();
  
  // Process slots: remove duplicates, sort by time (earliest first for calendar view)
  const processedSlots = useMemo(() => {
    const unique = removeDuplicates(slots);
    return unique.sort((a, b) => {
      const aTime = a.startTime?.split(':').map(Number) || [0, 0];
      const bTime = b.startTime?.split(':').map(Number) || [0, 0];
      return (aTime[0] * 60 + aTime[1]) - (bTime[0] * 60 + bTime[1]); // Earliest first
    });
  }, [slots]);

  const validation = useMemo(() => validateSlots(processedSlots), [processedSlots]);
  const hasSlots = processedSlots.length > 0;

  // Mobile, Tablet & Small Desktop Layout: Horizontal row with day and slots side by side
  if (isMobile) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderBottom: isLastDay ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          '&:hover': {
            bgcolor: alpha(dayColor, 0.02),
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            minHeight: hasSlots ? { xs: 80, sm: 90, md: 95 } : { xs: 70, sm: 80, md: 85 },
          }}
        >
          {/* Left: Day Info Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: { xs: 0.75, sm: 1, md: 1.25 },
              p: { xs: 1.5, sm: 2, md: 2.5 },
              minWidth: { xs: 100, sm: 120, md: 140 },
              bgcolor: alpha(dayColor, 0.04),
              borderLeft: `4px solid ${dayColor}`,
              position: 'relative',
            }}
          >
            {/* Day Name */}
            <Typography
              variant="subtitle2"
              fontWeight={800}
              sx={{
                color: dayColor,
                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                lineHeight: 1,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {DAY_ABBREVIATIONS[day]}
            </Typography>

            {/* Slot Count & Status */}
            {hasSlots ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    px: 0.75,
                    py: 0.3,
                    borderRadius: 1,
                    bgcolor: alpha(dayColor, 0.12),
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: dayColor,
                      boxShadow: `0 0 4px ${alpha(dayColor, 0.6)}`,
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      color: dayColor,
                      fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.72rem' },
                      lineHeight: 1,
                    }}
                  >
                    {processedSlots.length}
                  </Typography>
                </Box>
                {validation.isValid ? (
                  <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                ) : (
                  <WarningIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                )}
              </Box>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                }}
              >
                No slots
              </Typography>
            )}
          </Box>

          {/* Right: Time Slots - Horizontal Flex */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignContent: 'flex-start',
              gap: { xs: 0.75, sm: 1, md: 1.25 },
              p: { xs: 1.5, sm: 2, md: 2.5 },
              bgcolor: theme.palette.background.paper,
            }}
          >
            {hasSlots ? (
              <>
                {/* Validation Alert */}
                {validation.errors.length > 0 && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      bgcolor: alpha(theme.palette.error.main, 0.06),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                      borderRadius: 1,
                      width: '100%',
                    }}
                  >
                    <WarningIcon sx={{ fontSize: 12, color: 'error.main' }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: 'error.main',
                      }}
                    >
                      Overlap
                    </Typography>
                  </Box>
                )}

                {/* Time Slot Pills - Compact Horizontal */}
                {processedSlots.map((slot, idx) => {
                  const duration = calculateDuration(slot.startTime, slot.endTime);
                  const isShort = duration && !duration.includes('h');
                  const startTime = formatTo12Hour(slot.startTime);
                  const endTime = formatTo12Hour(slot.endTime);

                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: 0.5, sm: 0.75, md: 0.75 },
                        p: { xs: 1, sm: 1.25, md: 1.5 },
                        bgcolor: alpha(dayColor, 0.06),
                        border: `1px solid ${alpha(dayColor, 0.15)}`,
                        borderRadius: 1.5,
                        borderLeft: `3px solid ${dayColor}`,
                        minWidth: { xs: 'calc(50% - 6px)', sm: 'calc(33.33% - 8px)', md: 'calc(25% - 12px)' },
                        flex: { xs: '1 1 calc(50% - 6px)', sm: '1 1 calc(33.33% - 8px)', md: '1 1 calc(25% - 12px)' },
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: alpha(dayColor, 0.1),
                          transform: 'translateY(-1px)',
                          boxShadow: `0 2px 6px ${alpha(dayColor, 0.15)}`,
                        },
                      }}
                    >
                      {/* Time Range - Compact Mobile */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        {/* Start Time */}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25, flexShrink: 0 }}>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            sx={{
                              color: dayColor,
                              fontSize: { xs: '0.72rem', sm: '0.75rem', md: '0.78rem' },
                              lineHeight: 1,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {startTime.time}
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{
                              color: alpha(dayColor, 0.65),
                              fontSize: { xs: '0.55rem', sm: '0.58rem', md: '0.6rem' },
                              lineHeight: 1,
                              textTransform: 'uppercase',
                            }}
                          >
                            {startTime.period}
                          </Typography>
                        </Box>

                        {/* Simple Dash Separator */}
                        <Typography
                          variant="caption"
                          sx={{
                            color: alpha(theme.palette.text.secondary, 0.4),
                            fontSize: { xs: '0.7rem', sm: '0.72rem', md: '0.74rem' },
                            fontWeight: 700,
                            px: 0.25,
                            lineHeight: 1,
                          }}
                        >
                          -
                        </Typography>

                        {/* End Time */}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25, flexShrink: 0 }}>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            sx={{
                              color: dayColor,
                              fontSize: { xs: '0.72rem', sm: '0.75rem', md: '0.78rem' },
                              lineHeight: 1,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {endTime.time}
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{
                              color: alpha(dayColor, 0.65),
                              fontSize: { xs: '0.55rem', sm: '0.58rem', md: '0.6rem' },
                              lineHeight: 1,
                              textTransform: 'uppercase',
                            }}
                          >
                            {endTime.period}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Duration */}
                      {duration && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.4,
                            py: 0.3,
                            borderRadius: 1,
                            bgcolor: isShort
                              ? alpha(theme.palette.warning.main, 0.1)
                              : alpha(dayColor, 0.1),
                          }}
                        >
                          <AccessTimeIcon
                            sx={{
                              fontSize: { xs: 10, sm: 11, md: 12 },
                              color: isShort ? 'warning.dark' : dayColor,
                            }}
                          />
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{
                              color: isShort ? 'warning.dark' : dayColor,
                              fontSize: { xs: '0.65rem', sm: '0.68rem', md: '0.7rem' },
                              lineHeight: 1,
                            }}
                          >
                            {duration}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  flex: 1,
                }}
              >
                <EventBusyIcon
                  sx={{
                    fontSize: 24,
                    color: alpha(theme.palette.text.disabled, 0.3),
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.disabled',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  }}
                >
                  No availability
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  // Desktop/Tablet Layout: Grid with vertical columns
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRight: isLastOnRow ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        height: '100%',
        '&:hover': {
          bgcolor: alpha(dayColor, 0.02),
          '& .day-header': {
            bgcolor: alpha(dayColor, 0.08),
          }
        },
      }}
    >
        {/* Day Header - Top Section */}
        <Box
          className="day-header"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            p: { xs: 1.5, sm: 2 },
            bgcolor: alpha(dayColor, 0.04),
            borderBottom: `2px solid ${alpha(dayColor, 0.2)}`,
            position: 'relative',
            transition: 'all 0.25s ease',
            minHeight: { xs: 80, sm: 90 },
          }}
        >
          {/* Day Name */}
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{
              color: dayColor,
              fontSize: { xs: '0.85rem', sm: '0.95rem', lg: '0.9rem' },
              lineHeight: 1,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            {isMobile ? DAY_ABBREVIATIONS[day] : day}
          </Typography>

          {/* Slot Count & Status */}
          {hasSlots ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.4,
                  borderRadius: 1.5,
                  bgcolor: alpha(dayColor, 0.12),
                  border: `1px solid ${alpha(dayColor, 0.2)}`,
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    bgcolor: dayColor,
                    boxShadow: `0 0 4px ${alpha(dayColor, 0.6)}`,
                  }}
                />
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: dayColor,
                    fontSize: { xs: '0.68rem', sm: '0.7rem' },
                    lineHeight: 1,
                  }}
                >
                  {processedSlots.length} slot{processedSlots.length !== 1 ? 's' : ''}
                </Typography>
              </Box>

              {/* Status Icon */}
              {validation.isValid ? (
                <CheckCircleIcon 
                  sx={{ 
                    fontSize: { xs: 14, sm: 16 }, 
                    color: 'success.main',
                  }} 
                />
              ) : (
                <WarningIcon 
                  sx={{ 
                    fontSize: { xs: 14, sm: 16 }, 
                    color: 'warning.main',
                  }} 
                />
              )}
            </Box>
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                fontSize: { xs: '0.68rem', sm: '0.7rem' },
                fontWeight: 500,
              }}
            >
              No slots
            </Typography>
          )}
        </Box>

        {/* Time Slots Container - Vertical Scrollable */}
        <Box 
          sx={{ 
            flex: 1, 
            p: { xs: 1, sm: 1.25 },
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 0.75, sm: 1 },
            overflowY: 'auto',
            overflowX: 'hidden',
            bgcolor: theme.palette.background.paper,
            '&::-webkit-scrollbar': {
              width: 3,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(dayColor, 0.2),
              borderRadius: 2,
              '&:hover': {
                backgroundColor: alpha(dayColor, 0.4),
              },
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: alpha(theme.palette.divider, 0.05),
            },
          }}
        >
          {hasSlots ? (
            <>
              {/* Validation Messages */}
              {validation.errors.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.75,
                    bgcolor: alpha(theme.palette.error.main, 0.06),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                    borderRadius: 1.5,
                  }}
                >
                  <WarningIcon sx={{ fontSize: 16, color: 'error.main' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.72rem' },
                      fontWeight: 600,
                      color: 'error.main',
                    }}
                  >
                    Overlapping times detected
                  </Typography>
                </Box>
              )}

              {/* Time Slots - Stacked Vertically */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 0.75, sm: 1 },
                  width: '100%',
                }}
              >
                {processedSlots.map((slot, idx) => {
                  const duration = calculateDuration(slot.startTime, slot.endTime);
                  const isShort = duration && !duration.includes('h');
                  const startTime = formatTo12Hour(slot.startTime);
                  const endTime = formatTo12Hour(slot.endTime);
                  
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.75,
                        p: { xs: 1, sm: 1.25 },
                        bgcolor: alpha(dayColor, 0.04),
                        border: `1px solid ${alpha(dayColor, 0.15)}`,
                        borderRadius: 1.5,
                        borderLeft: `3px solid ${dayColor}`,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: alpha(dayColor, 0.08),
                          borderColor: alpha(dayColor, 0.3),
                          transform: 'translateX(2px)',
                          boxShadow: `0 2px 8px ${alpha(dayColor, 0.15)}`,
                        },
                      }}
                    >
                      {/* Time Range */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* Start Time */}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            sx={{
                              color: dayColor,
                              fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              lineHeight: 1,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {startTime.time}
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{
                              color: alpha(dayColor, 0.7),
                              fontSize: { xs: '0.6rem', sm: '0.62rem' },
                              lineHeight: 1,
                              textTransform: 'uppercase',
                            }}
                          >
                            {startTime.period}
                          </Typography>
                        </Box>

                        {/* Premium Arrow Separator */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            px: { xs: 0.5, sm: 0.75 },
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: 16, sm: 20 },
                              height: 2,
                              bgcolor: alpha(dayColor, 0.25),
                              borderRadius: 1,
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: -2,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 5,
                                height: 5,
                                borderRadius: '50%',
                                bgcolor: alpha(dayColor, 0.4),
                              },
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                right: -4,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 0,
                                height: 0,
                                borderTop: `4px solid transparent`,
                                borderBottom: `4px solid transparent`,
                                borderLeft: `6px solid ${alpha(dayColor, 0.4)}`,
                              },
                            }}
                          />
                        </Box>

                        {/* End Time */}
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.4 }}>
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            sx={{
                              color: dayColor,
                              fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              lineHeight: 1,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {endTime.time}
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{
                              color: alpha(dayColor, 0.7),
                              fontSize: { xs: '0.6rem', sm: '0.62rem' },
                              lineHeight: 1,
                              textTransform: 'uppercase',
                            }}
                          >
                            {endTime.period}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Duration */}
                      {duration && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            py: 0.4,
                            borderRadius: 1,
                            bgcolor: isShort
                              ? alpha(theme.palette.warning.main, 0.1)
                              : alpha(dayColor, 0.1),
                          }}
                        >
                          <AccessTimeIcon 
                            sx={{ 
                              fontSize: 12, 
                              color: isShort ? 'warning.dark' : dayColor,
                            }} 
                          />
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{
                              color: isShort ? 'warning.dark' : dayColor,
                              fontSize: { xs: '0.68rem', sm: '0.7rem' },
                              lineHeight: 1,
                            }}
                          >
                            {duration}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                py: { xs: 3, sm: 4 },
              }}
            >
              <EventBusyIcon 
                sx={{ 
                  fontSize: { xs: 32, sm: 36 }, 
                  color: alpha(theme.palette.text.disabled, 0.3),
                }} 
              />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.disabled',
                  fontSize: { xs: '0.7rem', sm: '0.72rem' },
                  fontWeight: 500,
                  textAlign: 'center',
                }}
              >
                Empty
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.day === nextProps.day &&
    prevProps.slots?.length === nextProps.slots?.length &&
    prevProps.isMobile === nextProps.isMobile
  );
});

DayColumn.propTypes = {
  day: PropTypes.string.isRequired,
  slots: PropTypes.array.isRequired,
  dayColor: PropTypes.string.isRequired,
  isMobile: PropTypes.bool.isRequired,
  onEditOpen: PropTypes.func.isRequired,
  isLastOnRow: PropTypes.bool,
  isLastDay: PropTypes.bool,
};

// Main Calendar Component
const WeeklyAvailabilityCalendar = ({ 
  groupedSlots = {}, 
  onEditOpen,
  isLoading = false,
  error = null 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // Mobile + Tablet + Small Desktop layout (< 1200px)

  const handleEditOpen = useCallback(() => {
    onEditOpen?.();
  }, [onEditOpen]);

  // Calculate total statistics
  const stats = useMemo(() => {
    let totalSlots = 0;
    let daysWithSlots = 0;
    let hasIssues = false;

    DAYS_OF_WEEK.forEach(day => {
      const slots = groupedSlots[day] || [];
      const uniqueSlots = removeDuplicates(slots);
      if (uniqueSlots.length > 0) {
        totalSlots += uniqueSlots.length;
        daysWithSlots++;
        const validation = validateSlots(uniqueSlots);
        if (!validation.isValid) hasIssues = true;
      }
    });

    return { totalSlots, daysWithSlots, hasIssues };
  }, [groupedSlots]);

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ borderRadius: 2.5, p: 3 }}>
        <Typography variant="h6" color="text.secondary" textAlign="center">
          Loading weekly schedule...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ borderRadius: 2.5, p: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Unable to load schedule
          </Typography>
          <Typography variant="body2">
            {error || 'An error occurred. Please try again.'}
          </Typography>
        </Alert>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Compact Premium Header */}
      <Box 
        sx={{ 
          mb: { xs: 2, sm: 2.5 },
          pb: { xs: 1.5, sm: 1.75 },
          position: 'relative',
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.6rem' },
            color: 'text.primary',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            mb: { xs: 1, sm: 1.25 },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Weekly Availability
        </Typography>

        {/* Description + Chips - Inline Flex Layout */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.25, sm: 1.5 }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          flexWrap="wrap"
          useFlexGap
        >
          {/* Encouraging Description */}
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.85rem', sm: '0.88rem' },
              color: 'text.secondary',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {stats.daysWithSlots > 0 
              ? 'Keep your schedule updated to get matched with the right jobs'
              : 'Add your availability to unlock job matching opportunities'
            }
          </Typography>

          {/* Compact Stats Chips - Inline */}
          <Stack 
            direction="row" 
            spacing={{ xs: 0.75, sm: 1 }} 
            flexWrap="wrap" 
            useFlexGap
            alignItems="center"
          >
            {/* Days Chip */}
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.72rem' },
                      fontWeight: 700,
                      color: 'primary.main',
                    }}
                  >
                    {stats.daysWithSlots}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.68rem', sm: '0.7rem' },
                      fontWeight: 600,
                      color: 'text.secondary',
                    }}
                  >
                    {stats.daysWithSlots === 1 ? 'Day' : 'Days'}
                  </Typography>
                </Box>
              }
              sx={{
                height: { xs: 28, sm: 30 },
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                px: 1.25,
                transition: 'all 0.2s ease',
                '& .MuiChip-label': { px: 0 },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  transform: 'translateY(-1px)',
                }
              }}
            />

            {/* Slots Chip */}
            <Chip
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 12, color: 'success.main' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.7rem', sm: '0.72rem' },
                      fontWeight: 700,
                      color: 'success.main',
                    }}
                  >
                    {stats.totalSlots}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: { xs: '0.68rem', sm: '0.7rem' },
                      fontWeight: 600,
                      color: 'text.secondary',
                    }}
                  >
                    {stats.totalSlots === 1 ? 'Slot' : 'Slots'}
                  </Typography>
                </Box>
              }
              sx={{
                height: { xs: 28, sm: 30 },
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.success.main, 0.08),
                px: 1.25,
                transition: 'all 0.2s ease',
                '& .MuiChip-label': { px: 0 },
                '&:hover': {
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  transform: 'translateY(-1px)',
                }
              }}
            />

            {/* Issues Chip */}
            {stats.hasIssues && (
              <Chip
                icon={<WarningIcon sx={{ fontSize: 12, color: 'warning.main', ml: 0.5 }} />}
                label="Review"
                sx={{
                  height: { xs: 28, sm: 30 },
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  color: 'warning.dark',
                  px: 1.25,
                  fontSize: { xs: '0.7rem', sm: '0.72rem' },
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  '& .MuiChip-icon': { ml: 0.5 },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 0.12),
                    transform: 'translateY(-1px)',
                  }
                }}
              />
            )}

            {/* Get Started Chip */}
            {stats.daysWithSlots === 0 && (
              <Chip
                label="💡 Get Started"
                sx={{
                  height: { xs: 28, sm: 30 },
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.info.main, 0.06),
                  color: 'info.main',
                  px: 1.25,
                  fontSize: { xs: '0.7rem', sm: '0.72rem' },
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                  }
                }}
              />
            )}
          </Stack>
        </Stack>

        {/* Subtle Divider Line */}
        <Box
          sx={{
            mt: { xs: 1.5, sm: 1.75 },
            height: 1,
            borderRadius: 0.5,
            background: `linear-gradient(90deg, 
              ${alpha(theme.palette.primary.main, 0)} 0%, 
              ${alpha(theme.palette.primary.main, 0.12)} 25%, 
              ${alpha(theme.palette.success.main, 0.12)} 50%, 
              ${alpha(theme.palette.info.main, 0.12)} 75%, 
              ${alpha(theme.palette.info.main, 0)} 100%)`,
          }}
        />
      </Box>

      {/* Calendar Layout - Responsive */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 2.5 },
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          overflow: 'hidden',
          bgcolor: theme.palette.background.paper,
        }}
      >
        {isMobile ? (
          /* Mobile, Tablet & Small Desktop: Vertical List Layout (< 1200px) */
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {DAYS_OF_WEEK.map((day, index) => (
              <DayColumn
                key={day}
                day={day}
                slots={groupedSlots[day] || []}
                dayColor={DAY_COLORS[day]}
                isMobile={isMobile}
                onEditOpen={handleEditOpen}
                isLastDay={index === DAYS_OF_WEEK.length - 1}
              />
            ))}
          </Box>
        ) : (
          /* Large Desktop: Grid Layout (7-column full week view, ≥ 1200px) */
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              minHeight: 360,
            }}
          >
            {DAYS_OF_WEEK.map((day, index) => (
              <DayColumn
                key={day}
                day={day}
                slots={groupedSlots[day] || []}
                dayColor={DAY_COLORS[day]}
                isMobile={isMobile}
                onEditOpen={handleEditOpen}
                isLastOnRow={index === DAYS_OF_WEEK.length - 1}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
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
