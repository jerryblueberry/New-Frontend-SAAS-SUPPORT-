import React, { useState, useMemo, useCallback } from 'react';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import AdminSidebar from '../../../components/adminSidebar/AdminSidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Container,
  useMediaQuery,
  Stack,
  Breadcrumbs,
  Link,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Button,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fade,
  LinearProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useClientDetails, useUpdateClient, useDeleteClient } from '../../../hooks/useClients';
import { toast } from 'react-toastify';

// Status ENUMS from backend model
const CLIENT_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'unverified', label: 'Unverified', color: 'warning' },
  { value: 'submitted', label: 'Submitted', color: 'info' },
  { value: 'verified', label: 'Verified', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
  { value: 'active', label: 'Active', color: 'success' },
];

// Status color mapping
const getStatusColor = (status) => {
  const statusOption = CLIENT_STATUS_OPTIONS.find(opt => opt.value === status);
  return statusOption?.color || 'default';
};

// Status label mapping
const getStatusLabel = (status) => {
  const statusOption = CLIENT_STATUS_OPTIONS.find(opt => opt.value === status);
  return statusOption?.label || status;
};

// Account type labels
const getAccountTypeLabel = (type) => {
  return type === 'individual' ? 'Individual' : 'Organization';
};

const ViewClientDetails = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const SIDEBAR_WIDTH = 280;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  // State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Fetch client details with optimized caching
  const { data, isLoading, isError, error, refetch, isFetching } = useClientDetails(id, {
    populateUser: 'true',
  });

  // Mutations
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  // Memoized client data
  const client = useMemo(() => data?.data, [data]);

  // Handlers with useCallback for optimization
  const handleBack = useCallback(() => {
    navigate('/admin/clients');
  }, [navigate]);

  const handleEdit = useCallback(() => {
    setEditFormData({
      status: client?.status || '',
      organizationName: client?.organizationName || '',
      ndisNumber: client?.ndisNumber || '',
    });
    setEditDialogOpen(true);
  }, [client]);

  const handleEditSubmit = useCallback(() => {
    updateClientMutation.mutate(
      { id, data: editFormData },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          toast.success('Client updated successfully');
        },
      }
    );
  }, [id, editFormData, updateClientMutation]);

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    deleteClientMutation.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        navigate('/admin/clients');
      },
    });
  }, [id, deleteClientMutation, navigate]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Quick status update handler (inline, no dialog)
  const handleStatusChange = useCallback(async (newStatus) => {
    if (newStatus === client?.status) return;
    
    setStatusUpdateLoading(true);
    updateClientMutation.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          setStatusUpdateLoading(false);
          toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
        },
        onError: () => {
          setStatusUpdateLoading(false);
        },
      }
    );
  }, [id, client?.status, updateClientMutation]);

  // Loading State
  if (isLoading) {
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
          <Box
            sx={{
              width: { xs: 0, md: SIDEBAR_WIDTH },
              flexShrink: 0,
              zIndex: theme.zIndex.drawer,
              position: 'fixed',
              top: { xs: 56, md: 64 },
              left: 0,
              height: `calc(100vh - 64px)`,
            }}
          >
            <AdminSidebar topOffset={64} navigate={navigate} />
          </Box>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              ml: { md: `${SIDEBAR_WIDTH}px` },
              p: { xs: 2, sm: 3, md: 3 },
              mt: { xs: 8, md: 10 },
            }}
          >
            <Container maxWidth="xl">
              <Stack spacing={3}>
                {/* Breadcrumbs Skeleton */}
                <Skeleton variant="text" width={300} height={24} />
                
                {/* Header Skeleton */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={40} />
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Skeleton variant="rounded" width={80} height={24} />
                        <Skeleton variant="rounded" width={100} height={24} />
                      </Stack>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rounded" width={40} height={36} />
                    <Skeleton variant="rounded" width={80} height={36} />
                    <Skeleton variant="rounded" width={90} height={36} />
                  </Stack>
                </Box>
                
                {/* Content Skeleton */}
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={8}>
                    <Stack spacing={3}>
                      {/* Basic Info Card Skeleton */}
                      <Paper elevation={2} sx={{ p: 3 }}>
                        <Skeleton variant="text" width={200} height={32} />
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={3}>
                          {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Grid item xs={12} sm={6} key={i}>
                              <Skeleton variant="text" width="40%" height={20} />
                              <Skeleton variant="text" width="80%" height={28} />
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                      
                      {/* Address Card Skeleton */}
                      <Paper elevation={2} sx={{ p: 3 }}>
                        <Skeleton variant="text" width={150} height={32} />
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={3}>
                          {[1, 2, 3, 4].map((i) => (
                            <Grid item xs={12} sm={i === 1 ? 12 : 4} key={i}>
                              <Skeleton variant="text" width="40%" height={20} />
                              <Skeleton variant="text" width="80%" height={28} />
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                      
                      {/* Preferences Card Skeleton */}
                      <Paper elevation={2} sx={{ p: 3 }}>
                        <Skeleton variant="text" width={180} height={32} />
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2}>
                          <Skeleton variant="text" width="100%" height={60} />
                          <Skeleton variant="text" width="100%" height={60} />
                        </Stack>
                      </Paper>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} lg={4}>
                    <Stack spacing={3}>
                      {/* Profile Completeness Skeleton */}
                      <Card elevation={2}>
                        <CardContent>
                          <Skeleton variant="text" width={150} height={24} />
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Skeleton variant="text" width={60} height={20} />
                              <Skeleton variant="text" width={40} height={20} />
                            </Box>
                            <Skeleton variant="rounded" width="100%" height={10} />
                          </Box>
                        </CardContent>
                      </Card>
                      
                      {/* Timeline Skeleton */}
                      <Card elevation={2}>
                        <CardContent>
                          <Skeleton variant="text" width={120} height={24} />
                          <Divider sx={{ my: 1.5 }} />
                          <Stack spacing={2}>
                            {[1, 2, 3].map((i) => (
                              <Box key={i}>
                                <Skeleton variant="text" width="50%" height={18} />
                                <Skeleton variant="text" width="90%" height={22} />
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                      
                      {/* Quick Stats Skeleton */}
                      <Card elevation={2}>
                        <CardContent>
                          <Skeleton variant="text" width={100} height={24} />
                          <Divider sx={{ my: 1.5 }} />
                          <Stack spacing={2}>
                            {[1, 2, 3, 4].map((i) => (
                              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Skeleton variant="text" width="50%" height={20} />
                                <Skeleton variant="text" width="30%" height={20} />
                              </Box>
                            ))}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Container>
          </Box>
        </Box>
      </>
    );
  }

  // Error State
  if (isError) {
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
          <Box
            sx={{
              width: { xs: 0, md: SIDEBAR_WIDTH },
              flexShrink: 0,
              zIndex: theme.zIndex.drawer,
              position: 'fixed',
              top: { xs: 56, md: 64 },
              left: 0,
              height: `calc(100vh - 64px)`,
            }}
          >
            <AdminSidebar topOffset={64} navigate={navigate} />
          </Box>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              ml: { md: `${SIDEBAR_WIDTH}px` },
              p: { xs: 2, sm: 3, md: 3 },
              mt: { xs: 8, md: 10 },
            }}
          >
            <Container maxWidth="xl">
              <Alert severity="error" action={
                <Button color="inherit" size="small" onClick={handleBack}>
                  Go Back
                </Button>
              }>
                {error?.response?.data?.message || 'Failed to load client details'}
              </Alert>
            </Container>
          </Box>
        </Box>
      </>
    );
  }

    return (
    <>
      <WorkerNavbar />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
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
          }}
        >
          <AdminSidebar topOffset={64} navigate={navigate} />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            ml: { md: `${SIDEBAR_WIDTH}px` },
            p: { xs: 2, sm: 3, md: 3 },
            mt: { xs: 8, md: 10 },
            minHeight: '100vh',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container maxWidth="xl" sx={{ py: isMobile ? 1 : 2, px: { xs: 0, sm: 2 } }}>
            {/* Header Section */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              {/* Breadcrumbs */}
              <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.875rem' }}>
                <Link
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  color="inherit"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                  Dashboard
                </Link>
                <Link
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  color="inherit"
                  onClick={handleBack}
                >
                  Client Management
                </Link>
                <Typography color="text.primary" fontSize="0.875rem">
                  {client?.organizationName || 'Client Details'}
                </Typography>
              </Breadcrumbs>

              {/* Page Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={handleBack} size="small" sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}>
                    <ArrowBackIcon />
                  </IconButton>
                  <Box>
                    <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={600} gutterBottom>
                      {client?.organizationName || 'Client Profile'}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Chip
                        label={getAccountTypeLabel(client?.accountType)}
                        size="small"
                        variant="outlined"
                        icon={<BusinessIcon />}
                      />
                      {client?.ndisNumber && (
                        <Chip
                          label={`NDIS: ${client.ndisNumber}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Tooltip title="Refresh">
                    <IconButton onClick={handleRefresh} disabled={isFetching} size="small">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    size="small"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    size="small"
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>

              {/* Loading Indicator */}
              {(isFetching || statusUpdateLoading) && (
                <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
              )}
            </Stack>

            {/* Quick Status Update Card */}
            <Fade in={true} timeout={300}>
              <Paper elevation={2} sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Current Status
                    </Typography>
                    <Chip
                      label={getStatusLabel(client?.status)}
                      color={getStatusColor(client?.status)}
                      size="medium"
                      sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={5}>
                    <FormControl fullWidth size="small" disabled={statusUpdateLoading || updateClientMutation.isPending}>
                      <InputLabel>Update Status</InputLabel>
                      <Select
                        value={client?.status || ''}
                        label="Update Status"
                        onChange={(e) => handleStatusChange(e.target.value)}
                        sx={{ bgcolor: 'white' }}
                      >
                        {CLIENT_STATUS_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={option.label}
                                color={option.color}
                                size="small"
                                sx={{ minWidth: 90 }}
                              />
                              {option.value === client?.status && (
                                <CheckCircleIcon fontSize="small" color="success" />
                              )}
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Last Updated: {client?.updatedAt ? new Date(client.updatedAt).toLocaleString() : 'N/A'}
                    </Typography>
                    {statusUpdateLoading && (
                      <Typography variant="caption" color="primary" display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
                        <CircularProgress size={12} />
                        Updating status...
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Fade>

            {/* Content Grid */}
            <Grid container spacing={3}>
              {/* Left Column - Main Information */}
              <Grid item xs={12} lg={8}>
                <Stack spacing={3}>
                  {/* Basic Information */}
                  <Paper elevation={2} sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
                    {isFetching && (
                      <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
                    )}
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="primary" />
                      Basic Information
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Organization Name
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {client?.organizationName || 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          NDIS Number
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {client?.ndisNumber || 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          ABN
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {client?.abn || 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          Account Type
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {getAccountTypeLabel(client?.accountType)}
                        </Typography>
                      </Grid>

                      {client?.user && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Email
                            </Typography>
                            <Typography variant="body1" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" color="action" />
                              {client.user.email || 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              User Role
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {client.user.role || 'N/A'}
                            </Typography>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Paper>

                  {/* Address & Emergency Contact */}
                  <Paper elevation={2} sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
                    {isFetching && (
                      <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
                    )}
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon color="primary" />
                      Contact Information
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2.5}>
                      {/* Address Section */}
                      {client?.address && (
                        <>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
                              ADDRESS
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                              Street
                            </Typography>
                            <Typography variant="body1" fontWeight={500} sx={{ fontSize: '0.9375rem' }}>
                              {client.address.street || 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} sm={4}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                              Suburb
                            </Typography>
                            <Typography variant="body1" fontWeight={500} sx={{ fontSize: '0.9375rem' }}>
                              {client.address.suburb || 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} sm={4}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                              State
                            </Typography>
                            <Typography variant="body1" fontWeight={500} sx={{ fontSize: '0.9375rem' }}>
                              {client.address.state || 'N/A'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} sm={4}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                              Postcode
                            </Typography>
                            <Typography variant="body1" fontWeight={500} sx={{ fontSize: '0.9375rem' }}>
                              {client.address.postcode || 'N/A'}
                            </Typography>
                          </Grid>
                        </>
                      )}

                      {/* Emergency Contact */}
                      {client?.emergencyContact && (
                        <>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, mb: 0.5, fontWeight: 600 }}>
                              EMERGENCY CONTACT
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                              Name
                            </Typography>
                            <Typography variant="body1" fontWeight={500} sx={{ fontSize: '0.9375rem' }}>
                              {client.emergencyContact.name || 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                              Phone
                            </Typography>
                            <Typography variant="body1" fontWeight={500} sx={{ fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              {client.emergencyContact.phone || 'N/A'}
                            </Typography>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Paper>

                  {/* Service Preferences */}
                  {client?.preferences && (
                    <Paper elevation={2} sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
                      {isFetching && (
                        <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
                      )}
                      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <InfoIcon color="primary" />
                        Service Preferences
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      
                      <Stack spacing={2.5}>
                        {/* Support Categories & Service Regions */}
                        <Grid container spacing={2}>
                          {client.preferences.supportCategories && client.preferences.supportCategories.length > 0 && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8125rem', fontWeight: 600 }}>
                                Support Categories ({client.preferences.supportCategories.length})
                              </Typography>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {client.preferences.supportCategories.map((category, index) => (
                                  <Chip 
                                    key={index} 
                                    label={category.replace(/_/g, ' ')} 
                                    size="small" 
                                    variant="outlined" 
                                    sx={{ mb: 0.5, fontSize: '0.75rem', textTransform: 'capitalize' }} 
                                  />
                                ))}
                              </Stack>
                            </Grid>
                          )}

                          {client.preferences.serviceRegions && client.preferences.serviceRegions.length > 0 && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8125rem', fontWeight: 600 }}>
                                Service Regions ({client.preferences.serviceRegions.length})
                              </Typography>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {client.preferences.serviceRegions.map((region, index) => (
                                  <Chip 
                                    key={index} 
                                    label={region} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                    sx={{ mb: 0.5, fontSize: '0.75rem' }} 
                                  />
                                ))}
                              </Stack>
                            </Grid>
                          )}
                        </Grid>

                        {/* Special Requirements */}
                        {client.preferences.specialRequirements && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                              Special Requirements
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, fontSize: '0.9375rem' }}>
                              {client.preferences.specialRequirements}
                            </Typography>
                          </Box>
                        )}

                        <Divider />

                        {/* Worker Preferences */}
                        {client.preferences.workerPreferences && (
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem' }}>
                              Worker Preferences
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                  Gender
                                </Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                  {client.preferences.workerPreferences.preferredGender || 'N/A'}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={4}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                  Age Group
                                </Typography>
                                <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                                  {client.preferences.workerPreferences.preferredAgeGroup || 'N/A'}
                                </Typography>
                              </Grid>
                              {client.preferences.workerPreferences.preferredExperienceAreas && client.preferences.workerPreferences.preferredExperienceAreas.length > 0 && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8125rem' }}>
                                    Experience Areas
                                  </Typography>
                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {client.preferences.workerPreferences.preferredExperienceAreas.map((area, index) => (
                                      <Chip key={index} label={area} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                                    ))}
                                  </Stack>
                                </Grid>
                              )}
                              {client.preferences.workerPreferences.notes && (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                    Notes
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                    {client.preferences.workerPreferences.notes}
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        )}

                        {/* Service Delivery */}
                        {client.preferences.serviceDelivery && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem' }}>
                                Service Delivery
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Stack direction="row" spacing={1}>
                                    {client.preferences.serviceDelivery.inPerson && (
                                      <Chip label="In-Person" size="small" color="success" variant="outlined" />
                                    )}
                                    {client.preferences.serviceDelivery.remote && (
                                      <Chip label="Remote" size="small" color="info" variant="outlined" />
                                    )}
                                  </Stack>
                                </Grid>
                                {client.preferences.serviceDelivery.sessionDurationMins && (
                                  <Grid item xs={6} sm={4}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                      Session Duration
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                                      {client.preferences.serviceDelivery.sessionDurationMins} mins
                                    </Typography>
                                  </Grid>
                                )}
                                {client.preferences.serviceDelivery.preferredStartDate && (
                                  <Grid item xs={6} sm={4}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                      Preferred Start
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                                      {new Date(client.preferences.serviceDelivery.preferredStartDate).toLocaleDateString()}
                                    </Typography>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          </>
                        )}
                      </Stack>
                    </Paper>
                  )}

                  {/* Cultural Preferences & Availability */}
                  {(client?.preferences?.culturalPreferences || client?.preferences?.availability) && (
                    <Paper elevation={2} sx={{ p: 3, position: 'relative', overflow: 'hidden' }}>
                      {isFetching && (
                        <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
                      )}
                      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon color="primary" />
                        Cultural & Availability
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      
                      <Stack spacing={2.5}>
                        {/* Dietary Requirements */}
                        {client.preferences?.culturalPreferences?.dietaryRequirements && (
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem' }}>
                              Dietary Requirements
                            </Typography>
                            {client.preferences.culturalPreferences.dietaryRequirements.restrictions && client.preferences.culturalPreferences.dietaryRequirements.restrictions.length > 0 && (
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                                {client.preferences.culturalPreferences.dietaryRequirements.restrictions.map((restriction, index) => (
                                  <Chip 
                                    key={index} 
                                    label={restriction.replace(/_/g, ' ')} 
                                    size="small" 
                                    color="warning" 
                                    variant="outlined" 
                                    sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }} 
                                  />
                                ))}
                              </Stack>
                            )}
                            {client.preferences.culturalPreferences.dietaryRequirements.allergyDetails && (
                              <Typography variant="body2" sx={{ fontSize: '0.875rem', mt: 0.5 }}>
                                <strong>Allergies:</strong> {client.preferences.culturalPreferences.dietaryRequirements.allergyDetails}
                              </Typography>
                            )}
                            {client.preferences.culturalPreferences.dietaryRequirements.notes && (
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mt: 0.5 }}>
                                {client.preferences.culturalPreferences.dietaryRequirements.notes}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Religious Considerations */}
                        {client.preferences?.culturalPreferences?.religiousConsiderations && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem' }}>
                                Religious Considerations
                              </Typography>
                              <Grid container spacing={1.5}>
                                {client.preferences.culturalPreferences.religiousConsiderations.faith && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                      Faith
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                                      {client.preferences.culturalPreferences.religiousConsiderations.faith}
                                    </Typography>
                                  </Grid>
                                )}
                                {client.preferences.culturalPreferences.religiousConsiderations.genderSensitivity && (
                                  <Grid item xs={12} sm={6}>
                                    <Chip label="Gender Sensitivity Required" size="small" color="info" />
                                  </Grid>
                                )}
                                {client.preferences.culturalPreferences.religiousConsiderations.observances && client.preferences.culturalPreferences.religiousConsiderations.observances.length > 0 && (
                                  <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 0.5 }}>
                                      Observances
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                      {client.preferences.culturalPreferences.religiousConsiderations.observances.map((obs, index) => (
                                        <Chip key={index} label={obs} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                                      ))}
                                    </Stack>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          </>
                        )}

                        {/* Lifestyle Notes */}
                        {client.preferences?.culturalPreferences?.lifestyleNotes && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem' }}>
                                Lifestyle & Interests
                              </Typography>
                              <Grid container spacing={1.5}>
                                {client.preferences.culturalPreferences.lifestyleNotes.habits && client.preferences.culturalPreferences.lifestyleNotes.habits.length > 0 && (
                                  <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 0.5 }}>
                                      Habits
                                    </Typography>
                                    {client.preferences.culturalPreferences.lifestyleNotes.habits.map((habit, index) => (
                                      <Typography key={index} variant="body2" sx={{ fontSize: '0.875rem' }}>• {habit}</Typography>
                                    ))}
                                  </Grid>
                                )}
                                {client.preferences.culturalPreferences.lifestyleNotes.interests && client.preferences.culturalPreferences.lifestyleNotes.interests.length > 0 && (
                                  <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 0.5 }}>
                                      Interests
                                    </Typography>
                                    {client.preferences.culturalPreferences.lifestyleNotes.interests.map((interest, index) => (
                                      <Typography key={index} variant="body2" sx={{ fontSize: '0.875rem' }}>• {interest}</Typography>
                                    ))}
                                  </Grid>
                                )}
                                {client.preferences.culturalPreferences.lifestyleNotes.values && client.preferences.culturalPreferences.lifestyleNotes.values.length > 0 && (
                                  <Grid item xs={12} sm={4}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 0.5 }}>
                                      Values
                                    </Typography>
                                    {client.preferences.culturalPreferences.lifestyleNotes.values.map((value, index) => (
                                      <Typography key={index} variant="body2" sx={{ fontSize: '0.875rem' }}>• {value}</Typography>
                                    ))}
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          </>
                        )}

                        {/* Availability */}
                        {client.preferences?.availability && client.preferences.availability.length > 0 && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem' }}>
                                Availability Schedule
                              </Typography>
                              <Stack spacing={1}>
                                {client.preferences.availability.map((avail, index) => (
                                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip 
                                      label={avail.day.toUpperCase()} 
                                      size="small" 
                                      color="primary" 
                                      sx={{ minWidth: 50, fontWeight: 600, fontSize: '0.75rem' }} 
                                    />
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                      {avail.timeSlots && avail.timeSlots.map((slot, idx) => (
                                        <Chip 
                                          key={idx} 
                                          label={slot} 
                                          size="small" 
                                          variant="outlined" 
                                          sx={{ fontSize: '0.7rem', textTransform: 'capitalize' }} 
                                        />
                                      ))}
                                    </Stack>
                                  </Box>
                                ))}
                              </Stack>
                            </Box>
                          </>
                        )}
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              </Grid>

              {/* Right Column - Metadata & Stats */}
              <Grid item xs={12} lg={4}>
                <Stack spacing={3}>
                  {/* Profile Completeness */}
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Profile Completeness
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {client?.profileCompleteness?.percentage || 0}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 10,
                            bgcolor: 'grey.200',
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${client?.profileCompleteness?.percentage || 0}%`,
                              height: '100%',
                              bgcolor: client?.profileCompleteness?.percentage >= 80 ? 'success.main' : 'warning.main',
                              transition: 'width 0.3s',
                            }}
                          />
                        </Box>
                        
                        {client?.profileCompleteness?.missingFields && client.profileCompleteness.missingFields.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Missing Fields
                            </Typography>
                            <List dense>
                              {client.profileCompleteness.missingFields.slice(0, 5).map((field, index) => (
                                <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <InfoIcon fontSize="small" color="warning" />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={field}
                                    primaryTypographyProps={{ variant: 'caption' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Timestamps */}
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon fontSize="small" />
                        Timeline
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Created At
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {client?.createdAt ? new Date(client.createdAt).toLocaleString() : 'N/A'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Last Updated
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {client?.updatedAt ? new Date(client.updatedAt).toLocaleString() : 'N/A'}
                          </Typography>
                        </Box>

                        {client?.lastModifiedAt && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Last Modified
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {new Date(client.lastModifiedAt).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card elevation={2}>
                    <CardContent sx={{ pb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem' }}>
                        Quick Stats
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Stack spacing={1.5}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                            Status
                          </Typography>
                          <Chip
                            label={getStatusLabel(client?.status)}
                            color={getStatusColor(client?.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize', fontSize: '0.75rem', height: 22 }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                            Account Type
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8125rem' }}>
                            {getAccountTypeLabel(client?.accountType)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                            Progress Step
                          </Typography>
                          <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8125rem' }}>
                            {client?.progressStep || 0} / 2
                          </Typography>
                        </Box>

                        {client?.preferences?.supportCategories && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                              Support Categories
                            </Typography>
                            <Chip 
                              label={client.preferences.supportCategories.length} 
                              size="small" 
                              color="primary" 
                              sx={{ fontSize: '0.75rem', height: 22, minWidth: 32 }}
                            />
                          </Box>
                        )}

                        {client?.preferences?.serviceRegions && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                              Service Regions
                            </Typography>
                            <Chip 
                              label={client.preferences.serviceRegions.length} 
                              size="small" 
                              color="primary" 
                              sx={{ fontSize: '0.75rem', height: 22, minWidth: 32 }}
                            />
                          </Box>
                        )}

                        {client?.preferences?.availability && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                              Availability Days
                            </Typography>
                            <Chip 
                              label={client.preferences.availability.length} 
                              size="small" 
                              color="success" 
                              sx={{ fontSize: '0.75rem', height: 22, minWidth: 32 }}
                            />
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Verification Info */}
                  {(client?.verifiedAt || client?.lastModifiedBy) && (
                    <Card elevation={2}>
                      <CardContent sx={{ pb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CheckCircleIcon fontSize="small" color="success" />
                          Verification Details
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Stack spacing={1.5}>
                          {client?.verifiedAt && (
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                Verified At
                              </Typography>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8125rem' }}>
                                {new Date(client.verifiedAt).toLocaleString()}
                              </Typography>
                            </Box>
                          )}

                          {client?.verifiedBy && (
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                Verified By
                              </Typography>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8125rem' }}>
                                Admin ID: {client.verifiedBy}
                              </Typography>
                            </Box>
                          )}

                          {client?.lastModifiedBy && (
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                                Last Modified By
                              </Typography>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8125rem' }}>
                                Admin ID: {client.lastModifiedBy}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => !updateClientMutation.isPending && setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon color="primary" />
          Edit Client Information
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Organization Name"
              value={editFormData.organizationName || ''}
              onChange={(e) => setEditFormData({ ...editFormData, organizationName: e.target.value })}
              fullWidth
              size="small"
              disabled={updateClientMutation.isPending}
            />
            <TextField
              label="NDIS Number"
              value={editFormData.ndisNumber || ''}
              onChange={(e) => setEditFormData({ ...editFormData, ndisNumber: e.target.value })}
              fullWidth
              size="small"
              disabled={updateClientMutation.isPending}
            />
            <FormControl fullWidth size="small" disabled={updateClientMutation.isPending}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editFormData.status || ''}
                label="Status"
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              >
                {CLIENT_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={option.label}
                        color={option.color}
                        size="small"
                        sx={{ minWidth: 90 }}
                      />
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setEditDialogOpen(false)} 
            disabled={updateClientMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            disabled={updateClientMutation.isPending}
            startIcon={updateClientMutation.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {updateClientMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => !deleteClientMutation.isPending && setDeleteDialogOpen(false)} 
        maxWidth="xs" 
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
          <DeleteIcon />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will soft-delete the client profile and deactivate the associated user account.
          </Alert>
          <Typography>
            Are you sure you want to delete <strong>{client?.organizationName}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            The data will be marked as deleted but can be recovered by administrators if needed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={deleteClientMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteClientMutation.isPending}
            startIcon={deleteClientMutation.isPending ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleteClientMutation.isPending ? 'Deleting...' : 'Delete Client'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewClientDetails;
