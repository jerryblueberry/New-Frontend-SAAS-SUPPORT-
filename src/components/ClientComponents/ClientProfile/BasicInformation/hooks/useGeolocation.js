/**
 * useGeolocation Hook
 * Handles geolocation functionality for address detection
 */

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { formatAuInternational } from '../../../../../utils/phone'

/**
 * Fetch address from coordinates using OpenStreetMap Nominatim API
 */
const fetchAddressFromCoordinates = async (latitude, longitude, setValue) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      { headers: { 'User-Agent': 'AecusCare/1.0' } }
    )
    if (!response.ok) throw new Error('Failed to fetch address')
    const data = await response.json()
    if (!data || !data.address) throw new Error('No address data found')

    const addressData = data.address
    const street = data.display_name?.split(',')[0]?.trim() || addressData.road || addressData.street || ''
    const suburb = addressData.city_district || addressData.town || addressData.municipality || addressData.suburb || ''
    const state = addressData.state || addressData.county || addressData.region || ''
    const postcode = addressData.postcode || addressData.postal_code || ''

    if (street) setValue('address.street', street, { shouldValidate: true })
    if (suburb) setValue('address.suburb', suburb, { shouldValidate: true })
    if (state) setValue('address.state', state, { shouldValidate: true })
    if (postcode) setValue('address.postcode', postcode, { shouldValidate: true })

    return {
      street,
      suburb,
      state,
      postcode,
      displayName: data.display_name || '',
      fullAddress: data.address,
    }
  } catch (error) {
    console.error('Error fetching address:', error)
    throw error
  }
}

/**
 * Custom hook for geolocation functionality
 */
export const useGeolocation = (setValue) => {
  const [location, setLocation] = useState({
    coordinates: null,
    isLocating: false,
    addressInfo: null,
  })

  const handleGetCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setLocation((prev) => ({ ...prev, isLocating: true }))

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { longitude, latitude } = position.coords
          const coordinates = [longitude, latitude]

          toast.loading('Fetching address details...', { id: 'geolocation' })
          const addressInfo = await fetchAddressFromCoordinates(latitude, longitude, setValue)

          setLocation({ coordinates, isLocating: false, addressInfo })
          setValue('address.coordinates', coordinates, { shouldValidate: false })

          toast.success(`Address found: ${addressInfo.displayName || addressInfo.suburb || 'Location captured'}`, {
            id: 'geolocation',
          })
        } catch (error) {
          setLocation((prev) => ({ ...prev, isLocating: false }))
          toast.error('Location captured but could not fetch address details', { id: 'geolocation' })
          const { longitude, latitude } = position.coords
          const coordinates = [longitude, latitude]
          setLocation({ coordinates, isLocating: false })
          setValue('address.coordinates', coordinates, { shouldValidate: false })
        }
      },
      (error) => {
        setLocation((prev) => ({ ...prev, isLocating: false }))
        toast.error('Unable to get your location. Please use manual entry.', { id: 'geolocation' })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [setValue])

  return {
    location,
    setLocation,
    handleGetCurrentLocation,
  }
}
