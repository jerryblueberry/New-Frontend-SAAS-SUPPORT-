/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT STORE SELECTORS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Selector hooks for accessing client store state.
 * These hooks use single subscriptions to prevent over-rendering.
 * 
 * @module stores/clientStores/selectors
 */

import { useClientOnboardingStore } from './clientOnboardingStore'
import { useClientProfileStore } from './profileStore'
import { useClientAuditLogStore } from './auditLogStore'
import {
	isBasicInformationValid,
	isPreferencesValid,
	canPostJobs,
	getEnterpriseFieldStatus,
	canEditProfile,
	getProfileStatus,
} from './helpers'

// ────────────────────────────────────────────────────────────
// Onboarding Selectors
// ────────────────────────────────────────────────────────────

export const useClientCurrentStep = () => useClientOnboardingStore((s) => s.currentStep)
export const useClientCompletedSteps = () => useClientOnboardingStore((s) => s.completedSteps)
export const useSetStep = () => useClientOnboardingStore((s) => s.setStep)
export const useNextStep = () => useClientOnboardingStore((s) => s.nextStep)
export const usePrevStep = () => useClientOnboardingStore((s) => s.prevStep)
export const useIsStepCompleted = () => useClientOnboardingStore((s) => s.isStepCompleted)

// ────────────────────────────────────────────────────────────
// Profile Selectors
// ────────────────────────────────────────────────────────────

export const useClientProfile = () => useClientProfileStore((s) => s.profile)
export const useClientCompleteness = () => useClientProfileStore((s) => s.getCompleteness())
export const useClientCompletedSections = () => useClientProfileStore((s) => s.getCompletedSections())
export const useClientOnboardingState = () => useClientProfileStore((s) => s.onboarding)
export const useIsProfileComplete = () => useClientProfileStore((s) => s.isProfileComplete())
export const useIsOnboardingComplete = () => useClientProfileStore((s) => s.isOnboardingComplete())
export const useIsProfileDeleted = () => useClientProfileStore((s) => s.isProfileDeleted())
export const useMarkOnboardingComplete = () => useClientProfileStore((s) => s.markOnboardingComplete)

// ────────────────────────────────────────────────────────────
// Enterprise Field Selectors
// ────────────────────────────────────────────────────────────

export const useEnterpriseData = () => useClientProfileStore((s) => s.enterpriseData)
export const useEnterpriseFieldStatus = () => {
	const enterpriseData = useClientProfileStore((s) => s.enterpriseData)
	return getEnterpriseFieldStatus(enterpriseData)
}

// ────────────────────────────────────────────────────────────
// Validation Selectors (using single subscription)
// ────────────────────────────────────────────────────────────

export const useIsBasicInformationValid = () => {
	const profile = useClientProfileStore((s) => s.profile)
	return isBasicInformationValid(profile)
}

export const useIsPreferencesValid = () => {
	const profile = useClientProfileStore((s) => s.profile)
	return isPreferencesValid(profile)
}

export const useCanPostJobs = () => {
	const profile = useClientProfileStore((s) => s.profile)
	const onboarding = useClientProfileStore((s) => s.onboarding)
	return canPostJobs(profile, onboarding)
}

export const useCanEditProfile = () => {
	const profile = useClientProfileStore((s) => s.profile)
	return canEditProfile(profile)
}

export const useClientProfileStatus = () => {
	const profile = useClientProfileStore((s) => s.profile)
	const completeness = useClientProfileStore((s) => s.getCompleteness())
	return getProfileStatus(profile, completeness)
}

// ────────────────────────────────────────────────────────────
// Audit Log Selectors
// ────────────────────────────────────────────────────────────

export const useAuditLogs = () => useClientAuditLogStore((s) => ({
	history: s.history,
	summary: s.summary,
	isLoading: s.isLoading,
	error: s.error,
}))
export const useAuditHistory = () => useClientAuditLogStore((s) => s.history)
export const useAuditSummary = () => useClientAuditLogStore((s) => s.summary)
export const useAuditLoading = () => useClientAuditLogStore((s) => s.isLoading)
export const useAuditError = () => useClientAuditLogStore((s) => s.error)

