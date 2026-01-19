import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Alert,
  Button,
  Skeleton,
  useTheme,
  alpha,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import {
  getStatusColor,
  getStatusLabel,
} from './utils/workHistoryUtils';

/**
 * ProfessionalReferences Component
 *
 * Clean, SaaS-level minimal design for displaying professional references
 * - No boxy elements, borders, or heavy shadows
 * - Minimal colors using theme palette
 * - No icons for cleaner look
 * - Highly responsive across all devices
 */
const ProfessionalReferences = ({
  references = [],
  isLoading = false,
  isError = false,
  error = null,
  onRetry = null,
  onEditClick = null,
  onItemEdit = null,
}) => {
  const theme = useTheme();

  const displayReferences = useMemo(() => {
    return Array.isArray(references) ? references : [];
  }, [references]);

  // Clean status configuration using theme colors
  const statusConfig = useMemo(
    () => ({
      success: {
        bg: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.success.main,
        textColor: theme.palette.success.dark,
      },
      info: {
        bg: alpha(theme.palette.info.main, 0.1),
        color: theme.palette.info.main,
        textColor: theme.palette.info.dark,
      },
      warning: {
        bg: alpha(theme.palette.warning.main, 0.1),
        color: theme.palette.warning.main,
        textColor: theme.palette.warning.dark,
      },
      error: {
        bg: alpha(theme.palette.error.main, 0.1),
        color: theme.palette.error.main,
        textColor: theme.palette.error.dark,
      },
    }),
    [theme]
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Clean Header Section */}
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: { xs: 3, sm: 4, md: 5 } }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            component="h2"
            sx={{
              fontSize: {
                xs: '1.25rem',
                sm: '1.5rem',
                md: '1.75rem',
              },
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: theme.palette.text.primary,
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            Professional References
          </Typography>
          <Typography
            sx={{
              fontSize: {
                xs: '0.875rem',
                sm: '0.9375rem',
                md: '1rem',
              },
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
            }}
          >
            {isLoading && displayReferences.length === 0
              ? 'Loading...'
              : `${displayReferences.length || 0} ${
                  displayReferences.length === 1 ? 'reference' : 'references'
                }`}
          </Typography>
        </Box>

        {/* Edit Button */}
        {onEditClick && (
          <Tooltip title="Edit Professional References" arrow placement="top">
            <IconButton
              onClick={onEditClick}
              sx={{
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
                transition: 'all 0.2s ease',
                flexShrink: 0,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Edit sx={{ fontSize: { xs: 18, sm: 20 } }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Error State */}
      {isError && !displayReferences.length && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          }}
          action={
            onRetry && (
              <Button
                size="small"
                onClick={onRetry}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 1.5,
                  fontSize: '0.875rem',
                  color: theme.palette.warning.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                  },
                }}
              >
                Retry
              </Button>
            )
          }
        >
          {error?.response?.data?.message ||
            'Failed to load reference data. Showing profile references only.'}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && displayReferences.length === 0 ? (
        <Stack spacing={2}>
          {[1, 2].map((i) => (
            <Box key={i} sx={{ py: 2 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
                  </Box>
                  <Skeleton variant="rounded" width={80} height={28} />
                </Stack>
                <Skeleton variant="text" width="90%" height={16} />
                <Skeleton variant="text" width="75%" height={16} />
              </Stack>
            </Box>
          ))}
        </Stack>
      ) : displayReferences.length > 0 ? (
        /* References List - Clean & Minimal */
        <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
          {displayReferences.map((reference, index) => {
            const statusColor = getStatusColor(reference.status);
            const config = statusConfig[statusColor] || statusConfig.warning;

            return (
              <Fade
                in
                timeout={300 + index * 50}
                key={reference._id || index}
              >
                <Box
                  sx={{
                    position: 'relative',
                    pb: { xs: 3, sm: 4, md: 5 },
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    '&:last-child': {
                      borderBottom: 'none',
                      pb: 0,
                    },
                  }}
                >
                  {/* Reference Header */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                    justifyContent="space-between"
                    spacing={{ xs: 1, sm: 2 }}
                    sx={{ mb: { xs: 1.5, sm: 2 } }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        cursor: onItemEdit ? 'pointer' : 'default',
                      }}
                      onClick={onItemEdit ? () => onItemEdit(reference) : undefined}
                    >
                      <Typography
                        component="h3"
                        sx={{
                          fontSize: {
                            xs: '1.125rem',
                            sm: '1.25rem',
                            md: '1.375rem',
                          },
                          fontWeight: 700,
                          letterSpacing: '-0.01em',
                          color: theme.palette.text.primary,
                          lineHeight: 1.3,
                          mb: 0.5,
                        }}
                      >
                        {reference.name || 'Unnamed Reference'}
                      </Typography>

                      {(reference.company || reference.position) && (
                        <Typography
                          sx={{
                            fontSize: {
                              xs: '0.9375rem',
                              sm: '1rem',
                              md: '1.0625rem',
                            },
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                            lineHeight: 1.5,
                          }}
                        >
                          {reference.position && reference.company
                            ? `${reference.position} at ${reference.company}`
                            : reference.company || reference.position}
                        </Typography>
                      )}
                    </Box>

                    {/* Status Badge */}
                    <Chip
                      label={getStatusLabel(reference.status)}
                      size="small"
                      sx={{
                        bgcolor: config.bg,
                        color: config.textColor || config.color,
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        height: { xs: 24, sm: 26 },
                        borderRadius: 1.5,
                        border: 'none',
                      }}
                    />
                  </Stack>

                  {/* Reference Details - Clean & Minimal */}
                  <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ mt: { xs: 1.5, sm: 2 } }}>
                    {/* Email */}
                    {reference.email && (
                      <Typography
                        sx={{
                          fontSize: {
                            xs: '0.9375rem',
                            sm: '1rem',
                            md: '1.0625rem',
                          },
                          color: theme.palette.text.secondary,
                          fontWeight: 400,
                          lineHeight: 1.6,
                        }}
                      >
                        {reference.email}
                      </Typography>
                    )}

                    {/* Phone */}
                    {reference.phone && (
                      <Typography
                        sx={{
                          fontSize: {
                            xs: '0.9375rem',
                            sm: '1rem',
                            md: '1.0625rem',
                          },
                          color: theme.palette.text.secondary,
                          fontWeight: 400,
                          lineHeight: 1.6,
                        }}
                      >
                        {reference.phone}
                      </Typography>
                    )}
                  </Stack>

                  {/* Email Tracking - Minimal */}
                  {reference.emailTracking && (
                    <Box
                      sx={{
                        mt: { xs: 1.5, sm: 2 },
                        pt: { xs: 1.5, sm: 2 },
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        sx={{ gap: 1 }}
                      >
                        {reference.emailTracking.opened && (
                          <Chip
                            label="Opened"
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              borderRadius: 1.5,
                              border: 'none',
                            }}
                          />
                        )}
                        {reference.emailTracking.clicked && (
                          <Chip
                            label="Clicked"
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: theme.palette.success.main,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              borderRadius: 1.5,
                              border: 'none',
                            }}
                          />
                        )}
                        {reference.emailTracking.emailsSent > 0 && (
                          <Chip
                            label={`${reference.emailTracking.emailsSent} sent`}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 24,
                              borderRadius: 1.5,
                              border: 'none',
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  )}

                  {/* Progress Bar - Clean & Minimal */}
                  {reference.progress &&
                    typeof reference.progress.totalQuestions === 'number' &&
                    reference.progress.totalQuestions > 0 && (
                      <Box
                        sx={{
                          mt: { xs: 1.5, sm: 2 },
                          pt: { xs: 1.5, sm: 2 },
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <Typography
                            sx={{
                              fontSize: {
                                xs: '0.875rem',
                                sm: '0.9375rem',
                                md: '1rem',
                              },
                              color: theme.palette.text.primary,
                              fontWeight: 600,
                            }}
                          >
                            Questionnaire Progress
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: {
                                xs: '0.875rem',
                                sm: '0.9375rem',
                                md: '1rem',
                              },
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                            }}
                          >
                            {reference.progress.answeredQuestions || 0} /{' '}
                            {reference.progress.totalQuestions} (
                            {reference.progress.percentageComplete || 0}%)
                          </Typography>
                        </Stack>

                        {/* Simple Progress Bar */}
                        <Box
                          sx={{
                            height: 6,
                            bgcolor: alpha(theme.palette.divider, 0.3),
                            borderRadius: 3,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${Math.min(
                                Math.max(reference.progress.percentageComplete || 0, 0),
                                100
                              )}%`,
                              transition: 'width 0.6s ease',
                              borderRadius: 3,
                              bgcolor:
                                reference.progress.percentageComplete >= 100
                                  ? theme.palette.success.main
                                  : reference.progress.percentageComplete >= 50
                                  ? theme.palette.primary.main
                                  : theme.palette.warning.main,
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                </Box>
              </Fade>
            );
          })}
        </Stack>
      ) : (
        /* Empty State - Clean & Minimal */
        <Box
          sx={{
            textAlign: 'center',
            py: { xs: 8, sm: 10, md: 12 },
            px: 2,
          }}
        >
          <Typography
            component="h3"
            sx={{
              fontSize: {
                xs: '1.125rem',
                sm: '1.25rem',
                md: '1.375rem',
              },
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1,
              letterSpacing: '-0.01em',
            }}
          >
            No References Added
          </Typography>
          <Typography
            sx={{
              fontSize: {
                xs: '0.9375rem',
                sm: '1rem',
                md: '1.0625rem',
              },
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
              maxWidth: 500,
              mx: 'auto',
            }}
          >
            Add professional references to strengthen your profile and showcase
            your professional network
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProfessionalReferences;
