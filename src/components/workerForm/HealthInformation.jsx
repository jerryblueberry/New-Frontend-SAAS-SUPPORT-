import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  FormHelperText,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Stack,
  Tooltip,
  Fade,
  Slide,
  Grow,
  Zoom,
  useTheme,
  useMediaQuery,
  alpha,
  LinearProgress,
  CircularProgress,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Skeleton,
  Avatar,
  Badge
} from '@mui/material';
import {
  HealthAndSafety as HealthIcon,
  MedicalServices as MedicalIcon,
  Vaccines as VaccineIcon,
  FitnessCenter as FitnessIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Save as SaveIcon,
  VerifiedUser as VerifiedIcon,
  Accessibility as AccessibilityIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Help as HelpIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { motion, AnimatePresence } from 'framer-motion';
import useOnboardingStore, { useHealthInfoMutation } from '../../stores/useOnboardingStore';

// Custom styled components
const StyledCard = ({ children, ...props }) => (
  <Card
    component={motion.div}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    elevation={2}
    sx={{
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      '&:hover': {
        elevation: 4,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease-in-out'
      }
    }}
    {...props}
  >
    {children}
  </Card>
);

const StyledSection = ({ children, title, icon, ...props }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6 }}
    {...props}
  >
    <Stack direction="row" alignItems="center" spacing={2} mb={3}>
      <Avatar
        sx={{
          bgcolor: 'primary.main',
          width: 40,
          height: 40
        }}
      >
        {icon}
      </Avatar>
      <Typography variant="h5" component="h2" fontWeight="600">
        {title}
      </Typography>
    </Stack>
    {children}
  </Box>
);

