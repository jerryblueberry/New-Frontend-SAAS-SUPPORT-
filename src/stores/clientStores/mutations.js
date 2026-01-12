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
import toast from 'react-hot-toast'
import * as clientOnboardingApi from '../../api/clientProfile'
import { useClientProfileStore } from './profileStore'
import { useClientOnboardingStore } from './clientOnboardingStore'
import { parseEnterpriseFields } from './helpers'
import { formatApiError } from '../../utils/errorFormatter'

/**
 * Navigation helper - uses window.location for programmatic navigation
 * Components can also handle navigation if needed
 */
const navigateTo = (path) => {
	if (typeof window !== 'undefined' && window.location) {
		window.location.href = path
	}
}

/**
 * Analytics tracking helper (placeholder for production analytics)
 * Replace with your analytics service (e.g., Google Analytics, Mixpanel, etc.)
 */
const trackEvent = (eventName, properties = {}) => {
	// TODO: Replace with actual analytics service
	if (process.env.NODE_ENV === 'development') {
		console.log('[Analytics]', eventName, properties)
	}
	// Example: analytics.track(eventName, properties)
}

/**
 * Step 1: Basic Information Mutation
 * ONE-STEP ONBOARDING: Basic info complete = 100% onboarding
 * 
 * ⚠️ SIDE EFFECTS: All side effects (toasts, navigation, analytics) are centralized here
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
		onSuccess: (data, variables, context) => {
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
				
				// ✅ SIDE EFFECT: Toast notification (with completion status)
				const isComplete = data.data?.onboardingComplete === true || 
				                  data.data?.isBasicInfoComplete === true ||
				                  data.data?.profileCompletion?.completedSections?.basicInformation === true
				const wasAutoSubmitted = data.data?.wasAutoSubmitted === true
				
				if (isComplete && wasAutoSubmitted) {
					toast.success('Profile completed and submitted for admin review! 🎉', {
						duration: 5000,
					})
				} else if (isComplete) {
					toast.success('Basic information complete! Your profile is ready.', {
						duration: 4000,
					})
				} else {
					toast.success('Basic information saved successfully!', {
						duration: 3000,
					})
				}
				
				// ✅ SIDE EFFECT: Analytics tracking
				trackEvent('client_onboarding_step_completed', {
					step: 1,
					stepName: 'basic_information',
					profileId: data.data?.profile?._id,
					isComplete,
					wasAutoSubmitted,
				})
				
				// ✅ SIDE EFFECT: Query invalidation (triggers refetch)
				queryClient.invalidateQueries({ queryKey: ['clientOnboarding'] })
				queryClient.invalidateQueries({ queryKey: ['clientProfile'] })
				
				// Refetch immediately to update UI
				queryClient.refetchQueries({ queryKey: ['clientOnboarding'] })
			}
		},
		onError: (error, variables, context) => {
			// Rollback optimistic update
			if (context?.prevSnapshot) {
				useClientProfileStore.setState({
					profile: context.prevSnapshot.profile,
					profileCompleteness: context.prevSnapshot.profileCompleteness,
					onboarding: context.prevSnapshot.onboarding,
				})
			}
			
			// ✅ SIDE EFFECT: Error toast
			const errorMessage = formatApiError(error)
			toast.error(errorMessage || 'Failed to save basic information. Please try again.')
			
			// ✅ SIDE EFFECT: Error analytics
			trackEvent('client_onboarding_step_failed', {
				step: 1,
				stepName: 'basic_information',
				error: error.message,
				errorCode: error.response?.data?.code,
				statusCode: error.response?.status,
			})
			
			// Log error with context
			console.error('Basic Information mutation error:', {
				error: error.message,
				code: error.response?.data?.code,
				status: error.response?.status,
				data: error.response?.data,
			})
		},
	})
}

/**
 * Step 2: Preferences Mutation
 * OPTIONAL: Preferences don't affect onboarding completion
 * 
 * ⚠️ SIDE EFFECTS: All side effects (toasts, navigation, analytics) are centralized here
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
		onSuccess: (data, variables, context) => {
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
				
				// ✅ SIDE EFFECT: Toast notification
				toast.success('Preferences saved successfully!')
				
				// ✅ SIDE EFFECT: Analytics tracking
				trackEvent('client_preferences_saved', {
					profileId: data.data?.profile?._id,
					hasPreferences: !!data.data?.profile?.preferences,
				})
				
				// ✅ SIDE EFFECT: Query invalidation
				queryClient.invalidateQueries({ queryKey: ['clientOnboarding'] })
				queryClient.invalidateQueries({ queryKey: ['clientProfile'] })
			}
		},
		onError: (error, variables, context) => {
			// Rollback optimistic update
			if (context?.prevSnapshot) {
				useClientProfileStore.setState({
					profile: context.prevSnapshot.profile,
					onboarding: context.prevSnapshot.onboarding,
				})
			}
			
			// ✅ SIDE EFFECT: Error toast
			const errorMessage = formatApiError(error)
			toast.error(errorMessage || 'Failed to save preferences. Please try again.')
			
			// ✅ SIDE EFFECT: Error analytics
			trackEvent('client_preferences_save_failed', {
				error: error.message,
				errorCode: error.response?.data?.code,
				statusCode: error.response?.status,
			})
			
			console.error('Preferences mutation error:', error)
		},
	})
}

/**
 * Submit Profile Mutation
 * Manually submit profile for admin review
 * 
 * ⚠️ SIDE EFFECTS: All side effects (toasts, navigation, analytics) are centralized here
 */
