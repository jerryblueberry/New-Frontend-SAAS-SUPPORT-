import React from "react";
import { Box, Grid, Typography, Stack, Chip, useTheme, useMediaQuery, alpha } from "@mui/material";
import { Business, Assessment } from "@mui/icons-material";
import StatusDistributionChart from "./StatusDistributionChart";
import AnalyticsOverviewCard from "./AnalyticsOverviewCard";
import PropTypes from "prop-types";

/**
 * ClientAnalyticsSection Component
 * Displays client analytics including status distribution and onboarding progress
 */
const ClientAnalyticsSection = React.memo(({ clientAnalytics, period }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  if (!clientAnalytics) return null;

  return (
    <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
      {/* Section Header */}
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between"
        sx={{ 
          mb: { xs: 2, md: 2.5 },
          pb: { xs: 1.5, md: 2 },
          borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: { xs: 36, md: 42 },
              height: { xs: 36, md: 42 },
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`
            }}
          >
            <Business sx={{ color: '#fff', fontSize: { xs: 20, md: 24 } }} />
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.125rem', md: '1.25rem' },
                color: 'text.primary',
                lineHeight: 1.2
              }}
            >
              Client Analytics
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                fontSize: { xs: '0.75rem', md: '0.813rem' },
                fontWeight: 500
              }}
            >
              Status distribution & onboarding insights
            </Typography>
          </Box>
        </Stack>
        <Chip
          label={period}
          size="small"
          color="primary"
          sx={{
            fontSize: { xs: '0.688rem', md: '0.75rem' },
            height: { xs: 24, md: 28 },
            fontWeight: 600
          }}
        />
      </Stack>

      <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="stretch">
        {/* Client Status Distribution */}
        <Grid item xs={12} lg={8} xl={9}>
          <StatusDistributionChart
            title="Client Status Distribution"
            data={clientAnalytics.clientsByStatus || {}}
            colorScheme="status"
            subtitle="Breakdown by status"
            height={isMobile ? 280 : isTablet ? 340 : 380}
            enhanced={true}
          />
        </Grid>

        {/* Client Onboarding Progress */}
        <Grid item xs={12} lg={4} xl={3}>
          <Box sx={{ height: '100%' }}>
            <AnalyticsOverviewCard
              title="Onboarding Progress"
              icon={Assessment}
              color="info"
              data={clientAnalytics}
              metrics={[
                {
                  key: 'onboardingCompletionRate',
                  label: 'Completion Rate',
                  max: 100,
                  unit: '%'
                },
                {
                  key: 'averageOnboardingProgress',
                  label: 'Avg Progress',
                  max: 100,
                  unit: '%'
                },
                {
                  key: 'pendingVerification',
                  label: 'Pending',
                  showIcon: true,
                  threshold: 0
                },
                {
                  key: 'deletedClients',
                  label: 'Deleted',
                  showIcon: true,
                  threshold: 0,
                  color: 'error'
                }
              ]}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
});

ClientAnalyticsSection.displayName = 'ClientAnalyticsSection';

ClientAnalyticsSection.propTypes = {
  clientAnalytics: PropTypes.object,
  period: PropTypes.string.isRequired
};

export default ClientAnalyticsSection;

