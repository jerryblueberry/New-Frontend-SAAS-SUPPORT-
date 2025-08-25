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
  InputLabel, CircularProgress, IconButton, Grid, Tooltip,
} from '@mui/material';

import CloseIcon from "@mui/icons-material/Close";


import { toast, ToastContainer } from 'react-toastify';
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
    min: 1,
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
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('fluent');
  const [formErrors, setFormErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Get state and actions from store individually to avoid infinite loop
  const profile = useOnboardingStore((state) => state.profile, shallow);
  const updateProfile = useOnboardingStore((state) => state.updateProfile);
  const addLanguage = useOnboardingStore((state) => state.addLanguage);
  const removeLanguage = useOnboardingStore((state) => state.removeLanguage);
  const updateLanguageProficiency = useOnboardingStore(
    (state) => state.updateLanguageProficiency
  );

  const { mutate: saveProfile, isPending, error } = useProfileMutation();

  // Enhanced validation function
  const validateField = useCallback((fieldName, value) => {
    const errors = {};

    switch (fieldName) {
      case 'biography':
        if (value && typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed.length < VALIDATION_RULES.biography.minLength) {
            errors.biography = `Professional summary must be at least ${VALIDATION_RULES.biography.minLength} characters (currently: ${trimmed.length})`;
          } else if (trimmed.length > VALIDATION_RULES.biography.maxLength) {
            errors.biography = `Professional summary must not exceed ${VALIDATION_RULES.biography.maxLength} characters (currently: ${trimmed.length})`;
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
            errors.expectedHourlyRate = `Please Enter Valid Expected Hourly Rate`;
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
      ...validateField('biography', profile.biography),
      ...validateField('expectedHourlyRate', profile.expectedHourlyRate),
      ...validateField('skillTags', profile.skillTags || []),
      ...validateField('languages', profile.languages || []),
    };

    setFormErrors(allErrors); // still shows inline errors
    return allErrors; // return object instead of boolean
  }, [profile, validateField]);

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
      errorMessages.forEach(message => {
        toast.error(message, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
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
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
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

          <TextField
            id="biography"
            name="biography"
            // label="Tell your story..."
            multiline
            rows={5}
            fullWidth
            value={profile.biography || ''}
            onChange={handleChange}
            placeholder="Describe your experience, key strengths, and what makes you an exceptional care worker. Share your passion for helping others and any specialized skills you bring to your role."
            error={Boolean(formErrors.biography)}
            helperText={formErrors.biography || `${(profile.biography || '').length}/${VALIDATION_RULES.biography.maxLength} characters`}
            inputProps={{
              maxLength: VALIDATION_RULES.biography.maxLength,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: '#fafafa',
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