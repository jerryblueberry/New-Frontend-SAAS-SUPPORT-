import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse,
  IconButton,
  InputAdornment,
  Divider,
  Checkbox,
  FormControlLabel,
  Stack,
  CircularProgress,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Google as GoogleIcon,
  Phone as PhoneIcon,
  CheckCircle,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'lowercase', label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { id: 'uppercase', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { id: 'number', label: 'One number', test: (pw) => /\d/.test(pw) },
  { id: 'special', label: 'One special character', test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
];

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  passwordRequirements.forEach(req => {
    if (req.test(password)) score++;
  });
  if (score <= 2) return { score, label: 'Weak', color: 'error' };
  if (score === 3) return { score, label: 'Fair', color: 'warning' };
  if (score === 4) return { score, label: 'Good', color: 'info' };
  if (score === 5) return { score, label: 'Strong', color: 'success' };
  return { score, label: '', color: 'transparent' };
};

const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
const validateName = (name) => name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name.trim());

const formatAustralianPhone = (digits) => {
  const cleaned = digits.replace(/\D/g, '').slice(0, 10);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
};

const SuccessCheckmark = () => (
  <Fade in>
    <CheckCircle sx={{ fontSize: 16, color: '#10b981', opacity: 0.9 }} />
  </Fade>
);

