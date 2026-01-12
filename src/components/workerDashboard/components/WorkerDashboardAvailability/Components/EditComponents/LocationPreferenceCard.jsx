/**
 * LocationPreferenceCard Component
 * 
 * A production-ready, reusable component that handles location/suburb selection
 * for worker availability settings. Extracted from EditAvailabilityDrawer
 * following industry best practices for:
 * - Component separation of concerns
 * - Reusability and maintainability
 * - PropTypes validation
 * - Performance optimization with React.memo and useCallback
 * - Accessibility features
 * - Material-UI design system integration
 * 
 * Features:
 * - Drawer-optimized suburb selector with search, debouncing, and custom location support
 * - Error handling and validation
 * - Loading states and user feedback
 * - Responsive design
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  TextField,
  Stack,
  Typography,
  Box,
  InputAdornment,
  Tooltip,
  IconButton,
  Slider,
  Popper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  ClickAwayListener,
  Paper,
  Fade,
  Collapse,
  Chip,
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import suburbs from '../../../../../../data/wa_suburbs.json';

// Drawer-optimized Suburb Selector Component
const DrawerSuburbSelector = React.memo(function DrawerSuburbSelector({ 
  suburb, 
  onSuburbChange, 
  error, 
  disabled 
}) {
  const theme = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSuburb, setSelectedSuburb] = useState(null);
  const [customSuburb, setCustomSuburb] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [filteredSuburbs, setFilteredSuburbs] = useState(suburbs);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const customInputRef = useRef(null);

  // Debounced search for better performance
  const debounceSearch = useCallback((value) => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (!value || value.trim() === '') {
        setFilteredSuburbs(suburbs);
      } else {
        const filtered = suburbs.filter((suburbItem) =>
          suburbItem.place_name.toLowerCase().includes(value.toLowerCase()) ||
          suburbItem.postcode.toString().includes(value) ||
          suburbItem.state_name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuburbs(filtered);
      }
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter suburbs with debouncing
  useEffect(() => {
    const cleanup = debounceSearch(suburb);
    return cleanup;
  }, [suburb, debounceSearch]);

  const handleSuburbInputChange = (e) => {
    const value = e.target.value;
    onSuburbChange(value);
    setShowCustomInput(false);
    setFocusedIndex(-1);
    
    // Open dropdown if there's input
    if (value.length > 0) {
      setDropdownOpen(true);
      setAnchorEl(e.currentTarget);
    } else {
      setDropdownOpen(false);
      setSelectedSuburb(null);
    }
  };

  const handleSuburbSelect = (suburbItem) => {
    const fullSuburb = `${suburbItem.place_name}, ${suburbItem.postcode}`;
    onSuburbChange(fullSuburb);
    setSelectedSuburb(suburbItem);
    setDropdownOpen(false);
    setShowCustomInput(false);
    setFocusedIndex(-1);
    inputRef.current?.blur();
  };

  const handleCustomSuburbAdd = () => {
    if (customSuburb.trim()) {
      onSuburbChange(customSuburb.trim());
      setSelectedSuburb({ place_name: customSuburb.trim(), custom: true });
      setDropdownOpen(false);
      setShowCustomInput(false);
      setCustomSuburb('');
    }
  };

  const handleClear = () => {
    onSuburbChange('');
    setSelectedSuburb(null);
    setCustomSuburb('');
    setShowCustomInput(false);
    setFocusedIndex(-1);
    setDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!dropdownOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredSuburbs.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredSuburbs.length) {
          handleSuburbSelect(filteredSuburbs[focusedIndex]);
        } else if (filteredSuburbs.length === 0 && suburb.trim()) {
          setShowCustomInput(true);
          setCustomSuburb(suburb);
        }
        break;
      case 'Escape':
        setDropdownOpen(false);
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  };

  const hasResults = filteredSuburbs.length > 0;
  const showNoResults = !hasResults && suburb.length > 0 && !isLoading;

  return (
    <Box position="relative">
      <TextField
        fullWidth
        label="Suburb"
        value={suburb}
        onChange={handleSuburbInputChange}
        onFocus={(e) => {
          if (suburb.length > 0) {
            setDropdownOpen(true);
            setAnchorEl(e.currentTarget);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search suburb, city or postcode"
        inputRef={inputRef}
        disabled={disabled}
        error={!!error}
        helperText={error || 'Enter your preferred work suburb'}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnIcon 
                sx={{ 
                  color: dropdownOpen ? 'primary.main' : 'action.active',
                  fontSize: { xs: 18, sm: 20 }
                }} 
              />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Stack direction="row" spacing={0.5}>
                {isLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderTop: `2px solid ${theme.palette.primary.main}`,
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                  </Box>
                )}
                {suburb && (
                  <Tooltip title="Clear suburb">
                    <IconButton
                      onClick={handleClear}
                      size="small"
                      disabled={disabled}
                      sx={{
                        minWidth: { xs: 32, sm: 36 },
                        minHeight: { xs: 32, sm: 36 },
                        color: 'text.secondary',
                        '&:hover': { 
                          color: 'error.main',
                          bgcolor: alpha(theme.palette.error.main, 0.1)
                        }
                      }}
                    >
                      <CloseIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: { xs: 1.5, sm: 2 },
            transition: 'all 0.2s',
            minHeight: { xs: 40, sm: 44 },
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              }
            }
          },
          '& .MuiInputLabel-root': {
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }
        }}
      />

      {/* Compact Dropdown for Drawer */}
      <Popper
        open={dropdownOpen}
        anchorEl={anchorEl}
        placement="bottom-start"
        transition
        sx={{
          zIndex: 1300,
          width: { xs: '95vw', sm: anchorEl?.offsetWidth || 400 },
          maxWidth: { xs: '95vw', sm: 500 },
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={8}
              sx={{
                borderRadius: 2,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                mt: 0.5,
                maxHeight: 300,
                overflow: 'hidden',
              }}
            >
              <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
                <Box>
                  {/* Compact Results Header */}
                  <Box sx={{ 
                    p: 1.5,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: alpha(theme.palette.primary.main, 0.02)
                  }}>
                    <Typography variant="caption" color="primary" fontWeight={600}>
                      {isLoading ? 'Searching...' : 
                       hasResults ? `${filteredSuburbs.length} locations found` :
                       'Search results'}
                    </Typography>
                  </Box>

                  <List 
                    dense
                    disablePadding 
                    sx={{ 
                      maxHeight: 220,
                      overflowY: 'auto',
                      py: 0.5,
                    }}
                  >
                    {/* Loading State */}
                    {isLoading && (
                      <Box p={1.5}>
                        {[...Array(3)].map((_, i) => (
                          <Box key={i} display="flex" alignItems="center" gap={1.5} mb={1}>
                            <Skeleton variant="circular" width={24} height={24} />
                            <Box flex={1}>
                              <Skeleton variant="text" width="80%" height={16} />
                              <Skeleton variant="text" width="60%" height={12} />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Results */}
                    {!isLoading && hasResults && (
                      <>
                        {filteredSuburbs.slice(0, 6).map((suburbItem, idx) => {
                          const isFocused = idx === focusedIndex;
                          
                          return (
                            <ListItem
                              key={`${suburbItem.place_name}-${suburbItem.postcode}`}
                              button
                              onClick={() => handleSuburbSelect(suburbItem)}
                              sx={{
                                px: 1.5,
                                py: 1,
                                mx: 0.5,
                                mb: 0.25,
                                borderRadius: 1.5,
                                background: isFocused 
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : 'transparent',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.06),
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <LocationOnIcon 
                                  sx={{
                                    color: isFocused ? 'primary.main' : 'action.active',
                                    fontSize: 18
                                  }} 
                                />
                              </ListItemIcon>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={600}
                                  noWrap
                                  sx={{
                                    color: isFocused ? 'primary.main' : 'text.primary',
                                  }}
                                >
                                  {suburbItem.place_name}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  noWrap
                                >
                                  {suburbItem.state_name}
                                </Typography>
                              </Box>
                              <Chip
                                label={suburbItem.postcode}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                                  borderColor: alpha(theme.palette.primary.main, 0.2),
                                }}
                              />
                            </ListItem>
                          );
                        })}
                        
                        {filteredSuburbs.length > 6 && (
                          <Box sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              +{filteredSuburbs.length - 6} more results
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}

                    {/* No Results */}
                    {showNoResults && (
                      <>
                        <ListItem sx={{ py: 2, flexDirection: 'column', alignItems: 'center' }}>
                          <WarningIcon 
                            sx={{ 
                              fontSize: 32, 
                              mb: 1,
                              color: alpha(theme.palette.warning.main, 0.7)
                            }} 
                          />
                          <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            fontWeight={600} 
                            gutterBottom
                          >
                            No results found
                          </Typography>
                        </ListItem>
                        
                        {/* Custom Location Option */}
                        {!showCustomInput && (
                          <ListItem
                            button
                            onClick={() => {
                              setShowCustomInput(true);
                              setCustomSuburb(suburb);
                            }}
                            sx={{
                              px: 1.5,
                              py: 1,
                              mx: 0.5,
                              mb: 0.5,
                              borderRadius: 1.5,
                              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                              background: alpha(theme.palette.primary.main, 0.02),
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <AddIcon color="primary" sx={{ fontSize: 18 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" color="primary" fontWeight={600}>
                                  Add as custom location
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  Use this location anyway
                                </Typography>
                              }
                            />
                          </ListItem>
                        )}

                        {/* Custom Input */}
                        <Collapse in={showCustomInput}>
                          <ListItem sx={{ 
                            px: 1.5, 
                            py: 1, 
                            flexDirection: 'column', 
                            alignItems: 'stretch',
                            background: alpha(theme.palette.info.main, 0.02)
                          }}>
                            <Typography variant="caption" color="primary" gutterBottom fontWeight={600}>
                              Add Custom Location
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center">
                              <TextField
                                fullWidth
                                size="small"
                                value={customSuburb}
                                onChange={(e) => setCustomSuburb(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCustomSuburbAdd();
                                  } else if (e.key === 'Escape') {
                                    setShowCustomInput(false);
                                  }
                                }}
                                placeholder="Enter custom location"
                                inputRef={customInputRef}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    background: theme.palette.background.paper
                                  }
                                }}
                              />
                              <IconButton
                                onClick={handleCustomSuburbAdd}
                                disabled={!customSuburb.trim()}
                                color="primary"
                                size="small"
                                sx={{
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                                  }
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </ListItem>
                        </Collapse>
                      </>
                    )}
                  </List>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
});

// Add PropTypes for DrawerSuburbSelector
DrawerSuburbSelector.propTypes = {
  suburb: PropTypes.string.isRequired,
  onSuburbChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

DrawerSuburbSelector.defaultProps = {
  error: '',
  disabled: false,
};

const LocationPreferenceCard = ({ 
  suburb, 
  onSuburbChange, 
  error, 
  disabled = false 
}) => {
  const theme = useTheme();

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: { xs: 2, sm: 3 },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: alpha(theme.palette.primary.main, 0.3),
        }
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center" sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              borderRadius: { xs: 1.5, sm: 2 },
              p: { xs: 0.8, sm: 1, md: 1.2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: { xs: 32, sm: 36, md: 40 },
              minHeight: { xs: 32, sm: 36, md: 40 }
            }}
          >
            <LocationOnIcon sx={{ 
              color: 'primary.main', 
              fontSize: { xs: 18, sm: 20, md: 24 } 
            }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              fontWeight={700} 
              sx={{
                fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' },
                lineHeight: { xs: 1.2, sm: 1.3 }
              }}
            >
              Location
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{
                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' },
                lineHeight: 1.3,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Set your preferred work location
            </Typography>
          </Box>
        </Stack>

        {/* Enhanced Suburb Selector - Drawer Optimized */}
        <DrawerSuburbSelector
          suburb={suburb}
          onSuburbChange={onSuburbChange}
          error={error}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
};

LocationPreferenceCard.propTypes = {
  suburb: PropTypes.string.isRequired,
  onSuburbChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

LocationPreferenceCard.defaultProps = {
  error: '',
  disabled: false,
};

export default LocationPreferenceCard;
