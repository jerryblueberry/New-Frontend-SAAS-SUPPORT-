import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClientProfile, upsertClientProfileStep } from '../api/clientProfile'

const STEP_ORDER = ['basicInformation', 'preferences']

// Store shape with persistence
const useClientOnboardingStore = create(
	devtools(
		persist(
			(set, get) => ({
				profile: null,
				activeStep: 0, // 0-based for UI (0-1)
				isFetching: false,
				isSaving: false,
				error: null,

				// Actions
				setProfile(profile) {
					set((state) => {
						const updates = { profile }
						
						// Auto-sync activeStep with backend progressStep
						if (profile?.progressStep) {
							const backendStep = Math.max(1, Math.min(2, profile.progressStep))
							// Convert 1-based backend to 0-based UI
							const nextStep = backendStep - 1
							
							// If profile is 100% complete, allow user to navigate anywhere
							// Otherwise, only update if backend suggests higher step
							const completeness = profile?.profileCompleteness?.percentage ?? 0
							if (completeness === 100) {
								// Don't auto-change step if complete - let user navigate freely
								// Keep current step or use backend step if no step set
								if (state.activeStep === 0 && nextStep > 0) {
									updates.activeStep = nextStep
								}
							} else if (nextStep > state.activeStep) {
								// Only advance if not complete and backend suggests higher step
								updates.activeStep = nextStep
							}
						}
						
						return { ...state, ...updates }
					})
				},

				setActiveStep(step) {
					const profile = get().profile
					const completeness = profile?.profileCompleteness?.percentage ?? 0
					
					// If 100% complete, allow any step navigation
					if (completeness === 100) {
						const clampedStep = Math.max(0, Math.min(STEP_ORDER.length - 1, step))
						set({ activeStep: clampedStep })
						return
					}
					
					// Otherwise, respect the normal constraints
					const clampedStep = Math.max(0, Math.min(1, step))
					set({ activeStep: clampedStep })
				},

				setFetching(v) {
					set({ isFetching: !!v })
				},

				setSaving(v) {
					set({ isSaving: !!v })
				},

				setError(err) {
					set({ error: err })
				},

				resetStore() {
					set({
						profile: null,
						activeStep: 0,
						isFetching: false,
						isSaving: false,
						error: null,
					})
				},

				// Selectors
				getCompleteness() {
					const p = get().profile
					return p?.profileCompleteness?.percentage ?? 0
				},

				getCompletedSteps() {
					return get().profile?.profileCompleteness?.completedSteps ?? {}
				},

				// Navigation logic - Best Practice: Allow navigation to any completed step
				getMaxReachableStepIndex() {
					const profile = get().profile
					const completeness = profile?.profileCompleteness?.percentage ?? 0
					
					// If profile is 100% complete, allow navigation to all steps
					if (completeness === 100) {
						return STEP_ORDER.length - 1
					}
					
					const completed = get().getCompletedSteps()
					const currentActive = get().activeStep
					
					// Find the highest completed step index
					// This allows navigation to ANY completed step, not just sequential
					let maxReachable = currentActive // Always allow current step
					
					for (let i = 0; i < STEP_ORDER.length; i++) {
						if (completed[STEP_ORDER[i]]) {
							maxReachable = Math.max(maxReachable, i)
						}
					}
					
					// If a step is completed, also allow the next step
					// This enables users to proceed after completing a step
					if (maxReachable < STEP_ORDER.length - 1) {
						for (let i = 0; i <= maxReachable; i++) {
							if (completed[STEP_ORDER[i]]) {
								maxReachable = Math.max(maxReachable, i + 1)
							}
						}
					}
					
					// Cap at last step index
					return Math.min(maxReachable, STEP_ORDER.length - 1)
				},

				getNextAvailableStep() {
					const completed = get().getCompletedSteps()
					
					for (let i = 0; i < STEP_ORDER.length; i++) {
						if (!completed[STEP_ORDER[i]]) {
							return i
						}
					}
					
					// All complete, return last step
					return STEP_ORDER.length - 1
				},

				canGoTo(stepIndex) {
					// Validate step index
					if (stepIndex < 0 || stepIndex >= STEP_ORDER.length) {
						return false
					}
					
					const profile = get().profile
					const completeness = profile?.profileCompleteness?.percentage ?? 0
					
					// If profile is 100% complete, allow navigation to any step
					if (completeness === 100) {
						return true
					}
					
					const completed = get().getCompletedSteps()
					const currentActive = get().activeStep
					
					// Best Practice: Allow navigation to ANY completed step
					// This allows users to freely navigate between all previously completed steps
					if (completed[STEP_ORDER[stepIndex]]) {
						return true
					}
					
					// Allow navigation to current step
					if (stepIndex === currentActive) {
						return true
					}
					
					// Allow next step if previous step is completed
					if (stepIndex > 0 && completed[STEP_ORDER[stepIndex - 1]]) {
						return true
					}
					
					// Allow first step always
					if (stepIndex === 0) {
						return true
					}
					
					return false
				},

				// Navigation actions
				goTo(stepIndex) {
					if (get().canGoTo(stepIndex)) {
						set({ activeStep: stepIndex })
						return true
					}
					return false
				},
				
				// Check if profile is fully complete
				isProfileComplete() {
					const completeness = get().getCompleteness()
					return completeness === 100
				},

				goNext() {
					const current = get().activeStep
					const maxReachable = get().getMaxReachableStepIndex()
					const nextStep = current + 1
					
					if (nextStep < STEP_ORDER.length && nextStep <= maxReachable) {
						set({ activeStep: nextStep })
						return true
					}
					return false
				},

				goPrev() {
					const current = get().activeStep
					if (current > 0) {
						set({ activeStep: current - 1 })
						return true
					}
					return false
				},

				// Check if current step is completed
				isStepCompleted(stepIndex) {
					const completed = get().getCompletedSteps()
					return !!completed[STEP_ORDER[stepIndex]]
				},

				// Get all completed step indices
				getCompletedStepIndices() {
					const completed = get().getCompletedSteps()
					return STEP_ORDER.map((key, idx) => completed[key] ? idx : null).filter(idx => idx !== null)
				},
			}),
			{
				name: 'client-onboarding-storage',
				partialize: (state) => ({
					activeStep: state.activeStep,
				}),
			}
		)
	)
)

