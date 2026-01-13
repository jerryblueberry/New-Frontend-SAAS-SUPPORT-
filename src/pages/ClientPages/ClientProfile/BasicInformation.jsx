/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT BASIC INFORMATION - Profile Management Page
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready profile management page with view/edit modes.
 * Uses modular component architecture for maintainability.
 * 
 * Features:
 * - View mode: Display current information
 * - Edit mode: Form with validation
 * - GPS location picker
 * - Real-time validation
 * - Optimistic updates
 * 
 * @module pages/ClientPages/ClientProfile/BasicInformation
 */

import React, { useEffect, useState } from 'react'
import { Box, useTheme, alpha } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar'
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import { useBasicInfo } from '../../../stores/useClientProfileStore'
import { formatApiError } from '../../../utils/errorFormatter'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import BasicInformation from '../../../components/ClientComponents/ClientProfile/BasicInformation'
import {
  ErrorState,
  EmptyState
} from '../../../components/ClientComponents/ClientProfile/BasicInformation/components'

/**
 * BasicInformation Page Component
 * Thin wrapper that handles layout and state management
 */
const BasicInformationPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [topOffset, setTopOffset] = useState(64)

  // TanStack Query hooks
  const { data: basicInfo, isLoading, isError, error, isUpdating } = useBasicInfo()

  // Measure navbar height for sidebar positioning
  useEffect(() => {
    const measureNavbar = () => {
      const headerEl = document.querySelector('.wrk-dashboard-header')
      if (headerEl) {
        setTopOffset(headerEl.getBoundingClientRect().height || 64)
      }
    }
    measureNavbar()
    window.addEventListener('resize', measureNavbar)
    return () => window.removeEventListener('resize', measureNavbar)
  }, [])

  // Check if error is "not found"
  const isNotFoundError = isError && error && (
    error?.response?.status === 404 ||
    error?.response?.data?.code === 'NO_PROFILE' ||
    (typeof (error?.response?.data?.message || error?.message || '') === 'string' && (
      (error?.response?.data?.message || error?.message || '').toLowerCase().includes('not found') ||
      (error?.response?.data?.message || error?.message || '').toLowerCase().includes('no profile')
    ))
  )

  // Loading state
  if (isLoading) {
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner
            size="lg"
            showLogo={true}
            text="Loading your profile..."
            fullPage={true}
            variant="gradient"
            color="primary"
          />
        </Box>
      </>
    )
  }

  // Error state
  if (isError && !isNotFoundError) {
    const errorMessage = formatApiError(error)
    return (
      <>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
            }}
          >
            <ErrorState errorMessage={errorMessage} />
          </Box>
        </Box>
      </>
    )
  }

  // Empty state - No profile found
  if (isError && isNotFoundError) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EmptyState onNavigateToOnboarding={() => navigate('/client-onboarding')} />
          </Box>
        </Box>
      </Box>
    )
  }

  // Empty state - No data loaded yet
  if (!isLoading && !basicInfo && !isError) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4 },
              pb: { xs: 4, sm: 5, md: 6 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EmptyState onNavigateToOnboarding={() => navigate('/client-onboarding')} />
          </Box>
        </Box>
      </Box>
    )
  }

  // Main content
  return (
    <>
      {/* Full-screen loading overlay during form submission */}
      {isUpdating && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: alpha(theme.palette.background.default, 0.8),
            backdropFilter: 'blur(4px)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingSpinner
            size="lg"
            showLogo={true}
            text="Saving your changes..."
            fullPage={false}
            variant="gradient"
            color="primary"
          />
        </Box>
      )}

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <WorkerNavbar />
        <Box sx={{ display: 'flex', width: '100%' }}>
          <ClientSidebar topOffset={topOffset} navigate={navigate} />
          <Box
            sx={{
              flexGrow: 1,
              width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
              minWidth: 0,
              pt: { xs: 10, md: 8.7 },
              px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
              pb: { xs: 4, sm: 5, md: 6 },
            }}
          >
            <Box
              sx={{
                maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '1400px', xl: '1600px' },
                mx: 'auto',
                width: '100%',
              }}
            >
              <BasicInformation />
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default BasicInformationPage
