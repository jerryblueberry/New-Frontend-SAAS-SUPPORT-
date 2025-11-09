/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT ONBOARDING STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Enterprise-grade client onboarding state management with:
 * - Minimal onboarding flow (only essential fields required)
 * - Audit log integration for compliance tracking
 * - TanStack Query for efficient data fetching and caching
 * - Zustand for local state management with persistence
 * - Support for enterprise fields (documents, billing, engagement metrics)
 * 
 * Design Philosophy:
 * - Step 1 (Basic Information): Account type, address, org details (if org)
 * - Step 2 (Preferences): Support categories, service regions (required)
 * - Optional fields: Worker preferences, cultural preferences (can be added later)
 * - Audit trail: All profile changes tracked automatically
 * 
 * @module stores/useClientOnboardingStore
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as clientOnboardingApi from '../api/clientProfile'

// Step configuration
const STEP_ORDER = ['basicInformation', 'preferences']
const TOTAL_STEPS = 2

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & INITIAL STATE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Initial state for client onboarding store
 * Includes support for enterprise fields and audit logging
 */
const initialState = {
	// Step management
	currentStep: 1, // 1-based indexing (1-2)
	completedSteps: [], // Array of completed step numbers [1, 2]
	
	// Profile data
	profile: null,
	profileCompleteness: {
		percentage: 0,
		completedSections: {
			basicInformation: false,
			preferences: false,
		},
	},
	
	// Enterprise fields (optional, can be added later via dashboard)
	enterpriseData: {
		contactPreferences: null,
		documents: [],
		billingPreferences: null,
		engagementMetrics: null,
		consents: null,
		organizationMembers: [],
	},
	
	// Audit log state
	auditLogs: {
		history: [],
		summary: null,
		isLoading: false,
		error: null,
	},
	
	// Loading states
	isLoading: false,
	isSaving: false,
	error: null,
}

// ────────────────────────────────────────────────────────────
// Zustand Store
// ────────────────────────────────────────────────────────────

