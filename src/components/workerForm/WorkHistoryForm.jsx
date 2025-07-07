import React, { useState, useEffect, useCallback } from 'react';
import { useWorkHistoryMutation } from '../../stores/useOnboardingStore';
import useOnboardingStore from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';
import './css/WorkHistoryForm.css';
import { Toaster, toast } from 'react-hot-toast';
const WorkHistoryForm = ({ onNextStep }) => {
  // Access store state with selectors for targeted re-renders
  const workHistory = useOnboardingStore((state) => state.workHistory, shallow);
  const prevStep = useOnboardingStore((state) => state.prevStep);
  const updateCV = useOnboardingStore((state) => state.updateCV);
  const CV = useOnboardingStore((state) => state.workHistory?.CV, shallow);

  const updateWorkHistory = useOnboardingStore(
    (state) => state.updateWorkHistory
  );
  const addJob = useOnboardingStore((state) => state.addJob);
  const removeJob = useOnboardingStore((state) => state.removeJob);

  // Setup mutation for API interaction
  const { mutate: saveWorkHistory, isPending } = useWorkHistoryMutation();

  // Local state for form management
  const [localWorkHistory, setLocalWorkHistory] = useState({
    jobs: [],
    noWorkHistory: false,
    references: [],
    CV: '',
  });
  const [expandedJob, setExpandedJob] = useState(null);
  const [expandedReference, setExpandedReference] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Initialize local state from store
  useEffect(() => {
    if (workHistory) {
      setLocalWorkHistory({
        jobs: workHistory.jobs || [],
        noWorkHistory: workHistory.noWorkHistory || false,
        references: workHistory.references || [],
        CV: CV || workHistory.CV || null,
      });
    }
  }, [workHistory, CV]);

  // Job management functions
  const addNewJob = useCallback(() => {
    const newJob = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      description: '',
    };

    addJob(newJob);
    setLocalWorkHistory((prev) => ({
      ...prev,
      jobs: [...prev.jobs, newJob],
    }));

    // Auto-expand the new job
    setTimeout(() => {
      setExpandedJob(localWorkHistory.jobs.length);
      document
        .getElementById(`wh-job-card-${localWorkHistory.jobs.length}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 100);
  }, [addJob, localWorkHistory.jobs.length]);

  const handleRemoveJob = useCallback(
    (index) => {
      removeJob(index);
      setLocalWorkHistory((prev) => ({
        ...prev,
        jobs: prev.jobs.filter((_, i) => i !== index),
      }));
      setExpandedJob(null);
      setFormErrors({});
    },
    [removeJob]
  );

  const handleUpdateJob = useCallback(
    (index, field, value) => {
      const updatedJobs = [...localWorkHistory.jobs];
      updatedJobs[index] = { ...updatedJobs[index], [field]: value };

      updateWorkHistory({
        ...localWorkHistory,
        jobs: updatedJobs,
      });

      setLocalWorkHistory((prev) => ({
        ...prev,
        jobs: updatedJobs,
      }));

      // Clear any error for this field
      if (formErrors[`job${index}_${field}`]) {
        setFormErrors((prev) => ({
          ...prev,
          [`job${index}_${field}`]: null,
        }));
      }
    },
    [updateWorkHistory, localWorkHistory, formErrors]
  );

  // Work history checkbox handler
  const handleNoWorkHistoryChange = useCallback(
    (e) => {
      const value = e.target.checked;

      updateWorkHistory({
        ...localWorkHistory,
        noWorkHistory: value,
      });

      setLocalWorkHistory((prev) => ({
        ...prev,
        noWorkHistory: value,
      }));
    },
    [updateWorkHistory, localWorkHistory]
  );

  // References management
  // const handleHasReferencesChange = useCallback(
  //   (value) => {
  //     // Create a copy of the current state to modify
  //     const updatedWorkHistory = { ...localWorkHistory };
  //     updatedWorkHistory.hasReferences = value;

  //     // If toggling to "yes" and no references exist, create an empty one
  //     if (
  //       value === 'yes' &&
  //       (!updatedWorkHistory.references ||
  //         updatedWorkHistory.references.length === 0)
  //     ) {
  //       updatedWorkHistory.references = [
  //         {
  //           name: '',
  //           company: '',
  //           phone: '',
  //           email: '',
  //         },
  //       ];
  //     }

  //     // If toggling to "no", clear any references but keep the array
  //     if (value === 'no') {
  //       updatedWorkHistory.references = [];
  //     }

  //     // Update both the global store and local state
  //     updateWorkHistory(updatedWorkHistory);
  //     setLocalWorkHistory(updatedWorkHistory);

  //     // Auto-expand the first reference when adding and choosing "yes"
  //     if (value === 'yes' && updatedWorkHistory.references.length > 0) {
  //       setTimeout(() => {
  //         setExpandedReference(0);
  //       }, 100);
  //     } else {
  //       // Clear expanded reference when choosing "no"
  //       setExpandedReference(null);
  //     }
  //   },
  //   [updateWorkHistory, localWorkHistory]
  // );

  const handleUpdateReference = useCallback(
    (index, field, value) => {
      const updatedReferences = [...localWorkHistory.references];
      updatedReferences[index] = {
        ...updatedReferences[index],
        [field]: value,
      };

      updateWorkHistory({
        ...localWorkHistory,
        references: updatedReferences,
      });

      setLocalWorkHistory((prev) => ({
        ...prev,
        references: updatedReferences,
      }));

      // Clear any error for this field
      if (formErrors[`ref${index}_${field}`]) {
        setFormErrors((prev) => ({
          ...prev,
          [`ref${index}_${field}`]: null,
        }));
      }
    },
    [updateWorkHistory, localWorkHistory, formErrors]
  );

  const addReference = useCallback(() => {
    if (localWorkHistory.references.length >= 2) {
      setFormErrors((prev) => ({
        ...prev,
        refLimit: 'Maximum 2 references allowed',
      }));
      toast.error('Maximum 2 references allowed', {
        position: 'top-right',
      });
      return;
    }

    const newReference = {
      name: '',
      position: '',
      company: '',
      phone: '',
      email: '',
    };

    const updatedReferences = [...localWorkHistory.references, newReference];
    const updatedWorkHistory = {
      ...localWorkHistory,
      references: updatedReferences,
      hasReferences: 'yes', // Automatically set to yes when adding reference
    };

    updateWorkHistory(updatedWorkHistory);
    setLocalWorkHistory(updatedWorkHistory);

    // Clear any existing reference limit error
    setFormErrors((prev) => ({
      ...prev,
      refLimit: null,
    }));

    // Auto-expand the new reference
    setTimeout(() => {
      setExpandedReference(localWorkHistory.references.length);
      document
        .getElementById(`wh-ref-card-${localWorkHistory.references.length}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    }, 100);
  }, [updateWorkHistory, localWorkHistory]);

  const removeReference = useCallback(
    (index) => {
      const updatedReferences = localWorkHistory.references.filter(
        (_, i) => i !== index
      );

      const updatedWorkHistory = {
        ...localWorkHistory,
        references: updatedReferences,
        // If no references left, set hasReferences to 'no'
        hasReferences:
          updatedReferences.length === 0
            ? 'no'
            : localWorkHistory.hasReferences,
      };

      updateWorkHistory(updatedWorkHistory);
      setLocalWorkHistory(updatedWorkHistory);

      setExpandedReference(null);
      setFormErrors((prev) => ({
        ...prev,
        refLimit: null,
      }));

      toast.success('Reference removed successfully', {
        position: 'top-right',
      });
    },
    [updateWorkHistory, localWorkHistory]
  );

  const updateReference = useCallback(
    (index, field, value) => {
      const updatedReferences = [...localWorkHistory.references];
      updatedReferences[index] = {
        ...updatedReferences[index],
        [field]: value,
      };

      const updatedWorkHistory = {
        ...localWorkHistory,
        references: updatedReferences,
      };

      updateWorkHistory(updatedWorkHistory);
      setLocalWorkHistory(updatedWorkHistory);
    },
    [updateWorkHistory, localWorkHistory]
  );

  // UI toggle functions
  const toggleExpandJob = useCallback(
    (index) => {
      setExpandedJob(expandedJob === index ? null : index);
    },
    [expandedJob]
  );

  const toggleExpandReference = useCallback(
    (index) => {
      setExpandedReference(expandedReference === index ? null : index);
    },
    [expandedReference]
  );

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;
    let firstReferenceErrorIndex = null;

    // Validate work history
    if (!localWorkHistory.noWorkHistory) {
      if (!localWorkHistory.jobs || localWorkHistory.jobs.length === 0) {
        errors.jobs =
          'At least one job is required unless "No Work History" is selected';
        isValid = false;
      } else {
        localWorkHistory.jobs.forEach((job, index) => {
          if (!job.title || !job.title.trim()) {
            errors[`job${index}_title`] = 'Job title is required';
            isValid = false;
          }

          if (!job.company || !job.company.trim()) {
            errors[`job${index}_company`] = 'Company name is required';
            isValid = false;
          }

          if (!job.startDate) {
            errors[`job${index}_startDate`] = 'Start date is required';
            isValid = false;
          }

          const isCurrentJob = job.currentlyWorking || job.current || false;

          if (!isCurrentJob && !job.endDate) {
            errors[`job${index}_endDate`] =
              'End date is required for past jobs';
            isValid = false;
          }

          if (job.startDate && job.endDate) {
            const startDate = new Date(job.startDate);
            const endDate = new Date(job.endDate);

            if (endDate < startDate) {
              errors[`job${index}_endDate`] =
                'End date must be after start date';
              isValid = false;
            }
          }
        });
      }
    }

    // Validate CV field - check both local and global state
    const hasCV = localWorkHistory.CV || CV;
    if (!hasCV) {
      errors.CV = 'CV is required';
      isValid = false;
    }

    // Validate references - now mandatory
    if (!localWorkHistory.references || localWorkHistory.references.length !== 2) {
      errors.references = 'Exactly two references are required';
      isValid = false;
    } else {
      // Validate each reference
      localWorkHistory.references.forEach((ref, index) => {
        if (!ref.name || !ref.name.trim()) {
          errors[`ref${index}_name`] = 'Reference name is required';
          isValid = false;
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        }

        if (!ref.position || !ref.position.trim()) {
          errors[`ref${index}_position`] = 'Reference position is required';
          isValid = false;
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        }

        if (!ref.phone || !ref.phone.trim()) {
          errors[`ref${index}_phone`] = 'Reference phone is required';
          isValid = false;
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        }

        if (!ref.email || !ref.email.trim()) {
          errors[`ref${index}_email`] = 'Reference email is required';
          isValid = false;
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        } else if (!/\S+@\S+\.\S+/.test(ref.email.trim())) {
          errors[`ref${index}_email`] = 'Please provide a valid email address';
          isValid = false;
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        }
      });
    }

    setFormErrors(errors);
    // Expand the first reference card with an error
    if (firstReferenceErrorIndex !== null) {
      setExpandedReference(firstReferenceErrorIndex);
    }

    // Auto-scroll to the first error field
    if (!isValid) {
      setTimeout(() => {
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey) {
          // Try to find the field by name
          let errorField = document.querySelector(`[name="${firstErrorKey}"]`);
          // Fallback: try by id
          if (!errorField) {
            errorField = document.getElementById(firstErrorKey);
          }
          if (errorField) {
            errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorField.focus();
          }
        }
      }, 100);
    }

    return isValid;
  }, [localWorkHistory, CV]);
  //  for the CV upload
  const handleCVUpload = async (file) => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'Certificate(Saas)');
      formData.append('folder', 'SAAS(Support Worker)');

      const cloudName = 'dgsphdhns';
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        // Update both local and global state
        updateCV(data.secure_url);
        setLocalWorkHistory((prev) => ({ ...prev, CV: data.secure_url }));
        toast.success('CV uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('CV upload error:', error);
      toast.error('Failed to upload CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error('Please fix all validation errors before submitting', {
          position: 'top-right',
        });
        return;
      }

      const formattedData = {
        jobs: localWorkHistory.jobs.map((job) => ({
          title: job.title,
          company: job.company,
          startDate: job.startDate,
          endDate: job.endDate,
          current: job.currentlyWorking || job.current || false,
          description: job.description || '',
        })),
        noWorkHistory: localWorkHistory.noWorkHistory,
        references: localWorkHistory.references.map((ref) => ({
          name: ref.name.trim(),
          position: ref.position.trim(),
          company: ref.company ? ref.company.trim() : '',
          phone: ref.phone ? ref.phone.trim() : '',
          email: ref.email ? ref.email.trim().toLowerCase() : '',
        })),
        CV: localWorkHistory.CV || CV,
      };

      console.log('Submitting work history data:', formattedData);

      updateWorkHistory(formattedData);

      saveWorkHistory(formattedData, {
        onSuccess: (data) => {
          if (data.success) {
            toast.success('Work history saved successfully!', {
              position: 'top-right',
            });
            onNextStep?.(); // Move to next step only
          } else {
            const errorMsg =
              data.message ||
              'Please complete all required sections of your profile';
            toast.error(errorMsg, {
              position: 'top-right',
              duration: 5000,
            });
          }
        },
        onError: (error) => {
          const errorMsg =
            error.message || 'Failed to save work history. Please try again.';
          toast.error(errorMsg, {
            position: 'top-right',
            duration: 5000,
          });
        },
      });
    },
    [localWorkHistory, validateForm, saveWorkHistory, updateWorkHistory, onNextStep, CV]
  );

  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    if (
      typeof dateValue === 'string' &&
      dateValue.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return dateValue;
    }
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  console.log('ONBORDING DTA', workHistory);

  return (
    <form onSubmit={handleSubmit} className="wh-form" noValidate>
      <Toaster position="top-right" />
      {/* Summary error at the top */}
      {Object.keys(formErrors).length > 0 && (
        <div className="wh-error-message" style={{ marginBottom: '1rem' }}>
          Please fix the errors highlighted below.
        </div>
      )}
      <div className="wh-section wh-header-section">
        <h2>Work History & References</h2>
        <p>
          Share your professional background and references to help employers
          get to know you better
        </p>
      </div>

      {/* For the CV */}
      <div className="wh-section wh-cv-section">
        <div className="wh-section-header">
          <h3>Upload Your CV *</h3>
          <p>Upload your resume or CV in PDF or image format</p>
        </div>

        <div className="wh-cv-upload-container">
          {localWorkHistory.CV || CV ? (
            <div className="wh-cv-preview">
              <div className="wh-cv-preview-content">
                {(localWorkHistory.CV || CV).endsWith('.pdf') ? (
                  <div className="wh-cv-pdf-preview">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <path d="M10 9H8v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"></path>
                      <line x1="16" y1="13" x2="16" y2="15"></line>
                    </svg>
                    <span>PDF Document</span>
                  </div>
                ) : (
                  <img
                    src={localWorkHistory.CV || CV}
                    alt="CV Preview"
                    className="wh-cv-image-preview"
                  />
                )}
                <a
                  href={localWorkHistory.CV || CV}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wh-cv-download"
                >
                  View/Download
                </a>
              </div>
              <button
                type="button"
                className="wh-btn wh-btn-danger wh-cv-remove"
                onClick={() => {
                  updateCV(null);
                  setLocalWorkHistory((prev) => ({ ...prev, CV: null }));
                }}
                disabled={isUploading}
              >
                Remove CV
              </button>
            </div>
          ) : (
            <div className="wh-cv-upload-area">
              <input
                type="file"
                id="cv-upload"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleCVUpload(e.target.files[0]);
                  }
                }}
                disabled={isUploading}
                style={{ display: 'none' }}
              />
              <label htmlFor="cv-upload" className="wh-cv-upload-label">
                {isUploading ? (
                  <>
                    <span className="wh-spinner"></span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Click to upload or drag and drop</span>
                    <span className="wh-cv-upload-hint">
                      PDF, JPG, or PNG (Max 5MB)
                    </span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>
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
              <span>I don't have any prior work experience</span>
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
                    Add Your Work Experience
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
                        <h4>{job.company || 'Company Name'}</h4>
                        {job.title && <span>{job.title}</span>}
                      </div>
                      <div className="wh-card-dates">
                        {job.startDate && (
                          <span>
                            {new Date(job.startDate).toLocaleDateString(
                              undefined,
                              { year: 'numeric', month: 'short' }
                            )}
                            {job.currentlyWorking
                              ? ' - Present'
                              : job.endDate
                                ? ` - ${new Date(job.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}`
                                : ''}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="wh-expand-toggle"
                        aria-label="Toggle details"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline
                            points={
                              expandedJob === index
                                ? '18 15 12 9 6 15'
                                : '6 9 12 15 18 9'
                            }
                          ></polyline>
                        </svg>
                      </button>
                    </div>

                    {expandedJob === index && (
                      <div className="wh-card-content">
                        <div className="wh-form-row">
                          <div className="wh-form-group">
                            <label htmlFor={`company-${index}`}>
                              Company Name{' '}
                              <span className="wh-required">*</span>
                            </label>
                            <input
                              id={`company-${index}`}
                              name={`job${index}_company`}
                              type="text"
                              value={job.company}
                              onChange={(e) =>
                                handleUpdateJob(
                                  index,
                                  'company',
                                  e.target.value
                                )
                              }
                              placeholder="Enter company name"
                              className={
                                formErrors[`job${index}_company`]
                                  ? 'wh-error-field'
                                  : ''
                              }
                              required
                              aria-invalid={!!formErrors[`job${index}_company`]}
                              aria-describedby={formErrors[`job${index}_company`] ? `error-job${index}_company` : undefined}
                            />
                            {formErrors[`job${index}_company`] && (
                              <div
                                className="wh-field-error"
                                id={`error-job${index}_company`}
                                role="alert"
                              >
                                {formErrors[`job${index}_company`]}
                              </div>
                            )}
                          </div>

                          <div className="wh-form-group">
                            <label htmlFor={`title-${index}`}>
                              Title<span className="wh-required">*</span>
                            </label>
                            <input
                              id={`title-${index}`}
                              name={`job${index}_title`}
                              type="text"
                              value={job.title}
                              onChange={(e) =>
                                handleUpdateJob(index, 'title', e.target.value)
                              }
                              placeholder="Your job title"
                              className={
                                formErrors[`job${index}_title`]
                                  ? 'wh-error-field'
                                  : ''
                              }
                              required
                              aria-invalid={!!formErrors[`job${index}_title`]}
                              aria-describedby={formErrors[`job${index}_title`] ? `error-job${index}_title` : undefined}
                            />
                            {formErrors[`job${index}_title`] && (
                              <div
                                className="wh-field-error"
                                id={`error-job${index}_title`}
                                role="alert"
                              >
                                {formErrors[`job${index}_title`]}
                              </div>
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
                              name={`job${index}_startDate`}
                              type="date"
                              value={formatDateForInput(job.startDate)}
                              onChange={(e) =>
                                handleUpdateJob(
                                  index,
                                  'startDate',
                                  e.target.value
                                )
                              }
                              className={
                                formErrors[`job${index}_startDate`]
                                  ? 'wh-error-field'
                                  : ''
                              }
                              required
                              aria-invalid={!!formErrors[`job${index}_startDate`]}
                              aria-describedby={formErrors[`job${index}_startDate`] ? `error-job${index}_startDate` : undefined}
                            />
                            {formErrors[`job${index}_startDate`] && (
                              <div
                                className="wh-field-error"
                                id={`error-job${index}_startDate`}
                                role="alert"
                              >
                                {formErrors[`job${index}_startDate`]}
                              </div>
                            )}
                          </div>
                          <div className="wh-form-group">
                            <label htmlFor={`endDate-${index}`}>
                              End Date{' '}
                              {!job.currentlyWorking && (
                                <span className="wh-required">*</span>
                              )}
                            </label>
                            <input
                              id={`endDate-${index}`}
                              name={`job${index}_endDate`}
                              type="date"
                              value={formatDateForInput(job.endDate)}
                              onChange={(e) =>
                                handleUpdateJob(
                                  index,
                                  'endDate',
                                  e.target.value
                                )
                              }
                              disabled={job.currentlyWorking}
                              className={
                                formErrors[`job${index}_endDate`]
                                  ? 'wh-error-field'
                                  : ''
                              }
                              required={!job.currentlyWorking}
                              aria-invalid={!!formErrors[`job${index}_endDate`]}
                              aria-describedby={formErrors[`job${index}_endDate`] ? `error-job${index}_endDate` : undefined}
                            />
                            {formErrors[`job${index}_endDate`] && (
                              <div
                                className="wh-field-error"
                                id={`error-job${index}_endDate`}
                                role="alert"
                              >
                                {formErrors[`job${index}_endDate`]}
                              </div>
                            )}

                            <label className="wh-checkbox-container wh-current-job">
                              <input
                                type="checkbox"
                                checked={job.currentlyWorking}
                                onChange={(e) =>
                                  handleUpdateJob(
                                    index,
                                    'currentlyWorking',
                                    e.target.checked
                                  )
                                }
                                className="wh-checkbox"
                              />
                              <span className="wh-checkmark"></span>
                              <span>I currently work here</span>
                            </label>
                          </div>
                        </div>

                        <div className="wh-form-group">
                          <label htmlFor={`description-${index}`}>
                            Job Description
                          </label>
                          <textarea
                            id={`description-${index}`}
                            value={job.description || ''}
                            onChange={(e) =>
                              handleUpdateJob(
                                index,
                                'description',
                                e.target.value
                              )
                            }
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
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
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
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
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
          <p>Add two professional references who can vouch for your skills and work ethic</p>
        </div>

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
                    <button
                      type="button"
                      className="wh-expand-toggle"
                      aria-label="Toggle details"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline
                          points={
                            expandedReference === index
                              ? '18 15 12 9 6 15'
                              : '6 9 12 15 18 9'
                          }
                        ></polyline>
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
                            name={`ref${index}_name`}
                            type="text"
                            value={ref.name}
                            onChange={(e) =>
                              handleUpdateReference(
                                index,
                                'name',
                                e.target.value
                              )
                            }
                            placeholder="Enter reference's name"
                            className={
                              formErrors[`ref${index}_name`]
                                ? 'wh-error-field'
                                : ''
                            }
                            required
                            aria-invalid={!!formErrors[`ref${index}_name`]}
                            aria-describedby={formErrors[`ref${index}_name`] ? `error-ref${index}_name` : undefined}
                          />
                          {formErrors[`ref${index}_name`] && (
                            <div
                              className="wh-field-error"
                              id={`error-ref${index}_name`}
                              role="alert"
                            >
                              {formErrors[`ref${index}_name`]}
                            </div>
                          )}
                        </div>
                        <div className="wh-form-group">
                          <label htmlFor={`ref-position-${index}`}>
                            Position <span className="wh-required">*</span>
                          </label>
                          <input
                            id={`ref-position-${index}`}
                            name={`ref${index}_position`}
                            type="text"
                            value={ref.position || ''}
                            onChange={(e) =>
                              handleUpdateReference(
                                index,
                                'position',
                                e.target.value
                              )
                            }
                            placeholder="Reference's position"
                            className={
                              formErrors[`ref${index}_position`]
                                ? 'wh-error-field'
                                : ''
                            }
                            required
                            aria-invalid={!!formErrors[`ref${index}_position`]}
                            aria-describedby={formErrors[`ref${index}_position`] ? `error-ref${index}_position` : undefined}
                          />
                          {formErrors[`ref${index}_position`] && (
                            <div
                              className="wh-field-error"
                              id={`error-ref${index}_position`}
                              role="alert"
                            >
                              {formErrors[`ref${index}_position`]}
                            </div>
                          )}
                        </div>

                        <div className="wh-form-group">
                          <label htmlFor={`ref-company-${index}`}>
                            Company
                          </label>
                          <input
                            id={`ref-company-${index}`}
                            name={`ref${index}_company`}
                            type="text"
                            value={ref.company || ''}
                            onChange={(e) =>
                              handleUpdateReference(
                                index,
                                'company',
                                e.target.value
                              )
                            }
                            placeholder="Enter company name"
                          />
                        </div>
                      </div>

                      <div className="wh-form-row">
                        <div className="wh-form-group">
                          <label htmlFor={`ref-phone-${index}`}>
                            Phone Number{' '}
                            <span className="wh-required">*</span>
                          </label>
                          <input
                            id={`ref-phone-${index}`}
                            name={`ref${index}_phone`}
                            type="tel"
                            value={ref.phone || ''}
                            onChange={(e) =>
                              handleUpdateReference(
                                index,
                                'phone',
                                e.target.value
                              )
                            }
                            placeholder="Enter phone number"
                            className={
                              formErrors[`ref${index}_phone`]
                                ? 'wh-error-field'
                                : ''
                            }
                            required
                            aria-invalid={!!formErrors[`ref${index}_phone`]}
                            aria-describedby={formErrors[`ref${index}_phone`] ? `error-ref${index}_phone` : undefined}
                          />
                          {formErrors[`ref${index}_phone`] && (
                            <div
                              className="wh-field-error"
                              id={`error-ref${index}_phone`}
                              role="alert"
                            >
                              {formErrors[`ref${index}_phone`]}
                            </div>
                          )}
                        </div>

                        <div className="wh-form-group">
                          <label htmlFor={`ref-email-${index}`}>
                            Email <span className="wh-required">*</span>
                          </label>
                          <input
                            id={`ref-email-${index}`}
                            name={`ref${index}_email`}
                            type="email"
                            value={ref.email || ''}
                            onChange={(e) =>
                              handleUpdateReference(
                                index,
                                'email',
                                e.target.value
                              )
                            }
                            placeholder="Enter email address"
                            className={
                              formErrors[`ref${index}_email`]
                                ? 'wh-error-field'
                                : ''
                            }
                            required
                            aria-invalid={!!formErrors[`ref${index}_email`]}
                            aria-describedby={formErrors[`ref${index}_email`] ? `error-ref${index}_email` : undefined}
                          />
                          {formErrors[`ref${index}_email`] && (
                            <div
                              className="wh-field-error"
                              id={`error-ref${index}_email`}
                              role="alert"
                            >
                              {formErrors[`ref${index}_email`]}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="wh-card-actions">
                        <button
                          type="button"
                          className="wh-btn wh-btn-danger"
                          onClick={() => removeReference(index)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
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
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
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
      </div>

      {/* Form Controls */}
      <div className="wh-form-actions">
        <button
          type="button"
          className="wh-btn wh-btn-outline"
          onClick={prevStep}
          disabled={isPending}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
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
              Next: Availability
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
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
