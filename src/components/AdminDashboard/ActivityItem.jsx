import React from "react";
import { Box, Typography, Avatar, Chip, alpha } from "@mui/material";
import { Schedule, Assignment, Assessment } from "@mui/icons-material";
import { format } from "date-fns";
import PropTypes from "prop-types";

/**
 * ActivityItem Component
 * Displays a single activity item in the recent activity feed
 * Optimized with React.memo for performance
 */
const ActivityItem = React.memo(({ activity }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'Timesheet':
        return <Schedule sx={{ fontSize: 16 }} />;
      case 'ProgressNote':
        return <Assignment sx={{ fontSize: 16 }} />;
      default:
        return <Assessment sx={{ fontSize: 16 }} />;
    }
  };

  const getActivityColor = (action) => {
    switch (action) {
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'submitted':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      py: 1.5,
      px: 2,
      borderRadius: 2,
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: alpha('#000', 0.02)
      }
    }}>
      <Avatar sx={{ 
        bgcolor: alpha('#000', 0.08), 
        width: 32, 
        height: 32,
        color: 'text.secondary'
      }}>
        {getActivityIcon(activity.type)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, lineHeight: 1.3 }}>
          {activity.description}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          {activity.createdBy?.firstName} {activity.createdBy?.lastName} • {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
        </Typography>
      </Box>
      <Chip
        label={activity.action}
        size="small"
        color={getActivityColor(activity.action)}
        variant="outlined"
        sx={{ fontSize: '0.7rem', height: 24 }}
      />
    </Box>
  );
}, (prevProps, nextProps) => {
  return prevProps.activity?.id === nextProps.activity?.id;
});

ActivityItem.displayName = 'ActivityItem';

ActivityItem.propTypes = {
  activity: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    type: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    createdBy: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string
    }),
    createdAt: PropTypes.string.isRequired
  }).isRequired
};

export default ActivityItem;

