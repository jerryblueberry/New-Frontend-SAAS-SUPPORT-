import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  IconButton,
  Paper,
  Divider,
  Avatar,
  Button,
  Stack,
  Tooltip,
  Container,
  Alert,
  Skeleton,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  Work,
  Business,
  CalendarToday,
  LocationOn,
  Description,
  Phone,
  Email,
  Person,
  VerifiedUser,
  Pending,
  Visibility,
  CheckCircle,
  Cancel,
  MarkEmailRead,
  Schedule,
  Error as ErrorIcon,
  TrendingUp,
  AccessTime
} from '@mui/icons-material';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DocumentPreview from '../../components/workerForm/Modals/DocumentPreview';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api/auth';
import { useWorkerReferences } from '../../hooks/useReferences';

const WorkHistory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const { data: onboardingData } = useOnboardingQuery();
  const [previewDocument, setPreviewDocument] = useState(null);
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000,
  });

  // Fetch references from WorkerReference API (full reference check data)
  const {
    data: workerRefsData,
    isLoading: isRefsLoading,
    isError: isRefsError,
    error: refsError,
    refetch: refetchRefs
  } = useWorkerReferences(user?._id, { enabled: !!user });

  // Get references from both sources with safe fallbacks
  const onboardingRefs = useMemo(() => {
    try {
      return onboardingData?.data?.profile?.references || [];
    } catch (error) {
      console.error('Error accessing onboarding references:', error);
      return [];
    }
  }, [onboardingData?.data?.profile?.references]);

  const apiReferences = useMemo(() => {
    try {
      return workerRefsData?.data?.references || [];
    } catch (error) {
      console.error('Error accessing API references:', error);
      return [];
    }
  }, [workerRefsData?.data?.references]);

  // Merge references by matching email addresses
  // Priority: WorkerReference data (full status info) + WorkerProfile data (fallback for missing fields)
  const mergedReferences = useMemo(() => {
    if (!Array.isArray(onboardingRefs) || !Array.isArray(apiReferences)) {
      return [];
    }

    // Create a map of API references by email (lowercase for matching)
    const apiRefsByEmail = new Map();
    apiReferences.forEach(ref => {
      if (!ref) return;
      try {
        const email = ref.referenceInfo?.email?.toLowerCase()?.trim() || 
                      ref.email?.toLowerCase()?.trim();
        if (email) {
          apiRefsByEmail.set(email, ref);
        }
      } catch (error) {
        // Skip invalid reference entries
        console.warn('Invalid reference entry:', error);
      }
    });

    // Process onboarding references and merge with API data
    const merged = onboardingRefs
      .filter(ref => ref && typeof ref === 'object') // Filter out invalid entries
      .map((onboardingRef, idx) => {
        if (!onboardingRef || !onboardingRef.email) {
          return null;
        }

        const email = onboardingRef.email?.toLowerCase()?.trim();
        const apiRef = email ? apiRefsByEmail.get(email) : null;

      // If API reference exists, use its full data structure
      if (apiRef) {
        return {
          _id: apiRef._id,
          name: apiRef.referenceInfo?.name || onboardingRef.name,
          company: apiRef.referenceInfo?.company || onboardingRef.company,
          position: apiRef.referenceInfo?.position || onboardingRef.position,
          email: apiRef.referenceInfo?.email || onboardingRef.email,
          phone: apiRef.referenceInfo?.phone || onboardingRef.phone,
          status: apiRef.status || 'Pending',
          statusHistory: apiRef.statusHistory || [],
          progress: apiRef.progress || null,
          responses: apiRef.responses || [],
          emailTracking: apiRef.emailTracking || null,
          completedAt: apiRef.completedAt,
          createdAt: apiRef.createdAt,
          verificationToken: apiRef.verificationToken,
          verified: onboardingRef.verified || false,
        };
      }

      // If no API reference, use onboarding data with default status
      return {
        _id: onboardingRef._id || onboardingRef.email || `onboarding-${idx}`,
        name: onboardingRef.name,
        company: onboardingRef.company,
        position: onboardingRef.position,
        email: onboardingRef.email,
        phone: onboardingRef.phone,
        status: onboardingRef.verified ? 'Verified' : 'Pending',
        statusHistory: [],
        progress: null,
        responses: [],
        emailTracking: null,
          verified: onboardingRef.verified || false,
          isUnsynced: true, // Flag to indicate not yet synced to WorkerReference
      };
      })
      .filter(Boolean); // Remove null entries

    // Add any API references that don't exist in onboarding (edge case)
    apiReferences
      .filter(ref => ref && typeof ref === 'object')
      .forEach(apiRef => {
        const email = apiRef.referenceInfo?.email?.toLowerCase()?.trim() || 
                      apiRef.email?.toLowerCase()?.trim();
        const exists = merged.some(m => m && m.email?.toLowerCase()?.trim() === email);
        if (!exists && email) {
        merged.push({
          _id: apiRef._id,
          name: apiRef.referenceInfo?.name,
          company: apiRef.referenceInfo?.company,
          position: apiRef.referenceInfo?.position,
          email: apiRef.referenceInfo?.email,
          phone: apiRef.referenceInfo?.phone,
          status: apiRef.status || 'Pending',
          statusHistory: apiRef.statusHistory || [],
          progress: apiRef.progress || null,
          responses: apiRef.responses || [],
          emailTracking: apiRef.emailTracking || null,
          completedAt: apiRef.completedAt,
          createdAt: apiRef.createdAt,
        });
      }
    });

    return merged;
  }, [onboardingRefs, apiReferences]);

  const displayReferences = mergedReferences;

  // Memoized helper functions for performance
  const getStatusIcon = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return <Pending fontSize="small" sx={{ color: 'warning.main' }} />;
    }
    switch (status) {
      case 'Completed':
        return <CheckCircle fontSize="small" sx={{ color: 'success.main' }} />;
      case 'Verified':
        return <VerifiedUser fontSize="small" sx={{ color: 'success.main' }} />;
      case 'EmailSent':
        return <MarkEmailRead fontSize="small" sx={{ color: 'info.main' }} />;
      case 'Viewed':
        return <Visibility fontSize="small" sx={{ color: 'info.main' }} />;
      case 'InProgress':
        return <Schedule fontSize="small" sx={{ color: 'warning.main' }} />;
      case 'Rejected':
        return <Cancel fontSize="small" sx={{ color: 'error.main' }} />;
      case 'Expired':
      case 'Bounced':
        return <ErrorIcon fontSize="small" sx={{ color: 'error.main' }} />;
      case 'Pending':
      default:
        return <Pending fontSize="small" sx={{ color: 'warning.main' }} />;
    }
  }, []);

  // Memoized helper function to get status color
  const getStatusColor = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return 'warning';
    }
    switch (status) {
      case 'Completed':
      case 'Verified':
        return 'success';
      case 'EmailSent':
      case 'Viewed':
      case 'InProgress':
        return 'info';
      case 'Rejected':
      case 'Expired':
      case 'Bounced':
        return 'error';
      case 'Pending':
      default:
        return 'warning';
    }
  }, []);

  // Memoized helper function to get status label
  const getStatusLabel = useCallback((status) => {
    if (!status || typeof status !== 'string') {
      return 'Pending';
    }
    const labels = {
      'Pending': 'Pending',
      'EmailSent': 'Email Sent',
      'Viewed': 'Viewed',
      'InProgress': 'In Progress',
      'Completed': 'Completed',
      'Verified': 'Verified',
      'Rejected': 'Rejected',
      'Expired': 'Expired',
      'Bounced': 'Bounced',
    };
    return labels[status] || status;
  }, []);

  // Memoized date input formatter (kept for potential future use)
  const formatDateForInput = useCallback((dateValue) => {
    if (!dateValue) return '';
    try {
      if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateValue;
      }
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  }, []);

  // Memoized date formatting function
  const formatDisplayDate = useCallback((dateValue) => {
    if (!dateValue) return 'Present';
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? 'Present' : 
        date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    } catch (error) {
      return 'Present';
    }
  }, []);

  // Memoized duration calculation
  const calculateDuration = useCallback((startDate, endDate) => {
    if (!startDate) return '0m';
    try {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      
      if (isNaN(start.getTime())) return '0m';
      if (endDate && isNaN(end.getTime())) return '0m';
      
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.floor(diffDays / 30);
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      
      if (years > 0) {
        return `${years}y ${remainingMonths}m`;
      }
      return `${months}m`;
    } catch (error) {
      return '0m';
    }
  }, []);

  // Memoized event handlers
  const handleDocumentPreviewClick = useCallback((doc) => {
    if (!doc || !doc.url) {
      console.warn('Invalid document provided for preview');
      return;
    }
    setPreviewDocument(doc);
  }, []);

  const closeDocumentPreview = useCallback(() => {
    setPreviewDocument(null);
  }, []);

  const handleDownload = useCallback((url) => {
    if (!url || typeof url !== 'string') {
      console.error('Invalid URL provided for download');
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'CV-Resume.pdf';
      link.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new window
      window.open(url, '_blank');
    }
  }, []);

  return (
    <>
      {/* Shimmer Animation Keyframes */}
      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `
        }}
      />
      <Box sx={{ 
        bgcolor: alpha(theme.palette.primary.main, 0.02),
        minHeight: '100vh',
        position: 'relative'
      }}>
        <WorkerNavbar />
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <DashboardSidebar />
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: { xs: 12, sm: 4, md: 11 },
            px: { xs: 2, sm: 3, md: 4 },
            flexGrow: 1,
            width: '100%',
            maxWidth: { xs: '100%', lg: '1280px' }
          }}
        >
          {/* Enhanced Header Section */}
          <Fade in timeout={600}>
            <Box sx={{ mb: { xs: 3, md: 5 } }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                <Box
                  sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 2,
                    bgcolor: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  <Work sx={{ fontSize: { xs: 28, md: 32 }, color: 'white' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant={isMobile ? 'h5' : 'h4'} 
                    fontWeight={700} 
                    color="text.primary"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.info.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.5
                    }}
                  >
                    Work History
                  </Typography>
                  <Typography 
                    variant={isMobile ? 'body2' : 'body1'} 
                    color="text.secondary"
                    sx={{ fontWeight: 400 }}
                  >
                    Manage your professional experience and references
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Fade>

          {/* Layout: Work Experience (Full Width) + CV/Resume (Compact Right Side) */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
            gap: { xs: 2, md: 3 },
            mb: { xs: 3, md: 4 },
            alignItems: 'start'
          }}>
            {/* Enhanced Work Experience Section */}
            <Grow in timeout={800}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  backgroundImage: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  justifyContent="space-between"
                  spacing={2} 
                  sx={{ mb: 3 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: { xs: 44, md: 48 },
                        height: { xs: 44, md: 48 },
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.secondary?.main || theme.palette.info.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Work sx={{ 
                        color: theme.palette.secondary?.main || theme.palette.info.main, 
                        fontSize: { xs: 22, md: 24 } 
                      }} />
                    </Box>
                    <Box>
                      <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700} color="text.primary">
                        Work Experience
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
                        <TrendingUp sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          {onboardingData?.data?.profile?.workHistory?.length || 0} position{onboardingData?.data?.profile?.workHistory?.length !== 1 ? 's' : ''}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Stack>

              {onboardingData?.data?.profile?.workHistory?.length > 0 ? (
                <Stack spacing={2}>
                  {onboardingData.data.profile.workHistory.map((history, index) => (
                    <Grow 
                      in 
                      timeout={600 + (index * 100)} 
                      key={history.id || index}
                    >
                      <Card
                        sx={{
                          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                          borderRadius: 2.5,
                          p: { xs: 2, md: 2.5 },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          bgcolor: alpha(theme.palette.background.paper, 0.8),
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 4,
                            bgcolor: history.current 
                              ? theme.palette.success.main 
                              : alpha(theme.palette.primary.main, 0.5),
                            transform: 'scaleY(0)',
                            transition: 'transform 0.3s ease'
                          },
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                            transform: 'translateX(4px)',
                            '&::before': {
                              transform: 'scaleY(1)'
                            }
                          }
                        }}
                      >
                        <Stack 
                          direction="row" 
                          alignItems="flex-start" 
                          justifyContent="space-between" 
                          spacing={2} 
                          sx={{ mb: 2 }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant={isMobile ? 'body1' : 'subtitle1'} 
                              fontWeight={700} 
                              color="text.primary"
                              gutterBottom
                              sx={{ mb: 1 }}
                            >
                              {history.title || 'Untitled Position'}
                            </Typography>
                            {history.company && (
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Business 
                                  fontSize="small" 
                                  sx={{ 
                                    color: theme.palette.primary.main, 
                                    fontSize: 16 
                                  }} 
                                />
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  fontWeight={500}
                                  sx={{ 
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {history.company}
                                </Typography>
                              </Stack>
                            )}
                          </Box>
                          {history.current && (
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: 14 }} />}
                              label="Current"
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.dark,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 24,
                                '& .MuiChip-icon': {
                                  color: theme.palette.success.main
                                }
                              }}
                            />
                          )}
                        </Stack>
                        
                        <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                        
                        <Stack spacing={1.5}>
                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            spacing={1.5} 
                            flexWrap="wrap"
                            sx={{ gap: 1 }}
                          >
                            <Stack 
                              direction="row" 
                              alignItems="center" 
                              spacing={0.75}
                              sx={{
                                px: 1.5,
                                py: 0.75,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.info.main, 0.1)
                              }}
                            >
                              <CalendarToday 
                                fontSize="small" 
                                sx={{ 
                                  color: theme.palette.info.main, 
                                  fontSize: 16 
                                }} 
                              />
                              <Typography 
                                variant="caption" 
                                color="text.primary" 
                                fontWeight={500}
                              >
                                {formatDisplayDate(history.startDate)} - {formatDisplayDate(history.endDate)}
                              </Typography>
                            </Stack>
                            <Chip
                              icon={<AccessTime sx={{ fontSize: 14 }} />}
                              label={calculateDuration(history.startDate, history.endDate)}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.dark,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 26,
                                '& .MuiChip-icon': {
                                  color: theme.palette.primary.main
                                }
                              }}
                            />
                          </Stack>
                          {history.location && (
                            <Stack 
                              direction="row" 
                              alignItems="center" 
                              spacing={1}
                              sx={{
                                px: 1.5,
                                py: 0.75,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.secondary?.main || theme.palette.grey[500], 0.08),
                                width: 'fit-content'
                              }}
                            >
                              <LocationOn 
                                fontSize="small" 
                                sx={{ 
                                  color: theme.palette.secondary?.main || theme.palette.text.secondary, 
                                  fontSize: 16 
                                }} 
                              />
                              <Typography 
                                variant="caption" 
                                color="text.secondary"
                                fontWeight={500}
                              >
                                {history.location}
                              </Typography>
                            </Stack>
                          )}
                          {history.description && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.grey[500], 0.05),
                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                              }}
                            >
                              <Stack direction="row" alignItems="flex-start" spacing={1}>
                                <Description 
                                  fontSize="small" 
                                  sx={{ 
                                    color: theme.palette.text.secondary, 
                                    fontSize: 16, 
                                    mt: 0.25 
                                  }} 
                                />
                                <Typography 
                                  variant="body2" 
                                  color="text.primary" 
                                  sx={{ 
                                    lineHeight: 1.7,
                                    fontSize: isMobile ? '0.875rem' : '0.9375rem'
                                  }}
                                >
                                  {history.description}
                                </Typography>
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </Card>
                    </Grow>
                  ))}
                </Stack>
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: { xs: 6, md: 10 },
                    px: 2
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 80, md: 100 },
                      height: { xs: 80, md: 100 },
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.grey[400], 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <Work sx={{ fontSize: { xs: 40, md: 48 }, color: 'grey.400' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                    No Work Experience
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                    Add your work experience to showcase your professional background and strengthen your profile
                  </Typography>
                </Box>
              )}
            </Paper>
            </Grow>

            {/* Enhanced CV/Resume Section */}
            {onboardingData?.data?.profile?.CV && (
              <Fade in timeout={1000}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 100%)`,
                    height: 'fit-content',
                    position: { lg: 'sticky' },
                    top: { lg: 24 },
                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`
                    }
                  }}
                >
                  {/* Enhanced Header */}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: { xs: 40, md: 44 },
                        height: { xs: 40, md: 44 },
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <PictureAsPdf sx={{ color: theme.palette.primary.main, fontSize: { xs: 20, md: 22 } }} />
                    </Box>
                    <Typography variant={isMobile ? 'body2' : 'subtitle1'} fontWeight={700} color="text.primary">
                      CV/Resume
                    </Typography>
                  </Stack>
                  
                  {/* Enhanced File Card */}
                  <Card
                    sx={{
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      borderRadius: 2,
                      p: 2,
                      mb: 2,
                      transition: 'all 0.3s ease',
                      bgcolor: alpha(theme.palette.error.main, 0.05),
                      '&:hover': {
                        borderColor: theme.palette.error.main,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.error.main, 
                          width: { xs: 40, md: 44 }, 
                          height: { xs: 40, md: 44 }
                        }}
                      >
                        <PictureAsPdf sx={{ color: 'white', fontSize: { xs: 20, md: 22 } }} />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={600} 
                          noWrap 
                          sx={{ display: 'block', mb: 0.25 }}
                        >
                          Resume.pdf
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                          PDF Document
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>

                  {/* Enhanced Action Buttons */}
                  <Stack direction="row" spacing={1.5}>
                    <Tooltip title="Preview Document" arrow>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Visibility />}
                        onClick={() => handleDocumentPreviewClick({
                          url: onboardingData.data.profile.CV,
                          fileName: 'CV/Resume',
                          fileType: onboardingData.data.profile.CV.endsWith('.pdf') ? 'application/pdf' : 'image'
                        })}
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          color: theme.palette.primary.main,
                          fontWeight: 600,
                          py: 1.25,
                          borderRadius: 2,
                          textTransform: 'none',
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: theme.palette.primary.main,
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Preview
                      </Button>
                    </Tooltip>
                    <Tooltip title="Download Resume" arrow>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Download />}
                        onClick={() => handleDownload(onboardingData.data.profile.CV)}
                        sx={{
                          bgcolor: theme.palette.success.main,
                          color: 'white',
                          fontWeight: 600,
                          py: 1.25,
                          borderRadius: 2,
                          textTransform: 'none',
                          '&:hover': { 
                            bgcolor: theme.palette.success.dark,
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Download
                      </Button>
                    </Tooltip>
                  </Stack>
                </Paper>
              </Fade>
            )}
          </Box>

          {/* Enhanced References Section */}
          <Grow in timeout={1200}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                borderRadius: 3,
                bgcolor: 'background.paper',
                backgroundImage: `linear-gradient(to bottom, ${alpha(theme.palette.warning.main, 0.02)} 0%, transparent 100%)`,
                boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`
                },
                mt: { xs: 3, md: 4 }
              }}
            >
              <Stack 
              
                direction="row" 
                alignItems="center" 
                justifyContent="space-between"
                spacing={2} 
                sx={{ mb: 3 }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: { xs: 44, md: 48 },
                      height: { xs: 44, md: 48 },
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Person sx={{ 
                      color: theme.palette.warning.main, 
                      fontSize: { xs: 22, md: 24 } 
                    }} />
                  </Box>
                  <Box>
                    <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight={700} color="text.primary">
                      Professional References
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.25 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {isRefsLoading && onboardingRefs.length === 0 
                          ? 'Loading...' 
                          : `${displayReferences.length || 0} reference${displayReferences.length !== 1 ? 's' : ''}`
                        }
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>

            {/* Enhanced Error State */}
            {isRefsError && !displayReferences.length && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                }}
                action={
                  <Button 
                    size="small" 
                    onClick={() => refetchRefs()}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 1.5
                    }}
                  >
                    Retry
                  </Button>
                }
              >
                {refsError?.response?.data?.message || 'Failed to load reference data. Showing profile references only.'}
              </Alert>
            )}

            {/* Enhanced Loading State */}
            {isRefsLoading && onboardingRefs.length === 0 ? (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr' }, 
                gap: 2 
              }}>
                {[1, 2].map((i) => (
                  <Card 
                    key={i} 
                    sx={{ 
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`, 
                      borderRadius: 2.5, 
                      p: 2.5,
                      bgcolor: alpha(theme.palette.background.paper, 0.8)
                    }}
                  >
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Skeleton variant="circular" width={44} height={44} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="70%" height={22} />
                          <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />
                        </Box>
                        <Skeleton variant="rounded" width={90} height={28} />
                      </Stack>
                      <Divider />
                      <Skeleton variant="text" width="85%" height={16} />
                      <Skeleton variant="text" width="75%" height={16} />
                      <Skeleton variant="text" width="65%" height={16} />
                    </Stack>
                  </Card>
                ))}
              </Box>
            ) : displayReferences.length > 0 ? (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr', md: '1fr 1fr' },
                gap: { xs: 2, md: 2.5 }
              }}>
                {displayReferences.map((reference, index) => {
                  const StatusIconComponent = getStatusIcon(reference.status);
                  const statusColor = getStatusColor(reference.status);
                  const statusConfig = {
                    success: { 
                      bg: alpha(theme.palette.success.main, 0.1), 
                      color: theme.palette.success.dark, 
                      border: theme.palette.success.main,
                      icon: theme.palette.success.main
                    },
                    info: { 
                      bg: alpha(theme.palette.info.main, 0.1), 
                      color: theme.palette.info.dark, 
                      border: theme.palette.info.main,
                      icon: theme.palette.info.main
                    },
                    warning: { 
                      bg: alpha(theme.palette.warning.main, 0.1), 
                      color: theme.palette.warning.dark, 
                      border: theme.palette.warning.main,
                      icon: theme.palette.warning.main
                    },
                    error: { 
                      bg: alpha(theme.palette.error.main, 0.1), 
                      color: theme.palette.error.dark, 
                      border: theme.palette.error.main,
                      icon: theme.palette.error.main
                    }
                  };
                  const config = statusConfig[statusColor] || statusConfig.warning;

                  return (
                    <Grow in timeout={800 + (index * 100)} key={reference._id || index}>
                      <Card
                        sx={{
                          border: `1.5px solid ${alpha(config.border, 0.2)}`,
                          borderRadius: 3,
                          p: { xs: 2.5, md: 3 },
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          bgcolor: '#ffffff',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 5,
                            background: `linear-gradient(180deg, ${config.border} 0%, ${alpha(config.border, 0.7)} 50%, ${config.border} 100%)`,
                            transform: 'scaleY(0)',
                            transformOrigin: 'bottom',
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 0 12px ${alpha(config.border, 0.5)}`
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '40%',
                            height: '40%',
                            background: `radial-gradient(circle, ${alpha(config.border, 0.05)} 0%, transparent 70%)`,
                            opacity: 0,
                            transition: 'opacity 0.4s ease'
                          },
                          '&:hover': {
                            borderColor: config.border,
                            boxShadow: `0 8px 32px ${alpha(config.border, 0.25)}, 0 2px 8px ${alpha(config.border, 0.15)}`,
                            transform: 'translateY(-4px) scale(1.01)',
                            '&::before': {
                              transform: 'scaleY(1)'
                            },
                            '&::after': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                      <Stack 
                        direction="row" 
                        alignItems="flex-start" 
                        justifyContent="space-between" 
                        spacing={2} 
                        sx={{ mb: 2 }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                          <Avatar 
                            sx={{
                              bgcolor: alpha(config.icon, 0.15),
                              color: config.icon,
                              width: { xs: 44, md: 48 },
                              height: { xs: 44, md: 48 },
                              fontSize: { xs: '1rem', md: '1.125rem' },
                              fontWeight: 700,
                              border: `2px solid ${alpha(config.icon, 0.2)}`
                            }}
                          >
                            {(reference.name || 'R').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography 
                              variant={isMobile ? 'body2' : 'subtitle1'} 
                              fontWeight={700} 
                              noWrap
                              color="text.primary"
                              sx={{ mb: 0.25 }}
                            >
                              {reference.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                              Reference #{index + 1}
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Chip
                          icon={StatusIconComponent}
                          label={getStatusLabel(reference.status)}
                          size="small"
                          sx={{
                            bgcolor: config.bg,
                            color: config.color,
                            border: `1.5px solid ${alpha(config.border, 0.4)}`,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            height: 32,
                            px: 1,
                            boxShadow: `0 2px 4px ${alpha(config.border, 0.15)}`,
                            '& .MuiChip-icon': {
                              color: config.icon,
                              fontSize: 16,
                              fontWeight: 600
                            },
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: `0 4px 8px ${alpha(config.border, 0.3)}`,
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                      </Stack>

                      <Divider sx={{ my: 2, opacity: 0.5 }} />

                      <Stack spacing={2}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                            border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Business 
                                fontSize="small" 
                                sx={{ 
                                  color: theme.palette.primary.main, 
                                  fontSize: 20
                                }} 
                              />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight={700} 
                                noWrap 
                                color="text.primary"
                                sx={{ mb: 0.5 }}
                              >
                                {reference.company || 'N/A'}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                noWrap 
                                fontWeight={500}
                              >
                                {reference.position || 'N/A'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>

                        {reference.email && (
                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            spacing={1.5}
                            sx={{
                              px: 2,
                              py: 1.5,
                              borderRadius: 2.5,
                              bgcolor: alpha(theme.palette.info.main, 0.06),
                              border: `1.5px solid ${alpha(theme.palette.info.main, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                borderColor: alpha(theme.palette.info.main, 0.3),
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.info.main, 0.15),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Email 
                                fontSize="small" 
                                sx={{ 
                                  color: theme.palette.info.main, 
                                  fontSize: 18
                                }} 
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.primary" 
                              noWrap
                              sx={{ flex: 1 }}
                              fontWeight={600}
                            >
                              {reference.email}
                            </Typography>
                          </Stack>
                        )}

                        {reference.phone && (
                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            spacing={1.5}
                            sx={{
                              px: 2,
                              py: 1.5,
                              borderRadius: 2.5,
                              bgcolor: alpha(theme.palette.secondary?.main || theme.palette.grey[500], 0.06),
                              border: `1.5px solid ${alpha(theme.palette.secondary?.main || theme.palette.grey[500], 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.secondary?.main || theme.palette.grey[500], 0.1),
                                borderColor: alpha(theme.palette.secondary?.main || theme.palette.grey[500], 0.3),
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.secondary?.main || theme.palette.grey[500], 0.15),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <Phone 
                                fontSize="small" 
                                sx={{ 
                                  color: theme.palette.secondary?.main || theme.palette.text.secondary, 
                                  fontSize: 18
                                }} 
                              />
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.primary" 
                              fontWeight={600}
                            >
                              {reference.phone}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      {reference.emailTracking && (
                        <Box 
                          sx={{ 
                            mt: 2, 
                            pt: 2, 
                            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={600}
                            sx={{ mb: 1, display: 'block' }}
                          >
                            Email Tracking
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                            {reference.emailTracking.opened && (
                              <Chip
                                icon={<Visibility sx={{ fontSize: 14 }} />}
                                label="Opened"
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.dark,
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 26,
                                  '& .MuiChip-icon': {
                                    color: theme.palette.info.main
                                  }
                                }}
                              />
                            )}
                            {reference.emailTracking.clicked && (
                              <Chip
                                icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                label="Clicked"
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.dark,
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 26,
                                  '& .MuiChip-icon': {
                                    color: theme.palette.success.main
                                  }
                                }}
                              />
                            )}
                            {reference.emailTracking.emailsSent > 0 && (
                              <Chip
                                icon={<MarkEmailRead sx={{ fontSize: 14 }} />}
                                label={`${reference.emailTracking.emailsSent} sent`}
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.dark,
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                  height: 26,
                                  '& .MuiChip-icon': {
                                    color: theme.palette.primary.main
                                  }
                                }}
                              />
                            )}
                          </Stack>
                        </Box>
                      )}

                      {reference.progress && 
                       typeof reference.progress.totalQuestions === 'number' && 
                       reference.progress.totalQuestions > 0 && (
                        <Box 
                          sx={{ 
                            mt: 2.5, 
                            pt: 2.5, 
                            px: 2,
                            py: 2,
                            borderRadius: 2.5,
                            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                          }}
                        >
                          <Stack 
                            direction="row" 
                            justifyContent="space-between" 
                            alignItems="center" 
                            sx={{ mb: 2 }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: theme.palette.primary.main,
                                  boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.6)}`
                                }}
                              />
                              <Typography 
                                variant="body2" 
                                color="text.primary" 
                                fontWeight={700}
                                sx={{ fontSize: isMobile ? '0.875rem' : '0.9375rem' }}
                              >
                                Questionnaire Progress
                              </Typography>
                            </Stack>
                            <Stack 
                              direction="row" 
                              alignItems="baseline" 
                              spacing={0.5}
                              sx={{
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                              }}
                            >
                              <Typography 
                                variant="h6" 
                                fontWeight={800} 
                                sx={{ 
                                  color: theme.palette.primary.main,
                                  fontSize: isMobile ? '1rem' : '1.125rem',
                                  lineHeight: 1.2
                                }}
                              >
                                {reference.progress.answeredQuestions || 0}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: theme.palette.text.secondary,
                                  fontWeight: 600,
                                  opacity: 0.7
                                }}
                              >
                                /{reference.progress.totalQuestions}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  ml: 0.5,
                                  color: theme.palette.primary.dark,
                                  fontWeight: 700,
                                  fontSize: '0.75rem'
                                }}
                              >
                                ({reference.progress.percentageComplete || 0}%)
                              </Typography>
                            </Stack>
                          </Stack>
                          
                          {/* Enhanced Progress Bar with Gradient */}
                          <Box 
                            sx={{
                              height: 12,
                              bgcolor: alpha(theme.palette.grey[300], 0.3),
                              borderRadius: 3,
                              overflow: 'hidden',
                              position: 'relative',
                              boxShadow: `inset 0 2px 4px ${alpha(theme.palette.common.black, 0.06)}`
                            }}
                          >
                            <Box 
                              sx={{
                                height: '100%',
                                width: `${Math.min(Math.max(reference.progress.percentageComplete || 0, 0), 100)}%`,
                                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                                borderRadius: 3,
                                position: 'relative',
                                background: reference.progress.percentageComplete >= 100
                                  ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 50%, ${theme.palette.success.main} 100%)`
                                  : reference.progress.percentageComplete >= 75
                                  ? `linear-gradient(90deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.info.main} 100%)`
                                  : reference.progress.percentageComplete >= 50
                                  ? `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 50%, ${theme.palette.primary.main} 100%)`
                                  : `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 50%, ${theme.palette.warning.main} 100%)`,
                                boxShadow: `0 2px 8px ${alpha(
                                  reference.progress.percentageComplete >= 100
                                    ? theme.palette.success.main
                                    : reference.progress.percentageComplete >= 50
                                    ? theme.palette.primary.main
                                    : theme.palette.warning.main,
                                  0.4
                                )}`,
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  background: `linear-gradient(90deg, transparent 0%, ${alpha('#fff', 0.4)} 50%, transparent 100%)`,
                                  borderRadius: 3,
                                  animation: 'shimmer 2.5s ease-in-out infinite'
                                },
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: '50%',
                                  right: 0,
                                  transform: 'translateY(-50%)',
                                  width: 3,
                                  height: '80%',
                                  bgcolor: alpha('#fff', 0.6),
                                  borderRadius: '0 3px 3px 0',
                                  boxShadow: `0 0 4px ${alpha('#fff', 0.8)}`
                                }
                              }} 
                            />
                            {/* Progress percentage indicator dot */}
                            {reference.progress.percentageComplete > 0 && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: `${Math.min(Math.max(reference.progress.percentageComplete || 0, 0), 100)}%`,
                                  transform: 'translate(-50%, -50%)',
                                  width: 16,
                                  height: 16,
                                  borderRadius: '50%',
                                  bgcolor: '#fff',
                                  border: `3px solid ${
                                    reference.progress.percentageComplete >= 100
                                      ? theme.palette.success.main
                                      : reference.progress.percentageComplete >= 50
                                      ? theme.palette.primary.main
                                      : theme.palette.warning.main
                                  }`,
                                  boxShadow: `0 2px 8px ${alpha(
                                    reference.progress.percentageComplete >= 100
                                      ? theme.palette.success.main
                                      : reference.progress.percentageComplete >= 50
                                      ? theme.palette.primary.main
                                      : theme.palette.warning.main,
                                    0.5
                                  )}`,
                                  transition: 'left 0.8s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease',
                                  zIndex: 1
                                }}
                              />
                            )}
                          </Box>
                          
                          {/* Progress Text Indicator */}
                          <Stack 
                            direction="row" 
                            justifyContent="space-between" 
                            alignItems="center"
                            sx={{ mt: 1.5 }}
                          >
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              fontWeight={500}
                            >
                              {reference.progress.totalQuestions - (reference.progress.answeredQuestions || 0)} questions remaining
                            </Typography>
                            <Chip
                              label={
                                reference.progress.percentageComplete >= 100
                                  ? 'Completed'
                                  : reference.progress.percentageComplete >= 75
                                  ? 'Almost Done'
                                  : reference.progress.percentageComplete >= 50
                                  ? 'Halfway'
                                  : 'Getting Started'
                              }
                              size="small"
                              sx={{
                                bgcolor: reference.progress.percentageComplete >= 100
                                  ? alpha(theme.palette.success.main, 0.1)
                                  : reference.progress.percentageComplete >= 75
                                  ? alpha(theme.palette.info.main, 0.1)
                                  : reference.progress.percentageComplete >= 50
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : alpha(theme.palette.warning.main, 0.1),
                                color: reference.progress.percentageComplete >= 100
                                  ? theme.palette.success.dark
                                  : reference.progress.percentageComplete >= 75
                                  ? theme.palette.info.dark
                                  : reference.progress.percentageComplete >= 50
                                  ? theme.palette.primary.dark
                                  : theme.palette.warning.dark,
                                border: `1px solid ${
                                  reference.progress.percentageComplete >= 100
                                    ? alpha(theme.palette.success.main, 0.3)
                                    : reference.progress.percentageComplete >= 75
                                    ? alpha(theme.palette.info.main, 0.3)
                                    : reference.progress.percentageComplete >= 50
                                    ? alpha(theme.palette.primary.main, 0.3)
                                    : alpha(theme.palette.warning.main, 0.3)
                                }`,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 24
                              }}
                            />
                          </Stack>
                        </Box>
                      )}
                    </Card>
                    </Grow>
                  );
                })}
              </Box>
            ) : (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: { xs: 8, md: 12 },
                  px: 2
                }}
              >
                <Box
                  sx={{
                    width: { xs: 100, md: 120 },
                    height: { xs: 100, md: 120 },
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2.5
                  }}
                >
                  <Person sx={{ fontSize: { xs: 48, md: 56 }, color: theme.palette.warning.main }} />
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                  No References Added
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                  Add professional references to strengthen your profile and showcase your professional network
                </Typography>
              </Box>
            )}
          </Paper>
          </Grow>
        </Container>
      </Box>

      {/* Document Preview Modal */}
      {previewDocument && (
        <DocumentPreview
          document={previewDocument}
          onClose={closeDocumentPreview}
        />
      )}
      </Box>
    </>
  );
};

export default WorkHistory;