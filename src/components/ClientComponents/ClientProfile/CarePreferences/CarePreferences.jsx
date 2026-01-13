/**
 * CarePreferences Component
 * Main orchestrator component for Care Preferences form
 * Production-ready, modular architecture
 */

import React from 'react'
import { Box, useTheme, useMediaQuery } from '@mui/material'
import { useCarePreferences } from './hooks'
import {
  HeaderCard,
  SupportCategoriesSection,
  ServiceRegionsSection,
  WorkerPreferencesSection,
  CulturalPreferencesSection,
  AvailabilitySection,
  ServiceDeliverySection,
  SpecialRequirementsSection,
  ActionButtons
} from './components'

/**
 * CarePreferences Component
 */
const CarePreferences = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    // Data
    preferences,
    isOrganization,
    
    // Form
    register,
    handleSubmit,
    control,
    errors,
    isDirty,
    
    // State
    isEditMode,
    
    // Input states
    serviceRegionInput,
    setServiceRegionInput,
    observanceInput,
    setObservanceInput,
    habitInput,
    setHabitInput,
    interestInput,
    setInterestInput,
    valueInput,
    setValueInput,
    
    // Watched values
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
  } = useCarePreferences()

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
        {/* Support Categories Section */}
        <SupportCategoriesSection
          isEditMode={isEditMode}
          preferences={preferences}
          control={control}
          errors={errors}
          isMobile={isMobile}
        />

        {/* Service Regions Section */}
        <ServiceRegionsSection
          isEditMode={isEditMode}
          preferences={preferences}
          errors={errors}
          serviceRegionInput={serviceRegionInput}
          setServiceRegionInput={setServiceRegionInput}
          watchedServiceRegions={watchedServiceRegions}
          handleAddServiceRegion={handleAddServiceRegion}
          handleRemoveServiceRegion={handleRemoveServiceRegion}
          isMobile={isMobile}
        />

        {/* Worker Preferences Section */}
        <WorkerPreferencesSection
          isEditMode={isEditMode}
          preferences={preferences}
          register={register}
          control={control}
          isMobile={isMobile}
        />

        {/* Cultural Preferences Section */}
        <CulturalPreferencesSection
          isEditMode={isEditMode}
          preferences={preferences}
          register={register}
          control={control}
          errors={errors}
          observanceInput={observanceInput}
          setObservanceInput={setObservanceInput}
          habitInput={habitInput}
          setHabitInput={setHabitInput}
          interestInput={interestInput}
          setInterestInput={setInterestInput}
          valueInput={valueInput}
          setValueInput={setValueInput}
          watchedDietaryRestrictions={watchedDietaryRestrictions}
          watchedObservances={watchedObservances}
          watchedHabits={watchedHabits}
          watchedInterests={watchedInterests}
          watchedValues={watchedValues}
          handleAddArrayItem={handleAddArrayItem}
          handleRemoveArrayItem={handleRemoveArrayItem}
          isMobile={isMobile}
        />

        {/* Availability Section */}
        <AvailabilitySection
          isEditMode={isEditMode}
          preferences={preferences}
          watchedAvailability={watchedAvailability}
          handleToggleAvailability={handleToggleAvailability}
          isMobile={isMobile}
        />

        {/* Service Delivery Section */}
        <ServiceDeliverySection
          isEditMode={isEditMode}
          preferences={preferences}
          register={register}
          control={control}
          isMobile={isMobile}
        />

        {/* Special Requirements Section */}
        <SpecialRequirementsSection
          isEditMode={isEditMode}
          preferences={preferences}
          register={register}
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

export default CarePreferences
