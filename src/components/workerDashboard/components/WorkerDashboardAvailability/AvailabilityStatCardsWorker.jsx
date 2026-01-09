import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Grid,
  Typography,
  Box,
  Stack,
  Tooltip,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

// Constants
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

/**
 * StatCard Component
 * 
 * A compact, premium stat card component with tooltips and modern design.
 */
const StatCard = React.memo(function StatCard({ 
  color, 
  Icon, 
  value, 
  label, 
  description,
  tip,
  ariaLabel,
  trend,
  isCompact = false
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      role="group"
      aria-label={ariaLabel}
      elevation={0}
      sx={{
        p: isCompact 
          ? { xs: 1, sm: 1.25, md: 1.5 }
          : { xs: 1.25, sm: 1.5, md: 1.75 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette[color].main, 0.1),
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.03)} 0%, ${alpha(theme.palette[color].main, 0.01)} 100%)`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        minHeight: isCompact ? { xs: 80, sm: 85 } : { xs: 90, sm: 100 },
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.5)})`,
          opacity: 0.7,
        },
        '&:hover': {
          borderColor: alpha(theme.palette[color].main, 0.2),
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.06)} 0%, ${alpha(theme.palette[color].main, 0.03)} 100%)`,
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.12)}`,
        }
      }}
    >
      <Stack 
        direction="row" 
        spacing={isCompact ? 1 : 1.25} 
        alignItems="flex-start" 
        sx={{ width: '100%', flex: 1 }}
      >
        <Box
          sx={{
            width: isCompact ? { xs: 32, sm: 36 } : { xs: 36, sm: 40 },
            height: isCompact ? { xs: 32, sm: 36 } : { xs: 36, sm: 40 },
            borderRadius: 1.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.12)} 0%, ${alpha(theme.palette[color].main, 0.06)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `1px solid ${alpha(theme.palette[color].main, 0.15)}`,
          }}
        >
          <Icon sx={{ 
            fontSize: isCompact 
              ? { xs: 16, sm: 18 } 
              : { xs: 18, sm: 20 },
            color: `${color}.main` 
          }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.3,
                lineHeight: 1.2,
              }}
            >
              {label}
            </Typography>
            {tip && !isMobile && (
              <Tooltip 
                title={tip} 
                arrow 
                placement="top"
                enterDelay={200}
                leaveDelay={100}
              >
                <IconButton
                  size="small"
                  sx={{
                    p: 0.25,
                    minWidth: 'auto',
                    width: 16,
                    height: 16,
                    color: 'text.secondary',
                    opacity: 0.5,
                    '&:hover': {
                      opacity: 1,
                      color: `${color}.main`,
                    }
                  }}
                >
                  <InfoOutlinedIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          <Typography
            component="div"
            sx={{
              fontSize: isCompact
                ? { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                : { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 700,
              color: `${color}.main`,
              lineHeight: 1.1,
              mb: description ? 0.25 : 0,
            }}
          >
            {value}
          </Typography>
          {description && (
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
                color: 'text.secondary',
                opacity: 0.75,
                lineHeight: 1.3,
                display: 'block',
              }}
            >
              {description}
            </Typography>
          )}
          {trend && (
            <Box
              sx={{
                mt: 0.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                px: 0.75,
                py: 0.125,
                borderRadius: 0.75,
                bgcolor: alpha(theme.palette[trend.type === 'positive' ? 'success' : 'warning'].main, 0.1),
                border: `1px solid ${alpha(theme.palette[trend.type === 'positive' ? 'success' : 'warning'].main, 0.15)}`,
              }}
            >
              <TrendingUpIcon 
                sx={{ 
                  fontSize: 12, 
                  color: trend.type === 'positive' ? 'success.main' : 'warning.main',
                  transform: trend.type === 'negative' ? 'rotate(180deg)' : 'none'
                }} 
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  color: trend.type === 'positive' ? 'success.main' : 'warning.main',
                }}
              >
                {trend.value}
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.color === nextProps.color &&
    prevProps.value === nextProps.value &&
    prevProps.label === nextProps.label &&
    prevProps.description === nextProps.description &&
    prevProps.tip === nextProps.tip &&
    prevProps.ariaLabel === nextProps.ariaLabel &&
    prevProps.isCompact === nextProps.isCompact
  );
});

StatCard.propTypes = {
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'info', 'error', 'secondary']).isRequired,
  Icon: PropTypes.elementType.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  tip: PropTypes.string,
  ariaLabel: PropTypes.string.isRequired,
  trend: PropTypes.shape({
    type: PropTypes.oneOf(['positive', 'negative']),
    value: PropTypes.string,
  }),
  isCompact: PropTypes.bool,
};

/**
 * AvailabilityStatCardsWorker Component
 * 
 * A compact, premium, responsive stat cards component with flex row layout
 * for larger screens and grid for smaller devices.
 */
