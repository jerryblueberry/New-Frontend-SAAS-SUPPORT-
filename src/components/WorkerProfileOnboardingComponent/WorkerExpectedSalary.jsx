/**
 * WorkerExpectedSalary Component - Modern SaaS Design
 * 
 * Features:
 * - Clean, minimal Apple-inspired design
 * - Smooth animations and transitions
 * - Inline error validation
 * - Enhanced UX with visual feedback
 * - Mobile-first responsive design
 * - Accessibility compliant
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  InputAdornment,
  Chip,
  Fade,
  Zoom,
  Alert,
} from '@mui/material';
import { useWorkerProfileStore, profileSelectors } from '../../stores/workerOnboardingStores';

// Validation constants
const VALIDATION_RULES = {
  expectedHourlyRate: {
    min: 20,
    max: 100,
    required: true,
  },
};

// Modern Section Header with Apple-inspired design
const SectionHeader = ({ icon, title, subtitle, required = false }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
      <Zoom in timeout={300}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.25)',
          }}
        >
          <Typography sx={{ fontSize: '1.5rem' }}>{icon}</Typography>
        </Box>
      </Zoom>
      
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            {title}
          </Typography>
          {required && (
            <Chip 
              label="Required" 
              size="small" 
              sx={{ 
                height: 22,
                fontSize: '0.688rem',
                fontWeight: 600,
                bgcolor: '#fef3f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                '& .MuiChip-label': { px: 1.5 },
              }} 
            />
          )}
        </Box>
        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              mt: 0.5,
              color: '#64748b',
              fontSize: { xs: '0.875rem', sm: '0.938rem' },
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  </Box>
);

const WorkerExpectedSalary = React.memo(({ 
  error: salaryError, 
  isPending = false,
  onSalaryChange,
  onValidationChange,
}) => {
  const storeExpectedHourlyRate = useWorkerProfileStore(profileSelectors.expectedHourlyRate);
  const updateProfile = useWorkerProfileStore((state) => state.updateProfile);

  const [expectedHourlyRate, setExpectedHourlyRate] = useState(storeExpectedHourlyRate || '');
  const [localError, setLocalError] = useState('');
  const [touched, setTouched] = useState(false);
  const salaryInitialized = React.useRef(false);

  // Initialize from store
  useEffect(() => {
    if (!salaryInitialized.current && storeExpectedHourlyRate) {
      setExpectedHourlyRate(storeExpectedHourlyRate);
      salaryInitialized.current = true;
    }
  }, []);

  // Sync with store
  useEffect(() => {
    if (salaryInitialized.current && storeExpectedHourlyRate !== expectedHourlyRate) {
      setExpectedHourlyRate(storeExpectedHourlyRate || '');
    }
  }, [storeExpectedHourlyRate]);

  // Validate expected hourly rate
  const validateSalary = useCallback((value, shouldSetLocal = false) => {
    const errors = {};
    let errorMessage = '';

    if (!value && value !== 0) {
      errorMessage = 'Please enter your expected hourly rate';
      errors.expectedHourlyRate = errorMessage;
    } else {
      const rate = parseFloat(value);
      if (isNaN(rate)) {
        errorMessage = 'Please enter a valid number';
        errors.expectedHourlyRate = errorMessage;
      } else if (rate < VALIDATION_RULES.expectedHourlyRate.min) {
        errorMessage = `Minimum rate is $${VALIDATION_RULES.expectedHourlyRate.min}/hour`;
        errors.expectedHourlyRate = errorMessage;
      } else if (rate > VALIDATION_RULES.expectedHourlyRate.max) {
        errorMessage = `Maximum rate is $${VALIDATION_RULES.expectedHourlyRate.max}/hour`;
        errors.expectedHourlyRate = errorMessage;
      }
    }

    if (shouldSetLocal) {
      setLocalError(errorMessage);
    }

    if (onValidationChange) {
      onValidationChange(errors);
    }

    return errors;
  }, [onValidationChange]);

  // Handle salary change
  const handleSalaryChange = useCallback((e) => {
    const { value } = e.target;
    const processedValue = value === '' ? '' : parseFloat(value) || 0;

    setExpectedHourlyRate(processedValue);
    updateProfile({ expectedHourlyRate: processedValue });

    // Real-time validation if field has been touched
    if (touched) {
      validateSalary(processedValue, true);
    }

    if (onSalaryChange) {
      onSalaryChange(processedValue);
    }
  }, [updateProfile, validateSalary, onSalaryChange, touched]);

  // Handle blur
  const handleBlur = useCallback(() => {
    setTouched(true);
    validateSalary(expectedHourlyRate, true);
  }, [expectedHourlyRate, validateSalary]);

  // Handle focus
  const handleFocus = useCallback(() => {
    if (!touched) {
      setLocalError('');
    }
  }, [touched]);

  const displayError = salaryError || localError;
  const hasError = Boolean(displayError) && touched;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #f1f5f9',
        background: '#ffffff',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: '#e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <SectionHeader
          icon="💰"
          title="Expected Hourly Rate"
          subtitle="Set your preferred hourly rate to help match you with suitable opportunities"
          required={true}
        />

        <Box sx={{ position: 'relative' }}>
          <TextField
            id="expectedHourlyRate"
            name="expectedHourlyRate"
            label="Hourly Rate"
            type="number"
            fullWidth
            required
            value={expectedHourlyRate || ''}
            onChange={handleSalaryChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            error={hasError}
            disabled={isPending}
            placeholder="Enter your rate"
            inputProps={{
              min: VALIDATION_RULES.expectedHourlyRate.min,
              max: VALIDATION_RULES.expectedHourlyRate.max,
              step: 0.5,
            }}
            onWheel={(e) => e.target.blur()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '1.125rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    $
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                backgroundColor: '#fafbfc',
                fontSize: '1rem',
                fontWeight: 500,
                height: { xs: 56, sm: 60 },
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px solid transparent',
                '& fieldset': {
                  borderColor: '#e2e8f0',
                  borderWidth: 2,
                },
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  '& fieldset': {
                    borderColor: '#cbd5e1',
                  },
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
                  '& fieldset': {
                    borderColor: '#667eea',
                  },
                },
                '&.Mui-error': {
                  borderColor: '#ef4444',
                  '& fieldset': {
                    borderColor: '#ef4444',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 4px rgba(239, 68, 68, 0.1)',
                  },
                },
                '&.Mui-disabled': {
                  backgroundColor: '#f1f5f9',
                  opacity: 0.6,
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.938rem',
                fontWeight: 500,
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#667eea',
                  fontWeight: 600,
                },
                '&.Mui-error': {
                  color: '#ef4444',
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                fontWeight: 500,
                color: '#0f172a',
                '&::placeholder': {
                  color: '#94a3b8',
                  opacity: 1,
                },
              },
            }}
          />

          {/* Inline Error Message */}
          <Fade in={hasError} timeout={200}>
            <Box sx={{ mt: 1.5 }}>
              {hasError && (
                <Alert 
                  severity="error"
                  sx={{
                    py: 1,
                    px: 1.5,
                    borderRadius: 2,
                    bgcolor: '#fef2f2',
                    border: '1px solid #fecaca',
                    '& .MuiAlert-icon': {
                      color: '#dc2626',
                      fontSize: '1.125rem',
                    },
                    '& .MuiAlert-message': {
                      color: '#991b1b',
                      fontSize: '0.813rem',
                      fontWeight: 500,
                      padding: 0,
                    },
                  }}
                >
                  {displayError}
                </Alert>
              )}
            </Box>
          </Fade>

          {/* Success State Info */}
          {!hasError && expectedHourlyRate && (
            <Fade in timeout={300}>
              <Box 
                sx={{ 
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: '1rem' }}>✓</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      sx={{ 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#166534',
                        mb: 0.25,
                      }}
                    >
                      Rate Set Successfully
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontSize: '0.813rem',
                        color: '#15803d',
                        lineHeight: 1.4,
                      }}
                    >
                      ${expectedHourlyRate} AUD per hour
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Helper Text */}
          <Box 
            sx={{ 
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
              <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>💡</Typography>
              <Box>
                <Typography 
                  sx={{ 
                    fontSize: '0.813rem',
                    color: '#475569',
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  Acceptable Range
                </Typography>
                <Typography 
                  sx={{ 
                    fontSize: '0.813rem',
                    color: '#64748b',
                    lineHeight: 1.5,
                  }}
                >
                  ${VALIDATION_RULES.expectedHourlyRate.min} - ${VALIDATION_RULES.expectedHourlyRate.max} AUD per hour
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

WorkerExpectedSalary.displayName = 'WorkerExpectedSalary';

export default WorkerExpectedSalary;