const useClientOnboardingStore = create(
	devtools(
		persist(
			(set, get) => ({
				...initialState,

				// ─── Actions ───────────────────────────────────────────

				setStep: (step) => {
					if (step >= 1 && step <= TOTAL_STEPS) {
						set({ currentStep: step })
						window.scrollTo(0, 0)
					}
				},

				nextStep: () => {
					const currentStep = get().currentStep
					if (currentStep < TOTAL_STEPS) {
						set({ currentStep: currentStep + 1 })
						window.scrollTo(0, 0)
					}
				},

				prevStep: () => {
					const currentStep = get().currentStep
					if (currentStep > 1) {
						set({ currentStep: currentStep - 1 })
						window.scrollTo(0, 0)
					}
				},

				setProfile: (profile) => {
					set({ profile })
				},

				setLoading: (isLoading) => {
					set({ isLoading })
				},

				setSaving: (isSaving) => {
					set({ isSaving })
				},

				setError: (error) => {
					set({ error })
				},

				updateProfileCompleteness: (data) => {
					if (data?.profileCompletion) {
						set({ profileCompleteness: data.profileCompletion })
					}
				},

				// Hydrate store from API response
				hydrateFromApi: (data) => {
					if (!data) return

					const { profile, profileCompletion, currentStep } = data

					// Determine completed steps based on profileCompletion
					const completedSteps = []
					if (profileCompletion?.completedSections?.basicInformation) {
						completedSteps.push(1)
					}
					if (profileCompletion?.completedSections?.preferences) {
						completedSteps.push(2)
					}

					// Extract enterprise fields from profile (optional fields)
					const enterpriseData = {
						contactPreferences: profile?.contactPreferences || null,
						documents: profile?.documents || [],
						billingPreferences: profile?.billingPreferences || null,
						engagementMetrics: profile?.engagementMetrics || null,
						consents: profile?.consents || null,
						organizationMembers: profile?.organizationMembers || [],
					}

					set({
						currentStep: currentStep || 1,
						completedSteps,
						profile: profile || null,
						profileCompleteness: profileCompletion || initialState.profileCompleteness,
						enterpriseData,
					})
				},

				resetStore: () => {
					set(initialState)
				},

				// ─── Selectors ─────────────────────────────────────────

				getCompleteness: () => {
					return get().profileCompleteness.percentage || 0
				},

				getCompletedSections: () => {
					return get().profileCompleteness.completedSections || {}
				},

				isProfileComplete: () => {
					return get().profileCompleteness.percentage === 100
				},

				isProfileDeleted: () => {
					const profile = get().profile
					return profile?.isDeleted === true
				},

				canEditProfile: () => {
					const profile = get().profile
					if (!profile) return true // New users can create profiles
					if (profile.isDeleted) return false // Deleted profiles cannot be edited

					const editableStatuses = ['draft', 'unverified', 'rejected']
					return editableStatuses.includes(profile.status)
				},

				getProfileStatus: () => {
					const profile = get().profile
					if (!profile)
						return { status: 'draft', canEdit: true, isDeleted: false }

					return {
						status: profile.status || 'draft',
						canEdit: get().canEditProfile(),
						isDeleted: profile.isDeleted || false,
						completeness: get().getCompleteness(),
					}
				},

				// Check if step is completed
				isStepCompleted: (stepNumber) => {
					const completedSteps = get().completedSteps
					return completedSteps.includes(stepNumber)
				},

				// Get next available step
				getNextAvailableStep: () => {
					const completedSteps = get().completedSteps
					for (let i = 1; i <= TOTAL_STEPS; i++) {
						if (!completedSteps.includes(i)) {
							return i
						}
					}
					return TOTAL_STEPS // All complete
				},

				// Check persistence on app load
				checkPersistence: async () => {
					const { hydrateFromApi, resetStore } = get()
					try {
						const data = await clientOnboardingApi.fetchClientOnboardingProgress()
						if (data.success && data.data) {
							hydrateFromApi(data.data)
						} else {
							resetStore()
						}
					} catch (error) {
						console.error('Failed to check persistence:', error)
						resetStore()
					}
				},

				// ═══════════════════════════════════════════════════════════════════
				// AUDIT LOG ACTIONS
				// ═══════════════════════════════════════════════════════════════════

				/**
				 * Set audit log history
				 * @param {Array} history - Array of audit log entries
				 */
				setAuditHistory: (history) => {
					set((state) => ({
						auditLogs: {
							...state.auditLogs,
							history: history || [],
							isLoading: false,
							error: null,
						},
					}))
				},

				/**
				 * Set audit log summary
				 * @param {Object} summary - Audit summary statistics
				 */
				setAuditSummary: (summary) => {
					set((state) => ({
						auditLogs: {
							...state.auditLogs,
							summary: summary || null,
							isLoading: false,
							error: null,
						},
					}))
				},

				/**
				 * Set audit log loading state
				 * @param {boolean} isLoading - Loading state
				 */
				setAuditLoading: (isLoading) => {
					set((state) => ({
						auditLogs: {
							...state.auditLogs,
							isLoading,
						},
					}))
				},

				/**
				 * Set audit log error
				 * @param {Error|null} error - Error object or null
				 */
				setAuditError: (error) => {
					set((state) => ({
						auditLogs: {
							...state.auditLogs,
							error,
							isLoading: false,
						},
					}))
				},

				// ═══════════════════════════════════════════════════════════════════
				// VALIDATION HELPERS
				// ═══════════════════════════════════════════════════════════════════

				/**
				 * Check if basic information step is valid (minimal onboarding)
				 * Required: accountType, address (all fields), orgName/ABN if organization
				 */
				isBasicInformationValid: (profile) => {
					if (!profile) return false
					
					const hasAccountType = Boolean(profile.accountType)
					const hasAddress = Boolean(
						profile.address?.street &&
						profile.address?.suburb &&
						profile.address?.state &&
						profile.address?.postcode
					)
					
					// If organization, require organizationName and ABN
					if (profile.accountType === 'organization') {
						return hasAccountType && hasAddress &&
							Boolean(profile.organizationName?.trim()) &&
							Boolean(profile.abn?.trim())
					}
					
					return hasAccountType && hasAddress
				},

				/**
				 * Check if preferences step is valid (minimal onboarding)
				 * Required: supportCategories (at least 1), serviceRegions (at least 1)
				 */
				isPreferencesValid: (profile) => {
					if (!profile?.preferences) return false
					
					const hasSupportCategories = Array.isArray(profile.preferences.supportCategories) &&
						profile.preferences.supportCategories.length > 0
					
					const hasServiceRegions = Array.isArray(profile.preferences.serviceRegions) &&
						profile.preferences.serviceRegions.length > 0
					
					return hasSupportCategories && hasServiceRegions
				},

				/**
				 * Check if profile can post jobs
				 * Requires: Profile verified/active AND 100% complete
				 */
				canPostJobs: () => {
					const profile = get().profile
					if (!profile) return false
					
					const isVerified = ['verified', 'active'].includes(profile.status)
					const isComplete = get().profileCompleteness.percentage === 100
					
					return isVerified && isComplete && !profile.isDeleted
				},

				/**
				 * Get enterprise field status
				 * Returns object with boolean flags for each enterprise field
				 */
				getEnterpriseFieldStatus: () => {
					const enterpriseData = get().enterpriseData
					return {
						hasContactPreferences: Boolean(enterpriseData.contactPreferences),
						hasDocuments: Array.isArray(enterpriseData.documents) && enterpriseData.documents.length > 0,
						hasBillingPreferences: Boolean(enterpriseData.billingPreferences),
						hasEngagementMetrics: Boolean(enterpriseData.engagementMetrics),
						hasConsents: Boolean(enterpriseData.consents),
						hasOrganizationMembers: Array.isArray(enterpriseData.organizationMembers) && enterpriseData.organizationMembers.length > 0,
					}
				},
			}),
			{
				name: 'client-onboarding-storage',
				partialize: (state) => ({
					currentStep: state.currentStep,
					completedSteps: state.completedSteps,
					profileCompleteness: state.profileCompleteness,
				}),
			}
		)
	)
)

