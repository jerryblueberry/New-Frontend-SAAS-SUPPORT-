import React from 'react'
import { Box, Grid, TextField, MenuItem, Stack, Typography, Paper, Chip, Tooltip, alpha, useTheme } from '@mui/material'
import { Category as CategoryIcon, LocationOn as LocationOnIcon, Info as InfoIcon } from '@mui/icons-material'
import { Controller, useFormContext } from 'react-hook-form'
import { SUPPORT_CATEGORIES, SUPPORT_CATEGORY_LABELS } from '../constants'
import MultiLocationSelector from './MultiLocationSelector'

const BasicPreferences = ({ isOrganization }) => {
  const { control } = useFormContext()
  const theme = useTheme()

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 3, sm: 4, md: 5 },
        borderRadius: 4,
        border: `2px solid ${alpha(theme.palette.divider, 0.12)}`,
        background: theme.palette.background.paper,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.04)}`,
        '&:hover': {
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
          borderColor: alpha(theme.palette.primary.main, 0.25),
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between" flexWrap="wrap" sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 },
              borderRadius: 3,
              bgcolor: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            <CategoryIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: 'primary.main' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }, mb: 0.5 }}>
              Basic Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '0.9rem' } }}>
              {isOrganization 
                ? 'Define your organization\'s service needs. These preferences will be used when posting jobs and matching workers.'
                : 'Tell us about your support needs. These preferences help us match you with the right workers and can be used when posting jobs.'}
            </Typography>
          </Box>
        </Stack>
        <Chip
          size="small"
          label="Required"
          color="error"
          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
        />
      </Stack>
      
      <Grid container spacing={{ xs: 3, sm: 3.5, md: 4 }}>
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <CategoryIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography 
              variant="subtitle1" 
              fontWeight={700} 
              sx={{ 
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' },
                color: 'text.primary'
              }}
            >
              Support Categories *
            </Typography>
            <Tooltip 
              title={isOrganization 
                ? "Select NDIS support categories your organization provides. These will be used in job postings to match workers with relevant experience."
                : "Select the NDIS support categories you need. This helps match you with qualified workers and can be used when creating job postings."}
              arrow
              placement="top"
            >
              <InfoIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
            </Tooltip>
          </Stack>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2.5, 
              display: 'block',
              fontSize: { xs: '0.875rem', sm: '0.9rem' },
              lineHeight: 1.6,
              pl: 4.5
            }}
          >
            {isOrganization 
              ? 'Choose the support categories your organization offers. Workers with experience in these areas will be matched to your job postings.'
              : 'Select the types of support you need. This information helps us find workers with the right skills and experience for your needs.'}
          </Typography>
          <Controller
            name="supportCategories"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                size="medium"
                label="Select support categories"
                SelectProps={{ 
                  multiple: true, 
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, py: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={SUPPORT_CATEGORY_LABELS[value] || value}
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
                {...field}
                value={field.value || []}
              >
                {SUPPORT_CATEGORIES.map((v) => (
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
                    {SUPPORT_CATEGORY_LABELS[v] || v}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
              
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <LocationOnIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <Typography 
              variant="subtitle1" 
              fontWeight={700} 
              sx={{ 
                fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' },
                color: 'text.primary'
              }}
            >
              Service Regions (Locations) *
            </Typography>
            <Tooltip 
              title={isOrganization 
                ? "Add locations where your organization provides services. These will be used in job postings to match workers in the right areas."
                : "Select locations where you need support. This helps match you with nearby workers and can be used when posting jobs."}
              arrow
              placement="top"
            >
              <InfoIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
            </Tooltip>
          </Stack>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2.5, 
              display: 'block',
              fontSize: { xs: '0.875rem', sm: '0.9rem' },
              lineHeight: 1.6,
              pl: 4.5
            }}
          >
            {isOrganization 
              ? 'Add all locations where your organization operates or provides services. Workers in these areas will see your job postings.'
              : 'Search and select locations where you need service support. You can add multiple locations to find workers nearby.'}
          </Typography>
          <Controller
            name="serviceRegions"
            control={control}
            render={({ field, fieldState }) => (
              <MultiLocationSelector
                value={field.value || []}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  )
}

export default BasicPreferences

