import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Stack,
  Chip,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  Container,
  IconButton,
  Fade,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  CardHeader,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonGroup,
  Collapse
} from '@mui/material';
import {
  AccessTime,
  Person,
  Business,
  CheckCircle,
  Cancel,
  Pending,
  Edit,
  Delete,
  Visibility,
  FilterList,
  Download,
  MoreVert,
  Schedule,
  AttachMoney,
  TrendingUp,
  PeopleAlt,
  Assignment,
  Home,
  Dashboard as DashboardIcon,
  Approval,
  Today,
  DateRange,
  Search,
  Clear,
  PlayArrow,
  Stop,
  Refresh,
  GetApp,
  ExpandMore,
  AccountCircle,
  WorkOutline
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { format, parseISO, isValid } from 'date-fns';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import AdminSidebar from '../../../components/adminSidebar/AdminSidebar';
import api from '../../../api/axios';
import { Helmet } from 'react-helmet';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 8;

// Status color mapping
const STATUS_COLORS = {
  draft: { color: '#757575', bg: '#f5f5f5' },
  submitted: { color: '#ff9800', bg: '#fff3e0' },
  approved: { color: '#4caf50', bg: '#e8f5e9' },
  rejected: { color: '#f44336', bg: '#ffebee' },
  pending_review: { color: '#2196f3', bg: '#e3f2fd' }
};

// Work type mapping
const WORK_TYPE_LABELS = {
  support: 'Support',
  care: 'Care',
  administrative: 'Administrative',
  training: 'Training',
  travel: 'Travel',
  other: 'Other'
};

const ViewAllTimesheets = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // State management
  const [timesheets, setTimesheets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination and filtering
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Filters
  const [filters, setFilters] = useState({
    workerId: '',
    clientName: '',
    status: '',
    workType: '',
    startDate: '',
    endDate: '',
    billable: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Selection and bulk operations
  const [selectedTimesheets, setSelectedTimesheets] = useState([]);
  const [bulkActionDialog, setBulkActionDialog] = useState({ open: false, action: '', reason: '' });

  // Dialog states
  const [timesheetDialog, setTimesheetDialog] = useState({ open: false, timesheet: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, timesheetId: null, reason: '' });

  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTimesheet, setCurrentTimesheet] = useState(null);

  // Tab state for different views
  const [currentTab, setCurrentTab] = useState(0);

  // Fetch timesheets with filters and pagination
  const fetchTimesheets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        sort: order === 'desc' ? 'newest' : 'oldest'
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/timesheet?${params}`);

      if (response.data.success) {
        setTimesheets(response.data.data.timesheets);
        setTotalCount(response.data.data.pagination.total);
        setAnalytics(response.data.data.analytics);
      }
    } catch (err) {
      setError('Failed to fetch timesheets');
      console.error('Error fetching timesheets:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, order, filters]);

  // Fetch timesheets for approval
  const fetchTimesheetsForApproval = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });

      const response = await api.get(`/timesheets/for-approval?${params}`);

      if (response.data.success) {
        setTimesheets(response.data.data.timesheets);
        setTotalCount(response.data.data.pagination.total);
      }
    } catch (err) {
      setError('Failed to fetch timesheets for approval');
      console.error('Error fetching timesheets:', err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.workerId) params.append('workerId', filters.workerId);
      if (filters.workType) params.append('workType', filters.workType);

      const response = await api.get(`/timesheets/analytics?${params}`);

      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  }, [filters]);

  // Initial load and tab changes
  useEffect(() => {
    if (currentTab === 0) {
      fetchTimesheets();
    } else if (currentTab === 1) {
      fetchTimesheetsForApproval();
    }
  }, [currentTab, fetchTimesheets, fetchTimesheetsForApproval]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Approve timesheet
  const handleApprove = async (timesheetId) => {
    try {
      const response = await api.patch(`/timesheets/${timesheetId}/approve`);
      if (response.data.success) {
        setSuccess('Timesheet approved successfully');
        if (currentTab === 0) {
          fetchTimesheets();
        } else {
          fetchTimesheetsForApproval();
        }
        fetchAnalytics();
      }
    } catch (err) {
      setError('Failed to approve timesheet');
    }
  };

  // Reject timesheet
  const handleReject = async () => {
    try {
      const response = await api.patch(`/timesheets/${rejectDialog.timesheetId}/reject`, {
        rejectionReason: rejectDialog.reason
      });
      if (response.data.success) {
        setSuccess('Timesheet rejected successfully');
        setRejectDialog({ open: false, timesheetId: null, reason: '' });
        if (currentTab === 0) {
          fetchTimesheets();
        } else {
          fetchTimesheetsForApproval();
        }
        fetchAnalytics();
      }
    } catch (err) {
      setError('Failed to reject timesheet');
    }
  };

  // Bulk approve
  const handleBulkApprove = async () => {
    try {
      const response = await api.patch('/timesheets/bulk-approve', {
        timesheetIds: selectedTimesheets
      });
      if (response.data.success) {
        setSuccess(`${response.data.modifiedCount} timesheets approved successfully`);
        setSelectedTimesheets([]);
        setBulkActionDialog({ open: false, action: '', reason: '' });
        if (currentTab === 0) {
          fetchTimesheets();
        } else {
          fetchTimesheetsForApproval();
        }
        fetchAnalytics();
      }
    } catch (err) {
      setError('Failed to bulk approve timesheets');
    }
  };

  // Bulk reject
  const handleBulkReject = async () => {
    try {
      const response = await api.patch('/timesheets/bulk-reject', {
        timesheetIds: selectedTimesheets,
        rejectionReason: bulkActionDialog.reason
      });
      if (response.data.success) {
        setSuccess(`${response.data.modifiedCount} timesheets rejected successfully`);
        setSelectedTimesheets([]);
        setBulkActionDialog({ open: false, action: '', reason: '' });
        if (currentTab === 0) {
          fetchTimesheets();
        } else {
          fetchTimesheetsForApproval();
        }
        fetchAnalytics();
      }
    } catch (err) {
      setError('Failed to bulk reject timesheets');
    }
  };

  // Export timesheets
  const handleExport = async (format = 'json') => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value);
        }
      });
      params.append('format', format);

      const response = await api.get(`/timesheets/export?${params}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timesheets.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timesheets.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setSuccess(`Timesheets exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      setError('Failed to export timesheets');
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm') : 'Invalid Date';
  };

  const formatDuration = (hours) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusChip = (status) => {
    const statusConfig = STATUS_COLORS[status] || STATUS_COLORS.draft;
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        sx={{
          backgroundColor: statusConfig.bg,
          color: statusConfig.color,
          fontWeight: 500,
          fontSize: '0.75rem'
        }}
        size="small"
      />
    );
  };

  // Selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedTimesheets(timesheets.map(t => t._id));
    } else {
      setSelectedTimesheets([]);
    }
  };

  const handleSelectOne = (timesheetId) => {
    setSelectedTimesheets(prev =>
      prev.includes(timesheetId)
        ? prev.filter(id => id !== timesheetId)
        : [...prev, timesheetId]
    );
  };

  // Filter reset
  const resetFilters = () => {
    setFilters({
      workerId: '',
      clientName: '',
      status: '',
      workType: '',
      startDate: '',
      endDate: '',
      billable: ''
    });
    setPage(0);
  };

  // Analytics cards data
  const analyticsCards = useMemo(() => [
    {
      title: 'Total Hours',
      value: analytics?.totalHours?.toFixed(1) || '0',
      icon: <Schedule />,
      color: theme.palette.primary.main
    },
    {
      title: 'Total Pay',
      value: analytics?.totalPay ? `$${analytics.totalPay.toFixed(2)}` : '$0.00',
      icon: <AttachMoney />,
      color: theme.palette.success.main
    },
    {
      title: 'Avg Hours',
      value: analytics?.avgHours?.toFixed(1) || '0',
      icon: <TrendingUp />,
      color: theme.palette.info.main
    },
    {
      title: 'Total Timesheets',
      value: totalCount?.toString() || '0',
      icon: <Assignment />,
      color: theme.palette.warning.main
    }
  ], [analytics, totalCount, theme.palette]);

  const tabLabels = ['All Timesheets', 'Pending Approval'];

  return (
    <>
      <Helmet>
        <title>Timesheet Management | Admin Portal</title>
      </Helmet>

      <WorkerNavbar />

      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default
      }}>
        {/* Sidebar */}
        <Box sx={{
          width: { xs: 0, md: SIDEBAR_WIDTH },
          flexShrink: 0,
          zIndex: theme.zIndex.drawer,
          position: 'fixed',
          top: { xs: 56, md: 64 },
          left: 0,
          height: `calc(100vh - 64px)`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}>
          <AdminSidebar topOffset={64} navigate={navigate} />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            ml: { md: `${SIDEBAR_WIDTH + SIDEBAR_GAP}px` },
            p: { xs: 2, sm: 3 },
            mt: { xs: 8, md: 3 },
            minHeight: '100vh',
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              width: '100%',
              mt: { xs: 2, sm: 3 },
              mb: 4,
              px: { xs: 0, sm: 2 }
            }}
          >
            {/* Breadcrumb Navigation */}
            <Box sx={{ mb: 3 }}>
              <Breadcrumbs aria-label="breadcrumb">
                <Link
                  color="inherit"
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard');
                  }}
                  sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                  Dashboard
                </Link>

                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTime sx={{ mr: 0.5 }} fontSize="inherit" />
                  Timesheet Management
                </Typography>
              </Breadcrumbs>
            </Box>

            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                Timesheet Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage worker timesheets, approve submissions, and track time analytics
              </Typography>
            </Box>

            {/* Analytics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {analyticsCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%',
                      background: `linear-gradient(135deg, ${card.color}15, ${card.color}08)`
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          p: 1,
                          borderRadius: 2,
                          backgroundColor: `${card.color}20`,
                          color: card.color,
                          mr: 2
                        }}>
                          {card.icon}
                        </Box>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          {card.value}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {card.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Main Content Card */}
            <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={currentTab}
                  onChange={(e, newValue) => {
                    setCurrentTab(newValue);
                    setSelectedTimesheets([]);
                    setPage(0);
                  }}
                  variant={isMobile ? "fullWidth" : "standard"}
                >
                  {tabLabels.map((label, index) => (
                    <Tab
                      key={index}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {index === 0 ? <Assignment sx={{ mr: 1 }} /> : <Approval sx={{ mr: 1 }} />}
                          {label}
                          {index === 1 && timesheets.length > 0 && (
                            <Badge badgeContent={totalCount} color="error" sx={{ ml: 1 }} />
                          )}
                        </Box>
                      }
                    />
                  ))}
                </Tabs>
              </Box>

              <CardContent sx={{ p: 0 }}>
                {/* Toolbar */}
                <Box sx={{
                  p: 3,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { sm: 'center' },
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterList />}
                      onClick={() => setShowFilters(!showFilters)}
                      size="small"
                    >
                      Filters
                      {Object.values(filters).some(v => v !== '') && (
                        <Chip
                          label={Object.values(filters).filter(v => v !== '').length}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={() => {
                        if (currentTab === 0) {
                          fetchTimesheets();
                        } else {
                          fetchTimesheetsForApproval();
                        }
                        fetchAnalytics();
                      }}
                      size="small"
                    >
                      Refresh
                    </Button>

                    {selectedTimesheets.length > 0 && (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => setBulkActionDialog({ open: true, action: 'approve', reason: '' })}
                          size="small"
                        >
                          Approve ({selectedTimesheets.length})
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => setBulkActionDialog({ open: true, action: 'reject', reason: '' })}
                          size="small"
                        >
                          Reject ({selectedTimesheets.length})
                        </Button>
                      </>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <ButtonGroup variant="outlined" size="small">
                      <Button
                        startIcon={<Download />}
                        onClick={() => handleExport('json')}
                      >
                        JSON
                      </Button>
                      <Button
                        startIcon={<GetApp />}
                        onClick={() => handleExport('csv')}
                      >
                        CSV
                      </Button>
                    </ButtonGroup>
                  </Box>
                </Box>

                {/* Filters Panel */}
                <Collapse in={showFilters}>
                  <Box sx={{ p: 3, backgroundColor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Client Name"
                          value={filters.clientName}
                          onChange={(e) => setFilters(prev => ({ ...prev, clientName: e.target.value }))}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            label="Status"
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="submitted">Submitted</MenuItem>
                            <MenuItem value="approved">Approved</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                            <MenuItem value="pending_review">Pending Review</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Work Type</InputLabel>
                          <Select
                            value={filters.workType}
                            onChange={(e) => setFilters(prev => ({ ...prev, workType: e.target.value }))}
                            label="Work Type"
                          >
                            <MenuItem value="">All</MenuItem>
                            {Object.entries(WORK_TYPE_LABELS).map(([key, label]) => (
                              <MenuItem key={key} value={key}>{label}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Billable</InputLabel>
                          <Select
                            value={filters.billable}
                            onChange={(e) => setFilters(prev => ({ ...prev, billable: e.target.value }))}
                            label="Billable"
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="true">Billable</MenuItem>
                            <MenuItem value="false">Non-billable</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Start Date"
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="End Date"
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Button
                          variant="outlined"
                          onClick={resetFilters}
                          startIcon={<Clear />}
                          fullWidth
                          size="small"
                        >
                          Clear Filters
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>

                {/* Loading State */}
                {loading && <LinearProgress />}

                {/* Table */}
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedTimesheets.length > 0 && selectedTimesheets.length < timesheets.length}
                            checked={timesheets.length > 0 && selectedTimesheets.length === timesheets.length}
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell>Worker</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Work Type</TableCell>
                        <TableCell>Clock In</TableCell>
                        <TableCell>Clock Out</TableCell>
                        <TableCell>Hours</TableCell>
                        <TableCell>Pay</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {timesheets.map((timesheet) => (
                        <TableRow
                          key={timesheet._id}
                          selected={selectedTimesheets.includes(timesheet._id)}
                          hover
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedTimesheets.includes(timesheet._id)}
                              onChange={() => handleSelectOne(timesheet._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: theme.palette.primary.main }}>
                                {timesheet.worker?.[0]?.name?.charAt(0) || timesheet.workerId?.name?.charAt(0) || 'U'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {timesheet.worker?.[0]?.firstName && timesheet.worker?.[0]?.lastName
                                    ? `${timesheet.worker[0].firstName} ${timesheet.worker[0].lastName}`
                                    : 'Unknown'}

                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {timesheet.worker?.[0]?.email || timesheet.workerId?.email || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {timesheet.clientName || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={WORK_TYPE_LABELS[timesheet.workType] || timesheet.workType}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(timesheet.clockIn)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {timesheet.clockOut ? formatDate(timesheet.clockOut) : (
                                <Chip
                                  label="Active"
                                  color="success"
                                  size="small"
                                  icon={<PlayArrow />}
                                />
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {formatDuration(timesheet.totalHours)}
                            </Typography>
                            {timesheet.breaks && timesheet.breaks.length > 0 && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {timesheet.breaks.length} break(s)
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {timesheet.totalPay ? `${timesheet.totalPay.toFixed(2)}` : 'N/A'}
                            </Typography>
                            {timesheet.billable !== undefined && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {timesheet.billable ? 'Billable' : 'Non-billable'}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusChip(timesheet.status)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                setAnchorEl(e.currentTarget);
                                setCurrentTimesheet(timesheet);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Empty State */}
                  {!loading && timesheets.length === 0 && (
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 8
                    }}>
                      <Assignment sx={{ fontSize: 64, color: theme.palette.text.disabled, mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No timesheets found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        {currentTab === 0
                          ? "No timesheets match your current filters. Try adjusting your search criteria."
                          : "No timesheets are currently pending approval."
                        }
                      </Typography>
                      {Object.values(filters).some(v => v !== '') && (
                        <Button
                          variant="outlined"
                          onClick={resetFilters}
                          sx={{ mt: 2 }}
                          startIcon={<Clear />}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </Box>
                  )}
                </TableContainer>

                {/* Pagination */}
                {totalCount > 0 && (
                  <Box sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
                    <TablePagination
                      component="div"
                      count={totalCount}
                      page={page}
                      onPageChange={(e, newPage) => setPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                      }}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Action Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => {
                setAnchorEl(null);
                setCurrentTimesheet(null);
              }}
              PaperProps={{
                elevation: 3,
                sx: { minWidth: 200 }
              }}
            >
              <MenuItem
                onClick={() => {
                  setTimesheetDialog({ open: true, timesheet: currentTimesheet });
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <Visibility fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Details</ListItemText>
              </MenuItem>

              {currentTimesheet?.status === 'submitted' && (
                <>
                  <MenuItem
                    onClick={() => {
                      handleApprove(currentTimesheet._id);
                      setAnchorEl(null);
                    }}
                  >
                    <ListItemIcon>
                      <CheckCircle fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText>Approve</ListItemText>
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      setRejectDialog({
                        open: true,
                        timesheetId: currentTimesheet._id,
                        reason: ''
                      });
                      setAnchorEl(null);
                    }}
                  >
                    <ListItemIcon>
                      <Cancel fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Reject</ListItemText>
                  </MenuItem>
                </>
              )}

              <Divider />

              <MenuItem
                onClick={() => {
                  navigate(`/admin/timesheets/${currentTimesheet._id}/edit`);
                  setAnchorEl(null);
                }}
              >
                <ListItemIcon>
                  <Edit fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  // Handle delete with confirmation
                  setAnchorEl(null);
                }}
                sx={{ color: theme.palette.error.main }}
              >
                <ListItemIcon>
                  <Delete fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>

            {/* Timesheet Details Dialog */}
            <Dialog
              open={timesheetDialog.open}
              onClose={() => setTimesheetDialog({ open: false, timesheet: null })}
              maxWidth="md"
              fullWidth
              fullScreen={isMobile}
            >
              <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Timesheet Details</Typography>
                  {timesheetDialog.timesheet && getStatusChip(timesheetDialog.timesheet.status)}
                </Box>
              </DialogTitle>
              <DialogContent>
                {timesheetDialog.timesheet && (
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    {/* Worker Information */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardHeader
                          title="Worker Information"
                          avatar={
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              <Person />
                            </Avatar>
                          }
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Name</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {timesheetDialog.timesheet.worker?.[0]?.name ||
                                  timesheetDialog.timesheet.workerId?.name || 'Unknown'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Email</Typography>
                              <Typography variant="body2">
                                {timesheetDialog.timesheet.worker?.[0]?.email ||
                                  timesheetDialog.timesheet.workerId?.email || 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Work Details */}
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardHeader
                          title="Work Details"
                          avatar={
                            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                              <WorkOutline />
                            </Avatar>
                          }
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Client</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {timesheetDialog.timesheet.clientName || 'N/A'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Work Type</Typography>
                              <Typography variant="body2">
                                {WORK_TYPE_LABELS[timesheetDialog.timesheet.workType] ||
                                  timesheetDialog.timesheet.workType}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Location</Typography>
                              <Typography variant="body2">
                                {timesheetDialog.timesheet.location?.address || 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Time Information */}
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardHeader
                          title="Time Information"
                          avatar={
                            <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                              <Schedule />
                            </Avatar>
                          }
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Clock In</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {formatDate(timesheetDialog.timesheet.clockIn)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Clock Out</Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {timesheetDialog.timesheet.clockOut
                                    ? formatDate(timesheetDialog.timesheet.clockOut)
                                    : 'Still active'
                                  }
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Total Hours</Typography>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                  {formatDuration(timesheetDialog.timesheet.totalHours)}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Hourly Rate</Typography>
                                <Typography variant="h6" fontWeight="bold">
                                  {timesheetDialog.timesheet.hourlyRate
                                    ? `${timesheetDialog.timesheet.hourlyRate.toFixed(2)}`
                                    : 'N/A'
                                  }
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Total Pay</Typography>
                                <Typography variant="h6" color="success.main" fontWeight="bold">
                                  {timesheetDialog.timesheet.totalPay
                                    ? `${timesheetDialog.timesheet.totalPay.toFixed(2)}`
                                    : 'N/A'
                                  }
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Breaks */}
                    {timesheetDialog.timesheet.breaks && timesheetDialog.timesheet.breaks.length > 0 && (
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardHeader title="Breaks" />
                          <CardContent sx={{ pt: 0 }}>
                            <Stack spacing={1}>
                              {timesheetDialog.timesheet.breaks.map((breakItem, index) => (
                                <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                                  <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={3}>
                                      <Typography variant="caption" color="text.secondary">Start</Typography>
                                      <Typography variant="body2">
                                        {formatDate(breakItem.startTime)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                      <Typography variant="caption" color="text.secondary">End</Typography>
                                      <Typography variant="body2">
                                        {formatDate(breakItem.endTime)}
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                      <Typography variant="caption" color="text.secondary">Duration</Typography>
                                      <Typography variant="body2" fontWeight="medium">
                                        {breakItem.duration} min
                                      </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                      <Typography variant="caption" color="text.secondary">Reason</Typography>
                                      <Typography variant="body2">
                                        {breakItem.reason || 'No reason provided'}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Notes */}
                    {timesheetDialog.timesheet.notes && (
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardHeader title="Notes" />
                          <CardContent sx={{ pt: 0 }}>
                            <Typography variant="body2">
                              {timesheetDialog.timesheet.notes}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {/* Approval Information */}
                    {(timesheetDialog.timesheet.approvedBy || timesheetDialog.timesheet.rejectionReason) && (
                      <Grid item xs={12}>
                        <Card variant="outlined">
                          <CardHeader title="Approval Information" />
                          <CardContent sx={{ pt: 0 }}>
                            <Stack spacing={2}>
                              {timesheetDialog.timesheet.approvedBy && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Approved By</Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {timesheetDialog.timesheet.approvedBy.name || 'Unknown'}
                                  </Typography>
                                  {timesheetDialog.timesheet.approvedAt && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {formatDate(timesheetDialog.timesheet.approvedAt)}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                              {timesheetDialog.timesheet.rejectionReason && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Rejection Reason</Typography>
                                  <Typography variant="body2" color="error.main">
                                    {timesheetDialog.timesheet.rejectionReason}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button
                  onClick={() => setTimesheetDialog({ open: false, timesheet: null })}
                >
                  Close
                </Button>
                {timesheetDialog.timesheet?.status === 'submitted' && (
                  <>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => {
                        handleApprove(timesheetDialog.timesheet._id);
                        setTimesheetDialog({ open: false, timesheet: null });
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setRejectDialog({
                          open: true,
                          timesheetId: timesheetDialog.timesheet._id,
                          reason: ''
                        });
                        setTimesheetDialog({ open: false, timesheet: null });
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
              open={rejectDialog.open}
              onClose={() => setRejectDialog({ open: false, timesheetId: null, reason: '' })}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Reject Timesheet</DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Please provide a reason for rejecting this timesheet. This will be sent to the worker.
                </Typography>
                <TextField
                  autoFocus
                  fullWidth
                  multiline
                  rows={4}
                  label="Rejection Reason"
                  value={rejectDialog.reason}
                  onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for rejection..."
                  required
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setRejectDialog({ open: false, timesheetId: null, reason: '' })}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleReject}
                  disabled={!rejectDialog.reason.trim()}
                >
                  Reject Timesheet
                </Button>
              </DialogActions>
            </Dialog>

            {/* Bulk Action Dialog */}
            <Dialog
              open={bulkActionDialog.open}
              onClose={() => setBulkActionDialog({ open: false, action: '', reason: '' })}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                {bulkActionDialog.action === 'approve' ? 'Bulk Approve' : 'Bulk Reject'} Timesheets
              </DialogTitle>
              <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You are about to {bulkActionDialog.action} {selectedTimesheets.length} timesheet(s).
                  {bulkActionDialog.action === 'reject' && ' Please provide a reason for rejection.'}
                </Typography>

                {bulkActionDialog.action === 'reject' && (
                  <TextField
                    autoFocus
                    fullWidth
                    multiline
                    rows={4}
                    label="Rejection Reason"
                    value={bulkActionDialog.reason}
                    onChange={(e) => setBulkActionDialog(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Enter reason for rejection..."
                    required
                  />
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => setBulkActionDialog({ open: false, action: '', reason: '' })}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color={bulkActionDialog.action === 'approve' ? 'success' : 'error'}
                  onClick={bulkActionDialog.action === 'approve' ? handleBulkApprove : handleBulkReject}
                  disabled={bulkActionDialog.action === 'reject' && !bulkActionDialog.reason.trim()}
                >
                  {bulkActionDialog.action === 'approve' ? 'Approve All' : 'Reject All'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Snackbar Notifications */}
            <Snackbar
              open={!!error}
              autoHideDuration={6000}
              onClose={() => setError('')}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert onClose={() => setError('')} severity="error" variant="filled">
                {error}
              </Alert>
            </Snackbar>

            <Snackbar
              open={!!success}
              autoHideDuration={4000}
              onClose={() => setSuccess('')}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Alert onClose={() => setSuccess('')} severity="success" variant="filled">
                {success}
              </Alert>
            </Snackbar>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default ViewAllTimesheets;