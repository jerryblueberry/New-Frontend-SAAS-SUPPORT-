/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT ONBOARDING STORE (Backward Compatibility)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This file maintains backward compatibility with existing imports.
 * The store has been split into modular files in stores/clientStores/
 * 
 * This creates a combined store that merges onboarding, profile, and audit stores
 * to maintain backward compatibility with existing code.
 * 
 * @module stores/useClientOnboardingStore
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useClientOnboardingStore as onboardingStore } from './clientStores/clientOnboardingStore'
import { useClientProfileStore as profileStore } from './clientStores/profileStore'
import { useClientAuditLogStore as auditLogStore } from './clientStores/auditLogStore'
import { useClientOnboardingStore as useOnboardingStore } from './clientStores/clientOnboardingStore'
import { useClientProfileStore as useProfileStore } from './clientStores/profileStore'
import { useClientAuditLogStore as useAuditLogStore } from './clientStores/auditLogStore'

/**
 * Combined store for backward compatibility
 * Merges onboarding, profile, and audit log stores into a single store
 */
export const useClientOnboardingStore = create(
	devtools(
		(set, get) => {
			// Helper to get combined state
			const getCombinedState = () => {
				const onboarding = onboardingStore.getState()
				const profile = profileStore.getState()
				const auditLogs = auditLogStore.getState()
				
				return {
					// Onboarding state
					currentStep: onboarding.currentStep,
					completedSteps: onboarding.completedSteps,
					
					// Profile state
					profile: profile.profile,
					profileCompleteness: profile.profileCompleteness,
					onboarding: profile.onboarding,
					enterpriseData: profile.enterpriseData,
	
	// Audit log state
					auditLogs: auditLogs,
				}
			}
			
			return {
				// ─── State (read-only, computed from combined stores) ─────────────
				get currentStep() {
					return onboardingStore.getState().currentStep
				},
				get completedSteps() {
					return onboardingStore.getState().completedSteps
				},
				get profile() {
					return profileStore.getState().profile
				},
				get profileCompleteness() {
					return profileStore.getState().profileCompleteness
				},
				get onboarding() {
					return profileStore.getState().onboarding
				},
				get enterpriseData() {
					return profileStore.getState().enterpriseData
				},
				get auditLogs() {
					return auditLogStore.getState()
				},

				// ─── Actions ───────────────────────────────────────────

				// Onboarding actions
				setStep: (step) => {
					onboardingStore.getState().setStep(step)
					set({}) // Trigger re-render
				},
				nextStep: () => {
					onboardingStore.getState().nextStep()
					set({})
				},
				prevStep: () => {
					onboardingStore.getState().prevStep()
					set({})
				},
				
				// Profile actions
				setProfile: (profile) => {
					profileStore.getState().setProfile(profile)
					set({})
				},
				updateProfileCompleteness: (data) => {
					profileStore.getState().updateProfileCompleteness(data)
					set({})
				},
				markOnboardingComplete: () => {
					profileStore.getState().markOnboardingComplete()
					set({})
				},
				hydrateFromApi: (data) => {
					profileStore.getState().hydrateFromApi(data)
					// Update completed steps
					const completedSteps = []
					if (data?.profileCompletion?.completedSections?.basicInformation) {
						completedSteps.push(1)
					}
					onboardingStore.setState({ completedSteps })
					set({})
				},
				setEnterpriseData: (enterpriseData) => {
					profileStore.getState().setEnterpriseData(enterpriseData)
					set({})
				},
				
				// Audit log actions
				setAuditHistory: (history) => {
					auditLogStore.getState().setAuditHistory(history)
					set({})
				},
				setAuditSummary: (summary) => {
					auditLogStore.getState().setAuditSummary(summary)
					set({})
				},
				setAuditLoading: (isLoading) => {
					auditLogStore.getState().setAuditLoading(isLoading)
					set({})
				},
				setAuditError: (error) => {
					auditLogStore.getState().setAuditError(error)
					set({})
				},
				
				// Legacy methods
				setLoading: () => {}, // Deprecated
				setSaving: () => {}, // Deprecated
				setError: () => {}, // Deprecated
				resetStore: () => {
					onboardingStore.getState().resetOnboarding()
					profileStore.getState().resetProfile()
					auditLogStore.getState().resetAuditLogs()
					set({})
				},
				checkPersistence: async () => {
					// Legacy method - now handled by queries
				},

				// ─── Selectors ─────────────────────────────────────────

				getCompleteness: () => {
					return profileStore.getState().getCompleteness()
				},
				getCompletedSections: () => {
					return profileStore.getState().getCompletedSections()
				},
				isProfileComplete: () => {
					return profileStore.getState().isProfileComplete()
				},
				isOnboardingComplete: () => {
					return profileStore.getState().isOnboardingComplete()
				},
				isProfileDeleted: () => {
					return profileStore.getState().isProfileDeleted()
				},
				canEditProfile: () => {
					const { canEditProfile } = require('./clientStores/helpers')
					return canEditProfile(profileStore.getState().profile)
				},
				getProfileStatus: () => {
					const { getProfileStatus } = require('./clientStores/helpers')
					const profile = profileStore.getState().profile
					const completeness = profileStore.getState().getCompleteness()
					return getProfileStatus(profile, completeness)
				},
				isStepCompleted: (stepNumber) => {
					return onboardingStore.getState().isStepCompleted(stepNumber)
				},
				getNextAvailableStep: () => {
					const onboarding = profileStore.getState().onboarding
					return onboardingStore.getState().getNextAvailableStep(onboarding)
				},
				isBasicInformationValid: (profile) => {
					const { isBasicInformationValid } = require('./clientStores/helpers')
					return isBasicInformationValid(profile)
				},
				isPreferencesValid: (profile) => {
					const { isPreferencesValid } = require('./clientStores/helpers')
					return isPreferencesValid(profile)
				},
				canPostJobs: () => {
					const { canPostJobs } = require('./clientStores/helpers')
					const profile = profileStore.getState().profile
					const onboarding = profileStore.getState().onboarding
					return canPostJobs(profile, onboarding)
				},
				getEnterpriseFieldStatus: () => {
					const { getEnterpriseFieldStatus } = require('./clientStores/helpers')
					const enterpriseData = profileStore.getState().enterpriseData
					return getEnterpriseFieldStatus(enterpriseData)
				},
			}
		},
		{
			name: 'client-onboarding-store-combined',
		}
	)
)

