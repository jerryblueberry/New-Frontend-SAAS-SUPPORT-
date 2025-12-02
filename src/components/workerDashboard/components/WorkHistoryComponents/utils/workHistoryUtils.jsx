/**
 * Utility functions for Work History components
 * Provides date formatting, duration calculation, and status helpers
 */

import React from 'react';
import {
  CheckCircle,
  VerifiedUser,
  MarkEmailRead,
  Visibility,
  Schedule,
  Cancel,
  Error as ErrorIcon,
  Pending
} from '@mui/icons-material';

/**
 * Format date for display (e.g., "Jan 2024" or "Present")
 * @param {string|Date} dateValue - Date to format
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (dateValue) => {
  if (!dateValue) return 'Present';
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? 'Present' : 
      date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (error) {
    return 'Present';
  }
};

/**
 * Calculate duration between two dates in years and months
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date (optional, defaults to now)
 * @returns {string} Duration string (e.g., "2y 3m" or "6m")
 */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate) return '0m';
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    if (isNaN(start.getTime())) return '0m';
    if (endDate && isNaN(end.getTime())) return '0m';
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years}y ${remainingMonths}m`;
    }
    return `${months}m`;
  } catch (error) {
    return '0m';
  }
};

/**
 * Get status icon component based on status
 * @param {string} status - Reference status
 * @returns {React.ReactElement} Status icon component
 */
export const getStatusIcon = (status) => {
  if (!status || typeof status !== 'string') {
    return <Pending fontSize="small" sx={{ color: 'warning.main' }} />;
  }
  
  const iconMap = {
    'Completed': <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />,
    'Verified': <VerifiedUser fontSize="small" sx={{ color: 'success.main' }} />,
    'EmailSent': <MarkEmailRead fontSize="small" sx={{ color: 'info.main' }} />,
    'Viewed': <Visibility fontSize="small" sx={{ color: 'info.main' }} />,
    'InProgress': <Schedule fontSize="small" sx={{ color: 'warning.main' }} />,
    'Rejected': <Cancel fontSize="small" sx={{ color: 'error.main' }} />,
    'Expired': <ErrorIcon fontSize="small" sx={{ color: 'error.main' }} />,
    'Bounced': <ErrorIcon fontSize="small" sx={{ color: 'error.main' }} />,
    'Pending': <Pending fontSize="small" sx={{ color: 'warning.main' }} />,
  };
  
  return iconMap[status] || <Pending fontSize="small" sx={{ color: 'warning.main' }} />;
};

/**
 * Get status color based on status
 * @param {string} status - Reference status
 * @returns {string} MUI color name
 */
export const getStatusColor = (status) => {
  if (!status || typeof status !== 'string') {
    return 'warning';
  }
  
  const colorMap = {
    'Completed': 'success',
    'Verified': 'success',
    'EmailSent': 'info',
    'Viewed': 'info',
    'InProgress': 'info',
    'Rejected': 'error',
    'Expired': 'error',
    'Bounced': 'error',
    'Pending': 'warning',
  };
  
  return colorMap[status] || 'warning';
};

/**
 * Get human-readable status label
 * @param {string} status - Reference status
 * @returns {string} Formatted status label
 */
export const getStatusLabel = (status) => {
  if (!status || typeof status !== 'string') {
    return 'Pending';
  }
  
  const labels = {
    'Pending': 'Pending',
    'EmailSent': 'Email Sent',
    'Viewed': 'Viewed',
    'InProgress': 'In Progress',
    'Completed': 'Completed',
    'Verified': 'Verified',
    'Rejected': 'Rejected',
    'Expired': 'Expired',
    'Bounced': 'Bounced',
  };
  
  return labels[status] || status;
};

