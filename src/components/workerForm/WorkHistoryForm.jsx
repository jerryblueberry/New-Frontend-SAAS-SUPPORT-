import React, { useState, useEffect, useCallback } from 'react';
import { useWorkHistoryMutation } from '../../stores/useOnboardingStore';
import useOnboardingStore from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';
import './css/WorkHistoryForm.css';
import { Toaster, toast } from 'react-hot-toast';
const WorkHistoryForm = ({ onComplete,onError }) => {
  // Access store state with selectors for targeted re-renders
  const workHistory = useOnboardingStore(state => state.workHistory, shallow);
  const prevStep = useOnboardingStore(state => state.prevStep);
  const updateWorkHistory = useOnboardingStore(state => state.updateWorkHistory);
  const addJob = useOnboardingStore(state => state.addJob);
  const removeJob = useOnboardingStore(state => state.removeJob);

  // Setup mutation for API interaction
  const { mutate: saveWorkHistory, isPending } = useWorkHistoryMutation();

  // Local state for form management
  const [localWorkHistory, setLocalWorkHistory] = useState({
    jobs: [],
    noWorkHistory: false,
    hasReferences: 'no',
    references: []
  });
  const [expandedJob, setExpandedJob] = useState(null);
  const [expandedReference, setExpandedReference] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Initialize local state from store
  useEffect(() => {
    if (workHistory) {
      setLocalWorkHistory({
        jobs: workHistory.jobs || [],
        noWorkHistory: workHistory.noWorkHistory || false,
        hasReferences: workHistory.references?.length > 0 ? 'yes' : 'no',
        references: workHistory.references || []
      });
    }
  }, [workHistory]);

  // Job management functions
  const addNewJob = useCallback(() => {
    const newJob = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: ''
    };
    
    addJob(newJob);
    setLocalWorkHistory(prev => ({
      ...prev,
      jobs: [...prev.jobs, newJob]
    }));
    
    // Auto-expand the new job
    setTimeout(() => {
      setExpandedJob(localWorkHistory.jobs.length);
      document.getElementById(`wh-job-card-${localWorkHistory.jobs.length}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  }, [addJob, localWorkHistory.jobs.length]);

  const handleRemoveJob = useCallback((index) => {
    removeJob(index);
    setLocalWorkHistory(prev => ({
      ...prev,
      jobs: prev.jobs.filter((_, i) => i !== index)
    }));
    setExpandedJob(null);
    setFormErrors({});
  }, [removeJob]);

  const handleUpdateJob = useCallback((index, field, value) => {
    const updatedJobs = [...localWorkHistory.jobs];
    updatedJobs[index] = { ...updatedJobs[index], [field]: value };
    
    updateWorkHistory({ 
      ...localWorkHistory, 
      jobs: updatedJobs 
    });
    
    setLocalWorkHistory(prev => ({
      ...prev,
      jobs: updatedJobs
    }));
    
    // Clear any error for this field
    if (formErrors[`job${index}_${field}`]) {
      setFormErrors(prev => ({
        ...prev,
        [`job${index}_${field}`]: null
      }));
    }
  }, [updateWorkHistory, localWorkHistory, formErrors]);

  // Work history checkbox handler
  const handleNoWorkHistoryChange = useCallback((e) => {
    const value = e.target.checked;
    
    updateWorkHistory({
      ...localWorkHistory,
      noWorkHistory: value
    });
    
    setLocalWorkHistory(prev => ({
      ...prev,
      noWorkHistory: value
    }));
  }, [updateWorkHistory, localWorkHistory]);

  // References management
  const handleHasReferencesChange = useCallback((value) => {
    // Create a copy of the current state to modify
    const updatedWorkHistory = {...localWorkHistory};
    updatedWorkHistory.hasReferences = value;
    
    // If toggling to "yes" and no references exist, create an empty one
    if (value === 'yes' && (!updatedWorkHistory.references || updatedWorkHistory.references.length === 0)) {
      updatedWorkHistory.references = [{
        name: '',
        company: '',
        phone: '',
        email: ''
      }];
    }
    
    // If toggling to "no", clear any references but keep the array
    if (value === 'no') {
      updatedWorkHistory.references = [];
    }
    
    // Update both the global store and local state
    updateWorkHistory(updatedWorkHistory);
    setLocalWorkHistory(updatedWorkHistory);
    
    // Auto-expand the first reference when adding and choosing "yes"
    if (value === 'yes' && updatedWorkHistory.references.length > 0) {
      setTimeout(() => {
        setExpandedReference(0);
      }, 100);
    } else {
      // Clear expanded reference when choosing "no"
      setExpandedReference(null);
    }
  }, [updateWorkHistory, localWorkHistory]);

  const handleUpdateReference = useCallback((index, field, value) => {
    const updatedReferences = [...localWorkHistory.references];
    updatedReferences[index] = { ...updatedReferences[index], [field]: value };
    
    updateWorkHistory({
      ...localWorkHistory,
      references: updatedReferences
    });
    
    setLocalWorkHistory(prev => ({
      ...prev,
      references: updatedReferences
    }));
    
    // Clear any error for this field
    if (formErrors[`ref${index}_${field}`]) {
      setFormErrors(prev => ({
        ...prev,
        [`ref${index}_${field}`]: null
      }));
    }
  }, [updateWorkHistory, localWorkHistory, formErrors]);

  const addReference = useCallback(() => {
    if (localWorkHistory.references.length >= 2) {
      setFormErrors(prev => ({
        ...prev,
        refLimit: 'Maximum 2 references allowed'
      }));
      return;
    }
    
    const newReference = {
      name: '',
      company: '',
      phone: '',
      email: ''
    };
    
    const updatedReferences = [...localWorkHistory.references, newReference];
    
    updateWorkHistory({
      ...localWorkHistory,
      references: updatedReferences
    });
    
    setLocalWorkHistory(prev => ({
      ...prev,
      references: updatedReferences
    }));
    
    // Auto-expand the new reference
    setTimeout(() => {
      setExpandedReference(localWorkHistory.references.length);
      document.getElementById(`wh-ref-card-${localWorkHistory.references.length}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 100);
  }, [updateWorkHistory, localWorkHistory]);

  const removeReference = useCallback((index) => {
    const updatedReferences = localWorkHistory.references.filter((_, i) => i !== index);
    
    updateWorkHistory({
      ...localWorkHistory,
      references: updatedReferences
    });
    
    setLocalWorkHistory(prev => ({
      ...prev,
      references: updatedReferences
    }));
    
    setExpandedReference(null);
    setFormErrors(prev => ({
      ...prev,
      refLimit: null
    }));
  }, [updateWorkHistory, localWorkHistory]);

  // UI toggle functions
  const toggleExpandJob = useCallback((index) => {
    setExpandedJob(expandedJob === index ? null : index);
  }, [expandedJob]);

  const toggleExpandReference = useCallback((index) => {
    setExpandedReference(expandedReference === index ? null : index);
  }, [expandedReference]);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!localWorkHistory.noWorkHistory && localWorkHistory.jobs.length === 0) {
      errors.jobs = 'Please add at least one job or select "No work history"';
    }
    
    // Validate each job
    localWorkHistory.jobs.forEach((job, index) => {
      if (!job.company) errors[`job${index}_company`] = 'Company name is required';
      if (!job.position) errors[`job${index}_position`] = 'Position is required';
      if (!job.startDate) errors[`job${index}_startDate`] = 'Start date is required';
      if (!job.currentlyWorking && !job.endDate) errors[`job${index}_endDate`] = 'End date is required';
    });
    
    // Validate references if they're present
    if (localWorkHistory.hasReferences === 'yes') {
      localWorkHistory.references.forEach((ref, index) => {
        if (!ref.name) errors[`ref${index}_name`] = 'Name is required';
        if (!ref.phone) errors[`ref${index}_phone`] = 'Phone is required';
        if (!ref.email) errors[`ref${index}_email`] = 'Email is required';
        if (ref.email && !/\S+@\S+\.\S+/.test(ref.email)) {
          errors[`ref${index}_email`] = 'Valid email is required';
        }
      });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [localWorkHistory]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      const firstErrorField = document.querySelector('.wh-error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      toast.error('Please fix all validation errors before submitting', {
        position: 'top-right'
      });
      return;
    }
  
    const formattedData = {
      jobs: localWorkHistory.jobs.map(job => ({
        title: job.position,
        company: job.company,
        startDate: job.startDate,
        endDate: job.endDate,
        current: job.currentlyWorking,
        description: job.description
      })),
      noWorkHistory: localWorkHistory.noWorkHistory,
      hasReferences: localWorkHistory.hasReferences,
      references: localWorkHistory.hasReferences === 'yes' ? localWorkHistory.references : []
    };
  
    saveWorkHistory(formattedData, {
      onSuccess: (data) => {
        if (data.success) {
          onComplete?.();
        } else {
          const errorMsg = data.message || "Please complete all required sections of your profile";
          toast.error(errorMsg, { 
            position: 'top-right',
            duration: 5000
          });
          onError?.(errorMsg);
        }
      },
      onError: (error) => {
        const errorMsg = error.message || "Failed to save work history. Please try again.";
        toast.error(errorMsg, { 
          position: 'top-right',
          duration: 5000
        });
        onError?.(errorMsg);
      }
    });
  }, [localWorkHistory, validateForm, saveWorkHistory, onComplete, onError]);
  return (
    <form onSubmit={handleSubmit} className="wh-form">
    <Toaster position='top-right'/>
      <div className="wh-section wh-header-section">
        <h2>Work History & References</h2>
        <p>Share your professional background and references to help employers get to know you better</p>
      </div>

      {/* Work History Section */}
      <div className="wh-section wh-work-history-section">
        <div className="wh-section-header">
          <h3>Work Experience</h3>
          <div className="wh-no-work-option">
            <label className="wh-checkbox-container">
              <input
                type="checkbox"
                checked={localWorkHistory.noWorkHistory}
                onChange={handleNoWorkHistoryChange}
                className="wh-checkbox"
              />
              <span className="wh-checkmark"></span>
              <span>I don't have any prior work history</span>
            </label>
          </div>
        </div>

        {formErrors.jobs && (
          <div className="wh-error-message">{formErrors.jobs}</div>
        )}

        {!localWorkHistory.noWorkHistory && (
          <>
            <div className="wh-job-list">
              {localWorkHistory.jobs.length === 0 ? (
                <div className="wh-empty-state">
                  <div className="wh-empty-icon">💼</div>
                  <p>You haven't added any work experience yet</p>
                  <button 
                    type="button" 
                    className="wh-btn wh-btn-secondary" 
                    onClick={addNewJob}
                  >
                    Add Your First Job
                  </button>
                </div>
              ) : (
                localWorkHistory.jobs.map((job, index) => (
                  <div 
                    key={index}
                    id={`wh-job-card-${index}`}
                    className={`wh-card wh-job-card ${expandedJob === index ? 'wh-expanded' : ''}`}
                  >
                    <div 
                      className="wh-card-header"
                      onClick={() => toggleExpandJob(index)}
                    >
                      <div className="wh-card-title">
                        <h4>{job.company || 'New Job'}</h4>
                        {job.position && <span>{job.position}</span>}
                      </div>
                      <div className="wh-card-dates">
                        {job.startDate && (
                          <span>
                            {new Date(job.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                            {job.currentlyWorking ? 
                              ' - Present' : 
                              job.endDate ? ` - ${new Date(job.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}` : ''
                            }
                          </span>
                        )}
                      </div>
                      <button type="button" className="wh-expand-toggle" aria-label="Toggle details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points={expandedJob === index ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                        </svg>
                      </button>
                    </div>

                    {expandedJob === index && (
                      <div className="wh-card-content">
                        <div className="wh-form-row">
                          <div className="wh-form-group">
                            <label htmlFor={`company-${index}`}>
                              Company Name <span className="wh-required">*</span>
                            </label>
                            <input
                              id={`company-${index}`}
                              type="text"
                              value={job.company}
                              onChange={(e) => handleUpdateJob(index, 'company', e.target.value)}
                              placeholder="Enter company name"
                              className={formErrors[`job${index}_company`] ? 'wh-error-field' : ''}
                              required
                            />
                            {formErrors[`job${index}_company`] && (
                              <div className="wh-field-error">{formErrors[`job${index}_company`]}</div>
                            )}
                          </div>

                          <div className="wh-form-group">
                            <label htmlFor={`position-${index}`}>
                              Position <span className="wh-required">*</span>
                            </label>
                            <input
                              id={`position-${index}`}
                              type="text"
                              value={job.position}
                              onChange={(e) => handleUpdateJob(index, 'position', e.target.value)}
                              placeholder="Your job title"
                              className={formErrors[`job${index}_position`] ? 'wh-error-field' : ''}
                              required
                            />
                            {formErrors[`job${index}_position`] && (
                              <div className="wh-field-error">{formErrors[`job${index}_position`]}</div>
                            )}
                          </div>
                        </div>

                        <div className="wh-form-row">
                          <div className="wh-form-group">
                            <label htmlFor={`startDate-${index}`}>
                              Start Date <span className="wh-required">*</span>
                            </label>
                            <input
                              id={`startDate-${index}`}
                              type="date"
                              value={job.startDate}
                              onChange={(e) => handleUpdateJob(index, 'startDate', e.target.value)}
                              className={formErrors[`job${index}_startDate`] ? 'wh-error-field' : ''}
                              required
                            />
                            {formErrors[`job${index}_startDate`] && (
                              <div className="wh-field-error">{formErrors[`job${index}_startDate`]}</div>
                            )}
                          </div>

                          <div className="wh-form-group">
                            <label htmlFor={`endDate-${index}`}>
                              End Date {!job.currentlyWorking && <span className="wh-required">*</span>}
                            </label>
                            <input
                              id={`endDate-${index}`}
                              type="date"
                              value={job.endDate}
                              onChange={(e) => handleUpdateJob(index, 'endDate', e.target.value)}
                              disabled={job.currentlyWorking}
                              className={formErrors[`job${index}_endDate`] ? 'wh-error-field' : ''}
                              required={!job.currentlyWorking}
                            />
                            {formErrors[`job${index}_endDate`] && (
                              <div className="wh-field-error">{formErrors[`job${index}_endDate`]}</div>
                            )}
                            
                            <label className="wh-checkbox-container wh-current-job">
                              <input
                                type="checkbox"
                                checked={job.currentlyWorking}
                                onChange={(e) => handleUpdateJob(index, 'currentlyWorking', e.target.checked)}
                                className="wh-checkbox"
                              />
                              <span className="wh-checkmark"></span>
                              <span>I currently work here</span>
                            </label>
                          </div>
                        </div>

                        <div className="wh-form-group">
                          <label htmlFor={`description-${index}`}>Job Description</label>
                          <textarea
                            id={`description-${index}`}
                            value={job.description || ''}
                            onChange={(e) => handleUpdateJob(index, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements at this job"
                            rows={4}
                          />
                        </div>

                        <div className="wh-card-actions">
                          <button
                            type="button"
                            className="wh-btn wh-btn-danger"
                            onClick={() => handleRemoveJob(index)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Remove Job
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {localWorkHistory.jobs.length > 0 && (
              <button
                type="button"
                className="wh-btn wh-btn-secondary wh-add-btn"
                onClick={addNewJob}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Add Another Job
              </button>
            )}
          </>
        )}
      </div>

      {/* References Section */}
      <div className="wh-section wh-references-section">
        <div className="wh-section-header">
          <h3>Professional References</h3>
          <p>Add 1-2 people who can vouch for your skills and work ethic</p>
        </div>

        <div className="wh-form-group wh-radio-group-container">
          <label>Do you have professional references?</label>
          <div className="wh-radio-group">
            <label className="wh-radio-container">
              <input
                type="radio"
                name="hasReferences"
                value="yes"
                checked={localWorkHistory.hasReferences === 'yes'}
                onChange={() => handleHasReferencesChange('yes')}
              />
              <span className="wh-radio-mark"></span>
              <span>Yes</span>
            </label>
            <label className="wh-radio-container">
              <input
                type="radio"
                name="hasReferences"
                value="no"
                checked={localWorkHistory.hasReferences === 'no'}
                onChange={() => handleHasReferencesChange('no')}
              />
              <span className="wh-radio-mark"></span>
              <span>No</span>
            </label>
          </div>
        </div>

        {localWorkHistory.hasReferences === 'yes' && (
          <div className="wh-references-list">
            {formErrors.refLimit && (
              <div className="wh-error-message">{formErrors.refLimit}</div>
            )}
            
            {localWorkHistory.references.length === 0 ? (
              <div className="wh-empty-state">
                <div className="wh-empty-icon">👤</div>
                <p>You haven't added any references yet</p>
                <button 
                  type="button" 
                  className="wh-btn wh-btn-secondary" 
                  onClick={addReference}
                >
                  Add Your First Reference
                </button>
              </div>
            ) : (
              <>                
                {localWorkHistory.references.map((ref, index) => (
                  <div 
                    key={index}
                    id={`wh-ref-card-${index}`}
                    className={`wh-card wh-reference-card ${expandedReference === index ? 'wh-expanded' : ''}`}
                  >
                    <div 
                      className="wh-card-header"
                      onClick={() => toggleExpandReference(index)}
                    >
                      <div className="wh-card-title">
                        <h4>{ref.name || `Reference ${index + 1}`}</h4>
                        {ref.company && <span>{ref.company}</span>}
                      </div>
                      <button type="button" className="wh-expand-toggle" aria-label="Toggle details">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points={expandedReference === index ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
                        </svg>
                      </button>
                    </div>

                    {expandedReference === index && (
                      <div className="wh-card-content">
                        <div className="wh-form-row">
                          <div className="wh-form-group">
                            <label htmlFor={`ref-name-${index}`}>
                              Full Name <span className="wh-required">*</span>
                            </label>
                            <input
                              id={`ref-name-${index}`}
                              type="text"
                              value={ref.name}
                              onChange={(e) => handleUpdateReference(index, 'name', e.target.value)}
                              placeholder="Enter reference's name"
                              className={formErrors[`ref${index}_name`] ? 'wh-error-field' : ''}
                              required
                            />
                            {formErrors[`ref${index}_name`] && (
                              <div className="wh-field-error">{formErrors[`ref${index}_name`]}</div>
                            )}
                          </div>

                          <div className="wh-form-group">
                            <label htmlFor={`ref-company-${index}`}>Company</label>
                            <input
                              id={`ref-company-${index}`}
                              type="text"
                              value={ref.company || ''}
                              onChange={(e) => handleUpdateReference(index, 'company', e.target.value)}
                              placeholder="Enter company name"
                            />
                          </div>
                        </div>

                        <div className="wh-form-row">
                          <div className="wh-form-group">
                            <label htmlFor={`ref-phone-${index}`}>
                              Phone Number <span className="wh-required">*</span>
                            </label>
                            <input
                              id={`ref-phone-${index}`}
                              type="tel"
                              value={ref.phone || ''}
                              onChange={(e) => handleUpdateReference(index, 'phone', e.target.value)}
                              placeholder="Enter phone number"
                              className={formErrors[`ref${index}_phone`] ? 'wh-error-field' : ''}
                              required
                            />
                            {formErrors[`ref${index}_phone`] && (
                              <div className="wh-field-error">{formErrors[`ref${index}_phone`]}</div>
                            )}
                          </div>

                          <div className="wh-form-group">
                            <label htmlFor={`ref-email-${index}`}>
                              Email <span className="wh-required">*</span>
                            </label>
                            <input
                              id={`ref-email-${index}`}
                              type="email"
                              value={ref.email || ''}
                              onChange={(e) => handleUpdateReference(index, 'email', e.target.value)}
                              placeholder="Enter email address"
                              className={formErrors[`ref${index}_email`] ? 'wh-error-field' : ''}
                              required
                            />
                            {formErrors[`ref${index}_email`] && (
                              <div className="wh-field-error">{formErrors[`ref${index}_email`]}</div>
                            )}
                          </div>
                        </div>

                        <div className="wh-card-actions">
                          <button
                            type="button"
                            className="wh-btn wh-btn-danger"
                            onClick={() => removeReference(index)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Remove Reference
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {localWorkHistory.references.length < 2 && (
                  <button
                    type="button"
                    className="wh-btn wh-btn-secondary wh-add-btn"
                    onClick={addReference}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Add Another Reference
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Form Controls */}
      <div className="wh-form-actions">
        <button 
          type="button" 
          className="wh-btn wh-btn-outline" 
          onClick={prevStep}
          disabled={isPending}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        
        <button 
          type="submit" 
          className="wh-btn wh-btn-primary"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <span className="wh-spinner"></span>
              <span>Saving...</span>
            </>
          ) : (
            <>
              Complete Profile
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default React.memo(WorkHistoryForm);