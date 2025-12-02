import React, { useState, useEffect, useCallback } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Fade,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Close,
  Work,
  Save,
  Cancel,
  Business,
  LocationOn,
  CalendarToday,
  Description,
  Add,
  Delete,
  ExpandMore
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';
import { updateWorkHistorySection } from '../../../../api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

/**
 * WorkExperienceEditDrawer Component
 * Production-ready drawer for editing work experience with add/edit/delete capabilities
 */
const WorkExperienceEditDrawer = ({
  open,
  onClose,
  initialWorkHistory = [],
  onSaveSuccess = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  const [workHistory, setWorkHistory] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [expanded, setExpanded] = useState(new Set([0])); // First accordion expanded by default
  const [newlyAddedIndex, setNewlyAddedIndex] = useState(null);
  const inputRefs = React.useRef({});

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

  // Initialize work history when drawer opens
  useEffect(() => {
    if (open) {
      const formatted = initialWorkHistory.map(job => ({
        title: job.title || '',
        company: job.company || '',
        location: job.location || '',
        startDate: job.startDate ? new Date(job.startDate) : null,
        endDate: job.endDate ? new Date(job.endDate) : null,
        current: job.current || false,
        description: job.description || ''
      }));
      const initialData = formatted.length > 0 ? formatted : [{
        title: '',
        company: '',
        location: '',
        startDate: null,
        endDate: null,
        current: false,
        description: ''
      }];
      setWorkHistory(initialData);
      // Expand first accordion by default
      setExpanded(new Set([0]));
      setErrors({});
      setSubmitError(null);
    }
  }, [open, initialWorkHistory]);

  // Handle accordion expand/collapse
  const handleAccordionChange = useCallback((index) => {
    setExpanded(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      return newExpanded;
    });
  }, []);

  // Handle field changes
  const handleChange = useCallback((index, field, value) => {
    setWorkHistory(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-clear endDate if current is checked
      if (field === 'current' && value) {
        updated[index].endDate = null;
      }
      
      return updated;
    });
    
    // Clear error for this field
    const errorKey = `job${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  }, [errors]);

  // Add new work experience
  const handleAdd = useCallback(() => {
    const newIndex = workHistory.length;
    setWorkHistory(prev => [...prev, {
      title: '',
      company: '',
      location: '',
      startDate: null,
      endDate: null,
      current: false,
      description: ''
    }]);
    // Automatically expand the new accordion
    setExpanded(prev => new Set([...prev, newIndex]));
    // Mark as newly added to trigger focus
    setNewlyAddedIndex(newIndex);
  }, [workHistory.length]);

  // Handle focus on newly added accordion
  useEffect(() => {
    if (newlyAddedIndex !== null && expanded.has(newlyAddedIndex)) {
      // Scroll to the new accordion
      const newAccordion = document.getElementById(`work-experience-accordion-${newlyAddedIndex}`);
      if (newAccordion) {
        // Use requestAnimationFrame for smooth scroll
        requestAnimationFrame(() => {
          newAccordion.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest',
            inline: 'nearest'
          });
          
          // Focus on the first input field after accordion animation
          setTimeout(() => {
            const inputElement = inputRefs.current[`title-${newlyAddedIndex}`];
            if (inputElement && typeof inputElement.focus === 'function') {
              inputElement.focus();
            }
          }, 350); // Wait for accordion expand animation (300ms) + small buffer
        });
      }
      // Reset the newly added index
      setNewlyAddedIndex(null);
    }
  }, [newlyAddedIndex, expanded]);

  // Remove work experience
  const handleRemove = useCallback((index) => {
    if (workHistory.length <= 1) {
      toast.error('At least one work experience is required');
      return;
    }
    setWorkHistory(prev => prev.filter((_, i) => i !== index));
    // Update expanded state - shift indices after removed item
    setExpanded(prev => {
      const newExpanded = new Set();
      prev.forEach(idx => {
        if (idx < index) {
          newExpanded.add(idx);
        } else if (idx > index) {
          newExpanded.add(idx - 1);
        }
      });
      return newExpanded;
    });
    // Clear errors for removed item
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`job${index}_`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  }, [workHistory.length]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (workHistory.length === 0) {
      newErrors.general = 'At least one work experience is required';
      return false;
    }

    workHistory.forEach((job, index) => {
      if (!job.title?.trim()) {
        newErrors[`job${index}_title`] = 'Job title is required';
      }
      if (!job.company?.trim()) {
        newErrors[`job${index}_company`] = 'Company name is required';
      }
      if (!job.startDate) {
        newErrors[`job${index}_startDate`] = 'Start date is required';
      }
      if (!job.current && !job.endDate) {
        newErrors[`job${index}_endDate`] = 'End date is required for past positions';
      }
      if (job.startDate && job.endDate && !job.current) {
        const start = new Date(job.startDate);
        const end = new Date(job.endDate);
        if (end < start) {
          newErrors[`job${index}_endDate`] = 'End date must be after start date';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [workHistory]);

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
      const transformedData = workHistory.map(job => ({
        title: job.title.trim(),
        company: job.company.trim(),
        location: job.location?.trim() || '',
        startDate: job.startDate ? job.startDate.toISOString().split('T')[0] : '',
        endDate: job.current ? null : (job.endDate ? job.endDate.toISOString().split('T')[0] : null),
        current: job.current || false,
        description: job.description?.trim() || ''
      }));

      const response = await updateWorkHistorySection('workHistory', transformedData);
      
      if (response.data.success) {
        queryClient.invalidateQueries(['onboarding']);
        toast.success('Work experience updated successfully!');
        if (onSaveSuccess) onSaveSuccess();
        onClose();
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update work experience';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [workHistory, validateForm, queryClient, onSaveSuccess, onClose]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isSubmitting) return;
    setWorkHistory([]);
    setErrors({});
    setSubmitError(null);
    onClose();
  }, [isSubmitting, onClose]);

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
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #0A66C2 0%, #5B21B6 100%)' }} />
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg, #0A66C2 0%, #5B21B6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: `0 4px 12px ${alpha('#0A66C2', 0.3)}` }}>
              <Work />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.125rem', sm: '1.25rem' }, color: '#0F172A', mb: 0.25 }}>
                Edit Work Experience
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8125rem' }}>
                Manage your professional work history
              </Typography>
            </Box>
            <IconButton onClick={handleCancel} disabled={isSubmitting} sx={{ width: 36, height: 36, color: '#64748B', '&:hover': { bgcolor: alpha('#64748B', 0.1), transform: 'rotate(90deg)' }, transition: 'all 0.2s ease' }}>
              <Close />
            </IconButton>
          </Stack>
        </Box>

        {/* Content */}
        <Box 
          sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: { xs: 2.5, sm: 3 }, '&::-webkit-scrollbar': { width: 8 }, '&::-webkit-scrollbar-track': { bgcolor: alpha('#E2E8F0', 0.3) }, '&::-webkit-scrollbar-thumb': { bgcolor: alpha('#64748B', 0.3), borderRadius: 4, '&:hover': { bgcolor: alpha('#64748B', 0.5) } } }}
        >
          <Fade in timeout={400}>
            <form onSubmit={handleSubmit} id="work-experience-form">
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

              <Stack spacing={2}>
                {workHistory.map((job, index) => {
                  const isExpanded = expanded.has(index);
                  const hasData = job.title || job.company || job.location;
                  const jobTitle = job.title || 'Untitled Position';
                  const jobCompany = job.company || 'No company';
                  
                  return (
                    <Accordion
                      key={index}
                      id={`work-experience-accordion-${index}`}
                      expanded={isExpanded}
                      onChange={() => handleAccordionChange(index)}
                      sx={{
                        boxShadow: 'none',
                        border: `1px solid ${alpha('#E2E8F0', 0.8)}`,
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:before': { display: 'none' },
                        '&:hover': {
                          borderColor: alpha('#0A66C2', 0.3),
                          boxShadow: `0 2px 8px ${alpha('#0A66C2', 0.08)}`
                        },
                        '&.Mui-expanded': {
                          borderColor: alpha('#0A66C2', 0.4),
                          boxShadow: `0 4px 12px ${alpha('#0A66C2', 0.12)}`,
                          bgcolor: alpha('#0A66C2', 0.01)
                        }
                      }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMore sx={{ 
                            color: '#0A66C2',
                            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                          }} />
                        }
                        sx={{
                          px: { xs: 2, sm: 2.5 },
                          py: 1.5,
                          minHeight: 56,
                          '&.Mui-expanded': {
                            minHeight: 56,
                            borderBottom: `1px solid ${alpha('#E2E8F0', 0.5)}`
                          },
                          '& .MuiAccordionSummary-content': {
                            my: 1,
                            '&.Mui-expanded': {
                              my: 1
                            }
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              bgcolor: alpha('#0A66C2', 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Work sx={{ fontSize: 20, color: '#0A66C2' }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: '#0F172A',
                                fontSize: { xs: '0.9375rem', sm: '1rem' },
                                lineHeight: 1.4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {hasData ? jobTitle : `Position ${index + 1}`}
                            </Typography>
                            {hasData && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#64748B',
                                  fontSize: '0.8125rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mt: 0.25
                                }}
                              >
                                {jobCompany}
                              </Typography>
                            )}
                          </Box>
                          {workHistory.length > 1 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(index);
                              }}
                              sx={{
                                color: '#EF4444',
                                width: 32,
                                height: 32,
                                '&:hover': {
                                  bgcolor: alpha('#EF4444', 0.1),
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails
                        sx={{
                          px: { xs: 2, sm: 2.5 },
                          py: 2.5,
                          bgcolor: '#FFFFFF'
                        }}
                      >
                        <Stack spacing={2.5}>
                      <TextField
                        label="Job Title"
                        required
                        fullWidth
                        value={job.title}
                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                        error={!!errors[`job${index}_title`]}
                        helperText={errors[`job${index}_title`]}
                        inputRef={(el) => {
                          if (el) {
                            inputRefs.current[`title-${index}`] = el;
                          }
                        }}
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
                        label="Company Name"
                        required
                        fullWidth
                        value={job.company}
                        onChange={(e) => handleChange(index, 'company', e.target.value)}
                        error={!!errors[`job${index}_company`]}
                        helperText={errors[`job${index}_company`]}
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
                        label="Location"
                        fullWidth
                        value={job.location}
                        onChange={(e) => handleChange(index, 'location', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: '#94A3B8', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#FFFFFF' } }}
                      />

                      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <DatePicker
                            label="Start Date"
                            value={job.startDate}
                            onChange={(date) => handleChange(index, 'startDate', date)}
                            format="dd MMM yyyy"
                            disableFuture
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true,
                                error: !!errors[`job${index}_startDate`],
                                helperText: errors[`job${index}_startDate`],
                                InputProps: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarToday sx={{ color: '#94A3B8', fontSize: 20 }} />
                                    </InputAdornment>
                                  )
                                }
                              }
                            }}
                            sx={{ flex: 1 }}
                          />
                          <DatePicker
                            label="End Date"
                            value={job.current ? null : job.endDate}
                            onChange={(date) => handleChange(index, 'endDate', date)}
                            disabled={job.current}
                            format="dd MMM yyyy"
                            disableFuture
                            minDate={job.startDate || undefined}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: !job.current,
                                error: !!errors[`job${index}_endDate`],
                                helperText: errors[`job${index}_endDate`] || (job.current ? 'Leave empty for current position' : ''),
                                InputProps: {
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarToday sx={{ color: '#94A3B8', fontSize: 20 }} />
                                    </InputAdornment>
                                  )
                                }
                              }
                            }}
                            sx={{ flex: 1 }}
                          />
                        </Stack>
                      </LocalizationProvider>

                      <FormControlLabel
                        control={<Checkbox checked={job.current} onChange={(e) => handleChange(index, 'current', e.target.checked)} sx={{ color: '#0A66C2', '&.Mui-checked': { color: '#0A66C2' } }} />}
                        label="I currently work here"
                        sx={{ '& .MuiFormControlLabel-label': { fontWeight: 500, color: '#475569' } }}
                      />

                      <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        value={job.description}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                        placeholder="Describe your role, responsibilities, and achievements..."
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                              <Description sx={{ color: '#94A3B8', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: '#FAFBFC',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#FFFFFF'
                            },
                            '&.Mui-focused': {
                              bgcolor: '#FFFFFF'
                            }
                          }
                        }}
                      />
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={handleAdd}
                  sx={{
                    borderStyle: 'dashed',
                    borderColor: alpha('#0A66C2', 0.4),
                    borderWidth: 1.5,
                    color: '#0A66C2',
                    fontWeight: 600,
                    py: 1.75,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: '0.9375rem',
                    bgcolor: alpha('#0A66C2', 0.02),
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderStyle: 'solid',
                      borderColor: '#0A66C2',
                      bgcolor: alpha('#0A66C2', 0.08),
                      transform: 'translateY(-1px)',
                      boxShadow: `0 4px 12px ${alpha('#0A66C2', 0.15)}`
                    }
                  }}
                >
                  Add Another Position
                </Button>
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
            <Button type="submit" form="work-experience-form" variant="contained" fullWidth disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <Save />} sx={{ background: 'linear-gradient(135deg, #0A66C2 0%, #5B21B6 100%)', color: 'white', fontWeight: 600, py: 1.25, borderRadius: 2, textTransform: 'none', fontSize: '0.9375rem', boxShadow: `0 4px 14px ${alpha('#0A66C2', 0.3)}`, '&:hover': { background: 'linear-gradient(135deg, #0956A2 0%, #4A1A96 100%)', boxShadow: `0 6px 20px ${alpha('#0A66C2', 0.4)}` }, '&:disabled': { background: alpha('#0A66C2', 0.5), color: 'white' } }}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default WorkExperienceEditDrawer;

