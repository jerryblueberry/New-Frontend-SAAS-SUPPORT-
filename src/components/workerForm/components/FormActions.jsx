// src/components/workerForm/components/FormActions.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { ChevronRight } from 'lucide-react';
import { alpha } from '@mui/material/styles';

/**
 * FormActions Component
 * 
 * A reusable form actions component with Back and Continue buttons.
 * 
 * @param {function} onBack - Callback for back button
 * @param {function} onSubmit - Callback for submit button
 * @param {boolean} isPending - Whether form is submitting
 * @param {boolean} disabled - Whether buttons are disabled
 * @param {string} submitText - Text for submit button (optional)
 */
const FormActions = ({ onBack, onSubmit, isPending, disabled, submitText }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const finalSubmitText = submitText || (isMobile ? 'Save & Continue' : 'Save & Continue to Certifications');

  return (
    <Box
      sx={{
        mt: { xs: 4, sm: 5, md: 6 },
        pt: { xs: 3, sm: 4 },
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'stretch', sm: 'space-between' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          maxWidth: { xs: '100%', sm: '800px', md: '900px' },
          mx: 'auto',
          px: { xs: 0, sm: 1 },
        }}
      >
        {/* Back Button - Premium Design */}
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
          onClick={onBack}
          disabled={isPending || disabled}
          sx={{
            minWidth: { xs: '100%', sm: 140, md: 150 },
            width: { xs: '100%', sm: 'auto' },
            height: { xs: 48, sm: 50, md: 52 },
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            borderColor: alpha(theme.palette.primary.main, 0.2),
            borderWidth: '1.5px',
            color: theme.palette.primary.main,
            bgcolor: 'transparent',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            order: { xs: 2, sm: 1 },
            cursor: isPending || disabled ? 'not-allowed' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
            '&:hover:not(:disabled)': {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              transform: 'translateY(-1px)',
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
              cursor: 'pointer',
            },
            '&:active:not(:disabled)': {
              transform: 'translateY(0)',
              cursor: 'pointer',
            },
            '&:disabled': {
              borderColor: alpha(theme.palette.action.disabled, 0.3),
              color: theme.palette.action.disabled,
              cursor: 'not-allowed',
            },
          }}
        >
          Back
        </Button>

        {/* Continue Button - Premium Gradient Design */}
        <Button
          type="submit"
          variant="contained"
          endIcon={!isPending && <ChevronRight size={isMobile ? 18 : 20} strokeWidth={2.5} />}
          onClick={onSubmit}
          disabled={isPending || disabled}
          sx={{
            minWidth: { xs: '100%', sm: 220, md: 260, lg: 280 },
            width: { xs: '100%', sm: 'auto' },
            height: { xs: 48, sm: 50, md: 52 },
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
            letterSpacing: { xs: '-0.01em', sm: '-0.015em' },
            background: isPending || disabled
              ? alpha('#6366f1', 0.6)
              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
            color: '#fff',
            order: { xs: 1, sm: 2 },
            boxShadow: isPending || disabled
              ? 'none'
              : '0 4px 16px rgba(99, 102, 241, 0.3), 0 2px 8px rgba(139, 92, 246, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            cursor: isPending || disabled ? 'not-allowed' : 'pointer',
            WebkitTapHighlightColor: 'transparent',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              transition: 'left 0.5s ease',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              padding: '1px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05))',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              opacity: 0,
              transition: 'opacity 0.3s ease',
            },
            '&:hover:not(:disabled)': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
              boxShadow: '0 6px 24px rgba(99, 102, 241, 0.4), 0 4px 12px rgba(139, 92, 246, 0.3)',
              transform: 'translateY(-2px) scale(1.01)',
              cursor: 'pointer',
              '&::before': {
                left: '100%',
              },
              '&::after': {
                opacity: 1,
              },
            },
            '&:active:not(:disabled)': {
              transform: 'translateY(0) scale(0.99)',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              cursor: 'pointer',
            },
            '&:disabled': {
              background: alpha('#6366f1', 0.4),
              boxShadow: 'none',
              transform: 'none',
              cursor: 'not-allowed',
            },
          }}
        >
          {isPending ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, justifyContent: 'center', width: '100%' }}>
              <Box
                component="span"
                sx={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  flexShrink: 0,
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: 'inherit', 
                  fontWeight: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                Saving...
              </Typography>
            </Box>
          ) : (
            <Typography
              component="span"
              sx={{
                display: 'inline-block',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                textAlign: 'center',
              }}
            >
              {finalSubmitText}
            </Typography>
          )}
        </Button>
      </Box>
    </Box>
  );
};

FormActions.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isPending: PropTypes.bool,
  disabled: PropTypes.bool,
  submitText: PropTypes.string,
};

export default React.memo(FormActions);

