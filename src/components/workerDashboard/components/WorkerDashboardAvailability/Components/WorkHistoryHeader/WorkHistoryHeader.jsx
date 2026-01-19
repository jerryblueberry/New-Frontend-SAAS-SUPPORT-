import React, { memo } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Breadcrumbs,
  Link,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home,
  Work,
  ChevronRight,
} from '@mui/icons-material';

/**
 * WorkHistoryHeader
 *
 * Premium SaaS-level header for Work History page
 * - Clean, minimal design matching work history sections
 * - Strong typography hierarchy with appealing font sizes
 * - Highly responsive across all devices
 * - Lightweight stat indicators without icons
 *
 * @param {Object} props
 * @param {number} props.workHistoryCount - Number of work experience entries
 * @param {number} props.referencesCount - Number of professional references
 * @param {boolean} props.hasCV - Whether user has uploaded a CV/resume
 * @param {string} [props.breadcrumbHref='/dashboard'] - Dashboard link URL
 */
const WorkHistoryHeader = ({
  workHistoryCount = 0,
  referencesCount = 0,
  hasCV = false,
  breadcrumbHref = '/dashboard',
}) => {
  const theme = useTheme();

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          mb: { xs: 4, sm: 5, md: 6 },
          pt: { xs: 1, sm: 0 },
        }}
      >
        {/* Minimal Breadcrumbs */}
        <Breadcrumbs
          separator={
            <ChevronRight
              sx={{
                fontSize: { xs: 14, sm: 16 },
                color: theme.palette.text.disabled,
                opacity: 0.6,
              }}
            />
          }
          sx={{
            mb: { xs: 2.5, sm: 3, md: 3.5 },
            '& .MuiBreadcrumbs-ol': {
              flexWrap: 'nowrap',
            },
          }}
        >
          <Link
            href={breadcrumbHref}
            underline="none"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              color: theme.palette.text.secondary,
              fontWeight: 500,
              transition: 'color 0.2s ease',
              '&:hover': {
                color: theme.palette.text.primary,
              },
            }}
          >
            <Home sx={{ fontSize: { xs: 14, sm: 16 } }} />
            Dashboard
          </Link>

          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          >
            <Work sx={{ fontSize: { xs: 14, sm: 16 } }} />
            Work History
          </Typography>
        </Breadcrumbs>

        {/* Main Header Content - Matching Section Style */}
        <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Title & Description Section */}
          <Box>
            <Typography
              component="h1"
              sx={{
                fontSize: {
                  xs: '1.75rem', // 28px
                  sm: '2rem', // 32px
                  md: '2.25rem', // 36px
                  lg: '2.5rem', // 40px
                },
                fontWeight: 700,
                letterSpacing: { xs: '-0.01em', sm: '-0.02em' },
                color: theme.palette.text.primary,
                lineHeight: { xs: 1.25, sm: 1.2 },
                mb: { xs: 1, sm: 1.25 },
              }}
            >
              Work History
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: '0.9375rem', // 15px
                  sm: '1rem', // 16px
                  md: '1.0625rem', // 17px
                },
                color: theme.palette.text.secondary,
                lineHeight: { xs: 1.6, sm: 1.65 },
                maxWidth: { xs: '100%', sm: 600, md: 700 },
                fontWeight: 400,
              }}
            >
              Showcase your professional journey through work experience,
              upload your CV, and connect with professional references to
              build a comprehensive profile.
            </Typography>
          </Box>

          {/* Stats Section - Clean & Minimal (No Icons) */}
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            flexWrap="wrap"
            sx={{
              gap: { xs: 1, sm: 1.5 },
              alignItems: 'center',
            }}
          >
            {/* Work Experience Count */}
            <Chip
              label={`${workHistoryCount} ${
                workHistoryCount === 1 ? 'Position' : 'Positions'
              }`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                height: { xs: 28, sm: 30 },
                borderRadius: 1.5,
                border: 'none',
                '& .MuiChip-label': {
                  paddingLeft: { xs: '12px', sm: '14px' },
                  paddingRight: { xs: '12px', sm: '14px' },
                },
              }}
            />

            {/* References Count */}
            <Chip
              label={`${referencesCount} ${
                referencesCount === 1 ? 'Reference' : 'References'
              }`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                fontWeight: 600,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                height: { xs: 28, sm: 30 },
                borderRadius: 1.5,
                border: 'none',
                '& .MuiChip-label': {
                  paddingLeft: { xs: '12px', sm: '14px' },
                  paddingRight: { xs: '12px', sm: '14px' },
                },
              }}
            />

            {/* CV Status */}
            {hasCV && (
              <Chip
                label="CV Added"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  fontWeight: 600,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  height: { xs: 28, sm: 30 },
                  borderRadius: 1.5,
                  border: 'none',
                  '& .MuiChip-label': {
                    paddingLeft: { xs: '12px', sm: '14px' },
                    paddingRight: { xs: '12px', sm: '14px' },
                  },
                }}
              />
            )}
          </Stack>
        </Stack>
      </Box>
    </Fade>
  );
};

export default memo(WorkHistoryHeader);
