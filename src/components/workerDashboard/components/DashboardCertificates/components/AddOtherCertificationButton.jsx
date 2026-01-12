import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Box,
  Typography,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  Fade
} from '@mui/material';
import { Add, VerifiedUser, TrendingUp } from '@mui/icons-material';

/**
 * Add Other Certification Section Component
 * Apple-like, responsive section with title, description, and button
 * Explains the value of adding additional certifications
 */
const AddOtherCertificationButton = ({ onClick, sx = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Fade in timeout={600}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3, md: 3.5 },
          mb: { xs: 3, sm: 3.5, md: 4 },
          borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: { xs: '100px', sm: '150px', md: '200px' },
            height: { xs: '100px', sm: '150px', md: '200px' },
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`,
            transform: 'translate(30%, -30%)',
            pointerEvents: 'none',
          },
          ...sx
        }}
      >
        <Stack
          spacing={{ xs: 2, sm: 2.5, md: 3 }}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {/* Header Section */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ mb: { xs: 1, sm: 1.5 } }}
            >
              <Box
                sx={{
                  p: { xs: 0.75, sm: 1 },
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VerifiedUser
                  sx={{
                    fontSize: { xs: 20, sm: 24, md: 28 },
                    color: theme.palette.primary.main,
                  }}
                />
              </Box>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                sx={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
                  letterSpacing: '-0.02em',
                  color: theme.palette.text.primary,
                }}
              >
                Additional Certifications
              </Typography>
            </Stack>
            
            <Typography
              variant="body1"
              sx={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                lineHeight: 1.6,
                color: theme.palette.text.secondary,
                maxWidth: { xs: '100%', sm: '85%', md: '75%' },
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              Showcase your additional qualifications and certifications beyond the required ones. 
              Adding extra credentials helps build trust, demonstrates your commitment to professional 
              development, and sets you apart from other candidates.
            </Typography>

            {/* Benefits List */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 2 }}
              sx={{ mb: { xs: 2, sm: 2.5 } }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  color: theme.palette.text.secondary,
                }}
              >
                <TrendingUp
                  sx={{
                    fontSize: { xs: 16, sm: 18 },
                    color: theme.palette.success.main,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: 'inherit',
                  }}
                >
                  Build credibility & trust
                </Typography>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  color: theme.palette.text.secondary,
                }}
              >
                <VerifiedUser
                  sx={{
                    fontSize: { xs: 16, sm: 18 },
                    color: theme.palette.primary.main,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontSize: 'inherit',
                  }}
                >
                  Stand out from competitors
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Button Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'stretch', sm: 'flex-start' },
            }}
          >
            <Button
              variant="contained"
              onClick={onClick}
              startIcon={
                <Add
                  sx={{
                    fontSize: { xs: 18, sm: 20, md: 22 },
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              }
              sx={{
                // Apple-like design
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                fontWeight: 600,
                letterSpacing: '-0.01em',
                textTransform: 'none',
                
                // Responsive sizing
                minHeight: { xs: 44, sm: 48, md: 52 },
                px: { xs: 3, sm: 3.5, md: 4 },
                py: { xs: 1.25, sm: 1.5, md: 1.75 },
                
                // Apple-like colors and styling
                bgcolor: theme.palette.primary.main,
                color: '#ffffff',
                borderRadius: { xs: 2.5, sm: 3, md: 3.5 },
                border: 'none',
                boxShadow: `0 3px 12px ${alpha(theme.palette.primary.main, 0.3)}, 0 1px 3px ${alpha(theme.palette.primary.main, 0.2)}`,
                
                // Smooth transitions
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                
                // Hover state (Apple-like)
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}, 0 2px 6px ${alpha(theme.palette.primary.main, 0.25)}`,
                  transform: 'translateY(-2px)',
                  '& .MuiButton-startIcon': {
                    transform: 'scale(1.15) rotate(90deg)'
                  }
                },
                
                // Active state
                '&:active': {
                  transform: 'translateY(0px)',
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
                },
                
                // Focus state
                '&:focus-visible': {
                  outline: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  outlineOffset: '3px',
                },
                
                // Full width on mobile
                width: { xs: '100%', sm: 'auto' },
                
                // Icon animation
                '& .MuiButton-startIcon': {
                  marginRight: { xs: 1.25, sm: 1.5, md: 1.75 },
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                },
                
                // Disabled state
                '&:disabled': {
                  bgcolor: alpha(theme.palette.action.disabled, 0.12),
                  color: alpha(theme.palette.action.disabled, 0.38),
                  boxShadow: 'none',
                }
              }}
            >
              Add New Certification
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Fade>
  );
};

AddOtherCertificationButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  sx: PropTypes.object
};

export default AddOtherCertificationButton;
