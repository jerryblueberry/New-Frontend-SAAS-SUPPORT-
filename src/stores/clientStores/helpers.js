/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT STORE HELPERS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Pure utility functions for client onboarding and profile management.
 * These functions are stateless and can be used across stores and components.
 * 
 * @module stores/clientStores/helpers
 */

/**
 * Compute onboarding status from profile and completion data
 * ONE-STEP ONBOARDING: Basic info complete = 100% onboarding
 * 
 * @param {Object} profile - Client profile object
 * @param {Object} profileCompletion - Profile completion data
 * @returns {Object} Onboarding status object
 */
export function computeOnboardingStatus(profile, profileCompletion) {
	const isBasicInfoComplete = profileCompletion?.completedSections?.basicInformation === true
	return {
		isBasicInfoComplete,
		onboardingComplete: isBasicInfoComplete, // One-step onboarding
		canAddPreferences: profile?.accountType === 'individual' && !profile?.isDeleted,
		hasPreferences: Boolean(
			profile?.preferences?.supportCategories?.length > 0 ||
			profile?.preferences?.serviceRegions?.length > 0
		),
	}
}

/**
 * Parse enterprise fields from profile
 * Extracts optional enterprise fields that can be added post-onboarding
 * 
 * @param {Object} profile - Client profile object
 * @returns {Object} Enterprise fields object
 */
export function parseEnterpriseFields(profile) {
	return {
		contactPreferences: profile?.contactPreferences || null,
		documents: profile?.documents || [],
		billingPreferences: profile?.billingPreferences || null,
		engagementMetrics: profile?.engagementMetrics || null,
		consents: profile?.consents || null,
		organizationMembers: profile?.organizationMembers || [],
	}
}

/**
 * Check if basic information step is valid (minimal onboarding)
 * Required: accountType, address (all fields), orgName/ABN if organization
 * 
 * @param {Object} profile - Client profile object
 * @returns {boolean} True if basic information is valid
 */
export function isBasicInformationValid(profile) {
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
}

/**
 * Check if preferences step is valid (OPTIONAL - doesn't affect onboarding)
 * Preferences are optional and can be added later
 * Only applicable for individual clients
 * 
 * @param {Object} profile - Client profile object
 * @returns {boolean} True if preferences are valid (or not required)
 */
export function isPreferencesValid(profile) {
	// Preferences are optional - always return true if not set
	if (!profile) return false
	if (profile.accountType !== 'individual') return false // Organizations can't set preferences
	
	// If preferences exist, check if they're valid
	if (profile.preferences) {
		const hasSupportCategories = Array.isArray(profile.preferences.supportCategories) &&
			profile.preferences.supportCategories.length > 0
		
		const hasServiceRegions = Array.isArray(profile.preferences.serviceRegions) &&
			profile.preferences.serviceRegions.length > 0
		
		// Valid if both exist, but not required for onboarding
		return hasSupportCategories && hasServiceRegions
	}
	
	return true // No preferences is also valid (optional)
}

/**
 * Check if profile can post jobs
 * Requires: Profile verified/active AND basic info complete (100% onboarding)
 * 
 * @param {Object} profile - Client profile object
 * @param {Object} onboarding - Onboarding status object
 * @returns {boolean} True if profile can post jobs
 */
export function canPostJobs(profile, onboarding) {
	if (!profile) return false
	
	const isVerified = ['verified', 'active'].includes(profile.status)
	const isOnboardingComplete = onboarding?.onboardingComplete === true // Basic info complete
	
	return isVerified && isOnboardingComplete && !profile.isDeleted
}

/**
 * Get enterprise field status
 * Returns object with boolean flags for each enterprise field
 * 
 * @param {Object} enterpriseData - Enterprise data object
 * @returns {Object} Enterprise field status flags
 */
export function getEnterpriseFieldStatus(enterpriseData) {
	return {
		hasContactPreferences: Boolean(enterpriseData?.contactPreferences),
		hasDocuments: Array.isArray(enterpriseData?.documents) && enterpriseData.documents.length > 0,
		hasBillingPreferences: Boolean(enterpriseData?.billingPreferences),
		hasEngagementMetrics: Boolean(enterpriseData?.engagementMetrics),
		hasConsents: Boolean(enterpriseData?.consents),
		hasOrganizationMembers: Array.isArray(enterpriseData?.organizationMembers) && enterpriseData.organizationMembers.length > 0,
	}
}

/**
 * Check if profile can be edited
 * Editable states: draft, unverified, rejected
 * 
 * @param {Object} profile - Client profile object
 * @returns {boolean} True if profile can be edited
 */
export function canEditProfile(profile) {
	if (!profile) return true // New users can create profiles
	if (profile.isDeleted) return false // Deleted profiles cannot be edited

	const editableStatuses = ['draft', 'unverified', 'rejected']
	return editableStatuses.includes(profile.status)
}

/**
 * Get profile status information
 * 
 * @param {Object} profile - Client profile object
 * @param {number} completeness - Profile completeness percentage
 * @returns {Object} Profile status object
 */
export function getProfileStatus(profile, completeness) {
	if (!profile) {
		return { status: 'draft', canEdit: true, isDeleted: false, completeness: 0 }
	}

	return {
		status: profile.status || 'draft',
		canEdit: canEditProfile(profile),
		isDeleted: profile.isDeleted || false,
		completeness: completeness || 0,
	}
}

