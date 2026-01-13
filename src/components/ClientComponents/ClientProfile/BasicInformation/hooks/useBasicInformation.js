/**
 * useBasicInformation Hook
 * Main hook for Basic Information form logic
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useBasicInfo, useClientProfile } from '../../../../../stores/useClientProfileStore'
import { canEditRestrictedFields as canEditRestrictedFieldsHelper, buildBasicInfoPayload } from '../../../../../stores/clientStores/helpers'
import { toast } from 'react-hot-toast'
import { formatApiError } from '../../../../../utils/errorFormatter'
import { clientProfileSchema } from '../utils/validation'
import { getDefaultFormValues } from '../utils/formHelpers'
import { useGeolocation } from './useGeolocation'

/**
 * Custom hook for Basic Information form
 */
export const useBasicInformation = () => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [addressMethod, setAddressMethod] = useState('manual')

  // TanStack Query hooks
  const { data: basicInfo, isLoading, isError, error, update, isUpdating } = useBasicInfo()
  const { data: fullProfile } = useClientProfile()
  
  // Domain rules
  const profileStatus = fullProfile?.status || 'draft'
  const canEditRestrictedFields = canEditRestrictedFieldsHelper(profileStatus)

  // Initialize address method from data
  useEffect(() => {
    if (basicInfo?.address?.coordinates) {
      setAddressMethod('geolocation')
    }
  }, [basicInfo])

  // Form setup
  const defaultValues = useMemo(
    () => getDefaultFormValues(basicInfo),
    [basicInfo]
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
    resolver: zodResolver(clientProfileSchema),
    mode: 'onBlur',
  })

  const accountType = watch('accountType')

  // Geolocation hook
  const { location, setLocation, handleGetCurrentLocation } = useGeolocation(setValue)

  // Initialize location from data
  useEffect(() => {
    if (basicInfo?.address?.coordinates) {
      setLocation({
        coordinates: basicInfo.address.coordinates,
        isLocating: false,
        addressInfo: null,
      })
    }
  }, [basicInfo, setLocation])

  // Reset form when data changes or edit mode toggles
  useEffect(() => {
    if (basicInfo && !isEditMode) {
      reset(defaultValues)
    }
  }, [basicInfo, isEditMode, defaultValues, reset])

  // Form submission
  const onSubmit = useCallback(
    (values) => {
      const payload = buildBasicInfoPayload(values, profileStatus, location, addressMethod)

      update(payload, {
        onSuccess: () => {
          setIsEditMode(false)
          toast.success('Basic information updated successfully')
        },
        onError: (error) => {
          if (error?.response?.data?.code === 'RESTRICTED_EDIT') {
            const errorData = error.response.data
            let errorMessage = errorData.message || 
              'Account type, organization name, and ABN cannot be changed after verification. You can still update NDIS number, address, and emergency contact at any time.'
            
            if (errorData.suggestion) {
              errorMessage += ` ${errorData.suggestion}`
            }
            
            toast.error(errorMessage, { 
              duration: 8000,
              style: {
                maxWidth: '600px',
                whiteSpace: 'pre-line',
              }
            })
          } else {
            const message = formatApiError(error)
            toast.error(message)
          }
        },
      })
    },
    [update, location, addressMethod, profileStatus]
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
    basicInfo,
    fullProfile,
    profileStatus,
    canEditRestrictedFields,
    accountType,
    
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
    addressMethod,
    setAddressMethod,
    location,
    setLocation,
    
    // Actions
    handleEditClick,
    handleCancelClick,
    handleGetCurrentLocation,
    onSubmit,
    
    // Loading/Error
    isLoading,
    isError,
    error,
    isNotFoundError,
    isUpdating,
  }
}
