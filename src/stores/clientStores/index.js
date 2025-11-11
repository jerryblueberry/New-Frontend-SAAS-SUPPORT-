/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT STORES INDEX
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Main export file for client stores.
 * Provides backward-compatible exports and unified access to all stores.
 * 
 * @module stores/clientStores
 */

// Store exports
export { useClientOnboardingStore } from './clientOnboardingStore'
export { useClientProfileStore } from './profileStore'
export { useClientAuditLogStore } from './auditLogStore'

// Query exports
export {
	useClientOnboardingQuery,
	useProfileAuditHistory,
	useProfileAuditSummary,
} from './queries'

// Mutation exports
export {
	useBasicInformationMutation,
	usePreferencesMutation,
	useSubmitProfileMutation,
} from './mutations'

// Selector exports
export {
	// Onboarding selectors
	useClientCurrentStep,
	useClientCompletedSteps,
	useSetStep,
	useNextStep,
	usePrevStep,
	useIsStepCompleted,
	
	// Profile selectors
	useClientProfile,
	useClientCompleteness,
	useClientCompletedSections,
	useClientOnboardingState,
	useIsProfileComplete,
	useIsOnboardingComplete,
	useIsProfileDeleted,
	useMarkOnboardingComplete,
	
	// Enterprise field selectors
	useEnterpriseData,
	useEnterpriseFieldStatus,
	
	// Validation selectors
	useIsBasicInformationValid,
	useIsPreferencesValid,
	useCanPostJobs,
	useCanEditProfile,
	useClientProfileStatus,
	
	// Audit log selectors
	useAuditLogs,
	useAuditHistory,
	useAuditSummary,
	useAuditLoading,
	useAuditError,
} from './selectors'

// Helper exports
export {
	computeOnboardingStatus,
	parseEnterpriseFields,
	isBasicInformationValid,
	isPreferencesValid,
	canPostJobs,
	getEnterpriseFieldStatus,
	canEditProfile,
	getProfileStatus,
} from './helpers'

// Note: useClientOnboarding is defined in useClientOnboardingStore.js
// to avoid duplicate export conflicts. Import it from there:
// import { useClientOnboarding } from '../useClientOnboardingStore'

// ────────────────────────────────────────────────────────────
// Backward Compatibility: Unified Store Selector
// ────────────────────────────────────────────────────────────

/**
 * Create a combined store selector for backward compatibility
 * This allows useClientOnboardingStore((state) => state.profileCompleteness) to work
 */
const createCombinedStoreSelector = () => {
	return (selector) => {
		const onboarding = useClientOnboardingStore.getState()
		const profile = useClientProfileStore.getState()
		const auditLogs = useClientAuditLogStore.getState()
		
		const combinedState = {
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
			
			// Legacy methods
			setLoading: () => {},
			setSaving: () => {},
			setError: () => {},
			resetStore: () => {
				onboarding.resetOnboarding()
				profile.resetProfile()
				auditLogs.resetAuditLogs()
			},
			checkPersistence: async () => {},
		}
		
		return selector ? selector(combinedState) : combinedState
	}
}

// Export combined store selector for backward compatibility
export const useClientOnboardingStoreSelector = createCombinedStoreSelector()

// Note: useClientOnboarding is exported as named export only
// Default export removed to avoid duplicate export conflicts
// Import via: import { useClientOnboarding } from './clientStores'

