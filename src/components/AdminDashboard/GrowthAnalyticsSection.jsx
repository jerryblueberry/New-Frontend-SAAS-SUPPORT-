import React from "react";
import { Box, Grid, Typography, Stack, Tabs, Tab, useTheme, useMediaQuery, alpha } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import GrowthChart from "./GrowthChart";
import PropTypes from "prop-types";

/**
 * GrowthAnalyticsSection Component
 * Displays growth charts for users, workers, and clients
 */
const GrowthAnalyticsSection = React.memo(({ 
  userAnalytics, 
  workerAnalytics, 
  clientGrowth, 
  period,
  chartFilter,
  onChartFilterChange 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
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
            <TrendingUp sx={{ color: '#fff', fontSize: { xs: 20, md: 24 } }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.125rem', md: '1.25rem' },
              color: 'text.primary'
            }}
          >
            Growth Analytics
          </Typography>
        </Stack>
        <Tabs 
          value={chartFilter} 
          onChange={onChartFilterChange}
          sx={{ 
            minHeight: { xs: 32, md: 36 },
            '& .MuiTab-root': {
              minHeight: { xs: 32, md: 36 },
              fontSize: { xs: '0.75rem', md: '0.813rem' },
              textTransform: 'none',
              fontWeight: 600,
              px: { xs: 1.5, md: 2 }
            }
          }}
        >
          <Tab label="All" value="all" />
          <Tab label="Recent" value="recent" />
          <Tab label="Trending" value="trending" />
        </Tabs>
      </Stack>

      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        {/* User Growth Chart */}
        <Grid item xs={12} lg={4}>
          <GrowthChart
            title="User Growth"
            data={userAnalytics?.userGrowth || []}
            color="primary"
            subtitle={`New users (${period})`}
            height={isMobile ? 250 : 300}
          />
        </Grid>
        
        {/* Worker Growth Chart */}
        <Grid item xs={12} lg={4}>
          <GrowthChart
            title="Worker Growth"
            data={workerAnalytics?.workerGrowth || []}
            color="success"
            subtitle={`New workers (${period})`}
            height={isMobile ? 250 : 300}
          />
        </Grid>
        
        {/* Client Growth Chart */}
        <Grid item xs={12} lg={4}>
          <GrowthChart
            title="Client Growth"
            data={clientGrowth}
            color="secondary"
            subtitle={`New clients (${period})`}
            height={isMobile ? 250 : 300}
          />
        </Grid>
      </Grid>
    </Box>
  );
});

GrowthAnalyticsSection.displayName = 'GrowthAnalyticsSection';

GrowthAnalyticsSection.propTypes = {
  userAnalytics: PropTypes.object,
  workerAnalytics: PropTypes.object,
  clientGrowth: PropTypes.array,
  period: PropTypes.string.isRequired,
  chartFilter: PropTypes.string.isRequired,
  onChartFilterChange: PropTypes.func.isRequired
};

export default GrowthAnalyticsSection;

