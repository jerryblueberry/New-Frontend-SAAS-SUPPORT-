import React from "react";
import {
  Paper,
  Box,
  Button,
  Chip,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Avatar,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AttachMoney as AttachMoneyIcon,
  WorkOutline as WorkIcon,
  School as CertificationIcon,
  People as ReferencesIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingIcon,
  DirectionsCar as CarIcon,
} from "@mui/icons-material";

const WorkerDetailsHeader = ({ workerData, handleBack, getVerificationStatusColor }) => {
  if (!workerData) return null;

  console.log("WorkerData",workerData?.availability.suburb);
  const getVerificationScore = () => {
    const status = workerData.verificationStatus.overall;
    if (status === "Fully Verified") return 100;
    if (status === "Partially Verified") return 60;
    return 20;
  };

  const getStatusColor = () => {
    const status = workerData.verificationStatus.overall;
    if (status === "Fully Verified") return '#10B981';
    if (status === "Partially Verified") return '#F59E0B';
    return '#EF4444';
  };

  const getGradientBg = () => {
    const status = workerData.verificationStatus.overall;
    if (status === "Fully Verified") return 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)';
    if (status === "Partially Verified") return 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)';
    return 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)';
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        background: '#FFFFFF',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        mb: 4,
        border: '1px solid #F3F4F6',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Header Navigation */}
      <Box 
        sx={{ 
          background: getGradientBg(),
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ 
            color: '#374151',
            borderColor: '#D1D5DB',
            backgroundColor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              borderColor: '#9CA3AF',
              backgroundColor: 'rgba(255,255,255,0.9)',
              transform: 'translateY(-1px)'
            },
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            py: 1,
            transition: 'all 0.2s ease'
          }}
        >
          Back to Workers
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={workerData.verificationStatus.overall}
            icon={
              workerData.verificationStatus.overall === "Fully Verified" ? (
                <VerifiedIcon />
              ) : workerData.verificationStatus.overall === "Partially Verified" ? (
                <WarningIcon />
              ) : (
                <ErrorIcon />
              )
            }
            sx={{ 
              fontWeight: 700,
              fontSize: '0.875rem',
              height: 36,
              px: 2,
              backgroundColor: getStatusColor(),
              color: 'white',
              '& .MuiChip-icon': {
                fontSize: '1.1rem',
                color: 'white'
              },
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Grid container spacing={4}>
          {/* Profile Section */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3} alignItems="center">
              {/* Profile Avatar with Status Ring */}
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    p: 0.5,
                    borderRadius: '50%',
                    background: `conic-gradient(${getStatusColor()} ${getVerificationScore()}%, #E5E7EB 0%)`,
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 120, sm: 140, md: 160 },
                      height: { xs: 120, sm: 140, md: 160 },
                      fontSize: { xs: '3rem', sm: '3.5rem', md: '4rem' },
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: '4px solid white',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    {workerData.user.firstName[0]}{workerData.user.lastName[0]}
                  </Avatar>
                </Box>
                
                {/* Verification Progress */}
               
              </Box>

              {/* Quick Stats */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip
                  icon={<CertificationIcon />}
                  label={`${workerData.certifications?.length || 0} Certs`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#6B7280' }
                  }}
                />
                <Chip
                  icon={<ReferencesIcon />}
                  label={`${workerData.references?.length || 0} Refs`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#6B7280' }
                  }}
                />
                <Chip
                  icon={<WorkIcon />}
                  label={`${workerData.workHistory?.length || 0} Jobs`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: '#6B7280' }
                  }}
                />
              </Box>
            </Stack>
          </Grid>

          {/* Profile Information */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Name and Title */}
              <Box>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800,
                    color: '#111827',
                    mb: 1,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '2rem' },
                    lineHeight: 1.2
                  }}
                >
                  {workerData.user.firstName} {workerData.user.lastName}
                </Typography>
                
            


              </Box>

              {/* Contact Information Grid */}
              <Box sx={{ width: '100%' }}>
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                  {/* Email Address */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        minHeight: 170,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E5E7EB',
                        borderRadius: 3,
                        px: { xs: 1, sm: 2 },
                        py: 2.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#3B82F6',
                          boxShadow: '0 6px 18px rgba(59,130,246,0.08)',
                          transform: 'translateY(-2px) scale(1.02)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: '#EFF6FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <EmailIcon sx={{ color: '#3B82F6', fontSize: 28 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, mb: 0.5 }}>
                        Email Address
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-word', textAlign: 'center' }}>
                        {workerData.user.email}
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Phone Number */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        minHeight: 170,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E5E7EB',
                        borderRadius: 3,
                        px: { xs: 1, sm: 2 },
                        py: 2.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#10B981',
                          boxShadow: '0 6px 18px rgba(16,185,129,0.08)',
                          transform: 'translateY(-2px) scale(1.02)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: '#D1FAE5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <PhoneIcon sx={{ color: '#10B981', fontSize: 28 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, mb: 0.5 }}>
                        Phone Number
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#111827', fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>
                        {workerData.user.phone || "Not provided"}
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Hourly Rate */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        minHeight: 170,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E5E7EB',
                        borderRadius: 3,
                        px: { xs: 1, sm: 2 },
                        py: 2.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#D97706',
                          boxShadow: '0 6px 18px rgba(217,119,6,0.08)',
                          transform: 'translateY(-2px) scale(1.02)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: '#FEF3C7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <AttachMoneyIcon sx={{ color: '#D97706', fontSize: 28 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, mb: 0.5 }}>
                        Hourly Rate
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.15rem', textAlign: 'center' }}>
                        ${workerData.expectedHourlyRate}
                        <Typography component="span" variant="body2" sx={{ color: '#6B7280', fontWeight: 400, ml: 0.5 }}>
                          /hr
                        </Typography>
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Willing to Travel */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        minHeight: 170,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E5E7EB',
                        borderRadius: 3,
                        px: { xs: 1, sm: 2 },
                        py: 2.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'orange',
                          boxShadow: '0 6px 18px rgba(251,146,60,0.08)',
                          transform: 'translateY(-2px) scale(1.02)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: '#FFF7ED',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <CarIcon sx={{ color: 'orange', fontSize: 28 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, mb: 0.5 }}>
                        Willing to Travel
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.15rem', textAlign: 'center' }}>
                        {workerData?.availability?.kmWillingToTravel}
                        <Typography component="span" variant="body2" sx={{ color: '#6B7280', fontWeight: 400, ml: 0.5 }}>
                          km
                        </Typography>
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Location */}
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={1}
                      sx={{ 
                        height: '100%',
                        minHeight: 170,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E5E7EB',
                        borderRadius: 3,
                        px: { xs: 1, sm: 2 },
                        py: 2.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: '#6366F1',
                          boxShadow: '0 6px 18px rgba(99,102,241,0.08)',
                          transform: 'translateY(-2px) scale(1.02)'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: '#EEF2FF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2
                        }}
                      >
                        <LocationIcon sx={{ color: '#6366F1', fontSize: 28 }} />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, mb: 0.5 }}>
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#111827', fontWeight: 700, fontSize: '1.15rem', textAlign: 'center' }}>
                        {workerData?.availability?.suburb}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

             
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default WorkerDetailsHeader;