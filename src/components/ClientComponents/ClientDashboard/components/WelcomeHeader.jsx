/**
 * WelcomeHeader Component
 * Clean, modern SaaS-level design with minimal styling
 * Displays welcome message and profile status badge
 */

import React from 'react'
import { Typography, Chip, Box, Skeleton, useTheme, useMediaQuery, alpha } from '@mui/material'

/**
 * WelcomeHeader Component
 * @param {Object} props
 * @param {Object} props.user - Current user object
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.isProfileComplete - Profile completion status
 * @param {boolean} props.isVerified - Verification status
 * @param {Object} props.statusConfig - Status configuration object
 */
const WelcomeHeader = ({ 
  user, 
  isLoading, 
  isProfileComplete, 
  isVerified, 
  statusConfig 
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Box 
      sx={{ 
        mb: { xs: 4, sm: 5, md: 6 },
        mt: { xs: 2, sm: 3, md: 4 },
        pt: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center', md: 'flex-start' }, 
        gap: { xs: 2.5, sm: 3, md: 4 },
        flexWrap: 'wrap',
        width: '100%'
      }}>
        {/* Welcome Text Section */}
        <Box sx={{ 
          flex: '1 1 auto', 
          minWidth: 0,
          width: { xs: '100%', sm: 'auto' },
          maxWidth: { sm: '100%', md: '70%' }
        }}>
          {isLoading ? (
            <>
              <Skeleton 
                variant="text" 
                width={280} 
                height={40} 
                sx={{ mb: 1.5 }}
              />
              <Skeleton 
                variant="text" 
                width={320} 
                height={24} 
              />
            </>
          ) : (
            <>
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                fontWeight={700}
                sx={{ 
                  mb: 1,
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                  lineHeight: { xs: 1.2, sm: 1.3 },
                  letterSpacing: '-0.02em'
                }}
              >
                {`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}`}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: { xs: '0.9375rem', sm: '1rem', md: '1.0625rem' },
                  color: theme.palette.text.secondary,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  maxWidth: { sm: '600px' }
                }}
              >
                {isProfileComplete 
                  ? isVerified 
                    ? 'Your profile is verified and ready for service matching. Start exploring available workers and services.'
                    : 'Your profile is under admin verification. We\'ll notify you once the review is complete.'
                  : 'Complete your basic profile setup to unlock all features and start matching with qualified care workers.'
                }
              </Typography>
            </>
          )}
        </Box>

        {/* Status Badge Section */}
        {!isLoading && (
          <Box sx={{ 
            flexShrink: 0,
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            alignSelf: { xs: 'flex-start', sm: 'center', md: 'flex-start' },
            mt: { xs: 0.5, sm: 0 }
          }}>
            <Chip 
              label={statusConfig.label} 
              icon={statusConfig.icon}
              size={isMobile ? 'medium' : 'large'}
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                height: { xs: 32, sm: 36 },
                px: { xs: 1.5, sm: 2 },
                bgcolor: isProfileComplete && isVerified
                  ? alpha(theme.palette.success.main, 0.1)
                  : isProfileComplete
                  ? alpha(theme.palette.warning.main, 0.1)
                  : alpha(theme.palette.info.main, 0.1),
                color: isProfileComplete && isVerified
                  ? theme.palette.success.main
                  : isProfileComplete
                  ? theme.palette.warning.main
                  : theme.palette.info.main,
                border: `1.5px solid`,
                borderColor: isProfileComplete && isVerified
                  ? alpha(theme.palette.success.main, 0.2)
                  : isProfileComplete
                  ? alpha(theme.palette.warning.main, 0.2)
                  : alpha(theme.palette.info.main, 0.2),
                '& .MuiChip-icon': {
                  color: 'inherit',
                  fontSize: { xs: '1rem', sm: '1.125rem' }
                },
                '& .MuiChip-label': {
                  px: { xs: 1, sm: 1.5 }
                },
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(
                    isProfileComplete && isVerified
                      ? theme.palette.success.main
                      : isProfileComplete
                      ? theme.palette.warning.main
                      : theme.palette.info.main,
                    0.15
                  )}`
                }
              }}
            />
          </Box>
        )}
        {isLoading && (
          <Skeleton 
            variant="rounded" 
            width={120} 
            height={36} 
            sx={{ 
              borderRadius: 2,
              flexShrink: 0
            }} 
          />
        )}
      </Box>
    </Box>
  )
}

export default WelcomeHeader
