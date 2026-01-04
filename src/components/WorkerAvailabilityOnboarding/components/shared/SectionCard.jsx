// src/components/WorkerAvailabilityOnboarding/components/shared/SectionCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * SectionCard Component
 * 
 * A reusable card container for form sections with error state support.
 * 
 * @param {node} children - Content to display inside the card
 * @param {boolean} error - Whether the card is in error state
 * @param {object} theme - MUI theme object (optional, will use useTheme if not provided)
 */
const SectionCard = ({ children, error, theme: themeProp }) => {
  const theme = useTheme();
  const finalTheme = themeProp || theme;

  return (
    <Box
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: '16px',
        bgcolor: 'background.paper',
        border: `1px solid ${error ? finalTheme.palette.error.main : alpha(finalTheme.palette.divider, 0.06)}`,
        boxShadow: `0 1px 3px ${alpha(finalTheme.palette.common.black, 0.02)}`,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: error ? finalTheme.palette.error.main : alpha(finalTheme.palette.divider, 0.12),
          boxShadow: `0 2px 8px ${alpha(finalTheme.palette.common.black, 0.04)}`,
        },
      }}
    >
      {children}
    </Box>
  );
};

SectionCard.propTypes = {
  children: PropTypes.node.isRequired,
  error: PropTypes.bool,
  theme: PropTypes.object,
};

export default React.memo(SectionCard);

