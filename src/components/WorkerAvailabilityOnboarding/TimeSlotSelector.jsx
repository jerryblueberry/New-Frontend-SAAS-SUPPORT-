// src/components/WorkerAvailabilityOnboarding/TimeSlotSelector.jsx
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  useTheme,
  Stack,
  Alert,
} from '@mui/material';
import { Clock, Plus, Check } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import { daysOfWeek } from '../../utils/constants';
import { DAY_COLORS } from './utils/timeSlotUtils';
import TimeSlotDialog from './components/TimeSlotDialog';
import WeeklyOverview from './components/WeeklyOverview';
import TimeSlotChip from './components/TimeSlotChip';
import BulkActions from './components/BulkActions';

// Time presets
const TIME_PRESETS = [
  { label: 'Morning', startTime: '08:00', endTime: '12:00' },
  { label: 'Full Day', startTime: '09:00', endTime: '17:00' },
  { label: 'Afternoon', startTime: '12:00', endTime: '17:00' },
  { label: 'Evening', startTime: '17:00', endTime: '21:00' },
];

// TimeSlotChip is now imported from './components/TimeSlotChip'
// BulkActions is now imported from './components/BulkActions'

// TimeSlotDialog is now imported from './components/TimeSlotDialog'

// Main component
const TimeSlotSelector = ({
  customTimeSlots = [],
  onAddSlot,
  onEditSlot,
  onRemoveSlot,
  disabled = false,
  error = null,
}) => {
  const theme = useTheme();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  // Group slots by day
  const groupedSlots = useMemo(() => {
    const groups = {};
    customTimeSlots?.forEach((slot, idx) => {
      if (!groups[slot.dayOfWeek]) groups[slot.dayOfWeek] = [];
      groups[slot.dayOfWeek].push({ ...slot, index: idx });
    });
    Object.keys(groups).forEach((day) => {
      groups[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return groups;
  }, [customTimeSlots]);

  const totalSlots = customTimeSlots?.length || 0;
  const activeDays = Object.keys(groupedSlots).length;

  const handleAddSlot = useCallback(() => {
    setEditingSlot(null);
    setEditingIndex(null);
    setIsDialogOpen(true);
  }, []);

  const handleEditSlot = useCallback((slot, index) => {
    setEditingSlot({ ...slot });
    setEditingIndex(index);
    setIsDialogOpen(true);
  }, []);

  const handleSaveSlot = useCallback((slot) => {
    if (editingIndex !== null) {
      onEditSlot(editingIndex, slot);
    } else {
      onAddSlot(slot);
    }
    setIsDialogOpen(false);
    setEditingSlot(null);
    setEditingIndex(null);
  }, [editingIndex, onAddSlot, onEditSlot]);

  const handleBulkAction = useCallback((action) => {
    if (action.type === 'remove') {
      onRemoveSlot(action.index);
    } else if (Array.isArray(action)) {
      // Multiple slots to add
      action.forEach(slot => onAddSlot(slot));
    }
  }, [onAddSlot, onRemoveSlot]);

  return (
    <Box>
      {/* Weekly Overview */}
      <WeeklyOverview groupedSlots={groupedSlots} />

      {/* Header Row - Enhanced & Responsive */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: { xs: 2, sm: 2.5 },
        flexWrap: 'wrap',
        gap: { xs: 1.25, sm: 1.5 },
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          flex: { xs: '1 1 100%', sm: '0 1 auto' },
          minWidth: 0,
        }}>
          {totalSlots > 0 ? (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.75, 
              px: { xs: 1.25, sm: 1.5 }, 
              py: { xs: 0.625, sm: 0.75 }, 
              borderRadius: '10px', 
              bgcolor: '#eff6ff',
              border: '1px solid #dbeafe',
              boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)',
            }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  bgcolor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                }}
              >
                <Check size={14} color="#ffffff" strokeWidth={3} />
              </Box>
              <Box>
                <Typography sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                  fontWeight: 700, 
                  color: '#1e40af',
                  lineHeight: 1.2,
                }}>
                  {totalSlots} Time Slot{totalSlots > 1 ? 's' : ''}
                </Typography>
                <Typography sx={{ 
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' }, 
                  fontWeight: 500,
                  color: '#3b82f6',
                  lineHeight: 1.2,
                }}>
                  {activeDays} Active Day{activeDays > 1 ? 's' : ''}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.75, 
              px: { xs: 1.25, sm: 1.5 }, 
              py: { xs: 0.625, sm: 0.75 }, 
              borderRadius: '10px', 
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  bgcolor: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Clock size={14} color="#64748b" strokeWidth={2.5} />
              </Box>
              <Typography sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                fontWeight: 600, 
                color: '#64748b',
              }}>
                No slots added yet
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0.75, sm: 1 },
          flex: { xs: '1 1 100%', sm: '0 1 auto' },
          justifyContent: { xs: 'flex-end', sm: 'flex-start' },
        }}>
          {totalSlots > 0 && (
            <BulkActions
              customTimeSlots={customTimeSlots}
              onBulkAction={handleBulkAction}
              disabled={disabled}
            />
          )}
          <Button
            variant="contained"
            startIcon={<Plus size={16} strokeWidth={2.5} />}
            onClick={handleAddSlot}
            disabled={disabled}
            sx={{
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              px: { xs: 1.75, sm: 2 },
              py: { xs: 0.875, sm: 1 },
              bgcolor: '#3b82f6',
              boxShadow: 'none',
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': { 
                bgcolor: '#2563eb', 
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            Add Slot
          </Button>
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', py: 0.25 }}>
          {error}
        </Alert>
      )}

      {/* Slots Grid - Only show when there are slots */}
      {totalSlots > 0 && (
        <Stack spacing={1.5}>
          {daysOfWeek.map((day) => {
            const daySlots = groupedSlots[day] || [];
            if (daySlots.length === 0) return null;
            const dayColor = DAY_COLORS[day];
            return (
              <Box
                key={day}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: '12px',
                  bgcolor: '#ffffff',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    borderColor: alpha(dayColor, 0.2),
                },
                }}
              >
                {/* Day header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: dayColor,
                      boxShadow: `0 2px 4px ${alpha(dayColor, 0.3)}`,
                    }} 
                  />
                  <Typography sx={{ 
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
                    fontWeight: 700, 
                    color: '#334155' 
                  }}>
                    {day}
                  </Typography>
                  <Box
                    sx={{
                      ml: 'auto',
                      px: 1,
                      py: 0.375,
                      borderRadius: '6px',
                      bgcolor: alpha(dayColor, 0.1),
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography sx={{ 
                      fontSize: { xs: '0.6875rem', sm: '0.75rem' }, 
                      fontWeight: 600,
                      color: dayColor,
                    }}>
                      {groupedSlots[day].length} slot{groupedSlots[day].length > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Box>

                {/* Slots */}
                <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 }, flexWrap: 'wrap' }}>
                  {groupedSlots[day].map((slotObj) => (
                    <TimeSlotChip
                      key={slotObj.index}
                      slot={slotObj}
                      index={slotObj.index}
                      onEdit={handleEditSlot}
                      onRemove={onRemoveSlot}
                      disabled={disabled}
                    />
                  ))}
                </Box>
              </Box>
            );
          }).filter(Boolean)}
        </Stack>
      )}

      {/* Dialog */}
      <TimeSlotDialog
        open={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingSlot(null); setEditingIndex(null); }}
        onSave={handleSaveSlot}
        initialData={editingSlot}
        existingSlots={customTimeSlots}
        editingIndex={editingIndex}
      />
    </Box>
  );
};

TimeSlotSelector.propTypes = {
  customTimeSlots: PropTypes.arrayOf(
    PropTypes.shape({
      dayOfWeek: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
    })
  ),
  onAddSlot: PropTypes.func.isRequired,
  onEditSlot: PropTypes.func.isRequired,
  onRemoveSlot: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.string,
};

export default React.memo(TimeSlotSelector);
