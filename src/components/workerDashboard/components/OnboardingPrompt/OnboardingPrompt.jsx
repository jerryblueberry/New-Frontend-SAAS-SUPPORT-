import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  alpha,
  Stack,
  Chip,
  Fade,
  Grow,
} from '@mui/material';
import {
  User,
  Briefcase,
  Calendar,
  GraduationCap,
  Shield,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import useOnboardingStore from '../../../../stores/useOnboardingStore';
import OnboardingProgressBar from './OnboardingProgressBar';

// SaaS-Level Professional Color System
const COLORS = {
  primary: {
    main: '#5B21B6',
    light: '#7C3AED',
    dark: '#4C1D95',
    subtle: '#F5F3FF',
  },
  success: {
    main: '#059669',
    light: '#10B981',
    dark: '#047857',
    subtle: '#D1FAE5',
  },
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
  { 
    id: 1, 
    key: 'basicInfo', 
    title: 'Professional Profile', 
    desc: 'Biography, skills, languages & CV', 
    icon: User,
    tip: 'Complete for 20% boost in visibility',
  },
  { 
    id: 2, 
    key: 'workHistory', 
    title: 'Work Experience', 
    desc: 'Employment history & references', 
    icon: Briefcase,
    tip: 'Profiles with experience get 3x more matches',
  },
  { 
    id: 3, 
    key: 'availability', 
    title: 'Availability & Location', 
    desc: 'Working hours & travel preferences', 
    icon: Calendar,
    tip: 'Clients prefer professionals with set availability',
  },
  { 
    id: 4, 
    key: 'certifications', 
    title: 'Certifications & Qualifications', 
    desc: 'Upload credentials & documents', 
    icon: GraduationCap,
    tip: 'Verified credentials increase trust by 60%',
  },
  { 
    id: 5, 
    key: 'healthInformation', 
    title: 'Health & Compliance', 
    desc: 'Medical clearance & vaccinations', 
    icon: Shield,
    tip: 'Required for healthcare roles',
  },
];

const OnboardingPrompt = ({
  percentage = 0,
  nextStep = 1,
  onContinue = () => {},
  completedSteps,
  completedSections = {},
}) => {
  const navigate = useNavigate();
  const setStep = useOnboardingStore((state) => state.setStep);
  const [mounted, setMounted] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
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

  // Handle continue navigation - Store-based step management (best practice)
  const handleContinue = useCallback(() => {
    if (onContinue && typeof onContinue === 'function') {
      onContinue();
      return;
    }

    // Navigate to next incomplete step using store-based step management
    if (nextStep) {
      // Navigate to onboarding page first
      navigate('/onboarding');
      // Then update store step (Onboarding.jsx will handle displaying the correct step)
      // Small delay to ensure navigation completes before step update
      setTimeout(() => {
        setStep(nextStep);
      }, 100);
    } else {
      // All complete, navigate to dashboard
      navigate('/dashboard');
    }
  }, [onContinue, navigate, nextStep, setStep]);

  // Handle step click - Store-based step management (best practice)
  const handleStepClick = useCallback((stepId) => {
    // Navigate to onboarding page
    navigate('/onboarding');
    // Update store step (Onboarding.jsx will handle displaying the correct step)
    // Small delay to ensure navigation completes before step update
    setTimeout(() => {
      setStep(stepId);
    }, 100);
  }, [navigate, setStep]);

  const isComplete = derivedCompleted === STEPS_CONFIG.length;
  const remainingSteps = STEPS_CONFIG.length - derivedCompleted;

  return (
    <Box
      sx={{
        width: '100%',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateY(12px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* SaaS-Level Header - Professional & Compact */}
      <Box
        sx={{
          background: 'white',
          borderRadius: 2,
          p: { xs: 2.5, sm: 3, md: 3.5 },
          mb: { xs: 2.5, sm: 3 },
          border: `1px solid ${COLORS.neutral[200]}`,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 2.5, sm: 3 }}
        >
          {/* Left Content - Professional Typography */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <Chip
                label="Profile Setup"
                size="small"
                sx={{
                  backgroundColor: alpha(COLORS.primary.main, 0.08),
                  color: COLORS.primary.main,
                  fontWeight: 600,
                  fontSize: '0.688rem',
                  letterSpacing: '0.3px',
                  height: 24,
                  border: `1px solid ${alpha(COLORS.primary.main, 0.15)}`,
                  textTransform: 'uppercase',
                }}
              />
            </Stack>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                mb: 1,
                lineHeight: 1.3,
                color: COLORS.neutral[900],
                letterSpacing: '-0.01em',
              }}
            >
              {isComplete ? 'Profile Complete' : 'Complete Your Profile'}
            </Typography>
            
            <Typography
              sx={{
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                color: COLORS.neutral[600],
                maxWidth: '600px',
                lineHeight: 1.5,
                mb: { xs: 2, sm: 0 },
              }}
            >
              {isComplete 
                ? 'Your profile is complete and ready to receive job matches.'
                : `Complete your profile to unlock job opportunities. ${remainingSteps > 0 ? `${remainingSteps} step${remainingSteps > 1 ? 's' : ''} remaining.` : ''}`
              }
            </Typography>
          </Box>

          {/* Right CTA - Professional Button */}
          {!isComplete && (
            <Button
              onClick={handleContinue}
              variant="contained"
              endIcon={<ArrowRight size={18} strokeWidth={2.5} />}
              sx={{
                height: { xs: 44, sm: 48 },
                px: { xs: 3, sm: 3.5 },
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                fontWeight: 600,
                textTransform: 'none',
                letterSpacing: '0.2px',
                backgroundColor: COLORS.primary.main,
                color: 'white',
                borderRadius: 2,
                boxShadow: `0 2px 8px ${alpha(COLORS.primary.main, 0.25)}`,
                whiteSpace: 'nowrap',
                '&:hover': {
                  backgroundColor: COLORS.primary.dark,
                  boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.35)}`,
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {remainingSteps === 1 ? 'Complete Final Step' : 'Continue Setup'}
            </Button>
          )}
        </Stack>

        {/* SaaS-Level Progress Section - Compact & Professional */}
        <Box sx={{ mt: { xs: 2.5, sm: 3 }, position: 'relative', zIndex: 1 }}>
          {/* Header Stats - Professional Alignment */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
            justifyContent="space-between"
            spacing={{ xs: 1.5, sm: 2.5 }}
            mb={{ xs: 2.5, sm: 3 }}
          >
            {/* Percentage Display - Professional Typography */}
            <Box>
              <Typography 
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }, 
                  fontWeight: 700, 
                  lineHeight: 1,
                  color: COLORS.neutral[900],
                  mb: 0.5,
                  letterSpacing: '-0.02em',
                }}
              >
                {Math.round(safePercentage)}%
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.813rem' },
                  color: COLORS.neutral[600],
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {isComplete ? 'Complete' : `${derivedCompleted} of ${STEPS_CONFIG.length} sections`}
              </Typography>
            </Box>
            
            {/* Remaining Steps Badge - Compact */}
            {!isComplete && (
              <Chip
                label={`${remainingSteps} remaining`}
                size="small"
                sx={{
                  backgroundColor: alpha(COLORS.primary.main, 0.08),
                  color: COLORS.primary.main,
                  fontWeight: 600,
                  fontSize: { xs: '0.688rem', sm: '0.75rem' },
                  border: `1px solid ${alpha(COLORS.primary.main, 0.15)}`,
                  height: { xs: 24, sm: 26 },
                  px: { xs: 1.25, sm: 1.5 },
                }}
              />
            )}
          </Stack>

          {/* Progress Bar Section - Extracted Component */}
          <OnboardingProgressBar
            stepsConfig={STEPS_CONFIG}
            percentage={safePercentage}
            nextStep={nextStep}
            completedSections={completedSections}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </Box>
      </Box>

      {/* SaaS-Level Step Cards - Professional Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(5, 1fr)',
          },
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          mb: { xs: 2.5, sm: 3 },
        }}
      >
        {STEPS_CONFIG.map((step, index) => {
          const completed = isStepCompleted(step);
          const current = nextStep === step.id && !completed;
          const IconComponent = step.icon;
          const isHovered = hoveredStep === step.id;

          // Premium color palette for each step type
          const stepColors = {
            1: { main: '#6366F1', light: '#818CF8', subtle: '#EEF2FF', dark: '#4F46E5' }, // Indigo
            2: { main: '#8B5CF6', light: '#A78BFA', subtle: '#F3E8FF', dark: '#7C3AED' }, // Purple
            3: { main: '#10B981', light: '#34D399', subtle: '#D1FAE5', dark: '#059669' }, // Green
            4: { main: '#F59E0B', light: '#FBBF24', subtle: '#FEF3C7', dark: '#D97706' }, // Amber
            5: { main: '#EF4444', light: '#F87171', subtle: '#FEE2E2', dark: '#DC2626' }, // Red
          };

          const stepColor = stepColors[step.id] || stepColors[1];
          const cardBg = completed 
            ? `linear-gradient(135deg, ${alpha(stepColor.main, 0.04)} 0%, ${alpha(stepColor.main, 0.02)} 100%)`
            : current
            ? 'white'
            : `linear-gradient(135deg, ${COLORS.neutral[50]} 0%, white 100%)`;

          return (
            <Grow in={mounted} timeout={300 + index * 100} key={step.id}>
              <Card
                onClick={() => handleStepClick(step.id)}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${
                    completed 
                      ? alpha(stepColor.main, 0.2)
                      : current 
                      ? alpha(stepColor.main, 0.3)
                      : COLORS.neutral[200]
                  }`,
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden',
                  position: 'relative',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? `0 4px 12px ${alpha(COLORS.neutral[900], 0.08)}`
                    : `0 1px 2px ${alpha(COLORS.neutral[900], 0.04)}`,
                  '&:hover': {
                    borderColor: completed 
                      ? alpha(stepColor.main, 0.3)
                      : current 
                      ? alpha(stepColor.main, 0.4)
                      : COLORS.neutral[300],
                    boxShadow: `0 4px 12px ${alpha(COLORS.neutral[900], 0.1)}`,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 1.75, sm: 2, md: 2.25 }, '&:last-child': { pb: { xs: 1.75, sm: 2, md: 2.25 } } }}>
                  <Stack spacing={1.5}>
                    {/* Header - Professional Alignment */}
                    <Stack 
                      direction="row" 
                      alignItems="center" 
                      justifyContent="space-between"
                      sx={{ minHeight: 40 }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1.5,
                          backgroundColor: completed
                            ? stepColor.main
                            : current
                            ? stepColor.main
                            : COLORS.neutral[200],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                          boxShadow: completed || current
                            ? `0 2px 8px ${alpha(stepColor.main, 0.25)}`
                            : 'none',
                        }}
                      >
                        {completed ? (
                          <CheckCircle2 size={20} color="#ffffff" strokeWidth={2.5} />
                        ) : (
                          <IconComponent
                            size={20}
                            color={current || completed ? '#ffffff' : COLORS.neutral[500]}
                            strokeWidth={2.5}
                          />
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                        {completed ? (
                          <Chip
                            label="Done"
                            size="small"
                            sx={{
                              backgroundColor: alpha(stepColor.main, 0.1),
                              color: stepColor.main,
                              fontWeight: 600,
                              fontSize: '0.688rem',
                              height: 22,
                              border: `1px solid ${alpha(stepColor.main, 0.2)}`,
                              '& .MuiChip-label': {
                                px: 1,
                              },
                            }}
                          />
                        ) : current ? (
                          <Chip
                            label="Next"
                            size="small"
                            sx={{
                              backgroundColor: alpha(stepColor.main, 0.1),
                              color: stepColor.main,
                              fontWeight: 600,
                              fontSize: '0.688rem',
                              height: 22,
                              border: `1px solid ${alpha(stepColor.main, 0.2)}`,
                              '& .MuiChip-label': {
                                px: 1,
                              },
                            }}
                          />
                        ) : null}
                      </Box>
                    </Stack>

                    {/* Content - Professional Typography */}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '0.938rem' },
                          fontWeight: 600,
                          color: COLORS.neutral[900],
                          mb: 0.5,
                          lineHeight: 1.4,
                        }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.813rem' },
                          color: COLORS.neutral[600],
                          lineHeight: 1.5,
                          mb: current ? 1.5 : 0,
                        }}
                      >
                        {step.desc}
                      </Typography>
                      
                      {/* Action Button for current step */}
                      {current && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinue();
                          }}
                          variant="contained"
                          endIcon={<ArrowRight size={16} strokeWidth={2.5} />}
                          fullWidth
                          sx={{
                            height: 36,
                            fontSize: '0.813rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            backgroundColor: stepColor.main,
                            color: 'white',
                            borderRadius: 1.5,
                            boxShadow: `0 2px 8px ${alpha(stepColor.main, 0.25)}`,
                            mt: 1.5,
                            '&:hover': {
                              backgroundColor: stepColor.dark,
                              boxShadow: `0 4px 12px ${alpha(stepColor.main, 0.35)}`,
                              transform: 'translateY(-1px)',
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Continue
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
          );
        })}
      </Box>

      {/* SaaS-Level Footer CTA - Professional & Concise */}
      {!isComplete && (
        <Fade in={mounted} timeout={800}>
          <Box
            sx={{
              background: COLORS.neutral[50],
              borderRadius: 2,
              p: { xs: 2.5, sm: 3, md: 3.5 },
              border: `1px solid ${COLORS.neutral[200]}`,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              alignItems={{ xs: 'flex-start', lg: 'center' }}
              justifyContent="space-between"
              spacing={{ xs: 2.5, sm: 3 }}
            >
              {/* Left Content - Concise Value Proposition */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
                    fontWeight: 700,
                    color: COLORS.neutral[900],
                    mb: 1,
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {remainingSteps === 1 
                    ? 'One step away from job matches' 
                    : 'Complete your profile to unlock job opportunities'
                  }
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                    color: COLORS.neutral[600],
                    lineHeight: 1.5,
                    maxWidth: { xs: '100%', md: '500px' },
                  }}
                >
                  {remainingSteps === 1
                    ? 'Complete your profile to start receiving personalized job matches.'
                    : `Complete your profile to get matched with clients. ${derivedCompleted * 20}% complete.`
                  }
                </Typography>
              </Box>

              {/* Right CTA - Professional Button */}
              <Box sx={{ 
                width: { xs: '100%', lg: 'auto' }, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: { xs: 'stretch', lg: 'flex-end' },
                flexShrink: 0,
              }}>
                <Button
                  onClick={handleContinue}
                  variant="contained"
                  endIcon={<ArrowRight size={18} strokeWidth={2.5} />}
                  sx={{
                    width: { xs: '100%', lg: 'auto' },
                    minWidth: { xs: '100%', sm: '200px', lg: 220 },
                    height: { xs: 44, sm: 48 },
                    px: { xs: 3, sm: 3.5 },
                    fontSize: { xs: '0.875rem', sm: '0.938rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    letterSpacing: '0.2px',
                    backgroundColor: COLORS.primary.main,
                    color: 'white',
                    borderRadius: 2,
                    boxShadow: `0 2px 8px ${alpha(COLORS.primary.main, 0.25)}`,
                    '&:hover': {
                      backgroundColor: COLORS.primary.dark,
                      boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.35)}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {remainingSteps === 1 ? 'Complete Final Step' : 'Continue Setup'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Fade>
      )}

      {/* Success State - Professional */}
      {isComplete && (
        <Fade in={mounted} timeout={800}>
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 2.5, sm: 3 },
              borderRadius: 2,
              background: COLORS.success.subtle,
              border: `1px solid ${alpha(COLORS.success.main, 0.2)}`,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: COLORS.success.main,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                boxShadow: `0 4px 12px ${alpha(COLORS.success.main, 0.25)}`,
              }}
            >
              <CheckCircle2 size={32} color="white" strokeWidth={2.5} />
            </Box>
            
            <Typography
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 700,
                color: COLORS.neutral[900],
                mb: 1,
                lineHeight: 1.3,
              }}
            >
              Profile Complete
            </Typography>
            
            <Typography
              sx={{
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                color: COLORS.neutral[600],
                maxWidth: '500px',
                mx: 'auto',
                mb: 2.5,
                lineHeight: 1.5,
              }}
            >
              Your profile is complete and ready to receive job matches.
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={1.5} 
              justifyContent="center"
              sx={{ maxWidth: 400, mx: 'auto' }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard/profile')}
                sx={{
                  height: 40,
                  px: 2.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: COLORS.neutral[300],
                  color: COLORS.neutral[700],
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: COLORS.neutral[400],
                    backgroundColor: COLORS.neutral[50],
                  },
                }}
              >
                View Profile
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                sx={{
                  height: 40,
                  px: 2.5,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: COLORS.primary.main,
                  color: 'white',
                  borderRadius: 2,
                  boxShadow: `0 2px 8px ${alpha(COLORS.primary.main, 0.25)}`,
                  '&:hover': {
                    backgroundColor: COLORS.primary.dark,
                    boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.35)}`,
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Explore Jobs
              </Button>
            </Stack>
          </Box>
        </Fade>
      )}

      {/* Add keyframes for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.1); opacity: 0.1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
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
