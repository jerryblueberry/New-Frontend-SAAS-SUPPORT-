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
  Avatar,
  Breadcrumbs,
  Link,
  Chip,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  Work,
  Visibility,
  Home,
  ChevronRight,
  Description,
  CheckCircle,
  Edit,
  CloudUpload,
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
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      window.open(url, '_blank');
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
        bgcolor: '#F8FAFC',
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
            {/* Modern Breadcrumb Navigation */}
            <Fade in timeout={400}>
              <Breadcrumbs 
                separator={<ChevronRight sx={{ fontSize: 16, color: '#94A3B8' }} />}
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  '& .MuiBreadcrumbs-ol': {
                    flexWrap: 'nowrap'
                  }
                }}
              >
                <Link
                  href="/dashboard"
                  underline="none"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#64748B',
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 500,
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#1E293B',
                    }
                  }}
                >
                  <Home sx={{ fontSize: 16 }} />
                  Dashboard
                </Link>
                <Typography 
                  sx={{ 
                    color: '#1E293B',
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <Work sx={{ fontSize: 16 }} />
                  Work History
                </Typography>
              </Breadcrumbs>
            </Fade>

            {/* Premium Header Section */}
            <Fade in timeout={600}>
              <Box 
                sx={{ 
                  mb: { xs: 3, sm: 4, md: 5 },
                  position: 'relative',
                  mt: { xs: 4.5, sm: 3, md: 4 },
                }}
              >
                {/* Main Header Card */}
                <Box
                  sx={{
                    bgcolor: 'white',
                    borderRadius: { xs: 2.5, sm: 3 },
                    p: { xs: 2.5, sm: 3, md: 4 },
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                    border: '1px solid #E2E8F0',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)',
                    }
                  }}
                >
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    spacing={{ xs: 2.5, sm: 3 }}
                  >
                    {/* Left: Icon + Title + Description */}
                    <Stack direction="row" alignItems="center" spacing={2.5} sx={{ flex: 1, minWidth: 0 }}>
                      {/* Modern Icon Container */}
                      <Box
                        sx={{
                          width: { xs: 56, sm: 64 },
                          height: { xs: 56, sm: 64 },
                          borderRadius: 2.5,
                          background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.25), 0 4px 10px rgba(139, 92, 246, 0.15)',
                          position: 'relative',
                          flexShrink: 0,
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: -2,
                            borderRadius: 2.5,
                            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                            opacity: 0.15,
                            filter: 'blur(8px)',
                            zIndex: -1,
                          }
                        }}
                      >
                        <Work 
                          sx={{ 
                            fontSize: { xs: 28, sm: 32 },
                            color: 'white',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                          }} 
                        />
                      </Box>

                      {/* Title & Description */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                      
                          <Typography 
                            component="h1"
                            sx={{
                              fontSize: { 
                                xs: '1.5rem',
                                sm: '1.875rem',
                                md: '2.25rem'
                              },
                              fontWeight: 700,
                              lineHeight: 1.2,
                              letterSpacing: '-0.02em',
                              color: '#0F172A',
                            }}
                          >
                            Work History
                          </Typography>
                          {/* Compact Edit Button */}
                        
                        <Typography 
                          sx={{ 
                            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                            color: '#64748B',
                            fontWeight: 400,
                            lineHeight: 1.5,
                            maxWidth: '500px',
                          }}
                        >
                          Manage your professional experience, references, and documents
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Right: Quick Stats */}
                    <Stack 
                      direction="row" 
                      spacing={{ xs: 1.5, sm: 2 }}
                      sx={{
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                      }}
                    >
                      {/* Work History Count */}
                      <Chip
                        icon={<Work sx={{ fontSize: 16, color: '#3B82F6 !important' }} />}
                        label={`${workHistoryCount} ${workHistoryCount === 1 ? 'Position' : 'Positions'}`}
                        sx={{
                          bgcolor: alpha('#3B82F6', 0.08),
                          color: '#1E40AF',
                          fontWeight: 600,
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          height: { xs: 32, sm: 36 },
                          borderRadius: 2,
                          border: `1px solid ${alpha('#3B82F6', 0.15)}`,
                          '& .MuiChip-label': {
                            px: 1.5
                          }
                        }}
                      />

                      {/* References Count */}
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: 16, color: '#10B981 !important' }} />}
                        label={`${referencesCount} ${referencesCount === 1 ? 'Reference' : 'References'}`}
                        sx={{
                          bgcolor: alpha('#10B981', 0.08),
                          color: '#065F46',
                          fontWeight: 600,
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                          height: { xs: 32, sm: 36 },
                          borderRadius: 2,
                          border: `1px solid ${alpha('#10B981', 0.15)}`,
                          '& .MuiChip-label': {
                            px: 1.5
                          }
                        }}
                      />

                      {/* CV Status */}
                      {hasCV && (
                        <Chip
                          icon={<Description sx={{ fontSize: 16, color: '#8B5CF6 !important' }} />}
                          label="CV Added"
                          sx={{
                            bgcolor: alpha('#8B5CF6', 0.08),
                            color: '#6D28D9',
                            fontWeight: 600,
                            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                            height: { xs: 32, sm: 36 },
                            borderRadius: 2,
                            border: `1px solid ${alpha('#8B5CF6', 0.15)}`,
                            display: { xs: 'none', md: 'inline-flex' },
                            '& .MuiChip-label': {
                              px: 1.5
                            }
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </Fade>

            {/* Main Content Grid */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { 
                xs: '1fr', 
                lg: hasCV ? '1fr 340px' : '1fr'
              },
              gap: { xs: 2.5, sm: 3, md: 3.5 },
              alignItems: 'start',
              width: '100%',
              mx: { xs: 0, sm: 'auto' },
              px: { xs: 0, sm: 0 }
            }}>
              {/* Work Experience Section */}
              <WorkExperience 
                workHistory={onboardingData?.data?.profile?.workHistory || []}
                isLoading={!onboardingData}
                onEditClick={() => handleEditClick('Work Experience')}
                onItemEdit={(item) => handleEditClick('Work Experience', item)}
              />

              {/* Premium CV/Resume Card - Show when CV exists */}
              {hasCV && onboardingData?.data?.profile?.CV && (
                <Fade in timeout={800}>
                  <Box
                    sx={{
                      position: { lg: 'sticky' },
                      top: { lg: 24 },
                      alignSelf: 'start'
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'white',
                        borderRadius: { xs: 3.5, sm: 3.5 },
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                        border: '1px solid #E2E8F0',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-2px)',
                          borderColor: alpha('#8B5CF6', 0.3)
                        }
                      }}
                    >
                      {/* Gradient Header Bar */}
                      <Box
                        sx={{
                          height: 4,
                          background: 'linear-gradient(90deg, #8B5CF6 0%, #06B6D4 100%)',
                        }}
                      />

                      <Box sx={{ p: { xs: 1.5, sm: 2.4 } }}>
                        {/* Section Header */}
                        <Stack 
                          direction="row" 
                          alignItems="center" 
                          justifyContent="space-between"
                          sx={{ mb: 2.5 }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 14px ${alpha('#8B5CF6', 0.25)}`
                              }}
                            >
                              <PictureAsPdf sx={{ color: 'white', fontSize: 22 }} />
                            </Box>
                            <Box>
                              <Typography 
                                variant="h6"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '1.125rem',
                                  color: '#0F172A',
                                  lineHeight: 1.3
                                }}
                              >
                                Resume / CV
                              </Typography>
                              <Typography 
                                variant="caption"
                                sx={{
                                  color: '#64748B',
                                  fontSize: '0.8125rem'
                                }}
                              >
                                Your professional document
                              </Typography>
                            </Box>
                          </Stack>
                          {/* CV Edit Button */}
                          <Tooltip title="Edit Resume / CV" arrow placement="top">
                            <IconButton
                              onClick={() => handleEditClick('Resume / CV')}
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: alpha('#8B5CF6', 0.1),
                                color: '#8B5CF6',
                                border: `1px solid ${alpha('#8B5CF6', 0.2)}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: alpha('#8B5CF6', 0.15),
                                  borderColor: alpha('#8B5CF6', 0.3),
                                  transform: 'scale(1.05)',
                                  boxShadow: `0 4px 12px ${alpha('#8B5CF6', 0.2)}`
                                },
                                '&:active': {
                                  transform: 'scale(0.95)'
                                }
                              }}
                            >
                              <Edit sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                        
                        {/* Document Preview Card */}
                        <Box
                          sx={{
                            border: '1px solid #E2E8F0',
                            borderRadius: 2,
                            p: 2,
                            mb: 2.5,
                            bgcolor: alpha('#F8FAFC', 0.5),
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              borderColor: alpha('#8B5CF6', 0.3),
                              bgcolor: alpha('#8B5CF6', 0.03),
                              transform: 'translateX(2px)'
                            }
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1.75}>
                            <Avatar 
                              sx={{ 
                                bgcolor: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                                width: 48,
                                height: 48,
                                boxShadow: `0 4px 12px ${alpha('#8B5CF6', 0.2)}`
                              }}
                            >
                              <PictureAsPdf sx={{ color: 'white', fontSize: 24 }} />
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="body2" 
                                fontWeight={600}
                                noWrap
                                sx={{ 
                                  color: '#0F172A',
                                  mb: 0.25,
                                  fontSize: '0.9375rem'
                                }}
                              >
                                Resume.pdf
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.75}>
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: '#10B981'
                                  }}
                                />
                                <Typography 
                                  variant="caption"
                                  sx={{
                                    color: '#64748B',
                                    fontSize: '0.8125rem',
                                    fontWeight: 500
                                  }}
                                >
                                  PDF Document
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        </Box>

                        {/* Action Buttons */}
                        <Stack spacing={1.5}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<Visibility sx={{ fontSize: 18 }} />}
                            onClick={() => handleDocumentPreviewClick({
                              url: onboardingData.data.profile.CV,
                              fileName: 'CV/Resume',
                              fileType: onboardingData.data.profile.CV.endsWith('.pdf') ? 'application/pdf' : 'image'
                            })}
                            sx={{
                              borderColor: '#CBD5E1',
                              color: '#475569',
                              fontWeight: 600,
                              py: 1.25,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '0.9375rem',
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                bgcolor: alpha('#3B82F6', 0.06),
                                borderColor: '#3B82F6',
                                color: '#3B82F6',
                                transform: 'translateY(-1px)',
                                boxShadow: `0 4px 12px ${alpha('#3B82F6', 0.15)}`
                              }
                            }}
                          >
                            Preview Document
                          </Button>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Download sx={{ fontSize: 18 }} />}
                            onClick={() => handleDownload(onboardingData.data.profile.CV)}
                            sx={{
                              background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                              color: 'white',
                              fontWeight: 600,
                              py: 1.25,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '0.9375rem',
                              boxShadow: `0 4px 14px ${alpha('#8B5CF6', 0.3)}`,
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                background: 'linear-gradient(135deg, #7C3AED 0%, #0891B2 100%)',
                                transform: 'translateY(-1px)',
                                boxShadow: `0 6px 20px ${alpha('#8B5CF6', 0.4)}`
                              }
                            }}
                          >
                            Download Resume
                          </Button>
                        </Stack>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              )}

              {/* Add CV Section - Show when CV doesn't exist */}
              {!hasCV && (
                <Fade in timeout={800}>
                  <Box
                    sx={{
                      position: { lg: 'sticky' },
                      top: { lg: 24 },
                      alignSelf: 'start'
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'white',
                        borderRadius: { xs: 2.5, sm: 3 },
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                        border: `2px dashed ${alpha('#8B5CF6', 0.3)}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.12), 0 4px 8px rgba(0, 0, 0, 0.04)',
                          transform: 'translateY(-2px)',
                          borderColor: alpha('#8B5CF6', 0.5),
                          bgcolor: alpha('#8B5CF6', 0.02)
                        }
                      }}
                    >
                      {/* Gradient Header Bar */}
                      <Box
                        sx={{
                          height: 4,
                          background: 'linear-gradient(90deg, #8B5CF6 0%, #06B6D4 100%)',
                        }}
                      />

                      <Box sx={{ p: { xs: 3, sm: 4 } }}>
                        {/* Section Header */}
                        <Stack 
                          direction="row" 
                          alignItems="center" 
                          spacing={1.5}
                          sx={{ mb: 3 }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${alpha('#8B5CF6', 0.15)} 0%, ${alpha('#06B6D4', 0.15)} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: `1px solid ${alpha('#8B5CF6', 0.25)}`
                            }}
                          >
                            <PictureAsPdf sx={{ color: '#8B5CF6', fontSize: 22 }} />
                          </Box>
                          <Box>
                            <Typography 
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                fontSize: '1.125rem',
                                color: '#0F172A',
                                lineHeight: 1.3
                              }}
                            >
                              Resume / CV
                            </Typography>
                            <Typography 
                              variant="caption"
                              sx={{
                                color: '#64748B',
                                fontSize: '0.8125rem'
                              }}
                            >
                              Upload your professional document
                            </Typography>
                          </Box>
                        </Stack>
                        
                        {/* Empty State Content */}
                        <Box
                          sx={{
                            textAlign: 'center',
                            py: { xs: 3, sm: 4 }
                          }}
                        >
                          <Box
                            sx={{
                              width: { xs: 80, sm: 96 },
                              height: { xs: 80, sm: 96 },
                              borderRadius: '50%',
                              bgcolor: alpha('#8B5CF6', 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2.5,
                              border: `2px dashed ${alpha('#8B5CF6', 0.3)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                bgcolor: alpha('#8B5CF6', 0.15),
                                borderColor: alpha('#8B5CF6', 0.5),
                                transform: 'scale(1.05)'
                              }
                            }}
                          >
                            <CloudUpload sx={{ 
                              fontSize: { xs: 40, sm: 48 }, 
                              color: '#8B5CF6' 
                            }} />
                          </Box>
                          
                          <Typography 
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: '1.125rem', sm: '1.25rem' },
                              color: '#0F172A',
                              mb: 1,
                              lineHeight: 1.3
                            }}
                          >
                            No Resume / CV Added
                          </Typography>
                          
                          <Typography 
                            variant="body2"
                            sx={{
                              color: '#64748B',
                              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                              lineHeight: 1.6,
                              maxWidth: 280,
                              mx: 'auto',
                              mb: 3
                            }}
                          >
                            Upload your resume or CV to showcase your professional experience and qualifications
                          </Typography>

                          {/* Add CV Button */}
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Add sx={{ fontSize: 20 }} />}
                            onClick={() => handleEditClick('Resume / CV')}
                            sx={{
                              background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                              color: 'white',
                              fontWeight: 600,
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: 'none',
                              fontSize: '0.9375rem',
                              boxShadow: `0 4px 14px ${alpha('#8B5CF6', 0.3)}`,
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                background: 'linear-gradient(135deg, #7C3AED 0%, #0891B2 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: `0 6px 20px ${alpha('#8B5CF6', 0.4)}`
                              },
                              '&:active': {
                                transform: 'translateY(0)'
                              }
                            }}
                          >
                            Add Resume / CV
                          </Button>

                          {/* File Format Info */}
                          <Typography 
                            variant="caption"
                            sx={{
                              color: '#94A3B8',
                              fontSize: '0.75rem',
                              mt: 2,
                              display: 'block'
                            }}
                          >
                            Supported formats: PDF, JPG, PNG (Max 5MB)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Professional References Section */}
            <Box sx={{ mt: { xs: 2.5, sm: 3, md: 3.5 } }}>
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