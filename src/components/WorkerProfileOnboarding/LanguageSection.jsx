import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { X } from 'lucide-react';
import useOnboardingStore from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';

// Default languages for suggestions
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

// Language proficiency options
const PROFICIENCY_OPTIONS = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'native', label: 'Native' },
];

// Validation constants
const VALIDATION_RULES = {
  languages: {
    minCount: 1,
    maxCount: 7,
    required: true,
  },
};

/**
 * LanguageSection Component
 * 
 * Premium, production-ready language management component with:
 * - Add/remove languages with proficiency levels
 * - Real-time validation
 * - Consolidated error handling (single error message, not multiple toasts)
 * - Responsive design
 * - Optimized performance with memoization
 * 
 * Features:
 * - Prevents duplicate languages
 * - Validates proficiency levels
 * - Shows consolidated error messages
 * - Handles both string and object language structures
 */
const LanguageSection = ({
  disabled = false,
  onValidationChange,
  showErrors = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Local state
  const [newLanguage, setNewLanguage] = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('fluent');
  const [localErrors, setLocalErrors] = useState({});

  // Get state and actions from store
  const languages = useOnboardingStore((state) => state.profile.languages || [], shallow);
  const addLanguage = useOnboardingStore((state) => state.addLanguage);
  const removeLanguage = useOnboardingStore((state) => state.removeLanguage);
  const updateLanguageProficiency = useOnboardingStore(
    (state) => state.updateLanguageProficiency
  );

  // Helper to get language name (handles both string and object structures)
  const getLanguageName = useCallback((lang) => {
    if (!lang) return null;
    if (typeof lang.language === 'string') {
      return lang.language;
    }
    return lang.language?.language || null;
  }, []);

  // Validation function
  const validateLanguages = useCallback((langs) => {
    const errors = [];

    if (!Array.isArray(langs) || langs.length < VALIDATION_RULES.languages.minCount) {
      errors.push(`Please add at least ${VALIDATION_RULES.languages.minCount} language${VALIDATION_RULES.languages.minCount > 1 ? 's' : ''}`);
    } else if (langs.length > VALIDATION_RULES.languages.maxCount) {
      errors.push(`Maximum ${VALIDATION_RULES.languages.maxCount} languages allowed`);
    } else {
      // Validate each language has proper structure and proficiency
      const invalidLanguages = langs.filter((lang) => {
        const languageName = getLanguageName(lang);
        return !languageName ||
          !lang.proficiency ||
          !PROFICIENCY_OPTIONS.some((opt) => opt.value === lang.proficiency);
      });

      if (invalidLanguages.length > 0) {
        errors.push('Please ensure all languages have valid names and proficiency levels');
      }

      // Check for duplicate languages
      const languageNames = langs.map(getLanguageName).filter(Boolean);
      const uniqueNames = [...new Set(languageNames)];
      if (languageNames.length !== uniqueNames.length) {
        errors.push('Duplicate languages are not allowed');
      }
    }

    return errors;
  }, [getLanguageName]);

  // Notify parent of validation changes
  const notifyValidation = useCallback((langs) => {
    const errors = validateLanguages(langs);
    const errorMessage = errors.length > 0 ? errors[0] : null; // Single consolidated error
    
    if (onValidationChange) {
      onValidationChange({
        isValid: errors.length === 0,
        error: errorMessage,
        languages: langs,
      });
    }
  }, [validateLanguages, onValidationChange]);

  // Add new language
  const handleAddLanguage = useCallback(() => {
    const trimmed = newLanguage.trim();

    // Clear previous errors
    setLocalErrors({});

    if (!trimmed) {
      setLocalErrors({ newLanguage: 'Language name is required' });
      return;
    }

    if (trimmed.length < 2) {
      setLocalErrors({ newLanguage: 'Language name must be at least 2 characters' });
      return;
    }

    if (trimmed.length > 30) {
      setLocalErrors({ newLanguage: 'Language name must not exceed 30 characters' });
      return;
    }

    // Check for duplicates
    const languageExists = languages.some(lang => {
      const existingName = getLanguageName(lang);
      return existingName === trimmed;
    });

    if (languageExists) {
      setLocalErrors({ newLanguage: 'This language has already been added' });
      return;
    }

    if (languages.length >= VALIDATION_RULES.languages.maxCount) {
      setLocalErrors({ newLanguage: `Maximum ${VALIDATION_RULES.languages.maxCount} languages allowed` });
      return;
    }

    // Add language
    const newLangObj = {
      language: trimmed,
      proficiency: languageProficiency,
    };

    addLanguage(newLangObj);
    setNewLanguage('');
    setLanguageProficiency('fluent');
    setLocalErrors({});

    // Notify parent of validation change
    const updatedLanguages = [...languages, newLangObj];
    notifyValidation(updatedLanguages);
  }, [newLanguage, languageProficiency, languages, addLanguage, getLanguageName, notifyValidation]);

  // Remove language
  const handleRemoveLanguage = useCallback((language) => {
    removeLanguage(language);
    const updatedLanguages = languages.filter(lang => lang !== language);
    notifyValidation(updatedLanguages);
  }, [languages, removeLanguage, notifyValidation]);

  // Update proficiency
  const handleUpdateProficiency = useCallback((languageName, proficiency) => {
    updateLanguageProficiency(languageName, proficiency);
    // Re-validate after proficiency update
    setTimeout(() => {
      notifyValidation(languages);
    }, 0);
  }, [updateLanguageProficiency, languages, notifyValidation]);

  // Handle suggested language click
  const handleSuggestedLanguageClick = useCallback((language) => {
    const existingLang = languages.find(lang => {
      const existingName = getLanguageName(lang);
      return existingName === language;
    });

    if (existingLang) {
      handleRemoveLanguage(existingLang);
    } else if (languages.length < VALIDATION_RULES.languages.maxCount) {
      const newLangObj = {
        language: language,
        proficiency: 'fluent',
      };
      addLanguage(newLangObj);
      const updatedLanguages = [...languages, newLangObj];
      notifyValidation(updatedLanguages);
    }
  }, [languages, addLanguage, getLanguageName, handleRemoveLanguage, notifyValidation]);

  // Handle input change
  const handleNewLanguageChange = useCallback((e) => {
    const value = e.target.value;
    setNewLanguage(value);
    // Clear error when user starts typing
    if (localErrors.newLanguage) {
      setLocalErrors(prev => ({ ...prev, newLanguage: undefined }));
    }
  }, [localErrors.newLanguage]);

  // Validate on mount and when languages change
  React.useEffect(() => {
    notifyValidation(languages);
  }, [languages, notifyValidation]); // Re-validate when languages change

  // Memoized language tags display
  const languageTags = useMemo(() => {
    if (languages.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: { xs: 1.5, sm: 2 } }}>
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.primary"
          sx={{ mb: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.9rem', sm: '0.9375rem' } }}
        >
          Your Selected Languages ({languages.length}/{VALIDATION_RULES.languages.maxCount})
        </Typography>
        <Stack direction="column" spacing={1}>
          {languages.map((lang, index) => {
            const languageName = getLanguageName(lang) || "Unknown";
            const key = `${languageName}-${index}`;

            return (
              <Box
                key={key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1, sm: 1.5 },
                  p: { xs: 1, sm: 1.25 },
                  borderRadius: '10px',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    borderColor: alpha(theme.palette.primary.main, 0.25),
                    transform: 'translateX(2px)',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)',
                  },
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    color: 'text.primary',
                    minWidth: 0,
                  }}
                  noWrap
                >
                  {languageName}
                </Typography>

                <FormControl size="small" disabled={disabled} sx={{ minWidth: { xs: 100, sm: 120 } }}>
                  <Select
                    value={lang.proficiency || "fluent"}
                    onChange={(e) => handleUpdateProficiency(languageName, e.target.value)}
                    disabled={disabled}
                    sx={{
                      borderRadius: '8px',
                      height: { xs: 36, sm: 40 },
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      fontWeight: 500,
                      bgcolor: '#ffffff',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      '& .MuiSelect-select': {
                        py: { xs: 0.75, sm: 1 },
                        px: { xs: 1, sm: 1.25 },
                      },
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                      },
                      '&.Mui-focused': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                    }}
                  >
                    {PROFICIENCY_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <IconButton
                  onClick={() => handleRemoveLanguage(lang)}
                  disabled={disabled}
                  size="small"
                  sx={{
                    width: { xs: 32, sm: 36 },
                    height: { xs: 32, sm: 36 },
                    borderRadius: '8px',
                    color: theme.palette.error.main,
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.error.main, 0.15),
                      transform: 'scale(1.05)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  <X size={isMobile ? 16 : 18} strokeWidth={2.5} />
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  }, [languages, disabled, getLanguageName, handleUpdateProficiency, handleRemoveLanguage, theme, isMobile]);

  // Check if language is selected
  const isLanguageSelected = useCallback((language) => {
    return languages.some((lang) => {
      const existingName = getLanguageName(lang);
      return existingName === language;
    });
  }, [languages, getLanguageName]);

  return (
    <Box sx={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: { xs: 2, sm: 2.5 },
        flexShrink: 0
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="text.primary"
            sx={{
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              mb: 0.5,
            }}
          >
            Languages Spoken
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            Select or add your communication languages
          </Typography>
        </Box>
        <Chip
          label={`${languages.length}/${VALIDATION_RULES.languages.maxCount}`}
          size="medium"
          color={languages.length >= VALIDATION_RULES.languages.minCount ? 'primary' : 'default'}
          sx={{
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
            height: { xs: 32, sm: 36 },
            borderRadius: '10px',
            bgcolor: languages.length >= VALIDATION_RULES.languages.minCount ? theme.palette.primary.main : alpha(theme.palette.grey[100], 0.6),
            color: languages.length >= VALIDATION_RULES.languages.minCount ? 'white' : theme.palette.text.secondary,
            border: `1px solid ${languages.length >= VALIDATION_RULES.languages.minCount ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
            boxShadow: 'none',
            transition: 'all 0.2s ease',
          }}
        />
      </Box>

      {/* Popular Languages */}
      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        sx={{ mb: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.9rem', sm: '0.9375rem' } }}
      >
        Popular Languages
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.75, sm: 1 }, mb: { xs: 2, sm: 2.5 } }}>
        {DEFAULT_LANGUAGES.map((language) => {
          const isSelected = isLanguageSelected(language);

          return (
            <Chip
              key={language}
              label={language}
              clickable
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => handleSuggestedLanguageClick(language)}
              disabled={
                disabled ||
                (!isSelected && languages.length >= VALIDATION_RULES.languages.maxCount)
              }
              sx={{
                borderRadius: '10px',
                height: { xs: 36, sm: 40 },
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 500,
                transition: 'all 0.2s ease-in-out',
                bgcolor: isSelected
                  ? theme.palette.primary.main
                  : alpha(theme.palette.grey[100], 0.6),
                color: isSelected
                  ? 'white'
                  : theme.palette.text.primary,
                border: `1px solid ${isSelected
                  ? theme.palette.primary.main
                  : alpha(theme.palette.divider, 0.1)}`,
                boxShadow: 'none',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  bgcolor: isSelected
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.grey[100], 0.8),
                  borderColor: isSelected
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.primary.main, 0.2),
                },
                '&.MuiChip-filled': {
                  background: theme.palette.primary.main,
                  color: 'white',
                },
                '&.MuiChip-outlined': {
                  borderColor: alpha(theme.palette.divider, 0.1),
                  color: theme.palette.text.primary,
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    bgcolor: alpha(theme.palette.grey[100], 0.8),
                  },
                },
              }}
            />
          );
        })}
      </Box>

      {/* Add Custom Language */}
      <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, mb: { xs: 2, sm: 2.5 } }}>
        <TextField
          id="newLanguage"
          placeholder="Add language"
          variant="outlined"
          fullWidth
          value={newLanguage}
          onChange={handleNewLanguageChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddLanguage();
            }
          }}
          inputProps={{ maxLength: 30 }}
          error={Boolean(localErrors.newLanguage)}
          helperText={localErrors.newLanguage || ''}
          disabled={disabled || languages.length >= VALIDATION_RULES.languages.maxCount}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              bgcolor: Boolean(localErrors.newLanguage)
                ? alpha(theme.palette.error.main, 0.03)
                : alpha(theme.palette.grey[50], 0.4),
              fontSize: { xs: '1rem', sm: '1.0625rem' },
              height: { xs: '52px', sm: '56px' },
              paddingLeft: { xs: '14px', sm: '16px' },
              paddingRight: { xs: '14px', sm: '16px' },
              transition: theme.transitions.create(
                ['background-color', 'border-color', 'box-shadow'],
                { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
              ),
              '& fieldset': {
                borderColor: Boolean(localErrors.newLanguage)
                  ? alpha(theme.palette.error.main, 0.25)
                  : 'transparent',
                borderWidth: Boolean(localErrors.newLanguage) ? '1.5px' : '0px',
                transition: 'border-color 0.2s ease',
              },
              '&:hover': {
                bgcolor: Boolean(localErrors.newLanguage)
                  ? alpha(theme.palette.error.main, 0.04)
                  : alpha(theme.palette.grey[100], 0.6),
                '& fieldset': {
                  borderColor: Boolean(localErrors.newLanguage)
                    ? alpha(theme.palette.error.main, 0.35)
                    : alpha(theme.palette.primary.main, 0.2),
                  borderWidth: '1px',
                },
              },
              '&.Mui-focused': {
                bgcolor: '#ffffff',
                boxShadow: Boolean(localErrors.newLanguage)
                  ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.1)}`
                  : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                '& fieldset': {
                  borderColor: Boolean(localErrors.newLanguage)
                    ? theme.palette.error.main
                    : theme.palette.primary.main,
                  borderWidth: '2px',
                },
              },
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.grey[100], 0.3),
                cursor: 'not-allowed',
                '& fieldset': { borderColor: 'transparent' },
              },
            },
            '& .MuiInputLabel-root': {
              display: 'none',
            },
            '& .MuiInputBase-input': {
              fontWeight: 500,
              color: theme.palette.text.primary,
              padding: { xs: '16px 0', sm: '18px 0' },
              fontSize: { xs: '1rem', sm: '1.0625rem' },
              lineHeight: 1.5,
              '&::placeholder': {
                color: alpha(theme.palette.text.secondary, 0.5),
                opacity: 1,
                fontWeight: 400,
                letterSpacing: '0.01em',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              },
              '&:focus::placeholder': {
                opacity: 0.3,
                color: alpha(theme.palette.text.secondary, 0.3),
              },
            },
          }}
        />

        <FormControl
          disabled={disabled}
          sx={{
            minWidth: { xs: 120, sm: 140 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              bgcolor: alpha(theme.palette.grey[50], 0.4),
              fontSize: { xs: '1rem', sm: '1.0625rem' },
              height: { xs: '52px', sm: '56px' },
              transition: theme.transitions.create(
                ['background-color', 'border-color', 'box-shadow'],
                { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
              ),
              '& fieldset': {
                borderColor: 'transparent',
                borderWidth: '0px',
              },
              '&:hover': {
                bgcolor: alpha(theme.palette.grey[100], 0.6),
                '& fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  borderWidth: '1px',
                },
              },
              '&.Mui-focused': {
                bgcolor: '#ffffff',
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                '& fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: '2px',
                },
              },
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.grey[100], 0.3),
                cursor: 'not-allowed',
                '& fieldset': { borderColor: 'transparent' },
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              fontWeight: 500,
            },
            '& .MuiSelect-select': {
              py: { xs: 1.5, sm: 1.75 },
              px: { xs: 1.5, sm: 2 },
              fontSize: { xs: '1rem', sm: '1.0625rem' },
              fontWeight: 500,
            },
          }}
        >
          <InputLabel id="proficiency-label">Proficiency</InputLabel>
          <Select
            labelId="proficiency-label"
            id="proficiency"
            value={languageProficiency}
            onChange={(e) => setLanguageProficiency(e.target.value)}
            label="Proficiency"
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '12px',
                  mt: 0.5,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              },
            }}
          >
            {PROFICIENCY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddLanguage}
          disabled={
            disabled ||
            !newLanguage.trim() ||
            languages.length >= VALIDATION_RULES.languages.maxCount
          }
          sx={{
            minWidth: { xs: 60, sm: 80 },
            height: { xs: '52px', sm: '56px' },
            borderRadius: '14px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            boxShadow: 'none',
            background: theme.palette.primary.main,
            '&:hover': {
              background: theme.palette.primary.dark,
              boxShadow: 'none',
            },
            '&:disabled': {
              background: alpha(theme.palette.action.disabledBackground, 0.12),
              color: alpha(theme.palette.action.disabled, 0.5),
            },
          }}
        >
          Add
        </Button>
      </Box>

      {/* Consolidated Error Display */}
      {showErrors && localErrors.languages && (
        <Box
          sx={{
            mt: { xs: 1, sm: 1.25 },
            mb: { xs: 2, sm: 2.5 },
            display: 'flex',
            alignItems: 'flex-start',
            gap: 0.875,
            p: { xs: 1, sm: 1.25 },
            borderRadius: '10px',
            bgcolor: alpha(theme.palette.error.main, 0.06),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            transition: 'all 0.2s ease',
          }}
          role="alert"
          aria-live="polite"
        >
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: theme.palette.error.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: 0.125,
            }}
          >
            <Typography sx={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 }}>
              !
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="error"
              sx={{
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                lineHeight: 1.5,
                fontWeight: 600,
                display: 'block',
                mb: 0.25,
              }}
            >
              {localErrors.languages}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                lineHeight: 1.4,
                color: theme.palette.error.dark,
              }}
            >
              Please add between {VALIDATION_RULES.languages.minCount} and {VALIDATION_RULES.languages.maxCount} languages.
            </Typography>
          </Box>
        </Box>
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
  );
};

LanguageSection.propTypes = {
  disabled: PropTypes.bool,
  onValidationChange: PropTypes.func,
  showErrors: PropTypes.bool,
};

export default LanguageSection;

