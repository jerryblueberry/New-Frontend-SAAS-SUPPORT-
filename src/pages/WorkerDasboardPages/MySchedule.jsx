import { Box } from '@mui/material'
import React,{useState} from 'react'
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import DashboardAvailability from '../../components/workerDashboard/components/WorkerDashboardAvailability/DashboardAvailability';
import WorkerNavbar from '../../components/Navbar/WorkerNavbar';
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar';
const MySchedule = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    // Onboarding information
    const { data: onboardingData } =
        useOnboardingQuery();
        console.log("Dataaaa",onboardingData);
    return (
        <Box>
            <WorkerNavbar modalOpen={isModalOpen} />
            <Box sx={{
                display:'flex',
                
 
                // height:'100vh',
                // width:'100vw',
                backgroundColor:'#f5f5f5',
                marginTop:'0rem',
                // marginLeft:'4rem',
            }}>
                <DashboardSidebar modalOpen={isModalOpen}/>
                <Box sx={{
                    mt:{xs:10,md:5},
                }}>
                <DashboardAvailability onboardingData={onboardingData} setModalOpen={setIsModalOpen} modalOpen={isModalOpen} />
                </Box>
           
            </Box>
            
        
        </Box>

    )
}

export default MySchedule