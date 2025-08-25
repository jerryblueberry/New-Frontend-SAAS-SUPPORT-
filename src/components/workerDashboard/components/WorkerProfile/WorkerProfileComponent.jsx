import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Badge,
  Skeleton,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  VerifiedUser as VerifiedIcon,
  Person as PersonIcon,
  ArrowUpward as TrendingUpIcon,
  Visibility as ViewIcon,
  Star as StarIcon
} from '@mui/icons-material';

const WorkerProfileComponent = ({ user, onboardingData, verificationStatus, navigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Account for sidebar width in responsive breakpoints
  const sidebarWidth = 260;
  const isCompact = useMediaQuery(`(max-width: ${theme.breakpoints.values.lg + sidebarWidth}px)`);

  // Enhanced status colors with more vibrant palette
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'incomplete':
        return 'info';
      default:
        return 'default';
    }
  };

  // Modern gradient avatar colors
  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    const index = name ? name.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  // Enhanced profile data with better icons and formatting
  const profileData = [
    {
      label: 'Contact',
      value: user?.phone || 'Not provided',
      icon: <PhoneIcon />,
      color: 'primary',
      secondary: 'Phone Number'
    },
    {
      label: 'Member Since',
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        : 'N/A',
      icon: <CalendarIcon />,
      color: 'secondary',
      secondary: 'Join Date'
    },
    {
      label: 'Hourly Rate',
      value: `$${onboardingData?.data?.profile?.expectedHourlyRate || 0}`,
      icon: <MoneyIcon />,
      color: 'success',
      secondary: 'Expected Rate',
      trending: true
    },
    {
      label: 'Status',
      value: verificationStatus || 'Pending',
      icon: <VerifiedIcon />,
      color: getStatusColor(verificationStatus),
      isStatus: true,
      secondary: 'Verification'
    }
  ];

  // Mock stats for better visual appeal
  const profileStats = [
    { label: 'Profile Views', value: '124', icon: <ViewIcon />, color: 'info' },
    { label: 'Rating', value: '4.8', icon: <StarIcon />, color: 'warning' },
  ];

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        bgcolor: alpha(theme.palette.background.default, 0.4),
        // Account for sidebar width
        // ml: { lg: `${sidebarWidth}px` },
        transition: 'margin-left 0.3s ease'
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {/* Header with breadcrumb style */}
        <Box sx={{ mb: { xs: 3, md: 4 },mt:9 }}>
          <Typography 
            variant="h4" 
            component="h1"
            fontWeight="700"
            sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Profile Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>
            Manage your professional profile and showcase your expertise
          </Typography>
        </Box>

        {/* Main Profile Card with modern design */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: 'hidden',
            mb: 3
          }}
        >
          {/* Enhanced Header Section */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`,
              p: { xs: 3, sm: 4, md: 5 },
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }}
          >
            <Grid container spacing={{ xs: 2, md: 4 }} alignItems="center">
              <Grid item xs={12} sm="auto">
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: getStatusColor(verificationStatus) === 'success' ? 'success.main' : 'warning.main',
                          border: `3px solid ${theme.palette.background.paper}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <VerifiedIcon sx={{ fontSize: 12, color: 'white' }} />
                      </Box>
                    }
                  >
                    <Avatar
                      sx={{
                        width: { xs: 100, sm: 120, md: 140 },
                        height: { xs: 100, sm: 120, md: 140 },
                        background: getAvatarGradient(user?.firstName),
                        fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                        fontWeight: '700',
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                        border: `4px solid ${theme.palette.background.paper}`,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`
                        }
                      }}
                    >
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </Avatar>
                  </Badge>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography
                  variant={isMobile ? "h4" : isTablet ? "h3" : "h2"}
                  component="h2"
                  fontWeight="800"
                  color="text.primary"
                  gutterBottom
                  sx={{ 
                    lineHeight: 1.2,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </Typography>
                
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  justifyContent={{ xs: 'center', sm: 'flex-start' }}
                  sx={{ mb: 2 }}
                >
                  <EmailIcon 
                    sx={{ 
                      color: 'text.secondary', 
                      fontSize: 20,
                      opacity: 0.7
                    }} 
                  />
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {user?.email}
                  </Typography>
                </Stack>

                {/* Status and Stats Row */}
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                  alignItems={{ xs: 'center', sm: 'flex-start' }}
                >
                  <Chip
                    icon={<VerifiedIcon />}
                    label={verificationStatus || 'Pending'}
                    color={getStatusColor(verificationStatus)}
                    variant="filled"
                    size="medium"
                    sx={{ 
                      fontWeight: '600',
                      px: 2,
                      '& .MuiChip-icon': {
                        fontSize: 16
                      }
                    }}
                  />
                  
                  {/* Mini Stats */}
                  <Stack direction="row" spacing={2}>
                    {profileStats.map((stat, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} sm="auto">
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/profile/edit')}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: '600',
                    fontSize: '1rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    }
                  }}
                  fullWidth={isMobile}
                >
                  Edit Profile
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ opacity: 0.1 }} />

          {/* Enhanced Profile Details Grid */}
          <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Typography 
              variant="h5" 
              fontWeight="700" 
              color="text.primary" 
              sx={{ mb: 3 }}
            >
              Profile Details
            </Typography>
            
            <Grid container spacing={3}>
              {profileData.map((item, index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: `linear-gradient(90deg, ${theme.palette[item.color]?.main || theme.palette.primary.main}, ${alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.6)})`
                      },
                      '&:hover': {
                        boxShadow: `0 8px 32px ${alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.15)}`,
                        transform: 'translateY(-4px)',
                        '& .icon-container': {
                          transform: 'scale(1.1) rotate(5deg)'
                        }
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Box
                            className="icon-container"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.1)}, ${alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.2)})`,
                              color: `${item.color}.main`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'transform 0.3s ease'
                            }}
                          >
                            {item.icon}
                          </Box>
                          {item.trending && (
                            <TrendingUpIcon 
                              sx={{ 
                                color: 'success.main', 
                                fontSize: 16,
                                opacity: 0.7
                              }} 
                            />
                          )}
                        </Stack>
                        
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight="600"
                            textTransform="uppercase"
                            letterSpacing={1}
                            sx={{ mb: 0.5, display: 'block' }}
                          >
                            {item.secondary || item.label}
                          </Typography>
                          
                          {item.isStatus ? (
                            <Chip
                              label={item.value}
                              color={item.color}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                fontWeight: '600',
                                borderWidth: 2
                              }}
                            />
                          ) : (
                            <Typography
                              variant="h6"
                              fontWeight="700"
                              color="text.primary"
                              sx={{ lineHeight: 1.2 }}
                            >
                              {item.value}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ opacity: 0.1 }} />

          {/* Enhanced Biography Section */}
          <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.2)})`,
                  color: 'info.main'
                }}
              >
                <PersonIcon />
              </Box>
              <Typography
                variant="h5"
                component="h3"
                fontWeight="700"
                color="text.primary"
              >
                Professional Biography
              </Typography>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                p: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.8)}, ${alpha(theme.palette.grey[100], 0.4)})`,
                border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})`
                }
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                lineHeight={1.8}
                fontSize="1.1rem"
                sx={{
                  fontStyle: onboardingData?.data?.profile?.biography ? 'normal' : 'italic',
                  minHeight: '4em'
                }}
              >
                {onboardingData?.data?.profile?.biography ||
                  'No biography provided yet. Add a compelling professional summary to help clients understand your expertise, experience, and what makes you unique in your field.'}
              </Typography>
            </Paper>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default WorkerProfileComponent;