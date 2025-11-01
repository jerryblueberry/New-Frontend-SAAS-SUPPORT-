import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  LinearProgress,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  useMediaQuery,
  Fade,
  Badge,
  Divider
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  CalendarMonth as CalendarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Utility functions (keeping the same as before)
const calculateDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const formatDate = (date, compact = false) => {
  const dateObj = new Date(date);
  if (compact) {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateRange = (startDate, endDate, compact = false) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start.toDateString() === end.toDateString()) {
    return formatDate(startDate, compact);
  }
  
  if (compact) {
    return `${formatDate(startDate, true)} - ${formatDate(endDate, true)}`;
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
  deleteHoliday
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      <Fade in timeout={300}>
        <Paper
          key={holiday._id}
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
            border: isOngoing 
              ? `2px solid ${theme.palette.warning.main}` 
              : '1px solid',
            borderColor: isOngoing 
              ? theme.palette.warning.main 
              : alpha(theme.palette.divider, 0.12),
            bgcolor: 'background.paper',
            opacity: isPast ? 0.7 : 1,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              boxShadow: theme.shadows[4],
              transform: 'translateY(-2px)',
              borderColor: alpha(theme.palette.primary.main, 0.3)
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 4,
              height: '100%',
              bgcolor: isOngoing
                ? theme.palette.warning.main
                : isPast
                ? theme.palette.grey[400]
                : theme.palette.primary.main,
              opacity: 0.8
            }
          }}
        >
          <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
            {/* Header */}
            <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
              <Box flex={1} minWidth={0}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Avatar
                    sx={{
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
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
                    variant={isMobile ? "subtitle2" : "h6"}
                    sx={{
                      fontWeight: 550,
                      color: isPast ? 'text.secondary' : 'text.primary',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                    }}
                  >
                    {holiday.name}
                  </Typography>
                </Box>

                {/* Description */}
                {holiday.description && !isMobile && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontStyle: 'italic',
                      mb: 1,
                      pl: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem'
                    }}
                  >
                    {holiday.description}
                  </Typography>
                )}
              </Box>

              {/* Status and Actions */}
              <Box display="flex" alignItems="center" gap={0.5} ml={1}>
                {/* Status chip */}
                {isOngoing && (
                  <Chip
                    label="Now"
                    size="small"
                    sx={{
                      bgcolor: theme.palette.warning.main,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      height: 18
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
                      fontSize: '0.65rem',
                      height: 18
                    }}
                  />
                )}

                {isUpcoming && daysUntil <= 7 && (
                  <Chip
                    label={daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                    size="small"
                    sx={{
                      bgcolor: theme.palette.success.main,
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      height: 18
                    }}
                  />
                )}

                {/* Action buttons */}
                <Box display="flex" gap={0.25}>
                  <Tooltip title="Edit" arrow>
                    <IconButton
                      onClick={() => {
                        setEditingHoliday(holiday);
                        setOpenHolidayDialog(true);
                      }}
                      size="small"
                      sx={{
                        width: 24,
                        height: 24,
                        color: 'text.secondary',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete" arrow>
                    <IconButton
                      onClick={() => deleteHoliday(holiday._id)}
                      size="small"
                      sx={{
                        width: 24,
                        height: 24,
                        color: 'text.secondary',
                        '&:hover': {
                          color: theme.palette.error.main,
                          bgcolor: alpha(theme.palette.error.main, 0.1)
                        }
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            {/* Date and duration info - compact layout */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                pl: 1,
                flexWrap: 'wrap'
              }}
            >
              {/* Date range */}
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarIcon 
                  fontSize="small" 
                  sx={{ color: 'text.secondary', fontSize: 14 }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                  }}
                >
                  {formatDateRange(holiday.startDate, holiday.endDate, isMobile)}
                </Typography>
              </Box>

              {/* Duration */}
              <Box display="flex" alignItems="center" gap={0.5}>
                <ScheduleIcon 
                  fontSize="small" 
                  sx={{ color: 'text.secondary', fontSize: 14 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 500, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                >
                  {duration}d
                </Typography>
              </Box>

              {/* Days until indicator */}
              {isUpcoming && daysUntil > 0 && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
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
                      fontWeight: 600,
                      fontSize: { xs: '0.65rem', sm: '0.7rem' }
                    }}
                  >
                    {daysUntil === 0 ? 'Today' : 
                     daysUntil === 1 ? 'Tomorrow' : 
                     `${daysUntil}d`}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Paper>
      </Fade>
    );
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        boxShadow: theme.shadows[1],
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%',
        p: { xs: 1, md: 0 },
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
      }}
    >
      <CardContent sx={{ 
        p: { xs: 2, md: 2 },
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, md: 2 },
        minHeight: 0
      }}>
          {/* Header */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    width: { xs: 32, lg: 36 },
                    height: { xs: 32, lg: 36 },
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <CalendarIcon fontSize="small" />
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: { xs: '0.95rem', sm: '1rem', lg: '1.1rem' }, 
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Holidays
                    </Typography>
                    {sortedHolidays.length > 0 && (
                      <Badge
                        badgeContent={sortedHolidays.length}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                            height: { xs: 18, sm: 20, md: 20 },
                            minWidth: { xs: 18, sm: 20, md: 20 },
                            fontWeight: 600,
                            right: { xs: -3, sm: -1, md: -1 },
                            top: { xs: 0, sm: 0, md: 0 },
                            border: `2px solid ${theme.palette.background.paper}`,
                            boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`
                          }
                        }}
                      />
                    )}
                  </Box>
                  {isMobile  && (
                       <Typography 
                       variant="body2" 
                       color="text.secondary" 
                       sx={{ 
                         fontSize: { xs: '0.75rem', lg: '0.78rem' },
                         overflow: 'hidden',
                         textOverflow: 'ellipsis'
                       }}
                     >
                       Track your upcoming holidays
                     </Typography>
                  )}
               
                </Box>
              </Box>
              <Button 
                onClick={() => setOpenHolidayDialog(true)} 
                variant="contained"
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 'auto',
                  px: { xs: 1, lg: 1.25 },
                  py: 0.4,
                  height: 30,
                  lineHeight: 1.2,
                  fontSize: { xs: '0.72rem', lg: '0.78rem' },
                  boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.25)}`,
                  '& .MuiButton-startIcon': { mr: 0.5 },
                  '& .MuiButton-startIcon > svg': { fontSize: 16 },
                  flexShrink: 0,
                  '&:hover': {
                    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
                startIcon={<AddIcon />}
              >
                {isMobile ? 'Add' : 'Add Holiday'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 2, opacity: 0.5 }} />

          {/* Content */}
          {holidaysLoading ? (
            <Box sx={{ my: 2 }}>
              <LinearProgress sx={{ borderRadius: 1, height: 4 }} />
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: 1, textAlign: 'center', fontSize: '0.75rem' }}
              >
                Loading holidays...
              </Typography>
            </Box>
          ) : holidaysError ? (
            <Alert 
              severity="error" 
              sx={{ 
                my: 2, 
                borderRadius: 2,
                '& .MuiAlert-message': { fontSize: '0.75rem' }
              }}
            >
              Failed to load holidays. Please try again.
            </Alert>
          ) : (
            <Box sx={{ 
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              // Better scrollbar styling
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(theme.palette.divider, 0.1),
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.primary.main, 0.3),
                borderRadius: '3px',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.5),
                },
              },
            }}>
              {sortedHolidays.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 3, sm: 3.5, lg: 4 },
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 3,
                    borderStyle: 'dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    borderWidth: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
                      pointerEvents: 'none'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Avatar
                      sx={{
                        width: { xs: 56, lg: 64 },
                        height: { xs: 56, lg: 64 },
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: alpha(theme.palette.primary.main, 0.7),
                        mx: 'auto',
                        mb: 2,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }}
                    >
                      <CalendarIcon sx={{ fontSize: { xs: 28, lg: 32 } }} />
                    </Avatar>
                    <Typography 
                      variant="h6" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1, 
                        fontSize: { xs: '0.9rem', sm: '1rem', lg: '1.1rem' }, 
                        fontWeight: 600 
                      }}
                    >
                      No holidays yet
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ fontSize: { xs: '0.75rem', lg: '0.8rem' }, opacity: 0.8 }}
                    >
                      Add your first holiday to get started
                    </Typography>
                  </Box>
                </Paper>
              ) : (
                <Box sx={{ p: 0 }}>
                  {sortedHolidays.map(renderHolidayCard)}
                </Box>
              )}
            </Box>
          )}
      </CardContent>
    </Card>
  );
};

export default HolidayDisplaySection;