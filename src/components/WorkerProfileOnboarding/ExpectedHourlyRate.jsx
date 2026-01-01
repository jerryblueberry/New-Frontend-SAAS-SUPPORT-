import React, { useCallback, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  alpha,
  FormControl,
  FormLabel,
  FormHelperText,
  Fade,
  Collapse,
} from '@mui/material';
import {
  CheckCircle,
  ErrorOutline,
  TrendingUp,
} from '@mui/icons-material';
import { Target } from 'lucide-react';
import useOnboardingStore from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';

// Validation constants - OLD VALIDATION LOGIC
const VALIDATION_RULES = {
  expectedHourlyRate: {
    min: 20,
    max: 100,
    required: true,
  },
};

// Rate insights and tips
const RATE_INSIGHTS = {
  average: 35,
  competitive: { min: 30, max: 50 },
  highDemand: { min: 25, max: 45 },
  premium: { min: 50, max: 100 },
};

// Get rate category and matching insights
const getRateInsights = (rate) => {
  if (!rate || rate < VALIDATION_RULES.expectedHourlyRate.min) return null;
  
  if (rate >= RATE_INSIGHTS.premium.min) {
    return {
      category: 'premium',
      message: 'Premium rate - attracts high-value clients',
      matchChance: 'High',
      color: 'success',
    };
  } else if (rate >= RATE_INSIGHTS.competitive.min && rate <= RATE_INSIGHTS.competitive.max) {
    return {
      category: 'competitive',
      message: 'Competitive rate - great balance for matching',
      matchChance: 'Very High',
      color: 'success',
    };
  } else if (rate >= RATE_INSIGHTS.highDemand.min && rate <= RATE_INSIGHTS.highDemand.max) {
    return {
      category: 'highDemand',
      message: 'High demand range - excellent match potential',
      matchChance: 'Very High',
      color: 'primary',
    };
  } else {
    return {
      category: 'entry',
      message: 'Entry level - good for building experience',
      matchChance: 'High',
      color: 'info',
    };
  }
};

/**
 * ExpectedHourlyRate Component
 * 
 * Enhanced design with old validation logic:
 * - Real-time validation (old logic)
 * - Enhanced UI/UX with modern design
 * - Responsive design
 * - Optimized performance
 */
