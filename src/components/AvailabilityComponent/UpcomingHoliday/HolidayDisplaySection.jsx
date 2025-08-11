import React, { useMemo } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  LinearProgress,
  Paper,
  List,
  ListItem,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  InputAdornment,
  Avatar,
  alpha
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

// Utility functions
const calculateDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  return diffDays;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start.toDateString() === end.toDateString()) {
    return formatDate(startDate);
  }
  
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};


const isDateInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  checkDate.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  return checkDate >= start && checkDate <= end;
};

const getDaysUntilHoliday = (startDate) => {
  const today = new Date();
  const start = new Date(startDate);
  
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  
  const diffTime = start - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

const getHolidayStatus = (startDate, endDate) => {
  const today = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isDateInRange(today, startDate, endDate)) {
    return 'ongoing';
  } else if (end < today) {
    return 'past';
  } else {
    return 'upcoming';
  }
};

// Main component
const HolidayDisplaySection = ({
  upcomingHolidays,
  holidaysLoading,
  holidaysError,
  setOpenHolidayDialog,
  setEditingHoliday,
  deleteHoliday,
  theme
}) => {
  
  const sortedHolidays = useMemo(() => {
    if (!upcomingHolidays || upcomingHolidays.length === 0) return [];
    
    return [...upcomingHolidays].sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA - dateB;
    });
  }, [upcomingHolidays]);

  const renderHolidayCard = (holiday) => {
    const status = getHolidayStatus(holiday.startDate, holiday.endDate);
    const daysUntil = getDaysUntilHoliday(holiday.startDate);
    const duration = calculateDaysDifference(holiday.startDate, holiday.endDate);
    const isOngoing = status === 'ongoing';
    const isPast = status === 'past';
    const isUpcoming = status === 'upcoming';

    return (
      <ListItem
        key={holiday._id}
        sx={{
          flexDirection: 'column',
          alignItems: 'stretch',
          mb: 2,
          p: 0,
          borderRadius: 3,
          boxShadow: theme.shadows[2],
          bgcolor: 'background.paper',
          border: isOngoing 
            ? `2px solid ${theme.palette.warning.main}` 
            : '1px solid',
          borderColor: isOngoing 
            ? theme.palette.warning.main 
            : alpha(theme.palette.divider, 0.12),
          opacity: isPast ? 0.75 : 1,
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[4],
            transform: 'translateY(-2px)',
            borderColor: alpha(theme.palette.primary.main, 0.3)
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header with title and status */}
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: isOngoing
                      ? alpha(theme.palette.warning.main, 0.15)
                      : isPast
                      ? alpha(theme.palette.grey[500], 0.15)
                      : alpha(theme.palette.primary.main, 0.15),
                    color: isOngoing
                      ? theme.palette.warning.main
                      : isPast
                      ? theme.palette.grey[600]
                      : theme.palette.primary.main
                  }}
                >
                  <EventIcon fontSize="small" />
                </Avatar>
                
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: isPast ? 'text.secondary' : 'text.primary',
                    flex: 1
                  }}
                >
                  {holiday.name}
                </Typography>

                {/* Status chip */}
                {isOngoing && (
                  <Chip
                    label="Ongoing"
                    size="small"
                    sx={{
                      bgcolor: theme.palette.warning.main,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                )}
                
                {isPast && (
                  <Chip
                    label="Past"
                    size="small"
                    sx={{
                      bgcolor: theme.palette.grey[500],
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                )}

                {isUpcoming && daysUntil <= 7 && (
                  <Chip
                    label={`In ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      bgcolor: theme.palette.success.main,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </Box>

              {/* Description */}
              {holiday.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontStyle: 'italic',
                    mb: 2,
                    pl: 5 // Align with the content below the avatar
                  }}
                >
                  {holiday.description}
                </Typography>
              )}
            </Box>

            {/* Action buttons */}
            <Box display="flex" gap={0.5} ml={2}>
              <Tooltip title="Edit holiday" arrow>
                <IconButton
                  onClick={() => {
                    setEditingHoliday(holiday);
                    setOpenHolidayDialog(true);
                  }}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Delete holiday" arrow>
                <IconButton
                  onClick={() => deleteHoliday(holiday._id)}
                  size="small"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: theme.palette.error.main,
                      bgcolor: alpha(theme.palette.error.main, 0.1)
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Date and duration info */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              pl: 5, // Align with content
              flexWrap: 'wrap'
            }}
          >
            {/* Date range */}
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarIcon 
                fontSize="small" 
                sx={{ color: 'text.secondary' }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary'
                }}
              >
                {formatDateRange(holiday.startDate, holiday.endDate)}
              </Typography>
            </Box>

            {/* Duration */}
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTimeIcon 
                fontSize="small" 
                sx={{ color: 'text.secondary' }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {duration} day{duration !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {/* Days until (for upcoming holidays) */}
            {isUpcoming && daysUntil > 0 && (
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: daysUntil <= 7 
                      ? theme.palette.success.main 
                      : theme.palette.info.main
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: daysUntil <= 7 
                      ? theme.palette.success.main 
                      : theme.palette.info.main,
                    fontWeight: 600
                  }}
                >
                  {daysUntil === 0 ? 'Today' : 
                   daysUntil === 1 ? 'Tomorrow' : 
                   `In ${daysUntil} days`}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </ListItem>
    );
  };

  return (
    <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          height: '100%',
          boxShadow: theme.shadows[1],
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box mb={3}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Upcoming Holidays
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage your holidays and get notified about upcoming events.
            </Typography>
            <Button 
              onClick={() => setOpenHolidayDialog(true)} 
              variant="outlined" 
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
              startIcon={<CalendarIcon />}
            >
              Add Holiday
            </Button>
          </Box>

          {/* Content */}
          {holidaysLoading ? (
            <Box sx={{ my: 2 }}>
              <LinearProgress sx={{ borderRadius: 1 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Loading holidays...
              </Typography>
            </Box>
          ) : holidaysError ? (
            <Alert severity="error" sx={{ my: 2, borderRadius: 2 }}>
              Failed to load holidays. Please try again.
            </Alert>
          ) : (
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {sortedHolidays.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    borderRadius: 3,
                    borderStyle: 'dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  }}
                >
                  <CalendarIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: alpha(theme.palette.primary.main, 0.5),
                      mb: 2 
                    }} 
                  />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No holidays added yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add your first holiday to get started with tracking important dates.
                  </Typography>
                </Paper>
              ) : (
                <List sx={{ p: 0 }}>
                  {sortedHolidays.map(renderHolidayCard)}
                </List>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default HolidayDisplaySection;


//  Here if the edit not opening for that check the deepseek and manage from there
// by adding the dialog when needed