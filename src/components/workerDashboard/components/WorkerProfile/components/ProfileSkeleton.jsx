import React from 'react';
import {
  Box,
  Card,
  Skeleton,
  Stack,
  Grid,
  useTheme,
  alpha,
} from '@mui/material';

const ProfileSkeleton = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 2, sm: 2.5 },
        px: { xs: 2, sm: 3 },
        maxWidth: 1200,
        mx: 'auto',
      }}
    >
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          overflow: 'hidden',
        }}
      >
        {/* Header Skeleton */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
          >
            <Skeleton variant="circular" width={120} height={120} />
            <Box sx={{ flex: 1, width: '100%' }}>
              <Skeleton
                variant="text"
                width="45%"
                height={40}
                sx={{ mb: 1 }}
              />
              <Skeleton variant="rounded" width={100} height={26} sx={{ mb: 2 }} />
              <Grid container spacing={1.5}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid item xs={6} sm={3} key={item}>
                    <Skeleton variant="rounded" height={70} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </Box>

        {/* Content Skeleton */}
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="35%" height={28} sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {[1, 2].map((item) => (
                  <Skeleton key={item} variant="rounded" height={70} />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="35%" height={28} sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Skeleton
                    key={item}
                    variant="rounded"
                    width={90}
                    height={32}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Biography Skeleton */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={120} />
        </Box>
      </Card>
    </Box>
  );
};

export default ProfileSkeleton;
