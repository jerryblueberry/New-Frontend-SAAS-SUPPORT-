// src/components/WorkerAvailabilityOnboarding/components/shared/TipBox.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import { Lightbulb } from 'lucide-react';
import { alpha } from '@mui/material/styles';

/**
 * TipBox Component
 * 
 * A reusable tip/info box component with an icon and text.
 * 
 * @param {string} color - Color theme for the tip box
 * @param {string} text - Tip text content
 */
const TipBox = ({ color, text }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1,
      p: 1.5,
      borderRadius: '10px',
      bgcolor: alpha(color, 0.06),
      border: `1px solid ${alpha(color, 0.1)}`,
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: alpha(color, 0.08),
        borderColor: alpha(color, 0.15),
      },
    }}
  >
    <Lightbulb size={14} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
    <Typography sx={{ fontSize: '0.8125rem', color: alpha(color, 0.9), lineHeight: 1.5 }}>
      {text}
    </Typography>
  </Box>
);

TipBox.propTypes = {
  color: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

export default React.memo(TipBox);

