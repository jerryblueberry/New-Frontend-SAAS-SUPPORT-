import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
      <Box sx={{ 
        mt: { xs: 1.5, sm: 1.5, md: 1.5 },
        mb: { xs: 0, sm: 0, md: 0 },
        mx: { xs: 0, sm: 0, md: 0 }
      }}>
        <Typography 
          variant="caption" 
          fontWeight={600} 
          sx={{ mb: 1, color: 'text.primary', display: 'block', fontSize: '0.8rem' }}
        >
          Your Languages ({languages.length}/{VALIDATION_RULES.languages.maxCount})
        </Typography>

        <Grid container spacing={1.5} sx={{ 
          mx: { xs: 0, sm: 0, md: 0 },
          mb: { xs: 0, sm: 0, md: 0 },
          mt: { xs: 0, sm: 0, md: 0 }
        }}>
          {languages.map((lang, index) => {
            const languageName = getLanguageName(lang) || "Unknown";
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
                    <Typography fontWeight={600} flex={1} noWrap sx={{ fontSize: '0.85rem' }}>
                      {languageName}
                    </Typography>

                    <Select
                      value={lang.proficiency || "fluent"}
                      size="small"
                      onChange={(e) => handleUpdateProficiency(languageName, e.target.value)}
                      disabled={disabled}
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

                    <IconButton
                      onClick={() => handleRemoveLanguage(lang)}
                      disabled={disabled}
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
  }, [languages, disabled, getLanguageName, handleUpdateProficiency, handleRemoveLanguage]);

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
      mt: { xs: 0, sm: 0, md: 0 },
      mb: { xs: 0, sm: 0, md: 0 },
      px: { xs: 0, sm: 0, md: 0 },
      py: { xs: 0, sm: 0, md: 0 },
      '& > *': {
        mx: { xs: 0, sm: 0, md: 0 }
      }
    }}>
      {/* Header */}
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
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
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
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, mb: 0.5 }}
            >
              Languages Spoken
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}
            >
              Communication skills for diverse clients
            </Typography>
          </Box>
        </Box>
        <Chip
          label={`${languages.length}/${VALIDATION_RULES.languages.maxCount}`}
          size="small"
          color={languages.length >= VALIDATION_RULES.languages.minCount ? 'primary' : 'warning'}
          sx={{ 
            fontWeight: 600, 
            fontSize: '0.75rem', 
            height: 26,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
      </Box>

      {/* Info Alert */}
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
      <Typography 
        variant="caption" 
        fontWeight={600} 
        sx={{ mb: 1, color: 'text.primary', display: 'block', fontSize: '0.75rem' }}
      >
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
      <Typography 
        variant="caption" 
        fontWeight={600} 
        sx={{ mb: 1, color: 'text.primary', display: 'block', fontSize: '0.75rem' }}
      >
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
              handleAddLanguage();
            }
          }}
          inputProps={{ maxLength: 30 }}
          error={Boolean(localErrors.newLanguage)}
          helperText={localErrors.newLanguage || ''}
          disabled={disabled || languages.length >= VALIDATION_RULES.languages.maxCount}
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

        <FormControl 
          size="small" 
          disabled={disabled} 
          sx={{ minWidth: { xs: '100%', sm: 100 } }}
        >
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
          onClick={handleAddLanguage}
          disabled={
            disabled ||
            !newLanguage.trim() ||
            languages.length >= VALIDATION_RULES.languages.maxCount
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

      {/* Consolidated Error Display */}
      {showErrors && localErrors.languages && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 1.5, 
            borderRadius: 2, 
            py: 0.5, 
            '& .MuiAlert-message': { fontSize: '0.75rem' } 
          }}
        >
          {localErrors.languages}
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
  );
};

LanguageSection.propTypes = {
  disabled: PropTypes.bool,
  onValidationChange: PropTypes.func,
  showErrors: PropTypes.bool,
};

export default LanguageSection;

