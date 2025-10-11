import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { format } from "date-fns";
import DocumentPreview from "../../../components/workerForm/Modals/DocumentPreview";
import { toast } from 'react-toastify';
import WorkerNavbar from "../../../components/Navbar/WorkerNavbar";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  Stack,
  Tooltip,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress,
  Switch,
} from "@mui/material";
import {
  School as SchoolIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteOutlineIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import WorkerDetailsHeader from '../../../components/workerDetails/WorkerDetailsHeader';
import WorkerDetailTabContent from '../../../components/workerDetails/WorkerDetailTabContent';
import AdminSidebar from "../../../components/adminSidebar/AdminSidebar";
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme, useMediaQuery, IconButton, Drawer } from "@mui/material";

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 8;

const getVerificationStatusColor = (status) => {
  switch (status) {
    case "Fully Verified": return "success";
    case "Partially Verified": return "warning";
    case "Unverified": return "error";
    default: return "default";
  }
};

const WorkerDetails = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [certificationStatus, setCertificationStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [verModalOpen, setVerModalOpen] = useState(false);
  const [verForm, setVerForm] = useState({
    identityVerified: workerData?.verificationStatus?.identityVerified || false,
    skillsVerified: workerData?.verificationStatus?.skillsVerified || false,
    backgroundCheckPassed: workerData?.verificationStatus?.backgroundCheckPassed || false,
  });
  const [verLoading, setVerLoading] = useState(false);
  const [verError, setVerError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const deleteTimeoutRef = useRef();
  // REMOVE: theme, isMobile, mobileSidebarOpen, setMobileSidebarOpen

  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/workers/${workerId}`);
        setWorkerData(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch worker details");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkerDetails();
  }, [workerId]);

  useEffect(() => {
    if (workerData) {
      setVerForm({
        identityVerified: workerData.verificationStatus.identityVerified,
        skillsVerified: workerData.verificationStatus.skillsVerified,
        backgroundCheckPassed: workerData.verificationStatus.backgroundCheckPassed,
      });
    }
  }, [workerData]);

  const handleBack = () => navigate(-1);
  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const formatDate = (dateString) => !dateString ? "N/A" : format(new Date(dateString), "MMM dd, yyyy");

  const renderAvailabilitySchedule = () => {
    const { customTimeSlots = [], suburb, kmWillingToTravel } = workerData.availability || {};
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const slotsByDay = daysOfWeek.reduce((acc, day) => { acc[day] = []; return acc; }, {});
    customTimeSlots.forEach(slot => { if (slotsByDay[slot.dayOfWeek]) slotsByDay[slot.dayOfWeek].push(slot); });
    return (
      <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'flex-start', sm: 'center' }} mb={3}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationIcon color="primary" />
            <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main' }}>{suburb || 'No suburb specified'}</Typography>
          </Stack>
          <Chip icon={<AccessTimeIcon />} label={`Willing to travel: ${kmWillingToTravel ? kmWillingToTravel + ' km' : 'N/A'}`} color="secondary" sx={{ fontWeight: 600, fontSize: 16 }} />
        </Stack>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          {daysOfWeek.map(day => (
            <Grid item xs={12} sm={6} md={4} key={day}>
              <Paper elevation={1} sx={{ p: 2, minHeight: 100, bgcolor: slotsByDay[day].length > 0 ? 'primary.light' : 'grey.100', color: slotsByDay[day].length > 0 ? 'primary.contrastText' : 'text.secondary', borderRadius: 2, boxShadow: slotsByDay[day].length > 0 ? 2 : 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">{day}</Typography>
                  <Badge badgeContent={slotsByDay[day].length} color={slotsByDay[day].length > 0 ? 'success' : 'default'} sx={{ ml: 1 }}><ScheduleIcon fontSize="small" /></Badge>
                </Stack>
                {slotsByDay[day].length > 0 ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {slotsByDay[day].map((slot, idx) => (
                      <Chip key={idx} icon={<AccessTimeIcon fontSize="small" />} label={`${slot.startTime} - ${slot.endTime}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'primary.main', fontWeight: 600, mb: 1 }} />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" mt={1}>No availability</Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Card>
    );
  };

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    setCertificationStatus(newStatus);
    
    // If status is Rejected, show rejection reason dialog
    if (newStatus === 'Rejected') {
      setShowRejectionDialog(true);
      return;
    }

    await updateCertificationStatus(newStatus);
  };

  const updateCertificationStatus = async (status, reason = '') => {
    try {
      setIsUpdating(true);

      // Make sure we have the certification type ID
      if (!selectedCertification?.certificationType?._id) {
        throw new Error('Certification type ID is missing');
      }

      const response = await api.put(
        `/admin/workers/${workerData?.user?._id}/certifications/${selectedCertification.certificationType._id}/status`,
        {
          verificationStatus: status,
          rejectionReason: reason
        }
      );
      
      // Update the local state with the new status
      setWorkerData(prevData => ({
        ...prevData,
        certifications: prevData.certifications.map(cert => 
          cert.certificationType._id === selectedCertification.certificationType._id
            ? { 
                ...cert, 
                verificationStatus: status,
                rejectionReason: reason
              }
            : cert
        )
      }));

      // Show success toast
      toast.success('Certification status updated successfully');
      
      // Close the certification dialog
      setSelectedCertification(null);
      setCertificationStatus('');
      setRejectionReason('');
      setShowRejectionDialog(false);

    } catch (error) {
      console.error('Failed to update certification status:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update certification status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectionSubmit = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    updateCertificationStatus('Rejected', rejectionReason);
  };

  const getOverallStatus = () => {
    const { identityVerified, skillsVerified, backgroundCheckPassed } = verForm;
    if (identityVerified && skillsVerified && backgroundCheckPassed) return "Fully Verified";
    if (identityVerified && skillsVerified) return "Partially Verified";
    return "Unverified";
  };

  const handleVerModalOpen = () => setVerModalOpen(true);
  const handleVerModalClose = () => { setVerModalOpen(false); setVerError(""); };
  const handleVerChange = (field) => (e) => {
    setVerForm((prev) => ({ ...prev, [field]: e.target.checked }));
  };
  const handleVerSave = async () => {
    setVerLoading(true);
    setVerError("");
    try {
      await api.patch(`/admin/workers/${workerData.user._id}/verification-status`, verForm);
      // Refetch worker data
      const response = await api.get(`/admin/workers/${workerData._id}`);
      setWorkerData(response.data.data);
      setVerModalOpen(false);
    } catch (err) {
      setVerError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setVerLoading(false);
    }
  };

  // Handler for deleting worker profile (production ready)
  const handleDeleteWorker = async () => {
    setDeleteLoading(true);
    
    try {
      // Show initial loading message
      toast.loading('Deleting worker profile and documents...', { id: 'delete-worker' });
      
      const response = await api.delete(`/admin/workers/${workerData.user._id}`);
      
      if (response.status === 200) {
        const { data } = response.data;
        
        // Show detailed success message based on what was deleted
        const deletionSummary = data.cloudinaryDeletions;
        let successMessage = 'Worker profile deleted successfully!';
        
        if (deletionSummary.cv === 'deleted' || 
            deletionSummary.certificationsDeleted > 0 || 
            deletionSummary.profileImage === 'deleted') {
          successMessage += ' All associated documents have been removed.';
        }
        
        // Dismiss loading toast and show success
        toast.dismiss('delete-worker');
        toast.success(successMessage);
        
        // Close modal first
        setDeleteModalOpen(false);
        
        // Navigate after ensuring all cleanup is complete
        // Add a small delay to ensure UI updates are processed
        setTimeout(() => {
          navigate('/admin-dashboard', { replace: true });
        }, 100);
        
      } else {
        throw new Error('Unexpected response status');
      }
      
    } catch (err) {
      // Dismiss loading toast
      toast.dismiss('delete-worker');
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to delete worker profile.';
      
      console.error('Delete worker error:', err);
      toast.error(errorMessage);
      
      // Don't navigate on error - let user retry or handle the issue
      
    } finally {
      setDeleteLoading(false);
    }
  };
  // Cleanup timeout on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f7fafd">
        <LoadingSpinner size="lg" text="Loading worker details..." fullPage={true} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f7fafd">
        <Card sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Error Loading Worker Details</AlertTitle>
            {error}
          </Alert>
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack} fullWidth>Go Back</Button>
        </Card>
      </Box>
    );
  }
  if (!workerData) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f7fafd">
        <Card sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Worker Not Found</AlertTitle>
            The requested worker details could not be found.
          </Alert>
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={handleBack} fullWidth>Go Back</Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f7fafd' }}>
      <WorkerNavbar />
      {/* Mobile menu icon */}
      {/* REMOVE: isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setMobileSidebarOpen(true)}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: 'white',
            boxShadow: 2,
            '&:hover': { backgroundColor: '#f5f5f5' }
          }}
        >
          <MenuIcon />
        </IconButton>
      ) */}
      {/* Sidebar - let AdminSidebar handle all responsiveness */}
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f7fafd' }}>
        {/* Sidebar - let AdminSidebar handle all responsiveness */}
        <Box sx={{
          width: { xs: '0px', md: `${SIDEBAR_WIDTH}px` },
          flexShrink: 0,
          zIndex: 1200,
          position: 'fixed',
          top: { xs: 56, md: 64 }, // adjust if your navbar height is different
          left: 0,
          height: `calc(100vh - 64px)`
        }}>
          <AdminSidebar topOffset={64} navigate={navigate} />
        </Box>
        {/* Main Content */}
        <Box
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
          <Container maxWidth="xl" sx={{ p: 0 }}>
            {/* Header Card */}
            <Card sx={{ mb: 3, p: { xs: 2, md: 3 }, borderRadius: 4, boxShadow: 4 }}>
              <WorkerDetailsHeader workerData={workerData} handleBack={handleBack} getVerificationStatusColor={getVerificationStatusColor} />
            </Card>
            {/* Tabs Card */}
            <Card sx={{ mb: 3, borderRadius: 4, boxShadow: 3 }}>
              <Box sx={{ px: { xs: 1, md: 2 }, pt: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tab label="Overview" />
                  <Tab label="Certifications" />
                  <Tab label="Availability" />
                  <Tab label="Health Information" />
                  <Tab label="References & Work History" />
                </Tabs>
              </Box>
              <Box sx={{ p: { xs: 1, md: 3 } }}>
                <WorkerDetailTabContent
                  activeTab={activeTab}
                  workerData={workerData}
                  setSelectedCertification={setSelectedCertification}
                  setSelectedDocument={setSelectedDocument}
                  renderAvailabilitySchedule={renderAvailabilitySchedule}
                  formatDate={formatDate}
                />
              </Box>
            </Card>
            {/* Status & Delete Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Tooltip title="Click to update verification status">
                  <Card sx={{ p: 2, borderRadius: 4, boxShadow: 3, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', transition: 'box-shadow 0.2s, background 0.2s', '&:hover': { boxShadow: 6, background: '#f5f5f5' } }} onClick={() => setVerModalOpen(true)}>
                    <Chip
                      label={workerData.verificationStatus.overall}
                      color={getVerificationStatusColor(workerData.verificationStatus.overall)}
                      icon={workerData.verificationStatus.overall === "Fully Verified" ? <VerifiedIcon /> : workerData.verificationStatus.overall === "Partially Verified" ? <WarningIcon /> : <ErrorIcon />}
                      sx={{ fontWeight: 'bold', fontSize: 16, px: 2, py: 1 }}
                    />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>Verification Status</Typography>
                      <Typography variant="body2" color="text.secondary">Click to update</Typography>
                    </Box>
                    <EditIcon color="action" />
                  </Card>
                </Tooltip>
              </Grid>
              <Grid item xs={12} md={6}>
                <Tooltip title="Delete this worker profile">
                  <Card sx={{ p: 2, borderRadius: 4, boxShadow: 3, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', transition: 'box-shadow 0.2s, background 0.2s', '&:hover': { boxShadow: 6, background: '#fff0f0' } }} onClick={() => setDeleteModalOpen(true)}>
                    <DeleteOutlineIcon sx={{ color: '#ff1744', fontSize: 32 }} />
                    <Box>
                      <Typography variant="subtitle2" color="#ff1744" sx={{ fontWeight: 700 }}>Delete Profile</Typography>
                      <Typography variant="body2" color="text.secondary">Permanently remove this worker and all their information</Typography>
                    </Box>
                  </Card>
                </Tooltip>
              </Grid>
            </Grid>
          </Container>
          {/* Modals and Dialogs (unchanged) */}
          {/* ... Place all your Dialogs and DocumentPreview here, outside Container for full width overlay ... */}
        </Box>
      </Box>
      {/* Dialogs and overlays (keep outside main content for proper overlay) */}
      {/* Modal for updating verification status */}
      <Dialog open={verModalOpen} onClose={handleVerModalClose} maxWidth="xs" fullWidth>
        <DialogTitle>Update Verification Status</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography>Identity Verified</Typography>
              <Switch checked={verForm.identityVerified} onChange={handleVerChange('identityVerified')} />
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography>Skills Verified</Typography>
              <Switch checked={verForm.skillsVerified} onChange={handleVerChange('skillsVerified')} />
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography>Background Check Passed</Typography>
              <Switch checked={verForm.backgroundCheckPassed} onChange={handleVerChange('backgroundCheckPassed')} />
            </Box>
            <Box mt={2} display="flex" alignItems="center" gap={2}>
              <Typography variant="subtitle2">Preview:</Typography>
              <Chip
                label={getOverallStatus()}
                color={getVerificationStatusColor(getOverallStatus())}
                icon={
                  getOverallStatus() === "Fully Verified" ? (
                    <VerifiedIcon />
                  ) : getOverallStatus() === "Partially Verified" ? (
                    <WarningIcon />
                  ) : (
                    <ErrorIcon />
                  )
                }
                sx={{ fontWeight: 'bold', fontSize: 16 }}
              />
            </Box>
            {verError && <Alert severity="error">{verError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleVerModalClose} disabled={verLoading}>Cancel</Button>
          <Button onClick={handleVerSave} variant="contained" disabled={verLoading} sx={{ minWidth: 100 }}>
            {verLoading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Rejection Reason Dialog */}
      <Dialog
        open={showRejectionDialog}
        onClose={() => {
          setShowRejectionDialog(false);
          setRejectionReason('');
          setCertificationStatus('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rejection Reason</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={isUpdating}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowRejectionDialog(false);
              setRejectionReason('');
              setCertificationStatus('');
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRejectionSubmit}
            variant="contained"
            color="error"
            disabled={isUpdating}
          >
            {isUpdating ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Preview */}
      {selectedDocument && (
        <DocumentPreview
          document={selectedDocument.doc ? selectedDocument.doc : selectedDocument}
          certificateData={selectedDocument.certificate}
          onClose={() => setSelectedDocument(null)}
        />
      )}

      {/* Delete Worker Profile Dialog */}
      <Dialog
        open={deleteModalOpen}
        onClose={() => !deleteLoading && setDeleteModalOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="delete-worker-dialog-title"
      >
        <DialogTitle id="delete-worker-dialog-title" sx={{ color: '#ff1744', fontWeight: 700, textAlign: 'center' }}>
          Delete Worker Profile
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={1}>
            <DeleteOutlineIcon sx={{ color: '#ff1744', fontSize: 48 }} />
            <Typography variant="h6" color="#ff1744" fontWeight={700} textAlign="center">
              This action is permanent!
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Are you sure you want to delete this worker profile? <br />
              <b>All information, certifications, and history will be deleted from the database.</b>
              <br />This cannot be undone.
            </Typography>
            {deleteLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <CircularProgress size={28} color="error" />
                <Typography sx={{ ml: 2 }} color="error">Deleting...</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setDeleteModalOpen(false)}
            variant="outlined"
            color="primary"
            sx={{ minWidth: 100, fontWeight: 600 }}
            disabled={deleteLoading}
          >
            No, Cancel
          </Button>
          <Button
            onClick={handleDeleteWorker}
            variant="contained"
            color="error"
            sx={{ minWidth: 100, fontWeight: 600 }}
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} color="inherit" /> : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Certification Details Dialog */}
      <Dialog
        open={Boolean(selectedCertification)}
        onClose={() => {
          setSelectedCertification(null);
          setCertificationStatus('');
          setRejectionReason('');
          setShowRejectionDialog(false);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 0,
            m: 1,
            maxWidth: { xs: '95vw', sm: 600 },
          },
        }}
      >
        {selectedCertification && (
          <Box>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 3,
                py: 2.5,
                bgcolor: 'primary.light',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={700}>
                  {selectedCertification.certificationType.name}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {selectedCertification.certificationType.description}
                </Typography>
              </Box>
              <Chip
                label={selectedCertification.verificationStatus}
                color={
                  selectedCertification.verificationStatus === 'Verified'
                    ? 'success'
                    : selectedCertification.verificationStatus === 'Rejected'
                    ? 'error'
                    : selectedCertification.verificationStatus === 'Expiring Soon'
                    ? 'warning'
                    : 'primary'
                }
                size="medium"
                sx={{ fontWeight: 600, fontSize: '1rem' }}
              />
            </Box>

            {/* Details & Actions */}
            <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
              <Grid container spacing={3}>
                {/* Details Section */}
                <Grid item xs={12} sm={7}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Details
                      </Typography>
                      <Grid container spacing={1}>
                        {selectedCertification.number && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Number:</strong> {selectedCertification.number}
                            </Typography>
                          </Grid>
                        )}
                        {selectedCertification.issuer && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Issuer:</strong> {selectedCertification.issuer}
                            </Typography>
                          </Grid>
                        )}
                        {selectedCertification.issuedDate && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Issued:</strong> {formatDate(selectedCertification.issuedDate)}
                            </Typography>
                          </Grid>
                        )}
                        {selectedCertification.expiryDate && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Expires:</strong> {formatDate(selectedCertification.expiryDate)}
                            </Typography>
                          </Grid>
                        )}
                        {selectedCertification.degree && (
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              <strong>Degree:</strong> {selectedCertification.degree}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                    {selectedCertification.documents && selectedCertification.documents.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Documents
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {selectedCertification.documents.map((doc, index) => (
                            <Button
                              key={index}
                              variant="outlined"
                              size="small"
                              startIcon={<DescriptionIcon />}
                              sx={{ mb: 1 }}
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedDocument({ doc, certificate: selectedCertification });
                              }}
                            >
                              {doc.fileName || `Document ${index + 1}`}
                            </Button>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Grid>
                {/* Actions Section */}
                <Grid item xs={12} sm={5}>
                  <Stack spacing={2} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
                    <FormControl fullWidth sx={{ minWidth: 180 }}>
                      <InputLabel id="certification-status-label">Status</InputLabel>
                      <Select
                        labelId="certification-status-label"
                        id="certification-status"
                        value={selectedCertification?.verificationStatus}
                        label="Status"
                        onChange={handleStatusChange}
                        disabled={isUpdating}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Verified">Verified</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                        <MenuItem value="Expiring Soon">Expiring Soon</MenuItem>
                        <MenuItem value="Expired">Expired</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      onClick={async () => {
                        if (!selectedCertification?.certificationType?._id) {
                          toast.error('Certification type ID is missing');
                          return;
                        }
                        try {
                          setIsUpdating(true);
                          console.log("WORKer id",workerData?.user?._id);
                          console.log("Certification Id",selectedCertification?.certificationType?._id)
                          await api.delete(`/admin/workers/${workerData.user._id}/certifications/${selectedCertification.certificationType._id}`);
                          toast.success('Certification deleted successfully');
                          // Remove the deleted certification from local state
                          setWorkerData(prevData => ({
                            ...prevData,
                            certifications: prevData.certifications.filter(cert => cert.certificationType._id !== selectedCertification.certificationType._id)
                          }));
                          setSelectedCertification(null);
                        } catch (error) {
                          toast.error(error.response?.data?.message || error.message || 'Failed to delete certification');
                        } finally {
                          setIsUpdating(false);
                        }
                      }}
                      variant="outlined"
                      color="error"
                      disabled={isUpdating}
                      sx={{ fontWeight: 600, borderRadius: 2, py: 1 }}
                    >
                      {isUpdating ? <CircularProgress size={20} color="error" /> : 'Delete'}
                    </Button>
                    {isUpdating && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            {/* Footer */}
            <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={() => {
                  setSelectedCertification(null);
                  setCertificationStatus('');
                  setRejectionReason('');
                  setShowRejectionDialog(false);
                }}
                disabled={isUpdating}
                variant="contained"
                color="primary"
                sx={{ fontWeight: 600, borderRadius: 2 }}
              >
                Close
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default WorkerDetails;