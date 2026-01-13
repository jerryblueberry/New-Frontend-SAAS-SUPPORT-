/**
 * useAvailability Hook
 * Handles availability day/time slot management
 */

import { useCallback } from 'react'

/**
 * Custom hook for managing availability
 */
export const useAvailability = (watchedAvailability, setValue) => {
  const handleToggleAvailability = useCallback(
    (day, timeSlot) => {
      const current = watchedAvailability || []
      const dayIndex = current.findIndex((a) => a.day === day)
      
      if (dayIndex === -1) {
        // Add new day with time slot
        setValue('availability', [...current, { day, timeSlots: [timeSlot] }], { shouldValidate: true })
      } else {
        const dayData = current[dayIndex]
        const hasTimeSlot = dayData.timeSlots.includes(timeSlot)
        
        if (hasTimeSlot) {
          // Remove time slot
          const newTimeSlots = dayData.timeSlots.filter((ts) => ts !== timeSlot)
          if (newTimeSlots.length === 0) {
            // Remove day if no time slots left
            setValue('availability', current.filter((a) => a.day !== day), { shouldValidate: true })
          } else {
            // Update day with remaining time slots
            const updated = [...current]
            updated[dayIndex] = { ...dayData, timeSlots: newTimeSlots }
            setValue('availability', updated, { shouldValidate: true })
          }
        } else {
          // Add time slot to existing day
          const updated = [...current]
          updated[dayIndex] = { ...dayData, timeSlots: [...dayData.timeSlots, timeSlot] }
          setValue('availability', updated, { shouldValidate: true })
        }
      }
    },
    [watchedAvailability, setValue]
  )

  return {
    handleToggleAvailability,
  }
}
