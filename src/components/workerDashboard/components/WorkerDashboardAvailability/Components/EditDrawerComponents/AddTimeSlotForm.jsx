import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Typography,
  Stack,
  Paper,
  Box,
  Chip,
  MenuItem,
  Alert
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

import { daysOfWeek } from '../../../../../../utils/constants';
import { DAY_THEMES } from './constants';
import { formatTimeDisplay, calculateDuration } from './timeUtils';
import { validateTimeRange, checkTimeOverlap } from './validationUtils';

/**
 * Add Time Slot Form Component
 * Handles adding and editing time slots with validation
 */
const AddTimeSlotForm = ({
  newSlot,
  onSlotChange,
  isAddingSlot,
  isEditingSlot,
  onAddSlot,
  onUpdateSlot,
  onCancelEdit,
  customTimeSlots,
  groupedSlots,
  editingSlotIndex,
  fieldErrors,
  disabled
}) => {
  const theme = useTheme();

  const handleTimeValidation = () => {
    if (!newSlot.startTime || !newSlot.endTime) return null;
    
    const timeValidation = validateTimeRange(newSlot.startTime, newSlot.endTime);
    const duration = calculateDuration(newSlot.startTime, newSlot.endTime);
    const isValid = timeValidation.isValid;
    const overlapCheck = checkTimeOverlap(
      customTimeSlots,
      newSlot,
      isEditingSlot ? editingSlotIndex : null
    );
    
    return { timeValidation, duration, isValid, overlapCheck };
  };

  const validation = handleTimeValidation();

  return (
    <Card 
      data-slot-form
      elevation={0}
      sx={{ 
        borderRadius: { xs: 2, sm: 3 },
        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: alpha(theme.palette.warning.main, 0.3),
        }
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        {/* Header */}
        <Stack 
          direction="row" 
          spacing={{ xs: 1, sm: 1.5 }} 
          alignItems="center" 
          justifyContent="space-between"
          sx={{ mb: { xs: 1.5, sm: 2 } }}
        >
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center" sx={{ flex: 1 }}>
            <Box
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.1),
                borderRadius: { xs: 1.5, sm: 2 },
                p: { xs: 0.8, sm: 1, md: 1.2 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: { xs: 32, sm: 36, md: 40 },
                minHeight: { xs: 32, sm: 36, md: 40 }
              }}
            >
              <AccessTimeIcon sx={{ 
                color: 'warning.main', 
                fontSize: { xs: 18, sm: 20, md: 22 }
              }} />
            </Box>
            <Box flex={1}>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                sx={{
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                  lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 }
                }}
              >
                {isEditingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                  lineHeight: { xs: 1.2, sm: 1.3 },
                  mt: 0.3,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                {isEditingSlot ? 'Modify existing working hours' : 'Add available working hours'}
              </Typography>
            </Box>
          </Stack>
          
          {/* Cancel Button */}
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<CloseIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
            onClick={onCancelEdit}
            disabled={disabled}
            sx={{ 
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
              fontWeight: 600,
              py: { xs: 0.75, sm: 0.875 },
              px: { xs: 1.25, sm: 1.5 },
              minHeight: { xs: 36, sm: 40 },
              textTransform: 'none',
              whiteSpace: 'nowrap',
              borderColor: alpha(theme.palette.text.primary, 0.2),
              color: theme.palette.text.primary,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: alpha(theme.palette.text.primary, 0.4),
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                transform: 'scale(0.98)',
              },
              '&:active': {
                transform: 'scale(0.96)',
              },
              '& .MuiButton-startIcon': {
                marginRight: { xs: 0.5, sm: 0.625 }
              }
            }}
          >
            Cancel
          </Button>
        </Stack>

        {/* Form Content */}
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
            {/* Day Selection */}
            <TextField
              select
              label="Day of Week"
              value={newSlot.dayOfWeek}
              onChange={(e) => onSlotChange({ ...newSlot, dayOfWeek: e.target.value })}
              fullWidth
              disabled={disabled}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minHeight: { xs: 40, sm: 44 }
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }
              }}
            >
              {daysOfWeek.map(day => {
                const dayTheme = DAY_THEMES[day];
                return (
                  <MenuItem key={day} value={day}>
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
                      <Box
                        sx={{
                          width: { xs: 10, sm: 12 },
                          height: { xs: 10, sm: 12 },
                          borderRadius: '50%',
                          bgcolor: dayTheme.primary
                        }}
                      />
                      <Typography sx={{ 
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        fontWeight: 500
                      }}>
                        {day}
                      </Typography>
                      <Chip
                        label={groupedSlots[day]?.length || 0}
                        size="small"
                        sx={{ 
                          ml: 'auto',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: 20, sm: 24 }
                        }}
                      />
                    </Stack>
                  </MenuItem>
                );
              })}
            </TextField>

            {/* Time Pickers */}
            <Grid container spacing={{ xs: 1, sm: 1.5 }}>
              <Grid item xs={6}>
                <TimePicker
                  label="Start Time"
                  value={newSlot.startTime}
                  onChange={(newValue) => onSlotChange({ ...newSlot, startTime: newValue })}
                  disabled={disabled}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      size: 'small',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          minHeight: { xs: 40, sm: 44 }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }
                      }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TimePicker
                  label="End Time"
                  value={newSlot.endTime}
                  onChange={(newValue) => onSlotChange({ ...newSlot, endTime: newValue })}
                  disabled={disabled}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      size: 'small',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          borderRadius: { xs: 1.5, sm: 2 },
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          minHeight: { xs: 40, sm: 44 }
                        },
                        '& .MuiInputLabel-root': {
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Duration Preview */}
            {validation && (
              <Box
                sx={{
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: { xs: 1.5, sm: 2 },
                  bgcolor: alpha(
                    validation.isValid ? theme.palette.success.main : theme.palette.warning.main,
                    0.1
                  ),
                  border: `1px solid ${alpha(
                    validation.isValid ? theme.palette.success.main : theme.palette.warning.main,
                    0.3
                  )}`
                }}
              >
                <Stack spacing={{ xs: 0.8, sm: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={{ xs: 0.8, sm: 1 }}>
                    {validation.isValid ? (
                      <CheckCircleIcon sx={{ 
                        color: 'success.main', 
                        fontSize: { xs: 18, sm: 20 }
                      }} />
                    ) : (
                      <WarningIcon sx={{ 
                        color: 'warning.main', 
                        fontSize: { xs: 18, sm: 20 }
                      }} />
                    )}
                    <Typography 
                      variant="body2" 
                      color={validation.isValid ? 'success.main' : 'warning.main'} 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      Duration: {validation.duration}
                    </Typography>
                  </Stack>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, lineHeight: 1.3 }}
                  >
                    {formatTimeDisplay(newSlot.startTime)} - {formatTimeDisplay(newSlot.endTime)} on {newSlot.dayOfWeek}
                  </Typography>
                  
                  {validation.overlapCheck.hasOverlap && (
                    <Typography 
                      variant="caption" 
                      color="error.main"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, lineHeight: 1.3 }}
                    >
                      ⚠️ {validation.overlapCheck.message}
                    </Typography>
                  )}
                  
                  {(() => {
                    const daySlotCount = customTimeSlots.filter((slot, idx) => {
                      if (isEditingSlot && idx === editingSlotIndex) return false;
                      return slot.dayOfWeek === newSlot.dayOfWeek;
                    }).length;
                    
                    if (daySlotCount > 0) {
                      return (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, lineHeight: 1.3 }}
                        >
                          {daySlotCount} existing slot{daySlotCount !== 1 ? 's' : ''} on {newSlot.dayOfWeek}
                          {isEditingSlot && ' (excluding current slot)'}
                        </Typography>
                      );
                    }
                    return null;
                  })()}
                </Stack>
              </Box>
            )}

            {/* Error Message */}
            {fieldErrors.slot && (
              <Alert 
                severity="error" 
                variant="outlined" 
                sx={{ 
                  borderRadius: { xs: 1.5, sm: 2 },
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}
              >
                {fieldErrors.slot}
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              variant="contained"
              color="warning"
              startIcon={
                isEditingSlot ? 
                  <SaveIcon sx={{ fontSize: { xs: 16, sm: 18 } }} /> : 
                  <AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
              }
              onClick={isEditingSlot ? onUpdateSlot : onAddSlot}
              fullWidth
              disabled={!newSlot.startTime || !newSlot.endTime || disabled || fieldErrors.slot}
              sx={{
                borderRadius: { xs: 2, sm: 2.5 },
                py: { xs: 1, sm: 1.2, md: 1.5 },
                px: { xs: 1.5, sm: 2, md: 3 },
                fontWeight: 700,
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                minHeight: { xs: 40, sm: 44, md: 48 },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: theme.shadows[3],
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows[6],
                },
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: theme.shadows[2],
                },
                '& .MuiButton-startIcon': {
                  marginRight: { xs: 0.5, sm: 0.8 }
                }
              }}
            >
              {!newSlot.startTime || !newSlot.endTime ? (
                <span>{isEditingSlot ? 'Select Times to Update' : 'Select Times to Add Slot'}</span>
              ) : fieldErrors.slot ? (
                <span>Fix Errors to {isEditingSlot ? 'Update' : 'Add'}</span>
              ) : (
                <span>{isEditingSlot ? 'Update Time Slot' : 'Add Time Slot'}</span>
              )}
            </Button>
          </Stack>
      </CardContent>
    </Card>
  );
};

AddTimeSlotForm.propTypes = {
  newSlot: PropTypes.shape({
    dayOfWeek: PropTypes.string.isRequired,
    startTime: PropTypes.object,
    endTime: PropTypes.object
  }).isRequired,
  onSlotChange: PropTypes.func.isRequired,
  isAddingSlot: PropTypes.bool.isRequired,
  isEditingSlot: PropTypes.bool.isRequired,
  onAddSlot: PropTypes.func.isRequired,
  onUpdateSlot: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  customTimeSlots: PropTypes.array.isRequired,
  groupedSlots: PropTypes.object.isRequired,
  editingSlotIndex: PropTypes.number,
  fieldErrors: PropTypes.object.isRequired,
  disabled: PropTypes.bool
};

AddTimeSlotForm.defaultProps = {
  editingSlotIndex: null,
  disabled: false
};

export default AddTimeSlotForm;
