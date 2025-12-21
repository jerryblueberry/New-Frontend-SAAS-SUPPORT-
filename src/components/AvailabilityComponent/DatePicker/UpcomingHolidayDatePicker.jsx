import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Alert,
  useTheme,
  useMediaQuery,
  IconButton,
  Fade,
  Paper,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Calendar, ChevronLeft, ChevronRight, X, Check, Type } from 'lucide-react';

// Date utilities
const getDateBounds = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const maxYear = currentMonth >= 10 ? currentYear + 1 : currentYear;
  return { minDate: today, maxDate: new Date(maxYear, 11, 31), currentYear, maxYear };
};

const formatDateToISO = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseISODate = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString + 'T00:00:00');
  return isNaN(date.getTime()) ? null : date;
};

const formatDisplayDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatShortDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Parse DD/MM/YYYY input
const parseDateInput = (input) => {
  if (!input) return null;
  const cleaned = input.replace(/\D/g, '');
  if (cleaned.length < 8) return null;
  
  const day = parseInt(cleaned.slice(0, 2));
  const month = parseInt(cleaned.slice(2, 4));
  const year = parseInt(cleaned.slice(4, 8));
  
  if (day < 1 || day > 31 || month < 1 || month > 12) return null;
  
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1) return null;
  
  return date;
};

// Auto-format input as DD/MM/YYYY
const formatInputValue = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
};

// Inline Calendar Component
const InlineCalendar = ({ selectedDate, onSelect, minDate, maxDate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [viewDate, setViewDate] = useState(() => selectedDate || minDate || new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))];

  const canPrev = new Date(year, month - 1, 1) >= new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const canNext = new Date(year, month + 1, 1) <= new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  const isDisabled = (d) => !d || d < minDate || d > maxDate;
  const isToday = (d) => d && d.toDateString() === today.toDateString();
  const isSelected = (d) => d && selectedDate && d.toDateString() === selectedDate.toDateString();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <IconButton
          size="small"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          disabled={!canPrev}
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: canPrev ? alpha(theme.palette.grey[100], 0.8) : 'transparent',
            '&:hover': { bgcolor: alpha(theme.palette.grey[200], 0.8) },
          }}
        >
          <ChevronLeft size={18} />
        </IconButton>
        <Typography sx={{ fontSize: '0.938rem', fontWeight: 700, color: 'text.primary' }}>
          {monthNames[month]} {year}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          disabled={!canNext}
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: canNext ? alpha(theme.palette.grey[100], 0.8) : 'transparent',
            '&:hover': { bgcolor: alpha(theme.palette.grey[200], 0.8) },
          }}
        >
          <ChevronRight size={18} />
        </IconButton>
      </Box>

      {/* Weekdays */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 1 }}>
        {weekdays.map((d) => (
          <Typography key={d} sx={{ fontSize: '0.688rem', fontWeight: 600, color: 'text.disabled', textAlign: 'center', py: 0.75, textTransform: 'uppercase' }}>
            {d}
          </Typography>
        ))}
      </Box>

      {/* Days Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: { xs: 0.5, sm: 0.75 } }}>
        {days.map((d, i) => {
          const disabled = isDisabled(d);
          const selected = isSelected(d);
          const todayDate = isToday(d);
          return (
            <Box
              key={i}
              onClick={() => !disabled && d && onSelect(d)}
              sx={{
                width: { xs: 32, sm: 40 },
                height: { xs: 32, sm: 40 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: { xs: '8px', sm: '10px' },
                cursor: disabled ? 'default' : 'pointer',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                fontWeight: selected ? 700 : 500,
                color: !d ? 'transparent' : disabled ? alpha(theme.palette.text.disabled, 0.5) : selected ? 'white' : todayDate ? 'primary.main' : 'text.primary',
                bgcolor: selected ? 'primary.main' : todayDate ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                border: todayDate && !selected ? `1.5px solid ${theme.palette.primary.main}` : '1.5px solid transparent',
                transition: 'all 0.15s ease',
                '&:hover': !disabled && d ? {
                  bgcolor: selected ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1),
                } : {},
              }}
            >
              {d ? d.getDate() : ''}
            </Box>
          );
        })}
      </Box>

      {/* Today button */}
      <Box sx={{ mt: { xs: 1.5, sm: 2 }, display: 'flex', justifyContent: 'center' }}>
        <Button
          size="small"
          onClick={() => { setViewDate(today); onSelect(today); }}
          disabled={today < minDate}
          sx={{ 
            fontSize: { xs: '0.688rem', sm: '0.75rem' }, 
            fontWeight: 600, 
            textTransform: 'none', 
            color: 'primary.main',
            px: { xs: 1.5, sm: 2 },
            py: 0.5,
            borderRadius: '8px',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
          }}
        >
          Today
        </Button>
      </Box>
    </Box>
  );
};

