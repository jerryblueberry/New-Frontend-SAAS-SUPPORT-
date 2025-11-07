import React from "react";
import { Paper, Stack, Box, Typography, Chip, useTheme, alpha } from "@mui/material";
import { DateRange } from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * MetaInformation Component
 * Displays metadata about data freshness, execution time, and query statistics
 */
const MetaInformation = React.memo(({ meta, executionTime, period }) => {
  const theme = useTheme();

  if (!meta) return null;

  return (
    <Paper sx={{ 
      p: 2, 
      mb: 3, 
      bgcolor: alpha(theme.palette.info.main, 0.05), 
      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` 
    }}>
      <Stack 
        direction="row" 
        spacing={2} 
        flexWrap="wrap" 
        alignItems="center" 
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Data Freshness: {meta.dataFreshness || 'real-time'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mt: 0.5 }}>
            Execution Time: {executionTime || 'N/A'} • 
            Queries: {meta.queriesSucceeded || 0}/{meta.queriesExecuted || 0} succeeded
          </Typography>
        </Box>
        <Chip 
          label={`Period: ${period}`}
          size="small"
          icon={<DateRange />}
          sx={{ fontSize: '0.75rem' }}
        />
      </Stack>
    </Paper>
  );
});

MetaInformation.displayName = 'MetaInformation';

MetaInformation.propTypes = {
  meta: PropTypes.shape({
    dataFreshness: PropTypes.string,
    queriesExecuted: PropTypes.number,
    queriesSucceeded: PropTypes.number
  }),
  executionTime: PropTypes.string,
  period: PropTypes.string.isRequired
};

export default MetaInformation;

