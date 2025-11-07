import React from "react";
import { Box, Grid, Typography, Stack, useTheme, useMediaQuery, alpha } from "@mui/material";
import { Assessment, Schedule } from "@mui/icons-material";
import StatusDistributionChart from "./StatusDistributionChart";
import AnalyticsOverviewCard from "./AnalyticsOverviewCard";
import PropTypes from "prop-types";

/**
 * NotificationTimesheetSection Component
 * Displays notification and timesheet analytics
 */
const NotificationTimesheetSection = React.memo(({ notificationAnalytics, timesheetAnalytics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!notificationAnalytics && !timesheetAnalytics) return null;

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
            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.25)}`
          }}
        >
          <Assessment sx={{ color: '#fff', fontSize: { xs: 20, md: 24 } }} />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.125rem', md: '1.25rem' },
            color: 'text.primary'
          }}
        >
          Notifications & Timesheets
        </Typography>
      </Stack>

      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        {/* Notification Analytics */}
        {notificationAnalytics && (
          <>
            <Grid item xs={12} md={6}>
              <StatusDistributionChart
                title="Notification Types"
                data={notificationAnalytics.notificationsByType || {}}
                colorScheme="default"
                subtitle="Type breakdown"
                height={isMobile ? 260 : 300}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%' }}>
                <AnalyticsOverviewCard
                  title="Notification Metrics"
                  icon={Assessment}
                  color="info"
                  data={notificationAnalytics}
                  metrics={[
                    {
                      key: 'readRate',
                      label: 'Read Rate',
                      max: 100,
                      unit: '%'
                    },
                    {
                      key: 'unreadCount',
                      label: 'Unread',
                      showIcon: true,
                      threshold: 0
                    },
                    {
                      key: 'totalNotifications',
                      label: 'Total',
                      unit: ''
                    }
                  ]}
                />
              </Box>
            </Grid>
          </>
        )}

        {/* Timesheet Analytics */}
        {timesheetAnalytics && (
          <>
            <Grid item xs={12} md={6}>
              <StatusDistributionChart
                title="Timesheet Status"
                data={timesheetAnalytics.timesheetsByStatus || {}}
                colorScheme="status"
                subtitle="Status breakdown"
                height={isMobile ? 260 : 300}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: '100%' }}>
                <AnalyticsOverviewCard
                  title="Timesheet Metrics"
                  icon={Schedule}
                  color="primary"
                  data={timesheetAnalytics}
                  metrics={[
                    {
                      key: 'totalTimesheets',
                      label: 'Total',
                      showIcon: false
                    },
                    {
                      key: 'pendingTimesheets',
                      label: 'Pending',
                      showIcon: true,
                      threshold: 0
                    },
                    {
                      key: 'totalHours',
                      label: 'Total Hours',
                      unit: ' hrs'
                    },
                    {
                      key: 'averageHoursPerTimesheet',
                      label: 'Avg/Sheet',
                      unit: ' hrs'
                    }
                  ]}
                />
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
});

NotificationTimesheetSection.displayName = 'NotificationTimesheetSection';

NotificationTimesheetSection.propTypes = {
  notificationAnalytics: PropTypes.object,
  timesheetAnalytics: PropTypes.object
};

export default NotificationTimesheetSection;

