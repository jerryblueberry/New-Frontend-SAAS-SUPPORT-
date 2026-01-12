import React from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  Stack,
  Box,
  Alert,
  Fade,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { alpha, useTheme } from '@mui/material/styles';

// Components
import DrawerHeader from './Components/EditDrawerComponents/DrawerHeader';
import LocationPreferenceCard from './Components/EditComponents/LocationPreferenceCard';
import TravelDistanceCard from './Components/EditComponents/TravelDistanceCard';
import AddTimeSlotForm from './Components/EditDrawerComponents/AddTimeSlotForm';
import TimeSlotsList from './Components/EditDrawerComponents/TimeSlotsList';
import DrawerFooter from './Components/EditDrawerComponents/DrawerFooter';

// Custom Hook
import { useAvailabilityForm } from './Components/EditDrawerComponents/hooks/useAvailabilityForm';

/**
 * Edit Availability Drawer - Refactored
 * 
 * A clean, maintainable component that follows best practices:
 * - Separation of concerns
 * - Custom hooks for business logic
 * - Small, reusable components
 * - Clear data flow
 * - Optimized performance
 */
function EditAvailabilityDrawer({ open, onClose, initialData, onSave }) {
  const theme = useTheme();
  
  // Use custom hook for all form logic
  const {
    // Form data
    suburb,
    setSuburb,
    kmWillingToTravel,
    setKmWillingToTravel,
    customTimeSlots,
    
    // Time slot form
    newSlot,
    setNewSlot,
    isAddingSlot,
    setIsAddingSlot,
    isEditingSlot,
    editingSlotIndex,
    
    // Calculations
    totalHours,
    availableDays,
    groupedSlots,
    
    // Validation
    error,
    fieldErrors,
    validationMessages,
    hasUnsavedChanges,
    
    // Loading states
    isLoading,
    mutationError,
    
    // Actions
    handleAddSlot,
    handleEditSlot,
    handleUpdateSlot,
    handleCancelEdit,
    handleDeleteSlot,
    handleSave,
    handleClose,
  } = useAvailabilityForm(initialData, onClose, onSave);

  // Handler functions for components
  const handleSuburbChange = (value) => {
    setSuburb(value);
  };

  const handleKmChange = (event, newValue) => {
    setKmWillingToTravel(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 600, md: 700 },
            maxWidth: '100%',
            height: { xs: '100%', sm: '100%', md: '100%' },
            maxHeight: { xs: '100%', sm: '100%', md: '100%' },
            display: 'flex',
            flexDirection: 'column',
            // Safe area padding for mobile and tablet (home indicator)
            paddingBottom: { xs: 'env(safe-area-inset-bottom)', sm: 'env(safe-area-inset-bottom)', md: 0 },
          }
        }}
      >
        {/* Header */}
        <DrawerHeader
          onClose={handleClose}
          totalHours={totalHours}
          availableDaysCount={availableDays.length}
          slotsCount={customTimeSlots.length}
          hasUnsavedChanges={hasUnsavedChanges}
        />

        {/* Content */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: { xs: 1.5, sm: 2, md: 3 },
            '&::-webkit-scrollbar': {
              width: 4
            },
            '&::-webkit-scrollbar-track': {
              background: alpha(theme.palette.grey[300], 0.1)
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.primary.main, 0.3),
              borderRadius: 2,
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.5)
              }
            }
          }}
        >
          <Stack spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {/* Validation Messages - Only show errors */}
            {validationMessages.filter(message => message.type === 'error').length > 0 && (
              <Stack spacing={1}>
                {validationMessages
                  .filter(message => message.type === 'error')
                  .map((message, idx) => (
                    <Fade in key={idx}>
                      <Alert 
                        severity="error" 
                        variant="standard"
                        sx={{ 
                          borderRadius: 2,
                          py: { xs: 0, sm: 1.5, md: 1 },
                          px: { xs: 1, sm: 3, md: 1 },
                          '& .MuiAlert-message': { 
                            fontWeight: 500,
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            lineHeight: { xs: 1.3, sm: 1.5 }
                          },
                          '& .MuiAlert-icon': {
                            fontSize: { xs: '1.2rem', sm: '1.5rem' }
                          }
                        }}
                      >
                        {message.text}
                      </Alert>
                    </Fade>
                  ))}
              </Stack>
            )}

            {/* Location Preferences */}
            <LocationPreferenceCard
              suburb={suburb}
              onSuburbChange={handleSuburbChange}
              error={fieldErrors.suburb}
              disabled={isLoading}
            />

            {/* Travel Distance */}
            <TravelDistanceCard
              kmWillingToTravel={kmWillingToTravel}
              onKmChange={handleKmChange}
              error={fieldErrors.km}
              disabled={isLoading}
            />

            {/* Add Time Slot Form */}
            {(isAddingSlot || isEditingSlot) && (
              <Fade in={isAddingSlot || isEditingSlot}>
                <Box>
                  <AddTimeSlotForm
                    newSlot={newSlot}
                    onSlotChange={setNewSlot}
                    isAddingSlot={isAddingSlot}
                    isEditingSlot={isEditingSlot}
                    onAddSlot={handleAddSlot}
                    onUpdateSlot={handleUpdateSlot}
                    onCancelEdit={handleCancelEdit}
                    customTimeSlots={customTimeSlots}
                    groupedSlots={groupedSlots}
                    editingSlotIndex={editingSlotIndex}
                    fieldErrors={fieldErrors}
                    disabled={isLoading}
                  />
                </Box>
              </Fade>
            )}

            {/* Time Slots List */}
            <TimeSlotsList
              customTimeSlots={customTimeSlots}
              groupedSlots={groupedSlots}
              totalHours={totalHours}
              availableDays={availableDays}
              onEditSlot={handleEditSlot}
              onDeleteSlot={handleDeleteSlot}
              onAddSlot={() => setIsAddingSlot(true)}
              isEditingSlot={isEditingSlot}
              editingSlotIndex={editingSlotIndex}
              fieldErrors={fieldErrors}
              disabled={isLoading}
            />

            {/* Global Error */}
            {(error || mutationError) && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                {error || mutationError?.message || 'An error occurred while saving'}
              </Alert>
            )}

            {/* Footer - Inside scrollable content */}
            <DrawerFooter
              onSave={handleSave}
              onCancel={handleClose}
              isLoading={isLoading}
              isSaveDisabled={!suburb || customTimeSlots.length === 0}
              saveButtonText="Save Changes"
              cancelButtonText="Cancel"
            />
          </Stack>
        </Box>
      </Drawer>
    </LocalizationProvider>
  );
}

EditAvailabilityDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  initialData: PropTypes.shape({
    suburb: PropTypes.string,
    kmWillingToTravel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    customTimeSlots: PropTypes.arrayOf(
      PropTypes.shape({
        dayOfWeek: PropTypes.string.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
      })
    ),
  }),
};

EditAvailabilityDrawer.defaultProps = {
  onSave: () => {},
  initialData: {
    suburb: '',
    kmWillingToTravel: 10,
    customTimeSlots: []
  }
};

export default EditAvailabilityDrawer;
