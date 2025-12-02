import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ErrorOutline,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useAuth } from '../../context/AuthContext';

const LoginForm = ({ onSubmit, setEmailInputRef, loading, error, onInputChange }) => {
  const { signIn } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Memoized validation function - Only basic validation for login
  // Password pattern validation is handled by backend, we just show generic error
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.email, formData.password]);

  // Optimized change handler
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (onInputChange) {
      onInputChange();
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  }, [onInputChange, validationErrors]);

  // Form submission handler
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await signIn(formData);
      if (onSubmit) onSubmit(formData);
    } catch (err) {
      console.error('Login error:', err);
      if (onSubmit) onSubmit(formData, err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, signIn, onSubmit]);

  // Password visibility toggle
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Memoized loading state
  const isLoading = useMemo(() => 
    loading || isSubmitting,
    [loading, isSubmitting]
  );

  // Responsive font sizes
  const inputFontSize = useMemo(() => {
    if (isMobile) return '16px'; // Prevent zoom on iOS
    if (isTablet) return '15px';
    return '16px';
  }, [isMobile, isTablet]);

  const labelFontSize = useMemo(() => {
    if (isMobile) return '0.875rem';
    return '0.9375rem';
  }, [isMobile]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, sm: 2.5, md: 3 },
      }}
      aria-label="Login form"
    >
      {/* Email Field */}
      <Box sx={{ width: '100%' }}>
        <TextField
          fullWidth
          id="email"
          name="email"
          type="email"
          label="Email address"
          value={formData.email}
          onChange={handleChange}
          inputRef={setEmailInputRef}
          autoComplete="email"
          required
          disabled={isLoading}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
          placeholder="Enter your email"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email 
                  sx={{ 
                    color: validationErrors.email 
                      ? theme.palette.error.main 
                      : theme.palette.text.secondary,
                    fontSize: { xs: '1.125rem', sm: '1.25rem' }
                  }} 
                />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: inputFontSize,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.8)
                : theme.palette.background.paper,
              transition: theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.9)
                  : alpha(theme.palette.primary.main, 0.02),
                transform: 'translateY(-1px)',
              },
              '&.Mui-focused': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
              },
              '&.Mui-error': {
                animation: 'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: labelFontSize,
              fontWeight: 500,
            },
            '& .MuiFormHelperText-root': {
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              marginTop: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            },
          }}
          FormHelperTextProps={{
            sx: {
              '&::before': validationErrors.email ? {
                content: '"⚠"',
                marginRight: 0.5,
              } : {},
            },
          }}
        />
      </Box>

      {/* Password Field */}
      <Box sx={{ width: '100%' }}>
        <TextField
          fullWidth
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
          disabled={isLoading}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
          placeholder="Enter your password"
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock 
                  sx={{ 
                    color: validationErrors.password 
                      ? theme.palette.error.main 
                      : theme.palette.text.secondary,
                    fontSize: { xs: '1.125rem', sm: '1.25rem' }
                  }} 
                />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={togglePasswordVisibility}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                  disabled={isLoading}
                  sx={{
                    color: theme.palette.text.secondary,
                    padding: { xs: 0.75, sm: 1 },
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.primary.main,
                    },
                    '&:focus': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    },
                  }}
                >
                  {showPassword ? (
                    <VisibilityOff sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
                  ) : (
                    <Visibility sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: inputFontSize,
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.8)
                : theme.palette.background.paper,
              transition: theme.transitions.create(['border-color', 'box-shadow', 'transform'], {
                duration: theme.transitions.duration.shorter,
              }),
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.paper, 0.9)
                  : alpha(theme.palette.primary.main, 0.02),
                transform: 'translateY(-1px)',
              },
              '&.Mui-focused': {
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
              },
              '&.Mui-error': {
                animation: 'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: labelFontSize,
              fontWeight: 500,
            },
            '& .MuiFormHelperText-root': {
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              marginTop: 0.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            },
          }}
          FormHelperTextProps={{
            sx: {
              '&::before': validationErrors.password ? {
                content: '"⚠"',
                marginRight: 0.5,
              } : {},
            },
          }}
        />
      </Box>

      {/* Remember Me Checkbox */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.rememberMe}
              onChange={handleChange}
              name="rememberMe"
              disabled={isLoading}
              sx={{
                color: theme.palette.primary.main,
                '&.Mui-checked': {
                  color: theme.palette.primary.main,
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                fontWeight: 400,
                color: theme.palette.text.secondary,
                userSelect: 'none',
              }}
            >
              Remember me
            </Typography>
          }
          sx={{
            margin: 0,
            '& .MuiFormControlLabel-label': {
              marginLeft: 1,
            },
          }}
        />
      </Box>

      {/* Submit Button */}
      <Box sx={{ width: '100%', mt: { xs: 0.5, sm: 1 } }}>
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          loading={isSubmitting}
          disabled={isLoading}
          size="large"
          sx={{
            py: { xs: 1.25, sm: 1.5 },
            fontSize: { xs: '1rem', sm: '1.0625rem' },
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: theme.transitions.create(['transform', 'box-shadow'], {
              duration: theme.transitions.duration.shorter,
            }),
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              background: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
            '& .MuiCircularProgress-root': {
              color: theme.palette.common.white,
            },
          }}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </LoadingButton>
      </Box>

      {/* Forgot Password Link */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: { xs: 0.5, sm: 1 },
        }}
      >
        <Typography
          component={Link}
          to="/forgot-password"
          variant="body2"
          sx={{
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            fontWeight: 500,
            color: theme.palette.primary.main,
            textDecoration: 'none',
            transition: theme.transitions.create(['color', 'text-decoration'], {
              duration: theme.transitions.duration.shorter,
            }),
            '&:hover': {
              color: theme.palette.primary.dark,
              textDecoration: 'underline',
            },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
              borderRadius: 1,
            },
          }}
        >
          Forgot your password?
        </Typography>
      </Box>

      {/* Error Display - Generic message for security */}
      {error && (
        <Fade in={!!error}>
          <Alert
            severity="error"
            icon={<ErrorOutline />}
            sx={{
              borderRadius: 2,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              '& .MuiAlert-icon': {
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
              },
            }}
            onClose={() => {}}
          >
            Invalid email or password. Please check your credentials and try again.
          </Alert>
        </Fade>
      )}

      {/* Shake Animation */}
      <style>
        {`
          @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-2px, 0, 0); }
            40%, 60% { transform: translate3d(2px, 0, 0); }
          }
        `}
      </style>
    </Box>
  );
};

export default LoginForm;
