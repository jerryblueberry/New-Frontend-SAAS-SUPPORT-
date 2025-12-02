import React from 'react';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

/**
 * Status color mapping for consistent status display
 */
export const STATUS_COLOR_MAP = {
    'Verified': 'success',
    'Pending': 'warning',
    'Rejected': 'error',
    'Expiring Soon': 'warning',
    'Expired': 'error',
    'Completed': 'success',
    'InProgress': 'info',
    'EmailSent': 'info',
    'Viewed': 'info',
    'Submitted': 'info',
    'Approved': 'success',
    'Draft': 'default',
};

/**
 * Status text mapping for display labels
 */
export const STATUS_TEXT_MAP = {
    'Verified': 'Verified',
    'Pending': 'Pending Review',
    'Rejected': 'Rejected',
    'Expiring Soon': 'Expiring Soon',
    'Expired': 'Expired',
    'Completed': 'Completed',
    'InProgress': 'In Progress',
    'EmailSent': 'Email Sent',
    'Viewed': 'Viewed',
    'Submitted': 'Submitted',
    'Approved': 'Approved',
    'Draft': 'Draft',
};

/**
 * Get color for status
 * @param {string} status - Status value
 * @returns {string} Color name
 */
export const getStatusColor = (status) => STATUS_COLOR_MAP[status] || 'default';

/**
 * Get text label for status
 * @param {string} status - Status value
 * @returns {string} Status text
 */
export const getStatusText = (status) => STATUS_TEXT_MAP[status] || status;

/**
 * Get icon component for status
 * @param {string} status - Status value
 * @returns {JSX.Element|null} Icon component
 */
export const getStatusIcon = (status) => {
    const iconMap = {
        'Verified': React.createElement(CheckCircleOutlineIcon, { sx: { fontSize: 16 } }),
        'Pending': React.createElement(ScheduleIcon, { sx: { fontSize: 16 } }),
        'Rejected': React.createElement(CancelIcon, { sx: { fontSize: 16 } }),
        'Expiring Soon': React.createElement(WarningIcon, { sx: { fontSize: 16 } }),
        'Expired': React.createElement(CancelIcon, { sx: { fontSize: 16 } }),
        'Completed': React.createElement(CheckCircleIcon, { sx: { fontSize: 16 } }),
        'InProgress': React.createElement(ScheduleIcon, { sx: { fontSize: 16 } }),
        'EmailSent': React.createElement(EmailIcon, { sx: { fontSize: 16 } }),
        'Viewed': React.createElement(InfoOutlinedIcon, { sx: { fontSize: 16 } }),
        'Submitted': React.createElement(CheckCircleOutlineIcon, { sx: { fontSize: 16 } }),
        'Approved': React.createElement(CheckCircleIcon, { sx: { fontSize: 16 } }),
        'Draft': React.createElement(RadioButtonUncheckedIcon, { sx: { fontSize: 16 } }),
    };
    return iconMap[status] || null;
};

