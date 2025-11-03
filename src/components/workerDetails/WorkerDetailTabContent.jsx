import React from "react";
import PropTypes from "prop-types";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import {format} from 'date-fns';

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Button,
  Avatar,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  alpha
} from "@mui/material";
import {
  Info as InfoIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Language as LanguageIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Warning as WarningIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Vaccines as VaccinesIcon,
  LocalHospital as LocalHospitalIcon,
  FitnessCenter as FitnessCenterIcon,
  CalendarToday as CalendarTodayIcon,
  Notes as NotesIcon,
  HealthAndSafety as HealthAndSafetyIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const WorkerDetailTabContent = ({
  activeTab,
  workerData,
  setSelectedCertification,
  setSelectedDocument,
  renderAvailabilitySchedule,
  formatDate
}) => {
  const navigate = useNavigate();
  console.log("WOrker Data",workerData?.user?._id)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Status chip component for consistent styling
  const StatusChip = ({ status }) => {
    const statusConfig = {
      Verified: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
      Rejected: { color: 'error', icon: <CancelIcon fontSize="small" /> },
      'Expiring Soon': { color: 'warning', icon: <WarningIcon fontSize="small" /> },
      Pending: { color: 'info', icon: <ScheduleIcon fontSize="small" /> }
    };

    const config = statusConfig[status] || { color: 'default', icon: null };

    return (
      <Chip
        size="small"
        color={config.color}
        icon={config.icon}
        label={status}
        sx={{
          fontWeight: 600,
          '& .MuiChip-icon': { ml: 0.5 }
        }}
      />
    );
  };

  // Section header component for consistent section styling
  const SectionHeader = ({ icon, title, count, color = 'primary' }) => (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
      <Avatar sx={{
        bgcolor: `${color}.light`,
        color: `${color}.main`,
        width: 40,
        height: 40
      }}>
        {React.cloneElement(icon, { fontSize: 'small' })}
      </Avatar>
      <Typography variant="h6" fontWeight={700} flexGrow={1}>
        {title}
      </Typography>
      {count !== undefined && (
        <Chip
          label={count}
          color={color}
          variant="outlined"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      )}
    </Stack>
  );

  // Profile completeness meter with animated progress
  const ProfileCompleteness = ({ percentage, completedSections }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader
        title="Profile Completeness"
        avatar={<InfoIcon color="primary" />}
        sx={{ pb: 1 }}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Completion Status
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {percentage}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'divider',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                transition: 'width 0.6s ease'
              }
            }}
          />
        </Box>
        <Grid container spacing={1}>
          {Object.entries(completedSections).map(([section, completed]) => (
            <Grid item xs={6} key={section}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {completed ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <CancelIcon color="error" fontSize="small" />
                )}
                <Typography variant="body2">
                  {section.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  // Skills & Languages card component
  const SkillsLanguagesCard = ({ skills, languages }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader
        title="Skills & Languages"
        avatar={<WorkIcon color="primary" />}
        sx={{ pb: 1 }}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Skills
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  bgcolor: 'action.selected',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'primary.dark'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Languages
          </Typography>
          <List dense sx={{ p: 0 }}>
            {languages.map((lang, index) => (
              <ListItem key={index} disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <LanguageIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={lang.language}
                  secondary={lang.proficiency}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );

  // Biography card component
  const BiographyCard = ({ biography }) => (
    <Card variant="outlined">
      <CardHeader
        title="Biography"
        avatar={<DescriptionIcon color="primary" />}
        sx={{ pb: 1 }}
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-line",
            lineHeight: 1.7,
            color: 'text.primary'
          }}
        >
          {biography || (
            <Typography color="text.secondary" fontStyle="italic">
              No biography provided
            </Typography>
          )}
        </Typography>
      </CardContent>
    </Card>
  );

  // Certification card component
  const CertificationCard = ({ cert, onClick, onDocumentClick }) => (
    <Card
      variant="outlined"
      sx={{
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1
        },
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{
            bgcolor: 'primary.light',
            color: 'primary.main',
            width: 40,
            height: 40,
            mt: 0.5
          }}>
            <SchoolIcon fontSize="small" />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600} flexGrow={1}>
                {cert.certificationType.name}
              </Typography>
              <StatusChip status={cert.verificationStatus} />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
              {cert.certificationType.description}
            </Typography>

            <Grid container spacing={1} sx={{ mt: 1 }}>
              {cert.number && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <Box component="span" color="text.secondary">Number:</Box> {cert.number}
                  </Typography>
                </Grid>
              )}
              {cert.issuer && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <Box component="span" color="text.secondary">Issuer:</Box> {cert.issuer}
                  </Typography>
                </Grid>
              )}
              {cert.issuedDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <Box component="span" color="text.secondary">Issued:</Box> {formatDate(cert.issuedDate)}
                  </Typography>
                </Grid>
              )}
              {cert.expiryDate && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <Box component="span" color="text.secondary">Expires:</Box> {formatDate(cert.expiryDate)}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {cert.documents?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  ATTACHED DOCUMENTS
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {cert.documents.map((doc, docIdx) => (
                    <Button
                      key={docIdx}
                      variant="outlined"
                      size="small"
                      startIcon={<DescriptionIcon fontSize="small" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDocumentClick(doc);
                      }}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem'
                      }}
                    >
                      {doc.fileName || `Document ${docIdx + 1}`}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  // Format field name for display
  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Get icon for health field
  const getHealthIcon = (key) => {
    const iconMap = {
      covidVaccinated: <VaccinesIcon />,
      fluVaccinated: <VaccinesIcon />,
      otherVaccinations: <VaccinesIcon />,
      hasHealthClearance: <HealthAndSafetyIcon />,
      canLiftPatients: <FitnessCenterIcon />,
      hasWorkersCompensation: <LocalHospitalIcon />,
      hasMedicalConditions: <MedicalServicesIcon />,
      requiresSpecialAccommodation: <InfoIcon />,
    };
    return iconMap[key] || <MedicalServicesIcon />;
  };

  // Health info card component - Enhanced with better design and responsiveness
  const HealthInfoCard = ({ healthInfo }) => {
    if (!healthInfo) {
      return (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <MedicalServicesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">No health information available</Typography>
        </Paper>
      );
    }

    // Group health info into categories
    const vaccinations = [
      { key: 'covidVaccinated', value: healthInfo.covidVaccinated },
      { key: 'fluVaccinated', value: healthInfo.fluVaccinated },
      { key: 'otherVaccinations', value: healthInfo.otherVaccinations }
    ].filter(item => item.value !== undefined);

    const medicalInfo = [
      { key: 'hasHealthClearance', value: healthInfo.hasHealthClearance },
      { key: 'hasMedicalConditions', value: healthInfo.hasMedicalConditions },
      { key: 'canLiftPatients', value: healthInfo.canLiftPatients },
      { key: 'hasWorkersCompensation', value: healthInfo.hasWorkersCompensation },
      { key: 'requiresSpecialAccommodation', value: healthInfo.requiresSpecialAccommodation }
    ].filter(item => item.value !== undefined);

    const hasDetails = healthInfo.workersCompensationDetails || 
                      healthInfo.medicalConditionsDescription || 
                      healthInfo.conditionsAffectingWork ||
                      healthInfo.healthClearanceNotes ||
                      healthInfo.healthClearanceDate;

    return (
      <Stack spacing={3}>
        {/* Vaccinations Section */}
        {vaccinations.length > 0 && (
          <Card 
            variant="outlined" 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: alpha(theme.palette.success.main, 0.2),
              bgcolor: alpha(theme.palette.success.main, 0.02)
            }}
          >
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <VaccinesIcon color="success" />
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'success.dark' }}>
                    Vaccinations
                  </Typography>
                </Stack>
              }
              sx={{ 
                pb: 1,
                bgcolor: alpha(theme.palette.success.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
              }}
            />
            <CardContent sx={{ pt: 2 }}>
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {vaccinations.map(({ key, value }) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: value ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.grey[500], 0.08),
                        border: `1.5px solid ${value ? theme.palette.success.main : alpha(theme.palette.grey[400], 0.3)}`,
                        borderLeft: `4px solid ${value ? theme.palette.success.main : theme.palette.grey[400]}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: value ? 2 : 1,
                          borderColor: value ? theme.palette.success.dark : theme.palette.grey[500]
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: value ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.grey[500], 0.15),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {React.cloneElement(getHealthIcon(key), {
                            fontSize: 'small',
                            sx: { color: value ? 'success.main' : 'text.disabled' }
                          })}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            sx={{ 
                              color: value ? 'success.dark' : 'text.secondary',
                              fontSize: { xs: '0.875rem', sm: '0.9rem' },
                              mb: 0.25
                            }}
                            noWrap
                          >
                            {formatFieldName(key)}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {value ? (
                              <>
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 600 }}>
                                  Yes
                                </Typography>
                              </>
                            ) : (
                              <>
                                <CancelIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.disabled">
                                  No
                                </Typography>
                              </>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Medical Information Section */}
        {medicalInfo.length > 0 && (
          <Card 
            variant="outlined" 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: alpha(theme.palette.info.main, 0.2),
              bgcolor: alpha(theme.palette.info.main, 0.02)
            }}
          >
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <MedicalServicesIcon color="info" />
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'info.dark' }}>
                    Medical Information
                  </Typography>
                </Stack>
              }
              sx={{ 
                pb: 1,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
              }}
            />
            <CardContent sx={{ pt: 2 }}>
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {medicalInfo.map(({ key, value }) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        bgcolor: value ? alpha(theme.palette.info.main, 0.08) : alpha(theme.palette.grey[500], 0.08),
                        border: `1.5px solid ${value ? theme.palette.info.main : alpha(theme.palette.grey[400], 0.3)}`,
                        borderLeft: `4px solid ${value ? theme.palette.info.main : theme.palette.grey[400]}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: value ? 2 : 1,
                          borderColor: value ? theme.palette.info.dark : theme.palette.grey[500]
                        }
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: value ? alpha(theme.palette.info.main, 0.15) : alpha(theme.palette.grey[500], 0.15),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {React.cloneElement(getHealthIcon(key), {
                            fontSize: 'small',
                            sx: { color: value ? 'info.main' : 'text.disabled' }
                          })}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            sx={{ 
                              color: value ? 'info.dark' : 'text.secondary',
                              fontSize: { xs: '0.875rem', sm: '0.9rem' },
                              mb: 0.25
                            }}
                            noWrap
                          >
                            {formatFieldName(key)}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {value ? (
                              <>
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'info.main' }} />
                                <Typography variant="caption" sx={{ color: 'info.dark', fontWeight: 600 }}>
                                  Yes
                                </Typography>
                              </>
                            ) : (
                              <>
                                <CancelIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                <Typography variant="caption" color="text.disabled">
                                  No
                                </Typography>
                              </>
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Additional Details Section */}
        {hasDetails && (
          <Card 
            variant="outlined" 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: alpha(theme.palette.warning.main, 0.2),
              bgcolor: alpha(theme.palette.warning.main, 0.02)
            }}
          >
            <CardHeader
              title={
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <NotesIcon color="warning" />
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.dark' }}>
                    Additional Details
                  </Typography>
                </Stack>
              }
              sx={{ 
                pb: 1,
                bgcolor: alpha(theme.palette.warning.main, 0.05),
                borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
              }}
            />
            <CardContent sx={{ pt: 2 }}>
              <Stack spacing={2.5}>
                {healthInfo.workersCompensationDetails && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                      borderLeft: `4px solid ${theme.palette.warning.main}`
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={1}>
                      <LocalHospitalIcon sx={{ fontSize: 20, color: 'warning.main', mt: 0.25 }} />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'warning.dark' }}>
                        Workers Compensation Details
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ ml: 4, color: 'text.primary', lineHeight: 1.6 }}>
                      {healthInfo.workersCompensationDetails}
                    </Typography>
                  </Paper>
                )}

                {healthInfo.medicalConditionsDescription && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      borderLeft: `4px solid ${theme.palette.error.main}`
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={1}>
                      <MedicalServicesIcon sx={{ fontSize: 20, color: 'error.main', mt: 0.25 }} />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'error.dark' }}>
                        Medical Conditions
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ ml: 4, color: 'text.primary', lineHeight: 1.6 }}>
                      {healthInfo.medicalConditionsDescription}
                    </Typography>
                  </Paper>
                )}

                {healthInfo.conditionsAffectingWork && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      borderLeft: `4px solid ${theme.palette.error.main}`
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={1}>
                      <WarningIcon sx={{ fontSize: 20, color: 'error.main', mt: 0.25 }} />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'error.dark' }}>
                        Conditions Affecting Work
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ ml: 4, color: 'text.primary', lineHeight: 1.6 }}>
                      {healthInfo.conditionsAffectingWork}
                    </Typography>
                  </Paper>
                )}

                {(healthInfo.healthClearanceDate || healthInfo.healthClearanceNotes) && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      borderLeft: `4px solid ${theme.palette.success.main}`
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" spacing={1.5} mb={1.5}>
                      <HealthAndSafetyIcon sx={{ fontSize: 20, color: 'success.main', mt: 0.25 }} />
                      <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'success.dark' }}>
                        Health Clearance
                      </Typography>
                    </Stack>
                    <Stack spacing={1} sx={{ ml: 4 }}>
                      {healthInfo.healthClearanceDate && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarTodayIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2" color="text.primary">
                            <strong>Date:</strong> {formatDate(healthInfo.healthClearanceDate)}
                          </Typography>
                        </Stack>
                      )}
                      {healthInfo.healthClearanceNotes && (
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, mt: 0.5 }}>
                          <strong>Notes:</strong> {healthInfo.healthClearanceNotes}
                        </Typography>
                      )}
                    </Stack>
                  </Paper>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {vaccinations.length === 0 && medicalInfo.length === 0 && !hasDetails && (
          <Paper variant="outlined" sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: 3 }}>
            <MedicalServicesIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600} mb={1}>
              No Health Information Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Health information has not been provided yet
            </Typography>
          </Paper>
        )}
      </Stack>
    );
  };

  // Reference card component
  const ReferenceCard = ({ reference }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{
            bgcolor: reference.verified ? 'success.light' : 'warning.light',
            color: reference.verified ? 'success.dark' : 'warning.dark',
            width: 40,
            height: 40
          }}>
            <PersonIcon fontSize="small" />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {reference.name}
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ mb: 1 }}>
              {reference.position} at {reference.company}
            </Typography>

            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EmailIcon color="action" fontSize="small" />
                <Typography variant="body2">{reference.email}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PhoneIcon color="action" fontSize="small" />
                <Typography variant="body2">{reference.phone}</Typography>
              </Stack>
            </Stack>


          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  // Work history item component
  const WorkHistoryItem = ({ job, index }) => (
    <Box sx={{ position: 'relative', pl: 4, pb: 4 }}>
      {/* Timeline dot */}
      <Box sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 16,
        height: 16,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        border: '3px solid',
        borderColor: 'background.paper',
        zIndex: 1
      }} />

      {/* Timeline line */}
      {index < workerData.workHistory.length - 1 && (
        <Box sx={{
          position: 'absolute',
          left: 7,
          top: 16,
          bottom: 0,
          width: 2,
          bgcolor: 'divider'
        }} />
      )}

      <Card variant="outlined" sx={{ '&:hover': { borderColor: 'primary.main' } }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {job.position}
              </Typography>
              <Typography variant="body2" color="primary.main" sx={{ mb: 1 }}>
                {job.company}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {job.description}
              </Typography>
            </Box>
            <Box sx={{
              // minWidth: 120,
              bgcolor: 'action.hover',
              borderRadius: 1,
              p: 1.5,
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="text.secondary">
                DURATION
              </Typography>
              <Typography variant="body2" fontWeight={500}>
              {format(new Date(job?.startDate), "PPP")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                to
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {job?.endDate || "Present"}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );

  return (
    <Box sx={{
      pt: 2,
      pb: 4,
      ...(isMobile && { px: 1 })
    }}>
      {/* Tab 0 - Overview */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <ProfileCompleteness
              percentage={workerData.profileCompleteness.percentage}
              completedSections={workerData.profileCompleteness.completedSections}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <SkillsLanguagesCard
              skills={workerData.skillTags}
              languages={workerData.languages}
            />
          </Grid>
          <Grid item xs={12}>
            <BiographyCard biography={workerData.biography} />
          </Grid>
        </Grid>
      )}

      {/* Tab 1 - Certifications */}
      {activeTab === 1 && (
        <Box>
          <SectionHeader
            icon={<SchoolIcon />}
            title="Certifications"
            count={workerData.certifications.length}
            color="primary"
          />
          <Stack spacing={2}>
            {workerData.certifications.length > 0 ? (
              workerData.certifications.map((cert, index) => (
                <CertificationCard
                  key={index}
                  cert={cert}
                  onClick={() => setSelectedCertification(cert)}
                  onDocumentClick={(doc) => setSelectedDocument({ doc, certificate: cert })}
                />
              ))
            ) : (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <SchoolIcon color="disabled" sx={{ fontSize: 48, mb: 2 }} />
                <Typography color="text.secondary">
                  No certifications added yet
                </Typography>
              </Paper>
            )}
          </Stack>
        </Box>
      )}

      {/* Tab 2 - Availability */}
      {activeTab === 2 && (
        <Box>
          <SectionHeader
            icon={<ScheduleIcon />}
            title="Availability Schedule"
            color="primary"
          />
          {renderAvailabilitySchedule()}
        </Box>
      )}

      {/* Tab 3 - Health */}
      {activeTab === 3 && (
        <Box>
          <SectionHeader
            icon={<MedicalServicesIcon />}
            title="Health Information"
            color="primary"
          />
          <HealthInfoCard healthInfo={workerData.healthInformation} />
        </Box>
      )}

      {/* Tab 4 - Professional */}
      {activeTab === 4 && (
        <Box sx={{
          width: '100%',
          px: { xs: 1, md: 0 },
          py: { xs: 2, md: 3 },
          maxWidth: 'none',
          mx: 'auto',
        }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 4, md: 6 },
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            {/* Left: Professional References */}
            <Box sx={{ flex: { xs: 'unset', md: 2 }, minWidth: 0, width: { xs: '100%', md: '66%' } }}>
              <Box sx={{
                mb: 3,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{}}>
                  <PersonIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                  <Typography variant="h5" fontWeight={700} 
                  
                  >
                    Professional References
                  </Typography>
                  <Chip
                    label={workerData.references?.length || 0}
                    sx={{ fontWeight: 600, width: '24px', height: '24px', color: 'white', backgroundColor: 'red', fontSize: '0.7rem' }}
                    size="small"

                  />

                </Stack>



                <Button
                onClick={() => navigate(`/admin-reference/${workerData?.user?._id}`)}
                  variant="contained"
                  color="primary"
                  startIcon={<BookmarkIcon />}
                  aria-label="Manage References"
                  sx={{
                    mt: 1.5,
                    mb: 1,
                    px: 2,
                    py: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    textTransform: 'none',
                    borderRadius: 2,
                    boxShadow: 2,
                    whiteSpace: 'nowrap',
                    minWidth: { xs: 'auto', sm: '160px' },
                  }}
                >
                  Reference Management
                </Button>


              </Box>

              {workerData.references?.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 3,
                  }}
                >
                  {workerData.references.map((ref, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        boxShadow: 0,
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        minHeight: 120,
                      }}
                    >
                      <Avatar sx={{
                        bgcolor: ref.verified ? 'success.light' : 'warning.light',
                        color: ref.verified ? 'success.dark' : 'warning.dark',
                        width: 44,
                        height: 44,
                        mt: 0.5
                      }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {ref.name}
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ mb: 0.5 }} noWrap>
                          {ref.position} at {ref.company}
                        </Typography>
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EmailIcon color="action" fontSize="small" />
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{ref.email}</Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon color="action" fontSize="small" />
                            <Typography variant="body2">+61 ({ref.phone})</Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box sx={{
                  p: 5,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.default',
                  mt: 2
                }}>
                  <PersonIcon sx={{ fontSize: 40, color: 'divider', mb: 1 }} />
                  <Typography variant="h6" color="text.secondary" fontWeight={500}>
                    No Professional References
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Add references to strengthen your profile
                  </Typography>
                </Box>
              )}


            </Box>

            {/* Right: CV and Profile Summary */}
            <Box sx={{ flex: { xs: 'unset', md: 1 }, width: { xs: '100%', md: '34%' }, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* CV Section */}
              <Box sx={{
                mb: 0,
                pb: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <DescriptionIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Curriculum Vitae
                  </Typography>
                </Stack>
                {workerData.CV ? (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<DescriptionIcon />}
                      onClick={() => {
                        const cvDoc = {
                          url: workerData.CV,
                          fileName: 'CV',
                          fileType: workerData.CV?.toLowerCase().endsWith('.pdf') ? 'application/pdf' :
                            workerData.CV?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'other'
                        };
                        setSelectedDocument(cvDoc);
                      }}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        mt: 1
                      }}
                    >
                      View Document
                    </Button>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    No CV uploaded yet
                  </Typography>
                )}
              </Box>
              {/* Profile Summary */}
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <StarIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Profile Summary
                  </Typography>
                </Stack>
                <Stack spacing={2.5}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <PersonIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={500}>
                        References
                      </Typography>
                    </Stack>
                    <Chip
                      label={workerData.references?.length || 0}
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        minWidth: 32
                      }}
                    />
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <WorkIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={500}>
                        Work History
                      </Typography>
                    </Stack>
                    <Chip
                      label={workerData.workHistory?.length || 0}
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 600,
                        minWidth: 32
                      }}
                    />
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <DescriptionIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2" fontWeight={500}>
                        CV Status
                      </Typography>
                    </Stack>
                    <Chip
                      label={workerData.CV ? "Available" : "Missing"}
                      size="small"
                      sx={{
                        bgcolor: workerData.CV ? 'success.main' : 'warning.main',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>

          {/* Work Experience Section */}
          <Box sx={{ mt: { xs: 5, md: 7 } }}>
            <Box sx={{
              mb: 3,
              pb: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <WorkIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h5" fontWeight={700}>
                  Work Experience
                </Typography>
                <Chip
                  label={workerData.workHistory?.length || 0}
                  sx={{ fontWeight: 600 }}
                  size="small"
                  color="primary"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Professional background and career history
              </Typography>
            </Box>
            {workerData.workHistory?.length > 0 ? (
              <Box>
                {workerData.workHistory.map((job, index) => (
                  <Box key={index} sx={{
                    mb: index < workerData.workHistory.length - 1 ? 3 : 0,
                    pb: index < workerData.workHistory.length - 1 ? 3 : 0,
                    borderBottom: index < workerData.workHistory.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}>
                    <WorkHistoryItem job={job} index={index} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{
                p: 5,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.default',
                mt: 2
              }}>
                <WorkIcon sx={{ fontSize: 40, color: 'divider', mb: 1 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={500}>
                  No Work Experience
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add your professional experience to complete your profile
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

WorkerDetailTabContent.propTypes = {
  activeTab: PropTypes.number.isRequired,
  workerData: PropTypes.object.isRequired,
  setSelectedCertification: PropTypes.func.isRequired,
  setSelectedDocument: PropTypes.func.isRequired,
  renderAvailabilitySchedule: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired
};

export default WorkerDetailTabContent;