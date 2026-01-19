import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Tooltip,
  Container,
  Fade,
  useTheme,
  useMediaQuery,
  alpha,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Download,
  Visibility,
  Edit,
  Add
} from '@mui/icons-material';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DocumentPreview from '../../components/workerForm/Modals/DocumentPreview';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api/auth';
import { useWorkerReferences } from '../../hooks/useReferences';
import WorkExperience from '../../components/workerDashboard/components/WorkHistoryComponents/WorkExperience';
import ProfessionalReferences from '../../components/workerDashboard/components/WorkHistoryComponents/ProfessionalReferences';
import DynamicEditDrawer from '../../components/workerDashboard/components/WorkHistoryComponents/DynamicEditDrawer';
import WorkHistoryHeader from '../../components/workerDashboard/components/WorkerDashboardAvailability/Components/WorkHistoryHeader/WorkHistoryHeader';

const WorkHistory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const { data: onboardingData } = useOnboardingQuery();
  const [previewDocument, setPreviewDocument] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState(null);
  const [drawerInitialData, setDrawerInitialData] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000,
  });

  const {
    data: workerRefsData,
    isLoading: isRefsLoading,
    isError: isRefsError,
    error: refsError,
    refetch: refetchRefs
  } = useWorkerReferences(user?._id, { enabled: !!user });

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

  const mergedReferences = useMemo(() => {
    if (!Array.isArray(onboardingRefs) || !Array.isArray(apiReferences)) {
      return [];
    }

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
        console.warn('Invalid reference entry:', error);
      }
    });

    const merged = onboardingRefs
      .filter(ref => ref && typeof ref === 'object')
      .map((onboardingRef, idx) => {
        if (!onboardingRef || !onboardingRef.email) {
          return null;
        }

        const email = onboardingRef.email?.toLowerCase()?.trim();
        const apiRef = email ? apiRefsByEmail.get(email) : null;

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
          isUnsynced: true,
        };
      })
      .filter(Boolean);

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

  // Helper function to detect file type from URL
  const detectFileType = useCallback((url) => {
    // Ensure URL is a string
    if (!url) {
      return 'image'; // Default to image
    }
    
    // Convert to string if needed
    const urlString = typeof url === 'string' ? url : String(url);
    
    if (!urlString || urlString.trim().length === 0) {
      return 'image'; // Default to image
    }
    
    try {
      // Extract file extension from URL (handle query parameters)
      const urlWithoutQuery = urlString.split('?')[0];
      const extension = urlWithoutQuery.split('.').pop()?.toLowerCase();
      
      // PDF detection
      if (extension === 'pdf' || urlWithoutQuery.toLowerCase().includes('.pdf')) {
        return 'application/pdf';
      }
      
      // Image detection
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
      if (extension && imageExtensions.includes(extension)) {
        return `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      }
      
      // Default to image if unknown
      return 'image';
    } catch (error) {
      console.warn('Error detecting file type:', error);
      return 'image'; // Default fallback
    }
  }, []);

  const handleDocumentPreviewClick = useCallback((doc) => {
    if (!doc) {
      console.warn('Invalid document provided for preview:', doc);
      return;
    }
    
    // Ensure URL is a string
    let url = doc.url;
    if (!url) {
      console.warn('Document URL is missing:', doc);
      return;
    }
    
    // Convert URL to string if it's not already
    if (typeof url !== 'string') {
      if (typeof url === 'object' && url.toString) {
        url = url.toString();
      } else {
        console.error('Document URL is not a valid string:', url, typeof url);
        return;
      }
    }
    
    // Ensure document object has all required properties with proper types
    const documentToPreview = {
      url: String(url).trim(), // Ensure it's a string
      fileName: doc.fileName || 'Document',
      fileType: doc.fileType || detectFileType(url),
    };
    
    // Final validation
    if (!documentToPreview.url || documentToPreview.url.length === 0) {
      console.error('Invalid URL after processing:', documentToPreview);
      return;
    }
    
    console.log('Opening document preview:', documentToPreview);
    setPreviewDocument(documentToPreview);
  }, [detectFileType]);

  const closeDocumentPreview = useCallback(() => {
    setPreviewDocument(null);
  }, []);

  const handleDownload = useCallback((url) => {
    if (!url) {
      console.error('Invalid URL provided for download');
      return;
    }
    
    // Convert URL to string if needed
    let urlString = url;
    if (typeof url !== 'string') {
      if (typeof url === 'object' && url !== null) {
        urlString = url.url || url.path || url.link || url.src || String(url);
      } else {
        urlString = String(url);
      }
    }
    
    urlString = String(urlString).trim();
    
    if (!urlString || urlString.length === 0) {
      console.error('Invalid URL after processing:', url);
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = urlString;
      link.download = 'CV-Resume.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      window.open(urlString, '_blank');
    }
  }, []);

  const handleEditClick = useCallback((sectionName, itemData = null) => {
    // Map section names to drawer section types
    const sectionMap = {
      'Work Experience': 'work-experience',
      'Professional References': 'professional-references',
      'Resume / CV': 'resume-cv'
    };

    const sectionType = sectionMap[sectionName] || sectionName;
    
    // Prepare initial data based on section type
    let initialData = null;
    
    if (sectionType === 'work-experience') {
      // If editing a specific item, pass it; otherwise pass all work history
      if (itemData) {
        initialData = [itemData];
      } else {
        initialData = onboardingData?.data?.profile?.workHistory || [];
      }
    } else if (sectionType === 'professional-references') {
      // If editing a specific reference, pass it; otherwise pass all references
      if (itemData) {
        initialData = [itemData];
      } else {
        initialData = displayReferences;
      }
    } else if (sectionType === 'resume-cv') {
      // Pass CV URL
      initialData = onboardingData?.data?.profile?.CV || null;
    }
    
    setDrawerSection(sectionType);
    setDrawerInitialData(initialData);
    setDrawerOpen(true);
  }, [onboardingData, displayReferences]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    setDrawerSection(null);
    setDrawerInitialData(null);
  }, []);

  const handleDrawerSaveSuccess = useCallback(() => {
    setToastMessage('Changes saved successfully!');
    setToastOpen(true);
  }, []);

  // Listen for drawer open/close events to toggle sidebar visibility (similar to MyCertifications)
  useEffect(() => {
    const handleDrawerOpen = () => setIsDrawerOpen(true);
    const handleDrawerClose = () => setIsDrawerOpen(false);
    
    window.addEventListener('drawer:open', handleDrawerOpen);
    window.addEventListener('drawer:close', handleDrawerClose);
    
    return () => {
      window.removeEventListener('drawer:open', handleDrawerOpen);
      window.removeEventListener('drawer:close', handleDrawerClose);
    };
  }, []);
  
  const handleToastClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setToastOpen(false);
    setToastMessage('');
  }, []);

  // Calculate stats for the header
  const workHistoryCount = onboardingData?.data?.profile?.workHistory?.length || 0;
  const referencesCount = displayReferences.length || 0;
  const hasCV = !!onboardingData?.data?.profile?.CV;

  return (
    <>
      <Box sx={{ 
      
        minHeight: '100vh',
        position: 'relative'
      }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)', position: 'relative' }}>
          {!isDrawerOpen && <DashboardSidebar />}
          <Container 
            maxWidth="xl" 
            sx={{ 
              py: { xs: 3, sm: 4, md: 5 },
              px: { xs: 1, sm: 3, md: 4 },
              flexGrow: 1,
              width: '100%',
              maxWidth: '1400px',
              mx: 'auto'
            }}
          >
            {/* Work History Header Component */}
            <WorkHistoryHeader
              workHistoryCount={workHistoryCount}
              referencesCount={referencesCount}
              hasCV={hasCV}
              breadcrumbHref="/dashboard"
            />

            {/* Main Content - Column Layout for All Devices */}
            <Stack 
              direction="column"
              spacing={0}
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', sm: '800px', md: '900px', lg: '1000px' },
                mx: 'auto',
              }}
            >
              {/* CV/Resume Section - Show when CV exists */}
              {hasCV && onboardingData?.data?.profile?.CV && (
                <Fade in timeout={400}>
                  <Box 
                    sx={{ 
                      width: '100%',
                      position: 'relative',
                      pt: { xs: 4, sm: 5, md: 6 },
                      pb: { xs: 4, sm: 5, md: 6 },
                      px: { xs: 0, sm: 0, md: 0 },
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                      '&:first-of-type': {
                        borderTop: 'none',
                        pt: 0,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        bottom: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        width: { xs: 0, sm: 0, md: 4 },
                        borderRadius: '0 3px 3px 0',
                        background: `linear-gradient(180deg, ${alpha(theme.palette.secondary.main, 0.7)} 0%, ${alpha(theme.palette.secondary.main, 0.4)} 100%)`,
                        opacity: 0.7,
                        transition: 'all 0.3s ease',
                      },
                      '&:hover::before': {
                        opacity: 1,
                        width: { xs: 0, sm: 0, md: 5 },
                      },
                      [theme.breakpoints.up('md')]: {
                        pl: { md: 2, lg: 3 },
                      }
                    }}
                  >
                    {/* Section Header */}
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ mb: { xs: 2, sm: 2.5 } }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          component="h2"
                          sx={{
                            fontSize: {
                              xs: '1.25rem',
                              sm: '1.5rem',
                              md: '1.75rem',
                            },
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: theme.palette.text.primary,
                            lineHeight: 1.2,
                            mb: 0.5,
                          }}
                        >
                          Resume / CV
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: {
                              xs: '0.875rem',
                              sm: '0.9375rem',
                              md: '1rem',
                            },
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6,
                          }}
                        >
                          Your professional document
                        </Typography>
                      </Box>

                      {/* CV Edit Button */}
                      <Tooltip title="Edit Resume / CV" arrow placement="top">
                        <IconButton
                          onClick={() => handleEditClick('Resume / CV')}
                          sx={{
                            width: { xs: 36, sm: 40 },
                            height: { xs: 36, sm: 40 },
                            bgcolor: alpha(theme.palette.secondary.main, 0.08),
                            color: theme.palette.secondary.main,
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.secondary.main, 0.12),
                              transform: 'scale(1.05)',
                            },
                          }}
                        >
                          <Edit sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {/* Action Buttons - Flex Layout */}
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 1, sm: 1.5 }}
                      sx={{ mt: { xs: 1.5, sm: 2 } }}
                    >
                      <Button
                        variant="outlined"
                        fullWidth={isMobile}
                        startIcon={<Visibility sx={{ fontSize: 18 }} />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            const cvData = onboardingData?.data?.profile?.CV;
                            if (!cvData) {
                              console.error('CV data is not available');
                              return;
                            }
                            
                            // Handle CV as string URL or extract URL from object
                            let cvUrl = cvData;
                            if (typeof cvData === 'object' && cvData !== null) {
                              // If CV is an object, try to extract URL
                              cvUrl = cvData.url || cvData.path || cvData.link || cvData.src || String(cvData);
                            }
                            
                            // Ensure it's a string
                            cvUrl = String(cvUrl).trim();
                            
                            if (!cvUrl || cvUrl.length === 0) {
                              console.error('CV URL is invalid:', cvData);
                              return;
                            }
                            
                            const fileType = detectFileType(cvUrl);
                            console.log('Preview button clicked - CV URL:', cvUrl, 'File Type:', fileType, 'Original CV Data:', cvData);
                            
                            handleDocumentPreviewClick({
                              url: cvUrl,
                              fileName: 'Resume / CV',
                              fileType: fileType
                            });
                          } catch (error) {
                            console.error('Error opening document preview:', error);
                          }
                        }}
                        disabled={!onboardingData?.data?.profile?.CV}
                        sx={{
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.primary,
                          fontWeight: 600,
                          py: { xs: 1.25, sm: 1.5 },
                          px: { xs: 2, sm: 3 },
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '0.9375rem',
                          flex: { xs: 'none', sm: 1 },
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                          },
                          '&:disabled': {
                            opacity: 0.5,
                            cursor: 'not-allowed',
                          }
                        }}
                      >
                        Preview Document
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth={isMobile}
                        startIcon={<Download sx={{ fontSize: 18 }} />}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            const cvData = onboardingData?.data?.profile?.CV;
                            if (!cvData) {
                              console.error('CV data is not available for download');
                              return;
                            }
                            
                            // Handle CV as string URL or extract URL from object
                            let cvUrl = cvData;
                            if (typeof cvData === 'object' && cvData !== null) {
                              cvUrl = cvData.url || cvData.path || cvData.link || cvData.src || String(cvData);
                            }
                            
                            handleDownload(cvUrl);
                          } catch (error) {
                            console.error('Error downloading CV:', error);
                          }
                        }}
                        disabled={!onboardingData?.data?.profile?.CV}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          fontWeight: 600,
                          py: { xs: 1.25, sm: 1.5 },
                          px: { xs: 2, sm: 3 },
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '0.9375rem',
                          flex: { xs: 'none', sm: 1 },
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                          },
                          '&:disabled': {
                            opacity: 0.5,
                            cursor: 'not-allowed',
                          }
                        }}
                      >
                        Download Resume
                      </Button>
                    </Stack>
                  </Box>
                </Fade>
              )}

              {/* CV/Resume Section - Show when CV doesn't exist */}
              {!hasCV && (
                <Fade in timeout={400}>
                  <Box 
                    sx={{ 
                      width: '100%',
                      position: 'relative',
                      pt: { xs: 4, sm: 5, md: 6 },
                      pb: { xs: 4, sm: 5, md: 6 },
                      px: { xs: 0, sm: 0, md: 0 },
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                      '&:first-of-type': {
                        borderTop: 'none',
                        pt: 0,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        bottom: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                        width: { xs: 0, sm: 0, md: 4 },
                        borderRadius: '0 3px 3px 0',
                        background: `linear-gradient(180deg, ${alpha(theme.palette.secondary.main, 0.7)} 0%, ${alpha(theme.palette.secondary.main, 0.4)} 100%)`,
                        opacity: 0.7,
                        transition: 'all 0.3s ease',
                      },
                      '&:hover::before': {
                        opacity: 1,
                        width: { xs: 0, sm: 0, md: 5 },
                      },
                      [theme.breakpoints.up('md')]: {
                        pl: { md: 2, lg: 3 },
                      }
                    }}
                  >
                    {/* Section Header */}
                    <Stack
                      direction="row"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      spacing={2}
                      sx={{ mb: { xs: 2, sm: 2.5 } }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          component="h2"
                          sx={{
                            fontSize: {
                              xs: '1.25rem',
                              sm: '1.5rem',
                              md: '1.75rem',
                            },
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                            color: theme.palette.text.primary,
                            lineHeight: 1.2,
                            mb: 0.5,
                          }}
                        >
                          Resume / CV
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: {
                              xs: '0.875rem',
                              sm: '0.9375rem',
                              md: '1rem',
                            },
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6,
                          }}
                        >
                          Upload your professional document
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Empty State */}
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: { xs: 4, sm: 5, md: 6 },
                        px: 2,
                      }}
                    >
                      <Typography
                        component="h3"
                        sx={{
                          fontSize: {
                            xs: '1.125rem',
                            sm: '1.25rem',
                            md: '1.375rem',
                          },
                          fontWeight: 700,
                          color: theme.palette.text.primary,
                          mb: 1,
                          letterSpacing: '-0.01em',
                        }}
                      >
                        No Resume / CV Added
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: {
                            xs: '0.9375rem',
                            sm: '1rem',
                            md: '1.0625rem',
                          },
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6,
                          maxWidth: 500,
                          mx: 'auto',
                          mb: { xs: 2, sm: 2.5 },
                        }}
                      >
                        Upload your resume or CV to showcase your professional
                        experience and qualifications
                      </Typography>

                      {/* Add CV Button */}
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Add sx={{ fontSize: 20 }} />}
                        onClick={() => handleEditClick('Resume / CV')}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          fontWeight: 600,
                          py: { xs: 1.25, sm: 1.5 },
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '0.9375rem',
                          maxWidth: 400,
                          mx: 'auto',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                          },
                        }}
                      >
                        Add Resume / CV
                      </Button>

                      {/* File Format Info */}
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.disabled,
                          fontSize: '0.8125rem',
                          mt: 2,
                          display: 'block',
                        }}
                      >
                        Supported formats: PDF, JPG, PNG (Max 5MB)
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              )}

              {/* Work Experience Section */}
              <Box
                sx={{
                  width: '100%',
                  position: 'relative',
                  pt: { xs: 4, sm: 5, md: 6 },
                  pb: { xs: 4, sm: 5, md: 6 },
                  px: { xs: 0, sm: 0, md: 0 },
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    bottom: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    width: { xs: 0, sm: 0, md: 4 },
                    borderRadius: '0 3px 3px 0',
                    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.7)} 0%, ${alpha(theme.palette.primary.main, 0.4)} 100%)`,
                    opacity: 0.7,
                    transition: 'all 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                    width: { xs: 0, sm: 0, md: 5 },
                  },
                  [theme.breakpoints.up('md')]: {
                    pl: { md: 2, lg: 3 },
                  }
                }}
              >
                <WorkExperience 
                  workHistory={onboardingData?.data?.profile?.workHistory || []}
                  isLoading={!onboardingData}
                  onEditClick={() => handleEditClick('Work Experience')}
                  onItemEdit={(item) => handleEditClick('Work Experience', item)}
                />
              </Box>

              {/* Professional References Section */}
              <Box
                sx={{
                  width: '100%',
                  position: 'relative',
                  pt: { xs: 4, sm: 5, md: 6 },
                  pb: { xs: 4, sm: 5, md: 6 },
                  px: { xs: 0, sm: 0, md: 0 },
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    bottom: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    width: { xs: 0, sm: 0, md: 4 },
                    borderRadius: '0 3px 3px 0',
                    background: `linear-gradient(180deg, ${alpha(theme.palette.success.main, 0.7)} 0%, ${alpha(theme.palette.success.main, 0.4)} 100%)`,
                    opacity: 0.7,
                    transition: 'all 0.3s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                    width: { xs: 0, sm: 0, md: 5 },
                  },
                  [theme.breakpoints.up('md')]: {
                    pl: { md: 2, lg: 3 },
                  }
                }}
              >
                <ProfessionalReferences
                  references={displayReferences}
                  isLoading={isRefsLoading && onboardingRefs.length === 0}
                  isError={isRefsError && !displayReferences.length}
                  error={refsError}
                  onRetry={() => refetchRefs()}
                  onEditClick={() => handleEditClick('Professional References')}
                  onItemEdit={(item) => handleEditClick('Professional References', item)}
                />
              </Box>
            </Stack>
          </Container>
        </Box>
        
        {/* Overlay when drawer is open */}
        {isDrawerOpen && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(15, 23, 42, 0.06)',
              backdropFilter: 'blur(1px)',
              pointerEvents: 'none',
              transition: 'opacity 0.2s ease',
              zIndex: 1
            }}
          />
        )}

        {/* Document Preview Modal */}
        {previewDocument && (
          <DocumentPreview
            document={previewDocument}
            onClose={closeDocumentPreview}
          />
        )}

        {/* Toast Notification */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={3000}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            mt: { xs: 8, sm: 9 }
          }}
        >
          <Alert
            onClose={handleToastClose}
            severity="success"
            variant="filled"
            sx={{
              width: '100%',
              bgcolor: '#10B981',
              color: 'white',
              fontWeight: 500,
              fontSize: '0.9375rem',
              borderRadius: 2,
              boxShadow: `0 4px 16px ${alpha('#10B981', 0.3)}`,
              '& .MuiAlert-icon': {
                color: 'white'
              },
              '& .MuiAlert-action': {
                color: 'white'
              }
            }}
          >
            {toastMessage || 'Changes saved successfully!'}
          </Alert>
        </Snackbar>

        {/* Dynamic Edit Drawer */}
        <DynamicEditDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          sectionType={drawerSection}
          initialData={drawerInitialData}
          onSaveSuccess={handleDrawerSaveSuccess}
        />
      </Box>
    </>
  );
};

export default WorkHistory;