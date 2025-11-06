import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  LinearProgress,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import {
  People,
  Work,
  Assignment,
  Schedule,
  TrendingUp,
  TrendingDown,
  Refresh,
  Assessment,
  Storage,
  Speed,
  MoreVert,
  ArrowForward,
  CheckCircle,
  Pending,
  Error,
  Business,
  Person
} from "@mui/icons-material";
import AdminSidebar from "../../../components/adminSidebar/AdminSidebar";
import { useNavigate } from "react-router-dom";
import WorkerNavbar from "../../../components/Navbar/WorkerNavbar";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import { format } from "date-fns";
import GrowthChart from "../../../components/AdminDashboard/GrowthChart";
import StatusDistributionChart from "../../../components/AdminDashboard/StatusDistributionChart";
import TopItemsChart from "../../../components/AdminDashboard/TopItemsChart";
import AnalyticsOverviewCard from "../../../components/AdminDashboard/AnalyticsOverviewCard";
import InsightsCard from "../../../components/AdminDashboard/InsightsCard";

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 4;

// Compact Production-Ready Metric Card
const MetricCard = ({ title, value, icon, color = "primary", subtitle, trend }) => {
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
        {trend && (
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
};

// Compact Activity Item Component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type, action) => {
    switch (type) {
      case 'Timesheet':
        return <Schedule sx={{ fontSize: 16 }} />;
      case 'ProgressNote':
        return <Assignment sx={{ fontSize: 16 }} />;
      default:
        return <Assessment sx={{ fontSize: 16 }} />;
    }
  };

  const getActivityColor = (action) => {
    switch (action) {
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'submitted':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      py: 1.5,
      px: 2,
      borderRadius: 2,
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: alpha('#000', 0.02)
      }
    }}>
      <Avatar sx={{ 
        bgcolor: alpha('#000', 0.08), 
        width: 32, 
        height: 32,
        color: 'text.secondary'
      }}>
        {getActivityIcon(activity.type, activity.action)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, lineHeight: 1.3 }}>
          {activity.description}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          {activity.createdBy?.firstName} {activity.createdBy?.lastName} • {format(new Date(activity.createdAt), 'MMM dd, HH:mm')}
        </Typography>
      </Box>
      <Chip
        label={activity.action}
        size="small"
        color={getActivityColor(activity.action)}
        variant="outlined"
        sx={{ fontSize: '0.7rem', height: 24 }}
      />
    </Box>
  );
};

