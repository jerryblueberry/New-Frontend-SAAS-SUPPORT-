import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Paper,
  Box,
  Typography,
  Chip,
  Alert,
  AlertTitle,
  Grid,
  Card,
  CardContent,
  Collapse,
  Divider,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Tooltip,
  Fade,
  useTheme,
  alpha,
  LinearProgress,
  Badge
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Work as WorkIcon,
  AccountBox as AccountBoxIcon,
  ErrorOutline as ErrorIcon,
  PriorityHigh as PriorityHighIcon
} from '@mui/icons-material';

const WorkerOnboardingReferences = ({
  references,
  formErrors,
  expandedReference,
  onAddReference, // not used anymore
  onRemoveReference, // still used for clearing
  onUpdateReference,
  onToggleExpandReference,
  formatAustralianPhone,
  maxReferences = 2,
}) => {
  const theme = useTheme();
  // Always show two references (fill with empty objects if needed)
  const filledReferences = [0, 1].map(i => references[i] || { name: '', position: '', company: '', phone: '', email: '' });
  const allComplete = filledReferences.every(ref => ref.name && ref.position && ref.company && ref.phone && ref.email);
  const complete = filledReferences.filter(ref => ref.name && ref.position && ref.company && ref.phone && ref.email).length;
  const total = maxReferences;
  const progressPercentage = (complete / total) * 100;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mx: 'auto' }}>
        {/* Enhanced Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            borderRadius: 4,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Badge
              badgeContent={complete}
              max={total}
              color={allComplete ? 'success' : 'warning'}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  minWidth: '24px',
                  height: '24px',
                }
              }}
            >
              <Avatar 
                sx={{ 
                  bgcolor: allComplete ? 'success.main' : 'primary.main', 
                  mr: 2, 
                  width: 40, 
                  height: 40,
                  boxShadow: theme.shadows[4],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <AccountBoxIcon />
              </Avatar>
            </Badge>
            <Box sx={{ flex: 1}}>
              <Typography variant="h5" component="h4" sx={{ 
                fontWeight: 700, 
                mb: 0.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Professional References
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Provide 2 professional references to complete your profile verification
              </Typography>
              {/* Progress Bar */}
              <Box sx={{ width: '100%', mb: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={progressPercentage}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.grey[300], 0.5),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: allComplete 
                        ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                        : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }
                  }}
                />
              </Box>
            </Box>
            <Chip
              label={`${complete}/${total} Complete`}
              color={allComplete ? 'success' : 'warning'}
              variant={allComplete ? 'filled' : 'outlined'}
              size="large"
              icon={allComplete ? <CheckCircleIcon /> : <PriorityHighIcon />}
              sx={{
                fontWeight: 600,
                fontSize: '0.9rem',
                px: 2,
                py: 1,
                boxShadow: allComplete ? theme.shadows[2] : 'none',
              }}
            />
          </Box>
        </Paper>

        {/* Enhanced Requirements Alert */}
        <Alert 
          severity={allComplete ? "success" : "warning"}
          icon={allComplete ? <CheckCircleIcon /> : <PriorityHighIcon />} 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            border: `2px solid ${allComplete ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.warning.main, 0.3)}`,
            background: allComplete 
              ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.success.light, 0.12)} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.warning.light, 0.12)} 100%)`,
            '& .MuiAlert-icon': { fontSize: '1.5rem' },
            boxShadow: theme.shadows[2],
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, mb: 1, color: allComplete ? 'success.dark' : 'warning.dark' }}>
            {allComplete ? 'All References Complete!' : 'Reference Requirements & Verification Process'}
          </AlertTitle>
          <Typography variant="body2" component="div" sx={{ lineHeight: 1.6 }}>
            {allComplete ? (
              '✅ Both references are complete and ready for verification. Your profile will be activated once verification is complete.'
            ) : (
              <>
                • Provide exactly <strong>2 professional references</strong> (former supervisors, managers, or colleagues)<br/>
                • All fields are <strong>mandatory</strong> for each reference<br/>
                • References will be contacted within 24-48 hours for verification<br/>
                • Your profile will be activated once both references are verified
              </>
            )}
          </Typography>
        </Alert>

        {/* Form Errors */}
        {formErrors?.refLimit && (
          <Alert severity="error" sx={{ 
            mb: 3, 
            borderRadius: 3,
            border: `2px solid ${alpha(theme.palette.error.main, 0.3)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.error.light, 0.12)} 100%)`,
            boxShadow: theme.shadows[2],
          }} icon={<ErrorIcon />}>
            <AlertTitle sx={{ fontWeight: 600 }}>Error</AlertTitle>
            {formErrors.refLimit}
          </Alert>
        )}

        {/* Always show two reference forms side by side */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
          {filledReferences.map((ref, index) => {
            const isExpanded = expandedReference === index;
            const hasErrors = [
              formErrors?.[`ref${index}_name`],
              formErrors?.[`ref${index}_position`],
              formErrors?.[`ref${index}_phone`],
              formErrors?.[`ref${index}_email`]
            ].some(Boolean);
            const isComplete = ref.name && ref.position && ref.company && ref.phone && ref.email;
            const isRequired = !isComplete && (ref.name || ref.position || ref.phone || ref.email); // Started but not complete
            
            return (
              <Grid item xs={12} md={6} key={index}>
                <Fade in timeout={400 + index * 150}>
                  <Card
                    elevation={isExpanded ? 12 : 4}
                    sx={{
                      borderRadius: 4,
                      border: `3px solid ${
                        hasErrors ? theme.palette.error.main :
                        isComplete ? theme.palette.success.main : 
                        isRequired ? theme.palette.warning.main :
                        alpha(theme.palette.primary.main, 0.2)
                      }`,
                      background: isComplete
                        ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.08)} 0%, ${alpha(theme.palette.success.light, 0.15)} 100%)`
                        : hasErrors
                        ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.error.light, 0.15)} 100%)`
                        : isRequired
                        ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.08)} 0%, ${alpha(theme.palette.warning.light, 0.15)} 100%)`
                        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: isExpanded ? 'auto' : 140,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: theme.shadows[16],
                        transform: 'translateY(-4px)',
                        borderColor: isComplete ? theme.palette.success.dark : 
                                    hasErrors ? theme.palette.error.dark :
                                    isRequired ? theme.palette.warning.dark :
                                    theme.palette.primary.main,
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: hasErrors 
                          ? `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.error.light})`
                          : isComplete
                          ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                          : isRequired
                          ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                          : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      }
                    }}
                  >
                    {/* Card Header */}
                    <Box
                      sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.primary.main, 0.03),
                          '& .MuiAvatar-root': {
                            transform: 'scale(1.1)',
                          }
                        },
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() => onToggleExpandReference(index)}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: hasErrors ? 'error.main' : isComplete ? 'success.main' : isRequired ? 'warning.main' : 'primary.main',
                          mr: 2,
                          transition: 'all 0.3s ease',
                          width: 44,
                          height: 44,
                          boxShadow: theme.shadows[3],
                        }}
                      >
                        {hasErrors ? <ErrorIcon /> : isComplete ? <CheckCircleIcon /> : isRequired ? <WarningIcon /> : <PersonIcon />}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
                            {ref.name || `Reference ${index + 1}`}
                          </Typography>
                          {isComplete && (
                            <Chip 
                              label="Complete" 
                              size="small" 
                              color="success" 
                              variant="filled"
                              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          )}
                          {hasErrors && !isComplete && (
                            <Chip 
                              label="Errors" 
                              size="small" 
                              color="error" 
                              variant="filled"
                              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          )}
                          {isRequired && !hasErrors && !isComplete && (
                            <Chip 
                              label="Incomplete" 
                              size="small" 
                              color="warning" 
                              variant="filled"
                              sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {ref.position && ref.company 
                            ? `${ref.position} at ${ref.company}`
                            : 'Click to add details'
                          }
                        </Typography>
                      </Box>
                      <Tooltip title={isExpanded ? 'Collapse' : 'Expand'} arrow>
                        <IconButton 
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                            }
                          }}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {/* Expandable Content */}
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Divider />
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2.5}>
                          {/* Full Name */}
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Full Name *"
                              value={ref.name}
                              onChange={e => onUpdateReference(index, 'name', e.target.value)}
                              placeholder="Enter reference's name"
                              error={!!formErrors?.[`ref${index}_name`]}
                              helperText={formErrors?.[`ref${index}_name`] || ' '}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon color={formErrors?.[`ref${index}_name`] ? 'error' : 'action'} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiFormHelperText-root': { minHeight: '1.25rem' },
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused': {
                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                  }
                                }
                              }}
                            />
                          </Grid>
                          {/* Email */}
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Email Address *"
                              type="email"
                              value={ref.email || ''}
                              onChange={e => onUpdateReference(index, 'email', e.target.value)}
                              placeholder="Enter email address"
                              error={!!formErrors?.[`ref${index}_email`]}
                              helperText={formErrors?.[`ref${index}_email`] || ' '}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailIcon color={formErrors?.[`ref${index}_email`] ? 'error' : 'action'} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiFormHelperText-root': { minHeight: '1.25rem' },
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused': {
                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                  }
                                }
                              }}
                            />
                          </Grid>
                          {/* Phone */}
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Phone Number *"
                              value={formatAustralianPhone(ref.phone || '')}
                              onChange={e => {
                                let raw = e.target.value.replace(/[^\d ]/g, '');
                                const formatted = formatAustralianPhone(raw);
                                onUpdateReference(index, 'phone', formatted);
                              }}
                              placeholder="412 345 678"
                              error={!!formErrors?.[`ref${index}_phone`]}
                              helperText={formErrors?.[`ref${index}_phone`] || 'Format: 0412 345 678'}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PhoneIcon color={formErrors?.[`ref${index}_phone`] ? 'error' : 'action'} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiFormHelperText-root': { minHeight: '1.25rem' },
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused': {
                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                  }
                                }
                              }}
                            />
                          </Grid>
                          {/* Position */}
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Position/Job Title *"
                              value={ref.position || ''}
                              onChange={e => onUpdateReference(index, 'position', e.target.value)}
                              placeholder="Reference's position"
                              error={!!formErrors?.[`ref${index}_position`]}
                              helperText={formErrors?.[`ref${index}_position`] || ' '}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <WorkIcon color={formErrors?.[`ref${index}_position`] ? 'error' : 'action'} />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiFormHelperText-root': { minHeight: '1.25rem' },
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused': {
                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                  }
                                }
                              }}
                            />
                          </Grid>
                          {/* Company */}
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Company Name"
                              value={ref.company || ''}
                              onChange={e => onUpdateReference(index, 'company', e.target.value)}
                              placeholder="Enter company name"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <BusinessIcon color="action" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiFormHelperText-root': { minHeight: '1.25rem' },
                                '& .MuiOutlinedInput-root': {
                                  '&.Mui-focused': {
                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                  }
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            type="button"
                            variant="outlined"
                            color="error"
                            onClick={() => onRemoveReference(index)}
                            startIcon={<WarningIcon />}
                            sx={{ 
                              borderRadius: 2, 
                              px: 3, 
                              fontWeight: 600,
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2,
                                transform: 'translateY(-1px)',
                                boxShadow: theme.shadows[4],
                              }
                            }}
                          >
                            Clear Reference
                          </Button>
                        </Box>
                      </CardContent>
                    </Collapse>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
};

WorkerOnboardingReferences.propTypes = {
  references: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      position: PropTypes.string,
      company: PropTypes.string,
      phone: PropTypes.string,
      email: PropTypes.string,
    })
  ).isRequired,
  formErrors: PropTypes.object,
  expandedReference: PropTypes.number,
  onAddReference: PropTypes.func.isRequired,
  onRemoveReference: PropTypes.func.isRequired,
  onUpdateReference: PropTypes.func.isRequired,
  onToggleExpandReference: PropTypes.func.isRequired,
  formatAustralianPhone: PropTypes.func.isRequired,
  maxReferences: PropTypes.number,
};

export default React.memo(WorkerOnboardingReferences);
