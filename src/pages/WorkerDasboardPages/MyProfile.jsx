import React, { useState, useEffect } from 'react'
import WorkerProfileComponent from '../../components/workerDashboard/components/WorkerProfile/WorkerProfileComponent'
import { Box } from '@mui/material'
import DashboardSidebar from '../../components/workerDashboard/components/DashboardSidebar/DashboardSidebar'
import WorkerNavbar from '../../components/Navbar/WorkerNavbar'
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useOnboardingQuery } from '../../stores/useOnboardingStore';
import { getCurrentUser } from '../../api/auth'

const MyProfile = () => {
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
    console.log("USer", user);
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
        <Box>
            <WorkerNavbar modalOpen={isModalOpen} />
            <Box sx={{
                display: 'flex'
            }}>
                <DashboardSidebar modalOpen={isModalOpen} />
                <WorkerProfileComponent
                    user={user}
                    onboardingData={onboardingData}
                    verificationStatus={verificationStatus}
                    setModalOpen={setIsModalOpen}
                    isLoading={isUserLoading || isOnboardingLoading || isProfileLoading}
                />
            </Box>
        </Box>

    )
}

export default MyProfile