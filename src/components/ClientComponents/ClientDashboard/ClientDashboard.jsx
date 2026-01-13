/**
 * ClientDashboard Component
 * Main dashboard component for clients
 * 
 * Architecture:
 * - Uses custom hooks for data fetching and business logic
 * - Composed of smaller, reusable components
 * - Optimized with React.memo and useMemo for performance
 * - Responsive design with Material-UI breakpoints
 * - Code-split for better performance
 */

import React, { useEffect, useState } from 'react'
import { Box, Grid, Alert, Typography, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import ClientSidebar from '../ClientSidebar/ClientSidebar'
import WorkerNavbar from '../../Navbar/WorkerNavbar'
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout'
import {
  WelcomeHeader,
  OnboardingPromptCard,
  ProfileStatusCard,
  QuickStatsGrid,
  ActionItemsCard,
  QuickActionsCard
} from './components'
import {
  useClientDashboard,
  useQuickStats,
  useUpcomingTasks
} from './hooks'

/**
 * ClientDashboard Component
 */
const ClientDashboard = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topOffset, setTopOffset] = useState(64)

  // Custom hooks for data and logic
  const {
    profile,
    isLoading,
    isError,
    error,
    profileComplete,
    underVerification,
    verified,
    statusConfig
  } = useClientDashboard()

  const quickStats = useQuickStats(profile)
  const upcomingTasks = useUpcomingTasks(profile)

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

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <WorkerNavbar />
      
      {/* Error State */}
      {isError && (
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 1 }}>
          <Alert severity="error" sx={{ borderRadius: 1 }}>
            <Typography variant="body2">
              Failed to load your profile. Please refresh and try again.
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Layout container with sidebar */}
      <Box sx={{ 
        display: 'flex', 
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        <ClientSidebar topOffset={topOffset} navigate={navigate} />

        {/* Main content */}
        <Box sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
          minWidth: 0,
          maxWidth: '100%',
          pt: { xs: 10, md: 8.7 },
          px: { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>
          <Box sx={{ 
            maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '1400px', xl: '1600px' }, 
            mx: 'auto',
            width: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box'
          }}>
            {/* Welcome Header */}
            <WelcomeHeader
              user={user}
              isLoading={isLoading}
              isProfileComplete={profileComplete}
              isVerified={verified}
              statusConfig={statusConfig}
            />

            {/* Onboarding Prompt Card - Only show if profile incomplete */}
            {!isLoading && !profileComplete && (
              <OnboardingPromptCard
                onNavigate={() => navigate('/client-onboarding')}
              />
            )}

            {/* Profile Status Card - Only show if profile complete */}
            {!isLoading && profileComplete && (
              <ProfileStatusCard
                isVerified={verified}
                isUnderVerification={underVerification}
                statusConfig={statusConfig}
              />
            )}

            {/* Quick Stats Grid */}
            <QuickStatsGrid stats={quickStats} />

            {/* Action Items & Quick Actions Grid */}
            <Grid 
              container 
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
              sx={{
                width: '100%',
                margin: 0,
                boxSizing: 'border-box',
                '& > .MuiGrid-item': {
                  paddingLeft: { xs: '16px !important', sm: '20px !important', md: '24px !important' },
                  paddingTop: { xs: '16px !important', sm: '20px !important', md: '24px !important' },
                  boxSizing: 'border-box'
                }
              }}
            >
              {/* Action Items */}
              <Grid 
                item 
                xs={12} 
                md={7} 
                lg={7} 
                xl={7}
                sx={{
                  display: 'flex',
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <ActionItemsCard tasks={upcomingTasks} />
              </Grid>

              {/* Quick Actions */}
              <Grid 
                item 
                xs={12} 
                md={5} 
                lg={5} 
                xl={5}
                sx={{
                  display: 'flex',
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <QuickActionsCard />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ClientDashboard
