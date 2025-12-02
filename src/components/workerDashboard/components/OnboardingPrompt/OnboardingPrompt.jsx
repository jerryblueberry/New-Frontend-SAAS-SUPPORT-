import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
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

const OnboardingPrompt = ({
  percentage = 0,
  nextStep = 1,
  onContinue = () => {},
  completedSteps,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [hovered, setHovered] = useState(null);

  const steps = [
    { id: 1, title: "Personal Profile", description: "Share your identity", icon: <AccountIcon /> },
    { id: 2, title: "Experience", description: "Add work history", icon: <WorkIcon /> },
    { id: 3, title: "Availability", description: "Set your schedule", icon: <ScheduleIcon /> },
    { id: 4, title: "Skills & Certs", description: "Showcase expertise", icon: <CertificationIcon /> },
    { id: 5, title: "Health Check", description: "Compliance form", icon: <HealthIcon /> },
  ];

  // Derive completed steps if not explicitly provided.
  // Each step represents an equal portion of the 100% progress bar.
  const safePercentage = Number.isFinite(percentage) ? percentage : 0;
  const derivedCompleted =
    typeof completedSteps === "number" && !Number.isNaN(completedSteps)
      ? Math.min(Math.max(completedSteps, 0), steps.length)
      : Math.min(
          Math.max(Math.floor((safePercentage || 0) / (100 / steps.length)), 0),
          steps.length
        );

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: { xs: 2, sm: 4 },
        bgcolor: "#f8f9fb",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            bgcolor: "white",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
            boxShadow:
              "0px 20px 40px rgba(0,0,0,0.04), 0px 4px 10px rgba(0,0,0,0.03)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                color: "grey.900",
                letterSpacing: "-0.02em",
                mb: 1,
                fontFamily:
                  'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              Complete Your Profile
            </Typography>

            <Typography
              variant="body2"
              color="grey.600"
              sx={{
                maxWidth: 450,
                mx: "auto",
                mb: 2,
                lineHeight: 1.6,
              }}
            >
              Finish these quick steps to unlock personalized opportunities.
            </Typography>

            <Chip
              label={`${derivedCompleted}/${steps.length}`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.75rem",
                mb: 1,
              }}
            />

            <Box sx={{ width: "100%", mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={safePercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    bgcolor: "primary.main",
                  },
                }}
              />
            </Box>

            <Typography variant="caption" color="grey.600" sx={{ mt: 0.5 }}>
              {safePercentage}% complete
            </Typography>
          </Box>

          {/* Steps */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 4 }}
          >
            {steps.map((step) => {
              const isCompleted = (safePercentage || 0) >= step.id * 20;
              const isNext = nextStep === step.id;

              return (
                <Card
                  key={step.id}
                  onMouseEnter={() => setHovered(step.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={isNext ? onContinue : () => {}}
                  elevation={0}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "0.25s all ease",
                    border: `1px solid ${
                      isNext
                        ? theme.palette.primary.main
                        : isCompleted
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha("#000", 0.08)
                    }`,
                    bgcolor:
                      hovered === step.id
                        ? alpha(theme.palette.primary.main, 0.04)
                        : "white",
                    transform:
                      hovered === step.id ? "translateY(-3px)" : "none",
                    boxShadow:
                      hovered === step.id
                        ? "0px 12px 28px rgba(0,0,0,0.06)"
                        : "none",
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: isCompleted
                            ? "primary.main"
                            : alpha(theme.palette.primary.main, 0.1),
                          color: isCompleted ? "white" : "primary.main",
                          transition: "0.25s ease",
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircleIcon sx={{ fontSize: 22 }} />
                        ) : (
                          React.cloneElement(step.icon, { sx: { fontSize: 20 } })
                        )}
                      </Box>

                      {/* Text */}
                      <Box flex={1}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.85rem", md: "0.95rem" },
                            color: isNext ? "primary.main" : "grey.900",
                            mb: 0.5,
                          }}
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="grey.600"
                          sx={{ display: "block", lineHeight: 1.4 }}
                        >
                          {step.description}
                        </Typography>
                      </Box>

                      {isNext && (
                        <ArrowForwardIcon
                          sx={{ color: "primary.main", fontSize: 20 }}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          {/* Footer */}
          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={onContinue}
              sx={{
                px: 4,
                py: 1.3,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
                fontSize: "0.9rem",
              }}
            >
              Continue Setup
            </Button>

            <Typography
              variant="caption"
              color="grey.500"
              sx={{ display: "block", mt: 1 }}
            >
              Secure & confidential • Shared only with your consent
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

OnboardingPrompt.propTypes = {
  percentage: PropTypes.number,
  nextStep: PropTypes.number,
  onContinue: PropTypes.func,
  completedSteps: PropTypes.number,
};

export default OnboardingPrompt;
