import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Pagination,
  Tabs,
  Tab,
  Badge,
  Alert,
  Snackbar,
  Menu,
  Divider,
  Avatar,
  Tooltip,
  Skeleton,
  Stack,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  FilterList,
  Refresh,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Schedule,
  AccessTime,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
  Dashboard,
  Person,
  Work,
  Schedule as ScheduleIcon,
  VerifiedUser,
  History,
  MoreTime,
  Logout,
  PlayArrow,
  Stop,
  PauseCircle,
  TrendingUp,
  CalendarToday,
  LocationOn,
  Notes,
  AttachMoney,
  Timer,
  Send,
  Download,
  Visibility,
  Close,
  Warning,
} from '@mui/icons-material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ProgressNoteDrawer from '../../../components/ProgressNote/WorkerProgressNote/ProgressNoteDrawer';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import DashboardSidebar from '../../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';


// Map UI sort to backend-expected sort strings
const mapSortParam = (field, direction) => {
  if (!field) return null;
  const dir = direction === 'asc' ? 'asc' : 'desc';
  switch (field) {
    case 'clockIn':
      return dir === 'asc' ? 'date-asc' : 'date-desc';
    case 'totalHours':
      return dir === 'asc' ? 'hours-asc' : 'hours-desc';
    case 'totalPay':
      return dir === 'asc' ? 'pay-asc' : 'pay-desc';
    case 'status':
      return 'status';
    default:
      return null; // unsupported by backend; will sort client-side if needed
  }
};

// Compute analytics locally if backend does not return it
const computeAnalytics = (items = []) => {
  const totals = items.reduce(
    (acc, t) => {
      acc.totalHours += Number(t.totalHours || 0);
      acc.totalPay += Number(t.totalPay || 0);
      const s = (t.status || 'draft').toLowerCase();
      acc.statusBreakdown[s] = (acc.statusBreakdown[s] || 0) + 1;
      return acc;
    },
    { totalHours: 0, totalPay: 0, statusBreakdown: {} }
  );
  return {
    totalHours: totals.totalHours,
    totalPay: totals.totalPay,
    avgHours: items.length ? totals.totalHours / items.length : 0,
    statusBreakdown: totals.statusBreakdown
  };
};

// Client-side sort when backend does not support the requested field
const clientSortTimesheets = (items, field, direction) => {
  if (!field) return items;
  const dir = direction === 'asc' ? 1 : -1;
  const sorted = [...items].sort((a, b) => {
    const av = a?.[field];
    const bv = b?.[field];
    if (av == null && bv == null) return 0;
    if (av == null) return -1 * dir;
    if (bv == null) return 1 * dir;
    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * dir;
    }
    const as = String(av).toLowerCase();
    const bs = String(bv).toLowerCase();
    if (as < bs) return -1 * dir;
    if (as > bs) return 1 * dir;
    return 0;
  });
  return sorted;
};

// const DashboardSidebar = ({ activeTab, setActiveTab, handleSignOut }) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [mobileOpen, setMobileOpen] = useState(false);

//   if (isMobile) {
//     return (
//       <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1200 }}>
//         <IconButton 
//           onClick={() => setMobileOpen(!mobileOpen)}
//           sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
//         >
//           <Schedule />
//         </IconButton>
//         {mobileOpen && (
//           <Box sx={{ 
//             position: 'absolute', 
//             top: 60, 
//             left: 0, 
//             bgcolor: 'background.paper', 
//             boxShadow: 3, 
//             borderRadius: 2,
//             minWidth: 200,
//             p: 2
//           }}>
//             <Typography variant="h6" gutterBottom>Menu</Typography>
//             <Button fullWidth onClick={() => setActiveTab('dashboard')}>Dashboard</Button>
//             <Button fullWidth onClick={() => setActiveTab('timesheet')}>Timesheet</Button>
//             <Button fullWidth onClick={handleSignOut}>Sign Out</Button>
//           </Box>
//         )}
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ 
//       width: 260, 
//       bgcolor: 'background.paper', 
//       borderRight: '1px solid',
//       borderColor: 'divider',
//       height: '100vh',
//       position: 'fixed',
//       left: 0,
//       top: 0,
//       zIndex: 1000
//     }}>
//       <Box sx={{ p: 2 }}>
//         <Typography variant="h6">Worker Dashboard</Typography>
//       </Box>
//       <Divider />
//       <Box sx={{ p: 1 }}>
//         <Button 
//           fullWidth 
//           startIcon={<Dashboard />}
//           variant={activeTab === 'dashboard' ? 'contained' : 'text'}
//           onClick={() => setActiveTab('dashboard')}
//           sx={{ justifyContent: 'flex-start', mb: 1 }}
//         >
//           Dashboard
//         </Button>
//         <Button 
//           fullWidth 
//           startIcon={<ScheduleIcon />}
//           variant={activeTab === 'timesheet' ? 'contained' : 'text'}
//           onClick={() => setActiveTab('timesheet')}
//           sx={{ justifyContent: 'flex-start', mb: 1 }}
//         >
//           Timesheet
//         </Button>
//         <Button 
//           fullWidth 
//           startIcon={<Logout />}
//           onClick={handleSignOut}
//           sx={{ justifyContent: 'flex-start', mt: 2 }}
//         >
//           Sign Out
//         </Button>
//       </Box>
//     </Box>
//   );
// };

