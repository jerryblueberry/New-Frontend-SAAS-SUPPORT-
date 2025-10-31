import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Paper,
  Divider,
  Avatar,
  Button,
  Grid,
  Stack,
  Tooltip,
  Badge,
  Container
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
  OpenInNew
} from '@mui/icons-material';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DocumentPreview from '../../components/workerForm/Modals/DocumentPreview';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../api/auth';
import { useReferenceManagement } from '../../hooks/useReferences';

const WorkHistory = () => {
  const { data: onboardingData } = useOnboardingQuery();
  const [previewDocument, setPreviewDocument] = useState(null);
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000,
  });

  const {
    references: apiReferences,
    isLoading: isRefsLoading,
  } = useReferenceManagement({ workerId: user?._id, limit: 20, enabled: !!user });

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateValue;
    }
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return 'Present';
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? 'Invalid Date' : 
      date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years}y ${remainingMonths}m`;
    }
    return `${months}m`;
  };

  const handleDocumentPreviewClick = (doc) => {
    setPreviewDocument(doc);
  };

  const closeDocumentPreview = () => {
    setPreviewDocument(null);
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CV-Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <WorkerNavbar />
      <Box sx={{ display: 'flex' }}>
        <DashboardSidebar />
        <Container maxWidth="xl" sx={{ py: {xs:14,md:2}, flexGrow: 1 }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" fontWeight={600} color="text.primary" gutterBottom>
              Work History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your professional experience and references
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* CV/Resume Section */}
            {onboardingData?.data?.profile?.CV && (
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    minHeight:"280px",
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <PictureAsPdf />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        CV/Resume
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your uploaded resume document
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Card 
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mt:6,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: 2
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                              width: 48,
                              height: 48
                            }}
                          >
                            <PictureAsPdf fontSize="large" />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              CV/Resume.pdf
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              PDF Document
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Preview Document">
                            <IconButton
                              onClick={() => handleDocumentPreviewClick({
                                url: onboardingData.data.profile.CV,
                                fileName: 'CV/Resume',
                                fileType: onboardingData.data.profile.CV.endsWith('.pdf') ? 'application/pdf' : 'image'
                              })}
                              sx={{ 
                                bgcolor: 'action.hover',
                                '&:hover': { bgcolor: 'primary.light' }
                              }}
                            >
                              <OpenInNew fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton
                              onClick={() => handleDownload(onboardingData.data.profile.CV)}
                              sx={{ 
                                bgcolor: 'action.hover',
                                '&:hover': { bgcolor: 'success.light' }
                              }}
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Paper>
              </Grid>
            )}

            {/* Work Experience Section */}
            <Grid item xs={12} lg={8}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  height: 'fit-content'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <Work />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Work Experience
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {onboardingData?.data?.profile?.workHistory?.length || 0} position(s)
                    </Typography>
                  </Box>
                </Stack>

                {onboardingData?.data?.profile?.workHistory?.length > 0 ? (
                  <Grid container spacing={2}>
                    {onboardingData.data.profile.workHistory.map((history, index) => (
                      <Grid item xs={12} sm={6} key={history.id || index}>
                        <Card 
                          sx={{ 
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            height: '100%',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: 2,
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2}>
                              <Stack 
                                direction={{ xs: 'column', sm: 'row' }} 
                                justifyContent="space-between" 
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                spacing={2}
                              >
                                <Box>
                                  <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {history.title}
                                  </Typography>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <Business fontSize="small" color="action" />
                                    <Typography variant="subtitle1" color="text.primary">
                                      {history.company}
                                    </Typography>
                                  </Stack>
                                </Box>
                                {history.current && (
                                  <Chip 
                                    label="Current Position" 
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{ fontWeight: 500 }}
                                  />
                                )}
                              </Stack>
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <CalendarToday fontSize="small" sx={{ color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {formatDisplayDate(history.startDate)} - {formatDisplayDate(history.endDate)}
                                    </Typography>
                                    <Chip 
                                      label={calculateDuration(history.startDate, history.endDate)}
                                      size="small"
                                      variant="outlined"
                                      sx={{ ml: 1, fontSize: '0.75rem' }}
                                    />
                                  </Stack>
                                </Grid>
                                {history.location && (
                                  <Grid item xs={12}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
                                      <Typography variant="body2" color="text.secondary">
                                        {history.location}
                                      </Typography>
                                    </Stack>
                                  </Grid>
                                )}
                              </Grid>
                              {history.description && (
                                <Box sx={{ mt: 1 }}>
                                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                                    <Description fontSize="small" sx={{ color: 'text.secondary', mt: 0.5 }} />
                                    <Typography variant="body2" color="text.primary">
                                      {history.description}
                                    </Typography>
                                  </Stack>
                                </Box>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 6,
                      color: 'text.secondary'
                    }}
                  >
                    <Work sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                      No Work Experience
                    </Typography>
                    <Typography variant="body2">
                      Add your work experience to showcase your professional background
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* References Section */}
            <Grid item xs={12} lg={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  mt: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  height: 'fit-content'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      References
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isRefsLoading ? 'Loading...' : (apiReferences?.length || 0)} reference(s)
                    </Typography>
                  </Box>
                </Stack>

                {isRefsLoading ? (
                  <Typography variant="body2" color="text.secondary">Loading references...</Typography>
                ) : apiReferences?.length > 0 ? (
                  <Stack spacing={2}>
                    {apiReferences.map((reference, index) => (
                      <Card 
                        key={reference._id || index}
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            borderColor: 'info.main',
                            boxShadow: 1
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: 'info.light',
                                    color: 'info.main',
                                    width: 40,
                                    height: 40
                                  }}
                                >
                                  {(reference.referenceInfo?.name || reference.name || 'R').charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {reference.referenceInfo?.name || reference.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Reference #{index + 1}
                                  </Typography>
                                </Box>
                              </Stack>
                              
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                badgeContent={
                                  (reference.status === 'Completed') ? (
                                    <VerifiedUser 
                                      sx={{ 
                                        color: 'success.main', 
                                        fontSize: 16 
                                      }} 
                                    />
                                  ) : (
                                    <Pending 
                                      sx={{ 
                                        color: 'warning.main', 
                                        fontSize: 16 
                                      }} 
                                    />
                                  )
                                }
                              >
                                <Box />
                              </Badge>
                            </Stack>

                            <Divider />

                            <Stack spacing={1.5}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Business fontSize="small" sx={{ color: 'text.secondary' }} />
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {reference.referenceInfo?.company || reference.company}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {reference.referenceInfo?.position || reference.position}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Email fontSize="small" sx={{ color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.primary">
                                  {reference.referenceInfo?.email || reference.email}
                                </Typography>
                              </Stack>

                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Phone fontSize="small" sx={{ color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.primary">
                                  {reference.referenceInfo?.phone || reference.phone}
                                </Typography>
                              </Stack>
                            </Stack>

                            <Chip
                              icon={reference.status === 'Completed' ? <VerifiedUser /> : <Pending />}
                              label={reference.status || 'Pending'}
                              size="small"
                              color={reference.status === 'Completed' ? 'success' : 'warning'}
                              variant="outlined"
                              sx={{ alignSelf: 'flex-start', fontWeight: 500 }}
                            />
                            {Array.isArray(reference.statusHistory) && reference.statusHistory.length > 0 && (
                              <Stack spacing={1} sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">Recent activity</Typography>
                                <Stack spacing={0.5}>
                                  {reference.statusHistory.slice(-3).reverse().map((h, i) => (
                                    <Typography key={i} variant="caption" color="text.secondary">
                                      {new Date(h.timestamp).toLocaleString()} — {h.status}{h.notes ? ` · ${h.notes}` : ''}
                                    </Typography>
                                  ))}
                                </Stack>
                              </Stack>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: 'text.secondary'
                    }}
                  >
                    <Person sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      No References
                    </Typography>
                    <Typography variant="body2" fontSize="0.875rem">
                      Add professional references to strengthen your profile
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Overall Reference History */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <VerifiedUser />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>Overall Reference History</Typography>
                    <Typography variant="body2" color="text.secondary">Recent status changes and responses</Typography>
                  </Box>
                </Stack>

                {isRefsLoading ? (
                  <Typography variant="body2" color="text.secondary">Loading history...</Typography>
                ) : apiReferences?.length > 0 ? (
                  <Grid container spacing={2}>
                    {apiReferences.map((ref) => (
                      <Grid item xs={12} md={6} lg={4} key={ref._id}>
                        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack spacing={1.5}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {ref.referenceInfo?.name || ref.name}
                                </Typography>
                                <Chip size="small" label={ref.status} color={ref.status === 'Completed' ? 'success' : 'default'} />
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {ref.referenceInfo?.company || ref.company} {ref.referenceInfo?.position ? `· ${ref.referenceInfo.position}` : ''}
                              </Typography>
                              {ref.progress && (
                                <Typography variant="caption" color="text.secondary">
                                  Progress: {ref.progress.answeredQuestions}/{ref.progress.totalQuestions} ({ref.progress.percentageComplete}%)
                                </Typography>
                              )}
                              {Array.isArray(ref.statusHistory) && ref.statusHistory.length > 0 && (
                                <Stack spacing={0.5}>
                                  {ref.statusHistory.slice(-2).reverse().map((h, i) => (
                                    <Typography key={i} variant="caption" color="text.secondary">
                                      {new Date(h.timestamp).toLocaleString()} — {h.status}
                                    </Typography>
                                  ))}
                                </Stack>
                              )}
                              {Array.isArray(ref.responses) && ref.responses.length > 0 && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Latest responses</Typography>
                                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                    {ref.responses.slice(-2).reverse().map((r, idx) => (
                                      <Typography key={idx} variant="caption" color="text.secondary">
                                        {r.questionText ? `${r.questionText}: ` : ''}{String(r.answer).slice(0, 60)}{String(r.answer).length > 60 ? '…' : ''}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">No reference activity yet.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

    
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
  );
};

export default WorkHistory;