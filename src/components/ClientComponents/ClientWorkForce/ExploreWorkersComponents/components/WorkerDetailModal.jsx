/**
 * WorkerDetailModal Component
 * 
 * Production-ready SaaS-level modal with clean design,
 * minimal color palette, and perfect alignment.
 */

import React, { memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  Box,
  Stack,
  Avatar,
  Badge,
  Chip,
  Rating,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Fade
} from '@mui/material';
import {
  Close,
  Verified,
  Person,
  AttachMoney,
  LocationOn,
  Language,
  WorkOutline
} from '@mui/icons-material';
import { useWorker } from '../../../../../hooks/useWorkerDiscovery';
import { sanitizeHTML } from '../utils';

/**
 * WorkerDetailModal Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {string} props.workerId - Worker ID to display
 * @param {Function} props.onClose - Callback to close modal
 */
const WorkerDetailModal = ({ open, workerId, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch worker data with live updates
  const { worker, isLoading, isError, error } = useWorker(workerId, { enabled: open && !!workerId });

  if (!workerId) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          bgcolor: 'background.paper'
        }
      }}
    >
      {/* Header with Close Button - Clean Design */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          p: { xs: 2, sm: 2.5 },
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            fontSize: { xs: '1.063rem', sm: '1.188rem' },
            color: 'text.primary'
          }}
        >
          Worker Profile
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            borderRadius: 1,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08),
              color: 'error.main'
            }
          }}
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={48} />
              <Typography variant="body2" color="text.secondary">
                Loading worker profile...
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Error State */}
        {isError && (
          <Box sx={{ py: 4 }}>
            <Alert 
              severity="error" 
              sx={{ borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={onClose}>
                  Close
                </Button>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Failed to load worker profile
              </Typography>
              <Typography variant="caption">
                {error?.response?.data?.message || error?.message || 'Please try again later'}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Success - Show Worker Data */}
        {!isLoading && !isError && worker && (
          <>
            {/* Header Section - Clean & Aligned */}
            <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 2 }}
                alignItems={{ xs: 'center', sm: 'flex-start' }}
                sx={{ mb: 2 }}
              >
                {/* Avatar */}
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    worker.verificationStatus?.overall === 'Fully Verified' ? (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: theme.palette.success.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `2px solid ${theme.palette.background.paper}`,
                          boxShadow: `0 2px 4px ${alpha(theme.palette.success.main, 0.3)}`
                        }}
                      >
                        <Verified sx={{ fontSize: 14, color: 'white' }} />
                      </Box>
                    ) : null
                  }
                >
                  <Avatar
                    src={worker.user?.profilePicture}
                    alt={`${worker.user?.firstName} ${worker.user?.lastName}`}
                    sx={{ 
                      width: { xs: 72, sm: 88 },
                      height: { xs: 72, sm: 88 },
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}
                  >
                    <Person sx={{ fontSize: { xs: 36, sm: 44 } }} />
                  </Avatar>
                </Badge>

                {/* Name and Rating */}
                <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 0.5,
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      color: 'text.primary'
                    }}
                  >
                    {worker.user?.firstName} {worker.user?.lastName}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 1 }}
                  >
                    <Rating 
                      value={worker.ratings?.average || 0} 
                      precision={0.1} 
                      size="small" 
                      readOnly 
                      sx={{
                        '& .MuiRating-icon': {
                          fontSize: { xs: 18, sm: 20 }
                        }
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.813rem', sm: '0.875rem' },
                        fontWeight: 500
                      }}
                    >
                      {worker.ratings?.average?.toFixed(1) || '0.0'} ({worker.ratings?.count || 0} reviews)
                    </Typography>
                  </Stack>
                </Box>
              </Stack>

              {/* Biography - Minimal Design */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  bgcolor: alpha(theme.palette.grey[50], 0.5),
                  borderRadius: 1.5,
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  '& *': {
                    fontSize: '0.875rem !important',
                    lineHeight: '1.7 !important',
                    color: theme.palette.text.secondary
                  },
                  '& p': {
                    marginBottom: '0.75em'
                  },
                  '& ol, & ul': {
                    paddingLeft: '24px',
                    marginTop: '0.5em',
                    marginBottom: '0.75em'
                  },
                  '& li': {
                    marginBottom: '0.5em'
                  },
                  '& strong, & b': {
                    fontWeight: 600,
                    color: theme.palette.text.primary
                  },
                  '& em, & i': {
                    fontStyle: 'italic'
                  },
                  '& u': {
                    textDecoration: 'underline'
                  },
                  '& h1, & h2, & h3, & h4, & h5, & h6': {
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    marginTop: '1em',
                    marginBottom: '0.5em'
                  },
                  '& h1': { fontSize: '1.5rem !important' },
                  '& h2': { fontSize: '1.25rem !important' },
                  '& h3': { fontSize: '1.1rem !important' },
                  '& blockquote': {
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                    paddingLeft: '16px',
                    marginLeft: 0,
                    fontStyle: 'italic',
                    color: theme.palette.text.secondary
                  },
                  '& code': {
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '0.85em !important'
                  },
                  '& pre': {
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    padding: '12px',
                    borderRadius: '8px',
                    overflow: 'auto',
                    marginTop: '0.75em',
                    marginBottom: '0.75em'
                  },
                  '& a': {
                    color: theme.palette.primary.main,
                    textDecoration: 'underline',
                    '&:hover': {
                      color: theme.palette.primary.dark
                    }
                  },
                  '& br': {
                    display: 'block',
                    content: '""',
                    marginTop: '0.25em'
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(worker.biography) || '<p style="color: rgba(0,0,0,0.6); font-style: italic;">No biography provided.</p>'
                }}
              />
            </Box>

            <Box 
              sx={{ 
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`, 
                my: { xs: 2.5, sm: 3 } 
              }} 
            />

            {/* Skills Section - Clean Design */}
            <Box sx={{ mb: { xs: 2.5, sm: 3 } }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1.5, 
                  display: 'flex', 
                  alignItems: 'center',
                  fontSize: { xs: '0.938rem', sm: '1rem' },
                  color: 'text.primary'
                }}
              >
                <WorkOutline sx={{ mr: 1, fontSize: { xs: 18, sm: 20 }, color: 'text.secondary' }} />
                Skills & Expertise
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {worker.skillTags?.length > 0 ? (
                  worker.skillTags.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '0.813rem' },
                        height: { xs: 26, sm: 28 },
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          borderColor: alpha(theme.palette.primary.main, 0.25)
                        }
                      }}
                    />
                  ))
                ) : (
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.813rem', sm: '0.875rem' },
                      fontStyle: 'italic'
                    }}
                  >
                    No skills listed
                  </Typography>
                )}
              </Box>
            </Box>

            <Box 
              sx={{ 
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`, 
                my: { xs: 2.5, sm: 3 } 
              }} 
            />

            {/* Details Grid - Minimal & Aligned */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {/* Hourly Rate */}
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 1.75, sm: 2 },
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.grey[50], 0.3),
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: alpha(theme.palette.success.main, 0.3),
                      bgcolor: alpha(theme.palette.success.main, 0.02)
                    }
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.success.main, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <AttachMoney sx={{ color: 'success.main', fontSize: { xs: 18, sm: 20 } }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.688rem', sm: '0.75rem' },
                          fontWeight: 500,
                          display: 'block',
                          mb: 0.25
                        }}
                      >
                        Hourly Rate
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.938rem', sm: '1rem' },
                          color: 'text.primary'
                        }}
                      >
                        ${worker.expectedHourlyRate || 'N/A'}/hr
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Location */}
              <Grid item xs={12} sm={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 1.75, sm: 2 },
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.grey[50], 0.3),
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: alpha(theme.palette.info.main, 0.3),
                      bgcolor: alpha(theme.palette.info.main, 0.02)
                    }
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <LocationOn sx={{ color: 'info.main', fontSize: { xs: 18, sm: 20 } }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="caption" 
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.688rem', sm: '0.75rem' },
                          fontWeight: 500,
                          display: 'block',
                          mb: 0.25
                        }}
                      >
                        Location
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '0.938rem', sm: '1rem' },
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {worker.availability?.suburb || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Languages */}
              {worker.languages?.[0] && (
                <Grid item xs={12} sm={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: { xs: 1.75, sm: 2 },
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.grey[50], 0.3),
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: alpha(theme.palette.warning.main, 0.3),
                        bgcolor: alpha(theme.palette.warning.main, 0.02)
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          borderRadius: 1.5,
                          bgcolor: alpha(theme.palette.warning.main, 0.08),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Language sx={{ color: 'warning.main', fontSize: { xs: 18, sm: 20 } }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="caption" 
                          sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '0.688rem', sm: '0.75rem' },
                            fontWeight: 500,
                            display: 'block',
                            mb: 0.25
                          }}
                        >
                          Languages
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: { xs: '0.938rem', sm: '1rem' },
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {worker.languages.map(l => l.language).join(', ')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              )}
            </Grid>

            {/* Verification Status - Minimal Design */}
            {worker.verificationStatus?.overall === 'Fully Verified' && (
              <>
                <Box 
                  sx={{ 
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`, 
                    my: { xs: 2.5, sm: 3 } 
                  }} 
                />
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.75, sm: 2 },
                    bgcolor: alpha(theme.palette.success.main, 0.06),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                    borderRadius: 1.5
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: { xs: 32, sm: 36 },
                        height: { xs: 32, sm: 36 },
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.success.main, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Verified sx={{ color: 'success.main', fontSize: { xs: 18, sm: 20 } }} />
                    </Box>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'success.main',
                          fontSize: { xs: '0.813rem', sm: '0.875rem' },
                          mb: 0.25
                        }}
                      >
                        Verified Professional
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.688rem', sm: '0.75rem' }
                        }}
                      >
                        Identity verified and background check completed
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </>
            )}
          </>
        )}
      </DialogContent>

      {/* Footer Actions - Clean Design */}
      <DialogActions
        sx={{
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          p: { xs: 2, sm: 2.5 },
          gap: 1.25,
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          zIndex: 1
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={isMobile}
          sx={{ 
            textTransform: 'none', 
            minWidth: 100,
            borderRadius: 1.5,
            borderColor: alpha(theme.palette.divider, 0.5),
            fontWeight: 500,
            py: 1.25,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.04)
            }
          }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          fullWidth={isMobile}
          disabled={isLoading || isError}
          sx={{ 
            textTransform: 'none', 
            minWidth: 120,
            borderRadius: 1.5,
            fontWeight: 600,
            py: 1.25,
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            }
          }}
        >
          Contact Worker
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(WorkerDetailModal);
