/**
 * HeaderCard Component
 * Header section for Care Preferences page - Minimal SaaS design
 */

import React from 'react'
import { Typography, Button, Stack, Box, useTheme, alpha } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'

/**
 * HeaderCard Component
 */
const HeaderCard = ({ isEditMode, onEditClick, isMobile }) => {
  const theme = useTheme()

  return (
    <Stack 
      direction="row" 
      justifyContent="space-between" 
      alignItems={{ xs: 'flex-start', sm: 'center' }} 
      flexWrap="wrap" 
      spacing={2}
      sx={{
        pb: { xs: 2, sm: 3 },
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
      }}
    >
      <Box>
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          fontWeight={700} 
          color="text.primary"
          sx={{ mb: 0.5 }}
        >
          Care Preferences
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            opacity: 0.8
          }}
        >
          Manage your support needs and worker preferences
        </Typography>
      </Box>
      {!isEditMode && (
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={onEditClick}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: alpha(theme.palette.primary.main, 0.3),
            color: 'primary.main',
            px: { xs: 2, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              transform: 'translateY(-1px)',
            }
          }}
        >
          Edit
        </Button>
      )}
    </Stack>
  )
}

export default HeaderCard
