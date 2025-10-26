import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../api/axios';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Chip,
  Tooltip,
  IconButton,
  Avatar,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Badge,
  FormControl,
  MenuItem,
  Select,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  Email,
  Visibility,
  Sync,
  CheckCircle,
  PendingActions,
  HourglassEmpty,
  Error,
  Person,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import AdminSidebar from '../../../components/adminSidebar/AdminSidebar';
import ReferenceSummaryCard from '../../../components/AdminReference/ReferenceSummaryCard';
import ReferenceDetailsModal from '../../../components/ReferenceDetailsModal/ReferenceDetailsModal';

// Status configuration
const STATUS_CONFIG = {
  Pending: { color: 'warning', icon: PendingActions, label: 'Pending' },
  EmailSent: { color: 'info', icon: Email, label: 'Email Sent' },
  Viewed: { color: 'primary', icon: Visibility, label: 'Viewed' },
  InProgress: { color: 'secondary', icon: HourglassEmpty, label: 'In Progress' },
  Completed: { color: 'success', icon: CheckCircle, label: 'Completed' },
  Rejected: { color: 'error', icon: Error, label: 'Rejected' },
  Expired: { color: 'default', icon: HourglassEmpty, label: 'Expired' },
  Bounced: { color: 'error', icon: Error, label: 'Bounced' }
};

// Custom styled components
const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'Completed' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark
  }),
  ...(status === 'Pending' && {
    backgroundColor: theme.palette.warning.light,
    color: 'white'
  }),
  ...(status === 'EmailSent' && {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.dark
  }),
  ...(status === 'Error' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark
  })
}));

const ProgressBar = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    ...(value < 30 && { backgroundColor: theme.palette.error.main }),
    ...(value >= 30 && value < 70 && { backgroundColor: theme.palette.warning.main }),
    ...(value >= 70 && { backgroundColor: theme.palette.success.main })
  }
}));

