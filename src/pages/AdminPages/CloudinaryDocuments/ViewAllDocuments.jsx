import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Container,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress,
  Badge,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Visibility,
  Search,
  FilterList,
  Refresh,
  Storage,
  Person,
  Warning,
  CheckCircle,
  Cancel,
  ExpandMore,
  Dashboard,
  Analytics,
  Security
} from '@mui/icons-material';
import { getAllCloudinaryDocuments, cleanupCloudinaryOrphans } from '../../../api/cloudinary';
import { toast } from 'react-toastify';
import DocumentPreview from '../../../components/workerForm/Modals/DocumentPreview';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import AdminSidebar from '../../../components/adminSidebar/AdminSidebar';
import { useNavigate } from 'react-router-dom';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 4; // px

const ViewAllDocuments = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [documents, setDocuments] = useState([]);
  const [documentsByWorker, setDocumentsByWorker] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocumentForDelete, setSelectedDocumentForDelete] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewCertificateData, setPreviewCertificateData] = useState(null);

  // Fetch all Cloudinary documents
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await getAllCloudinaryDocuments();
      if (response.data.success) {
        setDocuments(response.data.data.documents);
        setDocumentsByWorker(response.data.data.documentsByWorker);
        setStatistics(response.data.data.statistics);
      } else {
        toast.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup orphaned documents
  const handleCleanup = async () => {
    setCleanupLoading(true);
    setCleanupDialogOpen(false);
    try {
      const response = await cleanupCloudinaryOrphans('aecus-care/certifications', false);
      if (response.data.success) {
        const data = response.data.data;
        const message = `Cleanup completed! Deleted ${data.counts.deleted} orphaned files from Cloudinary and cleaned ${data.counts.documentTrackingCleaned} document tracking records.`;
        toast.success(message, { autoClose: 8000 });
        // Refresh the documents list
        await fetchDocuments();
      } else {
        toast.error('Cleanup failed');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast.error(error.response?.data?.message || 'Cleanup failed');
    } finally {
      setCleanupLoading(false);
    }
  };

  // Handle document preview
  const handlePreviewDocument = (doc) => {
    console.log('Preview document:', doc); // Debug log
    
    // Determine file type based on URL extension or document type
    let fileType = 'application/octet-stream';
    
    if (doc.url) {
      const url = doc.url.toLowerCase();
      if (url.includes('.pdf')) {
        fileType = 'application/pdf';
      } else if (url.includes('.jpg') || url.includes('.jpeg')) {
        fileType = 'image/jpeg';
      } else if (url.includes('.png')) {
        fileType = 'image/png';
      } else if (url.includes('.gif')) {
        fileType = 'image/gif';
      } else if (url.includes('.webp')) {
        fileType = 'image/webp';
      }
    }
    
    // Fallback to document type if URL doesn't have extension
    if (fileType === 'application/octet-stream') {
      if (doc.documentType && doc.documentType.toLowerCase().includes('pdf')) {
        fileType = 'application/pdf';
      } else if (doc.documentType && doc.documentType.toLowerCase().includes('image')) {
        fileType = 'image/jpeg';
      }
    }

    // Create document object for preview component
    const documentForPreview = {
      url: doc.url,
      fileName: doc.documentName,
      fileType: fileType
    };

    setPreviewDocument(documentForPreview);
    setPreviewCertificateData(null); // Don't show certificate data
  };

  // Close document preview
  const handleClosePreview = () => {
    setPreviewDocument(null);
    setPreviewCertificateData(null);
  };

  // Handle delete document
  const handleDeleteDocument = (doc) => {
    setSelectedDocumentForDelete(doc);
    setDeleteDialogOpen(true);
  };

  // Confirm delete document (placeholder for future implementation)
  const confirmDeleteDocument = () => {
    // TODO: Implement actual delete functionality
    toast.info('Delete functionality is not yet available. This feature will be implemented in a future update.');
    setDeleteDialogOpen(false);
    setSelectedDocumentForDelete(null);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter documents based on selected filters
  const filteredDocuments = documents.filter(doc => {
    const matchesWorker = selectedWorker === 'all' || doc.worker.id === selectedWorker;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'used' && doc.isUsed) || 
      (filterStatus === 'unused' && !doc.isUsed);
    const matchesSearch = searchTerm === '' || 
      doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesWorker && matchesStatus && matchesSearch;
  });

  // Statistics Card Component
  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card 
      elevation={isMobile ? 0.5 : 1} 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
        border: `1px solid ${color}20`,
        borderRadius: isMobile ? 0.75 : 1.5,
        transition: 'all 0.2s ease',
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        '&:hover': {
          transform: isMobile ? 'none' : 'translateY(-1px)',
          boxShadow: isMobile ? 1 : `0 3px 8px ${color}15`,
          border: `1px solid ${color}30`,
          background: `linear-gradient(135deg, ${color}12 0%, ${color}08 100%)`,
        }
      }}
    >
      <CardContent sx={{ p: isMobile ? 0.75 : 1.5, '&:last-child': { pb: isMobile ? 0.75 : 1.5 } }}>
        <Stack 
          direction="column" 
          alignItems="center" 
          spacing={isMobile ? 0.25 : 0.5}
          textAlign="center"
        >
          <Avatar 
            sx={{ 
              bgcolor: `${color}12`, 
              color: color,
              width: isMobile ? 22 : 28,
              height: isMobile ? 22 : 28,
              border: `1.5px solid ${color}25`,
              boxShadow: `0 2px 4px ${color}10`
            }}
          >
            <Icon sx={{ fontSize: isMobile ? 11 : 14 }} />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Typography 
              variant={isMobile ? "subtitle2" : "h6"} 
              component="div" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                fontSize: isMobile ? '0.8rem' : '1rem',
                lineHeight: 1.1,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                letterSpacing: '-0.01em'
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 500,
                fontSize: isMobile ? '0.6rem' : '0.65rem',
                display: 'block',
                mt: 0.25,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                letterSpacing: '0.01em',
                textTransform: 'uppercase'
              }}
            >
              {title}
            </Typography>
            {subtitle && !isMobile && (
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: '0.6rem',
                  display: 'block',
                  mt: 0.25,
                  opacity: 0.7,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontWeight: 400
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  // Document Row Component for Mobile
  const DocumentCard = ({ doc, index }) => (
    <Card 
      key={`${doc.publicId}-${index}`} 
      elevation={isMobile ? 0.5 : 1}
      sx={{ 
        mb: isMobile ? 0.25 : 1,
        border: isMobile ? '1px solid #f0f0f0' : 'none',
        borderRadius: isMobile ? 0.75 : 1.5,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        '&:hover': { 
          elevation: isMobile ? 1 : 2,
          transform: isMobile ? 'none' : 'translateY(-0.5px)',
          transition: 'all 0.2s ease',
          border: isMobile ? '1px solid #e0e0e0' : 'none',
          boxShadow: isMobile ? 1 : '0 2px 8px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent sx={{ p: isMobile ? 0.75 : 1.25, '&:last-child': { pb: isMobile ? 0.75 : 1.25 } }}>
        <Stack spacing={isMobile ? 0.25 : 0.75}>
          <Stack direction="row" alignItems="center" spacing={isMobile ? 0.5 : 1}>
            <Avatar 
              src={doc.url} 
              variant="rounded"
              sx={{ 
                width: isMobile ? 26 : 36, 
                height: isMobile ? 26 : 36,
                border: '1px solid #e8e8e8',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            >
              <CloudUpload sx={{ fontSize: isMobile ? 12 : 16 }} />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant={isMobile ? "caption" : "subtitle2"} 
                noWrap 
                sx={{ 
                  fontWeight: 600,
                  fontSize: isMobile ? '0.65rem' : '0.8rem',
                  lineHeight: 1.1,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  letterSpacing: '-0.005em',
                  color: 'text.primary'
                }}
              >
                {doc.documentName}
              </Typography>
              {!isMobile && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  noWrap 
                  sx={{ 
                    fontSize: '0.65rem',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontWeight: 400,
                    opacity: 0.7
                  }}
                >
                  {doc.publicId}
                </Typography>
              )}
            </Box>
            <Chip
              icon={doc.isUsed ? <CheckCircle sx={{ fontSize: isMobile ? 9 : 12 }} /> : <Warning sx={{ fontSize: isMobile ? 9 : 12 }} />}
              label={doc.isUsed ? 'Used' : 'Unused'}
              color={doc.isUsed ? 'success' : 'warning'}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: isMobile ? '0.5rem' : '0.6rem',
                height: isMobile ? 16 : 20,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 500,
                '& .MuiChip-label': {
                  px: isMobile ? 0.25 : 0.5
                }
              }}
            />
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={0.25}>
            <Person sx={{ fontSize: isMobile ? 10 : 12 }} color="action" />
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: isMobile ? '0.6rem' : '0.65rem',
                fontWeight: 500,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                letterSpacing: '0.005em'
              }}
            >
              {doc.worker.name}
            </Typography>
          </Stack>
          
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: isMobile ? '0.55rem' : '0.6rem',
                opacity: 0.7,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 400
              }}
            >
              {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}
            </Typography>
            <Stack direction="row" spacing={0.125}>
              {doc.url && (
                <Tooltip title="View Document">
                  <IconButton 
                    size="small" 
                    onClick={() => handlePreviewDocument(doc)}
                    sx={{ 
                      color: 'primary.main',
                      padding: isMobile ? 0.125 : 0.25,
                      '&:hover': {
                        backgroundColor: 'primary.50'
                      }
                    }}
                  >
                    <Visibility sx={{ fontSize: isMobile ? 12 : 16 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Delete Document">
                <IconButton 
                  size="small" 
                  onClick={() => handleDeleteDocument(doc)}
                  sx={{ 
                    color: 'error.main',
                    padding: isMobile ? 0.125 : 0.25,
                    '&:hover': {
                      backgroundColor: 'error.50'
                    }
                  }}
                >
                  <Delete sx={{ fontSize: isMobile ? 12 : 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading Cloudinary Documents...
        </Typography>
      </Box>
    );
  }

  return (
    <>
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
            p: { xs: 2, sm: 3, md: 0 },
            mt: { xs: 8, md: 1 },
            minHeight: '100vh',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container maxWidth="xl" sx={{ py: isMobile ? 1 : 3, px: isMobile ? 1 : 3 }}>
            {/* Header Section */}
            <Box mb={isMobile ? 1.5 : 3}>
              <Stack 
                direction={isMobile ? "column" : "row"} 
                alignItems={isMobile ? "flex-start" : "center"} 
                spacing={isMobile ? 0.75 : 1.5} 
                mb={isMobile ? 0.75 : 1.5}
              >
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: isMobile ? 28 : 36, 
                    height: isMobile ? 28 : 36,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                  }}>
                    <Storage sx={{ fontSize: isMobile ? 16 : 20 }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant={isMobile ? "h6" : "h4"} 
                      component="h1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: 'text.primary',
                        fontSize: isMobile ? '1rem' : '1.5rem',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2
                      }}
                    >
                      Cloudinary Documents
                    </Typography>
                    {!isMobile && (
                      <Typography 
                        variant="subtitle1" 
                        color="text.secondary"
                        sx={{
                          fontSize: '0.9rem',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          fontWeight: 400,
                          letterSpacing: '0.01em',
                          mt: 0.25
                        }}
                      >
                        Manage and monitor all document storage with usage analytics
                      </Typography>
                    )}
                  </Box>
                </Stack>
                {isMobile && (
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      ml: 4.5,
                      fontSize: '0.65rem',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 400,
                      opacity: 0.8
                    }}
                  >
                    Document storage management
                  </Typography>
                )}
              </Stack>
              
              {cleanupLoading && (
                <Alert severity="info" sx={{ mb: 2, py: isMobile ? 1 : 2 }}>
                  <LinearProgress sx={{ mb: 1 }} />
                  <Typography variant={isMobile ? "caption" : "body2"}>
                    Cleaning up orphaned documents...
                  </Typography>
                </Alert>
              )}
            </Box>

            {/* Statistics Cards */}
            {statistics && (
              <Grid container spacing={isMobile ? 0.5 : 2} mb={isMobile ? 1.5 : 3}>
                <Grid item xs={6} sm={3} md={3} lg={3}>
                  <StatCard
                    title="Total"
                    value={statistics.totalDocuments}
                    icon={CloudUpload}
                    color={theme.palette.primary.main}
                    subtitle={`${statistics.usagePercentage}% usage rate`}
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={3} lg={3}>
                  <StatCard
                    title="Used"
                    value={statistics.usedDocuments}
                    icon={CheckCircle}
                    color={theme.palette.success.main}
                    subtitle="Actively referenced"
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={3} lg={3}>
                  <StatCard
                    title="Unused"
                    value={statistics.unusedDocuments}
                    icon={Warning}
                    color={theme.palette.warning.main}
                    subtitle="Orphaned files"
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={3} lg={3}>
                  <StatCard
                    title="Workers"
                    value={statistics.uniqueWorkers}
                    icon={Person}
                    color={theme.palette.info.main}
                    subtitle="Active users"
                  />
                </Grid>
              </Grid>
            )}

            {/* Controls Section */}
            <Card 
              elevation={isMobile ? 0.5 : 2} 
              sx={{ 
                mb: isMobile ? 1.5 : 3, 
                borderRadius: isMobile ? 0.75 : 1.5,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                border: '1px solid #f5f5f5'
              }}
            >
              <CardContent sx={{ p: isMobile ? 1.25 : 2.5, '&:last-child': { pb: isMobile ? 1.25 : 2.5 } }}>
                <Stack spacing={isMobile ? 1.25 : 2.5}>
                  {/* Search and Filters */}
                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={isMobile ? 1 : 2} 
                    alignItems={isMobile ? "stretch" : "center"}
                  >
                    <TextField
                      fullWidth={isMobile}
                      placeholder={isMobile ? "Search..." : "Search documents, workers, or types..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size={isMobile ? "small" : "medium"}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary', fontSize: isMobile ? 18 : 24 }} />
                      }}
                      sx={{ minWidth: isMobile ? '100%' : 300 }}
                    />
                    
                    <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? '100%' : 200 }}>
                      <InputLabel>Worker</InputLabel>
                      <Select
                        value={selectedWorker}
                        onChange={(e) => setSelectedWorker(e.target.value)}
                        label="Worker"
                      >
                        <MenuItem value="all">All Workers</MenuItem>
                        {documentsByWorker.map((workerData) => (
                          <MenuItem key={workerData.worker.id} value={workerData.worker.id}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant={isMobile ? "caption" : "body2"}>
                                {workerData.worker.name}
                              </Typography>
                              <Chip 
                                label={workerData.totalDocuments} 
                                size="small" 
                                sx={{ fontSize: isMobile ? '0.6rem' : '0.75rem' }}
                              />
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: isMobile ? '100%' : 150 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="used">Used Only</MenuItem>
                        <MenuItem value="unused">Unused Only</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  {/* Action Buttons */}
                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={isMobile ? 1 : 2} 
                    justifyContent="space-between" 
                    alignItems={isMobile ? "stretch" : "center"}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<Refresh sx={{ fontSize: isMobile ? 16 : 20 }} />}
                      onClick={fetchDocuments}
                      disabled={loading}
                      size={isMobile ? "small" : "medium"}
                      fullWidth={isMobile}
                    >
                      Refresh
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Delete sx={{ fontSize: isMobile ? 16 : 20 }} />}
                      onClick={() => setCleanupDialogOpen(true)}
                      disabled={cleanupLoading}
                      size={isMobile ? "small" : "medium"}
                      fullWidth={isMobile}
                      sx={{ 
                        minWidth: isMobile ? '100%' : 160,
                        background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)',
                        }
                      }}
                    >
                      {cleanupLoading ? 'Cleaning...' : (isMobile ? 'Cleanup' : 'Cleanup Orphans')}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Documents Section */}
            <Card elevation={isMobile ? 1 : 2}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant={isMobile ? "fullWidth" : "standard"}
                  sx={{
                    '& .MuiTab-root': {
                      minHeight: isMobile ? 40 : 48,
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      '& .MuiSvgIcon-root': {
                        fontSize: isMobile ? 16 : 20
                      }
                    }
                  }}
                >
                  <Tab 
                    icon={<Dashboard />} 
                    label={isMobile ? "Overview" : "Documents Overview"} 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<Analytics />} 
                    label={isMobile ? "Analytics" : "Worker Analytics"} 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

        {/* Tab Content */}
        <Box sx={{ p: 0 }}>
          {activeTab === 0 && (
            <Box>
              {/* Documents Count */}
              <Box sx={{ 
                p: isMobile ? 1.5 : 2.5, 
                borderBottom: 1, 
                borderColor: 'divider',
                backgroundColor: '#fafafa'
              }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Typography 
                    variant={isMobile ? "subtitle2" : "h6"} 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '0.85rem' : '1rem',
                      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                      letterSpacing: '-0.01em',
                      color: 'text.primary'
                    }}
                  >
                    Documents ({filteredDocuments.length})
                  </Typography>
                  {statistics && (
                    <Chip 
                      label={`${statistics.usagePercentage}% usage rate`}
                      color={statistics.usagePercentage > 80 ? 'success' : statistics.usagePercentage > 60 ? 'warning' : 'error'}
                      size="small"
                      sx={{ 
                        fontSize: isMobile ? '0.55rem' : '0.65rem',
                        height: isMobile ? 18 : 22,
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        fontWeight: 500
                      }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Documents Display */}
              {isMobile ? (
                // Mobile Card View
                <Box sx={{ p: isMobile ? 0.5 : 2 }}>
                  {filteredDocuments.length === 0 ? (
                    <Box textAlign="center" py={isMobile ? 2.5 : 5}>
                      <CloudUpload sx={{ 
                        fontSize: isMobile ? 36 : 56, 
                        color: 'text.secondary', 
                        mb: isMobile ? 0.75 : 1.5,
                        opacity: 0.6
                      }} />
                      <Typography 
                        variant={isMobile ? "subtitle2" : "h6"} 
                        color="text.secondary" 
                        gutterBottom
                        sx={{ 
                          fontSize: isMobile ? '0.8rem' : '1.1rem',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          fontWeight: 500,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        No documents found
                      </Typography>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        color="text.secondary"
                        sx={{ 
                          fontSize: isMobile ? '0.6rem' : '0.8rem',
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                          fontWeight: 400,
                          opacity: 0.8,
                          maxWidth: isMobile ? '90%' : '60%',
                          mx: 'auto'
                        }}
                      >
                        {searchTerm || selectedWorker !== 'all' || filterStatus !== 'all' 
                          ? 'Try adjusting your filters or search terms.'
                          : 'No documents have been uploaded yet.'
                        }
                      </Typography>
                    </Box>
                  ) : (
                    filteredDocuments.map((doc, index) => (
                      <DocumentCard key={`${doc.publicId}-${index}`} doc={doc} index={index} />
                    ))
                  )}
                </Box>
              ) : (
                // Desktop Table View
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Worker</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Upload Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredDocuments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                            <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              No documents found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {searchTerm || selectedWorker !== 'all' || filterStatus !== 'all' 
                                ? 'Try adjusting your filters or search terms.'
                                : 'No documents have been uploaded yet.'
                              }
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDocuments.map((doc, index) => (
                          <TableRow 
                            key={`${doc.publicId}-${index}`}
                            hover
                            sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                          >
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar 
                                  src={doc.url} 
                                  variant="rounded"
                                  sx={{ width: 40, height: 40 }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                >
                                  <CloudUpload />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                                    {doc.documentName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                                    {doc.publicId}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {doc.worker.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {doc.worker.email}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={doc.isUsed ? <CheckCircle /> : <Warning />}
                                label={doc.isUsed ? 'Used' : 'Unused'}
                                color={doc.isUsed ? 'success' : 'warning'}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                {doc.url && (
                                  <Tooltip title="View Document">
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handlePreviewDocument(doc)}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <Visibility />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Delete Document">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDeleteDocument(doc)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <Delete />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Worker Document Analytics
              </Typography>
              <Stack spacing={2}>
                {documentsByWorker.map((workerData) => (
                  <Accordion key={workerData.worker.id} elevation={1}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {workerData.worker.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {workerData.worker.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {workerData.worker.email}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Chip 
                            label={`${workerData.totalDocuments} total`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`${workerData.usedDocuments} used`} 
                            size="small" 
                            color="success" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`${workerData.unusedDocuments} unused`} 
                            size="small" 
                            color="warning" 
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {workerData.documents.map((doc, index) => (
                          <Grid item xs={12} sm={6} md={4} key={`${doc.publicId}-${index}`}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                              <CardContent sx={{ p: 2 }}>
                                <Stack spacing={1}>
                                  <Typography variant="subtitle2" noWrap>
                                    {doc.documentName}
                                  </Typography>
                                  <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Chip
                                      icon={doc.isUsed ? <CheckCircle /> : <Warning />}
                                      label={doc.isUsed ? 'Used' : 'Unused'}
                                      color={doc.isUsed ? 'success' : 'warning'}
                                      size="small"
                                    />
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary">
                                    {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'N/A'}
                                  </Typography>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Card>

            {/* Cleanup Confirmation Dialog */}
            <Dialog
              open={cleanupDialogOpen}
              onClose={() => setCleanupDialogOpen(false)}
              maxWidth="sm"
              fullWidth
              fullScreen={isMobile}
            >
              <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: isMobile ? '1rem' : undefined
              }}>
                <Warning color="warning" sx={{ fontSize: isMobile ? 20 : 24 }} />
                Confirm Cleanup
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                  Are you sure you want to cleanup orphaned documents? This action will:
                </DialogContentText>
                <Box sx={{ mt: 2 }}>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    component="div" 
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    🗑️ Cloudinary Cleanup:
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ ml: 2, mb: 2, fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    • Permanently delete unused files from Cloudinary storage
                  </Typography>
                  
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    component="div" 
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    📝 Database Cleanup:
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ ml: 2, mb: 2, fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    • Remove orphaned documents from document tracking records
                    • Delete empty document tracking records
                    • Update remaining document tracking records
                  </Typography>
                  
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="error" 
                    sx={{ fontWeight: 600, fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    ⚠️ This action cannot be undone!
                  </Typography>
                </Box>
                {statistics && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      <strong>{statistics.unusedDocuments}</strong> unused documents will be deleted from both Cloudinary and the database.
                    </Typography>
                  </Alert>
                )}
              </DialogContent>
              <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
                <Button 
                  onClick={() => setCleanupDialogOpen(false)}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCleanup} 
                  color="error" 
                  variant="contained"
                  disabled={cleanupLoading}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  {cleanupLoading ? 'Cleaning...' : 'Confirm Cleanup'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Delete Document Confirmation Dialog */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
              maxWidth="sm"
              fullWidth
              fullScreen={isMobile}
            >
              <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: isMobile ? '1rem' : undefined
              }}>
                <Delete color="error" sx={{ fontSize: isMobile ? 20 : 24 }} />
                Delete Document
              </DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ fontSize: isMobile ? '0.875rem' : undefined }}>
                  Are you sure you want to delete this document? This action will:
                </DialogContentText>
                <Box sx={{ mt: 2 }}>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    component="div" 
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    📄 Document Information:
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ ml: 2, mb: 2, fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    • <strong>Name:</strong> {selectedDocumentForDelete?.documentName}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ ml: 2, mb: 2, fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    • <strong>Worker:</strong> {selectedDocumentForDelete?.worker?.name}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ ml: 2, mb: 2, fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    • <strong>Status:</strong> {selectedDocumentForDelete?.isUsed ? 'Used' : 'Unused'}
                  </Typography>
                  
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    component="div" 
                    sx={{ mb: 1, fontWeight: 600 }}
                  >
                    🗑️ Deletion Process:
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ ml: 2, mb: 2, fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    • Permanently delete file from Cloudinary storage
                    • Remove document from database records
                    • Update worker's document tracking
                  </Typography>
                  
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="error" 
                    sx={{ fontWeight: 600, fontSize: isMobile ? '0.75rem' : undefined }}
                  >
                    ⚠️ This action cannot be undone!
                  </Typography>
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant={isMobile ? "caption" : "body2"}>
                    <strong>Note:</strong> This functionality is currently under development and will be available in a future update.
                  </Typography>
                </Alert>
              </DialogContent>
              <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
                <Button 
                  onClick={() => setDeleteDialogOpen(false)}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDeleteDocument} 
                  color="error" 
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  Delete Document
                </Button>
              </DialogActions>
            </Dialog>

            {/* Document Preview Modal */}
            {previewDocument && (
              <DocumentPreview
                document={previewDocument}
                onClose={handleClosePreview}
                certificateData={previewCertificateData}
              />
            )}
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default ViewAllDocuments;