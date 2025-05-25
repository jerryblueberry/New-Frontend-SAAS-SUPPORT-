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

const WorkerProfileForm = React.memo(() => {
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [languageProficiency, setLanguageProficiency] = useState('fluent');
  const [formErrors, setFormErrors] = useState({});

  // Get state and actions from store individually to avoid infinite loop
  const profile = useOnboardingStore((state) => state.profile, shallow);
  const updateProfile = useOnboardingStore((state) => state.updateProfile);
  const addLanguage = useOnboardingStore((state) => state.addLanguage);
  const removeLanguage = useOnboardingStore((state) => state.removeLanguage);
  const updateLanguageProficiency = useOnboardingStore(
    (state) => state.updateLanguageProficiency
  );

  const { mutate: saveProfile, isPending, error } = useProfileMutation();

  // Validate form fields
  const validateForm = useCallback(() => {
    const errors = {};

    if (!profile.biography || profile.biography.trim().length < 50) {
      errors.biography =
        'Professional summary should be at least 50 characters';
    }

    if (!profile.expectedHourlyRate || profile.expectedHourlyRate < 0) {
      errors.expectedHourlyRate = 'Please enter a valid hourly rate';
    }

    if (!profile.skillTags || profile.skillTags.length === 0) {
      errors.skillTags = 'Please add at least one skill';
    }

    if (!profile.languages || profile.languages.length === 0) {
      errors.languages = 'Please add at least one language';
    }

    // Validate each language has proficiency
    if (profile.languages) {
      const invalidLanguages = profile.languages.filter(
        (lang) =>
          !lang.proficiency ||
          !PROFICIENCY_OPTIONS.some((opt) => opt.value === lang.proficiency)
      );

      if (invalidLanguages.length > 0) {
        errors.languages = 'Please set proficiency for all languages';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [profile]);

  // Handle form field changes
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      updateProfile({
        [name]: name === 'expectedHourlyRate' ? parseFloat(value) || 0 : value,
      });

      // Clear error when field is edited
      if (formErrors[name]) {
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [updateProfile, formErrors]
  );

  // Add a new skill
  const addSkill = useCallback(() => {
    const trimmed = newSkill.trim();
    if (trimmed && !profile.skillTags.includes(trimmed)) {
      updateProfile({ skillTags: [...profile.skillTags, trimmed] });
      setNewSkill('');

      // Clear skill tags error if adding first skill
      if (formErrors.skillTags && profile.skillTags.length === 0) {
        setFormErrors((prev) => ({ ...prev, skillTags: undefined }));
      }
    }
  }, [newSkill, profile.skillTags, updateProfile, formErrors]);

  // Remove a skill
  const removeSkill = useCallback(
    (skill) => {
      updateProfile({
        skillTags: profile.skillTags.filter((s) => s !== skill),
      });
    },
    [profile.skillTags, updateProfile]
  );

  // Add a new language
  // In the addNewLanguage function:
  const addNewLanguage = useCallback(() => {
    const trimmed = newLanguage.trim();
    if (
      trimmed &&
      !profile.languages.some((lang) => lang.language.language === trimmed)
    ) {
      addLanguage({
        language: trimmed, // Just the string
        proficiency: languageProficiency,
      });
      setNewLanguage('');
      setLanguageProficiency('fluent');
    }
  }, [newLanguage, languageProficiency, profile.languages, addLanguage]);

  // In the languageTags memo:
  {
    profile.languages?.map((lang) => (
      <div key={lang.language.language} className="profile_wrkr_basic_language_tag">
        <span className="profile_wrkr_basic_language_name">{lang.language.language}</span>
        <select
          className="profile_wrkr_basic_language_proficiency"
          value={lang.proficiency || 'fluent'}
          onChange={(e) =>
            updateProficiency(lang.language.language, e.target.value)
          }
        >
          {/* options */}
        </select>
        {/* remove button */}
      </div>
    ));
  }

  // Remove a language
  const removeSelectedLanguage = useCallback(
    (language) => {
      removeLanguage(language);
    },
    [removeLanguage]
  );

  // Update language proficiency
  const updateProficiency = useCallback(
    (language, proficiency) => {
      updateLanguageProficiency(language, proficiency);
    },
    [updateLanguageProficiency]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      console.log('Submitting profile:', {
        biography: profile.biography,
        skillTags: profile.skillTags,
        expectedHourlyRate: profile.expectedHourlyRate,
        languages: profile.languages,
      });
      saveProfile(profile);
    },
    [profile, saveProfile]
  );

  // Memoized skill tags display
  const skillTags = useMemo(() => {
    return (
      <div className="profile_wrkr_basic_skills_selected">
        <div className="profile_wrkr_basic_skills_selected_label">Your Skills:</div>
        <div className="profile_wrkr_basic_skills_tags">
          {profile.skillTags?.map((skill) => (
            <div key={skill} className="profile_wrkr_basic_skill_tag">
              <span className="profile_wrkr_basic_skill_name">{skill}</span>
              <button
                type="button"
                className="profile_wrkr_basic_skill_remove"
                onClick={() => removeSkill(skill)}
                aria-label={`Remove ${skill} skill`}
                disabled={isPending}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }, [profile.skillTags, removeSkill, isPending]);
console.log("Profile",profile);
  // Memoized language tags display
  const languageTags = useMemo(() => {
    return (
      <div className="profile_wrkr_basic_languages_selected">
        <div className="profile_wrkr_basic_languages_selected_label">Your Languages:</div>
        <div className="profile_wrkr_basic_languages_tags">
          {profile.languages?.map((lang) => (
            <div key={lang.language.language} className="profile_wrkr_basic_language_tag">
              <span className="profile_wrkr_basic_language_name">
                {lang.language.language}
              </span>
              <select
                className="profile_wrkr_basic_language_proficiency"
                value={lang.proficiency || 'fluent'}
                onChange={(e) =>
                  updateProficiency(lang.language.language, e.target.value)
                }
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
                aria-label={`Remove ${lang.language.language} language`}
                disabled={isPending}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }, [profile.languages, removeSelectedLanguage, updateProficiency, isPending]);
  // Effect to clear errors when component mounts
  useEffect(() => {
    setFormErrors({});
  }, []);

  return (
    <form onSubmit={handleSubmit} className="profile_wrkr_basic_form" noValidate>
      {error && (
        <div className="profile_wrkr_basic_error_message">
          {error.response?.data?.message ||
            'An error occurred while saving your profile'}
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
            className={`profile_wrkr_basic_form_textarea ${formErrors.biography ? 'profile_wrkr_basic_input_error' : ''}`}
            value={profile.biography || ''}
            onChange={handleChange}
            placeholder="Tell us about your experience, strengths, and what makes you a great care worker (at least 50 characters)..."
            rows={4}
            required
          />
          {formErrors.biography && (
            <div className="profile_wrkr_basic_error_text">{formErrors.biography}</div>
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
              className={`profile_wrkr_basic_form_input profile_wrkr_basic_currency_input ${formErrors.expectedHourlyRate ? 'profile_wrkr_basic_input_error' : ''}`}
              value={profile.expectedHourlyRate || ''}
              onChange={handleChange}
              placeholder="25"
              min={0}
              step={0.5}
              required
            />
          </div>
          {formErrors.expectedHourlyRate && (
            <div className="profile_wrkr_basic_error_text">
              {formErrors.expectedHourlyRate}
            </div>
          )}
        </div>
      </div>

      <div className="profile_wrkr_basic_form_section">
        <h3 className="profile_wrkr_basic_section_title">Skills</h3>
        <p className="profile_wrkr_basic_text_helper">Select your skills or add your own</p>

        <div className="profile_wrkr_basic_skills_suggestion">
          {DEFAULT_SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              className={`profile_wrkr_basic_skill_btn ${profile.skillTags.includes(skill) ? 'profile_wrkr_basic_skill_selected' : ''}`}
              onClick={() => {
                if (profile.skillTags.includes(skill)) {
                  removeSkill(skill);
                } else {
                  updateProfile({ skillTags: [...profile.skillTags, skill] });
                }
              }}
            >
              {skill}
            </button>
          ))}
        </div>

        <div className="profile_wrkr_basic_form_group">
          <label htmlFor="newSkill" className="profile_wrkr_basic_form_label">
            Add Custom Skill
            <span className="profile_wrkr_basic_required">*</span>
          </label>
          <div className="profile_wrkr_basic_input_group">
            <input
              type="text"
              id="newSkill"
              className={`profile_wrkr_basic_form_input ${formErrors.skillTags ? 'profile_wrkr_basic_input_error' : ''}`}
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. Physiotherapy, Diabetes Management"
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            />
            <button
              type="button"
              className="profile_wrkr_basic_btn_add"
              onClick={addSkill}
              aria-label="Add skill"
              disabled={isPending}
            >
              <span className="profile_wrkr_basic_btn_icon">+</span>
              <span className="profile_wrkr_basic_btn_text">Add</span>
            </button>
          </div>
          {formErrors.skillTags && (
            <div className="profile_wrkr_basic_error_text">{formErrors.skillTags}</div>
          )}
        </div>

        {skillTags}
      </div>

      <div className="profile_wrkr_basic_form_section">
        <h3 className="profile_wrkr_basic_section_title">Languages Spoken</h3>
        <p className="profile_wrkr_basic_text_helper">
          Select languages you're comfortable speaking with clients
        </p>

        <div className="profile_wrkr_basic_languages_suggestion">
          {DEFAULT_LANGUAGES.map((language) => (
            <button
              key={language}
              type="button"
              className={`profile_wrkr_basic_language_btn ${
                (profile.languages || []).some(
                  (lang) => lang.language.language === language
                )
                  ? 'profile_wrkr_basic_language_selected'
                  : ''
              }`}
              onClick={() => {
                const existingLang = (profile.languages || []).find(
                  (lang) => lang.language.language === language
                );
                if (existingLang) {
                  removeLanguage(existingLang);
                } else {
                  addLanguage({
                    language: language,
                    proficiency: 'fluent',
                  });
                }
              }}
            >
              {language}
            </button>
          ))}
        </div>

        <div className="profile_wrkr_basic_form_group">
          <label htmlFor="newLanguage" className="profile_wrkr_basic_form_label">
            Add Custom Language
            <span className="profile_wrkr_basic_required">*</span>
          </label>
          <div className="profile_wrkr_basic_input_group">
            <input
              type="text"
              id="newLanguage"
              className={`profile_wrkr_basic_form_input ${formErrors.languages ? 'profile_wrkr_basic_input_error' : ''}`}
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="e.g. Portuguese, Russian"
              onKeyDown={(e) => e.key === 'Enter' && addNewLanguage()}
            />
            <select
              className="profile_wrkr_basic_proficiency_select"
              value={languageProficiency}
              onChange={(e) => setLanguageProficiency(e.target.value)}
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
              disabled={isPending}
            >
              <span className="profile_wrkr_basic_btn_icon">+</span>
              <span className="profile_wrkr_basic_btn_text">Add</span>
            </button>
          </div>
          {formErrors.languages && (
            <div className="profile_wrkr_basic_error_text">{formErrors.languages}</div>
          )}
        </div>

        {languageTags}
      </div>

      <div className="profile_wrkr_basic_form_actions">
        <button type="submit" className="profile_wrkr_basic_btn_primary" disabled={isPending}>
          {isPending ? (
            <>
              <span className="profile_wrkr_basic_spinner" aria-hidden="true"></span>
              Saving...
            </>
          ) : (
            'Next: Availability'
          )}
        </button>
      </div>
    </form>
  );
});

WorkerProfileForm.displayName = 'WorkerProfileForm';
export default WorkerProfileForm;