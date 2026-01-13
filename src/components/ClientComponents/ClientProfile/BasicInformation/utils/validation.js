/**
 * BasicInformation Validation Schemas
 * Zod validation schemas for form validation
 */

import { z } from 'zod'
import { isValidAuPhone } from '../../../../../utils/phone'

export const australianPhoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true
      return isValidAuPhone(val)
    },
    {
      message: 'Enter a valid Australian number: +61 followed by 9 digits',
    }
  )

export const clientProfileSchema = z.object({
  accountType: z.enum(['individual', 'organization']),
  organizationName: z.string().optional(),
  abn: z.string().optional(),
  ndisNumber: z.string().optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    suburb: z.string().min(1, 'Suburb is required'),
    state: z.string().min(1, 'State is required').max(50, 'State name is too long'),
    postcode: z.string().min(1, 'Postcode is required').refine(
      (val) => /^\d{4,5}$/.test(val.trim()),
      { message: 'Postcode must be 4-5 digits' }
    ),
    coordinates: z.array(z.number()).length(2).optional(),
  }),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: australianPhoneSchema,
  }),
}).superRefine((data, ctx) => {
  if (data.accountType === 'organization') {
    if (!data.organizationName || data.organizationName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Organization name is required',
        path: ['organizationName'],
      })
    }
    if (!data.abn || data.abn.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ABN is required for organizations',
        path: ['abn'],
      })
    }
  }
})
