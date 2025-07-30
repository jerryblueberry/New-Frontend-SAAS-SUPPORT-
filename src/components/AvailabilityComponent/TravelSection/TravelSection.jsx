import React from 'react';
import { Box, Typography, Avatar, Slider, Alert, Card, CardContent } from '@mui/material';
import { DirectionsCar as CarIcon } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * TravelSection - Card for selecting travel distance (km willing to travel)
 * Props:
 *   value: number (current km value)
 *   onChange: function (called with new value)
 *   error: string (error message, optional)
 *   disabled: boolean (optional)
 */
const TravelSection = ({ value, onChange, error, disabled }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: error ? `2px solid ${theme.palette.error.main}` : '1px solid',
        borderColor: error ? theme.palette.error.main : 'divider',
        height: '100%',
        boxShadow: theme.shadows[1],
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{
            bgcolor: alpha(theme.palette.success.main, 0.1),
            color: theme.palette.success.main
          }}>
            <CarIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Travel Distance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              How many km are you willing to travel from your place of residence
            </Typography>
          </Box>
        </Box>

        <Box mb={3}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.palette.success.main,
              mb: 2,
              textAlign: 'center'
            }}
          >
            {value} km
          </Typography>

          <Slider
            value={value}
            onChange={(_, val) => onChange(val)}
            min={1}
            max={100}
            step={1}
            valueLabelDisplay="auto"
            disabled={disabled}
            sx={{
              height: 8,
              '& .MuiSlider-thumb': {
                height: 24,
                width: 24,
                backgroundColor: '#fff',
                border: `2px solid ${theme.palette.success.main}`,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0 0 0 8px ${alpha(theme.palette.success.main, 0.16)}`,
                },
                '&.Mui-active': {
                  boxShadow: `0 0 0 14px ${alpha(theme.palette.success.main, 0.16)}`,
                },
              },
              '& .MuiSlider-track': {
                border: 'none',
                bgcolor: theme.palette.success.main,
              },
              '& .MuiSlider-rail': {
                opacity: 0.5,
                bgcolor: theme.palette.grey[400],
              },
              '& .MuiSlider-valueLabel': {
                lineHeight: 1.2,
                fontSize: 12,
                background: 'unset',
                padding: 0,
                width: 32,
                height: 32,
                borderRadius: '50% 50% 50% 0',
                backgroundColor: theme.palette.success.main,
                transformOrigin: 'bottom left',
                transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
                '&:before': { display: 'none' },
                '&.MuiSlider-valueLabelOpen': {
                  transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
                },
                '& > *': {
                  transform: 'rotate(45deg)',
                },
              },
            }}
          />

          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="text.secondary">
              1 km
            </Typography>
            <Typography variant="caption" color="text.secondary">
              100 km
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TravelSection;
