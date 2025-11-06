/**
 * AnalyticsOverviewCard Component
 * Displays analytics overview with key metrics and visual indicators
 * Production-ready with responsive design
 */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  CheckCircle,
  HourglassEmpty
} from '@mui/icons-material';

const AnalyticsOverviewCard = ({ 
  title,
  icon: Icon,
  color = 'primary',
  data = {},
  metrics = []
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      sx={{ 
        height: '100%',
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette[color].main
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
          opacity: 0.8
        }
      }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          {Icon && (
            <Icon sx={{ color: theme.palette[color].main, fontSize: { xs: 24, sm: 28 } }} />
          )}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.125rem' }
            }}
          >
            {title}
          </Typography>
        </Box>

        <Stack spacing={2.5}>
          {metrics.map((metric, index) => {
            const value = data[metric.key];
            const percentage = metric.max ? ((value / metric.max) * 100) : null;

            return (
              <Box key={index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.813rem', sm: '0.875rem' }
                    }}
                  >
                    {metric.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {metric.showIcon && (
                      <Chip
                        icon={value >= (metric.threshold || 0) ? <CheckCircle /> : <HourglassEmpty />}
                        label={value >= (metric.threshold || 0) ? 'Good' : 'Pending'}
                        size="small"
                        color={value >= (metric.threshold || 0) ? 'success' : 'warning'}
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700, 
                        color: theme.palette[color].main,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      {typeof value === 'number' ? value.toLocaleString() : value || 0}
                      {metric.unit && ` ${metric.unit}`}
                    </Typography>
                  </Box>
                </Box>
                {percentage !== null && (
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(percentage, 100)} 
                    color={color}
                    sx={{ 
                      height: 8, 
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette[color].main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`
                      }
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Stack>
      </Box>
  );
};

export default AnalyticsOverviewCard;

