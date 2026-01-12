import { useState, useCallback, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { daysOfWeek } from '../../../../../../../utils/constants';
import { calculateDuration, formatTimeToString } from '../timeUtils';
import { validateFormFields, validateTimeRange, checkTimeOverlap } from '../validationUtils';
import useOnboardingStore, { useAvailabilityMutation } from '../../../../../../../stores/useOnboardingStore';

/**
 * Custom hook for managing availability form state and logic
 * Encapsulates all form state, validation, and CRUD operations
 */
export const useAvailabilityForm = (initialData, onClose, onSave) => {
  // Form state
  const [suburb, setSuburb] = useState(initialData?.suburb || '');
  const [kmWillingToTravel, setKmWillingToTravel] = useState(initialData?.kmWillingToTravel || 10);
  const [customTimeSlots, setCustomTimeSlots] = useState(initialData?.customTimeSlots || []);
  
  // UI state
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ suburb: '', km: '', slot: '', slots: '' });
  const [validationMessages, setValidationMessages] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
  // Time slot form state
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: daysOfWeek[0],
    startTime: dayjs().hour(9).minute(0),
    endTime: dayjs().hour(17).minute(0)
  });
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isEditingSlot, setIsEditingSlot] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  
  // Store and mutations
  const updateAvailability = useOnboardingStore((state) => state.updateAvailability);
  const { mutate: saveAvailability, isLoading, error: mutationError } = useAvailabilityMutation();
  
  // Memoized calculations
  const totalHours = useMemo(() => {
    return customTimeSlots.reduce((total, slot) => {
      const duration = calculateDuration(slot.startTime, slot.endTime);
      if (duration && !duration.includes('Invalid') && !duration.includes('Error')) {
        const hours = parseFloat(duration.replace(/[hm]/g, '').split(' ')[0] || 0);
        const minutes = parseFloat(duration.split(' ')[1]?.replace('m', '') || 0);
        return total + hours + (minutes / 60);
      }
      return total;
    }, 0);
  }, [customTimeSlots]);
  
  const availableDays = useMemo(() => {
    const days = new Set(customTimeSlots.map(slot => slot.dayOfWeek));
    return Array.from(days);
  }, [customTimeSlots]);
  
  const groupedSlots = useMemo(() => {
    const groups = daysOfWeek.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});
    
    customTimeSlots.forEach((slot) => {
      if (slot?.dayOfWeek && groups[slot.dayOfWeek]) {
        groups[slot.dayOfWeek].push(slot);
      }
    });
    
    // Sort each day's slots by start time
    Object.keys(groups).forEach(day => {
      groups[day].sort((a, b) => {
        const aStart = dayjs.isDayjs(a.startTime) ? a.startTime : dayjs(a.startTime, 'HH:mm');
        const bStart = dayjs.isDayjs(b.startTime) ? b.startTime : dayjs(b.startTime, 'HH:mm');
        return aStart.diff(bStart);
      });
    });
    
    return groups;
  }, [customTimeSlots]);
  
  // Track unsaved changes
  useEffect(() => {
    const hasChanges = 
      suburb !== (initialData?.suburb || '') ||
      kmWillingToTravel !== (initialData?.kmWillingToTravel || 10) ||
      JSON.stringify(customTimeSlots) !== JSON.stringify(initialData?.customTimeSlots || []);
    setHasUnsavedChanges(hasChanges);
  }, [suburb, kmWillingToTravel, customTimeSlots, initialData]);
  
  // Form validation
  const validateForm = useCallback(() => {
    const validation = validateFormFields(suburb, kmWillingToTravel, customTimeSlots);
    setFieldErrors(validation.errors);
    setValidationMessages(validation.messages);
    return validation.isValid;
  }, [suburb, kmWillingToTravel, customTimeSlots]);
  
  // Validate new slot before adding/updating
  const validateNewSlot = useCallback(() => {
    // Basic time range validation
    const timeValidation = validateTimeRange(newSlot.startTime, newSlot.endTime);
    if (!timeValidation.isValid) {
      setFieldErrors(prev => ({ ...prev, slot: timeValidation.message }));
      return false;
    }
    
    // Check for exact duplicates (only when adding new slots)
    if (!isEditingSlot) {
      const startTime = formatTimeToString(newSlot.startTime);
      const endTime = formatTimeToString(newSlot.endTime);
      
      const duplicate = customTimeSlots.some((slot) => {
        const slotStart = formatTimeToString(slot.startTime);
        const slotEnd = formatTimeToString(slot.endTime);
        return slot.dayOfWeek === newSlot.dayOfWeek && slotStart === startTime && slotEnd === endTime;
      });
      
      if (duplicate) {
        setFieldErrors(prev => ({ 
          ...prev, 
          slot: `This exact time slot already exists on ${newSlot.dayOfWeek}` 
        }));
        return false;
      }
    }
    
    // Check for overlaps
    const overlapCheck = checkTimeOverlap(
      customTimeSlots, 
      newSlot, 
      isEditingSlot ? editingSlotIndex : null
    );
    
    if (overlapCheck.hasOverlap) {
      setFieldErrors(prev => ({ ...prev, slot: overlapCheck.message }));
      return false;
    }
    
    // Check slot count per day
    const daySlotCount = customTimeSlots.filter((slot, idx) => {
      if (isEditingSlot && idx === editingSlotIndex) return false;
      return slot.dayOfWeek === newSlot.dayOfWeek;
    }).length;
    
    if (daySlotCount >= 10) {
      setFieldErrors(prev => ({ 
        ...prev, 
        slot: `Too many time slots on ${newSlot.dayOfWeek} (${daySlotCount} existing). Consider combining some slots.` 
      }));
      return false;
    }
    
    // Clear errors
    setFieldErrors(prev => ({ ...prev, slot: '' }));
    return true;
  }, [newSlot, customTimeSlots, isEditingSlot, editingSlotIndex]);
  
  // Time slot CRUD operations
  const handleAddSlot = useCallback(() => {
    if (!validateNewSlot()) return;
    
    const formattedSlot = {
      dayOfWeek: newSlot.dayOfWeek,
      startTime: formatTimeToString(newSlot.startTime),
      endTime: formatTimeToString(newSlot.endTime)
    };
    
    setCustomTimeSlots(slots => [...slots, formattedSlot]);
    setNewSlot({
      dayOfWeek: daysOfWeek[0],
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(17).minute(0)
    });
    setFieldErrors(prev => ({ ...prev, slot: '' }));
    setIsAddingSlot(false);
  }, [validateNewSlot, newSlot]);
  
  const handleEditSlot = useCallback((index) => {
    const slot = customTimeSlots[index];
    setNewSlot({
      dayOfWeek: slot.dayOfWeek,
      startTime: dayjs.isDayjs(slot.startTime) ? slot.startTime : dayjs(slot.startTime, 'HH:mm'),
      endTime: dayjs.isDayjs(slot.endTime) ? slot.endTime : dayjs(slot.endTime, 'HH:mm')
    });
    setIsEditingSlot(true);
    setIsAddingSlot(true); // Open the form when editing
    setEditingSlotIndex(index);
    setFieldErrors(prev => ({ ...prev, slot: '' }));
  }, [customTimeSlots]);
  
  const handleUpdateSlot = useCallback(() => {
    if (!validateNewSlot()) return;
    
    const formattedSlot = {
      dayOfWeek: newSlot.dayOfWeek,
      startTime: formatTimeToString(newSlot.startTime),
      endTime: formatTimeToString(newSlot.endTime)
    };
    
    setCustomTimeSlots(slots => {
      const updated = [...slots];
      updated[editingSlotIndex] = formattedSlot;
      return updated;
    });
    
    // Reset form state
    setNewSlot({
      dayOfWeek: daysOfWeek[0],
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(17).minute(0)
    });
    // Close the form
    setIsAddingSlot(false);
    // Clear editing state
    setIsEditingSlot(false);
    setEditingSlotIndex(null);
    // Clear errors
    setFieldErrors(prev => ({ ...prev, slot: '' }));
  }, [validateNewSlot, newSlot, editingSlotIndex]);
  
  const handleCancelEdit = useCallback(() => {
    // Reset form state
    setNewSlot({
      dayOfWeek: daysOfWeek[0],
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(17).minute(0)
    });
    // Close the form
    setIsAddingSlot(false);
    // Clear editing state
    setIsEditingSlot(false);
    setEditingSlotIndex(null);
    // Clear errors
    setFieldErrors(prev => ({ ...prev, slot: '' }));
  }, []);
  
  const handleDeleteSlot = useCallback((index) => {
    setCustomTimeSlots(slots => slots.filter((_, i) => i !== index));
    setFieldErrors(prev => ({ ...prev, slots: '' }));
  }, []);
  
  // Form submission
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLocalLoading(true);
    setError(null);
    
    const availabilityData = {
      suburb: suburb.trim(),
      kmWillingToTravel: Number(kmWillingToTravel),
      customTimeSlots: customTimeSlots.map(slot => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: formatTimeToString(slot.startTime),
        endTime: formatTimeToString(slot.endTime)
      }))
    };
    
    try {
      updateAvailability(availabilityData);
      
      saveAvailability(availabilityData, {
        onSuccess: () => {
          setIsLocalLoading(false);
          setHasUnsavedChanges(false);
          if (onSave) onSave(availabilityData);
          onClose();
        },
        onError: (error) => {
          setIsLocalLoading(false);
          setError(error?.message || 'Failed to save availability');
          console.error('Save error:', error);
        }
      });
    } catch (err) {
      setIsLocalLoading(false);
      setError(err?.message || 'An unexpected error occurred');
      console.error('Unexpected error:', err);
    }
  }, [validateForm, suburb, kmWillingToTravel, customTimeSlots, updateAvailability, saveAvailability, onSave, onClose]);
  
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) return;
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);
  
  return {
    // Form data
    suburb,
    setSuburb,
    kmWillingToTravel,
    setKmWillingToTravel,
    customTimeSlots,
    setCustomTimeSlots,
    
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
    isLoading: isLoading || isLocalLoading,
    mutationError,
    
    // Actions
    handleAddSlot,
    handleEditSlot,
    handleUpdateSlot,
    handleCancelEdit,
    handleDeleteSlot,
    handleSave,
    handleClose,
    validateForm
  };
};
