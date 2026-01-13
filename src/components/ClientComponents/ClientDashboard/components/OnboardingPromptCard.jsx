/**
 * OnboardingPromptCard Component
 * Displays prompt to complete profile setup
 */

import React from 'react'
import { Card, CardContent, Typography, Button, Chip, Box, useTheme, useMediaQuery } from '@mui/material'
import { Timeline, RadioButtonUnchecked, ChevronRight } from '@mui/icons-material'

/**
 * OnboardingPromptCard Component
 * @param {Object} props
 * @param {Function} props.onNavigate - Navigation handler
 */
const OnboardingPromptCard = ({ onNavigate }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Card 
      elevation={0} 
      sx={{ 
        mb: { xs: 3, sm: 4 }, 
        borderRadius: 3, 
        border: '2px solid',
        borderColor: 'primary.main',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        }
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4, md: 4.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5, mb: 3 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2.5, 
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 }
          }}>
            <Timeline sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant={isMobile ? 'h6' : 'h5'} 
              fontWeight="700" 
              gutterBottom
              sx={{ mb: 1 }}
            >
              Complete Your Basic Profile Setup
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                lineHeight: 1.6,
                mb: 2
              }}
            >
              Complete your basic information to unlock all features and start finding the perfect support workers for your needs.
            </Typography>
            
            <Chip
              icon={<RadioButtonUnchecked sx={{ fontSize: 16 }} />}
              label="Incomplete"
              size="small"
              sx={{
                bgcolor: 'warning.50',
                color: 'warning.dark',
                border: '1px solid',
                borderColor: 'warning.main',
                fontWeight: 600,
                fontSize: '0.8125rem',
                height: 28,
                '& .MuiChip-icon': {
                  color: 'warning.main'
                }
              }}
            />
          </Box>
        </Box>

        <Button 
          variant="contained"
          endIcon={<ChevronRight />}
          fullWidth
          size="large"
          sx={{ 
            textTransform: 'none',
            py: 1.75,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 600,
            fontSize: { xs: '0.9375rem', sm: '1rem' },
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
              transform: 'translateY(-2px)'
            },
            transition: 'all 0.2s ease'
          }}
          onClick={onNavigate}
        >
          Complete Profile Setup
        </Button>
      </CardContent>
    </Card>
  )
}

export default OnboardingPromptCard
