import React from "react";
import { Grid, Paper, Typography, LinearProgress, Stack, Chip } from "@mui/material";
import { format } from "date-fns";
import PropTypes from "prop-types";

/**
 * AdditionalMetricsRow Component
 * Displays additional metrics in a compact row format
 */
const AdditionalMetricsRow = React.memo(({ 
  referenceAnalytics, 
  metricsData, 
  engagementMetrics, 
  systemHealth,
  theme 
}) => {
  return (
    <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} sx={{ mb: 3 }}>
      {/* Reference Completion */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.813rem' }}>
            Reference Completion
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {Math.round(metricsData.referenceCompletionRate)}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={metricsData.referenceCompletionRate} 
            color="warning"
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Paper>
      </Grid>

      {/* Total References */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.813rem' }}>
            Total References
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {referenceAnalytics?.totalReferences || 0}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Chip 
              label={`Completed: ${referenceAnalytics?.referencesByStatus?.Completed || 0}`}
              size="small"
              color="success"
              sx={{ fontSize: '0.7rem' }}
            />
          </Stack>
        </Paper>
      </Grid>

      {/* Engagement Score */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.813rem' }}>
            Engagement Score
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {engagementMetrics?.engagementScore || 0}/10
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(engagementMetrics?.engagementScore || 0) * 10} 
            color="success"
            sx={{ height: 6, borderRadius: 1, mt: 1 }}
          />
        </Paper>
      </Grid>

      {/* System Uptime */}
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.813rem' }}>
            System Uptime
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {systemHealth?.uptime ? `${Math.round(systemHealth.uptime / 3600)}h` : '0h'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {systemHealth?.timestamp ? format(new Date(systemHealth.timestamp), 'MMM dd, HH:mm') : 'N/A'}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
});

AdditionalMetricsRow.displayName = 'AdditionalMetricsRow';

AdditionalMetricsRow.propTypes = {
  referenceAnalytics: PropTypes.object,
  metricsData: PropTypes.object.isRequired,
  engagementMetrics: PropTypes.object,
  systemHealth: PropTypes.object,
  theme: PropTypes.object.isRequired
};

export default AdditionalMetricsRow;

