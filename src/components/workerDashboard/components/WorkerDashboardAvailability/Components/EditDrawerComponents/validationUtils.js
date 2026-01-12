import dayjs from 'dayjs';
import { isTimeBeforeOrEqual } from './timeUtils';

// Enhanced time validation with comprehensive checks
export const validateTimeRange = (startTime, endTime, isDebugging = false) => {
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
    
    // Minimum duration check
    if (diffMinutes < 15) {
      const message = 'Time slot must be at least 15 minutes long';
      if (isDebugging) {
        console.warn('❌ Too short:', message);
        console.groupEnd();
      }
      return { isValid: false, message };
    }
    
    // Maximum single shift check
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
    
    // Warn about very long shifts
    let warnings = [];
    if (diffMinutes > 720) { // 12 hours
      warnings.push('This is a very long shift. Consider breaks and work-life balance.');
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

// Check for time slot overlaps
export const checkTimeOverlap = (slots, newSlot, excludeIndex = null) => {
  const newStart = dayjs.isDayjs(newSlot.startTime) 
    ? newSlot.startTime 
    : dayjs(newSlot.startTime, 'HH:mm');
  const newEnd = dayjs.isDayjs(newSlot.endTime) 
    ? newSlot.endTime 
    : dayjs(newSlot.endTime, 'HH:mm');
  
  for (let i = 0; i < slots.length; i++) {
    if (excludeIndex !== null && i === excludeIndex) continue;
    
    const slot = slots[i];
    if (slot.dayOfWeek !== newSlot.dayOfWeek) continue;
    
    const slotStart = dayjs.isDayjs(slot.startTime) 
      ? slot.startTime 
      : dayjs(slot.startTime, 'HH:mm');
    const slotEnd = dayjs.isDayjs(slot.endTime) 
      ? slot.endTime 
      : dayjs(slot.endTime, 'HH:mm');
    
    // Check for overlap
    if (
      (newStart.isBefore(slotEnd) && newEnd.isAfter(slotStart)) ||
      (newStart.isSame(slotStart) && newEnd.isSame(slotEnd))
    ) {
      return {
        hasOverlap: true,
        message: `Overlaps with existing slot (${slotStart.format('h:mm A')} - ${slotEnd.format('h:mm A')})`
      };
    }
  }
  
  return { hasOverlap: false, message: '' };
};

// Validate all time slots
export const validateAllTimeSlots = (slots) => {
  const slotSet = new Set();
  const daySlotCounts = {};
  let totalDuration = 0;
  
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    
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
        message: `Duplicate time slot found on ${slot.dayOfWeek}` 
      };
    }
    slotSet.add(key);
    
    // Count slots per day
    daySlotCounts[slot.dayOfWeek] = (daySlotCounts[slot.dayOfWeek] || 0) + 1;
    
    // Check for overlaps
    const overlapCheck = checkTimeOverlap(slots, slot, i);
    if (overlapCheck.hasOverlap) {
      return { 
        isValid: false, 
        message: `${slot.dayOfWeek}: ${overlapCheck.message}` 
      };
    }
  }
  
  // Check for too many slots per day
  const daysWithManySlots = Object.entries(daySlotCounts).filter(([, count]) => count > 10);
  if (daysWithManySlots.length > 0) {
    const daysList = daysWithManySlots.map(([day, count]) => `${day} (${count} slots)`).join(', ');
    return { 
      isValid: false, 
      message: `Too many time slots per day: ${daysList}. Consider combining some slots.` 
    };
  }
  
  // Check total weekly hours
  const totalHoursPerWeek = totalDuration / 60;
  if (totalHoursPerWeek > 168) {
    return { 
      isValid: false, 
      message: `Total weekly hours (${totalHoursPerWeek.toFixed(1)}h) exceeds maximum possible hours in a week (168h)` 
    };
  }
  
  return { 
    isValid: true, 
    message: '', 
    stats: { totalDuration, daySlotCounts, totalHours: totalHoursPerWeek } 
  };
};

// Validate form fields
export const validateFormFields = (suburb, kmWillingToTravel, customTimeSlots) => {
  const errors = {};
  const messages = [];
  let isValid = true;
  
  // Validate suburb
  if (!suburb || suburb.trim().length === 0) {
    errors.suburb = 'Preferred location is required';
    messages.push({ type: 'error', text: 'Please enter your preferred location' });
    isValid = false;
  } else if (suburb.trim().length < 2) {
    errors.suburb = 'Location must be at least 2 characters';
    messages.push({ type: 'error', text: 'Location name is too short' });
    isValid = false;
  }
  
  // Validate distance
  const distance = Number(kmWillingToTravel);
  if (isNaN(distance) || distance < 1) {
    errors.km = 'Distance must be at least 1 km';
    messages.push({ type: 'error', text: 'Please enter a valid travel distance (minimum 1 km)' });
    isValid = false;
  } else if (distance > 500) {
    errors.km = 'Distance cannot exceed 500 km';
    messages.push({ type: 'error', text: 'Maximum travel distance is 500 km' });
    isValid = false;
  }
  
  // Validate time slots
  if (!customTimeSlots || customTimeSlots.length === 0) {
    errors.slots = 'At least one time slot is required';
    messages.push({ type: 'error', text: 'Please add at least one available time slot' });
    isValid = false;
  } else {
    const slotsValidation = validateAllTimeSlots(customTimeSlots);
    if (!slotsValidation.isValid) {
      errors.slots = slotsValidation.message;
      messages.push({ type: 'error', text: slotsValidation.message });
      isValid = false;
    } else {
      const { totalHours } = slotsValidation.stats;
      const daysCount = new Set(customTimeSlots.map(slot => slot.dayOfWeek)).size;
      const avgHoursPerDay = totalHours / daysCount;
      
      messages.push({ 
        type: 'success', 
        text: `${customTimeSlots.length} slots • ${daysCount} days • ${totalHours.toFixed(1)}h total • ${avgHoursPerDay.toFixed(1)}h avg` 
      });
      
      if (totalHours < 5) {
        messages.push({ type: 'info', text: 'Consider adding more hours if you want more job opportunities' });
      }
      if (daysCount < 2) {
        messages.push({ type: 'info', text: 'Adding availability on more days can help you find more jobs' });
      }
    }
  }
  
  return { isValid, errors, messages };
};
