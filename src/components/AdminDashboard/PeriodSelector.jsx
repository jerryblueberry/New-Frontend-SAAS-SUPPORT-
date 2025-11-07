import React from "react";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { DateRange } from "@mui/icons-material";
import PropTypes from "prop-types";

/**
 * PeriodSelector Component
 * Allows users to select different time periods for data filtering
 * Optimized with React.memo for performance
 */
const PeriodSelector = React.memo(({ period, onChange }) => {
  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '180d', label: 'Last 6 Months' },
    { value: '365d', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel>Time Period</InputLabel>
      <Select
        value={period}
        label="Time Period"
        onChange={(e) => onChange(e.target.value)}
        sx={{ 
          bgcolor: 'background.paper',
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }
        }}
      >
        {periods.map((p) => (
          <MenuItem key={p.value} value={p.value}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DateRange sx={{ fontSize: 16, color: 'text.secondary' }} />
              {p.label}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}, (prevProps, nextProps) => prevProps.period === nextProps.period);

PeriodSelector.displayName = 'PeriodSelector';

PeriodSelector.propTypes = {
  period: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default PeriodSelector;

