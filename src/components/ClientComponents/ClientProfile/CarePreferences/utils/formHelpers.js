/**
 * CarePreferences Form Helpers
 * Pure utility functions for form handling
 */

import { format } from 'date-fns'

/**
 * Get default form values from preferences data
 */
export const getDefaultFormValues = (preferences) => ({
  supportCategories: preferences?.supportCategories || [],
  serviceRegions: preferences?.serviceRegions || [],
  workerPreferences: {
    preferredGender: preferences?.workerPreferences?.preferredGender || 'any',
    preferredAgeGroup: preferences?.workerPreferences?.preferredAgeGroup || 'any',
    preferredExperienceAreas: preferences?.workerPreferences?.preferredExperienceAreas || [],
    notes: preferences?.workerPreferences?.notes || '',
  },
  culturalPreferences: {
    dietaryRequirements: {
      restrictions: preferences?.culturalPreferences?.dietaryRequirements?.restrictions || [],
      allergyDetails: preferences?.culturalPreferences?.dietaryRequirements?.allergyDetails || '',
      notes: preferences?.culturalPreferences?.dietaryRequirements?.notes || '',
    },
    religiousConsiderations: {
      faith: preferences?.culturalPreferences?.religiousConsiderations?.faith || '',
      observances: preferences?.culturalPreferences?.religiousConsiderations?.observances || [],
      genderSensitivity: preferences?.culturalPreferences?.religiousConsiderations?.genderSensitivity || false,
      notes: preferences?.culturalPreferences?.religiousConsiderations?.notes || '',
    },
    lifestyleNotes: {
      habits: preferences?.culturalPreferences?.lifestyleNotes?.habits || [],
      interests: preferences?.culturalPreferences?.lifestyleNotes?.interests || [],
      values: preferences?.culturalPreferences?.lifestyleNotes?.values || [],
      notes: preferences?.culturalPreferences?.lifestyleNotes?.notes || '',
    },
  },
  availability: preferences?.availability || [],
  serviceDelivery: {
    inPerson: preferences?.serviceDelivery?.inPerson ?? true,
    remote: preferences?.serviceDelivery?.remote ?? false,
    preferredStartDate: preferences?.serviceDelivery?.preferredStartDate 
      ? format(new Date(preferences.serviceDelivery.preferredStartDate), 'yyyy-MM-dd')
      : '',
    sessionDurationMins: preferences?.serviceDelivery?.sessionDurationMins || 60,
  },
  specialRequirements: preferences?.specialRequirements || '',
})

/**
 * Build payload for API submission
 */
export const buildPreferencesPayload = (values) => ({
  ...values,
  serviceDelivery: {
    ...values.serviceDelivery,
    preferredStartDate: values.serviceDelivery?.preferredStartDate
      ? new Date(values.serviceDelivery.preferredStartDate).toISOString()
      : undefined,
  },
})
