/**
 * TravelDistanceCard Component
 * 
 * A production-ready, reusable component for travel distance preferences
 * Following industry best practices for component design and reusability
 */

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Slider,
} from '@mui/material';
import {
  DirectionsCar as DirectionsCarIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

// Km distance marks for slider
const KM_MARKS = [
  { value: 1, label: '1km' },
  { value: 10, label: '10km' },
  { value: 25, label: '25km' },
  { value: 50, label: '50km' },
  { value: 100, label: '100km+' }
];

/**
 * Travel Distance Card Component
 * Handles travel distance selection with slider
 */
const TravelDistanceCard = ({ 
  kmWillingToTravel, 
  onKmChange, 
  error, 
  disabled = false 
}) => {
  const theme = useTheme();

  // Enhanced km validation and change handler
  const handleKmChange = useCallback((event, newValue) => {
    onKmChange(event, newValue);
  }, [onKmChange]);

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: { xs: 2, sm: 3 },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: alpha(theme.palette.primary.main, 0.3),
        }
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center" sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: { xs: 1.5, sm: 2 },
              p: { xs: 0.8, sm: 1, md: 1.2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: { xs: 32, sm: 36, md: 40 },
              minHeight: { xs: 32, sm: 36, md: 40 }
            }}
          >
            <DirectionsCarIcon sx={{ 
              color: 'primary.main', 
              fontSize: { xs: 18, sm: 20, md: 24 } 
            }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              fontWeight={700} 
              sx={{
                fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' },
                lineHeight: { xs: 1.2, sm: 1.3 }
              }}
            >
              Travel Distance
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                lineHeight: 1.3,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Set how far you're willing to travel for work
            </Typography>
          </Box>
        </Stack>

        <Box>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <DirectionsCarIcon 
              color="action" 
              sx={{ fontSize: { xs: 18, sm: 20 } }} 
            />
            <Typography 
              variant="subtitle1" 
              fontWeight={600}
              sx={{
                fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }
              }}
            >
              Willing to travel: {kmWillingToTravel}km
            </Typography>
          </Stack>
          
          <Slider
            value={kmWillingToTravel}
            onChange={handleKmChange}
            min={1}
            max={100}
            step={1}
            marks={KM_MARKS}
            valueLabelDisplay="auto"
            disabled={disabled}
            sx={{
              '& .MuiSlider-thumb': {
                width: { xs: 20, sm: 24 },
                height: { xs: 20, sm: 24 },
                backgroundColor: theme.palette.primary.main,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  transform: 'scale(1.1)',
                }
              },
              '& .MuiSlider-track': {
                height: { xs: 4, sm: 6 },
                borderRadius: { xs: 2, sm: 3 },
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              },
              '& .MuiSlider-rail': {
                height: { xs: 4, sm: 6 },
                borderRadius: { xs: 2, sm: 3 },
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              '& .MuiSlider-mark': {
                width: { xs: 6, sm: 8 },
                height: { xs: 6, sm: 8 },
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.3),
              },
              '& .MuiSlider-markActive': {
                backgroundColor: theme.palette.primary.main,
              },
              '& .MuiSlider-markLabel': {
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                fontWeight: 500,
                color: theme.palette.text.secondary,
              }
            }}
          />
          
          {error && (
            <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
              {error}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

TravelDistanceCard.propTypes = {
  kmWillingToTravel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onKmChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

TravelDistanceCard.defaultProps = {
  error: '',
  disabled: false,
};

export default TravelDistanceCard;
