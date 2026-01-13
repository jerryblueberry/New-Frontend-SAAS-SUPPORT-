/**
 * OptionalFieldsSection Component
 * Displays and edits optional fields (NDIS Number, Emergency Contact)
 */

import React from 'react'
import { Box, Grid, TextField, Typography, Stack, useTheme, alpha } from '@mui/material'
import { Phone as PhoneIcon } from '@mui/icons-material'
import { Controller } from 'react-hook-form'
import { toE164Au, isValidAuPhone } from '../../../../../utils/phone'
import { formatAustralianPhone } from '../utils/formHelpers'

/**
 * OptionalFieldsSection Component
 */
const OptionalFieldsSection = ({
  isEditMode,
  basicInfo,
  register,
  control,
  errors,
  isMobile
}) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
          Additional Information
          <Typography 
            component="span" 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              ml: 1, 
              fontWeight: 400,
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              opacity: 0.7
            }}
          >
            (Optional)
          </Typography>
        </Typography>

        {isEditMode ? (
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                label="NDIS Number (Optional)"
                placeholder="Enter your NDIS participant number"
                {...register('ndisNumber')}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                label="Emergency Contact Name (Optional)"
                placeholder="John Doe"
                {...register('emergencyContact.name')}
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

            <Grid item xs={12} sm={6}>
              <Controller
                name="emergencyContact.phone"
                control={control}
                render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
                  <TextField
                    fullWidth
                    size={isMobile ? 'small' : 'medium'}
                    label="Emergency Contact Phone (Optional)"
                    placeholder="+61 4XX XXX XXX"
                    value={formatAustralianPhone(value || '')}
                    onChange={(e) => {
                      const e164 = toE164Au(e.target.value)
                      onChange(e164)
                    }}
                    onBlur={onBlur}
                    error={!!error || (!!value && !isValidAuPhone(value))}
                    helperText={
                      error?.message ||
                      (!!value && !isValidAuPhone(value)
                        ? 'Enter a valid Australian number'
                        : 'Australian format: +61 followed by 9 digits')
                    }
                    inputProps={{ maxLength: 18 }}
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
            {basicInfo?.ndisNumber && (
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={500} 
                  sx={{ mb: 1, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  NDIS Number
                </Typography>
                <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                  {basicInfo.ndisNumber}
                </Typography>
              </Grid>
            )}
            {basicInfo?.emergencyContact && (basicInfo.emergencyContact.name || basicInfo.emergencyContact.phone) && (
              <Grid item xs={12}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={500} 
                  sx={{ mb: 1.5, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  Emergency Contact
                </Typography>
                <Stack spacing={1}>
                  {basicInfo.emergencyContact.name && (
                    <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                      {basicInfo.emergencyContact.name}
                    </Typography>
                  )}
                  {basicInfo.emergencyContact.phone && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PhoneIcon sx={{ color: 'text.secondary', fontSize: 16, opacity: 0.7 }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' }, opacity: 0.8 }}
                      >
                        {basicInfo.emergencyContact.phone}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Box>
  )
}

export default OptionalFieldsSection
