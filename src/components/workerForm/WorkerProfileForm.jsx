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
} from '@mui/material';

import CloseIcon from "@mui/icons-material/Close";

import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WorkerBiographySection from '../WorkerProfileOnboarding/WorkerBiographySection';
import LanguageSection from '../WorkerProfileOnboarding/LanguageSection';
import SkillsSection from '../WorkerProfileOnboarding/SkillsSection';
import ExpectedHourlyRate from '../WorkerProfileOnboarding/ExpectedHourlyRate';
import OnboardingCV from '../WorkerCv/OnboardingCV/onboardingCV';

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

  //  Enhanced form submit with consolidated error handling
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const errors = validateForm();
    const errorMessages = Object.values(errors).filter(Boolean);

    if (errorMessages.length > 0) {
      // Show single consolidated toast instead of multiple toasts
      toast.dismiss();
      
      // Create a consolidated error message
      const consolidatedMessage = errorMessages.length === 1
        ? errorMessages[0]
        : `Please fix ${errorMessages.length} error${errorMessages.length > 1 ? 's' : ''} before continuing`;

      toast.error(consolidatedMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: '⚠️',
      });

      // If multiple errors, show details in console for debugging
      if (errorMessages.length > 1) {
        console.warn('Form validation errors:', errorMessages);
      }

      // Scroll to first error
      const firstErrorField = document.querySelector(
        '.profile_wrkr_basic_input_error, .profile_wrkr_basic_error_text, .MuiAlert-root'
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return; // ⛔ stop submission
    }

    // ✅ No errors → submit
    console.log('Submitting profile:', {
      biography: profile.biography?.trim(),
      skillTags: profile.skillTags,
      expectedHourlyRate: profile.expectedHourlyRate,
      languages: profile.languages,
    });

    saveProfile({
      ...profile,
      biography: profile.biography?.trim(),
    });
  }, [profile, saveProfile, validateForm]);

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = useMemo(() => {
    // biography is now optional, so no check for it
    // Use hourly rate validation from ExpectedHourlyRate
    if (!hourlyRateValidation.isValid) {
      return false;
    }
    // Use skills validation from SkillsSection
    if (!skillsValidation.isValid) {
      return false;
    }
    // Use language validation from LanguageSection
    if (!languageValidation.isValid) {
      return false;
    }
    // Use CV validation
    if (!cvValidation.isValid) {
      return false;
    }
    return true;
  }, [profile, hourlyRateValidation, skillsValidation, languageValidation, cvValidation]);




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
          bgcolor: '#fafafa',
        }}
      >
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        transition={Slide}
        closeButton={<ToastCloseButton />}
        limit={3}
        draggableDirection="x"
        theme="colored"
        toastStyle={{
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          paddingRight: 36,
          maxWidth: '640px',
          width: 'calc(100% - 24px)',
          margin: '0 auto',
          fontSize: '0.95rem',
        }}
        style={{
          zIndex: 1400,
          width: '100%',
          padding: isMobile ? '0 8px' : '0 16px',
        }}
      />

      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Complete Your Profile
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontSize: '1.1rem', maxWidth: '600px', mx: 'auto' }}
        >
          Help us understand your skills and experience to connect you with the right opportunities
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
            '& .MuiAlert-message': { fontSize: '0.95rem' }
          }}
        >
          {error.response?.data?.message ||
            'An error occurred while saving your profile. Please try again.'}
        </Alert>
      )}

      {/* Main Content Grid: Biography Left, Rate & Skills & Languages Right */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'column', md: 'row' },
        gap: { xs: 2.5, sm: 2.5, md: 2.5 },
        mb: { xs: 3, sm: 3, md: 3 },
        width: '100%',
        alignItems: { xs: 'stretch', sm: 'stretch', md: 'stretch' }
      }}>
        {/* Left Column: Professional Summary */}
        <Box sx={{ 
          width: { xs: '100%', sm: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: 'auto', sm: 'auto', md: '900px' }
        }}>
          <WorkerBiographySection
            value={profile.biography || ''}
            onChange={handleBiographyChange}
            error={formErrors.biography}
            disabled={isPending}
            maxLength={VALIDATION_RULES.biography.maxLength}
            minLength={VALIDATION_RULES.biography.minLength}
            fullHeight={true}
          />
        </Box>

        {/* Right Column: Expected Hourly Rate, Skills & Languages Combined */}
        <Box sx={{ 
          width: { xs: '100%', sm: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          minHeight: { xs: 'auto', sm: 'auto', md: '900px' }
        }}>
      <Card
        elevation={0}
        sx={{
              height: { xs: 'auto', sm: 'auto', md: '100%' },
              minHeight: { xs: 'auto', sm: 'auto', md: '900px' },
          borderRadius: 4,
          border: '1px solid',
              borderColor: { xs: 'divider', sm: 'divider', md: 'rgba(74, 222, 128, 0.12)' },
              overflow: { xs: 'visible', sm: 'visible', md: 'auto' },
          position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              background: { xs: 'white', sm: 'white', md: 'linear-gradient(to bottom, #ffffff 0%, #f0fdf4 100%)' },
              boxShadow: { 
                xs: 'none', 
                sm: 'none', 
                md: '0 4px 20px rgba(74, 222, 128, 0.08), 0 1px 3px rgba(0,0,0,0.05)' 
              },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
                boxShadow: { 
                  xs: 'none', 
                  sm: 'none', 
                  md: '0 8px 40px rgba(74, 222, 128, 0.15), 0 4px 12px rgba(0,0,0,0.08)' 
                },
                transform: { xs: 'none', sm: 'none', md: 'translateY(-4px)' },
                borderColor: { xs: 'divider', sm: 'divider', md: 'rgba(74, 222, 128, 0.2)' },
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #4ade80 0%, #f59e0b 50%, #8b5cf6 100%)',
                borderRadius: '16px 16px 0 0',
                boxShadow: '0 2px 8px rgba(74, 222, 128, 0.3)',
                backgroundSize: '200% 100%',
                animation: 'gradientShift 3s ease infinite',
                '@keyframes gradientShift': {
                  '0%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                  '100%': { backgroundPosition: '0% 50%' }
                }
              }}
        />
            <CardContent sx={{ 
              p: { xs: 3, sm: 3.5, md: 3.5 },
              display: 'flex', 
              flexDirection: 'column', 
              gap: { xs: 2.5, sm: 2.5, md: 2 },
              flex: 1,
              height: '100%',
              boxSizing: 'border-box',
              overflow: { xs: 'visible', sm: 'visible', md: 'auto' },
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: `rgba(154, 165, 177, 0.5)`,
                borderRadius: '3px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: `rgba(107, 114, 128, 0.7)`,
                }
              }
            }}>
      {/* Expected Hourly Rate Section */}
      <ExpectedHourlyRate
        disabled={isPending}
        onValidationChange={handleHourlyRateValidationChange}
        showErrors={hasAttemptedSubmit}
      />

              {/* Divider */}
              <Box sx={{ 
                height: '1px', 
                background: 'linear-gradient(90deg, transparent, rgba(224, 224, 224, 0.6), transparent)', 
                my: 0.5,
                flexShrink: 0
              }} />

      {/* Skills Section */}
      <SkillsSection
        disabled={isPending}
        onValidationChange={handleSkillsValidationChange}
        showErrors={hasAttemptedSubmit}
      />

              {/* Divider */}
              <Box sx={{ 
                height: '1px', 
                background: 'linear-gradient(90deg, transparent, rgba(224, 224, 224, 0.6), transparent)', 
                my: { xs: 0.5, sm: 0.5, md: 0.25 },
                flexShrink: 0
              }} />

      {/* Languages Section */}
      <LanguageSection
        disabled={isPending}
        onValidationChange={handleLanguageValidationChange}
        showErrors={hasAttemptedSubmit}
      />

              {/* Divider */}
              <Box sx={{ 
                height: '1px', 
                background: 'linear-gradient(90deg, transparent, rgba(224, 224, 224, 0.6), transparent)', 
                my: { xs: 0.5, sm: 0.5, md: 0.25 },
                flexShrink: 0
              }} />

      {/* CV Section */}
      <Box sx={{ flexShrink: 0 }}>
        <OnboardingCV cvError={formErrors.CV} />
      </Box>
        </CardContent>
      </Card>
        </Box>
      </Box>

      {/* Submit Button Section */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: { xs: 4, md: 5 },
        mb: 3,
        gap: 2
      }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending || !isFormValid}
          aria-describedby="submit-help"
          sx={{
            minWidth: { xs: '100%', sm: 320, md: 360 },
            height: { xs: 52, sm: 56, md: 60 },
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.15rem' },
            fontWeight: 700,
            borderRadius: 3,
            textTransform: "none",
            letterSpacing: '0.5px',
            background: isFormValid 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
            boxShadow: isFormValid
              ? '0 8px 24px rgba(102, 126, 234, 0.35), 0 4px 8px rgba(102, 126, 234, 0.2)'
              : '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              transition: 'left 0.5s ease',
            },
            '&:hover': {
              background: isFormValid
                ? 'linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%)'
                : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
              boxShadow: isFormValid
                ? '0 12px 32px rgba(102, 126, 234, 0.45), 0 6px 12px rgba(102, 126, 234, 0.3)'
                : '0 2px 4px rgba(0,0,0,0.1)',
              transform: isFormValid ? 'translateY(-3px)' : 'none',
              '&::before': {
                left: '100%',
              },
            },
            '&:active': {
              transform: isFormValid ? 'translateY(-1px)' : 'none',
            },
            '&:disabled': {
              background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
              transform: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {isPending ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress
                size={26}
                color="inherit"
                thickness={4}
                sx={{ color: 'white' }}
              />
              <Typography variant="inherit" sx={{ fontWeight: 600 }}>
                Saving Your Profile...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="inherit" sx={{ fontWeight: 700 }}>
                Continue to Work History
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <Typography sx={{ fontSize: '1.3rem', lineHeight: 1 }}>→</Typography>
              </Box>
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