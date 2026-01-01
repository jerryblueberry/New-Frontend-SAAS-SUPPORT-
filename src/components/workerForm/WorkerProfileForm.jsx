import React, { useState, useCallback, useMemo, useEffect } from 'react';
import useOnboardingStore, {
  useProfileMutation,
} from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';
import './css/WorkerProfileForm.css';
import {
  Card, CardContent, Typography, TextField, Box, InputAdornment, Button, Chip, Stack, MenuItem, Alert,
  Select,
  FormControl,
  InputLabel, CircularProgress, IconButton, Grid, useTheme, useMediaQuery,
  Divider,
  alpha,
} from '@mui/material';

import CloseIcon from "@mui/icons-material/Close";
import { AlertCircle, X, ArrowRight, CheckCircle2 } from 'lucide-react';

import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WorkerBiographySection from '../WorkerProfileOnboarding/WorkerBiographySection';
import LanguageSection from '../WorkerProfileOnboarding/LanguageSection';
import SkillsSection from '../WorkerProfileOnboarding/SkillsSection';
import ExpectedHourlyRate from '../WorkerProfileOnboarding/ExpectedHourlyRate';
import OnboardingCV from '../WorkerCv/OnboardingCV/onboardingCV';
import RequiredFieldsTracker from './RequiredFieldsTracker';

// Default skills for suggestions
const DEFAULT_SKILLS = [


  "Personal Care",
  'Meal Preparation',
  "Working with Children",
  "Cleaning",
  'First Aid',




];


// Validation constants
const VALIDATION_RULES = {
  biography: {
    minLength: 0,
    maxLength: 1500,
    required: false,
  },
  expectedHourlyRate: {
    min: 20,
    max: 100,
    required: true,
  },
  skillTags: {
    minCount: 0,
    maxCount: 10,
    required: false,
  },
  languages: {
    minCount: 1,
    maxCount: 7,
    required: true,
  },
};

