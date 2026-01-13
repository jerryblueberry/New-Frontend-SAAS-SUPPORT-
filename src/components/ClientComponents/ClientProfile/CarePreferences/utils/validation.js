/**
 * CarePreferences Validation Schemas
 * Zod validation schemas for preferences form
 */

import { z } from 'zod'
import {
  SUPPORT_CATEGORIES,
  PREFERRED_WORKER_GENDER,
  PREFERRED_AGE_GROUP,
  DAYS,
  TIME_SLOTS,
  DIETARY_RESTRICTIONS,
} from '../../../../../constants/clientOnboardingConstants'

export const preferencesSchema = z.object({
  supportCategories: z.array(z.enum(SUPPORT_CATEGORIES)).min(1, 'At least one support category is required'),
  serviceRegions: z.array(z.string().min(1)).min(1, 'At least one service region is required'),
  workerPreferences: z.object({
    preferredGender: z.enum(PREFERRED_WORKER_GENDER).optional(),
    preferredAgeGroup: z.enum(PREFERRED_AGE_GROUP).optional(),
    preferredExperienceAreas: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }).optional(),
  culturalPreferences: z.object({
    dietaryRequirements: z.object({
      restrictions: z.array(z.enum(DIETARY_RESTRICTIONS)).optional(),
      allergyDetails: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    religiousConsiderations: z.object({
      faith: z.string().optional(),
      observances: z.array(z.string()).optional(),
      genderSensitivity: z.boolean().optional(),
      notes: z.string().optional(),
    }).optional(),
    lifestyleNotes: z.object({
      habits: z.array(z.string()).optional(),
      interests: z.array(z.string()).optional(),
      values: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }).optional(),
  }).optional(),
  availability: z.array(z.object({
    day: z.enum(DAYS),
    timeSlots: z.array(z.enum(TIME_SLOTS)),
  })).optional(),
  serviceDelivery: z.object({
    inPerson: z.boolean().optional(),
    remote: z.boolean().optional(),
    preferredStartDate: z.string().optional(),
    sessionDurationMins: z.number().int().positive().optional(),
  }).optional(),
  specialRequirements: z.string().optional(),
})
