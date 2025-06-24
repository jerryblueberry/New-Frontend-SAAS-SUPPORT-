import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { format } from "date-fns";
import DocumentPreview from "../../../components/workerForm/Modals/DocumentPreview";
import { toast } from 'react-toastify';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Alert,
  AlertTitle,
  Tabs,
  Tab,
  LinearProgress,
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
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Language as LanguageIcon,
  Work as WorkIcon,
  HealthAndSafety as HealthIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  LocationOn as LocationIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import "./WorkerDetails.css";

const getVerificationStatusColor = (status) => {
  switch (status) {
    case "Fully Verified":
      return "success";
    case "Partially Verified":
      return "warning";
    case "Unverified":
      return "error";
    default:
      return "default";
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
  const deleteTimeoutRef = useRef(); // For cleanup

  console.log("workerData",workerData?.CV);
  console.log("workerData",workerData);
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  console.log("SELECTED CERTS",selectedCertification?.verificationStatus);

  const renderAvailabilitySchedule = () => {
    return (
      <Grid container spacing={2}>
        {workerData.availability.weeklySchedule.map((day) => (
          <Grid item xs={12} sm={6} md={4} key={day.day}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: day.slots.length > 0 ? "primary.light" : "grey.100",
                color: day.slots.length > 0 ? "primary.contrastText" : "text.secondary",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                {day.day}
              </Typography>
              {day.slots.length > 0 ? (
                <Stack direction="row" spacing={1} mt={1}>
                  {day.slots.map((slot, index) => (
                    <Chip
                      key={index}
                      label={slot}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)" }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2">Not Available</Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
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
      <Box className="worker-details-loading">
        <LoadingSpinner size="lg" text="Loading worker details..." fullPage={true} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="worker-details-error">
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error Loading Worker Details</AlertTitle>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!workerData) {
    return (
      <Box className="worker-details-not-found">
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Worker Not Found</AlertTitle>
          The requested worker details could not be found.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section with Profile Summary */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: "primary.main", color: "primary.contrastText" }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ color: "inherit", borderColor: "rgba(255,255,255,0.5)" }}
              >
                Back to Workers
              </Button>
              <Chip
                label={workerData.verificationStatus.overall}
                color={getVerificationStatusColor(workerData.verificationStatus.overall)}
                icon={
                  workerData.verificationStatus.overall === "Fully Verified" ? (
                    <VerifiedIcon />
                  ) : workerData.verificationStatus.overall === "Partially Verified" ? (
                    <WarningIcon />
                  ) : (
                    <ErrorIcon />
                  )
                }
              />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {workerData.user.firstName} {workerData.user.lastName}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon />
                <Typography>{workerData.user.email}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon />
                <Typography>{workerData.user.phone || "Not provided"}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AttachMoneyIcon />
                <Typography>${workerData.expectedHourlyRate}/hr</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: "secondary.main",
                  fontSize: "3rem",
                }}
              >
                {workerData.user.firstName[0]}
              </Avatar>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Content Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Overview" />
          <Tab label="Certifications" />
          <Tab label="Availability" />
          <Tab label="Health Information" />
          <Tab label="References & Work History" />
        </Tabs>
      </Box>

      {/* Verification Status Card (responsive, beautiful) */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: { xs: 'center', sm: 'flex-start' },
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        {/* Verification Status Card */}
        <Tooltip title="Click to update verification status">
          <Card
            sx={{
              p: 2,
              minWidth: { xs: '100%', sm: 320 },
              maxWidth: 440,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              boxShadow: 4,
              borderRadius: 3,
              transition: 'box-shadow 0.2s, background 0.2s',
              '&:hover': { boxShadow: 8, background: '#f5f5f5' },
              background: 'linear-gradient(90deg, #e3f2fd 0%, #fce4ec 100%)',
              border: '1.5px solid #90caf9',
            }}
            onClick={handleVerModalOpen}
          >
            <Chip
              label={workerData.verificationStatus.overall}
              color={getVerificationStatusColor(workerData.verificationStatus.overall)}
              icon={
                workerData.verificationStatus.overall === "Fully Verified" ? (
                  <VerifiedIcon />
                ) : workerData.verificationStatus.overall === "Partially Verified" ? (
                  <WarningIcon />
                ) : (
                  <ErrorIcon />
                )
              }
              sx={{ fontWeight: 'bold', fontSize: 16, px: 2, py: 1 }}
            />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Verification Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click to update
              </Typography>
            </Box>
            <EditIcon color="action" />
          </Card>
        </Tooltip>

        {/* Delete Worker Profile Card */}
        <Tooltip title="Delete this worker profile">
          <Card
            sx={{
              p: 2,
              minWidth: { xs: '100%', sm: 320 },
              height:80,
              maxWidth: 440,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              cursor: 'pointer',
              boxShadow: 4,
              borderRadius: 3,
              transition: 'box-shadow 0.2s, background 0.2s',
              '&:hover': { boxShadow: 8, background: '#fff0f0' },
              background: 'linear-gradient(90deg, #fff0f0 0%, #ffe4e1 100%)',
              border: '1.5px solid #ff1744',
            }}
            onClick={() => setDeleteModalOpen(true)}
          >
            <DeleteOutlineIcon sx={{ color: '#ff1744', fontSize: 32 }} />
            <Box>
              <Typography variant="subtitle2" color="#ff1744" sx={{ fontWeight: 700 }}>
                Delete Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Permanently remove this worker and all their information
              </Typography>
            </Box>
          </Card>
        </Tooltip>
      </Box>

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
          document={selectedDocument}
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

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <>
            {/* Top Row - Profile Completeness and Skills & Languages */}
            <Box 
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
                width: '100%',
                mb: 3
              }}
            >
              {/* Profile Completeness */}
              <Box 
                sx={{
                  flex: 1,
                  minWidth: 0 // Prevents flex items from overflowing
                }}
              >
                <Card 
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[4]
                    }
                  }}
                >
                  <CardHeader
                    title="Profile Completeness"
                    avatar={<InfoIcon color="primary" />}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '& .MuiCardHeader-title': {
                        fontSize: '1.25rem',
                        fontWeight: 600
                      }
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 3 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          mb: 2
                        }}
                      >
                        {workerData.profileCompleteness.percentage}% Complete
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={workerData.profileCompleteness.percentage}
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          backgroundColor: 'rgba(0, 0, 0, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 5
                          }
                        }}
                      />
                    </Box>
                    <Box 
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 2
                      }}
                    >
                      {Object.entries(workerData.profileCompleteness.completedSections).map(
                        ([section, completed]) => (
                          <Box
                            key={section}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              color: completed ? "success.main" : "error.main",
                              p: 1,
                              borderRadius: 1,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            {completed ? <CheckCircleIcon /> : <CancelIcon />}
                            <Typography
                              sx={{
                                fontWeight: 500,
                                fontSize: '0.9rem'
                              }}
                            >
                              {section.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </Typography>
                          </Box>
                        )
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Skills and Languages */}
              <Box 
                sx={{
                  flex: 1,
                  minWidth: 0 // Prevents flex items from overflowing
                }}
              >
                <Card 
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[4]
                    }
                  }}
                >
                  <CardHeader
                    title="Skills & Languages"
                    avatar={<WorkIcon color="primary" />}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '& .MuiCardHeader-title': {
                        fontSize: '1.25rem',
                        fontWeight: 600
                      }
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 4 }}>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 2
                        }}
                      >
                        Skills
                      </Typography>
                      <Box 
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1
                        }}
                      >
                        {workerData.skillTags.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            color="primary"
                            variant="outlined"
                            sx={{ 
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 2
                        }}
                      >
                        Languages
                      </Typography>
                      <List sx={{ p: 0 }}>
                        {workerData.languages.map((lang, index) => (
                          <ListItem 
                            key={index}
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <ListItemIcon>
                              <LanguageIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={lang.language}
                              secondary={lang.proficiency}
                              primaryTypographyProps={{
                                fontWeight: 500
                              }}
                              secondaryTypographyProps={{
                                color: 'text.secondary'
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Biography Section */}
            <Box 
              sx={{
                width: '100%'
              }}
            >
              <Card 
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.shadows[4]
                  }
                }}
              >
                <CardHeader
                  title="Biography"
                  avatar={<DescriptionIcon color="primary" />}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '& .MuiCardHeader-title': {
                      fontSize: '1.25rem',
                      fontWeight: 600
                    }
                  }}
                />
                <CardContent 
                  sx={{ 
                    p: 3,
                    '&:last-child': {
                      pb: 3
                    }
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: "pre-line",
                      lineHeight: 1.7,
                      color: 'text.primary',
                      fontSize: '1rem'
                    }}
                  >
                    {workerData.biography || 'No biography provided.'}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {activeTab === 1 && (
          <Stack spacing={3}>
            {workerData.certifications.map((cert, index) => (
              <Card
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'stretch',
                  borderLeft: 6,
                  borderColor:
                    cert.verificationStatus === 'Verified'
                      ? 'success.main'
                      : cert.verificationStatus === 'Rejected'
                      ? 'error.main'
                      : cert.verificationStatus === 'Expiring Soon'
                      ? 'warning.main'
                      : 'primary.main',
                  boxShadow: 3,
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  '&:hover': {
                    boxShadow: 8,
                    transform: 'translateY(-4px) scale(1.01)',
                  },
                  p: 0,
                }}
                onClick={() => setSelectedCertification(cert)}
              >
                {/* Icon Section */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.light',
                    minWidth: 120,
                    px: 3,
                    py: { xs: 2, sm: 0 },
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                </Box>
                {/* Content Section */}
                <Box sx={{ flex: 1, p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                      {cert.certificationType.name}
                    </Typography>
                    <Chip
                      label={cert.verificationStatus}
                      color={
                        cert.verificationStatus === 'Verified'
                          ? 'success'
                          : cert.verificationStatus === 'Rejected'
                          ? 'error'
                          : cert.verificationStatus === 'Expiring Soon'
                          ? 'warning'
                          : 'primary'
                      }
                      size="medium"
                      sx={{ fontWeight: 600, fontSize: '1rem' }}
                    />
                  </Stack>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                    {cert.certificationType.description}
                  </Typography>
                  <Grid container spacing={2}>
                    {cert.number && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Number:</strong> {cert.number}
                        </Typography>
                      </Grid>
                    )}
                    {cert.issuer && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Issuer:</strong> {cert.issuer}
                        </Typography>
                      </Grid>
                    )}
                    {cert.issuedDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Issued:</strong> {formatDate(cert.issuedDate)}
                        </Typography>
                      </Grid>
                    )}
                    {cert.expiryDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Expires:</strong> {formatDate(cert.expiryDate)}
                        </Typography>
                      </Grid>
                    )}
                    {cert.degree && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Degree:</strong> {cert.degree}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                  {cert.documents && cert.documents.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      {cert.documents.map((doc, docIdx) => (
                        <Button
                          key={docIdx}
                          variant="outlined"
                          size="small"
                          startIcon={<DescriptionIcon />}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                          }}
                        >
                          {doc.fileName || `Document ${docIdx + 1}`}
                        </Button>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Card>
            ))}
          </Stack>
        )}

        {activeTab === 2 && (
          <Card>
            <CardHeader
              title="Weekly Availability"
              avatar={<ScheduleIcon color="primary" />}
            />
            <CardContent>
              {renderAvailabilitySchedule()}
            </CardContent>
          </Card>
        )}

        {activeTab === 3 && (
          <Grid container spacing={3}>
            {Object.entries(workerData.healthInformation).map(([key, value]) => {
              if (typeof value === "boolean") {
                return (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          {value ? (
                            <CheckCircleIcon color="success" fontSize="large" />
                          ) : (
                            <CancelIcon color="error" fontSize="large" />
                          )}
                          <Box>
                            <Typography variant="subtitle1">
                              {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {value ? "Yes" : "No"}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              }
              return null;
            })}
          </Grid>
        )}

{activeTab === 4 && (
  <>
    {/* Hero Section */}
    {/* <Box 
      sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 4,
        p: 4,
        mb: 4,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1,
        }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
          <BusinessIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
            Professional Profile
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            References, CV & Work Experience Overview
          </Typography>
        </Box>
      </Stack>
    </Box> */}

    {/* Main Content Grid */}
    <Grid container spacing={4}>
      {/* References Section - Full Width on Mobile, 8 cols on Desktop */}
      <Grid item xs={12} lg={8}>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ 
              width: 4, 
              height: 32, 
              bgcolor: 'primary.main', 
              borderRadius: 2 
            }} />
            <Typography variant="h5" fontWeight={700}>
              Professional References
            </Typography>
            <Chip 
              label={`${workerData.references?.length || 0} References`}
              color="primary"
              variant="outlined"
              size="small"
            />
          </Stack>
        </Box>

        {workerData.references?.length > 0 ? (
          <Grid container spacing={3}>
            {workerData.references.map((ref, index) => (
              <Grid item xs={12} sm={6} xl={4} key={index}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                      '& .reference-actions': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: ref.verified 
                        ? 'linear-gradient(90deg, #4caf50, #81c784)'
                        : 'linear-gradient(90deg, #ff9800, #ffb74d)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, pb: 2 }}>
                    <Stack alignItems="center" spacing={2}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            width: 56, 
                            height: 56,
                            fontSize: 24,
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          }}
                        >
                          {ref.name?.[0] || <BusinessIcon />}
                        </Avatar>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: ref.verified ? 'success.main' : 'warning.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white',
                          }}
                        >
                          {ref.verified ? 
                            <CheckCircleIcon sx={{ fontSize: 12, color: 'white' }} /> :
                            <WarningIcon sx={{ fontSize: 12, color: 'white' }} />
                          }
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'center', width: '100%' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                          {ref.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="primary.main" 
                          fontWeight={600}
                          sx={{ mb: 1 }}
                        >
                          {ref.position}
                        </Typography>
                        <Box sx={{ 
                          bgcolor: 'grey.50', 
                          px: 2, 
                          py: 1, 
                          borderRadius: 2,
                          mb: 2
                        }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {ref.company}
                          </Typography>
                        </Box>
                      </Box>

                      <Stack spacing={1.5} sx={{ width: '100%' }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {ref.email}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {ref.phone}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>

                  <Box 
                    className="reference-actions"
                    sx={{ 
                      p: 2, 
                      pt: 0,
                      opacity: 0.7,
                      transform: 'translateY(10px)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<InfoIcon />}
                      fullWidth
                      sx={{ 
                        fontWeight: 600, 
                        borderRadius: 2,
                        textTransform: 'none',
                      }}
                    >
                      Verify Reference
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'grey.50'
          }}>
            <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No References Added
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Professional references will appear here once added
            </Typography>
          </Card>
        )}
      </Grid>

      {/* CV & Quick Stats Sidebar */}
      <Grid item xs={12} lg={4}>
        <Stack spacing={3} sx={{
          flexDirection:'row',
          gap:'20px',
          mt:7,
        }}>
          {/* CV Card */}
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              p: 3,
              
              color: 'white',
              textAlign: 'center'
            }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                width: 52, 
                height: 52, 
                mx: 'auto',
                mb: 1
              }}>
                <DescriptionIcon fontSize="medium" />
              </Avatar>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                Curriculum Vitae
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Professional resume & portfolio
              </Typography>
            </Box>
            
            <CardContent sx={{ p: 3 }}>
              {workerData.CV ? (
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<DescriptionIcon />}
                      fullWidth
                      sx={{ fontWeight: 600, py: 1.5, borderRadius: 2, textTransform: 'none' }}
                      onClick={() => {
                        const cvDoc = {
                          url: workerData.CV,
                          fileName: 'CV',
                          fileType: workerData.CV?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 
                                  workerData.CV?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'other'
                        };
                        setSelectedDocument(cvDoc);
                      }}
                    >
                      Preview CV
                    </Button>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" align="center">
                    Click to view or download the complete CV
                  </Typography>
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No CV uploaded yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ borderRadius: 3, p: 3,height:250 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Profile Summary
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  References
                </Typography>
                <Chip 
                  label={workerData.references?.length || 0}
                  size="small"
                  color="primary"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Work History
                </Typography>
                <Chip 
                  label={workerData.workHistory?.length || 0}
                  size="small"
                  color="secondary"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  CV Status
                </Typography>
                <Chip 
                  label={workerData.CV ? "Available" : "Missing"}
                  size="small"
                  color={workerData.CV ? "success" : "warning"}
                />
              </Box>
            </Stack>
          </Card>
        </Stack>
      </Grid>
    </Grid>

    {/* Work History Timeline */}
    <Box sx={{ mt: 6 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Box sx={{ 
          width: 4, 
          height: 32, 
          bgcolor: 'secondary.main', 
          borderRadius: 2 
        }} />
        <Typography variant="h5" fontWeight={700}>
          Work Experience Timeline
        </Typography>
        <Chip 
          label={`${workerData.workHistory?.length || 0} Positions`}
          color="secondary"
          variant="outlined"
          size="small"
        />
      </Stack>

      {workerData.workHistory?.length > 0 ? (
        <Box sx={{ position: 'relative' }}>
          {/* Timeline Line */}
          <Box sx={{
            position: 'absolute',
            left: 24,
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: 'divider',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: -6,
              width: 14,
              height: 14,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              border: '3px solid white',
              boxShadow: 2,
            }
          }} />

          <Stack spacing={4}>
            {workerData.workHistory.map((job, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                {/* Timeline Dot */}
                <Box sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 3,
                  mt: 1,
                  boxShadow: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  flexShrink: 0,
                }}>
                  <WorkIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>

                {/* Content Card */}
                <Card sx={{ 
                  flex: 1, 
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateX(8px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                          {job.position}
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                          <BusinessIcon fontSize="small" color="primary" />
                          <Typography variant="subtitle1" color="primary.main" fontWeight={600}>
                            {job.company}
                          </Typography>
                        </Stack>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            whiteSpace: 'pre-line',
                            lineHeight: 1.6,
                            color: 'text.secondary'
                          }}
                        >
                          {job.description}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ 
                          bgcolor: 'grey.50', 
                          p: 2, 
                          borderRadius: 2,
                          height: 'fit-content'
                        }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            DURATION
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                            {job.startDate}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            to
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {job.endDate || "Present"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : (
        <Card sx={{ 
          p: 6, 
          textAlign: 'center', 
          borderRadius: 3,
          border: '2px dashed',
          borderColor: 'divider',
          bgcolor: 'grey.50'
        }}>
          <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No Work History Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Previous work experience will be displayed here
          </Typography>
        </Card>
      )}
    </Box>
  </>
)}
      </Box>

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
                                setSelectedDocument(doc);
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
    </Container>
  );
};

export default WorkerDetails;