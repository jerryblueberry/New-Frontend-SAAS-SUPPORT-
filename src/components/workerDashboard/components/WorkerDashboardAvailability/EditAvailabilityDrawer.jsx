import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  Stack,
  Paper,
  Card,
  CardContent,
  Chip,
  Fade,
  Collapse,
  Alert,
  Box,
  Tooltip,
  MenuItem,
  CircularProgress,
} from '@mui/material'; 
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Material-UI Icons
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import EventIcon from '@mui/icons-material/Event';

// Local imports
import { daysOfWeek } from '../../../../utils/constants';
import useOnboardingStore, { useAvailabilityMutation } from '../../../../stores/useOnboardingStore';
import { alpha, useTheme } from '@mui/material/styles';
import LocationPreferenceCard from './Components/EditComponents/LocationPreferenceCard';

// Utility functions for safe dayjs comparisons
const isTimeEqual = (timeA, timeB) => {
  return timeA.format('HH:mm') === timeB.format('HH:mm');
};

const isTimeBefore = (timeA, timeB) => {
  return timeA.format('HH:mm') < timeB.format('HH:mm');
};

const isTimeAfter = (timeA, timeB) => {
  return timeA.format('HH:mm') > timeB.format('HH:mm');
};

const isTimeBeforeOrEqual = (timeA, timeB) => {
  return isTimeBefore(timeA, timeB) || isTimeEqual(timeA, timeB);
};

const isTimeAfterOrEqual = (timeA, timeB) => {
  return isTimeAfter(timeA, timeB) || isTimeEqual(timeA, timeB);
};

// Apple-style day theme colors with modern gradients
const DAY_THEMES = {
  Monday: { 
    primary: '#007AFF', 
    gradient: 'linear-gradient(135deg, #007AFF 0%, #5DADE2 100%)',
    light: '#E3F2FD',
    accent: '#0056D6'
  },
  Tuesday: { 
    primary: '#34C759', 
    gradient: 'linear-gradient(135deg, #34C759 0%, #A8E6CF 100%)',
    light: '#E8F5E8',
    accent: '#28A745'
  },
  Wednesday: { 
    primary: '#FF9500', 
    gradient: 'linear-gradient(135deg, #FF9500 0%, #FFD700 100%)',
    light: '#FFF3E0',
    accent: '#E6841A'
  },
  Thursday: { 
    primary: '#AF52DE', 
    gradient: 'linear-gradient(135deg, #AF52DE 0%, #D1A7F0 100%)',
    light: '#F3E5F5',
    accent: '#9C27B0'
  },
  Friday: { 
    primary: '#FF3B30', 
    gradient: 'linear-gradient(135deg, #FF3B30 0%, #FF6B66 100%)',
    light: '#FFEBEE',
    accent: '#DC3545'
  },
  Saturday: { 
    primary: '#5AC8FA', 
    gradient: 'linear-gradient(135deg, #5AC8FA 0%, #87CEEB 100%)',
    light: '#E1F5FE',
    accent: '#0DCAF0'
  },
  Sunday: { 
    primary: '#8E8E93', 
    gradient: 'linear-gradient(135deg, #8E8E93 0%, #B0B0B0 100%)',
    light: '#F5F5F5',
    accent: '#6C757D'
  }
};





