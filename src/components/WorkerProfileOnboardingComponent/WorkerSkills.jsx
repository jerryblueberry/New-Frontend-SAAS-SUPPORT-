/**
 * WorkerSkills Component
 * 
 * Dedicated component for managing skills & expertise section
 * Features:
 * - Add/remove custom skills
 * - Popular skills suggestions
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
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useWorkerProfileStore, profileSelectors } from '../../stores/workerOnboardingStores';
import { toast } from 'react-toastify';

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

const WorkerSkills = React.memo(({ 
  error: skillsError, 
  isPending = false,
  onSkillsChange,
  onValidationChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get skills from store
  const storeSkillTags = useWorkerProfileStore(profileSelectors.skillTags);
  const updateProfile = useWorkerProfileStore((state) => state.updateProfile);

  // Local state
  const [newSkill, setNewSkill] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  // Validate skills
  const validateSkills = useCallback((skills) => {
    const errors = {};

    if (!Array.isArray(skills)) {
      errors.skillTags = 'Skills must be an array';
    } else if (skills.length < VALIDATION_RULES.skillTags.minCount) {
      errors.skillTags = `Please add at least ${VALIDATION_RULES.skillTags.minCount} skill${VALIDATION_RULES.skillTags.minCount > 1 ? 's' : ''}`;
    } else if (skills.length > VALIDATION_RULES.skillTags.maxCount) {
      errors.skillTags = `Maximum ${VALIDATION_RULES.skillTags.maxCount} skills allowed`;
    }

    // Notify parent of validation changes
    if (onValidationChange) {
      onValidationChange(errors);
    }

    return errors;
  }, [onValidationChange]);

  // Validate on skills change
  useEffect(() => {
    if (storeSkillTags) {
      const errors = validateSkills(storeSkillTags);
      setLocalErrors(errors);
    }
  }, [storeSkillTags, validateSkills]);

  // Handle new skill input change
  const handleNewSkillChange = useCallback((e) => {
    const value = e.target.value;
    setNewSkill(value);

    // Clear previous errors when user starts typing
    if (localErrors.newSkill) {
      setLocalErrors(prev => ({ ...prev, newSkill: undefined }));
    }
  }, [localErrors.newSkill]);

  // Add new skill
  const addSkill = useCallback(() => {
    const trimmed = newSkill.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed.length < 2) {
      setLocalErrors(prev => ({ ...prev, newSkill: 'Skill name must be at least 2 characters' }));
      toast.warning('Skill name must be at least 2 characters', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (trimmed.length > 50) {
      setLocalErrors(prev => ({ ...prev, newSkill: 'Skill name must not exceed 50 characters' }));
      toast.warning('Skill name must not exceed 50 characters', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const currentSkills = storeSkillTags || [];

    if (currentSkills.includes(trimmed)) {
      setLocalErrors(prev => ({ ...prev, newSkill: 'This skill has already been added' }));
      toast.warning('This skill has already been added', {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (currentSkills.length >= VALIDATION_RULES.skillTags.maxCount) {
      setLocalErrors(prev => ({ ...prev, newSkill: `Maximum ${VALIDATION_RULES.skillTags.maxCount} skills allowed` }));
      toast.warning(`Maximum ${VALIDATION_RULES.skillTags.maxCount} skills allowed`, {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const updatedSkills = [...currentSkills, trimmed];
    updateProfile({ skillTags: updatedSkills });
    setNewSkill('');

    // Clear errors
    setLocalErrors(prev => ({
      ...prev,
      newSkill: undefined,
      ...(updatedSkills.length >= VALIDATION_RULES.skillTags.minCount && { skillTags: undefined })
    }));

    // Validate updated skills
    const errors = validateSkills(updatedSkills);
    setLocalErrors(prev => ({ ...prev, ...errors }));

    // Notify parent
    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    }
  }, [newSkill, storeSkillTags, updateProfile, validateSkills, onSkillsChange]);

  // Remove a skill
  const removeSkill = useCallback((skill) => {
    const updatedSkills = (storeSkillTags || []).filter(s => s !== skill);
    updateProfile({ skillTags: updatedSkills });
    
    // Validate updated skills
    const errors = validateSkills(updatedSkills);
    setLocalErrors(prev => ({ ...prev, ...errors }));

    // Notify parent
    if (onSkillsChange) {
      onSkillsChange(updatedSkills);
    }
  }, [storeSkillTags, updateProfile, validateSkills, onSkillsChange]);

  // Handle suggested skill click
  const handleSuggestedSkillClick = useCallback((skill) => {
    const currentSkills = storeSkillTags || [];

    if (currentSkills.includes(skill)) {
      removeSkill(skill);
    } else if (currentSkills.length < VALIDATION_RULES.skillTags.maxCount) {
      const updatedSkills = [...currentSkills, skill];
      updateProfile({ skillTags: updatedSkills });
      
      const errors = validateSkills(updatedSkills);
      setLocalErrors(prev => ({ ...prev, ...errors }));

      // Notify parent
      if (onSkillsChange) {
        onSkillsChange(updatedSkills);
      }
    }
  }, [storeSkillTags, removeSkill, updateProfile, validateSkills, onSkillsChange]);

  // Memoized skill tags display
  const skillTagsDisplay = useMemo(() => {
    const skills = storeSkillTags || [];

    if (skills.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 2 }}>
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
          Your Skills ({skills.length}/{VALIDATION_RULES.skillTags.maxCount})
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.75}>
          {skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              onDelete={() => removeSkill(skill)}
              disabled={isPending}
              size="small"
              sx={{
                borderRadius: { xs: 1.5, sm: 2 },
                fontWeight: 500,
                fontSize: { xs: '0.813rem', sm: '0.875rem' },
                height: { xs: 30, sm: 32 },
                background: '#eef2ff',
                color: '#667eea',
                border: '1px solid #c7d2fe',
                '& .MuiChip-deleteIcon': {
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  color: '#667eea',
                  '&:hover': {
                    color: '#5a67d8',
                  },
                },
                '&:hover': {
                  background: '#e0e7ff',
                  borderColor: '#a5b4fc',
                },
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Stack>
      </Box>
    );
  }, [storeSkillTags, removeSkill, isPending]);

  const displayError = skillsError || localErrors.skillTags;

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
            icon="🛠️"
            title="Skills & Expertise"
            subtitle="Select or add your specialized abilities"
            count={(storeSkillTags || []).length}
            maxCount={VALIDATION_RULES.skillTags.maxCount}
          />
        </Box>

        {/* Add Custom Skill - Clean Design */}
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, mb: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
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
            error={Boolean(localErrors.newSkill)}
            helperText={localErrors.newSkill || ''}
            inputProps={{ maxLength: 50 }}
            disabled={
              isPending ||
              (storeSkillTags || []).length >= VALIDATION_RULES.skillTags.maxCount
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
          <Button
            variant="contained"
            onClick={addSkill}
            disabled={
              isPending ||
              !newSkill.trim() ||
              (storeSkillTags || []).length >= VALIDATION_RULES.skillTags.maxCount
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

        {/* Popular Skills - Clean Design */}
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
          Popular Skills
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.75, sm: 1 }, mb: 2.5 }}>
          {DEFAULT_SKILLS.map((skill) => {
            const isSelected = (storeSkillTags || []).includes(skill);
            return (
              <Chip
                key={skill}
                label={skill}
                clickable
                onClick={() => handleSuggestedSkillClick(skill)}
                disabled={
                  isPending ||
                  (!isSelected &&
                    (storeSkillTags || []).length >= VALIDATION_RULES.skillTags.maxCount)
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

        {/* Selected Skills Display */}
        {skillTagsDisplay}
      </CardContent>
    </Card>
  );
});

WorkerSkills.displayName = 'WorkerSkills';
export default WorkerSkills;

