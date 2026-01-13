/**
 * useCarePreferences Hook
 * Main hook for Care Preferences form logic
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePreferences, useClientProfile } from '../../../../../stores/useClientProfileStore'
import { toast } from 'react-hot-toast'
import { formatApiError } from '../../../../../utils/errorFormatter'
import { preferencesSchema } from '../utils/validation'
import { getDefaultFormValues, buildPreferencesPayload } from '../utils/formHelpers'
import { useArrayInput } from './useArrayInput'
import { useAvailability } from './useAvailability'

/**
 * Custom hook for Care Preferences form
 */
export const useCarePreferences = () => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [serviceRegionInput, setServiceRegionInput] = useState('')
  const [accessibilityInput, setAccessibilityInput] = useState('')
  const [observanceInput, setObservanceInput] = useState('')
  const [habitInput, setHabitInput] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [valueInput, setValueInput] = useState('')

  // TanStack Query hooks
  const { data: preferences, isLoading, isError, error, update, isUpdating } = usePreferences()
  const { data: profile } = useClientProfile()
  
  // Check account type
  const accountType = profile?.accountType || 'individual'
  const isOrganization = accountType === 'organization'

  // Form setup
  const defaultValues = useMemo(
    () => getDefaultFormValues(preferences),
    [preferences]
  )

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
    setValue,
  } = useForm({
    defaultValues,
    resolver: zodResolver(preferencesSchema),
    mode: 'onBlur',
  })

  // Watched values
  const watchedSupportCategories = watch('supportCategories')
  const watchedServiceRegions = watch('serviceRegions')
  const watchedAvailability = watch('availability')
  const watchedDietaryRestrictions = watch('culturalPreferences.dietaryRequirements.restrictions')
  const watchedObservances = watch('culturalPreferences.religiousConsiderations.observances')
  const watchedHabits = watch('culturalPreferences.lifestyleNotes.habits')
  const watchedInterests = watch('culturalPreferences.lifestyleNotes.interests')
  const watchedValues = watch('culturalPreferences.lifestyleNotes.values')

  // Array input hooks
  const { handleAddArrayItem, handleRemoveArrayItem } = useArrayInput(watch, setValue)
  const { handleToggleAvailability } = useAvailability(watchedAvailability, setValue)

  // Reset form when data changes
  useEffect(() => {
    if (preferences && !isEditMode) {
      reset(defaultValues)
    }
  }, [preferences, isEditMode, defaultValues, reset])

  // Service region handlers
  const handleAddServiceRegion = useCallback(() => {
    handleAddArrayItem('serviceRegions', serviceRegionInput, setServiceRegionInput)
  }, [serviceRegionInput, handleAddArrayItem])

  const handleRemoveServiceRegion = useCallback(
    (region) => {
      handleRemoveArrayItem('serviceRegions', region)
    },
    [handleRemoveArrayItem]
  )

  // Form submission
  const onSubmit = useCallback(
    (values) => {
      const payload = buildPreferencesPayload(values)
      update(payload, {
        onSuccess: () => {
          setIsEditMode(false)
          toast.success('Preferences updated successfully')
        },
        onError: (error) => {
          const message = formatApiError(error)
          toast.error(message)
        },
      })
    },
    [update]
  )

  // Toggle edit mode
  const handleEditClick = useCallback(() => {
    setIsEditMode(true)
    reset(defaultValues)
  }, [reset, defaultValues])

  const handleCancelClick = useCallback(() => {
    setIsEditMode(false)
    reset(defaultValues)
  }, [reset, defaultValues])

  // Check if error is "not found"
  const isNotFoundError = isError && error && (
    error?.response?.status === 404 ||
    error?.response?.data?.code === 'NO_PROFILE' ||
    (typeof (error?.response?.data?.message || error?.message || '') === 'string' && (
      (error?.response?.data?.message || error?.message || '').toLowerCase().includes('not found') ||
      (error?.response?.data?.message || error?.message || '').toLowerCase().includes('no profile')
    ))
  )

  return {
    // Data
    preferences,
    accountType,
    isOrganization,
    
    // Form
    register,
    handleSubmit,
    watch,
    control,
    errors,
    isDirty,
    setValue,
    
    // State
    isEditMode,
    setIsEditMode,
    
    // Input states
    serviceRegionInput,
    setServiceRegionInput,
    accessibilityInput,
    setAccessibilityInput,
    observanceInput,
    setObservanceInput,
    habitInput,
    setHabitInput,
    interestInput,
    setInterestInput,
    valueInput,
    setValueInput,
    
    // Watched values
    watchedSupportCategories,
    watchedServiceRegions,
    watchedAvailability,
    watchedDietaryRestrictions,
    watchedObservances,
    watchedHabits,
    watchedInterests,
    watchedValues,
    
    // Actions
    handleEditClick,
    handleCancelClick,
    handleAddServiceRegion,
    handleRemoveServiceRegion,
    handleAddArrayItem,
    handleRemoveArrayItem,
    handleToggleAvailability,
    onSubmit,
    
    // Loading/Error
    isLoading,
    isError,
    error,
    isNotFoundError,
    isUpdating,
  }
}
