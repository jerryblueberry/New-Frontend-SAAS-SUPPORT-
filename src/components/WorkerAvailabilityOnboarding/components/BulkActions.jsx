// src/components/WorkerAvailabilityOnboarding/components/BulkActions.jsx
import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slide,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Copy as CopyAllIcon,
  CalendarOff as WeekendIcon,
  Trash2 as DeleteSweepIcon,
  MoreVertical as MoreVertIcon,
  AlertTriangle,
} from 'lucide-react';
import { wouldOverlap } from '../utils/timeSlotUtils';

// Slide transition for modal
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * BulkActions Component
 * 
 * Provides bulk actions for time slots including:
 * - Copy Monday slots to weekdays
 * - Mark weekends unavailable
 * - Clear all availability
 * 
 * Optimized for production with memoization, responsive design, and improved UX.
 * 
 * @param {array} customTimeSlots - Array of time slots
 * @param {function} onBulkAction - Callback for bulk actions (receives action object or array)
 * @param {boolean} disabled - Whether bulk actions are disabled
 */
const BulkActions = ({ customTimeSlots, onBulkAction, disabled }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Memoize computed values for performance
  const slotStats = useMemo(() => {
    const slots = customTimeSlots || [];
    return {
      hasSlots: slots.length > 0,
      hasMondaySlots: slots.some(slot => slot.dayOfWeek === 'Monday'),
      hasWeekendSlots: slots.some(slot => slot.dayOfWeek === 'Saturday' || slot.dayOfWeek === 'Sunday'),
      mondaySlotCount: slots.filter(slot => slot.dayOfWeek === 'Monday').length,
      weekendSlotCount: slots.filter(slot => slot.dayOfWeek === 'Saturday' || slot.dayOfWeek === 'Sunday').length,
    };
  }, [customTimeSlots]);

  const handleCopyMondayToWeekdays = useCallback(() => {
    const mondaySlots = customTimeSlots?.filter(slot => slot.dayOfWeek === 'Monday') || [];
    if (mondaySlots.length === 0) {
      handleClose();
      return;
    }

    const weekdays = ['Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const newSlots = [];

    weekdays.forEach(day => {
      mondaySlots.forEach(slot => {
        const newSlot = { ...slot, dayOfWeek: day };
        if (!wouldOverlap(newSlot, customTimeSlots)) {
          newSlots.push(newSlot);
        }
      });
    });

    if (newSlots.length > 0) {
      onBulkAction(newSlots);
    }
    handleClose();
  }, [customTimeSlots, onBulkAction, handleClose]);

  const handleClearAll = useCallback(() => {
    handleClose();
    setConfirmDialogOpen(true);
  }, [handleClose]);

  const handleConfirmClear = useCallback(() => {
    // Remove from end to beginning to avoid index shifting issues
    const indicesToRemove = customTimeSlots?.map((_, idx) => idx).reverse() || [];
    indicesToRemove.forEach(idx => onBulkAction({ type: 'remove', index: idx }));
    setConfirmDialogOpen(false);
  }, [customTimeSlots, onBulkAction]);

  const handleCancelClear = useCallback(() => {
    setConfirmDialogOpen(false);
  }, []);

  const handleMarkWeekendsUnavailable = useCallback(() => {
    const weekendIndices = customTimeSlots
      ?.map((slot, idx) => (slot.dayOfWeek === 'Saturday' || slot.dayOfWeek === 'Sunday') ? idx : null)
      .filter(idx => idx !== null) || [];
    
    if (weekendIndices.length === 0) {
      handleClose();
      return;
    }

    // Remove from end to beginning to avoid index shifting issues
    weekendIndices.reverse().forEach(idx => onBulkAction({ type: 'remove', index: idx }));
    handleClose();
  }, [customTimeSlots, onBulkAction, handleClose]);

  return (
    <>
      <Tooltip 
        title={disabled || !slotStats.hasSlots ? "No actions available" : "Bulk actions"}
        arrow
        placement="top"
        enterDelay={300}
        leaveDelay={0}
      >
        <span>
          <IconButton
            onClick={handleClick}
            disabled={disabled || !slotStats.hasSlots}
            sx={{
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              bgcolor: open 
                ? alpha(theme.palette.primary.main, 0.12)
                : alpha(theme.palette.primary.main, 0.06),
              backdropFilter: 'blur(8px)',
              border: `1px solid ${open 
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.divider, 0.08)}`,
              cursor: disabled || !slotStats.hasSlots ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                bgcolor: alpha(theme.palette.primary.main, 0),
                transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'none',
              },
              '&:hover:not(:disabled)': { 
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                borderColor: alpha(theme.palette.primary.main, 0.2),
                boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.15)}`,
                '&::before': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              },
              '&:active:not(:disabled)': {
                '&::before': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              },
              '&:disabled': { 
                bgcolor: alpha(theme.palette.action.disabled, 0.04),
                borderColor: alpha(theme.palette.divider, 0.04),
                color: theme.palette.action.disabled,
                cursor: 'not-allowed',
              },
            }}
          >
            <MoreVertIcon 
              size={isMobile ? 18 : 20}
              color={disabled || !slotStats.hasSlots 
                ? theme.palette.action.disabled 
                : theme.palette.text.secondary}
            />
          </IconButton>
        </span>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        transitionDuration={{ enter: 200, exit: 150 }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            mt: 0.75,
            minWidth: { xs: 240, sm: 260 },
            maxWidth: { xs: '90vw', sm: 320 },
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            backdropFilter: 'blur(10px)',
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            overflow: 'hidden',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
        MenuListProps={{
          sx: {
            py: 0.5,
          },
        }}
      >
        <MenuItem
          onClick={handleCopyMondayToWeekdays}
          disabled={!slotStats.hasMondaySlots}
          sx={{ 
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            py: { xs: 1.125, sm: 1.25 },
            px: { xs: 1.5, sm: 1.75 },
            cursor: slotStats.hasMondaySlots ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover:not(:disabled)': {
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            },
            '&:active:not(:disabled)': {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}>
            <CopyAllIcon 
              size={isMobile ? 18 : 20}
              color={slotStats.hasMondaySlots 
                ? theme.palette.primary.main 
                : theme.palette.action.disabled}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 'inherit',
                  fontWeight: 500,
                  color: slotStats.hasMondaySlots 
                    ? theme.palette.text.primary 
                    : theme.palette.text.disabled,
                  lineHeight: 1.4,
                }}
              >
                Copy Monday to Weekdays
              </Typography>
              {slotStats.hasMondaySlots && slotStats.mondaySlotCount > 0 && (
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    color: theme.palette.text.secondary,
                    mt: 0.125,
                  }}
                >
                  {slotStats.mondaySlotCount} slot{slotStats.mondaySlotCount !== 1 ? 's' : ''} will be copied
                </Typography>
              )}
            </Box>
          </Box>
        </MenuItem>
        
        <MenuItem
          onClick={handleMarkWeekendsUnavailable}
          disabled={!slotStats.hasWeekendSlots}
          sx={{ 
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            py: { xs: 1.125, sm: 1.25 },
            px: { xs: 1.5, sm: 1.75 },
            cursor: slotStats.hasWeekendSlots ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover:not(:disabled)': {
              bgcolor: alpha(theme.palette.warning.main, 0.08),
            },
            '&:active:not(:disabled)': {
              bgcolor: alpha(theme.palette.warning.main, 0.12),
            },
            '&:disabled': {
              opacity: 0.5,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}>
            <WeekendIcon 
              size={isMobile ? 18 : 20}
              color={slotStats.hasWeekendSlots 
                ? theme.palette.warning.main 
                : theme.palette.action.disabled}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 'inherit',
                  fontWeight: 500,
                  color: slotStats.hasWeekendSlots 
                    ? theme.palette.text.primary 
                    : theme.palette.text.disabled,
                  lineHeight: 1.4,
                }}
              >
                Mark Weekends Unavailable
              </Typography>
              {slotStats.hasWeekendSlots && slotStats.weekendSlotCount > 0 && (
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    color: theme.palette.text.secondary,
                    mt: 0.125,
                  }}
                >
                  {slotStats.weekendSlotCount} slot{slotStats.weekendSlotCount !== 1 ? 's' : ''} will be removed
                </Typography>
              )}
            </Box>
          </Box>
        </MenuItem>

        <Divider sx={{ my: 0.5, bgcolor: alpha(theme.palette.divider, 0.08) }} />

        <MenuItem
          onClick={handleClearAll}
          sx={{ 
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            py: { xs: 1.125, sm: 1.25 },
            px: { xs: 1.5, sm: 1.75 },
            color: theme.palette.error.main,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08),
            },
            '&:active': {
              bgcolor: alpha(theme.palette.error.main, 0.12),
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}>
            <DeleteSweepIcon 
              size={isMobile ? 18 : 20}
              color={theme.palette.error.main}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 'inherit',
                  fontWeight: 600,
                  color: theme.palette.error.main,
                  lineHeight: 1.4,
                }}
              >
                Clear All Availability
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  color: alpha(theme.palette.error.main, 0.7),
                  mt: 0.125,
                }}
              >
                This action cannot be undone
              </Typography>
            </Box>
          </Box>
        </MenuItem>
      </Menu>

      {/* Premium Confirmation Modal */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelClear}
        TransitionComponent={SlideTransition}
        transitionDuration={{ enter: 300, exit: 200 }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            m: { xs: 2, sm: 3 },
            maxWidth: { xs: 'calc(100% - 32px)', sm: 440 },
            width: { xs: 'calc(100% - 32px)', sm: 'auto' },
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 8px 16px -4px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            maxHeight: { xs: 'calc(100vh - 64px)', sm: '90vh' },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        sx={{
          '& .MuiBackdrop-root': {
            bgcolor: alpha(theme.palette.common.black, 0.5),
            backdropFilter: 'blur(4px)',
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2.5, sm: 3 },
            pt: { xs: 2.5, sm: 3 },
            pb: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: { xs: 44, sm: 48 },
              height: { xs: 44, sm: 48 },
              borderRadius: '12px',
              bgcolor: alpha(theme.palette.error.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle 
              size={isMobile ? 22 : 24} 
              color={theme.palette.error.main} 
              strokeWidth={2.5} 
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                fontWeight: 700,
                color: theme.palette.text.primary,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
                mb: 0.5,
              }}
            >
              Clear All Availability?
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                color: theme.palette.text.secondary,
                lineHeight: 1.5,
              }}
            >
              This will remove all your time slots
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2.5, sm: 3 },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: '12px',
              bgcolor: alpha(theme.palette.error.main, 0.06),
              border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                color: theme.palette.text.primary,
                lineHeight: 1.6,
                mb: 1,
                fontWeight: 500,
              }}
            >
              Are you sure you want to clear all availability?
            </Typography>
            <Box
              component="ul"
              sx={{
                m: 0,
                pl: 2.5,
                '& li': {
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  color: theme.palette.text.secondary,
                  lineHeight: 1.8,
                  mb: 0.5,
                  '&:last-child': { mb: 0 },
                },
              }}
            >
              <li>All {customTimeSlots?.length || 0} time slot{customTimeSlots?.length !== 1 ? 's' : ''} will be permanently removed</li>
              <li>You'll need to add availability again to receive job matches</li>
              <li>This action cannot be undone</li>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 3 },
            pb: { xs: 2.5, sm: 3 },
            pt: 1.5,
            gap: 1.25,
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: { sm: 'flex-end' },
          }}
        >
          <Button
            onClick={handleCancelClear}
            variant="outlined"
            fullWidth={isMobile}
            sx={{
              minWidth: { xs: '100%', sm: 120 },
              height: { xs: 44, sm: 40 },
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              borderColor: alpha(theme.palette.divider, 0.2),
              borderWidth: '1.5px',
              color: theme.palette.text.primary,
              bgcolor: 'transparent',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: theme.palette.text.secondary,
                bgcolor: alpha(theme.palette.grey[500], 0.08),
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClear}
            variant="contained"
            fullWidth={isMobile}
            sx={{
              minWidth: { xs: '100%', sm: 140 },
              height: { xs: 44, sm: 40 },
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              bgcolor: theme.palette.error.main,
              color: '#ffffff',
              boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: theme.palette.error.dark,
                boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
                boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.3)}`,
              },
            }}
          >
            Yes, Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

BulkActions.propTypes = {
  customTimeSlots: PropTypes.array,
  onBulkAction: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default React.memo(BulkActions);

