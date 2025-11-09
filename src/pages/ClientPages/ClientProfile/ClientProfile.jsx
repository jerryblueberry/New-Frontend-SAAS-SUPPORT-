/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT PROFILE - Main Profile Management Page
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready profile display page with comprehensive sections.
 * Uses TanStack Query for data fetching with proper error handling.
 * 
 * Features:
 * - Full profile display with all sections
 * - Responsive design with Material-UI
 * - Loading and error states
 * - Profile completeness indicator
 * - Engagement metrics visualization
 * 
 * @module pages/ClientPages/ClientProfile/ClientProfile
 */

import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  Chip,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  Paper,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle,
  Warning as WarningIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Description as DescriptionIcon,
  Flag as FlagIcon,
  Star as StarIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import { useClientProfile } from '../../../stores/useClientProfileStore'
import { useAuth } from '../../../context/AuthContext'

const ClientProfile = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topOffset, setTopOffset] = useState(64)

  const { data: profile, isLoading, isError, error } = useClientProfile()

  // Measure navbar height for responsive top offset
  useEffect(() => {
    const measureNavbar = () => {
      const headerEl = document.querySelector('.wrk-dashboard-header')
      if (headerEl) {
        setTopOffset(headerEl.getBoundingClientRect().height || 64)
      }
    }
    measureNavbar()
    window.addEventListener('resize', measureNavbar)
    return () => window.removeEventListener('resize', measureNavbar)
  }, [])

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy')
    } catch {
      return dateString
    }
  }

  // Format account type
  const formatAccountType = (type) => {
    return type === 'individual' ? 'Individual Client' : 'Organization / Care Provider'
  }

  // Get status color
  const getStatusColor = (status) => {
    const statusMap = {
      submitted: 'success',
      draft: 'warning',
      pending: 'info',
      rejected: 'error',
    }
    return statusMap[status] || 'default'
  }

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={48} />
              <Typography variant="body1" color="text.secondary">
                Loading profile...
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    )
  }

  // Error state
  if (isError) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
            }}
          >
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                Error Loading Profile
              </Typography>
              <Typography variant="body2">
                {error?.message || 'Failed to load your profile. Please try again later.'}
              </Typography>
            </Alert>
          </Box>
        </Box>
      </Box>
    )
  }

  // No profile state
  if (!profile) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
            }}
          >
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                No Profile Found
              </Typography>
              <Typography variant="body2">
                Please complete your onboarding to create your profile.
              </Typography>
            </Alert>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <WorkerNavbar />

      {/* Layout container with sidebar */}
      <Box sx={{ display: 'flex', width: '100%' }}>
        <ClientSidebar topOffset={topOffset} navigate={navigate} />

        {/* Main content area */}
        <Box
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
            minWidth: 0,
            pt: { xs: 10, md: 8.7 },
            px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
            pb: { xs: 4, sm: 5, md: 6 },
          }}
        >
          {/* Content container with max width */}
          <Box
            sx={{
              maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '1400px', xl: '1600px' },
              mx: 'auto',
              width: '100%',
            }}
          >
            <Stack spacing={3}>
              {/* Header Card */}
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                            }}
                          >
                            <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
                          </Box>
                          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={700} color="text.primary">
                            Client Profile
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {user?.firstName && user?.lastName && (
                            <Chip
                              icon={<PersonIcon sx={{ fontSize: 16 }} />}
                              label={`${user.firstName} ${user.lastName}`}
                              size="small"
                              sx={{
                                bgcolor: 'background.paper',
                                fontWeight: 600,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            />
                          )}
                          {user?.email && (
                            <Chip
                              icon={<EmailIcon sx={{ fontSize: 16 }} />}
                              label={user.email}
                              size="small"
                              sx={{
                                bgcolor: 'background.paper',
                                fontWeight: 500,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            />
                          )}
                          {user?.phone && (
                            <Chip
                              icon={<PhoneIcon sx={{ fontSize: 16 }} />}
                              label={user.phone}
                              size="small"
                              sx={{
                                bgcolor: 'background.paper',
                                fontWeight: 500,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                              }}
                            />
                          )}
                          <Chip
                            label={formatAccountType(profile.accountType)}
                            icon={profile.accountType === 'individual' ? <PersonIcon sx={{ fontSize: 16 }} /> : <BusinessIcon sx={{ fontSize: 16 }} />}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={profile.status || 'Unknown'}
                            size="small"
                            color={getStatusColor(profile.status)}
                            sx={{ fontWeight: 600 }}
                          />
                        </Stack>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: 2.5,
                          bgcolor: 'background.paper',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight={700} color="text.secondary">
                              Profile Completion
                            </Typography>
                            <Typography variant="h6" fontWeight={800} color="primary.main">
                              {profile.profileCompleteness?.percentage || 0}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={profile.profileCompleteness?.percentage || 0}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background:
                                  (profile.profileCompleteness?.percentage || 0) === 100
                                    ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`
                                    : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                              },
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" fontWeight={500}>
                            {(profile.profileCompleteness?.percentage || 0) === 100
                              ? '✓ All sections completed'
                              : 'Complete your profile to unlock all features'}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Main Content Grid */}
              <Grid container spacing={3}>
                {/* Left Column - Main Information */}
                <Grid item xs={12} lg={8}>
                  <Stack spacing={3}>
                    {/* Basic Information */}
                    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                          <BusinessIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                          <Typography variant="h6" fontWeight={700} color="text.primary">
                            Basic Information
                          </Typography>
                        </Stack>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                              Account Type
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {formatAccountType(profile.accountType)}
                            </Typography>
                          </Grid>

                          {profile.organizationName && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                                Organization Name
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {profile.organizationName}
                              </Typography>
                            </Grid>
                          )}

                          {profile.abn && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                                ABN
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {profile.abn}
                              </Typography>
                            </Grid>
                          )}

                          {profile.ndisNumber && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                                NDIS Number
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {profile.ndisNumber}
                              </Typography>
                            </Grid>
                          )}

                          {profile.address && (
                            <>
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                  Service Address
                                </Typography>
                                <Stack direction="row" alignItems="flex-start" spacing={1}>
                                  <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                                  <Box>
                                    <Typography variant="body1" fontWeight={500}>
                                      {profile.address.street}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {profile.address.suburb}, {profile.address.state} {profile.address.postcode}
                                    </Typography>
                                    {profile.address.coordinates && profile.address.coordinates.length === 2 && (
                                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                        Coordinates: {profile.address.coordinates[1].toFixed(6)}, {profile.address.coordinates[0].toFixed(6)}
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                              </Grid>
                            </>
                          )}

                          {profile.emergencyContact && (profile.emergencyContact.name || profile.emergencyContact.phone) && (
                            <Grid item xs={12}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                Emergency Contact
                              </Typography>
                              <Stack spacing={0.5}>
                                {profile.emergencyContact.name && (
                                  <Typography variant="body1" fontWeight={500}>
                                    {profile.emergencyContact.name}
                                  </Typography>
                                )}
                                {profile.emergencyContact.phone && (
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <PhoneIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {profile.emergencyContact.phone}
                                    </Typography>
                                  </Stack>
                                )}
                              </Stack>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>

                    {/* Contact Preferences */}
                    {profile.contactPreferences && (
                      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                            <EmailIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                            <Typography variant="h6" fontWeight={700} color="text.primary">
                              Contact Preferences
                            </Typography>
                          </Stack>
                          <Divider sx={{ mb: 3 }} />

                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                                Preferred Method
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {profile.contactPreferences.preferredMethod || 'Not set'}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
                                Preferred Language
                              </Typography>
                              <Typography variant="body1" fontWeight={500}>
                                {profile.contactPreferences.preferredLanguage || 'Not set'}
                              </Typography>
                            </Grid>
                            {profile.contactPreferences.accessibilityNeeds && profile.contactPreferences.accessibilityNeeds.length > 0 && (
                              <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                  Accessibility Needs
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  {profile.contactPreferences.accessibilityNeeds.map((need, idx) => (
                                    <Chip key={idx} label={need} size="small" variant="outlined" />
                                  ))}
                                </Stack>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    )}

                    {/* Preferences */}
                    {profile.preferences && (
                      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                            <SettingsIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                            <Typography variant="h6" fontWeight={700} color="text.primary">
                              Preferences & Care Requirements
                            </Typography>
                          </Stack>
                          <Divider sx={{ mb: 3 }} />

                          <Stack spacing={3}>
                            {/* Support Categories */}
                            {profile.preferences.supportCategories && profile.preferences.supportCategories.length > 0 && (
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
                                  Support Categories
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  {profile.preferences.supportCategories.map((category, idx) => (
                                    <Chip key={idx} label={category.replace(/_/g, ' ')} size="small" color="primary" />
                                  ))}
                                </Stack>
                              </Box>
                            )}

                            {/* Service Regions */}
                            {profile.preferences.serviceRegions && profile.preferences.serviceRegions.length > 0 && (
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
                                  Service Regions
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  {profile.preferences.serviceRegions.map((region, idx) => (
                                    <Chip key={idx} label={region} size="small" variant="outlined" />
                                  ))}
                                </Stack>
                              </Box>
                            )}

                            {/* Worker Preferences */}
                            {profile.preferences.workerPreferences && (
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
                                  Worker Preferences
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                      Preferred Gender
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                      {profile.preferences.workerPreferences.preferredGender || 'Any'}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">
                                      Preferred Age Group
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                      {profile.preferences.workerPreferences.preferredAgeGroup || 'Any'}
                                    </Typography>
                                  </Grid>
                                  {profile.preferences.workerPreferences.preferredExperienceAreas &&
                                    profile.preferences.workerPreferences.preferredExperienceAreas.length > 0 && (
                                      <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                          Preferred Experience Areas
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                          {profile.preferences.workerPreferences.preferredExperienceAreas.map((area, idx) => (
                                            <Chip key={idx} label={area} size="small" variant="outlined" />
                                          ))}
                                        </Stack>
                                      </Grid>
                                    )}
                                  {profile.preferences.workerPreferences.notes && (
                                    <Grid item xs={12}>
                                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                        Notes
                                      </Typography>
                                      <Typography variant="body2">{profile.preferences.workerPreferences.notes}</Typography>
                                    </Grid>
                                  )}
                                </Grid>
                              </Box>
                            )}

                            {/* Service Delivery */}
                            {profile.preferences.serviceDelivery && (
                              <Box>
                                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
                                  Service Delivery
                                </Typography>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={4}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      {profile.preferences.serviceDelivery.inPerson ? (
                                        <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                                      ) : (
                                        <WarningIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                                      )}
                                      <Typography variant="body2">In Person</Typography>
                                    </Stack>
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                      {profile.preferences.serviceDelivery.remote ? (
                                        <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                                      ) : (
                                        <WarningIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                                      )}
                                      <Typography variant="body2">Remote</Typography>
                                    </Stack>
                                  </Grid>
                                  {profile.preferences.serviceDelivery.sessionDurationMins && (
                                    <Grid item xs={12} sm={4}>
                                      <Typography variant="body2">
                                        Duration: {profile.preferences.serviceDelivery.sessionDurationMins} mins
                                      </Typography>
                                    </Grid>
                                  )}
                                </Grid>
                              </Box>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}
                  </Stack>
                </Grid>

                {/* Right Column - Stats & Metadata */}
                <Grid item xs={12} lg={4}>
                  <Stack spacing={3}>
                    {/* Engagement Metrics */}
                    {profile.engagementMetrics && (
                      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                            <AnalyticsIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                            <Typography variant="h6" fontWeight={700} color="text.primary">
                              Engagement Metrics
                            </Typography>
                          </Stack>
                          <Divider sx={{ mb: 3 }} />

                          <Stack spacing={2.5}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Jobs Posted
                              </Typography>
                              <Typography variant="h5" fontWeight={700} color="primary.main">
                                {profile.engagementMetrics.jobsPosted || 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Active Jobs
                              </Typography>
                              <Typography variant="h5" fontWeight={700} color="success.main">
                                {profile.engagementMetrics.jobsActive || 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Workers Contacted
                              </Typography>
                              <Typography variant="h5" fontWeight={700}>
                                {profile.engagementMetrics.workersContacted || 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Messages Exchanged
                              </Typography>
                              <Typography variant="h5" fontWeight={700}>
                                {profile.engagementMetrics.messagesExchanged || 0}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Total Logins
                              </Typography>
                              <Typography variant="h5" fontWeight={700}>
                                {profile.engagementMetrics.totalLogins || 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Care Plan Summary */}
                    {profile.carePlanSummary && (
                      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                            <StarIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                            <Typography variant="h6" fontWeight={700} color="text.primary">
                              Care Plan Summary
                            </Typography>
                          </Stack>
                          <Divider sx={{ mb: 3 }} />

                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Used Budget
                              </Typography>
                              <Typography variant="h6" fontWeight={700} color="primary.main">
                                ${profile.carePlanSummary.usedBudget?.toLocaleString() || '0.00'}
                              </Typography>
                            </Box>
                            {profile.carePlanSummary.goals && profile.carePlanSummary.goals.length > 0 && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                                  Goals ({profile.carePlanSummary.goals.length})
                                </Typography>
                                <Stack spacing={0.5}>
                                  {profile.carePlanSummary.goals.map((goal, idx) => (
                                    <Typography key={idx} variant="body2" sx={{ pl: 1, borderLeft: `2px solid ${theme.palette.primary.main}` }}>
                                      {goal}
                                    </Typography>
                                  ))}
                                </Stack>
                              </Box>
                            )}
                            {profile.carePlanSummary.lastUpdated && (
                              <Typography variant="caption" color="text.secondary">
                                Last updated: {formatDate(profile.carePlanSummary.lastUpdated)}
                              </Typography>
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Status & Flags */}
                    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                          <FlagIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                          <Typography variant="h6" fontWeight={700} color="text.primary">
                            Status & Flags
                          </Typography>
                        </Stack>
                        <Divider sx={{ mb: 3 }} />

                        <Stack spacing={2}>
                          {profile.flags && (
                            <>
                              {profile.flags.highValueClient && (
                                <Chip icon={<StarIcon />} label="High Value Client" color="success" size="small" />
                              )}
                              {profile.flags.prioritySupport && (
                                <Chip icon={<InfoIcon />} label="Priority Support" color="warning" size="small" />
                              )}
                              {profile.flags.manualReviewRequired && (
                                <Chip icon={<WarningIcon />} label="Manual Review Required" color="error" size="small" />
                              )}
                              {profile.flags.needsReverification && (
                                <Chip icon={<WarningIcon />} label="Needs Re-verification" color="warning" size="small" />
                              )}
                              {profile.flags.onHold && (
                                <Chip icon={<AccessTimeIcon />} label="On Hold" color="default" size="small" />
                              )}
                              {profile.flags.duplicateDetected && (
                                <Chip icon={<WarningIcon />} label="Duplicate Detected" color="error" size="small" />
                              )}
                            </>
                          )}
                          {(!profile.flags ||
                            (!profile.flags.highValueClient &&
                              !profile.flags.prioritySupport &&
                              !profile.flags.manualReviewRequired &&
                              !profile.flags.needsReverification &&
                              !profile.flags.onHold &&
                              !profile.flags.duplicateDetected)) && (
                            <Typography variant="body2" color="text.secondary">
                              No flags set
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>

                    {/* Locale Settings */}
                    {profile.localeSettings && (
                      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                            <LanguageIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                            <Typography variant="h6" fontWeight={700} color="text.primary">
                              Locale Settings
                            </Typography>
                          </Stack>
                          <Divider sx={{ mb: 3 }} />

                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Locale
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {profile.localeSettings.locale || 'Not set'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Timezone
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {profile.localeSettings.timezone || 'Not set'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Currency
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {profile.localeSettings.currency || 'Not set'}
                              </Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                Date Format
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {profile.localeSettings.dateFormat || 'Not set'}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    )}

                    {/* Metadata */}
                    <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
                          Profile Metadata
                        </Typography>
                        <Stack spacing={1.5}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Created
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDate(profile.createdAt)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Last Updated
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {formatDate(profile.updatedAt)}
                            </Typography>
                          </Box>
                          {profile.lastModifiedAt && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Last Modified
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {formatDate(profile.lastModifiedAt)}
                              </Typography>
                            </Box>
                          )}
                          {profile.progressStep && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Progress Step
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                Step {profile.progressStep}
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ClientProfile
