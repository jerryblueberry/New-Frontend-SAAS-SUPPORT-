/**
 * WorkerPreferencesSection Component
 * Displays and edits worker preferences (gender, age group, notes)
 */

import React from 'react'
import { Box, Grid, TextField, MenuItem, Typography, Stack, useTheme, alpha } from '@mui/material'
import { Controller } from 'react-hook-form'
import { PREFERRED_WORKER_GENDER, PREFERRED_WORKER_GENDER_LABELS, PREFERRED_AGE_GROUP, PREFERRED_AGE_GROUP_LABELS } from '../../../../../constants/clientOnboardingConstants'

/**
 * WorkerPreferencesSection Component
 */
const WorkerPreferencesSection = ({
  isEditMode,
  preferences,
  register,
  control,
  isMobile
}) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
          Worker Preferences
        </Typography>

        {isEditMode ? (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="workerPreferences.preferredGender"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                    label="Preferred Gender"
                    {...field}
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
                  >
                    {PREFERRED_WORKER_GENDER.map((gender) => (
                      <MenuItem key={gender} value={gender}>
                        {PREFERRED_WORKER_GENDER_LABELS[gender] || gender}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="workerPreferences.preferredAgeGroup"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                    label="Preferred Age Group"
                    {...field}
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
                  >
                    {PREFERRED_AGE_GROUP.map((age) => (
                      <MenuItem key={age} value={age}>
                        {PREFERRED_AGE_GROUP_LABELS[age] || age}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                size={isMobile ? 'small' : 'medium'}
                label="Notes (Optional)"
                placeholder="Any additional notes about worker preferences..."
                {...register('workerPreferences.notes')}
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
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={500} 
                sx={{ mb: 1, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                Preferred Gender
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                {PREFERRED_WORKER_GENDER_LABELS[preferences?.workerPreferences?.preferredGender] || 'Any'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={500} 
                sx={{ mb: 1, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                Preferred Age Group
              </Typography>
              <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                {PREFERRED_AGE_GROUP_LABELS[preferences?.workerPreferences?.preferredAgeGroup] || 'Any'}
              </Typography>
            </Grid>
            {preferences?.workerPreferences?.notes && (
              <Grid item xs={12}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={500} 
                  sx={{ mb: 1, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  Notes
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, opacity: 0.8 }}
                >
                  {preferences.workerPreferences.notes}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Box>
  )
}

export default WorkerPreferencesSection
