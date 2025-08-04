import React, { forwardRef, useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import DatePicker from 'react-datepicker';
import { 
  CalendarMonth as CalendarIcon,
  Clear as ClearIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import 'react-datepicker/dist/react-datepicker.css';

// Date utility functions
const getDateBounds = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const maxYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  
  return {
    minDate: today,
    maxDate: new Date(maxYear, 11, 31),
    currentYear,
    showNextYear: currentMonth === 11
  };
};

const formatDateToISO = (date) => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

const parseISODate = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString + 'T00:00:00');
  return isNaN(date.getTime()) ? null : date;
};

const formatDateForDisplay = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Enhanced auto-formatting functions
const formatDateInput = (value, prevValue = '') => {
  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length === 0) return '';
  
  let formatted = '';
  
  // Handle different lengths
  if (cleaned.length <= 2) {
    // MM
    formatted = cleaned;
  } else if (cleaned.length <= 4) {
    // MM/DD
    formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  } else if (cleaned.length <= 8) {
    // MM/DD/YYYY
    formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  } else {
    // Limit to 8 digits (MMDDYYYY)
    const limited = cleaned.slice(0, 8);
    formatted = `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4, 8)}`;
  }
  
  return formatted;
};

const parseFormattedDateInput = (input) => {
  if (!input) return null;
  
  const currentYear = new Date().getFullYear();
  
  // Remove all non-numeric characters for parsing
  const cleaned = input.replace(/\D/g, '');
  
  if (cleaned.length < 2) return null;
  
  let month, day, year;
  
  if (cleaned.length <= 4) {
    // MM/DD format - assume current year
    month = parseInt(cleaned.slice(0, 2));
    day = parseInt(cleaned.slice(2, 4)) || 1;
    year = currentYear;
  } else {
    // MM/DD/YYYY format
    month = parseInt(cleaned.slice(0, 2));
    day = parseInt(cleaned.slice(2, 4));
    year = parseInt(cleaned.slice(4, 8));
    
    // Handle 2-digit years
    if (year < 100) {
      year += year < 50 ? 2000 : 1900;
    }
  }
  
  // Validate month and day ranges
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  
  const date = new Date(year, month - 1, day);
  
  // Check if the date is valid (handles cases like Feb 30)
  if (date.getMonth() !== month - 1) return null;
  
  return date;
};

const validateFormattedDateInput = (input) => {
  if (!input) return { isValid: true, error: '' };
  
  // Check if input is complete enough to validate
  const cleaned = input.replace(/\D/g, '');
  
  // If less than 4 digits, don't validate yet (still typing)
  if (cleaned.length < 4) {
    return { isValid: true, error: '', isPartial: true };
  }
  
  const date = parseFormattedDateInput(input);
  if (!date) {
    return { 
      isValid: false, 
      error: 'Invalid date. Please check month and day values.' 
    };
  }
  
  const { minDate, maxDate } = getDateBounds();
  if (date < minDate) {
    return { 
      isValid: false, 
      error: 'Date cannot be in the past' 
    };
  }
  
  if (date > maxDate) {
    return { 
      isValid: false, 
      error: 'Date is too far in the future' 
    };
  }
  
  return { isValid: true, error: '' };
};

// Enhanced Custom Input Component with auto-formatting
const EnhancedDateInput = forwardRef(
  ({ 
    value, 
    onClick, 
    placeholder, 
    error, 
    helperText, 
    onInputChange, 
    onInputBlur,
    onClear,
    showClear,
    inputValue,
    isTyping,
    disabled,
    ...props 
  }, ref) => {
    const theme = useTheme();
    
    return (
      <TextField
        {...props}
        ref={ref}
        fullWidth
        value={isTyping ? inputValue : (value || '')}
        onChange={onInputChange}
        onBlur={onInputBlur}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        disabled={disabled}
        inputProps={{
          maxLength: 10, // MM/DD/YYYY
          pattern: '[0-9/]*',
          inputMode: 'numeric'
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Tooltip title="Click to open calendar">
                <IconButton 
                  onClick={onClick} 
                  size="small"
                  disabled={disabled}
                  sx={{ 
                    color: error ? 'error.main' : 'action.active',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main'
                    }
                  }}
                >
                  <CalendarIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          endAdornment: showClear && (
            <InputAdornment position="end">
              <Tooltip title="Clear date">
                <IconButton 
                  onClick={onClear} 
                  size="small"
                  sx={{ 
                    color: 'action.active',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.main'
                    }
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          sx: {
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: error ? 'error.main' : 'primary.main',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            },
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.2s ease-in-out',
            backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
            '&:hover': {
              backgroundColor: disabled ? 'action.disabledBackground' : 'action.hover',
            },
            '&.Mui-focused': {
              backgroundColor: 'background.paper',
              boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
            },
          },
          '& .MuiInputLabel-root': {
            transform: 'none',
          },
        }}
      />
    );
  }
);

