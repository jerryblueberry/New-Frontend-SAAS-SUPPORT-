/**
 * QuickStatsGrid Component
 * Compact, horizontal flex row design for all devices
 * Premium SaaS-level minimal design
 */

import React from 'react'
import { Typography, Tooltip, Box, useTheme, alpha, Chip } from '@mui/material'

/**
 * QuickStatsGrid Component
 * @param {Array} stats - Array of stat objects with icon, value, label, color, tooltip
 */
const QuickStatsGrid = ({ stats = [] }) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: { xs: 1, sm: 1.25, md: 1.5, lg: 2 },
        mb: { xs: 3, sm: 4 },
        width: '100%',
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        overflowX: { xs: 'auto', sm: 'visible' },
        '&::-webkit-scrollbar': {
          height: 4
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: alpha(theme.palette.text.secondary, 0.2),
          borderRadius: 2
        }
      }}
    >
      {stats.map((stat, index) => (
        <Tooltip key={index} title={stat.tooltip || stat.label} arrow placement="top">
          <Box
            sx={{
              flex: { xs: '0 0 calc(50% - 8px)', sm: '1 1 0', md: '1 1 auto' },
              minWidth: { xs: 'calc(50% - 8px)', sm: 0, md: 180, lg: 200 },
              maxWidth: { xs: 'calc(50% - 8px)', sm: 'none', md: 'none' },
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: { xs: 1.25, sm: 1.5, md: 2 },
              p: { xs: 1.25, sm: 1.5, md: 1.75 },
              borderRadius: { xs: 2, sm: 2.5 },
              bgcolor: alpha(stat.color, 0.06),
              border: `1px solid ${alpha(stat.color, 0.15)}`,
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              height: { xs: 72, sm: 80, md: 88 },
              '&:hover': {
                bgcolor: alpha(stat.color, 0.1),
                borderColor: alpha(stat.color, 0.25),
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}`
              }
            }}
          >
            {/* Icon */}
            <Box
              sx={{
                p: { xs: 0.625, sm: 0.75, md: 0.875 },
                borderRadius: 1.5,
                bgcolor: alpha(stat.color, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: { xs: 36, sm: 40, md: 44 },
                height: { xs: 36, sm: 40, md: 44 }
              }}
            >
              {React.cloneElement(stat.icon, {
                sx: {
                  color: stat.color,
                  fontSize: { xs: 18, sm: 20, md: 22 }
                }
              })}
            </Box>

            {/* Value and Label */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
                minWidth: 0,
                gap: 0.125
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  color: stat.color,
                  fontSize: { xs: '1.125rem', sm: '1.375rem', md: '1.625rem', lg: '1.875rem' },
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: { xs: '0.6875rem', sm: '0.75rem', md: '0.8125rem' },
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.2
                }}
              >
                {stat.label}
              </Typography>
            </Box>
          </Box>
        </Tooltip>
      ))}
    </Box>
  )
}

export default QuickStatsGrid
