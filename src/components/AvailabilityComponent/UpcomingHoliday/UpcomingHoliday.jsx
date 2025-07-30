import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  Stack,
  Tooltip,
  Alert,
  InputAdornment,
  Chip as MuiChip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserUpcomingHolidays, createUserUpcomingHoliday, deleteUserUpcomingHoliday, updateUserUpcomingHoliday } from '../../../api/holidays';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parse, isValid, isBefore, isAfter, isSameDay, addYears, endOfYear, getYear, getMonth } from 'date-fns';

// Helper: Get the allowed year(s) based on current date
const getAllowedYears = () => {
  const now = new Date();
  const currentYear = getYear(now);
  const isDecember = getMonth(now) === 11; // December is month 11 (0-indexed)
  
  // If current month is December, allow both current year and next year
  return isDecember ? [currentYear, currentYear + 1] : [currentYear];
};

// Helper: Check if a date is within allowed years
const isDateAllowed = (date) => {
  if (!date) return false;
  return getAllowedYears().includes(getYear(date));
};

// Helper: Group holidays by month
const groupHolidaysByMonth = (holidays) => {
  if (!holidays || holidays.length === 0) return [];
  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const grouped = {};

  sortedHolidays.forEach(holiday => {
    const startDate = new Date(holiday.startDate);
    const endDate = new Date(holiday.endDate);
    // Get all months between startDate and endDate (inclusive)
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const last = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (current <= last) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const monthName = current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!grouped[monthKey]) {
        grouped[monthKey] = { monthKey, monthName, holidays: [] };
      }
      // Avoid duplicates in the same month
      if (!grouped[monthKey].holidays.some(h => h._id === holiday._id)) {
        grouped[monthKey].holidays.push(holiday);
      }
      // Move to next month
      current.setMonth(current.getMonth() + 1);
    }
  });
  return Object.values(grouped).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
};

// Helper: Format date for display
const formatDateDisplay = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, 'MMM d, yyyy');
  } catch {
    return '';
  }
};

// Helper: Parse user input into a date with automatic year handling
const parseUserDateInput = (input, referenceDate = new Date()) => {
  if (!input) return null;

  const allowedYears = getAllowedYears();
  const currentYear = getYear(referenceDate);
  const isDecember = getMonth(referenceDate) === 11;

  // Try MM/dd/yyyy first
  let parsed = parse(input, 'MM/dd/yyyy', referenceDate);
  if (isValid(parsed) && isDateAllowed(parsed)) return parsed;

  // Try MM/dd (handle year automatically)
  const mmddMatch = input.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (mmddMatch) {
    const [_, mm, dd] = mmddMatch;
    const month = parseInt(mm, 10) - 1; // 0-indexed
    const day = parseInt(dd, 10);
    
    // Determine which year to use
    let year;
    if (isDecember) {
      // If December, use next year for months January-November
      year = month >= 0 && month <= 10 ? currentYear + 1 : currentYear;
    } else {
      year = currentYear;
    }
    
    // Only allow if year is in allowed years
    if (allowedYears.includes(year)) {
      parsed = new Date(year, month, day);
      if (isValid(parsed)) return parsed;
    }
  }

  // Try MM (handle as first day of month)
  const mmMatch = input.match(/^(\d{1,2})$/);
  if (mmMatch) {
    const month = parseInt(mmMatch[1], 10) - 1; // 0-indexed
    
    // Determine which year to use
    let year;
    if (isDecember) {
      // If December, use next year for months January-November
      year = month >= 0 && month <= 10 ? currentYear + 1 : currentYear;
    } else {
      year = currentYear;
    }
    
    // Only allow if year is in allowed years
    if (allowedYears.includes(year)) {
      parsed = new Date(year, month, 1);
      if (isValid(parsed)) return parsed;
    }
  }

  return null;
};

// Helper: Format date string for input field with year handling
const formatDateInput = (date) => {
  if (!date) return '';
  return format(date, 'MM/dd/yyyy');
};

