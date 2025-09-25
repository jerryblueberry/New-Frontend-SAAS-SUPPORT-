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
  Chip,
  Paper,
  Grid,
  Stack,
  Button,
  styled
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Event as EventIcon,
  Today as TodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

// Styled components (modern UI)
const StyledTextField = styled(TextField)(({ theme, error, isValid }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: theme.palette.background.paper,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: error ? theme.palette.error.main :
                   isValid ? theme.palette.success.main : theme.palette.primary.main,
        borderWidth: '2px',
      },
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: error
        ? `0 0 0 3px ${theme.palette.error.main}15`
        : isValid
          ? `0 0 0 3px ${theme.palette.success.main}15`
          : `0 0 0 3px ${theme.palette.primary.main}15`,
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: '2px',
        borderColor: error ? theme.palette.error.main :
                   isValid ? theme.palette.success.main : theme.palette.primary.main,
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: error ? theme.palette.error.main :
           isValid ? theme.palette.success.main : theme.palette.text.primary,
    '&.Mui-focused': {
      color: error ? theme.palette.error.main :
             isValid ? theme.palette.success.main : theme.palette.primary.main,
    },
  },
}));

const CalendarPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.25)',
  border: `1px solid ${theme.palette.divider}`,
  width: '100%'
}));

const CalendarHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    animation: 'shimmer 3s ease-in-out infinite',
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
}));

