import React from "react";
import { Box, CircularProgress, Typography, Alert, Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import WorkerNavbar from "../Navbar/WorkerNavbar";
import AdminSidebar from "../adminSidebar/AdminSidebar";
import PropTypes from "prop-types";

const SIDEBAR_WIDTH = 280;
const SIDEBAR_GAP = 4;

/**
 * DashboardLayout Component
 * Provides consistent layout with sidebar and navbar for admin dashboard
 * Handles loading and error states
 */
const DashboardLayout = ({ 
  isLoading, 
  error, 
  onRetry, 
  children, 
  navigate 
}) => {
  // Loading State
  if (isLoading) {
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafbfc' }}>
          <Box sx={{
            width: { xs: '0px', md: `${SIDEBAR_WIDTH}px` },
            flexShrink: 0,
            zIndex: 1200,
            position: 'fixed',
            top: { xs: 56, md: 64 },
            left: 0,
            height: `calc(100vh - 64px)`
          }}>
            <AdminSidebar topOffset={64} navigate={navigate} />
          </Box>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              ml: { md: `${SIDEBAR_WIDTH + SIDEBAR_GAP}px`, xs: 0 },
              p: { xs: 2, sm: 3, md: 4 },
              mt: { xs: 8, md: 3 },
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary', fontWeight: 500 }}>
                Loading dashboard...
              </Typography>
            </Box>
          </Box>
        </Box>
      </>
    );
  }

  // Error State
  if (error) {
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafbfc' }}>
          <Box sx={{
            width: { xs: '0px', md: `${SIDEBAR_WIDTH}px` },
            flexShrink: 0,
            zIndex: 1200,
            position: 'fixed',
            top: { xs: 56, md: 64 },
            left: 0,
            height: `calc(100vh - 64px)`
          }}>
            <AdminSidebar topOffset={64} navigate={navigate} />
          </Box>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              ml: { md: `${SIDEBAR_WIDTH + SIDEBAR_GAP}px`, xs: 0 },
              p: { xs: 2, sm: 3, md: 4 },
              mt: { xs: 8, md: 8 },
              minHeight: '100vh',
            }}
          >
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Failed to load dashboard</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {error?.response?.data?.message || error?.message || 'An unexpected error occurred'}
              </Typography>
              <Button onClick={onRetry} sx={{ mt: 2 }} variant="outlined" startIcon={<Refresh />}>
                Retry
              </Button>
            </Alert>
          </Box>
        </Box>
      </>
    );
  }

  // Success State - Render children
  return (
    <>
      <WorkerNavbar />
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Sidebar */}
        <Box sx={{
          width: { xs: '0px', md: `${SIDEBAR_WIDTH}px` },
          flexShrink: 0,
          zIndex: 1200,
          position: 'fixed',
          top: { xs: 56, md: 64 },
          left: 0,
          height: `calc(100vh - 64px)`
        }}>
          <AdminSidebar topOffset={64} navigate={navigate} />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            ml: { md: `${SIDEBAR_WIDTH + SIDEBAR_GAP}px`, xs: 0 },
            p: { xs: 2, sm: 3, md: 4 },
            mt: { xs: 8, md: 8 },
            minHeight: '100vh',
            transition: 'margin-left 0.2s',
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

DashboardLayout.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.object,
  onRetry: PropTypes.func,
  children: PropTypes.node,
  navigate: PropTypes.func.isRequired
};

export default DashboardLayout;

