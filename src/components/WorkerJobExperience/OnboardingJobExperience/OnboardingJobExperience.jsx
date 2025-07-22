import React from 'react';
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
  InputAdornment,
  LinearProgress,
} from '@mui/material';
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

// Styled components
const SectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 0),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  '& .MuiTypography-h4': {
    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
    gap: theme.spacing(1),
  },
}));

const HeaderIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 56,
  height: 56,
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.primary.light + '20',
  color: theme.palette.primary.main,
  flexShrink: 0,
}));

const ExperienceCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isExpanded' && prop !== 'hasErrors',
})(({ theme, isExpanded, hasErrors }) => ({
  width: '100%',
  margin: '0 auto',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: isExpanded ? theme.shadows[4] : theme.shadows[1],
  transition: 'all 0.3s ease',
  border: `1px solid ${hasErrors ? theme.palette.error.light : theme.palette.divider}`,
  overflow: 'hidden',
  background: `linear-gradient(90deg, ${theme.palette.background.paper} 80%, ${theme.palette.primary.light}10 100%)`,
  borderLeft: `6px solid ${theme.palette.primary.main}`,
  padding: theme.spacing(2, 3),
  '&:hover': {
    boxShadow: isExpanded ? theme.shadows[6] : theme.shadows[3],
    transform: 'translateY(-2px)',
  },
}));

