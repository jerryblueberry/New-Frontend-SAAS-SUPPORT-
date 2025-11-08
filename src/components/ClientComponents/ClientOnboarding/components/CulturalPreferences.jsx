import React from 'react'
import { Box, Grid, TextField, MenuItem, Stack, Typography, Accordion, AccordionSummary, AccordionDetails, Paper, Chip, Checkbox, FormControlLabel, Tooltip, alpha, useTheme } from '@mui/material'
import { ExpandMore, Diversity3 as Diversity3Icon, Restaurant as RestaurantIcon, Mosque as MosqueIcon, Info as InfoIcon } from '@mui/icons-material'
import { Controller, useFormContext } from 'react-hook-form'
import { DIETARY_RESTRICTIONS, DIETARY_RESTRICTION_LABELS } from '../constants'

const CulturalPreferences = ({ isOrganization }) => {
  const theme = useTheme()
  const { control, register } = useFormContext()

  return (
    <Accordion
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `2px solid ${alpha(theme.palette.divider, 0.12)}`,
        background: theme.palette.background.paper,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        '&:before': { display: 'none' },
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.2),
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`
        },
        '&.Mui-expanded': {
          margin: 0,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
          borderColor: alpha(theme.palette.primary.main, 0.25)
        }
      }}
    >
      <AccordionSummary 
        expandIcon={
          <ExpandMore sx={{ color: 'primary.main', fontSize: { xs: 28, sm: 32 }, transition: 'transform 0.3s ease' }} />
        }
        sx={{
          px: { xs: 3, sm: 4, md: 5 },
          py: { xs: 2.5, sm: 3 },
          minHeight: { xs: 72, sm: 80 },
          '&.Mui-expanded': {
            minHeight: { xs: 72, sm: 80 },
            borderBottom: `2px solid ${alpha(theme.palette.divider, 0.12)}`
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(180deg)'
          }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
          <Box
            sx={{
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              borderRadius: 3,
              bgcolor: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)}, ${alpha(theme.palette.warning.main, 0.1)})`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)}, ${alpha(theme.palette.warning.main, 0.1)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.warning.main, 0.2)}`
            }}
          >
            <Diversity3Icon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'warning.main' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h5" 
              fontWeight={800} 
              color="text.primary"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, mb: 0.5 }}
            >
              Cultural Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
              {isOrganization 
                ? 'Specify cultural requirements for your clients. This helps match workers who understand and respect these needs.'
                : 'Share important cultural considerations to help us match you with workers who understand and respect your needs.'}
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 3, sm: 4, md: 5 }, py: { xs: 3, sm: 4, md: 5 } }}>
        <Grid container spacing={{ xs: 3, sm: 3.5, md: 4 }}>
          {/* Dietary Requirements */}
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 3, sm: 3.5, md: 4 }, 
                borderRadius: 3, 
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: `2px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.08)}`
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <RestaurantIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Dietary Requirements
                </Typography>
                <Tooltip 
                  title={isOrganization 
                    ? "Specify dietary requirements for your clients. Workers with experience in these areas will be better matched."
                    : "Share any dietary restrictions or allergies. This helps match workers who can accommodate your needs."}
                  arrow
                  placement="top"
                >
                  <InfoIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Grid container spacing={{ xs: 3, sm: 3.5 }}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 500 }}>
                    Select dietary restrictions (optional)
                  </Typography>
                  <Controller
                    name="culturalPreferences.dietaryRequirements.restrictions"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        fullWidth
                        size="medium"
                        SelectProps={{
                          multiple: true,
                          renderValue: (selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, py: 0.5 }}>
                              {selected.map((value) => (
                                <Chip
                                  key={value}
                                  label={DIETARY_RESTRICTION_LABELS[value] || value}
                                  size="small"
                                  sx={{
                                    height: 28,
                                    fontSize: '0.8125rem',
                                    fontWeight: 500,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                    color: theme.palette.primary.main,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                    '& .MuiChip-label': {
                                      px: 1.25,
                                      py: 0
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          )
                        }}
                        {...field}
                        value={field.value || []}
                        sx={{
                          '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            fontWeight: 500,
                            '&.Mui-focused': {
                              color: theme.palette.primary.main,
                              fontWeight: 600
                            }
                          },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            minHeight: { xs: 48, sm: 52 },
                            transition: 'all 0.2s ease',
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.02),
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: 2
                              }
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: 2.5
                              },
                              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                            }
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: { xs: '13.5px 14px', sm: '15.5px 16px' },
                            fontSize: { xs: '0.95rem', sm: '1rem' }
                          }
                        }}
                      >
                        {DIETARY_RESTRICTIONS.map((restriction) => (
                          <MenuItem 
                            key={restriction} 
                            value={restriction}
                            sx={{
                              fontSize: { xs: '0.95rem', sm: '1rem' },
                              py: 1.25,
                              px: 2,
                              minHeight: 44,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08)
                              },
                              '&.Mui-selected': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.16)
                                }
                              }
                            }}
                          >
                            {DIETARY_RESTRICTION_LABELS[restriction] || restriction}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="medium"
                    label="Allergy Details"
                    placeholder="e.g., Peanuts, Shellfish, Dairy"
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: theme.palette.primary.main,
                          fontWeight: 600
                        }
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        minHeight: { xs: 48, sm: 52 },
                        transition: 'all 0.2s ease',
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2.5
                          },
                          boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: { xs: '13.5px 14px', sm: '15.5px 16px' },
                        fontSize: { xs: '0.95rem', sm: '1rem' }
                      }
                    }}
                    {...register('culturalPreferences.dietaryRequirements.allergyDetails')}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Religious Considerations */}
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 3, sm: 3.5, md: 4 }, 
                borderRadius: 3, 
                bgcolor: alpha(theme.palette.info.main, 0.03),
                border: `2px solid ${alpha(theme.palette.info.main, 0.15)}`,
                boxShadow: `0 2px 8px ${alpha(theme.palette.info.main, 0.08)}`
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <MosqueIcon sx={{ fontSize: 22, color: 'info.main' }} />
                <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Religious Considerations
                </Typography>
                <Tooltip 
                  title={isOrganization 
                    ? "Specify religious requirements for your clients. This helps match workers who understand and respect these needs."
                    : "Share any religious considerations. This helps match workers who understand and respect your faith and observances."}
                  arrow
                  placement="top"
                >
                  <InfoIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Grid container spacing={{ xs: 3, sm: 3.5 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="medium"
                    label="Faith"
                    placeholder="e.g., Christian, Muslim, Jewish, Hindu, Buddhist"
                    sx={{
                      '& .MuiInputLabel-root': {
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: theme.palette.primary.main,
                          fontWeight: 600
                        }
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        minHeight: { xs: 48, sm: 52 },
                        transition: 'all 0.2s ease',
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2
                          }
                        },
                        '&.Mui-focused': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2.5
                          },
                          boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                        }
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: { xs: '13.5px 14px', sm: '15.5px 16px' },
                        fontSize: { xs: '0.95rem', sm: '1rem' }
                      }
                    }}
                    {...register('culturalPreferences.religiousConsiderations.faith')}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...register('culturalPreferences.religiousConsiderations.genderSensitivity')}
                        sx={{
                          '&.Mui-checked': {
                            color: theme.palette.primary.main
                          }
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1rem' }, fontWeight: 500 }}>
                        Gender Sensitivity Required
                      </Typography>
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 500 }}>
                    Religious Observances (optional)
                  </Typography>
                  <Controller
                    name="culturalPreferences.religiousConsiderations.observances"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        size="medium"
                        placeholder="e.g., Friday prayers, Ramadan, Sabbath"
                        value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                        onChange={(e) => {
                          const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          field.onChange(arr)
                        }}
                        helperText="Separate multiple observances with commas"
                        sx={{
                          '& .MuiInputLabel-root': {
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            fontWeight: 500
                          },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            minHeight: { xs: 48, sm: 52 },
                            transition: 'all 0.2s ease',
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.02),
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: 2
                              }
                            },
                            '&.Mui-focused': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.primary.main,
                                borderWidth: 2.5
                              },
                              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                            }
                          },
                          '& .MuiOutlinedInput-input': {
                            padding: { xs: '13.5px 14px', sm: '15.5px 16px' },
                            fontSize: { xs: '0.95rem', sm: '1rem' }
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

export default CulturalPreferences

