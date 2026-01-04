// src/components/WorkerAvailabilityOnboarding/components/WeeklyOverview.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CheckCircle2, Calendar } from 'lucide-react';
import { daysOfWeek } from '../../../utils/constants';
import { DAY_COLORS, DAY_SHORT, formatTimeRange } from '../utils/timeSlotUtils';

/**
 * WeeklyOverview Component
 * 
 * A read-only component that displays a weekly overview of time slots.
 * Shows all days of the week with their availability status and time ranges.
 * Designed with SaaS-level UX patterns for confidence-building preview.
 * 
 * @param {object} groupedSlots - Object with day names as keys and arrays of slots as values
 */
const WeeklyOverview = ({ groupedSlots }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Calculate completion state
  const availabilityStats = useMemo(() => {
    const availableDays = daysOfWeek.filter(day => {
      const daySlots = groupedSlots[day] || [];
      return daySlots.length > 0;
    });
    
    return {
      availableCount: availableDays.length,
      totalDays: daysOfWeek.length,
      hasAvailability: availableDays.length > 0,
    };
  }, [groupedSlots]);

  // Empty state - all days unavailable
  if (!availabilityStats.hasAvailability) {
    return (
      <Box
        sx={{
          mb: 2.5,
          p: { xs: 2.5, sm: 3 },
          borderRadius: '14px',
          bgcolor: alpha(theme.palette.grey[50], 0.5),
          backdropFilter: 'blur(10px)',
          textAlign: 'center',
          border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
        }}
      >
        <Box
          sx={{
            width: { xs: 44, sm: 48 },
            height: { xs: 44, sm: 48 },
            borderRadius: '12px',
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
          }}
        >
          <Calendar size={isMobile ? 22 : 24} color={theme.palette.primary.main} strokeWidth={2} />
        </Box>
        <Typography
          sx={{
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 0.5,
            letterSpacing: '-0.01em',
          }}
        >
          No availability added yet
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            color: theme.palette.text.secondary,
            lineHeight: 1.6,
            maxWidth: 320,
            mx: 'auto',
          }}
        >
          Add at least one time slot to start receiving job requests.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mb: 2.5,
        p: { xs: 1.75, sm: 2.25 },
        borderRadius: '14px',
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
          borderColor: alpha(theme.palette.divider, 0.12),
        },
      }}
    >
      {/* Header Section - Outcome-Oriented */}
      <Box sx={{ mb: { xs: 1.75, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1.25 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: '0.9375rem', sm: '1rem' },
                fontWeight: 700,
                color: theme.palette.text.primary,
                letterSpacing: '-0.015em',
                lineHeight: 1.3,
                mb: 0.375,
              }}
            >
              Your Weekly Availability
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                color: theme.palette.text.secondary,
                lineHeight: 1.5,
              }}
            >
              This is how clients see your schedule
            </Typography>
          </Box>
          
          {/* Completion State Summary */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.625,
              px: { xs: 1.25, sm: 1.5 },
              py: { xs: 0.5, sm: 0.625 },
              borderRadius: '10px',
              bgcolor: availabilityStats.hasAvailability 
                ? alpha('#10b981', 0.08) 
                : alpha(theme.palette.grey[500], 0.06),
              backdropFilter: 'blur(8px)',
              border: `1px solid ${availabilityStats.hasAvailability 
                ? alpha('#10b981', 0.2) 
                : alpha(theme.palette.divider, 0.08)}`,
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            {availabilityStats.hasAvailability && (
              <CheckCircle2 size={isMobile ? 13 : 14} color="#10b981" strokeWidth={2.5} />
            )}
            <Typography
              sx={{
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                fontWeight: 600,
                color: availabilityStats.hasAvailability ? '#10b981' : theme.palette.text.secondary,
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {availabilityStats.hasAvailability
                ? `Available on ${availabilityStats.availableCount} day${availabilityStats.availableCount !== 1 ? 's' : ''}`
                : 'No availability set yet'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Days List */}
      <Stack spacing={0.375}>
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
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 0.625, sm: 1.25 },
                py: { xs: 0.875, sm: 0.875 },
                px: { xs: 1.25, sm: 1.5 },
                borderRadius: '10px',
                bgcolor: isUnavailable 
                  ? alpha(theme.palette.grey[50], 0.5) 
                  : 'transparent',
                backdropFilter: isUnavailable ? 'blur(8px)' : 'none',
                border: isUnavailable 
                  ? `1px solid ${alpha(theme.palette.divider, 0.06)}` 
                  : 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                ...(isUnavailable
                  ? {}
                  : {
                      '&:hover': {
                        bgcolor: alpha(dayColor, 0.05),
                        transform: 'translateX(3px)',
                        boxShadow: `0 2px 4px ${alpha(dayColor, 0.08)}`,
                      },
                    }),
              }}
            >
              {/* Day Badge - SaaS Pattern */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: { xs: '100%', sm: 100 },
                  flexShrink: 0,
                }}
              >
                <Chip
                  label={DAY_SHORT[day]}
                  size="small"
                  sx={{
                    height: { xs: 26, sm: 24 },
                    fontSize: { xs: '0.75rem', sm: '0.6875rem' },
                    fontWeight: 600,
                    bgcolor: isUnavailable
                      ? 'transparent'
                      : alpha(dayColor, 0.08),
                    color: isUnavailable 
                      ? theme.palette.text.disabled 
                      : dayColor,
                    border: isUnavailable
                      ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
                      : `1px solid ${alpha(dayColor, 0.15)}`,
                    backdropFilter: 'blur(8px)',
                    '& .MuiChip-label': {
                      px: { xs: 1.25, sm: 1 },
                      letterSpacing: '-0.01em',
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              </Box>

              {/* Time Range - Emphasized */}
              <Typography
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.8125rem' },
                  fontWeight: isUnavailable ? 400 : 600,
                  color: isUnavailable 
                    ? theme.palette.text.disabled 
                    : theme.palette.text.primary,
                  fontStyle: isUnavailable ? 'italic' : 'normal',
                  flex: 1,
                  minWidth: 0,
                  lineHeight: 1.5,
                  letterSpacing: isUnavailable ? 'normal' : '-0.01em',
                }}
              >
                {isUnavailable ? 'Not available' : timeRange}
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

export default React.memo(WeeklyOverview);