// Optimized utility functions with better error handling
const formatTimeDisplay = (time) => {
  if (!time) return '';
  try {
    if (dayjs.isDayjs(time)) {
      return time.format('h:mm A');
    }
    if (typeof time === 'string') {
      const [hourStr, minute] = time.split(':');
      let hour = parseInt(hourStr, 10);
      if (isNaN(hour)) return '';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${minute} ${ampm}`;
    }
    return '';
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '';
  
  try {
    let start, end;
    
    if (dayjs.isDayjs(startTime) && dayjs.isDayjs(endTime)) {
      start = startTime;
      end = endTime;
    } else {
      start = dayjs(startTime, 'HH:mm');
      end = dayjs(endTime, 'HH:mm');
    }
    
    if (!start.isValid() || !end.isValid()) return 'Invalid time';
    
    const diff = end.diff(start, 'minute');
    if (diff <= 0) return 'Invalid range';
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating duration:', error);
    return 'Error';
  }
};

// Enhanced time validation with comprehensive checks and debugging
const validateTimeRange = (startTime, endTime, isDebugging = true) => {
  if (isDebugging) {
    console.group('⏰ Validating Time Range');
    console.log('Start time:', startTime);
    console.log('End time:', endTime);
  }
  
  if (!startTime || !endTime) {
    const message = 'Both start and end times are required';
    if (isDebugging) {
      console.warn('❌ Missing times:', message);
      console.groupEnd();
    }
    return { isValid: false, message };
  }
  
  try {
    let start, end;
    
    // Parse times with better error handling
    if (dayjs.isDayjs(startTime) && dayjs.isDayjs(endTime)) {
      start = startTime;
      end = endTime;
    } else {
      start = dayjs(startTime, 'HH:mm');
      end = dayjs(endTime, 'HH:mm');
    }
    
    if (isDebugging) {
      console.log('Parsed start:', start.isValid() ? start.format('HH:mm') : 'INVALID');
      console.log('Parsed end:', end.isValid() ? end.format('HH:mm') : 'INVALID');
    }
    
    if (!start.isValid() || !end.isValid()) {
      const message = 'Invalid time format. Please select valid times.';
      if (isDebugging) {
        console.error('❌ Invalid time format:', message);
        console.groupEnd();
      }
      return { isValid: false, message };
    }
    
    // Check basic time order using safe comparison
    if (isDebugging) {
      console.log('🔍 Checking time order...');
      console.log('Start time:', start.format('HH:mm'));
      console.log('End time:', end.format('HH:mm'));
    }
    
    if (isTimeBeforeOrEqual(end, start)) {
      const message = 'End time must be after start time';
      if (isDebugging) {
        console.warn('❌ End before or equal to start:', message);
        console.groupEnd();
      }
      return { isValid: false, message };
    }
    
    const diffMinutes = end.diff(start, 'minute');
    const diffHours = diffMinutes / 60;
    
    if (isDebugging) {
      console.log('Duration:', `${diffMinutes} minutes (${diffHours.toFixed(1)} hours)`);
    }
    
    // Minimum duration check - more flexible
    if (diffMinutes < 15) {
      const message = 'Time slot must be at least 15 minutes long';
      if (isDebugging) {
        console.warn('❌ Too short:', message);
        console.groupEnd();
      }
      return { isValid: false, message };
    }
    
    // Maximum single shift check - prevent unrealistic shifts
    if (diffMinutes > 1440) { // 24 hours
      const message = 'Single time slot cannot exceed 24 hours. Consider splitting into multiple days.';
      if (isDebugging) {
        console.warn('❌ Too long:', message);
        console.groupEnd();
      }
      return { 
        isValid: false, 
        message
      };
    }
    
    // Warn about very long shifts but don't block them
    let warnings = [];
    if (diffMinutes > 720) { // 12 hours
      warnings.push('This is a very long shift. Consider breaks and work-life balance.');
    }
    
    // Check for overnight shifts
    const startHour = start.hour();
    const endHour = end.hour();
    let isOvernightShift = false;
    
    if (endHour < startHour || (endHour === startHour && end.minute() < start.minute())) {
      isOvernightShift = true;
      if (isDebugging) {
        console.log('🌙 Overnight shift detected');
      }
    }
    
    if (isDebugging) {
      console.log('✅ Validation passed');
      console.log('Warnings:', warnings);
      console.groupEnd();
    }
    
    return { 
      isValid: true, 
      message: '', 
      duration: diffMinutes,
      warnings,
      isOvernightShift,
      hours: diffHours
    };
    
  } catch (error) {
    const message = `Error validating times: ${error.message || 'Unknown error'}`;
    if (isDebugging) {
      console.error('❌ Validation error:', error);
      console.groupEnd();
    }
    return { isValid: false, message };
  }
};

// Enhanced overlap detection with detailed feedback and better debugging
const detectOverlapDetails = (slots, candidate, excludeIndex = null) => {
  console.group('🔍 Detecting Overlap Details');
  console.log('Candidate slot:', candidate);
  console.log('Existing slots:', slots);
  console.log('Exclude index:', excludeIndex);
  
  try {
    const overlaps = [];
    
    slots.forEach((slot, idx) => {
      console.log(`\n📅 Checking slot ${idx}:`, slot);
      
      if (excludeIndex !== null && idx === excludeIndex) {
        console.log('⏭️ Skipping excluded index');
        return;
      }
      
      if (slot.dayOfWeek !== candidate.dayOfWeek) {
        console.log('📆 Different day, skipping');
        return;
      }
      
      // Improved time parsing with better error handling
      let slotStart, slotEnd, candStart, candEnd;
      
      try {
        slotStart = dayjs.isDayjs(slot.startTime) ? slot.startTime : dayjs(slot.startTime, 'HH:mm');
        slotEnd = dayjs.isDayjs(slot.endTime) ? slot.endTime : dayjs(slot.endTime, 'HH:mm');
        candStart = dayjs.isDayjs(candidate.startTime) ? candidate.startTime : dayjs(candidate.startTime, 'HH:mm');
        candEnd = dayjs.isDayjs(candidate.endTime) ? candidate.endTime : dayjs(candidate.endTime, 'HH:mm');
        
        // Validate parsed times
        if (!slotStart.isValid() || !slotEnd.isValid() || !candStart.isValid() || !candEnd.isValid()) {
          console.warn('⚠️ Invalid time format detected, skipping slot');
          return;
        }
        
        console.log('⏰ Parsed times:');
        console.log('  Existing:', slotStart.format('HH:mm'), '-', slotEnd.format('HH:mm'));
        console.log('  Candidate:', candStart.format('HH:mm'), '-', candEnd.format('HH:mm'));
        
      } catch (parseError) {
        console.error('❌ Time parsing error:', parseError);
        return;
      }
      
      // Improved overlap logic with clear conditions using safe comparisons
      const candStartsBeforeSlotEnds = isTimeBefore(candStart, slotEnd);
      const candEndsAfterSlotStarts = isTimeAfter(candEnd, slotStart);
      const isAdjacent = isTimeEqual(candStart, slotEnd) || isTimeEqual(candEnd, slotStart);
      
      console.log('🔍 Overlap conditions:');
      console.log('  Candidate starts before slot ends:', candStartsBeforeSlotEnds);
      console.log('  Candidate ends after slot starts:', candEndsAfterSlotStarts);
      console.log('  Is adjacent (touching):', isAdjacent);
      
      // Check for actual overlap (not just adjacent slots)
      const isActualOverlap = candStartsBeforeSlotEnds && candEndsAfterSlotStarts && !isAdjacent;
      
      console.log('💥 Is actual overlap:', isActualOverlap);
      
      if (isActualOverlap) {
        const overlap = {
          index: idx,
          existingSlot: {
            start: slotStart.format('h:mm A'),
            end: slotEnd.format('h:mm A'),
            startTime: slot.startTime,
            endTime: slot.endTime
          },
          overlapType: getOverlapType(candStart, candEnd, slotStart, slotEnd)
        };
        
        console.log('🚨 Overlap detected:', overlap);
        overlaps.push(overlap);
      }
    });
    
    console.log('📊 Final overlaps found:', overlaps.length);
    console.groupEnd();
    return overlaps;
    
  } catch (error) {
    console.error('❌ Error detecting overlaps:', error);
    console.groupEnd();
    return [];
  }
};

const getOverlapType = (newStart, newEnd, existingStart, existingEnd) => {
  if (isTimeEqual(newStart, existingStart) && isTimeEqual(newEnd, existingEnd)) {
    return 'identical';
  }
  
  // Use safe comparison methods
  const newStartIsAfterOrSameAsExisting = isTimeAfterOrEqual(newStart, existingStart);
  const newEndIsBeforeOrSameAsExisting = isTimeBeforeOrEqual(newEnd, existingEnd);
  const newStartIsBeforeOrSameAsExisting = isTimeBeforeOrEqual(newStart, existingStart);
  const newEndIsAfterOrSameAsExisting = isTimeAfterOrEqual(newEnd, existingEnd);
  
  if (newStartIsAfterOrSameAsExisting && newEndIsBeforeOrSameAsExisting) {
    return 'contained'; // New slot is within existing slot
  }
  if (newStartIsBeforeOrSameAsExisting && newEndIsAfterOrSameAsExisting) {
    return 'contains'; // New slot contains existing slot
  }
  if (isTimeBefore(newStart, existingEnd) && isTimeAfter(newEnd, existingEnd)) {
    return 'endOverlap'; // New slot overlaps end of existing
  }
  if (isTimeAfter(newEnd, existingStart) && isTimeBefore(newStart, existingStart)) {
    return 'startOverlap'; // New slot overlaps start of existing
  }
  return 'partial';
};

const formatOverlapMessage = (overlaps) => {
  if (overlaps.length === 0) return '';
  
  if (overlaps.length === 1) {
    const overlap = overlaps[0];
    const { existingSlot, overlapType } = overlap;
    
    switch (overlapType) {
      case 'identical':
        return `This exact time slot already exists (${existingSlot.start} - ${existingSlot.end})`;
      case 'contained':
        return `This time slot is within an existing slot (${existingSlot.start} - ${existingSlot.end})`;
      case 'contains':
        return `This time slot would contain an existing slot (${existingSlot.start} - ${existingSlot.end})`;
      case 'endOverlap':
        return `This time slot overlaps with existing slot ending at ${existingSlot.end}`;
      case 'startOverlap':
        return `This time slot overlaps with existing slot starting at ${existingSlot.start}`;
      default:
        return `This time slot overlaps with existing slot (${existingSlot.start} - ${existingSlot.end})`;
    }
  } else {
    return `This time slot overlaps with ${overlaps.length} existing slots on this day`;
  }
};

function EditAvailabilityDrawer({ open, onClose, initialData, onSave }) {
  const theme = useTheme();
  const [suburb, setSuburb] = useState(initialData?.suburb || '');
  const [kmWillingToTravel, setKmWillingToTravel] = useState(initialData?.kmWillingToTravel || 10);
  const [customTimeSlots, setCustomTimeSlots] = useState(initialData?.customTimeSlots || []);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({ suburb: '', km: '', slot: '', slots: '' });
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isEditingSlot, setIsEditingSlot] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  const [validationMessages, setValidationMessages] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  // For adding new slot with dayjs
  const [newSlot, setNewSlot] = useState({
    dayOfWeek: daysOfWeek[0],
    startTime: dayjs().hour(9).minute(0),
    endTime: dayjs().hour(17).minute(0)
  });

  // Zustand store and mutation
  const updateAvailability = useOnboardingStore((state) => state.updateAvailability);
  const { mutate: saveAvailability, isLoading, error: mutationError } = useAvailabilityMutation();

  // Memoized calculations for performance
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

  // Group slots by day and sort by start time with better error handling
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
    daysOfWeek.forEach((day) => {
      groups[day].sort((a, b) => {
        try {
          const timeA = dayjs.isDayjs(a.startTime) ? a.startTime : dayjs(a.startTime, 'HH:mm');
          const timeB = dayjs.isDayjs(b.startTime) ? b.startTime : dayjs(b.startTime, 'HH:mm');
          return timeA.diff(timeB);
        } catch {
          return 0;
        }
      });
    });
    
    return groups;
  }, [customTimeSlots]);

  // Enhanced overlap detection with detailed feedback
  const checkOverlap = useCallback((slots, candidate, excludeIndex = null) => {
    try {
      const overlaps = detectOverlapDetails(slots, candidate, excludeIndex);
      return {
        hasOverlap: overlaps.length > 0,
        overlaps,
        message: formatOverlapMessage(overlaps)
      };
    } catch (error) {
      console.error('Error checking overlap:', error);
      return {
        hasOverlap: true,
        overlaps: [],
        message: 'Error checking for overlaps. Please try again.'
      };
    }
  }, []);

  // Memoized handlers for better performance
  const handleSlotChange = useCallback((idx, field, value) => {
    setCustomTimeSlots(slots =>
      slots.map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot))
    );
    setHasUnsavedChanges(true);
  }, []);

  const handleKmChange = useCallback((event, newValue) => {
    setKmWillingToTravel(newValue);
    setHasUnsavedChanges(true);
    // Clear km error when user changes value
    if (fieldErrors.km) {
      setFieldErrors(prev => ({ ...prev, km: '' }));
    }
  }, [fieldErrors.km]);

  // Suburb change handler is now handled by SuburbSelector component
  // Keeping this for potential direct suburb updates
  const handleSuburbChange = useCallback((value) => {
    setSuburb(value);
    setHasUnsavedChanges(true);
    // Clear suburb error when user changes value
    if (fieldErrors.suburb) {
      setFieldErrors(prev => ({ ...prev, suburb: '' }));
    }
  }, [fieldErrors.suburb]);

  // Enhanced validation with detailed feedback similar to AvailabilityForm
  const validateFields = useCallback(() => {
    let isValid = true;
    const errors = { suburb: '', km: '', slot: '', slots: '' };
    const messages = [];
    
    // Suburb validation - required field only
    if (!suburb?.trim()) {
      errors.suburb = 'Suburb is required';
      messages.push({ type: 'error', text: 'Please enter your suburb' });
      isValid = false;
    }
    
    // Enhanced km validation - must match backend requirements
    if (typeof kmWillingToTravel !== 'number' || isNaN(kmWillingToTravel)) {
      errors.km = 'Travel distance must be a valid number';
      messages.push({ type: 'error', text: 'Please select a valid travel distance' });
      isValid = false;
    } else if (kmWillingToTravel < 1) {
      errors.km = 'Travel distance must be at least 1km';
      messages.push({ type: 'error', text: 'Travel distance must be at least 1km to receive job opportunities' });
      isValid = false;
    } else if (kmWillingToTravel > 100) {
      errors.km = 'Travel distance cannot exceed 100km';
      messages.push({ type: 'error', text: 'Maximum travel distance is 100km' });
      isValid = false;
    } else if (kmWillingToTravel < 5) {
      messages.push({ type: 'warning', text: 'Low travel distance may limit job opportunities' });
    }
    
    // Enhanced time slots validation
    if (customTimeSlots.length === 0) {
      messages.push({ type: 'warning', text: 'No time slots added - you won\'t receive job notifications' });
    } else {
      const slotValidation = validateTimeSlots();
      if (!slotValidation.isValid) {
        errors.slots = slotValidation.message;
        messages.push({ type: 'error', text: slotValidation.message });
        isValid = false;
      } else {
        // Calculate additional statistics
        const daysCount = new Set(customTimeSlots.map(slot => slot.dayOfWeek)).size;
        const avgHoursPerDay = totalHours / daysCount;
        
        messages.push({ 
          type: 'success', 
          text: `${customTimeSlots.length} slots • ${daysCount} days • ${totalHours.toFixed(1)}h total • ${avgHoursPerDay.toFixed(1)}h avg` 
        });
        
        // Add helpful suggestions (optional)
        if (totalHours < 5) {
          messages.push({ type: 'info', text: 'Consider adding more hours if you want more job opportunities' });
        }
        if (daysCount < 2) {
          messages.push({ type: 'info', text: 'Adding availability on more days can help you find more jobs' });
        }
      }
    }
    
    setFieldErrors(errors);
    setValidationMessages(messages);
    return isValid;
  }, [suburb, kmWillingToTravel, customTimeSlots, totalHours]);

  const validateTimeSlots = useCallback(() => {
    const slotSet = new Set();
    const daySlotCounts = {};
    let totalDuration = 0;
    
    for (let i = 0; i < customTimeSlots.length; i++) {
      const slot = customTimeSlots[i];
      
      // Check required fields
      if (!slot.dayOfWeek || !slot.startTime || !slot.endTime) {
        return { 
          isValid: false, 
          message: 'All time slots must have day, start time, and end time selected' 
        };
      }
      
      // Validate time range
      const timeValidation = validateTimeRange(slot.startTime, slot.endTime);
      if (!timeValidation.isValid) {
        return { 
          isValid: false, 
          message: `${slot.dayOfWeek}: ${timeValidation.message}` 
        };
      }
      
      // Add to total duration
      totalDuration += timeValidation.duration || 0;
      
      // Check for duplicates
      const startTime = dayjs.isDayjs(slot.startTime) ? slot.startTime.format('HH:mm') : slot.startTime;
      const endTime = dayjs.isDayjs(slot.endTime) ? slot.endTime.format('HH:mm') : slot.endTime;
      const key = `${slot.dayOfWeek}-${startTime}-${endTime}`;
      
      if (slotSet.has(key)) {
        return { 
          isValid: false, 
          message: `Duplicate time slot found on ${slot.dayOfWeek} (${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)})` 
        };
      }
      slotSet.add(key);
      
      // Count slots per day
      daySlotCounts[slot.dayOfWeek] = (daySlotCounts[slot.dayOfWeek] || 0) + 1;
      
      // Check for overlaps with detailed feedback
      const overlapCheck = checkOverlap(customTimeSlots, slot, i);
      if (overlapCheck.hasOverlap) {
        return { 
          isValid: false, 
          message: `${slot.dayOfWeek}: ${overlapCheck.message}` 
        };
      }
    }
    
    // Additional validations - more lenient
    const daysWithManySlots = Object.entries(daySlotCounts).filter(([day, count]) => count > 10); // Increased from 5 to 10
    if (daysWithManySlots.length > 0) {
      const daysList = daysWithManySlots.map(([day, count]) => `${day} (${count} slots)`).join(', ');
      return { 
        isValid: false, 
        message: `Too many time slots per day: ${daysList}. Consider combining some slots.` 
      };
    }
    
    // Check for extremely unrealistic total hours (more than 168 hours per week = 24/7)
    const totalHoursPerWeek = totalDuration / 60;
    if (totalHoursPerWeek > 168) {
      return { 
        isValid: false, 
        message: `Total weekly hours (${totalHoursPerWeek.toFixed(1)}h) exceeds maximum possible hours in a week (168h)` 
      };
    }
    
    return { isValid: true, message: '', stats: { totalDuration, daySlotCounts } };
  }, [customTimeSlots, checkOverlap]);

  const validateNewSlot = useCallback(() => {
    console.group('🔍 Validating New/Edited Slot');
    console.log('Current slot:', newSlot);
    console.log('Is editing:', isEditingSlot);
    console.log('Editing index:', editingSlotIndex);
    
    // Basic time range validation
    const timeValidation = validateTimeRange(newSlot.startTime, newSlot.endTime);
    if (!timeValidation.isValid) {
      console.warn('❌ Time validation failed:', timeValidation.message);
      setFieldErrors(prev => ({ ...prev, slot: timeValidation.message }));
      console.groupEnd();
      return false;
    }
    
    console.log('✅ Time validation passed');
    
    // Check for exact duplicates only when adding new slots (not when editing)
    if (!isEditingSlot) {
      const startTime = dayjs.isDayjs(newSlot.startTime) ? newSlot.startTime.format('HH:mm') : newSlot.startTime;
      const endTime = dayjs.isDayjs(newSlot.endTime) ? newSlot.endTime.format('HH:mm') : newSlot.endTime;
      
      const duplicate = customTimeSlots.some((slot) => {
        const slotStart = dayjs.isDayjs(slot.startTime) ? slot.startTime.format('HH:mm') : slot.startTime;
        const slotEnd = dayjs.isDayjs(slot.endTime) ? slot.endTime.format('HH:mm') : slot.endTime;
        const isDuplicate = slot.dayOfWeek === newSlot.dayOfWeek && slotStart === startTime && slotEnd === endTime;
        
        if (isDuplicate) {
          console.log(`🔄 Duplicate found:`, slot);
        }
        
        return isDuplicate;
      });
      
      if (duplicate) {
        const message = `This exact time slot already exists on ${newSlot.dayOfWeek}`;
        console.warn('❌ Duplicate slot:', message);
        setFieldErrors(prev => ({ ...prev, slot: message }));
        console.groupEnd();
        return false;
      }
    }
    
    console.log('✅ No duplicates found');
    
    // Check for actual overlaps (not adjacent slots) - exclude current slot if editing
    const overlapCheck = checkOverlap(customTimeSlots, newSlot, isEditingSlot ? editingSlotIndex : null);
    if (overlapCheck.hasOverlap) {
      console.warn('❌ Overlap detected:', overlapCheck.message);
      setFieldErrors(prev => ({ ...prev, slot: overlapCheck.message }));
      console.groupEnd();
      return false;
    }
    
    console.log('✅ No overlaps found');
    
    // Count slots for the day (exclude current slot if editing)
    const daySlotCount = customTimeSlots.filter((slot, idx) => {
      if (isEditingSlot && idx === editingSlotIndex) return false;
      return slot.dayOfWeek === newSlot.dayOfWeek;
    }).length;
    
    if (daySlotCount >= 10) {
      const message = `Too many time slots on ${newSlot.dayOfWeek} (${daySlotCount} existing). Consider combining some slots.`;
      console.warn('❌ Too many slots:', message);
      setFieldErrors(prev => ({ ...prev, slot: message }));
      console.groupEnd();
      return false;
    }
    
    console.log(`✅ Day slot count OK: ${daySlotCount}/10 on ${newSlot.dayOfWeek}`);
    
    // Show warnings if any
    if (timeValidation.warnings?.length > 0) {
      console.warn('⚠️ Warnings:', timeValidation.warnings);
    }
    
    // Clear any previous errors
    setFieldErrors(prev => ({ ...prev, slot: '' }));
    console.log('✅ Validation passed');
    console.groupEnd();
    return true;
  }, [newSlot, customTimeSlots, checkOverlap, isEditingSlot, editingSlotIndex]);

  const handleAddSlot = useCallback(() => {
    if (!validateNewSlot()) return;
    
    const formattedSlot = {
      dayOfWeek: newSlot.dayOfWeek,
      startTime: dayjs.isDayjs(newSlot.startTime) ? newSlot.startTime.format('HH:mm') : newSlot.startTime,
      endTime: dayjs.isDayjs(newSlot.endTime) ? newSlot.endTime.format('HH:mm') : newSlot.endTime
    };
    
    setCustomTimeSlots(slots => [...slots, formattedSlot]);
    setNewSlot({
      dayOfWeek: daysOfWeek[0],
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(17).minute(0)
    });
    setIsAddingSlot(false);
    setHasUnsavedChanges(true);
  }, [validateNewSlot, newSlot]);

  const handleDeleteSlot = useCallback((idx) => {
    console.log('🗑️ Deleting slot at index:', idx);
    setCustomTimeSlots(slots => slots.filter((_, i) => i !== idx));
    setHasUnsavedChanges(true);
  }, []);

  const handleEditSlot = useCallback((idx) => {
    console.log('✏️ Editing slot at index:', idx);
    const slotToEdit = customTimeSlots[idx];
    console.log('Slot to edit:', slotToEdit);
    
    // Convert string times to dayjs objects for editing
    setNewSlot({
      dayOfWeek: slotToEdit.dayOfWeek,
      startTime: dayjs(slotToEdit.startTime, 'HH:mm'),
      endTime: dayjs(slotToEdit.endTime, 'HH:mm')
    });
    
    setEditingSlotIndex(idx);
    setIsEditingSlot(true);
    setIsAddingSlot(true); // Reuse the same form
    setFieldErrors(prev => ({ ...prev, slot: '' }));
    
    // Auto-scroll to the add/edit form after state updates
    setTimeout(() => {
      const addSlotElement = document.querySelector('[data-slot-form]');
      if (addSlotElement) {
        addSlotElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest' 
        });
      }
    }, 100);
  }, [customTimeSlots]);

  const handleSaveEditedSlot = useCallback(() => {
    if (!validateNewSlot()) return;
    
    console.log('💾 Saving edited slot at index:', editingSlotIndex);
    
    const formattedSlot = {
      dayOfWeek: newSlot.dayOfWeek,
      startTime: dayjs.isDayjs(newSlot.startTime) ? newSlot.startTime.format('HH:mm') : newSlot.startTime,
      endTime: dayjs.isDayjs(newSlot.endTime) ? newSlot.endTime.format('HH:mm') : newSlot.endTime
    };
    
    setCustomTimeSlots(slots => 
      slots.map((slot, idx) => 
        idx === editingSlotIndex ? formattedSlot : slot
      )
    );
    
    // Reset editing state
    setNewSlot({
      dayOfWeek: daysOfWeek[0],
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(17).minute(0)
    });
    setIsAddingSlot(false);
    setIsEditingSlot(false);
    setEditingSlotIndex(null);
    setHasUnsavedChanges(true);
  }, [validateNewSlot, newSlot, editingSlotIndex]);

  const handleCancelEdit = useCallback(() => {
    console.log('❌ Cancelling edit');
    setNewSlot({
      dayOfWeek: daysOfWeek[0],
      startTime: dayjs().hour(9).minute(0),
      endTime: dayjs().hour(17).minute(0)
    });
    setIsAddingSlot(false);
    setIsEditingSlot(false);
    setEditingSlotIndex(null);
    setFieldErrors(prev => ({ ...prev, slot: '' }));
  }, []);

  const handleSave = useCallback(() => {
    setError(null);
    setIsLocalLoading(true); // Set local loading immediately
    
    if (!validateFields()) {
      setIsLocalLoading(false);
      return;
    }
    
    const availabilityData = {
      suburb: suburb.trim(),
      kmWillingToTravel: Number(kmWillingToTravel),
      customTimeSlots: customTimeSlots.map(slot => ({
        dayOfWeek: slot.dayOfWeek,
        startTime: dayjs.isDayjs(slot.startTime) ? slot.startTime.format('HH:mm') : slot.startTime,
        endTime: dayjs.isDayjs(slot.endTime) ? slot.endTime.format('HH:mm') : slot.endTime
      }))
    };
    
    // Update local store
    updateAvailability(availabilityData);
    
    // Save to backend
    saveAvailability(availabilityData, {
      onSuccess: (data) => {
        setIsLocalLoading(false);
        setHasUnsavedChanges(false);
        onSave?.(availabilityData);
        onClose();
      },
      onError: (err) => {
        setIsLocalLoading(false);
        setError(err.message || 'Failed to save availability');
      },
    });
  }, [suburb, kmWillingToTravel, customTimeSlots, validateFields, updateAvailability, saveAvailability, onSave, onClose]);
  
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Reset local state when drawer opens/closes
  useEffect(() => {
    if (open) {
      setSuburb(initialData?.suburb || '');
      // Ensure minimum value of 1 for kmWillingToTravel
      setKmWillingToTravel(Math.max(initialData?.kmWillingToTravel || 10, 1));
      setCustomTimeSlots(initialData?.customTimeSlots || []);
      setError(null);
      setFieldErrors({ suburb: '', km: '', slot: '', slots: '' });
      setValidationMessages([]);
      setHasUnsavedChanges(false);
      setIsAddingSlot(false);
      setIsLocalLoading(false);
    }
  }, [open, initialData]);
  
  // Auto-validate on changes with debouncing
  useEffect(() => {
    if (open && (suburb || kmWillingToTravel || customTimeSlots.length > 0)) {
      const timer = setTimeout(() => {
        validateFields();
      }, 300); // Reduced delay for better UX
      return () => clearTimeout(timer);
    }
  }, [open, suburb, kmWillingToTravel, customTimeSlots, validateFields]);
  
  // Real-time validation for new slot
  useEffect(() => {
    if (isAddingSlot && newSlot.startTime && newSlot.endTime) {
      const timer = setTimeout(() => {
        validateNewSlot();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAddingSlot, newSlot.startTime, newSlot.endTime, newSlot.dayOfWeek, validateNewSlot]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', sm: '90vw', md: 600, lg: 720 },
            maxWidth: { xs: '100vw', sm: 500, md: 600, lg: 720 },
            borderRadius: { xs: 0, sm: '12px 0 0 12px' },
            background: theme.palette.background.paper,
            boxShadow: { xs: theme.shadows[24], sm: theme.shadows[16] },
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }
        }}
      >
        {/* Mobile-Optimized Header */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: theme.palette.background.paper,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header Row */}
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                fontWeight={700} 
                sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                  lineHeight: { xs: 1.2, sm: 1.3 },
                  mb: 0.5
                }}
              >
                Edit Availability
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  lineHeight: 1.3,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Configure your work schedule and preferences
              </Typography>
            </Box>
            <Tooltip title="Close">
              <IconButton 
                onClick={handleClose}
                size="small"
                sx={{ 
                  ml: 1,
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.grey[500], 0.2),
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <CloseIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Tooltip>
          </Stack>
          
          {/* Compact Progress Indicators */}
          <Stack 
            direction="row" 
            spacing={{ xs: 0.5, sm: 1 }} 
            sx={{ 
              flexWrap: 'wrap',
              gap: { xs: 0.5, sm: 1 }
            }}
          >
            <Chip
              label={`${totalHours.toFixed(1)}h`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 },
                '& .MuiChip-label': { 
                  px: { xs: 0.8, sm: 1 }
                }
              }}
            />
            <Chip
              label={`${availableDays.length}/7 days`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: 'success.main',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 },
                '& .MuiChip-label': { 
                  px: { xs: 0.8, sm: 1 }
                }
              }}
            />
            <Chip
              label={`${customTimeSlots.length} slots`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.info.main, 0.1),
                color: 'info.main',
                fontWeight: 600,
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                height: { xs: 20, sm: 24 },
                '& .MuiChip-label': { 
                  px: { xs: 0.8, sm: 1 }
                }
              }}
            />
            {hasUnsavedChanges && (
              <Chip
                label="Unsaved"
                size="small"
                icon={<WarningIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.main',
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 },
                  '& .MuiChip-label': { 
                    px: { xs: 0.8, sm: 1 }
                  }
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ 
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
        }}>
          <Stack spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {/* Validation Messages */}
            {validationMessages.length > 0 && (
              <Stack spacing={1}>
                {validationMessages.map((message, idx) => (
                  <Fade in key={idx}>
                    <Alert 
                      severity={message.type} 
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

            {/* Location Settings */}
            <LocationPreferenceCard
              suburb={suburb}
              onSuburbChange={handleSuburbChange}
              kmWillingToTravel={kmWillingToTravel}
              onKmChange={handleKmChange}
              errors={{
                suburb: fieldErrors.suburb,
                km: fieldErrors.km
              }}
              disabled={isLoading || isLocalLoading}
            />

            {/* Mobile-Optimized Add Time Slot */}
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
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={{ xs: 1.5, sm: 2 }} 
                  alignItems={{ xs: 'stretch', sm: 'center' }} 
                  justifyContent={{ xs: 'flex-start', sm: 'space-between' }} 
                  sx={{ mb: { xs: 1.5, sm: 2 } }}
                >
                  <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
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
                          lineHeight: { xs: 1.2, sm: 1.3,md: 1.4 }
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
                      {isEditingSlot && (
                        <Typography 
                          variant="caption" 
                          color="info.main"
                          sx={{
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            fontWeight: 600,
                            mt: 0.5,
                            display: 'block'
                          }}
                        >
                          ✏️ Editing mode - only shows overlap warnings
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                  
                  <Button
                    variant={isAddingSlot ? "outlined" : "contained"}
                    color="warning"
                    startIcon={isAddingSlot ? <CloseIcon sx={{ fontSize: { xs: 16, sm: 18 } }} /> : <AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                    onClick={() => isAddingSlot ? handleCancelEdit() : setIsAddingSlot(true)}
                    disabled={isLoading || isLocalLoading}
                    sx={{ 
                      borderRadius: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                      fontWeight: 600,
                      py: { xs: 0.8, sm: 1, md: 1 },
                      px: { xs: 1.5, sm: 2, md: 1 },
                      minHeight: { xs: 32, sm: 36, md: 40 },
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      alignSelf: { xs: 'stretch', sm: 'center' },
                      '& .MuiButton-startIcon': {
                        marginRight: { xs: 0.5, sm: 0.8,md: 1 }
                      }
                    }}
                  >
                    {isAddingSlot ? 'Cancel' : (isEditingSlot ? 'Cancel Edit' : 'Add Slot')}
                  </Button>
                </Stack>

                <Collapse in={isAddingSlot}>
                  <Stack spacing={{ xs: 2, sm: 2.5 }}>
                    <TextField
                      select
                      label="Day of Week"
                      value={newSlot.dayOfWeek}
                      onChange={(e) => setNewSlot(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                      fullWidth
                      disabled={isLoading || isLocalLoading}
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

                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                      <Grid item xs={6}>
                        <TimePicker
                          label="Start Time"
                          value={newSlot.startTime}
                          onChange={(newValue) => setNewSlot(prev => ({ ...prev, startTime: newValue }))}
                          disabled={isLoading || isLocalLoading}
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
                          onChange={(newValue) => setNewSlot(prev => ({ ...prev, endTime: newValue }))}
                          disabled={isLoading || isLocalLoading}
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

                    {/* Enhanced Duration Preview with Validation */}
                    {newSlot.startTime && newSlot.endTime && (() => {
                      const timeValidation = validateTimeRange(newSlot.startTime, newSlot.endTime);
                      const duration = calculateDuration(newSlot.startTime, newSlot.endTime);
                      const isValid = timeValidation.isValid;
                      
                      return (
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            borderRadius: { xs: 1.5, sm: 2 },
                            bgcolor: alpha(isValid ? theme.palette.success.main : theme.palette.warning.main, 0.1),
                            border: `1px solid ${alpha(isValid ? theme.palette.success.main : theme.palette.warning.main, 0.3)}`
                          }}
                        >
                          <Stack spacing={{ xs: 0.8, sm: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={{ xs: 0.8, sm: 1 }}>
                              {isValid ? (
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
                                color={isValid ? 'success.main' : 'warning.main'} 
                                fontWeight={600}
                                sx={{
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                                }}
                              >
                                Duration: {duration}
                              </Typography>
                            </Stack>
                            
                            {/* Time range display */}
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                lineHeight: 1.3
                              }}
                            >
                              {formatTimeDisplay(newSlot.startTime)} - {formatTimeDisplay(newSlot.endTime)} on {newSlot.dayOfWeek}
                            </Typography>
                            
                            {/* Show overlap warning if exists */}
                            {(() => {
                              const overlapCheck = checkOverlap(customTimeSlots, newSlot, isEditingSlot ? editingSlotIndex : null);
                              if (overlapCheck.hasOverlap) {
                                return (
                                  <Typography 
                                    variant="caption" 
                                    color="error.main"
                                    sx={{
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      lineHeight: 1.3
                                    }}
                                  >
                                    ⚠️ {overlapCheck.message}
                                  </Typography>
                                );
                              }
                              return null;
                            })()}
                            
                            {/* Show day slot count */}
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
                                    sx={{
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      lineHeight: 1.3
                                    }}
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
                      );
                    })()}

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

                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={
                        isEditingSlot ? 
                          <SaveIcon sx={{ fontSize: { xs: 16, sm: 18 } }} /> : 
                          <AddIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                      }
                      onClick={isEditingSlot ? handleSaveEditedSlot : handleAddSlot}
                      fullWidth
                      disabled={!newSlot.startTime || !newSlot.endTime || isLoading || fieldErrors.slot}
                      sx={{
                        borderRadius: { xs: 2, sm: 2.5 },
                        py: { xs: 1, sm: 1.2, md: 1.5 },
                        px: { xs: 1.5, sm: 2, md: 3 },
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' },
                        minHeight: { xs: 40, sm: 44, md: 48 },
                        opacity: (!newSlot.startTime || !newSlot.endTime || fieldErrors.slot) ? 0.6 : 1,
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
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: { xs: 0.5, sm: 1 }
                        }}
                      >
                        {(() => {
                          if (!newSlot.startTime || !newSlot.endTime) {
                            return (
                              <>
                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                  {isEditingSlot ? 'Select Times to Update' : 'Select Times to Add Slot'}
                                </Box>
                                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                                  {isEditingSlot ? 'Select Times' : 'Select Times'}
                                </Box>
                              </>
                            );
                          }
                          if (fieldErrors.slot) {
                            return (
                              <>
                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                  {isEditingSlot ? 'Fix Errors to Update' : 'Fix Errors to Add Slot'}
                                </Box>
                                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                                  Fix Errors
                                </Box>
                              </>
                            );
                          }
                          return (
                            <>
                              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                {isEditingSlot ? 'Update Time Slot' : 'Add Time Slot'}
                              </Box>
                              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                                {isEditingSlot ? 'Update' : 'Add Slot'}
                              </Box>
                            </>
                          );
                        })()}
                      </Box>
                    </Button>
                  </Stack>
                </Collapse>
              </CardContent>
            </Card>

            {/* Mobile-Optimized Time Slots Display */}
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
                <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center" sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
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

                {customTimeSlots.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: { xs: 2, sm: 3, md: 4 },
                      px: { xs: 1, sm: 2 },
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.grey[500], 0.05),
                      border: `2px dashed ${alpha(theme.palette.grey[500], 0.2)}`
                    }}
                  >
                    <AccessTimeIcon sx={{ 
                      fontSize: { xs: 36, sm: 42, md: 48 }, 
                      color: theme.palette.grey[400], 
                      mb: { xs: 1.5, sm: 2 } 
                    }} />
                    <Typography 
                      variant="h6" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 1,
                        fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
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
                      Add your available working hours to start receiving job notifications
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={{ xs: 1.5, sm: 2 }}>
                    {daysOfWeek.filter(day => groupedSlots[day].length > 0).map(day => {
                      const dayTheme = DAY_THEMES[day];
                      return (
                        <Paper
                          key={day}
                          elevation={2}
                          sx={{
                            borderRadius: { xs: 1.5, sm: 2 },
                            border: `2px solid ${alpha(dayTheme.primary, 0.2)}`,
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: theme.shadows[8],
                              borderColor: alpha(dayTheme.primary, 0.4),
                            }
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
                                  sx={{
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                  }}
                                >
                                  {groupedSlots[day].length} slot{groupedSlots[day].length !== 1 ? 's' : ''}
                                </Typography>
                              </Box>
                            </Stack>

                            <Stack spacing={{ xs: 1, sm: 1.5 }}>
                              {groupedSlots[day].map((slot, idx) => {
                                const slotIndex = customTimeSlots.findIndex(s => s === slot);
                                return (
                                  <Paper
                                    key={`${day}-${idx}`}
                                    elevation={1}
                                    sx={{
                                      p: { xs: 1.5, sm: 2 },
                                      borderRadius: { xs: 1.5, sm: 2 },
                                      bgcolor: slotIndex === editingSlotIndex && isEditingSlot 
                                        ? alpha(theme.palette.warning.main, 0.15)
                                        : alpha(dayTheme.primary, 0.05),
                                      border: slotIndex === editingSlotIndex && isEditingSlot
                                        ? `2px solid ${theme.palette.warning.main}`
                                        : `1px solid ${alpha(dayTheme.primary, 0.2)}`,
                                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                      position: 'relative',
                                      '&:hover': {
                                        bgcolor: slotIndex === editingSlotIndex && isEditingSlot
                                          ? alpha(theme.palette.warning.main, 0.2)
                                          : alpha(dayTheme.primary, 0.1),
                                        borderColor: slotIndex === editingSlotIndex && isEditingSlot
                                          ? theme.palette.warning.dark
                                          : alpha(dayTheme.primary, 0.4),
                                        transform: 'translateY(-1px)',
                                        boxShadow: theme.shadows[4],
                                      },
                                      ...(slotIndex === editingSlotIndex && isEditingSlot && {
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
                                              sx={{
                                                fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                              }}
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
                                              
                                              // Check for potential overlaps with other slots
                                              const otherSlots = customTimeSlots.filter((_, idx) => idx !== slotIndex);
                                              const overlapCheck = checkOverlap(otherSlots, slot);
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
                                            onClick={() => handleEditSlot(slotIndex)}
                                            disabled={isLoading || isAddingSlot}
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
                                            onClick={() => handleDeleteSlot(slotIndex)}
                                            disabled={isLoading || isLocalLoading}
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

            

            {/* Global Error */}
            {(error || mutationError) && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                {error || mutationError?.message || 'An error occurred while saving'}
              </Alert>
            )}
          </Stack>
        </Box>

        {/* Mobile-Optimized Footer Actions */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2, md: 3 },
            background: theme.palette.background.paper,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            position: 'sticky',
            bottom: 0,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 2 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={isLoading || isLocalLoading}
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                flex: 1,
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 2, sm: 3 },
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minHeight: { xs: 44, sm: 48 },
                borderColor: alpha(theme.palette.text.primary, 0.3),
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.text.primary, 0.05),
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isLoading || isLocalLoading || !suburb || customTimeSlots.length === 0}
              startIcon={(isLoading || isLocalLoading) ? <CircularProgress size={18} color="inherit" /> : <SaveIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                flex: 2,
                py: { xs: 1.2, sm: 1.5 },
                px: { xs: 2, sm: 3 },
                fontWeight: 700,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minHeight: { xs: 44, sm: 48 },
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'translateY(-1px)',
                },
                '&:disabled': {
                  background: alpha(theme.palette.action.disabled, 0.3),
                  color: theme.palette.action.disabled,
                },
                '& .MuiButton-startIcon': {
                  marginRight: { xs: 0.8, sm: 1 }
                }
              }}
            >
              {(isLoading || isLocalLoading) ? 'Saving...' : 'Save Changes'}
            </Button>
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