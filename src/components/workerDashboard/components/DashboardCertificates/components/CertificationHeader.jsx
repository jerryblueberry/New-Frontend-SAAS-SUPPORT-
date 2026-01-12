import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  BusinessCenter,
  School,
  WorkspacePremium
} from '@mui/icons-material';

/**
 * Certification Header Component
 * Clean, Apple-like, SaaS-level header - Production-ready and optimized
 */
const CertificationHeader = ({ 
  professionalCount, 
  otherCount 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // Apple-like system font stack
  const appleFontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 2.5, md: 3 },
        pb: { xs: 1.5, sm: 2, md: 2.5 },
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      }}
    >
      <Stack spacing={{ xs: 1.25, sm: 1.5, md: 1.75 }}>
        {/* Title Section - Compact & Premium */}
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{ mb: { xs: 0.75, sm: 0.875 } }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 32, sm: 34, md: 36 },
                height: { xs: 32, sm: 34, md: 36 },
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
              }}
            >
              <WorkspacePremium
                sx={{
                  fontSize: { xs: 18, sm: 19, md: 20 },
                }}
              />
            </Box>
            <Typography
              component="h1"
              sx={{
                fontFamily: appleFontFamily,
                fontWeight: 700,
                fontSize: { xs: '1.375rem', sm: '1.5rem', md: '1.75rem' },
                lineHeight: 1.2,
                letterSpacing: { xs: '-0.02em', sm: '-0.025em', md: '-0.03em' },
                color: theme.palette.text.primary,
              }}
            >
              My Certifications
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              fontFamily: appleFontFamily,
              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              lineHeight: 1.5,
              letterSpacing: '0.01em',
              color: theme.palette.text.secondary,
              fontWeight: 400,
              maxWidth: { xs: '100%', sm: '90%', md: '80%' },
              mb: { xs: 1, sm: 1.25 },
            }}
          >
            Manage and track your professional certifications and credentials. 
            Verified certifications help you build trust with clients, gain more connections, 
            and unlock more shift opportunities.
          </Typography>
        </Box>

        {/* Stats Chips - Compact & Premium */}
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          sx={{
            rowGap: 0.75,
          }}
        >
          <Chip
            icon={
              <BusinessCenter
                sx={{
                  fontSize: { xs: 12, sm: 13 },
                  color: 'inherit',
                }}
              />
            }
            label={`${professionalCount} Professional`}
            variant="outlined"
            size="small"
            sx={{
              fontFamily: appleFontFamily,
              fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.8125rem' },
              fontWeight: 500,
              height: { xs: 24, sm: 26, md: 28 },
              px: { xs: 0.875, sm: 1 },
              py: 0,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              color: theme.palette.primary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderColor: alpha(theme.palette.primary.main, 0.3),
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiChip-icon': {
                marginLeft: { xs: 0.75, sm: 0.875 },
                marginRight: { xs: -0.25, sm: -0.125 },
              },
              '& .MuiChip-label': {
                paddingLeft: { xs: 0.5, sm: 0.625 },
                paddingRight: { xs: 0.5, sm: 0.625 },
              },
            }}
          />
          <Chip
            icon={
              <School
                sx={{
                  fontSize: { xs: 12, sm: 13 },
                  color: 'inherit',
                }}
              />
            }
            label={`${otherCount} Additional`}
            variant="outlined"
            size="small"
            sx={{
              fontFamily: appleFontFamily,
              fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.8125rem' },
              fontWeight: 500,
              height: { xs: 24, sm: 26, md: 28 },
              px: { xs: 0.875, sm: 1 },
              py: 0,
              borderColor: alpha(theme.palette.secondary.main, 0.2),
              bgcolor: alpha(theme.palette.secondary.main, 0.04),
              color: theme.palette.secondary.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.secondary.main, 0.08),
                borderColor: alpha(theme.palette.secondary.main, 0.3),
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiChip-icon': {
                marginLeft: { xs: 0.75, sm: 0.875 },
                marginRight: { xs: -0.25, sm: -0.125 },
              },
              '& .MuiChip-label': {
                paddingLeft: { xs: 0.5, sm: 0.625 },
                paddingRight: { xs: 0.5, sm: 0.625 },
              },
            }}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

CertificationHeader.propTypes = {
  professionalCount: PropTypes.number.isRequired,
  otherCount: PropTypes.number.isRequired
};

export default CertificationHeader;