// Date Input with typing support
const DateInputField = ({ label, value, placeholder, onDateSelect, onClear, error, disabled, minDate, maxDate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inputError, setInputError] = useState('');

  // Sync display value
  useEffect(() => {
    if (!isTyping && value) {
      const date = parseISODate(value);
      if (date) {
        setInputValue(`${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`);
      }
    } else if (!isTyping && !value) {
      setInputValue('');
    }
  }, [value, isTyping]);

  const handleInputChange = (e) => {
    const formatted = formatInputValue(e.target.value);
    setInputValue(formatted);
    setIsTyping(true);
    setInputError('');

    // Auto-validate when complete
    if (formatted.length === 10) {
      const parsed = parseDateInput(formatted);
      if (parsed) {
        if (parsed < minDate) {
          setInputError('Date cannot be in the past');
        } else if (parsed > maxDate) {
          setInputError('Date is too far in the future');
        } else {
          onDateSelect(parsed);
          setIsTyping(false);
        }
      } else {
        setInputError('Invalid date');
      }
    }
  };

  const handleBlur = () => {
    if (inputValue && inputValue.length === 10) {
      const parsed = parseDateInput(inputValue);
      if (parsed && parsed >= minDate && parsed <= maxDate) {
        onDateSelect(parsed);
      }
    }
    setIsTyping(false);
  };

  const handleClear = () => {
    setInputValue('');
    setInputError('');
    setIsTyping(false);
    onClear();
  };

  const hasValue = !!value;

  return (
    <Box>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: disabled ? 'text.disabled' : 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={() => setIsTyping(true)}
        placeholder={disabled ? 'Select start first' : 'DD/MM/YYYY'}
        disabled={disabled}
        error={!!inputError}
        helperText={inputError || (disabled ? '' : 'Type or select from calendar')}
        inputRef={inputRef}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {hasValue && !isTyping ? (
                <Check size={18} color={theme.palette.primary.main} strokeWidth={2.5} />
              ) : (
                <Type size={18} color={disabled ? theme.palette.text.disabled : theme.palette.text.secondary} />
              )}
            </InputAdornment>
          ),
          endAdornment: inputValue && !disabled && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} sx={{ p: 0.5 }}>
                <X size={16} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            bgcolor: disabled ? alpha(theme.palette.grey[100], 0.3) : alpha(theme.palette.grey[50], 0.5),
            fontSize: '0.938rem',
            fontFamily: 'SF Mono, Monaco, Consolas, monospace',
            letterSpacing: '0.5px',
            '& fieldset': { borderColor: hasValue ? alpha(theme.palette.primary.main, 0.2) : 'transparent' },
            '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.3) },
            '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
          },
          '& .MuiInputBase-input': { py: 1.5 },
        }}
      />
    </Box>
  );
};