// ────────────────────────────────────────────────────────────
// TanStack Query Hooks (Following Worker Pattern)
// ────────────────────────────────────────────────────────────

/**
 * Fetch onboarding progress
 * Similar to worker's useOnboardingQuery
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
				const store = useClientOnboardingStore.getState()
				store.hydrateFromApi(data.data)
			}
		},
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000, // 5 minutes
	})
}

/**
 * Step 1: Basic Information Mutation
 */
export const useBasicInformationMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (basicInfoData) => {
			try {
				const response = await clientOnboardingApi.saveBasicInformationStep(basicInfoData)
				if (!response.success) {
					// Create error that preserves structure
					const err = new Error(response.message || 'Failed to save basic information')
					err.response = response // Preserve response structure
					throw err
				}
				return response
			} catch (error) {
				// Preserve original error structure (axios error with response, status, etc.)
				// This allows error formatter to access error.response.data.message and error.response.status
				if (error.response) {
					// Axios error - preserve it
					throw error
				}
				// Non-axios error - create structured error
				const err = new Error(error.message || 'Failed to save basic information')
				err.originalError = error
				throw err
			}
		},
		onSuccess: (data) => {
			if (data.success) {
				const { updateProfileCompleteness, nextStep, setProfile } = useClientOnboardingStore.getState()
				
				// Update profile and extract enterprise data
				if (data.data?.profile) {
					setProfile(data.data.profile)
					
					// Extract enterprise fields (optional fields for dashboard)
					const enterpriseData = {
						contactPreferences: data.data.profile.contactPreferences || null,
						documents: data.data.profile.documents || [],
						billingPreferences: data.data.profile.billingPreferences || null,
						engagementMetrics: data.data.profile.engagementMetrics || null,
						consents: data.data.profile.consents || null,
						organizationMembers: data.data.profile.organizationMembers || [],
					}
					
					useClientOnboardingStore.setState({ enterpriseData })
				}
				
				// Update completeness
				updateProfileCompleteness(data.data)
				
				// Invalidate query
				queryClient.invalidateQueries({ queryKey: ['clientOnboarding'] })
				
				// Auto-advance to next step
				nextStep()
			}
		},
		onError: (error) => {
			console.error('Basic Information mutation error:', error)
		},
	})
}

/**
 * Step 2: Preferences Mutation
 */
