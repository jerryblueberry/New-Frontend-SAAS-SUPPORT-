/**
 * LoadingState Component
 * Shows loading spinner during data fetch
 */

import React from 'react'
import { Box } from '@mui/material'
import LoadingSpinner from '../../../../common/LoadingSpinner'

/**
 * LoadingState Component
 */
const LoadingState = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoadingSpinner
        size="lg"
        showLogo={true}
        text="Loading your profile..."
        fullPage={true}
        variant="gradient"
        color="primary"
      />
    </Box>
  )
}

export default LoadingState
