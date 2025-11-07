import React from "react";
import { Box, Typography, Chip, Stack, LinearProgress, useTheme, alpha } from "@mui/material";
import { People, Storage, Speed, CheckCircle } from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * SystemHealthCard Component
 * Displays real-time system health metrics with progress indicators
 * Optimized with React.memo for performance
 */
const SystemHealthCard = React.memo(({ systemHealth }) => {
  const theme = useTheme();
  
  const healthMetrics = [
    {
      label: 'Active Users',
      sublabel: 'Last 24 hours',
      value: systemHealth?.activeUsers || 0,
      max: 100,
      color: 'success',
      icon: <People sx={{ fontSize: 18 }} />,
      trend: '+12%'
    },
    {
      label: 'Document Usage',
      sublabel: 'Storage efficiency',
      value: Math.round(systemHealth?.documentUsageRate || 0),
      max: 100,
      color: 'info',
      icon: <Storage sx={{ fontSize: 18 }} />,
      trend: '+5%'
    },
    {
      label: 'System Uptime',
      sublabel: 'Current session',
      value: 100,
      max: 100,
      color: 'success',
      icon: <Speed sx={{ fontSize: 18 }} />,
      trend: '99.9%'
    }
  ];

  return (
    <Box sx={{ 
      height: '100%',
      background: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      p: { xs: 2, sm: 2.5 },
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: theme.palette.success.main
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
        opacity: 0.8
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            System Health
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8 }}>
            Real-time monitoring
          </Typography>
        </Box>
        <Chip 
          label="Live" 
          color="success" 
          size="small" 
          sx={{ 
            fontSize: '0.75rem',
            fontWeight: 600,
            px: 1,
            height: 24,
            backgroundColor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main,
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
          }}
        />
      </Box>
      
      <Stack spacing={3}>
        {healthMetrics.map((metric, index) => (
          <Box key={index}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              mb: 1.5,
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette[metric.color].main, 0.04),
              border: `1px solid ${alpha(theme.palette[metric.color].main, 0.1)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette[metric.color].main, 0.08),
                transform: 'translateY(-1px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    backgroundColor: alpha(theme.palette[metric.color].main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.palette[metric.color].main,
                    border: `1px solid ${alpha(theme.palette[metric.color].main, 0.2)}`
                  }}
                >
                  {metric.icon}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                    {metric.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                    {metric.sublabel}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  color: theme.palette[metric.color].main,
                  mb: 0.25
                }}>
                  {metric.label === 'System Uptime' 
                    ? `${Math.round((systemHealth?.uptime || 0) / 3600)}h` 
                    : `${metric.value}%`
                  }
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: theme.palette[metric.color].main,
                  fontWeight: 500,
                  opacity: 0.8
                }}>
                  {metric.trend}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ px: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={metric.value} 
                color={metric.color}
                sx={{ 
                  height: 4, 
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette[metric.color].main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${theme.palette[metric.color].main}, ${theme.palette[metric.color].dark})`
                  }
                }}
              />
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Status Summary */}
      <Box sx={{ 
        mt: 3, 
        p: 2, 
        borderRadius: 2, 
        backgroundColor: alpha(theme.palette.success.main, 0.05),
        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
              All Systems Operational
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8 }}>
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => {
  return prevProps.systemHealth?.timestamp === nextProps.systemHealth?.timestamp;
});

SystemHealthCard.displayName = 'SystemHealthCard';

SystemHealthCard.propTypes = {
  systemHealth: PropTypes.shape({
    activeUsers: PropTypes.number,
    documentUsageRate: PropTypes.number,
    uptime: PropTypes.number,
    timestamp: PropTypes.string
  })
};

export default SystemHealthCard;