// System Health Component
const SystemHealthCard = ({ systemHealth }) => {
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
                    {metric.label === 'System Uptime' ? `${Math.round((systemHealth?.uptime || 0) / 3600)}h` : `${metric.value}%`}
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
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard-overview', refreshKey],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard/overview');
      return response.data;
    },
    refetchInterval: 30000,
    retry: 3,
    staleTime: 10000,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  if (isLoading) {
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafbfc' }}>
          <Box sx={{
            width: { xs: '0px', md: `${SIDEBAR_WIDTH}px` },
            flexShrink: 0,
            zIndex: 1200,
            position: 'fixed',
            top: { xs: 56, md: 64 },
            left: 0,
            height: `calc(100vh - 64px)`
          }}>
            <AdminSidebar topOffset={64} navigate={navigate} />
          </Box>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              ml: { md: `${SIDEBAR_WIDTH + SIDEBAR_GAP}px`, xs: 0 },
              p: { xs: 2, sm: 3, md: 4 },
              mt: { xs: 8, md: 3 },
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
                Loading dashboard...
              </Typography>
            </Box>
          </Box>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafbfc' }}>
          <Box sx={{
            width: { xs: '0px', md: `${SIDEBAR_WIDTH}px` },
            flexShrink: 0,
            zIndex: 1200,
            position: 'fixed',
            top: { xs: 56, md: 64 },
            left: 0,
            height: `calc(100vh - 64px)`
          }}>
            <AdminSidebar topOffset={64} navigate={navigate} />
          </Box>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              ml: { md: `${SIDEBAR_WIDTH + SIDEBAR_GAP}px`, xs: 0 },
              p: { xs: 2, sm: 3, md: 4 },
              mt: { xs: 8, md: 8 },
              minHeight: '100vh',
            }}
          >
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Failed to load dashboard</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {error?.response?.data?.message || error?.message || 'An unexpected error occurred'}
              </Typography>
              <Button onClick={handleRefresh} sx={{ mt: 2 }} variant="outlined" startIcon={<Refresh />}>
                Retry
              </Button>
            </Alert>
          </Box>
        </Box>
      </>
    );
  }

  const { data } = dashboardData || {};
  const { 
    overview, 
    userAnalytics,
    workerAnalytics,
    clientAnalytics, 
    referenceAnalytics,
    notificationAnalytics,
    engagementMetrics,
    insights,
    recentActivity, 
    systemHealth,
    meta
  } = data || {};

  return (
    <>
      <WorkerNavbar />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Sidebar */}
        <Box sx={{
          width: { xs: '0px', md: `${SIDEBAR_WIDTH}px` },
          flexShrink: 0,
          zIndex: 1200,
          position: 'fixed',
          top: { xs: 56, md: 64 },
          left: 0,
          height: `calc(100vh - 64px)`
        }}>
          <AdminSidebar topOffset={64} navigate={navigate} />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            ml: { md: `${SIDEBAR_WIDTH + SIDEBAR_GAP}px`, xs: 0 },
            p: { xs: 2, sm: 3, md: 4 },
            mt: { xs: 8, md: 8 },
            minHeight: '100vh',
            transition: 'margin-left 0.2s',
          }}
        >
          <Container maxWidth={false} disableGutters sx={{ width: '100%', p: 0, m: 0 }}>
            {/* Header */}
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
                  {/* Refresh Button - Icon only on mobile, with tooltip */}
                  <Tooltip title="Refresh Data" arrow placement="top">
                    <IconButton 
                      onClick={handleRefresh} 
                      size="medium"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        width: { xs: '100%', sm: 'auto' },
                        height: { xs: 40, sm: 40, md: 44 },
                        borderRadius: { xs: 2, sm: 1 },
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          // transform: 'rotate(90deg)',
                          // transition: 'transform 0.3s ease'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Refresh sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
                    </IconButton>
                  </Tooltip>

                  {/* Manage Workers Button */}
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin/workers')}
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
                    onClick={() => navigate('/admin/clients')}
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

            {/* Key Metrics - Ultra Compact Production Grid */}
            <Grid 
              container 
              spacing={{ xs: 1, sm: 1.5, md: 2 }} 
              sx={{ 
                mb: { xs: 2, sm: 2.5, md: 3 }
              }}
            >
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <MetricCard
                  title="Total Users"
                  value={overview?.totalUsers || 0}
                  icon={<People />}
                  color="primary"
                  subtitle="Registered"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <MetricCard
                  title="Workers"
                  value={overview?.activeWorkers || 0}
                  icon={<Work />}
                  color="success"
                  subtitle="Active now"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <MetricCard
                  title="Total Clients"
                  value={overview?.totalClients || 0}
                  icon={<Business />}
                  color="secondary"
                  subtitle="Profiles"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <MetricCard
                  title="Clients"
                  value={overview?.activeClients || 0}
                  icon={<Person />}
                  color="info"
                  subtitle="Verified"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <MetricCard
                  title="References"
                  value={overview?.pendingReferences || 0}
                  icon={<Assignment />}
                  color="warning"
                  subtitle="Pending"
                />
              </Grid>
              <Grid item xs={6} sm={4} md={4} lg={2}>
                <MetricCard
                  title="Timesheets"
                  value={overview?.pendingTimesheets || 0}
                  icon={<Schedule />}
                  color="error"
                  subtitle="To approve"
                />
              </Grid>
            </Grid>

            {/* Insights Section - Strategic recommendations */}
            {insights && (insights.insights?.length > 0 || insights.summary) && (
              <Box sx={{ mb: 3 }}>
                <InsightsCard insights={insights} loading={isLoading} />
              </Box>
            )}

            {/* Growth Charts Section */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3 }}>
              {/* User Growth Chart */}
              <Grid item xs={12} lg={4}>
                <GrowthChart
                  title="User Growth"
                  data={userAnalytics?.userGrowth || []}
                  color="primary"
                  subtitle="New users over time"
                  height={isMobile ? 250 : 300}
                />
              </Grid>
              
              {/* Worker Growth Chart */}
              <Grid item xs={12} lg={4}>
                <GrowthChart
                  title="Worker Growth"
                  data={workerAnalytics?.workerGrowth || []}
                  color="success"
                  subtitle="New workers over time"
                  height={isMobile ? 250 : 300}
                />
              </Grid>
              
              {/* Client Growth Chart */}
              <Grid item xs={12} lg={4}>
                <GrowthChart
                  title="Client Growth"
                  data={clientAnalytics?.clientGrowth || []}
                  color="secondary"
                  subtitle="New clients over time"
                  height={isMobile ? 250 : 300}
                />
              </Grid>
            </Grid>

            {/* Client Analytics Section */}
            {clientAnalytics && (
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3, mt:15 }}>
                {/* Client Status Distribution Chart */}
                <Grid item xs={12} lg={6}>
                  <StatusDistributionChart
                    title="Client Status Distribution"
                    data={clientAnalytics.clientsByStatus || {}}
                    colorScheme="status"
                    subtitle="Breakdown by verification status"
                    height={isMobile ? 280 : 320}
                  />
                </Grid>

                {/* Client Onboarding Progress */}
                <Grid item xs={12} lg={6}>
                  <AnalyticsOverviewCard
                    title="Client Onboarding"
                    icon={Assessment}
                    color="info"
                    data={clientAnalytics}
                    metrics={[
                      {
                        key: 'onboardingCompletionRate',
                        label: 'Completion Rate',
                        max: 100,
                        unit: '%'
                      },
                      {
                        key: 'averageOnboardingProgress',
                        label: 'Average Progress',
                        max: 100,
                        unit: '%'
                      },
                      {
                        key: 'pendingVerification',
                        label: 'Pending Verification',
                        showIcon: true,
                        threshold: 0
                      }
                    ]}
                  />
                </Grid>
              </Grid>
            )}

            {/* Top Items Charts Section */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3,mt:15 }}>
              {/* Top Support Categories */}
              {clientAnalytics?.topSupportCategories && clientAnalytics.topSupportCategories.length > 0 && (
                <Grid item xs={12} lg={6}>
                  <TopItemsChart
                    title="Top Support Categories"
                    data={clientAnalytics.topSupportCategories}
                    color="secondary"
                    subtitle="Most requested support types"
                    height={isMobile ? 280 : 320}
                    maxItems={8}
                  />
                </Grid>
              )}

              {/* Top Service Regions */}
              {clientAnalytics?.topServiceRegions && clientAnalytics.topServiceRegions.length > 0 && (
                <Grid item xs={12} lg={6}>
                  <TopItemsChart
                    title="Top Service Regions"
                    data={clientAnalytics.topServiceRegions}
                    color="info"
                    subtitle="Most requested locations"
                    height={isMobile ? 280 : 320}
                    maxItems={8}
                  />
                </Grid>
              )}
            </Grid>

            {/* Worker Skills Chart */}
            {workerAnalytics?.topSkills && workerAnalytics.topSkills.length > 0 && (
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3,mt:15 }}>
                <Grid item xs={12}>
                  <TopItemsChart
                    title="Top Worker Skills"
                    data={workerAnalytics.topSkills}
                    color="success"
                    subtitle="Most common skills among workers"
                    height={isMobile ? 250 : 280}
                    maxItems={10}
                  />
                </Grid>
              </Grid>
            )}

            {/* Reference Analytics */}
            {referenceAnalytics && (
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3,mt:15 }}>
                <Grid item xs={12} lg={6}>
                  <StatusDistributionChart
                    title="Reference Status"
                    data={referenceAnalytics.referencesByStatus || {}}
                    colorScheme="status"
                    subtitle="Reference check status breakdown"
                    height={isMobile ? 280 : 320}
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <AnalyticsOverviewCard
                    title="Reference Analytics"
                    icon={Assignment}
                    color="warning"
                    data={referenceAnalytics}
                    metrics={[
                      {
                        key: 'completionRate',
                        label: 'Completion Rate',
                        max: 100,
                        unit: '%'
                      },
                      {
                        key: 'averageCompletionTime',
                        label: 'Avg Completion Time',
                        unit: ' days'
                      },
                      {
                        key: 'pendingReferences',
                        label: 'Pending References',
                        showIcon: true,
                        threshold: 0
                      }
                    ]}
                  />
                </Grid>
              </Grid>
            )}

            {/* Notification Analytics */}
            {notificationAnalytics && (
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3,mt:15 }}>
                <Grid item xs={12} lg={6}>
                  <StatusDistributionChart
                    title="Notification Types"
                    data={notificationAnalytics.notificationsByType || {}}
                    colorScheme="default"
                    subtitle="Breakdown by notification type"
                    height={isMobile ? 280 : 320}
                  />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <AnalyticsOverviewCard
                    title="Notification Analytics"
                    icon={Assessment}
                    color="info"
                    data={notificationAnalytics}
                    metrics={[
                      {
                        key: 'readRate',
                        label: 'Read Rate',
                        max: 100,
                        unit: '%'
                      },
                      {
                        key: 'unreadCount',
                        label: 'Unread Notifications',
                        showIcon: true,
                        threshold: 0
                      },
                      {
                        key: 'totalNotifications',
                        label: 'Total Notifications',
                        unit: ''
                      }
                    ]}
                  />
                </Grid>
              </Grid>
            )}

            {/* Main Content Row */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 3,mt:15 }}>
              {/* Recent Activity */}
              <Grid item xs={12} lg={8}>
                <Box sx={{ 
                  height: '100%',
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: { xs: 2, sm: 2.5 },
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    opacity: 0.8
                  }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Recent Activity
                      </Typography>
                      <Chip label="Live" color="success" size="small" sx={{ fontSize: '0.75rem' }} />
                    </Box>
                    
                    <Box sx={{ height: '400px', overflow: 'auto' }}>
                      {recentActivity?.length > 0 ? (
                        recentActivity.map((activity, index) => (
                          <ActivityItem key={index} activity={activity} />
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <Assessment sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                            No recent activity
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.8 }}>
                            Activities will appear here as users interact with the system
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
              </Grid>

              {/* System Health */}
              <Grid item xs={12} lg={4}>
                <SystemHealthCard systemHealth={systemHealth} />
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Box sx={{ 
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              mt:15,
              p: { xs: 2, sm: 2.5 },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                opacity: 0.8
              }
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<People />}
                      onClick={() => navigate('/admin/workers')}
                      sx={{ py: 2, borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                    >
                      Manage Workers
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Assignment />}
                      onClick={() => navigate('/admin/all-references')}
                      sx={{ py: 2, borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                    >
                      View References
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Schedule />}
                      onClick={() => navigate('/time-sheets')}
                      sx={{ py: 2, borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                    >
                      Review Timesheets
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<Storage />}
                      onClick={() => navigate('/admin/cleanup-documents')}
                      sx={{ py: 2, borderRadius: 2, textTransform: 'none', fontWeight: 500 }}
                    >
                      Manage Documents
                    </Button>
                  </Grid>
                </Grid>
              </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default AdminDashboard;