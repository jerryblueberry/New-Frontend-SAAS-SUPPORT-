/**
 * AccountInformationSection Component
 * Displays and edits account type, organization name, and ABN
 */

import React from 'react'
import { Box, Grid, TextField, MenuItem, Typography, Chip, Stack, Alert, useTheme, alpha } from '@mui/material'
import { Person as PersonIcon } from '@mui/icons-material'
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from '../utils/constants'

/**
 * AccountInformationSection Component
 */
const AccountInformationSection = ({
  isEditMode,
  accountType,
  basicInfo,
  register,
  errors,
  canEditRestrictedFields,
  profileStatus,
  isMobile
}) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            Account Information
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
          <>
            {!canEditRestrictedFields && (
              <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                <Typography variant="body2">
                  Account type, organization name, and ABN cannot be changed while your profile is <strong>{profileStatus}</strong>.
                  You can still update NDIS number, address, and emergency contact at any time.
                </Typography>
              </Alert>
            )}
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={accountType === 'individual' ? 12 : 6}>
                <TextField
                  select
                  fullWidth
                  required
                  disabled={!canEditRestrictedFields}
                  size={isMobile ? 'small' : 'medium'}
                  label="Account Type *"
                  {...register('accountType')}
                  helperText={
                    !canEditRestrictedFields 
                      ? 'Cannot be changed after verification'
                      : undefined
                  }
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
                  {ACCOUNT_TYPES.map((v) => (
                    <MenuItem key={v} value={v}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {v === 'individual' ? <PersonIcon fontSize="small" /> : <BusinessIcon fontSize="small" />}
                        <span>{ACCOUNT_TYPE_LABELS[v]}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {accountType !== 'individual' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      disabled={!canEditRestrictedFields}
                      size={isMobile ? 'small' : 'medium'}
                      label="Organization Name *"
                      placeholder="Enter your organization's legal name"
                      {...register('organizationName')}
                      error={!!errors.organizationName}
                      helperText={
                        !canEditRestrictedFields 
                          ? 'Cannot be changed after verification'
                          : errors.organizationName?.message
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      disabled={!canEditRestrictedFields}
                      size={isMobile ? 'small' : 'medium'}
                      label="ABN (Australian Business Number) *"
                      placeholder="11 digits"
                      {...register('abn')}
                      error={!!errors.abn}
                      helperText={
                        !canEditRestrictedFields 
                          ? 'Cannot be changed after verification'
                          : errors.abn?.message
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                        },
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={500} 
                sx={{ mb: 1, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                Account Type
              </Typography>
              <Chip
                label={ACCOUNT_TYPE_LABELS[accountType]}
                icon={accountType === 'individual' ? <PersonIcon sx={{ fontSize: 16 }} /> : <BusinessIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  fontWeight: 500,
                  height: 28,
                }}
                size="small"
              />
            </Grid>
            {basicInfo?.organizationName && (
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={500} 
                  sx={{ mb: 1, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  Organization Name
                </Typography>
                <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                  {basicInfo.organizationName}
                </Typography>
              </Grid>
            )}
            {basicInfo?.abn && (
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={500} 
                  sx={{ mb: 1, display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  ABN
                </Typography>
                <Typography variant="body1" fontWeight={500} sx={{ fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
                  {basicInfo.abn}
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </Box>
  )
}

export default AccountInformationSection
