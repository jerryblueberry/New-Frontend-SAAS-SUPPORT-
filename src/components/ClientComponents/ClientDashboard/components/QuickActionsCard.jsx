/**
 * QuickActionsCard Component
 * Premium, minimal SaaS-level design with appealing visuals
 * Displays quick action buttons with enhanced labels and tips
 */

import React from 'react'
import { Typography, Button, Stack, Box, useTheme, alpha } from '@mui/material'
import { 
  Person, 
  CalendarToday, 
  Description, 
  Shield,
  Bolt,
  ArrowForward
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { QUICK_ACTIONS } from '../utils/constants'

// Enhanced icon mapping with colors
const iconMap = {
  Person: { Icon: Person, color: '#3b82f6', tip: 'Browse and connect with qualified support workers' },
  CalendarToday: { Icon: CalendarToday, color: '#10b981', tip: 'Schedule your care sessions and appointments' },
  Description: { Icon: Description, color: '#f59e0b', tip: 'View and manage your documents and verifications' },
  Shield: { Icon: Shield, color: '#8b5cf6', tip: 'Update your care preferences and requirements' }
}

/**
 * QuickActionsCard Component
 */
const QuickActionsCard = () => {
  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        minHeight: 0,
        p: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
        borderRadius: { xs: 2, sm: 2.5 },
        bgcolor: alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.2),
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`
        }
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5, 
          mb: { xs: 2.5, sm: 3 }
        }}
      >
        <Box
          sx={{
            p: { xs: 0.875, sm: 1 },
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Bolt
            sx={{
              fontSize: { xs: 20, sm: 22 },
              color: theme.palette.primary.main
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              color: theme.palette.text.primary,
              lineHeight: 1.3
            }}
          >
            Quick Actions
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Stack 
        spacing={1.25}
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          maxWidth: '100%'
        }}
      >
        {QUICK_ACTIONS.map((action, index) => {
          const iconConfig = iconMap[action.icon]
          const IconComponent = iconConfig?.Icon
          
          return (
            <Button
              key={index}
                fullWidth
                variant="outlined"
                startIcon={
                  IconComponent ? (
                    <IconComponent
                      sx={{
                        fontSize: { xs: 18, sm: 20 },
                        color: iconConfig.color,
                        flexShrink: 0
                      }}
                    />
                  ) : null
                }
                endIcon={
                  <ArrowForward
                    sx={{
                      fontSize: { xs: 16, sm: 18 },
                      opacity: 0.6,
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  />
                }
                sx={{
                  py: { xs: 1.5, sm: 1.75 },
                  px: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  borderColor: alpha(iconConfig?.color || theme.palette.primary.main, 0.2),
                  borderWidth: 1.5,
                  bgcolor: alpha(iconConfig?.color || theme.palette.primary.main, 0.04),
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontWeight: 600,
                  justifyContent: 'space-between',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: '100%',
                  minWidth: 0,
                  overflow: 'hidden',
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: 1, sm: 1.25 },
                    marginLeft: 0
                  },
                  '& .MuiButton-endIcon': {
                    marginLeft: { xs: 1, sm: 1.25 },
                    marginRight: 0
                  },
                  '&:hover': {
                    borderColor: iconConfig?.color || theme.palette.primary.main,
                    bgcolor: alpha(iconConfig?.color || theme.palette.primary.main, 0.1),
                    transform: { xs: 'none', sm: 'translateX(4px)' },
                    borderWidth: 1.5,
                    '& .MuiButton-endIcon': {
                      opacity: 1,
                      transform: { xs: 'none', sm: 'translateX(2px)' }
                    }
                  }
                }}
                onClick={() => action.path && navigate(action.path)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    flex: 1,
                    textAlign: 'left',
                    minWidth: 0,
                    overflow: 'hidden'
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 600,
                      fontSize: 'inherit',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: 0,
                      flex: 1
                    }}
                  >
                    {action.label}
                  </Typography>
                </Box>
              </Button>
          )
        })}
      </Stack>
    </Box>
  )
}

export default QuickActionsCard
