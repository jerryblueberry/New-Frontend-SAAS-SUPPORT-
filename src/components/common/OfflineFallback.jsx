import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
  AlertTitle,
  Chip
} from '@mui/material';
import {
  WifiOff,
  Refresh,
  CloudOff,
  CheckCircle
} from '@mui/icons-material';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';

const OfflineFallback = ({ children, fallbackContent }) => {
  const { isOnline, hasConnectionError, connectionError } = useConnectionStatus();

  // Show fallback content when offline or has connection error
  if (!isOnline || hasConnectionError) {
    if (fallbackContent) {
      return fallbackContent;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          p: 3
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              <WifiOff sx={{ fontSize: 64, color: 'warning.main' }} />
              
              <Typography variant="h5" component="h2" textAlign="center">
                {!isOnline ? 'You\'re offline' : 'Connection Error'}
              </Typography>
              
              <Alert severity="warning" sx={{ width: '100%' }}>
                <AlertTitle>
                  {!isOnline ? 'No Internet Connection' : 'Server Unavailable'}
                </AlertTitle>
                <Typography variant="body2">
                  {!isOnline 
                    ? 'Please check your internet connection and try again.'
                    : connectionError || 'Unable to connect to the server. Please try again later.'
                  }
                </Typography>
              </Alert>

              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<CloudOff />}
                  label="Offline Mode"
                  color="warning"
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </Stack>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Some features may not be available while offline.
                Your data will sync when connection is restored.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Show connection restored message briefly
  if (isOnline && !hasConnectionError) {
    return (
      <Box sx={{ position: 'relative' }}>
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            minWidth: 300,
            animation: 'fadeInOut 3s ease-in-out',
            '@keyframes fadeInOut': {
              '0%': { opacity: 0, transform: 'translateX(-50%) translateY(-20px)' },
              '20%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
              '80%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
              '100%': { opacity: 0, transform: 'translateX(-50%) translateY(-20px)' }
            }
          }}
        >
          Connection restored
        </Alert>
        {children}
      </Box>
    );
  }

  return children;
};

export default OfflineFallback;
