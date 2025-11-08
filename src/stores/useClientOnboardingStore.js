/**
 * Client Onboarding Store
 * Refactored to follow Worker Onboarding Pattern
 * - Separate mutations for each step
 * - Better progress tracking with completedSteps array
 * - 1-based step indexing (Step 1, Step 2)
 * - TanStack Query for data fetching
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as clientOnboardingApi from '../api/clientProfile'

// Step configuration
const STEP_ORDER = ['basicInformation', 'preferences']
const TOTAL_STEPS = 2

// Initial state
const initialState = {
	currentStep: 1, // 1-based indexing (1-2)
	completedSteps: [], // Array of completed step numbers [1, 2]
	profile: null,
	profileCompleteness: {
		percentage: 0,
		completedSections: {
			basicInformation: false,
			preferences: false,
		},
	},
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

					set({
						currentStep: currentStep || 1,
						completedSteps,
						profile: profile || null,
						profileCompleteness: profileCompletion || initialState.profileCompleteness,
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
					throw new Error(response.message || 'Failed to save basic information')
				}
				return response
			} catch (error) {
				throw new Error(error.message || 'Failed to save basic information')
			}
		},
		onSuccess: (data) => {
			if (data.success) {
				const { updateProfileCompleteness, nextStep, setProfile } = useClientOnboardingStore.getState()
				
				// Update profile
				if (data.data?.profile) {
					setProfile(data.data.profile)
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
					throw new Error(response.message || 'Failed to save preferences')
				}
				return response
			} catch (error) {
				throw new Error(error.message || 'Failed to save preferences')
			}
		},
		onSuccess: (data) => {
			if (data.success) {
				const { updateProfileCompleteness, setProfile } = useClientOnboardingStore.getState()
				
				// Update profile
				if (data.data?.profile) {
					setProfile(data.data.profile)
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

export default useClientOnboardingStore
