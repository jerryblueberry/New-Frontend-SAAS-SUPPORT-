import React from "react";
import { Box, Grid, Typography, Stack, Chip, useTheme, alpha } from "@mui/material";
import { History, Assessment } from "@mui/icons-material";
import ActivityItem from "./ActivityItem";
import SystemHealthCard from "./SystemHealthCard";
import PropTypes from "prop-types";

/**
 * ActivitySystemHealthSection Component
 * Displays recent activity feed and system health metrics
 */
const ActivitySystemHealthSection = React.memo(({ recentActivity, systemHealth }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
      {/* Section Header */}
      <Stack 
        direction="row" 
        alignItems="center" 
        spacing={1.5}
        sx={{ 
          mb: { xs: 2, md: 2.5 },
          pb: { xs: 1.5, md: 2 },
          borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Box
          sx={{
            width: { xs: 36, md: 42 },
            height: { xs: 36, md: 42 },
            borderRadius: 1.5,
            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.25)}`
          }}
        >
          <History sx={{ color: '#fff', fontSize: { xs: 20, md: 24 } }} />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.125rem', md: '1.25rem' },
            color: 'text.primary'
          }}
        >
          Activity & System Health
        </Typography>
      </Stack>

      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        {/* Recent Activity */}
        <Grid item xs={12} lg={8}>
          <Box sx={{ 
            height: '100%',
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Activity
              </Typography>
              <Chip label="Live" color="success" size="small" sx={{ fontSize: '0.75rem' }} />
            </Box>
            
            <Box sx={{ height: '400px', overflow: 'auto' }}>
              {recentActivity?.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <ActivityItem key={activity?.id || index} activity={activity} />
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Assessment sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                    No recent activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.8 }}>
                    Activities will appear here as users interact with the system
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} lg={4}>
          <SystemHealthCard systemHealth={systemHealth} />
        </Grid>
      </Grid>
    </Box>
  );
});

ActivitySystemHealthSection.displayName = 'ActivitySystemHealthSection';

ActivitySystemHealthSection.propTypes = {
  recentActivity: PropTypes.array,
  systemHealth: PropTypes.object
};

export default ActivitySystemHealthSection;

