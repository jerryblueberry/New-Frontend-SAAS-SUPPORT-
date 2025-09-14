import { Box } from '@mui/material'
import React from 'react'
import WorkerNavbar from '../../components/Navbar/WorkerNavbar'
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar'
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DashboardCertification from '../../components/workerDashboard/components/DashboardCertificates/DashboardCertification';
const MyCertifications = () => {
    const { data: onboardingData } =
    useOnboardingQuery();

  return (
    <Box >
        <WorkerNavbar/>
        <Box sx={{
            display:'flex'
        }}>
            <DashboardSidebar/>
            <Box sx={{
                mt:3
            }}>
            <DashboardCertification onboardingData={onboardingData}/>
            </Box>
           
        </Box>
    </Box>
  )
}

export default MyCertifications