// Main Component
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
  const { minDate, maxDate } = getDateBounds();

  const startDate = parseISODate(newHoliday.startDate);
  const endDate = parseISODate(newHoliday.endDate);

  const handleStartSelect = useCallback((date) => {
    const iso = formatDateToISO(date);
    const updated = { ...newHoliday, startDate: iso };
    if (endDate && date > endDate) {
      updated.endDate = '';
    }
    setNewHoliday(updated);
    if (updated.endDate) {
      const hasOverlap = checkDateOverlap(iso, updated.endDate, editingHoliday?._id);
      setDateOverlapWarning(hasOverlap ? 'This date range overlaps with an existing holiday' : '');
    }
  }, [newHoliday, endDate, setNewHoliday, checkDateOverlap, editingHoliday, setDateOverlapWarning]);

  const handleEndSelect = useCallback((date) => {
    const iso = formatDateToISO(date);
    setNewHoliday({ ...newHoliday, endDate: iso });
    if (newHoliday.startDate) {
      const hasOverlap = checkDateOverlap(newHoliday.startDate, iso, editingHoliday?._id);
      setDateOverlapWarning(hasOverlap ? 'This date range overlaps with an existing holiday' : '');
    }
  }, [newHoliday, setNewHoliday, checkDateOverlap, editingHoliday, setDateOverlapWarning]);

  const handleClearStart = useCallback(() => {
    setNewHoliday({ ...newHoliday, startDate: '', endDate: '' });
    setDateOverlapWarning('');
  }, [newHoliday, setNewHoliday, setDateOverlapWarning]);

  const handleClearEnd = useCallback(() => {
    setNewHoliday({ ...newHoliday, endDate: '' });
    setDateOverlapWarning('');
  }, [newHoliday, setNewHoliday, setDateOverlapWarning]);

  const endMinDate = startDate || minDate;

  // Duration display
  const duration = startDate && endDate
    ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    : null;

  return (
    <Box>
      {/* Two Column Layout - Stacked on mobile for better scrolling */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 2.5, md: 4 } }}>
        {/* Start Date Column */}
        <Box>
          <DateInputField
            label="Start Date"
            value={newHoliday.startDate}
            placeholder="DD/MM/YYYY"
            onDateSelect={handleStartSelect}
            onClear={handleClearStart}
            minDate={minDate}
            maxDate={maxDate}
          />
          {/* Calendar Section */}
          <Box
            sx={{
              mt: 2,
              p: { xs: 1.5, sm: 2 },
              borderRadius: '14px',
              bgcolor: alpha(theme.palette.grey[50], 0.8),
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            {/* Calendar Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 }, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <Box
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: '8px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={isMobile ? 14 : 16} color={theme.palette.primary.main} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' }, fontWeight: 600, color: 'text.primary' }}>
                  Start Date
                </Typography>
                {!isMobile && (
                  <Typography sx={{ fontSize: '0.688rem', color: 'text.secondary' }}>
                    Select when your time off begins
                  </Typography>
                )}
              </Box>
            </Box>
            <InlineCalendar
              selectedDate={startDate}
              onSelect={handleStartSelect}
              minDate={minDate}
              maxDate={maxDate}
            />
          </Box>
        </Box>

        {/* End Date Column */}
        <Box>
          <DateInputField
            label="End Date"
            value={newHoliday.endDate}
            placeholder="DD/MM/YYYY"
            onDateSelect={handleEndSelect}
            onClear={handleClearEnd}
            disabled={!startDate}
            minDate={endMinDate}
            maxDate={maxDate}
          />
          {/* Calendar Section */}
          <Box
            sx={{
              mt: 2,
              p: { xs: 1.5, sm: 2 },
              borderRadius: '14px',
              bgcolor: startDate ? alpha(theme.palette.grey[50], 0.8) : alpha(theme.palette.grey[100], 0.4),
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              opacity: startDate ? 1 : 0.5,
              pointerEvents: startDate ? 'auto' : 'none',
              transition: 'opacity 0.2s ease',
            }}
          >
            {/* Calendar Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 1.5, sm: 2 }, pb: { xs: 1, sm: 1.5 }, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <Box
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: '8px',
                  bgcolor: startDate ? alpha('#10b981', 0.1) : alpha(theme.palette.grey[300], 0.5),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={isMobile ? 14 : 16} color={startDate ? '#10b981' : theme.palette.text.disabled} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' }, fontWeight: 600, color: startDate ? 'text.primary' : 'text.disabled' }}>
                  End Date
                </Typography>
                {!isMobile && (
                  <Typography sx={{ fontSize: '0.688rem', color: startDate ? 'text.secondary' : 'text.disabled' }}>
                    {startDate ? 'Select when your time off ends' : 'Select a start date first'}
                  </Typography>
                )}
              </Box>
            </Box>
            <InlineCalendar
              selectedDate={endDate}
              onSelect={handleEndSelect}
              minDate={endMinDate}
              maxDate={maxDate}
            />
          </Box>
        </Box>
      </Box>

      {/* Duration Display */}
      {duration && (
        <Fade in>
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: '12px',
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
            }}
          >
            <Calendar size={18} color={theme.palette.primary.main} />
            <Typography sx={{ fontSize: '0.938rem', fontWeight: 600, color: 'primary.main' }}>
              {duration} day{duration > 1 ? 's' : ''} off
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {formatShortDate(startDate)} – {formatShortDate(endDate)}
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Overlap Warning */}
      {dateOverlapWarning && (
        <Fade in>
          <Alert
            severity="warning"
            onClose={() => setDateOverlapWarning('')}
            sx={{ mt: 2, borderRadius: '10px' }}
          >
            {dateOverlapWarning}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};

export default UpcomingHolidayDatePicker;
