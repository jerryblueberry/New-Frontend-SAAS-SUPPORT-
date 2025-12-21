import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  CircularProgress,
  Zoom,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  CheckCircle,
  ErrorOutline,
  LockOpen,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { useAuth } from '../../context/AuthContext';

const REMEMBER_ME_KEY = 'rememberedEmail';

const CustomLoadingSpinner = ({ size = 20 }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
    <CircularProgress size={size} thickness={4} sx={{ color: 'inherit', position: 'absolute', '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
  </Box>
);

const SuccessCheckmark = () => (
  <Zoom in>
    <CheckCircle sx={{ fontSize: 16, color: '#10b981', opacity: 0.9 }} />
  </Zoom>
);

const LoginForm = ({ onSubmit, setEmailInputRef, loading, error, onInputChange, portal = 'worker' }) => {
  const { signIn } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const getRememberedEmail = () => {
    try {
      return localStorage.getItem(REMEMBER_ME_KEY) || '';
    } catch (error) {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    email: getRememberedEmail(),
    password: '',
    rememberMe: !!getRememberedEmail(),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [fieldStatus, setFieldStatus] = useState({ email: null, password: null });
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (formData.email && !validationErrors.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setFieldStatus(prev => ({ ...prev, email: emailRegex.test(formData.email) ? 'valid' : null }));
    } else {
      setFieldStatus(prev => ({ ...prev, email: null }));
    }
  }, [formData.email, validationErrors.email]);

  useEffect(() => {
    setFieldStatus(prev => ({ ...prev, password: formData.password && formData.password.length >= 1 && !validationErrors.password ? 'valid' : null }));
  }, [formData.password, validationErrors.password]);

  useEffect(() => {
    try {
      if (formData.rememberMe && formData.email) {
        localStorage.setItem(REMEMBER_ME_KEY, formData.email);
      } else if (!formData.rememberMe) {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    } catch (error) {
      console.warn('Failed to save remember me preference:', error);
    }
  }, [formData.rememberMe, formData.email]);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.email, formData.password]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (onInputChange) onInputChange();
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [onInputChange, validationErrors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const form = e.target;
      form.classList.add('shake-form');
      setTimeout(() => form.classList.remove('shake-form'), 600);
      return;
    }
    setIsSubmitting(true);
    try {
      // Call onSubmit with credentials including portal for parent to handle
      const credentialsWithPortal = { ...formData, portal };
      if (onSubmit) {
        await onSubmit(credentialsWithPortal);
      }
    } catch (err) {
      console.error('Login error:', err);
      if (onSubmit) onSubmit({ ...formData, portal }, err);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit, portal]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const isLoading = useMemo(() => loading || isSubmitting, [loading, isSubmitting]);

  const inputFontSize = isMobile ? '16px' : '16px';
  const labelFontSize = isMobile ? '0.875rem' : '0.9375rem';

  const colorPalette = useMemo(() => ({
    primary: theme.palette.primary.main,
    primaryDark: theme.palette.primary.dark,
    success: '#10b981',
    error: '#ef4444',
    text: theme.palette.text.primary,
    textSecondary: theme.palette.text.secondary,
    background: theme.palette.background.paper,
    border: theme.palette.divider,
  }), [theme]);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }} aria-label="Login form">
      <TextField
        fullWidth
        id="email"
        name="email"
        type="email"
        label="Email"
        value={formData.email}
        onChange={handleChange}
        onFocus={() => setFocusedField('email')}
        onBlur={() => setFocusedField(null)}
        inputRef={setEmailInputRef}
        autoComplete="email"
        required
        disabled={isLoading}
        error={!!validationErrors.email}
        helperText={validationErrors.email}
        placeholder="you@example.com"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email sx={{ color: validationErrors.email ? colorPalette.error : focusedField === 'email' ? colorPalette.primary : alpha(colorPalette.text, 0.4), fontSize: '1rem', transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </InputAdornment>
          ),
          endAdornment: fieldStatus.email === 'valid' && (
            <InputAdornment position="end">
              <SuccessCheckmark />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: inputFontSize,
            borderRadius: 2,
            backgroundColor: 'transparent',
            transition: theme.transitions.create(['border-color', 'box-shadow'], { duration: 150 }),
            '& fieldset': { borderWidth: '1.5px', borderColor: alpha(colorPalette.border, 0.12), transition: 'all 0.15s ease' },
            '&:hover': { '& fieldset': { borderColor: alpha(colorPalette.text, 0.2) } },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(colorPalette.primary, 0.06)}`, '& fieldset': { borderWidth: '1.5px', borderColor: colorPalette.primary } },
            '&.Mui-error': { animation: 'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)', '& fieldset': { borderColor: colorPalette.error } },
            '&.Mui-disabled': { backgroundColor: alpha(colorPalette.border, 0.02) },
          },
          '& .MuiInputLabel-root': { fontSize: labelFontSize, fontWeight: 500, color: alpha(colorPalette.text, 0.5), '&.Mui-focused': { color: colorPalette.primary, fontWeight: 600 }, '&.Mui-error': { color: colorPalette.error } },
          '& .MuiFormHelperText-root': { fontSize: '0.8125rem', marginTop: 0.75, marginLeft: 0.25, fontWeight: 500 },
        }}
      />

      <TextField
        fullWidth
        id="password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        label="Password"
        value={formData.password}
        onChange={handleChange}
        onFocus={() => setFocusedField('password')}
        onBlur={() => setFocusedField(null)}
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
              {showPassword ? <LockOpen sx={{ color: validationErrors.password ? colorPalette.error : focusedField === 'password' ? colorPalette.primary : alpha(colorPalette.text, 0.4), fontSize: '1rem', transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} /> : <Lock sx={{ color: validationErrors.password ? colorPalette.error : focusedField === 'password' ? colorPalette.primary : alpha(colorPalette.text, 0.4), fontSize: '1rem', transition: 'color 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {fieldStatus.password === 'valid' && !showPassword && <SuccessCheckmark />}
                <Tooltip title={showPassword ? 'Hide' : 'Show'} arrow placement="top">
                  <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={togglePasswordVisibility} onMouseDown={(e) => e.preventDefault()} edge="end" disabled={isLoading} size="small" sx={{ color: alpha(colorPalette.text, 0.4), padding: 0.5, transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { color: colorPalette.text, backgroundColor: alpha(colorPalette.text, 0.04) }, '&:active': { transform: 'scale(0.95)' } }}>
                    {showPassword ? <VisibilityOff sx={{ fontSize: '1rem' }} /> : <Visibility sx={{ fontSize: '1rem' }} />}
                  </IconButton>
                </Tooltip>
              </Box>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: inputFontSize,
            borderRadius: 2,
            backgroundColor: 'transparent',
            transition: theme.transitions.create(['border-color', 'box-shadow'], { duration: 150 }),
            '& fieldset': { borderWidth: '1.5px', borderColor: alpha(colorPalette.border, 0.12), transition: 'all 0.15s ease' },
            '&:hover': { '& fieldset': { borderColor: alpha(colorPalette.text, 0.2) } },
            '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(colorPalette.primary, 0.06)}`, '& fieldset': { borderWidth: '1.5px', borderColor: colorPalette.primary } },
            '&.Mui-error': { animation: 'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)', '& fieldset': { borderColor: colorPalette.error } },
            '&.Mui-disabled': { backgroundColor: alpha(colorPalette.border, 0.02) },
          },
          '& .MuiInputLabel-root': { fontSize: labelFontSize, fontWeight: 500, color: alpha(colorPalette.text, 0.5), '&.Mui-focused': { color: colorPalette.primary, fontWeight: 600 }, '&.Mui-error': { color: colorPalette.error } },
          '& .MuiFormHelperText-root': { fontSize: '0.8125rem', marginTop: 0.75, marginLeft: 0.25, fontWeight: 500 },
        }}
      />

      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <FormControlLabel
          control={<Checkbox checked={formData.rememberMe} onChange={handleChange} name="rememberMe" disabled={isLoading} size="small" sx={{ padding: 0.5, color: alpha(colorPalette.text, 0.3), transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)', '&.Mui-checked': { color: colorPalette.primary }, '&:hover': { backgroundColor: alpha(colorPalette.text, 0.04) } }} />}
          label={<Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: alpha(colorPalette.text, 0.65), userSelect: 'none' }}>Remember me</Typography>}
          sx={{ margin: 0, '& .MuiFormControlLabel-label': { marginLeft: 0.5 } }}
        />
        <Typography component={Link} to="/forgot-password" variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 600, color: colorPalette.primary, textDecoration: 'none', transition: 'opacity 0.15s ease', '&:hover': { opacity: 0.7 } }}>
          Forgot password?
        </Typography>
      </Box>

      <Box sx={{ width: '100%', mt: 1 }}>
        <LoadingButton type="submit" fullWidth variant="contained" loading={isSubmitting} disabled={isLoading} size="large" loadingIndicator={<CustomLoadingSpinner size={22} />} sx={{ py: 1.5, fontSize: '0.9375rem', fontWeight: 600, borderRadius: 2, textTransform: 'none', background: colorPalette.primary, boxShadow: 'none', border: 'none', transition: theme.transitions.create(['opacity', 'transform'], { duration: 150 }), '&:hover': { background: colorPalette.primary, opacity: 0.9, boxShadow: 'none' }, '&:active': { transform: 'scale(0.98)', opacity: 0.85 }, '&:disabled': { background: alpha(colorPalette.text, 0.08), color: alpha(colorPalette.text, 0.3), boxShadow: 'none' }, '& .MuiLoadingButton-loadingIndicator': { color: '#fff' } }}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </LoadingButton>
      </Box>

      <Collapse in={!!error}>
        <Fade in={!!error}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: 2, backgroundColor: alpha(colorPalette.error, 0.06), border: `1px solid ${alpha(colorPalette.error, 0.12)}` }}>
            <ErrorOutline sx={{ fontSize: '1.125rem', color: colorPalette.error, flexShrink: 0, mt: 0.125 }} />
            <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500, color: alpha(colorPalette.text, 0.75), lineHeight: 1.5 }}>
              Invalid email or password. Please check your credentials and try again.
            </Typography>
          </Box>
        </Fade>
      </Collapse>

      <style>{`@keyframes shake { 10%, 90% { transform: translate3d(-2px, 0, 0); } 20%, 80% { transform: translate3d(4px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } } .shake-form { animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97); }`}</style>
    </Box>
  );
};

export default LoginForm;
