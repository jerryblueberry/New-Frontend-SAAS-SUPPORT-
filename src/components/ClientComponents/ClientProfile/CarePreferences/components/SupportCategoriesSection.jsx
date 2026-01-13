/**
 * SupportCategoriesSection Component
 * Displays and edits support categories selection
 */

import React from 'react'
import { Box, TextField, MenuItem, Typography, Chip, Stack, useTheme, alpha } from '@mui/material'
import { Controller } from 'react-hook-form'
import { SUPPORT_CATEGORIES, SUPPORT_CATEGORY_LABELS } from '../../../../../constants/clientOnboardingConstants'

/**
 * SupportCategoriesSection Component
 */
const SupportCategoriesSection = ({
  isEditMode,
  preferences,
  control,
  errors,
  isMobile
}) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            Support Categories
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
          <Controller
            name="supportCategories"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                required
                size={isMobile ? 'small' : 'medium'}
                label="Support Categories *"
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={SUPPORT_CATEGORY_LABELS[value] || value}
                          size="small"
                          sx={{
                            height: 28,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          }}
                        />
                      ))}
                    </Box>
                  ),
                }}
                error={!!errors.supportCategories}
                helperText={errors.supportCategories?.message}
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
                {...field}
              >
                {SUPPORT_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {SUPPORT_CATEGORY_LABELS[category] || category}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {preferences?.supportCategories?.map((category, idx) => (
              <Chip
                key={idx}
                label={SUPPORT_CATEGORY_LABELS[category] || category}
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
            {(!preferences?.supportCategories || preferences.supportCategories.length === 0) && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, opacity: 0.7 }}
              >
                No support categories selected
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}

export default SupportCategoriesSection