const DayButton = styled('button')(({ theme, isToday, isSelected, isDisabled }) => ({
  border: 'none',
  borderRadius: 12,
  width: 'clamp(36px, 8vw, 44px)',
  height: 'clamp(36px, 8vw, 44px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: isDisabled ? 'not-allowed' : 'pointer',
  fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
  fontWeight: 600,
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  ...(isDisabled ? {
    color: theme.palette.text.disabled,
    backgroundColor: 'transparent',
    opacity: 0.3,
  } : isSelected ? {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    transform: 'scale(1.1)',
    boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
    zIndex: 2,
  } : isToday ? {
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
    border: `2px solid ${theme.palette.secondary.main}`,
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 2,
      left: '50%',
      width: 4,
      height: 4,
      backgroundColor: theme.palette.secondary.main,
      borderRadius: '50%',
      transform: 'translateX(-50%)',
    },
  } : {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: 'white',
      transform: 'scale(1.05) translateY(-1px)',
      boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
    },
  }),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  '&:hover::before': { left: '100%' },
}));

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
  const day = date.getDate();
  const month = date.getMonth() + 1;
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
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <StyledTextField
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
        isValid={isValid}
        variant="outlined"
        inputProps={{
          maxLength: 10, // DD/MM/YYYY
          pattern: '[0-9/]*',
          inputMode: 'numeric',
          style: { 
            fontFamily: 'SF Mono, Monaco, monospace',
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
                    transition: 'all 0.3s ease',
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
                      transition: 'all 0.3s ease',
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
        }}
      />
      
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

// Custom Calendar (modern)
const CustomCalendar = ({ selectedDate, onDateSelect, minDate, maxDate, onClose }) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const today = new Date();

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let day = 1; day <= daysInMonth; day++) days.push(new Date(currentYear, currentMonth, day));

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    return date < minDate || date > maxDate;
  };

  const isToday = (date) => date && date.toDateString() === today.toDateString();
  const isSelected = (date) => selectedDate && date && date.toDateString() === selectedDate.toDateString();

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(date);
      onClose();
    }
  };

  const { showNextYear, currentYear: boundsCurrentYear } = getDateBounds();
  const canNavigatePrev = currentYear > boundsCurrentYear || (currentYear === boundsCurrentYear && currentMonth > today.getMonth());
  const canNavigateNext = showNextYear ?
    (currentYear < boundsCurrentYear + 1 || (currentYear === boundsCurrentYear + 1 && currentMonth < 11)) :
    (currentYear === boundsCurrentYear && currentMonth < 11);

  // Close on Esc key
  React.useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <Fade in>
      <CalendarPaper sx={{ width: { xs: 'min(96vw, 360px)', sm: 'min(95vw, 420px)' }, maxWidth: 420 }}>
      <CalendarHeader>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <IconButton
            onClick={() => navigateMonth(-1)}
            disabled={!canNavigatePrev}
            sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant={isSmall ? 'subtitle1' : 'h6'} sx={{ fontWeight: 700, textAlign: 'center', minWidth: { xs: 160, sm: 200 } }}>
            {monthNames[currentMonth]} {currentYear}
          </Typography>
          <IconButton
            onClick={() => navigateMonth(1)}
            disabled={!canNavigateNext}
            sx={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }, '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' } }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mt: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1, p: 1 }}>
          {weekdays.map((day) => (
            <Typography key={day} variant="caption" sx={{ textAlign: 'center', fontWeight: 600, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
              {day}
            </Typography>
          ))}
        </Box>
      </CalendarHeader>
      <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
          {days.map((date, index) => (
            <DayButton
              key={index}
              onClick={() => date && handleDateClick(date)}
              isToday={isToday(date)}
              isSelected={isSelected(date)}
              isDisabled={isDateDisabled(date)}
            >
              {date ? date.getDate() : ''}
            </DayButton>
          ))}
        </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center', 
            mt: 2,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Button 
              variant="outlined"
              size="small"
              onClick={() => onClose()}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 0.8,
                minWidth: 80,
                borderColor: 'text.secondary',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  backgroundColor: 'primary.50'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Close
            </Button>
          </Box>
      </Box>
      </CalendarPaper>
    </Fade>
  );
};

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
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

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
 

      {/* Date Input Fields - modern UI with custom calendar popover */}
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
              sx={{ height: 24, fontSize: '0.75rem', fontWeight: 500 }}
            />
          </Box>

          <Box sx={{ position: 'relative' }}>
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
              value={startInputValue}
              onClick={() => setShowStartCalendar(prev => !prev)}
            />

            {showStartCalendar && (
              <Box sx={{
                position: 'absolute',
                top: '100%',
                left: { xs: '50%', sm: 0 },
                transform: { xs: 'translateX(-50%)', sm: 'none' },
                zIndex: 1300,
                mt: 1,
                width: { xs: 'min(96vw, 360px)', sm: 'min(95vw, 420px)' }
              }}>
                <CustomCalendar
                  selectedDate={parseISODate(newHoliday.startDate)}
                  onDateSelect={handleStartDateChange}
                  minDate={minDate}
                  maxDate={maxDate}
                  onClose={() => setShowStartCalendar(false)}
                />
              </Box>
            )}
          </Box>
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
              color={newHoliday.startDate ? 'primary' : 'default'}
              sx={{ height: 24, fontSize: '0.75rem', fontWeight: 500, opacity: newHoliday.startDate ? 1 : 0.5 }}
            />
          </Box>

          <Box sx={{ position: 'relative' }}>
            <ModernDateInput
              label="End Date"
              placeholder={newHoliday.startDate ? 'Type: 261224 → 26/12/2024' : 'Select start date first'}
              error={!!inputErrors.end}
              helperText={inputErrors.end || (!newHoliday.startDate ? 'Please select a start date first' : 'DD/MM/YYYY format')}
              onInputChange={handleEndInputChange}
              onInputBlur={handleEndInputBlur}
              onClear={handleClearEnd}
              showClear={!!newHoliday.endDate}
              inputValue={endInputValue}
              isTyping={isTypingEnd}
              disabled={!newHoliday.startDate}
              isValid={validationState.endValid}
              value={endInputValue}
              onClick={() => newHoliday.startDate && setShowEndCalendar(prev => !prev)}
            />

            {showEndCalendar && newHoliday.startDate && (
              <Box sx={{
                position: 'absolute',
                top: '100%',
                right: { xs: 'auto', sm: 0 },
                left: { xs: '50%', sm: 'auto' },
                transform: { xs: 'translateX(-50%)', sm: 'none' },
                zIndex: 1300,
                mt: 1,
                width: { xs: 'min(96vw, 360px)', sm: 'min(95vw, 420px)' }
              }}>
                <CustomCalendar
                  selectedDate={parseISODate(newHoliday.endDate)}
                  onDateSelect={handleEndDateChange}
                  minDate={getEndDateMinDate()}
                  maxDate={maxDate}
                  onClose={() => setShowEndCalendar(false)}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Warnings */}
      {dateOverlapWarning && (
        <Fade in={true}>
          <Alert 
            severity="warning" 
            sx={{ mt: 2, borderRadius: 2 }}
            onClose={() => setDateOverlapWarning('')}
          >
            {dateOverlapWarning}
          </Alert>
        </Fade>
      )}

      {/* Click-away overlay to close calendars */}
      {(showStartCalendar || showEndCalendar) && (
        <Box
          sx={{ position: 'fixed', inset: 0, zIndex: 1200 }}
          onClick={() => { setShowStartCalendar(false); setShowEndCalendar(false); }}
        />
      )}

      {/* Custom calendar popover uses MUI; removed react-datepicker global CSS */}
    </Box>
  );
};

export default UpcomingHolidayDatePicker;