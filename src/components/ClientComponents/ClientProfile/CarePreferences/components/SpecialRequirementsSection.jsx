/**
 * SpecialRequirementsSection Component
 * Displays and edits special requirements
 */

import React from 'react'
import { Box, TextField, Typography, Stack, Chip, useTheme, alpha } from '@mui/material'

/**
 * SpecialRequirementsSection Component
 */
const SpecialRequirementsSection = ({
  isEditMode,
  preferences,
  register,
  isMobile
}) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            Special Requirements
          </Typography>
          <Chip 
            size="small" 
            label="Optional" 
            sx={{ 
              fontWeight: 500, 
              fontSize: '0.7rem',
              height: 20,
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }} 
          />
        </Stack>

        {isEditMode ? (
          <TextField
            fullWidth
            multiline
            rows={4}
            size={isMobile ? 'small' : 'medium'}
            label="Special Requirements"
            placeholder="Any special requirements or additional notes about your care needs..."
            {...register('specialRequirements')}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
                '&.Mui-focused': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }
              },
            }}
          />
        ) : (
          <Typography 
            variant="body2"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              opacity: preferences?.specialRequirements ? 1 : 0.7
            }}
          >
            {preferences?.specialRequirements || 'No special requirements specified'}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

export default SpecialRequirementsSection
