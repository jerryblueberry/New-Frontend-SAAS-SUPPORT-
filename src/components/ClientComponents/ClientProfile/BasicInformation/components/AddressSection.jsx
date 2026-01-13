/**
 * AddressSection Component
 * Displays and edits service address with GPS location support
 */

import React from 'react'
import { Box, Grid, TextField, Typography, Chip, Stack, Button, Alert, Collapse, useTheme, alpha, CircularProgress } from '@mui/material'
import { LocationOn as LocationIcon, MyLocation as MyLocationIcon, Edit as EditIcon, CheckCircle } from '@mui/icons-material'
import { Controller } from 'react-hook-form'

/**
 * AddressSection Component
 */
const AddressSection = ({
  isEditMode,
  basicInfo,
  register,
  control,
  errors,
  addressMethod,
  setAddressMethod,
  location,
  handleGetCurrentLocation,
  isMobile
}) => {
  const theme = useTheme()

  return (
    <Box>
      <Stack spacing={{ xs: 3, sm: 4 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between" flexWrap="wrap">
          <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
            Service Address
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
            {/* Address Method Selection */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box
                  onClick={() => setAddressMethod('geolocation')}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    border: `1px solid ${addressMethod === 'geolocation' ? theme.palette.primary.main : alpha(theme.palette.divider, 0.12)}`,
                    bgcolor: addressMethod === 'geolocation' ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: { xs: 40, sm: 44 },
                        height: { xs: 40, sm: 44 },
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: addressMethod === 'geolocation' ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.08),
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <MyLocationIcon sx={{ fontSize: { xs: 20, sm: 22 }, color: addressMethod === 'geolocation' ? 'white' : 'primary.main' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                        GPS Location
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Quick & accurate
                      </Typography>
                    </Box>
                    {addressMethod === 'geolocation' && (
                      <CheckCircle sx={{ fontSize: { xs: 20, sm: 22 }, color: 'primary.main' }} />
                    )}
                  </Stack>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  onClick={() => setAddressMethod('manual')}
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    border: `1px solid ${addressMethod === 'manual' ? theme.palette.primary.main : alpha(theme.palette.divider, 0.12)}`,
                    bgcolor: addressMethod === 'manual' ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        width: { xs: 40, sm: 44 },
                        height: { xs: 40, sm: 44 },
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: addressMethod === 'manual' ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.08),
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <EditIcon sx={{ fontSize: { xs: 20, sm: 22 }, color: addressMethod === 'manual' ? 'white' : 'primary.main' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                        Manual Entry
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Type your address
                      </Typography>
                    </Box>
                    {addressMethod === 'manual' && (
                      <CheckCircle sx={{ fontSize: { xs: 20, sm: 22 }, color: 'primary.main' }} />
                    )}
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            {addressMethod === 'geolocation' && (
              <Button
                variant="outlined"
                fullWidth
                onClick={handleGetCurrentLocation}
                disabled={location.isLocating}
                startIcon={location.isLocating ? <CircularProgress size={18} color="inherit" /> : <MyLocationIcon />}
                sx={{
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: 'primary.main',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                {location.isLocating ? 'Detecting Location...' : location.coordinates ? 'Update My Location' : 'Detect My Location'}
              </Button>
            )}

            {addressMethod === 'geolocation' && location.coordinates && location.addressInfo && (
              <Alert 
                severity="success" 
                sx={{ 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <Typography variant="body2" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}>
                  Location Detected Successfully
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {location.addressInfo.displayName}
                </Typography>
              </Alert>
            )}

            <Collapse in={addressMethod === 'manual' || (addressMethod === 'geolocation' && location.coordinates)}>
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    size={isMobile ? 'small' : 'medium'}
                    label="Street Address *"
                    placeholder="123 Main Street"
                    {...register('address.street')}
                    error={!!errors.address?.street}
                    helperText={errors.address?.street?.message}
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ color: 'action.active', mr: 1, fontSize: 20 }} />,
                    }}
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
                    required
                    size={isMobile ? 'small' : 'medium'}
                    label="Suburb / City *"
                    placeholder="Perth"
                    {...register('address.suburb')}
                    error={!!errors.address?.suburb}
                    helperText={errors.address?.suburb?.message}
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

                <Grid item xs={6} sm={3}>
                  <TextField
                    fullWidth
                    required
                    size={isMobile ? 'small' : 'medium'}
                    label="State *"
                    placeholder="WA"
                    {...register('address.state')}
                    error={!!errors.address?.state}
                    helperText={errors.address?.state?.message}
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

                <Grid item xs={6} sm={3}>
                  <Controller
                    name="address.postcode"
                    control={control}
                    render={({ field: { onChange, value, onBlur }, fieldState: { error } }) => (
                      <TextField
                        fullWidth
                        required
                        size={isMobile ? 'small' : 'medium'}
                        label="Postcode *"
                        placeholder="6000"
                        value={value || ''}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 5)
                          onChange(digits)
                        }}
                        onBlur={onBlur}
                        error={!!error}
                        helperText={error?.message}
                        inputProps={{ maxLength: 5 }}
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
            </Collapse>
          </>
        ) : (
          basicInfo?.address && (
            <Box>
              <Typography 
                variant="body1" 
                fontWeight={500} 
                sx={{ 
                  fontSize: { xs: '0.9375rem', sm: '1rem' },
                  mb: 0.5
                }}
              >
                {basicInfo.address.street}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  opacity: 0.8
                }}
              >
                {basicInfo.address.suburb}, {basicInfo.address.state} {basicInfo.address.postcode}
              </Typography>
              {basicInfo.address.coordinates && basicInfo.address.coordinates.length === 2 && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 1, 
                    display: 'block',
                    fontSize: '0.75rem',
                    opacity: 0.6
                  }}
                >
                  Coordinates: {basicInfo.address.coordinates[1].toFixed(6)}, {basicInfo.address.coordinates[0].toFixed(6)}
                </Typography>
              )}
            </Box>
          )
        )}
      </Stack>
    </Box>
  )
}

export default AddressSection
