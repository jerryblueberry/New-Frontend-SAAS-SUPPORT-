import React, { useState, useCallback, useMemo } from 'react'
import AdminSidebar from '../../../../components/adminSidebar/AdminSidebar'
import WorkerNavbar from '../../../../components/Navbar/WorkerNavbar'
import ReferenceTable from '../../../../components/ReferenceTable/ReferenceTable'
import ReferenceStats from '../../../../components/ReferenceStats/ReferenceStats'
import ReferenceDetailsModal from '../../../../components/ReferenceDetailsModal/ReferenceDetailsModal'
import { useAuth } from '../../../../context/AuthContext'
import { useReferenceById } from '../../../../hooks/useReferences'
import api from '../../../../api/axios'
import { 
  Box, 
  Typography, 
  Container, 
  Avatar, 
  Stack, 
  useTheme, 
  useMediaQuery,
  Paper,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  LinearProgress
} from '@mui/material'
import { 
  Person, 
  VerifiedUser, 
  Assessment, 
  TableChart, 
  BarChart,
  Refresh,
  FilterList,
  Search,
  Storage,
  People,
  Email,
  CheckCircle,
  Schedule,
  Business,
  Phone,
  CalendarToday,
  Notes,
  QuestionAnswer,
  History,
  PendingActions,
  HourglassEmpty,
  Error as ErrorIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 4;

const ViewAllReference = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Auth state
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Modal and reference state
  const [selectedReferenceId, setSelectedReferenceId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Memoized snackbar handlers
  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);
  
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  // Use React Query for reference details with caching
  const { 
    data: selectedReference, 
    isLoading: isLoadingReference, 
    error: referenceError,
    refetch: refetchReference
  } = useReferenceById(selectedReferenceId, {
    enabled: !!selectedReferenceId
  });

  // Optimized reference selection with immediate UI feedback
  const handleReferenceSelect = useCallback((referenceId) => {
    setSelectedReferenceId(referenceId);
    setModalOpen(true);
    setModalTab(0);
  }, []);

  // Send email to reference with optimistic updates
  const handleSendEmail = useCallback(async (referenceId) => {
    try {
      const response = await api.post(`/references/${referenceId}/send-email`);
      showSnackbar(response.data?.message || 'Email sent successfully!', 'success');
      
      // Refetch reference details to get updated email tracking info
      if (selectedReferenceId === referenceId) {
        refetchReference();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send email';
      console.error('Error sending email:', error);
      showSnackbar(errorMessage, 'error');
    }
  }, [selectedReferenceId, refetchReference, showSnackbar]);

  // Close modal with cleanup
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedReferenceId(null);
  }, []);


  // Show loading state while auth is loading
  if (authLoading) {
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
          Loading...
        </Typography>
      </Box>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
        gap={2}
      >
        <Typography variant="h6" color="error">
          Authentication Required
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please log in to access this page.
        </Typography>
      </Box>
    );
  }

  // Debug: Show auth status
  console.log('Auth status:', { isAuthenticated, authLoading, user: user?.email });

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
                    <People sx={{ fontSize: isMobile ? 16 : 20 }} />
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
                      Reference Management
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
                        Manage and monitor all reference checks with email tracking
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
                    Reference verification system
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Main Content Card */}
            <Card elevation={isMobile ? 1 : 2}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
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
                    icon={<TableChart />} 
                    label={isMobile ? "Table" : "Reference Table"} 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<BarChart />} 
                    label={isMobile ? "Stats" : "Statistics"} 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: 0 }}>
                {console.log('Rendering tab content, activeTab:', activeTab)}
                {activeTab === 0 && (
                  <Box>
                    {/* Table Header */}
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
                          Reference Checks
                        </Typography>
                        <Chip 
                          label="Email Tracking Enabled"
                          color="success"
                          size="small"
                          sx={{ 
                            fontSize: isMobile ? '0.55rem' : '0.65rem',
                            height: isMobile ? 18 : 22,
                            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                            fontWeight: 500
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* Reference Table */}
                    <Box sx={{ p: isMobile ? 0.5 : 2 }}>
                      <ReferenceTable 
                        showFilters={true}
                        showBulkActions={true}
                        onReferenceSelect={handleReferenceSelect}
                        onSendEmail={handleSendEmail}
                      />
                    </Box>
                  </Box>
                )}
                
                {activeTab === 1 && (
                  <Box sx={{ p: 3 }}>
                    <Typography 
                      variant={isMobile ? "subtitle2" : "h6"} 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: isMobile ? '0.85rem' : '1rem',
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        letterSpacing: '-0.01em',
                        color: 'text.primary',
                        mb: 2
                      }}
                    >
                      Reference Statistics & Analytics
                    </Typography>
                    <ReferenceStats />
                  </Box>
                )}
              </Box>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleSnackbarClose}
          sx={{ width: '100%' }}
          elevation={6}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Reference Details Modal */}
      <ReferenceDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        reference={selectedReference?.data}
        isLoading={isLoadingReference}
        error={referenceError}
        onRetry={refetchReference}
        onSendEmail={handleSendEmail}
        showEmailTracking={true}
        showVerificationTab={false}
        title="Reference Details"
      />
    </>
  )
}

export default ViewAllReference