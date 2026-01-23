import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  VisibilityOutlined,
  StarOutlined,
  AttachMoneyOutlined,
  CalendarTodayOutlined,
} from '@mui/icons-material';

const ProfileStats = ({ user, onboardingData }) => {
  const theme = useTheme();

  const stats = [
    {
      icon: VisibilityOutlined,
      value: '124',
      label: 'Views',
    },
    {
      icon: StarOutlined,
      value: '4.8',
      label: 'Rating',
    },
    {
      icon: AttachMoneyOutlined,
      value: `$${onboardingData?.data?.profile?.expectedHourlyRate || 0}`,
      label: 'Per hour',
    },
    {
      icon: CalendarTodayOutlined,
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })
        : '—',
      label: 'Joined',
    },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
      }}
    >
      <Grid container spacing={0} sx={{ width: '100%' }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={stat.label} sx={{ display: 'flex' }}>
            <Box
              sx={{
                flex: 1,
                px: { xs: 1, sm: 1.5 },
                py: { xs: 1.25, sm: 1.5 },
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight:
                  index !== stats.length - 1
                    ? `1px solid ${alpha(theme.palette.divider, 0.08)}`
                    : 'none',
                '&:nth-of-type(2)': {
                  borderRight: { xs: 'none', sm: `1px solid ${alpha(theme.palette.divider, 0.08)}` },
                },
                '&:nth-of-type(4)': {
                  borderRight: 'none',
                },
              }}
            >
              <Stack
                spacing={0.25}
                alignItems="center"
                justifyContent="center"
                sx={{ width: '100%' }}
              >
                <stat.icon
                  sx={{
                    fontSize: { xs: 14, sm: 16 },
                    color: theme.palette.text.secondary,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{
                    fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {stat.label}
                </Typography>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfileStats;
