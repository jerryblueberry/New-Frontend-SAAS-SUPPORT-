/**
 * TopItemsChart Component
 * Displays top items (categories, regions, skills, etc.) using horizontal bar chart
 * Production-ready with responsive design
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { TrendingUp } from '@mui/icons-material';

const TopItemsChart = ({ 
  title, 
  data = [], 
  dataKey = 'count',
  nameKey = '_id',
  color = 'primary',
  subtitle,
  height = 300,
  maxItems = 10
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Format labels - replace underscores and capitalize
  const formatLabel = (label) => {
    if (!label) return '';
    return label
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
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
            {formatLabel(data.payload[nameKey])}
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette[color].main, fontWeight: 600 }}>
            Count: {data.value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Limit data to maxItems
  const displayData = data.slice(0, maxItems).reverse(); // Reverse for better visual order

  if (!displayData || displayData.length === 0) {
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

  const maxValue = Math.max(...displayData.map(item => item[dataKey] || 0));

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
          <TrendingUp sx={{ color: `${color}.main`, fontSize: { xs: 24, sm: 28 } }} />
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.125rem' }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={displayData}
            layout="vertical"
            margin={{
              top: 5,
              right: isMobile ? 10 : 30,
              left: isMobile ? 80 : 120,
              bottom: 5
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={alpha(theme.palette.divider, 0.5)}
            />
            <XAxis
              type="number"
              tick={{ fontSize: isMobile ? 10 : 12 }}
              stroke={theme.palette.text.secondary}
            />
            <YAxis
              type="category"
              dataKey={nameKey}
              tick={{ fontSize: isMobile ? 10 : 12 }}
              tickFormatter={formatLabel}
              width={isMobile ? 75 : 115}
              stroke={theme.palette.text.secondary}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={dataKey}
              radius={[0, 8, 8, 0]}
              animationDuration={800}
            >
              {displayData.map((entry, index) => {
                const intensity = entry[dataKey] / maxValue;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={alpha(theme.palette[color].main, 0.6 + intensity * 0.4)}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
  );
};

export default TopItemsChart;

