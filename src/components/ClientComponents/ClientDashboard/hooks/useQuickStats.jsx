/**
 * useQuickStats Hook
 * Calculates and returns quick statistics for the dashboard
 */

import React, { useMemo } from 'react'
import { Schedule, CalendarToday, Description } from '@mui/icons-material'
import { calculateDocumentStats } from '../utils'

/**
 * Custom hook for quick stats calculation
 * @param {Object} profile - Profile data
 * @returns {Array} Array of stat objects
 */
export const useQuickStats = (profile) => {
  return useMemo(() => {
    const engagement = profile?.engagementMetrics || {}
    const documents = profile?.documents || []
    
    const docStats = calculateDocumentStats(documents)
    
    const stats = [
      { 
        icon: <Schedule sx={{ fontSize: 40 }} />, 
        value: engagement.jobsActive?.toString() || '0', 
        label: 'Active Jobs', 
        color: '#3f51b5',
        tooltip: 'Number of active job postings'
      },
      { 
        icon: <CalendarToday sx={{ fontSize: 40 }} />, 
        value: engagement.totalLogins?.toString() || '0', 
        label: 'Total Logins', 
        color: '#9c27b0',
        tooltip: 'Total number of times you\'ve logged in'
      },
      { 
        icon: <Description sx={{ fontSize: 40 }} />, 
        value: `${docStats.verifiedDocuments}/${docStats.totalDocuments}`, 
        label: 'Documents', 
        color: docStats.totalDocuments > 0 && docStats.pendingDocuments > 0 ? '#ff9800' : '#00bcd4',
        tooltip: `${docStats.verifiedDocuments} verified, ${docStats.pendingDocuments} pending${docStats.expiringSoon > 0 ? `, ${docStats.expiringSoon} expiring soon` : ''}`
      }
    ]
    
    return stats
  }, [profile])
}
