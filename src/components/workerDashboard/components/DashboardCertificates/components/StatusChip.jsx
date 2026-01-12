import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@mui/material';
import {
  Verified,
  Schedule,
  Cancel
} from '@mui/icons-material';
import { getStatusColor } from '../utils/certificationUtils';

/**
 * Status Chip Component
 * Displays certification status with icon
 */
const StatusChip = ({ status, size = 'small', ...chipProps }) => {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified': return <Verified fontSize="small" />;
      case 'pending': return <Schedule fontSize="small" />;
      case 'expired': return <Cancel fontSize="small" />;
      case 'expiring soon': return <Schedule fontSize="small" />;
      default: return <Schedule fontSize="small" />;
    }
  };

  const displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1);

  return (
    <Chip
      icon={getStatusIcon(status)}
      label={displayStatus}
      color={getStatusColor(status)}
      size={size}
      {...chipProps}
    />
  );
};

StatusChip.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['small', 'medium'])
};

export default StatusChip;
