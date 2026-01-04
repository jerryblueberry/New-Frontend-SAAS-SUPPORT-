// Utility functions and constants for TimeSlot components

// Premium neutral day colors - visible but not too dark
export const DAY_COLORS = {
  Monday: '#3b82f6',    // Blue
  Tuesday: '#6366f1',   // Indigo
  Wednesday: '#8b5cf6', // Purple
  Thursday: '#0ea5e9',  // Sky
  Friday: '#14b8a6',    // Teal
  Saturday: '#64748b',  // Slate
  Sunday: '#78716c',    // Stone
};

// Short day names
export const DAY_SHORT = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

// Format time to 12-hour format with AM/PM
export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes.padStart(2, '0')} ${ampm}`;
};

// Format time to short format (e.g., "9a", "2p")
export const formatTimeShort = (timeString) => {
  if (!timeString) return '';
  const [hours] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'p' : 'a';
  const displayHour = hour % 12 || 12;
  return `${displayHour}${ampm}`;
};

// Calculate duration between two times
export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (durationMinutes <= 0) return null;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

// Format condensed time ranges for weekly overview
export const formatTimeRange = (slots) => {
  if (!slots || slots.length === 0) return null;
  const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const ranges = sorted.map(slot => `${formatTimeShort(slot.startTime)}–${formatTimeShort(slot.endTime)}`);
  return ranges.join(', ');
};

// Check if slot overlaps with existing slots for a given day
export const wouldOverlap = (slot, existingSlots, excludeIndex = null) => {
  if (!existingSlots || !Array.isArray(existingSlots)) return false;
  return existingSlots.some((existing, idx) => {
    if (excludeIndex !== null && idx === excludeIndex) return false;
    if (existing.dayOfWeek !== slot.dayOfWeek) return false;
    return slot.startTime < existing.endTime && slot.endTime > existing.startTime;
  });
};

