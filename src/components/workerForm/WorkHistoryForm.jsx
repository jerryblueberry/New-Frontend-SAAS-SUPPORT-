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
import { Container,Grid, useMediaQuery, useTheme, Paper, Typography, Box, Chip,Stack, CircularProgress,Button } from '@mui/material';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
    let firstJobErrorIndex = null;
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
          if (firstJobErrorIndex === null) firstJobErrorIndex = index;
        }

        if (!job.company || !job.company.trim()) {
          errors[`job${index}_company`] = 'Company name is required';
          isValid = false;
          if (firstJobErrorIndex === null) firstJobErrorIndex = index;
        }

        if (!job.startDate) {
          errors[`job${index}_startDate`] = 'Start date is required';
          isValid = false;
          if (firstJobErrorIndex === null) firstJobErrorIndex = index;
        }

        const isCurrentJob = job.currentlyWorking || job.current || false;

        if (!isCurrentJob && !job.endDate) {
          errors[`job${index}_endDate`] =
            'End date is required for past jobs';
          isValid = false;
          if (firstJobErrorIndex === null) firstJobErrorIndex = index;
        }

        if (job.startDate && job.endDate) {
          const startDate = new Date(job.startDate);
          const endDate = new Date(job.endDate);

          if (endDate < startDate) {
            errors[`job${index}_endDate`] =
              'End date must be after start date';
            isValid = false;
            if (firstJobErrorIndex === null) firstJobErrorIndex = index;
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
    } else {
      // Duplicate detection across references (use normalized E.164 for phones)
      const emails = localWorkHistory.references.map(r => (r.email || '').trim().toLowerCase()).filter(Boolean);
      const phones = localWorkHistory.references.map(r => toE164Australian(r.phone || '')).filter(Boolean);
      const names = localWorkHistory.references.map(r => (r.name || '').trim().toLowerCase()).filter(Boolean);
      const hasDup = (arr) => new Set(arr).size !== arr.length;
      if (hasDup(emails)) {
        isValid = false;
        errors.references = errors.references || 'Duplicate reference emails are not allowed';
      }
      if (hasDup(phones)) {
        isValid = false;
        errors.references = errors.references || 'Duplicate reference phones are not allowed';
      }
      if (hasDup(names)) {
        isValid = false;
        errors.references = errors.references || 'Duplicate reference names are not allowed';
      }

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
        } else if (!/^(?:[a-zA-Z0-9_'^&+\-])+(?:\.(?:[a-zA-Z0-9_'^&+\-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(ref.email.trim())) {
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
    // Expand the first job card with an error
    if (firstJobErrorIndex !== null) {
      setExpandedJob(firstJobErrorIndex);
      // Best-effort scroll to the card if present
      setTimeout(() => {
        const el = document.getElementById(`wh-job-card-${firstJobErrorIndex}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }

    // No immediate toasts here; we will show one combined toast in submit handler

    // Store first error key for submit handler to focus and toast
    const firstErrorKey = Object.keys(errors)[0] || null;
    return { isValid, firstErrorKey, errors };
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

      const { isValid, firstErrorKey, errors } = validateForm();
      if (!isValid) {
        toast.dismiss();
        // Build specific first error message
        const firstKey = firstErrorKey || Object.keys(errors)[0];
        let message = 'Please fix all validation errors before submitting';
        if (firstKey) {
          const friendly = firstKey
            .replace(/^ref(\d+)_/, (m, idx) => `Reference ${Number(idx) + 1} - `)
            .replace(/^job(\d+)_/, (m, idx) => `Job ${Number(idx) + 1} - `)
            .replace(/_/g, ' ')
            .replace('name', 'Full Name')
            .replace('position', 'Job Title')
            .replace('company', 'Company')
            .replace('phone', 'Phone')
            .replace('email', 'Email')
            .replace('title', 'Job Title')
            .replace('startDate', 'Start Date')
            .replace('endDate', 'End Date')
            .replace('description', 'Description');
          message = `Fix: ${friendly}`;
        }
        toast.error(message, {
          position: 'top-right',
          duration: 4500,
        });
        // Focus the field
        setTimeout(() => {
          const key = firstErrorKey || Object.keys(errors)[0];
          if (!key) return;
          let el = document.querySelector(`[name="${key}"]`);
          if (!el) el = document.getElementById(key);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.focus();
          }
        }, 50);
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
          // Save phones normalized to E.164
          phone: toE164Australian(ref.phone || ''),
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
    // Accept inputs like 0412345678, +61412345678, 0412 345 678, etc.
    let digits = String(input || '').replace(/\D/g, '');
    // Normalize to local 10-digit starting with 0 for display
    if (digits.startsWith('61')) {
      digits = digits.slice(2);
      if (!digits.startsWith('0')) digits = `0${digits}`;
    }
    if (!digits.startsWith('0') && digits.length === 9) {
      digits = `0${digits}`;
    }
    digits = digits.slice(0, 10);
    if (!/^0\d{9}$/.test(digits)) {
      // Fallback: show partial grouping as user types
      const d = digits;
      if (d.length <= 4) return d;
      if (d.length <= 7) return `${d.slice(0, 4)} ${d.slice(4)}`;
      return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`.trim();
    }
    // Format as 0412 345 678
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  };

  const toE164Australian = (input) => {
    // Always return +61XXXXXXXXX for AU numbers
    let digits = String(input || '').replace(/\D/g, '');
    if (digits.startsWith('61')) digits = digits.slice(2);
    else if (digits.startsWith('0')) digits = digits.slice(1);
    // Keep exactly 9 subscriber digits
    digits = digits.slice(0, 9);
    return digits ? `+61${digits}` : '';
  };

  const isValidAustralianPhone = (input) => {
    const cleaned = String(input || '').replace(/\D/g, '');
    return /^0\d{9}$/.test(cleaned) || /^61\d{9}$/.test(cleaned);
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

  // Sort jobs: current jobs first, then by endDate/startDate descending
  const sortedJobs = React.useMemo(() => {
    return [...(localWorkHistory.jobs || [])].sort((a, b) => {
      // Current jobs first
      if ((a.currentlyWorking || a.current) && !(b.currentlyWorking || b.current)) return -1;
      if (!(a.currentlyWorking || a.current) && (b.currentlyWorking || b.current)) return 1;
      // Both current or both not current, compare endDate or startDate
      const aDate = a.endDate || a.startDate;
      const bDate = b.endDate || b.startDate;
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return new Date(bDate) - new Date(aDate); // Descending
    });
  }, [localWorkHistory.jobs]);

  console.log('ONBORDING DTA', workHistory);

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
    <Toaster position="top-right" />
    
    {/* CV Onboarding Section - No padding, starts first */}
    <Box sx={{
      // backgroundColor:'red',
      margin:{xs:'1rem',md:"0rem  6rem"},
      maxHeight:'500px'
    }}>
    <OnboardingCV cvError={formErrors.CV} />
    </Box>


    {/* Main Content Container */}
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: { xs: 2, md: 1},
        px: { xs: 1, sm: 2, md: 2 }
      }}
    >
      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Work Experience and References Section */}
        <Grid item xs={12} md={8} lg={9}>
          <Stack sx={{
            display:'flex',
            flexDirection:{xs:'column',sm:'column', md:'row'},
            gap:'20px'
            
          }} >
            {/* Work Experience Paper */}
            <Paper
              elevation={2}
              sx={{
                p: { xs: 2, sm: 3, md: '0px 2rem' },
                minWidth:'50%',
                borderRadius: 2,
                minHeight: { md: 600 },
                display: 'flex',
                flexDirection: 'column',
                transition: theme.transitions.create(['box-shadow', 'transform'], {
                  duration: theme.transitions.duration.short,
                }),
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <OnboardingJobExperience
                jobs={sortedJobs}
                formErrors={formErrors}
                expandedJob={expandedJob}
                onAddJob={addNewJob}
                onRemoveJob={handleRemoveJob}
                onUpdateJob={handleUpdateJob}
                onToggleExpandJob={toggleExpandJob}
                formatDateForInput={formatDateForInput}
              />
            </Paper>

            {/* References Section */}
            <Paper
              elevation={2}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 2,
                transition: theme.transitions.create(['box-shadow', 'transform'], {
                  duration: theme.transitions.duration.short,
                }),
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
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
            </Paper>
          </Stack>
        </Grid>

        {/* Sidebar for additional content (if needed) */}
        <Grid item xs={12} md={4} lg={3}>
          {/* This space can be used for additional components or left empty */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {/* Placeholder for sidebar content */}
          </Box>
        </Grid>
      </Grid>
    </Container>

    {/* Document Preview Modal */}
    {showCVPreview && (
      <DocumentPreview
        document={getCVDocument()}
        onClose={() => setShowCVPreview(false)}
      />
    )}

    {/* Form Navigation Actions */}
    <Box
      component="section"
      sx={{
        // position: 'sticky',
        bottom: 0,
        bgcolor: 'background.paper',
        borderTop: `1px solid ${theme.palette.divider}`,
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 4 },
        mt: 'auto',
        boxShadow: theme.shadows[4],
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {/* Back Button */}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={prevStep}
            disabled={isPending}
            size={isMobile ? 'medium' : 'large'}
            sx={{
              minWidth: { xs: '100%', sm: 140 },
              height: 48,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Back
          </Button>

          {/* Next Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isPending}
            size={isMobile ? 'medium' : 'large'}
            endIcon={!isPending && <ArrowForwardIcon />}
            sx={{
              minWidth: { xs: '100%', sm: 180 },
              height: 48,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.shadows[2],
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                boxShadow: 'none',
                transform: 'none',
              },
            }}
          >
            {isPending ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress 
                  size={20} 
                  color="inherit"
                  thickness={4}
                />
                <span>Saving...</span>
              </Stack>
            ) : (
              'Next: Availability'
            )}
          </Button>
        </Stack>
      </Container>
    </Box>
  </Box>
  );
};

export default React.memo(WorkHistoryForm);
