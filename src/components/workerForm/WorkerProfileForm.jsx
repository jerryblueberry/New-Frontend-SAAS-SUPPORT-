import React, { useState, useCallback, useMemo } from 'react';
import useOnboardingStore, { useProfileMutation } from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';
import './css/WorkerProfileForm.css'
const WorkerProfileForm = React.memo(() => {
  const [newSkill, setNewSkill] = useState('');
  const profile = useOnboardingStore(state => state.profile, shallow);
  const updateProfile = useOnboardingStore(state => state.updateProfile);
  const { mutate: saveProfile, isPending, error } = useProfileMutation();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    updateProfile({ [name]: value });
  }, [updateProfile]);

  const addSkill = useCallback(() => {
    const trimmed = newSkill.trim();
    if (trimmed && !profile.skillTags.includes(trimmed)) {
      updateProfile({ skillTags: [...profile.skillTags, trimmed] });
      setNewSkill('');
    }
  }, [newSkill, profile.skillTags, updateProfile]);

  const removeSkill = useCallback((skill) => {
    updateProfile({
      skillTags: profile.skillTags.filter(s => s !== skill)
    });
  }, [profile.skillTags, updateProfile]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    saveProfile(profile);
  }, [profile, saveProfile]);

  const suggestedSkills = useMemo(() => [
    'Patient Care', 'Elder Care', 'Medication Management',
    'First Aid', 'CPR', 'Meal Preparation', 'Mobility Assistance',
    'Dementia Care', 'Wound Care', 'Vital Signs Monitoring'
  ], []);

  const skillTags = useMemo(() => {
    if (profile.skillTags.length === 0) return null;

    return (
      <div className="wrkr-skills-selected">
        <div className="wrkr-skills-selected-label">Your Skills:</div>
        <div className="wrkr-skills-tags">
          {profile.skillTags.map(skill => (
            <div key={skill} className="wrkr-skill-tag">
              <span className="wrkr-skill-name">{skill}</span>
              <button
                type="button"
                className="wrkr-skill-remove"
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

  return (
    <form onSubmit={handleSubmit} className="wrkr-profile-form">
      {error && (
        <div className="wrkr-error-message">
          {error.response?.data?.message || 'An error occurred while saving your profile'}
        </div>
      )}

      <div className="wrkr-form-section">
        <h3 className="wrkr-section-title">Basic Information</h3>
        <div className="wrkr-form-group">
          <label htmlFor="biography" className="wrkr-form-label">Professional Summary</label>
          <textarea
            id="biography"
            name="biography"
            className="wrkr-form-textarea"
            value={profile.biography || ''}
            onChange={handleChange}
            placeholder="Tell us about your experience, strengths, and what makes you a great care worker..."
            rows={4}
          ></textarea>
        </div>

        <div className="wrkr-form-group">
          <label htmlFor="expectedHourlyRate" className="wrkr-form-label">Expected Hourly Rate (AUD)</label>
          <div className="wrkr-input-with-icon">
            <span className="wrkr-currency-symbol">$</span>
            <input
              type="number"
              id="expectedHourlyRate"
              name="expectedHourlyRate"
              className="wrkr-form-input wrkr-currency-input"
              value={profile.expectedHourlyRate || ''}
              onChange={handleChange}
              placeholder="25"
              min={0}
              step={0.5}
              required
            />
          </div>
        </div>
      </div>

      <div className="wrkr-form-section">
        <h3 className="wrkr-section-title">Skills</h3>
        <p className="wrkr-text-helper">Select your skills or add your own</p>

        <div className="wrkr-skills-suggestion">
          {suggestedSkills.map(skill => (
            <button
              key={skill}
              type="button"
              className={`wrkr-skill-btn ${profile.skillTags.includes(skill) ? 'wrkr-skill-selected' : ''}`}
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

        <div className="wrkr-form-group">
          <label htmlFor="newSkill" className="wrkr-form-label">Add Custom Skill</label>
          <div className="wrkr-input-group">
            <input
              type="text"
              id="newSkill"
              className="wrkr-form-input"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. Physiotherapy, Diabetes Management"
            />
            <button
              type="button"
              className="wrkr-btn-add"
              onClick={addSkill}
              aria-label="Add skill"
              disabled={isPending}
            >
              <span className="wrkr-btn-icon">+</span>
              <span className="wrkr-btn-text">Add</span>
            </button>
          </div>
        </div>

        {skillTags}
      </div>

      <div className="wrkr-form-actions">
        <button
          type="submit"
          className="wrkr-btn-primary"
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Next: Availability'}
        </button>
      </div>
    </form>
  );
});

export default WorkerProfileForm;