const HealthInformation = ({ onComplete, onError }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Zustand store
  const healthInformation = useOnboardingStore((state) => state.healthInformation);
  const updateHealthInformation = useOnboardingStore((state) => state.updateHealthInformation);
  const addVaccination = useOnboardingStore((state) => state.addVaccination);
  const removeVaccination = useOnboardingStore((state) => state.removeVaccination);
  const prevStep = useOnboardingStore((state) => state.prevStep);
  const isLoading = useOnboardingStore((state) => state.isLoading);

  // Local state
  const [newVaccine, setNewVaccine] = useState({ 
    name: '', 
    vaccinated: false, 
    date: '' 
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [activeStep, setActiveStep] = useState(0);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [helpContent, setHelpContent] = useState({});

  // Mutation
  const { mutate: saveHealthInfo, isPending: isSaving } = useHealthInfoMutation();

  // Steps configuration
  const steps = [
    { label: 'Medical Conditions', icon: <MedicalIcon />, key: 'medical' },
    { label: 'Workers Compensation', icon: <WorkIcon />, key: 'compensation' },
    { label: 'Vaccinations', icon: <VaccineIcon />, key: 'vaccinations' },
    { label: 'Physical Abilities', icon: <FitnessIcon />, key: 'physical' },
    { label: 'Health Clearance', icon: <SecurityIcon />, key: 'clearance' }
  ];

  // Initialize form with default values
  useEffect(() => {
    if (!healthInformation) {
      updateHealthInformation({
        hasWorkersCompensation: false,
        workersCompensationDetails: '',
        hasMedicalConditions: false,
        medicalConditionsDescription: '',
        conditionsAffectingWork: '',
        covidVaccinated: false,
        fluVaccinated: false,
        otherVaccinations: [],
        hasHealthClearance: false,
        healthClearanceDate: null,
        clearanceNotes: '',
        canLiftPatients: true,
        requiresSpecialAccommodation: false,
      });
    }
  }, [healthInformation, updateHealthInformation]);

  // Handle form field changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    updateHealthInformation({ [name]: newValue });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, [updateHealthInformation, formErrors]);

  // Handle vaccine form changes
  const handleVaccineChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNewVaccine(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Add new vaccination
  const handleAddVaccine = useCallback(() => {
    const trimmedName = newVaccine.name.trim();
    
    if (!trimmedName) {
      toast.error('Please enter a vaccine name');
      return;
    }

    const isDuplicate = healthInformation.otherVaccinations?.some(
      vax => vax.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      toast.error('This vaccination has already been added');
      return;
    }

    const vaccinationData = {
      name: trimmedName,
      vaccinated: newVaccine.vaccinated,
      ...(newVaccine.vaccinated && newVaccine.date && { date: newVaccine.date })
    };

    addVaccination(vaccinationData);
    setNewVaccine({ name: '', vaccinated: false, date: '' });
    toast.success('Vaccination added successfully');
  }, [newVaccine, healthInformation?.otherVaccinations, addVaccination]);

  // Remove vaccination
  const handleRemoveVaccination = useCallback((index, vaccineName) => {
    removeVaccination(index);
    toast.success(`${vaccineName} removed successfully`);
  }, [removeVaccination]);

  // Form validation
  const validateForm = useCallback(() => {
    const errors = {};
    const healthInfo = healthInformation;

    // Required boolean fields validation
    const requiredBooleanFields = [
      'hasWorkersCompensation',
      'hasMedicalConditions',
      'covidVaccinated',
      'fluVaccinated',
      'hasHealthClearance',
      'canLiftPatients',
      'requiresSpecialAccommodation'
    ];

    requiredBooleanFields.forEach(field => {
      if (healthInfo[field] === null || healthInfo[field] === undefined) {
        errors[field] = 'This field is required';
      }
    });

    // Conditional validation
    if (healthInfo.hasMedicalConditions === true && 
        (!healthInfo.medicalConditionsDescription || 
         !healthInfo.medicalConditionsDescription.trim())) {
      errors.medicalConditionsDescription = 'Please describe your medical conditions';
    }

    if (healthInfo.hasWorkersCompensation === true && 
        (!healthInfo.workersCompensationDetails || 
         !healthInfo.workersCompensationDetails.trim())) {
      errors.workersCompensationDetails = 'Please provide workers compensation details';
    }

    if (healthInfo.requiresSpecialAccommodation === true && 
        (!healthInfo.conditionsAffectingWork || 
         !healthInfo.conditionsAffectingWork.trim())) {
      errors.conditionsAffectingWork = 'Please describe the accommodations needed';
    }

    if (healthInfo.hasHealthClearance === true && !healthInfo.healthClearanceDate) {
      errors.healthClearanceDate = 'Please provide the clearance date';
    }

    return errors;
  }, [healthInformation]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.focus();
      }
      toast.error('Please fix the errors before submitting');
      return;
    }

    // Create payload with proper structure
    const dataToSend = {
      ...healthInformation,
      hasWorkersCompensation: healthInformation.hasWorkersCompensation ?? false,
      hasMedicalConditions: healthInformation.hasMedicalConditions ?? false,
      covidVaccinated: healthInformation.covidVaccinated ?? false,
      fluVaccinated: healthInformation.fluVaccinated ?? false,
      hasHealthClearance: healthInformation.hasHealthClearance ?? false,
      canLiftPatients: healthInformation.canLiftPatients ?? true,
      requiresSpecialAccommodation: healthInformation.requiresSpecialAccommodation ?? false,
    };

    saveHealthInfo(dataToSend, {
      onSuccess: () => {
        toast.success('Health information saved successfully!');
        onComplete?.();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to save health information');
        onError?.(error.message);
      }
    });
  }, [validateForm, healthInformation, saveHealthInfo, onComplete, onError]);

  // Navigation handlers
  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep((prev) => Math.max(prev - 1, 0));

  // Help dialog handlers
  const showHelp = (content) => {
    setHelpContent(content);
    setShowHelpDialog(true);
  };

  // Render field error
  const renderFieldError = (fieldName) => {
    if (formErrors[fieldName] && (touched[fieldName] || Object.keys(formErrors).length > 0)) {
      return (
        <FormHelperText error sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ErrorIcon fontSize="small" />
          {formErrors[fieldName]}
        </FormHelperText>
      );
    }
    return null;
  };

  // Loading state
  if (!healthInformation) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading health information...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Health Information - Support Worker Onboarding | Aecus Care</title>
        <meta name="description" content="Complete your health information for support worker onboarding. Provide medical conditions, vaccinations, and physical abilities to ensure safe and effective care delivery." />
        <meta name="keywords" content="health information, support worker, onboarding, medical conditions, vaccinations, physical abilities, health clearance" />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          mb={4}
        >
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56
              }}
            >
              <HealthIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="700" gutterBottom>
                Health Information
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please provide accurate health information to ensure we can match you with appropriate opportunities
              </Typography>
            </Box>
          </Stack>

          {/* Progress Stepper */}
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            sx={{ 
              mt: 4,
              display: { xs: 'none', md: 'flex' }
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.key}>
                <StepLabel 
                  icon={step.icon}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Mobile Progress */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={(activeStep / (steps.length - 1)) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Medical Conditions Section */}
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <StyledSection title="Medical Conditions" icon={<MedicalIcon />}>
                    <Alert 
                      severity="info" 
                      sx={{ mb: 3 }}
                      action={
                        <IconButton
                          size="small"
                          onClick={() => showHelp({
                            title: 'Medical Conditions',
                            content: 'This information helps us understand any health conditions that may affect your ability to perform support work duties safely and effectively.'
                          })}
                        >
                          <HelpIcon />
                        </IconButton>
                      }
                    >
                      <AlertTitle>Important</AlertTitle>
                      Please provide accurate information about any health conditions that may affect your work.
                    </Alert>

                    <FormControl component="fieldset" error={!!formErrors.hasMedicalConditions} fullWidth>
                      <Typography variant="h6" gutterBottom>
                        Do you have any health conditions that may affect your ability to safely perform support work duties?
                      </Typography>
                      <RadioGroup
                        name="hasMedicalConditions"
                        value={healthInformation.hasMedicalConditions}
                        onChange={handleChange}
                        row
                      >
                        <FormControlLabel 
                          value={true} 
                          control={<Radio />} 
                          label="Yes" 
                        />
                        <FormControlLabel 
                          value={false} 
                          control={<Radio />} 
                          label="No" 
                        />
                      </RadioGroup>
                      {renderFieldError('hasMedicalConditions')}
                    </FormControl>

                    <Collapse in={healthInformation.hasMedicalConditions === true}>
                      <Box sx={{ mt: 3 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          name="medicalConditionsDescription"
                          label="Please describe your health conditions"
                          value={healthInformation.medicalConditionsDescription || ''}
                          onChange={handleChange}
                          error={!!formErrors.medicalConditionsDescription}
                          helperText={formErrors.medicalConditionsDescription}
                          placeholder="Describe any medical conditions, medications, or health concerns that may affect your work..."
                        />
                      </Box>
                    </Collapse>
                  </StyledSection>
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Workers Compensation Section */}
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <StyledSection title="Workers Compensation" icon={<WorkIcon />}>
                    <FormControl component="fieldset" error={!!formErrors.hasWorkersCompensation} fullWidth>
                      <Typography variant="h6" gutterBottom>
                        Are you covered by workers' compensation insurance?
                      </Typography>
                      <RadioGroup
                        name="hasWorkersCompensation"
                        value={healthInformation.hasWorkersCompensation}
                        onChange={handleChange}
                        row
                      >
                        <FormControlLabel value={true} control={<Radio />} label="Yes" />
                        <FormControlLabel value={false} control={<Radio />} label="No" />
                      </RadioGroup>
                      {renderFieldError('hasWorkersCompensation')}
                    </FormControl>

                    <Collapse in={healthInformation.hasWorkersCompensation === true}>
                      <Box sx={{ mt: 3 }}>
                        <TextField
                          fullWidth
                          name="workersCompensationDetails"
                          label="Workers compensation details"
                          value={healthInformation.workersCompensationDetails || ''}
                          onChange={handleChange}
                          error={!!formErrors.workersCompensationDetails}
                          helperText={formErrors.workersCompensationDetails}
                          placeholder="Provide details about your workers compensation coverage..."
                        />
                      </Box>
                    </Collapse>
                  </StyledSection>
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Vaccinations Section */}
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <StyledSection title="Vaccinations" icon={<VaccineIcon />}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Vaccination status is important for client safety and compliance requirements.
                    </Alert>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl component="fieldset" error={!!formErrors.covidVaccinated} fullWidth>
                          <Typography variant="h6" gutterBottom>
                            COVID-19 Vaccination Status
                          </Typography>
                          <RadioGroup
                            name="covidVaccinated"
                            value={healthInformation.covidVaccinated}
                            onChange={handleChange}
                            row
                          >
                            <FormControlLabel value={true} control={<Radio />} label="Vaccinated" />
                            <FormControlLabel value={false} control={<Radio />} label="Not Vaccinated" />
                          </RadioGroup>
                          {renderFieldError('covidVaccinated')}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl component="fieldset" error={!!formErrors.fluVaccinated} fullWidth>
                          <Typography variant="h6" gutterBottom>
                            Flu Vaccination Status
                          </Typography>
                          <RadioGroup
                            name="fluVaccinated"
                            value={healthInformation.fluVaccinated}
                            onChange={handleChange}
                            row
                          >
                            <FormControlLabel value={true} control={<Radio />} label="Vaccinated" />
                            <FormControlLabel value={false} control={<Radio />} label="Not Vaccinated" />
                          </RadioGroup>
                          {renderFieldError('fluVaccinated')}
                        </FormControl>
                      </Grid>
                    </Grid>

                    {/* Additional Vaccinations */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Additional Vaccinations
                      </Typography>
                      
                      <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              size="small"
                              name="name"
                              label="Vaccine name"
                              value={newVaccine.name}
                              onChange={handleVaccineChange}
                              placeholder="e.g., Hepatitis B, Tetanus"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  name="vaccinated"
                                  checked={newVaccine.vaccinated}
                                  onChange={handleVaccineChange}
                                />
                              }
                              label="Vaccinated"
                            />
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <TextField
                              fullWidth
                              size="small"
                              type="date"
                              name="date"
                              label="Date"
                              value={newVaccine.date}
                              onChange={handleVaccineChange}
                              disabled={!newVaccine.vaccinated}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={2}>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={handleAddVaccine}
                              disabled={!newVaccine.name.trim()}
                              startIcon={<AddIcon />}
                            >
                              Add
                            </Button>
                          </Grid>
                        </Grid>
                      </Card>

                      {/* Vaccination List */}
                      {healthInformation.otherVaccinations?.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            Added Vaccinations:
                          </Typography>
                          <Stack spacing={1}>
                            {healthInformation.otherVaccinations.map((vax, index) => (
                              <Card key={index} variant="outlined">
                                <CardContent sx={{ py: 2, px: 2 }}>
                                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                      <Chip
                                        label={vax.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
                                        color={vax.vaccinated ? 'success' : 'default'}
                                        size="small"
                                      />
                                      <Typography variant="body2" fontWeight="500">
                                        {vax.name}
                                      </Typography>
                                      {vax.date && (
                                        <Typography variant="body2" color="text.secondary">
                                          {new Date(vax.date).toLocaleDateString()}
                                        </Typography>
                                      )}
                                    </Stack>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleRemoveVaccination(index, vax.name)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Stack>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Box>
                  </StyledSection>
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Physical Abilities Section */}
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <StyledSection title="Physical Abilities" icon={<FitnessIcon />}>
                    <FormControl component="fieldset" error={!!formErrors.canLiftPatients} fullWidth>
                      <Typography variant="h6" gutterBottom>
                        Are you currently able to meet the physical requirements of this role?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This includes lifting, standing, and assisting clients with mobility
                      </Typography>
                      <RadioGroup
                        name="canLiftPatients"
                        value={healthInformation.canLiftPatients}
                        onChange={handleChange}
                        row
                      >
                        <FormControlLabel value={true} control={<Radio />} label="Yes" />
                        <FormControlLabel value={false} control={<Radio />} label="No" />
                      </RadioGroup>
                      {renderFieldError('canLiftPatients')}
                    </FormControl>

                    <Box sx={{ mt: 4 }}>
                      <FormControl component="fieldset" error={!!formErrors.requiresSpecialAccommodation} fullWidth>
                        <Typography variant="h6" gutterBottom>
                          Do you require any special accommodations or workplace adjustments?
                        </Typography>
                        <RadioGroup
                          name="requiresSpecialAccommodation"
                          value={healthInformation.requiresSpecialAccommodation}
                          onChange={handleChange}
                          row
                        >
                          <FormControlLabel value={true} control={<Radio />} label="Yes" />
                          <FormControlLabel value={false} control={<Radio />} label="No" />
                        </RadioGroup>
                        {renderFieldError('requiresSpecialAccommodation')}
                      </FormControl>

                      <Collapse in={healthInformation.requiresSpecialAccommodation === true}>
                        <Box sx={{ mt: 3 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            name="conditionsAffectingWork"
                            label="Please describe the accommodations needed"
                            value={healthInformation.conditionsAffectingWork || ''}
                            onChange={handleChange}
                            error={!!formErrors.conditionsAffectingWork}
                            helperText={formErrors.conditionsAffectingWork}
                            placeholder="Describe any accommodations or adjustments needed to perform your role safely and effectively..."
                          />
                        </Box>
                      </Collapse>
                    </Box>
                  </StyledSection>
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Health Clearance Section */}
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <StyledSection title="Health Clearance" icon={<SecurityIcon />}>
                    <FormControl component="fieldset" error={!!formErrors.hasHealthClearance} fullWidth>
                      <Typography variant="h6" gutterBottom>
                        Do you have a current health clearance certificate?
                      </Typography>
                      <RadioGroup
                        name="hasHealthClearance"
                        value={healthInformation.hasHealthClearance}
                        onChange={handleChange}
                        row
                      >
                        <FormControlLabel value={true} control={<Radio />} label="Yes" />
                        <FormControlLabel value={false} control={<Radio />} label="No" />
                      </RadioGroup>
                      {renderFieldError('hasHealthClearance')}
                    </FormControl>

                    <Collapse in={healthInformation.hasHealthClearance === true}>
                      <Box sx={{ mt: 3 }}>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              type="date"
                              name="healthClearanceDate"
                              label="Clearance date"
                              value={healthInformation.healthClearanceDate || ''}
                              onChange={handleChange}
                              error={!!formErrors.healthClearanceDate}
                              helperText={formErrors.healthClearanceDate}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <CalendarIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              name="clearanceNotes"
                              label="Additional notes about your clearance"
                              value={healthInformation.clearanceNotes || ''}
                              onChange={handleChange}
                              placeholder="Any additional information about your health clearance..."
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </StyledSection>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>

          {/* Form Actions */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            sx={{ 
              mt: 4, 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' }
            }}
          >
            <Button
              variant="outlined"
              onClick={prevStep}
              disabled={isSaving || isLoading}
              startIcon={<BackIcon />}
              size="large"
              sx={{ minWidth: 120 }}
            >
              Back
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSaving}
              disabled={isLoading}
              startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
              size="large"
              sx={{ 
                minWidth: 200,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                }
              }}
            >
              {isSaving ? 'Saving...' : 'Save and Complete Profile'}
            </LoadingButton>
          </Box>
        </form>
      </Container>

      {/* Help Dialog */}
      <Dialog
        open={showHelpDialog}
        onClose={() => setShowHelpDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <InfoIcon color="primary" />
            <Typography variant="h6">{helpContent.title}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {helpContent.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowHelpDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSaving}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress color="inherit" />
          <Typography variant="h6">Saving your health information...</Typography>
        </Box>
      </Backdrop>
    </>
  );
};

export default HealthInformation;