import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useReferenceStats } from '../../hooks/useReferences';

// Stat card component
const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[2],
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette[color].main, 0.1),
              color: theme.palette[color].main
            }}
          >
            <Icon />
          </Box>
          {trend && (
            <Chip
              size="small"
              label={trend}
              color={trend.startsWith('+') ? 'success' : trend.startsWith('-') ? 'error' : 'default'}
              variant="outlined"
            />
          )}
        </Stack>
        
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

// Status distribution component
const StatusDistribution = ({ statusCounts, totalReferences }) => {
  const theme = useTheme();
  
  const statusConfig = {
    Pending: { color: 'warning', label: 'Pending' },
    EmailSent: { color: 'info', label: 'Email Sent' },
    Viewed: { color: 'primary', label: 'Viewed' },
    InProgress: { color: 'secondary', label: 'In Progress' },
    Completed: { color: 'success', label: 'Completed' },
    Rejected: { color: 'error', label: 'Rejected' },
    Expired: { color: 'default', label: 'Expired' },
    Bounced: { color: 'error', label: 'Bounced' }
  };

  if (!statusCounts || statusCounts.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" gutterBottom>
          Status Distribution
        </Typography>
        <Typography color="text.secondary">
          No data available
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="h6" gutterBottom>
        Status Distribution
      </Typography>
      
      <Stack spacing={2}>
        {statusCounts.map((status) => {
          const config = statusConfig[status.status] || { color: 'default', label: status.status };
          const percentage = totalReferences > 0 ? (status.count / totalReferences) * 100 : 0;
          
          return (
            <Box key={status.status}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip
                    size="small"
                    label={config.label}
                    color={config.color}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {status.count} references
                  </Typography>
                </Stack>
                <Typography variant="body2" fontWeight={600}>
                  {percentage.toFixed(1)}%
                </Typography>
              </Stack>
              
              <LinearProgress
                variant="determinate"
                value={percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette[config.color].main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: theme.palette[config.color].main
                  }
                }}
              />
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

// Email performance component
const EmailPerformance = ({ emailStats }) => {
  const theme = useTheme();
  
  if (!emailStats) {
    return (
      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" gutterBottom>
          Email Performance
        </Typography>
        <Typography color="text.secondary">
          No email data available
        </Typography>
      </Paper>
    );
  }

  const { totalEmailsSent, totalOpened, totalClicked, totalBounced } = emailStats;
  
  const openRate = totalEmailsSent > 0 ? (totalOpened / totalEmailsSent) * 100 : 0;
  const clickRate = totalEmailsSent > 0 ? (totalClicked / totalEmailsSent) * 100 : 0;
  const bounceRate = totalEmailsSent > 0 ? (totalBounced / totalEmailsSent) * 100 : 0;

  return (
    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
      <Typography variant="h6" gutterBottom>
        Email Performance
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {totalEmailsSent}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Sent
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" fontWeight={700} color="success.main">
              {openRate.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Open Rate
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" fontWeight={700} color="info.main">
              {clickRate.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click Rate
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" fontWeight={700} color="error.main">
              {bounceRate.toFixed(1)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bounce Rate
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Stack spacing={2} sx={{ mt: 3 }}>
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <VisibilityIcon fontSize="small" color="success" />
              <Typography variant="body2">Opened</Typography>
            </Stack>
            <Typography variant="body2" fontWeight={600}>
              {totalOpened} emails
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={openRate}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.success.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: theme.palette.success.main
              }
            }}
          />
        </Box>
        
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SendIcon fontSize="small" color="info" />
              <Typography variant="body2">Clicked</Typography>
            </Stack>
            <Typography variant="body2" fontWeight={600}>
              {totalClicked} emails
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={clickRate}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: theme.palette.info.main
              }
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};

// Main ReferenceStats component
const ReferenceStats = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { data: stats, isLoading, error } = useReferenceStats();
  
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Failed to load statistics: {error.message}
        </Typography>
      </Box>
    );
  }
  
  // Debug stats data
  console.log('ReferenceStats data debug:', {
    stats,
    totalReferences: stats?.totalReferences,
    completionRate: stats?.completionRate,
    statusCounts: stats?.statusCounts,
    emailStats: stats?.emailStats
  });

  const { 
    totalReferences = 0, 
    completionRate = 0, 
    statusCounts = [], 
    emailStats = {} 
  } = stats || {};

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Total References"
                value={totalReferences}
                icon={PeopleIcon}
                color="primary"
                subtitle="All time"
              />
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Completion Rate"
                value={`${completionRate.toFixed(1)}%`}
                icon={CheckCircleIcon}
                color="success"
                subtitle="Successfully completed"
              />
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Email Performance"
                value={emailStats.totalEmailsSent || 0}
                icon={EmailIcon}
                color="info"
                subtitle="Emails sent"
              />
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <StatCard
                title="Active References"
                value={statusCounts.find(s => s.status === 'InProgress')?.count || 0}
                icon={ScheduleIcon}
                color="secondary"
                subtitle="Currently in progress"
              />
            </Grid>
          </Grid>
        </Grid>
        
        {/* Status Distribution */}
        <Grid item xs={12} md={6}>
          <StatusDistribution 
            statusCounts={statusCounts} 
            totalReferences={totalReferences} 
          />
        </Grid>
        
        {/* Email Performance */}
        <Grid item xs={12} md={6}>
          <EmailPerformance emailStats={emailStats} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReferenceStats;
