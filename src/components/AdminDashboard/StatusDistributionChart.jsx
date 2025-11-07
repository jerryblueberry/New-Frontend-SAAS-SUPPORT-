/**
 * StatusDistributionChart Component
 * Displays status breakdown using Donut/Pie chart
 * Production-ready with responsive design
 */
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Assessment } from '@mui/icons-material';

const StatusDistributionChart = ({ 
  title, 
  data = {}, 
  colorScheme = 'default',
  subtitle,
  height = 300,
  enhanced = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isLarge = useMediaQuery(theme.breakpoints.up('xl'));

  // Convert object to array format for chart
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Enhanced color palette based on status with gradients
  const getStatusColor = (index, name) => {
    const colors = {
      default: [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.info.main
      ],
      status: {
        draft: theme.palette.grey[500],
        submitted: theme.palette.warning.main,
        verified: theme.palette.success.main,
        active: theme.palette.primary.main,
        completed: theme.palette.success.main,
        pending: theme.palette.warning.main,
        unverified: theme.palette.error.main
      }
    };

    if (colorScheme === 'status') {
      return colors.status[name.toLowerCase()] || colors.default[index % colors.default.length];
    }
    return colors.default[index % colors.default.length];
  };

  // Get status icon based on name
  const getStatusIcon = (name) => {
    const statusIcons = {
      'Draft': '📝',
      'Submitted': '📤',
      'Verified': '✅',
      'Active': '🟢',
      'Completed': '✔️',
      'Pending': '⏳',
      'Unverified': '⚠️'
    };
    return statusIcons[name] || '📊';
  };

  // Custom label function
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Hide labels for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={isMobile ? 10 : 12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
            {data.name}
          </Typography>
          <Typography variant="body2" sx={{ color: data.payload.fill }}>
            Count: {data.value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0 || chartData.every(item => item.value === 0)) {
    return (
      <Card 
        sx={{ 
          height: '100%', 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Assessment sx={{ color: 'primary.main', fontSize: 28 }} />
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

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box 
      sx={{ 
        height: '100%',
        background: enhanced 
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
          : theme.palette.background.paper,
        border: enhanced 
          ? `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
          : `1px solid ${theme.palette.divider}`,
        borderRadius: enhanced ? 3 : 2,
        p: { xs: 2, sm: 2.5, md: enhanced ? 3 : 2.5, lg: enhanced ? 3.5 : 2.5 },
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: enhanced 
          ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}, 0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`
          : 'none',
        '&:hover': {
          borderColor: enhanced ? theme.palette.primary.main : theme.palette.primary.main,
          transform: enhanced ? 'translateY(-2px)' : 'none',
          boxShadow: enhanced 
            ? `0 8px 30px ${alpha(theme.palette.primary.main, 0.25)}, 0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
            : 'none'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: enhanced ? 4 : 2,
          background: enhanced
            ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`
            : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          opacity: enhanced ? 1 : 0.8
        },
        '&::after': enhanced ? {
          content: '""',
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          pointerEvents: 'none'
        } : {}
      }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: enhanced ? 4 : 3 }}>
          <Box
            sx={{
              width: enhanced ? { xs: 48, sm: 56, lg: 64 } : { xs: 40, sm: 44 },
              height: enhanced ? { xs: 48, sm: 56, lg: 64 } : { xs: 40, sm: 44 },
              borderRadius: 2,
              background: enhanced
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.15)})`
                : alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: enhanced ? `2px solid ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
              boxShadow: enhanced ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}` : 'none'
            }}
          >
            <Assessment sx={{ 
              color: 'primary.main', 
              fontSize: enhanced ? { xs: 28, sm: 32, lg: 36 } : { xs: 24, sm: 28 } 
            }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant={enhanced ? "h5" : "h6"} 
              sx={{ 
                fontWeight: enhanced ? 700 : 600,
                fontSize: enhanced 
                  ? { xs: '1.25rem', sm: '1.5rem', lg: '1.75rem' }
                  : { xs: '1rem', sm: '1.125rem' },
                background: enhanced 
                  ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  : 'none',
                backgroundClip: enhanced ? 'text' : 'none',
                WebkitBackgroundClip: enhanced ? 'text' : 'none',
                WebkitTextFillColor: enhanced ? 'transparent' : 'inherit',
                mb: enhanced ? 0.5 : 0
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: enhanced 
                    ? { xs: '0.813rem', sm: '0.875rem', lg: '0.9375rem' }
                    : { xs: '0.7rem', sm: '0.75rem' },
                  fontWeight: enhanced ? 500 : 400
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: enhanced ? 'row' : 'row' }, 
          gap: enhanced ? { xs: 3, md: 4, lg: 5 } : 3,
          alignItems: 'center'
        }}>
          {/* Chart */}
          <Box sx={{ 
            flex: { xs: '1 1 auto', md: enhanced ? '1 1 55%' : '1 1 60%' },
            width: '100%',
            position: 'relative'
          }}>
            <ResponsiveContainer width="100%" height={height}>
              <PieChart>
                <defs>
                  {chartData.map((entry, index) => {
                    const color = getStatusColor(index, entry.name);
                    return (
                      <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={1} />
                        <stop offset="100%" stopColor={color} stopOpacity={enhanced ? 0.7 : 0.8} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={enhanced 
                    ? (isMobile ? 80 : isTablet ? 110 : isLarge ? 140 : 120)
                    : (isMobile ? 70 : 90)
                  }
                  innerRadius={enhanced
                    ? (isMobile ? 45 : isTablet ? 60 : isLarge ? 80 : 70)
                    : (isMobile ? 40 : 50)
                  }
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={enhanced ? 1200 : 800}
                  animationBegin={0}
                  paddingAngle={enhanced ? 2 : 0}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={enhanced ? `url(#gradient-${index})` : getStatusColor(index, entry.name)}
                      stroke={enhanced ? alpha(getStatusColor(index, entry.name), 0.3) : 'none'}
                      strokeWidth={enhanced ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Enhanced Legend */}
          <Box sx={{ 
            flex: { xs: '1 1 auto', md: enhanced ? '1 1 45%' : '1 1 40%' },
            width: '100%'
          }}>
            <Stack spacing={enhanced ? { xs: 1.5, md: 2 } : 1.5} sx={{ justifyContent: 'center', height: '100%' }}>
              {chartData.map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                const statusColor = getStatusColor(index, item.name);
                return (
                  <Box
                    key={item.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: enhanced ? { xs: 1.75, md: 2, lg: 2.25 } : 1.5,
                      borderRadius: enhanced ? 2.5 : 2,
                      background: enhanced
                        ? `linear-gradient(135deg, ${alpha(statusColor, 0.12)}, ${alpha(statusColor, 0.06)})`
                        : alpha(statusColor, 0.1),
                      border: enhanced
                        ? `2px solid ${alpha(statusColor, 0.3)}`
                        : `1px solid ${alpha(statusColor, 0.2)}`,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: enhanced 
                        ? `0 2px 8px ${alpha(statusColor, 0.15)}`
                        : 'none',
                      '&:hover': {
                        backgroundColor: enhanced
                          ? `linear-gradient(135deg, ${alpha(statusColor, 0.2)}, ${alpha(statusColor, 0.12)})`
                          : alpha(statusColor, 0.15),
                        transform: enhanced ? 'translateX(8px) scale(1.02)' : 'translateX(4px)',
                        boxShadow: enhanced
                          ? `0 4px 16px ${alpha(statusColor, 0.25)}`
                          : 'none',
                        borderColor: enhanced ? statusColor : alpha(statusColor, 0.4)
                      },
                      '&::before': enhanced ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: `linear-gradient(180deg, ${statusColor}, ${alpha(statusColor, 0.6)})`,
                        borderRadius: '2.5px 0 0 2.5px'
                      } : {}
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: enhanced ? { xs: 1.5, md: 2 } : 1.5, flex: 1 }}>
                      <Box
                        sx={{
                          width: enhanced ? { xs: 16, md: 18, lg: 20 } : 12,
                          height: enhanced ? { xs: 16, md: 18, lg: 20 } : 12,
                          borderRadius: '50%',
                          background: enhanced
                            ? `radial-gradient(circle, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`
                            : statusColor,
                          border: enhanced ? `2px solid ${alpha(statusColor, 0.3)}` : 'none',
                          boxShadow: enhanced 
                            ? `0 2px 8px ${alpha(statusColor, 0.4)}, inset 0 1px 2px ${alpha('#fff', 0.3)}`
                            : 'none',
                          flexShrink: 0
                        }}
                      />
                      {enhanced && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: { xs: '1.1rem', md: '1.25rem' },
                            lineHeight: 1
                          }}
                        >
                          {getStatusIcon(item.name)}
                        </Typography>
                      )}
                      <Typography 
                        variant={enhanced ? "body1" : "body2"} 
                        sx={{ 
                          fontWeight: enhanced ? 600 : 500,
                          fontSize: enhanced 
                            ? { xs: '0.875rem', md: '0.9375rem', lg: '1rem' }
                            : '0.875rem',
                          color: 'text.primary'
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', ml: 2 }}>
                      <Typography 
                        variant={enhanced ? "h6" : "body2"} 
                        sx={{ 
                          fontWeight: enhanced ? 700 : 700,
                          fontSize: enhanced
                            ? { xs: '1.125rem', md: '1.25rem', lg: '1.5rem' }
                            : '0.875rem',
                          color: statusColor,
                          mb: enhanced ? 0.25 : 0
                        }}
                      >
                        {item.value.toLocaleString()}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontSize: enhanced
                            ? { xs: '0.75rem', md: '0.813rem', lg: '0.875rem' }
                            : '0.75rem',
                          fontWeight: enhanced ? 600 : 400,
                          display: 'block'
                        }}
                      >
                        {percentage}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>
      </Box>
  );
};

export default StatusDistributionChart;