// Helper: Get min and max date for holiday selection
const getMinDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1); // Jan 1st of current year
};

const getMaxDate = () => {
  const now = new Date();
  // If December, allow up to end of next year
  return endOfYear(addYears(now, getMonth(now) === 11 ? 1 : 0));
};

// Helper: Should disable month selection based on current date
const shouldDisableMonth = (monthDate) => {
  const now = new Date();
  const currentYear = getYear(now);
  const currentMonth = getMonth(now);
  const monthYear = getYear(monthDate);
  const month = getMonth(monthDate);
  
  // Disable if:
  // 1. Month is in the past for current year
  // 2. Month is in current year when we're in December (should only allow next year)
  return (monthYear === currentYear && month < currentMonth) || 
         (getMonth(now) === 11 && monthYear === currentYear);
};

const UpcomingHoliday = ({
  cardTitle = 'Upcoming Holidays',
  cardDescription = 'We will notify you about upcoming holidays. You can also add your own holidays below.',
  maxHeight = 400,
  onChange,
}) => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: upcomingHolidays = [], isLoading: holidaysLoading, isError: holidaysError } = useQuery({
    queryKey: ['userHolidays'],
    queryFn: fetchUserUpcomingHolidays,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: true,
  });
  
  const { mutate: createHoliday, isPending: isCreating, error: createError } = useMutation({
    mutationFn: createUserUpcomingHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userHolidays'] });
      onChange && onChange();
    },
  });
  
  const { mutate: deleteHoliday } = useMutation({
    mutationFn: deleteUserUpcomingHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userHolidays'] });
      onChange && onChange();
    },
  });
  
  const { mutate: editHoliday } = useMutation({
    mutationFn: ({ id, data }) => updateUserUpcomingHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userHolidays'] });
      onChange && onChange();
    },
  });

  // Dialog state
  const [openHolidayDialog, setOpenHolidayDialog] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ 
    name: '', 
    startDate: null, 
    endDate: null, 
    description: '' 
  });
  const [holidayError, setHolidayError] = useState('');
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [dateOverlapWarning, setDateOverlapWarning] = useState('');
  const [dateInputs, setDateInputs] = useState({
    startDate: '',
    endDate: ''
  });

  // Overlap check - memoized for performance
  const checkDateOverlap = useCallback((startDate, endDate, excludeHolidayId = null) => {
    if (!startDate || !endDate) return false;
    
    return upcomingHolidays.some(holiday => {
      if (excludeHolidayId && holiday._id === excludeHolidayId) return false;
      
      const existingStart = new Date(holiday.startDate);
      const existingEnd = new Date(holiday.endDate);
      
      return (
        (isBefore(startDate, existingEnd) && isAfter(endDate, existingStart)) ||
        (isBefore(existingStart, endDate) && isAfter(existingEnd, startDate))
      );
    });
  }, [upcomingHolidays]);

  // Reset form when dialog opens/closes or when editing changes
  useEffect(() => {
    if (editingHoliday) {
      setNewHoliday({
        name: editingHoliday.name,
        startDate: new Date(editingHoliday.startDate),
        endDate: new Date(editingHoliday.endDate),
        description: editingHoliday.description || '',
      });
      setDateInputs({
        startDate: formatDateInput(new Date(editingHoliday.startDate)),
        endDate: formatDateInput(new Date(editingHoliday.endDate))
      });
    } else {
      setNewHoliday({ name: '', startDate: null, endDate: null, description: '' });
      setDateInputs({ startDate: '', endDate: '' });
    }
    setHolidayError('');
    setDateOverlapWarning('');
  }, [editingHoliday, openHolidayDialog]);

  const handleCreateOrEditHoliday = () => {
    setHolidayError('');
    
    // Validate required fields
    if (!newHoliday.name || !newHoliday.startDate || !newHoliday.endDate) {
      setHolidayError('Name, start date, and end date are required.');
      return;
    }
    
    // Validate dates are within allowed years
    if (!isDateAllowed(newHoliday.startDate) || !isDateAllowed(newHoliday.endDate)) {
      setHolidayError(`Dates must be in ${getAllowedYears().join(' or ')}.`);
      return;
    }
    
    // Validate date order
    if (isAfter(newHoliday.startDate, newHoliday.endDate)) {
      setHolidayError('End date cannot be before start date.');
      return;
    }
    
    // Validate start date is not in the past
    if (isBefore(newHoliday.startDate, new Date())) {
      setHolidayError('Start date cannot be in the past.');
      return;
    }
    
    // Check for overlaps with existing holidays
    const hasOverlap = checkDateOverlap(
      newHoliday.startDate,
      newHoliday.endDate,
      editingHoliday?._id
    );
    
    if (hasOverlap) {
      setHolidayError('This date range overlaps with an existing holiday. Please choose different dates.');
      return;
    }
    
    // Prepare data for API
    const holidayData = {
      name: newHoliday.name,
      startDate: newHoliday.startDate.toISOString().split('T')[0],
      endDate: newHoliday.endDate.toISOString().split('T')[0],
      description: newHoliday.description
    };
    
    if (editingHoliday) {
      editHoliday(
        { id: editingHoliday._id, data: holidayData },
        {
          onSuccess: () => {
            setOpenHolidayDialog(false);
            setEditingHoliday(null);
          },
          onError: () => setHolidayError('Failed to update holiday.'),
        }
      );
    } else {
      createHoliday(holidayData, {
        onSuccess: () => {
          setOpenHolidayDialog(false);
        },
        onError: () => setHolidayError('Failed to create holiday.'),
      });
    }
  };

  // Handle manual date input change with automatic year handling
  const handleDateInputChange = (type, value) => {
    setDateInputs(prev => ({ ...prev, [type]: value }));
    
    // Parse the input with automatic year handling
    const parsedDate = parseUserDateInput(value);
    
    if (parsedDate && isValid(parsedDate)) {
      // Only update if the parsed date is valid and within allowed years
      setNewHoliday(prev => ({ ...prev, [type]: parsedDate }));
      
      // Check for overlaps when both dates are present
      if (type === 'startDate' && newHoliday.endDate) {
        const hasOverlap = checkDateOverlap(
          parsedDate,
          newHoliday.endDate,
          editingHoliday?._id
        );
        setDateOverlapWarning(
          hasOverlap ? 'Warning: This date range overlaps with an existing holiday' : ''
        );
      } else if (type === 'endDate' && newHoliday.startDate) {
        const hasOverlap = checkDateOverlap(
          newHoliday.startDate,
          parsedDate,
          editingHoliday?._id
        );
        setDateOverlapWarning(
          hasOverlap ? 'Warning: This date range overlaps with an existing holiday' : ''
        );
      }
    } else {
      // Clear the date if invalid
      setNewHoliday(prev => ({ ...prev, [type]: null }));
      setDateOverlapWarning('');
    }
  };

  // Handle date picker change with year validation
  const handleDatePickerChange = (type, date) => {
    if (!date || !isValid(date)) {
      setNewHoliday(prev => ({ ...prev, [type]: null }));
      setDateInputs(prev => ({ ...prev, [type]: '' }));
      return;
    }
    
    // Ensure the selected date is within allowed years
    if (!isDateAllowed(date)) {
      setHolidayError(`Dates must be in ${getAllowedYears().join(' or ')}.`);
      return;
    }
    
    setNewHoliday(prev => ({ ...prev, [type]: date }));
    setDateInputs(prev => ({ ...prev, [type]: formatDateInput(date) }));
    
    // Check for overlaps
    if (type === 'startDate' && newHoliday.endDate) {
      const hasOverlap = checkDateOverlap(
        date,
        newHoliday.endDate,
        editingHoliday?._id
      );
      setDateOverlapWarning(
        hasOverlap ? 'Warning: This date range overlaps with an existing holiday' : ''
      );
    } else if (type === 'endDate' && newHoliday.startDate) {
      const hasOverlap = checkDateOverlap(
        newHoliday.startDate,
        date,
        editingHoliday?._id
      );
      setDateOverlapWarning(
        hasOverlap ? 'Warning: This date range overlaps with an existing holiday' : ''
      );
    }
  };

  // Only show months with at least one ongoing or upcoming holiday
  const groupedHolidays = useMemo(() => {
    const today = new Date();
    const groups = groupHolidaysByMonth(upcomingHolidays);
    return groups.filter(group =>
      group.holidays.some(h => new Date(h.endDate) >= today)
    );
  }, [upcomingHolidays]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{cardTitle}</Typography>
      <Typography variant="body2" color="text.secondary">{cardDescription}</Typography>
      <Button 
        onClick={() => setOpenHolidayDialog(true)} 
        variant="outlined" 
        sx={{ my: 2 }}
        startIcon={<AddIcon />}
      >
        Add Upcoming Holiday
      </Button>
      
      {holidaysLoading ? (
        <LinearProgress sx={{ my: 2 }} />
      ) : holidaysError ? (
        <Alert severity="error" sx={{ my: 2 }}>Failed to load holidays</Alert>
      ) : (
        <Box sx={{ maxHeight, overflowY: 'auto' }}>
          {upcomingHolidays.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                borderStyle: 'dashed'
              }}
            >
              <CalendarIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No upcoming holidays found.
              </Typography>
            </Paper>
          ) : (
            groupedHolidays.map((monthGroup) => (
              <Box key={monthGroup.monthKey} sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    p: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                  >
                    {monthGroup.monthName}
                  </Typography>
                  <MuiChip
                    label={monthGroup.holidays.length}
                    size="small"
                    sx={{ ml: 'auto', bgcolor: theme.palette.primary.main, color: 'white', fontWeight: 600 }}
                  />
                </Box>
                <List sx={{ p: 0 }}>
                  {monthGroup.holidays.map((holiday) => {
                    const start = new Date(holiday.startDate);
                    const end = new Date(holiday.endDate);
                    const isSingleDay = isSameDay(start, end);
                    const isToday = isSameDay(start, new Date());
                    const isPast = isBefore(end, new Date());
                    return (
                      <ListItem
                        key={holiday._id}
                        sx={{
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          mb: 1.5,
                          borderRadius: 2,
                          boxShadow: 1,
                          bgcolor: 'background.paper',
                          border: isToday ? `2px solid ${theme.palette.warning.main}` : '1px solid',
                          borderColor: isToday ? theme.palette.warning.main : 'divider',
                          opacity: isPast ? 0.7 : 1,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: theme.shadows[3],
                            transform: 'translateY(-1px)'
                          }
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2} justifyContent="space-between" width="100%">
                          <Box display="flex" alignItems="center" gap={2} flex={1}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                bgcolor: isToday 
                                  ? alpha(theme.palette.warning.main, 0.1)
                                  : alpha(theme.palette.primary.main, 0.1),
                                color: isToday 
                                  ? theme.palette.warning.main
                                  : theme.palette.primary.main
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {start.getDate()}
                              </Typography>
                            </Box>
                            <Box flex={1}>
                              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {holiday.name}
                                </Typography>
                                {isToday && (
                                  <MuiChip
                                    label="Today"
                                    size="small"
                                    sx={{ bgcolor: theme.palette.warning.main, color: 'white', fontSize: '0.7rem', height: 20 }}
                                  />
                                )}
                                {isPast && (
                                  <MuiChip
                                    label="Past"
                                    size="small"
                                    sx={{ bgcolor: theme.palette.grey[500], color: 'white', fontSize: '0.7rem', height: 20 }}
                                  />
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {isSingleDay
                                  ? format(start, 'EEE, MMM d')
                                  : `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`
                                }
                              </Typography>
                              {holiday.description && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}
                                >
                                  {holiday.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box display="flex" gap={0.5}>
                            <Tooltip title="Edit holiday" arrow>
                              <IconButton
                                aria-label="edit"
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
                                aria-label="delete"
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
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ))
          )}
        </Box>
      )}
      
      {/* Holiday Creation Dialog */}
      <Dialog 
        open={openHolidayDialog} 
        onClose={() => { setOpenHolidayDialog(false); setEditingHoliday(null); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, boxShadow: theme.shadows[10] } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
              <CalendarIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {editingHoliday ? 'Edit Holiday' : 'Add Holiday'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editingHoliday ? 'Update your holiday details' : 'Add a new upcoming holiday'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ px: 3, py: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Holiday Name"
              value={newHoliday.name}
              onChange={e => {
                setNewHoliday({ ...newHoliday, name: e.target.value });
                if (holidayError) setHolidayError('');
              }}
              fullWidth
              required
              placeholder="e.g., Christmas Break, Summer Vacation"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {/* Start Date */}
                <Box flex={1}>
                  <DatePicker
                    label="Start Date"
                    value={newHoliday.startDate}
                    onChange={(date) => handleDatePickerChange('startDate', date)}
                    minDate={getMinDate()}
                    maxDate={getMaxDate()}
                    shouldDisableMonth={shouldDisableMonth}
                    inputFormat="MM/dd/yyyy"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        placeholder="mm/dd or mm/dd/yyyy"
                        value={dateInputs.startDate}
                        onChange={(e) => handleDateInputChange('startDate', e.target.value)}
                        error={!!holidayError && !newHoliday.startDate}
                        helperText={
                          (holidayError && !newHoliday.startDate ? 'Start date is required' : '') +
                          ` Year is auto-filled. Only ${getAllowedYears().join(' or ')} allowed.`
                        }
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
                
                {/* End Date */}
                <Box flex={1}>
                  <DatePicker
                    label="End Date"
                    value={newHoliday.endDate}
                    onChange={(date) => handleDatePickerChange('endDate', date)}
                    minDate={newHoliday.startDate || getMinDate()}
                    maxDate={getMaxDate()}
                    shouldDisableMonth={shouldDisableMonth}
                    inputFormat="MM/dd/yyyy"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        placeholder="mm/dd or mm/dd/yyyy"
                        value={dateInputs.endDate}
                        onChange={(e) => handleDateInputChange('endDate', e.target.value)}
                        error={!!holidayError && !newHoliday.endDate}
                        helperText={
                          (holidayError && !newHoliday.endDate ? 'End date is required' : '') +
                          ` Year is auto-filled. Only ${getAllowedYears().join(' or ')} allowed.`
                        }
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Box>
              </Stack>
            </LocalizationProvider>
            
            <TextField
              label="Description (Optional)"
              value={newHoliday.description}
              onChange={e => {
                setNewHoliday({ ...newHoliday, description: e.target.value });
                if (holidayError) setHolidayError('');
              }}
              fullWidth
              multiline
              rows={3}
              placeholder="Add any additional details about your holiday..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InfoIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            {dateOverlapWarning && (
              <Alert 
                severity="warning" 
                sx={{ mt: 1, animation: 'fadeIn 0.3s ease-in-out' }}
                onClose={() => setDateOverlapWarning('')}
              >
                {dateOverlapWarning}
              </Alert>
            )}
            
            {(holidayError || createError) && (
              <Alert 
                severity="error" 
                sx={{ mt: 1, animation: 'fadeIn 0.3s ease-in-out' }}
                onClose={() => setHolidayError('')}
              >
                {holidayError || createError?.message}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => { setOpenHolidayDialog(false); setEditingHoliday(null); }}
            color="inherit"
            size="large"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateOrEditHoliday} 
            variant="contained" 
            disabled={isCreating || !newHoliday.name || !newHoliday.startDate || !newHoliday.endDate}
            size="large"
            sx={{ minWidth: 100 }}
          >
            {isCreating ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    border: '2px solid',
                    borderColor: 'currentColor',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                {editingHoliday ? 'Updating...' : 'Creating...'}
              </Box>
            ) : (
              editingHoliday ? 'Update Holiday' : 'Add Holiday'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UpcomingHoliday;