import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Grid,
  Collapse,
  Stack,
  useTheme,
  styled,
  Paper,
  Fade,
  Avatar,
  Chip,
  Tooltip,
  Alert,
  AlertTitle,
  InputAdornment,
  LinearProgress,
  alpha,
} from '@mui/material';
import { useMediaQuery } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Title as TitleIcon,
  DateRange as DateRangeIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { enGB } from 'date-fns/locale';

// Styled components
const SectionContainer = styled(Box)(({ theme }) => ({
  padding: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));


const ExperienceCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isExpanded' && prop !== 'hasErrors',
})(({ theme, isExpanded, hasErrors }) => ({
  width: '100%',
  margin: '0 auto',
  borderRadius: '16px',
  boxShadow: hasErrors 
    ? `0 1px 3px rgba(0,0,0,0.04), 0 2px 8px ${alpha(theme.palette.error.main, 0.08)}`
    : '0 1px 3px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  border: hasErrors
    ? `1px solid ${alpha(theme.palette.error.main, 0.2)}`
    : `1px solid ${alpha(theme.palette.divider, 0.08)}`,
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  '&:hover': {
    boxShadow: hasErrors 
      ? `0 4px 16px ${alpha(theme.palette.error.main, 0.12)}, 0 2px 4px rgba(0,0,0,0.04)`
      : '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
    transform: 'translateY(-1px)',
    borderColor: hasErrors
      ? alpha(theme.palette.error.main, 0.3)
      : alpha(theme.palette.primary.main, 0.15),
  },
  [theme.breakpoints.down('sm')]: {
    borderRadius: '12px',
  },
}));

const CardHeaderStyled = styled(CardHeader)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    bgcolor: alpha(theme.palette.primary.main, 0.02),
  },
  '& .MuiCardHeader-content': {
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  '& .MuiCardHeader-title': {
    fontWeight: 600,
    fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.text.primary,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  '& .MuiCardHeader-subheader': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.text.secondary,
    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
    lineHeight: 1.4,
    mt: 0.25,
    fontWeight: 400,
  },
  '& .MuiCardHeader-avatar': {
    marginRight: theme.spacing(1.5),
  },
}));

const ExpandButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isExpanded',
})(({ theme, isExpanded }) => ({
  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  color: theme.palette.primary.main,
}));

const EmptyState = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.background.default,
  border: `2px dashed ${theme.palette.divider}`,
  maxWidth: 500,
  margin: '0 auto',
  '& .MuiSvgIcon-root': {
    fontSize: '3rem',
    color: theme.palette.text.disabled,
    marginBottom: theme.spacing(2),
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: theme.shadows[1],
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1, 3),
  fontWeight: 500,
  textTransform: 'none',
}));

const DateRangeChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.secondary,
  fontWeight: 500,
  fontSize: '0.75rem',
}));

const ValidationSummary = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(3),
}));

/**
 * OnboardingJobExperience Component - SaaS-Level Production Ready
 * 
 * Best Practices Implemented:
 * 1. Initial State: Shows ONLY ONE mandatory job card (accordion open)
 * 2. Progressive Disclosure: Additional cards appear only when user clicks "Add Another Experience"
 * 3. Mandatory First: First job (index 0) is required, cannot be removed
 * 4. Clean UI: No empty states, no multiple cards initially
 * 5. User Control: Users explicitly add more experiences via button
 * 
 * Flow:
 * - Initial load: jobs = [] → Component creates ONE job → Shows ONE card (open)
 * - User adds more: Clicks button → New card appears → Normal accordion behavior
 */
