import React, { useState, memo } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Badge,
  Skeleton,
  alpha,
  IconButton,
  Tooltip,
  Divider,
  Paper
} from '@mui/material';
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  VerifiedUser as VerifiedIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import EditWorkerProfileComponent from './EditWorkerProfileComponent';

const WorkerProfileComponent = memo(({ user, onboardingData, verificationStatus, navigate, setModalOpen, isLoading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sanitize HTML content to prevent XSS attacks
  const sanitizeHTML = (html) => {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove script tags and dangerous attributes
    const scripts = tempDiv.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(element => {
      const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'];
      dangerousAttrs.forEach(attr => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
        }
      });

      if (element.tagName.toLowerCase() !== 'a' && element.hasAttribute('href')) {
        element.removeAttribute('href');
      }
    });

    return tempDiv.innerHTML;
  };


  // Event handlers
  const handleProfileUpdateSuccess = () => {
    window.location.reload();
  };

  const handleEditModalOpen = () => {
    setIsEditModalOpen(true);
    setModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setModalOpen(false);
  };

  // Utility functions
  const getStatusColor = (status) => {
    const statusMap = {
      'verified': 'success',
      'approved': 'success',
      'pending': 'warning',
      'rejected': 'error',
      'incomplete': 'info'
    };
    return statusMap[status?.toLowerCase()] || 'default';
  };

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

  // Compact Skeleton Loading Component
  const ProfileSkeleton = () => (
    <Box sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      <Card elevation={0} sx={{ mb: 2, borderRadius: 2.5, border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, overflow: 'hidden' }}>
        {/* Header Skeleton */}
        <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'center', sm: 'flex-start' }}>
            <Skeleton variant="circular" width={90} height={90} />
            <Box sx={{ flex: 1, width: '100%' }}>
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 0.5 }} />
              <Skeleton variant="rounded" width={80} height={22} sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={6} sm={3} key={item}>
                    <Skeleton variant="rounded" height={52} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </Box>
        {/* Content Skeleton */}
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1.5 }} />
              <Stack spacing={1.5}>
                {[1, 2].map((item) => (
                  <Skeleton key={item} variant="rounded" height={60} />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton key={item} variant="rounded" width={80} height={26} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
      {/* Biography Skeleton */}
      <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Skeleton variant="text" width="25%" height={24} sx={{ mb: 1.5 }} />
          <Skeleton variant="rounded" height={100} />
        </Box>
      </Card>
    </Box>
  );

  // Show skeleton while loading
  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <Box sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Compact Profile Card */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2.5,
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          overflow: 'hidden'
        }}
      >
        {/* Header Section with Gradient Background */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
            p: { xs: 2, sm: 2.5 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'center', sm: 'flex-start' }}>
            {/* Compact Avatar */}
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
                    justifyContent: 'center'
                  }}
                >
                  <VerifiedIcon sx={{ fontSize: 12, color: 'white' }} />
                </Box>
              }
            >
              <Avatar
                sx={{
                  width: { xs: 80, sm: 90 },
                  height: { xs: 80, sm: 90 },
                  background: getAvatarGradient(user?.firstName),
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
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

            {/* Profile Info */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' }, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center', sm: 'space-between' }} flexWrap="wrap" gap={1}>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mb: 0.3 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Chip
                    icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                    label={verificationStatus || 'Pending'}
                    color={getStatusColor(verificationStatus)}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                  />
                </Box>
                <Tooltip title="Edit Profile" arrow>
                  <IconButton
                    onClick={handleEditModalOpen}
                    size="small"
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      width: 36,
                      height: 36,
                      '&:hover': { bgcolor: theme.palette.primary.dark, transform: 'scale(1.05)' },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* Compact Stats */}
              <Grid container spacing={1} sx={{ mt: 1.5 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, background: alpha(theme.palette.info.main, 0.06) }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <ViewIcon sx={{ fontSize: 14, color: 'info.main' }} />
                      <Typography variant="body2" fontWeight={700} color="info.main">124</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Views</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, background: alpha(theme.palette.warning.main, 0.06) }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                      <Typography variant="body2" fontWeight={700} color="warning.main">4.8</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Rating</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, background: alpha(theme.palette.success.main, 0.06) }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <MoneyIcon sx={{ fontSize: 14, color: 'success.main' }} />
                      <Typography variant="body2" fontWeight={700} color="success.main">${onboardingData?.data?.profile?.expectedHourlyRate || 0}</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Per Hour</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center', p: 1, borderRadius: 1.5, background: alpha(theme.palette.secondary.main, 0.06) }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <CalendarIcon sx={{ fontSize: 14, color: 'secondary.main' }} />
                      <Typography variant="body2" fontWeight={700} color="secondary.main" sx={{ fontSize: '0.8rem' }}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : 'N/A'}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>Joined</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Box>

        {/* Contact & Skills Section */}
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Grid container spacing={2}>
            {/* Contact Info - Inline */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
                <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                Contact
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, borderRadius: 1.5, background: alpha(theme.palette.primary.main, 0.03), transition: 'all 0.2s', '&:hover': { background: alpha(theme.palette.primary.main, 0.06) } }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <EmailIcon sx={{ color: 'primary.main', fontSize: 16 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600, letterSpacing: 0.5 }}>Email</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{user?.email}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 1.5, borderRadius: 1.5, background: alpha(theme.palette.success.main, 0.03), transition: 'all 0.2s', '&:hover': { background: alpha(theme.palette.success.main, 0.06) } }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                    <PhoneIcon sx={{ color: 'success.main', fontSize: 16 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600, letterSpacing: 0.5 }}>Phone</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>{user?.phone || 'Not provided'}</Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            {/* Skills - Inline */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
                <WorkIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                Skills
              </Typography>
              {onboardingData?.data?.profile?.skillTags && onboardingData.data.profile.skillTags.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {onboardingData.data.profile.skillTags.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 1.5,
                        height: 26,
                        px: 0.5,
                        background: alpha(theme.palette.warning.main, 0.08),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
                        color: theme.palette.warning.dark,
                        transition: 'all 0.2s',
                        '&:hover': { background: alpha(theme.palette.warning.main, 0.12), transform: 'translateY(-1px)' }
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2, borderRadius: 1.5, background: alpha(theme.palette.grey[100], 0.3), border: `1px dashed ${alpha(theme.palette.divider, 0.2)}` }}>
                  <WorkIcon sx={{ fontSize: 32, color: alpha(theme.palette.text.secondary, 0.3), mb: 0.5 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontStyle: 'italic', fontSize: '0.75rem' }}>No skills added</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Biography Card - Compact */}
      {onboardingData?.data?.profile?.biography && (
        <Card elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
          <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.primary' }}>
              <PersonIcon sx={{ fontSize: 18, color: 'info.main' }} />
              Biography
            </Typography>
            <Box
              sx={{
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'text.secondary',
                p: 2,
                borderRadius: 1.5,
                background: alpha(theme.palette.info.main, 0.02),
                border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                '& p': { margin: '0.5em 0' },
                '& strong': { fontWeight: 600, color: 'text.primary' },
                '& em': { fontStyle: 'italic' },
                '& ul, & ol': { paddingLeft: '1.25em', margin: '0.4em 0' },
                '& li': { margin: '0.3em 0' }
              }}
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(onboardingData.data.profile.biography) }}
            />
          </Box>
        </Card>
      )}

      {/* Edit Profile Modal */}
      <EditWorkerProfileComponent
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        user={user}
        onboardingData={onboardingData}
        onSuccess={handleProfileUpdateSuccess}
      />
    </Box>
  );
});

WorkerProfileComponent.displayName = 'WorkerProfileComponent';

export default WorkerProfileComponent;