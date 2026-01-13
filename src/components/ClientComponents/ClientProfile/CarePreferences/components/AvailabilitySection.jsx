/**
 * AvailabilitySection Component
 * Displays and edits availability schedule
 */

import React from 'react'
import { Box, Grid, Typography, Chip, Stack, FormControlLabel, Checkbox, useTheme, alpha } from '@mui/material'
import { DAYS, TIME_SLOTS } from '../../../../../constants/clientOnboardingConstants'

/**
 * AvailabilitySection Component
 */
const AvailabilitySection = ({
  isEditMode,
  preferences,
  watchedAvailability,
  handleToggleAvailability,
  isMobile
}) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            Availability Schedule
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
          <Grid container spacing={2}>
            {DAYS.map((day) => {
              const dayLabel = day.charAt(0).toUpperCase() + day.slice(1)
              const dayAvailability = watchedAvailability?.find((a) => a.day === day)
              const dayTimeSlots = dayAvailability?.timeSlots || []

              return (
                <Grid item xs={12} sm={6} md={4} key={day}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      }
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600} 
                      sx={{ mb: 1.5, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
                    >
                      {dayLabel}
                    </Typography>
                    <Stack spacing={1}>
                      {TIME_SLOTS.map((timeSlot) => {
                        const isSelected = dayTimeSlots.includes(timeSlot)
                        const timeSlotLabel = timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)
                        return (
                          <FormControlLabel
                            key={timeSlot}
                            control={
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleToggleAvailability(day, timeSlot)}
                                size="small"
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&.Mui-checked': {
                                    color: theme.palette.primary.main,
                                  }
                                }}
                              />
                            }
                            label={timeSlotLabel}
                            sx={{ m: 0 }}
                          />
                        )
                      })}
                    </Stack>
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {preferences?.availability && preferences.availability.length > 0 ? (
              preferences.availability.map((avail, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600} 
                      sx={{ mb: 1, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
                    >
                      {avail.day.charAt(0).toUpperCase() + avail.day.slice(1)}
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                      {avail.timeSlots.map((slot, slotIdx) => (
                        <Chip
                          key={slotIdx}
                          label={slot.charAt(0).toUpperCase() + slot.slice(1)}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            fontWeight: 500,
                            height: 24,
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, opacity: 0.7 }}
                >
                  No availability schedule set
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Box>
  )
}

export default AvailabilitySection
