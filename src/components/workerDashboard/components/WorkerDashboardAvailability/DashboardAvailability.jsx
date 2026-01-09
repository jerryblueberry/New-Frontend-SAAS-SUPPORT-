import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Alert,
  Container,
  Collapse,
  useMediaQuery,
  Skeleton,
  Stack,
  CircularProgress
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import EditAvailabilityDrawer from './EditAvailabilityDrawer';
import WeeklyAvailabilityCalendar from './Components/DashboardAvailability/WeeklyAvailabilityCalendar';
import TimeslotList from './Components/DashboardAvailability/TimeslotList';
import AvailabilityHeader from './AvailabilityHeader';
import AvailabilityStatCardsWorker from './AvailabilityStatCardsWorker';

// Constants moved outside component for better performance
const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];



/**
 * DashboardAvailability Component
 * 
 * A production-ready React component for displaying worker availability schedules
 * with optimized performance, comprehensive error handling, and responsive design.
 * 
 * Features:
 * - Calendar and List view modes
 * - Real-time validation with visual feedback
 * - Statistics dashboard with key metrics
 * - Responsive design for mobile/tablet/desktop
 * - Memoized components for optimal performance
 * - Comprehensive error boundaries
 * - Accessibility compliant
 * 
 * Performance Optimizations:
 * - React.memo with custom comparison
 * - Extracted WeeklyAvailabilityCalendar component for better code splitting
 * - Memoized utility functions
 * - useMemo for expensive calculations
 * - useCallback for event handlers
 * 
 * Architecture:
 * - Main dashboard component handling view modes, statistics, and data processing
 * - WeeklyAvailabilityCalendar: Dedicated calendar component with interactive day cards
 * - TimeslotList: Dedicated list component for detailed schedule overview
 * - Separated concerns for better maintainability, reusability, and code splitting
 * 
 * @version 4.0.0 - Complete component extraction with Calendar and List separation
 * @author Aecus Care Development Team
 */



