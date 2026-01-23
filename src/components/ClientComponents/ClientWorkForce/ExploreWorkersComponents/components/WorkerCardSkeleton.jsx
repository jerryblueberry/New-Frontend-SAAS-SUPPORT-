/**
 * WorkerCardSkeleton Component
 * 
 * Loading skeleton for worker cards.
 */

import React from 'react';
import { Card, CardContent, Skeleton, Stack, Box } from '@mui/material';

/**
 * WorkerCardSkeleton Component
 */
const WorkerCardSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <Skeleton variant="circular" width={56} height={56} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton width="70%" />
          <Skeleton width="50%" />
        </Box>
        <Skeleton variant="circular" width={44} height={44} />
      </Stack>
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Box sx={{ my: 1.5 }}>
        <Stack direction="row" spacing={0.5}>
          <Skeleton variant="rounded" width={80} height={22} />
          <Skeleton variant="rounded" width={80} height={22} />
          <Skeleton variant="rounded" width={80} height={22} />
        </Stack>
      </Box>
      <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
    </CardContent>
  </Card>
);

export default WorkerCardSkeleton;