const AdminReference = () => {
  const { workerId } = useParams();
  const [references, setReferences] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [selectedReference, setSelectedReference] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [totals, setTotals] = useState({ total: 0, completed: 0, pending: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [workerDetail, setWorkerDetail] = useState([]);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedReferenceForStatus, setSelectedReferenceForStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReferenceForDelete, setSelectedReferenceForDelete] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Fetch references for the worker
  const fetchReferences = () => {
    if (!workerId) return;
    setLoading(true);
    setError('');
    api.get(`/references/worker/${workerId}`)
      .then(res => {
        setReferences(res.data.references || []);
        setSummary(res.data.summary || []);
        setWorkerDetail(res.data.worker)
        setTotals({
          total: res.data.totalReferences || 0,
          completed: res.data.completedReferences || 0,
          pending: res.data.pendingReferences || 0
        });
      })
      .catch(() => setError('Failed to fetch references'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReferences();
    // eslint-disable-next-line
  }, [workerId]);

  // Sync references
  const handleSync = () => {
    setSyncing(true);
    api.post('/references/sync', { workerProfileId: workerId, questionnaireId: '686800b0d5b8997db68fd94b' })
      .then(() => {
        setSnackbar({ open: true, message: 'References synced successfully!', severity: 'success' });
        fetchReferences();
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to sync references', severity: 'error' }))
      .finally(() => setSyncing(false));
  };

  // Send reference email
  const handleSendEmail = (id) => {
    api.post(`/references/${id}/send-email`)
      .then((response) => setSnackbar({ 
        open: true, 
        message: response.data?.message || 'Email sent successfully!', 
        severity: 'success' 
      }))
      .catch((error) => {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to send email';
        console.error('Error sending email:', error);
        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: 'error' 
        });
      });
  };

  const handleOpenStatusModal = (reference) => {
    setSelectedReferenceForStatus(reference);
    setSelectedStatus(reference.status);
    setStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setStatusModalOpen(false);
    setSelectedReferenceForStatus(null);
    setSelectedStatus('');
  };

  const handleOpenDeleteModal = (reference) => {
    setSelectedReferenceForDelete(reference);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedReferenceForDelete(null);
  };

  const handleConfirmDelete = () => {
    if (selectedReferenceForDelete) {
      api.delete(`/references/${selectedReferenceForDelete._id}`)
        .then((response) => {
          setSnackbar({ 
            open: true, 
            message: 'Reference deleted successfully!', 
            severity: 'success' 
          });
          fetchReferences(); // Refresh the data
          handleCloseDeleteModal();
        })
        .catch((error) => {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete reference';
          console.error('Error deleting reference:', error);
          setSnackbar({ 
            open: true, 
            message: errorMessage, 
            severity: 'error' 
          });
        });
    }
  };

  // View reference details
  const handleView = (ref) => {
    setSelectedReference(ref);
    setModalOpen(true);
    setActiveTab(0);
  };

  // Status icon helper
  const statusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle color="success" />;
      case 'Pending': return <PendingActions color="white" />;
      case 'EmailSent': return <HourglassEmpty color="info" />;
      default: return <Error color="error" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <WorkerNavbar />
      <AdminSidebar />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 10,
          p: 2,
          ml: { xs: 0, md: '0px' }, // Account for sidebar width
          width: { xs: '100%', md: `calc(100% - 280px)` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Stack direction={isMobile ? 'column' : 'row'} alignItems="center" justifyContent="space-between" spacing={2} mb={1}>
          <Stack>
            <Stack direction='row' alignItems='center' spacing={1} sx={{
              justifyContent: { xs: "center" }
            }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, fontSize: { xs: '22px' } }}>
                {workerDetail?.fullName}
              </Typography>
              <Stack direction="row" spacing={1}>
                {summary.map((s) => (
                  <Badge key={s._id} badgeContent={s.count} color="primary" sx={{ mb: 1 }}>
                    <StatusChip
                      status={s._id}
                      label={s._id}
                      icon={statusIcon(s._id)}
                      size="medium"
                      sx={{
                        fontSize: { xs: '12px' }
                      }}
                    />
                  </Badge>
                ))}
              </Stack>

            </Stack>


            <Stack direction='row' alignItems='center' spacing={0.5}>
              <Email sx={{
                fontSize: '19px'
              }} />
              <Typography>
                {workerDetail?.email}
              </Typography>

            </Stack>

          </Stack>





          <Button
            variant="contained"
            color="primary"
            onClick={handleSync}
            disabled={syncing || !workerId}
            startIcon={<Sync />}
            sx={{ minWidth: 180 }}
          >

            {syncing ? <CircularProgress size={24} color="inherit" /> : 'Sync References'}
          </Button>



        </Stack>





        
        <ReferenceSummaryCard totals={totals}/>

     

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Paper elevation={2} sx={{ overflow: 'hidden' }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                    {!isMobile && <TableCell sx={{ fontWeight: 600 }}>Company</TableCell>}
                    {!isTablet && <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>}
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                    {!isMobile && <TableCell sx={{ fontWeight: 600 }}>Last Contact</TableCell>}
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(references) && references.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          No references found for this worker
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : Array.isArray(references) ? (
                    references.map(ref => (
                      <TableRow key={ref._id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.light }}>
                              {ref.referenceInfo?.name?.charAt(0) || <Person />}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{ref.referenceInfo?.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {ref.referenceInfo?.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Typography>{ref.referenceInfo?.company || '—'}</Typography>
                          </TableCell>
                        )}
                        {!isTablet && (
                          <TableCell>
                            <Typography>{ref.referenceInfo?.position || '—'}</Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <StatusChip
                            status={ref.status}
                            label={ref.status}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: '60px' }}>
                              <ProgressBar
                                variant="determinate"
                                value={ref.progress?.percentageComplete ?? 0}
                              />
                            </Box>
                            <Typography variant="body2">
                              {ref.progress?.percentageComplete ?? 0}%
                            </Typography>
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Typography variant="body2">
                              {ref.emailTracking?.lastEmailSent
                                ? formatDate(ref.emailTracking.lastEmailSent)
                                : '—'}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View Details">
                              <IconButton
                                onClick={() => handleView(ref)}
                                color="primary"
                                size="small"
                              >
                                <Visibility fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send Reminder">
                              <IconButton
                                onClick={() => handleSendEmail(ref._id)}
                                color="secondary"
                                size="small"
                              >
                                <Email fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Status">
                              <IconButton
                                onClick={() => handleOpenStatusModal(ref)}
                                color="info"
                                size="small"
                              >
                                <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Reference">
                              <IconButton
                                onClick={() => handleOpenDeleteModal(ref)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="subtitle1" color="text.secondary">
                          Error loading references
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: '100%' }}
            elevation={6}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Reference Details Modal */}
        <ReferenceDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          reference={selectedReference}
          onSendEmail={handleSendEmail}
          showEmailTracking={true}
          showVerificationTab={true}
          verificationContent={
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Overall verification for this reference
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <Select
                  value=""
                  displayEmpty
                  variant="outlined"
                >
                  <MenuItem value="">
                    <em>Select verification status</em>
                  </MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Box>
          }
        />

        {/* Status Update Modal */}
        <Dialog
          open={statusModalOpen}
          onClose={handleCloseStatusModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <EditIcon />
              <Typography variant="h6">Update Reference Status</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {selectedReferenceForStatus && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Update status for: <strong>{selectedReferenceForStatus.referenceInfo?.name}</strong>
                </Typography>
                
                <FormControl component="fieldset">
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                    Select New Status:
                  </Typography>
                  <RadioGroup
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <FormControlLabel
                          key={key}
                          value={key}
                          control={<Radio />}
                          label={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <IconComponent fontSize="small" color={config.color} />
                              <Typography>{config.label}</Typography>
                            </Stack>
                          }
                          sx={{ mb: 1 }}
                        />
                      );
                    })}
                  </RadioGroup>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseStatusModal} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                // TODO: Implement status update logic
                console.log('Status update not implemented yet');
                handleCloseStatusModal();
              }} 
              variant="contained" 
              disabled={!selectedStatus}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <DeleteIcon color="error" />
              <Typography variant="h6">Delete Reference</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            {selectedReferenceForDelete && (
              <Box sx={{ pt: 2 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Are you sure you want to delete this reference?
                </Typography>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'grey.50', 
                  borderRadius: 1, 
                  border: '1px solid', 
                  borderColor: 'grey.200' 
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Reference Details:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Name:</strong> {selectedReferenceForDelete.referenceInfo?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {selectedReferenceForDelete.referenceInfo?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Company:</strong> {selectedReferenceForDelete.referenceInfo?.company || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Status:</strong> {selectedReferenceForDelete.status}
                  </Typography>
                </Box>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This action cannot be undone. The reference will be permanently deleted from the database.
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDeleteModal} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete} 
              variant="contained" 
              color="error"
              startIcon={<DeleteIcon />}
            >
              Delete Reference
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default AdminReference;