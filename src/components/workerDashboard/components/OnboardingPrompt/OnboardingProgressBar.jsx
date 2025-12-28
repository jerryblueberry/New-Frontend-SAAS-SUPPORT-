import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, alpha, Stack } from '@mui/material';
import { CheckCircle2 } from 'lucide-react';

// SaaS-Level Professional Design System - Compact & Enterprise-Ready
const COLORS = {
  primary: {
    main: '#5B21B6', // Professional purple
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

// SaaS-Level Step Colors - Professional & Subtle
const STEP_COLORS = {
  1: { main: '#6366F1', light: '#818CF8' }, // Indigo
  2: { main: '#8B5CF6', light: '#A78BFA' }, // Purple
  3: { main: '#10B981', light: '#34D399' }, // Green
  4: { main: '#F59E0B', light: '#FBBF24' }, // Amber
  5: { main: '#EF4444', light: '#F87171' }, // Red
};

const OnboardingProgressBar = ({
  stepsConfig = [],
  percentage = 0,
  nextStep = 1,
  completedSections = {},
  completedSteps,
  onStepClick = () => {},
}) => {
  const [hoveredStep, setHoveredStep] = useState(null);

  // Calculate safe percentage from backend data
  const safePercentage = useMemo(
    () => (Number.isFinite(percentage) ? Math.min(Math.max(percentage, 0), 100) : 0),
    [percentage]
  );

  // Calculate completed steps count - Best practice: prioritize completedSections from backend
  const completedStepsCount = useMemo(() => {
    if (completedSections && typeof completedSections === 'object') {
      return stepsConfig.filter((step) => completedSections[step.key] === true).length;
    }
    if (typeof completedSteps === 'number' && !Number.isNaN(completedSteps)) {
      return Math.min(Math.max(completedSteps, 0), stepsConfig.length);
    }
    // Fallback: calculate from percentage (5 steps = 20% each)
    return Math.min(Math.floor(safePercentage / (100 / stepsConfig.length)), stepsConfig.length);
  }, [completedSections, completedSteps, safePercentage, stepsConfig]);

  // Determine which step is currently active/in-progress
  const currentActiveStep = useMemo(() => {
    if (!nextStep || nextStep < 1 || nextStep > stepsConfig.length) {
      return null;
    }
    const step = stepsConfig.find((s) => s.id === nextStep);
    if (!step) return null;
    
    // Check if this step is already completed
    const isCompleted = completedSections && completedSections[step.key] === true;
    return isCompleted ? null : step;
  }, [nextStep, completedSections, stepsConfig]);

  // Calculate actual progress percentage - Premium design: fills to center of active step
  const actualProgressPercentage = useMemo(() => {
    const totalSteps = stepsConfig.length;
    const stepWidth = 100 / totalSteps;
    
    // If all steps completed, return 100%
    if (completedStepsCount === totalSteps) {
      return 100;
    }
    
    // Calculate base progress: each completed step = stepWidth%
    const baseProgress = completedStepsCount * stepWidth;
    
    // If there's a current active step, show partial progress to its center
    if (currentActiveStep && completedStepsCount < totalSteps) {
      // Fill to center of current step for perfect visual alignment
      return Math.min(baseProgress + (stepWidth / 2), 100);
    }
    
    return baseProgress;
  }, [completedStepsCount, stepsConfig.length, currentActiveStep]);

  const isStepCompleted = useCallback(
    (step) => {
      if (completedSections && typeof completedSections === 'object') {
        return completedSections[step.key] === true;
      }
      // Fallback: calculate from step position (each step = 20%)
      const stepPercentage = (step.id / stepsConfig.length) * 100;
      return safePercentage >= stepPercentage;
    },
    [completedSections, safePercentage, stepsConfig.length]
  );

  // Helper function to get step colors - SaaS-level
  const getStepColors = useCallback((stepId) => {
    return STEP_COLORS[stepId] || STEP_COLORS[1];
  }, []);

  // Helper function to get step state - Cleaner code
  const getStepState = useCallback((step, index) => {
    const completed = isStepCompleted(step);
    const current = nextStep === step.id && !completed;
    const stepWidth = 100 / stepsConfig.length;
    const stepStartProgress = index * stepWidth;
    const isStepInProgress = actualProgressPercentage >= stepStartProgress;
    
    return {
      completed,
      current,
      isStepInProgress,
      colors: getStepColors(step.id),
    };
  }, [isStepCompleted, nextStep, stepsConfig.length, actualProgressPercentage, getStepColors]);

  // SaaS-Level Gradient - Professional & Subtle
  const progressBarGradient = useMemo(() => {
    const totalSteps = stepsConfig.length;
    const stepWidth = 100 / totalSteps;
    
    // If all steps completed, use success gradient
    if (completedStepsCount === totalSteps) {
      return `linear-gradient(90deg, ${COLORS.success.main} 0%, ${COLORS.success.light} 100%)`;
    }
    
    const stops = [];
    
    // Add gradient stops for each completed step
    stepsConfig.forEach((step, idx) => {
      if (idx < completedStepsCount) {
        const stepColor = STEP_COLORS[step.id] || STEP_COLORS[1];
        const start = idx * stepWidth;
        const end = (idx + 1) * stepWidth;
        stops.push(`${stepColor.main} ${start}%`);
        stops.push(`${stepColor.light} ${end}%`);
      }
    });
    
    // Add current active step gradient
    if (currentActiveStep && completedStepsCount < totalSteps) {
      const stepColor = STEP_COLORS[currentActiveStep.id] || STEP_COLORS[1];
      const start = completedStepsCount * stepWidth;
      stops.push(`${stepColor.main} ${start}%`);
      stops.push(`${stepColor.light} ${actualProgressPercentage}%`);
    }
    
    // Default gradient if no stops
    if (stops.length === 0) {
      const stepColor = STEP_COLORS[1];
      return `linear-gradient(90deg, ${stepColor.main} 0%, ${stepColor.light} 100%)`;
    }
    
    return `linear-gradient(90deg, ${stops.join(', ')})`;
  }, [currentActiveStep, completedStepsCount, actualProgressPercentage, stepsConfig]);

  if (!stepsConfig || stepsConfig.length === 0) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Mobile: SaaS-Level Compact Layout */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {stepsConfig.map((step, index) => {
          const stepState = getStepState(step, index);
          const { completed, current, colors } = stepState;
          const IconComponent = step.icon;
          
          return (
            <Box
              key={step.id}
              onClick={() => onStepClick(step.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: completed
                  ? alpha(COLORS.success.main, 0.06)
                  : current
                  ? alpha(colors.main, 0.08)
                  : 'transparent',
                border: `1.5px solid ${
                  completed
                    ? alpha(COLORS.success.main, 0.2)
                    : current
                    ? colors.main
                    : COLORS.neutral[200]
                }`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:active': {
                  transform: 'scale(0.98)',
                },
                '&:hover': {
                  backgroundColor: completed
                    ? alpha(COLORS.success.main, 0.1)
                    : current
                    ? alpha(colors.main, 0.12)
                    : COLORS.neutral[50],
                  borderColor: completed
                    ? COLORS.success.main
                    : current
                    ? colors.light
                    : COLORS.neutral[300],
                },
              }}
            >
              {/* Compact Step Indicator */}
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: completed
                    ? COLORS.success.main
                    : current
                    ? colors.main
                    : COLORS.neutral[300],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: completed || current
                    ? `0 2px 8px ${alpha(completed ? COLORS.success.main : colors.main, 0.25)}`
                    : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {completed ? (
                  <CheckCircle2 size={18} color="#ffffff" strokeWidth={2.5} />
                ) : (
                  <IconComponent size={18} color="#ffffff" strokeWidth={2} />
                )}
              </Box>

              {/* Step Info - Compact */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} mb={0.25}>
                  <Typography
                    sx={{
                      fontSize: '0.813rem',
                      fontWeight: completed || current ? 600 : 500,
                      color: completed
                        ? COLORS.success.dark
                        : current
                        ? colors.main
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
                        fontWeight: 600,
                        backgroundColor: completed
                          ? alpha(COLORS.success.main, 0.1)
                          : alpha(colors.main, 0.15),
                        color: completed
                          ? COLORS.success.dark
                          : colors.main,
                        border: `1px solid ${
                          completed
                            ? alpha(COLORS.success.main, 0.2)
                            : alpha(colors.main, 0.3)
                        }`,
                        '& .MuiChip-label': {
                          px: 0.75,
                        },
                      }}
                    />
                  )}
                </Stack>
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

      {/* Desktop/Tablet: Horizontal Layout with Perfect Alignment */}
      <Box 
        sx={{ 
          display: { xs: 'none', sm: 'block' },
          position: 'relative',
          width: '100%',
        }}
      >
        {/* SaaS-Level Compact Container */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            pt: { sm: 2.5, md: 2.5 }, // Compact spacing
            pb: { sm: 3, md: 3 }, // Compact spacing
          }}
        >
          {/* Compact Progress Bar - SaaS-Level */}
          <Box
            sx={{
              position: 'absolute',
              top: { sm: '20px', md: '20px' }, // Center of 40px circle
              left: { sm: '20px', md: '20px' },
              right: { sm: '20px', md: '20px' },
              height: 4, // Compact height
              zIndex: 1,
            }}
          >
            {/* Progress Bar Track */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                backgroundColor: COLORS.neutral[100],
                borderRadius: '9999px',
              }}
            />
            {/* Progress Bar Fill - Professional */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${Math.min(actualProgressPercentage, 100)}%`,
                maxWidth: '100%',
                height: '100%',
                background: progressBarGradient,
                borderRadius: '9999px',
                transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease',
                boxShadow: `0 1px 4px ${alpha(COLORS.primary.main, 0.2)}`,
                // Subtle shimmer for active step
                ...(currentActiveStep && {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    borderRadius: '9999px',
                    animation: 'shimmer 2.5s ease-in-out infinite',
                    '@keyframes shimmer': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' },
                    },
                  },
                }),
              }}
            />
          </Box>

          {/* SaaS-Level Step Indicators - Compact & Aligned */}
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between',
              position: 'relative',
              width: '100%',
              alignItems: 'flex-start',
              zIndex: 2,
              gap: 0,
            }}
          >
            {stepsConfig.map((step, index) => {
              const stepState = getStepState(step, index);
              const { completed, current, isStepInProgress, colors } = stepState;
              const isHovered = hoveredStep === step.id;
              const IconComponent = step.icon;
              
              return (
                <Box
                  key={step.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    alignItems: 'center',
                    flex: '1 1 0',
                    minWidth: 0,
                    maxWidth: '100%',
                    // Enhanced visibility for current step
                    ...(current && {
                      zIndex: 4,
                    }),
                  }}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => onStepClick(step.id)}
                >
                  {/* SaaS-Level Step Indicator - Compact & Professional */}
                  <Box
                    sx={{
                      width: current ? 44 : 40,
                      height: current ? 44 : 40,
                      borderRadius: '50%',
                      backgroundColor: completed
                        ? COLORS.success.main
                        : current || isStepInProgress
                        ? colors.main
                        : COLORS.neutral[300],
                      border: `2.5px solid ${
                        completed
                          ? COLORS.success.dark
                          : current
                          ? '#ffffff'
                          : isStepInProgress
                          ? colors.light
                          : COLORS.neutral[200]
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isHovered ? 'scale(1.1)' : current ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: current
                        ? `0 4px 16px ${alpha(colors.main, 0.35)}, 0 2px 8px ${alpha(colors.main, 0.2)}`
                        : isHovered
                        ? `0 4px 12px ${alpha(completed ? COLORS.success.main : colors.main, 0.3)}`
                        : completed || isStepInProgress
                        ? `0 2px 6px ${alpha(completed ? COLORS.success.main : colors.main, 0.25)}`
                        : 'none',
                      mb: { sm: 1, md: 1.25 },
                      position: 'relative',
                      zIndex: current ? 4 : 3,
                      flexShrink: 0,
                      top: { sm: '-20px', md: '-20px' },
                      // Subtle pulse for current step
                      ...(current && {
                        animation: 'subtlePulse 2.5s ease-in-out infinite',
                        '@keyframes subtlePulse': {
                          '0%, 100%': { 
                            boxShadow: `0 4px 16px ${alpha(colors.main, 0.35)}, 0 2px 8px ${alpha(colors.main, 0.2)}`,
                          },
                          '50%': { 
                            boxShadow: `0 6px 20px ${alpha(colors.main, 0.45)}, 0 3px 10px ${alpha(colors.main, 0.3)}`,
                          },
                        },
                      }),
                    }}
                  >
                    {completed ? (
                      <CheckCircle2 size={current ? 20 : 18} color="#ffffff" strokeWidth={2.5} />
                    ) : (
                      <IconComponent size={current ? 20 : 18} color="#ffffff" strokeWidth={2} />
                    )}
                  </Box>

                  {/* SaaS-Level Step Title - Compact */}
                  <Typography
                    sx={{
                      fontSize: { sm: '0.813rem', md: '0.813rem' },
                      fontWeight: current ? 600 : completed ? 600 : 500,
                      color: completed
                        ? COLORS.success.dark
                        : current
                        ? colors.main
                        : COLORS.neutral[600],
                      textAlign: 'center',
                      lineHeight: 1.3,
                      maxWidth: { sm: '100px', md: '110px' },
                      transition: 'all 0.2s ease',
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                      width: '100%',
                      wordBreak: 'break-word',
                      mb: 0.75,
                      px: 0.5,
                    }}
                  >
                    {step.title}
                  </Typography>

                  {/* SaaS-Level Step Badge - Compact */}
                  {(completed || current) && (
                    <Chip
                      label={completed ? 'Done' : 'Next'}
                      size="small"
                      sx={{
                        mt: 0.25,
                        height: 20,
                        fontSize: '0.688rem',
                        fontWeight: 600,
                        backgroundColor: completed
                          ? alpha(COLORS.success.main, 0.1)
                          : alpha(colors.main, 0.15),
                        color: completed
                          ? COLORS.success.dark
                          : colors.main,
                        border: `1px solid ${
                          completed
                            ? alpha(COLORS.success.main, 0.25)
                            : alpha(colors.main, 0.4)
                        }`,
                        alignSelf: 'center',
                        px: 1.25,
                        '& .MuiChip-label': {
                          px: 0.5,
                        },
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
  );
};

OnboardingProgressBar.propTypes = {
  stepsConfig: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      desc: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
    })
  ).isRequired,
  percentage: PropTypes.number,
  nextStep: PropTypes.number,
  completedSections: PropTypes.shape({}),
  completedSteps: PropTypes.number,
  onStepClick: PropTypes.func,
};

export default OnboardingProgressBar;

