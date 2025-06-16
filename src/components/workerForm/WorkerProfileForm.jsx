import React, { useState, useCallback, useMemo, useEffect } from 'react';
import useOnboardingStore, {
  useProfileMutation,
} from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';
import './css/WorkerProfileForm.css';

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
  'Patient Care',
  'Elder Care',
  'Medication Management',
  'First Aid',
  'CPR',
  'Meal Preparation',
  'Mobility Assistance',
  'Dementia Care',
  'Wound Care',
  'Vital Signs Monitoring',
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
    minLength: 50,
    maxLength: 1000,
    required: true,
  },
  expectedHourlyRate: {
    min: 15,
    max: 200,
    required: true,
  },
  skillTags: {
    minCount: 5,
    maxCount: 15,
    required: true,
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
        if (!value || typeof value !== 'string') {
          errors.biography = 'Professional summary is required';
        } else {
          const trimmed = value.trim();
          if (trimmed.length < VALIDATION_RULES.biography.minLength) {
            errors.biography = `Professional summary must be at least ${VALIDATION_RULES.biography.minLength} characters (currently: ${trimmed.length})`;
          } else if (trimmed.length > VALIDATION_RULES.biography.maxLength) {
            errors.biography = `Professional summary must not exceed ${VALIDATION_RULES.biography.maxLength} characters (currently: ${trimmed.length})`;
          }
        }
        break;

      case 'expectedHourlyRate':
        if (!value && value !== 0) {
          errors.expectedHourlyRate = 'Hourly rate is required';
        } else {
          const rate = parseFloat(value);
          if (isNaN(rate) || rate < VALIDATION_RULES.expectedHourlyRate.min) {
            errors.expectedHourlyRate = `Hourly rate must be at least $${VALIDATION_RULES.expectedHourlyRate.min}`;
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

    setFormErrors(allErrors);
    return Object.keys(allErrors).length === 0;
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

  // Enhanced form submission with comprehensive validation
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    const isValid = validateForm();
    
    if (!isValid) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.profile_wrkr_basic_input_error, .profile_wrkr_basic_error_text');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log('Submitting profile:', {
      biography: profile.biography?.trim(),
      skillTags: profile.skillTags,
      expectedHourlyRate: profile.expectedHourlyRate,
      languages: profile.languages,
    });
    
    saveProfile({
      ...profile,
      biography: profile.biography?.trim(), // Ensure trimmed biography is saved
    });
  }, [profile, saveProfile, validateForm]);

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = useMemo(() => {
    if (!profile.biography?.trim() || 
        profile.biography.trim().length < VALIDATION_RULES.biography.minLength) {
      return false;
    }
    
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
      <div className="profile_wrkr_basic_skills_selected">
        <div className="profile_wrkr_basic_skills_selected_label">
          Your Skills ({skills.length}/{VALIDATION_RULES.skillTags.maxCount}):
        </div>
        <div className="profile_wrkr_basic_skills_tags">
          {skills.map((skill) => (
            <div key={skill} className="profile_wrkr_basic_skill_tag">
              <span className="profile_wrkr_basic_skill_name">{skill}</span>
              <button
                type="button"
                className="profile_wrkr_basic_skill_remove"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill} skill`}
                disabled={isPending}
                title={`Remove ${skill}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }, [profile.skillTags, removeSkill, isPending]);

  // Memoized language tags display with proper data structure handling
  const languageTags = useMemo(() => {
    const languages = profile.languages || [];
    
    if (languages.length === 0) {
      return null;
    }

    return (
      <div className="profile_wrkr_basic_languages_selected">
        <div className="profile_wrkr_basic_languages_selected_label">
          Your Languages ({languages.length}/{VALIDATION_RULES.languages.maxCount}):
        </div>
        <div className="profile_wrkr_basic_languages_tags">
          {languages.map((lang, index) => {
            // Handle both possible data structures
            const languageName = typeof lang.language === 'string' 
              ? lang.language 
              : lang.language?.language || 'Unknown';
            
            const key = `${languageName}-${index}`;
            
            return (
              <div key={key} className="profile_wrkr_basic_language_tag">
                <span className="profile_wrkr_basic_language_name">
                  {languageName}
                </span>
                <select
                  className="profile_wrkr_basic_language_proficiency"
                  value={lang.proficiency || 'fluent'}
                  onChange={(e) => updateProficiency(languageName, e.target.value)}
                  disabled={isPending}
                >
                  {PROFICIENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="profile_wrkr_basic_language_remove"
                  onClick={() => removeSelectedLanguage(lang)}
                  aria-label={`Remove ${languageName} language`}
                  disabled={isPending}
                  title={`Remove ${languageName}`}
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
      </div>
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
    <form onSubmit={handleSubmit} className="profile_wrkr_basic_form" noValidate>
      {error && (
        <div className="profile_wrkr_basic_error_message" role="alert">
          {error.response?.data?.message ||
            'An error occurred while saving your profile. Please try again.'}
        </div>
      )}

      <div className="profile_wrkr_basic_form_section">
        <h3 className="profile_wrkr_basic_section_title">Basic Information</h3>
        
        <div className="profile_wrkr_basic_form_group">
          <label htmlFor="biography" className="profile_wrkr_basic_form_label">
            Professional Summary
            <span className="profile_wrkr_basic_required">*</span>
          </label>
          <textarea
            id="biography"
            name="biography"
            className={`profile_wrkr_basic_form_textarea ${
              formErrors.biography ? 'profile_wrkr_basic_input_error' : ''
            }`}
            value={profile.biography || ''}
            onChange={handleChange}
            placeholder={`Tell us about your experience, strengths, and what makes you a great care worker (minimum ${VALIDATION_RULES.biography.minLength} characters)...`}
            rows={4}
            required
            maxLength={VALIDATION_RULES.biography.maxLength}
            aria-describedby={formErrors.biography ? 'biography-error' : 'biography-hint'}
          />
          <div className="profile_wrkr_basic_char_count">
            {(profile.biography || '').length}/{VALIDATION_RULES.biography.maxLength} characters
            {profile.biography && profile.biography.length >= VALIDATION_RULES.biography.minLength && 
              ' ✓'
            }
          </div>
          {formErrors.biography && (
            <div 
              id="biography-error" 
              className="profile_wrkr_basic_error_text" 
              role="alert"
            >
              {formErrors.biography}
            </div>
          )}
        </div>

        <div className="profile_wrkr_basic_form_group">
          <label htmlFor="expectedHourlyRate" className="profile_wrkr_basic_form_label">
            Expected Hourly Rate (AUD)
            <span className="profile_wrkr_basic_required">*</span>
          </label>
          <div className="profile_wrkr_basic_input_with_icon">
            <span className="profile_wrkr_basic_currency_symbol">$</span>
            <input
              type="number"
              id="expectedHourlyRate"
              name="expectedHourlyRate"
              className={`profile_wrkr_basic_form_input profile_wrkr_basic_currency_input ${
                formErrors.expectedHourlyRate ? 'profile_wrkr_basic_input_error' : ''
              }`}
              value={profile.expectedHourlyRate || ''}
              onChange={handleChange}
              placeholder="25"
              min={VALIDATION_RULES.expectedHourlyRate.min}
              max={VALIDATION_RULES.expectedHourlyRate.max}
              step={0.5}
              required
              aria-describedby={formErrors.expectedHourlyRate ? 'rate-error' : 'rate-hint'}
            />
          </div>
   
          {formErrors.expectedHourlyRate && (
            <div 
              id="rate-error" 
              className="profile_wrkr_basic_error_text" 
              role="alert"
            >
              {formErrors.expectedHourlyRate}
            </div>
          )}
        </div>
      </div>

      <div className="profile_wrkr_basic_form_section">
        <h3 className="profile_wrkr_basic_section_title">Skills</h3>
        <p className="profile_wrkr_basic_text_helper">
          Select your skills or add your own (minimum {VALIDATION_RULES.skillTags.minCount}, maximum {VALIDATION_RULES.skillTags.maxCount})
        </p>

        <div className="profile_wrkr_basic_skills_suggestion">
          {DEFAULT_SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              className={`profile_wrkr_basic_skill_btn ${
                (profile.skillTags || []).includes(skill) 
                  ? 'profile_wrkr_basic_skill_selected' 
                  : ''
              }`}
              onClick={() => handleSuggestedSkillClick(skill)}
              disabled={
                isPending || 
                (!((profile.skillTags || []).includes(skill)) && 
                 (profile.skillTags || []).length >= VALIDATION_RULES.skillTags.maxCount)
              }
            >
              {skill}
            </button>
          ))}
        </div>

        <div className="profile_wrkr_basic_form_group">
          <label htmlFor="newSkill" className="profile_wrkr_basic_form_label">
            Add Custom Skill
          </label>
          <div className="profile_wrkr_basic_input_group">
            <input
              type="text"
              id="newSkill"
              className={`profile_wrkr_basic_form_input ${
                formErrors.newSkill ? 'profile_wrkr_basic_input_error' : ''
              }`}
              value={newSkill}
              onChange={handleNewSkillChange}
              placeholder="e.g. Physiotherapy, Diabetes Management"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
              maxLength={50}
              disabled={
                isPending || 
                (profile.skillTags || []).length >= VALIDATION_RULES.skillTags.maxCount
              }
            />
            <button
              type="button"
              className="profile_wrkr_basic_btn_add"
              onClick={addSkill}
              aria-label="Add skill"
              disabled={
                isPending || 
                !newSkill.trim() || 
                (profile.skillTags || []).length >= VALIDATION_RULES.skillTags.maxCount
              }
            >
              <span className="profile_wrkr_basic_btn_icon">+</span>
              <span className="profile_wrkr_basic_btn_text">Add</span>
            </button>
          </div>
          {formErrors.newSkill && (
            <div className="profile_wrkr_basic_error_text" role="alert">
              {formErrors.newSkill}
            </div>
          )}
          {formErrors.skillTags && (
            <div className="profile_wrkr_basic_error_text" role="alert">
              {formErrors.skillTags}
            </div>
          )}
        </div>

        {skillTags}
      </div>

      <div className="profile_wrkr_basic_form_section">
        <h3 className="profile_wrkr_basic_section_title">Languages Spoken</h3>
        <p className="profile_wrkr_basic_text_helper">
          Select languages you're comfortable speaking with clients (minimum {VALIDATION_RULES.languages.minCount}, maximum {VALIDATION_RULES.languages.maxCount})
        </p>

        <div className="profile_wrkr_basic_languages_suggestion">
          {DEFAULT_LANGUAGES.map((language) => {
            const isSelected = (profile.languages || []).some(lang => {
              const existingName = typeof lang.language === 'string' 
                ? lang.language 
                : lang.language?.language;
              return existingName === language;
            });
            
            return (
              <button
                key={language}
                type="button"
                className={`profile_wrkr_basic_language_btn ${
                  isSelected ? 'profile_wrkr_basic_language_selected' : ''
                }`}
                onClick={() => handleSuggestedLanguageClick(language)}
                disabled={
                  isPending || 
                  (!isSelected && 
                   (profile.languages || []).length >= VALIDATION_RULES.languages.maxCount)
                }
              >
                {language}
              </button>
            );
          })}
        </div>

        <div className="profile_wrkr_basic_form_group">
          <label htmlFor="newLanguage" className="profile_wrkr_basic_form_label">
            Add Custom Language
          </label>
          <div className="profile_wrkr_basic_input_group">
            <input
              type="text"
              id="newLanguage"
              className={`profile_wrkr_basic_form_input ${
                formErrors.newLanguage ? 'profile_wrkr_basic_input_error' : ''
              }`}
              value={newLanguage}
              onChange={handleNewLanguageChange}
              placeholder="e.g. Portuguese, Russian"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addNewLanguage();
                }
              }}
              maxLength={30}
              disabled={
                isPending || 
                (profile.languages || []).length >= VALIDATION_RULES.languages.maxCount
              }
            />
            <select
              className="profile_wrkr_basic_proficiency_select"
              value={languageProficiency}
              onChange={(e) => setLanguageProficiency(e.target.value)}
              disabled={isPending}
            >
              {PROFICIENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="profile_wrkr_basic_btn_add"
              onClick={addNewLanguage}
              aria-label="Add language"
              disabled={
                isPending || 
                !newLanguage.trim() || 
                (profile.languages || []).length >= VALIDATION_RULES.languages.maxCount
              }
            >
              <span className="profile_wrkr_basic_btn_icon">+</span>
              <span className="profile_wrkr_basic_btn_text">Add</span>
            </button>
          </div>
          {formErrors.newLanguage && (
            <div className="profile_wrkr_basic_error_text" role="alert">
              {formErrors.newLanguage}
            </div>
          )}
          {formErrors.languages && (
            <div className="profile_wrkr_basic_error_text" role="alert">
              {formErrors.languages}
            </div>
          )}
        </div>

        {languageTags}
      </div>

      <div className="profile_wrkr_basic_form_actions">
        <button 
          type="submit" 
          className={`profile_wrkr_basic_btn_primary ${
            !isFormValid ? 'profile_wrkr_basic_btn_disabled' : ''
          }`}
          disabled={isPending || !isFormValid}
          aria-describedby="submit-help"
        >
          {isPending ? (
            <>
              <span className="profile_wrkr_basic_spinner" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            'Next: Availability'
          )}
        </button>
        
        {!isFormValid && hasAttemptedSubmit && (
          <div id="submit-help" className="profile_wrkr_basic_form_help" role="alert">
            Please complete all required fields above to continue.
          </div>
        )}
        
        {/* {!isFormValid && !hasAttemptedSubmit && (
          <div id="submit-help" className="profile_wrkr_basic_form_help">
            Complete all required fields to proceed to the next step.
          </div>
        )} */}
      </div>
    </form>
  );
});

WorkerProfileForm.displayName = 'WorkerProfileForm';
export default WorkerProfileForm;