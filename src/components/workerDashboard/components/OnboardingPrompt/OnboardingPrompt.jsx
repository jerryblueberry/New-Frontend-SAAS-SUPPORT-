import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Chip,
  Container,
  Stack,
  useMediaQuery,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Schedule as ScheduleIcon,
  School as CertificationIcon,
  HealthAndSafety as HealthIcon,
  Work as WorkIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const OnboardingPrompt = ({ percentage = 0, nextStep = 1, onContinue = () => {}, completedSteps = 0 }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    { id: 1, title: 'Personal Profile', description: 'Share your professional identity', icon: <AccountIcon /> },
    { id: 2, title: 'Experience', description: 'Add work history', icon: <WorkIcon /> },
    { id: 3, title: 'Availability', description: 'Set your work schedule', icon: <ScheduleIcon /> },
    { id: 4, title: 'Skills & Certs', description: 'Showcase your expertise', icon: <CertificationIcon /> },
    { id: 5, title: 'Health Check', description: 'Complete compliance form', icon: <HealthIcon /> },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          bgcolor: 'grey.50',
          border: `1px solid ${theme.palette.grey[200]}`,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{ fontWeight: 700, color: 'grey.900', mb: 1 }}
          >
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="grey.600" sx={{ mb: 2 }}>
            Get matched with opportunities
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
            <Chip
              label={`${completedSteps}/${steps.length}`}
              size="small"
              sx={{ bgcolor: 'primary.main', color: 'white', fontSize: '0.75rem' }}
            />
          </Stack>
          {/* Progress Bar */}
          <Box sx={{ width: '100%', mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage || 0}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: 'primary.main',
                },
              }}
            />
          </Box>
          <Typography variant="caption" color="grey.600">
            {percentage || 0}% complete
          </Typography>
        </Box>

        {/* Steps Grid */}
        <Grid container spacing={2}>
          {steps.map((step) => {
            const isCompleted = (percentage || 0) >= step.id * 20;
            const isNext = nextStep === step.id;
            const isHovered = hoveredStep === step.id;
            return (
              <Grid item xs={12} sm={6} md={12} lg={6} key={step.id}>
                <Card
                  elevation={isNext ? 2 : 0}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                  sx={{
                    borderRadius: 1.5,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    bgcolor: isNext
                      ? alpha(theme.palette.primary.main, 0.04)
                      : isHovered
                      ? 'grey.50'
                      : 'white',
                    border: `1px solid ${
                      isNext
                        ? theme.palette.primary.main
                        : isHovered
                        ? theme.palette.grey[300]
                        : theme.palette.grey[200]
                    }`,
                    transform: isHovered ? 'translateY(-1px)' : 'none',
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: isCompleted
                            ? 'primary.main'
                            : isNext
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'grey.100',
                          color: isCompleted
                            ? 'white'
                            : isNext
                            ? 'primary.main'
                            : 'grey.600',
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                        ) : (
                          React.cloneElement(step.icon, { sx: { fontSize: 20 } })
                        )}
                      </Box>
                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            color: isNext ? 'primary.main' : 'grey.900',
                            lineHeight: 1.2,
                            mb: 0.5,
                          }}
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="grey.600"
                          sx={{ display: 'block', lineHeight: 1.3, mb: 0.5 }}
                        >
                          {step.description}
                        </Typography>
                      </Box>
                      {/* Action Button */}
                      {isNext && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={onContinue}
                          sx={{
                            minWidth: isMobile ? 'auto' : 80,
                            px: isMobile ? 1 : 2,
                            py: 0.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            borderRadius: 1,
                            flexShrink: 0,
                          }}
                        >
                          {isMobile ? <ArrowForwardIcon sx={{ fontSize: 16 }} /> : 'Start'}
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Footer Action */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={onContinue}
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 4,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1.5,
            }}
          >
            Continue Setup
          </Button>
          <Typography
            variant="caption"
            color="grey.500"
            sx={{ display: 'block', mt: 1, maxWidth: 300, mx: 'auto' }}
          >
            Secure & confidential • Shared only with your consent
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

OnboardingPrompt.propTypes = {
  percentage: PropTypes.number,
  nextStep: PropTypes.number,
  onContinue: PropTypes.func,
  completedSteps: PropTypes.number,
};

export default OnboardingPrompt;