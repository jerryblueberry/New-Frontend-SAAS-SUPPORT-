// src/components/workerForm/components/LocationTravelSection.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Slider,
  Alert,
  useTheme,
  Chip,
} from '@mui/material';
import { MapPin, Car, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import SuburbSelector from '../SuburbSelector';

/**
 * LocationTravelSection Component
 * 
 * A component that combines location selection and travel distance configuration.
 * 
 * @param {object} availability - Availability object with suburb and kmWillingToTravel
 * @param {function} updateAvailability - Callback to update availability
 * @param {object} errors - Error object with suburb and travelDistance keys
 * @param {function} setErrors - Callback to set errors
 * @param {object} touched - Object tracking which fields have been touched
 * @param {object} validationState - Object containing validation state for each field
 * @param {function} onSuburbChange - Callback when suburb changes
 * @param {function} onTravelDistanceChange - Callback when travel distance changes
 */
const LocationTravelSection = ({ 
  availability, 
  updateAvailability, 
  errors, 
  setErrors,
  touched = {},
  validationState = {},
  onSuburbChange,
  onTravelDistanceChange,
}) => {
  const theme = useTheme();
  const travelDistance = availability.kmWillingToTravel || 20;
  const suburb = availability.suburb || '';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* Location Card */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '14px',
          bgcolor: 'background.paper',
          border: `1px solid ${errors.suburb ? theme.palette.error.main : alpha(theme.palette.divider, 0.08)}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: errors.suburb ? theme.palette.error.main : alpha(theme.palette.divider, 0.12),
            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <MapPin size={18} color="#475569" strokeWidth={2} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
              Your Location
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              Where are you based?
            </Typography>
          </Box>
        </Box>

        {/* Selector */}
        <Box sx={{ mb: 2 }}>
          <SuburbSelector
            suburbInput={suburb}
            setSuburbInput={onSuburbChange || ((val) => updateAvailability({ suburb: val }))}
            updateAvailability={updateAvailability}
            errors={errors}
            setErrors={setErrors}
          />
        </Box>

        {/* Validation Feedback */}
        {touched.suburb && validationState.suburb && (
          <Box sx={{ mb: 1.5 }}>
            {validationState.suburb.status === 'success' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 1, borderRadius: '8px', bgcolor: '#ecfdf5', border: '1px solid #10b98130' }}>
                <CheckCircle2 size={14} color="#10b981" strokeWidth={2.5} />
                <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>
                  Location set successfully
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, p: 1, borderRadius: '8px', bgcolor: '#fef2f2', border: '1px solid #ef444430' }}>
                <AlertCircle size={14} color="#ef4444" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#991b1b', lineHeight: 1.4 }}>
                  {validationState.suburb.error || 'Please enter your location'}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Tip */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1.5, py: 1, borderRadius: '8px', bgcolor: '#f8fafc' }}>
          <Lightbulb size={12} color="#94a3b8" />
          <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', lineHeight: 1.4 }}>
            Your location helps employers find workers in their area. This increases your job match rate.
          </Typography>
        </Box>
      </Box>

      {/* Travel Distance Card */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: '14px',
          bgcolor: 'background.paper',
          border: `1px solid ${errors.travelDistance ? theme.palette.error.main : alpha(theme.palette.divider, 0.08)}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: errors.travelDistance ? theme.palette.error.main : alpha(theme.palette.divider, 0.12),
            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Car size={18} color="#475569" strokeWidth={2} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
              Travel Radius
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>
              How far will you go?
            </Typography>
          </Box>
          {/* Distance Badge */}
          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: '8px',
              bgcolor: '#3b82f6',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
            }}
          >
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
              {travelDistance} km
            </Typography>
          </Box>
        </Box>

        {/* Slider */}
        <Box sx={{ px: 0.5, mb: 1.5 }}>
          <Slider
            value={travelDistance}
            onChange={(_, val) => {
              if (onTravelDistanceChange) {
                onTravelDistanceChange(val);
              } else {
                updateAvailability({ kmWillingToTravel: val });
                setErrors(prev => ({ ...prev, travelDistance: null }));
              }
            }}
            min={1}
            max={100}
            step={1}
            sx={{
              height: 6,
              '& .MuiSlider-thumb': {
                height: 20,
                width: 20,
                backgroundColor: '#fff',
                border: '2px solid #3b82f6',
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.25)',
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0 0 0 6px ${alpha('#3b82f6', 0.1)}`,
                },
              },
              '& .MuiSlider-track': { bgcolor: '#3b82f6', border: 'none' },
              '& .MuiSlider-rail': { bgcolor: '#e2e8f0' },
            }}
          />
          {/* Range Labels */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>1 km</Typography>
            <Typography sx={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 500 }}>100 km</Typography>
          </Box>
        </Box>

        {/* Validation Feedback */}
        {touched.travelDistance && validationState.travelDistance && (
          <Box sx={{ mb: 1.5 }}>
            {validationState.travelDistance.status === 'success' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, p: 1, borderRadius: '8px', bgcolor: '#ecfdf5', border: '1px solid #10b98130' }}>
                <CheckCircle2 size={14} color="#10b981" strokeWidth={2.5} />
                <Typography sx={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>
                  Travel radius configured
                </Typography>
              </Box>
            ) : validationState.travelDistance.status === 'warning' ? (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, p: 1, borderRadius: '8px', bgcolor: '#fef3c7', border: '1px solid #f59e0b30' }}>
                <AlertCircle size={14} color="#f59e0b" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#92400e', lineHeight: 1.4 }}>
                  {validationState.travelDistance.message || 'Consider increasing your radius for more opportunities'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, p: 1, borderRadius: '8px', bgcolor: '#fef2f2', border: '1px solid #ef444430' }}>
                <AlertCircle size={14} color="#ef4444" strokeWidth={2.5} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#991b1b', lineHeight: 1.4 }}>
                  {validationState.travelDistance.error || errors.travelDistance}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {errors.travelDistance && !touched.travelDistance && (
          <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px', py: 0.25 }}>
            {errors.travelDistance}
          </Alert>
        )}

        {/* Dynamic Tip based on distance */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, px: 1.5, py: 1, borderRadius: '8px', bgcolor: '#f8fafc' }}>
          <Lightbulb size={12} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontSize: '0.6875rem', color: '#64748b', lineHeight: 1.4, mb: 0.25 }}>
              {travelDistance < 10 
                ? 'Small radius limits opportunities. Consider increasing to 15-20km for better job matches.'
                : travelDistance < 30
                ? 'Good balance! This radius should provide plenty of opportunities while keeping travel reasonable.'
                : 'Large radius! You\'ll see many opportunities, but be prepared for longer travel times.'}
            </Typography>
            <Typography sx={{ fontSize: '0.625rem', color: '#94a3b8', lineHeight: 1.4 }}>
              💡 Tip: You can adjust this anytime from your profile settings
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

LocationTravelSection.propTypes = {
  availability: PropTypes.object.isRequired,
  updateAvailability: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  setErrors: PropTypes.func.isRequired,
  touched: PropTypes.object,
  validationState: PropTypes.object,
  onSuburbChange: PropTypes.func,
  onTravelDistanceChange: PropTypes.func,
};

export default React.memo(LocationTravelSection);

