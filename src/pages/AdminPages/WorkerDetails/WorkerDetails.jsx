import React, { useEffect, useState } from "react";
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
} from "@mui/icons-material";
import "./WorkerDetails.css";

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

  console.log("workerData",workerData?.user?._id);
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

  const handleBack = () => {
    navigate(-1);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  if (loading) {
    return (
      <Box className="worker-details-loading">
        <LoadingSpinner size="lg" text="Loading worker details..." />
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
          <Tab label="References" />
        </Tabs>
      </Box>

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
          <Grid container spacing={3}>
            {workerData.certifications.map((cert, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                  onClick={() => setSelectedCertification(cert)}
                >
                  <CardHeader
                    title={cert.certificationType.name}
                    subheader={cert.certificationType.description}
                    avatar={<SchoolIcon color="primary" />}
                    action={
                      <Chip
                        label={cert.verificationStatus}
                        color={cert.verificationStatus === "Verified" ? "success" : "warning"}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Stack spacing={1}>
                      {cert.number && (
                        <Typography variant="body2">
                          <strong>Number:</strong> {cert.number}
                        </Typography>
                      )}
                      {cert.issuer && (
                        <Typography variant="body2">
                          <strong>Issuer:</strong> {cert.issuer}
                        </Typography>
                      )}
                      {cert.issuedDate && (
                        <Typography variant="body2">
                          <strong>Issued:</strong> {formatDate(cert.issuedDate)}
                        </Typography>
                      )}
                      {cert.expiryDate && (
                        <Typography variant="body2">
                          <strong>Expires:</strong> {formatDate(cert.expiryDate)}
                        </Typography>
                      )}
                      {cert.degree && (
                        <Typography variant="body2">
                          <strong>Degree:</strong> {cert.degree}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
          <Grid container spacing={3}>
            {workerData.references.map((ref, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card>
                  <CardHeader
                    title={ref.name}
                    subheader={ref.position}
                    avatar={<BusinessIcon color="primary" />}
                    action={
                      <Chip
                        label={ref.verified ? "Verified" : "Pending"}
                        color={ref.verified ? "success" : "warning"}
                        size="small"
                      />
                    }
                  />
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography variant="body2">
                        <strong>Company:</strong> {ref.company}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {ref.email}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {ref.phone}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
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
        maxWidth="md"
        fullWidth
      >
        {selectedCertification && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SchoolIcon color="primary" />
                {selectedCertification.certificationType.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description Here
                  </Typography>
                  <Typography variant="body1">
                    {selectedCertification.certificationType.description}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Details
                  </Typography>
                  <Grid container spacing={2}>
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
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Documents
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {selectedCertification.documents.map((doc, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          startIcon={<DescriptionIcon />}
                          onClick={() => setSelectedDocument(doc)}
                        >
                          {doc.fileName || `Document ${index + 1}`}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}

              </Stack>
            </DialogContent>
            <DialogContent>
              <Stack>
                <Box style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '22px'
                }}>
                  <Button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this certification?')) {
                        // Handle delete
                      }
                    }}
                    style={{
                      padding: "10px 20px",
                      color: '#fff',
                      backgroundColor: 'red'
                    }}
                    disabled={isUpdating}
                  >
                    Delete
                  </Button>
                  
                  <FormControl sx={{ minWidth: 200 }}>
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
                </Box>
                {isUpdating && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => {
                  setSelectedCertification(null);
                  setCertificationStatus('');
                  setRejectionReason('');
                  setShowRejectionDialog(false);
                }}
                disabled={isUpdating}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
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
    </Container>
  );
};

export default WorkerDetails;