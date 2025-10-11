import React, { Component } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  AlertTitle,
  Stack
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh,
  Home,
  BugReport
} from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const bugReport = {
      error: error?.toString(),
      errorInfo: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    // In a real app, you'd send this to your error reporting service
    console.log('Bug Report:', bugReport);
    
    // For now, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2))
      .then(() => alert('Bug report copied to clipboard'))
      .catch(() => alert('Failed to copy bug report'));
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const isConnectionError = error?.message?.includes('Network Error') || 
                               error?.message?.includes('Connection refused');

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
                <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
                
                <Typography variant="h4" component="h1" textAlign="center">
                  {isConnectionError ? 'Connection Error' : 'Something went wrong'}
                </Typography>
                
                <Alert severity={isConnectionError ? 'warning' : 'error'} sx={{ width: '100%' }}>
                  <AlertTitle>
                    {isConnectionError ? 'Unable to connect to server' : 'An unexpected error occurred'}
                  </AlertTitle>
                  {isConnectionError ? (
                    <Typography variant="body2">
                      Please check your internet connection and try again. 
                      The server might be temporarily unavailable.
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
                    startIcon={<Refresh />}
                    onClick={this.handleRetry}
                    sx={{ flex: 1 }}
                  >
                    Try Again
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

                {retryCount > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Retry attempt: {retryCount}
                  </Typography>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="text"
                    startIcon={<BugReport />}
                    onClick={this.handleReportBug}
                    size="small"
                  >
                    Report Bug (Dev Mode)
                  </Button>
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

export default ErrorBoundary;