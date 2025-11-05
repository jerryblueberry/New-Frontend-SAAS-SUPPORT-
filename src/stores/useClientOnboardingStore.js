import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClientProfile, upsertClientProfileStep } from '../api/clientProfile'

const STEP_ORDER = ['basicInformation', 'verification', 'preferences', 'review']

// Store shape with persistence
const useClientOnboardingStore = create(
	devtools(
		persist(
			(set, get) => ({
				profile: null,
				activeStep: 0, // 0-based for UI (0-3)
				isFetching: false,
				isSaving: false,
				error: null,

				// Actions
				setProfile(profile) {
					set((state) => {
						const updates = { profile }
						
						// Auto-sync activeStep with backend progressStep
						if (profile?.progressStep) {
							const backendStep = Math.max(1, Math.min(4, profile.progressStep))
							// Convert 1-based backend to 0-based UI
							const nextStep = backendStep - 1
							
							// Only update if backend suggests higher step
							if (nextStep > state.activeStep) {
								updates.activeStep = nextStep
							}
						}
						
						return { ...state, ...updates }
					})
				},

				setActiveStep(step) {
					const clampedStep = Math.max(0, Math.min(3, step))
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

				// Navigation logic - similar to worker onboarding
				getMaxReachableStepIndex() {
					const completed = get().getCompletedSteps()
					const currentActive = get().activeStep
					
					let maxReachable = 0
					
					// Calculate based on completed steps
					for (let i = 0; i < STEP_ORDER.length; i++) {
						if (completed[STEP_ORDER[i]]) {
							maxReachable = i + 1 // Allow access to next step after completion
						} else {
							break
						}
					}
					
					// Always allow current active step even if not completed
					maxReachable = Math.max(maxReachable, currentActive)
					
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
					
					const maxReachable = get().getMaxReachableStepIndex()
					return stepIndex <= maxReachable
				},

				// Navigation actions
				goTo(stepIndex) {
					if (get().canGoTo(stepIndex)) {
						set({ activeStep: stepIndex })
						return true
					}
					return false
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
