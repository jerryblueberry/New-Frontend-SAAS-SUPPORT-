/**
 * GrowthChart Component (Premium Redesigned)
 * Elegant, animated, and responsive chart for displaying growth trends.
 */

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from '@mui/icons-material';
import { format } from 'date-fns';

const GrowthChart = ({
  title,
  data = [],
  dataKey = 'count',
  color = 'primary',
  subtitle,
  height = 300,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, isMobile ? 'MMM d' : 'MMM dd');
    } catch {
      return dateString;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            borderRadius: 2,
            p: 1.5,
            backdropFilter: 'blur(6px)',
            boxShadow: `0 4px 10px ${alpha(theme.palette[color].main, 0.15)}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.text.primary }}
          >
            {formatDate(label)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette[color].main, fontWeight: 600 }}
          >
            {payload[0].name}: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Empty data state
  if (!data?.length) {
    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          p: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette[color].main,
            0.07
          )}, ${alpha(theme.palette[color].light, 0.05)})`,
          border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TrendingUp
          sx={{
            color: theme.palette[color].main,
            fontSize: 40,
            mb: 1.5,
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, opacity: 0.8 }}
        >
          No data available
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.paper,
          0.9
        )}, ${alpha(theme.palette[color].light, 0.1)})`,
        boxShadow: `0 6px 18px ${alpha(theme.palette[color].main, 0.15)}`,
        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 10px 22px ${alpha(theme.palette[color].main, 0.25)}`,
        },
      }}
    >
      <CardContent sx={{ position: 'relative', p: { xs: 2.5, sm: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                background: alpha(theme.palette[color].main, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette[color].main,
              }}
            >
              <TrendingUp sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: theme.palette.text.primary,
                }}
              >
                {title}
              </Typography>
              {subtitle && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    opacity: 0.8,
                    fontSize: '0.75rem',
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Chart */}
        <Box
          sx={{
            position: 'relative',
            height,
            borderRadius: 2,
            overflow: 'hidden',
            background: `linear-gradient(180deg, ${alpha(
              theme.palette[color].main,
              0.02
            )}, ${alpha(theme.palette[color].light, 0.03)})`,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: isMobile ? 5 : 25,
                left: isMobile ? -15 : 0,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={theme.palette[color].main}
                    stopOpacity={0.9}
                  />
                  <stop
                    offset="100%"
                    stopColor={theme.palette[color].main}
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={alpha(theme.palette.divider, 0.4)}
              />
              <XAxis
                dataKey="_id"
                tickFormatter={formatDate}
                stroke={theme.palette.text.secondary}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{
                  fill: theme.palette.background.paper,
                  r: isMobile ? 3 : 4,
                  stroke: theme.palette[color].main,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  stroke: theme.palette[color].light,
                  strokeWidth: 3,
                }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
