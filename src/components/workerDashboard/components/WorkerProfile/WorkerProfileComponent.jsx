import React, { useState, useEffect } from 'react';
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
  alpha,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Fade,
  Backdrop,
  CircularProgress
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
  Star as StarIcon,
  Close as CloseIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useProfileMutation } from '../../../../stores/useOnboardingStore';
import api from '../../../../api/axios';
import EditWorkerProfileComponent from './EditWorkerProfileComponent';

const WorkerProfileComponent = ({ user, onboardingData, verificationStatus, navigate, setModalOpen, isLoading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  console.log("ONBoardig Data",onboardingData?.data?.profile)
  console.log("User",user)

  // Sanitize HTML content to prevent XSS attacks
  const sanitizeHTML = (html) => {
    if (!html) return '';
    
    // Create a temporary DOM element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove any script tags and dangerous attributes
    const scripts = tempDiv.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove dangerous attributes
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(element => {
      // Remove dangerous attributes
      const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
      dangerousAttrs.forEach(attr => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
        }
      });
      
      // Remove href attributes from non-allowed elements
      if (element.tagName.toLowerCase() !== 'a' && element.hasAttribute('href')) {
        element.removeAttribute('href');
      }
    });
    
    return tempDiv.innerHTML;
  };


  // Handle profile update success
  const handleProfileUpdateSuccess = (data) => {
    console.log('Profile updated successfully:', data);
    // Optionally refresh the page or refetch data
    window.location.reload(); // Simple refresh for now
  };

  const handleEditModalOpen = () => {
    console.log('Opening Edit Modal');
    setIsEditModalOpen(true);
    setModalOpen(true);
  };

  const handleEditModalClose = () => {
    console.log('Closing Edit Modal');
    setIsEditModalOpen(false);
    setModalOpen(false);
  };

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
  
  ];

  // Mock stats for better visual appeal
  const profileStats = [
    { label: 'Profile Views', value: '124', icon: <ViewIcon />, color: 'info' },
    { label: 'Rating', value: '4.8', icon: <StarIcon />, color: 'warning' },
  ];

  // Modern Skeleton Loading Component
  const ProfileSkeleton = () => (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      {/* Modern Hero Header Skeleton */}
      <Box
        sx={{
          width: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.01)})`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
          py: { xs: 3, sm: 2.5, md: 2 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Container maxWidth={false}>
          {/* Mobile Layout Skeleton */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2.5
            }}
          >
            {/* Profile Picture Skeleton */}
            <Skeleton
              variant="circular"
              width={80}
              height={80}
              sx={{
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
              }}
            />

            {/* Name & Status Skeleton */}
            <Box sx={{ textAlign: 'center' }}>
              <Skeleton
                variant="text"
                width="70%"
                height={32}
                sx={{ mb: 1 }}
              />
              <Skeleton
                variant="rounded"
                width={100}
                height={26}
                sx={{ borderRadius: 1.5, mb: 1.5 }}
              />
            </Box>

            {/* Contact Info Skeleton */}
            <Skeleton
              variant="rounded"
              width={200}
              height={20}
              sx={{ mb: 1 }}
            />

            {/* Quick Stats Row Skeleton */}
            <Stack direction="row" spacing={4} justifyContent="center" sx={{ mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Skeleton variant="text" width={40} height={24} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={50} height={16} />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Skeleton variant="text" width={40} height={24} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width={50} height={16} />
              </Box>
            </Stack>

            {/* Edit Button Skeleton */}
            <Skeleton
              variant="rounded"
              width={160}
              height={48}
              sx={{ borderRadius: 2.5 }}
            />
          </Box>

          {/* Desktop/Tablet Layout Skeleton */}
          <Grid 
            container 
            spacing={{ md: 4 }} 
            alignItems="center"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {/* Avatar Skeleton */}
            <Grid item md={2.5} lg={2}>
              <Skeleton
                variant="circular"
                width={90}
                height={90}
                sx={{
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`
                }}
              />
            </Grid>

            {/* Name & Details Skeleton */}
            <Grid item md={6} lg={7}>
              <Skeleton
                variant="text"
                width="50%"
                height={40}
                sx={{ mb: 1.5 }}
              />
              
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Skeleton variant="rounded" width={200} height={20} />
                <Skeleton variant="rounded" width={100} height={26} sx={{ borderRadius: 1.5 }} />
              </Stack>

              <Stack direction="row" spacing={4}>
                <Box>
                  <Skeleton variant="text" width={40} height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width={50} height={16} />
                </Box>
                <Box>
                  <Skeleton variant="text" width={40} height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width={50} height={16} />
                </Box>
              </Stack>
            </Grid>

            {/* Edit Button Skeleton */}
            <Grid item md={3.5} lg={3}>
              <Box sx={{ textAlign: 'right' }}>
                <Skeleton
                  variant="rounded"
                  width={140}
                  height={48}
                  sx={{ borderRadius: 2.5 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content Skeleton */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 3 } }}>
        {/* Profile Details Grid Skeleton */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                <Card
                  sx={{
                    borderRadius: { xs: 2, sm: 2.5 },
                    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={{ xs: 2, sm: 2.5 }} 
                      alignItems={{ xs: 'center', sm: 'flex-start' }}
                      sx={{ textAlign: { xs: 'center', sm: 'left' } }}
                    >
                      <Skeleton 
                        variant="circular" 
                        width={{ xs: 40, sm: 44 }} 
                        height={{ xs: 40, sm: 44 }}
                        sx={{
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>
                        <Skeleton 
                          variant="text" 
                          width={{ xs: '80%', sm: '70%' }} 
                          height={{ xs: 14, sm: 16 }} 
                          sx={{ mb: 0.75, mx: { xs: 'auto', sm: 0 } }} 
                        />
                        <Skeleton 
                          variant="text" 
                          width={{ xs: '90%', sm: '85%' }} 
                          height={{ xs: 20, sm: 22 }} 
                          sx={{ mx: { xs: 'auto', sm: 0 } }} 
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Biography Section Skeleton */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 2.5 },
              border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`
              }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                alignItems={{ xs: 'center', sm: 'center' }} 
                spacing={{ xs: 2, sm: 2.5 }}
                sx={{ textAlign: { xs: 'center', sm: 'left' } }}
              >
                <Skeleton 
                  variant="circular" 
                  width={{ xs: 40, sm: 44 }} 
                  height={{ xs: 40, sm: 44 }}
                  sx={{
                    boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}`
                  }}
                />
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Skeleton 
                    variant="text" 
                    width={{ xs: 200, sm: 220 }} 
                    height={{ xs: 24, sm: 28 }} 
                    sx={{ mb: 0.5, mx: { xs: 'auto', sm: 0 } }} 
                  />
                  <Skeleton 
                    variant="text" 
                    width={{ xs: 150, sm: 170 }} 
                    height={{ xs: 16, sm: 18 }} 
                    sx={{ mx: { xs: 'auto', sm: 0 } }} 
                  />
                </Box>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Skeleton 
                variant="text" 
                width="100%" 
                height={{ xs: 18, sm: 20 }} 
                sx={{ mb: 1.5 }} 
              />
              <Skeleton 
                variant="text" 
                width="95%" 
                height={{ xs: 18, sm: 20 }} 
                sx={{ mb: 1.5 }} 
              />
              <Skeleton 
                variant="text" 
                width="90%" 
                height={{ xs: 18, sm: 20 }} 
                sx={{ mb: 1.5 }} 
              />
              <Skeleton 
                variant="text" 
                width="85%" 
                height={{ xs: 18, sm: 20 }} 
                sx={{ mb: 1.5 }} 
              />
              <Skeleton 
                variant="text" 
                width="75%" 
                height={{ xs: 18, sm: 20 }} 
              />
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );

  // Show skeleton while loading
  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

    return (
    <>
      {/* Global Biography Content Styles */}
      <style jsx global>{`
        .biography-content {
          font-family: ${theme.typography.fontFamily};
        }

        .biography-content p {
          text-align: justify;
          line-height: 1.7;
        }

        .biography-content strong {
          font-weight: 700;
          color: ${theme.palette.text.primary};
        }

        .biography-content em {
          font-style: italic;
          color: ${alpha(theme.palette.text.primary, 0.9)};
        }

        .biography-content u {
          text-decoration: underline;
          text-decoration-color: ${alpha(theme.palette.primary.main, 0.4)};
          text-underline-offset: 2px;
        }

        .biography-content h1,
        .biography-content h2,
        .biography-content h3 {
          font-weight: 700;
          color: ${theme.palette.text.primary};
          letter-spacing: -0.01em;
        }

        .biography-content blockquote {
          border-left: 4px solid ${theme.palette.primary.main};
          margin: 1.5em 0;
          padding: 1em 1.5em;
          font-style: italic;
          background: ${alpha(theme.palette.grey[50], 0.5)};
          border-radius: 0 8px 8px 0;
          color: ${alpha(theme.palette.text.primary, 0.8)};
        }

        .biography-content a {
          color: ${theme.palette.primary.main};
          text-decoration: none;
          background: linear-gradient(transparent 60%, ${alpha(theme.palette.primary.main, 0.2)} 60%);
          padding: 2px 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .biography-content a:hover {
          background: ${alpha(theme.palette.primary.main, 0.15)};
          transform: translateY(-1px);
        }

        .biography-content ul,
        .biography-content ol {
          padding-left: 1.5em;
        }

        .biography-content li {
          margin: 0.4em 0;
          line-height: 1.6;
        }
      `}</style>

      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          width: '100%',
          overflowX: 'hidden'
        }}
      >
      {/* Modern Hero Header */}
      <Box
        sx={{
          width: '100%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.01)})`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
          py: { xs: 3, sm: 2.5, md: 2 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Container maxWidth={false}>
          {/* Mobile Layout */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2.5
            }}
          >
            {/* Profile Picture & Badge */}
            <Box sx={{ position: 'relative' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      bgcolor: getStatusColor(verificationStatus) === 'success' ? 'success.main' : 'warning.main',
                      border: `2px solid ${theme.palette.background.paper}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`
                    }}
                  >
                    <VerifiedIcon sx={{ fontSize: 9, color: 'white' }} />
                  </Box>
                }
              >
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    background: getAvatarGradient(user?.firstName),
                    fontSize: '1.6rem',
                    fontWeight: '700',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    border: `3px solid ${theme.palette.background.paper}`
                  }}
                >
                  {user?.profilePicture ? (
                    <img src={user?.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    `${user?.firstName?.[0]}${user?.lastName?.[0]}`
                  )}
                </Avatar>
              </Badge>
            </Box>

            {/* Name & Status */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h5"
                fontWeight="700"
                color="text.primary"
                sx={{ lineHeight: 1.2, mb: 1 }}
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              
              <Chip
                icon={<VerifiedIcon />}
                label={verificationStatus || 'Pending'}
                color={getStatusColor(verificationStatus)}
                variant="filled"
                size="small"
                sx={{ 
                  fontWeight: '600', 
                  fontSize: '0.75rem', 
                  height: 26,
                  mb: 1.5
                }}
              />
            </Box>

            {/* Contact Info */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <EmailIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {user?.email}
              </Typography>
            </Stack>

            {/* Quick Stats */}
            <Stack direction="row" spacing={4} justifyContent="center" sx={{ mb: 2 }}>
              {profileStats.map((stat, index) => (
                <Box key={index} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Edit Button */}
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditModalOpen}
              size="medium"
              sx={{
                borderRadius: 2.5,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.875rem',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                minWidth: 160,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                }
              }}
            >
              Edit Profile
            </Button>
          </Box>

          {/* Desktop/Tablet Layout */}
          <Grid 
            container 
            spacing={{ md: 4 }} 
            alignItems="center"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {/* Avatar */}
            <Grid item md={2.5} lg={2}>
              <Box sx={{ textAlign: 'left' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(verificationStatus) === 'success' ? 'success.main' : 'warning.main',
                        border: `2px solid ${theme.palette.background.paper}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.15)}`
                      }}
                    >
                      <VerifiedIcon sx={{ fontSize: 10, color: 'white' }} />
                    </Box>
                  }
                >
                  <Avatar
                    sx={{
                      width: 90,
                      height: 90,
                      background: getAvatarGradient(user?.firstName),
                      fontSize: '1.8rem',
                      fontWeight: '700',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                      border: `3px solid ${theme.palette.background.paper}`
                    }}
                  >
                    {user?.profilePicture ? (
                      <img src={user?.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      `${user?.firstName?.[0]}${user?.lastName?.[0]}`
                    )}
                  </Avatar>
                </Badge>
              </Box>
            </Grid>

            {/* Name & Details */}
            <Grid item md={6} lg={7}>
              <Box sx={{ textAlign: 'left' }}>
                <Typography
                  variant="h4"
                  fontWeight="700"
                  color="text.primary"
                  sx={{ mb: 1.5, lineHeight: 1.2 }}
                >
                  {user?.firstName} {user?.lastName}
                </Typography>
                
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <EmailIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {user?.email}
                    </Typography>
                  </Stack>
                  
                  <Chip
                    icon={<VerifiedIcon />}
                    label={verificationStatus || 'Pending'}
                    color={getStatusColor(verificationStatus)}
                    variant="filled"
                    size="small"
                    sx={{ fontWeight: '600', fontSize: '0.75rem', height: 26 }}
                  />
                </Stack>

                {/* Quick Stats */}
                <Stack direction="row" spacing={4}>
                  {profileStats.map((stat, index) => (
                    <Box key={index} sx={{ textAlign: 'left' }}>
                      <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ lineHeight: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>

            {/* Edit Button */}
            <Grid item md={3.5} lg={3}>
              <Box sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditModalOpen}
                  size="medium"
                  sx={{
                    borderRadius: 2.5,
                    px: 3.5,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 3 } }}>
        {/* Profile Details Grid */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {profileData.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card
                  sx={{
                    borderRadius: { xs: 2, sm: 2.5 },
                    border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    transition: 'all 0.3s ease',
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-4px)' },
                      boxShadow: { xs: 'none', sm: `0 12px 32px ${alpha(theme.palette.primary.main, 0.12)}` },
                      borderColor: { xs: 'inherit', sm: alpha(theme.palette.primary.main, 0.2) }
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={{ xs: 2, sm: 2.5 }} 
                      alignItems={{ xs: 'center', sm: 'flex-start' }}
                      sx={{ textAlign: { xs: 'center', sm: 'left' } }}
                    >
                      <Box
                        sx={{
                          p: { xs: 1, sm: 1.25 },
                          borderRadius: { xs: 1.5, sm: 2 },
                          background: `linear-gradient(135deg, ${alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.1)}, ${alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.2)})`,
                          color: `${item.color}.main`,
                          minWidth: { xs: 40, sm: 44 },
                          height: { xs: 40, sm: 44 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: `0 4px 12px ${alpha(theme.palette[item.color]?.main || theme.palette.primary.main, 0.15)}`
                        }}
                      >
                        {React.cloneElement(item.icon, { 
                          sx: { fontSize: { xs: 18, sm: 20 } } 
                        })}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing={0.8}
                          sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                            display: 'block', 
                            mb: { xs: 0.75, sm: 0.75 },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
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
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
                              height: { xs: 26, sm: 28 },
                              borderWidth: 1.5,
                              width: { xs: '100%', sm: 'auto' }
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body1"
                            fontWeight="700"
                            color="text.primary"
                            sx={{ 
                              lineHeight: 1.3, 
                              fontSize: { xs: '0.95rem', sm: '1rem' },
                              textAlign: { xs: 'center', sm: 'left' }
                            }}
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
            
            {/* Skills Card */}
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card
                sx={{
                  borderRadius: { xs: 2, sm: 2.5 },
                  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: { xs: 'none', sm: 'translateY(-4px)' },
                    boxShadow: { xs: 'none', sm: `0 12px 32px ${alpha(theme.palette.warning.main, 0.12)}` },
                    borderColor: { xs: 'inherit', sm: alpha(theme.palette.warning.main, 0.2) }
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={{ xs: 2, sm: 2.5 }} 
                    alignItems={{ xs: 'center', sm: 'flex-start' }}
                    sx={{ textAlign: { xs: 'center', sm: 'left' } }}
                  >
                    <Box
                      sx={{
                        p: { xs: 1, sm: 1.25 },
                        borderRadius: { xs: 1.5, sm: 2 },
                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.2)})`,
                        color: 'warning.main',
                        minWidth: { xs: 40, sm: 44 },
                        height: { xs: 40, sm: 44 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.15)}`
                      }}
                    >
                      <StarIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </Box>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing={0.8}
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' }, 
                          display: 'block', 
                          mb: { xs: 0.75, sm: 0.75 },
                          textAlign: { xs: 'center', sm: 'left' }
                        }}
                      >
                        Professional Skills
                      </Typography>

                      {onboardingData?.data?.profile?.skillTags && onboardingData.data.profile.skillTags.length > 0 ? (
                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: { xs: 0.5, sm: 0.75 },
                          justifyContent: { xs: 'center', sm: 'flex-start' }
                        }}>
                          {onboardingData.data.profile.skillTags.slice(0, 3).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              variant="outlined"
                              size="small"
                              sx={{
                                fontWeight: 500,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                borderRadius: { xs: 1, sm: 1.5 },
                                height: { xs: 22, sm: 24 },
                                borderWidth: 1.5,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: { xs: 'none', sm: 'translateY(-1px)' },
                                  borderColor: alpha(theme.palette.primary.main, 0.3),
                                  backgroundColor: alpha(theme.palette.primary.main, 0.02)
                                }
                              }}
                            />
                          ))}
                          {onboardingData.data.profile.skillTags.length > 3 && (
                            <Chip
                              label={`+${onboardingData.data.profile.skillTags.length - 3} more`}
                              variant="outlined"
                              size="small"
                              sx={{
                                fontWeight: 500,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                borderRadius: { xs: 1, sm: 1.5 },
                                height: { xs: 22, sm: 24 },
                                borderWidth: 1.5,
                                color: 'text.secondary'
                              }}
                            />
                          )}
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ 
                            fontStyle: 'italic', 
                            opacity: 0.7, 
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            textAlign: { xs: 'center', sm: 'left' }
                          }}
                        >
                          No skills added yet
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Biography Section */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 2.5 },
              border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.95)})`,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                boxShadow: { xs: 'none', sm: `0 8px 24px ${alpha(theme.palette.info.main, 0.08)}` },
                borderColor: { xs: 'inherit', sm: alpha(theme.palette.info.main, 0.15) }
              }
            }}
          >
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.03)}, ${alpha(theme.palette.secondary.main, 0.02)})`,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`
              }}
            >
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                alignItems={{ xs: 'center', sm: 'center' }} 
                spacing={{ xs: 2, sm: 2.5 }}
                sx={{ textAlign: { xs: 'center', sm: 'left' } }}
              >
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.25 },
                    borderRadius: { xs: 1.5, sm: 2 },
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.2)})`,
                    color: 'info.main',
                    minWidth: { xs: 40, sm: 44 },
                    height: { xs: 40, sm: 44 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}`
                  }}
                >
                  <PersonIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="700" 
                    color="text.primary"
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    Professional Biography
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, mt: 0.5 }}
                  >
                    Tell your professional story
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {onboardingData?.data?.profile?.biography ? (
                <Box
                  className="biography-content"
                  sx={{
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    lineHeight: 1.7,
                    color: 'text.primary',
                    minHeight: 'auto',
                    textAlign: 'justify',
                    fontWeight: 400,
                    '& p': {
                      margin: '1em 0',
                      '&:first-of-type': { marginTop: 0 },
                      '&:last-of-type': { marginBottom: 0 }
                    },
                    '& ul, & ol': {
                      margin: '1em 0',
                      paddingLeft: '1.5em',
                      '& li': {
                        margin: '0.5em 0',
                        lineHeight: 1.6
                      }
                    },
                    '& strong': {
                      fontWeight: 700,
                      color: 'text.primary'
                    },
                    '& em': {
                      fontStyle: 'italic',
                      color: alpha(theme.palette.text.primary, 0.9)
                    },
                    '& u': {
                      textDecoration: 'underline',
                      textDecorationColor: alpha(theme.palette.primary.main, 0.4),
                      textUnderlineOffset: '2px'
                    },
                    '& h1, & h2, & h3': {
                      fontWeight: 700,
                      color: 'text.primary',
                      margin: '1.5em 0 0.75em 0',
                      letterSpacing: '-0.01em',
                      '&:first-of-type': { marginTop: 0 }
                    },
                    '& h1': {
                      fontSize: '1.75em'
                    },
                    '& h2': {
                      fontSize: '1.5em'
                    },
                    '& h3': {
                      fontSize: '1.25em'
                    },
                    '& blockquote': {
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      margin: '1.5em 0',
                      paddingLeft: '1.5em',
                      fontStyle: 'italic',
                      color: alpha(theme.palette.text.primary, 0.8),
                      background: alpha(theme.palette.grey[50], 0.5),
                      padding: '1em 1.5em',
                      borderRadius: '0 8px 8px 0'
                    },
                    '& a': {
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      background: `linear-gradient(transparent 60%, ${alpha(theme.palette.primary.main, 0.2)} 60%)`,
                      padding: '2px 4px',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.15),
                        transform: 'translateY(-1px)'
                      }
                    }
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: sanitizeHTML(onboardingData.data.profile.biography)
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    textAlign: 'center',
                    py: 6,
                    px: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.3)}, ${alpha(theme.palette.grey[100], 0.2)})`,
                    border: `2px dashed ${alpha(theme.palette.divider, 0.2)}`
                  }}
                >
                  <PersonIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: alpha(theme.palette.text.secondary, 0.4),
                      mb: 2
                    }} 
                  />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      fontWeight: 600,
                      lineHeight: 1.6,
                      mb: 1
                    }}
                  >
                    No biography provided yet
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      opacity: 0.7,
                      display: 'block',
                      lineHeight: 1.5,
                      maxWidth: 400,
                      mx: 'auto'
                    }}
                  >
                    Add a compelling professional summary to help clients understand your expertise and experience
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Edit Profile Modal */}
      <EditWorkerProfileComponent
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        user={user}
        onboardingData={onboardingData}
        onSuccess={handleProfileUpdateSuccess}
      />
    </Box>
    </>
  );
};

export default WorkerProfileComponent;