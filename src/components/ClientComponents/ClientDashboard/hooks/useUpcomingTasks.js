/**
 * useUpcomingTasks Hook
 * Generates upcoming tasks based on profile data
 * Checks for incomplete fields including care preferences, emergency contact, and more
 */

import { useMemo } from 'react'
import { TASK_STATUS, TASK_TYPES } from '../utils/constants'
import { getDaysUntilExpiry, formatExpiryMessage } from '../utils'

/**
 * Check if basic information is complete
 */
const isBasicInformationComplete = (profile) => {
  if (!profile) return false
  
  const hasAccountType = Boolean(profile.accountType)
  
  // For organizations, check org fields
  const hasOrgFieldsIfOrg = profile.accountType === 'organization'
    ? Boolean(profile.organizationName?.trim() && profile.abn)
    : true
  
  // Check address
  const hasAddress = Boolean(
    profile.address?.street &&
    profile.address?.suburb &&
    profile.address?.state &&
    profile.address?.postcode
  )
  
  return hasAccountType && hasOrgFieldsIfOrg && hasAddress
}

/**
 * Check if emergency contact is complete
 */
const isEmergencyContactComplete = (profile) => {
  if (!profile) return false
  return Boolean(
    profile.emergencyContact?.name &&
    profile.emergencyContact?.phone
  )
}

/**
 * Check if care preferences are complete
 */
const isCarePreferencesComplete = (profile) => {
  if (!profile || profile.accountType !== 'individual') return true // Only for individuals
  const preferences = profile.preferences || {}
  return Boolean(
    preferences.supportCategories &&
    Array.isArray(preferences.supportCategories) &&
    preferences.supportCategories.length > 0
  )
}

/**
 * Check if billing preferences are set up
 */
const isBillingPreferencesComplete = (profile) => {
  if (!profile) return false
  const billing = profile.billingPreferences || {}
  return Boolean(
    billing.fundingType ||
    billing.paymentMethod
  )
}

/**
 * Check if communication preferences are set up
 */
const isCommunicationPreferencesComplete = (profile) => {
  if (!profile) return false
  const comm = profile.contactPreferences || {}
  return Boolean(comm.preferredMethod)
}

/**
 * Custom hook for upcoming tasks
 * @param {Object} profile - Profile data
 * @returns {Array} Array of task objects
 */
export const useUpcomingTasks = (profile) => {
  return useMemo(() => {
    const tasks = []
    if (!profile) return tasks
    
    const documents = profile.documents || []
    const preferences = profile.preferences || {}
    const accountType = profile.accountType || 'individual'
    
    // Check for incomplete basic information
    if (!isBasicInformationComplete(profile)) {
      tasks.push({
        title: 'Complete Basic Information',
        status: TASK_STATUS.URGENT,
        time: 'Required for profile verification',
        type: 'basic_info',
        actionPath: '/client/profile'
      })
    }
    
    // Check for missing emergency contact
    if (!isEmergencyContactComplete(profile)) {
      tasks.push({
        title: 'Add Emergency Contact',
        status: TASK_STATUS.PENDING,
        time: 'Important for safety and support',
        type: 'emergency_contact',
        actionPath: '/client/profile'
      })
    }
    
    // Check for expiring documents
    documents.forEach(doc => {
      if (doc.expiresAt) {
        const daysUntilExpiry = getDaysUntilExpiry(doc.expiresAt)
        if (daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          tasks.push({
            title: `Renew ${doc.title || doc.type} Document`,
            status: daysUntilExpiry <= 7 ? TASK_STATUS.URGENT : TASK_STATUS.PENDING,
            time: formatExpiryMessage(daysUntilExpiry),
            type: TASK_TYPES.DOCUMENT,
            documentId: doc._id,
            actionPath: '/client/documents'
          })
        }
      }
    })
    
    // Check for unverified documents
    const unverifiedDocs = documents.filter(doc => !doc.verified)
    if (unverifiedDocs.length > 0) {
      tasks.push({
        title: `${unverifiedDocs.length} Document${unverifiedDocs.length > 1 ? 's' : ''} Pending Verification`,
        status: TASK_STATUS.PENDING,
        time: 'Awaiting admin review',
        type: TASK_TYPES.VERIFICATION,
        actionPath: '/client/documents/pending'
      })
    }
    
    // Check care preferences (only for individual accounts)
    if (!isCarePreferencesComplete(profile)) {
      tasks.push({
        title: 'Complete Care Preferences',
        status: TASK_STATUS.PENDING,
        time: 'Optional: Helps prefill job postings',
        type: TASK_TYPES.PREFERENCES,
        actionPath: '/client/profile/preferences'
      })
    }
    
    // Check billing preferences (optional but recommended)
    if (!isBillingPreferencesComplete(profile)) {
      tasks.push({
        title: 'Set Up Billing Preferences',
        status: TASK_STATUS.PENDING,
        time: 'Optional: Streamline payment processing',
        type: 'billing',
        actionPath: '/client/billing/preferences'
      })
    }
    
    // Check communication preferences (optional)
    if (!isCommunicationPreferencesComplete(profile)) {
      tasks.push({
        title: 'Configure Communication Preferences',
        status: TASK_STATUS.PENDING,
        time: 'Optional: Choose how you want to be contacted',
        type: 'communication',
        actionPath: '/client/profile/communication'
      })
    }
    
    // Default tasks if none generated
    if (tasks.length === 0) {
      tasks.push({
        title: 'All tasks completed!',
        status: TASK_STATUS.COMPLETED,
        time: 'Great job keeping everything up to date',
        type: TASK_TYPES.NONE
      })
    }
    
    // Sort tasks: urgent first, then pending, then completed
    tasks.sort((a, b) => {
      if (a.status === TASK_STATUS.URGENT && b.status !== TASK_STATUS.URGENT) return -1
      if (a.status !== TASK_STATUS.URGENT && b.status === TASK_STATUS.URGENT) return 1
      if (a.status === TASK_STATUS.PENDING && b.status === TASK_STATUS.COMPLETED) return -1
      if (a.status === TASK_STATUS.COMPLETED && b.status === TASK_STATUS.PENDING) return 1
      return 0
    })
    
    return tasks.slice(0, 8) // Limit to 8 tasks to show more comprehensive list
  }, [profile])
}
