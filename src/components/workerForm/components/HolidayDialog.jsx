// src/components/workerForm/components/HolidayDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { CalendarOff } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import UpcomingHolidayDatePicker from '../../AvailabilityComponent/DatePicker/UpcomingHolidayDatePicker';

/**
 * HolidayDialog Component
 * 
 * A dialog component for adding/editing upcoming holidays/time off.
 * 
 * @param {boolean} open - Whether the dialog is open
 * @param {function} onClose - Callback when dialog closes
 * @param {object} newHoliday - Holiday data object
 * @param {function} setNewHoliday - Callback to update holiday data
 * @param {object} editingHoliday - Currently editing holiday (null for new)
 * @param {function} setEditingHoliday - Callback to set editing holiday
 * @param {function} handleCreateOrEditHoliday - Callback to save holiday
 * @param {boolean} isCreating - Whether holiday is being created
 * @param {string} holidayError - Error message for holiday
 * @param {function} setHolidayError - Callback to set error
 * @param {string} dateOverlapWarning - Warning message for date overlap
 * @param {function} setDateOverlapWarning - Callback to set overlap warning
 * @param {function} checkDateOverlap - Function to check date overlaps
 */
const HolidayDialog = ({
  open,
  onClose,
  newHoliday,
  setNewHoliday,
  editingHoliday,
  setEditingHoliday,
  handleCreateOrEditHoliday,
  isCreating,
  holidayError,
  setHolidayError,
  dateOverlapWarning,
  setDateOverlapWarning,
  checkDateOverlap,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    onClose();
    setEditingHoliday(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: '20px 20px 0 0', sm: '20px' },
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          m: { xs: 0, sm: 2 },
          maxHeight: { xs: '92vh', sm: '90vh' },
          minHeight: { sm: 580 },
          width: { xs: '100%', sm: '90vw', md: '800px', lg: '860px' },
          maxWidth: { sm: 860 },
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Dialog Header */}
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: { xs: 2.5, sm: 3.5 }, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: { xs: 44, sm: 48 },
                height: { xs: 44, sm: 48 },
                borderRadius: '12px',
                bgcolor: alpha('#6366f1', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CalendarOff size={22} color="#6366f1" />
            </Box>
            <Box>
              <Typography sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {editingHoliday ? 'Edit Time Off' : 'Add Time Off'}
              </Typography>
              <Typography sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' }, color: 'text.secondary' }}>
                Block dates when you are unavailable
              </Typography>
            </Box>
          </Box>
          <IconButton 
            onClick={handleClose}
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '10px',
              bgcolor: alpha(theme.palette.grey[500], 0.08),
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { 
                bgcolor: alpha(theme.palette.grey[500], 0.15),
                transform: 'scale(1.05)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: { xs: 2, sm: 2.5 }, flex: 1, overflowY: 'auto' }}>
        <Stack spacing={2.5}>
          <TextField
            label="Name (optional)"
            value={newHoliday.name}
            onChange={e => { 
              setNewHoliday({ ...newHoliday, name: e.target.value }); 
              setHolidayError(''); 
            }}
            fullWidth
            placeholder="e.g., Family vacation"
            size="small"
            helperText="Leave empty for auto-generated name"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
          
          <UpcomingHolidayDatePicker
            newHoliday={newHoliday}
            setNewHoliday={setNewHoliday}
            editingHoliday={editingHoliday}
            setHolidayError={setHolidayError}
            dateOverlapWarning={dateOverlapWarning}
            setDateOverlapWarning={setDateOverlapWarning}
            checkDateOverlap={checkDateOverlap}
          />

          <TextField
            label="Notes (optional)"
            value={newHoliday.description}
            onChange={e => setNewHoliday({ ...newHoliday, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="Any additional details..."
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />

          {(holidayError) && (
            <Alert severity="error" sx={{ borderRadius: '10px', py: 0.5 }}>
              {holidayError}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2.5, sm: 3.5 }, pb: { xs: 2.5, sm: 3.5 }, pt: 1.5, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          sx={{ 
            flex: 1, 
            borderRadius: '10px', 
            color: 'text.secondary', 
            fontWeight: 600, 
            py: 1.25,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.grey[500], 0.08),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateOrEditHoliday}
          variant="contained"
          disabled={isCreating || !newHoliday.startDate || !newHoliday.endDate}
          sx={{
            flex: 1,
            borderRadius: '10px',
            bgcolor: '#6366f1',
            fontWeight: 600,
            py: 1.25,
            cursor: isCreating || !newHoliday.startDate || !newHoliday.endDate ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            '&:hover:not(:disabled)': { 
              bgcolor: '#4f46e5',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            },
            '&:disabled': {
              bgcolor: alpha('#6366f1', 0.4),
              cursor: 'not-allowed',
            },
          }}
        >
          {isCreating ? 'Saving...' : editingHoliday ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

HolidayDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  newHoliday: PropTypes.object.isRequired,
  setNewHoliday: PropTypes.func.isRequired,
  editingHoliday: PropTypes.object,
  setEditingHoliday: PropTypes.func.isRequired,
  handleCreateOrEditHoliday: PropTypes.func.isRequired,
  isCreating: PropTypes.bool.isRequired,
  holidayError: PropTypes.string,
  setHolidayError: PropTypes.func.isRequired,
  dateOverlapWarning: PropTypes.string,
  setDateOverlapWarning: PropTypes.func.isRequired,
  checkDateOverlap: PropTypes.func.isRequired,
};

export default React.memo(HolidayDialog);

