import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
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

  // Memoized skill tags display
  const skillTagsDisplay = useMemo(() => {
    if (skills.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 1.5 }}>
        <Typography 
          variant="caption" 
          fontWeight={600} 
          sx={{ mb: 1, color: 'text.primary', display: 'block', fontSize: '0.8rem' }}
        >
          Your Skills ({skills.length}/{VALIDATION_RULES.skillTags.maxCount})
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              onDelete={() => handleRemoveSkill(skill)}
              disabled={disabled}
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
  }, [skills, disabled, handleRemoveSkill]);

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
        mb: { xs: 2, sm: 2, md: 2 },
        flexShrink: 0 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.12) 100%)',
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
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              color="text.primary" 
              sx={{ fontSize: { xs: '1.05rem', md: '1.15rem' }, mb: 0.5 }}
            >
              Skills & Expertise
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}
            >
              Select or add your specialized abilities
            </Typography>
          </Box>
        </Box>
        <Chip
          label={`${skills.length}/${VALIDATION_RULES.skillTags.maxCount}`}
          size="small"
          color={skills.length > 0 ? 'primary' : 'default'}
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
              handleAddSkill();
            }
          }}
          error={Boolean(localErrors.newSkill)}
          helperText={localErrors.newSkill || ''}
          inputProps={{ maxLength: 50 }}
          disabled={disabled || skills.length >= VALIDATION_RULES.skillTags.maxCount}
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
          onClick={handleAddSkill}
          disabled={
            disabled ||
            !newSkill.trim() ||
            skills.length >= VALIDATION_RULES.skillTags.maxCount
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

      {/* Consolidated Error Display */}
      {showErrors && localErrors.skillTags && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 1.5, 
            borderRadius: 2, 
            py: 0.5, 
            '& .MuiAlert-message': { fontSize: '0.8rem' } 
          }}
        >
          {localErrors.skillTags}
        </Alert>
      )}

      {/* Popular Skills */}
      <Typography 
        variant="caption" 
        fontWeight={600} 
        sx={{ mb: 1.5, color: 'text.primary', display: 'block', fontSize: '0.8rem' }}
      >
        Popular Skills
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {DEFAULT_SKILLS.map((skill) => {
          const isSelected = skills.includes(skill);
          
          return (
            <Chip
              key={skill}
              label={skill}
              clickable
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              onClick={() => handleSuggestedSkillClick(skill)}
              disabled={
                disabled ||
                (!isSelected && skills.length >= VALIDATION_RULES.skillTags.maxCount)
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
          );
        })}
      </Box>

      {/* Selected Skills Display */}
      {skillTagsDisplay && (
        <Box sx={{ mt: 1.5 }}>
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

