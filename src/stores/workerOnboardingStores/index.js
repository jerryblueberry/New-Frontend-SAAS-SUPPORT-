/**
 * Worker Onboarding Stores - Index
 * 
 * Central export point for all worker onboarding stores.
 * This split structure improves code organization, maintainability, and performance.
 * 
 * Architecture:
 * - Each onboarding step has its own dedicated store
 * - Stores are persisted to localStorage independently
 * - Selectors are provided for optimized re-renders
 * 
 * Usage:
 * ```jsx
 * import { useWorkerProfileStore, profileSelectors } from '@/stores/workerOnboardingStores';
 * 
 * // In component
 * const profile = useWorkerProfileStore(profileSelectors.profile);
 * const updateProfile = useWorkerProfileStore(state => state.updateProfile);
 * ```
 * 
 * Benefits:
 * - Better code splitting and tree-shaking
 * - Easier to test individual stores
 * - Reduced bundle size (only load what you need)
 * - Clear separation of concerns
 */

export { useWorkerProfileStore, profileSelectors } from './profileStore';

// Future stores can be added here:
// export { useWorkerAvailabilityStore, availabilitySelectors } from './availabilityStore';
// export { useWorkerCertificationsStore, certificationsSelectors } from './certificationsStore';
// export { useWorkerHealthInfoStore, healthInfoSelectors } from './healthInfoStore';
// export { useWorkerWorkHistoryStore, workHistorySelectors } from './workHistoryStore';

