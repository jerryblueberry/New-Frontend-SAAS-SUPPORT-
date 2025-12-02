import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../api/auth';
import api from '../api/axios';

/**
 * Query Keys for Overview
 */
export const overviewKeys = {
    all: ['overview'],
    user: () => [...overviewKeys.all, 'user'],
    profileStatus: () => [...overviewKeys.all, 'profileStatus'],
    overviewData: () => [...overviewKeys.all, 'overviewData'],
    references: () => [...overviewKeys.all, 'references'],
    notifications: () => [...overviewKeys.all, 'notifications'],
    timesheets: () => [...overviewKeys.all, 'timesheets'],
};

/**
 * Custom hook for fetching current user
 */
export const useCurrentUser = () => {
    const { signOut } = useAuth();

    return useQuery({
        queryKey: overviewKeys.user(),
        queryFn: getCurrentUser,
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
            if (error?.response?.status === 401) {
                signOut();
                return false;
            }
            return failureCount < 2;
        },
    });
};

/**
 * Custom hook for fetching profile status
 */
export const useProfileStatus = (enabled = true) => {
    return useQuery({
        queryKey: overviewKeys.profileStatus(),
        queryFn: async () => {
            const response = await api.get('/onboarding/status');
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
        enabled,
    });
};

/**
 * Custom hook for fetching overview data
 */
export const useOverviewData = (enabled = true) => {
    return useQuery({
        queryKey: overviewKeys.overviewData(),
        queryFn: async () => {
            const response = await api.get('/onboarding/overview');
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
        enabled,
    });
};

/**
 * Custom hook for fetching references overview
 */
export const useReferencesOverview = (enabled = true) => {
    return useQuery({
        queryKey: overviewKeys.references(),
        queryFn: async () => {
            const response = await api.get('/references/overview');
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
        enabled,
        select: (data) => ({
            stats: data?.stats || {},
            recent: Array.isArray(data?.recent) ? data.recent : [],
        }),
    });
};

/**
 * Custom hook for fetching notifications overview
 */
export const useNotificationsOverview = (enabled = true) => {
    return useQuery({
        queryKey: overviewKeys.notifications(),
        queryFn: async () => {
            const response = await api.get('/notifications/overview');
            return response.data;
        },
        staleTime: 3 * 60 * 1000, // 3 minutes
        retry: false,
        enabled,
        select: (data) => ({
            recent: Array.isArray(data?.recent) ? data.recent : [],
            unreadCount: Number(data?.unreadCount || 0),
        }),
    });
};

/**
 * Custom hook for fetching timesheets overview
 */
export const useTimesheetsOverview = (enabled = true) => {
    return useQuery({
        queryKey: overviewKeys.timesheets(),
        queryFn: async () => {
            const response = await api.get('/timesheet/overview');
            return response.data;
        },
        staleTime: 3 * 60 * 1000, // 3 minutes
        retry: false,
        enabled,
        select: (data) => ({
            stats: data?.stats || {},
            recent: Array.isArray(data?.recent) ? data.recent : [],
        }),
    });
};

/**
 * Main hook that combines all overview data
 */
export const useOverview = () => {
    const { data: user, isLoading: isUserLoading, error: userError } = useCurrentUser();
    const isUserReady = !!user;

    const {
        data: profileStatus,
        isLoading: isProfileLoading,
        error: profileError,
    } = useProfileStatus(isUserReady);

    const {
        data: overviewData,
        isLoading: isOverviewLoading,
        error: overviewError,
    } = useOverviewData(isUserReady);

    const {
        data: referencesData,
        isLoading: isReferencesLoading,
        error: referencesError,
    } = useReferencesOverview(isUserReady);

    // Commented out - notifications removed from overview
    // const {
    //     data: notificationsData,
    //     isLoading: isNotificationsLoading,
    //     error: notificationsError,
    // } = useNotificationsOverview(isUserReady);

    const {
        data: timesheetsData,
        isLoading: isTimesheetsLoading,
        error: timesheetsError,
    } = useTimesheetsOverview(isUserReady);

    // Computed values
    const isLoading = isUserLoading || isProfileLoading || isOverviewLoading;
    const hasError = userError || profileError || overviewError;

    // Extract verification status
    const verificationStatus =
        typeof profileStatus?.verificationStatus === 'object'
            ? profileStatus?.verificationStatus?.overall
            : profileStatus?.verificationStatus;

    const overviewVerificationStatus =
        overviewData?.verificationStatus?.overall || verificationStatus;

    // Extract profile completeness
    const profileCompleteness =
        overviewData?.profileCompleteness ||
        profileStatus?.profileCompleteness?.percentage ||
        0;

    // Check if onboarding is needed
    const needsOnboarding =
        !profileStatus ||
        !profileStatus.profileCompleteness ||
        profileCompleteness < 100;

    // Get next onboarding step
    const getNextOnboardingStep = useCallback(() => {
        if (!profileStatus || !profileStatus.profileCompleteness) return 1;
        const { completedSections } = profileStatus.profileCompleteness;
        if (!completedSections.basicInfo) return 1;
        if (!completedSections.workHistory) return 2;
        if (!completedSections.availability) return 3;
        if (!completedSections.certifications) return 4;
        if (!completedSections.healthInformation) return 5;
        return null;
    }, [profileStatus]);

    // Extract all data
    const data = {
        user,
        profileStatus,
        overviewData,
        referencesData,
        // notificationsData, // Commented out - notifications removed from overview
        timesheetsData,
        verificationStatus: overviewVerificationStatus,
        verificationDetail: overviewData?.verificationStatus || {},
        profileCompleteness,
        needsOnboarding,
        nextOnboardingStep: getNextOnboardingStep(),
        // Computed stats
        certStats: overviewData?.certifications?.stats || {},
        unverifiedCertifications:
            overviewData?.certifications?.unverified ||
            profileStatus?.unverifiedCertifications ||
            [],
        referenceStats: referencesData?.stats || overviewData?.references?.stats || {},
        recentReferences: referencesData?.recent || overviewData?.references?.recent || [],
        // Commented out - notifications removed from overview
        // recentNotifications:
        //     notificationsData?.recent || overviewData?.notifications?.recent || [],
        // unreadNotifications:
        //     notificationsData?.unreadCount || overviewData?.notifications?.unreadCount || 0,
        timesheetStats: timesheetsData?.stats || overviewData?.timesheets?.stats || {},
        hourlyRate: overviewData?.expectedHourlyRate || 0,
        workHistoryCount: overviewData?.workHistory?.count || 0,
    };

    // Loading states
    const loadingStates = {
        isUserLoading,
        isProfileLoading,
        isOverviewLoading,
        isReferencesLoading,
        // isNotificationsLoading, // Commented out - notifications removed from overview
        isTimesheetsLoading,
        isLoading,
    };

    // Error states
    const errors = {
        userError,
        profileError,
        overviewError,
        referencesError,
        // notificationsError, // Commented out - notifications removed from overview
        timesheetsError,
        hasError,
    };

    return {
        ...data,
        ...loadingStates,
        ...errors,
    };
};

