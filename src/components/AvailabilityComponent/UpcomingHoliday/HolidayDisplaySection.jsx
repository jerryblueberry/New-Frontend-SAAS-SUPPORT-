import React, { useMemo } from 'react';
import {
  Typography,
  Button,
  Box,
  Alert,
  IconButton,
  useMediaQuery,
  Fade,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Calendar, Plus, Pencil, Trash2, Clock, Check } from 'lucide-react';

// Utility functions
const calculateDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const formatDate = (date, compact = false) => {
  const dateObj = new Date(date);
  if (compact) {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatDateRange = (startDate, endDate, compact = false) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start.toDateString() === end.toDateString()) {
    return formatDate(startDate, compact);
  }
  return `${formatDate(startDate, true)} – ${formatDate(endDate, true)}`;
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
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getHolidayStatus = (startDate, endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  if (isDateInRange(today, startDate, endDate)) return 'ongoing';
  if (end < today) return 'past';
  return 'upcoming';
};

const HolidayDisplaySection = ({
  upcomingHolidays,
  holidaysLoading,
  holidaysError,
  setOpenHolidayDialog,
  setEditingHoliday,
  deleteHoliday,
  minimal = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sortedHolidays = useMemo(() => {
    if (!upcomingHolidays || upcomingHolidays.length === 0) return [];
    return [...upcomingHolidays].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [upcomingHolidays]);

  const HolidayItem = ({ holiday }) => {
    const status = getHolidayStatus(holiday.startDate, holiday.endDate);
    const daysUntil = getDaysUntilHoliday(holiday.startDate);
    const duration = calculateDaysDifference(holiday.startDate, holiday.endDate);
    const isOngoing = status === 'ongoing';
    const isPast = status === 'past';

    const statusConfig = {
      ongoing: { bg: '#fef3c7', text: '#92400e', label: 'Now' },
      past: { bg: '#f1f5f9', text: '#64748b', label: 'Past' },
      upcoming: daysUntil <= 7 
        ? { bg: '#dbeafe', text: '#1d4ed8', label: daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d` }
        : { bg: '#f1f5f9', text: '#475569', label: `${daysUntil}d` },
    };

    const statusStyle = statusConfig[status];

    return (
      <Fade in timeout={200}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: '10px',
            bgcolor: isPast ? '#fafafa' : '#fff',
            border: '1px solid #f1f5f9',
            opacity: isPast ? 0.6 : 1,
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: '#fafafa',
              borderColor: '#e2e8f0',
            },
          }}
        >
          {/* Date Box */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              bgcolor: isOngoing ? '#fef3c7' : '#f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: isOngoing ? '#92400e' : '#64748b', textTransform: 'uppercase', lineHeight: 1, letterSpacing: '0.02em' }}>
              {new Date(holiday.startDate).toLocaleDateString('en-US', { month: 'short' })}
            </Typography>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, color: isOngoing ? '#78350f' : '#334155', lineHeight: 1.1 }}>
              {new Date(holiday.startDate).getDate()}
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: isPast ? '#64748b' : '#0f172a',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {holiday.name}
              </Typography>
              <Box sx={{ px: 0.75, py: 0.25, borderRadius: '4px', bgcolor: statusStyle.bg, flexShrink: 0 }}>
                <Typography sx={{ fontSize: '0.5625rem', fontWeight: 700, color: statusStyle.text, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {statusStyle.label}
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              {formatDateRange(holiday.startDate, holiday.endDate, isMobile)} • {duration}d
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={() => { setEditingHoliday(holiday); setOpenHolidayDialog(true); }}
              sx={{ width: 28, height: 28, color: '#94a3b8', '&:hover': { color: '#3b82f6', bgcolor: '#eff6ff' } }}
            >
              <Pencil size={13} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => deleteHoliday(holiday._id)}
              sx={{ width: 28, height: 28, color: '#94a3b8', '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}
            >
              <Trash2 size={13} />
            </IconButton>
          </Box>
        </Box>
      </Fade>
    );
  };

  // Loading State
  if (holidaysLoading) {
    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(2)].map((_, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: '10px',
                bgcolor: '#fafafa',
              }}
            >
              <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: '#f1f5f9' }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ width: '50%', height: 12, borderRadius: 1, bgcolor: '#f1f5f9', mb: 0.5 }} />
                <Box sx={{ width: '70%', height: 10, borderRadius: 1, bgcolor: '#f1f5f9' }} />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Error State
  if (holidaysError) {
    return (
      <Alert severity="error" sx={{ borderRadius: '8px', py: 0.25 }}>
        Failed to load holidays
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {sortedHolidays.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.375, borderRadius: '6px', bgcolor: '#f1f5f9' }}>
              <Check size={11} color="#64748b" strokeWidth={3} />
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                {sortedHolidays.length} scheduled
              </Typography>
            </Box>
          )}
        </Box>
        <Button
          onClick={() => setOpenHolidayDialog(true)}
          startIcon={<Plus size={14} strokeWidth={2.5} />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            px: 1.5,
            py: 0.625,
            bgcolor: '#3b82f6',
            color: '#fff',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2563eb', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)' },
          }}
        >
          Add
        </Button>
      </Box>

      {/* Content */}
      {sortedHolidays.length === 0 ? (
        <Box
          sx={{
            py: 3.5,
            px: 2,
            textAlign: 'center',
            borderRadius: '10px',
            border: '2px dashed #e2e8f0',
            bgcolor: '#fafafa',
          }}
        >
          <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
            <Calendar size={18} color="#64748b" strokeWidth={2} />
          </Box>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: '#334155', mb: 0.25 }}>
            No time off scheduled
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Add days when you are unavailable
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sortedHolidays.map((holiday) => (
            <HolidayItem key={holiday._id} holiday={holiday} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default HolidayDisplaySection;
