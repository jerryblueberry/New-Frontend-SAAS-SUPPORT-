import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  Box,
  Alert,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import AddIcon from '@mui/icons-material/Add';

import { daysOfWeek } from '../../../../../../utils/constants';
import { DAY_THEMES } from './constants';
import { formatTimeDisplay, calculateDuration } from './timeUtils';
import { validateTimeRange, checkTimeOverlap } from './validationUtils';

/**
 * Time Slots List Component
 * Displays all added time slots grouped by day
 */
const TimeSlotsList = ({
  customTimeSlots,
  groupedSlots,
  totalHours,
  availableDays,
  onEditSlot,
  onDeleteSlot,
  onAddSlot,
  isEditingSlot,
  editingSlotIndex,
  fieldErrors,
  disabled
}) => {
  const theme = useTheme();

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: { xs: 2, sm: 3 },
        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: alpha(theme.palette.info.main, 0.3),
        }
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Stack 
          direction="row" 
          spacing={{ xs: 1.5, sm: 2 }} 
          alignItems="center" 
          justifyContent="space-between"
          sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}
        >
          <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                borderRadius: { xs: 1.5, sm: 2 },
                p: { xs: 0.8, sm: 1, md: 1.2 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: { xs: 32, sm: 36, md: 40 },
                minHeight: { xs: 32, sm: 36, md: 40 }
              }}
            >
              <EventIcon sx={{ color: 'info.main', fontSize: { xs: 18, sm: 20, md: 22 } }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                sx={{
                  fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' },
                  lineHeight: { xs: 1.2, sm: 1.3 }
                }}
              >
                Your Schedule ({customTimeSlots.length} slots)
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                  lineHeight: 1.3
                }}
              >
                {totalHours.toFixed(1)} hours across {availableDays.length} days
              </Typography>
            </Box>
          </Stack>
          
          {/* Add Slot Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
            onClick={onAddSlot}
            disabled={disabled || isEditingSlot}
            sx={{
              borderRadius: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              fontWeight: 600,
              py: { xs: 0.75, sm: 0.875, md: 1 },
              px: { xs: 1.25, sm: 1.5, md: 2 },
              minHeight: { xs: 36, sm: 40 },
              textTransform: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                opacity: 0.5,
              },
              '& .MuiButton-startIcon': {
                marginRight: { xs: 0.5, sm: 0.625 }
              }
            }}
          >
            Add Slot
          </Button>
        </Stack>

        {customTimeSlots.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 2, sm: 3, md: 4 },
              px: { xs: 1, sm: 2 },
              bgcolor: alpha(theme.palette.grey[500], 0.05),
              borderRadius: { xs: 1.5, sm: 2 },
              border: `2px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
            }}
          >
            <EventIcon 
              sx={{ 
                fontSize: { xs: 40, sm: 48 }, 
                color: alpha(theme.palette.grey[500], 0.4),
                mb: { xs: 1, sm: 1.5 }
              }} 
            />
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
                mb: 0.5
              }}
            >
              No time slots added yet
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                lineHeight: 1.4
              }}
            >
              Click "Add Slot" above to add your first available time slot
            </Typography>
          </Box>
        ) : (
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            {daysOfWeek.filter(day => groupedSlots[day]?.length > 0).map(day => {
              const dayTheme = DAY_THEMES[day];
              
              return (
                <Paper
                  key={day}
                  elevation={0}
                  sx={{
                    bgcolor: alpha(dayTheme.primary, 0.03),
                    borderRadius: { xs: 1.5, sm: 2 },
                    border: `1px solid ${alpha(dayTheme.primary, 0.15)}`,
                    overflow: 'hidden'
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                      <Box
                        sx={{
                          width: { xs: 28, sm: 32, md: 36 },
                          height: { xs: 28, sm: 32, md: 36 },
                          borderRadius: { xs: 1.5, sm: 2 },
                          background: dayTheme.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.8rem' }
                        }}
                      >
                        {day.slice(0, 3).toUpperCase()}
                      </Box>
                      <Box flex={1}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight={700} 
                          sx={{ 
                            color: dayTheme.primary, 
                            fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                            lineHeight: 1.2
                          }}
                        >
                          {day}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {groupedSlots[day].length} slot{groupedSlots[day].length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={{ xs: 1, sm: 1.5 }}>
                      {groupedSlots[day].map((slot, idx) => {
                        const slotIndex = customTimeSlots.findIndex(s => s === slot);
                        const isEditing = slotIndex === editingSlotIndex && isEditingSlot;
                        
                        return (
                          <Paper
                            key={`${day}-${idx}`}
                            elevation={1}
                            sx={{
                              p: { xs: 1.5, sm: 2 },
                              borderRadius: { xs: 1.5, sm: 2 },
                              bgcolor: isEditing 
                                ? alpha(theme.palette.warning.main, 0.15)
                                : alpha(dayTheme.primary, 0.05),
                              border: isEditing
                                ? `2px solid ${theme.palette.warning.main}`
                                : `1px solid ${alpha(dayTheme.primary, 0.2)}`,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              '&:hover': {
                                bgcolor: isEditing
                                  ? alpha(theme.palette.warning.main, 0.2)
                                  : alpha(dayTheme.primary, 0.1),
                                borderColor: isEditing
                                  ? theme.palette.warning.dark
                                  : alpha(dayTheme.primary, 0.4),
                                transform: 'translateY(-1px)',
                                boxShadow: theme.shadows[4],
                              },
                              ...(isEditing && {
                                '&::before': {
                                  content: '"Currently Editing"',
                                  position: 'absolute',
                                  top: -10,
                                  left: 6,
                                  bgcolor: theme.palette.warning.main,
                                  color: 'white',
                                  px: 0.8,
                                  py: 0.3,
                                  borderRadius: 0.8,
                                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                  fontWeight: 600,
                                  zIndex: 1,
                                }
                              })
                            }}
                          >
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }}>
                                <AccessTimeIcon sx={{ 
                                  color: dayTheme.primary, 
                                  fontSize: { xs: 18, sm: 20 } 
                                }} />
                                <Box>
                                  <Typography 
                                    variant="body1" 
                                    fontWeight={600} 
                                    sx={{ 
                                      color: dayTheme.accent,
                                      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
                                    }}
                                  >
                                    {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
                                  </Typography>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary"
                                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                    >
                                      {calculateDuration(slot.startTime, slot.endTime)}
                                    </Typography>
                                    {(() => {
                                      const timeValidation = validateTimeRange(slot.startTime, slot.endTime);
                                      if (!timeValidation.isValid) {
                                        return (
                                          <Tooltip title={timeValidation.message}>
                                            <WarningIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                                          </Tooltip>
                                        );
                                      }
                                      
                                      const otherSlots = customTimeSlots.filter((_, idx) => idx !== slotIndex);
                                      const overlapCheck = checkTimeOverlap(otherSlots, slot);
                                      if (overlapCheck.hasOverlap) {
                                        return (
                                          <Tooltip title={`Overlap detected: ${overlapCheck.message}`}>
                                            <WarningIcon sx={{ fontSize: 14, color: 'error.main' }} />
                                          </Tooltip>
                                        );
                                      }
                                      
                                      return (
                                        <Tooltip title="Valid time slot">
                                          <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main', opacity: 0.7 }} />
                                        </Tooltip>
                                      );
                                    })()}
                                  </Stack>
                                </Box>
                              </Stack>
                              
                              <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
                                <Tooltip title="Edit time slot">
                                  <IconButton
                                    size="small"
                                    onClick={() => onEditSlot(slotIndex)}
                                    disabled={disabled}
                                    sx={{
                                      color: dayTheme.primary,
                                      bgcolor: alpha(dayTheme.primary, 0.1),
                                      minWidth: { xs: 32, sm: 36 },
                                      minHeight: { xs: 32, sm: 36 },
                                      '&:hover': {
                                        bgcolor: alpha(dayTheme.primary, 0.2),
                                        transform: 'scale(1.1)',
                                      },
                                      '&:disabled': {
                                        opacity: 0.5
                                      }
                                    }}
                                  >
                                    <EditIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete time slot">
                                  <IconButton
                                    size="small"
                                    onClick={() => onDeleteSlot(slotIndex)}
                                    disabled={disabled}
                                    sx={{
                                      color: theme.palette.error.main,
                                      bgcolor: alpha(theme.palette.error.main, 0.1),
                                      minWidth: { xs: 32, sm: 36 },
                                      minHeight: { xs: 32, sm: 36 },
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.2),
                                        transform: 'scale(1.1)',
                                      }
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </CardContent>
                </Paper>
              );
            })}
          </Stack>
        )}

        {fieldErrors.slots && (
          <Alert severity="error" variant="outlined" sx={{ borderRadius: 2, mt: 2 }}>
            {fieldErrors.slots}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

TimeSlotsList.propTypes = {
  customTimeSlots: PropTypes.array.isRequired,
  groupedSlots: PropTypes.object.isRequired,
  totalHours: PropTypes.number.isRequired,
  availableDays: PropTypes.array.isRequired,
  onEditSlot: PropTypes.func.isRequired,
  onDeleteSlot: PropTypes.func.isRequired,
  onAddSlot: PropTypes.func.isRequired,
  isEditingSlot: PropTypes.bool.isRequired,
  editingSlotIndex: PropTypes.number,
  fieldErrors: PropTypes.object.isRequired,
  disabled: PropTypes.bool
};

TimeSlotsList.defaultProps = {
  editingSlotIndex: null,
  disabled: false
};

export default TimeSlotsList;
