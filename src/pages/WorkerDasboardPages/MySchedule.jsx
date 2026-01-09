import { Box, Typography, Stack, Chip, alpha, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DashboardAvailability from '../../components/workerDashboard/components/WorkerDashboardAvailability/DashboardAvailability';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
import { 
  CalendarMonthOutlined as CalendarIcon,
  EditCalendarOutlined as EditIcon, 
  VisibilityOutlined as ViewIcon,
  InsightsOutlined as InsightsIcon,
  LocationOnOutlined as LocationIcon
} from '@mui/icons-material';

const MySchedule = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  
  // Onboarding information
  const { data: onboardingData } = useOnboardingQuery();
  console.log("Dataaaa", onboardingData);
  console.log("Dataaaa");

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        
      }}
    >
      <WorkerNavbar modalOpen={isModalOpen} />
      
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          mt: { xs: '56px', sm: '64px' }, // Account for fixed navbar height
          position: 'relative',
        }}
      >
        <DashboardSidebar modalOpen={isModalOpen} />
        
        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: {
              xs: '100%',
              md: 'calc(100% - 280px)', // Account for sidebar width
            },
            maxWidth: '100%',
            minHeight: 'calc(100vh - 64px)',
            overflow: 'hidden',
            mt:{xs:3,md:0}
           
          }}
        >
          {/* Page Header - Clean Minimal Section */}
          <Box 
            sx={{ 
              px: { xs: 1.5, sm: 2, md: 3 },
              pt: { xs: 2, sm: 2.5, md: 3 },
              pb: { xs: 1, sm: 1.25, md: 1.5 },
            }}
          >
            {/* Title & Description */}
            <Box sx={{ mb: { xs: 1.5, sm: 1.75, md: 2 } }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.4rem', sm: '1.65rem', md: '1.75rem' },
                  color: 'text.primary',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  mb: 0.75,
                }}
              >
                My Availability
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '0.9rem' },
                  color: 'text.secondary',
                  fontWeight: 500,
                  lineHeight: 1.5,
                  maxWidth: { xs: '100%', sm: '85%', md: '75%' },
                }}
              >
                Manage your weekly schedule and let clients know when you're available for work.
              </Typography>
            </Box>

            {/* Feature Chips - Compact Inline */}
            <Stack 
              direction="row" 
              spacing={{ xs: 1, sm: 1.25 }}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: { xs: 1.25, sm: 1.5 } }}
            >
              <Chip
                icon={<ViewIcon sx={{ fontSize: 18 }} />}
                label="Calendar & List Views"
                sx={{
                  height: { xs: 34, sm: 36 },
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  color: 'success.dark',
                  fontSize: { xs: '0.78rem', sm: '0.8rem' },
                  fontWeight: 700,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
                  '& .MuiChip-icon': { color: 'success.main', ml: 1 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.15)}`,
                  }
                }}
              />
              <Chip
                icon={<EditIcon sx={{ fontSize: 18 }} />}
                label="Quick Edit"
                sx={{
                  height: { xs: 34, sm: 36 },
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.dark',
                  fontSize: { xs: '0.78rem', sm: '0.8rem' },
                  fontWeight: 700,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  '& .MuiChip-icon': { color: 'primary.main', ml: 1 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                  }
                }}
              />
              <Chip
                icon={<InsightsIcon sx={{ fontSize: 18 }} />}
                label="Weekly Insights"
                sx={{
                  height: { xs: 34, sm: 36 },
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  color: 'info.dark',
                  fontSize: { xs: '0.78rem', sm: '0.8rem' },
                  fontWeight: 700,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
                  '& .MuiChip-icon': { color: 'info.main', ml: 1 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.info.main, 0.12),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.15)}`,
                  }
                }}
              />
              <Chip
                icon={<LocationIcon sx={{ fontSize: 18 }} />}
                label="Location Settings"
                sx={{
                  height: { xs: 34, sm: 36 },
                  bgcolor: alpha(theme.palette.warning.main, 0.08),
                  color: 'warning.dark',
                  fontSize: { xs: '0.78rem', sm: '0.8rem' },
                  fontWeight: 700,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`,
                  '& .MuiChip-icon': { color: 'warning.main', ml: 1 },
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 0.12),
                    transform: 'translateY(-1px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.15)}`,
                  }
                }}
              />
            </Stack>

            {/* Premium Section Separator */}
            <Box
              sx={{
                position: 'relative',
                mt: { xs: 1.5, sm: 2 },
                mb: { xs: 2, sm: 2.5 },
              }}
            >
              {/* Main gradient line */}
              <Box
                sx={{
                  height: 2,
                  borderRadius: 1,
                  background: `linear-gradient(90deg, 
                    ${alpha(theme.palette.primary.main, 0.2)} 0%, 
                    ${alpha(theme.palette.success.main, 0.2)} 35%,
                    ${alpha(theme.palette.info.main, 0.2)} 65%,
                    ${alpha(theme.palette.warning.main, 0.2)} 100%
                  )`,
                  boxShadow: `0 1px 3px ${alpha(theme.palette.primary.main, 0.08)}`,
                }}
              />
              {/* Accent dots */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  bgcolor: theme.palette.background.default,
                  px: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                />
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    boxShadow: `0 0 8px ${alpha(theme.palette.success.main, 0.4)}`,
                  }}
                />
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'info.main',
                    boxShadow: `0 0 8px ${alpha(theme.palette.info.main, 0.4)}`,
                  }}
                />
              </Stack>
            </Box>
          </Box>

          {/* Main Availability Component */}
          <DashboardAvailability
            onboardingData={onboardingData}
            setModalOpen={setIsModalOpen}
            modalOpen={isModalOpen}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MySchedule;