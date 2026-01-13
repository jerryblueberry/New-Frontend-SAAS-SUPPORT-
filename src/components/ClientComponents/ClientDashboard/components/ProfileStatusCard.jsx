/**
 * ProfileStatusCard Component
 * Clean, minimal SaaS-level design with premium aesthetics
 * Displays profile completion status with compact, appealing content
 */

import React from 'react'
import { Typography, Chip, Box, useTheme, useMediaQuery, alpha, Stack } from '@mui/material'
import { CheckCircle, HourglassEmpty, Verified } from '@mui/icons-material'

/**
 * ProfileStatusCard Component
 * @param {Object} props
 * @param {boolean} props.isVerified - Verification status
 * @param {boolean} props.isUnderVerification - Under verification status
 * @param {Object} props.statusConfig - Status configuration object
 */
const ProfileStatusCard = ({ isVerified, isUnderVerification, statusConfig }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Color configurations
  const statusColors = {
    verified: {
      primary: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.08),
      border: alpha(theme.palette.success.main, 0.2),
      text: theme.palette.success.dark,
      iconBg: alpha(theme.palette.success.main, 0.12)
    },
    pending: {
      primary: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, 0.08),
      border: alpha(theme.palette.warning.main, 0.2),
      text: theme.palette.warning.dark,
      iconBg: alpha(theme.palette.warning.main, 0.12)
    }
  }

  const colors = isVerified ? statusColors.verified : statusColors.pending

  return (
    <Box 
      sx={{ 
        mb: { xs: 3, sm: 4 },
        p: { xs: 2.5, sm: 3, md: 3.5, lg: 4 },
        borderRadius: { xs: 2.5, sm: 3 },
        bgcolor: colors.bg,
        border: `1px solid ${colors.border}`,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        '&:hover': {
          borderColor: colors.primary,
          boxShadow: `0 4px 20px ${alpha(colors.primary, 0.12)}`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Status Header Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 3 },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          mb: { xs: 2.5, sm: 3 },
          width: '100%'
        }}
      >
        {/* Left: Icon + Status */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            flex: { xs: '1 1 auto', sm: '0 1 auto' },
            minWidth: 0,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          <Box
            sx={{
              width: { xs: 48, sm: 56, md: 60 },
              height: { xs: 48, sm: 56, md: 60 },
              borderRadius: 2,
              bgcolor: colors.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            {React.cloneElement(statusConfig.icon, {
              sx: {
                color: colors.primary,
                fontSize: { xs: 24, sm: 28, md: 30 },
              }
            })}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                color: colors.text,
                mb: 0.5,
                lineHeight: 1.3
              }}
            >
              {isVerified ? 'Profile Verified' : 'Under Review'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={statusConfig.label}
                size="small"
                sx={{
                  height: { xs: 24, sm: 26 },
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  fontWeight: 600,
                  bgcolor: alpha(colors.primary, 0.1),
                  color: colors.primary,
                  border: `1px solid ${alpha(colors.primary, 0.2)}`,
                  '& .MuiChip-label': {
                    px: { xs: 1.25, sm: 1.5 }
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Right: Completion Badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0.75, sm: 1 },
            px: { xs: 1.5, sm: 2, md: 2.25 },
            py: { xs: 1, sm: 1.25, md: 1.5 },
            borderRadius: 2,
            bgcolor: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            flexShrink: 0,
            alignSelf: { xs: 'flex-start', sm: 'center' },
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.success.main, 0.15),
              borderColor: alpha(theme.palette.success.main, 0.3),
              transform: 'translateY(-1px)'
            }
          }}
        >
          <CheckCircle 
            sx={{ 
              color: theme.palette.success.main, 
              fontSize: { xs: 18, sm: 20, md: 22 },
              flexShrink: 0
            }} 
          />
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
              color: theme.palette.success.dark,
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em'
            }}
          >
            Complete
          </Typography>
        </Box>
      </Box>

      {/* Status Message */}
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: '0.875rem', sm: '0.9375rem', md: '1rem' },
          color: theme.palette.text.secondary,
          lineHeight: 1.6,
          mb: { xs: 2, sm: 2.5, md: 3 },
          maxWidth: { md: '85%' }
        }}
      >
        {statusConfig.message}
      </Typography>

      {/* Status-specific Info Box */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.25 },
          borderRadius: 2,
          bgcolor: alpha(colors.primary, 0.06),
          border: `1px solid ${alpha(colors.primary, 0.15)}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: { xs: 1.5, sm: 2 },
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: alpha(colors.primary, 0.08),
            borderColor: alpha(colors.primary, 0.2)
          }
        }}
      >
        {isUnderVerification && !isVerified ? (
          <>
            <HourglassEmpty 
              sx={{ 
                color: colors.primary, 
                fontSize: { xs: 20, sm: 22 },
                flexShrink: 0,
                mt: 0.25
              }} 
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  color: colors.text,
                  mb: 0.5
                }}
              >
                Under Admin Review
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  color: theme.palette.text.secondary,
                  lineHeight: 1.5
                }}
              >
                Verification typically takes 1-3 business days. You'll be notified once complete.
              </Typography>
            </Box>
          </>
        ) : isVerified ? (
          <>
            <Verified 
              sx={{ 
                color: colors.primary, 
                fontSize: { xs: 20, sm: 22 },
                flexShrink: 0,
                mt: 0.25
              }} 
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  color: colors.text,
                  mb: 0.5
                }}
              >
                Ready for Service Matching
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                  color: theme.palette.text.secondary,
                  lineHeight: 1.5
                }}
              >
                Your profile is active and you can now find support workers and post jobs.
              </Typography>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  )
}

export default ProfileStatusCard
