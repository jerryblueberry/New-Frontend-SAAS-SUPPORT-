import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { formatDisplayDate, calculateDuration } from './utils/workHistoryUtils';

/**
 * WorkExperience Component
 *
 * Clean, SaaS-level minimal design for displaying work experience
 * - No boxy elements, borders, or heavy shadows
 * - Minimal colors using theme palette
 * - No icons for cleaner look
 * - Highly responsive across all devices
 */
const WorkExperience = ({
  workHistory = [],
  isLoading = false,
  onEditClick,
  onItemEdit,
}) => {
  const theme = useTheme();

  const workHistoryList = useMemo(() => {
    return Array.isArray(workHistory) ? workHistory : [];
  }, [workHistory]);

  if (isLoading) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          Loading work experience...
        </Typography>
      </Box>
    );
  }

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
            Work Experience
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
            {workHistoryList.length}{' '}
            {workHistoryList.length === 1 ? 'position' : 'positions'}
          </Typography>
        </Box>

        {/* Edit Button */}
        {onEditClick && (
          <Tooltip title="Edit Work Experience" arrow placement="top">
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

      {/* Work History List */}
      {workHistoryList.length > 0 ? (
        <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
          {workHistoryList.map((history, index) => (
            <Fade
              in
              timeout={300 + index * 50}
              key={history.id || history._id || index}
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
                {/* Title and Company Row */}
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
                    onClick={onItemEdit ? () => onItemEdit(history) : undefined}
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
                      {history.title || 'Untitled Position'}
                    </Typography>

                    {history.company && (
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
                        {history.company}
                      </Typography>
                    )}
                  </Box>

                  {/* Current Badge */}
                  {history.current && (
                    <Chip
                      label="Current"
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        height: { xs: 24, sm: 26 },
                        borderRadius: 1.5,
                        border: 'none',
                      }}
                    />
                  )}
                </Stack>

                {/* Details Section - Clean & Minimal */}
                <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ mt: { xs: 1.5, sm: 2 } }}>
                  {/* Date and Duration */}
                  <Stack
                    direction="row"
                    spacing={{ xs: 1.5, sm: 2 }}
                    flexWrap="wrap"
                    sx={{ gap: { xs: 1.5, sm: 2 } }}
                  >
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
                      {formatDisplayDate(history.startDate)} –{' '}
                      {formatDisplayDate(history.endDate)}
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
                      • {calculateDuration(history.startDate, history.endDate)}
                    </Typography>

                    {/* Location */}
                    {history.location && (
                      <>
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
                          • {history.location}
                        </Typography>
                      </>
                    )}
                  </Stack>

                  {/* Description */}
                  {history.description && (
                    <Box sx={{ mt: { xs: 1, sm: 1.5 } }}>
                      <Typography
                        sx={{
                          fontSize: {
                            xs: '0.9375rem',
                            sm: '1rem',
                            md: '1.0625rem',
                          },
                          color: theme.palette.text.secondary,
                          lineHeight: { xs: 1.6, sm: 1.7 },
                          fontWeight: 400,
                        }}
                      >
                        {history.description}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Fade>
          ))}
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
            No Work Experience
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
            Add your work experience to showcase your professional background
            and strengthen your profile
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default WorkExperience;
