import React from 'react';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import AdminSidebar from '../../../components/adminSidebar/AdminSidebar';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, Container, useMediaQuery, Stack, Breadcrumbs, Link } from '@mui/material';
import ClientTable from '../../../components/AdminClientManagement/ClientTable';
import { Home as HomeIcon } from '@mui/icons-material';

const ViewAllClients = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const SIDEBAR_WIDTH = 280;
  const SIDEBAR_GAP = 4;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <WorkerNavbar />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: 0, md: SIDEBAR_WIDTH },
            flexShrink: 0,
            zIndex: theme.zIndex.drawer,
            position: 'fixed',
            top: { xs: 56, md: 64 },
            left: 0,
            height: `calc(100vh - 64px)`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <AdminSidebar topOffset={64} navigate={navigate} />
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            ml: { md: `${SIDEBAR_WIDTH}px` },
            p: { xs: 2, sm: 3, md: 3 },
            mt: { xs: 8, md: 10 },
            minHeight: '100vh',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Container maxWidth="xl" sx={{ py: isMobile ? 1 : 2, px: { xs: 0, sm: 2 } }}>
            {/* Header Section */}
            <Stack spacing={2} sx={{ mb: 3 }}>
              {/* Breadcrumbs */}
              <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.875rem' }}>
                <Link
                  underline="hover"
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  color="inherit"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                  Dashboard
                </Link>
                <Typography color="text.primary" fontSize="0.875rem">
                  Client Management
                </Typography>
              </Breadcrumbs>

              {/* Page Title */}
              <Box>
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  fontWeight={600}
                  gutterBottom
                  sx={{ color: 'text.primary' }}
                >
                  Client Management
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View, filter, and manage all client profiles in the system
                </Typography>
              </Box>
            </Stack>

            {/* Client Table */}
            <ClientTable />
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default ViewAllClients;