import React, { useState, useEffect } from 'react'
import WorkerProfileComponent from '../../components/workerDashboard/components/WorkerProfile/WorkerProfileComponent'
import { Box, useTheme, useMediaQuery } from '@mui/material'
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar'
import WorkerNavbar from '../../components/Navbar/WorkerNavbar'
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import { getCurrentUser } from '../../api/auth'
import api from '../../api/axios'

const MyProfile = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    // Onboarding information
    const { data: onboardingData, isLoading: isOnboardingLoading } =
        useOnboardingQuery();
    const { signOut, isAuthenticated, user: authUser } = useAuth();

    const { data: user, isLoading: isUserLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
        staleTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
            if (error?.response?.status === 401) {
                signOut();
                return false;
            }
            return failureCount < 2;
        },
    });

    // Worker profile status fetching
    const { data: profileStatus, isLoading: isProfileLoading } = useQuery({
        queryKey: ['workerProfileStatus'],
        queryFn: async () => {
            const response = await api.get('/onboarding/status');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: false,
        enabled: !!user,
    });

    const verificationStatus =
        typeof profileStatus?.verificationStatus === 'object'
            ? profileStatus?.verificationStatus?.overall
            : profileStatus?.verificationStatus;

    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        console.log('Navbar visibility:', !isModalOpen);
    }, [isModalOpen]);

    return (
        <Box sx={{ 
            minHeight: '100vh',
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <WorkerNavbar modalOpen={isModalOpen} />
            <Box sx={{
                display: 'flex',
                flex: 1,
                pt: { xs: '4rem', sm: '3.5rem', md: '0rem' },
                minHeight: 'calc(100vh - 4rem)',
                overflow: 'hidden'
            }}>
                <DashboardSidebar modalOpen={isModalOpen} />
                <Box sx={{
                    flex: 1,
                    mt:{xs:0,md:8},
                    overflow: 'auto',
                    ml: { xs: 0, md: isModalOpen ? '280px' : '0' },
                    transition: 'margin-left 0.3s ease',
                    width: { xs: '100%', md: isModalOpen ? 'calc(100% - 280px)' : '100%' }
                }}>
                    <WorkerProfileComponent
                        user={user}
                        onboardingData={onboardingData}
                        verificationStatus={verificationStatus}
                        setModalOpen={setIsModalOpen}
                        isLoading={isUserLoading || isOnboardingLoading || isProfileLoading}
                    />
                </Box>
            </Box>
        </Box>
    )
}

export default MyProfile