import React from 'react';
import PropTypes from 'prop-types';
import { Box, IconButton, Typography, Stack, Chip, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * Drawer Header Component - Apple/SaaS Design
 * Production-ready with optimized typography, spacing, and responsiveness
 */
const DrawerHeader = ({ 
  onClose, 
  totalHours, 
  availableDaysCount, 
  slotsCount, 
  hasUnsavedChanges 
}) => {
  const theme = useTheme();

  // Apple-like system font stack
  const appleFontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.25 },
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: theme.palette.background.paper,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* Header Row - Compact & Refined */}
      <Stack 
        direction="row" 
        alignItems="flex-start" 
        justifyContent="space-between" 
        sx={{ mb: { xs: 1.25, sm: 1.5 } }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontFamily: appleFontFamily,
              fontSize: { xs: '1rem', sm: '1.1875rem', md: '1.375rem' },
              fontWeight: 600,
              lineHeight: { xs: 1.25, sm: 1.3 },
              letterSpacing: '-0.02em',
              mb: { xs: 0.25, sm: 0.375 },
              color: theme.palette.text.primary,
            }}
          >
            Edit Availability
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: appleFontFamily,
              fontSize: { xs: '0.75rem', sm: '0.8125rem' },
              lineHeight: 1.4,
              letterSpacing: '-0.01em',
              display: { xs: 'none', sm: 'block' },
              color: theme.palette.text.secondary,
              fontWeight: 400,
            }}
          >
            Configure your work schedule and preferences
          </Typography>
        </Box>
        <Tooltip title="Close" arrow placement="top">
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{ 
              ml: { xs: 0.75, sm: 1 },
              width: { xs: 32, sm: 36 },
              height: { xs: 32, sm: 36 },
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              color: theme.palette.text.primary,
              border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                bgcolor: alpha(theme.palette.text.primary, 0.12),
                borderColor: alpha(theme.palette.text.primary, 0.2),
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              }
            }}
          >
            <CloseIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
          </IconButton>
        </Tooltip>
      </Stack>
      
      {/* Stats Chips - Minimal & Compact */}
      <Stack 
        direction="row" 
        spacing={{ xs: 0.5, sm: 0.625 }} 
        sx={{ 
          flexWrap: 'wrap',
          gap: { xs: 0.5, sm: 0.625 }
        }}
      >
        <Chip
          label={`${totalHours.toFixed(1)}h`}
          size="small"
          variant="outlined"
          sx={{
            fontFamily: appleFontFamily,
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            borderColor: alpha(theme.palette.text.primary, 0.12),
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: { xs: '0.6875rem', sm: '0.75rem' },
            height: { xs: 20, sm: 22 },
            letterSpacing: '-0.01em',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiChip-label': { 
              px: { xs: 0.625, sm: 0.75 },
              py: 0,
            },
            '&:hover': {
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              borderColor: alpha(theme.palette.text.primary, 0.2),
            }
          }}
        />
        <Chip
          label={`${availableDaysCount}/7 days`}
          size="small"
          variant="outlined"
          sx={{
            fontFamily: appleFontFamily,
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            borderColor: alpha(theme.palette.text.primary, 0.12),
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: { xs: '0.6875rem', sm: '0.75rem' },
            height: { xs: 20, sm: 22 },
            letterSpacing: '-0.01em',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiChip-label': { 
              px: { xs: 0.625, sm: 0.75 },
              py: 0,
            },
            '&:hover': {
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              borderColor: alpha(theme.palette.text.primary, 0.2),
            }
          }}
        />
        <Chip
          label={`${slotsCount} slots`}
          size="small"
          variant="outlined"
          sx={{
            fontFamily: appleFontFamily,
            bgcolor: alpha(theme.palette.text.primary, 0.03),
            borderColor: alpha(theme.palette.text.primary, 0.12),
            color: theme.palette.text.primary,
            fontWeight: 500,
            fontSize: { xs: '0.6875rem', sm: '0.75rem' },
            height: { xs: 20, sm: 22 },
            letterSpacing: '-0.01em',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiChip-label': { 
              px: { xs: 0.625, sm: 0.75 },
              py: 0,
            },
            '&:hover': {
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              borderColor: alpha(theme.palette.text.primary, 0.2),
            }
          }}
        />
        {hasUnsavedChanges && (
          <Chip
            label="Unsaved"
            size="small"
            icon={<WarningIcon sx={{ fontSize: { xs: 10, sm: 12 }, color: 'inherit' }} />}
            sx={{
              fontFamily: appleFontFamily,
              bgcolor: alpha('#FF9500', 0.12),
              borderColor: alpha('#FF9500', 0.3),
              color: '#FF9500',
              fontWeight: 600,
              fontSize: { xs: '0.6875rem', sm: '0.75rem' },
              height: { xs: 20, sm: 22 },
              letterSpacing: '-0.01em',
              border: '1px solid',
              transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
              '& .MuiChip-label': { 
                px: { xs: 0.625, sm: 0.75 },
                py: 0,
              },
              '& .MuiChip-icon': {
                marginLeft: { xs: 0.375, sm: 0.5 },
                marginRight: { xs: -0.25, sm: -0.25 }
              },
              '&:hover': {
                bgcolor: alpha('#FF9500', 0.18),
                borderColor: alpha('#FF9500', 0.4),
                transform: 'scale(1.02)',
              }
            }}
          />
        )}
      </Stack>
    </Box>
  );
};

DrawerHeader.propTypes = {
  onClose: PropTypes.func.isRequired,
  totalHours: PropTypes.number.isRequired,
  availableDaysCount: PropTypes.number.isRequired,
  slotsCount: PropTypes.number.isRequired,
  hasUnsavedChanges: PropTypes.bool
};

DrawerHeader.defaultProps = {
  hasUnsavedChanges: false
};

export default DrawerHeader;
