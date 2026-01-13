/**
 * CulturalPreferencesSection Component
 * Displays and edits cultural preferences (dietary, religious, lifestyle)
 */

import React from 'react'
import { Box, Grid, TextField, MenuItem, Typography, Chip, Stack, FormControlLabel, Checkbox, Button, useTheme, alpha } from '@mui/material'
import { Controller } from 'react-hook-form'
import { Add as AddIcon } from '@mui/icons-material'
import { DIETARY_RESTRICTIONS, DIETARY_RESTRICTION_LABELS } from '../../../../../constants/clientOnboardingConstants'

/**
 * CulturalPreferencesSection Component
 */
const CulturalPreferencesSection = ({
  isEditMode,
  preferences,
  register,
  control,
  errors,
  observanceInput,
  setObservanceInput,
  habitInput,
  setHabitInput,
  interestInput,
  setInterestInput,
  valueInput,
  setValueInput,
  watchedDietaryRestrictions,
  watchedObservances,
  watchedHabits,
  watchedInterests,
  watchedValues,
  handleAddArrayItem,
  handleRemoveArrayItem,
  isMobile
}) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            Cultural Preferences
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
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Dietary Requirements */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.02), 
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` 
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                    Dietary Requirements
                  </Typography>
                  <Controller
                    name="culturalPreferences.dietaryRequirements.restrictions"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                        label="Dietary Restrictions"
                        SelectProps={{
                          multiple: true,
                          renderValue: (selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={DIETARY_RESTRICTION_LABELS[value] || value}
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
                        {...field}
                        value={field.value || []}
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
                        {DIETARY_RESTRICTIONS.map((restriction) => (
                          <MenuItem key={restriction} value={restriction}>
                            {DIETARY_RESTRICTION_LABELS[restriction] || restriction}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                  <TextField
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                    label="Allergy Details"
                    placeholder="e.g., Peanuts, Shellfish, Dairy"
                    {...register('culturalPreferences.dietaryRequirements.allergyDetails')}
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
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    size={isMobile ? 'small' : 'medium'}
                    label="Dietary Notes (Optional)"
                    placeholder="Additional dietary information..."
                    {...register('culturalPreferences.dietaryRequirements.notes')}
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
                </Stack>
              </Box>
            </Grid>

            {/* Religious Considerations */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.info.main, 0.02), 
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` 
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                    Religious Considerations
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                        label="Faith"
                        placeholder="e.g., Christian, Muslim, Jewish, Hindu, Buddhist"
                        {...register('culturalPreferences.religiousConsiderations.faith')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'transparent',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.02),
                            },
                            '&.Mui-focused': {
                              bgcolor: alpha(theme.palette.info.main, 0.04),
                            }
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Controller
                            name="culturalPreferences.religiousConsiderations.genderSensitivity"
                            control={control}
                            render={({ field }) => (
                              <Checkbox {...field} checked={field.value || false} />
                            )}
                          />
                        }
                        label="Gender Sensitivity Required"
                        sx={{ mt: { xs: 0, sm: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            size={isMobile ? 'small' : 'medium'}
                            label="Religious Observances"
                            placeholder="e.g., Friday prayers, Ramadan, Sabbath"
                            value={observanceInput}
                            onChange={(e) => setObservanceInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddArrayItem('culturalPreferences.religiousConsiderations.observances', observanceInput, setObservanceInput)
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                bgcolor: 'transparent',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.info.main, 0.02),
                                },
                                '&.Mui-focused': {
                                  bgcolor: alpha(theme.palette.info.main, 0.04),
                                }
                              },
                            }}
                          />
                          <Button
                            variant="outlined"
                            onClick={() => handleAddArrayItem('culturalPreferences.religiousConsiderations.observances', observanceInput, setObservanceInput)}
                            disabled={!observanceInput.trim()}
                            startIcon={<AddIcon />}
                            sx={{ 
                              borderRadius: 2, 
                              textTransform: 'none', 
                              minWidth: { xs: 80, sm: 100 },
                              borderColor: alpha(theme.palette.info.main, 0.3),
                              color: 'info.main',
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              '&:hover': {
                                borderColor: theme.palette.info.main,
                                bgcolor: alpha(theme.palette.info.main, 0.04),
                              }
                            }}
                          >
                            Add
                          </Button>
                        </Stack>
                        {watchedObservances && watchedObservances.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {watchedObservances.map((obs, idx) => (
                              <Chip
                                key={idx}
                                label={obs}
                                onDelete={() => handleRemoveArrayItem('culturalPreferences.religiousConsiderations.observances', obs)}
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main,
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                  fontWeight: 500,
                                  height: 28,
                                  '& .MuiChip-deleteIcon': {
                                    color: theme.palette.info.main,
                                    '&:hover': {
                                      color: theme.palette.error.main,
                                    }
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        size={isMobile ? 'small' : 'medium'}
                        label="Religious Notes (Optional)"
                        placeholder="Additional religious considerations..."
                        {...register('culturalPreferences.religiousConsiderations.notes')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'transparent',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.info.main, 0.02),
                            },
                            '&.Mui-focused': {
                              bgcolor: alpha(theme.palette.info.main, 0.04),
                            }
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            </Grid>

            {/* Lifestyle Notes */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.02), 
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` 
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                    Lifestyle Notes
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={1}>
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Habits</Typography>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g., Early riser"
                            value={habitInput}
                            onChange={(e) => setHabitInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddArrayItem('culturalPreferences.lifestyleNotes.habits', habitInput, setHabitInput)
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                bgcolor: 'transparent',
                              },
                            }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleAddArrayItem('culturalPreferences.lifestyleNotes.habits', habitInput, setHabitInput)}
                            disabled={!habitInput.trim()}
                            sx={{
                              minWidth: 40,
                              borderColor: alpha(theme.palette.success.main, 0.3),
                              color: 'success.main',
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        </Stack>
                        {watchedHabits && watchedHabits.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {watchedHabits.map((habit, idx) => (
                              <Chip
                                key={idx}
                                label={habit}
                                onDelete={() => handleRemoveArrayItem('culturalPreferences.lifestyleNotes.habits', habit)}
                                size="small"
                                sx={{ 
                                  height: 24,
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.main,
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={1}>
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Interests</Typography>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g., Reading"
                            value={interestInput}
                            onChange={(e) => setInterestInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddArrayItem('culturalPreferences.lifestyleNotes.interests', interestInput, setInterestInput)
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                bgcolor: 'transparent',
                              },
                            }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleAddArrayItem('culturalPreferences.lifestyleNotes.interests', interestInput, setInterestInput)}
                            disabled={!interestInput.trim()}
                            sx={{
                              minWidth: 40,
                              borderColor: alpha(theme.palette.success.main, 0.3),
                              color: 'success.main',
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        </Stack>
                        {watchedInterests && watchedInterests.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {watchedInterests.map((interest, idx) => (
                              <Chip
                                key={idx}
                                label={interest}
                                onDelete={() => handleRemoveArrayItem('culturalPreferences.lifestyleNotes.interests', interest)}
                                size="small"
                                sx={{ 
                                  height: 24,
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.main,
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Stack spacing={1}>
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Values</Typography>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="e.g., Independence"
                            value={valueInput}
                            onChange={(e) => setValueInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleAddArrayItem('culturalPreferences.lifestyleNotes.values', valueInput, setValueInput)
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 1.5,
                                bgcolor: 'transparent',
                              },
                            }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleAddArrayItem('culturalPreferences.lifestyleNotes.values', valueInput, setValueInput)}
                            disabled={!valueInput.trim()}
                            sx={{
                              minWidth: 40,
                              borderColor: alpha(theme.palette.success.main, 0.3),
                              color: 'success.main',
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        </Stack>
                        {watchedValues && watchedValues.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {watchedValues.map((value, idx) => (
                              <Chip
                                key={idx}
                                label={value}
                                onDelete={() => handleRemoveArrayItem('culturalPreferences.lifestyleNotes.values', value)}
                                size="small"
                                sx={{ 
                                  height: 24,
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.main,
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        size={isMobile ? 'small' : 'medium'}
                        label="Lifestyle Notes (Optional)"
                        placeholder="Additional lifestyle information..."
                        {...register('culturalPreferences.lifestyleNotes.notes')}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'transparent',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.success.main, 0.02),
                            },
                            '&.Mui-focused': {
                              bgcolor: alpha(theme.palette.success.main, 0.04),
                            }
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {preferences?.culturalPreferences && (
              <>
                {preferences.culturalPreferences.dietaryRequirements && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>Dietary Requirements</Typography>
                    {preferences.culturalPreferences.dietaryRequirements.restrictions?.length > 0 && (
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {preferences.culturalPreferences.dietaryRequirements.restrictions.map((r, idx) => (
                          <Chip 
                            key={idx} 
                            label={DIETARY_RESTRICTION_LABELS[r] || r} 
                            size="small" 
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              height: 24,
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                    {preferences.culturalPreferences.dietaryRequirements.allergyDetails && (
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                        <strong>Allergies:</strong> {preferences.culturalPreferences.dietaryRequirements.allergyDetails}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Grid>
            )}
            {preferences.culturalPreferences.religiousConsiderations && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.02), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>Religious Considerations</Typography>
                    {preferences.culturalPreferences.religiousConsiderations.faith && (
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                        <strong>Faith:</strong> {preferences.culturalPreferences.religiousConsiderations.faith}
                      </Typography>
                    )}
                    {preferences.culturalPreferences.religiousConsiderations.observances?.length > 0 && (
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {preferences.culturalPreferences.religiousConsiderations.observances.map((obs, idx) => (
                          <Chip 
                            key={idx} 
                            label={obs} 
                            size="small" 
                            sx={{
                              bgcolor: alpha(theme.palette.info.main, 0.1),
                              color: theme.palette.info.main,
                              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                              height: 24,
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                    {preferences.culturalPreferences.religiousConsiderations.genderSensitivity && (
                      <Chip 
                        label="Gender Sensitivity Required" 
                        size="small" 
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                          height: 24,
                          width: 'fit-content',
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Grid>
            )}
            {preferences.culturalPreferences.lifestyleNotes && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.02), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>Lifestyle Notes</Typography>
                    {preferences.culturalPreferences.lifestyleNotes.habits?.length > 0 && (
                      <Box>
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Habits:</Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                          {preferences.culturalPreferences.lifestyleNotes.habits.map((h, idx) => (
                            <Chip 
                              key={idx} 
                              label={h} 
                              size="small" 
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                height: 24,
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    {preferences.culturalPreferences.lifestyleNotes.interests?.length > 0 && (
                      <Box>
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Interests:</Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                          {preferences.culturalPreferences.lifestyleNotes.interests.map((i, idx) => (
                            <Chip 
                              key={idx} 
                              label={i} 
                              size="small" 
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                height: 24,
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                    {preferences.culturalPreferences.lifestyleNotes.values?.length > 0 && (
                      <Box>
                        <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>Values:</Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                          {preferences.culturalPreferences.lifestyleNotes.values.map((v, idx) => (
                            <Chip 
                              key={idx} 
                              label={v} 
                              size="small" 
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                height: 24,
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Box>
              </Grid>
            )}
              </>
            )}
            {(!preferences?.culturalPreferences || 
              (!preferences.culturalPreferences.dietaryRequirements && 
               !preferences.culturalPreferences.religiousConsiderations && 
               !preferences.culturalPreferences.lifestyleNotes)) && (
              <Grid item xs={12}>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, opacity: 0.7 }}
                >
                  No cultural preferences set
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Box>
  )
}

export default CulturalPreferencesSection
