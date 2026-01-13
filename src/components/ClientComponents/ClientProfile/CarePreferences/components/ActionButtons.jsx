/**
 * ActionButtons Component
 * Save and Cancel buttons for edit mode - Minimal SaaS design
 */

import React from 'react'
import { Box, Button, Stack, CircularProgress, useTheme, alpha } from '@mui/material'
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'

/**
 * ActionButtons Component
 */
const ActionButtons = ({ isUpdating, isDirty, onCancel, isMobile }) => {
  const theme = useTheme()

  return (
    <Box 
      sx={{ 
        pt: { xs: 3, sm: 4 },
        mt: { xs: 2, sm: 3 },
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      }}
    >
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        justifyContent="flex-end"
        sx={{
          gap: { xs: 1.5, sm: 2 }
        }}
      >
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isUpdating}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            width: { xs: '100%', sm: 'auto' },
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.25 },
            borderColor: alpha(theme.palette.divider, 0.3),
            color: 'text.primary',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: theme.palette.text.secondary,
              bgcolor: alpha(theme.palette.text.secondary, 0.04),
            }
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isUpdating || !isDirty}
          startIcon={isUpdating ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            minWidth: { xs: '100%', sm: 140 },
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.25 },
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              transform: 'translateY(-1px)',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          }}
        >
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
      </Stack>
    </Box>
  )
}

export default ActionButtons