export const useSubmitProfileMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: clientOnboardingApi.submitProfileForReview,
		onSuccess: (data, variables, context) => {
			if (data.success) {
				const state = useClientProfileStore.getState()
				// Reflect submitted status locally immediately
				if (state.profile) {
					useClientProfileStore.setState({
						profile: { ...state.profile, status: 'submitted' },
					})
				}
				
				// ✅ SIDE EFFECT: Toast notification
				toast.success('Profile submitted successfully! Your profile is now under review.')
				
				// ✅ SIDE EFFECT: Analytics tracking
				trackEvent('client_profile_submitted', {
					profileId: state.profile?._id,
					status: 'submitted',
				})
				
				// ✅ SIDE EFFECT: Navigation to dashboard
				// Note: Components can override this by handling navigation themselves
				setTimeout(() => {
					navigateTo('/client/dashboard')
				}, 1500) // Small delay to show success toast
				
				// ✅ SIDE EFFECT: Query invalidation
				queryClient.invalidateQueries({ queryKey: ['clientOnboarding'] })
				queryClient.invalidateQueries({ queryKey: ['clientProfile'] })
			} else {
				throw new Error(data.message || 'Profile is not complete yet')
			}
		},
		onError: (error, variables, context) => {
			// ✅ SIDE EFFECT: Error handling with specific messages
			let errorMessage = 'Failed to submit profile. Please try again.'
			
			if (error.response?.data?.code === 'NO_PROFILE') {
				errorMessage = 'Please complete your onboarding before submitting your profile.'
				console.warn('No profile found - user needs to complete onboarding')
			} else if (error.response?.data?.code === 'INCOMPLETE_PROFILE') {
				const missingFields = error.response?.data?.missingFields || []
				errorMessage = `Please complete all required fields: ${missingFields.join(', ')}`
				console.warn('Profile incomplete - missing required fields:', missingFields)
			} else if (error.response?.data?.code === 'ALREADY_SUBMITTED') {
				errorMessage = 'Your profile has already been submitted for review.'
				console.info('Profile already submitted')
			} else {
				errorMessage = formatApiError(error) || errorMessage
			}
			
			// ✅ SIDE EFFECT: Error toast
			toast.error(errorMessage)
			
			// ✅ SIDE EFFECT: Error analytics
			trackEvent('client_profile_submit_failed', {
				error: error.message,
				errorCode: error.response?.data?.code,
				statusCode: error.response?.status,
			})
			
			// Log error with context
			console.error('Submit profile error:', {
				error: error.message,
				code: error.response?.data?.code,
				status: error.response?.status,
				data: error.response?.data,
			})
		},
	})
}