const WorkerProfileForm = React.memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formErrors, setFormErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [languageValidation, setLanguageValidation] = useState({ isValid: false, error: null });
  const [skillsValidation, setSkillsValidation] = useState({ isValid: true, error: null });
  const [hourlyRateValidation, setHourlyRateValidation] = useState({ isValid: false, error: null });
  const [cvValidation, setCvValidation] = useState({ isValid: false, error: null });
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  // Get state and actions from store individually to avoid infinite loop
  const profile = useOnboardingStore((state) => state.profile, shallow);
  const updateProfile = useOnboardingStore((state) => state.updateProfile);

  const { mutate: saveProfile, isPending, error } = useProfileMutation();

  // Custom close button for Toasts with perfect alignment
  const ToastCloseButton = useCallback(({ closeToast }) => (
    <IconButton
      aria-label="close"
      size="small"
      onClick={closeToast}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
        color: theme.palette.grey[700],
        '&:hover': { color: theme.palette.text.primary },
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  ), [theme.palette.grey, theme.palette.text.primary]);

  // Handle biography change from WorkerBiographySection component
  const handleBiographyChange = useCallback((content) => {
    updateProfile({ biography: content });
  }, [updateProfile]);

  // Get plain text length helper (for validation)
  const getPlainTextLength = useCallback((html) => {
    if (!html || typeof html !== 'string') return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || tempDiv.innerText || '').trim().length;
  }, []);

  // Enhanced validation function
  const validateField = useCallback((fieldName, value) => {
    const errors = {};

    switch (fieldName) {
      case 'biography':
        // Biography validation is handled by WorkerBiographySection component
        // Only validate here if needed for form submission
        if (value && typeof value === 'string') {
          const plainTextLength = getPlainTextLength(value);
          if (plainTextLength > VALIDATION_RULES.biography.maxLength) {
            errors.biography = `Professional summary must not exceed ${VALIDATION_RULES.biography.maxLength} characters`;
          }
        }
        // No error if empty (biography is optional)
        break;

      case 'expectedHourlyRate':
        // Hourly rate validation is handled by ExpectedHourlyRate component
        // Use the validation state from ExpectedHourlyRate
        if (!hourlyRateValidation.isValid && hourlyRateValidation.error) {
          errors.expectedHourlyRate = hourlyRateValidation.error;
        }
        break;

      case 'skillTags':
        // Skills validation is handled by SkillsSection component
        // Use the validation state from SkillsSection
        if (!skillsValidation.isValid && skillsValidation.error) {
          errors.skillTags = skillsValidation.error;
        }
        break;

      case 'languages':
        // Language validation is handled by LanguageSection component
        // Use the validation state from LanguageSection
        if (!languageValidation.isValid && languageValidation.error) {
          errors.languages = languageValidation.error;
        }
        break;

      case 'CV':
        // CV validation - check if CV exists
        const hasCV = value && (
          (typeof value === 'object' && value.url && value.publicId) ||
          (typeof value === 'string' && value.trim().length > 0)
        );
        if (!hasCV) {
          errors.CV = 'CV is required';
        }
        break;

      default:
        break;
    }

    return errors;
  }, [languageValidation, hourlyRateValidation, skillsValidation]);

  // Enhanced comprehensive validation
  const validateForm = useCallback(() => {
    const allErrors = {
      ...validateField('biography', profile.biography || ''),
      ...validateField('expectedHourlyRate', profile.expectedHourlyRate),
      ...validateField('skillTags', profile.skillTags || []),
      ...validateField('languages', profile.languages || []),
      ...validateField('CV', profile.CV),
    };

    setFormErrors(allErrors); // still shows inline errors
    return allErrors; // return object instead of boolean
  }, [profile, validateField, languageValidation, skillsValidation, hourlyRateValidation]);

  // Real-time validation for individual fields
  const validateSingleField = useCallback((fieldName, value) => {
    if (!hasAttemptedSubmit) return; // Only validate after first submit attempt

    const fieldErrors = validateField(fieldName, value);
    setFormErrors(prev => ({
      ...prev,
      ...fieldErrors,
      // Clear the error if validation passes
      ...(Object.keys(fieldErrors).length === 0 && { [fieldName]: undefined })
    }));
  }, [hasAttemptedSubmit, validateField, languageValidation, skillsValidation, hourlyRateValidation]);


  // Handle language validation changes from LanguageSection
  const handleLanguageValidationChange = useCallback((validation) => {
    setLanguageValidation(validation);
    // Update form errors based on language validation
    setFormErrors(prev => ({
      ...prev,
      languages: validation.error || undefined,
    }));
  }, []);

  // Handle skills validation changes from SkillsSection
  const handleSkillsValidationChange = useCallback((validation) => {
    setSkillsValidation(validation);
    // Update form errors based on skills validation
    setFormErrors(prev => ({
      ...prev,
      skillTags: validation.error || undefined,
    }));
  }, []);

  // Handle hourly rate validation changes from ExpectedHourlyRate
  const handleHourlyRateValidationChange = useCallback((validation) => {
    setHourlyRateValidation(validation);
    // Update form errors based on hourly rate validation
    setFormErrors(prev => ({
      ...prev,
      expectedHourlyRate: validation.error || undefined,
    }));
  }, []);

  // Handle CV validation changes
  const handleCVValidationChange = useCallback(() => {
    // Validate CV exists
    const hasCV = profile.CV && (
      (typeof profile.CV === 'object' && profile.CV.url && profile.CV.publicId) ||
      (typeof profile.CV === 'string' && profile.CV.trim().length > 0)
    );
    
    const validation = {
      isValid: hasCV,
      error: hasCV ? null : 'CV is required',
    };
    
    setCvValidation(validation);
    // Update form errors based on CV validation
    setFormErrors(prev => ({
      ...prev,
      CV: validation.error || undefined,
    }));
  }, [profile.CV]);

  // Enhanced form submit with better error handling
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const errors = validateForm();
    const errorMessages = Object.values(errors).filter(Boolean);

    if (errorMessages.length > 0) {
      // Show error summary instead of toast
      setShowErrorSummary(true);
      
      // Scroll to error summary
      setTimeout(() => {
        const errorSummary = document.getElementById('error-summary');
        if (errorSummary) {
          errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      return; // ⛔ stop submission
    }

    // ✅ No errors → submit
    setShowErrorSummary(false);
    
    saveProfile({
      ...profile,
      biography: profile.biography?.trim(),
    });
  }, [profile, saveProfile, validateForm]);

  // Get all validation errors for display
  const validationErrors = useMemo(() => {
    const errors = [];
    if (!hourlyRateValidation.isValid && hourlyRateValidation.error) {
      errors.push({ field: 'Expected Hourly Rate', message: hourlyRateValidation.error });
    }
    if (!skillsValidation.isValid && skillsValidation.error) {
      errors.push({ field: 'Skills', message: skillsValidation.error });
    }
    if (!languageValidation.isValid && languageValidation.error) {
      errors.push({ field: 'Languages', message: languageValidation.error });
    }
    if (!cvValidation.isValid && cvValidation.error) {
      errors.push({ field: 'CV', message: cvValidation.error });
    }
    if (formErrors.biography) {
      errors.push({ field: 'Professional Summary', message: formErrors.biography });
    }
    return errors;
  }, [hourlyRateValidation, skillsValidation, languageValidation, cvValidation, formErrors.biography]);

  // Prepare fields data for RequiredFieldsTracker
  const requiredFields = useMemo(() => {
    const fields = [
      {
        key: 'biography',
        label: 'Professional Summary',
        description: 'Tell potential clients about your experience, skills, and what makes you unique. This helps you stand out.',
        required: false,
        isCompleted: profile.biography && getPlainTextLength(profile.biography) >= VALIDATION_RULES.biography.minLength,
      },
      {
        key: 'expectedHourlyRate',
        label: 'Expected Hourly Rate',
        description: 'Set your preferred hourly rate between $20-$100. This helps clients understand your pricing expectations.',
        required: true,
        isCompleted: hourlyRateValidation.isValid,
      },
      {
        key: 'skillTags',
        label: 'Skills & Expertise',
        description: 'Add your relevant skills and areas of expertise. This helps clients find you for the right opportunities.',
        required: false,
        isCompleted: (profile.skillTags || []).length > 0 && skillsValidation.isValid,
      },
      {
        key: 'languages',
        label: 'Languages',
        description: 'Select the languages you can communicate in. At least one language is required.',
        required: true,
        isCompleted: (profile.languages || []).length >= VALIDATION_RULES.languages.minCount && languageValidation.isValid,
      },
      {
        key: 'CV',
        label: 'Resume / CV',
        description: 'Upload your resume or CV (PDF, JPG, PNG). This is required to verify your qualifications.',
        required: true,
        isCompleted: cvValidation.isValid,
      },
    ];
    return fields;
  }, [profile, hourlyRateValidation, skillsValidation, languageValidation, cvValidation, getPlainTextLength]);

  // Create validation errors object for tracker
  const trackerValidationErrors = useMemo(() => {
    const errors = {};
    if (!hourlyRateValidation.isValid && hourlyRateValidation.error) {
      errors.expectedHourlyRate = hourlyRateValidation.error;
    }
    if (!skillsValidation.isValid && skillsValidation.error) {
      errors.skillTags = skillsValidation.error;
    }
    if (!languageValidation.isValid && languageValidation.error) {
      errors.languages = languageValidation.error;
    }
    if (!cvValidation.isValid && cvValidation.error) {
      errors.CV = cvValidation.error;
    }
    if (formErrors.biography) {
      errors.biography = formErrors.biography;
    }
    return errors;
  }, [hourlyRateValidation, skillsValidation, languageValidation, cvValidation, formErrors.biography]);

  // Handle field click to scroll to field
  const handleFieldClick = useCallback((fieldKey) => {
    const fieldMap = {
      biography: 'biography-section',
      expectedHourlyRate: 'hourly-rate-section',
      skillTags: 'skills-section',
      languages: 'languages-section',
      CV: 'cv-section',
    };
    
    const elementId = fieldMap[fieldKey];
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add a subtle highlight effect
        element.style.transition = 'box-shadow 0.3s ease';
        element.style.boxShadow = `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`;
        setTimeout(() => {
          element.style.boxShadow = '';
        }, 2000);
      }
    }
  }, [theme]);




  // Effect to clear errors when component mounts and validate CV
  useEffect(() => {
    setFormErrors({});
    handleCVValidationChange();
  }, []);

  // Validate CV when it changes
  useEffect(() => {
    handleCVValidationChange();
  }, [profile.CV, handleCVValidationChange]);

  return (
    <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          mx: 'auto',
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: '100vh',
          bgcolor: 'transparent',
          maxWidth: { xs: '100%', sm: '1400px' },
        }}
      >
      {/* Success Toast Container - Cleaner Design */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        closeButton={<ToastCloseButton />}
        limit={1}
        draggableDirection="x"
        theme="colored"
        toastStyle={{
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          paddingRight: 40,
          maxWidth: '500px',
          width: 'calc(100% - 24px)',
          margin: '0 auto',
          fontSize: '0.9375rem',
          fontWeight: 500,
        }}
        style={{
          zIndex: 1400,
          width: '100%',
          padding: isMobile ? '0 8px' : '0 16px',
        }}
      />

      {/* Onboarding Header - Clean Minimal Design */}
      <Box sx={{ 
        mb: { xs: 3, sm: 4 },
        maxWidth: { xs: '100%', lg: '65%' },
      }}>
        <Typography
          sx={{
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            fontWeight: 700,
            color: 'text.primary',
            mb: { xs: 1, sm: 1.25 },
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          Complete Your Profile
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
            color: 'text.secondary',
            lineHeight: 1.6,
            mb: { xs: 2, sm: 2.5 },
            maxWidth: { xs: '100%', sm: '90%' },
          }}
        >
          Help potential clients get to know you better. Complete your profile to increase your visibility and match with the right opportunities.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 1.5, sm: 2 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CheckCircle2 size={18} color={theme.palette.primary.main} strokeWidth={2.5} />
            <Typography sx={{ 
              fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
              color: 'text.secondary', 
              fontWeight: 500,
              lineHeight: 1.4,
            }}>
              Secure & Private
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CheckCircle2 size={18} color={theme.palette.primary.main} strokeWidth={2.5} />
            <Typography sx={{ 
              fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
              color: 'text.secondary', 
              fontWeight: 500,
              lineHeight: 1.4,
            }}>
              Takes 5-10 minutes
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <CheckCircle2 size={18} color={theme.palette.primary.main} strokeWidth={2.5} />
            <Typography sx={{ 
              fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
              color: 'text.secondary', 
              fontWeight: 500,
              lineHeight: 1.4,
            }}>
              Increase Job Matches
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Funky SaaS-Level Separator */}
      <Box
        sx={{
          position: 'relative',
          mb: { xs: 3, sm: 4 },
          maxWidth: { xs: '100%', lg: '65%' },
          height: { xs: '2px', sm: '3px' },
          overflow: 'hidden',
        }}
      >
        {/* Animated Gradient Line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${alpha(theme.palette.primary.main, 0.2)} 20%, 
              ${theme.palette.primary.main} 50%, 
              ${alpha(theme.palette.primary.main, 0.2)} 80%, 
              transparent 100%
            )`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': {
                backgroundPosition: '-200% 0',
              },
              '100%': {
                backgroundPosition: '200% 0',
              },
            },
          }}
        />
        {/* Base Gradient Line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${alpha(theme.palette.divider, 0.3)} 10%, 
              ${alpha(theme.palette.primary.main, 0.15)} 30%, 
              ${alpha(theme.palette.primary.main, 0.25)} 50%, 
              ${alpha(theme.palette.primary.main, 0.15)} 70%, 
              ${alpha(theme.palette.divider, 0.3)} 90%, 
              transparent 100%
            )`,
          }}
        />
        {/* Decorative Dots */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: { xs: 6, sm: 8 },
                height: { xs: 6, sm: 8 },
                borderRadius: '50%',
                bgcolor: theme.palette.primary.main,
                boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                animation: `pulse 2s ease-in-out infinite ${i * 0.3}s`,
                '@keyframes pulse': {
                  '0%, 100%': {
                    opacity: 0.6,
                    transform: 'scale(1)',
                  },
                  '50%': {
                    opacity: 1,
                    transform: 'scale(1.2)',
                  },
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Server Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: '12px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            '& .MuiAlert-message': { fontSize: '0.9375rem', fontWeight: 500 }
          }}
        >
          {error.response?.data?.message ||
            'An error occurred while saving your profile. Please try again.'}
        </Alert>
      )}

      {/* Validation Error Summary - Premium Compact Design */}
      {showErrorSummary && validationErrors.length > 0 && (
        <Box
          id="error-summary"
          sx={{
            mb: { xs: 2.5, sm: 3 },
            borderRadius: '14px',
            bgcolor: '#ffffff',
            border: '1.5px solid #fecaca',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
            },
          }}
        >
          {/* Compact Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: { xs: 1.25, sm: 1.5 },
            bgcolor: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            borderBottom: validationErrors.length > 1 ? '1px solid rgba(239, 68, 68, 0.15)' : 'none',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.875, sm: 1 }, flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 3px 8px rgba(239, 68, 68, 0.3)',
                }}
              >
                <AlertCircle size={isMobile ? 16 : 18} color="#ffffff" strokeWidth={2.5} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ 
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
                  fontWeight: 700, 
                  color: '#7f1d1d',
                  lineHeight: 1.3,
                  letterSpacing: '-0.01em',
                }}>
                  {validationErrors.length === 1 
                    ? 'Validation Error' 
                    : `${validationErrors.length} Errors Found`}
                </Typography>
                <Typography sx={{ 
                  fontSize: { xs: '0.6875rem', sm: '0.75rem' }, 
                  color: '#b91c1c',
                  lineHeight: 1.4,
                  fontWeight: 500,
                  mt: 0.125,
                }}>
                  {validationErrors.length === 1 
                    ? 'Fix to continue' 
                    : 'Fix all to continue'}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setShowErrorSummary(false)}
              sx={{
                width: { xs: 28, sm: 32 },
                height: { xs: 28, sm: 32 },
                borderRadius: '8px',
                color: '#991b1b',
                bgcolor: 'rgba(239, 68, 68, 0.08)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  bgcolor: 'rgba(239, 68, 68, 0.15)',
                  transform: 'scale(1.08)',
                  color: '#7f1d1d',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              <X size={isMobile ? 16 : 18} strokeWidth={2.5} />
            </IconButton>
          </Box>

          {/* Compact Error List */}
          {validationErrors.length > 1 ? (
            <Box sx={{ p: { xs: 1.25, sm: 1.5 }, pt: { xs: 1.25, sm: 1.5 } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0.75, sm: 0.875 } }}>
                {validationErrors.map((err, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: { xs: 0.875, sm: 1 },
                      p: { xs: 0.875, sm: 1 },
                      borderRadius: '10px',
                      bgcolor: '#fef2f2',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: '#fee2e2',
                        borderColor: 'rgba(239, 68, 68, 0.3)',
                        transform: 'translateX(2px)',
                        boxShadow: '0 2px 6px rgba(239, 68, 68, 0.1)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        flexShrink: 0,
                        mt: { xs: 0.5, sm: 0.625 },
                        boxShadow: '0 1px 3px rgba(239, 68, 68, 0.4)',
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                        fontWeight: 600, 
                        color: '#7f1d1d',
                        mb: 0.25,
                        lineHeight: 1.4,
                        letterSpacing: '-0.01em',
                      }}>
                        {err.field}
                      </Typography>
                      <Typography sx={{ 
                        fontSize: { xs: '0.6875rem', sm: '0.75rem' }, 
                        color: '#b91c1c',
                        lineHeight: 1.5,
                        fontWeight: 500,
                      }}>
                        {err.message}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: { xs: 1.25, sm: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: { xs: 0.875, sm: 1 },
                  p: { xs: 1, sm: 1.25 },
                  borderRadius: '10px',
                  bgcolor: '#fef2f2',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    flexShrink: 0,
                    mt: { xs: 0.5, sm: 0.625 },
                    boxShadow: '0 1px 3px rgba(239, 68, 68, 0.4)',
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' }, 
                    fontWeight: 600, 
                    color: '#7f1d1d',
                    mb: 0.25,
                    lineHeight: 1.4,
                    letterSpacing: '-0.01em',
                  }}>
                    {validationErrors[0].field}
                  </Typography>
                  <Typography sx={{ 
                    fontSize: { xs: '0.6875rem', sm: '0.75rem' }, 
                    color: '#b91c1c',
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}>
                    {validationErrors[0].message}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Two-Column Layout: Form Content + Progress Tracker */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' },
        gap: { xs: 3, sm: 3.5, lg: 4 },
        alignItems: 'flex-start',
        mb: { xs: 3, sm: 4 },
        width: '100%',
      }}>
        {/* Main Form Content - Left Side */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', lg: '1 1 65%' },
          minWidth: 0,
          display: 'flex', 
          flexDirection: 'column',
          gap: { xs: 2.5, sm: 3 },
        }}>
        {/* Professional Summary - Clean Borderless Design */}
        <Box id="biography-section">
          <WorkerBiographySection
            value={profile.biography || ''}
            onChange={handleBiographyChange}
            error={formErrors.biography}
            disabled={isPending}
            maxLength={VALIDATION_RULES.biography.maxLength}
            minLength={VALIDATION_RULES.biography.minLength}
            fullHeight={false}
          />
        </Box>

        {/* Clean SaaS-Level Section Divider */}
        <Box
          sx={{
            my: { xs: 3, sm: 3.5 },
            width: '100%',
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.divider, 0.12)} 50%, transparent 100%)`,
          }}
        />

        {/* Expected Hourly Rate - Clean Borderless Design */}
        <Box id="hourly-rate-section">
          <ExpectedHourlyRate
            disabled={isPending}
            onValidationChange={handleHourlyRateValidationChange}
            showErrors={hasAttemptedSubmit}
          />
        </Box>

        {/* Clean SaaS-Level Section Divider */}
        <Box
          sx={{
            my: { xs: 3, sm: 3.5 },
            width: '100%',
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.divider, 0.12)} 50%, transparent 100%)`,
          }}
        />

        {/* Skills Section - Clean Borderless Design */}
        <Box id="skills-section">
          <SkillsSection
            disabled={isPending}
            onValidationChange={handleSkillsValidationChange}
            showErrors={hasAttemptedSubmit}
          />
        </Box>

        {/* Clean SaaS-Level Section Divider */}
        <Box
          sx={{
            my: { xs: 3, sm: 3.5 },
            width: '100%',
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.divider, 0.12)} 50%, transparent 100%)`,
          }}
        />

        {/* Languages Section - Clean Borderless Design */}
        <Box id="languages-section">
          <LanguageSection
            disabled={isPending}
            onValidationChange={handleLanguageValidationChange}
            showErrors={hasAttemptedSubmit}
          />
        </Box>

        {/* Clean SaaS-Level Section Divider */}
        <Box
          sx={{
            my: { xs: 3, sm: 3.5 },
            width: '100%',
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.divider, 0.12)} 50%, transparent 100%)`,
          }}
        />

        {/* CV Section - Clean Borderless Design */}
        <Box id="cv-section">
          <OnboardingCV cvError={hasAttemptedSubmit ? formErrors.CV : null} />
        </Box>
        </Box>

        {/* Progress Tracker Sidebar - Right Side (Desktop Only) */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', lg: '0 0 340px' },
          width: { xs: '100%', lg: '340px' },
          display: { xs: 'none', lg: 'block' },
        }}>
          <RequiredFieldsTracker
            fields={requiredFields}
            validationErrors={trackerValidationErrors}
            onFieldClick={handleFieldClick}
            showDetails={true}
            compact={true}
          />
        </Box>
      </Box>

      {/* Progress Tracker - Mobile (Below Form) */}
      <Box sx={{ 
        display: { xs: 'block', lg: 'none' },
        mb: { xs: 3, sm: 3.5 },
      }}>
        <RequiredFieldsTracker
          fields={requiredFields}
          validationErrors={trackerValidationErrors}
          onFieldClick={handleFieldClick}
          showDetails={true}
          compact={false}
        />
      </Box>

      {/* Submit Button Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: { xs: 4, sm: 5 },
        mb: 3,
        gap: 2,
        maxWidth: { xs: '100%', sm: '700px' },
        mx: 'auto',
        width: '100%',
      }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending}
          aria-describedby="submit-help"
          sx={{
            minWidth: { xs: '100%', sm: 320, md: 360 },
            height: { xs: 52, sm: 56 },
            fontSize: { xs: '1rem', sm: '1.0625rem' },
            fontWeight: 600,
            borderRadius: '14px',
            textTransform: 'none',
            letterSpacing: '-0.01em',
            bgcolor: theme.palette.primary.main,
            boxShadow: 'none',
            position: 'relative',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              transform: 'translateY(-2px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              bgcolor: alpha(theme.palette.action.disabledBackground, 0.12),
              color: alpha(theme.palette.action.disabled, 0.5),
              transform: 'none',
              boxShadow: 'none',
            },
          }}
        >
          {isPending ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress
                size={20}
                color="inherit"
                thickness={4}
                sx={{ color: 'white' }}
              />
              <Typography variant="inherit" sx={{ fontWeight: 600, fontSize: 'inherit' }}>
                Saving Your Profile...
              </Typography>
            </Box>
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                justifyContent: 'center',
                '&:hover .button-arrow': {
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Typography variant="inherit" sx={{ fontWeight: 600, fontSize: 'inherit' }}>
                Continue to Work History
              </Typography>
              <ArrowRight 
                size={18} 
                strokeWidth={2.5}
                className="button-arrow"
                style={{ 
                  transition: 'transform 0.2s ease',
                }}
              />
            </Box>
          )}
        </Button>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          textAlign: 'center',
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            maxWidth: '600px',
            lineHeight: 1.6,
            px: 2
        }}
      >
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', mr: 0.5 }}>
            🔒
          </Box>
        Your information is secure and will only be shared with potential clients
      </Typography>
      </Box>
    </Box>
  );
});

WorkerProfileForm.displayName = 'WorkerProfileForm';
export default WorkerProfileForm;