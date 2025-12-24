import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import useOnboardingStore from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';

// Validation constants
const VALIDATION_RULES = {
  expectedHourlyRate: {
    min: 20,
    max: 100,
    required: true,
  },
};

/**
 * ExpectedHourlyRate Component
 * 
 * Premium, production-ready hourly rate input component with:
 * - Real-time validation
 * - Consolidated error handling
 * - Responsive design
 * - Optimized performance
 * 
 * Features:
 * - Validates minimum and maximum rate
 * - Shows inline error messages
 * - Handles number input with proper formatting
 * - Prevents wheel scroll on number input
 */
const ExpectedHourlyRate = ({
  disabled = false,
  onValidationChange,
  showErrors = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get state and actions from store
  const expectedHourlyRate = useOnboardingStore(
    (state) => state.profile.expectedHourlyRate,
    shallow
  );
  const updateProfile = useOnboardingStore((state) => state.updateProfile);

  // Validation function
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
        errors.push(`Expected Hourly Rate must be above $${VALIDATION_RULES.expectedHourlyRate.min}`);
      } else if (rateValue > VALIDATION_RULES.expectedHourlyRate.max) {
        errors.push(`Hourly rate must not exceed $${VALIDATION_RULES.expectedHourlyRate.max}`);
      }
    }

    return errors;
  }, []);

  // Notify parent of validation changes
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

  // Handle input change
  const handleChange = useCallback((e) => {
    const { value } = e.target;
    const processedValue = value === '' ? null : parseFloat(value) || 0;

    updateProfile({ expectedHourlyRate: processedValue });
    
    // Notify parent of validation change
    notifyValidation(processedValue);
  }, [updateProfile, notifyValidation]);

  // Validate on mount and when rate changes
  useEffect(() => {
    notifyValidation(expectedHourlyRate);
  }, [expectedHourlyRate, notifyValidation]);

  // Get error message
  const errorMessage = React.useMemo(() => {
    if (!showErrors) return null;
    const errors = validateRate(expectedHourlyRate);
    return errors.length > 0 ? errors[0] : null;
  }, [showErrors, expectedHourlyRate, validateRate]);

  return (
    <Box sx={{ flexShrink: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 2, md: 2 } }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.12) 0%, rgba(34, 197, 94, 0.12) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 1.5,
            boxShadow: '0 2px 8px rgba(74, 222, 128, 0.15)'
          }}
        >
          <Typography sx={{ fontSize: '1.2rem' }}>💰</Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={600} 
            color="text.primary" 
            sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, mb: 0.5 }}
          >
            Expected Hourly Rate
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}
          >
            Set your preferred hourly rate in AUD
          </Typography>
        </Box>
      </Box>

      {/* Input Field */}
      <TextField
        id="expectedHourlyRate"
        name="expectedHourlyRate"
        label="Your hourly rate"
        type="number"
        fullWidth
        required={VALIDATION_RULES.expectedHourlyRate.required}
        value={expectedHourlyRate || ''}
        onChange={handleChange}
        error={Boolean(errorMessage)}
        inputProps={{
          min: VALIDATION_RULES.expectedHourlyRate.min,
          max: VALIDATION_RULES.expectedHourlyRate.max,
          step: 0.5,
        }}
        onWheel={(e) => e.target.blur()}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Typography sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1rem' }}>
                $
              </Typography>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            backgroundColor: '#fafafa',
            fontSize: '1rem',
            height: '48px',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            '&.Mui-focused': {
              backgroundColor: 'white',
            }
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.9rem',
            fontWeight: 500
          }
        }}
      />

      {/* Error Message */}
      {errorMessage && (
        <Typography 
          variant="caption" 
          color="error" 
          sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}
        >
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

ExpectedHourlyRate.propTypes = {
  disabled: PropTypes.bool,
  onValidationChange: PropTypes.func,
  showErrors: PropTypes.bool,
};

export default ExpectedHourlyRate;