// Re-export everything from the new modular structure
export {
	// Queries
	useClientOnboardingQuery,
	useProfileAuditHistory,
	useProfileAuditSummary,
} from './clientStores/queries'

// Mutations
export {
	useBasicInformationMutation,
	usePreferencesMutation,
	useSubmitProfileMutation,
} from './clientStores/mutations'

// Selectors
export {
	useClientCurrentStep,
	useClientCompletedSteps,
	useSetStep,
	useNextStep,
	usePrevStep,
	useIsStepCompleted,
	useClientProfile,
	useClientCompleteness,
	useClientCompletedSections,
	useClientOnboardingState,
	useIsProfileComplete,
	useIsOnboardingComplete,
	useIsProfileDeleted,
	useMarkOnboardingComplete,
	useEnterpriseData,
	useEnterpriseFieldStatus,
	useIsBasicInformationValid,
	useIsPreferencesValid,
	useCanPostJobs,
	useCanEditProfile,
	useClientProfileStatus,
	useAuditLogs,
	useAuditHistory,
	useAuditSummary,
	useAuditLoading,
	useAuditError,
} from './clientStores/selectors'

// ────────────────────────────────────────────────────────────
// Combined Store Hook (defined here to avoid duplicate exports)
// ────────────────────────────────────────────────────────────

/**
 * Unified store access for backward compatibility
 * Combines onboarding, profile, and audit log stores
 * 
 * NOTE: This is the ONLY place where useClientOnboarding is exported
 * Using inline export to avoid any bundler confusion
 */
export function useClientOnboarding() {
	const onboarding = useOnboardingStore()
	const profile = useProfileStore()
	const auditLogs = useAuditLogStore()
	
	return {
		// Onboarding state
		currentStep: onboarding.currentStep,
		completedSteps: onboarding.completedSteps,
		setStep: onboarding.setStep,
		nextStep: onboarding.nextStep,
		prevStep: onboarding.prevStep,
		isStepCompleted: onboarding.isStepCompleted,
		getNextAvailableStep: onboarding.getNextAvailableStep,
		resetOnboarding: onboarding.resetOnboarding,
		
		// Profile state
		profile: profile.profile,
		profileCompleteness: profile.profileCompleteness,
		onboarding: profile.onboarding,
		enterpriseData: profile.enterpriseData,
		setProfile: profile.setProfile,
		updateProfileCompleteness: profile.updateProfileCompleteness,
		markOnboardingComplete: profile.markOnboardingComplete,
		hydrateFromApi: profile.hydrateFromApi,
		setEnterpriseData: profile.setEnterpriseData,
		resetProfile: profile.resetProfile,
		
		// Profile selectors
		getCompleteness: profile.getCompleteness,
		getCompletedSections: profile.getCompletedSections,
		isProfileComplete: profile.isProfileComplete,
		isOnboardingComplete: profile.isOnboardingComplete,
		isProfileDeleted: profile.isProfileDeleted,
		
		// Audit log state
		auditLogs: auditLogs,
		setAuditHistory: auditLogs.setAuditHistory,
		setAuditSummary: auditLogs.setAuditSummary,
		setAuditLoading: auditLogs.setAuditLoading,
		setAuditError: auditLogs.setAuditError,
		resetAuditLogs: auditLogs.resetAuditLogs,
		
		// Validation methods (from helpers)
		isBasicInformationValid: (profile) => {
			const { isBasicInformationValid } = require('./clientStores/helpers')
			return isBasicInformationValid(profile)
		},
		isPreferencesValid: (profile) => {
			const { isPreferencesValid } = require('./clientStores/helpers')
			return isPreferencesValid(profile)
		},
		canPostJobs: () => {
			const { canPostJobs } = require('./clientStores/helpers')
			return canPostJobs(profile.profile, profile.onboarding)
		},
		canEditProfile: () => {
			const { canEditProfile } = require('./clientStores/helpers')
			return canEditProfile(profile.profile)
		},
		getProfileStatus: () => {
			const { getProfileStatus } = require('./clientStores/helpers')
			return getProfileStatus(profile.profile, profile.getCompleteness())
		},
		getEnterpriseFieldStatus: () => {
			const { getEnterpriseFieldStatus } = require('./clientStores/helpers')
			return getEnterpriseFieldStatus(profile.enterpriseData)
		},
		
		// Legacy methods
		setLoading: () => {}, // Deprecated - use query loading states
		setSaving: () => {}, // Deprecated - use mutation loading states
		setError: () => {}, // Deprecated - use query/mutation error states
		resetStore: () => {
			onboarding.resetOnboarding()
			profile.resetProfile()
			auditLogs.resetAuditLogs()
		},
		checkPersistence: async () => {
			// Legacy method - now handled by queries automatically
		},
	}
}

// Default export for backward compatibility
export default useClientOnboardingStore
