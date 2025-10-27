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
  Error
} from "@mui/icons-material";
import AdminSidebar from "../../../components/adminSidebar/AdminSidebar";
import { useNavigate } from "react-router-dom";
import WorkerNavbar from "../../../components/Navbar/WorkerNavbar";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import { format } from "date-fns";

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 4;

// Compact Metric Card Component
const MetricCard = ({ title, value, icon, color = "primary", subtitle, trend }) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${alpha(theme.palette[color].main, 0.15)}`,
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: `0 4px 12px ${alpha(theme.palette[color].main, 0.3)}`
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0.5 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.8 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {trend && (
            <Chip
              icon={trend > 0 ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
              label={`${Math.abs(trend)}%`}
              size="small"
              color={trend > 0 ? 'success' : 'error'}
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette[color].main, mb: 0 }}>
          {value?.toLocaleString() || 0}
        </Typography>
      </CardContent>
    </Card>
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
    <Card sx={{ 
      height: '100%', 
      borderRadius: 3,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
      border: '1px solid rgba(0,0,0,0.06)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <CardContent sx={{ p: 3 }}>
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
      </CardContent>
    </Card>
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
              mt: { xs: 8, md: 3 },
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
  const { overview, recentActivity, systemHealth } = data || {};

  return (
    <>
      <WorkerNavbar />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafbfc' }}>
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
            mt: { xs: 8, md: 3 },
            minHeight: '100vh',
            transition: 'margin-left 0.2s',
          }}
        >
          <Container maxWidth={false} disableGutters sx={{ width: '100%', p: 0, m: 0 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
                    Dashboard
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                    Platform overview and key metrics
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Tooltip title="Refresh Data">
                    <IconButton 
                      onClick={handleRefresh} 
                      sx={{ 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        }
                      }}
                    >
                      <Refresh />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/admin/workers')}
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 2, px: 3, py: 1.5 }}
                  >
                    Manage Workers
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  title="Total Users"
                  value={overview?.totalUsers || 0}
                  icon={<People />}
                  color="primary"
                  subtitle="All registered users"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  title="Active Workers"
                  value={overview?.activeWorkers || 0}
                  icon={<Work />}
                  color="success"
                  subtitle="Active in last 7 days"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  title="Pending References"
                  value={overview?.pendingReferences || 0}
                  icon={<Assignment />}
                  color="warning"
                  subtitle="Awaiting completion"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <MetricCard
                  title="Pending Timesheets"
                  value={overview?.pendingTimesheets || 0}
                  icon={<Schedule />}
                  color="info"
                  subtitle="Awaiting approval"
                />
              </Grid>
            </Grid>

            {/* Main Content Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Recent Activity */}
              <Grid item xs={12} lg={8}>
                <Card sx={{ height: '100%', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
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
                  </CardContent>
                </Card>
              </Grid>

              {/* System Health */}
              <Grid item xs={12} lg={4}>
                <SystemHealthCard systemHealth={systemHealth} />
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
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
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default AdminDashboard;