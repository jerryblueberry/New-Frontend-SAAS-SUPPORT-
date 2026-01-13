/**
 * Client Dashboard Utility Functions
 * Pure utility functions for dashboard logic
 */

import { STATUS_CONFIGS } from './constants'
import React from 'react'
import {
  Description,
  HourglassEmpty,
  Verified,
  CheckCircle
} from '@mui/icons-material'

/**
 * Get status configuration with icon
 * @param {string} status - Profile status
 * @returns {Object} Status configuration object
 */
export const getStatusConfig = (status) => {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.draft
  
  // Map icons to status
  const iconMap = {
    draft: React.createElement(Description),
    submitted: React.createElement(HourglassEmpty),
    verified: React.createElement(Verified),
    active: React.createElement(CheckCircle)
  }
  
  return {
    ...config,
    icon: iconMap[status] || iconMap.draft
  }
}

/**
 * Calculate document statistics
 * @param {Array} documents - Array of document objects
 * @returns {Object} Document statistics
 */
export const calculateDocumentStats = (documents = []) => {
  const totalDocuments = documents.length
  const verifiedDocuments = documents.filter(doc => doc.verified).length
  const pendingDocuments = documents.filter(doc => !doc.verified).length
  
  const expiringSoon = documents.filter(doc => {
    if (!doc.expiresAt) return false
    const daysUntilExpiry = Math.ceil(
      (new Date(doc.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
    )
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }).length
  
  return {
    totalDocuments,
    verifiedDocuments,
    pendingDocuments,
    expiringSoon
  }
}

/**
 * Check if profile is complete
 * @param {Object} profile - Profile object
 * @returns {boolean} True if profile is complete
 */
export const isProfileComplete = (profile) => {
  return profile?.profileCompleteness?.completedSteps?.basicInformation === true
}

/**
 * Check if profile is under verification
 * @param {string} status - Profile status
 * @returns {boolean} True if under verification
 */
export const isUnderVerification = (status) => {
  return status === 'submitted'
}

/**
 * Check if profile is verified
 * @param {string} status - Profile status
 * @returns {boolean} True if verified
 */
export const isVerified = (status) => {
  return status === 'verified' || status === 'active'
}

/**
 * Calculate days until expiry
 * @param {string|Date} expiresAt - Expiry date
 * @returns {number} Days until expiry
 */
export const getDaysUntilExpiry = (expiresAt) => {
  if (!expiresAt) return null
  return Math.ceil(
    (new Date(expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
  )
}

/**
 * Format expiry message
 * @param {number} days - Days until expiry
 * @returns {string} Formatted message
 */
export const formatExpiryMessage = (days) => {
  if (days === 1) return 'Due tomorrow'
  if (days <= 0) return 'Expired'
  return `Due in ${days} days`
}
