/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT PROFILE STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Store for client profile data, completeness, and enterprise fields.
 * This is the primary store for profile state and is persisted.
 * 
 * ⚠️ CRITICAL: This store holds DERIVED/TRANSFORMED data, NOT raw server data.
 * 
 * What this store holds:
 * - ✅ Derived state: profileCompleteness (computed from server data)
 * - ✅ Transformed data: onboarding status (computed from profile + completeness)
 * - ✅ Extracted fields: enterpriseData (parsed from profile)
 * - ✅ Profile data: Transformed via hydrateFromApi (not raw API response)
 * 
 * What this store does NOT hold:
 * - ❌ Raw API responses (TanStack Query cache is source of truth)
 * - ❌ Canonical server entities (queries handle that)
 * 
 * Purpose:
 * - Persist transformed data for offline access
 * - Cache UI-specific projections (completeness, onboarding status)
 * - Provide fast access to derived state without recomputation
 * 
 * @module stores/clientStores/profileStore
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { computeOnboardingStatus, parseEnterpriseFields } from './helpers'

/**
 * Initial state for profile store
 */
const initialState = {
	// Profile data
	profile: null,
	profileCompleteness: {
		percentage: 0,
		completedSections: {
			basicInformation: false,
			preferences: false, // Optional - doesn't affect onboarding completion
		},
	},
	// Onboarding status (separate from profile completeness)
	onboarding: {
		isBasicInfoComplete: false,
		onboardingComplete: false, // 100% onboarding = basic info complete
		canAddPreferences: false, // Only individual clients can add preferences
		hasPreferences: false,
	},
	// Enterprise fields (optional, can be added later via dashboard)
	enterpriseData: {
		contactPreferences: null,
		documents: [],
		billingPreferences: null,
		engagementMetrics: null,
		consents: null,
		organizationMembers: [],
	},
}

/**
 * Client Profile Store
 * Manages profile data, completeness, and enterprise fields
 */
export const useClientProfileStore = create(
	devtools(
		persist(
			(set, get) => ({
				...initialState,

				// ─── Profile Actions ───────────────────────────────────────────

				/**
				 * Set profile data
				 * @param {Object} profile - Profile object
				 */
				setProfile: (profile) => {
					set({ profile })
				},

				/**
				 * Update profile completeness
				 * @param {Object} data - Data object with profileCompletion and profile
				 */
				updateProfileCompleteness: (data) => {
					if (data?.profileCompletion) {
						const profileCompletion = data.profileCompletion
						const profile = data?.profile || get().profile
						const onboardingStatus = computeOnboardingStatus(profile, profileCompletion)
						set({ 
							profileCompleteness: profileCompletion,
							onboarding: onboardingStatus,
						})
					}
				},

				/**
				 * Complete onboarding action (basic info only)
				 * ONE-STEP ONBOARDING: Basic info complete = 100% onboarding
				 */
				markOnboardingComplete: () => {
					const state = get()
					if (!state.onboarding.onboardingComplete) {
						set({
							onboarding: {
								...state.onboarding,
								isBasicInfoComplete: true,
								onboardingComplete: true,
							},
						})
					}
				},

				/**
				 * Hydrate store from API response
				 * 
				 * ⚠️ CRITICAL: This stores TRANSFORMED data, not raw server data.
				 * The profile object here is transformed (enterprise fields extracted,
				 * onboarding status computed). TanStack Query cache is still the
				 * source of truth for fresh server data.
				 * 
				 * @param {Object} data - API response data (already transformed by query)
				 */
				hydrateFromApi: (data) => {
					if (!data) return

					const { profile, profileCompletion, onboarding } = data

					// Extract enterprise fields from profile (TRANSFORMATION)
					const enterpriseData = parseEnterpriseFields(profile || {})

					// Calculate onboarding status (DERIVED STATE)
					const onboardingStatus = computeOnboardingStatus(profile, profileCompletion)

					// Store transformed data (not raw API response)
					set({
						profile: profile || null, // Transformed profile (enterprise fields extracted)
						profileCompleteness: profileCompletion || initialState.profileCompleteness, // Derived
						onboarding: onboarding || onboardingStatus, // Computed status
						enterpriseData, // Extracted fields
					})
				},

				/**
				 * Update enterprise data
				 * @param {Object} enterpriseData - Enterprise data object
				 */
				setEnterpriseData: (enterpriseData) => {
					set({ enterpriseData })
				},

				/**
				 * Reset profile store to initial state
				 */
				resetProfile: () => {
					set(initialState)
				},

				// ─── Profile Selectors ─────────────────────────────────────────

				/**
				 * Get completeness percentage
				 * @returns {number} Completeness percentage (0-100)
				 */
				getCompleteness: () => {
					return get().profileCompleteness.percentage || 0
				},

				/**
				 * Get completed sections
				 * @returns {Object} Completed sections object
				 */
				getCompletedSections: () => {
					return get().profileCompleteness.completedSections || {}
				},

				/**
				 * Check if profile is complete (ONE-STEP: basic info = 100%)
				 * @returns {boolean} True if onboarding is complete
				 */
				isProfileComplete: () => {
					return get().onboarding.onboardingComplete === true
				},

				/**
				 * Check if onboarding is complete (basic info = 100%)
				 * @returns {boolean} True if onboarding is complete
				 */
				isOnboardingComplete: () => {
					return get().onboarding.onboardingComplete === true
				},

				/**
				 * Check if profile is deleted
				 * @returns {boolean} True if profile is deleted
				 */
				isProfileDeleted: () => {
					const profile = get().profile
					return profile?.isDeleted === true
				},
			}),
			{
				name: 'client-profile-storage',
				partialize: (state) => ({
					// Persist only durable state
					profile: state.profile,
					onboarding: state.onboarding,
					enterpriseData: state.enterpriseData,
					// Note: profileCompleteness is recalculated on hydration
				}),
			}
		),
		{
			name: 'client-profile-store',
		}
	)
)

