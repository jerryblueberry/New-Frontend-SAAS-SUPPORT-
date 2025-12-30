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
  Dialog,
  DialogContent,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Calendar, ChevronLeft, ChevronRight, X, Check, Type, CalendarDays, Sparkles, Info } from 'lucide-react';

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

// Enhanced Calendar Component with better UX
const EnhancedCalendar = ({ selectedDate, onSelect, minDate, maxDate, label, color = '#6366f1' }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [viewDate, setViewDate] = useState(() => selectedDate || minDate || new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      {/* Enhanced Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <IconButton
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          disabled={!canPrev}
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '10px',
            bgcolor: canPrev ? alpha(color, 0.08) : 'transparent',
            color: canPrev ? color : theme.palette.text.disabled,
            '&:hover': canPrev ? { bgcolor: alpha(color, 0.12) } : {},
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronLeft size={20} />
        </IconButton>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}>
            {monthNames[month]} {year}
          </Typography>
          {label && (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.25 }}>
              {label}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          disabled={!canNext}
          sx={{ 
            width: 40, 
            height: 40, 
            borderRadius: '10px',
            bgcolor: canNext ? alpha(color, 0.08) : 'transparent',
            color: canNext ? color : theme.palette.text.disabled,
            '&:hover': canNext ? { bgcolor: alpha(color, 0.12) } : {},
            transition: 'all 0.2s ease',
          }}
        >
          <ChevronRight size={20} />
        </IconButton>
      </Box>

      {/* Weekdays Header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 2, gap: 0.5 }}>
        {weekdays.map((d) => (
          <Typography 
            key={d} 
            sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              color: 'text.secondary', 
              textAlign: 'center', 
              py: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {d}
          </Typography>
        ))}
      </Box>

      {/* Days Grid - Larger and cleaner */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {days.map((d, i) => {
          const disabled = isDisabled(d);
          const selected = isSelected(d);
          const todayDate = isToday(d);
          return (
            <Box
              key={i}
              onClick={() => !disabled && d && onSelect(d)}
              sx={{
                aspectRatio: '1',
                minHeight: { xs: 44, sm: 48 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                cursor: disabled ? 'default' : 'pointer',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: selected ? 700 : todayDate ? 600 : 500,
                color: !d ? 'transparent' : disabled 
                  ? alpha(theme.palette.text.disabled, 0.3) 
                  : selected 
                    ? '#fff' 
                    : todayDate 
                      ? color 
                      : 'text.primary',
                bgcolor: selected 
                  ? color 
                  : todayDate && !selected 
                    ? alpha(color, 0.1) 
                    : 'transparent',
                border: selected 
                  ? `2px solid ${color}` 
                  : todayDate && !selected 
                    ? `2px solid ${alpha(color, 0.3)}` 
                    : '2px solid transparent',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': !disabled && d ? {
                  bgcolor: selected ? color : alpha(color, 0.08),
                  transform: 'scale(1.05)',
                  borderColor: selected ? color : alpha(color, 0.3),
                } : {},
                '&:active': !disabled && d ? {
                  transform: 'scale(0.98)',
                } : {},
              }}
            >
              {d ? d.getDate() : ''}
              {todayDate && !selected && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: color,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button
          size="small"
          onClick={() => { setViewDate(today); onSelect(today); }}
          disabled={today < minDate || today > maxDate}
          sx={{ 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            textTransform: 'none', 
            color: today >= minDate && today <= maxDate ? color : theme.palette.text.disabled,
            px: 2,
            py: 0.75,
            borderRadius: '8px',
            bgcolor: today >= minDate && today <= maxDate ? alpha(color, 0.08) : 'transparent',
            '&:hover': today >= minDate && today <= maxDate ? { bgcolor: alpha(color, 0.12) } : {},
          }}
        >
          Today
        </Button>
        {(() => {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const canSelectTomorrow = tomorrow >= minDate && tomorrow <= maxDate;
          return (
            <Button
              size="small"
              onClick={() => { setViewDate(tomorrow); onSelect(tomorrow); }}
              disabled={!canSelectTomorrow}
              sx={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                textTransform: 'none', 
                color: canSelectTomorrow ? color : theme.palette.text.disabled,
                px: 2,
                py: 0.75,
                borderRadius: '8px',
                bgcolor: canSelectTomorrow ? alpha(color, 0.08) : 'transparent',
                '&:hover': canSelectTomorrow ? { bgcolor: alpha(color, 0.12) } : {},
              }}
            >
              Tomorrow
            </Button>
          );
        })()}
      </Box>
    </Box>
  );
};

// Enhanced Date Input Field
const EnhancedDateInput = ({ label, value, onDateSelect, onClear, error, disabled, minDate, maxDate, color = '#6366f1' }) => {
  const theme = useTheme();
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inputError, setInputError] = useState('');

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
  const displayValue = hasValue && !isTyping ? formatDisplayDate(parseISODate(value)) : '';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: disabled ? alpha(theme.palette.grey[200], 0.3) : alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Calendar size={18} color={disabled ? theme.palette.text.disabled : color} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: disabled ? 'text.disabled' : 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>
            {label}
          </Typography>
          {hasValue && !isTyping ? (
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary' }}>
              {displayValue}
            </Typography>
          ) : (
            <TextField
              fullWidth
              size="small"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onFocus={() => setIsTyping(true)}
              placeholder={disabled ? 'Select start date first' : 'DD/MM/YYYY'}
              disabled={disabled}
              error={!!inputError}
              helperText={inputError || (disabled ? '' : 'Type or click calendar')}
              inputRef={inputRef}
              InputProps={{
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
                  bgcolor: disabled ? alpha(theme.palette.grey[100], 0.3) : '#fafafa',
                  fontSize: '0.875rem',
                  fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                  '& fieldset': { borderColor: hasValue ? alpha(color, 0.2) : alpha(theme.palette.divider, 0.1) },
                  '&:hover fieldset': { borderColor: alpha(color, 0.3) },
                  '&.Mui-focused fieldset': { borderColor: color },
                },
                '& .MuiInputBase-input': { py: 1.25 },
              }}
            />
          )}
        </Box>
        {hasValue && !isTyping && (
          <IconButton
            size="small"
            onClick={handleClear}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              bgcolor: alpha(theme.palette.error.main, 0.08),
              color: theme.palette.error.main,
              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.12) },
            }}
          >
            <X size={16} />
          </IconButton>
        )}
      </Box>
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
      {/* Enhanced Two Column Layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: { xs: 3, lg: 4 } }}>
        {/* Start Date Section */}
        <Box>
          <EnhancedDateInput
            label="Start Date"
            value={newHoliday.startDate}
            onDateSelect={handleStartSelect}
            onClear={handleClearStart}
            minDate={minDate}
            maxDate={maxDate}
            color="#6366f1"
          />
          
          <Box
            sx={{
              mt: 3,
              p: { xs: 2, sm: 3 },
              borderRadius: '16px',
              bgcolor: '#fafafa',
              border: `1px solid ${alpha('#6366f1', 0.1)}`,
              boxShadow: `0 2px 8px ${alpha('#6366f1', 0.05)}`,
            }}
          >
            <EnhancedCalendar
              selectedDate={startDate}
              onSelect={handleStartSelect}
              minDate={minDate}
              maxDate={maxDate}
              label="When does your time off begin?"
              color="#6366f1"
            />
          </Box>
        </Box>

        {/* End Date Section */}
        <Box>
          <EnhancedDateInput
            label="End Date"
            value={newHoliday.endDate}
            onDateSelect={handleEndSelect}
            onClear={handleClearEnd}
            disabled={!startDate}
            minDate={endMinDate}
            maxDate={maxDate}
            color="#10b981"
          />
          
          <Box
            sx={{
              mt: 3,
              p: { xs: 2, sm: 3 },
              borderRadius: '16px',
              bgcolor: startDate ? '#fafafa' : alpha(theme.palette.grey[100], 0.5),
              border: `1px solid ${startDate ? alpha('#10b981', 0.1) : alpha(theme.palette.divider, 0.08)}`,
              boxShadow: startDate ? `0 2px 8px ${alpha('#10b981', 0.05)}` : 'none',
              opacity: startDate ? 1 : 0.6,
              pointerEvents: startDate ? 'auto' : 'none',
              transition: 'all 0.3s ease',
              position: 'relative',
            }}
          >
            {!startDate && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  zIndex: 1,
                }}
              >
                <Info size={24} color={theme.palette.text.disabled} />
                <Typography sx={{ fontSize: '0.875rem', color: 'text.disabled', mt: 1, fontWeight: 600 }}>
                  Select start date first
                </Typography>
              </Box>
            )}
            <EnhancedCalendar
              selectedDate={endDate}
              onSelect={handleEndSelect}
              minDate={endMinDate}
              maxDate={maxDate}
              label={startDate ? "When does your time off end?" : "Select start date first"}
              color="#10b981"
            />
          </Box>
        </Box>
      </Box>

      {/* Enhanced Duration & Summary Display */}
      {duration && (
        <Fade in>
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${alpha('#6366f1', 0.08)} 0%, ${alpha('#10b981', 0.08)} 100%)`,
              border: `1px solid ${alpha('#6366f1', 0.15)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  bgcolor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${alpha('#6366f1', 0.3)}`,
                }}
              >
                <CalendarDays size={24} color="#fff" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
                  {duration} day{duration > 1 ? 's' : ''}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', mt: 0.25 }}>
                  {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={<Sparkles size={14} />}
              label="Time Off Period"
              sx={{
                bgcolor: alpha('#6366f1', 0.1),
                color: '#6366f1',
                fontWeight: 600,
                fontSize: '0.875rem',
                height: 36,
                borderRadius: '10px',
              }}
            />
          </Box>
        </Fade>
      )}

      {/* Enhanced Overlap Warning */}
      {dateOverlapWarning && (
        <Fade in>
          <Alert
            severity="warning"
            icon={<Info size={20} />}
            onClose={() => setDateOverlapWarning('')}
            sx={{ 
              mt: 3, 
              borderRadius: '12px',
              bgcolor: alpha('#f59e0b', 0.08),
              border: `1px solid ${alpha('#f59e0b', 0.2)}`,
              '& .MuiAlert-icon': {
                color: '#f59e0b',
              },
            }}
          >
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Date Overlap Detected</Typography>
            <Typography sx={{ fontSize: '0.875rem' }}>{dateOverlapWarning}</Typography>
          </Alert>
        </Fade>
      )}

      {/* Helpful Tip */}
      {!startDate && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: '12px',
            bgcolor: alpha('#6366f1', 0.06),
            border: `1px solid ${alpha('#6366f1', 0.1)}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Info size={18} color="#6366f1" style={{ marginTop: 2, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Quick Tip
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>
              Select your start date first, then choose when your time off ends. You can type dates in DD/MM/YYYY format or click directly on the calendar.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UpcomingHolidayDatePicker;