// Hook: fetch profile with caching and store sync
export function useClientProfileQuery(options = {}) {
	const setProfile = useClientOnboardingStore((s) => s.setProfile)
	const setFetching = useClientOnboardingStore((s) => s.setFetching)
	const setError = useClientOnboardingStore((s) => s.setError)

	return useQuery({
		queryKey: ['clientProfile'],
		queryFn: async () => {
			setFetching(true)
			const res = await getClientProfile()
			return res.data?.profile || null
		},
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
		onSuccess: (profile) => { setProfile(profile); setFetching(false) },
		onError: (err) => { setError(err?.response?.data?.message || err.message); setFetching(false) },
		...options,
	})
}

// Hook: upsert step with optimistic update
export function useUpsertClientStepMutation() {
	const queryClient = useQueryClient()
	const setSaving = useClientOnboardingStore((s) => s.setSaving)
	const setProfile = useClientOnboardingStore((s) => s.setProfile)
	const currentProfile = useClientOnboardingStore((s) => s.profile)

	return useMutation({
		mutationFn: async ({ step, payload }) => {
			setSaving(true)
			const res = await upsertClientProfileStep(step, payload)
			return res.data?.profile
		},
		onMutate: async ({ step, payload }) => {
			await queryClient.cancelQueries({ queryKey: ['clientProfile'] })
			const prev = queryClient.getQueryData(['clientProfile'])
			// Optimistically merge minimal payload
			const optimistic = { ...(currentProfile || {}), ...(payload || {}) }
			queryClient.setQueryData(['clientProfile'], optimistic)
			setProfile(optimistic)
			return { prev }
		},
		onError: (err, _vars, ctx) => {
			if (ctx?.prev) queryClient.setQueryData(['clientProfile'], ctx.prev)
		},
		onSuccess: (profile) => {
			setProfile(profile)
			queryClient.setQueryData(['clientProfile'], profile)
		},
		onSettled: async () => {
			setSaving(false)
			await queryClient.invalidateQueries({ queryKey: ['clientProfile'] })
		},
	})
}

// Selectors helpers
export const useClientOnboarding = () => useClientOnboardingStore()
export const useClientActiveStep = () => useClientOnboardingStore((s) => s.activeStep)
export const useClientCompleteness = () => useClientOnboardingStore((s) => s.getCompleteness())
export const useClientCompletedSteps = () => useClientOnboardingStore((s) => s.getCompletedSteps())

export default useClientOnboardingStore