const ExpectedHourlyRate = ({
  disabled = false,
  onValidationChange,
  showErrors = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Local state for UI interactions
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Get state and actions from store
  const expectedHourlyRate = useOnboardingStore(
    (state) => state.profile.expectedHourlyRate,
    shallow
  );
  const updateProfile = useOnboardingStore((state) => state.updateProfile);

  // OLD VALIDATION FUNCTION - Keep as is
  const validateRate = useCallback((rate) => {
    const errors = [];

    if (rate === null || rate === undefined || rate === '') {
      if (VALIDATION_RULES.expectedHourlyRate.required) {
        errors.push('Hourly rate is required');
      }
    } else {
      const rateValue = typeof rate === 'string' ? parseFloat(rate) : rate;
      
      if (isNaN(rateValue)) {
        errors.push('Please enter a valid number');
      } else if (rateValue < VALIDATION_RULES.expectedHourlyRate.min) {
        errors.push(`Rates below $${VALIDATION_RULES.expectedHourlyRate.min} are uncommon on our platform and may receive fewer enquiries.`);
      } else if (rateValue > VALIDATION_RULES.expectedHourlyRate.max) {
        errors.push(`Rates above $${VALIDATION_RULES.expectedHourlyRate.max} are uncommon and may reduce your match potential.`);
      }
    }

    return errors;
  }, []);

  // OLD NOTIFY VALIDATION - Keep as is
  const notifyValidation = useCallback((rate) => {
    const errors = validateRate(rate);
    const errorMessage = errors.length > 0 ? errors[0] : null; // Single consolidated error
    
    if (onValidationChange) {
      onValidationChange({
        isValid: errors.length === 0,
        error: errorMessage,
        rate: rate,
      });
    }
  }, [validateRate, onValidationChange]);

  // OLD HANDLE CHANGE - Keep as is
  const handleChange = useCallback((e) => {
    const { value } = e.target;
    const processedValue = value === '' ? null : parseFloat(value) || 0;

    updateProfile({ expectedHourlyRate: processedValue });
    setHasInteracted(true);
    
    // Notify parent of validation change
    notifyValidation(processedValue);
  }, [updateProfile, notifyValidation]);

  // Validate on mount and when rate changes
  useEffect(() => {
    notifyValidation(expectedHourlyRate);
  }, [expectedHourlyRate, notifyValidation]);

  // Get error message - OLD LOGIC
  // Always validate, but only show error message when showErrors is true
  const validationErrors = React.useMemo(() => {
    return validateRate(expectedHourlyRate);
  }, [expectedHourlyRate, validateRate]);

  const errorMessage = React.useMemo(() => {
    if (!showErrors) return null;
    return validationErrors.length > 0 ? validationErrors[0] : null;
  }, [showErrors, validationErrors]);

  // hasError should be based on actual validation, not just display
  const hasError = validationErrors.length > 0;
  const hasValue = expectedHourlyRate !== null && expectedHourlyRate !== undefined && expectedHourlyRate !== '';
  const isValid = hasValue && !hasError;
  
  // Get rate insights
  const rateInsights = useMemo(() => {
    if (!expectedHourlyRate || expectedHourlyRate < VALIDATION_RULES.expectedHourlyRate.min) return null;
    return getRateInsights(expectedHourlyRate);
  }, [expectedHourlyRate]);
  
  // Get validation message with context
  const getContextualErrorMessage = useCallback((rate) => {
    if (!rate || rate === '') return 'Hourly rate is required';
    
    const rateValue = typeof rate === 'string' ? parseFloat(rate) : rate;
    
    if (isNaN(rateValue)) return 'Please enter a valid number';
    
    if (rateValue < VALIDATION_RULES.expectedHourlyRate.min) {
      return `Minimum rate is $${VALIDATION_RULES.expectedHourlyRate.min}. Rates below this may limit your opportunities.`;
    }
    
    if (rateValue > VALIDATION_RULES.expectedHourlyRate.max) {
      return `Maximum rate is $${VALIDATION_RULES.expectedHourlyRate.max}. Consider rates between $${RATE_INSIGHTS.competitive.min}-$${RATE_INSIGHTS.competitive.max} for best matching.`;
    }
    
    return null;
  }, []);

  // Shared transition for smooth animations
  const transition = theme.transitions.create(
    ['background-color', 'border-color', 'box-shadow', 'color'],
    { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <Box sx={{ flexShrink: 0, width: '100%' }}>
      {/* Premium Card Container */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          p: { xs: 2.5, sm: 3 },
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
            borderColor: alpha(theme.palette.divider, 0.12),
          },
        }}
      >
        <FormControl fullWidth error={hasError} disabled={disabled}>
          {/* Minimal Header */}
          <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormLabel
                  sx={{
                    color: hasError
                      ? theme.palette.error.main
                      : theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.4,
                    transition: 'color 0.2s ease',
                    cursor: 'pointer',
                    m: 0,
                  }}
                  htmlFor="expectedHourlyRate"
                >
                  Expected Hourly Rate
                </FormLabel>
                
                {VALIDATION_RULES.expectedHourlyRate.required && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      color: theme.palette.text.disabled,
                      fontWeight: 500,
                    }}
                  >
                    (Required)
                  </Typography>
                )}
              </Box>

              {/* Subtle Status Indicator */}
              {hasInteracted && (
                <Fade in={hasInteracted}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isValid && (
                      <CheckCircle
                        sx={{
                          fontSize: 18,
                          color: theme.palette.success.main,
                        }}
                      />
                    )}
                    {hasError && (
                      <ErrorOutline
                        sx={{
                          fontSize: 18,
                          color: theme.palette.error.main,
                        }}
                      />
                    )}
                  </Box>
                </Fade>
              )}
            </Box>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
                lineHeight: 1.5,
                fontWeight: 400,
                color: theme.palette.text.secondary,
              }}
            >
              Set your preferred hourly rate in AUD
            </Typography>

          {/* Minimal Tips Section - Only show when focused */}
          <Collapse in={isFocused && !hasValue} timeout={200}>
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                borderRadius: '10px',
                bgcolor: alpha(theme.palette.grey[50], 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: 'text.secondary',
                  lineHeight: 1.5,
                  mb: 0.75,
                  fontWeight: 500,
                }}
              >
                💡 Recommended range: ${RATE_INSIGHTS.competitive.min}-${RATE_INSIGHTS.competitive.max}/hour
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'text.disabled',
                  lineHeight: 1.5,
                }}
              >
                Most workers set rates in this range for optimal matching
              </Typography>
            </Box>
          </Collapse>

          {/* Rate Insights - Minimal display when valid */}
          {rateInsights && isValid && (
            <Fade in={isValid}>
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.25,
                  borderRadius: '10px',
                  bgcolor: alpha(
                    rateInsights.color === 'success'
                      ? theme.palette.success.main
                      : theme.palette.primary.main,
                    0.06
                  ),
                  border: `1px solid ${alpha(
                    rateInsights.color === 'success'
                      ? theme.palette.success.main
                      : theme.palette.primary.main,
                    0.15
                  )}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {rateInsights.matchChance === 'Very High' ? (
                  <TrendingUp sx={{ fontSize: 18, color: theme.palette.success.main }} />
                ) : (
                  <Target size={18} color={theme.palette.primary.main} strokeWidth={2} />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.4,
                    }}
                  >
                    {rateInsights.message}
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}
          </Box>

        {/* Minimal Input Field - Subtle & Clean */}
        <TextField
          id="expectedHourlyRate"
          name="expectedHourlyRate"
          placeholder="0.00"
          type="number"
          fullWidth
          required={VALIDATION_RULES.expectedHourlyRate.required}
          value={expectedHourlyRate || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          error={hasError}
          inputProps={{
            min: VALIDATION_RULES.expectedHourlyRate.min,
            max: VALIDATION_RULES.expectedHourlyRate.max,
            step: 0.5,
            'aria-label': 'Expected hourly rate in Australian dollars',
            'aria-required': VALIDATION_RULES.expectedHourlyRate.required,
            'aria-invalid': hasError,
            'aria-describedby': hasError ? 'expectedHourlyRate-error' : undefined,
          }}
          onWheel={(e) => e.target.blur()}
          disabled={disabled}
          InputProps={{
            startAdornment: (
              <InputAdornment 
                position="start"
                sx={{
                  mr: 1,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography 
                  component="span"
                  sx={{ 
                    fontWeight: 500, 
                    color: hasError 
                      ? theme.palette.error.main 
                      : isFocused
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary, 
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    transition: 'color 0.2s ease',
                  }}
                >
                  AUD $
                </Typography>
              </InputAdornment>
            ),
            endAdornment: isValid && hasInteracted && (
              <InputAdornment position="end">
                <CheckCircle
                  sx={{
                    fontSize: 20,
                    color: theme.palette.success.main,
                  }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: hasError 
                ? alpha(theme.palette.error.main, 0.04)
                : alpha(theme.palette.grey[50], 0.6),
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              height: { xs: '48px', sm: '52px' },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& fieldset': {
                borderColor: hasError
                  ? alpha(theme.palette.error.main, 0.2)
                  : alpha(theme.palette.divider, 0.1),
                borderWidth: '1px',
                transition: 'all 0.2s ease',
              },
              '&:hover': {
                bgcolor: hasError
                  ? alpha(theme.palette.error.main, 0.06)
                  : alpha(theme.palette.grey[100], 0.8),
                '& fieldset': {
                  borderColor: hasError
                    ? alpha(theme.palette.error.main, 0.3)
                    : alpha(theme.palette.primary.main, 0.15),
                },
              },
              '&.Mui-focused': {
                bgcolor: 'background.paper',
                boxShadow: hasError
                  ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.08)}`
                  : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.08)}`,
                '& fieldset': {
                  borderColor: hasError 
                    ? theme.palette.error.main
                    : theme.palette.primary.main,
                  borderWidth: '1.5px',
                },
              },
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.grey[50], 0.5),
                cursor: 'not-allowed',
              },
            },
            '& .MuiInputBase-input': {
              fontWeight: 500,
              color: theme.palette.text.primary,
              padding: { xs: '14px 0', sm: '16px 0' },
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              '&::placeholder': {
                color: alpha(theme.palette.text.secondary, 0.4),
                opacity: 1,
                fontWeight: 400,
              },
              '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '&[type=number]': { MozAppearance: 'textfield' },
            },
          }}
        />

        {/* Minimal Helper Text */}
        <Box sx={{ mt: 1, minHeight: 20 }}>
          {errorMessage && (
            <Fade in={Boolean(errorMessage)}>
              <FormHelperText
                id="expectedHourlyRate-error"
                error
                sx={{
                  m: 0,
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontWeight: 400,
                }}
                role="alert"
              >
                <ErrorOutline sx={{ fontSize: 16 }} />
                {errorMessage}
              </FormHelperText>
            </Fade>
          )}

          {!errorMessage && !hasValue && (
            <FormHelperText
              sx={{
                m: 0,
                fontSize: '0.75rem',
                color: theme.palette.text.disabled,
                fontWeight: 400,
              }}
            >
              Range: ${VALIDATION_RULES.expectedHourlyRate.min} - ${VALIDATION_RULES.expectedHourlyRate.max}/hour
            </FormHelperText>
          )}
        </Box>
      </FormControl>
      </Box>
    </Box>
  );
};

ExpectedHourlyRate.propTypes = {
  disabled: PropTypes.bool,
  onValidationChange: PropTypes.func,
  showErrors: PropTypes.bool,
};

export default ExpectedHourlyRate;
