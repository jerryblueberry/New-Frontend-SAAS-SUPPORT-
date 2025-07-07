import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
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
  Paper
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

const RegisterForm = ({ 
  onSubmit, 
  onGoogleRegister,
  loading = false, 
  loadingMessage = 'Creating Account...',
  error 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+61',
    password: '',
    confirmPassword: '',
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
        if (!value.startsWith('+61')) return 'Phone must start with country code +61';
        const digits = value.replace(/\D/g, '');
        // Remove country code digits (first 2 digits after +)
        const afterCode = value.startsWith('+61') ? value.slice(3) : value;
        if (!/^\d{9,10}$/.test(afterCode)) return 'Enter 9 or 10 digits after +61';
        if (afterCode.length !== 9 && afterCode.length !== 10) return 'Phone number must be 9 or 10 digits after +61';
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
      // Always start with +61
      if (!newValue.startsWith('+61')) {
        newValue = '+61';
      }
      // Only allow numbers after +61
      newValue = '+61' + newValue.slice(3).replace(/[^\d]/g, '');
      // Limit to 10 digits after +61
      if (newValue.length > 13) {
        newValue = newValue.slice(0, 13);
      }
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

    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      await onSubmit(formData);
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && validationErrors[fieldName];
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Grid container spacing={2} sx={{
        backgroundColor:{
          // sm:'red',

        },
        display:{
          sm:'flex',

        },
        alignItems:{
          sm:'center'
        },
        justifyContent:{
          sm:'center'
        }
      }}>
        {/* First Name */}
        <Grid item xs={12} sm={6}>
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
              width:isMobile?370:'100%',
             
              mb:1.5,
              '@media (max-width:350px)': {
                width: 280,
              },
              '@media (min-width:351px) and (max-width:390px)': { width: 310 },
        
            }}
          />
        </Grid>

        {/* Last Name */}
        <Grid item xs={12} sm={6}>
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
              width:isMobile?370:'100%',
             
              mb:1.5,
              '@media (max-width:350px)': {
                width: 280,
              },
              '@media (min-width:351px) and (max-width:390px)': { width: 310 },
        
            }}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} >
          <TextField
            fullWidth
            variant="outlined"
            id="email"
            name="email"
            label="Email Address"
            type="email"
            autoComplete="email"
            // size='small'
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
              width:isMobile?370:480,
             
              mb:1.5,
              '@media (max-width:350px)': {
                width: 280,
              },
              '@media (min-width:351px) and (max-width:390px)': { width: 310 },
        
            }}
          />
        </Grid>

        {/* Phone */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            variant="outlined"
            id="phone"
            name="phone"
            label="Phone Number"
            type="tel"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!getFieldError('phone')}
            helperText={getFieldError('phone')}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color={getFieldError('phone') ? 'error' : 'action'} />
                </InputAdornment>
              ),
            }}
            sx={{
              width:isMobile?370:480,
              mb:1.5,
              '@media (max-width:350px)': {
                width: 280,
              },
              '@media (min-width:351px) and (max-width:390px)': { width: 310 },
            }}
            inputProps={{
              maxLength: 13,
              pattern: '\\+61\\d{9,10}',
              inputMode: 'numeric',
            }}
          />
        </Grid>
        {/* Password */}
        <Grid item xs={12}>
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
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              width:isMobile?370:480,
             
              mb:1.5,
              '@media (max-width:350px)': {
                width: 280,
              },
              '@media (min-width:351px) and (max-width:390px)': { width: 310 },
        
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
        </Grid>

        {/* Confirm Password */}
        <Grid item xs={12}>
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
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              width:isMobile?370:480,
             
              mb:1.5,
              '@media (max-width:350px)': {
                width: 280,
              },
              '@media (min-width:351px) and (max-width:390px)': { width: 310 },
        
            }}
          />
        </Grid>
      </Grid>

      {/* Password Requirements */}
      <Collapse in={showRequirements && formData.password.length > 0}>
        <Box sx={{ mt: 2 ,display:{
          sm:'flex'
        },
        flexDirection:'column',
        
        justifyContent:{
          sm:'center'
        } ,
        alignItems:'center'
        
        
        }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{
          
          }}>
            Password Requirements:
          </Typography>
          <List dense disablePadding>
            {passwordMetRequirements.map((req) => (
              <ListItem key={req.id} disablePadding sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {req.met ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <CancelIcon color="error" fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={req.label}
                  primaryTypographyProps={{
                    color: req.met ? 'success.main' : 'text.secondary',
                    fontWeight: req.met ? 500 : 400,
                    variant: 'body2'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Collapse>

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={loading}
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: 2,
          textTransform: 'none',
          background: loading 
            ? 'action.disabled' 
            : `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          boxShadow: loading ? 'none' : theme.shadows[4],
          '&:hover': {
            background: loading 
              ? 'action.disabled' 
              : `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
            transform: loading ? 'none' : 'translateY(-2px)',
            boxShadow: loading ? 'none' : theme.shadows[6],
          },
          transition: theme.transitions.create(['all'], {
            duration: theme.transitions.duration.standard,
          }),
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            <Typography variant="inherit">
              {loadingMessage}
            </Typography>
          </Box>
        ) : (
          'Create Account'
        )}
      </Button>

      {/* Divider */}
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Or sign up with
        </Typography>
      </Divider>

      {/* Google Button */}
      <Button
        fullWidth
        variant="outlined"
        size="large"
        onClick={onGoogleRegister}
        disabled={loading}
        startIcon={<GoogleIcon />}
        sx={{
          py: 1.5,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'action.selected',
            backgroundColor: 'action.hover',
            transform: 'translateY(-1px)',
          },
          transition: theme.transitions.create(['all'], {
            duration: theme.transitions.duration.short,
          }),
        }}
      >
        Continue with Google
      </Button>

      {/* Terms and Privacy */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          By signing up, you agree to our{' '}
          <Link href="/terms" color="primary" underline="hover">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" color="primary" underline="hover">
            Privacy Policy
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterForm;