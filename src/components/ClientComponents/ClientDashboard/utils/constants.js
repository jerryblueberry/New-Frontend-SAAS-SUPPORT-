/**
 * Client Dashboard Constants
 * Centralized constants for the client dashboard
 */

// Status configuration mapping
export const STATUS_CONFIGS = {
  draft: {
    label: 'Draft',
    color: 'default',
    message: 'Your profile is saved as draft. Complete all steps to submit for review.',
    bgColor: 'grey.50',
    textColor: 'text.secondary',
    severity: 'info'
  },
  submitted: {
    label: 'Under Verification',
    color: 'warning',
    message: 'Your profile has been submitted and is awaiting admin verification. We will notify you once verified.',
    bgColor: 'warning.50',
    textColor: 'warning.dark',
    severity: 'warning'
  },
  verified: {
    label: 'Verified',
    color: 'success',
    message: 'Your profile has been verified by admin. You can now access all features.',
    bgColor: 'success.50',
    textColor: 'success.dark',
    severity: 'success'
  },
  active: {
    label: 'Active',
    color: 'success',
    message: 'Your profile is active and ready for service matching.',
    bgColor: 'success.50',
    textColor: 'success.dark',
    severity: 'success'
  }
}

// Quick action buttons configuration
export const QUICK_ACTIONS = [
  {
    label: 'Find Support Worker',
    icon: 'Person',
    path: '/client/find-worker',
    variant: 'outlined'
  },
  {
    label: 'Schedule Session',
    icon: 'CalendarToday',
    path: '/client/schedule',
    variant: 'outlined'
  },
  {
    label: 'View Documents',
    icon: 'Description',
    path: '/client/profile/documents',
    variant: 'outlined'
  },
  {
    label: 'Update Preferences',
    icon: 'Shield',
    path: '/client/profile/preferences',
    variant: 'outlined'
  }
]

// Task status types
export const TASK_STATUS = {
  URGENT: 'urgent',
  PENDING: 'pending',
  COMPLETED: 'completed'
}

// Task types
export const TASK_TYPES = {
  DOCUMENT: 'document',
  VERIFICATION: 'verification',
  PREFERENCES: 'preferences',
  NONE: 'none'
}
