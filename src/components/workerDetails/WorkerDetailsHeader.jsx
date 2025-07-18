import React from "react";
import {
  Paper,
  Box,
  Button,
  Chip,
  Typography,
  Grid,
  Card,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AttachMoney as AttachMoneyIcon,
  WorkOutline as WorkIcon,
  School as CertificationIcon,
  People as ReferencesIcon,
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon
} from "@mui/icons-material";

const WorkerDetailsHeader = ({ workerData, handleBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  if (!workerData) return null;

  // Verification status configuration
  const verificationConfig = {
    "Fully Verified": {
      color: "success",
      icon: <VerifiedIcon />,
      bgColor: theme.palette.success.light
    },
    "Partially Verified": {
      color: "warning",
      icon: <WarningIcon />,
      bgColor: theme.palette.warning.light
    },
    "Not Verified": {
      color: "error",
      icon: <ErrorIcon />,
      bgColor: theme.palette.error.light
    }
  };

  const verificationStatus = workerData.verificationStatus?.overall || "Not Verified";
  const { color, icon, bgColor } = verificationConfig[verificationStatus] || verificationConfig["Not Verified"];

  // Info card data
  const infoCards = [
    {
      icon: <EmailIcon />,
      title: "Email Address",
      value: workerData.user.email,
      color: "primary"
    },
    {
      icon: <PhoneIcon />,
      title: "Phone Number",
      value: workerData.user.phone || "Not provided",
      color: "info"
    },
    {
      icon: <AttachMoneyIcon />,
      title: "Hourly Rate",
      value: `$${workerData.expectedHourlyRate}/hr`,
      color: "warning"
    },
    {
      icon: <CarIcon />,
      title: "Willing to Travel",
      value: `${workerData?.availability?.kmWillingToTravel || 0} km`,
      color: "secondary"
    },
    {
      icon: <LocationIcon />,
      title: "Location",
      value: workerData?.availability?.suburb || "Not specified",
      color: "success"
    }
  ];

  // Stats chips data
  const statsChips = [
    {
      icon: <CertificationIcon />,
      label: `${workerData.certifications?.length || 0} Certs`,
      color: "primary"
    },
    {
      icon: <ReferencesIcon />,
      label: `${workerData.references?.length || 0} Refs`,
      color: "secondary"
    },
    {
      icon: <WorkIcon />,
      label: `${workerData.workHistory?.length || 0} Jobs`,
      color: "info"
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}
    >
      {/* Header with back button and verification status */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: bgColor,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{
            backgroundColor: theme.palette.background.paper,
            '&:hover': {
              backgroundColor: theme.palette.action.hover
            }
          }}
        >
          {isMobile ? "Back" : "Back to Workers"}
        </Button>

        <Chip
          label={verificationStatus}
          icon={icon}
          color={color}
          size={isMobile ? "small" : "medium"}
          sx={{
            fontWeight: 600,
            boxShadow: theme.shadows[1]
          }}
        />
      </Box>

      {/* Main content */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          {/* Profile section - left column */}
          <Grid item xs={12} md={4}>
            <Stack
              spacing={3}
              alignItems="center"
              sx={{ height: '100%' }}
            >
              {/* Avatar with verification indicator */}
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  sx={{
                    width: { xs: 120, md: 140, lg: 160 },
                    height: { xs: 120, md: 140, lg: 160 },
                    fontSize: { xs: '3rem', md: '3.5rem' },
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    border: `4px solid ${theme.palette.background.paper}`,
                    boxShadow: theme.shadows[4]
                  }}
                >
                  {workerData.user.firstName[0]}{workerData.user.lastName[0]}
                </Avatar>
              </Box>

              {/* Name and title */}
              <Box textAlign="center">
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  component="h1"
                  fontWeight="bold"
                  gutterBottom
                >
                  {workerData.user.firstName} {workerData.user.lastName}
                </Typography>
                {workerData.title && (
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {workerData.title}
                  </Typography>
                )}
              </Box>

              {/* Stats chips */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  maxWidth: '100%'
                }}
              >
                {statsChips.map((stat, index) => (
                  <Chip
                    key={index}
                    icon={stat.icon}
                    label={stat.label}
                    size="small"
                    variant="outlined"
                    color={stat.color}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Information cards - right column */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              {infoCards.map((card, index) => (
                <Grid
                  key={index}
                  item
                  xs={12}
                  sm={6}
                  md={isTablet ? 6 : 4}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2,
                      textAlign: 'center',
                      transition: theme.transitions.create(['transform', 'box-shadow'], {
                        duration: theme.transitions.duration.short
                      }),
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[4]
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette[card.color].light,
                        color: theme.palette[card.color].main,
                        mb: 1.5,
                        width: 48,
                        height: 48
                      }}
                    >
                      {React.cloneElement(card.icon, { fontSize: "medium" })}
                    </Avatar>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="medium"
                      sx={{
                        wordBreak: 'break-word',
                        color: theme.palette.text.primary
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default WorkerDetailsHeader;