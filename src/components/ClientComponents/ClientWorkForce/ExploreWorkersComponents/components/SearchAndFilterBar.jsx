/**
 * SearchAndFilterBar Component
 * 
 * Production-ready SaaS-level search bar with clean filters and perfect alignment.
 * Optimized for responsive design and user experience.
 */

import React from 'react';
import {
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Collapse,
  Grid,
  Typography,
  Box,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  LocationOn,
  Close,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  Star,
  AttachMoney,
  Schedule
} from '@mui/icons-material';
import { AVAILABLE_SKILLS } from '../utils';

/**
 * SearchAndFilterBar Component
 * 
 * @param {Object} props
 * @param {string} props.searchQuery - Current search query
 * @param {Function} props.onSearchChange - Callback when search changes
 * @param {boolean} props.showFilters - Whether filters are expanded
 * @param {Function} props.onToggleFilters - Callback to toggle filters
 * @param {Object} props.filters - Current filter values
 * @param {Function} props.onFilterChange - Callback when filter changes
 * @param {Function} props.onSkillToggle - Callback when skill is toggled
 * @param {Function} props.onClearFilters - Callback to clear all filters
 * @param {number} props.activeFiltersCount - Number of active filters
 */
const SearchAndFilterBar = ({
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  filters,
  onFilterChange,
  onSkillToggle,
  onClearFilters,
  activeFiltersCount
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: { xs: 2, md: 2.5 },
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      <Stack spacing={1.75}>
        {/* Search and Filter Toggle Row - Clean & Aligned */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          {/* Search Field - Enhanced Design */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search by skills, biography, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 0.5 }}>
                  <Search 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: { xs: 20, sm: 22 }
                    }} 
                  />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange('')}
                    edge="end"
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.08),
                        color: 'error.main'
                      }
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              flex: { sm: 1 },
              '& .MuiOutlinedInput-root': {
                bgcolor: alpha(theme.palette.grey[50], 0.5),
                borderRadius: 1.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: alpha(theme.palette.grey[50], 0.8)
                },
                '&.Mui-focused': {
                  bgcolor: 'background.paper',
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
                }
              },
              '& .MuiOutlinedInput-input': {
                py: 1.25
              }
            }}
          />

          {/* Filter Toggle Button - Clean Design */}
          <Button
            variant="outlined"
            startIcon={<FilterList sx={{ fontSize: 18 }} />}
            endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
            onClick={onToggleFilters}
            sx={{
              minWidth: { xs: '100%', sm: 120 },
              whiteSpace: 'nowrap',
              borderRadius: 1.5,
              borderColor: alpha(theme.palette.divider, 0.8),
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              py: 1.25,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Filters
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
                sx={{ 
                  ml: 1, 
                  height: 20, 
                  minWidth: 20,
                  fontSize: '0.688rem',
                  fontWeight: 600
                }}
              />
            )}
          </Button>

          {/* Sort Dropdown - Cleaner Design */}
          <FormControl 
            size="small" 
            sx={{ 
              minWidth: { xs: '100%', sm: 160 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.grey[50], 0.5),
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: alpha(theme.palette.grey[50], 0.8)
                },
                '&.Mui-focused': {
                  bgcolor: 'background.paper',
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
                }
              }
            }}
          >
            <InputLabel sx={{ fontSize: '0.875rem' }}>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              label="Sort By"
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ ml: 0.5 }}>
                  <Sort sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              }
              sx={{
                py: 1.25,
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  py: 0
                }
              }}
            >
              <MenuItem value="relevance" sx={{ py: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <TrendingUp sx={{ fontSize: 18 }} />
                  <span>Best Match</span>
                </Stack>
              </MenuItem>
              <MenuItem value="rating" sx={{ py: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Star sx={{ fontSize: 18 }} />
                  <span>Highest Rated</span>
                </Stack>
              </MenuItem>
              <MenuItem value="rate" sx={{ py: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <AttachMoney sx={{ fontSize: 18 }} />
                  <span>Hourly Rate</span>
                </Stack>
              </MenuItem>
              <MenuItem value="newest" sx={{ py: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Schedule sx={{ fontSize: 18 }} />
                  <span>Newest First</span>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Expandable Filters Section - Perfectly Aligned */}
        <Collapse in={showFilters}>
          <Box 
            sx={{ 
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`, 
              pt: 2,
              mt: 0.5
            }} 
          />

          <Grid container spacing={{ xs: 2, sm: 2.5 }}>
            {/* Skills Filter - Perfect Alignment */}
            <Grid item xs={12} md={4}>
              <Typography 
                variant="subtitle2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.813rem',
                  mb: 1.25,
                  color: 'text.primary'
                }}
              >
                Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {AVAILABLE_SKILLS.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    size="small"
                    onClick={() => onSkillToggle(skill)}
                    color={filters.skills.includes(skill) ? 'primary' : 'default'}
                    variant={filters.skills.includes(skill) ? 'filled' : 'outlined'}
                    sx={{ 
                      fontSize: '0.75rem',
                      height: 28,
                      fontWeight: filters.skills.includes(skill) ? 600 : 500,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 1
                      }
                    }}
                  />
                ))}
              </Box>
            </Grid>

            {/* Location Filter - Perfect Alignment */}
            <Grid item xs={12} md={4}>
              <Typography 
                variant="subtitle2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.813rem',
                  mb: 1.25,
                  color: 'text.primary'
                }}
              >
                Location
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter suburb or city"
                value={filters.location}
                onChange={(e) => onFilterChange('location', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ ml: 0.5 }}>
                      <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: alpha(theme.palette.grey[50], 0.5),
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.grey[50], 0.8)
                    },
                    '&.Mui-focused': {
                      bgcolor: 'background.paper',
                      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    py: 1.25
                  }
                }}
              />
            </Grid>

            {/* Hourly Rate Filter - Perfect Alignment */}
            <Grid item xs={12} md={4}>
              <Typography 
                variant="subtitle2" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.813rem',
                  mb: 1.25,
                  color: 'text.primary'
                }}
              >
                Max Hourly Rate
              </Typography>
              <Box sx={{ px: 0.5, pt: 0.5 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    mb: 1.5,
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  ${filters.maxHourlyRate}/hr
                </Typography>
                <Slider
                  value={filters.maxHourlyRate}
                  onChange={(e, value) => onFilterChange('maxHourlyRate', value)}
                  min={20}
                  max={100}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${value}`}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 18,
                      height: 18,
                      '&:hover': {
                        boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`
                      }
                    },
                    '& .MuiSlider-track': {
                      height: 4,
                      borderRadius: 2
                    },
                    '& .MuiSlider-rail': {
                      height: 4,
                      borderRadius: 2,
                      opacity: 0.3
                    },
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>

          {/* Clear Filters Button - Clean Design */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                startIcon={<Close sx={{ fontSize: 18 }} />}
                onClick={onClearFilters}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  color: 'text.secondary',
                  borderRadius: 1.5,
                  px: 2,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.08),
                    color: 'error.main'
                  }
                }}
              >
                Clear All Filters
              </Button>
            </Box>
          )}
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default SearchAndFilterBar;