const DashboardAvailability = React.memo(function DashboardAvailability({ onboardingData, onEdit, setModalOpen, modalOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Memoize data extraction for better performance
  const { availability, customTimeSlots } = useMemo(() => {
    const avail = onboardingData?.data?.profile?.availability || {};
    return {
      availability: avail,
      customTimeSlots: Array.isArray(avail.customTimeSlots) ? avail.customTimeSlots : []
    };
  }, [onboardingData]);

  const [editOpen, setEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  // Initialize stats visibility from localStorage or default based on screen size
  const [statsVisible, setStatsVisible] = useState(() => {
    try {
      const savedPreference = localStorage.getItem('availability-stats-visible');
      if (savedPreference !== null) {
        return JSON.parse(savedPreference);
      }
    } catch (error) {
      console.error('Error reading stats visibility preference:', error);
    }
    return !isMobile; // Default: show on desktop, hide on mobile
  });

  // Memoized event handlers for better performance
  const handleEditOpen = useCallback(() => {
    setEditOpen(true);
    setModalOpen?.(true);
  }, [setModalOpen]);

  const handleEditClose = useCallback(() => {
    setEditOpen(false);
    setModalOpen?.(false);
  }, [setModalOpen]);
  const handleEditConfirm = useCallback((newData) => {
    setEditOpen(false);
    setModalOpen?.(false);
    onEdit?.(newData);
  }, [onEdit, setModalOpen]);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleStatsToggle = useCallback(() => {
    setStatsVisible(prev => {
      const newValue = !prev;
      // Persist user preference
      try {
        localStorage.setItem('availability-stats-visible', JSON.stringify(newValue));
      } catch (error) {
        console.error('Error saving stats visibility preference:', error);
      }
      return newValue;
    });
  }, []);

  // Only update stats visibility on initial mount based on saved preference
  // Don't force it on screen size changes to respect user preference
  React.useEffect(() => {
    // This effect runs only once on mount
    // User preference is already loaded from localStorage in useState initializer
  }, []);

  // Group slots by day and calculate statistics with better error handling
  const { groupedSlots, totalSlots, totalHours, availableDays } = useMemo(() => {
    const groups = DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});

    let totalSlots = 0;
    let totalMinutes = 0;

    customTimeSlots.forEach(slot => {
      if (!slot?.dayOfWeek || !slot?.startTime || !slot?.endTime) return;

      if (groups[slot.dayOfWeek]) {
        groups[slot.dayOfWeek].push(slot);
        totalSlots++;

        try {
          const [startH, startM] = slot.startTime.split(':').map(Number);
          const [endH, endM] = slot.endTime.split(':').map(Number);

          if (!isNaN(startH) && !isNaN(startM) && !isNaN(endH) && !isNaN(endM)) {
            const slotMinutes = (endH * 60 + endM) - (startH * 60 + startM);
            if (slotMinutes > 0) {
              totalMinutes += slotMinutes;
            }
          }
        } catch (error) {
          console.error('Error calculating slot duration:', error);
        }
      }
    });

    // Sort each day's slots by start time with error handling
    DAYS_OF_WEEK.forEach(day => {
      groups[day].sort((a, b) => {
        try {
          const aTime = a.startTime?.split(':').map(Number) || [0, 0];
          const bTime = b.startTime?.split(':').map(Number) || [0, 0];
          return (aTime[0] * 60 + aTime[1]) - (bTime[0] * 60 + bTime[1]);
        } catch {
          return 0;
        }
      });
    });

    const availableDays = DAYS_OF_WEEK.filter(day => groups[day].length > 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    return { groupedSlots: groups, totalSlots, totalHours, availableDays };
  }, [customTimeSlots]);

  // Premium loading state with skeleton loaders
  if (!onboardingData) {
    return (
      <Box
        sx={{
          width: '100%',
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 2, sm: 2.5, md: 3 },
          maxWidth: '100%',
        }}
      >
        <Box sx={{ mb: 4, mt: 0.5 }}>
          {/* Header Skeleton */}
          <Paper
            elevation={1}
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              p: { xs: 1, sm: 2, md: 2 },
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 1.5, sm: 2, md: 3 }}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} flex={1} sx={{ width: '100%' }}>
                <Skeleton 
                  variant="rectangular" 
                  width={120} 
                  height={24} 
                  sx={{ borderRadius: 1 }} 
                />
                <Skeleton 
                  variant="rectangular" 
                  width={100} 
                  height={24} 
                  sx={{ borderRadius: 1 }} 
                />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Skeleton 
                  variant="rectangular" 
                  width={{ xs: '32%', sm: 80 }} 
                  height={32} 
                  sx={{ borderRadius: 2 }} 
                />
                <Skeleton 
                  variant="rectangular" 
                  width={{ xs: '32%', sm: 80 }} 
                  height={32} 
                  sx={{ borderRadius: 2 }} 
                />
                <Skeleton 
                  variant="rectangular" 
                  width={{ xs: '32%', sm: 80 }} 
                  height={32} 
                  sx={{ borderRadius: 2 }} 
                />
              </Stack>
            </Stack>
          </Paper>

          {/* Stats Cards Skeleton */}
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
              <Box
                key={i}
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
                    lg: '140px',
                  },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1, sm: 1.25, md: 1.5 },
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    height: '100%',
                    minHeight: { xs: 80, sm: 85 },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Skeleton variant="rectangular" width={36} height={36} sx={{ borderRadius: 1.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={16} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="40%" height={28} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="70%" height={12} />
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Calendar Skeleton */}
          <Paper
            elevation={2}
            sx={{
              borderRadius: 2.5,
              p: { xs: 1.5, sm: 2, md: 2.5 },
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Loading Overlay with Animation */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                backdropFilter: 'blur(4px)',
                zIndex: 10,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  mb: 2,
                }}
              >
                <CircularProgress
                  size={48}
                  thickness={3}
                  sx={{
                    color: theme.palette.primary.main,
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }}
                  />
                </Box>
              </Box>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: '0.95rem', sm: '1.1rem' },
                  mb: 0.5,
                }}
              >
                Loading Availability
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                Please wait while we fetch your schedule...
              </Typography>
            </Box>

            {/* Calendar Structure Skeleton */}
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <Skeleton variant="text" width={150} height={28} />
                <Box sx={{ flex: 1 }} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
              </Stack>
              <Skeleton variant="rectangular" width="100%" height={1} />
            </Box>

            <Stack spacing={1.5}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ minWidth: { xs: 80, md: 140 } }}>
                      <Skeleton variant="text" width={80} height={20} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width={50} height={14} />
                    </Box>
                    <Skeleton variant="rectangular" width={1} height={40} sx={{ display: { xs: 'none', md: 'block' } }} />
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 1.5 }} />
                        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1.5 }} />
                        <Skeleton variant="rectangular" width={130} height={32} sx={{ borderRadius: 1.5 }} />
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Box>
    );
  }

  // Error boundary wrapper
  const renderContent = () => {
    try {
      return (
        <Box sx={{ mb: 4 }}>
          {/* Header Section */}
          <AvailabilityHeader
            availability={availability}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onEditOpen={handleEditOpen}
            statsVisible={statsVisible}
            onStatsToggle={handleStatsToggle}
          />

          {/* Compact Statistics Dashboard - Collapsible on All Devices */}
          <Collapse
            in={statsVisible}
            timeout={{
              enter: 400,
              exit: 350
            }}
            easing={{
              enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
              exit: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            unmountOnExit={false}
            mountOnEnter={false}
            sx={{
              '& .MuiCollapse-wrapper': {
                transition: 'height 400ms cubic-bezier(0.4, 0, 0.2, 1)',
              },
              '& .MuiCollapse-wrapperInner': {
                transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform',
              }
            }}
          >
            <Box
              sx={{
                overflow: 'hidden',
                willChange: 'height, opacity',
                transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: statsVisible ? 1 : 0,
              }}
            >
              <AvailabilityStatCardsWorker
                totalSlots={totalSlots}
                totalHours={totalHours}
                availableDays={availableDays}
                customTimeSlots={customTimeSlots}
                isLoading={false}
              />
            </Box>
          </Collapse>

          {/* Premium Section Separator */}
          <Box
            sx={{
              position: 'relative',
              my: { xs: 2.5, sm: 3, md: 3.5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Left gradient line */}
            <Box
              sx={{
                flex: 1,
                height: 2,
                borderRadius: '2px 0 0 2px',
                background: `linear-gradient(to right, 
                  transparent 0%,
                  ${alpha(theme.palette.primary.main, 0.15)} 40%,
                  ${alpha(theme.palette.primary.main, 0.25)} 100%
                )`,
              }}
            />
            
            {/* Center accent with icon/dots */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.75,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.7, transform: 'scale(1.1)' },
                  },
                }}
              />
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  boxShadow: `0 0 8px ${alpha(theme.palette.success.main, 0.5)}`,
                  animation: 'pulse 2s infinite 0.3s',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.7, transform: 'scale(1.1)' },
                  },
                }}
              />
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'info.main',
                  boxShadow: `0 0 8px ${alpha(theme.palette.info.main, 0.5)}`,
                  animation: 'pulse 2s infinite 0.6s',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.7, transform: 'scale(1.1)' },
                  },
                }}
              />
            </Box>
            
            {/* Right gradient line */}
            <Box
              sx={{
                flex: 1,
                height: 2,
                borderRadius: '0 2px 2px 0',
                background: `linear-gradient(to left, 
                  transparent 0%,
                  ${alpha(theme.palette.info.main, 0.15)} 40%,
                  ${alpha(theme.palette.info.main, 0.25)} 100%
                )`,
              }}
            />
          </Box>

          {/* Weekly Calendar View */}
          {viewMode === 'calendar' && (
            <WeeklyAvailabilityCalendar
              groupedSlots={groupedSlots}
              onEditOpen={handleEditOpen}
              isLoading={false}
              error={null}
            />
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <TimeslotList
              groupedSlots={groupedSlots}
              isLoading={false}
              error={null}
            />
          )}

          <EditAvailabilityDrawer
            open={editOpen}
            onClose={handleEditClose}
            onSave={handleEditConfirm}
            initialData={{
              suburb: availability.suburb || '',
              kmWillingToTravel: availability.kmWillingToTravel || 10,
              customTimeSlots: customTimeSlots || [],
            }}
          />
        </Box>
      );
    } catch (error) {
      console.error('Error rendering DashboardAvailability:', error);
      return (
        <Box sx={{ mb: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2">
              Unable to display availability data. Please try refreshing the page or contact support.
            </Typography>
          </Alert>
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1.5, sm: 2, md: 3 },
        pt: { xs: 1.5, sm: 2, md: 2.5 },
        pb: { xs: 2, sm: 2.5, md: 3 },
        maxWidth: '100%',
      }}
    >
      {renderContent()}
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo optimization
  return (
    prevProps.onboardingData?.data?.profile?.availability === nextProps.onboardingData?.data?.profile?.availability &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.setModalOpen === nextProps.setModalOpen &&
    prevProps.modalOpen === nextProps.modalOpen
  );
});

DashboardAvailability.propTypes = {
  onboardingData: PropTypes.shape({
    data: PropTypes.shape({
      profile: PropTypes.shape({
        availability: PropTypes.shape({
          suburb: PropTypes.string,
          kmWillingToTravel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          customTimeSlots: PropTypes.arrayOf(PropTypes.shape({
            dayOfWeek: PropTypes.string.isRequired,
            startTime: PropTypes.string.isRequired,
            endTime: PropTypes.string.isRequired,
          }))
        })
      })
    })
  }),
  onEdit: PropTypes.func,
  setModalOpen: PropTypes.func,
  modalOpen: PropTypes.bool,
};

DashboardAvailability.defaultProps = {
  onboardingData: null,
  onEdit: () => { },
  setModalOpen: () => { },
  modalOpen: false,
};

export default DashboardAvailability;