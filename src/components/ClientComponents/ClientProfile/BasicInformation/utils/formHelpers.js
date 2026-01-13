/**
 * BasicInformation Form Helpers
 * Pure utility functions for form handling
 */

import { formatAuInternational } from '../../../../../utils/phone'

/**
 * Format Australian phone number for display
 */
export const formatAustralianPhone = (value) => formatAuInternational(value || '')

/**
 * Get default form values from profile data
 */
export const getDefaultFormValues = (basicInfo) => ({
  accountType: basicInfo?.accountType || 'individual',
  organizationName: basicInfo?.organizationName || '',
  abn: basicInfo?.abn || '',
  ndisNumber: basicInfo?.ndisNumber || '',
  address: {
    street: basicInfo?.address?.street || '',
    suburb: basicInfo?.address?.suburb || '',
    state: basicInfo?.address?.state || '',
    postcode: basicInfo?.address?.postcode || '',
  },
  emergencyContact: {
    name: basicInfo?.emergencyContact?.name || '',
    phone: basicInfo?.emergencyContact?.phone || '',
  },
})
