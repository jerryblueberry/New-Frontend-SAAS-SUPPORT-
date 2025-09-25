import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import useOnboardingStore, {
  useProfileMutation,
} from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';
import './css/WorkerProfileForm.css';
import {
  Card, CardContent, Typography, TextField, Box, InputAdornment, Button, Chip, Stack, MenuItem, Alert,
  Select,
  FormControl,
  InputLabel, CircularProgress, IconButton, Grid, Tooltip, useTheme, useMediaQuery, alpha,
} from '@mui/material';

import CloseIcon from "@mui/icons-material/Close";

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Default languages and skills for suggestions
const DEFAULT_LANGUAGES = [
  'English',
  'Mandarin',
  'Cantonese',
  'Arabic',
  'Vietnamese',
  'Italian',
  'Greek',
  'Hindi',
  'Spanish',
  'French',
  'Bengali',
];

const DEFAULT_SKILLS = [


  "Personal Care",
  'Meal Preparation',
  "Working with Children",
  "Cleaning",
  'First Aid',
  'CPR',




];

// Language proficiency options
const PROFICIENCY_OPTIONS = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
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
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('fluent');
  const [formErrors, setFormErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  // Rich text editor state
  const [biography, setBiography] = useState('');
  const [biographyCharCount, setBiographyCharCount] = useState(0);
  const [isQuillFocused, setIsQuillFocused] = useState(false);
  const quillRef = useRef(null);
  const maxBiographyChars = 1500;

  // Get state and actions from store individually to avoid infinite loop
  const profile = useOnboardingStore((state) => state.profile, shallow);
  const updateProfile = useOnboardingStore((state) => state.updateProfile);
  const addLanguage = useOnboardingStore((state) => state.addLanguage);
  const removeLanguage = useOnboardingStore((state) => state.removeLanguage);
  const updateLanguageProficiency = useOnboardingStore(
    (state) => state.updateLanguageProficiency
  );

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

  // Get plain text length from HTML content
  const getPlainTextLength = useCallback((html) => {
    if (!html) return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent?.length || 0;
  }, []);

  // React Quill configuration
  const quillModules = useMemo(() => ({
    toolbar: {
      container: isMobile ? [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean']
      ] : [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['blockquote', 'link'],
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        // Custom handlers can be added here
      }
    },
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: false
    }
  }), [isMobile]);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'blockquote', 'link', 'align'
  ];

  // Handle biography change
  const handleBiographyChange = useCallback((content) => {
    const plainTextLength = getPlainTextLength(content);
    
    if (plainTextLength > maxBiographyChars) {
      toast.warning(`Biography cannot exceed ${maxBiographyChars} characters`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    
    setBiography(content);
    setBiographyCharCount(plainTextLength);
    updateProfile({ biography: content });
  }, [getPlainTextLength, maxBiographyChars, updateProfile]);

  // Initialize biography from profile
  useEffect(() => {
    const initialBiography = profile.biography || '';
    setBiography(initialBiography);
    setBiographyCharCount(getPlainTextLength(initialBiography));
  }, [profile.biography, getPlainTextLength]);

  // Enhanced validation function
  const validateField = useCallback((fieldName, value) => {
    const errors = {};

    switch (fieldName) {
      case 'biography':
        if (value && typeof value === 'string') {
          const plainTextLength = getPlainTextLength(value);
          if (plainTextLength < VALIDATION_RULES.biography.minLength) {
            errors.biography = `Professional summary must be at least ${VALIDATION_RULES.biography.minLength} characters (currently: ${plainTextLength})`;
          } else if (plainTextLength > VALIDATION_RULES.biography.maxLength) {
            errors.biography = `Professional summary must not exceed ${VALIDATION_RULES.biography.maxLength} characters (currently: ${plainTextLength})`;
          }
        }
        // No error if empty
        break;

      case 'expectedHourlyRate':
        if (!value && value !== 0) {
          errors.expectedHourlyRate = 'Hourly rate is required';
        } else {
          const rate = parseFloat(value);
          if (isNaN(rate) || rate < VALIDATION_RULES.expectedHourlyRate.min) {
            errors.expectedHourlyRate = `Expected Hourly Rate must be above $${VALIDATION_RULES.expectedHourlyRate.min}`;
          } else if (rate > VALIDATION_RULES.expectedHourlyRate.max) {
            errors.expectedHourlyRate = `Hourly rate must not exceed $${VALIDATION_RULES.expectedHourlyRate.max}`;
          }
        }
        break;

      case 'skillTags':
        if (!Array.isArray(value) || value.length < VALIDATION_RULES.skillTags.minCount) {
          errors.skillTags = `Please add at least ${VALIDATION_RULES.skillTags.minCount} skill${VALIDATION_RULES.skillTags.minCount > 1 ? 's' : ''}`;
        } else if (value.length > VALIDATION_RULES.skillTags.maxCount) {
          errors.skillTags = `Maximum ${VALIDATION_RULES.skillTags.maxCount} skills allowed`;
        }
        break;

      case 'languages':
        if (!Array.isArray(value) || value.length < VALIDATION_RULES.languages.minCount) {
          errors.languages = `Please add at least ${VALIDATION_RULES.languages.minCount} language${VALIDATION_RULES.languages.minCount > 1 ? 's' : ''}`;
        } else if (value.length > VALIDATION_RULES.languages.maxCount) {
          errors.languages = `Maximum ${VALIDATION_RULES.languages.maxCount} languages allowed`;
        } else {
          // Validate each language has proper structure and proficiency
          const invalidLanguages = value.filter((lang) => {
            if (!lang || typeof lang !== 'object') return true;

            // Handle both possible data structures
            const languageName = typeof lang.language === 'string'
              ? lang.language
              : lang.language?.language;

            return !languageName ||
              !lang.proficiency ||
              !PROFICIENCY_OPTIONS.some((opt) => opt.value === lang.proficiency);
          });

          if (invalidLanguages.length > 0) {
            errors.languages = 'Please ensure all languages have valid names and proficiency levels';
          }

          // Check for duplicate languages
          const languageNames = value.map(lang =>
            typeof lang.language === 'string' ? lang.language : lang.language?.language
          ).filter(Boolean);

          const uniqueNames = [...new Set(languageNames)];
          if (languageNames.length !== uniqueNames.length) {
            errors.languages = 'Duplicate languages are not allowed';
          }
        }
        break;

      default:
        break;
    }

    return errors;
  }, []);

  // Enhanced comprehensive validation
  const validateForm = useCallback(() => {
    const allErrors = {
      ...validateField('biography', biography),
      ...validateField('expectedHourlyRate', profile.expectedHourlyRate),
      ...validateField('skillTags', profile.skillTags || []),
      ...validateField('languages', profile.languages || []),
    };

    setFormErrors(allErrors); // still shows inline errors
    return allErrors; // return object instead of boolean
  }, [biography, profile, validateField]);

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
  }, [hasAttemptedSubmit, validateField]);

  // Handle form field changes with real-time validation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const processedValue = name === 'expectedHourlyRate' ? parseFloat(value) || 0 : value;

    updateProfile({ [name]: processedValue });

    // Real-time validation after first submit attempt
    validateSingleField(name, processedValue);
  }, [updateProfile, validateSingleField]);

  // Enhanced skill management
  const addSkill = useCallback(() => {
    const trimmed = newSkill.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed.length < 2) {
      setFormErrors(prev => ({ ...prev, newSkill: 'Skill name must be at least 2 characters' }));
      return;
    }

    if (trimmed.length > 50) {
      setFormErrors(prev => ({ ...prev, newSkill: 'Skill name must not exceed 50 characters' }));
      return;
    }

    const currentSkills = profile.skillTags || [];

    if (currentSkills.includes(trimmed)) {
      setFormErrors(prev => ({ ...prev, newSkill: 'This skill has already been added' }));
      return;
    }

    if (currentSkills.length >= VALIDATION_RULES.skillTags.maxCount) {
      setFormErrors(prev => ({ ...prev, newSkill: `Maximum ${VALIDATION_RULES.skillTags.maxCount} skills allowed` }));
      return;
    }

    const updatedSkills = [...currentSkills, trimmed];
    updateProfile({ skillTags: updatedSkills });
    setNewSkill('');

    // Clear any skill-related errors
    setFormErrors(prev => ({
      ...prev,
      newSkill: undefined,
      ...(updatedSkills.length >= VALIDATION_RULES.skillTags.minCount && { skillTags: undefined })
    }));

    validateSingleField('skillTags', updatedSkills);
  }, [newSkill, profile.skillTags, updateProfile, validateSingleField]);

  // Remove a skill
  const removeSkill = useCallback((skill) => {
    const updatedSkills = (profile.skillTags || []).filter(s => s !== skill);
    updateProfile({ skillTags: updatedSkills });
    validateSingleField('skillTags', updatedSkills);
  }, [profile.skillTags, updateProfile, validateSingleField]);

  // Enhanced language management
  const addNewLanguage = useCallback(() => {
    const trimmed = newLanguage.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed.length < 2) {
      setFormErrors(prev => ({ ...prev, newLanguage: 'Language name must be at least 2 characters' }));
      return;
    }

    if (trimmed.length > 30) {
      setFormErrors(prev => ({ ...prev, newLanguage: 'Language name must not exceed 30 characters' }));
      return;
    }

    const currentLanguages = profile.languages || [];

    // Check for duplicates (handle both data structures)
    const languageExists = currentLanguages.some(lang => {
      const existingName = typeof lang.language === 'string'
        ? lang.language
        : lang.language?.language;
      return existingName === trimmed;
    });

    if (languageExists) {
      setFormErrors(prev => ({ ...prev, newLanguage: 'This language has already been added' }));
      return;
    }

    if (currentLanguages.length >= VALIDATION_RULES.languages.maxCount) {
      setFormErrors(prev => ({ ...prev, newLanguage: `Maximum ${VALIDATION_RULES.languages.maxCount} languages allowed` }));
      return;
    }

    const newLangObj = {
      language: trimmed,
      proficiency: languageProficiency,
    };

    addLanguage(newLangObj);
    setNewLanguage('');
    setLanguageProficiency('fluent');

    // Clear any language-related errors
    setFormErrors(prev => ({
      ...prev,
      newLanguage: undefined,
      ...((currentLanguages.length + 1) >= VALIDATION_RULES.languages.minCount && { languages: undefined })
    }));

    validateSingleField('languages', [...currentLanguages, newLangObj]);
  }, [newLanguage, languageProficiency, profile.languages, addLanguage, validateSingleField]);

  // Remove a language
  const removeSelectedLanguage = useCallback((language) => {
    removeLanguage(language);
    const updatedLanguages = (profile.languages || []).filter(lang => lang !== language);
    validateSingleField('languages', updatedLanguages);
  }, [removeLanguage, profile.languages, validateSingleField]);

  // Update language proficiency
  const updateProficiency = useCallback((languageName, proficiency) => {
    updateLanguageProficiency(languageName, proficiency);
    validateSingleField('languages', profile.languages);
  }, [updateLanguageProficiency, profile.languages, validateSingleField]);
  //  Enhanced form submit 
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const errors = validateForm();
    const errorMessages = Object.values(errors);

    if (errorMessages.length > 0) {
      // Show toast notifications for each error
      toast.dismiss();
      errorMessages.forEach(message => {
        toast.error(message, {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: '⚠️',
        });
      });

      // Scroll to first error
      const firstErrorField = document.querySelector(
        '.profile_wrkr_basic_input_error, .profile_wrkr_basic_error_text'
      );
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return; // ⛔ stop submission
    }

    // ✅ No errors → submit
    console.log('Submitting profile:', {
      biography: biography?.trim(),
      skillTags: profile.skillTags,
      expectedHourlyRate: profile.expectedHourlyRate,
      languages: profile.languages,
    });

    saveProfile({
      ...profile,
      biography: biography?.trim(),
    });
  }, [profile, saveProfile, validateForm]);

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = useMemo(() => {
    // biography is now optional, so no check for it
    if (!profile.expectedHourlyRate ||
      profile.expectedHourlyRate < VALIDATION_RULES.expectedHourlyRate.min) {
      return false;
    }
    if (!profile.skillTags || profile.skillTags.length < VALIDATION_RULES.skillTags.minCount) {
      return false;
    }
    if (!profile.languages || profile.languages.length < VALIDATION_RULES.languages.minCount) {
      return false;
    }
    // Validate language proficiencies
    const hasInvalidLanguages = profile.languages.some(lang => {
      const languageName = typeof lang.language === 'string'
        ? lang.language
        : lang.language?.language;
      return !languageName ||
        !lang.proficiency ||
        !PROFICIENCY_OPTIONS.some(opt => opt.value === lang.proficiency);
    });
    return !hasInvalidLanguages;
  }, [profile]);

  // Memoized skill tags display
  const skillTags = useMemo(() => {
    const skills = profile.skillTags || [];

    if (skills.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Your Skills ({skills.length}/{VALIDATION_RULES.skillTags.maxCount})
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              onDelete={() => removeSkill(skill)}
              disabled={isPending}

              color="primary"
              variant="outlined"
              sx={{ borderRadius: 2, fontWeight: 500 }}
            />
          ))}
        </Stack>
      </Box>

    );
  }, [profile.skillTags, removeSkill, isPending]);

  // Memoized language tags display with proper data structure handling
  const languageTags = useMemo(() => {
    const languages = profile.languages || [];

    if (languages.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 3 }}>
        {/* Heading */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Your Languages ({languages.length}/{VALIDATION_RULES.languages.maxCount})
        </Typography>

        {/* Responsive Grid */}
        <Grid container spacing={2}>
          {languages.map((lang, index) => {
            const languageName =
              typeof lang.language === "string"
                ? lang.language
                : lang.language?.language || "Unknown";

            const key = `${languageName}-${index}`;

            return (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    "&:hover": { boxShadow: 2 },
                    display: "flex",
                    alignItems: "center",
                    // p: 1,
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      width: "100%",
                      p: "8px !important",
                    }}
                  >
                    {/* Language Name */}
                    <Typography fontWeight={600} flex={1} noWrap>
                      {languageName}
                    </Typography>

                    {/* Proficiency Dropdown */}
                    <Select
                      value={lang.proficiency || "fluent"}
                      size="small"
                      onChange={(e) => updateProficiency(languageName, e.target.value)}
                      disabled={isPending}
                      sx={{ minWidth: 120 }}
                    >
                      {PROFICIENCY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>

                    {/* Remove Button */}
                    <IconButton
                      onClick={() => removeSelectedLanguage(lang)}
                      disabled={isPending}
                      size="small"
                      color="error"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }, [profile.languages, removeSelectedLanguage, updateProficiency, isPending]);

  // Handle input changes for new skill/language with validation
  const handleNewSkillChange = useCallback((e) => {
    const value = e.target.value;
    setNewSkill(value);

    // Clear previous errors when user starts typing
    if (formErrors.newSkill) {
      setFormErrors(prev => ({ ...prev, newSkill: undefined }));
    }
  }, [formErrors.newSkill]);

  const handleNewLanguageChange = useCallback((e) => {
    const value = e.target.value;
    setNewLanguage(value);

    // Clear previous errors when user starts typing
    if (formErrors.newLanguage) {
      setFormErrors(prev => ({ ...prev, newLanguage: undefined }));
    }
  }, [formErrors.newLanguage]);

  // Handle suggested skill/language clicks
  const handleSuggestedSkillClick = useCallback((skill) => {
    const currentSkills = profile.skillTags || [];

    if (currentSkills.includes(skill)) {
      removeSkill(skill);
    } else if (currentSkills.length < VALIDATION_RULES.skillTags.maxCount) {
      const updatedSkills = [...currentSkills, skill];
      updateProfile({ skillTags: updatedSkills });
      validateSingleField('skillTags', updatedSkills);
    }
  }, [profile.skillTags, removeSkill, updateProfile, validateSingleField]);

  const handleSuggestedLanguageClick = useCallback((language) => {
    const currentLanguages = profile.languages || [];

    // Check if language exists
    const existingLang = currentLanguages.find(lang => {
      const existingName = typeof lang.language === 'string'
        ? lang.language
        : lang.language?.language;
      return existingName === language;
    });

    if (existingLang) {
      removeSelectedLanguage(existingLang);
    } else if (currentLanguages.length < VALIDATION_RULES.languages.maxCount) {
      const newLangObj = {
        language: language,
        proficiency: 'fluent',
      };
      addLanguage(newLangObj);
      validateSingleField('languages', [...currentLanguages, newLangObj]);
    }
  }, [profile.languages, removeSelectedLanguage, addLanguage, validateSingleField]);

  // Effect to clear errors when component mounts
  useEffect(() => {
    setFormErrors({});
  }, []);

  // Debug effect to check ReactQuill availability
  useEffect(() => {
    console.log('ReactQuill available:', !!ReactQuill);
    console.log('Biography state:', biography);
    console.log('Biography char count:', biographyCharCount);
  }, [biography, biographyCharCount]);

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

      {/* Professional Summary Section */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'visible',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
            transform: 'translateY(-1px)',
            transition: 'all 0.3s ease-in-out'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px 16px 0 0'
          }}
        />
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography sx={{ fontSize: '1.5rem' }}>👤</Typography>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                Professional Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Share your experience and what makes you unique
              </Typography>
            </Box>
          </Box>

          {/* Character Count Display */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Chip
              size="small"
              label={`${biographyCharCount}/${VALIDATION_RULES.biography.maxLength}`}
              variant="outlined"
              color={biographyCharCount > VALIDATION_RULES.biography.maxLength * 0.9 ? 'warning' : 'default'}
              sx={{ borderRadius: 2 }}
            />
          </Box>

          {/* React Quill Editor */}
          <Box 
            sx={{ 
              position: 'relative',
              width: '100%',
              minHeight: '300px',
              '& .quill-biography-editor': {
                width: '100% !important',
                display: 'block !important',
                visibility: 'visible !important',
                position: 'relative',
              },
              '& .ql-toolbar.ql-snow': {
                border: `1px solid ${alpha(theme.palette.divider, 0.2)} !important`,
                borderBottom: 'none',
                borderRadius: '12px 12px 0 0',
                background: `${alpha(theme.palette.grey[50], 0.8)}`,
                padding: '12px 16px',
                width: '100% !important',
                boxSizing: 'border-box',
                display: 'block !important',
                visibility: 'visible !important',
              },
              '& .ql-container.ql-snow': {
                border: `1px solid ${alpha(theme.palette.divider, 0.2)} !important`,
                borderRadius: '0 0 12px 12px',
                fontFamily: theme.typography.fontFamily,
                fontSize: '1rem',
                lineHeight: 1.6,
                width: '100% !important',
                boxSizing: 'border-box',
                background: theme.palette.background.paper,
                display: 'block !important',
                visibility: 'visible !important',
              },
              '& .ql-editor': {
                minHeight: '300px !important',
                maxHeight: '500px',
                padding: '24px',
                color: theme.palette.text.primary,
                overflowY: 'auto',
                width: '100% !important',
                boxSizing: 'border-box',
                fontSize: '1rem',
                lineHeight: 1.6,
                letterSpacing: '0.01em',
                display: 'block !important',
                visibility: 'visible !important',
                scrollbarWidth: 'thin',
                scrollbarColor: `${alpha(theme.palette.grey[400], 0.6)} transparent`,
              },
              '& .ql-editor.ql-blank::before': {
                content: '"Describe your experience, key strengths, and what makes you an exceptional care worker. Share your passion for helping others and any specialized skills you bring to your role."',
                color: `${alpha(theme.palette.text.secondary, 0.7)}`,
                fontStyle: 'italic',
                fontWeight: 400,
                left: '24px',
                right: '24px',
                top: '24px',
                bottom: 'auto',
                position: 'absolute',
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                lineHeight: 1.6,
                fontSize: '1rem',
                letterSpacing: '0.01em',
                zIndex: 1,
              },
              '& .ql-editor:focus': {
                outline: 'none',
                background: `${alpha(theme.palette.primary.main, 0.01)}`,
                borderColor: 'transparent',
              },
              '& .ql-editor:focus-within': {
                background: `${alpha(theme.palette.primary.main, 0.01)}`,
              },
              '& .ql-editor::selection': {
                background: `${alpha(theme.palette.primary.main, 0.2)}`,
                color: theme.palette.text.primary,
              },
              '& .ql-toolbar .ql-formats': {
                marginRight: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              },
              '& .ql-toolbar button': {
                borderRadius: '10px',
                margin: '0 3px',
                padding: '10px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                background: 'transparent',
                minWidth: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              },
              '& .ql-toolbar button::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'transparent',
                borderRadius: '10px',
                transition: 'all 0.25s ease',
                transform: 'scale(0)',
              },
              '& .ql-toolbar button:hover::before': {
                background: `${alpha(theme.palette.primary.main, 0.08)}`,
                transform: 'scale(1)',
              },
              '& .ql-toolbar button:hover': {
                color: theme.palette.primary.main,
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
              },
              '& .ql-toolbar button.ql-active': {
                background: `${alpha(theme.palette.primary.main, 0.12)}`,
                color: theme.palette.primary.main,
                transform: 'translateY(0)',
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
              '& .ql-toolbar button.ql-active::before': {
                background: `${alpha(theme.palette.primary.main, 0.08)}`,
                transform: 'scale(1)',
              },
              '& .ql-toolbar .ql-picker': {
                borderRadius: '10px',
                transition: 'all 0.25s ease',
              },
              '& .ql-toolbar .ql-picker:hover': {
                background: `${alpha(theme.palette.primary.main, 0.08)}`,
              },
              '& .ql-container': {
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              '&:hover .ql-container': {
                borderColor: `${alpha(theme.palette.primary.main, 0.3)}`,
              },
              '&.focused .ql-container, & .ql-container:focus-within': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.08)}, 0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
                transform: 'translateY(-2px)',
              },
              '& .ql-editor h1, & .ql-editor h2, & .ql-editor h3': {
                fontWeight: 700,
                color: theme.palette.text.primary,
                margin: '1.5em 0 0.75em 0',
                letterSpacing: '-0.01em',
              },
              '& .ql-editor h1': {
                fontSize: '1.75em',
              },
              '& .ql-editor h2': {
                fontSize: '1.5em',
              },
              '& .ql-editor h3': {
                fontSize: '1.25em',
              },
              '& .ql-editor h1:first-child, & .ql-editor h2:first-child, & .ql-editor h3:first-child': {
                marginTop: 0,
              },
              '& .ql-editor p': {
                margin: '0.75em 0',
                textAlign: 'left',
                lineHeight: 1.7,
                fontSize: '1rem',
                letterSpacing: '0.01em',
              },
              '& .ql-editor p:first-child': {
                marginTop: 0,
              },
              '& .ql-editor p:last-child': {
                marginBottom: 0,
              },
              '& .ql-editor ul, & .ql-editor ol': {
                margin: '0.75em 0',
                paddingLeft: '1.5em',
                lineHeight: 1.7,
              },
              '& .ql-editor ul': {
                listStyleType: 'disc',
              },
              '& .ql-editor ol': {
                listStyleType: 'decimal',
              },
              '& .ql-editor li': {
                margin: '0.4em 0',
                lineHeight: 1.7,
                fontSize: '1rem',
                letterSpacing: '0.01em',
              },
              '& .ql-editor strong': {
                fontWeight: 700,
                color: theme.palette.text.primary,
              },
              '& .ql-editor em': {
                fontStyle: 'italic',
                color: `${alpha(theme.palette.text.primary, 0.9)}`,
              },
              '& .ql-editor a': {
                color: theme.palette.primary.main,
                textDecoration: 'none',
                background: `linear-gradient(transparent 60%, ${alpha(theme.palette.primary.main, 0.2)} 60%)`,
                padding: '2px 4px',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
              },
              '& .ql-editor a:hover': {
                background: `${alpha(theme.palette.primary.main, 0.15)}`,
                transform: 'translateY(-1px)',
              },
              '& .ql-editor blockquote': {
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                margin: '1em 0',
                paddingLeft: '1.5em',
                paddingRight: '1em',
                paddingTop: '0.75em',
                paddingBottom: '0.75em',
                color: `${alpha(theme.palette.text.primary, 0.85)}`,
                fontStyle: 'italic',
                background: `${alpha(theme.palette.grey[50], 0.4)}`,
                borderRadius: '0 8px 8px 0',
                lineHeight: 1.6,
                fontSize: '0.95rem',
                letterSpacing: '0.01em',
              },
              '& .ql-editor::-webkit-scrollbar': {
                width: '6px',
              },
              '& .ql-editor::-webkit-scrollbar-track': {
                background: 'transparent',
                borderRadius: '3px',
              },
              '& .ql-editor::-webkit-scrollbar-thumb': {
                background: `${alpha(theme.palette.grey[400], 0.6)}`,
                borderRadius: '3px',
                transition: 'all 0.2s ease',
              },
              '& .ql-editor::-webkit-scrollbar-thumb:hover': {
                background: `${alpha(theme.palette.grey[500], 0.8)}`,
                width: '8px',
              },
              '& .ql-toolbar.ql-snow:hover': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.95)} 0%, ${alpha(theme.palette.grey[100], 0.7)} 100%)`,
              },
              '& .ql-tooltip': {
                borderRadius: '8px',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                background: theme.palette.background.paper,
                backdropFilter: 'blur(10px)',
              },
              '&.loading': {
                opacity: 0.7,
                pointerEvents: 'none',
              },
              '&.loading .ql-editor': {
                background: `${alpha(theme.palette.grey[100], 0.3)}`,
              },
              // Responsive adjustments
              [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                '& .ql-toolbar.ql-snow': {
                  padding: '8px 12px',
                  flexWrap: 'wrap',
                  gap: '4px',
                },
                '& .ql-editor': {
                  padding: '16px',
                  minHeight: '250px !important',
                  fontSize: '0.95rem',
                },
                '& .ql-editor.ql-blank::before': {
                  left: '16px',
                  right: '16px',
                  top: '16px',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                },
                '& .ql-toolbar .ql-formats': {
                  marginRight: '8px',
                  marginBottom: '4px',
                },
                '& .ql-toolbar button': {
                  minWidth: '32px',
                  height: '32px',
                  padding: '6px',
                },
                '& .ql-editor p': {
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                },
                '& .ql-editor li': {
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                },
              },
            }}
          >
            <ReactQuill 
              ref={quillRef}
              theme="snow"
              value={biography}
              onChange={handleBiographyChange}
              onFocus={() => setIsQuillFocused(true)}
              onBlur={() => setIsQuillFocused(false)}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Describe your experience, key strengths, and what makes you an exceptional care worker. Share your passion for helping others and any specialized skills you bring to your role."
              readOnly={isPending}
              className={`quill-biography-editor ${isQuillFocused ? 'focused' : ''} ${isPending ? 'loading' : ''}`}
            />
          </Box>

          {formErrors.biography && (
            <Typography 
              variant="caption" 
              color="error" 
              sx={{ mt: 1, display: 'block' }}
            >
              {formErrors.biography}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Expected Hourly Rate Section */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'visible',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
            transform: 'translateY(-1px)',
            transition: 'all 0.3s ease-in-out'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
            borderRadius: '16px 16px 0 0'
          }}
        />
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #4ade8020 0%, #22c55e20 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography sx={{ fontSize: '1.5rem' }}>💰</Typography>
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                Expected Hourly Rate
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set your preferred hourly rate in AUD
              </Typography>
            </Box>
          </Box>

          <TextField
            id="expectedHourlyRate"
            name="expectedHourlyRate"
            label="Your hourly rate"
            type="number"
            fullWidth
            required
            value={profile.expectedHourlyRate || ''}
            onChange={handleChange}
            error={Boolean(formErrors.expectedHourlyRate)}
            // helperText={formErrors.expectedHourlyRate || `Range: $${VALIDATION_RULES.expectedHourlyRate.min} - $${VALIDATION_RULES.expectedHourlyRate.max} AUD`}
            inputProps={{
              min: VALIDATION_RULES.expectedHourlyRate.min,
              max: VALIDATION_RULES.expectedHourlyRate.max,
              step: 0.5,
            }}
            onWheel={e => e.target.blur()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>$</Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#fafafa',
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                }
              },
              '& .MuiInputLabel-root': {
                fontSize: '1.05rem',
                fontWeight: 500
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'visible',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
            transform: 'translateY(-1px)',
            transition: 'all 0.3s ease-in-out'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '16px 16px 0 0'
          }}
        />
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f59e0b20 0%, #d9770620 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography sx={{ fontSize: '1.5rem' }}>🛠️</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                Skills & Expertise
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Select from popular skills or add your own specialized abilities
              </Typography>
            </Box>
            <Chip
              label={`${(profile.skillTags || []).length}/${VALIDATION_RULES.skillTags.maxCount}`}
              size="small"
              color={(profile.skillTags || []).length > 0 ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          {/* Add Custom Skill */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row', md: 'row' }, alignItems: 'flex-start' }}>
            <TextField
              id="newSkill"
              label="Add your unique skill"
              variant="outlined"
              fullWidth
              size="small"
              value={newSkill}
              onChange={handleNewSkillChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              error={Boolean(formErrors.newSkill)}
              helperText={formErrors.newSkill || 'Press Enter or click Add to include this skill'}
              inputProps={{ maxLength: 50 }}
              disabled={
                isPending ||
                (profile.skillTags || []).length >= VALIDATION_RULES.skillTags.maxCount
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#fafafa',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  '&.Mui-focused': { backgroundColor: 'white' }
                },
                // width:'120px'
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={addSkill}
              disabled={
                isPending ||
                !newSkill.trim() ||
                (profile.skillTags || []).length >= VALIDATION_RULES.skillTags.maxCount
              }
              sx={{
                minWidth: { xs: '100%', sm: 120, },
                width: '10%',
                marginRight: '10px',
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                }
              }}
            >
              Add Skill
            </Button>
          </Box>

          {/* Skill Tags Error */}
          {formErrors.skillTags && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {formErrors.skillTags}
            </Alert>
          )}

          {/* Popular Skills */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
            Popular Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {DEFAULT_SKILLS.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                clickable
                color={(profile.skillTags || []).includes(skill) ? 'primary' : 'default'}
                variant={(profile.skillTags || []).includes(skill) ? 'filled' : 'outlined'}
                onClick={() => handleSuggestedSkillClick(skill)}
                disabled={
                  isPending ||
                  (!(profile.skillTags || []).includes(skill) &&
                    (profile.skillTags || []).length >= VALIDATION_RULES.skillTags.maxCount)
                }
                sx={{
                  borderRadius: 3,
                  height: 40,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  '&.MuiChip-filled': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  }
                }}
              />
            ))}
          </Box>

          {/* Selected Skills Display */}
          {skillTags && (
            <Box sx={{ mt: 3 }}>

              {skillTags}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Languages Section */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'visible',
          position: 'relative',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
            transform: 'translateY(-1px)',
            transition: 'all 0.3s ease-in-out'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)',
            borderRadius: '16px 16px 0 0'
          }}
        />
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #8b5cf620 0%, #6366f120 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography sx={{ fontSize: '1.5rem' }}>🌍</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={600} color="text.primary">
                Languages Spoken
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Communication skills that help you connect with diverse clients
              </Typography>
            </Box>
            <Chip
              label={`${(profile.languages || []).length}/${VALIDATION_RULES.languages.maxCount}`}
              size="small"
              color={(profile.languages || []).length >= VALIDATION_RULES.languages.minCount ? 'primary' : 'warning'}
              sx={{ fontWeight: 600 }}
            />
          </Box>

          <Alert
            severity="info"
            sx={{ mb: 3, borderRadius: 2, backgroundColor: '#f0f9ff' }}
          >
            <Typography variant="body2">
              <strong>Minimum {VALIDATION_RULES.languages.minCount} languages required.</strong>
              {' '}Select languages you're comfortable speaking with clients.
            </Typography>
          </Alert>

          {/* Popular Languages */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
            Popular Languages
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {DEFAULT_LANGUAGES.map((language) => {
              const isSelected = (profile.languages || []).some((lang) => {
                const existingName =
                  typeof lang.language === 'string'
                    ? lang.language
                    : lang.language?.language;
                return existingName === language;
              });

              return (
                <Chip
                  key={language}
                  label={language}
                  clickable
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  onClick={() => handleSuggestedLanguageClick(language)}
                  disabled={
                    isPending ||
                    (!isSelected &&
                      (profile.languages || []).length >= VALIDATION_RULES.languages.maxCount)
                  }
                  sx={{
                    borderRadius: 3,
                    height: 40,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    },
                    '&.MuiChip-filled': {
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      color: 'white',
                    }
                  }}
                />
              );
            })}
          </Box>

          {/* Add Custom Language */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
            Add Custom Language
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr auto' },
            gap: 2,
            mb: 2
          }}>
            <TextField
              id="newLanguage"
              label="Language name"
              variant="outlined"
              fullWidth
              size="small"
              value={newLanguage}
              onChange={handleNewLanguageChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNewLanguage();
                }
              }}
              inputProps={{ maxLength: 30 }}
              error={Boolean(formErrors.newLanguage)}
              helperText={formErrors.newLanguage || ''}
              disabled={
                isPending ||
                (profile.languages || []).length >= VALIDATION_RULES.languages.maxCount
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: '#fafafa',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  '&.Mui-focused': { backgroundColor: 'white' }
                }
              }}
            />

            <FormControl fullWidth size="small" disabled={isPending}>
              <InputLabel id="proficiency-label">Proficiency Level</InputLabel>
              <Select
                labelId="proficiency-label"
                id="proficiency"
                value={languageProficiency}
                onChange={(e) => setLanguageProficiency(e.target.value)}
                label="Proficiency Level"   // ✅ important: ties label to select
                MenuProps={{
                  PaperProps: { style: { maxHeight: 200 } },
                }}
                sx={{
                  borderRadius: 3,
                  backgroundColor: '#fafafa',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  '&.Mui-focused': { backgroundColor: 'white' }
                }}
              >
                {PROFICIENCY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>


            <Button
              variant="contained"
              color="primary"
              onClick={addNewLanguage}
              disabled={
                isPending ||
                !newLanguage.trim() ||
                (profile.languages || []).length >= VALIDATION_RULES.languages.maxCount
              }
              sx={{
                minWidth: { xs: '100%', sm: 120 },
                height: '40px',
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)',
                }
              }}
            >
              Add
            </Button>
          </Box>

          {/* Languages Error */}
          {formErrors.languages && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {formErrors.languages}
            </Alert>
          )}

          {/* Selected Languages Display */}
          {languageTags && (
            <Box sx={{ mt: 3 }}>

              {languageTags}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 4,
        mb: 2
      }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isPending}
          aria-describedby="submit-help"
          sx={{
            minWidth: { xs: '100%', sm: 280 },
            height: 56,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: 4,
            textTransform: "none",
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a0 100%)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.5)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: '#e0e0e0',
              transform: 'none',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {isPending ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress
                size={24}
                color="inherit"
                thickness={4}
              />
              <Typography variant="inherit">
                Saving Your Profile...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="inherit">
                Continue to Work History
              </Typography>
              <Typography sx={{ fontSize: '1.2rem' }}>→</Typography>
            </Box>
          )}
        </Button>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          textAlign: 'center',
          fontSize: '0.9rem'
        }}
      >
        Your information is secure and will only be shared with potential clients
      </Typography>
    </Box>
  );
});

WorkerProfileForm.displayName = 'WorkerProfileForm';
export default WorkerProfileForm;