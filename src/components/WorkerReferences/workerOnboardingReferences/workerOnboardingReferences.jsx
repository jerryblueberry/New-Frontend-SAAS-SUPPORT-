import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Collapse,
  Avatar,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  LinearProgress,
  Fade,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Verified as VerifiedIcon,
  ContactPhone as ContactPhoneIcon,
} from '@mui/icons-material';
import { toE164Au as toE164AuUtil, isValidAuMobile as isValidAuMobileUtil, formatAuInternational } from '../../../utils/phone';

const WorkerOnboardingReferences = ({
  references,
  formErrors,
  expandedReference,
  onAddReference,
  onRemoveReference,
  onUpdateReference,
  onToggleExpandReference,
  formatAustralianPhone,
  maxReferences = 2,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const hasInitialized = useRef(false); // Prevents duplicate initialization

  // Validators
  const isValidEmail = useCallback((email) => {
    if (!email) return false;
    const re = /^(?:[a-zA-Z0-9_'^&+\-])+(?:\.(?:[a-zA-Z0-9_'^&+\-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return re.test(String(email).trim());
  }, []);

  const toE164Au = useCallback((value) => toE164AuUtil(value), []);
  const isValidAuMobile = useCallback((value) => isValidAuMobileUtil(value), []);

  const isValidName = useCallback((name) => {
    const n = (name || '').trim();
    if (n.length < 2) return false;
    return /^[\p{L} .'-]{2,}$/u.test(n);
  }, []);

  // Duplicate indices for inline error highlighting (simplified)
  const duplicateIndexSets = useMemo(() => {
    const emails = references.map(r => (r?.email || '').trim().toLowerCase());
    const phones = references.map(r => toE164Au(r?.phone || ''));
    const names = references.map(r => (r?.name || '').trim().toLowerCase());

    const duplicateIndices = (arr) => {
      return arr
        .map((v, i) => ({ v, i }))
        .filter(({ v }, _, a) => v && a.filter(x => x.v === v).length > 1)
        .map(({ i }) => i);
    };

    return {
      email: new Set(duplicateIndices(emails)),
      phone: new Set(duplicateIndices(phones)),
      name: new Set(duplicateIndices(names)),
    };
  }, [references, toE164Au]);
  
  const displayPhone = useCallback((value) => {
    const formatter = formatAustralianPhone || formatAuInternational;
    return formatter(value || '');
  }, [formatAustralianPhone]);

  // Always show up to maxReferences (fill with empty objects if needed)
  // MUST be defined before useEffect that uses it
  const filledReferences = useMemo(() => {
    return Array.from({ length: maxReferences }).map((_, i) =>
      references[i] || { name: '', position: '', company: '', phone: '', email: '' }
    );
  }, [references, maxReferences]);
  
  const allComplete = useMemo(() => {
    return filledReferences.every(ref => 
      ref.name && ref.position && ref.company && ref.phone && ref.email
    );
  }, [filledReferences]);

  // SaaS-Level Best Practice: Ensure first reference accordion is always open initially
  // Production-ready UX: User sees form fields immediately, no extra clicks needed
  // Similar to work experience - first reference (index 0) should be expanded on initial render
  useEffect(() => {
    // Only expand if we have references and the first one isn't already expanded
    // This ensures the first mandatory reference is always visible
    if (filledReferences && filledReferences.length > 0 && (expandedReference === null || expandedReference !== 0)) {
      // Immediate expansion - accordion opens instantly showing all required fields
      // This focuses user attention on the mandatory reference
      // Only do this once on initial mount
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        onToggleExpandReference(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filledReferences?.length]); // Trigger when references are loaded

  // Memoize error calculations for performance - SaaS-level optimization
  const getReferenceErrors = useCallback((index) => {
    if (!formErrors || typeof formErrors !== 'object') return {};
    return Object.keys(formErrors)
      .filter((key) => key.startsWith(`ref${index}_`))
      .reduce((acc, key) => {
        acc[key.replace(`ref${index}_`, '')] = formErrors[key];
        return acc;
      }, {});
  }, [formErrors]);
  
  // Removed unused progress calculations

  // Enhanced status calculation
  const getStatus = (ref, idx) => {
    const hasErrors = ['name', 'position', 'company', 'phone', 'email'].some(field => 
      formErrors?.[`ref${idx}_${field}`]
    );
    const isComplete = ref.name && ref.position && ref.company && ref.phone && ref.email;
    const hasContent = Object.values(ref).some(value => value && value.trim());

    if (hasErrors) return 'error';
    if (isComplete) return 'complete';
    if (hasContent) return 'incomplete';
    return 'empty';
  };

  const getStatusConfig = (status) => {
    const configs = {
      complete: {
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.08),
        icon: <CheckCircleIcon />,
        label: 'Complete',
        chipColor: 'success',
      },
      error: {
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.08),
        icon: <ErrorIcon />,
        label: 'Has Errors',
        chipColor: 'error',
      },
      incomplete: {
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.08),
        icon: <WarningIcon />,
        label: 'Incomplete',
        chipColor: 'warning',
      },
      empty: {
        color: theme.palette.grey[400],
        bgColor: alpha(theme.palette.grey[400], 0.05),
        icon: <ContactPhoneIcon />,
        label: 'Add Reference',
        chipColor: 'default',
      },
    };
    return configs[status];
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section - Compact */}
      <Box sx={{ mb: { xs: 1, sm: 1.25 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 }, mb: 0.5 }}>
          <ContactPhoneIcon sx={{ color: 'primary.main', fontSize: { xs: '1.2rem', sm: '1.3rem' } }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              fontSize: { xs: '0.9375rem', sm: '1rem' },
              lineHeight: 1.2,
            }}
          >
            Professional References
          </Typography>
          <Chip 
            label="REQUIRED" 
            size="small" 
            color="error" 
            variant="outlined"
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              height: { xs: 18, sm: 20 },
              ml: { xs: 0.5, sm: 1 },
            }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' }, lineHeight: 1.3 }}>
          Provide {maxReferences} professional references who can verify your work experience.
        </Typography>
      </Box>

      {/* Status Alert - Compact */}
      <Alert 
        severity={allComplete ? "success" : "info"}
        sx={{ 
          mb: { xs: 1, sm: 1.25 },
          borderRadius: 1.5,
          border: 'none',
          py: { xs: 0.75, sm: 1 },
          '& .MuiAlert-icon': { 
            fontSize: { xs: '1rem', sm: '1.1rem' }
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' }, mb: 0.25 }}>
          {allComplete ? 'References Complete' : 'Complete Your References'}
        </AlertTitle>
        <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, lineHeight: 1.4 }}>
          {allComplete ? (
            maxReferences === 1 
              ? 'Reference is ready for verification. We will contact them within 24-48 hours.'
              : `All ${maxReferences} references are ready for verification. We will contact them within 24-48 hours.`
          ) : (
            'All fields are required. We will verify references before activating your profile.'
          )}
        </Typography>
      </Alert>

      {/* Form-wide Errors */}
      {(formErrors?.references || formErrors?.refLimit) && (
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ 
              mb: { xs: 1, sm: 1.25 },
              borderRadius: 1.5,
              py: { xs: 0.75, sm: 1 },
              '& .MuiAlert-icon': {
                fontSize: { xs: '1.1rem', sm: '1.2rem' }
              }
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.85rem' }, mb: 0.25 }}>
              {formErrors.refLimit ? 'Error' : 'References Required'}
            </AlertTitle>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, lineHeight: 1.4 }}>
              {formErrors.refLimit || formErrors.references || 'Please complete all required reference fields'}
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* References List - SaaS-Level Best Practice */}
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          {filledReferences.map((ref, index) => {
            const isExpanded = expandedReference === index;
            const status = getStatus(ref, index);
            const statusConfig = getStatusConfig(status);
            const refErrors = getReferenceErrors(index);
            const hasRefErrors = Object.keys(refErrors).length > 0;
            
            // Best Practice: First reference (index 0) should be expanded initially
            // Similar to work experience - ensures user sees required fields immediately
            const isFirstReference = index === 0;
            
            // Best Practice: Accordion behavior
            // - First reference always expanded on initial load (when expandedReference is null)
            // - After user interaction, use normal accordion state management
            // - This ensures user sees required fields immediately without extra clicks
            const shouldBeExpanded = (expandedReference === null && isFirstReference) || (expandedReference === index);
            
            return (
              <Fade in key={index} timeout={300 + index * 100}>
                <Card
                  elevation={0}
                  sx={{
                    border: `1px solid ${hasRefErrors ? theme.palette.error.main + '40' : alpha(statusConfig.color, 0.2)}`,
                    borderWidth: hasRefErrors ? '2px' : '1px',
                    borderRadius: 1.5,
                    bgcolor: statusConfig.bgColor,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: hasRefErrors 
                        ? theme.palette.error.main 
                        : alpha(statusConfig.color, 0.4),
                      transform: 'translateY(-1px)',
                      boxShadow: hasRefErrors
                        ? `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`
                        : '0 2px 8px rgba(0,0,0,0.08)',
                    },
                  }}
                >
                  {/* Error indicator bar */}
                  {hasRefErrors && (
                    <LinearProgress 
                      color="error" 
                      variant="determinate" 
                      value={100} 
                      sx={{ height: 3, position: 'absolute', top: 0, left: 0, right: 0 }}
                    />
                  )}
                {/* Card Header - Responsive Design */}
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: alpha(statusConfig.color, 0.05),
                    },
                  }}
                  onClick={() => onToggleExpandReference(index)}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: statusConfig.color,
                      mr: { xs: 1.5, sm: 2 },
                      width: { xs: 40, sm: 44, md: 48 },
                      height: { xs: 40, sm: 44, md: 48 },
                      flexShrink: 0,
                    }}
                  >
                    {statusConfig.icon}
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 0.75, sm: 1 },
                      mb: 0.5,
                      flexWrap: 'wrap',
                    }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                        }} 
                        noWrap
                      >
                        {ref.name || `Reference ${index + 1}`}
                      </Typography>
                      {isFirstReference && (
                        <Chip
                          label="Required"
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ 
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            height: { xs: 20, sm: 22 },
                            fontWeight: 600,
                          }}
                        />
                      )}
                      {hasRefErrors && (
                        <Chip
                          icon={<WarningIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                          label={`${Object.keys(refErrors).length} error${Object.keys(refErrors).length > 1 ? 's' : ''}`}
                          size="small"
                          color="error"
                          sx={{ 
                            fontSize: { xs: '0.65rem', sm: '0.7rem' },
                            height: { xs: 20, sm: 22 },
                            fontWeight: 600,
                          }}
                        />
                      )}
                      <Chip 
                        label={statusConfig.label}
                        size="small" 
                        color={statusConfig.chipColor}
                        variant="outlined"
                        sx={{ 
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          height: { xs: 20, sm: 22 },
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.8rem' },
                        lineHeight: 1.4,
                      }} 
                      noWrap
                    >
                      {ref.position && ref.company 
                        ? `${ref.position} at ${ref.company}`
                        : ref.position || ref.company || 'Click to add details'
                      }
                    </Typography>
                    
                    {ref.phone && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          display: 'block',
                          mt: 0.25,
                        }}
                      >
                        {displayPhone(ref.phone)}
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 0.75 }, flexShrink: 0 }}>
                    <IconButton 
                      size="small"
                      sx={{
                        bgcolor: alpha(statusConfig.color, 0.1),
                        width: { xs: 32, sm: 36 },
                        height: { xs: 32, sm: 36 },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        color: hasRefErrors ? theme.palette.error.main : statusConfig.color,
                        '&:hover': {
                          bgcolor: alpha(hasRefErrors ? theme.palette.error.main : statusConfig.color, 0.2),
                          transform: 'scale(1.05)',
                        },
                      }}
                      aria-label={shouldBeExpanded ? 'Collapse reference' : 'Expand reference'}
                    >
                      {shouldBeExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                    </IconButton>
                  </Box>
                </Box>
                
                {/* Expandable Content */}
                <Collapse 
                  in={shouldBeExpanded} 
                  timeout={(expandedReference === null && isFirstReference) ? 0 : 300}
                  appear={false}
                >
                  <Divider sx={{ borderColor: alpha(statusConfig.color, 0.1) }} />
                  <CardContent sx={{ 
                    p: { xs: 1.5, sm: 2, md: 2.5 },
                    pt: { xs: 1.5, sm: 2, md: 2.5 },
                    px: { xs: 1.5, sm: 2, md: 2.5 },
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                  }}>
                    <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                      {/* Full Name - Full Width on Mobile, Responsive Design */}
                      <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            size="small"
                            value={ref.name || ''}
                            onChange={e => onUpdateReference(index, 'name', e.target.value)}
                            placeholder="Enter full name"
                            id={`ref${index}_name`}
                            name={`ref${index}_name`}
                            error={!!formErrors?.[`ref${index}_name`] || duplicateIndexSets.name.has(index) || (!!ref.name && !isValidName(ref.name))}
                            helperText={
                              duplicateIndexSets.name.has(index)
                                ? 'Duplicate name. Please provide two different references.'
                                : formErrors?.[`ref${index}_name`]
                                  || (!!ref.name && !isValidName(ref.name) ? 'Enter a valid name (min 2 letters)' : 'Required')
                            }
                            required
                            aria-label={`Reference ${index + 1} Full Name`}
                            aria-required="true"
                            aria-invalid={!!formErrors?.[`ref${index}_name`] || duplicateIndexSets.name.has(index) || (!!ref.name && !isValidName(ref.name))}
                            aria-describedby={formErrors?.[`ref${index}_name`] || duplicateIndexSets.name.has(index) ? `ref${index}_name-helper-text` : undefined}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon sx={{ 
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    color: formErrors?.[`ref${index}_name`] || duplicateIndexSets.name.has(index) ? 'error.main' : 'action.active' 
                                  }} />
                                </InputAdornment>
                              ),
                            }}
                            FormHelperTextProps={{
                              id: `ref${index}_name-helper-text`,
                              sx: {
                                m: { xs: 0.75, sm: 0.75 },
                                mt: { xs: 0.5, sm: 0.75 },
                                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                fontWeight: (formErrors?.[`ref${index}_name`] || duplicateIndexSets.name.has(index)) ? 600 : 500,
                                lineHeight: { xs: 1.4, sm: 1.5 },
                              }
                            }}
                            sx={{
                              width: '100%',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                bgcolor: 'background.paper',
                                minHeight: { xs: '48px', sm: '40px' },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: (formErrors?.[`ref${index}_name`] || duplicateIndexSets.name.has(index))
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main + '60',
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-focused': {
                                  boxShadow: (formErrors?.[`ref${index}_name`] || duplicateIndexSets.name.has(index))
                                    ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.15)}`
                                    : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: (formErrors?.[`ref${index}_name`] || duplicateIndexSets.name.has(index))
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-error': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.error.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                fontWeight: 600,
                              },
                              '& .MuiInputBase-input': {
                                fontSize: { xs: '0.9375rem', sm: '0.9375rem' },
                                py: { xs: 1.25, sm: 1 },
                                px: { xs: 1, sm: 1 },
                              }
                            }}
                          />
                      </Grid>
                      
                      {/* Position - Full Width on Mobile, Responsive Design */}
                      <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Job Title"
                            size="small"
                            value={ref.position || ''}
                            onChange={e => onUpdateReference(index, 'position', e.target.value)}
                            placeholder="e.g. Senior Manager"
                            id={`ref${index}_position`}
                            name={`ref${index}_position`}
                            error={!!formErrors?.[`ref${index}_position`]}
                            helperText={formErrors?.[`ref${index}_position`] || 'Required'}
                            required
                            aria-label={`Reference ${index + 1} Job Title`}
                            aria-required="true"
                            aria-invalid={!!formErrors?.[`ref${index}_position`]}
                            aria-describedby={formErrors?.[`ref${index}_position`] ? `ref${index}_position-helper-text` : undefined}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <WorkIcon sx={{ 
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    color: formErrors?.[`ref${index}_position`] ? 'error.main' : 'action.active' 
                                  }} />
                                </InputAdornment>
                              ),
                            }}
                            FormHelperTextProps={{
                              id: `ref${index}_position-helper-text`,
                              sx: {
                                m: { xs: 0.75, sm: 0.75 },
                                mt: { xs: 0.5, sm: 0.75 },
                                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                fontWeight: formErrors?.[`ref${index}_position`] ? 600 : 500,
                                lineHeight: { xs: 1.4, sm: 1.5 },
                              }
                            }}
                            sx={{
                              width: '100%',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                bgcolor: 'background.paper',
                                minHeight: { xs: '48px', sm: '40px' },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: formErrors?.[`ref${index}_position`]
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main + '60',
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-focused': {
                                  boxShadow: formErrors?.[`ref${index}_position`]
                                    ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.15)}`
                                    : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: formErrors?.[`ref${index}_position`]
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-error': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.error.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                fontWeight: 600,
                              },
                              '& .MuiInputBase-input': {
                                fontSize: { xs: '0.9375rem', sm: '0.9375rem' },
                                py: { xs: 1.25, sm: 1 },
                                px: { xs: 1, sm: 1 },
                              }
                            }}
                          />
                      </Grid>
                      
                      {/* Company - Full Width on Mobile, Responsive Design */}
                      <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Company"
                            size="small"
                            value={ref.company || ''}
                            onChange={e => onUpdateReference(index, 'company', e.target.value)}
                            placeholder="Enter company name"
                            id={`ref${index}_company`}
                            name={`ref${index}_company`}
                            error={!!formErrors?.[`ref${index}_company`]}
                            helperText={formErrors?.[`ref${index}_company`] || 'Optional - Where they work'}
                            aria-label={`Reference ${index + 1} Company`}
                            aria-invalid={!!formErrors?.[`ref${index}_company`]}
                            aria-describedby={formErrors?.[`ref${index}_company`] ? `ref${index}_company-helper-text` : undefined}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BusinessIcon sx={{ 
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    color: formErrors?.[`ref${index}_company`] ? 'error.main' : 'action.active'
                                  }} />
                                </InputAdornment>
                              ),
                            }}
                            FormHelperTextProps={{
                              id: `ref${index}_company-helper-text`,
                              sx: {
                                m: { xs: 0.75, sm: 0.75 },
                                mt: { xs: 0.5, sm: 0.75 },
                                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                fontWeight: formErrors?.[`ref${index}_company`] ? 600 : 500,
                                lineHeight: { xs: 1.4, sm: 1.5 },
                              }
                            }}
                            sx={{
                              width: '100%',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                bgcolor: 'background.paper',
                                minHeight: { xs: '48px', sm: '40px' },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: formErrors?.[`ref${index}_company`]
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main + '60',
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-focused': {
                                  boxShadow: formErrors?.[`ref${index}_company`]
                                    ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.15)}`
                                    : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: formErrors?.[`ref${index}_company`]
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-error': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.error.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                fontWeight: 600,
                              },
                              '& .MuiInputBase-input': {
                                fontSize: { xs: '0.9375rem', sm: '0.9375rem' },
                                py: { xs: 1.25, sm: 1 },
                                px: { xs: 1, sm: 1 },
                              }
                            }}
                          />
                      </Grid>
                      
                      {/* Phone - Full Width on Mobile, Responsive Design */}
                      <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone (+61)"
                            size="small"
                            value={displayPhone(ref.phone || '')}
                            onChange={e => {
                              const e164 = toE164Au(e.target.value);
                              onUpdateReference(index, 'phone', e164);
                            }}
                            placeholder="+61 412 345 678"
                            id={`ref${index}_phone`}
                            name={`ref${index}_phone`}
                            error={
                              !!formErrors?.[`ref${index}_phone`]
                              || duplicateIndexSets.phone.has(index)
                              || (!!ref.phone && !isValidAuMobile(ref.phone))
                            }
                            helperText={
                              duplicateIndexSets.phone.has(index)
                                ? 'Duplicate phone. Each reference must have a unique number.'
                                : formErrors?.[`ref${index}_phone`]
                                  || (!!ref.phone && !isValidAuMobile(ref.phone) ? 'Enter a valid AU mobile (e.g. +61 412 345 678)' : 'Required - Format: +61 412 345 678')
                            }
                            required
                            aria-label={`Reference ${index + 1} Phone`}
                            aria-required="true"
                            aria-invalid={!!formErrors?.[`ref${index}_phone`] || duplicateIndexSets.phone.has(index) || (!!ref.phone && !isValidAuMobile(ref.phone))}
                            aria-describedby={(formErrors?.[`ref${index}_phone`] || duplicateIndexSets.phone.has(index)) ? `ref${index}_phone-helper-text` : undefined}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon sx={{ 
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    color: (formErrors?.[`ref${index}_phone`] || duplicateIndexSets.phone.has(index)) ? 'error.main' : 'action.active' 
                                  }} />
                                </InputAdornment>
                              ),
                            }}
                            FormHelperTextProps={{
                              id: `ref${index}_phone-helper-text`,
                              sx: {
                                m: { xs: 0.75, sm: 0.75 },
                                mt: { xs: 0.5, sm: 0.75 },
                                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                fontWeight: (formErrors?.[`ref${index}_phone`] || duplicateIndexSets.phone.has(index)) ? 600 : 500,
                                lineHeight: { xs: 1.4, sm: 1.5 },
                              }
                            }}
                            sx={{
                              width: '100%',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                bgcolor: 'background.paper',
                                minHeight: { xs: '48px', sm: '40px' },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: (formErrors?.[`ref${index}_phone`] || duplicateIndexSets.phone.has(index))
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main + '60',
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-focused': {
                                  boxShadow: (formErrors?.[`ref${index}_phone`] || duplicateIndexSets.phone.has(index))
                                    ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.15)}`
                                    : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: (formErrors?.[`ref${index}_phone`] || duplicateIndexSets.phone.has(index))
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-error': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.error.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                fontWeight: 600,
                              },
                              '& .MuiInputBase-input': {
                                fontSize: { xs: '0.9375rem', sm: '0.9375rem' },
                                py: { xs: 1.25, sm: 1 },
                                px: { xs: 1, sm: 1 },
                              }
                            }}
                          />
                      </Grid>
                      
                      {/* Email - Full Width, Responsive Design */}
                      <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Email Address"
                            size="small"
                            type="email"
                            value={ref.email || ''}
                            onChange={e => onUpdateReference(index, 'email', e.target.value)}
                            placeholder="reference@company.com"
                            id={`ref${index}_email`}
                            name={`ref${index}_email`}
                            error={
                              !!formErrors?.[`ref${index}_email`]
                              || duplicateIndexSets.email.has(index)
                              || (!!ref.email && !isValidEmail(ref.email))
                            }
                            helperText={
                              duplicateIndexSets.email.has(index)
                                ? 'Duplicate email. Each reference must use a different email.'
                                : formErrors?.[`ref${index}_email`]
                                  || (!!ref.email && !isValidEmail(ref.email) ? 'Please provide a valid email address' : 'Required - We will contact them at this email')
                            }
                            required
                            aria-label={`Reference ${index + 1} Email Address`}
                            aria-required="true"
                            aria-invalid={!!formErrors?.[`ref${index}_email`] || duplicateIndexSets.email.has(index) || (!!ref.email && !isValidEmail(ref.email))}
                            aria-describedby={(formErrors?.[`ref${index}_email`] || duplicateIndexSets.email.has(index)) ? `ref${index}_email-helper-text` : undefined}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <EmailIcon sx={{ 
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    color: (formErrors?.[`ref${index}_email`] || duplicateIndexSets.email.has(index)) ? 'error.main' : 'action.active' 
                                  }} />
                                </InputAdornment>
                              ),
                            }}
                            FormHelperTextProps={{
                              id: `ref${index}_email-helper-text`,
                              sx: {
                                m: { xs: 0.75, sm: 0.75 },
                                mt: { xs: 0.5, sm: 0.75 },
                                fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                fontWeight: (formErrors?.[`ref${index}_email`] || duplicateIndexSets.email.has(index)) ? 600 : 500,
                                lineHeight: { xs: 1.4, sm: 1.5 },
                              }
                            }}
                            sx={{
                              width: '100%',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                bgcolor: 'background.paper',
                                minHeight: { xs: '48px', sm: '40px' },
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: (formErrors?.[`ref${index}_email`] || duplicateIndexSets.email.has(index))
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main + '60',
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-focused': {
                                  boxShadow: (formErrors?.[`ref${index}_email`] || duplicateIndexSets.email.has(index))
                                    ? `0 0 0 3px ${alpha(theme.palette.error.main, 0.15)}`
                                    : `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: (formErrors?.[`ref${index}_email`] || duplicateIndexSets.email.has(index))
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                                '&.Mui-error': {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.error.main,
                                    borderWidth: '1.5px',
                                  },
                                },
                              },
                              '& .MuiInputLabel-root': {
                                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                fontWeight: 600,
                              },
                              '& .MuiInputBase-input': {
                                fontSize: { xs: '0.9375rem', sm: '0.9375rem' },
                                py: { xs: 1.25, sm: 1 },
                                px: { xs: 1, sm: 1 },
                              }
                            }}
                          />
                      </Grid>
                    </Grid>
                    
                    {/* Actions - Responsive Layout */}
                    <Box sx={{ 
                      mt: { xs: 2, sm: 2.5 },
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      flexWrap: 'wrap',
                      gap: { xs: 1.5, sm: 1 },
                      flexDirection: { xs: 'column', sm: 'row' },
                      width: '100%',
                    }}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          fontStyle: 'italic',
                          width: { xs: '100%', sm: 'auto' },
                        }}
                      >
                        💡 Choose someone who knows your work well
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, flexWrap: 'wrap' }}>
                        {hasRefErrors && (
                          <Chip
                            icon={<WarningIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                            label={`${Object.keys(refErrors).length} error${Object.keys(refErrors).length > 1 ? 's' : ''} to fix`}
                            color="error"
                            size="small"
                            sx={{ 
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              fontWeight: 600,
                              height: { xs: 22, sm: 24 },
                            }}
                          />
                        )}
                        {isFirstReference && (
                          <Chip
                            label="Required"
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ 
                              fontSize: { xs: '0.65rem', sm: '0.7rem' },
                              fontWeight: 600,
                              height: { xs: 22, sm: 24 },
                            }}
                          />
                        )}
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => onRemoveReference(index)}
                          startIcon={<ClearIcon />}
                          fullWidth={isMobile}
                          sx={{ 
                            borderRadius: 1.5,
                            fontSize: { xs: '0.75rem', sm: '0.8rem' },
                            px: { xs: 2, sm: 2 },
                            py: { xs: 0.75, sm: 0.625 },
                            minHeight: { xs: '44px', sm: 'auto' },
                            width: { xs: '100%', sm: 'auto' },
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Clear
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
              </Fade>
            );
          })}
        </Stack>
      </Box>

      {/* Completion Summary */}
      {allComplete && (
        <Box 
          sx={{ 
            mt: { xs: 2, sm: 2.5 },
            p: { xs: 1.5, sm: 2 },
            bgcolor: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            borderRadius: 1.5,
            textAlign: 'center',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <VerifiedIcon sx={{ color: 'success.main', fontSize: { xs: '1.1rem', sm: '1.2rem' } }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark', fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
              References Complete!
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
            Ready for verification within 24-48 hours
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(WorkerOnboardingReferences);