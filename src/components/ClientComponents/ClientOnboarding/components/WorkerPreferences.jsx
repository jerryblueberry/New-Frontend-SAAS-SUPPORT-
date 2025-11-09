import React from 'react'
import { Box, Grid, TextField, MenuItem, Stack, Typography, Accordion, AccordionSummary, AccordionDetails, Chip, alpha, useTheme } from '@mui/material'
import { ExpandMore, People as PeopleIcon } from '@mui/icons-material'
import { Controller, useFormContext } from 'react-hook-form'
import { PREFERRED_WORKER_GENDER, PREFERRED_WORKER_GENDER_LABELS, PREFERRED_AGE_GROUP, PREFERRED_AGE_GROUP_LABELS } from '../constants'
import MultiExperienceAreaSelector from './MultiExperienceAreaSelector'

const WorkerPreferences = ({ isOrganization }) => {
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
        <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between" flexWrap="wrap" sx={{ width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: 3,
                bgcolor: `linear-gradient(135deg, ${alpha(theme.palette.secondary?.main || theme.palette.warning.main, 0.2)}, ${alpha(theme.palette.secondary?.main || theme.palette.warning.main, 0.1)})`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.secondary?.main || theme.palette.warning.main, 0.2)}, ${alpha(theme.palette.secondary?.main || theme.palette.warning.main, 0.1)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${alpha(theme.palette.secondary?.main || theme.palette.warning.main, 0.3)}`,
                boxShadow: `0 4px 16px ${alpha(theme.palette.secondary?.main || theme.palette.warning.main, 0.2)}`
              }}
            >
              <PeopleIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'secondary.main' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h5" 
                fontWeight={800} 
                color="text.primary"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, mb: 0.5 }}
              >
                Worker Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
                {isOrganization 
                  ? 'Specify your ideal worker requirements. These will be used as default criteria when creating job postings.'
                  : 'Tell us about your preferred worker characteristics. These preferences help match you with suitable workers and can be used in job postings.'}
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label="Optional"
            color="info"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 3, sm: 4, md: 5 }, py: { xs: 3, sm: 4, md: 5 } }}>
        <Grid container spacing={{ xs: 3, sm: 3.5, md: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField 
              select 
              fullWidth 
              size="medium" 
              label="Preferred Gender" 
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
              {...register('workerPreferences.preferredGender')}
            >
              {PREFERRED_WORKER_GENDER.map(v => (
                <MenuItem 
                  key={v} 
                  value={v}
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
                  {PREFERRED_WORKER_GENDER_LABELS[v] || v}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              select 
              fullWidth 
              size="medium" 
              label="Preferred Age Group" 
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
              {...register('workerPreferences.preferredAgeGroup')}
            >
              {PREFERRED_AGE_GROUP.map(v => (
                <MenuItem 
                  key={v} 
                  value={v}
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
                  {PREFERRED_AGE_GROUP_LABELS[v] || v}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Typography 
              variant="subtitle1" 
              fontWeight={700} 
              sx={{ 
                mb: 1.5,
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' },
                color: 'text.primary'
              }}
            >
              Preferred Experience Areas
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2.5, 
                display: 'block',
                fontSize: { xs: '0.875rem', sm: '0.9rem' },
                lineHeight: 1.6
              }}
            >
              Select or add experience areas you prefer in support workers. You can add multiple areas.
            </Typography>
            <Controller
              name="workerPreferences.preferredExperienceAreas"
              control={control}
              render={({ field, fieldState }) => (
                <MultiExperienceAreaSelector
                  value={field.value || []}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField 
              fullWidth 
              size="medium" 
              multiline 
              rows={4} 
              label="Worker Preference Notes" 
              placeholder="Additional notes about worker preferences..."
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
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  lineHeight: 1.6
                }
              }}
              {...register('workerPreferences.notes')} 
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  )
}

export default WorkerPreferences

