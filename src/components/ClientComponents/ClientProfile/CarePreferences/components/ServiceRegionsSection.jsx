/**
 * ServiceRegionsSection Component
 * Displays and edits service regions with add/remove functionality
 */

import React from 'react'
import { Box, TextField, Typography, Chip, Stack, Button, useTheme, alpha } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'

/**
 * ServiceRegionsSection Component
 */
const ServiceRegionsSection = ({
  isEditMode,
  preferences,
  errors,
  serviceRegionInput,
  setServiceRegionInput,
  watchedServiceRegions,
  handleAddServiceRegion,
  handleRemoveServiceRegion,
  isMobile
}) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            Service Regions
          </Typography>
          <Chip 
            size="small" 
            label="Required" 
            sx={{ 
              fontWeight: 500, 
              fontSize: '0.7rem',
              height: 20,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            }} 
          />
        </Stack>

        {isEditMode ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                label="Add Service Region"
                placeholder="e.g., Perth, WA"
                value={serviceRegionInput}
                onChange={(e) => setServiceRegionInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddServiceRegion()
                  }
                }}
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
              <Button
                variant="outlined"
                onClick={handleAddServiceRegion}
                disabled={!serviceRegionInput.trim()}
                startIcon={<AddIcon />}
                sx={{ 
                  borderRadius: 2, 
                  textTransform: 'none', 
                  minWidth: { xs: 80, sm: 100 },
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: 'primary.main',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }
                }}
              >
                Add
              </Button>
            </Stack>
            {watchedServiceRegions && watchedServiceRegions.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {watchedServiceRegions.map((region, idx) => (
                  <Chip
                    key={idx}
                    label={region}
                    onDelete={() => handleRemoveServiceRegion(region)}
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      fontWeight: 500,
                      height: 28,
                      '& .MuiChip-deleteIcon': {
                        color: theme.palette.primary.main,
                        '&:hover': {
                          color: theme.palette.error.main,
                        }
                      }
                    }}
                  />
                ))}
              </Box>
            )}
            {errors.serviceRegions && (
              <Typography variant="caption" color="error" sx={{ fontSize: '0.75rem' }}>
                {errors.serviceRegions.message}
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {preferences?.serviceRegions?.map((region, idx) => (
              <Chip 
                key={idx} 
                label={region} 
                size="small" 
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  fontWeight: 500,
                  height: 28,
                }}
              />
            ))}
            {(!preferences?.serviceRegions || preferences.serviceRegions.length === 0) && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, opacity: 0.7 }}
              >
                No service regions set
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

export default ServiceRegionsSection
