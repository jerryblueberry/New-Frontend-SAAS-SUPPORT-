/**
 * GrowthChart Component
 * Displays growth trends over time (users, workers, clients, etc.)
 * Production-ready with responsive design and smooth animations
 */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp } from '@mui/icons-material';
import { format } from 'date-fns';

const GrowthChart = ({ 
  title, 
  data = [], 
  dataKey = 'count', 
  color = 'primary',
  subtitle,
  height = 300 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Format date labels for better readability
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, isMobile ? 'MMM d' : 'MMM dd');
    } catch {
      return dateString;
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            borderRadius: 2,
            p: 1.5,
            boxShadow: theme.shadows[4]
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {formatDate(label)}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette[color].main, fontWeight: 600 }}>
            Count: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.08)} 0%, ${alpha(theme.palette[color].main, 0.03)} 100%)`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <TrendingUp sx={{ color: theme.palette[color].main, fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No data available
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                borderRadius: 1.5,
                background: alpha(theme.palette[color].main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette[color].main
              }}
            >
              <TrendingUp sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </Box>
            <Box>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  lineHeight: 1.3
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.688rem', sm: '0.75rem' },
                    opacity: 0.8
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: isMobile ? 5 : 20,
              left: isMobile ? -20 : 0,
              bottom: isMobile ? 5 : 20
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={alpha(theme.palette.divider, 0.5)}
            />
            <XAxis
              dataKey="_id"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={formatDate}
              stroke={theme.palette.text.secondary}
            />
            <YAxis
              tick={{ fontSize: isMobile ? 10 : 12 }}
              stroke={theme.palette.text.secondary}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={theme.palette[color].main}
              strokeWidth={3}
              dot={{ 
                fill: theme.palette[color].main, 
                r: isMobile ? 3 : 4,
                strokeWidth: 2,
                stroke: theme.palette.background.paper
              }}
              activeDot={{ 
                r: isMobile ? 5 : 6,
                strokeWidth: 2,
                stroke: theme.palette.background.paper
              }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
  );
};

export default GrowthChart;