EnhancedDateInput.displayName = 'EnhancedDateInput';

const UpcomingHolidayDatePicker = ({
  newHoliday,
  setNewHoliday,
  editingHoliday,
  // holidayError,
  setHolidayError,
  dateOverlapWarning,
  setDateOverlapWarning,
  checkDateOverlap,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { minDate, maxDate, currentYear, showNextYear } = getDateBounds();

  // Local state for manual typing with auto-formatting
  const [startInputValue, setStartInputValue] = useState('');
  const [endInputValue, setEndInputValue] = useState('');
  const [isTypingStart, setIsTypingStart] = useState(false);
  const [isTypingEnd, setIsTypingEnd] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    start: '',
    end: ''
  });

  // Update display values when newHoliday changes
  useEffect(() => {
    if (!isTypingStart) {
      const startDate = parseISODate(newHoliday.startDate);
      setStartInputValue(startDate ? formatDateForDisplay(startDate) : '');
    }
  }, [newHoliday.startDate, isTypingStart]);

  useEffect(() => {
    if (!isTypingEnd) {
      const endDate = parseISODate(newHoliday.endDate);
      setEndInputValue(endDate ? formatDateForDisplay(endDate) : '');
    }
  }, [newHoliday.endDate, isTypingEnd]);

  const handleStartDateChange = (date) => {
    const isoDate = formatDateToISO(date);
    const updatedHoliday = { ...newHoliday, startDate: isoDate };
    
    if (newHoliday.endDate && date && parseISODate(newHoliday.endDate) < date) {
      updatedHoliday.endDate = '';
    }
    
    setNewHoliday(updatedHoliday);
    setIsTypingStart(false);
    
    // if (holidayError) setHolidayError('');
    setInputErrors(prev => ({ ...prev, start: '' }));
    
    checkOverlap(isoDate, updatedHoliday.endDate);
  };

  const handleEndDateChange = (date) => {
    const isoDate = formatDateToISO(date);
    setNewHoliday({ ...newHoliday, endDate: isoDate });
    setIsTypingEnd(false);
    
    // if (holidayError) setHolidayError('');
    setInputErrors(prev => ({ ...prev, end: '' }));
    
    checkOverlap(newHoliday.startDate, isoDate);
  };

  const handleStartInputChange = (e) => {
    const rawValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Format the input automatically
    const formattedValue = formatDateInput(rawValue, startInputValue);
    
    setStartInputValue(formattedValue);
    setIsTypingStart(true);
    
    // Clear previous errors for partial inputs
    const validation = validateFormattedDateInput(formattedValue);
    if (validation.isPartial) {
      setInputErrors(prev => ({ ...prev, start: '' }));
    }
    
    // if (holidayError) setHolidayError('');
    
    // Restore cursor position after formatting
    setTimeout(() => {
      if (e.target && typeof e.target.setSelectionRange === 'function') {
        const newCursorPos = cursorPosition + (formattedValue.length - rawValue.length);
        e.target.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleEndInputChange = (e) => {
    const rawValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Format the input automatically
    const formattedValue = formatDateInput(rawValue, endInputValue);
    
    setEndInputValue(formattedValue);
    setIsTypingEnd(true);
    
    // Clear previous errors for partial inputs
    const validation = validateFormattedDateInput(formattedValue);
    if (validation.isPartial) {
      setInputErrors(prev => ({ ...prev, end: '' }));
    }
    
    // if (holidayError) setHolidayError('');
    
    // Restore cursor position after formatting
    setTimeout(() => {
      if (e.target && typeof e.target.setSelectionRange === 'function') {
        const newCursorPos = cursorPosition + (formattedValue.length - rawValue.length);
        e.target.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleStartInputBlur = () => {
    if (!startInputValue.trim()) {
      setIsTypingStart(false);
      return;
    }

    const validation = validateFormattedDateInput(startInputValue);
    if (!validation.isValid && !validation.isPartial) {
      setInputErrors(prev => ({ ...prev, start: validation.error }));
      return;
    }

    // Only process if we have a complete date
    const cleaned = startInputValue.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      const parsedDate = parseFormattedDateInput(startInputValue);
      if (parsedDate) {
        handleStartDateChange(parsedDate);
      }
    }
  };

  const handleEndInputBlur = () => {
    if (!endInputValue.trim()) {
      setIsTypingEnd(false);
      return;
    }

    const validation = validateFormattedDateInput(endInputValue);
    if (!validation.isValid && !validation.isPartial) {
      setInputErrors(prev => ({ ...prev, end: validation.error }));
      return;
    }

    // Only process if we have a complete date
    const cleaned = endInputValue.replace(/\D/g, '');
    if (cleaned.length >= 4) {
      const parsedDate = parseFormattedDateInput(endInputValue);
      if (parsedDate) {
        // Additional validation for end date
        const startDate = parseISODate(newHoliday.startDate);
        if (startDate && parsedDate < startDate) {
          setInputErrors(prev => ({ 
            ...prev, 
            end: 'End date cannot be before start date' 
          }));
          return;
        }
        handleEndDateChange(parsedDate);
      }
    }
  };

  const checkOverlap = (startDate, endDate) => {
    if (startDate && endDate) {
      const hasOverlap = checkDateOverlap(startDate, endDate, editingHoliday?._id);
      setDateOverlapWarning(
        hasOverlap ? 'This date range overlaps with an existing holiday' : ''
      );
    } else {
      setDateOverlapWarning('');
    }
  };

  const handleClearStart = () => {
    setNewHoliday({ ...newHoliday, startDate: '', endDate: '' });
    setStartInputValue('');
    setEndInputValue('');
    setIsTypingStart(false);
    setIsTypingEnd(false);
    setInputErrors({ start: '', end: '' });
    setDateOverlapWarning('');
  };

  const handleClearEnd = () => {
    setNewHoliday({ ...newHoliday, endDate: '' });
    setEndInputValue('');
    setIsTypingEnd(false);
    setInputErrors(prev => ({ ...prev, end: '' }));
    setDateOverlapWarning('');
  };

  const getEndDateMinDate = () => {
    if (newHoliday.startDate) {
      const startDate = parseISODate(newHoliday.startDate);
      return startDate || minDate;
    }
    return minDate;
  };

  const yearRange = showNextYear 
    ? `${currentYear}-${currentYear + 1}` 
    : currentYear.toString();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Instructions */}
      <Alert 
        severity="info" 
        sx={{ 
          mb: 3,
          backgroundColor: 'primary.light',
          color: 'primary.contrastText',
          '& .MuiAlert-icon': {
            color: 'primary.contrastText'
          },
          '& .MuiAlert-message': {
            fontSize: '0.875rem'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <EditIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Smart Date Input
          </Typography>
        </Box>
        <Typography variant="body2">
          • Just type numbers - slashes are added automatically (e.g., type "1225" → "12/25")
          • Format: MM/DD/YYYY or MM/DD (current year assumed)
          • Click the calendar icon for visual date picker
        </Typography>
      </Alert>

      <Box 
        sx={{ 
          display: 'flex', 
          gap: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          mb: (dateOverlapWarning || inputErrors.start || inputErrors.end) ? 2 : 0
        }}
      >
        {/* Start Date */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1.5, 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            Start Date
            <Typography 
              component="span" 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontWeight: 400,
                backgroundColor: 'action.hover',
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: '0.75rem'
              }}
            >
              {yearRange}
            </Typography>
          </Typography>
          
          <DatePicker
            selected={parseISODate(newHoliday.startDate)}
            onChange={handleStartDateChange}
            minDate={minDate}
            maxDate={maxDate}
            dateFormat="MMM d, yyyy"
            placeholderText="Type: 1225 → 12/25 or click calendar"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={showNextYear ? 2 : 1}
            dropdownMode="select"
            customInput={
              <EnhancedDateInput
                placeholder="Type: 1225 → 12/25 or click calendar"
                error={!!( inputErrors.start)}
                helperText={inputErrors.start || undefined}
                onInputChange={handleStartInputChange}
                onInputBlur={handleStartInputBlur}
                onClear={handleClearStart}
                showClear={!!newHoliday.startDate}
                inputValue={startInputValue}
                isTyping={isTypingStart}
              />
            }
            popperProps={{
              strategy: 'fixed',
              modifiers: [
                {
                  name: 'offset',
                  options: { offset: [0, 8] },
                },
                {
                  name: 'preventOverflow',
                  options: { boundary: 'viewport' },
                },
              ],
            }}
            calendarClassName="enhanced-calendar"
            wrapperClassName="date-picker-wrapper"
          />
        </Box>
        
        {/* End Date */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1.5, 
              fontWeight: 600,
              color: newHoliday.startDate ? 'text.primary' : 'text.disabled',
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            End Date
            <Typography 
              component="span" 
              variant="caption" 
              sx={{ 
                color: newHoliday.startDate ? 'text.secondary' : 'text.disabled',
                fontWeight: 400,
                backgroundColor: newHoliday.startDate ? 'action.hover' : 'action.disabledBackground',
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: '0.75rem'
              }}
            >
              {yearRange}
            </Typography>
          </Typography>
          
          <DatePicker
            selected={parseISODate(newHoliday.endDate)}
            onChange={handleEndDateChange}
            minDate={getEndDateMinDate()}
            maxDate={maxDate}
            dateFormat="MMM d, yyyy"
            placeholderText="Type: 1226 → 12/26 or click calendar"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={showNextYear ? 2 : 1}
            dropdownMode="select"
            disabled={!newHoliday.startDate}
            customInput={
              <EnhancedDateInput
                placeholder={
                  newHoliday.startDate 
                    ? "Type: 1226 → 12/26 or click calendar"
                    : "Select start date first"
                }
                error={!!( inputErrors.end)}
                helperText={
                  inputErrors.end || 
                  (!newHoliday.startDate ? "Please select a start date first" : undefined)
                }
                onInputChange={handleEndInputChange}
                onInputBlur={handleEndInputBlur}
                onClear={handleClearEnd}
                showClear={!!newHoliday.endDate}
                inputValue={endInputValue}
                isTyping={isTypingEnd}
                disabled={!newHoliday.startDate}
              />
            }
            popperProps={{
              strategy: 'fixed',
              modifiers: [
                {
                  name: 'offset',
                  options: { offset: [0, 8] },
                },
                {
                  name: 'preventOverflow',
                  options: { boundary: 'viewport' },
                },
              ],
            }}
            calendarClassName="enhanced-calendar"
            wrapperClassName="date-picker-wrapper"
          />
        </Box>
      </Box>

      {/* Warnings and Errors */}
      {/* {dateOverlapWarning && (
        <Alert 
          severity="warning" 
          sx={{ 
            mt: 2,
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          {dateOverlapWarning}
        </Alert>
      )} */}
      
      {/* {holidayError && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 2,
            '& .MuiAlert-message': {
              fontSize: '0.875rem'
            }
          }}
        >
          {holidayError}
        </Alert>
      )} */}

      {/* Enhanced Custom CSS for react-datepicker */}
      <style jsx global>{`
        .enhanced-calendar {
          border: 1px solid ${theme.palette.divider};
          border-radius: 12px;
          box-shadow: ${theme.shadows[12]};
          font-family: ${theme.typography.fontFamily};
          overflow: hidden;
          background: ${theme.palette.background.paper};
        }
        
        .enhanced-calendar .react-datepicker__header {
          background: linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%);
          color: white;
          border-bottom: none;
          border-radius: 12px 12px 0 0;
          padding: 16px 0;
          position: relative;
        }
        
        .enhanced-calendar .react-datepicker__header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E") repeat;
          pointer-events: none;
        }
        
        .enhanced-calendar .react-datepicker__current-month {
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 8px;
        }
        
        .enhanced-calendar .react-datepicker__day-names {
          background: rgba(255, 255, 255, 0.1);
          margin: 0;
          padding: 8px 0;
        }
        
        .enhanced-calendar .react-datepicker__day-name {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          font-size: 0.8rem;
          width: 2.2rem;
          line-height: 1.5;
        }
        
        .enhanced-calendar .react-datepicker__month {
          margin: 0;
          padding: 12px;
          background: ${theme.palette.background.paper};
        }
        
        .enhanced-calendar .react-datepicker__week {
          display: flex;
          justify-content: space-around;
          margin-bottom: 4px;
        }
        
        .enhanced-calendar .react-datepicker__day {
          border-radius: 8px;
          transition: all 0.2s ease;
          width: 2.2rem;
          height: 2.2rem;
          line-height: 2.2rem;
          margin: 2px;
          font-weight: 500;
          position: relative;
          overflow: hidden;
        }
        
        .enhanced-calendar .react-datepicker__day::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }
        
        .enhanced-calendar .react-datepicker__day:hover::before {
          left: 100%;
        }
        
        .enhanced-calendar .react-datepicker__day:hover {
          background: linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%);
          color: white;
          transform: scale(1.05);
          box-shadow: ${theme.shadows[4]};
        }
        
        .enhanced-calendar .react-datepicker__day--selected {
          background: linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%);
          color: white;
          transform: scale(1.1);
          box-shadow: ${theme.shadows[6]};
          font-weight: 600;
        }
        
        .enhanced-calendar .react-datepicker__day--in-range {
          background: linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%);
          color: white;
          opacity: 0.8;
        }
        
        .enhanced-calendar .react-datepicker__day--range-start,
        .enhanced-calendar .react-datepicker__day--range-end {
          background: linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%);
          color: white;
          transform: scale(1.1);
          box-shadow: ${theme.shadows[6]};
        }
        
        .enhanced-calendar .react-datepicker__day--disabled {
          color: ${theme.palette.text.disabled};
          cursor: not-allowed;
          background: transparent;
          opacity: 0.4;
        }
        
        .enhanced-calendar .react-datepicker__day--disabled:hover {
          background: transparent;
          transform: none;
          box-shadow: none;
        }
        
        .enhanced-calendar .react-datepicker__day--today {
          border: 2px solid ${theme.palette.primary.main};
          background: rgba(${theme.palette.primary.main.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16)).join(', ')}, 0.1);
          font-weight: 600;
        }
        
        .enhanced-calendar .react-datepicker__navigation {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          top: 14px;
          transition: all 0.2s ease;
        }
                  .enhanced-calendar .react-datepicker__navigation:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.1);
        }
        
        .enhanced-calendar .react-datepicker__navigation-icon::before {
          border-color: white;
          border-width: 2px 2px 0 0;
          width: 8px;
          height: 8px;
          top: 10px;
        }
        
        .enhanced-calendar .react-datepicker__year-dropdown {
          background: ${theme.palette.background.paper};
          border: 1px solid ${theme.palette.divider};
          border-radius: 8px;
          box-shadow: ${theme.shadows[8]};
          max-height: 200px;
          overflow-y: auto;
        }
        
        .enhanced-calendar .react-datepicker__year-option {
          padding: 8px 16px;
          transition: all 0.2s ease;
        }
        
        .enhanced-calendar .react-datepicker__year-option:hover {
          background: ${theme.palette.primary.light};
          color: white;
        }
        
        .enhanced-calendar .react-datepicker__year-option--selected {
          background: ${theme.palette.primary.main};
          color: white;
          font-weight: 600;
        }
        
        .enhanced-calendar .react-datepicker__year-read-view--down-arrow,
        .enhanced-calendar .react-datepicker__month-read-view--down-arrow,
        .enhanced-calendar .react-datepicker__month-year-read-view--down-arrow {
          border-width: 2px 2px 0 0;
          width: 8px;
          height: 8px;
          top: 6px;
        }
        
        .enhanced-calendar .react-datepicker__year-read-view,
        .enhanced-calendar .react-datepicker__month-read-view,
        .enhanced-calendar .react-datepicker__month-year-read-view {
          border-radius: 4px;
          padding: 2px 8px;
          transition: all 0.2s ease;
        }
        
        .enhanced-calendar .react-datepicker__year-read-view:hover,
        .enhanced-calendar .react-datepicker__month-read-view:hover,
        .enhanced-calendar .react-datepicker__month-year-read-view:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .date-picker-wrapper {
          width: 100%;
        }
        
        @media (max-width: ${theme.breakpoints.values.sm}px) {
          .enhanced-calendar {
            transform: scale(0.9);
            transform-origin: top left;
          }
          
          .enhanced-calendar .react-datepicker__day {
            width: 1.8rem;
            height: 1.8rem;
            line-height: 1.8rem;
            font-size: 0.8rem;
          }
          
          .enhanced-calendar .react-datepicker__day-name {
            width: 1.8rem;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </Box>
  );
};

export default UpcomingHolidayDatePicker;