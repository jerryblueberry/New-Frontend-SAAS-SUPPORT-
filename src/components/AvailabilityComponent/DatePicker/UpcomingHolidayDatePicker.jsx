import React, { forwardRef, useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Fade,
  Chip
} from '@mui/material';
import DatePicker from 'react-datepicker';
import { 
  CalendarMonth as CalendarIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon
} from '@mui/icons-material';
import 'react-datepicker/dist/react-datepicker.css';

// Date utility functions with DD/MM/YYYY format
const getDateBounds = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Allow next year if we're in December
  const maxYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  
  return {
    minDate: today,
    maxDate: new Date(maxYear, 11, 31),
    currentYear,
    nextYear: currentYear + 1,
    showNextYear: currentMonth === 11
  };
};

const formatDateToISO = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseISODate = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString + 'T00:00:00');
  return isNaN(date.getTime()) ? null : date;
};

const formatDateForDisplay = (date) => {
  if (!date) return '';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Enhanced auto-formatting functions
const formatDateInput = (value, prevValue = '') => {
  // Allow deletion without reformatting
  if (value.length < prevValue.length) {
    return { formatted: value, cursorPos: null };
  }

  // Remove all non-numeric characters
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length === 0) return { formatted: '', cursorPos: null };

  let formatted = '';
  let cursorPos = value.length;

  // Handle different lengths for DD/MM/YYYY format
  if (cleaned.length <= 2) {
    // DD
    formatted = cleaned;
  } else if (cleaned.length <= 4) {
    // DD/MM
    formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    if (cleaned.length === 3 && prevValue.length === 2) {
      cursorPos += 1; // Adjust cursor position when auto-adding slash
    }
  } else {
    // DD/MM/YYYY
    formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    if (cleaned.length === 5 && prevValue.length === 4) {
      cursorPos += 1; // Adjust cursor position when auto-adding slash
    }
  }

  return { formatted, cursorPos };
};

const parseFormattedDateInput = (input) => {
  if (!input) return null;
  
  const parts = input.split('/');
  if (parts.length === 0) return null;
  
  const day = parts[0] ? parseInt(parts[0]) : 1;
  const month = parts[1] ? parseInt(parts[1]) : 1;
  let year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
  
  // Smart year handling
  if (year < 100) {
    const currentYear = new Date().getFullYear();
    const century = Math.floor(currentYear / 100) * 100;
    year += century;
    // Adjust for recent years (e.g., "25" becomes 2025, not 1925)
    if (year < currentYear - 50) year += 100;
  }
  
  // Validate ranges
  if (day < 1 || day > 31) return null;
  if (month < 1 || month > 12) return null;
  
  // Create date and check if valid (handles cases like 31/02)
  const date = new Date(year, month - 1, day);
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return null;
  }
  
  return date;
};

