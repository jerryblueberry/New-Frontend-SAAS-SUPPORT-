import React from "react";
import { Box, Typography, Chip, useTheme, useMediaQuery, alpha } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * MetricCard Component
 * Displays a key metric with icon, title, value, and optional trend indicator
 * Optimized with React.memo for performance
 */
const MetricCard = React.memo(({ title, value, icon, color = "primary", subtitle, trend }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Box 
      sx={{ 
        height: { xs: 105, sm: 115, md: 120 },
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: { xs: 1.5, sm: 2 },
        p: { xs: 1.5, sm: 2 },
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': {
          borderColor: theme.palette[color].main,
          '&::before': {
            opacity: 1
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
          opacity: 0.8,
          transition: 'opacity 0.2s ease'
        }
      }}
    >
      {/* Top Row: Icon, Title & Trend */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.25 }, flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: { xs: 1.25, sm: 1.5 },
              background: alpha(theme.palette[color].main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette[color].main,
              flexShrink: 0
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: { xs: 20, sm: 22 } } })}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.primary', 
                fontWeight: 600,
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                lineHeight: 1.3,
                mb: subtitle ? 0.25 : 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary', 
                  opacity: 0.75,
                  fontSize: { xs: '0.688rem', sm: '0.75rem' },
                  lineHeight: 1.2,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        {trend !== undefined && trend !== null && (
          <Chip
            icon={trend > 0 ? <TrendingUp sx={{ fontSize: 11 }} /> : <TrendingDown sx={{ fontSize: 11 }} />}
            label={`${Math.abs(trend)}%`}
            size="small"
            color={trend > 0 ? 'success' : 'error'}
            variant="outlined"
            sx={{ 
              fontSize: '0.688rem',
              height: 18,
              borderRadius: 0.75,
              flexShrink: 0,
              '& .MuiChip-label': {
                px: 0.625,
                py: 0
              },
              '& .MuiChip-icon': {
                ml: 0.5,
                mr: -0.25
              }
            }}
          />
        )}
      </Box>

      {/* Value - Large and Bold */}
      <Box>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            lineHeight: 1,
            letterSpacing: '-0.03em'
          }}
        >
          {value?.toLocaleString() || 0}
        </Typography>
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization optimization
  return prevProps.value === nextProps.value && 
         prevProps.trend === nextProps.trend &&
         prevProps.title === nextProps.title &&
         prevProps.subtitle === nextProps.subtitle;
});

MetricCard.displayName = 'MetricCard';

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number,
  icon: PropTypes.element.isRequired,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  subtitle: PropTypes.string,
  trend: PropTypes.number
};

export default MetricCard;

