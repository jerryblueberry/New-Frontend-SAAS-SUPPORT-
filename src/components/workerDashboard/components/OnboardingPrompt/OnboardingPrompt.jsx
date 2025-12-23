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
  LinearProgress,
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
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import useOnboardingStore from '../../../../stores/useOnboardingStore';

// Premium color palette - Clean, modern, non-boxy
const COLORS = {
  primary: {
    main: '#667EEA',
    light: '#818CF8',
    dark: '#5A67D8',
    subtle: '#F7FAFC',
    accent: '#764BA2',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    subtle: '#ECFDF5',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    subtle: '#FFFBEB',
  },
  neutral: {
    50: '#FAFBFC',
    100: '#F4F6F8',
    200: '#E5E9ED',
    300: '#D1D9E0',
    400: '#9AA5B1',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  accent: {
    purple: '#8B5CF6',
    indigo: '#6366F1',
    blue: '#3B82F6',
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
      {/* Premium Header Section - Clean, Modern Design */}
      <Box
        sx={{
          background: 'white',
          borderRadius: { xs: 2.5, md: 3 },
          p: { xs: 3, sm: 4, md: 4.5 },
          mb: { xs: 3, md: 4 },
          border: `1px solid ${COLORS.neutral[200]}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle accent line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${COLORS.primary.main} 0%, ${COLORS.accent.purple} 100%)`,
          }}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 3, sm: 4 }}
          position="relative"
          zIndex={1}
        >
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: alpha(COLORS.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} color={COLORS.primary.main} />
              </Box>
              <Chip
                label="PROFILE SETUP"
                size="small"
                sx={{
                  backgroundColor: alpha(COLORS.primary.main, 0.08),
                  color: COLORS.primary.dark,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  height: 28,
                  border: `1px solid ${alpha(COLORS.primary.main, 0.2)}`,
                }}
              />
            </Stack>
            
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                mb: 1.5,
                lineHeight: 1.2,
                color: COLORS.neutral[900],
                background: `linear-gradient(135deg, ${COLORS.neutral[900]} 0%, ${COLORS.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {isComplete ? '🎉 Profile Complete!' : 'Complete Your Profile'}
            </Typography>
            
            <Typography
              sx={{
                fontSize: { xs: '0.938rem', sm: '1.063rem' },
                color: COLORS.neutral[600],
                maxWidth: '650px',
                lineHeight: 1.6,
                mb: { xs: 2, sm: 0 },
              }}
            >
              {isComplete 
                ? 'Your profile is fully optimized and ready to receive premium matches. You\'re now in the top tier of professionals!'
                : `Unlock premium job opportunities by completing your profile. ${remainingSteps > 0 ? `Just ${remainingSteps} step${remainingSteps > 1 ? 's' : ''} remaining!` : ''}`
              }
            </Typography>
          </Box>

          {!isComplete && (
            <Grow in={mounted} timeout={600}>
              <Button
                onClick={handleContinue}
                endIcon={<ArrowRight size={22} strokeWidth={3} />}
                sx={{
                  height: { xs: 52, sm: 60 },
                  px: { xs: 4, sm: 5 },
                  fontSize: { xs: '1rem', sm: '1.063rem' },
                  fontWeight: 800,
                  textTransform: 'none',
                  letterSpacing: '0.3px',
                  background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.accent.purple} 50%, ${COLORS.primary.dark} 100%)`,
                  backgroundSize: '200% 200%',
                  color: 'white',
                  borderRadius: 3,
                  boxShadow: `0 8px 24px ${alpha(COLORS.primary.main, 0.4)}, 0 4px 12px ${alpha(COLORS.accent.purple, 0.3)}`,
                  border: `2px solid ${alpha('#ffffff', 0.2)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  '&:hover': {
                    backgroundPosition: '100% 0%',
                    transform: 'translateY(-3px) scale(1.02)',
                    boxShadow: `0 12px 32px ${alpha(COLORS.primary.main, 0.5)}, 0 8px 16px ${alpha(COLORS.accent.purple, 0.4)}`,
                    '&::before': {
                      left: '100%',
                    },
                  },
                  '&:active': {
                    transform: 'translateY(-1px) scale(1)',
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box
                  component="span"
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {remainingSteps === 1 ? 'Complete Final Step' : 'Continue Setup'}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      ml: 0.5,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'translateX(0)' },
                        '50%': { transform: 'translateX(4px)' },
                      },
                    }}
                  >
                    →
                  </Box>
                </Box>
              </Button>
            </Grow>
          )}
        </Stack>

        {/* Progress Section - Mobile Responsive Premium Design */}
        <Box sx={{ mt: { xs: 3, sm: 4 }, position: 'relative', zIndex: 1 }}>
          {/* Header Stats - Mobile Optimized */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            spacing={{ xs: 1.5, sm: 2 }}
            mb={{ xs: 2.5, sm: 3 }}
          >
            <Box>
              <Typography 
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }, 
                  fontWeight: 800, 
                  lineHeight: 1,
                  color: COLORS.neutral[900],
                  mb: { xs: 0.25, sm: 0.5 },
                }}
              >
                {Math.round(safePercentage)}%
              </Typography>
              <Typography 
                sx={{ 
                  fontSize: { xs: '0.813rem', sm: '0.875rem', md: '0.938rem' },
                  color: COLORS.neutral[600],
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                {isComplete ? 'Fully completed' : `${derivedCompleted} of ${STEPS_CONFIG.length} sections completed`}
              </Typography>
            </Box>
            
            {!isComplete && (
              <Box>
                <Chip
                  label={`${remainingSteps} step${remainingSteps > 1 ? 's' : ''} remaining`}
                  sx={{
                    backgroundColor: alpha(COLORS.primary.main, 0.1),
                    color: COLORS.primary.dark,
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.813rem' },
                    border: `1px solid ${alpha(COLORS.primary.main, 0.2)}`,
                    height: { xs: 28, sm: 32 },
                  }}
                />
              </Box>
            )}
          </Stack>

          {/* Progress Bar - Mobile Column Layout / Desktop Horizontal */}
          <Box sx={{ position: 'relative', mt: { xs: 1.5, sm: 2 }, mb: { xs: 1, sm: 1 } }}>
            {/* Mobile: Column Layout */}
            <Box
              sx={{
                display: { xs: 'flex', sm: 'none' },
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {STEPS_CONFIG.map((step, index) => {
                const completed = isStepCompleted(step);
                const current = nextStep === step.id && !completed;
                const IconComponent = step.icon;
                const progressForStep = (step.id / STEPS_CONFIG.length) * 100;
                const isStepReached = safePercentage >= progressForStep - 20;
                
                return (
                  <Box
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: completed
                        ? alpha(COLORS.success.main, 0.05)
                        : current
                        ? alpha(COLORS.primary.main, 0.05)
                        : 'transparent',
                      border: `1.5px solid ${
                        completed
                          ? COLORS.success.subtle
                          : current
                          ? COLORS.primary.subtle
                          : COLORS.neutral[200]
                      }`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:active': {
                        transform: 'scale(0.98)',
                        backgroundColor: completed
                          ? alpha(COLORS.success.main, 0.08)
                          : current
                          ? alpha(COLORS.primary.main, 0.08)
                          : COLORS.neutral[50],
                      },
                    }}
                  >
                    {/* Step Indicator */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: completed
                          ? COLORS.success.main
                          : current
                          ? COLORS.primary.main
                          : isStepReached
                          ? COLORS.primary.light
                          : COLORS.neutral[300],
                        border: `2.5px solid ${
                          completed
                            ? COLORS.success.dark
                            : current
                            ? COLORS.primary.dark
                            : COLORS.neutral[200]
                        }`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {completed ? (
                        <CheckCircle2 size={16} color="#ffffff" strokeWidth={2.5} />
                      ) : (
                        <IconComponent size={16} color="#ffffff" strokeWidth={2} />
                      )}
                    </Box>

                    {/* Step Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Typography
                          sx={{
                            fontSize: '0.813rem',
                            fontWeight: completed || current ? 700 : 600,
                            color: completed
                              ? COLORS.success.dark
                              : current
                              ? COLORS.primary.dark
                              : COLORS.neutral[700],
                            lineHeight: 1.2,
                          }}
                        >
                          {step.title}
                        </Typography>
                        {(completed || current) && (
                          <Chip
                            label={completed ? 'Done' : 'Next'}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              backgroundColor: completed
                                ? alpha(COLORS.success.main, 0.15)
                                : alpha(COLORS.primary.main, 0.15),
                              color: completed
                                ? COLORS.success.dark
                                : COLORS.primary.dark,
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: '0.688rem',
                          color: COLORS.neutral[500],
                          lineHeight: 1.3,
                        }}
                      >
                        {step.desc}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Desktop/Tablet: Horizontal Layout */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              {/* Progress Bar Track */}
              <Box sx={{ position: 'relative', height: { sm: 6, md: 8 }, mb: { sm: 3.5, md: 4 } }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    backgroundColor: COLORS.neutral[100],
                    borderRadius: 4,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${safePercentage}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${COLORS.primary.main} 0%, ${COLORS.accent.purple} 100%)`,
                    borderRadius: 4,
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 2px 12px ${alpha(COLORS.primary.main, 0.3)}`,
                  }}
                />
              </Box>

              {/* Step Indicators with Titles - Horizontal */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  position: 'relative',
                  width: '100%',
                  mt: { sm: -2.5, md: -2 },
                }}
              >
                {STEPS_CONFIG.map((step, index) => {
                  const completed = isStepCompleted(step);
                  const current = nextStep === step.id && !completed;
                  const isHovered = hoveredStep === step.id;
                  const IconComponent = step.icon;
                  
                  return (
                    <Box
                      key={step.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1,
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'translateY(-4px)' : 'none',
                      }}
                      onMouseEnter={() => setHoveredStep(step.id)}
                      onMouseLeave={() => setHoveredStep(null)}
                      onClick={() => handleStepClick(step.id)}
                    >
                      {/* Step Indicator Circle */}
                      <Box
                        sx={{
                          width: { sm: 32, md: 36 },
                          height: { sm: 32, md: 36 },
                          borderRadius: '50%',
                          backgroundColor: completed 
                            ? COLORS.success.main
                            : current
                            ? COLORS.primary.main
                            : COLORS.neutral[300],
                          border: `3px solid ${
                            completed 
                              ? COLORS.success.dark 
                              : current
                              ? COLORS.primary.dark
                              : COLORS.neutral[200]
                          }`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                          boxShadow: isHovered 
                            ? `0 4px 16px ${alpha(completed ? COLORS.success.main : COLORS.primary.main, 0.4)}` 
                            : completed || current
                            ? `0 2px 8px ${alpha(completed ? COLORS.success.main : COLORS.primary.main, 0.25)}`
                            : 'none',
                          mb: { sm: 1, md: 1.5 },
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        {completed ? (
                          <CheckCircle2 size={16} color="#ffffff" strokeWidth={2.5} />
                        ) : (
                          <IconComponent size={16} color="#ffffff" strokeWidth={2} />
                        )}
                      </Box>

                      {/* Step Title */}
                      <Typography
                        sx={{
                          fontSize: { sm: '0.75rem', md: '0.813rem' },
                          fontWeight: completed ? 700 : current ? 700 : 600,
                          color: completed
                            ? COLORS.success.dark
                            : current
                            ? COLORS.primary.dark
                            : COLORS.neutral[600],
                          textAlign: 'center',
                          lineHeight: 1.3,
                          maxWidth: { sm: '90px', md: '110px' },
                          transition: 'all 0.3s ease',
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                      >
                        {step.title}
                      </Typography>

                      {/* Step Status Badge */}
                      {(completed || current) && (
                        <Chip
                          label={completed ? 'Done' : 'Next'}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 18,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            backgroundColor: completed
                              ? alpha(COLORS.success.main, 0.1)
                              : alpha(COLORS.primary.main, 0.1),
                          color: completed
                            ? COLORS.success.dark
                            : COLORS.primary.dark,
                            border: `1px solid ${
                              completed
                                ? alpha(COLORS.success.main, 0.2)
                                : alpha(COLORS.primary.main, 0.2)
                            }`,
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Steps Grid - Premium SaaS Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(5, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 3, md: 4 },
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
                  borderRadius: { xs: 2.5, sm: 3 },
                  border: `1.5px solid ${
                    completed 
                      ? alpha(stepColor.main, 0.2)
                      : current 
                      ? alpha(stepColor.main, 0.3)
                      : COLORS.neutral[200]
                  }`,
                  background: cardBg,
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  position: 'relative',
                  transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? `0 12px 32px ${alpha(completed ? stepColor.main : current ? stepColor.main : COLORS.neutral[900], 0.12)}, 0 4px 12px ${alpha(completed ? stepColor.main : current ? stepColor.main : COLORS.neutral[900], 0.08)}`
                    : completed || current
                    ? `0 2px 8px ${alpha(completed ? stepColor.main : stepColor.main, 0.08)}`
                    : `0 1px 3px ${alpha(COLORS.neutral[900], 0.05)}`,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: completed || current ? 3 : 0,
                    background: completed
                      ? `linear-gradient(90deg, ${stepColor.main} 0%, ${stepColor.dark} 100%)`
                      : `linear-gradient(90deg, ${stepColor.main} 0%, ${stepColor.light} 100%)`,
                    transition: 'height 0.3s ease',
                  },
                  '&:hover': {
                    borderColor: completed 
                      ? alpha(stepColor.main, 0.35)
                      : current 
                      ? alpha(stepColor.main, 0.5)
                      : alpha(stepColor.main, 0.25),
                    '&::before': {
                      height: 3,
                    },
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 }, '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } } }}>
                  <Stack spacing={{ xs: 1.5, sm: 2 }}>
                    {/* Header - Perfectly Aligned */}
                    <Stack 
                      direction="row" 
                      alignItems="center" 
                      justifyContent="space-between"
                      sx={{ minHeight: { xs: 44, sm: 48 } }}
                    >
                      <Box
                        sx={{
                          width: { xs: 44, sm: 48 },
                          height: { xs: 44, sm: 48 },
                          borderRadius: { xs: 2, sm: 2.5 },
                          background: completed
                            ? `linear-gradient(135deg, ${stepColor.main} 0%, ${stepColor.dark} 100%)`
                            : current
                            ? `linear-gradient(135deg, ${stepColor.main} 0%, ${stepColor.light} 100%)`
                            : `linear-gradient(135deg, ${COLORS.neutral[200]} 0%, ${COLORS.neutral[300]} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isHovered ? 'scale(1.08) rotate(2deg)' : 'scale(1) rotate(0deg)',
                          boxShadow: completed || current
                            ? `0 4px 12px ${alpha(stepColor.main, 0.3)}`
                            : 'none',
                        }}
                      >
                        {completed ? (
                          <CheckCircle2 size={22} color="#ffffff" strokeWidth={2.5} />
                        ) : (
                          <IconComponent
                            size={22}
                            color={current || completed ? '#ffffff' : COLORS.neutral[500]}
                            strokeWidth={current ? 2.5 : 2}
                          />
                        )}
                      </Box>
                      
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          height: { xs: 44, sm: 48 },
                          flexShrink: 0,
                        }}
                      >
                        {completed ? (
                          <Chip
                            label="Done"
                            size="small"
                            sx={{
                              backgroundColor: alpha(stepColor.main, 0.12),
                              color: stepColor.dark,
                              fontWeight: 700,
                              fontSize: { xs: '0.688rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 26 },
                              minHeight: { xs: 24, sm: 26 },
                              border: `1px solid ${alpha(stepColor.main, 0.2)}`,
                              '& .MuiChip-label': {
                                px: { xs: 1, sm: 1.25 },
                              },
                            }}
                          />
                        ) : current ? (
                          <Chip
                            label="Next"
                            size="small"
                            icon={<Zap size={12} strokeWidth={2.5} />}
                            sx={{
                              backgroundColor: alpha(stepColor.main, 0.12),
                              color: stepColor.dark,
                              fontWeight: 700,
                              fontSize: { xs: '0.688rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 26 },
                              minHeight: { xs: 24, sm: 26 },
                              border: `1px solid ${alpha(stepColor.main, 0.25)}`,
                              '& .MuiChip-icon': {
                                marginLeft: { xs: '6px', sm: '8px' },
                                marginRight: { xs: '-4px', sm: '-2px' },
                              },
                              '& .MuiChip-label': {
                                px: { xs: 1, sm: 1.25 },
                              },
                            }}
                          />
                        ) : (
                          <Box sx={{ width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 } }} />
                        )}
                      </Box>
                    </Stack>

                    {/* Content */}
                    <Box>
                      <Typography
                        sx={{
                          fontSize: { xs: '0.938rem', sm: '1rem' },
                          fontWeight: completed || current ? 700 : 600,
                          color: completed
                            ? stepColor.dark
                            : current
                            ? COLORS.neutral[900]
                            : COLORS.neutral[700],
                          mb: 0.75,
                          lineHeight: 1.3,
                          transition: 'color 0.3s ease',
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
                      
                      {/* Progress indicator for current step */}
                      {current && (
                        <Box sx={{ mt: 1.5, mb: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={20} 
                            sx={{
                              height: 3,
                              borderRadius: 2,
                              backgroundColor: COLORS.neutral[100],
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${stepColor.main} 0%, ${stepColor.light} 100%)`,
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>
                      )}

                      {/* Tip for incomplete steps */}
                      {!completed && (
                        <Box
                          sx={{
                            mt: 1.5,
                            p: { xs: 1.25, sm: 1.5 },
                            backgroundColor: alpha(stepColor.main, 0.06),
                            borderRadius: { xs: 1.5, sm: 2 },
                            borderLeft: `3px solid ${stepColor.light}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: alpha(stepColor.main, 0.1),
                            },
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: { xs: '0.688rem', sm: '0.75rem' },
                              color: stepColor.dark,
                              fontWeight: 500,
                              lineHeight: 1.4,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 0.75,
                            }}
                          >
                            <Target size={11} style={{ flexShrink: 0, marginTop: '2px' }} />
                            {step.tip}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Action Button for current step */}
                    {current && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContinue();
                        }}
                        endIcon={<ArrowRight size={16} strokeWidth={2.5} />}
                        fullWidth
                        sx={{
                          height: { xs: 38, sm: 42 },
                          fontSize: { xs: '0.813rem', sm: '0.875rem' },
                          fontWeight: 700,
                          textTransform: 'none',
                          background: `linear-gradient(135deg, ${stepColor.main} 0%, ${stepColor.light} 100%)`,
                          color: '#ffffff',
                          borderRadius: { xs: 2, sm: 2.5 },
                          boxShadow: `0 4px 12px ${alpha(stepColor.main, 0.3)}`,
                          border: `1px solid ${alpha('#ffffff', 0.2)}`,
                          mt: 1,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${stepColor.dark} 0%, ${stepColor.main} 100%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 16px ${alpha(stepColor.main, 0.4)}`,
                          },
                          '&:active': {
                            transform: 'translateY(0)',
                          },
                        }}
                      >
                        Continue This Step
                      </Button>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grow>
          );
        })}
      </Box>

      {/* Premium Conversion Footer - Responsive Mature Design */}
      {!isComplete && (
        <Fade in={mounted} timeout={800}>
          <Box
            sx={{
              background: `linear-gradient(135deg, ${COLORS.neutral[50]} 0%, ${alpha(COLORS.primary.main, 0.03)} 50%, ${COLORS.neutral[50]} 100%)`,
              borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
              p: { xs: 3, sm: 4, md: 5, lg: 6 },
              border: `1.5px solid ${alpha(COLORS.primary.main, 0.12)}`,
              boxShadow: `0 8px 32px ${alpha(COLORS.neutral[900], 0.06)}, 0 2px 8px ${alpha(COLORS.neutral[900], 0.03)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: `linear-gradient(90deg, ${COLORS.primary.main} 0%, ${COLORS.accent.purple} 50%, ${COLORS.primary.dark} 100%)`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -50,
                right: -50,
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(COLORS.primary.main, 0.08)} 0%, transparent 70%)`,
                pointerEvents: 'none',
              },
            }}
          >
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              alignItems={{ xs: 'flex-start', lg: 'center' }}
              justifyContent="space-between"
              spacing={{ xs: 3.5, sm: 4, lg: 5 }}
              position="relative"
              zIndex={1}
            >
              {/* Left Content - Value Proposition */}
              <Box sx={{ flex: 1, width: { xs: '100%', lg: 'auto' }, maxWidth: { lg: '58%' } }}>
                <Stack spacing={{ xs: 2.5, sm: 3 }}>
                  {/* Main Headline */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '1.875rem' },
                        fontWeight: 800,
                        color: COLORS.neutral[900],
                        mb: { xs: 1, sm: 1.25 },
                        lineHeight: { xs: 1.3, sm: 1.2 },
                        background: `linear-gradient(135deg, ${COLORS.neutral[900]} 0%, ${COLORS.primary.dark} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {remainingSteps === 1 
                        ? '🎯 One Step Away from Your Dream Job!' 
                        : `Unlock Premium Job Matches & Client Connections`
                      }
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '0.938rem', md: '1rem' },
                        color: COLORS.neutral[600],
                        lineHeight: { xs: 1.5, sm: 1.6 },
                        maxWidth: { xs: '100%', md: '580px' },
                      }}
                    >
                      {remainingSteps === 1
                        ? 'Complete your profile now and start receiving personalized job matches from top clients in your area.'
                        : `Complete your profile to get matched with premium clients and job opportunities. ${derivedCompleted * 20}% of workers with complete profiles receive job offers within 48 hours.`
                      }
                    </Typography>
                  </Box>

                  {/* Benefits Grid - Responsive */}
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={{ xs: 2, sm: 2.5 }}
                    sx={{ mt: { xs: 0.5, sm: 1 } }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: { xs: 1.25, sm: 1.5 },
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: 2, sm: 2.5 },
                        backgroundColor: alpha(COLORS.success.main, 0.08),
                        border: `1.5px solid ${alpha(COLORS.success.main, 0.18)}`,
                        flex: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(COLORS.success.main, 0.12),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(COLORS.success.main, 0.15)}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 40, sm: 44 },
                          height: { xs: 40, sm: 44 },
                          borderRadius: { xs: 1.5, sm: 2 },
                          backgroundColor: COLORS.success.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: `0 4px 12px ${alpha(COLORS.success.main, 0.3)}`,
                        }}
                      >
                        <Target size={20} color="#ffffff" strokeWidth={2.5} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '0.875rem', sm: '0.938rem' }, 
                          fontWeight: 700, 
                          color: COLORS.neutral[900], 
                          mb: 0.5,
                          lineHeight: 1.2,
                        }}>
                          Smart Matching
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.813rem' }, 
                          color: COLORS.neutral[600], 
                          lineHeight: 1.4,
                        }}>
                          Get matched with jobs that fit your skills & preferences
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: { xs: 1.25, sm: 1.5 },
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: { xs: 2, sm: 2.5 },
                        backgroundColor: alpha(COLORS.primary.main, 0.08),
                        border: `1.5px solid ${alpha(COLORS.primary.main, 0.18)}`,
                        flex: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(COLORS.primary.main, 0.12),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.15)}`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: 40, sm: 44 },
                          height: { xs: 40, sm: 44 },
                          borderRadius: { xs: 1.5, sm: 2 },
                          backgroundColor: COLORS.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.3)}`,
                        }}
                      >
                        <Zap size={20} color="#ffffff" strokeWidth={2.5} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ 
                          fontSize: { xs: '0.875rem', sm: '0.938rem' }, 
                          fontWeight: 700, 
                          color: COLORS.neutral[900], 
                          mb: 0.5,
                          lineHeight: 1.2,
                        }}>
                          Fast Results
                        </Typography>
                        <Typography sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.813rem' }, 
                          color: COLORS.neutral[600], 
                          lineHeight: 1.4,
                        }}>
                          {derivedCompleted * 20}% match potential - Complete to unlock 100%
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  {/* Social Proof - Responsive */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 1.5, sm: 2 },
                      pt: { xs: 0.5, sm: 1 },
                      flexWrap: 'wrap',
                    }}
                  >
                    <Stack direction="row" spacing={-0.75}>
                      {[1, 2, 3, 4].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            width: { xs: 28, sm: 32 },
                            height: { xs: 28, sm: 32 },
                            borderRadius: '50%',
                            border: '2.5px solid white',
                            backgroundColor: COLORS.primary.main,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: { xs: '0.688rem', sm: '0.75rem' },
                            fontWeight: 700,
                            color: '#ffffff',
                            zIndex: 5 - i,
                            boxShadow: `0 2px 4px ${alpha(COLORS.primary.main, 0.2)}`,
                          }}
                        >
                          {i === 4 ? '+' : String.fromCharCode(64 + i)}
                        </Box>
                      ))}
                    </Stack>
                    <Box>
                      <Typography sx={{ 
                        fontSize: { xs: '0.813rem', sm: '0.875rem' }, 
                        fontWeight: 600, 
                        color: COLORS.neutral[900],
                        lineHeight: 1.2,
                      }}>
                        Join 10,000+ care workers
                      </Typography>
                      <Typography sx={{ 
                        fontSize: { xs: '0.688rem', sm: '0.75rem' }, 
                        color: COLORS.neutral[500],
                        lineHeight: 1.3,
                      }}>
                        Already finding their perfect match
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              {/* Right CTA - Responsive Premium Button */}
              <Box sx={{ 
                width: { xs: '100%', lg: 'auto' }, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: { xs: 'stretch', lg: 'flex-end' },
                flexShrink: 0,
              }}>
                <Button
                  onClick={handleContinue}
                  sx={{
                    width: { xs: '100%', lg: 'auto' },
                    minWidth: { xs: '100%', sm: '280px', lg: 300 },
                    height: { xs: 52, sm: 56, md: 60, lg: 64 },
                    px: { xs: 3.5, sm: 4, md: 4.5, lg: 5 },
                    fontSize: { xs: '0.938rem', sm: '1rem', md: '1.063rem' },
                    fontWeight: 800,
                    textTransform: 'none',
                    letterSpacing: { xs: '0.2px', sm: '0.3px' },
                    background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.accent.purple} 50%, ${COLORS.primary.dark} 100%)`,
                    backgroundSize: '200% 200%',
                    color: '#ffffff',
                    borderRadius: { xs: 3, sm: 3.5 },
                    boxShadow: `0 8px 24px ${alpha(COLORS.primary.main, 0.35)}, 0 4px 12px ${alpha(COLORS.accent.purple, 0.25)}`,
                    border: `2px solid ${alpha('#ffffff', 0.2)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                      transition: 'left 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                    '&:hover': {
                      backgroundPosition: '100% 0%',
                      transform: { xs: 'translateY(-2px)', sm: 'translateY(-3px)' },
                      boxShadow: `0 12px 32px ${alpha(COLORS.primary.main, 0.45)}, 0 6px 20px ${alpha(COLORS.accent.purple, 0.35)}`,
                      borderColor: alpha('#ffffff', 0.35),
                      '&::before': {
                        left: '100%',
                      },
                    },
                    '&:active': {
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: { xs: 1, sm: 1.5 },
                    }}
                  >
                    {remainingSteps === 1 ? 'Complete & Get Matched' : 'Continue Setup'}
                    <ArrowRight size={20} strokeWidth={3} />
                  </Box>
                </Button>
                
                <Typography
                  sx={{
                    fontSize: { xs: '0.688rem', sm: '0.75rem' },
                    color: COLORS.neutral[500],
                    textAlign: { xs: 'center', lg: 'right' },
                    mt: { xs: 1.5, sm: 2 },
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  ✓ Free to complete • ✓ No credit card required
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Fade>
      )}

      {/* Success State - Premium Celebration */}
      {isComplete && (
        <Fade in={mounted} timeout={800}>
          <Box
            sx={{
              textAlign: 'center',
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${COLORS.success.subtle} 0%, ${alpha(COLORS.success.main, 0.05)} 100%)`,
              border: `1px solid ${COLORS.success.subtle}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                right: '-50%',
                bottom: '-50%',
                background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
                animation: 'pulse 4s ease-in-out infinite',
              },
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${COLORS.success.main} 0%, ${COLORS.success.dark} 100%)`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: `0 8px 32px ${alpha(COLORS.success.main, 0.3)}`,
                  animation: 'float 3s ease-in-out infinite',
                }}
              >
                <CheckCircle2 size={40} color="white" strokeWidth={2} />
              </Box>
              
              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', md: '1.75rem' },
                  fontWeight: 800,
                  color: COLORS.success.dark,
                  mb: 1.5,
                }}
              >
                Profile Complete! 🎉
              </Typography>
              
              <Typography
                sx={{
                  fontSize: '1rem',
                  color: COLORS.neutral[600],
                  maxWidth: '600px',
                  mx: 'auto',
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                Your profile is now fully optimized and ready to receive premium job matches. 
                You're now in the top 10% of profiles!
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
                sx={{ maxWidth: 400, mx: 'auto' }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/dashboard/profile')}
                  sx={{
                    height: 48,
                    px: 3,
                    fontSize: '0.938rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: COLORS.success.main,
                    color: COLORS.success.dark,
                    borderRadius: 2.5,
                    '&:hover': {
                      borderColor: COLORS.success.dark,
                      backgroundColor: alpha(COLORS.success.main, 0.05),
                    },
                  }}
                >
                  View Your Profile
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  sx={{
                    height: 48,
                    px: 3,
                    fontSize: '0.938rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, ${COLORS.primary.main} 0%, ${COLORS.accent.purple} 100%)`,
                    color: 'white',
                    borderRadius: 2.5,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${COLORS.primary.dark} 0%, #7C3AED 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 32px ${alpha(COLORS.primary.main, 0.3)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Explore Opportunities
                </Button>
              </Stack>
              
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: COLORS.neutral[500],
                  mt: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                <Shield size={12} />
                Your profile is now verified and eligible for premium matches
              </Typography>
            </Box>
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
