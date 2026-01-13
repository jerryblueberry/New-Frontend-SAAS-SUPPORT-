/**
 * useArrayInput Hook
 * Handles array input management (add/remove items)
 */

import { useCallback } from 'react'

/**
 * Custom hook for managing array inputs
 */
export const useArrayInput = (watch, setValue) => {
  const handleAddArrayItem = useCallback(
    (fieldPath, inputValue, setInput) => {
      if (inputValue.trim()) {
        const current = watch(fieldPath) || []
        if (!current.includes(inputValue.trim())) {
          setValue(fieldPath, [...current, inputValue.trim()], { shouldValidate: true })
          setInput('')
        }
      }
    },
    [watch, setValue]
  )

  const handleRemoveArrayItem = useCallback(
    (fieldPath, item) => {
      const current = watch(fieldPath) || []
      setValue(fieldPath, current.filter((i) => i !== item), { shouldValidate: true })
    },
    [watch, setValue]
  )

  return {
    handleAddArrayItem,
    handleRemoveArrayItem,
  }
}
