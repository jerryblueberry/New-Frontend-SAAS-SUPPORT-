/**
 * EmptyState Component
 * Shows when no profile is found
 */

import React from 'react'
import { Card, Typography, Button, Box, useTheme, alpha } from '@mui/material'
import { Person as PersonIcon } from '@mui/icons-material'

/**
 * EmptyState Component
 */
const EmptyState = ({ onNavigateToOnboarding }) => {
  const theme = useTheme()

  return (
    <Card
      elevation={0}
      sx={{
        maxWidth: 600,
        width: '100%',
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        textAlign: 'center',
        p: { xs: 3, sm: 4, md: 5 },
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
        }}
      >
        <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
      </Box>
      
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
        Profile Not Found
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
        It looks like you haven't completed your profile setup yet. Complete your onboarding to access all features.
      </Typography>
      
      <Button
        variant="contained"
        size="large"
        onClick={onNavigateToOnboarding}
        startIcon={<PersonIcon />}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 700,
          px: 4,
          py: 1.5,
          boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
          '&:hover': {
            boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
            transform: 'translateY(-2px)',
          },
        }}
      >
        Complete Your Profile
      </Button>
    </Card>
  )
}

export default EmptyState
