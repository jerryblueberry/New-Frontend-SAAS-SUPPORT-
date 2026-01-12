import dayjs from 'dayjs';

// Utility functions for safe dayjs comparisons
export const isTimeEqual = (timeA, timeB) => {
  return timeA.format('HH:mm') === timeB.format('HH:mm');
};

export const isTimeBefore = (timeA, timeB) => {
  return timeA.format('HH:mm') < timeB.format('HH:mm');
};

export const isTimeAfter = (timeA, timeB) => {
  return timeA.format('HH:mm') > timeB.format('HH:mm');
};

export const isTimeBeforeOrEqual = (timeA, timeB) => {
  return isTimeBefore(timeA, timeB) || isTimeEqual(timeA, timeB);
};

export const isTimeAfterOrEqual = (timeA, timeB) => {
  return isTimeAfter(timeA, timeB) || isTimeEqual(timeA, timeB);
};

// Optimized utility functions with better error handling
export const formatTimeDisplay = (time) => {
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

export const calculateDuration = (startTime, endTime) => {
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

// Parse time string to dayjs object
export const parseTimeString = (timeString) => {
  if (!timeString) return null;
  if (dayjs.isDayjs(timeString)) return timeString;
  
  try {
    const parsed = dayjs(timeString, 'HH:mm');
    return parsed.isValid() ? parsed : null;
  } catch (error) {
    console.error('Error parsing time:', error);
    return null;
  }
};

// Format dayjs object to HH:mm string
export const formatTimeToString = (time) => {
  if (!time) return '';
  if (dayjs.isDayjs(time)) return time.format('HH:mm');
  if (typeof time === 'string') return time;
  return '';
};
