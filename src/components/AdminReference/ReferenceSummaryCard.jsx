import React from 'react';
import {
  Grid,
  Box,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  Business,
  CheckCircle,
  PendingActions
} from '@mui/icons-material';

const ReferenceSummaryCard = ({ totals }) => {
  const theme = useTheme();

  const statsConfig = [
    {
      title: 'Total',
      value: totals?.total || 0,
      icon: Business,
      color: '#6366f1'
    },
    {
      title: 'Complete',
      value: totals?.completed || 0,
      icon: CheckCircle,
      color: '#10b981'
    },
    {
      title: 'Pending',
      value: totals?.pending || 0,
      icon: PendingActions,
      color: '#f59e0b'
    }
  ];

  return (
    <Grid 
      container 
      spacing={{ xs: 0.75, sm: 1 }} 
      sx={{ mb: { xs: 1.5, sm: 2 } }}
    >
      {statsConfig.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <Grid item xs={12} sm={4} key={index}>
            <Box
              sx={{
                height: { xs: 64, sm: 68 },
                borderRadius: 1,
                border: `1px solid #fff`,
                backgroundColor: theme.palette.mode === 'dark' ? 'grey.950' : '#fafafa',
                display: 'flex',
                alignItems: 'center',
                px: { xs: 1.5, sm: 2 },
                gap: { xs: 1, sm: 1.25 },
                transition: 'all 0.15s ease-out',
                cursor: 'pointer',
              
              }}
            >
              {/* Icon */}
              <Box
                className="stat-icon"
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  borderRadius: 0.75,
                  backgroundColor: alpha(stat.color, 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s ease-out'
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                    color: stat.color
                  }}
                />
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    fontWeight: 500,
                    color: 'text.secondary',
                    display: 'block',
                    lineHeight: 1,
                    mb: 0.25
                  }}
                >
                  {stat.title}
                </Typography>
                
                <Typography
                  variant="h5"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '1.4rem' },
                    fontWeight: 700,
                    color: 'text.primary',
                    lineHeight: 1,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {stat.value.toLocaleString()}
                </Typography>
              </Box>

              {/* Minimal status indicator */}
              {/* <Box
                sx={{
                  width: 3,
                  height: { xs: 16, sm: 20 },
                  borderRadius: 1.5,
                  backgroundColor: stat.color,
                  flexShrink: 0,
                  opacity: 0.7
                }}
              /> */}
            </Box>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ReferenceSummaryCard;