import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Snackbar,
  Typography
} from '@mui/material';
import {
  WifiOff,
  Wifi,
  Refresh,
  Close,
  Error as ErrorIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';

const ConnectionStatus = () => {
  const {
    isOnline,
    connectionError,
    retryCount,
    clearError,
    isOffline,
    hasConnectionError
  } = useConnectionStatus();

  const [showDetails, setShowDetails] = React.useState(false);

  // Don't show anything if everything is working fine
  if (isOnline && !hasConnectionError) {
    return null;
  }

  const handleRetry = () => {
    clearError();
    // Trigger a page refresh or retry the last failed request
    window.location.reload();
  };

  const getAlertSeverity = () => {
    if (isOffline) return 'error';
    if (hasConnectionError) return 'warning';
    return 'info';
  };

  const getAlertIcon = () => {
    if (isOffline) return <WifiOff />;
    if (hasConnectionError) return <ErrorIcon />;
    return <Wifi />;
  };

  const getTitle = () => {
    if (isOffline) return 'No Internet Connection';
    if (hasConnectionError) return 'Connection Error';
    return 'Connection Status';
  };

  const getMessage = () => {
    if (isOffline) {
      return 'Please check your internet connection and try again.';
    }
    if (hasConnectionError) {
      return `Unable to connect to the server. ${retryCount > 0 ? `Retry attempt ${retryCount}/3.` : ''}`;
    }
    return 'Connection restored.';
  };

  return (
    <Snackbar
      open={isOffline || hasConnectionError}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity={getAlertSeverity()}
        icon={getAlertIcon()}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasConnectionError && (
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={handleRetry}
                sx={{ mr: 1 }}
              >
                Retry
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              sx={{ mr: 1 }}
            >
              {showDetails ? <Close /> : <WarningIcon />}
            </IconButton>
          </Box>
        }
        sx={{ minWidth: 400 }}
      >
        <AlertTitle>{getTitle()}</AlertTitle>
        {getMessage()}
        
        <Collapse in={showDetails}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Status:</strong> {isOffline ? 'Offline' : 'Online'}
            </Typography>
            {hasConnectionError && (
              <>
                <Typography variant="body2" color="text.secondary">
                  <strong>Error:</strong> {connectionError}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Retry Count:</strong> {retryCount}/3
                </Typography>
              </>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Tips:</strong>
              <br />
              • Check your internet connection
              <br />
              • Try refreshing the page
              <br />
              • Contact support if the issue persists
            </Typography>
          </Box>
        </Collapse>
      </Alert>
    </Snackbar>
  );
};

export default ConnectionStatus;
