import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Link,
  useTheme,
  useMediaQuery,
  Fade,
  Collapse,
  IconButton,
  InputAdornment,
  Divider,
  Paper,
  Checkbox,
  FormControlLabel,
  Stack
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
  Phone as PhoneIcon
} from '@mui/icons-material';

const passwordRequirements = [
  { 
    id: 'length', 
    label: 'At least 8 characters', 
    test: (pw) => pw.length >= 8 
  },
  { 
    id: 'lowercase', 
    label: 'One lowercase letter', 
    test: (pw) => /[a-z]/.test(pw) 
  },
  { 
    id: 'uppercase', 
    label: 'One uppercase letter', 
    test: (pw) => /[A-Z]/.test(pw) 
  },
  { 
    id: 'number', 
    label: 'One number', 
    test: (pw) => /\d/.test(pw) 
  },
  { 
    id: 'special', 
    label: 'One special character', 
    test: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) 
  }
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

const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validateName = (name) => {
  return name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name.trim());
};

const formatAustralianPhone = (digits) => {
  // Format as 123 456 789 or 123 456 7890
  const cleaned = digits.replace(/\D/g, '').slice(0, 10);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
};

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
    phone: '', // Only digits, no +61
    password: '',
    confirmPassword: '',
    termsAccepted:'',
    });

  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const validateField = useCallback((name, value, allData = formData) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (!validateName(value)) return 'Please enter a valid first name (letters only, 2+ characters)';
        break;
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (!validateName(value)) return 'Please enter a valid last name (letters only, 2+ characters)';
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
        if (strength.score < 3) return 'Password is too weak. Please meet more requirements.';
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
    return passwordRequirements.map(req => ({
      ...req,
      met: req.test(formData.password)
    }));
  }, [formData.password]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phone') {
      // Only allow numbers, max 10 digits
      newValue = newValue.replace(/\D/g, '').slice(0, 10);
    }
    const newFormData = { ...formData, [name]: newValue };
    setFormData(newFormData);
    
    if (touched[name]) {
      const error = validateField(name, newValue, newFormData);
      setValidationErrors(prev => ({ ...prev, [name]: error }));
    }

    if (name === 'password' && value.length > 0 && !showRequirements) {
      setShowRequirements(true);
    }
  }, [formData, touched, validateField, showRequirements]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleTermsChange = (checked) => {
    onTermsChange(checked);
    // Clear both parent error and local validation error when checkbox is changed
    if (setTermsError) {
      setTermsError('');
    }
    setValidationErrors(prev => ({
      ...prev,
      termsAndConditionsAccepted: ''
    }));
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

    // Terms and Conditions validation
    if (!termsAccepted) {
      errors.termsAndConditionsAccepted = 'You must agree to the Terms and Conditions to register.';
      if (setTermsError) {
        setTermsError('You must agree to the Terms and Conditions to register.');
      }
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      await onSubmit({
        ...formData,
        termsAndConditionsAccepted: termsAccepted
      });
    }
  };

  const handleGoogleRegister = () => {
    // Check terms before proceeding with Google registration
    if (!termsAccepted) {
      const errorMessage = 'You must agree to the Terms and Conditions to register.';
      setValidationErrors(prev => ({
        ...prev,
        termsAndConditionsAccepted: errorMessage
      }));
      if (setTermsError) {
        setTermsError(errorMessage);
      }
      return;
    }
    
    // Clear any existing terms errors
    setValidationErrors(prev => ({
      ...prev,
      termsAndConditionsAccepted: ''
    }));
    if (setTermsError) {
      setTermsError('');
    }
    
    onGoogleRegister();
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && validationErrors[fieldName];
  };

  return (
    <Paper 
      component="form" 
      onSubmit={handleSubmit} 
      noValidate
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: 520, md: 580 },
        mx: 'auto',
        p: { xs: 2.5, sm: 3, md: 4 },
        bgcolor: 'white',
        borderRadius: { xs: 2, sm: 3, md: 4 },
        boxShadow: {
          xs: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          sm: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          md: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        },
        border: '1px solid rgba(59, 130, 246, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #f59e0b 100%)',
          borderRadius: { xs: '8px 8px 0 0', sm: '12px 12px 0 0', md: '16px 16px 0 0' }
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
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
            error={!!getFieldError('firstName')}
            helperText={getFieldError('firstName')}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color={getFieldError('firstName') ? 'error' : 'action'} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(248, 250, 252, 1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#3b82f6',
                  fontWeight: 600,
                },
              },
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
            error={!!getFieldError('lastName')}
            helperText={getFieldError('lastName')}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color={getFieldError('lastName') ? 'error' : 'action'} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(248, 250, 252, 1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#3b82f6',
                  fontWeight: 600,
                },
              },
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
            error={!!getFieldError('email')}
            helperText={getFieldError('email')}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color={getFieldError('email') ? 'error' : 'action'} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(248, 250, 252, 1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#3b82f6',
                  fontWeight: 600,
                },
              },
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
            error={!!getFieldError('phone')}
            helperText={getFieldError('phone')}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color={getFieldError('phone') ? 'error' : 'action'} />
                  <Typography sx={{ ml: 1, fontWeight: 600, color: '#6b7280' }}>+61</Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(248, 250, 252, 1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#3b82f6',
                  fontWeight: 600,
                },
              },
            }}
            inputProps={{
              maxLength: 12, // 10 digits + 2 spaces
              inputMode: 'numeric',
            }}
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
            error={!!getFieldError('password')}
            helperText={getFieldError('password')}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color={getFieldError('password') ? 'error' : 'action'} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: '#6b7280' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(248, 250, 252, 1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#3b82f6',
                  fontWeight: 600,
                },
              },
            }}
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <Fade in={!!formData.password}>
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(passwordStrength.score / 5) * 100}
                    color={passwordStrength.color}
                    sx={{
                      flexGrow: 1,
                      height: 6,
                      borderRadius: 3,
                    }}
                  />
                  <Typography
                    variant="caption"
                    color={`${passwordStrength.color}.main`}
                    sx={{ fontWeight: 600, minWidth: 'fit-content' }}
                  >
                    {passwordStrength.label}
                  </Typography>
                </Box>
              </Box>
            </Fade>
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
            error={!!getFieldError('confirmPassword')}
            helperText={getFieldError('confirmPassword')}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOpenIcon color={getFieldError('confirmPassword') ? 'error' : 'action'} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: '#6b7280' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 1.5, sm: 2 },
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: 'rgba(248, 250, 252, 1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.2)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root': {
                fontWeight: 500,
                '&.Mui-focused': {
                  color: '#3b82f6',
                  fontWeight: 600,
                },
              },
            }}
          />
        </Stack>
      </Box>
      
      {/* Terms and Conditions Checkbox */}
      <Box sx={{ position: 'relative', zIndex: 1, mt: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: 'rgba(59, 130, 246, 0.02)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(59, 130, 246, 0.05)',
              borderColor: 'rgba(59, 130, 246, 0.2)',
            }
          }}
        >
          <FormControlLabel
            control={
              <Checkbox 
                color="primary" 
                checked={termsAccepted} 
                onChange={(e) => handleTermsChange(e.target.checked)}
                sx={{
                  '&.Mui-checked': {
                    color: '#3b82f6',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                  }
                }}
              />
            }
            label={
              <Typography 
                variant="body2" 
                sx={{ 
                  pl: 0, 
                  m: 0, 
                  display: 'inline',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontWeight: 500,
                  color: '#374151'
                }}
                onClick={() => handleTermsChange(!termsAccepted)}
              >
                I've read and agree to the{' '}
                <Link 
                  href="/terms-and-conditions" 
                  color="primary" 
                  underline="hover" 
                  target="_blank" 
                  rel="noopener"
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Terms and Conditions
                </Link>
              </Typography>
            }
            sx={{ alignItems: 'flex-start', pl: 0, ml: 0 }}
          />
          
          {/* Terms Error Display */}
          {(termsError || validationErrors.termsAndConditionsAccepted) && (
            <Typography 
              variant="caption" 
              color="error" 
              sx={{ 
                display: 'block', 
                mt: 1, 
                ml: 4.5,
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              {termsError || validationErrors.termsAndConditionsAccepted}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Password Requirements */}
      <Collapse in={showRequirements && formData.password.length > 0}>
        <Box sx={{ position: 'relative', zIndex: 1, mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: 'rgba(248, 250, 252, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              borderRadius: 2,
              backdropFilter: 'blur(5px)'
            }}
          >
            <Typography 
              variant="subtitle2" 
              color="text.primary" 
              gutterBottom 
              sx={{
                fontWeight: 600,
                mb: 1.5,
                color: '#374151'
              }}
            >
              Password Requirements:
            </Typography>
            <List dense disablePadding>
              {passwordMetRequirements.map((req) => (
                <ListItem key={req.id} disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {req.met ? (
                      <CheckCircleIcon 
                        color="success" 
                        fontSize="small" 
                        sx={{ 
                          filter: 'drop-shadow(0 1px 2px rgba(34, 197, 94, 0.3))' 
                        }} 
                      />
                    ) : (
                      <CancelIcon 
                        color="error" 
                        fontSize="small" 
                        sx={{ 
                          filter: 'drop-shadow(0 1px 2px rgba(239, 68, 68, 0.3))' 
                        }} 
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={req.label}
                    primaryTypographyProps={{
                      color: req.met ? 'success.main' : 'text.secondary',
                      fontWeight: req.met ? 600 : 400,
                      variant: 'body2'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Collapse>

      {/* Submit Button */}
      <Box sx={{ position: 'relative', zIndex: 1, mt: 4 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.95rem', sm: '1rem' },
            fontWeight: 700,
            borderRadius: { xs: 2, sm: 2.5 },
            textTransform: 'none',
            background: loading 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #1d4ed8 100%)',
            boxShadow: loading 
              ? 'none' 
              : '0 8px 25px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transition: 'left 0.5s',
            },
            '&:hover': {
              background: loading 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 50%, #1e40af 100%)',
              transform: loading ? 'none' : 'translateY(-3px)',
              boxShadow: loading 
                ? 'none' 
                : '0 12px 35px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              '&::before': {
                left: '100%',
              },
            },
            '&:active': {
              transform: loading ? 'none' : 'translateY(-1px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={22} color="inherit" />
              <Typography variant="inherit" sx={{ fontWeight: 600 }}>
                {loadingMessage}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="inherit" sx={{ fontWeight: 700 }}>
                Create Account
              </Typography>
            </Box>
          )}
        </Button>
      </Box>

      {/* Divider */}
      <Box sx={{ position: 'relative', zIndex: 1, my: 4 }}>
        <Divider 
          sx={{ 
            '&::before, &::after': {
              borderColor: 'rgba(59, 130, 246, 0.2)',
            }
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#6b7280', 
              fontWeight: 600,
              px: 2,
              bgcolor: 'white',
              borderRadius: 1
            }}
          >
            Or sign up with
          </Typography>
        </Divider>
      </Box>

      {/* Google Button */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleGoogleRegister}
          disabled={loading}
          startIcon={<GoogleIcon sx={{ fontSize: '1.2rem' }} />}
          sx={{
            py: { xs: 1.5, sm: 2 },
            borderRadius: { xs: 2, sm: 2.5 },
            textTransform: 'none',
            fontSize: { xs: '0.95rem', sm: '1rem' },
            fontWeight: 600,
            borderColor: 'rgba(59, 130, 246, 0.2)',
            color: '#374151',
            bgcolor: 'white',
            borderWidth: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            '&:hover': {
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
              '&::before': {
                opacity: 1,
              },
            },
            '&:active': {
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Continue with Google
        </Button>
      </Box>

      {/* Terms and Privacy */}
      <Box sx={{ position: 'relative', zIndex: 1, mt: 4, textAlign: 'center' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#6b7280',
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            lineHeight: 1.6
          }}
        >
          By signing up, you agree to our{' '}
          <Link 
            href="/terms" 
            sx={{ 
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { 
                textDecoration: 'underline',
                color: '#1d4ed8'
              }
            }}
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link 
            href="/privacy" 
            sx={{ 
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: 600,
              '&:hover': { 
                textDecoration: 'underline',
                color: '#1d4ed8'
              }
            }}
          >
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default RegisterForm;