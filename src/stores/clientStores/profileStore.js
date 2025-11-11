/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT PROFILE STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Store for client profile data, completeness, and enterprise fields.
 * This is the primary store for profile state and is persisted.
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
				 * @param {Object} data - API response data
				 */
				hydrateFromApi: (data) => {
					if (!data) return

					const { profile, profileCompletion, onboarding } = data

					// Extract enterprise fields from profile (optional fields)
					const enterpriseData = parseEnterpriseFields(profile || {})

					// Calculate onboarding status
					const onboardingStatus = computeOnboardingStatus(profile, profileCompletion)

					set({
						profile: profile || null,
						profileCompleteness: profileCompletion || initialState.profileCompleteness,
						onboarding: onboarding || onboardingStatus,
						enterpriseData,
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

