/**
 * ErrorState Component
 * Shows error message when preferences fail to load
 */

import React from 'react'
import { Alert, Typography, Container, useTheme, alpha } from '@mui/material'
import { Error as ErrorIcon } from '@mui/icons-material'

/**
 * ErrorState Component
 */
const ErrorState = ({ errorMessage }) => {
  const theme = useTheme()

  return (
    <Container maxWidth="sm">
      <Alert
        severity="error"
        icon={<ErrorIcon />}
        sx={{
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Error Loading Preferences
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {errorMessage || 'Failed to load your preferences. Please try refreshing the page.'}
        </Typography>
      </Alert>
    </Container>
  )
}

export default ErrorState
