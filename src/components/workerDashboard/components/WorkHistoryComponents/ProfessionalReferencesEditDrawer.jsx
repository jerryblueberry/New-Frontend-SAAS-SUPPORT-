import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
  TextField,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Chip,
  InputAdornment
} from '@mui/material';
import {
  Close,
  Person,
  Save,
  Cancel,
  Business,
  Email,
  Phone,
  Work
} from '@mui/icons-material';
import { updateWorkHistorySection } from '../../../../api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { toE164Au, isValidAuMobile, formatAuInternational } from '../../../../utils/phone';

/**
 * ProfessionalReferencesEditDrawer Component
 * Production-ready drawer for editing professional references
 */
const ProfessionalReferencesEditDrawer = ({
  open,
  onClose,
  initialReferences = [],
  onSaveSuccess = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  const [references, setReferences] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Emit drawer events for sidebar visibility
  useEffect(() => {
    if (open) {
      window.dispatchEvent(new Event('drawer:open'));
    } else {
      window.dispatchEvent(new Event('drawer:close'));
    }
    
    return () => {
      if (open) {
        window.dispatchEvent(new Event('drawer:close'));
      }
    };
  }, [open]);

  // Initialize references when drawer opens
  useEffect(() => {
    if (open) {
      const formatted = initialReferences.map(ref => ({
        name: ref.name || '',
        company: ref.company || '',
        position: ref.position || '',
        email: ref.email || '',
        phone: ref.phone || ''
      }));
      setReferences(formatted.length > 0 ? formatted : [{
        name: '',
        company: '',
        position: '',
        email: '',
        phone: ''
      }]);
      setErrors({});
      setSubmitError(null);
    }
  }, [open, initialReferences]);

  // Handle field changes
  const handleChange = useCallback((index, field, value) => {
    setReferences(prev => {
      const updated = [...prev];
      if (field === 'phone') {
        // Format phone number
        const e164 = toE164Au(value);
        updated[index] = { ...updated[index], [field]: e164 };
      } else if (field === 'email') {
        updated[index] = { ...updated[index], [field]: value.toLowerCase().trim() };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
    
    // Clear error for this field
    const errorKey = `ref${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (references.length === 0) {
      newErrors.general = 'At least one reference is required';
      return false;
    }

    references.forEach((ref, index) => {
      if (!ref.name?.trim()) {
        newErrors[`ref${index}_name`] = 'Reference name is required';
      }
      if (!ref.position?.trim()) {
        newErrors[`ref${index}_position`] = 'Position is required';
      }
      if (!ref.phone?.trim()) {
        newErrors[`ref${index}_phone`] = 'Phone number is required';
      } else if (!isValidAuMobile(ref.phone)) {
        newErrors[`ref${index}_phone`] = 'Please enter a valid Australian mobile number';
      }
      if (!ref.email?.trim()) {
        newErrors[`ref${index}_email`] = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref.email)) {
        newErrors[`ref${index}_email`] = 'Please enter a valid email address';
      }
    });

    // Check for duplicate emails
    const emails = references.map(r => r.email?.toLowerCase()?.trim()).filter(Boolean);
    const duplicateEmails = emails.filter((email, idx) => emails.indexOf(email) !== idx);
    if (duplicateEmails.length > 0) {
      references.forEach((ref, index) => {
        if (duplicateEmails.includes(ref.email?.toLowerCase()?.trim())) {
          newErrors[`ref${index}_email`] = 'Duplicate email. Each reference must have a unique email.';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [references]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      setSubmitError('Please fix the errors before saving');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Transform data for API
      const transformedData = references.map(ref => ({
        name: ref.name.trim(),
        company: ref.company?.trim() || '',
        position: ref.position.trim(),
        email: ref.email.trim().toLowerCase(),
        phone: ref.phone.trim()
      }));

      const response = await updateWorkHistorySection('references', transformedData);
      
      if (response.data.success) {
        queryClient.invalidateQueries(['onboarding']);
        queryClient.invalidateQueries(['workerReferences']);
        toast.success('References updated successfully!');
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update references';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [references, validateForm, queryClient, onSaveSuccess, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isSubmitting) return;
    setReferences([]);
    setErrors({});
    setSubmitError(null);
    onClose();
  }, [isSubmitting, onClose]);

  const displayPhone = useCallback((value) => {
    return formatAuInternational(value || '');
  }, []);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600, md: 700 },
          maxWidth: '100vw',
          boxShadow: `0 8px 32px ${alpha('#000', 0.12)}`,
        }
      }}
      SlideProps={{
        timeout: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF' }}>
        {/* Header */}
        <Box sx={{ p: { xs: 2.5, sm: 3 }, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3B82F6 0%, #00BCD4 100%)' }} />
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #3B82F6 0%, #00BCD4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: `0 4px 12px ${alpha('#3B82F6', 0.3)}` }}>
              <Person />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' }, color: '#0F172A', mb: 0.25 }}>
                Edit Professional References
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                Update your professional references
              </Typography>
            </Box>
            <IconButton onClick={handleCancel} disabled={isSubmitting} sx={{ width: 36, height: 36, color: '#64748B', '&:hover': { bgcolor: alpha('#64748B', 0.1), transform: 'rotate(90deg)' }, transition: 'all 0.2s ease' }}>
              <Close />
            </IconButton>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: { xs: 2.5, sm: 3 }, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-track': { bgcolor: alpha('#E2E8F0', 0.3) }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#64748B', 0.3), borderRadius: 4, '&:hover': { bgcolor: alpha('#64748B', 0.5) } } }}>
          <Fade in timeout={400}>
            <form onSubmit={handleSubmit} id="references-form">
              {submitError && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, bgcolor: alpha('#EF4444', 0.1), border: `1px solid ${alpha('#EF4444', 0.2)}`, '& .MuiAlert-icon': { color: '#DC2626' } }} onClose={() => setSubmitError(null)}>
                  {submitError}
                </Alert>
              )}

              {errors.general && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                  {errors.general}
                </Alert>
              )}

              <Stack spacing={3}>
                {references.map((ref, index) => (
                  <Box key={index} sx={{ p: 2.5, borderRadius: 2, border: `1.5px solid ${alpha('#3B82F6', 0.2)}`, bgcolor: alpha('#3B82F6', 0.02), position: 'relative' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Chip icon={<Person sx={{ fontSize: 14 }} />} label={`Reference ${index + 1}`} size="small" sx={{ bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6', fontWeight: 600 }} />
                    </Stack>

                    <Stack spacing={2}>
                      <TextField
                        label="Full Name"
                        required
                        fullWidth
                        value={ref.name}
                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                        error={!!errors[`ref${index}_name`]}
                        helperText={errors[`ref${index}_name`]}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#94A3B8', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF' } }}
                      />

                      <TextField
                        label="Company"
                        fullWidth
                        value={ref.company}
                        onChange={(e) => handleChange(index, 'company', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business sx={{ color: '#94A3B8', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF' } }}
                      />

                      <TextField
                        label="Position / Job Title"
                        required
                        fullWidth
                        value={ref.position}
                        onChange={(e) => handleChange(index, 'position', e.target.value)}
                        error={!!errors[`ref${index}_position`]}
                        helperText={errors[`ref${index}_position`]}
                        placeholder="e.g., Manager, Supervisor"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Work sx={{ color: '#94A3B8', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF' } }}
                      />

                      <TextField
                        label="Email Address"
                        type="email"
                        required
                        fullWidth
                        value={ref.email}
                        onChange={(e) => handleChange(index, 'email', e.target.value)}
                        error={!!errors[`ref${index}_email`]}
                        helperText={errors[`ref${index}_email`] || 'We\'ll contact them at this email'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#94A3B8', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF' } }}
                      />

                      <TextField
                        label="Phone Number (+61)"
                        type="tel"
                        required
                        fullWidth
                        value={displayPhone(ref.phone)}
                        onChange={(e) => handleChange(index, 'phone', e.target.value)}
                        error={!!errors[`ref${index}_phone`]}
                        helperText={errors[`ref${index}_phone`] || 'Format: +61 412 345 678'}
                        placeholder="+61 412 345 678"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: '#94A3B8', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF' } }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </form>
          </Fade>
        </Box>

        {/* Footer */}
        <Box sx={{ p: { xs: 2.5, sm: 3 }, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, bgcolor: '#FFFFFF' }}>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" fullWidth onClick={handleCancel} disabled={isSubmitting} startIcon={<Cancel />} sx={{ borderColor: '#CBD5E1', color: '#475569', fontWeight: 600, py: 1.25, borderRadius: 2, textTransform: 'none', fontSize: '0.9375rem', '&:hover': { borderColor: '#94A3B8', bgcolor: alpha('#94A3B8', 0.05) } }}>
              Cancel
            </Button>
            <Button type="submit" form="references-form" variant="contained" fullWidth disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ background: 'linear-gradient(135deg, #3B82F6 0%, #00BCD4 100%)', color: 'white', fontWeight: 600, py: 1.25, borderRadius: 2, textTransform: 'none', fontSize: '0.9375rem', boxShadow: `0 4px 14px ${alpha('#3B82F6', 0.3)}`, '&:hover': { background: 'linear-gradient(135deg, #2563EB 0%, #00ACC1 100%)', boxShadow: `0 6px 20px ${alpha('#3B82F6', 0.4)}` }, '&:disabled': { background: alpha('#3B82F6', 0.5), color: 'white' } }}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ProfessionalReferencesEditDrawer;

