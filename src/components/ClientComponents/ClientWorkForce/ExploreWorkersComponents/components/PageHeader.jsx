/**
 * PageHeader Component
 * 
 * SaaS-level clean and appealing page header with modern design,
 * optimized stats display, and responsive layout.
 */

import React, { memo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  useTheme,
  alpha,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import {
  Verified,
  Star,
  TrendingUp
} from '@mui/icons-material';

/**
 * StatCard Component - Individual stat card
 * Compact, production-ready SaaS design
 */
const StatCard = memo(({ icon: Icon, value, label, color, isLoading, theme }) => {
  const iconColor = theme.palette[color]?.main || theme.palette.primary.main;
  
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: { xs: '100%', sm: 0 },
        p: { xs: 1.75, sm: 2 },
        borderRadius: 2,
        bgcolor: alpha(iconColor, 0.04),
        border: `1px solid ${alpha(iconColor, 0.1)}`,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: `0 2px 8px ${alpha(iconColor, 0.12)}`,
          borderColor: alpha(iconColor, 0.18)
        }
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start">
        <Box
          sx={{
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            borderRadius: 1.5,
            bgcolor: alpha(iconColor, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon sx={{ fontSize: { xs: 18, sm: 20 }, color: iconColor }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isLoading ? (
            <>
              <Skeleton variant="text" width={50} height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width={90} height={14} />
            </>
          ) : (
            <>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
                  color: 'text.primary',
                  mb: 0.25,
                  letterSpacing: '-0.02em'
                }}
              >
                {value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.688rem', sm: '0.75rem' },
                  fontWeight: 500,
                  lineHeight: 1.3,
                  display: 'block'
                }}
              >
                {label}
              </Typography>
            </>
          )}
        </Box>
      </Stack>
    </Paper>
  );
});

StatCard.displayName = 'StatCard';

/**
 * PageHeader Component
 * 
 * @param {Object} props
 * @param {Object} props.stats - Matching statistics
 * @param {boolean} props.statsLoading - Whether stats are loading
 * @param {Object} props.pagination - Pagination data
 */
const PageHeader = ({ stats, statsLoading, pagination }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Calculate stat values with proper fallbacks and data validation
  // Priority: stats API > pagination > fallback
  const getVerifiedWorkersCount = () => {
    if (statsLoading) return null;
    
    // Primary: Use verified workers from stats API (most accurate)
    if (stats?.totalVerifiedWorkers !== undefined && stats.totalVerifiedWorkers !== null) {
      return stats.totalVerifiedWorkers;
    }
    
    // Secondary: Use totalWorkers from stats (if available)
    if (stats?.totalWorkers !== undefined && stats.totalWorkers !== null) {
      return stats.totalWorkers;
    }
    
    // Tertiary: Use pagination totalResults (current filtered results)
    if (pagination?.totalResults !== undefined && pagination.totalResults !== null) {
      return pagination.totalResults;
    }
    
    // Fallback: Show 0 if no data available
    return 0;
  };

  const getAverageRating = () => {
    if (statsLoading) return null;
    
    // Use stats API average rating if available
    if (stats?.averageRating !== undefined && stats.averageRating !== null) {
      return parseFloat(stats.averageRating).toFixed(1);
    }
    
    // Fallback to default
    return '4.8';
  };

  const getMatchAccuracy = () => {
    if (statsLoading) return null;
    
    // Use calculated match accuracy from stats
    if (stats?.matchAccuracy !== undefined && stats.matchAccuracy !== null) {
      return `${stats.matchAccuracy}%`;
    }
    
    // Calculate from highRatedWorkers and totalVerifiedWorkers
    if (stats?.highRatedWorkers && stats?.totalVerifiedWorkers) {
      const accuracy = Math.round((stats.highRatedWorkers / stats.totalVerifiedWorkers) * 100);
      return `${accuracy}%`;
    }
    
    // Fallback
    return '95%';
  };

  const verifiedWorkersCount = getVerifiedWorkersCount();
  const averageRating = getAverageRating();
  const matchAccuracy = getMatchAccuracy();

  return (
    <Box 
      sx={{ 
        mb: { xs: 2.5, sm: 3, md: 3.5 },
        // Align perfectly with navbar - no top margin
        mt: 0
      }}
    >
      {/* Breadcrumb / Tag - Perfectly Aligned with Navbar */}
      <Chip
        label="Worker Discovery"
        size="small"
        sx={{
          mb: { xs: 1.5, sm: 2 },
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          fontWeight: 600,
          fontSize: { xs: '0.688rem', sm: '0.75rem' },
          height: { xs: 24, sm: 26 },
          borderRadius: '6px',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            borderColor: alpha(theme.palette.primary.main, 0.25),
            transform: 'translateY(-1px)'
          },
          '& .MuiChip-label': {
            px: { xs: 1, sm: 1.25 },
            py: 0
          }
        }}
      />

      {/* Title Section - Compact & Clean */}
      <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            mb: { xs: 0.75, sm: 1 },
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem', lg: '2.75rem' },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: { xs: '-0.01em', sm: '-0.02em' },
            lineHeight: { xs: 1.2, sm: 1.15 },
            maxWidth: { xs: '100%', md: '92%', lg: '88%' }
          }}
        >
          Find Your Perfect Support Worker
        </Typography>

        {/* Subtitle - Compact Design */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.875rem', sm: '0.938rem', md: '1rem' },
            fontWeight: 400,
            lineHeight: { xs: 1.5, sm: 1.6 },
            letterSpacing: '-0.01em',
            maxWidth: { xs: '100%', md: '88%', lg: '85%' }
          }}
        >
          Connect with verified professionals tailored to your unique care requirements
        </Typography>
      </Box>

      {/* Stats Cards - Compact Grid Layout */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.25, sm: 1.5 }}
        sx={{
          '& > *': {
            flex: { xs: 'none', sm: 1 }
          }
        }}
      >
        <StatCard
          icon={Verified}
          value={
            statsLoading 
              ? null 
              : verifiedWorkersCount !== null 
                ? `${verifiedWorkersCount.toLocaleString()}+`
                : '0+'
          }
          label="Verified Workers"
          color="success"
          isLoading={statsLoading}
          theme={theme}
        />
        
        <StatCard
          icon={Star}
          value={statsLoading ? null : `${averageRating}/5`}
          label="Average Rating"
          color="warning"
          isLoading={statsLoading}
          theme={theme}
        />
        
        <StatCard
          icon={TrendingUp}
          value={statsLoading ? null : matchAccuracy}
          label="Match Accuracy"
          color="info"
          isLoading={statsLoading}
          theme={theme}
        />
      </Stack>
    </Box>
  );
};

export default memo(PageHeader);
