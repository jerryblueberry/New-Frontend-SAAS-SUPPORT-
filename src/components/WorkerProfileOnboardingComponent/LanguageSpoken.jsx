/**
 * LanguageSpoken Component
 * 
 * Dedicated component for managing languages spoken section
 * Features:
 * - Add/remove languages with proficiency levels
 * - Popular language suggestions
 * - Custom language input
 * - Validation and error handling
 * - Store integration
 * - Mobile-optimized design
 * 
 * Best Practices:
 * - Self-contained component with own state management
 * - Optimized for mobile devices
 * - Production-ready error handling
 * - Comprehensive validation
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Button,
  Chip,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Grid,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useWorkerProfileStore, profileSelectors } from '../../stores/workerOnboardingStores';
import { toast } from 'react-toastify';

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

// Clean SaaS Section Header Component
const SectionHeader = ({ icon, title, subtitle, count, maxCount, required = false }) => (
  <Box sx={{ mb: { xs: 2.5, sm: 3 }, display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 } }}>
    <Box
      sx={{
        width: { xs: 36, sm: 40 },
        height: { xs: 36, sm: 40 },
        borderRadius: 2,
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: '1px solid #e2e8f0',
      }}
    >
      <Typography sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{icon}</Typography>
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
        <Typography 
          variant="h6" 
          fontWeight={600} 
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.125rem' },
            color: '#1a202c',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>
        {required && (
          <Chip 
            label="REQUIRED" 
            size="small" 
            sx={{ 
              fontSize: '0.625rem', 
              height: 20, 
              fontWeight: 600,
              borderColor: '#fca5a5',
              color: '#dc2626',
              background: '#fef2f2',
            }} 
            variant="outlined"
          />
        )}
        {count !== undefined && maxCount !== undefined && (
          <Chip 
            label={`${count}/${maxCount}`} 
            size="small" 
            sx={{ 
              fontSize: { xs: '0.688rem', sm: '0.75rem' }, 
              height: 22, 
              fontWeight: 500,
              borderColor: count > 0 ? '#c7d2fe' : '#e2e8f0',
              color: count > 0 ? '#667eea' : '#64748b',
              background: count > 0 ? '#eef2ff' : '#ffffff',
            }} 
            variant="outlined"
          />
        )}
      </Box>
      {subtitle && (
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: { xs: '0.813rem', sm: '0.875rem' }, 
            lineHeight: 1.5,
            color: '#64748b',
            fontWeight: 400,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const LanguageSpoken = React.memo(({ 
  error: languagesError, 
  isPending = false,
  onLanguagesChange,
  onValidationChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get languages from store
  const storeLanguages = useWorkerProfileStore(profileSelectors.languages);
  const addLanguage = useWorkerProfileStore((state) => state.addLanguage);
  const removeLanguage = useWorkerProfileStore((state) => state.removeLanguage);
  const updateLanguageProficiency = useWorkerProfileStore((state) => state.updateLanguageProficiency);

  // Local state
  const [newLanguage, setNewLanguage] = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('fluent');
  const [localErrors, setLocalErrors] = useState({});

  // Validate languages
  const validateLanguages = useCallback((languages) => {
    const errors = {};

    if (!Array.isArray(languages) || languages.length < VALIDATION_RULES.languages.minCount) {
      errors.languages = `Please add at least ${VALIDATION_RULES.languages.minCount} language${VALIDATION_RULES.languages.minCount > 1 ? 's' : ''}`;
    } else if (languages.length > VALIDATION_RULES.languages.maxCount) {
      errors.languages = `Maximum ${VALIDATION_RULES.languages.maxCount} languages allowed`;
    } else {
      // Validate each language has proper structure and proficiency
      const invalidLanguages = languages.filter((lang) => {
        if (!lang || typeof lang !== 'object') return true;

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
      const languageNames = languages.map(lang =>
        typeof lang.language === 'string' ? lang.language : lang.language?.language
      ).filter(Boolean);

      const uniqueNames = [...new Set(languageNames)];
      if (languageNames.length !== uniqueNames.length) {
        errors.languages = 'Duplicate languages are not allowed';
      }
    }

    // Notify parent of validation changes
    if (onValidationChange) {
      onValidationChange(errors);
    }

    return errors;
  }, [onValidationChange]);

  // Validate on languages change
  useEffect(() => {
    if (storeLanguages) {
      const errors = validateLanguages(storeLanguages);
      setLocalErrors(errors);
    }
  }, [storeLanguages, validateLanguages]);

  // Handle new language input change
  const handleNewLanguageChange = useCallback((e) => {
    const value = e.target.value;
    setNewLanguage(value);

    // Clear previous errors when user starts typing
    if (localErrors.newLanguage) {
      setLocalErrors(prev => ({ ...prev, newLanguage: undefined }));
    }
  }, [localErrors.newLanguage]);

  // Add new language
  const addNewLanguage = useCallback(() => {
    const trimmed = newLanguage.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed.length < 2) {
      setLocalErrors(prev => ({ ...prev, newLanguage: 'Language name must be at least 2 characters' }));
      toast.warning('Language name must be at least 2 characters', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (trimmed.length > 30) {
      setLocalErrors(prev => ({ ...prev, newLanguage: 'Language name must not exceed 30 characters' }));
      toast.warning('Language name must not exceed 30 characters', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const currentLanguages = storeLanguages || [];

    // Check for duplicates
    const languageExists = currentLanguages.some(lang => {
      const existingName = typeof lang.language === 'string'
        ? lang.language
        : lang.language?.language;
      return existingName === trimmed;
    });

    if (languageExists) {
      setLocalErrors(prev => ({ ...prev, newLanguage: 'This language has already been added' }));
      toast.warning('This language has already been added', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (currentLanguages.length >= VALIDATION_RULES.languages.maxCount) {
      setLocalErrors(prev => ({ ...prev, newLanguage: `Maximum ${VALIDATION_RULES.languages.maxCount} languages allowed` }));
      toast.warning(`Maximum ${VALIDATION_RULES.languages.maxCount} languages allowed`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const newLangObj = {
      language: trimmed,
      proficiency: languageProficiency,
    };

    addLanguage(newLangObj);
    setNewLanguage('');
    setLanguageProficiency('fluent');

    // Clear errors
    setLocalErrors(prev => ({
      ...prev,
      newLanguage: undefined,
      ...((currentLanguages.length + 1) >= VALIDATION_RULES.languages.minCount && { languages: undefined })
    }));

    // Validate updated languages
    const updatedLanguages = [...currentLanguages, newLangObj];
    const errors = validateLanguages(updatedLanguages);
    setLocalErrors(prev => ({ ...prev, ...errors }));

    // Notify parent
    if (onLanguagesChange) {
      onLanguagesChange(updatedLanguages);
    }
  }, [newLanguage, languageProficiency, storeLanguages, addLanguage, validateLanguages, onLanguagesChange]);

  // Remove a language
  const removeSelectedLanguage = useCallback((language) => {
    removeLanguage(language);
    const updatedLanguages = (storeLanguages || []).filter(lang => lang !== language);
    
    // Validate updated languages
    const errors = validateLanguages(updatedLanguages);
    setLocalErrors(prev => ({ ...prev, ...errors }));

    // Notify parent
    if (onLanguagesChange) {
      onLanguagesChange(updatedLanguages);
    }
  }, [removeLanguage, storeLanguages, validateLanguages, onLanguagesChange]);

  // Update language proficiency
  const updateProficiency = useCallback((languageName, proficiency) => {
    updateLanguageProficiency(languageName, proficiency);
    
    // Validate updated languages
    const errors = validateLanguages(storeLanguages);
    setLocalErrors(prev => ({ ...prev, ...errors }));

    // Notify parent
    if (onLanguagesChange) {
      onLanguagesChange(storeLanguages);
    }
  }, [updateLanguageProficiency, storeLanguages, validateLanguages, onLanguagesChange]);

  // Handle suggested language click
  const handleSuggestedLanguageClick = useCallback((language) => {
    const currentLanguages = storeLanguages || [];

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
      
      const updatedLanguages = [...currentLanguages, newLangObj];
      const errors = validateLanguages(updatedLanguages);
      setLocalErrors(prev => ({ ...prev, ...errors }));

      // Notify parent
      if (onLanguagesChange) {
        onLanguagesChange(updatedLanguages);
      }
    }
  }, [storeLanguages, removeSelectedLanguage, addLanguage, validateLanguages, onLanguagesChange]);

  // Memoized language tags display
  const languageTagsDisplay = useMemo(() => {
    const languages = storeLanguages || [];

    if (languages.length === 0) {
      return null;
    }

    return (
      <Box sx={{
        mt: 2,
      }}>
        <Typography 
          variant="caption" 
          fontWeight={600} 
          sx={{ 
            mb: 1.5, 
            color: '#1a202c', 
            display: 'block', 
            fontSize: { xs: '0.813rem', sm: '0.875rem' },
            letterSpacing: '-0.01em',
          }}
        >
          Your Languages ({languages.length}/{VALIDATION_RULES.languages.maxCount})
        </Typography>

        <Grid container spacing={1.5}>
          {languages.map((lang, index) => {
            const languageName =
              typeof lang.language === "string"
                ? lang.language
                : lang.language?.language || "Unknown";

            const key = `${languageName}-${index}`;

            return (
              <Grid item xs={12} key={key}>
                <Box
                  sx={{
                    borderRadius: { xs: 2, sm: 2.5 },
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: { xs: 1, sm: 1.25 },
                    transition: 'all 0.2s ease',
                    "&:hover": {
                      borderColor: '#cbd5e1',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <Typography 
                    fontWeight={600} 
                    flex={1} 
                    noWrap 
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '0.938rem' },
                      color: '#1a202c',
                    }}
                  >
                    {languageName}
                  </Typography>

                  <Select
                    value={lang.proficiency || "fluent"}
                    size="small"
                    onChange={(e) => updateProficiency(languageName, e.target.value)}
                    disabled={isPending}
                    sx={{
                      minWidth: { xs: 100, sm: 110 },
                      height: { xs: '32px', sm: '34px' },
                      fontSize: { xs: '0.813rem', sm: '0.875rem' },
                      borderRadius: { xs: 1.5, sm: 2 },
                      borderColor: '#e2e8f0',
                      '& .MuiSelect-select': {
                        py: 0.5,
                        fontSize: { xs: '0.813rem', sm: '0.875rem' },
                        color: '#1a202c',
                      },
                      '&:hover': {
                        borderColor: '#cbd5e1',
                      },
                      '&.Mui-focused': {
                        borderColor: '#667eea',
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.08)',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                        }
                      }
                    }}
                  >
                    {PROFICIENCY_OPTIONS.map((option) => (
                      <MenuItem 
                        key={option.value} 
                        value={option.value} 
                        sx={{ 
                          fontSize: { xs: '0.813rem', sm: '0.875rem' },
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                          },
                        }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>

                  <IconButton
                    onClick={() => removeSelectedLanguage(lang)}
                    disabled={isPending}
                    size="small"
                    sx={{
                      width: { xs: 28, sm: 30 },
                      height: { xs: 28, sm: 30 },
                      color: '#ef4444',
                      '&:hover': {
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: { xs: '1rem', sm: '1.125rem' }
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  }, [storeLanguages, removeSelectedLanguage, updateProficiency, isPending]);

  const displayError = languagesError || localErrors.languages;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: { xs: 2, sm: 2.5 },
        border: 'none',
        overflow: 'visible',
        background: '#ffffff',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
          <SectionHeader
            icon="🌍"
            title="Languages Spoken"
            subtitle="Communication skills for diverse clients"
            count={(storeLanguages || []).length}
            maxCount={VALIDATION_RULES.languages.maxCount}
            required={true}
          />
        </Box>

        {/* Clean Info Alert */}
        <Alert
          severity="info"
          sx={{
            mb: { xs: 2, sm: 2.5 },
            borderRadius: { xs: 2, sm: 2.5 },
            border: '1px solid #bfdbfe',
            backgroundColor: '#eff6ff',
            py: 1,
            '& .MuiAlert-message': {
              fontSize: { xs: '0.813rem', sm: '0.875rem' },
              color: '#1e40af',
              fontWeight: 400,
              '& strong': { 
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                fontWeight: 600,
              }
            },
            '& .MuiAlert-icon': {
              color: '#3b82f6',
            }
          }}
        >
          <Typography variant="body2" sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, color: '#1e40af' }}>
            <strong>Minimum {VALIDATION_RULES.languages.minCount} languages required.</strong>
          </Typography>
        </Alert>

        {/* Popular Languages - Clean Design */}
        <Typography 
          variant="caption" 
          fontWeight={600} 
          sx={{ 
            mb: 1.5, 
            color: '#1a202c', 
            display: 'block', 
            fontSize: { xs: '0.813rem', sm: '0.875rem' },
            letterSpacing: '-0.01em',
          }}
        >
          Popular Languages
        </Typography>
        <Box sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 0.75, sm: 1 },
          mb: 2.5,
        }}>
          {DEFAULT_LANGUAGES.map((language) => {
            const isSelected = (storeLanguages || []).some((lang) => {
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
                onClick={() => handleSuggestedLanguageClick(language)}
                disabled={
                  isPending ||
                  (!isSelected &&
                    (storeLanguages || []).length >= VALIDATION_RULES.languages.maxCount)
                }
                sx={{
                  borderRadius: { xs: 1.5, sm: 2 },
                  height: { xs: 32, sm: 34 },
                  fontSize: { xs: '0.813rem', sm: '0.875rem' },
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  border: isSelected ? 'none' : '1px solid #e2e8f0',
                  background: isSelected ? '#667eea' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  '&:hover:not(:disabled)': {
                    transform: 'translateY(-1px)',
                    boxShadow: isSelected 
                      ? '0 4px 12px rgba(102, 126, 234, 0.25)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                    borderColor: isSelected ? 'transparent' : '#cbd5e1',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Add Custom Language - Clean Design */}
        <Typography 
          variant="caption" 
          fontWeight={600} 
          sx={{ 
            mb: 1.5, 
            color: '#1a202c', 
            display: 'block', 
            fontSize: { xs: '0.813rem', sm: '0.875rem' },
            letterSpacing: '-0.01em',
          }}
        >
          Add Custom Language
        </Typography>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1.5 },
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
            error={Boolean(localErrors.newLanguage)}
            helperText={localErrors.newLanguage || ''}
            disabled={
              isPending ||
              (storeLanguages || []).length >= VALIDATION_RULES.languages.maxCount
            }
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: { xs: 2, sm: 2.5 },
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                height: { xs: '44px', sm: '42px' },
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                transition: 'all 0.2s ease',
                '&:hover': { 
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                },
                '&.Mui-focused': { 
                  backgroundColor: '#ffffff',
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.08)',
                },
                '&.Mui-error': {
                  borderColor: '#ef4444',
                },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#667eea',
                },
              },
              '& .MuiFormHelperText-root': {
                fontSize: { xs: '0.75rem', sm: '0.813rem' },
                marginTop: 0.5,
              },
            }}
          />

          <FormControl 
            size="small" 
            disabled={isPending} 
            sx={{ minWidth: { xs: '100%', sm: 140 }, flexShrink: 0 }}
          >
            <InputLabel 
              id="proficiency-label" 
              sx={{ 
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                color: '#64748b',
                '&.Mui-focused': {
                  color: '#667eea',
                },
              }}
            >
              Proficiency
            </InputLabel>
            <Select
              labelId="proficiency-label"
              id="proficiency"
              value={languageProficiency}
              onChange={(e) => setLanguageProficiency(e.target.value)}
              label="Proficiency"
              MenuProps={{
                PaperProps: { 
                  style: { maxHeight: 200 },
                  sx: {
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                  }
                },
              }}
              sx={{
                borderRadius: { xs: 2, sm: 2.5 },
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                height: { xs: '44px', sm: '42px' },
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                transition: 'all 0.2s ease',
                '&:hover': { 
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                },
                '&.Mui-focused': { 
                  backgroundColor: '#ffffff',
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.08)',
                },
                '& .MuiSelect-select': {
                  fontSize: { xs: '0.875rem', sm: '0.938rem' },
                  py: { xs: 1.5, sm: 1.25 },
                  color: '#1a202c',
                }
              }}
            >
              {PROFICIENCY_OPTIONS.map((option) => (
                <MenuItem 
                  key={option.value} 
                  value={option.value} 
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '0.938rem' },
                    '&:hover': {
                      backgroundColor: '#f8fafc',
                    },
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={addNewLanguage}
            disabled={
              isPending ||
              !newLanguage.trim() ||
              (storeLanguages || []).length >= VALIDATION_RULES.languages.maxCount
            }
            sx={{
              minWidth: { xs: '100%', sm: 90 },
              height: { xs: '44px', sm: '42px' },
              borderRadius: { xs: 2, sm: 2.5 },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '0.938rem' },
              background: '#667eea',
              color: '#ffffff',
              boxShadow: 'none',
              '&:hover': {
                background: '#5a67d8',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
              },
              '&:disabled': {
                background: '#cbd5e1',
                color: '#94a3b8',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Add
          </Button>
        </Box>

        {/* Clean Error Display */}
        {displayError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: { xs: 2, sm: 2.5 }, 
              py: 1,
              border: '1px solid #fecaca',
              background: '#fef2f2',
              '& .MuiAlert-message': { 
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                color: '#991b1b',
                fontWeight: 400,
              },
              '& .MuiAlert-icon': {
                color: '#dc2626',
              },
            }}
          >
            {displayError}
          </Alert>
        )}

        {/* Selected Languages Display */}
        {languageTagsDisplay}
      </CardContent>
    </Card>
  );
});

LanguageSpoken.displayName = 'LanguageSpoken';
export default LanguageSpoken;

