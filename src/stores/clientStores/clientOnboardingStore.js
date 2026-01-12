/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT ONBOARDING STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Minimal store for onboarding step/wizard logic only.
 * 
 * CURRENT: SINGLE-STEP ONBOARDING (step 1 only)
 * FUTURE: Easily expandable to multiple steps - see ADDING_ONBOARDING_STEPS_GUIDE.md
 * 
 * NOTE: Preferences are NOT part of onboarding - they can be added later via
 * profile pages but do not affect onboarding completion.
 * 
 * This store does NOT persist step state (wizard UIs should start clean).
 * 
 * ⚠️ TO ADD MORE STEPS:
 * 1. Update REQUIRED_STEPS and TOTAL_STEPS constants below
 * 2. Navigation logic already supports multiple steps
 * 3. Add new mutation in mutations.js (copy useBasicInformationMutation pattern)
 * 4. Add backend endpoint (copy saveBasicInformationStep pattern)
 * 5. Update backend model progressStep max value
 * 
 * See ADDING_ONBOARDING_STEPS_GUIDE.md for detailed instructions.
 * 
 * @module stores/clientStores/clientOnboardingStore
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Step configuration - EASILY EXPANDABLE
// ⚠️ TO ADD MORE STEPS: Update these constants and navigation logic below
const REQUIRED_STEPS = 1 // Number of required steps (currently: step 1 only)
const TOTAL_STEPS = 1 // Total number of steps (currently: 1 step)
// Example for 3 steps: const REQUIRED_STEPS = 2, const TOTAL_STEPS = 3

/**
 * Initial state for onboarding wizard
 * Note: currentStep is NOT persisted (wizard should start fresh)
 */
const initialState = {
	// Step management (ephemeral - not persisted)
	currentStep: 1, // Start at step 1
	completedSteps: [], // Array of completed step numbers (e.g., [1, 2, 3])
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
			 * @param {number} step - Step number (1 to TOTAL_STEPS)
			 * 
			 * ⚠️ TO ADD MORE STEPS: This already supports multiple steps!
			 * Just update TOTAL_STEPS constant above.
			 */
			setStep: (step) => {
				// Allow steps 1 through TOTAL_STEPS
				if (step >= 1 && step <= TOTAL_STEPS) {
					set({ currentStep: step })
					window.scrollTo(0, 0)
				}
			},

			/**
			 * Move to next step
			 * 
			 * ⚠️ TO ADD MORE STEPS: This already supports multiple steps!
			 * Just update TOTAL_STEPS constant above.
			 */
			nextStep: () => {
				const currentStep = get().currentStep
				if (currentStep < TOTAL_STEPS) {
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
			 * Finds the first incomplete step (required first, then optional)
			 * 
			 * ⚠️ TO ADD MORE STEPS: This already supports multiple steps!
			 * Just update REQUIRED_STEPS and TOTAL_STEPS constants above.
			 * 
			 * @param {Object} onboarding - Optional onboarding data
			 * @returns {number} Next available step number
			 */
			getNextAvailableStep: (onboarding) => {
				const completedSteps = get().completedSteps
				
				// Find first incomplete required step (1 to REQUIRED_STEPS)
				for (let step = 1; step <= REQUIRED_STEPS; step++) {
					if (!completedSteps.includes(step)) {
						return step
					}
				}
				
				// All required steps complete, check optional steps (REQUIRED_STEPS + 1 to TOTAL_STEPS)
				for (let step = REQUIRED_STEPS + 1; step <= TOTAL_STEPS; step++) {
					if (!completedSteps.includes(step)) {
						return step
					}
				}
				
				// All steps complete, return last step
				return TOTAL_STEPS
			},
		}),
		{
			name: 'client-onboarding-store',
		}
	)
)