const OnboardingJobExperience = ({
  jobs,
  formErrors,
  expandedJob,
  onAddJob,
  onRemoveJob,
  onUpdateJob,
  onToggleExpandJob,
  formatDateForInput,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const hasInitialized = useRef(false); // Prevents duplicate job creation

  // SaaS-Level Best Practice: Auto-create ONLY ONE mandatory job initially
  // This ensures clean UI with single focus on required work experience
  // Production-ready: No work experience = show only ONE card, accordion open
  // FIXED: Prevents duplicate job creation from store/localStorage/API
  useEffect(() => {
    // Only initialize once - prevents duplicate job creation
    if (!hasInitialized.current) {
      // Check if jobs array is empty or undefined (initial state)
      const hasNoJobs = !jobs || !Array.isArray(jobs) || jobs.length === 0;
      
      if (hasNoJobs) {
        // Initial state: No jobs exist - create ONLY the first mandatory one
        // This is the required work experience - user can add more via button
        hasInitialized.current = true;
        onAddJob(); // Creates exactly ONE job
      } else {
        // Jobs already exist (from store/localStorage/API)
        // IMPORTANT: Even if store has multiple jobs, component should only show first one initially
        // This is handled by WorkHistoryForm normalization
        // Mark as initialized to prevent re-creating
        hasInitialized.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs?.length]); // Only depend on jobs.length, safely handle undefined

  // Best Practice: Ensure first mandatory job accordion is always open initially
  // Production-ready UX: User sees form fields immediately, no extra clicks needed
  useEffect(() => {
    // Only expand if we have jobs and the first one isn't already expanded
    if (jobs && jobs.length > 0 && expandedJob !== 0) {
      // Immediate expansion - accordion opens instantly showing all required fields
      // This focuses user attention on the mandatory work experience
      onToggleExpandJob(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs?.length]); // Trigger when first job is created

  // Memoize error calculations for performance - SaaS-level optimization
  const getJobErrors = useCallback((index) => {
    if (!formErrors || typeof formErrors !== 'object') return {};
    return Object.keys(formErrors)
      .filter((key) => key.startsWith(`job${index}_`))
      .reduce((acc, key) => {
        acc[key.replace(`job${index}_`, '')] = formErrors[key];
        return acc;
      }, {});
  }, [formErrors]);

  // Memoized date formatting function
  const formatDateRange = useCallback((startDate, endDate, currentlyWorking) => {
    if (!startDate) return '';
    try {
      const start = new Date(startDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      if (currentlyWorking) return `${start} - Present`;
      if (!endDate) return start;
      const end = new Date(endDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return `${start} - ${end}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  }, []);

  // Helper function to generate appealing, user-friendly card titles
  const getCardTitle = useCallback((job, index, totalJobs) => {
    if (job.company && job.company.trim()) {
      return job.company.trim();
    }
    // More appealing, contextual fallback titles
    if (index === 0 && totalJobs === 1) {
      return 'Your Work Experience';
    }
    if (index === 0) {
      return 'Primary Experience';
    }
    return `Experience ${index + 1}`;
  }, []);

  // Helper function to generate appealing, user-friendly card subtitles
  const getCardSubtitle = useCallback((job, index, totalJobs) => {
    if (job.title && job.title.trim()) {
      return job.title.trim();
    }
    // More appealing, contextual fallback subtitles
    if (index === 0 && totalJobs === 1) {
      return 'Share your professional background';
    }
    if (index === 0) {
      return 'Your primary work experience';
    }
    return 'Additional professional experience';
  }, []);

  const handleRemoveWithConfirmation = (index) => {
    onRemoveJob(index);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
      <SectionContainer>
        {/* Enhanced Header - Clean, Single Design */}
        <Box sx={{ mb: { xs: 2.5, sm: 3 }, width: '100%' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 2 },
            flexWrap: 'wrap',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.25 }, flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 44 },
                  height: { xs: 40, sm: 44 },
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                }}
              >
                <WorkIcon sx={{ 
                  color: 'primary.main', 
                  fontSize: { xs: 20, sm: 22 } 
                }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                    lineHeight: 1.3,
                    letterSpacing: '-0.015em',
                    mb: 0.5,
                  }}
                >
                  Work Experience
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' }, 
                    lineHeight: 1.5,
                    fontWeight: 400,
                    color: theme.palette.text.secondary,
                  }}
                >
                  Share your professional journey and key achievements
                </Typography>
              </Box>
            </Box>
            <Chip 
              label="Required" 
              size="small" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                height: { xs: 24, sm: 26 },
                bgcolor: alpha(theme.palette.error.main, 0.08),
                color: theme.palette.error.main,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                flexShrink: 0,
                borderRadius: '8px',
              }}
            />
          </Box>
        </Box>


        {/* Form-wide Errors - Modern Design */}
        {formErrors.jobs && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ 
                mb: { xs: 2, sm: 2.5 }, 
                borderRadius: '12px',
                border: `1px solid ${alpha(theme.palette.error.main, 0.15)}`,
                py: { xs: 1.25, sm: 1.5 },
                px: { xs: 1.5, sm: 2 },
                bgcolor: alpha(theme.palette.error.main, 0.06),
                '& .MuiAlert-icon': {
                  fontSize: { xs: 20, sm: 22 },
                  color: theme.palette.error.main,
                },
              }}
            >
              <AlertTitle sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.8125rem', sm: '0.875rem' }, 
                mb: 0.5,
                color: theme.palette.error.main,
              }}>
                Work Experience Required
              </AlertTitle>
              <Typography 
                variant="body2"
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  lineHeight: 1.5,
                  color: theme.palette.error.dark,
                }}
              >
                {formErrors.jobs}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Experience List - SaaS-Level Best Practice */}
        {/* 
          INITIAL STATE HANDLING:
          - WorkHistoryForm normalizes store jobs to ONLY ONE on initial load
          - Component creates ONE job if jobs array is empty
          - Result: Only ONE card shows initially, accordion open
          - Additional cards appear only when user clicks "Add Another Experience"
        */}
        <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%', flexGrow: 1 }}>
          {jobs && Array.isArray(jobs) && jobs.length > 0 ? jobs.map((job, index) => {
              const jobErrors = getJobErrors(index);
              const hasJobErrors = Object.keys(jobErrors).length > 0;
              
              // Best Practice: First job (index 0) is mandatory - only one required
              const isFirstJob = index === 0;
              const isOnlyJob = jobs.length === 1;
              
              // Best Practice: Accordion behavior
              // - First job always expanded when it's the only job (mandatory, focus on it)
              // - When multiple jobs exist, use normal accordion state management
              const isExpanded = isOnlyJob ? isFirstJob : expandedJob === index;
              
              // Best Practice: Prevent collapsing first mandatory job when it's the only one
              // This ensures user always sees the required form fields
              const canCollapse = !(isFirstJob && isOnlyJob);

              return (
                <Fade in key={index} timeout={300 + index * 100}>
                  <ExperienceCard 
                    id={`wh-job-card-${index}`}
                    isExpanded={isExpanded}
                    hasErrors={hasJobErrors}
                    sx={{ 
                      width: '100%', 
                      maxWidth: '100%',
                      border: `1px solid ${hasJobErrors ? theme.palette.error.main + '40' : theme.palette.divider}`,
                      bgcolor: 'background.paper',
                    }}
                  >
                    {/* Error indicator bar */}
                    {hasJobErrors && (
                      <LinearProgress 
                        color="error" 
                        variant="determinate" 
                        value={100} 
                        sx={{ 
                          height: 2, 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          right: 0,
                          borderRadius: '2px 2px 0 0',
                        }}
                      />
                    )}

                    {/* Card Header */}
                    {canCollapse ? (
                      // Collapsible header for additional jobs or when multiple jobs exist
                      <CardHeaderStyled
                        title={getCardTitle(job, index, jobs.length)}
                        subheader={getCardSubtitle(job, index, jobs.length)}
                        avatar={
                          <Avatar sx={{ 
                            bgcolor: hasJobErrors 
                              ? alpha(theme.palette.error.main, 0.1)
                              : alpha(theme.palette.primary.main, 0.1),
                            width: { xs: 44, sm: 48, md: 52 },
                            height: { xs: 44, sm: 48, md: 52 },
                            border: `1px solid ${hasJobErrors 
                              ? alpha(theme.palette.error.main, 0.2)
                              : alpha(theme.palette.primary.main, 0.2)}`,
                          }}>
                            <BusinessIcon sx={{ 
                              color: hasJobErrors ? theme.palette.error.main : theme.palette.primary.main,
                              fontSize: { xs: 22, sm: 24, md: 26 }
                            }} />
                          </Avatar>
                        }
                        action={
                          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                            {job.startDate && !isExpanded && (
                              <DateRangeChip
                                label={formatDateRange(
                                  job.startDate,
                                  job.endDate,
                                  job.currentlyWorking
                                )}
                                size="small"
                                sx={{ 
                                  display: { xs: 'none', sm: 'flex' },
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                            )}
                            {hasJobErrors && (
                              <Chip
                                icon={<WarningIcon sx={{ fontSize: 14 }} />}
                                label={`${Object.keys(jobErrors).length} error${Object.keys(jobErrors).length > 1 ? 's' : ''}`}
                                size="small"
                                color="error"
                                sx={{ 
                                  fontSize: '0.7rem',
                                  height: 24,
                                  fontWeight: 600
                                }}
                              />
                            )}
                            <ExpandButton
                              aria-label={isExpanded ? "collapse" : "expand"}
                              isExpanded={isExpanded}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpandJob(index);
                              }}
                              sx={{
                                color: hasJobErrors ? theme.palette.error.main : theme.palette.primary.main
                              }}
                            >
                              <ExpandMoreIcon />
                            </ExpandButton>
                          </Box>
                        }
                        onClick={() => onToggleExpandJob(index)}
                        sx={{
                          p: { xs: 2, sm: 2.5, md: 3 },
                          pb: isExpanded ? { xs: 1.5, sm: 2, md: 2.5 } : { xs: 2, sm: 2.5, md: 3 },
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      />
                    ) : (
                      // Non-collapsible header for first mandatory job (when it's the only job)
                      <Box
                        sx={{
                          p: { xs: 2, sm: 2.5, md: 2.5 },
                          pb: { xs: 1.5, sm: 2, md: 2 },
                          display: 'flex',
                          alignItems: 'center',
                          gap: { xs: 1.5, sm: 2 },
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        }}
                      >
                        <Avatar sx={{ 
                          bgcolor: hasJobErrors 
                            ? alpha(theme.palette.error.main, 0.1)
                            : alpha(theme.palette.primary.main, 0.1),
                          width: { xs: 44, sm: 48, md: 52 },
                          height: { xs: 44, sm: 48, md: 52 },
                          border: `1px solid ${hasJobErrors 
                            ? alpha(theme.palette.error.main, 0.2)
                            : alpha(theme.palette.primary.main, 0.2)}`,
                        }}>
                          <BusinessIcon sx={{ 
                            color: hasJobErrors ? theme.palette.error.main : theme.palette.primary.main,
                            fontSize: { xs: 22, sm: 24, md: 26 }
                          }} />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
                              color: 'text.primary',
                              mb: 0.375,
                              letterSpacing: '-0.01em',
                              lineHeight: 1.3,
                            }}
                          >
                            {getCardTitle(job, index, jobs.length)}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                              color: 'text.secondary',
                              lineHeight: 1.4,
                              fontWeight: 400,
                            }}
                          >
                            {getCardSubtitle(job, index, jobs.length)}
                          </Typography>
                        </Box>
                        {hasJobErrors && (
                          <Chip
                            icon={<WarningIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                            label={`${Object.keys(jobErrors).length} error${Object.keys(jobErrors).length > 1 ? 's' : ''}`}
                            size="small"
                            color="error"
                            sx={{ 
                              fontSize: { xs: '0.6875rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 26 },
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Collapsible Content - Always visible and open for first mandatory job */}
                    <Collapse 
                      in={isExpanded} 
                      timeout={isOnlyJob && isFirstJob ? 0 : 300} 
                      unmountOnExit={canCollapse}
                      appear={false}
                    >
                      {canCollapse && <Divider />}
                      {/* CardContent - Modern, Clean Design */}
                      <CardContent sx={{ 
                        p: { xs: 2, sm: 2.5, md: 3 },
                        pt: { xs: 2, sm: 2.5, md: 3 },
                        px: { xs: 2, sm: 2.5, md: 3 },
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        '&:last-child': {
                          pb: { xs: 2, sm: 2.5, md: 3 },
                        },
                      }}>
                        {/* SaaS-Level Responsive Grid Layout - Optimized for Mobile */}
                        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                          {/* Company Name - Full Width on Mobile, Responsive Design */}
                          <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Company Name"
                                value={job.company || ''}
                                onChange={(e) => onUpdateJob(index, 'company', e.target.value)}
                                error={!!jobErrors.company}
                                helperText={jobErrors.company || 'Required'}
                                required
                                name={`job${index}_company`}
                                id={`job${index}_company`}
                                aria-label={`Job ${index + 1} Company Name`}
                                aria-required="true"
                                aria-invalid={!!jobErrors.company}
                                aria-describedby={jobErrors.company ? `job${index}_company-helper-text` : undefined}
                                size="small"
                                placeholder="Enter company name"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <BusinessIcon 
                                        sx={{ 
                                          fontSize: { xs: '1rem', sm: '1.1rem' },
                                          color: jobErrors.company ? 'error.main' : 'action.active' 
                                        }} 
                                      />
                                    </InputAdornment>
                                  ),
                                }}
                                FormHelperTextProps={{
                                  id: `job${index}_company-helper-text`,
                                  sx: {
                                    m: { xs: 0.75, sm: 0.75 },
                                    mt: { xs: 0.5, sm: 0.75 },
                                    fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                    fontWeight: jobErrors.company ? 600 : 500,
                                    lineHeight: { xs: 1.4, sm: 1.5 },
                                  }
                                }}
                                sx={{
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    bgcolor: alpha(theme.palette.grey[50], 0.6),
                                    minHeight: { xs: '48px', sm: '48px', md: '52px' },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '& fieldset': {
                                      borderColor: jobErrors.company
                                        ? alpha(theme.palette.error.main, 0.2)
                                        : alpha(theme.palette.divider, 0.1),
                                      borderWidth: '1px',
                                    },
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.grey[100], 0.8),
                                      '& fieldset': {
                                        borderColor: jobErrors.company
                                          ? alpha(theme.palette.error.main, 0.3)
                                          : alpha(theme.palette.primary.main, 0.15),
                                      },
                                    },
                                    '&.Mui-focused': {
                                      bgcolor: 'background.paper',
                                      boxShadow: jobErrors.company
                                        ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.08)}`
                                        : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.08)}`,
                                      '& fieldset': {
                                        borderColor: jobErrors.company
                                          ? theme.palette.error.main
                                          : theme.palette.primary.main,
                                        borderWidth: '1.5px',
                                      },
                                    },
                                    '&.Mui-error': {
                                      '& fieldset': {
                                        borderColor: theme.palette.error.main,
                                      },
                                    },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                    fontWeight: 500,
                                  },
                                  '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                                    py: { xs: 1.25, sm: 1.375 },
                                    px: { xs: 1, sm: 1.25 },
                                    fontWeight: 500,
                                  }
                                }}
                              />
                          </Grid>

                          {/* Job Title - Full Width on Mobile, Responsive Design */}
                          <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                                label="Job Title"
                                value={job.title || ''}
                                onChange={(e) => onUpdateJob(index, 'title', e.target.value)}
                                error={!!jobErrors.title}
                                helperText={jobErrors.title || 'Required'}
                                required
                                name={`job${index}_title`}
                                id={`job${index}_title`}
                                aria-label={`Job ${index + 1} Job Title`}
                                aria-required="true"
                                aria-invalid={!!jobErrors.title}
                                aria-describedby={jobErrors.title ? `job${index}_title-helper-text` : undefined}
                                size="small"
                                placeholder="e.g. Senior Developer"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <TitleIcon 
                                        sx={{ 
                                          fontSize: { xs: '1rem', sm: '1.1rem' },
                                          color: jobErrors.title ? 'error.main' : 'action.active' 
                                        }} 
                                      />
                                    </InputAdornment>
                                  ),
                                }}
                                FormHelperTextProps={{
                                  id: `job${index}_title-helper-text`,
                                  sx: {
                                    m: { xs: 0.75, sm: 0.75 },
                                    mt: { xs: 0.5, sm: 0.75 },
                                    fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                    fontWeight: jobErrors.title ? 600 : 500,
                                    lineHeight: { xs: 1.4, sm: 1.5 },
                                  }
                                }}
                                sx={{
                                  width: '100%',
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    bgcolor: alpha(theme.palette.grey[50], 0.6),
                                    minHeight: { xs: '48px', sm: '48px', md: '52px' },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '& fieldset': {
                                      borderColor: jobErrors.title
                                        ? alpha(theme.palette.error.main, 0.2)
                                        : alpha(theme.palette.divider, 0.1),
                                      borderWidth: '1px',
                                    },
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.grey[100], 0.8),
                                      '& fieldset': {
                                        borderColor: jobErrors.title
                                          ? alpha(theme.palette.error.main, 0.3)
                                          : alpha(theme.palette.primary.main, 0.15),
                                      },
                                    },
                                    '&.Mui-focused': {
                                      bgcolor: 'background.paper',
                                      boxShadow: jobErrors.title
                                        ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.08)}`
                                        : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.08)}`,
                                      '& fieldset': {
                                        borderColor: jobErrors.title
                                          ? theme.palette.error.main
                                          : theme.palette.primary.main,
                                        borderWidth: '1.5px',
                                      },
                                    },
                                    '&.Mui-error': {
                                      '& fieldset': {
                                        borderColor: theme.palette.error.main,
                                      },
                                    },
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                    fontWeight: 500,
                                  },
                                  '& .MuiInputBase-input': {
                                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                                    py: { xs: 1.25, sm: 1.375 },
                                    px: { xs: 1, sm: 1.25 },
                                    fontWeight: 500,
                                  }
                                }}
                              />
                          </Grid>

                          {/* Date Range - SaaS-Level Responsive Flex Layout - Optimized for Mobile */}
                          <Grid item xs={12}>
                            <Box 
                              sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 2, sm: 2, md: 2.5 },
                                alignItems: { xs: 'stretch', sm: 'flex-start' },
                                flexWrap: { xs: 'nowrap', sm: 'wrap' },
                                width: '100%',
                                boxSizing: 'border-box',
                              }}
                            >
                              {/* Start Date - Full Width on Mobile, Responsive */}
                              <Box sx={{ 
                                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 auto' }, 
                                minWidth: { xs: '100%', sm: 200, md: 220 },
                                width: { xs: '100%', sm: 'auto' },
                                maxWidth: { xs: '100%', sm: 'none' },
                              }}>
                                <DatePicker
                                  label="Start Date"
                                  value={job.startDate || null}
                                  onChange={(date) => onUpdateJob(index, 'startDate', date)}
                                  format="dd MMM yyyy"
                                  disableFuture
                                  reduceAnimations
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      error: !!jobErrors.startDate,
                                      helperText: jobErrors.startDate || 'Required',
                                      required: true,
                                      name: `job${index}_startDate`,
                                      id: `job${index}_startDate`,
                                      'aria-label': `Job ${index + 1} Start Date`,
                                      'aria-required': 'true',
                                      'aria-invalid': !!jobErrors.startDate,
                                      'aria-describedby': jobErrors.startDate ? `job${index}_startDate-helper-text` : undefined,
                                      size: 'small',
                                      InputProps: {
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            <DateRangeIcon 
                                              sx={{ 
                                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                                color: jobErrors.startDate ? 'error.main' : 'action.active' 
                                              }} 
                                            />
                                          </InputAdornment>
                                        ),
                                      },
                                      sx: {
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '12px',
                                          bgcolor: alpha(theme.palette.grey[50], 0.6),
                                          minHeight: { xs: '48px', sm: '48px', md: '52px' },
                                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                          '& fieldset': {
                                            borderColor: jobErrors.startDate
                                              ? alpha(theme.palette.error.main, 0.2)
                                              : alpha(theme.palette.divider, 0.1),
                                            borderWidth: '1px',
                                          },
                                          '&:hover': {
                                            bgcolor: alpha(theme.palette.grey[100], 0.8),
                                            '& fieldset': {
                                              borderColor: jobErrors.startDate
                                                ? alpha(theme.palette.error.main, 0.3)
                                                : alpha(theme.palette.primary.main, 0.15),
                                            },
                                          },
                                          '&.Mui-focused': {
                                            bgcolor: 'background.paper',
                                            boxShadow: jobErrors.startDate
                                              ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.08)}`
                                              : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.08)}`,
                                            '& fieldset': {
                                              borderColor: jobErrors.startDate
                                                ? theme.palette.error.main
                                                : theme.palette.primary.main,
                                              borderWidth: '1.5px',
                                            },
                                          },
                                        },
                                        '& .MuiFormHelperText-root': {
                                          id: `job${index}_startDate-helper-text`,
                                          m: { xs: 0.75, sm: 0.75 },
                                          mt: { xs: 0.5, sm: 0.75 },
                                          fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                          fontWeight: jobErrors.startDate ? 600 : 500,
                                          lineHeight: { xs: 1.4, sm: 1.5 },
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
                                      },
                                    },
                                  }}
                                />
                              </Box>

                              {/* End Date - Full Width on Mobile, Responsive */}
                              <Box sx={{ 
                                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 auto' }, 
                                minWidth: { xs: '100%', sm: 200, md: 220 },
                                width: { xs: '100%', sm: 'auto' },
                                maxWidth: { xs: '100%', sm: 'none' },
                              }}>
                                <DatePicker
                                  label="End Date"
                                  value={job.currentlyWorking ? null : job.endDate || null}
                                  onChange={(date) => onUpdateJob(index, 'endDate', date)}
                                  disabled={job.currentlyWorking}
                                  format="dd MMM yyyy"
                                  disableFuture
                                  minDate={job.startDate || undefined}
                                  reduceAnimations
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      error: !job.currentlyWorking && !!jobErrors.endDate,
                                      helperText: (!job.currentlyWorking && jobErrors.endDate) || (!job.currentlyWorking ? 'Required' : ''),
                                      required: !job.currentlyWorking,
                                      name: `job${index}_endDate`,
                                      id: `job${index}_endDate`,
                                      'aria-label': `Job ${index + 1} End Date`,
                                      'aria-required': !job.currentlyWorking ? 'true' : 'false',
                                      'aria-invalid': !job.currentlyWorking && !!jobErrors.endDate,
                                      'aria-disabled': job.currentlyWorking,
                                      'aria-describedby': (!job.currentlyWorking && jobErrors.endDate) ? `job${index}_endDate-helper-text` : undefined,
                                      size: 'small',
                                      InputProps: {
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            <DateRangeIcon 
                                              sx={{ 
                                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                                color: (!job.currentlyWorking && jobErrors.endDate) ? 'error.main' : 'action.active' 
                                              }} 
                                            />
                                          </InputAdornment>
                                        ),
                                      },
                                      sx: {
                                        width: '100%',
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '12px',
                                          bgcolor: alpha(theme.palette.grey[50], 0.6),
                                          minHeight: { xs: '48px', sm: '48px', md: '52px' },
                                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                          '& fieldset': {
                                            borderColor: (!job.currentlyWorking && jobErrors.endDate)
                                              ? alpha(theme.palette.error.main, 0.2)
                                              : alpha(theme.palette.divider, 0.1),
                                            borderWidth: '1px',
                                          },
                                          '&:hover': {
                                            bgcolor: alpha(theme.palette.grey[100], 0.8),
                                            '& fieldset': {
                                              borderColor: (!job.currentlyWorking && jobErrors.endDate)
                                                ? alpha(theme.palette.error.main, 0.3)
                                                : alpha(theme.palette.primary.main, 0.15),
                                            },
                                          },
                                          '&.Mui-focused': {
                                            bgcolor: 'background.paper',
                                            boxShadow: (!job.currentlyWorking && jobErrors.endDate)
                                              ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.08)}`
                                              : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.08)}`,
                                            '& fieldset': {
                                              borderColor: (!job.currentlyWorking && jobErrors.endDate)
                                                ? theme.palette.error.main
                                                : theme.palette.primary.main,
                                              borderWidth: '1.5px',
                                            },
                                          },
                                        },
                                        '& .MuiFormHelperText-root': {
                                          id: `job${index}_endDate-helper-text`,
                                          m: { xs: 0.75, sm: 0.75 },
                                          mt: { xs: 0.5, sm: 0.75 },
                                          fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                          fontWeight: (!job.currentlyWorking && jobErrors.endDate) ? 600 : 500,
                                          lineHeight: { xs: 1.4, sm: 1.5 },
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
                                      },
                                    },
                                  }}
                                />
                              </Box>

                              {/* Currently Working Checkbox - Full Width on Mobile, Optimized */}
                              <Box 
                                sx={{ 
                                  flex: { xs: '1 1 100%', sm: '0 0 auto' },
                                  display: 'flex',
                                  alignItems: { xs: 'flex-start', sm: 'center' },
                                  pt: { xs: 0.5, sm: 0 },
                                  width: { xs: '100%', sm: 'auto' },
                                  minHeight: { xs: '48px', sm: 'auto' },
                                  boxSizing: 'border-box',
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={job.currentlyWorking}
                                      onChange={(e) =>
                                        onUpdateJob(index, 'currentlyWorking', e.target.checked)
                                      }
                                      color="primary"
                                      sx={{
                                        '& .MuiSvgIcon-root': {
                                          fontSize: { xs: '1.5rem', sm: '1.5rem' }
                                        },
                                        '& .MuiTouchRipple-root': {
                                          color: theme.palette.primary.main,
                                        }
                                      }}
                                    />
                                  }
                                  label={
                                    <Typography
                                      sx={{
                                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                        fontWeight: 500,
                                        color: 'text.primary',
                                        lineHeight: { xs: 1.5, sm: 1.6 }
                                      }}
                                    >
                                      Currently working here
                                    </Typography>
                                  }
                                  sx={{ 
                                    m: 0,
                                    userSelect: 'none',
                                    width: { xs: '100%', sm: 'auto' },
                                    py: { xs: 0.5, sm: 0 },
                                    cursor: 'pointer',
                                  }}
                                />
                              </Box>
                            </Box>
                          </Grid>

                          {/* Description - Adaptive and Responsive, SaaS-Level Design */}
                          <Grid item xs={12} sx={{ width: '100%', boxSizing: 'border-box' }}>
                            <Box
                              sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: { xs: 0.75, sm: 1 },
                                maxWidth: '100%',
                                mx: 0,
                                px: 0,
                                boxSizing: 'border-box',
                              }}
                            >
                              {/* Character Counter with Visual Progress */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: { xs: 0.5, sm: 0.75 },
                                  px: { xs: 0.5, sm: 0.75 },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      color: 'text.secondary',
                                      fontWeight: 500,
                                    }}
                                  >
                                    Describe your responsibilities, achievements, and skills
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                        fontWeight: 600,
                                        color: (() => {
                                          const length = (job.description || '').length;
                                          if (length >= 500) return theme.palette.error.main;
                                          if (length >= 450) return theme.palette.warning.main;
                                          return 'text.secondary';
                                        })(),
                                        transition: 'color 0.2s ease-in-out',
                                      }}
                                    >
                                      {(job.description || '').length}/500
                                    </Typography>
                                    {(job.description || '').length >= 450 && (
                                      <Tooltip 
                                        title={(() => {
                                          const length = (job.description || '').length;
                                          if (length >= 500) return 'Character limit reached';
                                          return `${500 - length} characters remaining`;
                                        })()}
                                        arrow
                                      >
                                        <WarningIcon 
                                          sx={{ 
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            color: (job.description || '').length >= 500 
                                              ? theme.palette.error.main 
                                              : theme.palette.warning.main,
                                          }} 
                                        />
                                      </Tooltip>
                                    )}
                                  </Box>
                                </Box>
                                
                                {/* Progress Bar */}
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(((job.description || '').length / 500) * 100, 100)}
                                  sx={{
                                    height: { xs: 2, sm: 3 },
                                    borderRadius: 1,
                                    backgroundColor: 'action.hover',
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: (() => {
                                        const length = (job.description || '').length;
                                        if (length >= 500) return theme.palette.error.main;
                                        if (length >= 450) return theme.palette.warning.main;
                                        return theme.palette.primary.main;
                                      })(),
                                      transition: 'background-color 0.2s ease-in-out',
                                    },
                                  }}
                                />
                              </Box>

                              <TextField
                                fullWidth
                                label="Job Description"
                                placeholder="E.g., worked as a support worker in a nursing home, provided personal care and assistance to residents ..."
                                value={job.description || ''}
                                onChange={(e) => {
                                  const value = e.target.value.slice(0, 500);
                                  onUpdateJob(index, 'description', value);
                                }}
                                multiline
                                minRows={isMobile ? 3 : isTablet ? 2 : 2}
                                maxRows={isMobile ? 3 : isTablet ? 2 :2}
                                inputProps={{ 
                                  maxLength: 500,
                                  'aria-label': `Job ${index + 1} Description`,
                                  'aria-describedby': `job${index}_description-helper-text`,
                                }}
                                error={!!jobErrors.description}
                                helperText={jobErrors.description || ''}
                                FormHelperTextProps={{
                                  id: `job${index}_description-helper-text`,
                                  sx: { 
                                    m: { xs: 0.75, sm: 0.75 },
                                    mt: { xs: 0.5, sm: 0.75 },
                                    fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                                    fontWeight: jobErrors.description ? 600 : 500,
                                    minHeight: jobErrors.description ? 'auto' : '0',
                                    lineHeight: { xs: 1.4, sm: 1.5 },
                                  }
                                }}
                                name={`job${index}_description`}
                                id={`job${index}_description`}
                                aria-invalid={!!jobErrors.description}
                                size="small"
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment 
                                      position="start" 
                                      sx={{ 
                                        alignSelf: 'flex-start', 
                                        mt: { xs: 1.75, sm: 1.75 },
                                        ml: { xs: 0.5, sm: 0.75 },
                                        color: jobErrors.description ? theme.palette.error.main : 'action.active',
                                        transition: 'color 0.2s ease-in-out',
                                      }}
                                    >
                                      <DescriptionIcon sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{
                                  width: '100%',
                                  maxWidth: '100%',
                                  boxSizing: 'border-box',
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '12px',
                                    width: '100%',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    backgroundColor: alpha(theme.palette.grey[50], 0.6),
                                    minHeight: { xs: '140px', sm: '160px' },
                                    '& fieldset': {
                                      borderColor: jobErrors.description
                                        ? alpha(theme.palette.error.main, 0.2)
                                        : alpha(theme.palette.divider, 0.1),
                                      borderWidth: '1px',
                                    },
                                    '& textarea': {
                                      resize: 'vertical',
                                      width: '100% !important',
                                      maxWidth: '100% !important',
                                      boxSizing: 'border-box',
                                      padding: { 
                                        xs: '12px 8px', 
                                        sm: '14px 10px'
                                      },
                                      fontSize: { xs: '0.9375rem', sm: '1rem' },
                                      lineHeight: { xs: 1.6, sm: 1.65 },
                                      fontFamily: 'inherit',
                                      minHeight: { xs: '120px', sm: '140px' },
                                      fontWeight: 400,
                                      '&::placeholder': {
                                        opacity: 0.5,
                                        fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                      },
                                    },
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.grey[100], 0.8),
                                      '& fieldset': {
                                        borderColor: jobErrors.description 
                                          ? alpha(theme.palette.error.main, 0.3)
                                          : alpha(theme.palette.primary.main, 0.15),
                                      },
                                    },
                                    '&.Mui-focused': {
                                      bgcolor: 'background.paper',
                                      boxShadow: jobErrors.description
                                        ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.08)}`
                                        : `0 0 0 2px ${alpha(theme.palette.primary.main, 0.08)}`,
                                      '& fieldset': {
                                        borderColor: jobErrors.description 
                                          ? theme.palette.error.main 
                                          : theme.palette.primary.main,
                                        borderWidth: '1.5px',
                                      },
                                    },
                                    '&.Mui-error': {
                                      '& fieldset': {
                                        borderColor: theme.palette.error.main,
                                      },
                                    },
                                  },
                                  '& .MuiInputBase-root': {
                                    alignItems: 'flex-start',
                                    width: '100%',
                                    padding: 0,
                                  },
                                  '& .MuiInputLabel-root': {
                                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                                    fontWeight: 600,
                                    transform: 'translate(14px, 18px) scale(1)',
                                    '&.MuiInputLabel-shrink': {
                                      transform: 'translate(14px, -9px) scale(0.75)',
                                    },
                                    [theme.breakpoints.down('sm')]: {
                                      transform: 'translate(12px, 16px) scale(1)',
                                      '&.MuiInputLabel-shrink': {
                                        transform: 'translate(12px, -9px) scale(0.75)',
                                      },
                                    },
                                  },
                                  '& .MuiInputLabel-root.Mui-focused': {
                                    color: jobErrors.description 
                                      ? theme.palette.error.main 
                                      : theme.palette.primary.main,
                                  },
                                  '& .MuiFormHelperText-root': {
                                    display: jobErrors.description ? 'block' : 'none',
                                  },
                                }}
                              />
                            </Box>
                          </Grid>

                          {/* Actions - Responsive Layout */}
                          <Grid item xs={12}>
                            <Box 
                              display="flex" 
                              justifyContent="space-between" 
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              gap={{ xs: 1.5, sm: 2 }}
                              flexWrap="wrap"
                              flexDirection={{ xs: 'column', sm: 'row' }}
                              sx={{ width: '100%' }}
                            >
                              {/* Only show remove button for additional jobs (not the first mandatory one) */}
                              {!isFirstJob && (
                                <SecondaryButton
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleRemoveWithConfirmation(index)}
                                  size="small"
                                  fullWidth={isMobile}
                                  sx={{ 
                                    borderRadius: 1.5,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    px: { xs: 2, sm: 2 },
                                    py: { xs: 0.875, sm: 0.75 },
                                    minHeight: { xs: '44px', sm: 'auto' },
                                    width: { xs: '100%', sm: 'auto' },
                                  }}
                                >
                                  Remove Experience
                                </SecondaryButton>
                              )}
                              {hasJobErrors && (
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: { xs: 0.75, sm: 1 },
                                  flexWrap: 'wrap',
                                  width: { xs: '100%', sm: 'auto' },
                                }}>
                                  <Chip
                                    icon={<WarningIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                                    label={`${Object.keys(jobErrors).length} error${Object.keys(jobErrors).length > 1 ? 's' : ''} to fix`}
                                    color="error"
                                    size="small"
                                    sx={{ 
                                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                      fontWeight: 600,
                                      height: { xs: 24, sm: 28 },
                                    }}
                                  />
                                  {isFirstJob && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'error.main',
                                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                        fontWeight: 600,
                                        display: { xs: 'block', sm: 'block' },
                                        width: { xs: '100%', sm: 'auto' },
                                      }}
                                    >
                                      Please fix errors to continue
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </ExperienceCard>
                </Fade>
              );
            }) : (
              // SaaS-Level Best Practice: Show nothing if no jobs exist
              // Component will auto-create first mandatory job via useEffect
              // This ensures clean UI - no empty states, no multiple cards initially
              null
            )}

          {/* Add Experience Button - Compact SaaS-Level Design */}
          <Box sx={{
            pt: { xs: 1.5, sm: 2 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AddIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              onClick={() => {
                onAddJob();
              }}
              sx={{ 
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: '100%', sm: 200, md: 220 },
                height: { xs: 48, sm: 50, md: 52 },
                borderStyle: 'dashed',
                borderWidth: '1.5px',
                borderColor: alpha(theme.palette.primary.main, 0.3),
                borderRadius: '12px',
                py: { xs: 1, sm: 1.25 },
                px: { xs: 2.5, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderStyle: 'solid',
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              Add Another Experience
            </Button>
          </Box>
        </Stack>
      </SectionContainer>
    </LocalizationProvider>
  );
};

export default React.memo(OnboardingJobExperience);
