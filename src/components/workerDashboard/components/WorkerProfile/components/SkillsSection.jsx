import React from 'react';
import {
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';

/**
 * SkillsSection Component
 * 
 * Compact, SaaS-level skills display.
 * Minimal design with clean chip styling and subtle interactions.
 */
const SkillsSection = ({ skills = [] }) => {
  const theme = useTheme();

  const hasSkills = skills && skills.length > 0;

  return (
    <Box>
      <Typography
        variant="subtitle2"
        fontWeight={600}
        color="text.secondary"
        sx={{
          mb: 1.5,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Skills
      </Typography>
      {hasSkills ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          {skills.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: 1.5,
                px: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: 'text.primary',
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                  transform: 'translateY(-1px)',
                },
                '& .MuiChip-label': {
                  px: 0.5,
                },
              }}
            />
          ))}
        </Box>
      ) : (
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.8125rem',
            color: alpha(theme.palette.text.secondary, 0.6),
            fontStyle: 'italic',
          }}
        >
          No skills added
        </Typography>
      )}
    </Box>
  );
};

export default SkillsSection;
