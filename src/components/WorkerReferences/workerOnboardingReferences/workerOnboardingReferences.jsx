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
  alpha
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
  ErrorOutline as ErrorIcon
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

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ mx: 'auto' }}>
        {/* Header Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            height:{md: '100px', xs: 'auto'}
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                mr: 2, 
                width: 34, 
                height: 34 
              }}
            >
              <AccountBoxIcon />
            </Avatar>
            <Box sx={{ flex: 1}}>
              <Typography variant="h5" component="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Professional References
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Provide 2 professional references to complete your profile verification
              </Typography>
            </Box>
            <Chip
              label={`${complete}/${total} Complete`}
              color={allComplete ? 'success' : 'default'}
              variant={allComplete ? 'filled' : 'outlined'}
              size="large"
              icon={allComplete ? <CheckCircleIcon /> : <InfoIcon />}
            />
          </Box>
        </Paper>

        {/* Requirements Alert */}
        <Alert 
          severity="info" 
          icon={<InfoIcon />} 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            '& .MuiAlert-icon': { fontSize: '1.5rem' }
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
            Reference Requirements & Verification Process
          </AlertTitle>
          <Typography variant="body2" component="div" sx={{ lineHeight: 1.6 }}>
            • Provide exactly <strong>2 professional references</strong> (former supervisors, managers, or colleagues)<br/>
            • All fields are required for each reference<br/>
            • References will be contacted within 24-48 hours for verification<br/>
            • Your profile will be activated once both references are verified
          </Typography>
        </Alert>

        {/* Form Errors */}
        {formErrors?.refLimit && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} icon={<ErrorIcon />}>
            <AlertTitle>Error</AlertTitle>
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
            return (
              <Grid item xs={12} md={6} key={index}>
                <Fade in timeout={400 + index * 150}>
                  <Card
                    elevation={isExpanded ? 8 : 2}
                    sx={{
                      borderRadius: 3,
                      border: `2px solid ${
                        hasErrors ? theme.palette.error.main :
                        isComplete ? theme.palette.success.main : 
                        alpha(theme.palette.primary.main, 0.2)
                      }`,
                      background: isComplete
                        ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.light, 0.1)} 100%)`
                        : hasErrors
                        ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.05)} 0%, ${alpha(theme.palette.error.light, 0.1)} 100%)`
                        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      minHeight: isExpanded ? 'auto' : 120,
                      '&:hover': {
                        boxShadow: theme.shadows[12],
                        transform: 'translateY(-2px)',
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
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                      }}
                      onClick={() => onToggleExpandReference(index)}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: hasErrors ? 'error.main' : isComplete ? 'success.main' : 'primary.main',
                          mr: 2,
                          transition: 'all 0.3s'
                        }}
                      >
                        {hasErrors ? <ErrorIcon /> : isComplete ? <CheckCircleIcon /> : <PersonIcon />}
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
                            />
                          )}
                          {hasErrors && !isComplete && (
                            <Chip 
                              label="Errors" 
                              size="small" 
                              color="error" 
                              variant="outlined"
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
                      <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
                        <IconButton size="small">
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
                              sx={{ '& .MuiFormHelperText-root': { minHeight: '1.25rem' } }}
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
                              sx={{ '& .MuiFormHelperText-root': { minHeight: '1.25rem' } }}
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
                              sx={{ '& .MuiFormHelperText-root': { minHeight: '1.25rem' } }}
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
                              sx={{ '& .MuiFormHelperText-root': { minHeight: '1.25rem' } }}
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
                              sx={{ '& .MuiFormHelperText-root': { minHeight: '1.25rem' } }}
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
                            sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
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
