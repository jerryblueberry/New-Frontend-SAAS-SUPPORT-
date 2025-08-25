import React from 'react';
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
  LinearProgress,
  Stack,
  Divider,
  Paper,
  Fade,
  Tooltip,
  useTheme,
  alpha,
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
  PriorityHigh as PriorityHighIcon,
  Shield as ShieldIcon,
  Verified as VerifiedIcon,
  ContactPhone as ContactPhoneIcon,
} from '@mui/icons-material';

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
  
  // Always show two references (fill with empty objects if needed)
  const filledReferences = [0, 1].map(i => 
    references[i] || { name: '', position: '', company: '', phone: '', email: '' }
  );
  
  const allComplete = filledReferences.every(ref => 
    ref.name && ref.position && ref.company && ref.phone && ref.email
  );
  
  const complete = filledReferences.filter(ref => 
    ref.name && ref.position && ref.company && ref.phone && ref.email
  ).length;
  
  const progressPercentage = (complete / maxReferences) * 100;

  // Enhanced status calculation
  const getStatus = (ref) => {
    const hasErrors = ['name', 'position', 'company', 'phone', 'email'].some(field => 
      formErrors?.[`ref${filledReferences.indexOf(ref)}_${field}`]
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
      {/* Header Section */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <ContactPhoneIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
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
              fontSize: '0.7rem',
              ml: 1,
            }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
          Provide 2 professional references who can verify your work experience.
        </Typography>
        
       
      </Box>

      {/* Status Alert */}
      <Alert 
        severity={allComplete ? "success" : "info"}
        sx={{ 
          mb: 2,
          borderRadius: 1.5,
          border: 'none',
          '& .MuiAlert-icon': { 
            fontSize: '1.2rem' 
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
          {allComplete ? 'References Complete' : 'Complete Your References'}
        </AlertTitle>
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          {allComplete ? (
            'Both references are ready for verification. We\'ll contact them within 24-48 hours.'
          ) : (
            'All fields are required. We\'ll verify references before activating your profile.'
          )}
        </Typography>
      </Alert>

      {/* Form Errors */}
      {formErrors?.refLimit && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
          <AlertTitle sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Error</AlertTitle>
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            {formErrors.refLimit}
          </Typography>
        </Alert>
      )}

      {/* References List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Stack spacing={2}>
          {filledReferences.map((ref, index) => {
            const isExpanded = expandedReference === index;
            const status = getStatus(ref);
            const statusConfig = getStatusConfig(status);
            
            return (
              <Card
                key={index}
                elevation={0}
                sx={{
                  border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
                  borderRadius: 1.5,
                  bgcolor: statusConfig.bgColor,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: alpha(statusConfig.color, 0.4),
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {/* Card Header */}
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderRadius: 1.5,
                  }}
                  onClick={() => onToggleExpandReference(index)}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: statusConfig.color,
                      mr: 2,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {statusConfig.icon}
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                        {ref.name || `Reference ${index + 1}`}
                      </Typography>
                      <Chip 
                        label={statusConfig.label}
                        size="small" 
                        color={statusConfig.chipColor}
                        variant="outlined"
                        sx={{ 
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }} noWrap>
                      {ref.position && ref.company 
                        ? `${ref.position} at ${ref.company}`
                        : ref.position || ref.company || 'Click to add details'
                      }
                    </Typography>
                    
                    {ref.phone && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {ref.phone}
                      </Typography>
                    )}
                  </Box>
                  
                  <IconButton 
                    size="small"
                    sx={{
                      bgcolor: alpha(statusConfig.color, 0.1),
                      '&:hover': {
                        bgcolor: alpha(statusConfig.color, 0.2),
                      },
                    }}
                  >
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Box>
                
                {/* Expandable Content */}
                <Collapse in={isExpanded} timeout={300}>
                  <Divider sx={{ borderColor: alpha(statusConfig.color, 0.1) }} />
                  <CardContent sx={{ p: 3, pt: 3 }}>
                    <Grid container spacing={2}>
                      {/* Full Name */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Full Name"
                          size="small"
                          value={ref.name || ''}
                          onChange={e => onUpdateReference(index, 'name', e.target.value)}
                          placeholder="Enter full name"
                          error={!!formErrors?.[`ref${index}_name`]}
                          helperText={formErrors?.[`ref${index}_name`]}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            }
                          }}
                        />
                      </Grid>
                      
                      {/* Position */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Job Title"
                          size="small"
                          value={ref.position || ''}
                          onChange={e => onUpdateReference(index, 'position', e.target.value)}
                          placeholder="e.g. Senior Manager"
                          error={!!formErrors?.[`ref${index}_position`]}
                          helperText={formErrors?.[`ref${index}_position`]}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <WorkIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            }
                          }}
                        />
                      </Grid>
                      
                      {/* Company */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          size="small"
                          value={ref.company || ''}
                          onChange={e => onUpdateReference(index, 'company', e.target.value)}
                          placeholder="Enter company name"
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BusinessIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            }
                          }}
                        />
                      </Grid>
                      
                      {/* Phone */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone"
                          size="small"
                          value={formatAustralianPhone(ref.phone || '')}
                          onChange={e => {
                            let raw = e.target.value.replace(/[^\d ]/g, '');
                            const formatted = formatAustralianPhone(raw);
                            onUpdateReference(index, 'phone', formatted);
                          }}
                          placeholder="0412 345 678"
                          error={!!formErrors?.[`ref${index}_phone`]}
                          helperText={formErrors?.[`ref${index}_phone`] || 'Format: 0412 345 678'}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PhoneIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            }
                          }}
                        />
                      </Grid>
                      
                      {/* Email */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email Address"
                          size="small"
                          type="email"
                          value={ref.email || ''}
                          onChange={e => onUpdateReference(index, 'email', e.target.value)}
                          placeholder="reference@company.com"
                          error={!!formErrors?.[`ref${index}_email`]}
                          helperText={formErrors?.[`ref${index}_email`] || 'We\'ll contact them at this email'}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <EmailIcon sx={{ fontSize: '1.1rem' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                    
                    {/* Actions */}
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                        💡 Choose someone who knows your work well
                      </Typography>
                      
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => onRemoveReference(index)}
                        startIcon={<ClearIcon />}
                        sx={{ 
                          borderRadius: 1,
                          fontSize: '0.8rem',
                          px: 2,
                        }}
                      >
                        Clear
                      </Button>
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
            );
          })}
        </Stack>
      </Box>

      {/* Completion Summary */}
      {allComplete && (
        <Box 
          sx={{ 
            mt: 3,
            p: 2,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            borderRadius: 1.5,
            textAlign: 'center',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
            <VerifiedIcon sx={{ color: 'success.main', fontSize: '1.2rem' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
              References Complete!
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Ready for verification within 24-48 hours
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(WorkerOnboardingReferences);