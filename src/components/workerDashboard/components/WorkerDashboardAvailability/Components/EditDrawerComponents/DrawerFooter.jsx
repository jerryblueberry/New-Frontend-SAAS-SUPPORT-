import React from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Stack } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * Drawer Footer Component - Apple/SaaS Design
 * Clean, compact, icon-free buttons with modern styling
 */
const DrawerFooter = ({ 
  onSave, 
  onCancel, 
  isLoading, 
  isSaveDisabled, 
  saveButtonText, 
  cancelButtonText 
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: { xs: 2, sm: 2.5 },
        pb: { xs: 'max(16px, env(safe-area-inset-bottom))', sm: 2.5 },
        px: 0,
        mt: { xs: 1.5, sm: 2 },
        borderTop: { xs: 'none', sm: `1px solid ${alpha(theme.palette.divider, 0.08)}` },
        background: { xs: alpha(theme.palette.background.paper, 0.95), sm: 'transparent' },
        backdropFilter: { xs: 'blur(20px)', sm: 'none' },
      }}
    >
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={{ xs: 2, sm: 1.5 }}
        sx={{
          '& > *': {
            minWidth: { xs: '100%', sm: 'auto' }
          }
        }}
      >
        {/* Cancel Button - Apple-style secondary */}
        <Button
          fullWidth
          variant="outlined"
          onClick={onCancel}
          disabled={isLoading}
          sx={{
            order: { xs: 2, sm: 1 },
            flex: { sm: 1 },
            py: { xs: 1.125, sm: 1 },
            px: { xs: 2, sm: 1.75 },
            borderRadius: { xs: 2.5, sm: 2 },
            fontWeight: 600,
            textTransform: 'none',
            fontSize: { xs: '0.9375rem', sm: '0.9375rem' },
            letterSpacing: '-0.01em',
            minHeight: { xs: 44, sm: 40 },
            borderWidth: 1,
            borderColor: alpha(theme.palette.text.primary, 0.2),
            color: theme.palette.text.primary,
            backgroundColor: 'transparent',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: alpha(theme.palette.text.primary, 0.4),
              backgroundColor: alpha(theme.palette.text.primary, 0.04),
              transform: 'scale(0.98)',
            },
            '&:active': {
              transform: 'scale(0.96)',
              backgroundColor: alpha(theme.palette.text.primary, 0.08),
            },
            '&:disabled': {
              opacity: 0.4,
              borderColor: alpha(theme.palette.text.primary, 0.1),
            }
          }}
        >
          {cancelButtonText}
        </Button>

        {/* Save Button - Apple-style primary */}
        <Button
          fullWidth
          variant="contained"
          onClick={onSave}
          disabled={isLoading || isSaveDisabled}
          sx={{
            order: { xs: 1, sm: 2 },
            flex: { sm: 1.5 },
            py: { xs: 1.125, sm: 1 },
            px: { xs: 2, sm: 1.75 },
            borderRadius: { xs: 2.5, sm: 2 },
            fontWeight: 600,
            textTransform: 'none',
            fontSize: { xs: '0.9375rem', sm: '0.9375rem' },
            letterSpacing: '-0.01em',
            minHeight: { xs: 44, sm: 40 },
            background: theme.palette.primary.main,
            color: theme.palette.primary.contrastText || '#FFFFFF',
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}, 0 1px 2px ${alpha(theme.palette.primary.main, 0.15)}`,
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              background: theme.palette.primary.dark || theme.palette.primary.main,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}, 0 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`,
              transform: 'translateY(-1px) scale(0.99)',
            },
            '&:active': {
              transform: 'translateY(0) scale(0.97)',
              boxShadow: `0 1px 4px ${alpha(theme.palette.primary.main, 0.25)}`,
            },
            '&:disabled': {
              background: alpha(theme.palette.action.disabled, 0.12),
              color: alpha(theme.palette.action.disabled, 0.6),
              boxShadow: 'none',
              opacity: 0.6,
            }
          }}
        >
          {isLoading ? 'Saving...' : saveButtonText}
        </Button>
      </Stack>
    </Box>
  );
};

DrawerFooter.propTypes = {
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isSaveDisabled: PropTypes.bool,
  saveButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string
};

DrawerFooter.defaultProps = {
  isLoading: false,
  isSaveDisabled: false,
  saveButtonText: 'Save Changes',
  cancelButtonText: 'Cancel'
};

export default DrawerFooter;