const CardHeaderStyled = styled(CardHeader)(({ theme }) => ({
  // backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  cursor: 'pointer',
  '& .MuiCardHeader-content': {
    overflow: 'hidden',
  },
  '& .MuiCardHeader-title': {
    fontWeight: 600,
    fontSize: '1rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.text.primary,
  },
  '& .MuiCardHeader-subheader': {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
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

  const formatDateRange = (startDate, endDate, currentlyWorking) => {
    if (!startDate) return '';
    const start = new Date(startDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
    });
    if (currentlyWorking) return `${start} - Present`;
    if (!endDate) return start;
    const end = new Date(endDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
    });
    return `${start} - ${end}`;
  };

  // Calculate validation states
  const hasAnyErrors = Object.keys(formErrors).some((key) => key.startsWith('job'));
  const isValid = jobs.length > 0 && !hasAnyErrors;
  const errorCount = Object.keys(formErrors).filter(key => key.startsWith('job')).length;

  const handleRemoveWithConfirmation = (index) => {
    onRemoveJob(index);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <SectionContainer>
        {/* Section Header */}
        <SectionHeader>
          <HeaderIcon>
            <WorkIcon fontSize="medium" />
          </HeaderIcon>
          <Box>
            <Typography variant="h4" component="h2">
              Work Experience
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Showcase your professional journey and skills
            </Typography>
    
          </Box>
        </SectionHeader>

        {/* Form-wide Errors */}
        {formErrors.jobs && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography fontWeight={600}>{formErrors.jobs}</Typography>
            </Alert>
          </Fade>
        )}

        {/* Empty State */}
        {jobs.length === 0 ? (
          <Fade in>
            <EmptyState elevation={0}>
              <WorkIcon />
              <Typography variant="h6" gutterBottom>
                No work experience added
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Add your professional experiences to showcase your career journey.
              </Typography>
              <PrimaryButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onAddJob}
                sx={{ mt: 1 }}
              >
                Add First Experience
              </PrimaryButton>
            </EmptyState>
          </Fade>
        ) : (
          <Stack spacing={3} sx={{ width: '100%', flexGrow: 1, alignItems: 'center' }}>
            {/* Add Another Button (moved to top) */}
            <SecondaryButton
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddJob}
              sx={{ width: '100%', borderStyle: 'dashed', mb: { xs: 2, md: 0 } }}
            >
              Add Experience
            </SecondaryButton>
            {/* Experience List */}
            {jobs.map((job, index) => {
              const jobErrors = Object.keys(formErrors)
                .filter((key) => key.startsWith(`job${index}_`))
                .reduce((acc, key) => {
                  acc[key.replace(`job${index}_`, '')] = formErrors[key];
                  return acc;
                }, {});

              const hasJobErrors = Object.keys(jobErrors).length > 0;

              return (
                <Fade in key={index} timeout={300 + index * 100}>
                  <ExperienceCard 
                    isExpanded={expandedJob === index}
                    hasErrors={hasJobErrors}
                    sx={{ width: '100%', maxWidth: 900, mb: { xs: 2, md: 0 }, p: { xs: 1, sm: 2, md: 3 } }} // Wider, more padding
                  >
                    <CardHeaderStyled
                      title={job.company || 'New Experience'}
                      subheader={job.title}
                      avatar={
                        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                          <BusinessIcon sx={{ color: theme.palette.primary.main }} />
                        </Avatar>
                      }
                      action={
                        <Box display="flex" alignItems="center">
                          {job.startDate && (
                            <DateRangeChip
                              label={formatDateRange(
                                job.startDate,
                                job.endDate,
                                job.currentlyWorking
                              )}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                          )}
                          <ExpandButton
                            aria-label="show more"
                            isExpanded={expandedJob === index}
                            onClick={() => onToggleExpandJob(index)}
                          >
                            <ExpandMoreIcon />
                          </ExpandButton>
                        </Box>
                      }
                      onClick={() => onToggleExpandJob(index)}
                    />
                    
                    {/* Error indicator bar */}
                    {hasJobErrors && (
                      <LinearProgress 
                        color="error" 
                        variant="determinate" 
                        value={100} 
                        sx={{ height: 2 }}
                      />
                    )}

                    <Collapse in={expandedJob === index} timeout="auto" unmountOnExit>
                      <Divider />
                      <CardContent sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                          {/* Company Name */}
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Company Name"
                              value={job.company}
                              onChange={(e) =>
                                onUpdateJob(index, 'company', e.target.value)
                              }
                              error={!!jobErrors.company}
                              helperText={jobErrors.company}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <BusinessIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                             />
                          </Grid>

                          {/* Job Title */}
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Job Title"
                              value={job.title}
                              onChange={(e) =>
                                onUpdateJob(index, 'title', e.target.value)
                              }
                              error={!!jobErrors.title}
                              helperText={jobErrors.title}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <TitleIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          {/* Date Range */}
                          <Grid item xs={12}>
                            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                              <DatePicker
                                label="Start Date"
                                value={job.startDate || null}
                                onChange={(date) =>
                                  onUpdateJob(index, 'startDate', date)
                                }
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    error: !!jobErrors.startDate,
                                    helperText: jobErrors.startDate,
                                    required: true,
                                    InputProps: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <DateRangeIcon color="action" />
                                        </InputAdornment>
                                      ),
                                    },
                                  },
                                }}
                                sx={{ flex: 1, minWidth: 180 }}
                              />
                              <DatePicker
                                label="End Date"
                                value={job.currentlyWorking ? null : job.endDate || null}
                                onChange={(date) =>
                                  onUpdateJob(index, 'endDate', date)
                                }
                                disabled={job.currentlyWorking}
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    error: !!jobErrors.endDate,
                                    helperText: jobErrors.endDate,
                                    required: !job.currentlyWorking,
                                    InputProps: {
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <DateRangeIcon color="action" />
                                        </InputAdornment>
                                      ),
                                    },
                                  },
                                }}
                                sx={{ flex: 1, minWidth: 180 }}
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={job.currentlyWorking}
                                    onChange={(e) =>
                                      onUpdateJob(
                                        index,
                                        'currentlyWorking',
                                        e.target.checked
                                      )
                                    }
                                    color="primary"
                                  />
                                }
                                label="Currently working here"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          </Grid>

                          {/* Description */}
                  <Grid item xs={12} md={12} width={'100%'}>
                            <Box sx={{
                              background: (theme) => theme.palette.background.default,
                              border: (theme) => `1px solid ${theme.palette.divider}`,
                              borderRadius: 2,
                              p: 2,
                              mb: 2,
                              boxShadow: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              
                              m: 0, // Remove margin
                            }}>
                              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DescriptionIcon color="primary" fontSize="small" /> Job Description
                              </Typography>
                              <TextField
                                fullWidth
                                label="Describe your responsibilities, achievements, and skills..."
                                value={job.description || ''}
                                onChange={(e) =>
                                  onUpdateJob(index, 'description', e.target.value)
                                }
                                multiline
                                minRows={3}
                                maxRows={6}
                                inputProps={{ maxLength: 500 }}
                                helperText={
                                  jobErrors.description ? 
                                  `${jobErrors.description}\n${(job.description || '').length}/500 characters` : 
                                  `${(job.description || '').length}/500 characters`
                                }
                                FormHelperTextProps={{
                                  sx: { whiteSpace: 'pre-line' }
                                }}
                                InputProps={{
                                  sx: { background: 'transparent', width: '100%' },
                                }}
                                error={!!jobErrors.description}
                                sx={{ width: '100%' }}
                              />
                              {/* Actions - moved directly below description */}
                              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                <SecondaryButton
                                  color="error"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleRemoveWithConfirmation(index)}
                                >
                                  Remove Experience
                                </SecondaryButton>
                                {expandedJob === index && (
                                  <PrimaryButton
                                    variant="contained"
                                    onClick={() => {
                                      onToggleExpandJob(index);
                                    }}
                                  >
                                    Save
                                  </PrimaryButton>
                                )}
                              </Box>
                            </Box>
                          </Grid>

                          {/* Actions - moved below description, full width */}
                          <Grid item xs={12}>
                            {/* (Removed old button location) */}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Collapse>
                  </ExperienceCard>
                </Fade>
              );
            })}

            {/* Validation Summary */}

          </Stack>
        )}
      </SectionContainer>
    </LocalizationProvider>
  );
};

export default React.memo(OnboardingJobExperience);