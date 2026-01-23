import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';

/**
 * BiographySection Component
 * 
 * Clean, SaaS-level biography display with subtle card separation.
 * Minimal design with clean typography and appealing visual separation.
 */
const BiographySection = ({ biography, sanitizeHTML }) => {
  const theme = useTheme();

  if (!biography) {
    return null;
  }

  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight={600}
        color="text.secondary"
        sx={{
          mb: 2,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Biography
      </Typography>
      <Box
        sx={{
          p: { xs: 3, sm: 3.5, md: 4 },
          borderRadius: 2.5,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(theme.palette.background.default, 0.3)} 100%)`,
        }}
      >
        <Box
          sx={{
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            lineHeight: 1.75,
            color: 'text.primary',
            '& p': {
              margin: '0 0 1em 0',
              '&:last-child': { marginBottom: 0 },
            },
            '& strong': {
              fontWeight: 600,
              color: 'text.primary',
            },
            '& em': {
              fontStyle: 'italic',
            },
            '& ul, & ol': {
              paddingLeft: '1.5em',
              margin: '0 0 1em 0',
            },
            '& li': {
              margin: '0.5em 0',
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              marginTop: '1.5em',
              marginBottom: '0.75em',
              color: 'text.primary',
              fontWeight: 600,
              lineHeight: 1.3,
              '&:first-child': { marginTop: 0 },
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              '&:hover': {
                color: 'primary.dark',
                textDecoration: 'underline',
              },
            },
            '& blockquote': {
              borderLeft: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              paddingLeft: '1em',
              margin: '1em 0',
              fontStyle: 'italic',
              color: 'text.secondary',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
              padding: '1em 1em 1em 1.5em',
              borderRadius: '0 0.5em 0.5em 0',
            },
            '& code': {
              backgroundColor: alpha(theme.palette.text.primary, 0.06),
              padding: '0.125em 0.375em',
              borderRadius: '0.25em',
              fontSize: '0.9em',
              fontFamily: 'monospace',
            },
            '& pre': {
              backgroundColor: alpha(theme.palette.text.primary, 0.06),
              padding: '1em',
              borderRadius: '0.5em',
              overflow: 'auto',
              margin: '1em 0',
            },
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(biography) }}
        />
      </Box>
    </Box>
  );
};

export default BiographySection;
