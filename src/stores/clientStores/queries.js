/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT QUERIES
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * TanStack Query hooks for fetching client data.
 * These queries hydrate the Zustand stores on success with TRANSFORMED data.
 * 
 * ⚠️ CRITICAL: TanStack Query cache is the source of truth for server data.
 * Stores only receive derived/transformed data via hydrateFromApi().
 * 
 * @module stores/clientStores/queries
 */

import { useQuery } from '@tanstack/react-query'
import * as clientOnboardingApi from '../../api/clientProfile'
import { useClientProfileStore } from './profileStore'
import { useClientOnboardingStore } from './clientOnboardingStore'
import { useClientAuditLogStore } from './auditLogStore'
import { computeOnboardingStatus } from './helpers'

/**
 * Fetch onboarding progress
 * Hydrates profile store on success
 */
export const useClientOnboardingQuery = () => {
	return useQuery({
		queryKey: ['clientOnboarding'],
		queryFn: async () => {
			try {
				const response = await clientOnboardingApi.fetchClientOnboardingProgress()
				if (!response.success && response.message === 'Client profile not found') {
					return { success: true, data: null, isNewUser: true }
				}
				return response
			} catch (error) {
				if (error.response?.status === 404) {
					return { success: true, data: null, isNewUser: true }
				}
				throw error
			}
		},
		onSuccess: (data) => {
			if (data?.success && data.data) {
				// Transform data before hydrating stores (derived state computation)
				const responseData = {
					...data.data,
					// Compute onboarding status (DERIVED STATE)
					onboarding: data.data.onboarding || computeOnboardingStatus(
						data.data.profile,
						data.data.profileCompletion
					),
				}
				
				// ✅ Hydrate profile store with TRANSFORMED data
				// Note: hydrateFromApi() further transforms (extracts enterprise fields)
				useClientProfileStore.getState().hydrateFromApi(responseData)
				
				// ✅ Update completed steps in onboarding store (UI state)
				// ⚠️ TO ADD MORE STEPS: Add checks for new step completions here
				const completedSteps = []
				if (data.data.profileCompletion?.completedSections?.basicInformation) {
					completedSteps.push(1)
				}
				// Example for step 2:
				// if (data.data.profileCompletion?.completedSections?.newStep) {
				//   completedSteps.push(2)
				// }
				useClientOnboardingStore.setState({ completedSteps })
			}
		},
		onError: (error) => {
			// Error handling - queries handle errors via error state
			// Components can access error via query.error
			console.error('Client onboarding query error:', {
				error: error.message,
				code: error.response?.data?.code,
				status: error.response?.status,
			})
		},
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchInterval: 60 * 1000, // 60s lightweight refresh
	})
}

/**
 * Fetch audit history for a client profile
 * @param {string} profileId - Client profile ID
 * @param {Object} options - Query options (limit, skip, sortBy)
 * @returns {Object} Query result with audit history
 */
export const useProfileAuditHistory = (profileId, options = {}) => {
	const { setAuditHistory, setAuditLoading, setAuditError } = useClientAuditLogStore.getState()

	return useQuery({
		queryKey: ['clientProfileAuditHistory', profileId, options],
		queryFn: async () => {
			if (!profileId) return null
			
			setAuditLoading(true)
			try {
				const response = await clientOnboardingApi.fetchProfileAuditHistory(profileId, options)
				if (response.success && response.data) {
					setAuditHistory(response.data)
					return response.data
				}
				return []
			} catch (error) {
				setAuditError(error)
				throw error
			} finally {
				setAuditLoading(false)
			}
		},
		enabled: Boolean(profileId),
		staleTime: 2 * 60 * 1000, // 2 minutes
		retry: 1,
	})
}

/**
 * Fetch audit summary for a client profile
 * @param {string} profileId - Client profile ID
 * @returns {Object} Query result with audit summary
 */
export const useProfileAuditSummary = (profileId) => {
	const { setAuditSummary, setAuditLoading, setAuditError } = useClientAuditLogStore.getState()

	return useQuery({
		queryKey: ['clientProfileAuditSummary', profileId],
		queryFn: async () => {
			if (!profileId) return null
			
			setAuditLoading(true)
			try {
				const response = await clientOnboardingApi.fetchProfileAuditSummary(profileId)
				if (response.success && response.data) {
					setAuditSummary(response.data)
					return response.data
				}
				return null
			} catch (error) {
				setAuditError(error)
				throw error
			} finally {
				setAuditLoading(false)
			}
		},
		enabled: Boolean(profileId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 1,
	})
}

