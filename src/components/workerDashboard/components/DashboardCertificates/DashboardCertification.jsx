import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    Grid,
    Container,
    Paper,
    Avatar,
    Divider,
    Stack,
    IconButton,
    Fade,
    Zoom,
    useTheme,
    useMediaQuery,
    Tooltip,
    Tab,
    Tabs,
    ButtonGroup,
    alpha
} from '@mui/material';
import DocumentPreview from '../../../workerForm/Modals/DocumentPreview';
import {
    WorkspacePremium,
    CalendarToday,
    Event,
    Assignment,
    Add,
    FileDownload,
    Verified,
    Schedule,
    Cancel,
    OpenInNew,
    Edit,
    School,
    BusinessCenter,
    NavigateNext
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { color } from 'framer-motion';
import CertificationCardDashboard from './CertificationCardDashboard';

const DashboardCertification = ({ onboardingData }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
    const navigate = useNavigate();

    const [previewOpen, setPreviewOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const certifications = onboardingData?.data?.profile?.certifications || [];
    console.log("Certifications", certifications);
    const otherCertifications = onboardingData?.data?.profile?.otherCertifications || [];
    console.log("OTjer ssd", otherCertifications)
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified': return 'success';
            case 'pending': return 'warning';
            case 'expired': return 'error';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'verified': return <Verified fontSize="small" />;
            case 'pending': return <Schedule fontSize="small" />;
            case 'expired': return <Cancel fontSize="small" />;
            default: return <Schedule fontSize="small" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isExpiringSoon = (expiryDate) => {
        if (!expiryDate) return false;
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 90 && diffDays > 0;
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const TabPanel = ({ children, value, index }) => (
        <div hidden={value !== index} style={{ width: '100%' }}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );

    const EmptyState = ({ type, onAdd }) => (
        <Fade in timeout={1000}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, md: 6 },
                    textAlign: 'center',
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 100,
                        height: 100,
                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                    }
                }}
            >
                <Avatar
                    sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        width: { xs: 60, md: 80 },
                        height: { xs: 60, md: 80 },
                        mx: 'auto',
                        mb: 3,
                        border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                >
                    {type === 'professional' ? (
                        <WorkspacePremium fontSize="large" color="primary" />
                    ) : (
                        <School fontSize="large" color="primary" />
                    )}
                </Avatar>

                <Typography
                    variant={isMobile ? "h6" : "h5"}
                    fontWeight="600"
                    color="text.primary"
                    sx={{ mb: 2 }}
                >
                    {type === 'professional' ? 'No Professional Certifications' : 'No Other Certifications'}
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: '400px', mx: 'auto', lineHeight: 1.6 }}
                >
                    {type === 'professional'
                        ? 'Complete your onboarding to add professional certifications and enhance your profile.'
                        : 'Add additional certifications to showcase your diverse skills and qualifications.'
                    }
                </Typography>

                {onAdd && (
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Add />}
                        onClick={onAdd}
                        sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: theme.shadows[4],
                            '&:hover': {
                                boxShadow: theme.shadows[8],
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                    >
                        Complete Onboarding
                    </Button>
                )}
            </Paper>
        </Fade>
    );

  //  FOr Formating the Degree
  function formatDegree(degree) {
    // Ensure it's always a string before processing
    if (typeof degree !== "string") {
      return {
        isOther: false,
        value: "",
      };
    }
  
    if (degree.startsWith("Other|")) {
      return {
        isOther: true,
        value: degree.split("|")[1] || "", // take part after "|"
      };
    }
  
    return {
      isOther: false,
      value: degree,
    };
  }
  

    const CertificationCard = ({ cert, index, type = 'professional' }) => (
        <Grid item xs={12} lg={6} xl={4} key={cert.id || cert._id || index}>
            <Zoom in timeout={600 + index * 150}>
                <Card
                    elevation={0}
                    sx={{
                        
                        height: '100%',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        background: theme.palette.background.paper,
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: theme.shadows[12],
                            borderColor: theme.palette.primary.main,
                            '& .edit-button': {
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
                            height: '4px',
                            background: type === 'professional'
                                ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                : `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.success.main})`,
                        }
                    }}
                >
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', }}>
                        {/* Certificate Header */}
                        <Box sx={{ mb: 3, position: 'relative', }}>
                            <Stack direction="row" sx={{
                                display:'flex',
                                flexDirection:'row',
                                justifyContent:'space-between',
                                alignItems:'flex-start',
                            }}  spacing={isMobile?18:2}>
                                <Typography
                                    variant="h6"
                                    component="h3"
                                    fontWeight="600"
                                    sx={{
                                        flex: 1,
                                        lineHeight: 1.3,
                                        color: theme.palette.text.primary,
                                        pr: 1,
                                        fontSize:{xs:'1rem'},
                                        
                                    }}
                                >
                                    {type === 'professional' ? cert.certificationType?.name : cert.certificationTitle}
                                </Typography>

                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        icon={getStatusIcon(cert.verificationStatus)}
                                        label={cert.verificationStatus || 'Pending'}
                                        color={getStatusColor(cert.verificationStatus)}
                                        size="small"
                                        sx={{
                                            fontWeight: 600,
                                            '& .MuiChip-icon': { fontSize: '16px' }
                                        }}
                                    />

                                    <IconButton
                                        size="small"
                                        className="edit-button"
                                        sx={{
                                            opacity: 0,
                                            transform: 'translateY(-10px)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                                            }
                                        }}
                                    >
                                        <Edit fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Stack>

                            {cert.number && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1.5, fontFamily: 'monospace', fontSize: '0.875rem' }}
                                >
                                    Cert #{cert.number}
                                </Typography>
                            )}
                            {/* For Degree */}

                            {cert?.degree?.length > 0 &&
                                cert.degree.map((degree, index) => {
                                    const { isOther, value } = formatDegree(degree);
                                    return (
                                        <Stack
                                            key={index}
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            sx={{ mb: 1,mt:1 }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                Degree: {value}
                                            </Typography>

                                            {isOther && (
                                                <Chip
                                                    label="Other"
                                                    color="secondary"
                                                    size="small"
                                                    sx={{ fontWeight: "bold" }}
                                                />
                                            )}
                                        </Stack>
                                    );
                                })
                            }


                        </Box>

                        {/* Certificate Details - Only for professional certs */}
                        {type === 'professional' && cert.issuedDate && (
                            <Box sx={{ mb: 3, flex: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={cert.expiryDate ? 6 : 12}>
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                // p: '5px 5px',
                                                p:{xs:"5px 5px", md:'10px 10px'},
                                                bgcolor: alpha(theme.palette.primary.main, 0.5),
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                            }}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>

                                                <CalendarToday fontSize="small" color="primary" sx={{
                                                    fontSize:{xs:'13px',md:'15px'}
                                                }}/>
                                                <Typography sx={{
                                                    fontSize:{xs:"0.68rem"},
                                                    fontWeight:600
                                                }} variant="caption"  color="text.secondary">
                                                    ISSUED
                                                </Typography>
                                            </Stack>
                                            <Typography variant="body2" fontWeight="500">
                                                {formatDate(cert.issuedDate)}
                                            </Typography>
                                        </Paper>

                                    </Grid>

                                    {cert.expiryDate && (
                                        <Grid item xs={6}>
                                            <Paper
                                                elevation={0}
                                                sx={{
                                                    p:{xs:"5px 5px", md:'10px 10px'},
                                                    bgcolor: isExpiringSoon(cert.expiryDate)
                                                        ? alpha(theme.palette.warning.main, 0.1)
                                                        : alpha(theme.palette.info.main, 0.05),
                                                    borderRadius: 2,
                                                    border: `1px solid ${isExpiringSoon(cert.expiryDate)
                                                        ? alpha(theme.palette.warning.main, 0.3)
                                                        : alpha(theme.palette.info.main, 0.1)
                                                        }`,
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                                    <Event sx={{
                                                    fontSize:{xs:'13px',md:'16px'}
                                                }} fontSize="small" color={isExpiringSoon(cert.expiryDate) ? "warning" : "info"} />
                                                    <Typography sx={{
                                                    fontSize:{xs:"0.68rem"},
                                                    fontWeight:600
                                                }} variant="caption"  color="text.secondary">
                                                        EXPIRES
                                                    </Typography>
                                                    {isExpiringSoon(cert.expiryDate) && (
                                                    <Chip
                                                        label="Expiring Soon"
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                        sx={{ mt: 1, fontSize: '10px', height: '20px' }}
                                                    />
                                                )}
                                                </Stack>
                                                <Typography variant="body2" fontWeight="500">
                                                    {formatDate(cert.expiryDate)}
                                                </Typography>
                                                
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}

                        {/* Documents Section */}
                        {cert.documents && cert.documents.length > 0 && (
                            <Box sx={{ mt: 'auto' }}>
                                <Divider sx={{ mb: 2 }} />
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <Assignment fontSize="small" color="primary" />
                                    <Typography variant="subtitle2" fontWeight="600">
                                        Documents ({cert.documents.length})
                                    </Typography>
                                </Stack>
                                <Stack spacing={1}>
                                    {cert.documents.slice(0, 2).map((doc, docIndex) => (
                                        <Box
                                            key={doc.id || doc._id || docIndex}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                p: 1.5,
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                borderRadius: 2,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                                }
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    flex: 1,
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: theme.palette.text.primary
                                                }}
                                            >
                                                {doc.fileName || `Document ${docIndex + 1}`}
                                            </Typography>
                                            <Tooltip title="View Document">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedDocument(doc);
                                                        setSelectedCertificate(cert);
                                                        setPreviewOpen(true);
                                                    }}
                                                    sx={{
                                                        color: theme.palette.primary.main,
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        }
                                                    }}
                                                >
                                                    <OpenInNew fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ))}
                                    {cert.documents.length > 2 && (
                                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pt: 1 }}>
                                            +{cert.documents.length - 2} more documents
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Zoom>
        </Grid>
    );

  



    return (
        <Container
        maxWidth="xl"
        sx={{
          py: { xs: 10, sm: 2, md: 4 }, // no padding on xs
        }}
      >
        <Fade in timeout={800}>
          <Box sx={{ mt: { xs: 2, md: 4 } }}>
            {/* Header Section */}
            <Box
              sx={{
                width: '100%',
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.primary.main,
                  0.08
                )} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                borderRadius: 4,
                p: { xs: 2, sm: 3, md: 4 },
                mb: { xs: 2, md: 4 },
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                boxShadow: theme.shadows[1],
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: { xs: '120px', md: '200px' },
                  height: { xs: '120px', md: '200px' },
                  background: `radial-gradient(circle, ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )} 0%, transparent 70%)`,
                  transform: 'translate(50%, -50%)',
                },
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, md: 3 }}
                sx={{ position: 'relative', zIndex: 1 }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: { xs: 48, sm: 56, md: 72 },
                    height: { xs: 48, sm: 56, md: 72 },
                    boxShadow: theme.shadows[6],
                  }}
                >
                  <WorkspacePremium fontSize="large" />
                </Avatar>
      
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    component="h1"
                    fontWeight="bold"
                    color="primary"
                    sx={{
                      mb: 1,
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                    }}
                  >
                    My Certifications
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' },
                    }}
                  >
                    Manage and track your professional certifications and credentials
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    flexWrap="wrap"
                    sx={{ rowGap: 1 }}
                  >
                    <Chip
                      icon={<BusinessCenter fontSize="small" />}
                      label={`${certifications.length} Professional`}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: { xs: '0.7rem', md: '0.85rem' } }}
                    />
                    <Chip
                      icon={<School fontSize="small" />}
                      label={`${otherCertifications.length} Additional`}
                      color="secondary"
                      variant="outlined"
                      size="small"
                      sx={{ fontSize: { xs: '0.7rem', md: '0.85rem' } }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
      
            {/* Navigation Tabs */}
            <Paper
              elevation={0}
              sx={{
                mb: { xs: 2, md: 4 },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    py: { xs: 1.2, sm: 1.5, md: 2 },
                    minHeight: 'auto',
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <BusinessCenter fontSize="small" />
                      <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                        Certifications
                      </Typography>
                      {certifications.length > 0 && (
                        <Chip
                          label={certifications.length}
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      )}
                    </Stack>
                  }
                />
                <Tab
                  label={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <School fontSize="small" />
                      <Typography sx={{ fontSize: { xs: '0.8rem', md: '1rem' } }}>
                        Other Certifications
                      </Typography>
                      {otherCertifications.length > 0 && (
                        <Chip
                          label={otherCertifications.length}
                          size="small"
                          color="secondary"
                          sx={{ height: 20, fontSize: '0.75rem' }}
                        />
                      )}
                    </Stack>
                  }
                />
              </Tabs>
            </Paper>
      
            {/* Tab Content */}
            <TabPanel value={activeTab} index={0}>
              {certifications.length > 0 ? (
                <Grid container spacing={{ xs: 2.5, sm: 3 }}>
                  {certifications.map((cert, index) => (
                    <Grid sx={{
                        minWidth:{xs:'100%',sm:'100%',md:'0'},
                    }} item xs={12} sm={6} md={4} lg={3} key={cert.id || cert._id || index}>
                      <CertificationCardDashboard
                        cert={cert}
                        index={index}
                        type="professional"
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState type="professional" onAdd={() => navigate('/onboarding')} />
              )}
            </TabPanel>
      
            <TabPanel value={activeTab} index={1}>
              {otherCertifications.length > 0 ? (
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {otherCertifications.map((cert, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={cert.id || cert._id || index}>
                      <CertificationCardDashboard cert={cert} index={index} type="other" />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState type="other" />
              )}
            </TabPanel>
          </Box>
        </Fade>
      
        {/* Document Preview Modal */}
        {previewOpen && selectedDocument && (
          <DocumentPreview
            document={selectedDocument}
            onClose={() => {
              setPreviewOpen(false);
              setSelectedDocument(null);
              setSelectedCertificate(null);
            }}
            certificateData={selectedCertificate}
          />
        )}
      </Container>
      
    );
};

export default DashboardCertification;