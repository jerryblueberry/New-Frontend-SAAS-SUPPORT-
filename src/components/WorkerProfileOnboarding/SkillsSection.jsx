import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import { Plus } from 'lucide-react';
import useOnboardingStore from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';

// Default skills for suggestions
const DEFAULT_SKILLS = [
  "Personal Care",
  'Meal Preparation',
  "Working with Children",
  "Cleaning",
  'First Aid',
  'CPR',
];

// Validation constants
const VALIDATION_RULES = {
  skillTags: {
    minCount: 0,
    maxCount: 10,
    required: false,
  },
};

/**
 * SkillsSection Component
 * 
 * Premium, production-ready skills management component with:
 * - Add/remove skills
 * - Real-time validation
 * - Consolidated error handling (single error message, not multiple toasts)
 * - Responsive design
 * - Optimized performance with memoization
 * 
 * Features:
 * - Prevents duplicate skills
 * - Validates skill name length
 * - Shows consolidated error messages
 * - Handles popular skills suggestions
 */
const SkillsSection = ({
  disabled = false,
  onValidationChange,
  showErrors = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Local state
  const [newSkill, setNewSkill] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  // Get state and actions from store
  const skills = useOnboardingStore((state) => state.profile.skillTags || [], shallow);
  const updateProfile = useOnboardingStore((state) => state.updateProfile);

  // Validation function
  const validateSkills = useCallback((skillList) => {
    const errors = [];

    if (!Array.isArray(skillList)) {
      errors.push('Skills must be an array');
    } else if (skillList.length < VALIDATION_RULES.skillTags.minCount) {
      errors.push(`Please add at least ${VALIDATION_RULES.skillTags.minCount} skill${VALIDATION_RULES.skillTags.minCount > 1 ? 's' : ''}`);
    } else if (skillList.length > VALIDATION_RULES.skillTags.maxCount) {
      errors.push(`Maximum ${VALIDATION_RULES.skillTags.maxCount} skills allowed`);
    }

    return errors;
  }, []);

  // Notify parent of validation changes
  const notifyValidation = useCallback((skillList) => {
    const errors = validateSkills(skillList);
    const errorMessage = errors.length > 0 ? errors[0] : null; // Single consolidated error
    
    if (onValidationChange) {
      onValidationChange({
        isValid: errors.length === 0,
        error: errorMessage,
        skills: skillList,
      });
    }
  }, [validateSkills, onValidationChange]);

  // Add new skill
  const handleAddSkill = useCallback(() => {
    const trimmed = newSkill.trim();

    // Clear previous errors
    setLocalErrors({});

    if (!trimmed) {
      setLocalErrors({ newSkill: 'Skill name is required' });
      return;
    }

    if (trimmed.length < 2) {
      setLocalErrors({ newSkill: 'Skill name must be at least 2 characters' });
      return;
    }

    if (trimmed.length > 50) {
      setLocalErrors({ newSkill: 'Skill name must not exceed 50 characters' });
      return;
    }

    // Check for duplicates
    if (skills.includes(trimmed)) {
      setLocalErrors({ newSkill: 'This skill has already been added' });
      return;
    }

    if (skills.length >= VALIDATION_RULES.skillTags.maxCount) {
      setLocalErrors({ newSkill: `Maximum ${VALIDATION_RULES.skillTags.maxCount} skills allowed` });
      return;
    }

    // Add skill
    const updatedSkills = [...skills, trimmed];
    updateProfile({ skillTags: updatedSkills });
    setNewSkill('');
    setLocalErrors({});

    // Notify parent of validation change
    notifyValidation(updatedSkills);
  }, [newSkill, skills, updateProfile, notifyValidation]);

  // Remove skill
  const handleRemoveSkill = useCallback((skill) => {
    const updatedSkills = skills.filter(s => s !== skill);
    updateProfile({ skillTags: updatedSkills });
    notifyValidation(updatedSkills);
  }, [skills, updateProfile, notifyValidation]);

  // Handle suggested skill click
  const handleSuggestedSkillClick = useCallback((skill) => {
    if (skills.includes(skill)) {
      handleRemoveSkill(skill);
    } else if (skills.length < VALIDATION_RULES.skillTags.maxCount) {
      const updatedSkills = [...skills, skill];
      updateProfile({ skillTags: updatedSkills });
      notifyValidation(updatedSkills);
    }
  }, [skills, updateProfile, handleRemoveSkill, notifyValidation]);

  // Handle input change
  const handleNewSkillChange = useCallback((e) => {
    const value = e.target.value;
    setNewSkill(value);
    // Clear error when user starts typing
    if (localErrors.newSkill) {
      setLocalErrors(prev => ({ ...prev, newSkill: undefined }));
    }
  }, [localErrors.newSkill]);

  // Validate on mount and when skills change
  React.useEffect(() => {
    notifyValidation(skills);
  }, [skills, notifyValidation]);

  // Memoized skill tags display - Enhanced
  const skillTagsDisplay = useMemo(() => {
    if (skills.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: { xs: 2.5, sm: 3 }, width: '100%' }}>
        <Typography 
          variant="body2" 
          fontWeight={500} 
          sx={{ 
            mb: { xs: 1.5, sm: 1.75 }, 
            color: 'text.secondary', 
            display: 'block', 
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            letterSpacing: '-0.01em',
            fontWeight: 500,
          }}
        >
          Your Skills
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: { xs: 0.875, sm: 1, md: 1.125 },
          width: '100%',
        }}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              onDelete={() => handleRemoveSkill(skill)}
              disabled={disabled}
              sx={{ 
                borderRadius: '10px', 
                fontWeight: 500,
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                height: { xs: 38, sm: 42, md: 44 },
                px: { xs: 1.5, sm: 1.75 },
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover:not(.Mui-disabled)': {
                  bgcolor: alpha(theme.palette.primary.main, 0.14),
                  borderColor: alpha(theme.palette.primary.main, 0.35),
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                },
                '& .MuiChip-deleteIcon': {
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  color: theme.palette.primary.main,
                  transition: 'color 0.2s ease',
                  '&:hover': {
                    color: theme.palette.primary.dark,
                  },
                },
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }, [skills, disabled, handleRemoveSkill, theme]);

  return (
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: 0,
      width: '100%',
      maxWidth: '100%',
    }}>
      {/* Enhanced Header - Premium Typography */}
      <Box sx={{ mb: { xs: 2.5, sm: 3 }, width: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          justifyContent: 'space-between', 
          mb: { xs: 0.75, sm: 1 },
          flexWrap: 'wrap',
          gap: { xs: 0.75, sm: 1 },
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6"
              fontWeight={600} 
              color="text.primary" 
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, 
                letterSpacing: '-0.015em',
                lineHeight: { xs: 1.35, sm: 1.3 },
                mb: { xs: 0.5, sm: 0.625 },
                fontWeight: 600,
              }}
            >
              Skills & Expertise
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' }, 
                lineHeight: { xs: 1.5, sm: 1.55 },
                fontWeight: 400,
                color: theme.palette.text.secondary,
                pr: { xs: 0, sm: 2 },
              }}
            >
              Add your specialized skills to showcase your expertise
            </Typography>
          </Box>
          <Box
            sx={{
              px: { xs: 1.25, sm: 1.5 },
              py: { xs: 0.625, sm: 0.75 },
              borderRadius: '10px',
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: { xs: 'auto', sm: 72 },
              flexShrink: 0,
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                color: theme.palette.primary.main,
                lineHeight: 1.2,
                letterSpacing: '0.01em',
              }}
            >
              {skills.length}/{VALIDATION_RULES.skillTags.maxCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Enhanced Input Section - Better Alignment */}
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 1, sm: 1.25 }, 
        mb: { xs: 2.5, sm: 3 },
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        flexDirection: { xs: 'column', sm: 'row' },
      }}>
        <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
          <TextField
            id="newSkill"
            placeholder="Type a skill name..."
            variant="outlined"
            fullWidth
            value={newSkill}
            onChange={handleNewSkillChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            error={Boolean(localErrors.newSkill)}
            helperText={localErrors.newSkill || ''}
            inputProps={{ maxLength: 50 }}
            disabled={disabled || skills.length >= VALIDATION_RULES.skillTags.maxCount}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                bgcolor: localErrors.newSkill
                  ? alpha(theme.palette.error.main, 0.04)
                  : alpha(theme.palette.grey[50], 0.6),
                fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
                height: { xs: '50px', sm: '54px', md: '56px' },
                transition: theme.transitions.create(
                  ['background-color', 'border-color', 'box-shadow'],
                  { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
                ),
                '& fieldset': {
                  borderColor: localErrors.newSkill
                    ? alpha(theme.palette.error.main, 0.2)
                    : alpha(theme.palette.divider, 0.1),
                  borderWidth: '1px',
                  transition: 'all 0.2s ease',
                },
                '&:hover': {
                  bgcolor: localErrors.newSkill
                    ? alpha(theme.palette.error.main, 0.06)
                    : alpha(theme.palette.grey[100], 0.8),
                  '& fieldset': {
                    borderColor: localErrors.newSkill
                      ? alpha(theme.palette.error.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.15),
                  },
                },
                '&.Mui-focused': {
                  bgcolor: 'background.paper',
                  boxShadow: localErrors.newSkill
                    ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.08)}`
                    : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.08)}`,
                  '& fieldset': {
                    borderColor: localErrors.newSkill
                      ? theme.palette.error.main
                      : theme.palette.primary.main,
                    borderWidth: '1.5px',
                  },
                },
              },
              '& .MuiInputBase-input': {
                fontWeight: 500,
                color: theme.palette.text.primary,
                padding: { xs: '15px 18px', sm: '17px 20px', md: '18px 22px' },
                fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
                '&::placeholder': {
                  color: alpha(theme.palette.text.secondary, 0.45),
                  opacity: 1,
                  fontWeight: 400,
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                },
              },
              '& .MuiFormHelperText-root': {
                fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                mt: 0.875,
                mx: 0,
                fontWeight: 400,
              },
            }}
          />
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddSkill}
          disabled={
            disabled ||
            !newSkill.trim() ||
            skills.length >= VALIDATION_RULES.skillTags.maxCount
          }
          startIcon={<Plus size={isMobile ? 18 : 20} />}
          sx={{
            minWidth: { xs: '100%', sm: 110, md: 120 },
            height: { xs: '50px', sm: '54px', md: '56px' },
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            boxShadow: 'none',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover:not(:disabled)': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-1px)',
            },
            '&:active:not(:disabled)': {
              transform: 'translateY(0)',
            },
            '&:disabled': {
              opacity: 0.5,
              cursor: 'not-allowed',
            },
          }}
        >
          Add
        </Button>
      </Box>

      {/* Enhanced Error Display */}
      {showErrors && localErrors.skillTags && (
        <Box
          sx={{
            mb: { xs: 2, sm: 2.5 },
            p: { xs: 1.25, sm: 1.5 },
            borderRadius: '12px',
            bgcolor: alpha(theme.palette.error.main, 0.06),
            border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            width: '100%',
          }}
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
          <Typography 
            variant="body2" 
            color="error" 
            sx={{ 
              fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              lineHeight: { xs: 1.5, sm: 1.55 },
              fontWeight: 500,
              flex: 1,
            }}
          >
            {localErrors.skillTags}
          </Typography>
        </Box>
      )}

      {/* Popular Skills - Enhanced Visibility */}
      <Box sx={{ mb: { xs: 2.5, sm: 3 }, width: '100%' }}>
        <Typography 
          variant="body2" 
          fontWeight={500} 
          sx={{ 
            mb: { xs: 1.5, sm: 1.75 }, 
            color: 'text.secondary', 
            display: 'block', 
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            letterSpacing: '-0.01em',
            fontWeight: 500,
          }}
        >
          Popular Skills
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: { xs: 0.875, sm: 1, md: 1.125 },
          width: '100%',
        }}>
          {DEFAULT_SKILLS.map((skill) => {
            const isSelected = skills.includes(skill);
            
            return (
              <Chip
                key={skill}
                label={skill}
                clickable
                onClick={() => handleSuggestedSkillClick(skill)}
                disabled={
                  disabled ||
                  (!isSelected && skills.length >= VALIDATION_RULES.skillTags.maxCount)
                }
                sx={{
                  borderRadius: '10px',
                  height: { xs: 38, sm: 42, md: 44 },
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  fontWeight: 500,
                  px: { xs: 1.5, sm: 1.75 },
                  bgcolor: isSelected
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.grey[50], 0.6),
                  color: isSelected
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                  border: isSelected
                    ? `1px solid ${alpha(theme.palette.primary.main, 0.25)}`
                    : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover:not(.Mui-disabled)': {
                    bgcolor: isSelected
                      ? alpha(theme.palette.primary.main, 0.14)
                      : alpha(theme.palette.grey[100], 0.8),
                    borderColor: isSelected
                      ? alpha(theme.palette.primary.main, 0.35)
                      : alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  },
                  '&:active:not(.Mui-disabled)': {
                    transform: 'translateY(0)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.4,
                    cursor: 'not-allowed',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Selected Skills Display */}
      {skillTagsDisplay && (
        <Box sx={{ width: '100%' }}>
          {skillTagsDisplay}
        </Box>
      )}
    </Box>
  );
};

SkillsSection.propTypes = {
  disabled: PropTypes.bool,
  onValidationChange: PropTypes.func,
  showErrors: PropTypes.bool,
};

export default SkillsSection;

