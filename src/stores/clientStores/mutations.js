/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT MUTATIONS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * TanStack Query mutations for client onboarding and profile management.
 * Includes optimistic updates with rollback on error.
 * 
 * @module stores/clientStores/mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as clientOnboardingApi from '../../api/clientProfile'
import { useClientProfileStore } from './profileStore'
import { useClientOnboardingStore } from './clientOnboardingStore'
import { parseEnterpriseFields } from './helpers'

/**
 * Step 1: Basic Information Mutation
 * ONE-STEP ONBOARDING: Basic info complete = 100% onboarding
 */
export const useBasicInformationMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (basicInfoData) => {
			try {
				const response = await clientOnboardingApi.saveBasicInformationStep(basicInfoData)
				if (!response.success) {
					const err = new Error(response.message || 'Failed to save basic information')
					err.response = response
					throw err
				}
				return response
			} catch (error) {
				if (error.response) {
					throw error
				}
				const err = new Error(error.message || 'Failed to save basic information')
				err.originalError = error
				throw err
			}
		},
		onMutate: async (basicInfoData) => {
			await queryClient.cancelQueries({ queryKey: ['clientOnboarding'] })
			await queryClient.cancelQueries({ queryKey: ['clientProfile'] })
			
			const prevState = useClientProfileStore.getState()
			const prevSnapshot = {
				profile: prevState.profile,
				profileCompleteness: prevState.profileCompleteness,
				onboarding: prevState.onboarding,
			}
			
			// Optimistically update local store
			useClientProfileStore.setState((state) => {
				const nextProfile = { ...(state.profile || {}), ...basicInfoData }
				const nextCompleted = {
					...state.profileCompleteness.completedSections,
					basicInformation: true,
				}
				return {
					profile: nextProfile,
					profileCompleteness: {
						...state.profileCompleteness,
						completedSections: nextCompleted,
						percentage: 100, // One-step onboarding: basic info = 100%
					},
					onboarding: {
						...state.onboarding,
						isBasicInfoComplete: true,
						onboardingComplete: true,
					},
				}
			})
			
			// Update completed steps in onboarding store
			useClientOnboardingStore.setState((state) => ({
				completedSteps: [...new Set([...state.completedSteps, 1])],
			}))
			
			return { prevSnapshot }
		},
		onSuccess: (data) => {
			if (data.success) {
				const { updateProfileCompleteness, setProfile } = useClientProfileStore.getState()
				
				// Update profile and extract enterprise data
				if (data.data?.profile) {
					setProfile(data.data.profile)
					
					const enterpriseData = parseEnterpriseFields(data.data.profile)
					useClientProfileStore.setState({ enterpriseData })
				}
				
				// Update completeness (includes onboarding status)
				updateProfileCompleteness(data.data)
				
				// Invalidate queries
				queryClient.invalidateQueries({ queryKey: ['clientOnboarding'] })
				queryClient.invalidateQueries({ queryKey: ['clientProfile'] })
			}
		},
		onError: (error, _vars, context) => {
			// Rollback optimistic update
			if (context?.prevSnapshot) {
				useClientProfileStore.setState({
					profile: context.prevSnapshot.profile,
					profileCompleteness: context.prevSnapshot.profileCompleteness,
					onboarding: context.prevSnapshot.onboarding,
				})
			}
			console.error('Basic Information mutation error:', error)
		},
	})
}

/**
 * Step 2: Preferences Mutation
 * OPTIONAL: Preferences don't affect onboarding completion
 */
export const usePreferencesMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (preferencesData) => {
			try {
				const response = await clientOnboardingApi.savePreferencesStep(preferencesData)
				if (!response.success) {
					const err = new Error(response.message || 'Failed to save preferences')
					err.response = response
					throw err
				}
				return response
			} catch (error) {
				if (error.response) {
					throw error
				}
				const err = new Error(error.message || 'Failed to save preferences')
				err.originalError = error
				throw err
			}
		},
		onMutate: async (preferencesData) => {
			await queryClient.cancelQueries({ queryKey: ['clientOnboarding'] })
			
			const prevState = useClientProfileStore.getState()
			const prevSnapshot = {
				profile: prevState.profile,
				onboarding: prevState.onboarding,
			}
			
			// Optimistically apply preferences (does not affect onboarding completion)
			useClientProfileStore.setState((state) => {
				const nextProfile = {
					...(state.profile || {}),
					preferences: {
						...(state.profile?.preferences || {}),
						...preferencesData,
					},
				}
				return { profile: nextProfile }
			})
			
			return { prevSnapshot }
		},
		onSuccess: (data) => {
			if (data.success) {
				const { updateProfileCompleteness, setProfile } = useClientProfileStore.getState()
				
				// Update profile and extract enterprise data
				if (data.data?.profile) {
					setProfile(data.data.profile)
					
					const enterpriseData = parseEnterpriseFields(data.data.profile)
					useClientProfileStore.setState({ enterpriseData })
				}
				
				// Update completeness (preferences don't affect onboarding completion)
				updateProfileCompleteness(data.data)
				
				// Invalidate queries
				queryClient.invalidateQueries({ queryKey: ['clientOnboarding'] })
				queryClient.invalidateQueries({ queryKey: ['clientProfile'] })
			}
		},
		onError: (error, _vars, context) => {
			// Rollback optimistic update
			if (context?.prevSnapshot) {
				useClientProfileStore.setState({
					profile: context.prevSnapshot.profile,
					onboarding: context.prevSnapshot.onboarding,
				})
			}
			console.error('Preferences mutation error:', error)
		},
	})
}

/**
 * Submit Profile Mutation
 * Manually submit profile for admin review
 */
export const useSubmitProfileMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: clientOnboardingApi.submitProfileForReview,
		onSuccess: (data) => {
			if (data.success) {
				const state = useClientProfileStore.getState()
				// Reflect submitted status locally immediately
				if (state.profile) {
					useClientProfileStore.setState({
						profile: { ...state.profile, status: 'submitted' },
					})
				}
				queryClient.invalidateQueries({ queryKey: ['clientOnboarding'] })
				queryClient.invalidateQueries({ queryKey: ['clientProfile'] })
			} else {
				throw new Error(data.message || 'Profile is not complete yet')
			}
		},
		onError: (error) => {
			console.error('Submit profile error:', error)
		},
	})
}

