// src/components/WorkerAvailabilityOnboarding/components/shared/SectionHeader.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

/**
 * SectionHeader Component
 * 
 * A reusable header component for form sections with icon, title, subtitle, and optional step indicator.
 * 
 * @param {node} icon - Icon component (from lucide-react or similar)
 * @param {string} iconColor - Color for the icon
 * @param {string} iconBg - Background color for the icon container
 * @param {string} title - Main title text
 * @param {string} subtitle - Optional subtitle text
 * @param {string|number} step - Optional step number/indicator
 */
const SectionHeader = ({ icon: Icon, iconColor, iconBg, title, subtitle, step }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: '12px',
        bgcolor: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        transition: 'all 0.2s ease',
      }}
    >
      <Icon size={20} color={iconColor} strokeWidth={2} />
      {step && (
        <Box
          sx={{
            position: 'absolute',
            top: -6,
            right: -6,
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: iconColor,
            color: '#fff',
            fontSize: '0.6875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 6px ${iconColor}40`,
          }}
        >
          {step}
        </Box>
      )}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: { xs: '1.0625rem', sm: '1.125rem' },
          fontWeight: 700,
          color: 'text.primary',
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            fontSize: { xs: '0.8125rem', sm: '0.875rem' },
            color: 'text.secondary',
            lineHeight: 1.4,
            mt: 0.25,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

SectionHeader.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconColor: PropTypes.string.isRequired,
  iconBg: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default React.memo(SectionHeader);

