// src/components/WorkerAvailabilityOnboarding/components/TimeSlotChip.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { formatTime, formatTimeShort } from '../utils/timeSlotUtils';

/**
 * TimeSlotChip Component
 * 
 * A modern, clean chip component that displays a time slot with edit and delete actions.
 * Designed with SaaS-level UX patterns - minimal, elegant, and highly responsive.
 * 
 * @param {object} slot - The time slot object with startTime and endTime
 * @param {number} index - The index of the slot in the array
 * @param {function} onEdit - Callback when edit button is clicked
 * @param {function} onRemove - Callback when delete button is clicked
 * @param {boolean} disabled - Whether the chip is disabled
 */
const TimeSlotChip = ({ slot, index, onEdit, onRemove, disabled }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: { xs: 0.5, sm: 0.75 },
        py: { xs: 0.5, sm: 0.625 },
        px: { xs: 1, sm: 1.25 },
        borderRadius: '10px',
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        backdropFilter: 'blur(8px)',
        boxShadow: disabled 
          ? 'none' 
          : '0 1px 2px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled ? 'not-allowed' : 'default',
        opacity: disabled ? 0.6 : 1,
        '&:hover': !disabled ? {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
          transform: 'translateY(-1px)',
        } : {},
        '&:active': !disabled ? {
          transform: 'translateY(0)',
        } : {},
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: '0.75rem', sm: '0.8125rem' },
          fontWeight: 600,
          color: theme.palette.text.primary,
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
          lineHeight: 1.4,
        }}
      >
        {isMobile ? formatTimeShort(slot.startTime) : formatTime(slot.startTime)}
        <Box 
          component="span" 
          sx={{ 
            mx: 0.5, 
            color: alpha(theme.palette.text.secondary, 0.6),
            fontWeight: 400,
          }}
        >
          –
        </Box>
        {isMobile ? formatTimeShort(slot.endTime) : formatTime(slot.endTime)}
      </Typography>

      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0, sm: 0.125 },
          ml: { xs: 0.5, sm: 0.25 },
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(slot, index);
          }}
          disabled={disabled}
          sx={{ 
            width: { xs: 28, sm: 24 },
            height: { xs: 28, sm: 24 },
            p: 0,
            color: alpha(theme.palette.text.secondary, 0.7),
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '6px',
            '&:hover:not(:disabled)': { 
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              transform: 'scale(1.05)',
            },
            '&:active:not(:disabled)': {
              transform: 'scale(0.95)',
            },
          }}
        >
          <EditIcon sx={{ fontSize: { xs: 15, sm: 14 } }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          disabled={disabled}
          sx={{ 
            width: { xs: 28, sm: 24 },
            height: { xs: 28, sm: 24 },
            p: 0,
            color: alpha(theme.palette.text.secondary, 0.6),
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '6px',
            '&:hover:not(:disabled)': { 
              color: '#ef4444',
              bgcolor: alpha('#ef4444', 0.08),
              transform: 'scale(1.05)',
            },
            '&:active:not(:disabled)': {
              transform: 'scale(0.95)',
            },
          }}
        >
          <DeleteIcon sx={{ fontSize: { xs: 15, sm: 14 } }} />
        </IconButton>
      </Box>
    </Box>
  );
};

TimeSlotChip.propTypes = {
  slot: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default React.memo(TimeSlotChip);