const CustomLoadingSpinner = ({ size = 20 }) => (
  <Box sx={{ position: 'relative', display: 'inline-flex', width: size, height: size }}>
    <CircularProgress size={size} thickness={4} sx={{ color: 'inherit', position: 'absolute', '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
  </Box>
);

const RegisterForm = ({ 
  onSubmit, 
  onGoogleRegister,
  loading = false, 
  loadingMessage = 'Creating Account...',
  termsAccepted,
  onTermsChange,
  termsError,
  setTermsError,
  error 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [fieldStatus, setFieldStatus] = useState({});

  const validateField = useCallback((name, value, allData = formData) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (!validateName(value)) return 'Please enter a valid first name';
        break;
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (!validateName(value)) return 'Please enter a valid last name';
        break;
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!validateEmail(value)) return 'Please enter a valid email address';
        break;
      case 'phone': {
        if (!value.trim()) return 'Phone number is required';
        const digits = value.replace(/\D/g, '');
        if (digits.length < 9 || digits.length > 10) return 'Phone number must be 9 or 10 digits';
        break;
      }
      case 'password':
        if (!value) return 'Password is required';
        const strength = getPasswordStrength(value);
        if (strength.score < 3) return 'Password is too weak';
        break;
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== allData.password) return 'Passwords do not match';
        break;
      default:
        break;
    }
    return '';
  }, [formData]);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const passwordMetRequirements = useMemo(() => {
    return passwordRequirements.map(req => ({ ...req, met: req.test(formData.password) }));
  }, [formData.password]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phone') {
      newValue = newValue.replace(/\D/g, '').slice(0, 10);
    }
    const newFormData = { ...formData, [name]: newValue };
    setFormData(newFormData);
    
    if (touched[name]) {
      const error = validateField(name, newValue, newFormData);
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }

    if (name === 'email' && newValue) {
      setFieldStatus(prev => ({ ...prev, email: validateEmail(newValue) ? 'valid' : null }));
    }
    if ((name === 'firstName' || name === 'lastName') && newValue) {
      setFieldStatus(prev => ({ ...prev, [name]: validateName(newValue) ? 'valid' : null }));
    }
    if (name === 'phone' && newValue) {
      const digits = newValue.replace(/\D/g, '');
      setFieldStatus(prev => ({ ...prev, phone: digits.length >= 9 && digits.length <= 10 ? 'valid' : null }));
    }

    if (name === 'password' && value.length > 0 && !showRequirements) {
      setShowRequirements(true);
    }
  }, [formData, touched, validateField, showRequirements]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFocusedField(null);
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleFocus = useCallback((field) => {
    setFocusedField(field);
  }, []);

  const handleTermsChange = (checked) => {
    onTermsChange(checked);
    if (setTermsError) {
      setTermsError('');
    }
    setValidationErrors(prev => ({ ...prev, termsAndConditionsAccepted: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (!termsAccepted) {
      errors.termsAndConditionsAccepted = 'You must agree to the Terms and Conditions';
      if (setTermsError) {
        setTermsError('You must agree to the Terms and Conditions');
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      await onSubmit({ ...formData, termsAndConditionsAccepted: termsAccepted });
    }
  };

  const handleGoogleRegister = () => {
    if (!termsAccepted) {
      const errorMessage = 'You must agree to the Terms and Conditions';
      setValidationErrors(prev => ({ ...prev, termsAndConditionsAccepted: errorMessage }));
      if (setTermsError) {
        setTermsError(errorMessage);
      }
      return;
    }
    setValidationErrors(prev => ({ ...prev, termsAndConditionsAccepted: '' }));
    if (setTermsError) {
      setTermsError('');
    }
    onGoogleRegister();
  };

  const getFieldError = (fieldName) => touched[fieldName] && validationErrors[fieldName];

  const colorPalette = useMemo(() => ({
    primary: theme.palette.primary.main,
    success: '#10b981',
    error: '#ef4444',
    text: theme.palette.text.primary,
    border: theme.palette.divider,
  }), [theme]);

  const inputFontSize = '16px';
  const labelFontSize = '0.875rem';

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
      <Stack spacing={2.5}>
        {/* First Name */}
        <TextField
          fullWidth
          variant="outlined"
          id="firstName"
          name="firstName"
          label="First Name"
          type="text"
          autoComplete="given-name"
          required
          value={formData.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => handleFocus('firstName')}
          error={!!getFieldError('firstName')}
          helperText={getFieldError('firstName')}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: getFieldError('firstName') ? colorPalette.error : focusedField === 'firstName' ? colorPalette.primary : alpha(colorPalette.text, 0.4), fontSize: '1.125rem', transition: 'color 0.2s' }} />
              </InputAdornment>
            ),
            endAdornment: fieldStatus.firstName === 'valid' && <InputAdornment position="end"><SuccessCheckmark /></InputAdornment>,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: inputFontSize,
              borderRadius: 1.5,
              backgroundColor: alpha(colorPalette.text, 0.02),
              transition: theme.transitions.create(['border-color', 'box-shadow', 'background-color'], { duration: 200 }),
              '& fieldset': { borderWidth: '1px', borderColor: alpha(colorPalette.border, 0.2), transition: 'all 0.2s ease' },
              '&:hover': { backgroundColor: alpha(colorPalette.text, 0.03), '& fieldset': { borderColor: alpha(colorPalette.text, 0.3) } },
              '&.Mui-focused': { backgroundColor: '#ffffff', boxShadow: `0 0 0 3px ${alpha(colorPalette.primary, 0.08)}`, '& fieldset': { borderWidth: '2px', borderColor: colorPalette.primary } },
              '&.Mui-error': { '& fieldset': { borderColor: colorPalette.error } },
            },
            '& .MuiInputLabel-root': { fontSize: labelFontSize, fontWeight: 500, color: alpha(colorPalette.text, 0.6), '&.Mui-focused': { color: colorPalette.primary, fontWeight: 600 } },
            '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginTop: 0.5, marginLeft: 0, fontWeight: 500 },
          }}
        />

        {/* Last Name */}
        <TextField
          fullWidth
          variant="outlined"
          id="lastName"
          name="lastName"
          label="Last Name"
          type="text"
          autoComplete="family-name"
          required
          value={formData.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => handleFocus('lastName')}
          error={!!getFieldError('lastName')}
          helperText={getFieldError('lastName')}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: getFieldError('lastName') ? colorPalette.error : focusedField === 'lastName' ? colorPalette.primary : alpha(colorPalette.text, 0.4), fontSize: '1.125rem', transition: 'color 0.2s' }} />
              </InputAdornment>
            ),
            endAdornment: fieldStatus.lastName === 'valid' && <InputAdornment position="end"><SuccessCheckmark /></InputAdornment>,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: inputFontSize,
              borderRadius: 1.5,
              backgroundColor: alpha(colorPalette.text, 0.02),
              transition: theme.transitions.create(['border-color', 'box-shadow', 'background-color'], { duration: 200 }),
              '& fieldset': { borderWidth: '1px', borderColor: alpha(colorPalette.border, 0.2), transition: 'all 0.2s ease' },
              '&:hover': { backgroundColor: alpha(colorPalette.text, 0.03), '& fieldset': { borderColor: alpha(colorPalette.text, 0.3) } },
              '&.Mui-focused': { backgroundColor: '#ffffff', boxShadow: `0 0 0 3px ${alpha(colorPalette.primary, 0.08)}`, '& fieldset': { borderWidth: '2px', borderColor: colorPalette.primary } },
              '&.Mui-error': { '& fieldset': { borderColor: colorPalette.error } },
            },
            '& .MuiInputLabel-root': { fontSize: labelFontSize, fontWeight: 500, color: alpha(colorPalette.text, 0.6), '&.Mui-focused': { color: colorPalette.primary, fontWeight: 600 } },
            '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginTop: 0.5, marginLeft: 0, fontWeight: 500 },
          }}
        />

        {/* Email */}
        <TextField
          fullWidth
          variant="outlined"
          id="email"
          name="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => handleFocus('email')}
          error={!!getFieldError('email')}
          helperText={getFieldError('email')}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: getFieldError('email') ? colorPalette.error : focusedField === 'email' ? colorPalette.primary : alpha(colorPalette.text, 0.4), fontSize: '1.125rem', transition: 'color 0.2s' }} />
              </InputAdornment>
            ),
            endAdornment: fieldStatus.email === 'valid' && <InputAdornment position="end"><SuccessCheckmark /></InputAdornment>,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: inputFontSize,
              borderRadius: 1.5,
              backgroundColor: alpha(colorPalette.text, 0.02),
              transition: theme.transitions.create(['border-color', 'box-shadow', 'background-color'], { duration: 200 }),
              '& fieldset': { borderWidth: '1px', borderColor: alpha(colorPalette.border, 0.2), transition: 'all 0.2s ease' },
              '&:hover': { backgroundColor: alpha(colorPalette.text, 0.03), '& fieldset': { borderColor: alpha(colorPalette.text, 0.3) } },
              '&.Mui-focused': { backgroundColor: '#ffffff', boxShadow: `0 0 0 3px ${alpha(colorPalette.primary, 0.08)}`, '& fieldset': { borderWidth: '2px', borderColor: colorPalette.primary } },
              '&.Mui-error': { '& fieldset': { borderColor: colorPalette.error } },
            },
            '& .MuiInputLabel-root': { fontSize: labelFontSize, fontWeight: 500, color: alpha(colorPalette.text, 0.6), '&.Mui-focused': { color: colorPalette.primary, fontWeight: 600 } },
            '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginTop: 0.5, marginLeft: 0, fontWeight: 500 },
          }}
        />

        {/* Phone */}
        <TextField
          fullWidth
          variant="outlined"
          id="phone"
          name="phone"
          label="Phone Number"
          type="tel"
          autoComplete="tel"
          required
          value={formatAustralianPhone(formData.phone)}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => handleFocus('phone')}
          error={!!getFieldError('phone')}
          helperText={getFieldError('phone')}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon sx={{ color: getFieldError('phone') ? colorPalette.error : focusedField === 'phone' ? colorPalette.primary : alpha(colorPalette.text, 0.4), fontSize: '1.125rem', transition: 'color 0.2s', mr: 0.5 }} />
                <Typography sx={{ fontWeight: 600, color: alpha(colorPalette.text, 0.6), fontSize: '0.875rem' }}>+61</Typography>
              </InputAdornment>
            ),
            endAdornment: fieldStatus.phone === 'valid' && <InputAdornment position="end"><SuccessCheckmark /></InputAdornment>,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: inputFontSize,
              borderRadius: 1.5,
              backgroundColor: alpha(colorPalette.text, 0.02),
              transition: theme.transitions.create(['border-color', 'box-shadow', 'background-color'], { duration: 200 }),
              '& fieldset': { borderWidth: '1px', borderColor: alpha(colorPalette.border, 0.2), transition: 'all 0.2s ease' },
              '&:hover': { backgroundColor: alpha(colorPalette.text, 0.03), '& fieldset': { borderColor: alpha(colorPalette.text, 0.3) } },
              '&.Mui-focused': { backgroundColor: '#ffffff', boxShadow: `0 0 0 3px ${alpha(colorPalette.primary, 0.08)}`, '& fieldset': { borderWidth: '2px', borderColor: colorPalette.primary } },
              '&.Mui-error': { '& fieldset': { borderColor: colorPalette.error } },
            },
            '& .MuiInputLabel-root': { fontSize: labelFontSize, fontWeight: 500, color: alpha(colorPalette.text, 0.6), '&.Mui-focused': { color: colorPalette.primary, fontWeight: 600 } },
            '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginTop: 0.5, marginLeft: 0, fontWeight: 500 },
          }}
          inputProps={{ maxLength: 12, inputMode: 'numeric' }}
        />

        {/* Password */}
        <TextField
          fullWidth
          variant="outlined"
          id="password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => handleFocus('password')}
          error={!!getFieldError('password')}
          helperText={getFieldError('password')}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: getFieldError('password') ? colorPalette.error : focusedField === 'password' ? colorPalette.primary : alpha(colorPalette.text, 0.4), fontSize: '1.125rem', transition: 'color 0.2s' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small" disabled={loading} sx={{ color: alpha(colorPalette.text, 0.5), '&:hover': { color: colorPalette.text, backgroundColor: alpha(colorPalette.text, 0.04) } }}>
                  {showPassword ? <VisibilityOff sx={{ fontSize: '1.125rem' }} /> : <Visibility sx={{ fontSize: '1.125rem' }} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: inputFontSize,
              borderRadius: 1.5,
              backgroundColor: alpha(colorPalette.text, 0.02),
              transition: theme.transitions.create(['border-color', 'box-shadow', 'background-color'], { duration: 200 }),
              '& fieldset': { borderWidth: '1px', borderColor: alpha(colorPalette.border, 0.2), transition: 'all 0.2s ease' },
              '&:hover': { backgroundColor: alpha(colorPalette.text, 0.03), '& fieldset': { borderColor: alpha(colorPalette.text, 0.3) } },
              '&.Mui-focused': { backgroundColor: '#ffffff', boxShadow: `0 0 0 3px ${alpha(colorPalette.primary, 0.08)}`, '& fieldset': { borderWidth: '2px', borderColor: colorPalette.primary } },
              '&.Mui-error': { '& fieldset': { borderColor: colorPalette.error } },
            },
            '& .MuiInputLabel-root': { fontSize: labelFontSize, fontWeight: 500, color: alpha(colorPalette.text, 0.6), '&.Mui-focused': { color: colorPalette.primary, fontWeight: 600 } },
            '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginTop: 0.5, marginLeft: 0, fontWeight: 500 },
          }}
        />

        {/* Password Strength */}
        {formData.password && (
          <Box sx={{ mt: -1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LinearProgress variant="determinate" value={(passwordStrength.score / 5) * 100} color={passwordStrength.color} sx={{ flexGrow: 1, height: 3, borderRadius: 2 }} />
              <Typography variant="caption" color={`${passwordStrength.color}.main`} sx={{ fontWeight: 600, fontSize: '0.6875rem', minWidth: 'fit-content' }}>
                {passwordStrength.label}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Confirm Password */}
        <TextField
          fullWidth
          variant="outlined"
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => handleFocus('confirmPassword')}
          error={!!getFieldError('confirmPassword')}
          helperText={getFieldError('confirmPassword')}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOpenIcon sx={{ color: getFieldError('confirmPassword') ? colorPalette.error : focusedField === 'confirmPassword' ? colorPalette.primary : alpha(colorPalette.text, 0.4), fontSize: '1.125rem', transition: 'color 0.2s' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small" disabled={loading} sx={{ color: alpha(colorPalette.text, 0.5), '&:hover': { color: colorPalette.text, backgroundColor: alpha(colorPalette.text, 0.04) } }}>
                  {showConfirmPassword ? <VisibilityOff sx={{ fontSize: '1.125rem' }} /> : <Visibility sx={{ fontSize: '1.125rem' }} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: inputFontSize,
              borderRadius: 1.5,
              backgroundColor: alpha(colorPalette.text, 0.02),
              transition: theme.transitions.create(['border-color', 'box-shadow', 'background-color'], { duration: 200 }),
              '& fieldset': { borderWidth: '1px', borderColor: alpha(colorPalette.border, 0.2), transition: 'all 0.2s ease' },
              '&:hover': { backgroundColor: alpha(colorPalette.text, 0.03), '& fieldset': { borderColor: alpha(colorPalette.text, 0.3) } },
              '&.Mui-focused': { backgroundColor: '#ffffff', boxShadow: `0 0 0 3px ${alpha(colorPalette.primary, 0.08)}`, '& fieldset': { borderWidth: '2px', borderColor: colorPalette.primary } },
              '&.Mui-error': { '& fieldset': { borderColor: colorPalette.error } },
            },
            '& .MuiInputLabel-root': { fontSize: labelFontSize, fontWeight: 500, color: alpha(colorPalette.text, 0.6), '&.Mui-focused': { color: colorPalette.primary, fontWeight: 600 } },
            '& .MuiFormHelperText-root': { fontSize: '0.75rem', marginTop: 0.5, marginLeft: 0, fontWeight: 500 },
          }}
        />

        {/* Password Requirements */}
        <Collapse in={showRequirements && formData.password.length > 0}>
          <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: alpha(colorPalette.text, 0.02), border: `1px solid ${alpha(colorPalette.border, 0.15)}` }}>
            <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block', color: alpha(colorPalette.text, 0.7), fontSize: '0.75rem' }}>
              Password must contain:
            </Typography>
            <List dense disablePadding>
              {passwordMetRequirements.map((req) => (
                <ListItem key={req.id} disablePadding sx={{ py: 0.125 }}>
                  <ListItemIcon sx={{ minWidth: 24 }}>
                    {req.met ? <CheckCircleIcon sx={{ fontSize: 14, color: colorPalette.success }} /> : <CancelIcon sx={{ fontSize: 14, color: alpha(colorPalette.text, 0.25) }} />}
                  </ListItemIcon>
                  <ListItemText
                    primary={req.label}
                    primaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: req.met ? colorPalette.success : alpha(colorPalette.text, 0.5),
                      fontWeight: req.met ? 500 : 400,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>

        {/* Terms */}
        <FormControlLabel
          control={
            <Checkbox 
              checked={termsAccepted} 
              onChange={(e) => handleTermsChange(e.target.checked)}
              size="small"
              sx={{ color: alpha(colorPalette.text, 0.3), '&.Mui-checked': { color: colorPalette.primary } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 400, color: alpha(colorPalette.text, 0.7), lineHeight: 1.5 }}>
              I agree to the{' '}
              <Link href="/terms-and-conditions" target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} sx={{ fontWeight: 600, color: colorPalette.primary, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Terms and Conditions
              </Link>
            </Typography>
          }
          sx={{ margin: 0, alignItems: 'flex-start' }}
        />
        {(termsError || validationErrors.termsAndConditionsAccepted) && (
          <Typography variant="caption" sx={{ color: colorPalette.error, fontSize: '0.75rem', fontWeight: 500, mt: -2 }}>
            {termsError || validationErrors.termsAndConditionsAccepted}
          </Typography>
        )}

        {/* Submit */}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          loading={loading}
          disabled={loading}
          size="large"
          loadingIndicator={<CustomLoadingSpinner size={20} />}
          sx={{
            mt: 1,
            py: 1.75,
            fontSize: '0.9375rem',
            fontWeight: 600,
            borderRadius: 1.5,
            textTransform: 'none',
            background: colorPalette.primary,
            boxShadow: `0 1px 2px ${alpha('#000', 0.05)}`,
            transition: 'all 0.2s',
            '&:hover': { background: colorPalette.primary, boxShadow: `0 2px 4px ${alpha('#000', 0.1)}`, transform: 'translateY(-1px)' },
            '&:active': { transform: 'translateY(0)' },
            '&:disabled': { background: alpha(colorPalette.text, 0.12), color: alpha(colorPalette.text, 0.4) },
          }}
        >
          {loading ? loadingMessage : 'Create Account'}
        </LoadingButton>

        {/* Divider */}
        <Divider sx={{ my: 2, '&::before, &::after': { borderColor: alpha(colorPalette.border, 0.15) } }}>
          <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: alpha(colorPalette.text, 0.4), textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', px: 2 }}>
            Or
          </Typography>
        </Divider>

        {/* Google */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleRegister}
          disabled={loading}
          size="large"
          startIcon={<GoogleIcon sx={{ fontSize: '1.125rem' }} />}
          sx={{
            py: 1.75,
            fontSize: '0.9375rem',
            fontWeight: 600,
            borderRadius: 1.5,
            textTransform: 'none',
            borderWidth: '1px',
            borderColor: alpha(colorPalette.border, 0.2),
            color: alpha(colorPalette.text, 0.8),
            background: '#ffffff',
            transition: 'all 0.2s',
            '&:hover': { borderWidth: '1px', borderColor: alpha(colorPalette.text, 0.3), background: alpha(colorPalette.text, 0.02), boxShadow: `0 1px 2px ${alpha('#000', 0.05)}` },
          }}
        >
          Continue with Google
        </Button>
      </Stack>
    </Box>
  );
};

export default RegisterForm;
