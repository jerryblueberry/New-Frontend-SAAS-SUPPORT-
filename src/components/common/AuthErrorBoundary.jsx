import React, { Component } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh,
  Home,
  Login,
  WifiOff
} from '@mui/icons-material';

class AuthErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    try {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false
      }));
    } catch (error) {
      this.setState({ isRetrying: false });
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoToLogin = () => {
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount, isRetrying } = this.state;
      const isAuthError = error?.message?.includes('useAuth must be used within an AuthProvider') ||
                         error?.message?.includes('AuthProvider');
      const isConnectionError = error?.message?.includes('Network Error') || 
                               error?.message?.includes('Connection refused') ||
                               error?.message?.includes('ERR_CONNECTION_REFUSED');

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
            bgcolor: 'grey.50'
          }}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} alignItems="center">
                {isConnectionError ? (
                  <WifiOff sx={{ fontSize: 64, color: 'warning.main' }} />
                ) : (
                  <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
                )}
                
                <Typography variant="h4" component="h1" textAlign="center">
                  {isConnectionError ? 'Connection Error' : 
                   isAuthError ? 'Authentication Error' : 
                   'Something went wrong'}
                </Typography>
                
                <Alert severity={isConnectionError ? 'warning' : 'error'} sx={{ width: '100%' }}>
                  <AlertTitle>
                    {isConnectionError ? 'Unable to connect to server' : 
                     isAuthError ? 'Authentication system error' :
                     'An unexpected error occurred'}
                  </AlertTitle>
                  {isConnectionError ? (
                    <Typography variant="body2">
                      Please check your internet connection and try again. 
                      The server might be temporarily unavailable.
                    </Typography>
                  ) : isAuthError ? (
                    <Typography variant="body2">
                      There was an issue with the authentication system. 
                      Please try refreshing the page or logging in again.
                    </Typography>
                  ) : (
                    <Typography variant="body2">
                      We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
                    </Typography>
                  )}
                </Alert>

                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    startIcon={isRetrying ? <CircularProgress size={20} /> : <Refresh />}
                    onClick={this.handleRetry}
                    disabled={isRetrying}
                    sx={{ flex: 1 }}
                  >
                    {isRetrying ? 'Retrying...' : 'Try Again'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Home />}
                    onClick={this.handleGoHome}
                    sx={{ flex: 1 }}
                  >
                    Go Home
                  </Button>
                </Stack>

                {isAuthError && (
                  <Button
                    variant="text"
                    startIcon={<Login />}
                    onClick={this.handleGoToLogin}
                    color="primary"
                  >
                    Go to Login
                  </Button>
                )}

                {retryCount > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Retry attempt: {retryCount}
                  </Typography>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      <strong>Debug Info:</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Error: {error?.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Type: {isAuthError ? 'Auth Error' : isConnectionError ? 'Connection Error' : 'Unknown Error'}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
