/**
 * BasicInformation Component
 * Main orchestrator component for Basic Information form
 * Production-ready, modular architecture
 */

import React from 'react'
import { Box, useTheme, useMediaQuery } from '@mui/material'
import { useBasicInformation } from './hooks'
import {
  HeaderCard,
  AccountInformationSection,
  AddressSection,
  OptionalFieldsSection,
  ActionButtons
} from './components'

/**
 * BasicInformation Component
 */
const BasicInformation = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    // Data
    basicInfo,
    accountType,
    canEditRestrictedFields,
    profileStatus,
    
    // Form
    register,
    handleSubmit,
    control,
    errors,
    isDirty,
    
    // State
    isEditMode,
    addressMethod,
    setAddressMethod,
    location,
    handleGetCurrentLocation,
    
    // Actions
    handleEditClick,
    handleCancelClick,
    onSubmit,
    
    // Loading/Error
    isLoading,
    isError,
    error,
    isNotFoundError,
    isUpdating,
  } = useBasicInformation()

  if (isLoading) {
    return null // Loading handled by parent
  }

  if (isError && !isNotFoundError) {
    return null // Error handled by parent
  }

  if (isError && isNotFoundError) {
    return null // Empty state handled by parent
  }

  return (
    <Box
      component={isEditMode ? 'form' : 'div'}
      onSubmit={isEditMode ? handleSubmit(onSubmit) : undefined}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 3, sm: 4, md: 5 },
      }}
    >
      {/* Header */}
      <HeaderCard 
        isEditMode={isEditMode} 
        onEditClick={handleEditClick}
        isMobile={isMobile}
      />

      {/* Form Sections */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 4, sm: 5, md: 6 },
        }}
      >
        {/* Account Information Section */}
        <AccountInformationSection
          isEditMode={isEditMode}
          accountType={accountType}
          basicInfo={basicInfo}
          register={register}
          errors={errors}
          canEditRestrictedFields={canEditRestrictedFields}
          profileStatus={profileStatus}
          isMobile={isMobile}
        />

        {/* Address Section */}
        <AddressSection
          isEditMode={isEditMode}
          basicInfo={basicInfo}
          register={register}
          control={control}
          errors={errors}
          addressMethod={addressMethod}
          setAddressMethod={setAddressMethod}
          location={location}
          handleGetCurrentLocation={handleGetCurrentLocation}
          isMobile={isMobile}
        />

        {/* Optional Fields Section */}
        <OptionalFieldsSection
          isEditMode={isEditMode}
          basicInfo={basicInfo}
          register={register}
          control={control}
          errors={errors}
          isMobile={isMobile}
        />
      </Box>

      {/* Action Buttons */}
      {isEditMode && (
        <ActionButtons
          isUpdating={isUpdating}
          isDirty={isDirty}
          onCancel={handleCancelClick}
          isMobile={isMobile}
        />
      )}
    </Box>
  )
}

export default BasicInformation
