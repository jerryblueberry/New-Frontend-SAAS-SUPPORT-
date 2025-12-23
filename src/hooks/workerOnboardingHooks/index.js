/**
 * Worker Onboarding Hooks - Index
 * 
 * Central export point for all worker onboarding TanStack Query hooks.
 * This split structure separates API logic from state management.
 * 
 * Architecture:
 * - Each onboarding step has its own dedicated hooks file
 * - Hooks handle API calls, mutations, and query management
 * - Error handling and toast notifications are built-in
 * 
 * Usage:
 * ```jsx
 * import { useProfileMutation } from '@/hooks/workerOnboardingHooks';
 * 
 * // In component
 * const { mutate: saveProfile, isPending, error } = useProfileMutation();
 * 
 * // Submit
 * saveProfile(profileData);
 * ```
 * 
 * Benefits:
 * - Separation of concerns (API logic vs state)
 * - Consistent error handling
 * - Built-in loading states
 * - Automatic cache invalidation
 * - Optimistic updates support
 */

export {
  useProfileMutation,
  useOnboardingProgressQuery,
  profileApi,
} from './useProfileHooks';

// Future hooks can be added here:
// export { useAvailabilityMutation, useAvailabilityQuery } from './useAvailabilityHooks';
// export { useCertificationsMutation, useCertificationsQuery } from './useCertificationsHooks';
// export { useHealthInfoMutation, useHealthInfoQuery } from './useHealthInfoHooks';
// export { useWorkHistoryMutation, useWorkHistoryQuery } from './useWorkHistoryHooks';

