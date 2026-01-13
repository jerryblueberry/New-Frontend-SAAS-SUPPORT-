/**
 * OrganizationRestriction Component
 * Shows message when organization tries to access preferences
 */

import React from 'react'
import { Alert, Typography, Button, Container, useTheme, alpha } from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'

/**
 * OrganizationRestriction Component
 */
const OrganizationRestriction = ({ onNavigateToDashboard }) => {
  const theme = useTheme()

  return (
    <Container maxWidth="sm">
      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          Preferences Not Available
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
          Organizations cannot set profile preferences. Each job you post can have unique requirements and preferences.
        </Typography>
        <Button
          variant="contained"
          onClick={onNavigateToDashboard}
          sx={{
            mt: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Go to Dashboard
        </Button>
      </Alert>
    </Container>
  )
}

export default OrganizationRestriction
