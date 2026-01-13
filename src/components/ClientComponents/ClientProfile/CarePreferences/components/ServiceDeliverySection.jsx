/**
 * ServiceDeliverySection Component
 * Displays and edits service delivery preferences
 */

import React from 'react'
import { Box, Grid, TextField, Typography, Stack, FormControlLabel, Checkbox, useTheme, alpha } from '@mui/material'
import { Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { CheckCircle } from '@mui/icons-material'

/**
 * ServiceDeliverySection Component
 */
const ServiceDeliverySection = ({
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
          Service Delivery
        </Typography>

        {isEditMode ? (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceDelivery.inPerson"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value ?? true} />}
                    label="In Person"
                    sx={{
                      '& .MuiCheckbox-root': {
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceDelivery.remote"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value ?? false} />}
                    label="Remote"
                    sx={{
                      '& .MuiCheckbox-root': {
                        color: theme.palette.primary.main,
                        '&.Mui-checked': {
                          color: theme.palette.primary.main,
                        }
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceDelivery.preferredStartDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    type="date"
                    size={isMobile ? 'small' : 'medium'}
                    label="Preferred Start Date"
                    InputLabelProps={{ shrink: true }}
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
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="serviceDelivery.sessionDurationMins"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    type="number"
                    size={isMobile ? 'small' : 'medium'}
                    label="Session Duration (minutes)"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
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
                )}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={4}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {preferences?.serviceDelivery?.inPerson ? (
                  <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                ) : null}
                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                  In Person
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {preferences?.serviceDelivery?.remote ? (
                  <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                ) : null}
                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                  Remote
                </Typography>
              </Stack>
            </Grid>
            {preferences?.serviceDelivery?.preferredStartDate && (
              <Grid item xs={12} sm={4}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={500} 
                  sx={{ mb: 1, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  Preferred Start Date
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                  {format(new Date(preferences.serviceDelivery.preferredStartDate), 'dd/MM/yyyy')}
                </Typography>
              </Grid>
            )}
            {preferences?.serviceDelivery?.sessionDurationMins && (
              <Grid item xs={12} sm={4}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={500} 
                  sx={{ mb: 1, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  Session Duration
                </Typography>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                  {preferences.serviceDelivery.sessionDurationMins} mins
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Box>
  )
}

export default ServiceDeliverySection
