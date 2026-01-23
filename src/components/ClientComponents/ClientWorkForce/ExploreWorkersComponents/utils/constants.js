/**
 * Constants
 * 
 * Configuration constants for the Explore Workers feature.
 */

/**
 * Common skills available for filtering
 */
export const AVAILABLE_SKILLS = [
  'Personal Care',
  'Meal Preparation',
  'Transportation',
  'Disability Support',
  'Companionship',
  'Medication Management',
  'Domestic Assistance',
  'Social Support'
];

/**
 * Sort options configuration
 */
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best Match', icon: 'TrendingUp' },
  { value: 'rating', label: 'Highest Rated', icon: 'Star' },
  { value: 'rate', label: 'Hourly Rate', icon: 'AttachMoney' },
  { value: 'newest', label: 'Newest First', icon: 'Schedule' }
];

/**
 * Filter default values
 */
export const FILTER_DEFAULTS = {
  minRating: 0,
  maxRating: 5,
  minHourlyRate: 20,
  maxHourlyRate: 100,
  ratingStep: 0.5,
  hourlyRateStep: 5
};

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  limit: 12,
  initialPage: 1
};

/**
 * Skeleton loading defaults
 */
export const SKELETON_COUNT = 6;
