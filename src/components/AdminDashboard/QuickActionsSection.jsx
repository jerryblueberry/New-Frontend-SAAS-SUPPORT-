import React from "react";
import { Box, Grid, Typography, Button, useTheme } from "@mui/material";
import { People, Assignment, Schedule, Storage } from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * QuickActionsSection Component
 * Displays quick action buttons for common admin tasks
 */
const QuickActionsSection = React.memo(({ onNavigate }) => {
  const theme = useTheme();

  const quickActions = [
    {
      icon: <People />,
      label: 'Manage Workers',
      path: '/admin/workers'
    },
    {
      icon: <Assignment />,
      label: 'View References',
      path: '/admin/all-references'
    },
    {
      icon: <Schedule />,
      label: 'Review Timesheets',
      path: '/time-sheets'
    },
    {
      icon: <Storage />,
      label: 'Manage Documents',
      path: '/admin/cleanup-documents'
    }
  ];

  return (
    <Box sx={{ 
      background: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      mt: 3,
      p: { xs: 2, sm: 2.5 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        opacity: 0.8
      }
    }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={action.icon}
              onClick={() => onNavigate(action.path)}
              sx={{ 
                py: 2, 
                borderRadius: 2, 
                textTransform: 'none', 
                fontWeight: 500,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${theme.palette.action.hover}`,
                  transition: 'all 0.2s ease'
                }
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

QuickActionsSection.displayName = 'QuickActionsSection';

QuickActionsSection.propTypes = {
  onNavigate: PropTypes.func.isRequired
};

export default QuickActionsSection;

