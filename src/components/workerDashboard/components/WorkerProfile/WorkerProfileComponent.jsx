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
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  VerifiedUser as VerifiedIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const WorkerProfileComponent = ({ user, onboardingData, verificationStatus, navigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'verified':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Helper function to get avatar color
  const getAvatarColor = (name) => {
    const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0097a7'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const profileData = [
    {
      label: 'Phone Number',
      value: user?.phone || 'Not provided',
      icon: <PhoneIcon />,
      color: 'primary'
    },
    {
      label: 'Member Since',
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'N/A',
      icon: <CalendarIcon />,
      color: 'secondary'
    },
    {
      label: 'Expected Rate',
      value: `$${onboardingData?.data?.profile?.expectedHourlyRate || 0}/hr`,
      icon: <MoneyIcon />,
      color: 'success'
    },
    {
      label: 'Profile Status',
      value: verificationStatus || 'Pending',
      icon: <VerifiedIcon />,
      color: getStatusColor(verificationStatus),
      isStatus: true
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          component="h1"
          fontWeight="bold"
          color="text.primary"
          gutterBottom
        >
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your professional profile and account settings
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          background: theme.palette.background.paper
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
            p: { xs: 3, md: 4 },
            position: 'relative'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md="auto">
              <Avatar
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  bgcolor: getAvatarColor(user?.firstName),
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  fontWeight: 'bold',
                  mx: { xs: 'auto', md: 0 },
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: theme.shadows[4]
                }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
            </Grid>
            
            <Grid item xs={12} md sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                component="h2"
                fontWeight="bold"
                color="text.primary"
                gutterBottom
              >
                {user?.firstName} {user?.lastName}
              </Typography>
              
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ mb: 2 }}
              >
                <EmailIcon color="action" fontSize="small" />
                <Typography variant="body1" color="text.secondary">
                  {user?.email}
                </Typography>
              </Stack>

              <Chip
                icon={<VerifiedIcon />}
                label={verificationStatus || 'Pending'}
                color={getStatusColor(verificationStatus)}
                variant="filled"
                size="small"
                sx={{ fontWeight: 'medium' }}
              />
            </Grid>

            <Grid item xs={12} md="auto">
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate('/profile/edit')}
                size={isMobile ? "medium" : "large"}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 'medium',
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4]
                  }
                }}
                fullWidth={isMobile}
              >
                Edit Profile
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Profile Details Section */}
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3}>
            {profileData.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: theme.shadows[2],
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: `${theme.palette[item.color]?.main}15`,
                          color: `${item.color}.main`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight="medium"
                        textTransform="uppercase"
                        letterSpacing={0.5}
                      >
                        {item.label}
                      </Typography>
                    </Stack>
                    
                    {item.isStatus ? (
                      <Chip
                        label={item.value}
                        color={item.color}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 'medium' }}
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        color="text.primary"
                      >
                        {item.value}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider />

        {/* Biography Section */}
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: `${theme.palette.info.main}15`,
                color: 'info.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PersonIcon />
            </Box>
            <Typography
              variant="h6"
              component="h3"
              fontWeight="bold"
              color="text.primary"
            >
              Professional Biography
            </Typography>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: theme.palette.grey[50],
              border: `1px dashed ${theme.palette.divider}`
            }}
          >
            <Typography
              variant="body1"
              color="text.secondary"
              lineHeight={1.7}
              sx={{
                fontStyle: onboardingData?.data?.profile?.biography ? 'normal' : 'italic',
                minHeight: '3em'
              }}
            >
              {onboardingData?.data?.profile?.biography ||
                'No biography provided yet. Add a professional summary to help clients understand your expertise and experience.'}
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
};

export default WorkerProfileComponent;