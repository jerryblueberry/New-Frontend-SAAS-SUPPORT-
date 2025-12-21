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
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" fontWeight={600} sx={{ mb: 1, color: 'text.primary', display: 'block', fontSize: '0.8rem' }}>
          Your Skills ({skills.length}/{VALIDATION_RULES.skillTags.maxCount})
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              onDelete={() => removeSkill(skill)}
              disabled={isPending}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ 
                borderRadius: 2, 
                fontWeight: 500,
                fontSize: '0.8rem',
                height: 28,
                '& .MuiChip-deleteIcon': {
                  fontSize: '1rem'
                }
              }}
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
      <Box sx={{ 
        mt: { xs: 1.5, sm: 1.5, md: 1.5 },
        mb: { xs: 0, sm: 0, md: 0 },
        mx: { xs: 0, sm: 0, md: 0 }
      }}>
        {/* Heading */}
        <Typography variant="caption" fontWeight={600} sx={{ mb: 1, color: 'text.primary', display: 'block', fontSize: '0.8rem' }}>
          Your Languages ({languages.length}/{VALIDATION_RULES.languages.maxCount})
        </Typography>

        {/* Responsive Grid */}
        <Grid container spacing={1.5} sx={{ 
          mx: { xs: 0, sm: 0, md: 0 },
          mb: { xs: 0, sm: 0, md: 0 },
          mt: { xs: 0, sm: 0, md: 0 }
        }}>
          {languages.map((lang, index) => {
            const languageName =
              typeof lang.language === "string"
                ? lang.language
                : lang.language?.language || "Unknown";

            const key = `${languageName}-${index}`;

            return (
              <Grid item xs={12} sm={12} md={12} key={key}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    "&:hover": { 
                      boxShadow: 2,
                      bgcolor: "grey.100",
                      transition: 'all 0.2s ease'
                    },
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      width: "100%",
                      p: "6px 10px !important",
                    }}
                  >
                    {/* Language Name */}
                    <Typography fontWeight={600} flex={1} noWrap sx={{ fontSize: '0.85rem' }}>
                      {languageName}
                    </Typography>

                    {/* Proficiency Dropdown */}
                    <Select
                      value={lang.proficiency || "fluent"}
                      size="small"
                      onChange={(e) => updateProficiency(languageName, e.target.value)}
                      disabled={isPending}
                      sx={{ 
                        minWidth: 90,
                        height: '30px',
                        fontSize: '0.8rem',
                        '& .MuiSelect-select': {
                          py: 0.5,
                          fontSize: '0.8rem'
                        }
                      }}
                    >
                      {PROFICIENCY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.8rem' }}>
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
                      sx={{ 
                        width: 26,
                        height: 26,
                        '& .MuiSvgIcon-root': {
                          fontSize: '0.9rem'
                        }
                      }}
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
      <Card
        elevation={0}
        sx={{
              height: { xs: 'auto', sm: 'auto', md: '100%' },
              minHeight: { xs: 'auto', sm: 'auto', md: '900px' },
          borderRadius: 4,
          border: '1px solid',
              borderColor: { xs: 'divider', sm: 'divider', md: 'rgba(102, 126, 234, 0.12)' },
          overflow: 'visible',
          position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              background: { xs: 'white', sm: 'white', md: 'linear-gradient(to bottom, #ffffff 0%, #fafbff 100%)' },
              boxShadow: { 
                xs: 'none', 
                sm: 'none', 
                md: '0 4px 20px rgba(102, 126, 234, 0.08), 0 1px 3px rgba(0,0,0,0.05)' 
              },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
                boxShadow: { 
                  xs: 'none', 
                  sm: 'none', 
                  md: '0 8px 40px rgba(102, 126, 234, 0.15), 0 4px 12px rgba(0,0,0,0.08)' 
                },
                transform: { xs: 'none', sm: 'none', md: 'translateY(-4px)' },
                borderColor: { xs: 'divider', sm: 'divider', md: 'rgba(102, 126, 234, 0.2)' },
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
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
                borderRadius: '16px 16px 0 0',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
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
              p: { xs: 3, sm: 3.5, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              boxSizing: 'border-box',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
                opacity: 0.5
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
            <Box
              sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                    mr: 2,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)'
              }}
            >
                  <Typography sx={{ fontSize: '1.35rem' }}>👤</Typography>
            </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1.15rem', md: '1.3rem' }, mb: 0.5 }}>
                Professional Summary
              </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                Share your experience and what makes you unique
              </Typography>
            </Box>
          </Box>

          {/* Character Count Display */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, flexShrink: 0 }}>
            <Chip
              size="small"
              label={`${biographyCharCount}/${VALIDATION_RULES.biography.maxLength}`}
              variant="outlined"
              color={biographyCharCount > VALIDATION_RULES.biography.maxLength * 0.9 ? 'warning' : 'default'}
                  sx={{ 
                    borderRadius: 2, 
                    fontSize: '0.75rem', 
                    height: 26,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
            />
          </Box>

          {/* React Quill Editor */}
          <Box 
            sx={{ 
              position: 'relative',
              width: '100%',
                  flex: 1,
                  minHeight: { xs: '300px', sm: '350px', md: '650px' },
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: { xs: 2, sm: 2.5, md: 3 },
                  overflow: 'hidden',
                  bgcolor: { xs: 'transparent', sm: 'rgba(255, 255, 255, 0.3)', md: 'rgba(255, 255, 255, 0.6)' },
                  border: { xs: '1px solid rgba(0, 0, 0, 0.08)', sm: '1px solid rgba(102, 126, 234, 0.06)', md: '1px solid rgba(102, 126, 234, 0.08)' },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: { 
                    xs: 'inset 0 1px 4px rgba(0,0,0,0.02)', 
                    sm: 'inset 0 2px 6px rgba(102, 126, 234, 0.03)', 
                    md: 'inset 0 2px 8px rgba(102, 126, 234, 0.04)' 
                  },
                  '&:hover': {
                    bgcolor: { xs: 'rgba(255, 255, 255, 0.5)', sm: 'rgba(255, 255, 255, 0.7)', md: 'rgba(255, 255, 255, 0.9)' },
                    borderColor: { xs: 'rgba(0, 0, 0, 0.12)', sm: 'rgba(102, 126, 234, 0.12)', md: 'rgba(102, 126, 234, 0.15)' },
                    boxShadow: { 
                      xs: 'inset 0 1px 6px rgba(0,0,0,0.03)', 
                      sm: 'inset 0 2px 10px rgba(102, 126, 234, 0.05)', 
                      md: 'inset 0 2px 12px rgba(102, 126, 234, 0.06)' 
                    }
                  },
                  '&:focus-within': {
                    borderColor: { xs: 'rgba(102, 126, 234, 0.2)', sm: 'rgba(102, 126, 234, 0.25)', md: 'rgba(102, 126, 234, 0.3)' },
                    boxShadow: { 
                      xs: '0 0 0 3px rgba(102, 126, 234, 0.1)', 
                      sm: '0 0 0 4px rgba(102, 126, 234, 0.12)', 
                      md: '0 0 0 4px rgba(102, 126, 234, 0.15)' 
                    }
                  },
              '& .quill-biography-editor': {
                width: '100% !important',
                display: 'block !important',
                visibility: 'visible !important',
                position: 'relative',
              },
              '& .ql-toolbar.ql-snow': {
                border: `1px solid ${alpha(theme.palette.divider, 0.2)} !important`,
                borderBottom: 'none',
                    borderRadius: { xs: '8px 8px 0 0', sm: '10px 10px 0 0', md: '12px 12px 0 0' },
                background: `${alpha(theme.palette.grey[50], 0.8)}`,
                    padding: { xs: '8px 10px', sm: '9px 11px', md: '10px 12px' },
                width: '100% !important',
                boxSizing: 'border-box',
                display: 'block !important',
                visibility: 'visible !important',
                    flexWrap: { xs: 'wrap', sm: 'nowrap', md: 'nowrap' },
                    gap: { xs: '4px', sm: '6px', md: '8px' },
                    [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                      padding: '6px 8px',
                      '& .ql-formats': {
                        marginRight: '8px !important',
                        marginBottom: '4px',
                      }
                    }
              },
              '& .ql-container.ql-snow': {
                border: `1px solid ${alpha(theme.palette.divider, 0.2)} !important`,
                    borderRadius: { xs: '0 0 8px 8px', sm: '0 0 10px 10px', md: '0 0 12px 12px' },
                fontFamily: theme.typography.fontFamily,
                    fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
                lineHeight: 1.6,
                width: '100% !important',
                boxSizing: 'border-box',
                background: theme.palette.background.paper,
                display: 'block !important',
                visibility: 'visible !important',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              '& .ql-editor': {
                    minHeight: { xs: '300px !important', sm: '350px !important', md: '650px !important' },
                    maxHeight: { xs: '400px', sm: '500px', md: 'none' },
                    padding: { xs: '12px 16px', sm: '14px 18px', md: '16px 20px' },
                color: theme.palette.text.primary,
                overflowY: 'auto',
                width: '100% !important',
                boxSizing: 'border-box',
                    fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
                    lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
                letterSpacing: '0.01em',
                display: 'block !important',
                visibility: 'visible !important',
                scrollbarWidth: 'thin',
                scrollbarColor: `${alpha(theme.palette.grey[400], 0.6)} transparent`,
                    WebkitOverflowScrolling: 'touch',
                    '&::-webkit-scrollbar': {
                      width: { xs: '4px', sm: '5px', md: '6px' },
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                      borderRadius: '3px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: `${alpha(theme.palette.grey[400], 0.5)}`,
                      borderRadius: '3px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: `${alpha(theme.palette.grey[500], 0.7)}`,
                      }
                    }
              },
              '& .ql-editor.ql-blank::before': {
                content: '"Describe your experience, key strengths, and what makes you an exceptional care worker. Share your passion for helping others and any specialized skills you bring to your role."',
                color: `${alpha(theme.palette.text.secondary, 0.7)}`,
                fontStyle: 'italic',
                fontWeight: 400,
                    left: { xs: '16px', sm: '18px', md: '20px' },
                    right: { xs: '16px', sm: '18px', md: '20px' },
                    top: { xs: '12px', sm: '14px', md: '16px' },
                bottom: 'auto',
                position: 'absolute',
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                    lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
                    fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
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
                    marginRight: { xs: '8px', sm: '12px', md: '16px' },
                display: 'inline-flex',
                alignItems: 'center',
                    gap: { xs: '2px', sm: '3px', md: '4px' },
                    [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                      marginRight: '6px !important',
                      marginBottom: '4px',
                    }
              },
              '& .ql-toolbar button': {
                    borderRadius: { xs: '6px', sm: '7px', md: '8px' },
                    margin: { xs: '0 1px', sm: '0 1.5px', md: '0 2px' },
                    padding: { xs: '6px', sm: '7px', md: '8px' },
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                border: 'none',
                background: 'transparent',
                    minWidth: { xs: '28px', sm: '30px', md: '32px' },
                    height: { xs: '28px', sm: '30px', md: '32px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                    fontSize: { xs: '14px', sm: '15px', md: '16px' },
                    '&:active': {
                      transform: 'scale(0.95)',
                    }
              },
              '& .ql-toolbar button::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'transparent',
                    borderRadius: '8px',
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
                    borderRadius: '8px',
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
              '& .ql-editor p': {
                    margin: { xs: '0.4em 0', sm: '0.45em 0', md: '0.5em 0' },
                textAlign: 'left',
                    lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
                    fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
                letterSpacing: '0.01em',
              },
              '& .ql-editor p:first-child': {
                marginTop: 0,
              },
              '& .ql-editor p:last-child': {
                marginBottom: 0,
              },
              '& .ql-editor ul, & .ql-editor ol': {
                    margin: { xs: '0.4em 0', sm: '0.45em 0', md: '0.5em 0' },
                    paddingLeft: { xs: '1.25em', sm: '1.375em', md: '1.5em' },
                    lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
              },
              '& .ql-editor li': {
                    margin: { xs: '0.25em 0', sm: '0.275em 0', md: '0.3em 0' },
                    lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
                    fontSize: { xs: '0.9rem', sm: '0.925rem', md: '0.95rem' },
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
                    margin: { xs: '0.6em 0', sm: '0.675em 0', md: '0.75em 0' },
                    paddingLeft: { xs: '1em', sm: '1.125em', md: '1.25em' },
                    paddingRight: { xs: '0.75em', sm: '0.875em', md: '1em' },
                    paddingTop: { xs: '0.4em', sm: '0.45em', md: '0.5em' },
                    paddingBottom: { xs: '0.4em', sm: '0.45em', md: '0.5em' },
                color: `${alpha(theme.palette.text.primary, 0.85)}`,
                fontStyle: 'italic',
                background: `${alpha(theme.palette.grey[50], 0.4)}`,
                borderRadius: '0 8px 8px 0',
                    lineHeight: { xs: 1.5, sm: 1.55, md: 1.6 },
                    fontSize: { xs: '0.85rem', sm: '0.875rem', md: '0.9rem' },
                letterSpacing: '0.01em',
              },
              '& .ql-toolbar.ql-snow:hover': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.grey[50], 0.95)} 0%, ${alpha(theme.palette.grey[100], 0.7)} 100%)`,
              },
              '& .ql-tooltip': {
                    borderRadius: { xs: '6px', sm: '7px', md: '8px' },
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                background: theme.palette.background.paper,
                backdropFilter: 'blur(10px)',
                    fontSize: { xs: '0.85rem', sm: '0.9rem', md: '0.95rem' },
              },
              '&.loading': {
                opacity: 0.7,
                pointerEvents: 'none',
              },
              '&.loading .ql-editor': {
                background: `${alpha(theme.palette.grey[100], 0.3)}`,
              },
                  // Mobile-specific optimizations
              [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
                '& .ql-toolbar.ql-snow': {
                      padding: '6px 8px',
                      '& .ql-formats': {
                        marginRight: '6px !important',
                        marginBottom: '4px',
                      },
                      '& button': {
                        minWidth: '26px',
                        height: '26px',
                        padding: '5px',
                        fontSize: '13px',
                      }
                },
                '& .ql-editor': {
                      padding: '10px 14px',
                      fontSize: '0.875rem',
                },
                '& .ql-editor.ql-blank::before': {
                      left: '14px',
                      right: '14px',
                      top: '10px',
                      fontSize: '0.875rem',
                    }
                  },
                  // Tablet optimizations
                  [`@media (min-width: ${theme.breakpoints.values.sm}px) and (max-width: ${theme.breakpoints.values.md}px)`]: {
                    '& .ql-toolbar.ql-snow': {
                      padding: '8px 10px',
                },
                    '& .ql-editor': {
                      padding: '12px 16px',
                    }
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
                  placeholder="Describe your experience, key strengths, and what makes you an exceptional care worker..."
              readOnly={isPending}
              className={`quill-biography-editor ${isQuillFocused ? 'focused' : ''} ${isPending ? 'loading' : ''}`}
            />
          </Box>

          {formErrors.biography && (
            <Typography 
              variant="caption" 
              color="error" 
                  sx={{ mt: 1, display: 'block', fontSize: '0.75rem' }}
            >
              {formErrors.biography}
            </Typography>
          )}
        </CardContent>
      </Card>
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
                background: `${alpha(theme.palette.grey[400], 0.5)}`,
                borderRadius: '3px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: `${alpha(theme.palette.grey[500], 0.7)}`,
                }
              }
            }}>
              {/* Expected Hourly Rate Section */}
              <Box sx={{ flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 2, md: 2 } }}>
            <Box
              sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.5,
                background: 'linear-gradient(135deg, #4ade8020 0%, #22c55e20 100%)',
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
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, mb: 0.5 }}>
                Expected Hourly Rate
              </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
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
            inputProps={{
              min: VALIDATION_RULES.expectedHourlyRate.min,
              max: VALIDATION_RULES.expectedHourlyRate.max,
              step: 0.5,
            }}
            onWheel={e => e.target.blur()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                        <Typography sx={{ fontWeight: 600, color: 'primary.main', fontSize: '1rem' }}>$</Typography>
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
                {formErrors.expectedHourlyRate && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                    {formErrors.expectedHourlyRate}
                  </Typography>
                )}
              </Box>

              {/* Divider */}
              <Box sx={{ 
                height: '1px', 
                background: 'linear-gradient(90deg, transparent, rgba(224, 224, 224, 0.6), transparent)', 
                my: 0.5,
                flexShrink: 0
              }} />

      {/* Skills Section */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, sm: 2, md: 2 }, flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Box
          sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                background: 'linear-gradient(135deg, #f59e0b20 0%, #d9770620 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                        mr: 1.5,
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)'
              }}
            >
                      <Typography sx={{ fontSize: '1.2rem' }}>🛠️</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, mb: 0.5 }}>
                Skills & Expertise
              </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                        Select or add your specialized abilities
              </Typography>
                    </Box>
            </Box>
            <Chip
              label={`${(profile.skillTags || []).length}/${VALIDATION_RULES.skillTags.maxCount}`}
              size="small"
              color={(profile.skillTags || []).length > 0 ? 'primary' : 'default'}
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: '0.75rem', 
                      height: 26,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
            />
          </Box>

          {/* Add Custom Skill */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
            <TextField
              id="newSkill"
                    label="Add skill"
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
                    helperText={formErrors.newSkill ? '' : ''}
              inputProps={{ maxLength: 50 }}
              disabled={
                isPending ||
                (profile.skillTags || []).length >= VALIDATION_RULES.skillTags.maxCount
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                  backgroundColor: '#fafafa',
                        height: '40px',
                        fontSize: '0.9rem',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  '&.Mui-focused': { backgroundColor: 'white' }
                },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.85rem'
                      }
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
                      minWidth: 80,
                      height: '40px',
                      borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 600,
                      fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                }
              }}
            >
                    Add
            </Button>
          </Box>

          {/* Skill Tags Error */}
          {formErrors.skillTags && (
                  <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, py: 0.5, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
              {formErrors.skillTags}
            </Alert>
          )}

          {/* Popular Skills */}
                <Typography variant="caption" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary', display: 'block', fontSize: '0.8rem' }}>
            Popular Skills
          </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                        borderRadius: 2,
                        height: 32,
                        fontSize: '0.8rem',
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
                  <Box sx={{ mt: 1.5 }}>
              {skillTags}
            </Box>
          )}
              </Box>

              {/* Divider */}
              <Box sx={{ 
                height: '1px', 
                background: 'linear-gradient(90deg, transparent, rgba(224, 224, 224, 0.6), transparent)', 
                my: { xs: 0.5, sm: 0.5, md: 0.25 },
                flexShrink: 0
              }} />

      {/* Languages Section */}
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: 0,
                mt: { xs: 0, sm: 0, md: 0 },
                mb: { xs: 0, sm: 0, md: 0 },
                px: { xs: 0, sm: 0, md: 0 },
                py: { xs: 0, sm: 0, md: 0 },
                '& > *': {
                  mx: { xs: 0, sm: 0, md: 0 }
                }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  mb: { xs: 2, sm: 2, md: 2 },
                  mt: { xs: 0, sm: 0, md: 0 },
                  flexShrink: 0 
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <Box
          sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.5,
                background: 'linear-gradient(135deg, #8b5cf620 0%, #6366f120 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                        mr: 1.5,
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)'
              }}
            >
                      <Typography sx={{ fontSize: '1.2rem' }}>🌍</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, mb: 0.5 }}>
                Languages Spoken
              </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                        Communication skills for diverse clients
              </Typography>
                    </Box>
            </Box>
            <Chip
              label={`${(profile.languages || []).length}/${VALIDATION_RULES.languages.maxCount}`}
              size="small"
              color={(profile.languages || []).length >= VALIDATION_RULES.languages.minCount ? 'primary' : 'warning'}
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: '0.75rem', 
                      height: 26,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
            />
          </Box>

          <Alert
            severity="info"
                  sx={{ 
                    mb: { xs: 1.5, sm: 1.5, md: 1.5 }, 
                    borderRadius: 2, 
                    backgroundColor: '#f0f9ff',
                    py: 0.5,
                    '& .MuiAlert-message': { 
                      fontSize: '0.75rem',
                      '& strong': { fontSize: '0.8rem' }
                    }
                  }}
          >
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              <strong>Minimum {VALIDATION_RULES.languages.minCount} languages required.</strong>
            </Typography>
          </Alert>

          {/* Popular Languages */}
                <Typography variant="caption" fontWeight={600} sx={{ mb: 1, color: 'text.primary', display: 'block', fontSize: '0.75rem' }}>
            Popular Languages
          </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 0.75, 
                  mb: 2,
                  mx: { xs: 0, sm: 0, md: 0 },
                  px: { xs: 0, sm: 0, md: 0 }
                }}>
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
                          borderRadius: 2,
                          height: 28,
                          fontSize: '0.75rem',
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
                <Typography variant="caption" fontWeight={600} sx={{ mb: 1, color: 'text.primary', display: 'block', fontSize: '0.75rem' }}>
            Add Custom Language
          </Typography>
          <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                  mb: 1.5
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
                    helperText={formErrors.newLanguage ? '' : ''}
              disabled={
                isPending ||
                (profile.languages || []).length >= VALIDATION_RULES.languages.maxCount
              }
              sx={{
                      flex: 1,
                '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                  backgroundColor: '#fafafa',
                        height: '40px',
                        fontSize: '0.85rem',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  '&.Mui-focused': { backgroundColor: 'white' }
                      },
                      '& .MuiInputLabel-root': {
                        fontSize: '0.8rem'
                }
              }}
            />

                  <FormControl size="small" disabled={isPending} sx={{ minWidth: { xs: '100%', sm: 100 } }}>
                    <InputLabel id="proficiency-label" sx={{ fontSize: '0.8rem' }}>Proficiency</InputLabel>
              <Select
                labelId="proficiency-label"
                id="proficiency"
                value={languageProficiency}
                onChange={(e) => setLanguageProficiency(e.target.value)}
                      label="Proficiency"
                MenuProps={{
                  PaperProps: { style: { maxHeight: 200 } },
                }}
                sx={{
                        borderRadius: 2.5,
                  backgroundColor: '#fafafa',
                        height: '40px',
                        fontSize: '0.85rem',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                        '&.Mui-focused': { backgroundColor: 'white' },
                        '& .MuiSelect-select': {
                          fontSize: '0.85rem',
                          py: 1.25
                        }
                }}
              >
                {PROFICIENCY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
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
                      minWidth: { xs: '100%', sm: 70 },
                height: '40px',
                      borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 600,
                      fontSize: '0.8rem',
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
                  <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, py: 0.5, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
              {formErrors.languages}
            </Alert>
          )}

          {/* Selected Languages Display */}
          {languageTags && (
                  <Box sx={{ 
                    mt: { xs: 1.5, sm: 1.5, md: 2 },
                    mb: { xs: 0, sm: 0, md: 0 },
                    mx: { xs: 0, sm: 0, md: 0 }
                  }}>
              {languageTags}
            </Box>
          )}
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