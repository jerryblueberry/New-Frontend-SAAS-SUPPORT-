import React, { useState, useEffect, useCallback } from 'react';
import { useWorkHistoryMutation } from '../../stores/useOnboardingStore';
import useOnboardingStore from '../../stores/useOnboardingStore';
import { shallow } from 'zustand/shallow';
import './css/WorkHistoryForm.css';
import { Toaster, toast } from 'react-hot-toast';
import { deleteCloudinaryImage } from '../../api/cloudinary';
import DocumentPreview from './Modals/DocumentPreview';
import OnboardingCV from '../WorkerCv/OnboardingCV/onboardingCV';
import OnboardingJobExperience from '../WorkerJobExperience/OnboardingJobExperience/OnboardingJobExperience';
import WorkerOnboardingReferences from '../WorkerReferences/workerOnboardingReferences/workerOnboardingReferences';
import { Grid, useMediaQuery, useTheme, Paper, Typography, Box, Chip } from '@mui/material';
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
  const [showCVPreview, setShowCVPreview] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize local state from store
  useEffect(() => {
    if (workHistory) {
      setLocalWorkHistory({
        jobs: (workHistory.jobs || []).map(job => ({
          ...job,
          startDate: job.startDate ? new Date(job.startDate) : null,
          endDate: job.endDate ? new Date(job.endDate) : null,
          currentlyWorking: job.currentlyWorking ?? job.current ?? false,
        })),
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

      // Check if all references are now complete and show success toast
      const allComplete = updatedReferences.every(ref => 
        ref.name && ref.position && ref.phone && ref.email
      );
      
      if (allComplete && updatedReferences.length === 2) {
        toast.success('All references completed! You can now proceed to the next step.', {
          position: 'top-right',
          duration: 3000,
          style: {
            background: '#4caf50',
            color: '#fff',
            fontWeight: '600',
          },
        });
      }
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
    let missingFields = [];

    // Validate work history
    if (!localWorkHistory.jobs || localWorkHistory.jobs.length === 0) {
      errors.jobs = 'At least one job is required';
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

    // Validate CV field - check both local and global state
    const hasCV = localWorkHistory.CV || CV;
    if (!hasCV) {
      errors.CV = 'CV is required';
      isValid = false;
    }

    // Enhanced references validation - now mandatory with detailed feedback
    if (!localWorkHistory.references || localWorkHistory.references.length !== 2) {
      errors.references = 'Exactly two references are required';
      isValid = false;
      toast.error('Please add exactly 2 professional references to continue', {
        position: 'top-right',
        duration: 4000,
      });
    } else {
      // Validate each reference with detailed field checking
      localWorkHistory.references.forEach((ref, index) => {
        const refNumber = index + 1;
        
        if (!ref.name || !ref.name.trim()) {
          errors[`ref${index}_name`] = 'Reference name is required';
          isValid = false;
          missingFields.push(`Reference ${refNumber} - Name`);
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        }

        if (!ref.position || !ref.position.trim()) {
          errors[`ref${index}_position`] = 'Reference position is required';
          isValid = false;
          missingFields.push(`Reference ${refNumber} - Position`);
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        }

        if (!ref.phone || !ref.phone.trim()) {
          errors[`ref${index}_phone`] = 'Reference phone is required';
          isValid = false;
          missingFields.push(`Reference ${refNumber} - Phone`);
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        } else if (!isValidAustralianPhone(ref.phone)) {
          errors[`ref${index}_phone`] = 'Enter a valid Australian phone (e.g. 412 345 678)';
          isValid = false;
          missingFields.push(`Reference ${refNumber} - Phone (invalid format)`);
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        }

        if (!ref.email || !ref.email.trim()) {
          errors[`ref${index}_email`] = 'Reference email is required';
          isValid = false;
          missingFields.push(`Reference ${refNumber} - Email`);
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        } else if (!/\S+@\S+\.\S+/.test(ref.email.trim())) {
          errors[`ref${index}_email`] = 'Please provide a valid email address';
          isValid = false;
          missingFields.push(`Reference ${refNumber} - Email (invalid format)`);
          if (firstReferenceErrorIndex === null) firstReferenceErrorIndex = index;
        }
      });
    }

    setFormErrors(errors);
    
    // Expand the first reference card with an error
    if (firstReferenceErrorIndex !== null) {
      setExpandedReference(firstReferenceErrorIndex);
    }

    // Show detailed toast notification for missing reference fields
    if (!isValid && missingFields.length > 0) {
      const missingFieldsText = missingFields.slice(0, 3).join(', ');
      const remainingCount = missingFields.length - 3;
      const toastMessage = remainingCount > 0 
        ? `Missing required fields: ${missingFieldsText} and ${remainingCount} more...`
        : `Missing required fields: ${missingFieldsText}`;
      
      toast.error(toastMessage, {
        position: 'top-right',
        duration: 5000,
        style: {
          background: '#f44336',
          color: '#fff',
          fontWeight: '600',
        },
      });
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
      if (data.secure_url && data.public_id) {
        // Only store the URL string, not the object
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
        // Check specifically for reference validation failures
        const hasReferenceErrors = Object.keys(formErrors).some(key => 
          key.startsWith('ref') || key === 'references'
        );
        
        if (hasReferenceErrors) {
          toast.error('Please complete all required reference fields to continue', {
            position: 'top-right',
            duration: 4000,
            style: {
              background: '#f44336',
              color: '#fff',
              fontWeight: '600',
            },
          });
        } else {
          toast.error('Please fix all validation errors before submitting', {
            position: 'top-right',
          });
        }
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
        // Only send the CV url string
        CV: typeof (localWorkHistory.CV || CV) === 'string' ? (localWorkHistory.CV || CV) : (localWorkHistory.CV || CV)?.url,
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

  // Helper for Australian phone formatting and validation
  const formatAustralianPhone = (input) => {
    // Remove all non-digit characters
    let digits = input.replace(/\D/g, '');
    // Remove leading 0 if present (for local numbers)
    if (digits.startsWith('0')) digits = digits.slice(1);
    // Remove leading 61 if present (for numbers already with country code)
    if (digits.startsWith('61')) digits = digits.slice(2);
    // Only keep up to 9 digits (Australian mobile/landline without country code)
    digits = digits.slice(0, 9);
    // Format as 123 123 123
    let formatted = digits.replace(/(\d{3})(\d{3})(\d{0,3})/, (m, a, b, c) => c ? `${a} ${b} ${c}` : `${a} ${b}`);
    return formatted.trim();
  };

  const toE164Australian = (input) => {
    // Remove all non-digit characters
    let digits = input.replace(/\D/g, '');
    // Remove leading 0 if present
    if (digits.startsWith('0')) digits = digits.slice(1);
    // Remove leading 61 if present
    if (digits.startsWith('61')) digits = digits.slice(2);
    // Only keep up to 9 digits
    digits = digits.slice(0, 9);
    // Return in E.164 format
    return `+61${digits}`;
  };

  const isValidAustralianPhone = (input) => {
    // Remove all non-digit characters
    let digits = input.replace(/\D/g, '');
    // Remove leading 0 or 61
    if (digits.startsWith('0')) digits = digits.slice(1);
    if (digits.startsWith('61')) digits = digits.slice(2);
    // Must be exactly 9 digits
    return /^\d{9}$/.test(digits);
  };

  // Helper to get CV document object for preview
  const getCVDocument = () => {
    const cvObj = localWorkHistory.CV || CV;
    if (!cvObj) return null;
    // Support both string and object (for backward compatibility)
    const url = typeof cvObj === 'string' ? cvObj : cvObj.url;
    const fileName = url?.split('/').pop()?.split('?')[0] || 'CV Document';
    let fileType = '';
    if (url?.endsWith('.pdf')) fileType = 'application/pdf';
    else if (url?.match(/\.(jpg|jpeg|png)$/i)) fileType = `image/${url.split('.').pop().toLowerCase()}`;
    else fileType = '';
    return { url, fileName, fileType };
  };

  console.log('ONBORDING DTA', workHistory);

  return (
    <form onSubmit={handleSubmit} className="wh-form" noValidate>
      <Toaster position="top-right" />
      {/* Summary error at the top - removed, now handled by toast only */}
   

      {/* Responsive Grid Layout for CV and Work Experience */}
      <Grid
        container
        spacing={4}
        alignItems="stretch" // Ensure both columns stretch to same height
        sx={{
          width: '100%',
          margin: '0 auto',
          padding: { xs: 0, sm: 2, md: 3 },
          minHeight: { md:   10, xs: 'auto' }, // Increased minHeight for desktop
          flexDirection: { xs: 'column', md: 'row' },
          gap: { md: 4, xs: 0 },
        }}
      >
        <Grid
          item
          xs={12}
          md={4}
          lg={3}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { md: '100%', xs: 'auto' }, // Stretch on desktop, auto on mobile
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              height: '100%', // Fill parent height
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 2, sm: 3 },
              boxSizing: 'border-box',
              transition: 'min-height 0.3s',
            }}
          >
            <OnboardingCV cvError={formErrors.CV} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={8} lg={9} sx={{ display: 'flex', justifyContent: 'center', flexGrow: 1 }}>
          <Paper
            elevation={3} 
            sx={{
              width: '100%',
              maxWidth: 900,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
            
              p: { xs: 2, sm: 3},
              // minHeight: { md: 500, xs: 'auto' }, // Match minHeight with CV section
              height: { md: '100%', xs: 'auto' },
              boxSizing: 'border-box',
              flexGrow: 1,
              transition: 'min-height 0.3s',
            }}
          >
            <OnboardingJobExperience
              jobs={localWorkHistory.jobs}
              formErrors={formErrors}
              expandedJob={expandedJob}
              onAddJob={addNewJob}
              onRemoveJob={handleRemoveJob}
              onUpdateJob={handleUpdateJob}
              onToggleExpandJob={toggleExpandJob}
              formatDateForInput={formatDateForInput}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* References Section */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: 'text.primary',
            '&::before': {
              content: '""',
              width: '4px',
              height: '24px',
              background: 'linear-gradient(45deg, #f44336, #ff9800)',
              borderRadius: '2px',
            }
          }}
        >
          Professional References
          <Chip 
            label="MANDATORY" 
            size="small" 
            color="error" 
            variant="filled"
            sx={{ 
              fontWeight: 700, 
              fontSize: '0.7rem',
              ml: 1,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.7 },
                '100%': { opacity: 1 },
              }
            }}
          />
        </Typography>
      </Box>
      
      <WorkerOnboardingReferences
        references={localWorkHistory.references}
        formErrors={formErrors}
        expandedReference={expandedReference}
        onAddReference={addReference}
        onRemoveReference={removeReference}
        onUpdateReference={handleUpdateReference}
        onToggleExpandReference={toggleExpandReference}
        formatAustralianPhone={formatAustralianPhone}
        maxReferences={2}
      />

      {/* DocumentPreview modal for CV */}
      {showCVPreview && (
        <DocumentPreview
          document={getCVDocument()}
          onClose={() => setShowCVPreview(false)}
        />
      )}

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