const WorkerTimesheet = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // State for timesheet data
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalHours: 0,
    totalPay: 0,
    avgHours: 0,
    statusBreakdown: {}
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  });

  // Filter and sort state
  const [filters, setFilters] = useState({
    status: '',
    clientName: '',
    startDate: '',
    endDate: '',
    workType: ''
  });
  const [sort, setSort] = useState({ field: 'clockIn', direction: 'desc' });
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  // removed popover anchor in favor of inline panel

  // Modal states
  const [activeTimesheet, setActiveTimesheet] = useState(null);
  const [openClockInModal, setOpenClockInModal] = useState(false);
  const [openClockOutModal, setOpenClockOutModal] = useState(false);
  const [openTimesheetModal, setOpenTimesheetModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);


  // Form states
  const [clockInData, setClockInData] = useState({
    clientName: '',
    workType: 'support',
    location: { address: '' },
    clockIn: null
  });
  const [clockOutData, setClockOutData] = useState({
    notes: '',
    breaks: [],
    clockOut: null
  });
  const [timesheetForm, setTimesheetForm] = useState({
    clientName: '',
    clockIn: new Date(),
    clockOut: null,
    workType: 'support',
    notes: '',
    hourlyRate: 25,
    billable: true
  });

  // Break management
  const [breakForm, setBreakForm] = useState({
    startTime: '',
    endTime: '',
    reason: ''
  });
  const [openBreakModal, setOpenBreakModal] = useState(false);
  const [savingTimesheet, setSavingTimesheet] = useState(false);
  const [openProgressDrawer, setOpenProgressDrawer] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Current time for active timesheet
  const [currentTime, setCurrentTime] = useState(new Date());

  // User state (mock for now)
  const [user] = useState({
    id: 'user123',
    name: 'John Doe',
    role: 'worker',
    avatar: ''
  });

  // Update current time every second for active timesheet
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ensure filters panel is visible on small devices by default
  useEffect(() => {
    if (isMobile) {
      setShowFiltersPanel(true);
    }
  }, [isMobile]);

  // Fetch timesheets from API
  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      };
      const mappedSort = mapSortParam(sort.field, sort.direction);
      if (mappedSort) {
        params.sort = mappedSort;
      }

      // Align with backend route mounted at /api/v1/timesheet
      const response = await api.get('/timesheet/my-timesheets', { params });


      let fetchedTimesheets = response?.data?.data?.timesheets || [];
      if (!mappedSort && sort.field) {
        fetchedTimesheets = clientSortTimesheets(fetchedTimesheets, sort.field, sort.direction);
      }
      const serverAnalytics = response?.data?.data?.analytics;

      setTimesheets(fetchedTimesheets);
      setAnalytics(serverAnalytics || computeAnalytics(fetchedTimesheets));
      setPagination(response?.data?.data?.pagination || pagination);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      showNotification('Error fetching timesheets', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active timesheet (if any)
  const fetchActiveTimesheet = async () => {
    try {
      // Backend doesn't expose /active; get latest and check if still open
      const response = await api.get('/timesheet/my-timesheets', {
        params: { page: 1, limit: 1, sort: 'date-desc' }
      });
      const latest = response?.data?.data?.timesheets?.[0];
      setActiveTimesheet(latest && !latest.clockOut ? latest : null);
    } catch (error) {
      console.error('Error fetching active timesheet:', error);
      setActiveTimesheet(null);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTimesheets();
    fetchActiveTimesheet();
  }, [pagination.current, filters, sort]);

  // Show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchTimesheets();
    setFiltersAnchorEl(null);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      clientName: '',
      startDate: '',
      endDate: '',
      workType: ''
    });
    setSort({ field: 'clockIn', direction: 'desc' });
    setPagination(prev => ({ ...prev, current: 1 }));
    setFiltersAnchorEl(null);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sort.field === field) {
      setSort(prev => ({
        field,
        direction: prev.direction === 'asc' ? 'desc' : 'asc'
      }));
    } else {
      setSort({ field, direction: 'desc' });
    }
  };

  // Handle clock in
  const handleClockIn = async () => {
    try {
      const payload = { ...clockInData };
      if (!payload.clockIn) {
        delete payload.clockIn;
      } else {
        payload.clockIn = new Date(payload.clockIn);
      }
      await api.post('/timesheet/clock-in', payload);
      setOpenClockInModal(false);
      setClockInData({
        clientName: '',
        workType: 'support',
        location: { address: '' },
        clockIn: null
      });
      fetchActiveTimesheet();
      fetchTimesheets();
      showNotification('Clocked in successfully!', 'success');
    } catch (error) {
      console.error('Error clocking in:', error);
      showNotification('Error clocking in', 'error');
    }
  };

  // Handle clock out
  const handleClockOut = async () => {
    if (!activeTimesheet) return;

    try {
      const payload = { ...clockOutData, timesheetId: activeTimesheet._id };
      if (!payload.clockOut) {
        delete payload.clockOut;
      } else {
        payload.clockOut = new Date(payload.clockOut);
      }
      await api.post('/timesheet/clock-out', payload);
      setOpenClockOutModal(false);
      setClockOutData({ notes: '', breaks: [], clockOut: null });
      fetchActiveTimesheet();
      fetchTimesheets();
      showNotification('Clocked out successfully!', 'success');
    } catch (error) {
      console.error('Error clocking out:', error);
      showNotification('Error clocking out', 'error');
    }
  };

  // Handle timesheet submission
  const handleSubmitTimesheet = async (timesheetId) => {
    try {
      await api.patch(`/timesheet/${timesheetId}/submit`);
      fetchTimesheets();
      showNotification('Timesheet submitted for approval', 'success');
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      showNotification('Error submitting timesheet', 'error');
    }
  };

  // Format date to input[type=datetime-local]
  const formatDateTimeLocal = (value) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  // Create/Update timesheet
  const handleSaveTimesheet = async () => {
    try {
      setSavingTimesheet(true);
      const payload = {
        clientName: timesheetForm.clientName || '',
        workType: timesheetForm.workType || 'support',
        notes: timesheetForm.notes || '',
        hourlyRate: timesheetForm.hourlyRate,
        billable: Boolean(timesheetForm.billable),
        clockIn: timesheetForm.clockIn ? new Date(timesheetForm.clockIn) : new Date(),
        clockOut: timesheetForm.clockOut ? new Date(timesheetForm.clockOut) : null
      };

      if (timesheetForm._id) {
        await api.put(`/timesheet/${timesheetForm._id}`, payload);
        showNotification('Timesheet updated', 'success');
      } else {
        await api.post('/timesheet', payload);
        showNotification('Timesheet created', 'success');
      }

      setOpenTimesheetModal(false);
      fetchTimesheets();
    } catch (error) {
      console.error('Save timesheet failed:', error);
      showNotification('Failed to save timesheet', 'error');
    } finally {
      setSavingTimesheet(false);
    }
  };

  // Handle timesheet deletion
  const handleDeleteTimesheet = async () => {
    if (!selectedTimesheet) return;

    try {
      await api.delete(`/timesheet/${selectedTimesheet._id}`);
      setOpenDeleteDialog(false);
      setSelectedTimesheet(null);
      fetchTimesheets();
      showNotification('Timesheet deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      showNotification('Error deleting timesheet', 'error');
    }
  };

  // Handle add break
  const handleAddBreak = async () => {
    if (!selectedTimesheet) return;

    try {
      await api.post(`/timesheet/${selectedTimesheet._id}/breaks`, breakForm);
      setOpenBreakModal(false);
      setBreakForm({ startTime: '', endTime: '', reason: '' });
      fetchTimesheets();
      showNotification('Break added successfully', 'success');
    } catch (error) {
      console.error('Error adding break:', error);
      showNotification('Error adding break', 'error');
    }
  };

  // Calculate elapsed time for active timesheet
  const getElapsedTime = () => {
    if (!activeTimesheet) return '0h 0m';
    const start = new Date(activeTimesheet.clockIn);
    const elapsed = Math.floor((currentTime - start) / 1000 / 60); // minutes
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return `${hours}h ${minutes}m`;
  };

  // Format time duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'submitted': return 'info';
      case 'rejected': return 'error';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  // Work type label and color
  const getWorkTypeInfo = (type) => {
    const types = {
      support: { label: 'Support', color: 'primary' },
      care: { label: 'Care', color: 'secondary' },
      administrative: { label: 'Admin', color: 'default' },
      training: { label: 'Training', color: 'info' },
      travel: { label: 'Travel', color: 'warning' },
      other: { label: 'Other', color: 'default' }
    };
    return types[type] || types.other;
  };

  // Short ID helper for compact identification in the list
  const getShortId = (id) => {
    if (!id) return '';
    return String(id).slice(-6).toUpperCase();
  };

  // Active filters count for badge on Filters button
  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(Boolean).length;
  };
  console.log("Selected Timesheet", selectedTimesheet?._id)

  return (
    <Box>
      <WorkerNavbar />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
        <DashboardSidebar />


        {/* Main Content */}
        <Box component="main" sx={{
          flexGrow: 1,
          mt: { xs: 1, sm: 1 },
          p: { xs: 2, sm: 1, },
          // ml: { md: '260px' },
          minHeight: '100vh'
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 2,
            mt: 10,
            gap: 2
          }}>
            <Box sx={{
              px:1,
            }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Timesheet Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your work hours and manage timesheets
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Tooltip title={activeTimesheet ? 'Complete ongoing shift to add a new entry' : ''}>
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    disabled={Boolean(activeTimesheet)}
                    onClick={() => {
                      if (activeTimesheet) {
                        showNotification('Complete ongoing shift to add a new entry', 'warning');
                        return;
                      }
                      setTimesheetForm({
                        _id: undefined,
                        clientName: '',
                        clockIn: new Date(),
                        clockOut: null,
                        workType: 'support',
                        notes: '',
                        hourlyRate: 25,
                        billable: true
                      });
                      setOpenTimesheetModal(true);
                    }}
                    size={isMobile ? 'small' : 'medium'}
                  >
                    {isMobile ? 'Add' : 'New Entry'}
                  </Button>
                </span>
              </Tooltip>

              <Badge color="primary" badgeContent={getActiveFiltersCount()} invisible={getActiveFiltersCount() === 0}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setShowFiltersPanel(prev => !prev)}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Filters
                </Button>
              </Badge>
            </Stack>
          </Box>

          {/* Active Timesheet Alert */}
          {activeTimesheet && (
            <Box
              sx={{
                mb: 1.5,
                px: 1,
                py: 0.75,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                flexWrap: 'wrap',
                bgcolor: 'warning.50',
                border: '1px solid',
                borderColor: 'warning.light',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                {/* Pulsing Dot */}
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                    animation: 'pulseDot 1.6s ease-out infinite',
                    '@keyframes pulseDot': {
                      '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.7)' },
                      '70%': { boxShadow: '0 0 0 6px rgba(211, 47, 47, 0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' },
                    },
                  }}
                />
                <Typography variant="caption" color="error.main" fontWeight={700}>
                  Active
                </Typography>
                <Typography variant="caption" sx={{ mx: 0.5, color: 'text.disabled' }}>
                  •
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  sx={{
                    maxWidth: { xs: 140, sm: 220, md: 260 },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {activeTimesheet.clientName}
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  color={getWorkTypeInfo(activeTimesheet.workType)?.color}
                  label={getWorkTypeInfo(activeTimesheet.workType)?.label}
                />
                {activeTimesheet.location?.address && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{ maxWidth: { xs: 120, sm: 200, md: 240 } }}
                  >
                    📍 {activeTimesheet.location.address}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { xs: 'none', sm: 'inline' } }}
                >
                  {dayjs(activeTimesheet.clockIn).format('MMM D, h:mm A')}
                </Typography>
                <Chip
                  size="small"
                  label={getElapsedTime?.()}
                  color="error"
                  sx={{
                    height: 22,
                    fontSize: 12,
                    fontWeight: 700,
                    animation: 'blink 1.4s ease-in-out infinite',
                    '@keyframes blink': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                      '100%': { opacity: 1 },
                    },
                  }}
                />
              </Stack>
            </Box>
          )}

          {/* Inline Filters Panel (placed above analytics for all screen sizes) */}
          {showFiltersPanel && (
            <Card sx={{ mb: 2, borderRadius: 2, p: 2, boxShadow: 2 }}>
              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterList fontSize="small" /> Filters
                </Typography>
                <IconButton size="small" onClick={() => setShowFiltersPanel(false)}>
                  <Close fontSize="small" />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="large" sx={{ '& .MuiInputBase-root': { height: 56, fontSize: 16 } }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      fullWidth
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Status"
                      sx={{
                        width: '220px'
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: { minWidth: { xs: 300, sm: 420, md: 560 } }
                        }
                      }}
                    >
                      <MenuItem value="">All Statuses</MenuItem>
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="submitted">Submitted</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12}>
                  <FormControl fullWidth size="medium" sx={{ '& .MuiInputBase-root': { height: 56, fontSize: 16 } }}>
                    <InputLabel>Work Type</InputLabel>
                    <Select
                      fullWidth
                      value={filters.workType}
                      onChange={(e) => handleFilterChange('workType', e.target.value)}
                      label="Work Type"
                      sx={{
                        width: '220px'
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: { minWidth: { xs: 300, sm: 420, md: 560 } }
                        }
                      }}
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="support">Support</MenuItem>
                      <MenuItem value="care">Care</MenuItem>
                      <MenuItem value="administrative">Administrative</MenuItem>
                      <MenuItem value="training">Training</MenuItem>
                      <MenuItem value="travel">Travel</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Client Name"
                    value={filters.clientName}
                    onChange={(e) => handleFilterChange('clientName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="End Date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }} justifyContent="flex-end">
                <Button onClick={resetFilters}>Reset</Button>
                <Button variant="contained" startIcon={<FilterList />} onClick={applyFilters}>Apply</Button>
              </Stack>
            </Card>
          )}

          {/* Analytics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Timer sx={{ fontSize: 40, opacity: 0.8, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {analytics.totalHours?.toFixed(1) || '0.0'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Total Hours
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney sx={{ fontSize: 40, opacity: 0.8, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        ${analytics.totalPay?.toFixed(0) || '0'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Total Earnings
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ fontSize: 40, opacity: 0.8, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {analytics.avgHours?.toFixed(1) || '0.0'}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Avg Hours/Day
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    Status Overview
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(analytics.statusBreakdown || {}).map(([status, count]) => (
                      <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={status.charAt(0).toUpperCase() + status.slice(1)}
                          size="small"
                          color={getStatusColor(status)}
                          variant="outlined"
                        />
                        <Typography variant="h6" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>





          {/* Timesheet List */}
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {loading && <LinearProgress />}

            {isMobile ? (
              // Mobile Card Layout
              <Box sx={{ p: 2 }}>
                {timesheets.map((timesheet) => (
                  <Card key={timesheet._id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {timesheet.clientName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dayjs(timesheet.clockIn).format('MMM D, YYYY')}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setSelectedTimesheet(timesheet);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>

                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                        <Chip
                          label={getWorkTypeInfo(timesheet.workType).label}
                          size="small"
                          color={getWorkTypeInfo(timesheet.workType).color}
                          variant="outlined"
                        />
                        <Chip
                          label={timesheet.status}
                          size="small"
                          color={getStatusColor(timesheet.status)}
                        />
                      </Stack>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="h6">
                            {timesheet.totalHours.toFixed(1)} hrs
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            Earnings
                          </Typography>
                          <Typography variant="h6" color="primary">
                            ${timesheet.totalPay?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                      </Box>

                      {timesheet.notes && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2">
                            <Notes sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            {timesheet.notes}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              // Desktop Table Layout
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => handleSort('clockIn')}
                        >
                          <Typography fontWeight="bold">Date & Time</Typography>
                          {sort.field === 'clockIn' && (
                            sort.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">Client</Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => handleSort('workType')}
                        >
                          <Typography fontWeight="bold">Work Type</Typography>
                          {sort.field === 'workType' && (
                            sort.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => handleSort('totalHours')}
                        >
                          <Typography fontWeight="bold">Hours</Typography>
                          {sort.field === 'totalHours' && (
                            sort.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                          onClick={() => handleSort('totalPay')}
                        >
                          <Typography fontWeight="bold">Earnings</Typography>
                          {sort.field === 'totalPay' && (
                            sort.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">Status</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">Actions</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 7 }).map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton variant="text" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      timesheets.map((timesheet) => (
                        <TableRow
                          key={timesheet._id}
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedTimesheet(timesheet);
                            setOpenDetailModal(true);
                          }}
                        >
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {dayjs(timesheet.clockIn).format('MMM D, YYYY')}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {dayjs(timesheet.clockIn).format('h:mm A')} -
                                {timesheet.clockOut ? dayjs(timesheet.clockOut).format('h:mm A') : 'Active'}
                              </Typography>
                              {timesheet.location?.address && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                  <LocationOn sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="textSecondary">
                                    {timesheet.location.address.length > 30
                                      ? `${timesheet.location.address.substring(0, 30)}...`
                                      : timesheet.location.address
                                    }
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                                {timesheet.clientName?.charAt(0)}
                              </Avatar>
                              <Typography fontWeight="medium">{timesheet.clientName}</Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={getWorkTypeInfo(timesheet.workType).label}
                              size="small"
                              color={getWorkTypeInfo(timesheet.workType).color}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Box>
                              <Stack direction="row" spacing={0.75} alignItems="center">
                                {(!timesheet.clockOut) && (
                                  <Chip
                                    size="small"
                                    color="error"
                                    label="Active"
                                    sx={{
                                      height: 20,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      animation: 'blink 1.4s ease-in-out infinite',
                                      '@keyframes blink': {
                                        '0%': { opacity: 1 },
                                        '50%': { opacity: 0.7 },
                                        '100%': { opacity: 1 }
                                      }
                                    }}
                                  />
                                )}
                                {(timesheet.clockOut) && (
                                  <Typography variant="body2" fontWeight="medium">
                                    {timesheet.totalHours.toFixed(1)} hrs
                                  </Typography>
                                )}

                              </Stack>
                              {timesheet.breaks?.length > 0 && (
                                <Typography variant="caption" color="textSecondary">
                                  {timesheet.breaks.length} break(s)
                                </Typography>
                              )}
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" fontWeight="medium" color="primary">
                              ${timesheet.totalPay?.toFixed(2) || '0.00'}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <Chip
                                label={timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                                size="small"
                                color={getStatusColor(timesheet.status)}
                              />

                            </Stack>
                          </TableCell>

                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAnchorEl(e.currentTarget);
                                setSelectedTimesheet(timesheet);
                              }}
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}

                    {timesheets.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary" gutterBottom>
                              No timesheets found
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                              Start by clocking in or creating a new timesheet entry
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => setOpenTimesheetModal(true)}
                            >
                              Create Timesheet
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {timesheets.length > 0 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2
              }}>
                <Typography variant="body2" color="textSecondary">
                  Showing {((pagination.current - 1) * pagination.limit) + 1} to {
                    Math.min(pagination.current * pagination.limit, pagination.total)
                  } of {pagination.total} entries
                </Typography>

                <Pagination
                  count={pagination.pages}
                  page={pagination.current}
                  onChange={(e, page) => setPagination(prev => ({ ...prev, current: page }))}
                  shape="rounded"
                  size={isMobile ? 'small' : 'medium'}
                  color="primary"
                />
              </Box>
            )}
          </Card>
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem
            onClick={() => {
              setOpenDetailModal(true);
              setAnchorEl(null);
            }}
          >
            <Visibility sx={{ mr: 2 }} />
            View Details
          </MenuItem>

          {selectedTimesheet?.status === 'draft' && (
            <MenuItem
              onClick={() => {
                handleSubmitTimesheet(selectedTimesheet._id);
                setAnchorEl(null);
              }}
            >
              <Send sx={{ mr: 2 }} />
              Submit for Approval
            </MenuItem>
          )}

          {selectedTimesheet?.status === 'draft' && (
            <MenuItem
              onClick={() => {
                setOpenTimesheetModal(true);
                setTimesheetForm({
                  ...selectedTimesheet,
                  clockIn: new Date(selectedTimesheet.clockIn),
                  clockOut: selectedTimesheet.clockOut ? new Date(selectedTimesheet.clockOut) : null
                });
                setAnchorEl(null);
              }}
            >
              <Edit sx={{ mr: 2 }} />
              Edit
            </MenuItem>
          )}

          {selectedTimesheet?.status !== 'approved' && (
            <MenuItem
              onClick={() => {
                setOpenDeleteDialog(true);
                setAnchorEl(null);
              }}
              sx={{ color: 'error.main' }}
            >
              <Delete sx={{ mr: 2 }} />
              Delete
            </MenuItem>
          )}
          {selectedTimesheet?.status === 'draft' && (
            <MenuItem
              onClick={() => {
                setOpenBreakModal(true);
                setAnchorEl(null);
              }}
            >
              <PauseCircle sx={{ mr: 2 }} />
              Add Break
            </MenuItem>
          )}
          {selectedTimesheet?.status === 'draft' && (
            <MenuItem
              onClick={() => {
                setOpenProgressDrawer(true);
                setAnchorEl(null);
              }}
            >
              <EventNoteIcon sx={{ mr: 2 }} />
              Progress Note
            </MenuItem>
          )}

        </Menu>

        {/* Clock In Modal */}
        <Dialog
          open={openClockInModal}
          onClose={() => setOpenClockInModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PlayArrow sx={{ mr: 2, color: 'success.main' }} />
              Clock In
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={clockInData.clientName}
                  onChange={(e) => setClockInData({ ...clockInData, clientName: e.target.value })}
                  placeholder="Enter client name"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Work Type</InputLabel>
                  <Select
                    value={clockInData.workType}
                    onChange={(e) => setClockInData({ ...clockInData, workType: e.target.value })}
                    label="Work Type"
                  >
                    <MenuItem value="support">Support Work</MenuItem>
                    <MenuItem value="care">Care Services</MenuItem>
                    <MenuItem value="administrative">Administrative</MenuItem>
                    <MenuItem value="training">Training</MenuItem>
                    <MenuItem value="travel">Travel Time</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location Address"
                  value={clockInData.location.address}
                  onChange={(e) => setClockInData({
                    ...clockInData,
                    location: { ...clockInData.location, address: e.target.value }
                  })}
                  placeholder="Enter work location"
                  InputProps={{
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenClockInModal(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleClockIn}
              startIcon={<PlayArrow />}
              disabled={!clockInData.workType}
            >
              Start Clock
            </Button>
          </DialogActions>
        </Dialog>

        {/* Progress Note Drawer */}
        <ProgressNoteDrawer
          open={openProgressDrawer}
          onClose={() => setOpenProgressDrawer(false)}
          selectedTimesheet={selectedTimesheet}
          timesheet={selectedTimesheet}

        />

        {/* Create/Edit Timesheet Modal */}
        <Dialog
          open={openTimesheetModal}
          onClose={() => setOpenTimesheetModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Edit sx={{ mr: 2 }} />
              {timesheetForm?._id ? 'Edit Timesheet' : 'New Timesheet'}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={timesheetForm.clientName}
                  onChange={(e) => setTimesheetForm({ ...timesheetForm, clientName: e.target.value })}
                  placeholder="Enter client name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Clock In"
                  value={formatDateTimeLocal(timesheetForm.clockIn)}
                  onChange={(e) => setTimesheetForm({ ...timesheetForm, clockIn: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Clock Out (Optional)"
                  value={formatDateTimeLocal(timesheetForm.clockOut)}
                  onChange={(e) => setTimesheetForm({ ...timesheetForm, clockOut: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Work Type</InputLabel>
                  <Select
                    value={timesheetForm.workType}
                    onChange={(e) => setTimesheetForm({ ...timesheetForm, workType: e.target.value })}
                    label="Work Type"
                  >
                    <MenuItem value="support">Support</MenuItem>
                    <MenuItem value="care">Care</MenuItem>
                    <MenuItem value="administrative">Administrative</MenuItem>
                    <MenuItem value="training">Training</MenuItem>
                    <MenuItem value="travel">Travel</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Hourly Rate"
                  value={timesheetForm.hourlyRate}
                  onChange={(e) => setTimesheetForm({ ...timesheetForm, hourlyRate: Number(e.target.value) })}
                  inputProps={{ step: 0.01, min: 0 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={timesheetForm.notes}
                  onChange={(e) => setTimesheetForm({ ...timesheetForm, notes: e.target.value })}
                  placeholder="Add notes (optional)"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenTimesheetModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleSaveTimesheet}
              disabled={savingTimesheet || !timesheetForm.workType}
            >
              {savingTimesheet ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clock Out Modal */}
        <Dialog
          open={openClockOutModal}
          onClose={() => setOpenClockOutModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Stop sx={{ mr: 2, color: 'error.main' }} />
              Clock Out
            </Box>
          </DialogTitle>
          <DialogContent>
            {activeTimesheet && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Currently working:</strong>
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {activeTimesheet.clientName} - {getWorkTypeInfo(activeTimesheet.workType).label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Started at {dayjs(activeTimesheet.clockIn).format('h:mm A')} • Duration: {getElapsedTime()}
                </Typography>
                {activeTimesheet.location?.address && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    📍 {activeTimesheet.location.address}
                  </Typography>
                )}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Session Notes (Optional)"
              value={clockOutData.notes}
              onChange={(e) => setClockOutData({ ...clockOutData, notes: e.target.value })}
              placeholder="Add any notes about this work session..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenClockOutModal(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleClockOut}
              startIcon={<Stop />}
            >
              Clock Out
            </Button>
          </DialogActions>
        </Dialog>

        {/* Timesheet Detail Modal */}
        <Dialog
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Timesheet Details</Typography>
              <IconButton onClick={() => setOpenDetailModal(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedTimesheet && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Session Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Client</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedTimesheet.clientName}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Work Type</Typography>
                        <Chip
                          label={getWorkTypeInfo(selectedTimesheet.workType).label}
                          size="small"
                          color={getWorkTypeInfo(selectedTimesheet.workType).color}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
                        <Chip
                          label={selectedTimesheet.status.charAt(0).toUpperCase() + selectedTimesheet.status.slice(1)}
                          size="small"
                          color={getStatusColor(selectedTimesheet.status)}
                        />
                      </Box>
                      {selectedTimesheet.location?.address && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Location</Typography>
                          <Typography variant="body1">
                            📍 {selectedTimesheet.location.address}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: 'primary.50' }}>
                    <Typography variant="h6" gutterBottom color="primary">
                      Time & Earnings
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Date</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {dayjs(selectedTimesheet.clockIn).format('dddd, MMMM D, YYYY')}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Time Period</Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {dayjs(selectedTimesheet.clockIn).format('h:mm A')} - {
                            selectedTimesheet.clockOut
                              ? dayjs(selectedTimesheet.clockOut).format('h:mm A')
                              : 'Active'
                          }
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total Hours</Typography>
                        <Typography variant="h5" fontWeight="bold" color="primary">
                          {selectedTimesheet.totalHours.toFixed(1)} hrs
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Total Earnings</Typography>
                        <Typography variant="h5" fontWeight="bold" color="success.main">
                          ${selectedTimesheet.totalPay?.toFixed(2) || '0.00'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Grid>

                {selectedTimesheet.breaks && selectedTimesheet.breaks.length > 0 && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Breaks ({selectedTimesheet.breaks.length})
                      </Typography>
                      <Stack spacing={1}>
                        {selectedTimesheet.breaks.map((breakItem, index) => (
                          <Box
                            key={index}
                            sx={{
                              p: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <Box>
                              <Typography variant="body2">
                                {dayjs(breakItem.startTime).format('h:mm A')} - {dayjs(breakItem.endTime).format('h:mm A')}
                              </Typography>
                              {breakItem.reason && (
                                <Typography variant="caption" color="text.secondary">
                                  {breakItem.reason}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              label={`${breakItem.duration} min`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        ))}
                      </Stack>
                    </Card>
                  </Grid>
                )}

                {selectedTimesheet.notes && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Session Notes
                      </Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {selectedTimesheet.notes}
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            {selectedTimesheet?.status === 'draft' && (
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={() => {
                  handleSubmitTimesheet(selectedTimesheet._id);
                  setOpenDetailModal(false);
                }}
              >
                Submit for Approval
              </Button>
            )}
            <Button onClick={() => setOpenDetailModal(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Break Modal */}
        <Dialog
          open={openBreakModal}
          onClose={() => setOpenBreakModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PauseCircle sx={{ mr: 2, color: 'warning.main' }} />
              Add Break
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Break Start"
                  value={breakForm.startTime}
                  onChange={(e) => setBreakForm({ ...breakForm, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Break End"
                  value={breakForm.endTime}
                  onChange={(e) => setBreakForm({ ...breakForm, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Break Reason (Optional)"
                  value={breakForm.reason}
                  onChange={(e) => setBreakForm({ ...breakForm, reason: e.target.value })}
                  placeholder="e.g., Lunch break, Personal time"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenBreakModal(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddBreak}
              disabled={!breakForm.startTime || !breakForm.endTime}
            >
              Add Break
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ mr: 2, color: 'error.main' }} />
              Delete Timesheet
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this timesheet? This action cannot be undone.
            </Typography>
            {selectedTimesheet && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Client:</strong> {selectedTimesheet.clientName}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {dayjs(selectedTimesheet.clockIn).format('MMM D, YYYY')}
                </Typography>
                <Typography variant="body2">
                  <strong>Hours:</strong> {selectedTimesheet.totalHours.toFixed(1)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteTimesheet}
              startIcon={<Delete />}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            variant="filled"
            sx={{ borderRadius: 2 }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>

  );
};

export default WorkerTimesheet;