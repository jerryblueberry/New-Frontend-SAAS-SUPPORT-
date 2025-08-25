import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Button,
  Chip,
  Badge,
  useTheme,
  useMediaQuery,
  Fade,
  Stack,
  Divider,
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import EditAvailabilityModal from './EditAvailabilityModal';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

// Day colors for visual distinction
const DAY_COLORS = {
  Monday: '#1976d2',
  Tuesday: '#388e3c',
  Wednesday: '#f57c00',
  Thursday: '#7b1fa2',
  Friday: '#d32f2f',
  Saturday: '#0288d1',
  Sunday: '#5d4037'
};

function formatTo12Hour(time24) {
  if (!time24) return '';
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function calculateDuration(start, end) {
  if (!start || !end) return '';
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  let diff = endMinutes - startMinutes;
  if (diff <= 0) return 'Invalid time';
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours > 0 ? `${hours}h` : ''}${hours > 0 && minutes > 0 ? ' ' : ''}${minutes > 0 ? `${minutes}m` : ''}`.trim();
}

const DashboardAvailability = React.memo(function DashboardAvailability({ onboardingData, onEdit }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const availability = onboardingData?.data?.profile?.availability || {};
  const customTimeSlots = availability.customTimeSlots || [];

  // Modal state
  const [editOpen, setEditOpen] = React.useState(false);
  const handleEditOpen = () => setEditOpen(true);
  const handleEditClose = () => setEditOpen(false);
  const handleEditConfirm = (newData) => {
    setEditOpen(false);
    onEdit(newData);
  };

  // Group slots by day and sort them
  const groupedSlots = useMemo(() => {
    const groups = daysOfWeek.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});
    
    customTimeSlots.forEach(slot => {
      if (groups[slot.dayOfWeek]) {
        groups[slot.dayOfWeek].push(slot);
      }
    });
    
    // Sort each day's slots by start time
    daysOfWeek.forEach(day => {
      groups[day].sort((a, b) => {
        const [aHour, aMin] = a.startTime.split(':').map(Number);
        const [bHour, bMin] = b.startTime.split(':').map(Number);
        return aHour * 60 + aMin - (bHour * 60 + bMin);
      });
    });
    
    return groups;
  }, [customTimeSlots]);

  return (
    <Box sx={{ width: '100%', mt: { xs: 2, md: 4, lg: 7 }, px: { xs: 0, md: 2 }, bgcolor: 'background.default' }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 4,
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: 1100,
          mx: 'auto',
          mb: 4,
          boxShadow: theme.shadows[isMobile ? 1 : 4],
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 80%, ${theme.palette.primary.light}10 100%)`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 3,
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOnIcon color="primary" />
              <Typography fontWeight={600} color="primary.main">
                {availability.suburb || 'No suburb specified'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <DirectionsCarIcon color="action" />
              <Typography color="text.secondary">
                Willing to travel: {availability.kmWillingToTravel ? `${availability.kmWillingToTravel} km` : 'N/A'}
              </Typography>
            </Stack>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditOpen}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              px: 3,
              py: 1,
              boxShadow: 2,
              textTransform: 'none',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px) scale(1.03)',
              },
            }}
          >
            Edit Availability
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {/* Time Slots Grid */}
        <Grid
          container
          spacing={isMobile ? 2 : 3}
          columns={isMobile ? 2 : isTablet ? 3 : 7}
          sx={{
            width: '100%',
            mx: 0,
            mb: 1,
            minHeight: 200,
            transition: 'all 0.3s',
          }}
        >
          {daysOfWeek.map((day) => {
            const dayColor = DAY_COLORS[day] || theme.palette.primary.main;
            const slots = groupedSlots[day];
            
            return (
              <Grid item xs={1} key={day} zeroMinWidth>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    minHeight: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: `4px solid ${dayColor}`,
                    transition: 'box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, flexGrow: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        color="text.primary"
                        sx={{ letterSpacing: 0.2 }}
                      >
                        {day}
                      </Typography>
                      <Badge
                        badgeContent={slots.length}
                        color={slots.length > 0 ? 'success' : 'default'}
                        sx={{
                          position: 'relative',
                          top: 0,
                          left: 0,
                          '& .MuiBadge-badge': {
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            px: 0.3,
                            py: 0.2,
                            borderRadius: 1.2,
                            minWidth: 15,
                            minHeight: 15,
                            background: slots.length > 0 ? theme.palette.success.main : theme.palette.grey[400],
                            color: '#fff',
                            boxShadow: '0 1px 4px rgba(80,80,120,0.08)',
                            transition: 'all 0.2s',
                            ml: 0.7,
                          },
                        }}
                      />
                    </Stack>
                    
                    {/* Time Slots */}
                    <Box sx={{ width: '100%', flex: 1 }}>
                      {slots.length > 0 ? (
                        <Stack spacing={1.5}>
                          {slots.map((slot, idx) => (
                            <Fade in timeout={400 + idx * 80} key={idx}>
                              <Card
                                variant="outlined"
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  borderColor: (dayColor, 0.3),
                                  bgcolor: (dayColor, 0.05),
                                  transition: 'all 0.2s',
                                  '&:hover': {
                                    bgcolor: (dayColor, 0.1),
                                    transform: 'scale(1.02)',
                                  },
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <AccessTimeIcon 
                                    fontSize="small" 
                                    sx={{ color: (dayColor, 0.8) }} 
                                  />
                                  <Box>
                                    <Typography variant="body2" fontWeight={600} sx={{ color: dayColor }}>
                                      {formatTo12Hour(slot.startTime)} - {formatTo12Hour(slot.endTime)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      ({calculateDuration(slot.startTime, slot.endTime)})
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Card>
                            </Fade>
                          ))}
                        </Stack>
                      ) : (
                        <Stack 
                          direction="row" 
                          alignItems="center" 
                          justifyContent="center"
                          spacing={1} 
                          sx={{ 
                            height: '100%', 
                            minHeight: 100,
                            opacity: 0.7 
                          }}
                        >
                          <EventBusyIcon color="disabled" />
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            No availability
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        <EditAvailabilityModal
          open={editOpen}
          onClose={handleEditClose}
          onSave={handleEditConfirm}
          initialData={{
            suburb: availability.suburb || '',
            kmWillingToTravel: availability.kmWillingToTravel || '',
            customTimeSlots: customTimeSlots || [],
          }}
        />
      </Paper>
    </Box>
  );
});

DashboardAvailability.propTypes = {
  onboardingData: PropTypes.object,
  onEdit: PropTypes.func,
};

export default DashboardAvailability;