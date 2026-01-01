import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { X, AlertCircle } from 'lucide-react';

const StepModal = ({ isOpen, onClose, message }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: '16px', sm: '16px' },
          boxShadow: `0 24px 64px ${alpha(theme.palette.error.main, 0.2)}, 0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
          maxHeight: { xs: '85vh', sm: '90vh' },
          maxWidth: { xs: 'calc(100% - 32px)', sm: '400px' },
          m: { xs: 2, sm: 2 },
          overflow: 'hidden',
          width: { xs: 'calc(100% - 32px)', sm: 'auto' },
        },
      }}
      TransitionProps={{
        timeout: { enter: 300, exit: 200 },
      }}
    >
      {/* Compact Header - Red/Warning Theme */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: { xs: 1.5, sm: 2 },
          pt: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 2.5 },
          bgcolor: alpha(theme.palette.error.main, 0.06),
          borderBottom: `2px solid ${alpha(theme.palette.error.main, 0.15)}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1.25, sm: 1.5 },
            flex: 1,
            minWidth: 0,
          }}
        >
          {/* Error Icon - Red Theme */}
          <Box
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.error.main, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `2px solid ${alpha(theme.palette.error.main, 0.25)}`,
            }}
          >
            <AlertCircle
              size={isMobile ? 20 : 22}
              color={theme.palette.error.main}
              strokeWidth={2.5}
            />
          </Box>

          {/* Compact Title */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                fontWeight: 700,
                color: theme.palette.error.dark || theme.palette.error.main,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              Step Incomplete
            </Typography>
          </Box>
        </Box>

        {/* Compact Close Button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            width: { xs: 32, sm: 36 },
            height: { xs: 32, sm: 36 },
            borderRadius: '8px',
            bgcolor: alpha(theme.palette.error.main, 0.1),
            ml: { xs: 0.75, sm: 1 },
            flexShrink: 0,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.2),
              transform: 'scale(1.08)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
          aria-label="Close dialog"
        >
          <X size={isMobile ? 16 : 18} color={theme.palette.error.main} strokeWidth={2.5} />
        </IconButton>
      </DialogTitle>

      {/* Compact Content Section */}
      <DialogContent
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: { xs: 2.5, sm: 3 },
          textAlign: 'center',
        }}
      >
        {/* Compact Message Card - Red Theme */}
        <Box
          sx={{
            width: '100%',
            p: { xs: 1.75, sm: 2 },
            borderRadius: '12px',
            bgcolor: alpha(theme.palette.error.main, 0.05),
            border: `1.5px solid ${alpha(theme.palette.error.main, 0.2)}`,
            mb: { xs: 1.5, sm: 2 },
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
              color: 'text.primary',
              lineHeight: { xs: 1.5, sm: 1.6 },
              fontWeight: 500,
            }}
          >
            {message || 'Please complete the current step before proceeding to the next one.'}
          </Typography>
        </Box>

        {/* Compact Helper Text */}
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            color: 'text.secondary',
            lineHeight: 1.5,
            px: { xs: 0.5, sm: 1 },
          }}
        >
          Complete all required fields to continue.
        </Typography>
      </DialogContent>

      {/* Compact Actions Section */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 2.5 },
          pb: { xs: 2, sm: 2.5 },
          pt: { xs: 1, sm: 1.5 },
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          gap: { xs: 1, sm: 1.5 },
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={isMobile}
          sx={{
            borderRadius: '10px',
            px: { xs: 2.5, sm: 3 },
            py: { xs: 0.875, sm: 1 },
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            fontWeight: 600,
            textTransform: 'none',
            borderColor: alpha(theme.palette.grey[300], 0.5),
            color: 'text.primary',
            minWidth: { xs: 'auto', sm: 100 },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: theme.palette.grey[400],
              bgcolor: alpha(theme.palette.grey[100], 0.8),
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth={isMobile}
          sx={{
            borderRadius: '10px',
            px: { xs: 2.5, sm: 3 },
            py: { xs: 0.875, sm: 1 },
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: theme.palette.error.main,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
            minWidth: { xs: 'auto', sm: 120 },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: theme.palette.error.dark || theme.palette.error.main,
              boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ProgressBar = ({
  currentStep = 1,
  totalSteps = 5,
  steps = [],
  variant = 'primary',
  animated = true,
  className = '',
  onStepClick,
  completedSteps = [],
  nextAvailableStep = 1,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [animationActive, setAnimationActive] = useState(false);

  const normalizedStep = Math.min(Math.max(1, currentStep), totalSteps);
  
  // Calculate completion percentage based on completed steps
  const completionPercentage = useMemo(() => {
    if (completedSteps.length === 0) {
      return ((normalizedStep - 1) / (totalSteps - 1)) * 100;
    }
    // More accurate: use completed steps count
    const completedCount = completedSteps.length;
    const stepProgress = completedCount / totalSteps;
    return Math.min(stepProgress * 100, 100);
  }, [completedSteps, normalizedStep, totalSteps]);

  // Calculate progress percentage for visual bar
  const progressPercentage = useMemo(() => {
    if (completedSteps.length === totalSteps) return 100;
    // Show progress up to current step
    return ((normalizedStep - 1) / (totalSteps - 1)) * 100;
  }, [normalizedStep, totalSteps, completedSteps.length]);

  useEffect(() => {
    if (animated) {
      setAnimationActive(true);
      const timer = setTimeout(() => setAnimationActive(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, animated]);

  // Normalize steps data with completion status
  const stepsData = Array.from({ length: totalSteps }).map((_, index) => {
    const stepNumber = index + 1;
    const isCompleted = completedSteps.includes(stepNumber);
    const isAvailable = stepNumber <= nextAvailableStep;

    return {
      number: stepNumber,
      label: steps[index]?.label || `Step ${stepNumber}`,
      completed: isCompleted,
      available: isAvailable,
      ...(steps[index] || {}),
    };
  });

  const handleStepClick = (stepNumber) => {
    if (
      completedSteps.includes(stepNumber) ||
      stepNumber === currentStep ||
      stepNumber === nextAvailableStep
    ) {
      if (onStepClick) {
        onStepClick(stepNumber);
      }
    } else if (stepNumber > nextAvailableStep) {
      setModalMessage(
        `Please complete Step ${currentStep} before proceeding to Step ${stepNumber}.`
      );
      setModalOpen(true);
    } else {
      setModalMessage(`Please complete Step ${stepNumber} before proceeding.`);
      setModalOpen(true);
    }
  };

  // Get variant color
  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return theme.palette.primary.main;
      case 'secondary':
        return theme.palette.secondary.main;
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const variantColor = getVariantColor();

  // Dynamic gradient based on completion percentage
  const getProgressGradient = useMemo(() => {
    const completedCount = completedSteps.length;
    const total = totalSteps;
    
    // All completed - success gradient
    if (completedCount === total) {
      return `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light || theme.palette.success.main} 50%, ${theme.palette.success.main} 100%)`;
    }
    
    // High progress - primary to success gradient
    if (completionPercentage >= 75) {
      return `linear-gradient(90deg, ${variantColor} 0%, ${alpha(variantColor, 0.9)} 30%, ${theme.palette.success.light || theme.palette.success.main} 70%, ${theme.palette.success.main} 100%)`;
    }
    
    // Medium progress - primary gradient with shimmer
    if (completionPercentage >= 50) {
      return `linear-gradient(90deg, ${variantColor} 0%, ${alpha(variantColor, 0.95)} 40%, ${variantColor} 100%)`;
    }
    
    // Low progress - warning to primary gradient
    if (completionPercentage >= 25) {
      return `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${alpha(theme.palette.warning.main, 0.8)} 50%, ${variantColor} 100%)`;
    }
    
    // Very low - warning gradient
    return `linear-gradient(90deg, ${theme.palette.warning.light || theme.palette.warning.main} 0%, ${theme.palette.warning.main} 100%)`;
  }, [completionPercentage, completedSteps.length, totalSteps, variantColor, theme]);

  // Unified Horizontal Layout for All Devices
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: { xs: '100%', sm: 900, md: 1100, lg: 1300 },
        mx: 'auto',
        px: { xs: 1.5, sm: 2.5, md: 3, lg: 4 },
        py: { xs: 1.5, sm: 2, md: 2.5 },
        ...props.sx,
      }}
      className={className}
    >
      {/* Header Section - Percentage & Progress Info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: { xs: 1.5, sm: 2, md: 2.5 },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 0.5,
            }}
          >
            Onboarding Progress
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {Math.round(completionPercentage)}%
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            borderRadius: '12px',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            {completedSteps.length}/{totalSteps}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            Steps
          </Typography>
        </Box>
      </Box>

      {/* Progress Track - Compact & Premium */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 5, sm: 6, md: 8 },
          bgcolor: alpha(theme.palette.grey[200], 0.4),
          borderRadius: { xs: '10px', sm: '12px', md: '14px' },
          overflow: 'hidden',
          mb: { xs: 2, sm: 2.5, md: 3 },
          boxShadow: `inset 0 2px 4px ${alpha(theme.palette.common.black, 0.06)}`,
        }}
      >
        {/* Progress Bar with Dynamic Gradient */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${Math.min(progressPercentage, 100)}%`,
            background: getProgressGradient,
            borderRadius: { xs: '10px', sm: '12px', md: '14px' },
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background 0.6s ease',
            boxShadow: `0 2px 12px ${alpha(variantColor, 0.35)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.2)}`,
            ...(animationActive && {
              animation: 'progressPulse 1.5s ease-out',
              '@keyframes progressPulse': {
                '0%': {
                  boxShadow: `0 0 0 0 ${alpha(variantColor, 0.4)}, 0 2px 12px ${alpha(variantColor, 0.35)}`,
                },
                '70%': {
                  boxShadow: `0 0 0 12px ${alpha(variantColor, 0)}, 0 2px 12px ${alpha(variantColor, 0.35)}`,
                },
                '100%': {
                  boxShadow: `0 0 0 0 ${alpha(variantColor, 0)}, 0 2px 12px ${alpha(variantColor, 0.35)}`,
                },
              },
            }),
            // Shimmer effect for active progress
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
              borderRadius: { xs: '10px', sm: '12px', md: '14px' },
              animation: 'shimmer 2.5s ease-in-out infinite',
              '@keyframes shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' },
              },
            },
          }}
        />
      </Box>

      {/* Step Indicators - Compact Horizontal Layout */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {stepsData.map((step, index) => {
          const stepNumber = step.number;
          const isActive = stepNumber <= normalizedStep;
          const isCurrent = stepNumber === normalizedStep;
          const isCompleted = step.completed;
          const isAvailable = step.available;

          return (
            <Box
              key={index}
              onClick={() => handleStepClick(stepNumber)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                minWidth: 0,
                maxWidth: { xs: 'none', sm: '120px', md: '150px' },
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                opacity: isAvailable ? 1 : 0.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Step Dot - Premium Design with Gradient */}
              <Box
                sx={{
                  width: { xs: 32, sm: 40, md: 48 },
                  height: { xs: 32, sm: 40, md: 48 },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  mb: { xs: 0.75, sm: 1, md: 1.25 },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                  '&:hover': isAvailable
                    ? {
                        transform: isCurrent ? 'scale(1.15)' : 'scale(1.08)',
                      }
                    : {},
                  '&:active': isAvailable
                    ? {
                        transform: 'scale(0.95)',
                      }
                    : {},
                }}
              >
                {/* Background with gradient */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: isCurrent
                      ? `linear-gradient(135deg, ${variantColor} 0%, ${alpha(variantColor, 0.8)} 100%)`
                      : isCompleted
                      ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark || theme.palette.success.main} 100%)`
                      : isActive
                      ? `linear-gradient(135deg, ${alpha(variantColor, 0.3)} 0%, ${alpha(variantColor, 0.15)} 100%)`
                      : `linear-gradient(135deg, ${alpha(theme.palette.grey[300], 0.4)} 0%, ${alpha(theme.palette.grey[200], 0.3)} 100%)`,
                    boxShadow:
                      isCurrent || isCompleted
                        ? `0 4px 16px ${alpha(
                            isCurrent ? variantColor : theme.palette.success.main,
                            0.4
                          )}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.2)}`
                        : isActive
                        ? `0 2px 8px ${alpha(variantColor, 0.25)}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}`
                        : `inset 0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
                    border:
                      isCurrent
                        ? `2.5px solid ${alpha(variantColor, 0.3)}`
                        : isCompleted
                        ? `2px solid ${alpha(theme.palette.success.main, 0.3)}`
                        : `1.5px solid ${alpha(theme.palette.grey[300], 0.3)}`,
                  }}
                />
                {/* Step Number */}
                <Typography
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: { xs: '0.8125rem', sm: '0.9375rem', md: '1.0625rem' },
                    fontWeight: 700,
                    color: isCurrent || isCompleted
                      ? '#ffffff'
                      : isActive
                      ? variantColor
                      : theme.palette.text.secondary,
                    textShadow:
                      isCurrent || isCompleted
                        ? `0 1px 2px ${alpha(theme.palette.common.black, 0.2)}`
                        : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {stepNumber}
                </Typography>
                {/* Pulse ring for current step */}
                {isCurrent && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: -4,
                      borderRadius: '50%',
                      border: `2px solid ${alpha(variantColor, 0.3)}`,
                      animation: 'pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      '@keyframes pulseRing': {
                        '0%, 100%': {
                          opacity: 0.6,
                          transform: 'scale(1)',
                        },
                        '50%': {
                          opacity: 0.2,
                          transform: 'scale(1.15)',
                        },
                      },
                    }}
                  />
                )}
              </Box>

              {/* Step Label - Compact Text */}
              <Typography
                sx={{
                  fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem' },
                  fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                  color: isCurrent
                    ? variantColor
                    : isCompleted
                    ? theme.palette.success.dark
                    : isActive
                    ? 'text.primary'
                    : 'text.secondary',
                  textAlign: 'center',
                  lineHeight: { xs: 1.3, sm: 1.4 },
                  transition: 'all 0.3s ease',
                  px: { xs: 0.25, sm: 0.5 },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 2, sm: 2, md: 3 },
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                }}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <StepModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
      />
    </Box>
  );
};

export default ProgressBar;
