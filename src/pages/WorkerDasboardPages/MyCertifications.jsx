import { Box } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import WorkerNavbar from '../../components/Navbar/WorkerNavbar'
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar'
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DashboardCertification from '../../components/workerDashboard/components/DashboardCertificates/DashboardCertification';
const MyCertifications = () => {
    const { data: onboardingData } = useOnboardingQuery();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const queryClient = useQueryClient();

    // Listen for drawer open/close events to toggle sidebar visibility and overlay
    useEffect(() => {
      const handleOpen = () => setDrawerOpen(true);
      const handleClose = () => setDrawerOpen(false);
      window.addEventListener('drawer:open', handleOpen);
      window.addEventListener('drawer:close', handleClose);
      return () => {
        window.removeEventListener('drawer:open', handleOpen);
        window.removeEventListener('drawer:close', handleClose);
      };
    }, []);

    // Auto-refresh onboarding data after edits without reloading the page
    useEffect(() => {
      const handleOnboardingRefresh = () => {
        try {
          queryClient.invalidateQueries({ queryKey: ['onboarding'] });
        } catch (_) {}
      };
      window.addEventListener('onboarding:refresh', handleOnboardingRefresh);
      return () => window.removeEventListener('onboarding:refresh', handleOnboardingRefresh);
    }, [queryClient]);

  return (
    <Box>
      <WorkerNavbar/>
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          transition: 'transform 0.25s ease',
        }}
        id="my-certifications-layout"
      >
        {!drawerOpen && <DashboardSidebar/>}
        <Box sx={{
          mt: 0,
          flex: 1,
          width: '100%',
          minWidth: 0
        }}>
          <DashboardCertification onboardingData={onboardingData}/>
        </Box>
        {drawerOpen && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(15, 23, 42, 0.06)', // subtle slate overlay
              backdropFilter: 'blur(1px)',
              pointerEvents: 'none',
              transition: 'opacity 0.2s ease',
            }}
          />
        )}
      </Box>
    </Box>
  )
}

export default MyCertifications