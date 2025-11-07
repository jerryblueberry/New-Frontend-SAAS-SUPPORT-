import React from "react";
import { Box, Grid, Typography, Stack, useTheme, useMediaQuery, alpha } from "@mui/material";
import { BarChart } from "@mui/icons-material";
import TopItemsChart from "./TopItemsChart";
import PropTypes from "prop-types";

/**
 * TopCategoriesSection Component
 * Displays top support categories, service regions, and worker skills
 */
const TopCategoriesSection = React.memo(({ clientAnalytics, workerAnalytics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const hasData = (clientAnalytics?.topSupportCategories?.length > 0) ||
                  (clientAnalytics?.topServiceRegions?.length > 0) ||
                  (workerAnalytics?.topSkills?.length > 0);

  if (!hasData) return null;

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
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.25)}`
          }}
        >
          <BarChart sx={{ color: '#fff', fontSize: { xs: 20, md: 24 } }} />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: { xs: '1.125rem', md: '1.25rem' },
            color: 'text.primary'
          }}
        >
          Top Categories & Skills
        </Typography>
      </Stack>

      <Grid container spacing={{ xs: 1.5, md: 2 }}>
        {/* Top Support Categories */}
        {clientAnalytics?.topSupportCategories?.length > 0 && (
          <Grid item xs={12} md={6} lg={4}>
            <TopItemsChart
              title="Support Categories"
              data={clientAnalytics.topSupportCategories}
              color="secondary"
              subtitle="Most requested"
              height={isMobile ? 260 : 280}
              maxItems={5}
            />
          </Grid>
        )}

        {/* Top Service Regions */}
        {clientAnalytics?.topServiceRegions?.length > 0 && (
          <Grid item xs={12} md={6} lg={4}>
            <TopItemsChart
              title="Service Regions"
              data={clientAnalytics.topServiceRegions}
              color="info"
              subtitle="Most requested"
              height={isMobile ? 260 : 280}
              maxItems={5}
            />
          </Grid>
        )}

        {/* Top Worker Skills */}
        {workerAnalytics?.topSkills?.length > 0 && (
          <Grid item xs={12} md={6} lg={4}>
            <TopItemsChart
              title="Worker Skills"
              data={workerAnalytics.topSkills}
              color="success"
              subtitle="Most common"
              height={isMobile ? 260 : 280}
              maxItems={5}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
});

TopCategoriesSection.displayName = 'TopCategoriesSection';

TopCategoriesSection.propTypes = {
  clientAnalytics: PropTypes.object,
  workerAnalytics: PropTypes.object
};

export default TopCategoriesSection;

