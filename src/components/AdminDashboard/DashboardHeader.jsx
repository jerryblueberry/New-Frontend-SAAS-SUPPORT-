import React from "react";
import { Box, Typography, Stack, Button, IconButton, Tooltip, useTheme, useMediaQuery, alpha } from "@mui/material";
import { Refresh, ArrowForward } from "@mui/icons-material";
import PeriodSelector from "./PeriodSelector";
import PropTypes from "prop-types";

/**
 * DashboardHeader Component
 * Header section with title, period selector, and action buttons
 */
const DashboardHeader = React.memo(({ 
  period, 
  onPeriodChange, 
  onRefresh, 
  isFetching,
  onNavigateWorkers,
  onNavigateClients 
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 2, sm: 3 }}
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        {/* Title Section */}
        <Box sx={{ flex: { sm: '0 0 auto', md: '1 1 auto' } }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary', 
              mb: { xs: 0.5, sm: 1 },
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
              lineHeight: { xs: 1.3, sm: 1.4, md: 1.5 }
            }}
          >
            Dashboard
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary', 
              fontWeight: 400,
              fontSize: { xs: '0.813rem', sm: '0.875rem', md: '1rem' },
              lineHeight: { xs: 1.4, sm: 1.5 }
            }}
          >
            Platform overview and key metrics
          </Typography>
        </Box>

        {/* Action Buttons Section */}
        <Stack 
          direction={{ xs: 'column-reverse', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 1.5, md: 2 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            flexShrink: 0
          }}
        >
          {/* Period Selector */}
          <PeriodSelector period={period} onChange={onPeriodChange} />

          {/* Refresh Button */}
          <Tooltip title="Refresh Data" arrow placement="top">
            <IconButton 
              onClick={onRefresh} 
              size="medium"
              disabled={isFetching}
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                width: { xs: '100%', sm: 'auto' },
                height: { xs: 40, sm: 40, md: 44 },
                borderRadius: { xs: 2, sm: 1 },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
                transition: 'all 0.2s ease'
              }}
            >
              <Refresh 
                sx={{ 
                  fontSize: { xs: 20, sm: 22, md: 24 },
                  animation: isFetching ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                  }
                }} 
              />
            </IconButton>
          </Tooltip>

          {/* Manage Workers Button */}
          <Button
            variant="contained"
            onClick={onNavigateWorkers}
            endIcon={<ArrowForward sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            sx={{ 
              borderRadius: { xs: 2, sm: 2 },
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.813rem', sm: '0.875rem', md: '0.9375rem' },
              fontWeight: { xs: 600, sm: 600, md: 600 },
              textTransform: 'none',
              minWidth: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap',
              boxShadow: { xs: 'none', sm: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}` },
              '&:hover': {
                boxShadow: { xs: 'none', sm: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}` },
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                transition: 'all 0.2s ease'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Manage Workers
          </Button>

          {/* Manage Clients Button */}
          <Button
            variant="outlined"
            onClick={onNavigateClients}
            endIcon={<ArrowForward sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            sx={{ 
              borderRadius: { xs: 2, sm: 2 },
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1.25, sm: 1.5 },
              fontSize: { xs: '0.813rem', sm: '0.875rem', md: '0.9375rem' },
              fontWeight: { xs: 600, sm: 600, md: 600 },
              textTransform: 'none',
              minWidth: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap',
              borderColor: 'rgba(255, 99, 71, 0.5)',
              color: 'rgba(255, 99, 71, 1)',
              '&:hover': { 
                backgroundColor: 'rgba(255, 99, 71, 0.08)',
                color: 'rgba(255, 99, 71, 1)',
                borderColor: 'rgba(255, 99, 71, 0.8)',
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                boxShadow: { xs: 'none', sm: `0 4px 12px ${alpha('#ff6347', 0.3)}` },
                transition: 'all 0.2s ease'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Manage Clients
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
});

DashboardHeader.displayName = 'DashboardHeader';

DashboardHeader.propTypes = {
  period: PropTypes.string.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  onNavigateWorkers: PropTypes.func.isRequired,
  onNavigateClients: PropTypes.func.isRequired
};

export default DashboardHeader;

