/**
 * useClientDashboard Hook
 * Main hook for client dashboard data fetching and state management
 */

import { useQuery } from '@tanstack/react-query'
import { getClientProfile } from '../../../../api/clientProfile'
import { useMemo } from 'react'
import {
  isProfileComplete,
  isUnderVerification,
  isVerified,
  getStatusConfig
} from '../utils'

/**
 * Custom hook for client dashboard data
 * @returns {Object} Dashboard data and state
 */
export const useClientDashboard = () => {
  const { data: profileResp, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['clientProfile'],
    queryFn: async () => {
      const res = await getClientProfile()
      return res.data?.profile || null
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  })

  // Derived state
  const profileStatus = useMemo(() => {
    return profileResp?.status || 'draft'
  }, [profileResp])

  const profileComplete = useMemo(() => {
    return isProfileComplete(profileResp)
  }, [profileResp])

  const underVerification = useMemo(() => {
    return isUnderVerification(profileStatus)
  }, [profileStatus])

  const verified = useMemo(() => {
    return isVerified(profileStatus)
  }, [profileStatus])

  const statusConfig = useMemo(() => {
    return getStatusConfig(profileStatus)
  }, [profileStatus])

  return {
    profile: profileResp,
    isLoading,
    isError,
    error,
    refetch,
    profileStatus,
    profileComplete,
    underVerification,
    verified,
    statusConfig
  }
}
