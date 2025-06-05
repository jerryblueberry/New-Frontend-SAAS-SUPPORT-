export const ROLES = {
  WORKER: 'worker',
  EMPLOYER: 'employer',
  ADMIN: 'admin'
};

export const ONBOARDING_STEPS = {
  PROFILE: 'profile',
  AVAILABILITY: 'availability',
  CERTIFICATIONS: 'certifications',
  WORK_HISTORY: 'work-history',
  
  COMPLETE: 'complete'
};

// 🆕 Add this array for use in AvailabilityForm and TimeSlotModal
export const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const standardTimeSlots = [
  { id: 'morning', label: 'Morning (6am-12pm)' },
  { id: 'afternoon', label: 'Afternoon (12pm-5pm)' },
  { id: 'evening', label: 'Evening (5pm-10pm)' },
  { id: 'night', label: 'Night (10pm-6am)' }
];
