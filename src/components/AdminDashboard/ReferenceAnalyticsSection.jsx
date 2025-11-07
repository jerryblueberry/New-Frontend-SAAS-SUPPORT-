import React from "react";
import { Box, Grid, Typography, Stack, useTheme, useMediaQuery, alpha } from "@mui/material";
import { Assignment, Assessment } from "@mui/icons-material";
import StatusDistributionChart from "./StatusDistributionChart";
import AnalyticsOverviewCard from "./AnalyticsOverviewCard";
import PropTypes from "prop-types";

/**
 * ReferenceAnalyticsSection Component
 * Displays reference check analytics including status distribution and key metrics
 */
const ReferenceAnalyticsSection = React.memo(({ referenceAnalytics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!referenceAnalytics) return null;

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
            background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.25)}`
          }}
        >
          <Assignment sx={{ color: '#fff', fontSize: { xs: 20, md: 24 } }} />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.125rem', md: '1.25rem' },
            color: 'text.primary'
          }}
        >
          Reference Checks
        </Typography>
      </Stack>

      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="stretch">
        {/* Reference Status Distribution */}
        <Grid item xs={12} md={6} lg={7}>
          <StatusDistributionChart
            title="Reference Status"
            data={referenceAnalytics.referencesByStatus || {}}
            colorScheme="status"
            subtitle="Status breakdown"
            height={isMobile ? 260 : 300}
          />
        </Grid>

        {/* Reference Key Metrics */}
        <Grid item xs={12} md={6} lg={5}>
          <Box sx={{ height: '100%' }}>
            <AnalyticsOverviewCard
              title="Key Metrics"
              icon={Assessment}
              color="warning"
              data={referenceAnalytics}
              metrics={[
                {
                  key: 'completionRate',
                  label: 'Completion',
                  max: 100,
                  unit: '%'
                },
                {
                  key: 'averageCompletionTime',
                  label: 'Avg Time',
                  unit: ' days'
                },
                {
                  key: 'pendingReferences',
                  label: 'Pending',
                  showIcon: true,
                  threshold: 0
                },
                {
                  key: 'totalReferences',
                  label: 'Total',
                  showIcon: false
                }
              ]}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

ReferenceAnalyticsSection.displayName = 'ReferenceAnalyticsSection';

ReferenceAnalyticsSection.propTypes = {
  referenceAnalytics: PropTypes.object
};

export default ReferenceAnalyticsSection;

