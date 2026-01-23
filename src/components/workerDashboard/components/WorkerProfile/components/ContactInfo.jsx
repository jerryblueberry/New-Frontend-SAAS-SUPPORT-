import React from 'react';
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  PhoneOutlined,
  EmailOutlined,
} from '@mui/icons-material';

/**
 * ContactInfo Component
 * 
 * Compact, SaaS-level contact information display.
 * Minimal design with clean typography and subtle interactions.
 */
const ContactInfo = ({ user }) => {
  const theme = useTheme();

  const contactItems = [
    {
      icon: EmailOutlined,
      label: 'Email',
      value: user?.email || '—',
      hasValue: !!user?.email,
    },
    {
      icon: PhoneOutlined,
      label: 'Phone',
      value: user?.phone || '—',
      hasValue: !!user?.phone,
    },
  ];

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
        Contact
      </Typography>
      <Stack spacing={1.5}>
        {contactItems.map((item, index) => (
          <Stack
            key={index}
            direction="row"
            alignItems="center"
            spacing={1.25}
          >
            <item.icon
              sx={{
                fontSize: 16,
                color: item.hasValue
                  ? theme.palette.text.secondary
                  : alpha(theme.palette.text.secondary, 0.4),
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {item.label === 'Phone' && item.hasValue && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'text.primary',
                    flexShrink: 0,
                  }}
                >
                  +61
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: item.hasValue ? 500 : 400,
                  color: item.hasValue
                    ? 'text.primary'
                    : alpha(theme.palette.text.secondary, 0.6),
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default ContactInfo;