export const usePreferencesMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (preferencesData) => {
			try {
				const response = await clientOnboardingApi.savePreferencesStep(preferencesData)
				if (!response.success) {
					// Create error that preserves structure
					const err = new Error(response.message || 'Failed to save preferences')
					err.response = response // Preserve response structure
					throw err
				}
				return response
			} catch (error) {
				// Preserve original error structure (axios error with response, status, etc.)
				// This allows error formatter to access error.response.data.message and error.response.status
				if (error.response) {
					// Axios error - preserve it
					throw error
				}
				// Non-axios error - create structured error
				const err = new Error(error.message || 'Failed to save preferences')
				err.originalError = error
				throw err
			}
		},
		onSuccess: (data) => {
			if (data.success) {
				const { updateProfileCompleteness, setProfile } = useClientOnboardingStore.getState()
				
				// Update profile and extract enterprise data
				if (data.data?.profile) {
					setProfile(data.data.profile)
					
					// Extract enterprise fields (optional fields for dashboard)
					const enterpriseData = {
						contactPreferences: data.data.profile.contactPreferences || null,
						documents: data.data.profile.documents || [],
						billingPreferences: data.data.profile.billingPreferences || null,
						engagementMetrics: data.data.profile.engagementMetrics || null,
						consents: data.data.profile.consents || null,
						organizationMembers: data.data.profile.organizationMembers || [],
					}
					
					useClientOnboardingStore.setState({ enterpriseData })
				}
				
				// Update completeness
				updateProfileCompleteness(data.data)
				
				// Invalidate query
				queryClient.invalidateQueries({ queryKey: ['clientOnboarding'] })
				
				// Don't auto-advance - this is the last step
			}
		},
		onError: (error) => {
			console.error('Preferences mutation error:', error)
		},
	})
}

/**
 * Submit Profile Mutation
 */
export const useSubmitProfileMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: clientOnboardingApi.submitProfileForReview,
		onSuccess: (data) => {
			if (data.success) {
				queryClient.invalidateQueries({ queryKey: ['clientOnboarding'] })
			} else {
				throw new Error(data.message || 'Profile is not complete yet')
			}
		},
		onError: (error) => {
			console.error('Submit profile error:', error)
		},
	})
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT LOG QUERY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch audit history for a client profile
 * @param {string} profileId - Client profile ID
 * @param {Object} options - Query options (limit, skip, sortBy)
 * @returns {Object} Query result with audit history
 */
export const useProfileAuditHistory = (profileId, options = {}) => {
	const { setAuditHistory, setAuditLoading, setAuditError } = useClientOnboardingStore.getState()

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
	const { setAuditSummary, setAuditLoading, setAuditError } = useClientOnboardingStore.getState()

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

// ────────────────────────────────────────────────────────────
// Selector Hooks (For Component Usage)
// ────────────────────────────────────────────────────────────

export const useClientOnboarding = () => useClientOnboardingStore()
export const useClientCurrentStep = () => useClientOnboardingStore((s) => s.currentStep)
export const useClientCompleteness = () => useClientOnboardingStore((s) => s.getCompleteness())
export const useClientCompletedSteps = () => useClientOnboardingStore((s) => s.completedSteps)
export const useClientProfileStatus = () => useClientOnboardingStore((s) => s.getProfileStatus())
export const useCanEditProfile = () => useClientOnboardingStore((s) => s.canEditProfile())
export const useIsProfileDeleted = () => useClientOnboardingStore((s) => s.isProfileDeleted())

// Enterprise field hooks
export const useEnterpriseData = () => useClientOnboardingStore((s) => s.enterpriseData)
export const useEnterpriseFieldStatus = () => useClientOnboardingStore((s) => s.getEnterpriseFieldStatus())

// Validation hooks
export const useCanPostJobs = () => useClientOnboardingStore((s) => s.canPostJobs())
export const useIsBasicInformationValid = () => {
	const profile = useClientOnboardingStore((s) => s.profile)
	const isValid = useClientOnboardingStore((s) => s.isBasicInformationValid)
	return isValid(profile)
}
export const useIsPreferencesValid = () => {
	const profile = useClientOnboardingStore((s) => s.profile)
	const isValid = useClientOnboardingStore((s) => s.isPreferencesValid)
	return isValid(profile)
}

// Audit log hooks
export const useAuditLogs = () => useClientOnboardingStore((s) => s.auditLogs)
export const useAuditHistory = () => useClientOnboardingStore((s) => s.auditLogs.history)
export const useAuditSummary = () => useClientOnboardingStore((s) => s.auditLogs.summary)
export const useAuditLoading = () => useClientOnboardingStore((s) => s.auditLogs.isLoading)
export const useAuditError = () => useClientOnboardingStore((s) => s.auditLogs.error)

export default useClientOnboardingStore
