/**
 * OverviewComponents Index
 * 
 * Central export point for all overview dashboard components.
 * Follows the same pattern as OnboardingPrompt for consistency.
 */

export { default as StatCard } from './StatCard';
export { default as ChipBadge } from './ChipBadge';
export { default as ProfileCompletenessCard } from './ProfileCompletenessCard';
export { default as VerificationStatusCard } from './VerificationStatusCard';
export { default as RecentReferencesCard } from './RecentReferencesCard';

// Export utilities for advanced use cases
export * from './utils/constants';
export * from './utils/helpers';