const AvailabilityStatCardsWorker = React.memo(function AvailabilityStatCardsWorker({
  totalSlots = 0,
  totalHours = 0,
  availableDays = [],
  customTimeSlots = [],
  isLoading = false
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  // Memoize all calculations
  const stats = useMemo(() => {
    const coveragePercentage = availableDays?.length > 0 
      ? Math.round((availableDays.length / DAYS_OF_WEEK.length) * 100)
      : 0;

    const avgHoursPerDay = availableDays?.length > 0 
      ? Math.round((totalHours / availableDays.length) * 10) / 10
      : 0;

    let mostAvailableDay = null;
    let maxSlots = 0;
    if (customTimeSlots?.length > 0) {
      const dayCounts = {};
      customTimeSlots.forEach(slot => {
        if (slot?.dayOfWeek) {
          dayCounts[slot.dayOfWeek] = (dayCounts[slot.dayOfWeek] || 0) + 1;
          if (dayCounts[slot.dayOfWeek] > maxSlots) {
            maxSlots = dayCounts[slot.dayOfWeek];
            mostAvailableDay = slot.dayOfWeek;
          }
        }
      });
    }

    return {
      coveragePercentage,
      avgHoursPerDay,
      mostAvailableDay,
    };
  }, [totalSlots, totalHours, availableDays, customTimeSlots]);

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1.5, md: 2 },
          mb: { xs: 2, sm: 2.5 },
          flexWrap: 'wrap',
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              p: { xs: 1, sm: 1.25, md: 1.5 },
              borderRadius: 2,
              minHeight: { xs: 80, sm: 85 },
              bgcolor: 'action.disabledBackground',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: 'divider',
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)', lg: '1 1 auto' },
              minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 0 },
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Loading...
            </Typography>
          </Paper>
        ))}
      </Box>
    );
  }

  // Prepare all stat cards
  const statCards = [
    {
      color: 'primary',
      Icon: ScheduleIcon,
      value: totalSlots,
      label: 'Slots',
      description: `${totalSlots === 1 ? 'slot' : 'slots'}`,
      tip: 'Total number of time slots scheduled',
      ariaLabel: 'Total time slots',
    },
    {
      color: 'success',
      Icon: TimelapseIcon,
      value: `${totalHours}h`,
      label: 'Hours',
      description: stats.avgHoursPerDay > 0 ? `~${stats.avgHoursPerDay}h/day` : 'per week',
      tip: 'Total available hours per week',
      ariaLabel: 'Total hours per week',
    },
    {
      color: 'warning',
      Icon: CalendarTodayIcon,
      value: availableDays.length,
      label: 'Days',
      description: `${availableDays.length === 1 ? 'day' : 'days'}/week`,
      tip: 'Number of days available per week',
      ariaLabel: 'Available days per week',
    },
    {
      color: 'info',
      Icon: TrendingUpIcon,
      value: `${stats.coveragePercentage}%`,
      label: 'Coverage',
      description: stats.coveragePercentage >= 50 ? 'Great!' : 'Add more',
      tip: 'Percentage of week you\'re available',
      ariaLabel: 'Week coverage percentage',
      trend: stats.coveragePercentage >= 50 ? { type: 'positive', value: 'Good' } : null,
    },
  ];

  // Add conditional cards
  if (stats.avgHoursPerDay > 0) {
    statCards.push({
      color: 'secondary',
      Icon: AccessTimeIcon,
      value: `${stats.avgHoursPerDay}h`,
      label: 'Avg/Day',
      description: 'Daily average',
      tip: 'Average hours available per day',
      ariaLabel: 'Average hours per day',
    });
  }

  if (stats.mostAvailableDay) {
    statCards.push({
      color: 'success',
      Icon: EventAvailableIcon,
      value: stats.mostAvailableDay.substring(0, 3),
      label: 'Peak Day',
      description: 'Most slots',
      tip: `${stats.mostAvailableDay} has the most time slots`,
      ariaLabel: 'Most available day',
    });
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 1.5, md: 2 },
        mb: { xs: 2, sm: 2.5 },
        flexWrap: 'wrap',
        alignItems: 'stretch',
      }}
    >
      {statCards.map((card, index) => (
        <Box
          key={index}
          sx={{
            flex: {
              xs: '1 1 100%',
              sm: '1 1 calc(50% - 12px)',
              md: '1 1 calc(33.333% - 16px)',
              lg: '1 1 auto',
            },
            minWidth: {
              xs: '100%',
              sm: 'calc(50% - 12px)',
              md: 'calc(33.333% - 16px)',
              lg: isDesktop ? '140px' : 0,
            },
            maxWidth: {
              xs: '100%',
              sm: 'calc(50% - 12px)',
              md: 'calc(33.333% - 16px)',
              lg: isDesktop ? '180px' : 'none',
            },
          }}
        >
          <StatCard
            {...card}
            isCompact={isDesktop}
          />
        </Box>
      ))}
    </Box>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.totalSlots === nextProps.totalSlots &&
    prevProps.totalHours === nextProps.totalHours &&
    prevProps.availableDays?.length === nextProps.availableDays?.length &&
    prevProps.customTimeSlots?.length === nextProps.customTimeSlots?.length &&
    prevProps.isLoading === nextProps.isLoading
  );
});

AvailabilityStatCardsWorker.propTypes = {
  totalSlots: PropTypes.number,
  totalHours: PropTypes.number,
  availableDays: PropTypes.arrayOf(PropTypes.string),
  customTimeSlots: PropTypes.arrayOf(PropTypes.shape({
    dayOfWeek: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  })),
  isLoading: PropTypes.bool,
};

AvailabilityStatCardsWorker.defaultProps = {
  totalSlots: 0,
  totalHours: 0,
  availableDays: [],
  customTimeSlots: [],
  isLoading: false,
};

export default AvailabilityStatCardsWorker;
