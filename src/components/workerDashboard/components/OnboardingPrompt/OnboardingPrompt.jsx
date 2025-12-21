import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
  Stack,
} from '@mui/material';
import {
  User,
  Briefcase,
  Calendar,
  GraduationCap,
  Heart,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

// Design tokens
const COLORS = {
  primary: '#1A1A2E',
  primaryLight: '#2D2D44',
  blue: '#3B82F6',
  blueDark: '#2563EB',
  success: '#10B981',
  successDark: '#059669',
  orange: '#F59E0B',
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

const STEPS_CONFIG = [
  { id: 1, key: 'basicInfo', title: 'Basic Info', desc: 'Name, bio & hourly rate', icon: User },
  { id: 2, key: 'workHistory', title: 'Experience', desc: 'Work history & references', icon: Briefcase },
  { id: 3, key: 'availability', title: 'Schedule', desc: 'Set your availability', icon: Calendar },
  { id: 4, key: 'certifications', title: 'Certifications', desc: 'Upload certifications', icon: GraduationCap },
  { id: 5, key: 'healthInformation', title: 'Health Info', desc: 'Compliance documents', icon: Heart },
];

const OnboardingPrompt = ({
  percentage = 0,
  nextStep = 1,
  onContinue = () => {},
  completedSteps,
  completedSections = {},
}) => {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const safePercentage = useMemo(
    () => (Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0),
    [percentage]
  );

  const derivedCompleted = useMemo(() => {
    if (completedSections && typeof completedSections === 'object') {
      return STEPS_CONFIG.filter((step) => completedSections[step.key] === true).length;
    }
    if (typeof completedSteps === 'number' && !Number.isNaN(completedSteps)) {
      return Math.min(Math.max(completedSteps, 0), STEPS_CONFIG.length);
    }
    return Math.min(Math.floor(safePercentage / 20), STEPS_CONFIG.length);
  }, [completedSections, completedSteps, safePercentage]);

  const isStepCompleted = useCallback(
    (step) => {
      if (completedSections && typeof completedSections === 'object') {
        return completedSections[step.key] === true;
      }
      return safePercentage >= step.id * 20;
    },
    [completedSections, safePercentage]
  );

  const handleContinue = useCallback(() => onContinue(), [onContinue]);
  const isComplete = derivedCompleted === STEPS_CONFIG.length;
  const remainingSteps = STEPS_CONFIG.length - derivedCompleted;

  return (
    <Box
      sx={{
        width: '100%',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 2, sm: 2.5 } }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Progress Ring */}
          <Box
            sx={{
              position: 'relative',
              width: { xs: 52, sm: 56 },
              height: { xs: 52, sm: 56 },
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: `conic-gradient(
                  ${isComplete ? COLORS.success : COLORS.primary} ${safePercentage * 3.6}deg,
                  ${COLORS.neutral[200]} ${safePercentage * 3.6}deg
                )`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: 4,
                  borderRadius: '50%',
                  background: 'white',
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 700,
                  color: isComplete ? COLORS.success : COLORS.primary,
                }}
              >
                {Math.round(safePercentage)}%
              </Typography>
            </Box>
          </Box>

          {/* Title */}
          <Box>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                fontWeight: 700,
                color: COLORS.neutral[900],
                lineHeight: 1.3,
              }}
            >
              {isComplete ? 'Profile Complete' : 'Complete Your Profile'}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                color: COLORS.neutral[500],
              }}
            >
              {isComplete ? (
                'Ready to receive job matches'
              ) : (
                <>
                  <Box component="span" sx={{ fontWeight: 600, color: COLORS.primary }}>
                    {derivedCompleted}/{STEPS_CONFIG.length}
                  </Box>
                  {' completed'}
                </>
              )}
            </Typography>
          </Box>
        </Stack>

        {/* Desktop CTA */}
        {!isComplete && (
          <Button
            onClick={handleContinue}
            endIcon={<ArrowRight size={16} />}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              height: 38,
              px: 2.5,
              fontSize: '0.813rem',
              fontWeight: 600,
              textTransform: 'none',
              color: 'white',
              backgroundColor: COLORS.primary,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: COLORS.primaryLight,
              },
              '& .MuiButton-endIcon': { ml: 0.5 },
            }}
          >
            Continue
          </Button>
        )}
      </Stack>

      {/* Steps */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: { xs: 1.25, sm: 1.5 },
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        {STEPS_CONFIG.map((step, index) => {
          const completed = isStepCompleted(step);
          const current = nextStep === step.id && !completed;
          const IconComponent = step.icon;

          return (
            <Card
              key={step.id}
              onClick={current ? handleContinue : undefined}
              sx={{
                borderRadius: 2,
                border: `1px solid ${
                  current ? COLORS.primary : completed ? COLORS.success : COLORS.neutral[200]
                }`,
                backgroundColor: completed
                  ? alpha(COLORS.success, 0.04)
                  : current
                  ? 'white'
                  : COLORS.neutral[50],
                boxShadow: current ? `0 2px 8px ${alpha(COLORS.primary, 0.12)}` : 'none',
                cursor: current ? 'pointer' : 'default',
                opacity: mounted ? (!current && !completed ? 0.6 : 1) : 0,
                transform: mounted ? 'none' : 'translateY(6px)',
                transition: 'all 0.25s ease',
                transitionDelay: `${index * 40}ms`,
                '&:hover': current
                  ? {
                      boxShadow: `0 4px 12px ${alpha(COLORS.primary, 0.16)}`,
                      transform: 'translateY(-1px)',
                    }
                  : {},
              }}
            >
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: completed
                        ? COLORS.success
                        : current
                        ? COLORS.primary
                        : COLORS.neutral[200],
                    }}
                  >
                    {completed ? (
                      <CheckCircle2 size={16} color="white" strokeWidth={2.5} />
                    ) : (
                      <IconComponent
                        size={16}
                        color={current ? 'white' : COLORS.neutral[500]}
                        strokeWidth={2}
                      />
                    )}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: '0.813rem',
                        fontWeight: 600,
                        color: completed
                          ? COLORS.successDark
                          : current
                          ? COLORS.neutral[900]
                          : COLORS.neutral[600],
                        lineHeight: 1.2,
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.688rem',
                        color: COLORS.neutral[500],
                        lineHeight: 1.3,
                        mt: 0.25,
                      }}
                    >
                      {completed ? 'Done' : current ? 'In progress' : step.desc}
                    </Typography>
                  </Box>

                  {current && (
                    <ChevronRight size={16} color={COLORS.primary} strokeWidth={2.5} />
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* CTA Section */}
      {!isComplete && (
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2.5,
            backgroundColor: COLORS.neutral[50],
            border: `1px solid ${COLORS.neutral[200]}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            spacing={{ xs: 2, sm: 3 }}
          >
            {/* Left content */}
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: { xs: '0.938rem', sm: '1rem' },
                  fontWeight: 700,
                  color: COLORS.neutral[800],
                  mb: 0.5,
                }}
              >
                {remainingSteps === 1 ? 'Almost there! One more step' : `Just ${remainingSteps} steps away`}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '0.813rem', sm: '0.875rem' },
                  color: COLORS.neutral[500],
                  lineHeight: 1.5,
                }}
              >
                Finish your profile to unlock job opportunities and get matched with clients looking for your skills.
              </Typography>
            </Box>

            {/* CTA Button */}
            <Button
              onClick={handleContinue}
              endIcon={<ArrowRight size={18} strokeWidth={2.5} />}
              sx={{
                minWidth: { xs: '100%', sm: 'auto' },
                height: { xs: 44, sm: 42 },
                px: { xs: 2, sm: 3 },
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                backgroundColor: COLORS.primary,
                color: 'white',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: COLORS.primaryLight,
                },
                '& .MuiButton-endIcon': { ml: 0.75 },
              }}
            >
              Continue Setup
            </Button>
          </Stack>
        </Box>
      )}

      {/* Success State */}
      {isComplete && (
        <Box
          sx={{
            textAlign: 'center',
            p: { xs: 2.5, sm: 3 },
            borderRadius: 2.5,
            backgroundColor: alpha(COLORS.success, 0.06),
            border: `1px solid ${alpha(COLORS.success, 0.15)}`,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: COLORS.success,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
            }}
          >
            <CheckCircle2 size={24} color="white" strokeWidth={2.5} />
          </Box>
          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: 700,
              color: COLORS.successDark,
              mb: 0.5,
            }}
          >
            All Set!
          </Typography>
          <Typography sx={{ fontSize: '0.813rem', color: COLORS.neutral[500] }}>
            Your profile is complete and ready for opportunities
          </Typography>
        </Box>
      )}
    </Box>
  );
};

OnboardingPrompt.propTypes = {
  percentage: PropTypes.number,
  nextStep: PropTypes.number,
  onContinue: PropTypes.func,
  completedSteps: PropTypes.number,
  completedSections: PropTypes.shape({
    basicInfo: PropTypes.bool,
    workHistory: PropTypes.bool,
    availability: PropTypes.bool,
    certifications: PropTypes.bool,
    healthInformation: PropTypes.bool,
  }),
};

export default OnboardingPrompt;