const validateFormattedDateInput = (input) => {
  if (!input) return { isValid: true, error: '', isPartial: false };
  
  const parts = input.split('/');
  const hasSlashes = parts.length > 1;
  
  // Basic format validation
  if (hasSlashes && (parts.length !== 3 || parts.some(part => !part))) {
    return { isValid: false, error: 'Please complete the date format' };
  }
  
  // Validate day
  if (parts[0] && (parseInt(parts[0]) < 1 || parseInt(parts[0]) > 31)) {
    return { isValid: false, error: 'Day must be between 01-31' };
  }
  
  // Validate month
  if (parts[1] && (parseInt(parts[1]) < 1 || parseInt(parts[1]) > 12)) {
    return { isValid: false, error: 'Month must be between 01-12' };
  }
  
  // Validate year if complete
  if (parts[2] && parts[2].length === 4) {
    const currentYear = new Date().getFullYear();
    const year = parseInt(parts[2]);
    
    if (year < currentYear || year > currentYear + 1) {
      return { 
        isValid: false, 
        error: `Year must be ${currentYear} or ${currentYear + 1}` 
      };
    }
  }
  
  // Check if complete date is valid
  if (hasSlashes && parts[0] && parts[1] && parts[2]) {
    const date = parseFormattedDateInput(input);
    if (!date) {
      return { 
        isValid: false, 
        error: 'Invalid date. Please check day/month combination.' 
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
    
    return { isValid: true, error: '', isPartial: false };
  }
  
  // Partial date is still valid
  return { isValid: true, error: '', isPartial: true };
};

// Modern Enhanced Date Input Component
const ModernDateInput = forwardRef(({ 
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
  label,
  isValid,
  ...props 
}, ref) => {
  const theme = useTheme();
  const inputRef = useRef(null);
  
  // Handle cursor position after formatting
  const handleChange = (e) => {
    const { value } = e.target;
    const prevValue = inputValue || '';
    
    const { formatted, cursorPos } = formatDateInput(value, prevValue);
    
    onInputChange({
      ...e,
      target: {
        ...e.target,
        value: formatted
      }
    });
    
    // Restore cursor position after state update
    if (cursorPos !== null && inputRef.current) {
      setTimeout(() => {
        inputRef.current.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    }
  };
  
  // Handle keyboard navigation between date segments
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const { value, selectionStart } = e.target;
      const isAtSlash = value[selectionStart] === '/';
      
      if (isAtSlash) {
        e.preventDefault();
        const newPos = e.key === 'ArrowLeft' ? selectionStart - 1 : selectionStart + 1;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }
    
    // Allow deleting slashes
    if (e.key === 'Backspace' || e.key === 'Delete') {
      const { value, selectionStart } = e.target;
      const isAtSlash = value[selectionStart] === '/';
      
      if (isAtSlash) {
        e.preventDefault();
        const newValue = value.slice(0, selectionStart) + value.slice(selectionStart + 1);
        onInputChange({
          ...e,
          target: {
            ...e.target,
            value: newValue
          }
        });
        
        setTimeout(() => {
          inputRef.current.setSelectionRange(selectionStart, selectionStart);
        }, 0);
      }
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        {...props}
        size="small"
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        fullWidth
        label={label}
        value={isTyping ? inputValue : (value || '')}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onInputBlur}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        disabled={disabled}
        variant="outlined"
        inputProps={{
          maxLength: 10, // DD/MM/YYYY
          pattern: '[0-9/]*',
          inputMode: 'numeric',
          style: { 
            fontFamily: 'monospace',
              fontSize: '0.9rem',
            letterSpacing: '0.5px'
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Tooltip title="Click to open calendar picker" arrow>
                <IconButton 
                  onClick={onClick} 
                  size="small"
                  disabled={disabled}
                  sx={{ 
                    color: error ? 'error.main' : (isValid ? 'success.main' : 'primary.main'),
                    backgroundColor: 'transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: error ? 'error.light' : (isValid ? 'success.light' : 'primary.light'),
                      color: 'white',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  {isValid && !error ? <CheckIcon fontSize="small" /> : <CalendarIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          endAdornment: showClear && (
            <InputAdornment position="end">
              <Fade in={showClear}>
                <Tooltip title="Clear date" arrow>
                  <IconButton 
                    onClick={onClear} 
                    size="small"
                    sx={{ 
                      color: 'text.secondary',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'error.main',
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Fade>
            </InputAdornment>
          ),
          sx: {
            borderRadius: 1.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
            '&:hover': {
              backgroundColor: disabled ? 'action.disabledBackground' : 'action.hover',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: error ? 'error.main' : (isValid ? 'success.main' : 'primary.main'),
                borderWidth: '2px',
              },
            },
            '&.Mui-focused': {
              backgroundColor: 'background.paper',
              boxShadow: error 
                ? `0 0 0 3px ${theme.palette.error.main}25`
                : isValid 
                  ? `0 0 0 3px ${theme.palette.success.main}25`
                  : `0 0 0 3px ${theme.palette.primary.main}25`,
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
                borderColor: error ? 'error.main' : (isValid ? 'success.main' : 'primary.main'),
              },
            },
          },
        }}
        InputLabelProps={{
          sx: {
            color: error ? 'error.main' : (isValid ? 'success.main' : 'text.primary'),
            '&.Mui-focused': {
              color: error ? 'error.main' : (isValid ? 'success.main' : 'primary.main'),
            },
          },
        }}
      />
      
      {/* Smart input indicator */}
      {isTyping && inputValue && (
        <Fade in={true}>
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: 12,
              zIndex: 1,
            }}
          >
            <Chip
              size="small"
              label="Typing..."
              color="primary"
              variant="filled"
              sx={{
                height: 16,
                fontSize: '0.65rem',
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          </Box>
        </Fade>
      )}
    </Box>
  );
});

ModernDateInput.displayName = 'ModernDateInput';

const UpcomingHolidayDatePicker = ({
  newHoliday,
  setNewHoliday,
  editingHoliday,
  setHolidayError,
  dateOverlapWarning,
  setDateOverlapWarning,
  checkDateOverlap,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { minDate, maxDate, currentYear, nextYear, showNextYear } = getDateBounds();

  // Enhanced state management
  const [startInputValue, setStartInputValue] = useState('');
  const [endInputValue, setEndInputValue] = useState('');
  const [isTypingStart, setIsTypingStart] = useState(false);
  const [isTypingEnd, setIsTypingEnd] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    start: '',
    end: ''
  });
  const [validationState, setValidationState] = useState({
    startValid: false,
    endValid: false
  });

  // Update display values when holiday changes
  useEffect(() => {
    if (!isTypingStart) {
      const startDate = parseISODate(newHoliday.startDate);
      setStartInputValue(startDate ? formatDateForDisplay(startDate) : '');
      setValidationState(prev => ({ ...prev, startValid: !!startDate }));
    }
  }, [newHoliday.startDate, isTypingStart]);

  useEffect(() => {
    if (!isTypingEnd) {
      const endDate = parseISODate(newHoliday.endDate);
      setEndInputValue(endDate ? formatDateForDisplay(endDate) : '');
      setValidationState(prev => ({ ...prev, endValid: !!endDate }));
    }
  }, [newHoliday.endDate, isTypingEnd]);

  // Memoized date change handlers
  const handleStartDateChange = useCallback((date) => {
    const isoDate = formatDateToISO(date);
    const updatedHoliday = { ...newHoliday, startDate: isoDate };
    
    // Clear end date if it's before the new start date
    if (newHoliday.endDate && date && parseISODate(newHoliday.endDate) < date) {
      updatedHoliday.endDate = '';
      setEndInputValue('');
      setValidationState(prev => ({ ...prev, endValid: false }));
    }
    
    setNewHoliday(updatedHoliday);
    setIsTypingStart(false);
    setInputErrors(prev => ({ ...prev, start: '' }));
    setValidationState(prev => ({ ...prev, startValid: true }));
    
    checkOverlap(isoDate, updatedHoliday.endDate);
  }, [newHoliday, setNewHoliday, checkDateOverlap]);

  const handleEndDateChange = useCallback((date) => {
    const isoDate = formatDateToISO(date);
    setNewHoliday({ ...newHoliday, endDate: isoDate });
    setIsTypingEnd(false);
    setInputErrors(prev => ({ ...prev, end: '' }));
    setValidationState(prev => ({ ...prev, endValid: true }));
    
    checkOverlap(newHoliday.startDate, isoDate);
  }, [newHoliday, setNewHoliday, checkDateOverlap]);

  // Enhanced input change handlers with real-time validation
  const handleStartInputChange = useCallback((e) => {
    const rawValue = e.target.value;
    
    setStartInputValue(rawValue);
    setIsTypingStart(true);
    
    // Real-time validation feedback
    const validation = validateFormattedDateInput(rawValue);
    if (!validation.isValid && !validation.isPartial) {
      setInputErrors(prev => ({ ...prev, start: validation.error }));
      setValidationState(prev => ({ ...prev, startValid: false }));
    } else {
      setInputErrors(prev => ({ ...prev, start: '' }));
      setValidationState(prev => ({ ...prev, startValid: validation.isValid }));
    }
  }, []);

  const handleEndInputChange = useCallback((e) => {
    const rawValue = e.target.value;
    
    setEndInputValue(rawValue);
    setIsTypingEnd(true);
    
    // Real-time validation feedback
    const validation = validateFormattedDateInput(rawValue);
    if (!validation.isValid && !validation.isPartial) {
      setInputErrors(prev => ({ ...prev, end: validation.error }));
      setValidationState(prev => ({ ...prev, endValid: false }));
    } else {
      setInputErrors(prev => ({ ...prev, end: '' }));
      setValidationState(prev => ({ ...prev, endValid: validation.isValid }));
    }
  }, []);

  // Enhanced blur handlers with comprehensive validation
  const handleStartInputBlur = useCallback(() => {
    if (!startInputValue.trim()) {
      setIsTypingStart(false);
      setValidationState(prev => ({ ...prev, startValid: false }));
      return;
    }

    const validation = validateFormattedDateInput(startInputValue);
    if (!validation.isValid && !validation.isPartial) {
      setInputErrors(prev => ({ ...prev, start: validation.error }));
      setValidationState(prev => ({ ...prev, startValid: false }));
      return;
    }

    // Process complete dates only
    if (startInputValue.includes('/') && startInputValue.split('/').length === 3) {
      const parsedDate = parseFormattedDateInput(startInputValue);
      if (parsedDate) {
        handleStartDateChange(parsedDate);
      } else {
        setInputErrors(prev => ({ ...prev, start: 'Invalid date format' }));
        setValidationState(prev => ({ ...prev, startValid: false }));
      }
    } else {
      // If partial date but valid format, keep it as is
      setIsTypingStart(false);
    }
  }, [startInputValue, handleStartDateChange]);

  const handleEndInputBlur = useCallback(() => {
    if (!endInputValue.trim()) {
      setIsTypingEnd(false);
      setValidationState(prev => ({ ...prev, endValid: false }));
      return;
    }

    const validation = validateFormattedDateInput(endInputValue);
    if (!validation.isValid && !validation.isPartial) {
      setInputErrors(prev => ({ ...prev, end: validation.error }));
      setValidationState(prev => ({ ...prev, endValid: false }));
      return;
    }

    if (endInputValue.includes('/') && endInputValue.split('/').length === 3) {
      const parsedDate = parseFormattedDateInput(endInputValue);
      if (parsedDate) {
        // Additional validation for end date
        const startDate = parseISODate(newHoliday.startDate);
        if (startDate && parsedDate < startDate) {
          setInputErrors(prev => ({ 
            ...prev, 
            end: 'End date cannot be before start date' 
          }));
          setValidationState(prev => ({ ...prev, endValid: false }));
          return;
        }
        handleEndDateChange(parsedDate);
      } else {
        setInputErrors(prev => ({ ...prev, end: 'Invalid date format' }));
        setValidationState(prev => ({ ...prev, endValid: false }));
      }
    } else {
      setIsTypingEnd(false);
    }
  }, [endInputValue, newHoliday.startDate, handleEndDateChange]);

  // Overlap checking function
  const checkOverlap = useCallback((startDate, endDate) => {
    if (startDate && endDate) {
      const hasOverlap = checkDateOverlap(startDate, endDate, editingHoliday?._id);
      setDateOverlapWarning(
        hasOverlap ? 'This date range overlaps with an existing holiday' : ''
      );
    } else {
      setDateOverlapWarning('');
    }
  }, [checkDateOverlap, editingHoliday?._id, setDateOverlapWarning]);

  // Clear handlers
  const handleClearStart = useCallback(() => {
    setNewHoliday({ ...newHoliday, startDate: '', endDate: '' });
    setStartInputValue('');
    setEndInputValue('');
    setIsTypingStart(false);
    setIsTypingEnd(false);
    setInputErrors({ start: '', end: '' });
    setValidationState({ startValid: false, endValid: false });
    setDateOverlapWarning('');
  }, [newHoliday, setNewHoliday, setDateOverlapWarning]);

  const handleClearEnd = useCallback(() => {
    setNewHoliday({ ...newHoliday, endDate: '' });
    setEndInputValue('');
    setIsTypingEnd(false);
    setInputErrors(prev => ({ ...prev, end: '' }));
    setValidationState(prev => ({ ...prev, endValid: false }));
    setDateOverlapWarning('');
  }, [newHoliday, setNewHoliday, setDateOverlapWarning]);

  const getEndDateMinDate = useCallback(() => {
    if (newHoliday.startDate) {
      const startDate = parseISODate(newHoliday.startDate);
      return startDate || minDate;
    }
    return minDate;
  }, [newHoliday.startDate, minDate]);

  const yearDisplayText = showNextYear 
    ? `${currentYear} - ${nextYear}` 
    : currentYear.toString();

  return (
    <Box sx={{ width: '100%' }}>
      {/* Enhanced Instructions */}
      <Alert 
        severity="info" 
        icon={<InfoIcon />}
        sx={{ 
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.main}10 100%)`,
          border: `1px solid ${theme.palette.primary.main}30`,
          borderRadius: 2,
          '& .MuiAlert-icon': {
            color: 'primary.main'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <EventIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Smart DD/MM/YYYY Date Input
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          • Type naturally: <strong>25</strong> → 25/, <strong>2512</strong> → 25/12/, <strong>251224</strong> → 25/12/2024
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          • Smart year handling: No zero-padding needed • Click calendar icon for visual picker
        </Typography>
      </Alert>

      {/* Date Input Fields */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 3,
          mb: 2
        }}
      >
        {/* Start Date */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '1.1rem'
              }}
            >
              Start Date
            </Typography>
            <Chip
              label={yearDisplayText}
              size="small"
              variant="outlined"
              color="primary"
              sx={{ 
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            />
          </Box>
          
          <DatePicker
            selected={parseISODate(newHoliday.startDate)}
            onChange={handleStartDateChange}
            minDate={minDate}
            maxDate={maxDate}
            shouldCloseOnSelect
            closeOnScroll
            showPopperArrow={false}
            dateFormat="dd/MM/y"
            placeholderText="e.g., 25/12/2024"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={showNextYear ? 2 : 1}
            dropdownMode="select"
            customInput={
              <ModernDateInput
                label="Start Date"
                placeholder="Type: 251224 → 25/12/2024"
                error={!!inputErrors.start}
                helperText={inputErrors.start || 'DD/MM/YYYY format'}
                onInputChange={handleStartInputChange}
                onInputBlur={handleStartInputBlur}
                onClear={handleClearStart}
                showClear={!!newHoliday.startDate}
                inputValue={startInputValue}
                isTyping={isTypingStart}
                isValid={validationState.startValid}
              />
            }
            popperProps={{
              strategy: 'fixed',
              modifiers: [
                {
                  name: 'offset',
                  options: { offset: [0, 12] },
                },
                {
                  name: 'preventOverflow',
                  options: { boundary: 'viewport', padding: 8 },
                },
              ],
            }}
            calendarClassName="modern-calendar"
            wrapperClassName="date-picker-wrapper"
          />
        </Box>
        
        {/* End Date */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: newHoliday.startDate ? 'text.primary' : 'text.disabled',
                fontSize: '1.1rem'
              }}
            >
              End Date
            </Typography>
            <Chip
              label={yearDisplayText}
              size="small"
              variant="outlined"
              color={newHoliday.startDate ? "primary" : "default"}
              sx={{ 
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 500,
                opacity: newHoliday.startDate ? 1 : 0.5
              }}
            />
          </Box>
          
          <DatePicker
            selected={parseISODate(newHoliday.endDate)}
            onChange={handleEndDateChange}
            minDate={getEndDateMinDate()}
            maxDate={maxDate}
            shouldCloseOnSelect
            closeOnScroll
            showPopperArrow={false}
            dateFormat="dd/MM/y"
            placeholderText="e.g., 26/12/2024"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={showNextYear ? 2 : 1}
            dropdownMode="select"
            disabled={!newHoliday.startDate}
            customInput={
              <ModernDateInput
                label="End Date"
                placeholder={
                  newHoliday.startDate 
                    ? "Type: 261224 → 26/12/2024"
                    : "Select start date first"
                }
                error={!!inputErrors.end}
                helperText={
                  inputErrors.end || 
                  (!newHoliday.startDate ? "Please select a start date first" : "DD/MM/YYYY format")
                }
                onInputChange={handleEndInputChange}
                onInputBlur={handleEndInputBlur}
                onClear={handleClearEnd}
                showClear={!!newHoliday.endDate}
                inputValue={endInputValue}
                isTyping={isTypingEnd}
                disabled={!newHoliday.startDate}
                isValid={validationState.endValid}
              />
            }
            popperProps={{
              strategy: 'fixed',
              modifiers: [
                {
                  name: 'offset',
                  options: { offset: [0, 12] },
                },
                {
                  name: 'preventOverflow',
                  options: { boundary: 'viewport', padding: 8 },
                },
              ],
            }}
            calendarClassName="modern-calendar"
            wrapperClassName="date-picker-wrapper"
          />
        </Box>
      </Box>

      {/* Warnings */}
      {/* {dateOverlapWarning && (
        <Fade in={true}>
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 2,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '0.875rem'
              }
            }}
          >
            {dateOverlapWarning}
          </Alert>
        </Fade>
      )} */}

      {/* Modern Calendar Styles */}
      <style jsx global>{`
        .modern-calendar {
          border: none;
          border-radius: 12px;
          box-shadow: 0 12px 20px -12px rgba(0, 0, 0, 0.2);
          font-family: ${theme.typography.fontFamily};
          overflow: hidden;
          background: ${theme.palette.background.paper};
          backdrop-filter: blur(8px);
        }
        
        .modern-calendar .react-datepicker__header {
          background: linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%);
          color: white;
          border-bottom: none;
          border-radius: 12px 12px 0 0;
          padding: 14px 0;
          position: relative;
          overflow: hidden;
        }
        
        .modern-calendar .react-datepicker__header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }
        
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%) translateY(-100%) rotate(0deg); }
          50% { transform: translateX(0%) translateY(0%) rotate(180deg); }
        }
        
        .modern-calendar .react-datepicker__current-month {
          color: white;
          font-weight: 700;
          font-size: 1.05rem;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .modern-calendar .react-datepicker__day-names {
          background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
          margin: 0;
          padding: 8px 0;
          backdrop-filter: blur(4px);
        }
        
        .modern-calendar .react-datepicker__day-name {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
          font-size: 0.75rem;
          width: 2.2rem;
          line-height: 1.6;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        
        .modern-calendar .react-datepicker__month {
          margin: 0;
          padding: 12px;
          background: ${theme.palette.background.paper};
        }
        
        .modern-calendar .react-datepicker__week {
          display: flex;
          justify-content: space-around;
          margin-bottom: 6px;
        }
        
        .modern-calendar .react-datepicker__day {
          border-radius: 10px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          width: 2.2rem;
          height: 2.2rem;
          line-height: 2.2rem;
          margin: 2px;
          font-weight: 600;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          color: ${theme.palette.text.primary};
        }
        
        .modern-calendar .react-datepicker__day::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .modern-calendar .react-datepicker__day:hover::before {
          left: 100%;
        }
        
        .modern-calendar .react-datepicker__day:hover {
          background: linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%);
          color: white;
          transform: scale(1.05) translateY(-1px);
          box-shadow: 0 6px 18px -8px ${theme.palette.primary.main}60;
          z-index: 1;
        }
        
        .modern-calendar .react-datepicker__day--selected {
          background: linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%);
          color: white;
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 10px 24px -12px ${theme.palette.primary.main}70;
          font-weight: 700;
          z-index: 2;
        }
     
        
        .modern-calendar .react-datepicker__day--in-range {
          background: linear-gradient(135deg, ${theme.palette.primary.light}60 0%, ${theme.palette.primary.main}40 100%);
          color: ${theme.palette.primary.contrastText};
          border-radius: 8px;
        }
        
        .modern-calendar .react-datepicker__day--range-start,
        .modern-calendar .react-datepicker__day--range-end {
          background: linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%);
          color: white;
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 10px 24px -12px ${theme.palette.primary.main}70;
          font-weight: 700;
        }
        
        .modern-calendar .react-datepicker__day--disabled {
          color: ${theme.palette.text.disabled};
          cursor: not-allowed;
          background: transparent;
          opacity: 0.3;
          transform: none;
        }
        
        .modern-calendar .react-datepicker__day--disabled:hover {
          background: transparent;
          transform: none;
          box-shadow: none;
          color: ${theme.palette.text.disabled};
        }
        
        .modern-calendar .react-datepicker__day--disabled::before {
          display: none;
        }
        
        .modern-calendar .react-datepicker__day--today {
          position: relative;
          background: linear-gradient(135deg, ${theme.palette.secondary.light}30 0%, ${theme.palette.secondary.main}20 100%);
          border: 2px solid ${theme.palette.secondary.main};
          font-weight: 700;
          color: ${theme.palette.secondary.main};
        }
        
        .modern-calendar .react-datepicker__day--today::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          width: 4px;
          height: 4px;
          background: ${theme.palette.secondary.main};
          border-radius: 50%;
          transform: translateX(-50%);
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.6; transform: translateX(-50%) scale(1.2); }
        }
        
        .modern-calendar .react-datepicker__navigation {
          background: rgba(255, 255, 255, 0.25);
          border: none;
          border-radius: 10px;
          width: 30px;
          height: 30px;
          top: 14px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }
        
        .modern-calendar .react-datepicker__navigation:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.18);
        }
        
        .modern-calendar .react-datepicker__navigation-icon::before {
          border-color: white;
          border-width: 2px 2px 0 0;
          width: 9px;
          height: 9px;
          top: 10px;
        }
        
        .modern-calendar .react-datepicker__year-dropdown {
          background: ${theme.palette.background.paper};
          border: 1px solid ${theme.palette.divider};
          border-radius: 10px;
          box-shadow: 0 8px 30px -12px rgba(0,0,0,0.2);
          max-height: 180px;
          overflow-y: auto;
          backdrop-filter: blur(8px);
        }
        
        .modern-calendar .react-datepicker__year-option {
          padding: 10px 16px;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        
        .modern-calendar .react-datepicker__year-option:hover {
          background: linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%);
          color: white;
          transform: translateX(2px);
        }
        
        .modern-calendar .react-datepicker__year-option--selected {
          background: linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%);
          color: white;
          font-weight: 700;
          position: relative;
        }
        
        .modern-calendar .react-datepicker__year-option--selected::before {
          content: '✓';
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-weight: bold;
        }
        
        .modern-calendar .react-datepicker__year-read-view--down-arrow,
        .modern-calendar .react-datepicker__month-read-view--down-arrow {
          border-width: 2px 2px 0 0;
          width: 8px;
          height: 8px;
          top: 6px;
          border-color: white;
        }
        
        .modern-calendar .react-datepicker__year-read-view,
        .modern-calendar .react-datepicker__month-read-view {
          border-radius: 8px;
          padding: 3px 10px;
          transition: all 0.25s ease;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(4px);
        }
        
        .modern-calendar .react-datepicker__year-read-view:hover,
        .modern-calendar .react-datepicker__month-read-view:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.05);
        }
        
        .date-picker-wrapper {
          width: 100%;
        }
        
        /* Enhanced mobile styles */
        @media (max-width: ${theme.breakpoints.values.sm}px) {
          .modern-calendar {
            transform: scale(0.95);
            transform-origin: center top;
            margin: 0 auto;
          }
          
          .modern-calendar .react-datepicker__day {
            width: 2.2rem;
            height: 2.2rem;
            line-height: 2.2rem;
            font-size: 0.9rem;
            margin: 2px;
          }
          
          .modern-calendar .react-datepicker__day-name {
            width: 2.2rem;
            font-size: 0.75rem;
          }
          
          .modern-calendar .react-datepicker__current-month {
            font-size: 1.1rem;
          }
          
          .modern-calendar .react-datepicker__navigation {
            width: 32px;
            height: 32px;
            top: 14px;
          }
          
          .modern-calendar .react-datepicker__navigation-icon::before {
            width: 8px;
            height: 8px;
            top: 10px;
          }
        }
      `}</style>
    </Box>
  );
};

export default UpcomingHolidayDatePicker;