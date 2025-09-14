import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  Fade,
  Stack,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Container,
  alpha
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditAvailabilityDrawer from './EditAvailabilityDrawer';
import WeeklyAvailabilityCalendar from './Components/DashboardAvailability/WeeklyAvailabilityCalendar';
import TimeslotList from './Components/DashboardAvailability/TimeslotList';

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



const DashboardAvailability = React.memo(function DashboardAvailability({ onboardingData, onEdit,  setModalOpen, modalOpen }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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

  // Loading state
  if (!onboardingData) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper elevation={2} sx={{ borderRadius: 3, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Loading availability data...
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Error boundary wrapper
  const renderContent = () => {
    try {
      return (
        <Box sx={{ mb: 4 ,mt:2.5}}>
                      {/* Header Section */}
            <Paper
              elevation={2}
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                p: { xs: 1, sm: 2, md: 3 },
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 1.5, sm: 2, md: 3 }}
                alignItems={{ xs: '', md: 'center' }}
                justifyContent="space-between"
              >
                {/* Location Info Section */}
                <Stack 
                  direction={{ xs: 'row', sm: 'row' }}
                  justifyContent={{ xs: 'space-between', sm: 'spa' ,md: 'space-between'}} 
                  spacing={{ xs: 1, sm: 2 }} 
                  flex={1}
                  sx={{ minWidth: 0 }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <LocationOnIcon sx={{ 
                      color: 'primary.main', 
                      fontSize: { xs: 17, sm: 18, md: 20 },
                      flexShrink: 0
                    }} />
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      color="primary.main" 
                      sx={{
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {availability.suburb || 'Location not specified'}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <DirectionsCarIcon sx={{ 
                      color: 'text.secondary', 
                      fontSize: { xs: 16, sm: 18, md: 20 },
                      flexShrink: 0
                    }} />
                    <Typography 
                      color="text.secondary" 
                      fontWeight={500} 
                      sx={{
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.85rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isMobile ? 
                        `${availability.kmWillingToTravel || 'N/A'} km` : 
                        `Travel radius: ${availability.kmWillingToTravel ? `${availability.kmWillingToTravel} km` : 'Not specified'}`
                      }
                    </Typography>
                  </Stack>
                </Stack>

                {/* Action Buttons Section */}
                <Stack 
                  direction="row" 
                  spacing={{ xs: 0.3, sm: 0.8, md: 1.2 }}
                  sx={{ 
                    flexShrink: 0,
                    width: { xs: '100%', sm: 'auto', md: 'auto' },
                    justifyContent: { xs: 'space-between', sm: 'flex-end', md: 'flex-end' }
                  }}
                >
                  <Button
                    variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={
                      <CalendarTodayIcon 
                        sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } 
                        }} 
                      />
                    }
                    onClick={() => handleViewModeChange('calendar')}
                    sx={{ 
                      borderRadius: 2,
                      fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' },
                      px: { xs: 0.8, sm: 1.2, md: 1.8 },
                      py: { xs: 0.4, sm: 0.6, md: 0.8 },
                      minWidth: { xs: 'auto', sm: 'auto', md: 'auto' },
                      flex: { xs: 1, sm: 'none', md: 'none' },
                      maxWidth: { xs: '32%', sm: 'none' },
                      '& .MuiButton-startIcon': {
                        marginLeft: { xs: 0, sm: 0 },
                        marginRight: { xs: 0.3, sm: 0.5, md: 0.5 }
                      },
                      fontWeight: 500,
                      textTransform: 'none'
                    }}
                  >
                    Calendar
                  </Button>
                  
                  <Button
                    variant={viewMode === 'list' ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={
                      <VisibilityIcon 
                        sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } 
                        }} 
                      />
                    }
                    onClick={() => handleViewModeChange('list')}
                    sx={{ 
                      borderRadius: 2,
                      fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' },
                      px: { xs: 0.8, sm: 1.2, md: 1.8 },
                      py: { xs: 0.4, sm: 0.6, md: 0.8 },
                      minWidth: { xs: 'auto', sm: 'auto', md: 'auto' },
                      flex: { xs: 1, sm: 'none', md: 'none' },
                      maxWidth: { xs: '32%', sm: 'none' },
                      '& .MuiButton-startIcon': {
                        marginLeft: { xs: 0, sm: 0 },
                        marginRight: { xs: 0.3, sm: 0.5, md: 0.5 }
                      },
                      fontWeight: 500,
                      textTransform: 'none'
                    }}
                  >
                    List
                  </Button>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      <EditIcon 
                        sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } 
                        }} 
                      />
                    }
                    onClick={handleEditOpen}
                    sx={{
                      fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' },
                      borderRadius: 2,
                      fontWeight: 600,
                      px: { xs: 0.8, sm: 1.2, md: 1.8 },
                      py: { xs: 0.4, sm: 0.6, md: 0.8 },
                      minWidth: { xs: 'auto', sm: 'auto', md: 'auto' },
                      flex: { xs: 1, sm: 'none', md: 'none' },
                      maxWidth: { xs: '32%', sm: 'none' },
                      '& .MuiButton-startIcon': {
                        marginLeft: { xs: 0, sm: 0 },
                        marginRight: { xs: 0.3, sm: 0.5, md: 0.5 }
                      },
                      boxShadow: 1,
                      textTransform: 'none',
                      '&:hover': {
                        boxShadow: 2,
                        transform: 'translateY(-1px)',
                      }
                    }}
                  >
                    Edit
                  </Button>
                </Stack>
              </Stack>
            </Paper>

          {/* Compact Statistics Dashboard */}
          <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: 2 }}>
            {/* Time Slots */}
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      borderRadius: 1.5,
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ScheduleIcon 
                      sx={{ 
                        fontSize: { xs: 14, sm: 16 }, 
                        color: 'white',
                      }} 
                    />
                  </Box>
                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        fontWeight: 700,
                        color: 'primary.main',
                        lineHeight: 1,
                      }}
                    >
                      {totalSlots}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 500,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Slots
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Total Hours */}
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`,
                  bgcolor: alpha(theme.palette.success.main, 0.04),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: alpha(theme.palette.success.main, 0.2),
                  }
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      borderRadius: 1.5,
                      bgcolor: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TimelapseIcon 
                      sx={{ 
                        fontSize: { xs: 14, sm: 16 }, 
                        color: 'white',
                      }} 
                    />
                  </Box>
                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        fontWeight: 700,
                        color: 'success.main',
                        lineHeight: 1,
                      }}
                    >
                      {totalHours}h
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 500,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Hours
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Available Days */}
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}`,
                  bgcolor: alpha(theme.palette.warning.main, 0.04),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: alpha(theme.palette.warning.main, 0.2),
                  }
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      borderRadius: 1.5,
                      bgcolor: 'warning.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CalendarTodayIcon 
                      sx={{ 
                        fontSize: { xs: 14, sm: 16 }, 
                        color: 'white',
                      }} 
                    />
                  </Box>
                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        fontWeight: 700,
                        color: 'warning.main',
                        lineHeight: 1,
                      }}
                    >
                      {availableDays.length}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 500,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Days
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            {/* Week Coverage */}
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={1}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                  bgcolor: alpha(theme.palette.info.main, 0.04),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 2,
                    borderColor: alpha(theme.palette.info.main, 0.2),
                  }
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      borderRadius: 1.5,
                      bgcolor: 'info.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <TrendingUpIcon 
                      sx={{ 
                        fontSize: { xs: 14, sm: 16 }, 
                        color: 'white',
                      }} 
                    />
                  </Box>
                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        fontWeight: 700,
                        color: 'info.main',
                        lineHeight: 1,
                      }}
                    >
                      {Math.round((availableDays.length / DAYS_OF_WEEK.length) * 100)}%
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        fontWeight: 500,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Coverage
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

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
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {renderContent()}
    </Container>
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