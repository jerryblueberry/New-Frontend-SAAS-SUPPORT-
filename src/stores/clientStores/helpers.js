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

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DOMAIN RULES - Client Profile Field Restrictions
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Business invariants for field editability based on profile status.
 * These rules are shared across UI, mutations, and other clients.
 * 
 * Backend is the final authority, but these helpers provide consistent
 * client-side behavior and better UX (prevent invalid submissions).
 */

/**
 * Check if restricted fields can be edited based on profile status
 * Restricted fields: accountType, organizationName, abn
 * These are critical business identifiers that cannot change after verification
 * 
 * @param {string} profileStatus - Current profile status
 * @returns {boolean} True if restricted fields can be edited
 */
export function canEditRestrictedFields(profileStatus) {
	const editableStatuses = ['draft', 'unverified', 'rejected']
	return editableStatuses.includes(profileStatus)
}

/**
 * Get list of restricted fields (cannot be changed after verification)
 * 
 * @returns {string[]} Array of restricted field names
 */
export function getRestrictedFields() {
	return ['accountType', 'organizationName', 'abn']
}

/**
 * Get list of always-editable fields (can be changed regardless of status)
 * 
 * @returns {string[]} Array of always-editable field names
 */
export function getAlwaysEditableFields() {
	return ['ndisNumber', 'address', 'emergencyContact']
}

/**
 * Build payload for basic info update with field-level restrictions
 * Filters out restricted fields if status doesn't allow editing them
 * 
 * ⚠️ IMPORTANT: For onboarding (new profiles), accountType is ALWAYS required
 * and should be included regardless of status restrictions.
 * 
 * @param {Object} values - Form values
 * @param {string} profileStatus - Current profile status (or 'draft' for new profiles)
 * @param {Object} location - Location state (for address coordinates)
 * @param {string} addressMethod - Address entry method ('geolocation' | 'manual')
 * @param {boolean} isOnboarding - Whether this is initial onboarding (new profile)
 * @returns {Object} Cleaned payload ready for API
 */
export function buildBasicInfoPayload(values, profileStatus = 'draft', location = null, addressMethod = 'manual', isOnboarding = false) {
	const payload = {}
	
	// Handle account type cleanup
	if (values.accountType === 'individual') {
		values.organizationName = undefined
		values.abn = undefined
	}
	
	// For onboarding (new profiles), accountType is ALWAYS required
	// For updates via onboarding endpoint, include accountType if status allows editing
	// NOTE: The onboarding endpoint requires accountType, so we must include it if status allows
	if (isOnboarding || canEditRestrictedFields(profileStatus)) {
		// accountType is REQUIRED for onboarding endpoint, always include it if allowed
		if (values.accountType) {
			payload.accountType = values.accountType
		}
		
		if (values.organizationName !== undefined) payload.organizationName = values.organizationName
		if (values.abn !== undefined) payload.abn = values.abn
	}
	
	// Always include always-editable fields
	if (values.ndisNumber !== undefined) payload.ndisNumber = values.ndisNumber
	
	// Handle address - only include if required fields are present
	if (values.address) {
		const suburb = values.address?.suburb?.trim()
		const state = values.address?.state?.trim()
		const postcode = values.address?.postcode?.trim()
		
		// Only include address if required fields are present
		if (suburb && state && postcode) {
			const addressData = {
				street: values.address?.street?.trim() || undefined, // Optional field
				suburb,
				state,
				postcode,
			}
			
			if (location?.coordinates && addressMethod === 'geolocation') {
				addressData.coordinates = location.coordinates
			}
			
			// Remove undefined values
			Object.keys(addressData).forEach(key => {
				if (addressData[key] === undefined) {
					delete addressData[key]
				}
			})
			
			payload.address = addressData
		}
	}
	
	// Handle emergency contact
	if (values.emergencyContact) {
		payload.emergencyContact = values.emergencyContact
	}
	
	// Remove empty strings and null values (but keep accountType if it was included)
	const cleanedPayload = Object.fromEntries(
		Object.entries(payload).filter(([key, v]) => {
			// Always keep accountType if it was included (required for onboarding endpoint)
			if (key === 'accountType' && v) return true
			
			if (v === '' || v === null || v === undefined) return false
			if (typeof v === 'object' && Object.keys(v).length === 0) return false
			return true
		})
	)
	
	return cleanedPayload
}

