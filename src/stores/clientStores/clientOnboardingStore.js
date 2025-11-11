/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT ONBOARDING STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Minimal store for onboarding step/wizard logic only.
 * ONE-STEP ONBOARDING: Only basic info required (step 1)
 * Step 2 (preferences) is optional and managed via profile pages.
 * 
 * This store does NOT persist step state (wizard UIs should start clean).
 * 
 * @module stores/clientStores/clientOnboardingStore
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Step configuration - ONE-STEP ONBOARDING
const REQUIRED_STEPS = 1 // Only step 1 is required for onboarding
const OPTIONAL_STEP = 2 // Preferences step (optional)

/**
 * Initial state for onboarding wizard
 * Note: currentStep is NOT persisted (wizard should start fresh)
 */
const initialState = {
	// Step management (ephemeral - not persisted)
	currentStep: 1, // 1-based indexing (1-2)
	completedSteps: [], // Array of completed step numbers [1, 2]
}

/**
 * Client Onboarding Store
 * Manages step navigation and completion tracking for onboarding wizard
 */
export const useClientOnboardingStore = create(
	devtools(
		(set, get) => ({
			...initialState,

			// ─── Step Actions ───────────────────────────────────────────

			/**
			 * Set current step
			 * @param {number} step - Step number (1-2)
			 */
			setStep: (step) => {
				// Allow step 1 (required) and step 2 (optional)
				if (step >= 1 && step <= 2) {
					set({ currentStep: step })
					window.scrollTo(0, 0)
				}
			},

			/**
			 * Move to next step
			 * Don't auto-advance - step 2 is optional
			 */
			nextStep: () => {
				const currentStep = get().currentStep
				if (currentStep < 2) {
					set({ currentStep: currentStep + 1 })
					window.scrollTo(0, 0)
				}
			},

			/**
			 * Move to previous step
			 */
			prevStep: () => {
				const currentStep = get().currentStep
				if (currentStep > 1) {
					set({ currentStep: currentStep - 1 })
					window.scrollTo(0, 0)
				}
			},

			/**
			 * Set completed steps
			 * @param {number[]} steps - Array of completed step numbers
			 */
			setCompletedSteps: (steps) => {
				set({ completedSteps: steps })
			},

			/**
			 * Reset onboarding store to initial state
			 */
			resetOnboarding: () => {
				set(initialState)
			},

			// ─── Step Selectors ─────────────────────────────────────────

			/**
			 * Check if step is completed
			 * @param {number} stepNumber - Step number to check
			 * @returns {boolean} True if step is completed
			 */
			isStepCompleted: (stepNumber) => {
				const completedSteps = get().completedSteps
				return completedSteps.includes(stepNumber)
			},

			/**
			 * Get next available step
			 * @returns {number} Next available step number
			 */
			getNextAvailableStep: (onboarding) => {
				const completedSteps = get().completedSteps
				// Step 1 is required
				if (!completedSteps.includes(1)) {
					return 1
				}
				// Step 2 is optional - can always access if basic info is complete
				if (onboarding?.isBasicInfoComplete && onboarding?.canAddPreferences) {
					return 2 // Optional preferences step
				}
				return 1 // Stay on step 1 if can't add preferences
			},
		}),
		{
			name: 'client-onboarding-store',
		}
	)
)

