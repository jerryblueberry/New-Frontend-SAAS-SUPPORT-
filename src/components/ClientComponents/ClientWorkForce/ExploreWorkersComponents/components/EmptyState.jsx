/**
 * EmptyState Component
 * 
 * Displays when no workers are found or available.
 */

import React from 'react';
import { Paper, Typography, Button } from '@mui/material';
import { WorkOutline, Close } from '@mui/icons-material';

/**
 * EmptyState Component
 * 
 * @param {Object} props
 * @param {boolean} props.hasFilters - Whether filters are active
 * @param {Function} props.onClearFilters - Callback to clear filters
 */
const EmptyState = ({ hasFilters, onClearFilters }) => (
  <Paper
    elevation={0}
    sx={{
      p: 6,
      textAlign: 'center',
      border: (theme) => `1px dashed ${theme.palette.divider}`,
      borderRadius: 2
    }}
  >
    <WorkOutline sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
    <Typography variant="h6" gutterBottom>
      {hasFilters ? 'No Workers Found' : 'No Workers Available'}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
      {hasFilters
        ? 'Try adjusting your filters to see more results'
        : 'There are currently no workers available in your area'}
    </Typography>
    {hasFilters && (
      <Button variant="outlined" onClick={onClearFilters} startIcon={<Close />}>
        Clear All Filters
      </Button>
    )}
  </Paper>
);

export default EmptyState;
