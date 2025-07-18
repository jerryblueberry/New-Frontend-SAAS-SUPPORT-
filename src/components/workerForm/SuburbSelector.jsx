import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Popper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Button,
  Divider,
  Fade,
  Paper,
  useTheme,
  alpha,
  ClickAwayListener,
  Skeleton,
  Collapse,
  Tooltip,
  Stack,
  useMediaQuery,
  InputBase
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Place as PlaceIcon,
  Add as AddIcon,
  MyLocation as MyLocationIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  KeyboardArrowDown as ArrowDownIcon,
  TravelExplore as ExploreIcon,
  Room as RoomIcon
} from '@mui/icons-material';
import suburbs from '../../data/wa_suburbs.json';

const SuburbSelector = ({ 
  suburbInput, 
  setSuburbInput, 
  updateAvailability, 
  errors, 
  setErrors
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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
  const listRef = useRef(null);

  // Debounced search for better performance
  const debounceSearch = useCallback((value) => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (!value || value.trim() === '') {
        setFilteredSuburbs(suburbs);
      } else {
        const filtered = suburbs.filter((suburb) =>
          suburb.place_name.toLowerCase().includes(value.toLowerCase()) ||
          suburb.postcode.toString().includes(value) ||
          suburb.state_name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuburbs(filtered);
      }
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter suburbs with debouncing
  useEffect(() => {
    const cleanup = debounceSearch(suburbInput);
    return cleanup;
  }, [suburbInput, debounceSearch]);

  // Auto-focus custom input when shown
  useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [showCustomInput]);

  const handleSuburbInputChange = (e) => {
    const value = e.target.value;
    setSuburbInput(value);
    setShowCustomInput(false);
    setFocusedIndex(-1);
    
    // Clear errors when user starts typing
    if (errors.suburb) {
      setErrors(prev => ({ ...prev, suburb: null }));
    }
    
    // Open dropdown if there's input
    if (value.length > 0) {
      setDropdownOpen(true);
      setAnchorEl(e.currentTarget);
    } else {
      setDropdownOpen(false);
      setSelectedSuburb(null);
      updateAvailability({ suburb: '' });
    }
  };

  const handleSuburbSelect = (suburbItem) => {
    const fullSuburb = `${suburbItem.place_name}, ${suburbItem.postcode}`;
    setSuburbInput(fullSuburb);
    setSelectedSuburb(suburbItem);
    setDropdownOpen(false);
    setShowCustomInput(false);
    setFocusedIndex(-1);
    updateAvailability({ suburb: fullSuburb });
    setErrors(prev => ({ ...prev, suburb: null }));
    inputRef.current?.blur();
  };

  const handleCustomSuburbAdd = () => {
    if (customSuburb.trim()) {
      setSuburbInput(customSuburb.trim());
      setSelectedSuburb({ place_name: customSuburb.trim(), custom: true });
      setDropdownOpen(false);
      setShowCustomInput(false);
      setCustomSuburb('');
      updateAvailability({ suburb: customSuburb.trim() });
      setErrors(prev => ({ ...prev, suburb: null }));
    }
  };

  const handleClear = () => {
    setSuburbInput('');
    setSelectedSuburb(null);
    setCustomSuburb('');
    setShowCustomInput(false);
    setFocusedIndex(-1);
    updateAvailability({ suburb: '' });
    setDropdownOpen(false);
    setErrors(prev => ({ ...prev, suburb: null }));
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
        } else if (filteredSuburbs.length === 0 && suburbInput.trim()) {
          setShowCustomInput(true);
          setCustomSuburb(suburbInput);
        }
        break;
      case 'Escape':
        setDropdownOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  const hasResults = filteredSuburbs.length > 0;
  const showNoResults = !hasResults && suburbInput.length > 0 && !isLoading;

  return (
    <Grid item xs={12} md={6}>
      <Card 
        elevation={0}
        sx={{
        //   borderRadius: { xs: 3, sm: 4 },
        //   border: errors.suburb ? `2px solid ${theme.palette.error.main}` : '1px solid',
        //   borderColor: errors.suburb ? theme.palette.error.main : alpha(theme.palette.divider, 0.12),
          height: '100%',
        //   background: `linear-gradient(135deg, 
        //     ${alpha(theme.palette.background.paper, 0.95)} 0%, 
        //     ${alpha(theme.palette.background.default, 0.95)} 100%)`,
        //   backdropFilter: 'blur(20px)',
        //   boxShadow: errors.suburb 
        //     ? `0 8px 32px ${alpha(theme.palette.error.main, 0.2)}`
        //     : `0 2px 20px ${alpha(theme.palette.common.black, 0.05)}`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
        //   '&::before': {
        //     content: '""',
        //     position: 'absolute',
        //     top: 0,
        //     left: 0,
        //     right: 0,
        //     height: '3px',
        //     background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        //     opacity: selectedSuburb ? 1 : 0,
        //     transition: 'opacity 0.3s ease'
        //   },
        //   '&:hover': {
        //     boxShadow: `0 8px 40px ${alpha(theme.palette.common.black, 0.1)}`,
        //     transform: 'translateY(-4px)'
        //   }
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
          {/* Enhanced Header */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ 
              bgcolor: selectedSuburb 
                ? alpha(theme.palette.success.main, 0.15)
                : alpha(theme.palette.primary.main, 0.1),
              color: selectedSuburb ? theme.palette.success.main : theme.palette.primary.main,
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              transition: 'all 0.3s ease'
            }}>
              {selectedSuburb ? <CheckCircleIcon /> : <LocationIcon />}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" sx={{ 
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
                color: 'text.primary',
                letterSpacing: '-0.02em'
              }}>
                Your Location
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontSize: { xs: '0.875rem', sm: '0.9rem' },
                fontWeight: 500
              }}>
                {selectedSuburb ? 'Perfect! Location confirmed' : 'Where are you based?'}
              </Typography>
            </Box>
            {selectedSuburb && (
              <Tooltip title="Location confirmed" arrow>
                <CheckCircleIcon 
                  color="success" 
                  sx={{ 
                    fontSize: { xs: 24, sm: 28 },
                    animation: 'fadeIn 0.5s ease-in-out'
                  }} 
                />
              </Tooltip>
            )}
          </Box>

          {/* Enhanced Search Input */}
          <Box position="relative">
            <TextField
              fullWidth
              value={suburbInput}
              onChange={handleSuburbInputChange}
              onFocus={(e) => {
                if (suburbInput.length > 0) {
                  setDropdownOpen(true);
                  setAnchorEl(e.currentTarget);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search suburb, city or post code"
              inputRef={inputRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon 
                      color="action" 
                      sx={{ 
                        fontSize: { xs: 20, sm: 24 },
                        color: dropdownOpen ? theme.palette.primary.main : 'action.active'
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
                      {suburbInput && (
                        <Tooltip title="Clear search" arrow>
                          <IconButton
                            aria-label="Clear suburb input"
                            onClick={handleClear}
                            edge="end"
                            size="small"
                            sx={{
                                
                              color: 'text.secondary',
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                color: 'error.main',
                                backgroundColor: alpha(theme.palette.error.main, 0.1)
                              }
                            }}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </InputAdornment>
                )
              }}
              error={Boolean(errors.suburb)}
              helperText={errors.suburb}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: 3, sm: 4 },
                  background: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(10px)',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 500,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.divider, 0.2),
                    borderWidth: '1px'
                  },
                  '&:hover': {
                    background: alpha(theme.palette.background.paper, 0.95),
                    transform: 'translateY(-1px)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px'
                    }
                  },
                  '&.Mui-focused': {
                    background: alpha(theme.palette.background.paper, 1),
                    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px'
                    }
                  }
                },
                '& .MuiInputBase-input': {
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 500,
                  '&::placeholder': {
                    color: alpha(theme.palette.text.secondary, 0.7),
                    opacity: 1
                  }
                }
              }}
            />

            {/* Enhanced Dropdown */}
            <Popper
              open={dropdownOpen}
              anchorEl={anchorEl}
              placement="bottom-start"
              transition
              sx={{
                zIndex: 1300,
                width: { xs: '95vw', sm: anchorEl?.offsetWidth || 400 },
                minWidth: { xs: 260, sm: 320 },
                maxWidth: { xs: '95vw', sm: 700 },
                mx: { xs: 'auto', sm: 0 },
                left: { xs: '50%', sm: 'auto' },
                transform: { xs: 'translateX(-50%)', sm: 'none' },
                p: { xs: 0.5, sm: 0 },
                boxShadow: { xs: 8, sm: 12 },
              }}
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={300}>
                  <Paper
                    elevation={12}
                    sx={{
                      width: 1, // 100% of Popper
                      minWidth: { xs: 260, sm: 320 },
                      maxWidth: { xs: '95vw', sm: 700 },
                      borderRadius: { xs: 2, sm: 4 },
                      background: alpha(theme.palette.background.paper, 0.95),
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      mt: 1,
                      maxHeight: { xs: 350, sm: 450 },
                      overflow: 'hidden',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`
                      }
                    }}
                  >
                    <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
                      <Box>
                        {/* Results Header */}
                        <Box sx={{ 
                           
                          p: { xs: 2, sm: 2.5 },
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          background: alpha(theme.palette.primary.main, 0.02)
                        }}>
                          <Typography variant="subtitle2" color="primary" fontWeight={600}>
                            <ExploreIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            {isLoading ? 'Searching...' : 
                             hasResults ? `${filteredSuburbs.length} location${filteredSuburbs.length !== 1 ? 's' : ''} found` :
                             'Search results'}
                          </Typography>
                        </Box>

                        <List 
                          ref={listRef}
                          dense={isMobile}
                          disablePadding 
                          sx={{ 
                            
                          
                            maxHeight: { xs: 280, sm: 350 },
                            overflowY: 'auto',
                            py: 1,
                            '&::-webkit-scrollbar': {
                              width: 8
                            },
                            '&::-webkit-scrollbar-track': {
                              background: alpha(theme.palette.grey[300], 0.2),
                              borderRadius: 4
                            },
                            '&::-webkit-scrollbar-thumb': {
                              background: alpha(theme.palette.primary.main, 0.3),
                              borderRadius: 4,
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.5)
                              }
                            }
                          }}
                        >
                          {/* Loading State */}
                          {isLoading && (
                            <Box p={2}>
                              {[...Array(3)].map((_, i) => (
                                <Box key={i} display="flex" alignItems="center" gap={2} mb={2}>
                                  <Skeleton variant="circular" width={40} height={40} />
                                  <Box flex={1}>
                                    <Skeleton variant="text" width="80%" height={20} />
                                    <Skeleton variant="text" width="60%" height={16} />
                                  </Box>
                                  <Skeleton variant="rectangular" width={50} height={24} sx={{ borderRadius: 2 }} />
                                </Box>
                              ))}
                            </Box>
                          )}

                          {/* Results */}
                          {!isLoading && hasResults && (
                            <>
                              {filteredSuburbs.slice(0, 8).map((suburbItem, idx) => {
                                const isSelected = selectedSuburb?.place_name === suburbItem.place_name;
                                const isFocused = idx === focusedIndex;
                                
                                return (
                                  <ListItem
                                    key={`${suburbItem.place_name}-${suburbItem.postcode}`}
                                    button
                                    onClick={() => handleSuburbSelect(suburbItem)}
                                    sx={{
                                       
                                      px: { xs: 2, sm: 2.5 },
                                      py: { xs: 1.5, sm: 2 },
                                      mx: 1,
                                      mb: 0.5,
                                      borderRadius: 3,
                                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                      background: isFocused 
                                        ? alpha(theme.palette.primary.main, 0.08)
                                        : 'transparent',
                                      border: isFocused 
                                        ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                        : '1px solid transparent',
                                      '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                                        transform: 'translateX(4px)',
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                                        
                                    },
                                   
                                    
                                    }}
                                  >
                                    <ListItemIcon sx={{ minWidth: { xs: 36, sm: 44 } }}>
                                      <RoomIcon 
                                        sx={{
                                          color: isFocused ? theme.palette.primary.main : 'action.active',
                                          fontSize: { xs: 19, sm: 20,lg:22 }
                                        }} 
                                      />
                                    </ListItemIcon>
                                    {/* Enhanced layout for name and postcode */}
                                    <Box sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      width: '100%',
                                      gap: 1
                                    }}>
                                      <Box sx={{
                                        flex: 1,
                                        minWidth: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                      }}>
                                        <Typography 
                                          variant="subtitle1" 
                                          fontWeight={600}
                                          noWrap
                                          sx={{
                                            fontSize: { xs: '0.9rem', sm: '1rem' },
                                            color: isFocused ? theme.palette.primary.main : 'text.primary',
                                            maxWidth: { xs: '80vw', sm: 320 },
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                          }}
                                          title={suburbItem.place_name}
                                        >
                                          {suburbItem.place_name}
                                        </Typography>
                                        <Typography 
                                          variant="body2" 
                                          color="text.secondary"
                                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                          {suburbItem.state_name}
                                        </Typography>
                                      </Box>
                                      <Chip
                                        label={suburbItem.postcode}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                                          color: theme.palette.primary.main,
                                          fontWeight: 600,
                                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                          borderColor: alpha(theme.palette.primary.main, 0.2),
                                          ml: 1,
                                          flexShrink: 0,
                                          '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.12)
                                          }
                                        }}
                                        aria-label={`Postcode ${suburbItem.postcode}`}
                                      />
                                    </Box>
                                  </ListItem>
                                );
                              })}
                              
                              {filteredSuburbs.length > 8 && (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                  <Typography variant="caption" color="text.secondary">
                                    +{filteredSuburbs.length - 8} more results. Keep typing to narrow down.
                                  </Typography>
                                </Box>
                              )}
                            </>
                          )}

                          {/* No Results */}
                          {showNoResults && (
                            <>
                              <ListItem sx={{ py: 4, flexDirection: 'column', alignItems: 'center' }}>
                                <WarningIcon 
                                  sx={{ 
                                    fontSize: { xs: 48, sm: 56 }, 
                                    mb: 2,
                                    color: alpha(theme.palette.warning.main, 0.7)
                                  }} 
                                />
                                <Typography 
                                  variant="h6" 
                                  color="text.secondary" 
                                  fontWeight={600} 
                                  gutterBottom
                                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                                >
                                  No results found
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  textAlign="center" 
                                  mb={2}
                                  sx={{ 
                                    maxWidth: 280,
                                    fontSize: { xs: '0.875rem', sm: '0.9rem' }
                                  }}
                                >
                                  We couldn't find "{suburbInput}" in our location database
                                </Typography>
                              </ListItem>
                              
                              <Divider sx={{ mx: 2, mb: 1 }} />
                              
                              {/* Enhanced Custom Suburb Option */}
                              <Collapse in={showCustomInput}>
                                <ListItem sx={{ 
                                  px: { xs: 2, sm: 2.5 }, 
                                  py: 2, 
                                  flexDirection: 'column', 
                                  alignItems: 'stretch',
                                  background: alpha(theme.palette.info.main, 0.02)
                                }}>
                                  <Typography variant="subtitle2" color="primary" gutterBottom fontWeight={600}>
                                    <AddIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
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
                                          borderRadius: 2,
                                          background: alpha(theme.palette.background.paper, 0.8)
                                        }
                                      }}
                                    />
                                    <Tooltip title="Add location" arrow>
                                      <IconButton
                                        onClick={handleCustomSuburbAdd}
                                        disabled={!customSuburb.trim()}
                                        color="primary"
                                        sx={{
                                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                                          '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.2)
                                          },
                                          '&:disabled': {
                                            bgcolor: alpha(theme.palette.action.disabled, 0.05)
                                          }
                                        }}
                                      >
                                        <AddIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </ListItem>
                              </Collapse>
                              
                              {!showCustomInput && (
                                <ListItem
                                  button
                                  onClick={() => {
                                    setShowCustomInput(true);
                                    setCustomSuburb(suburbInput);
                                  }}
                                  sx={{
                                    width: { xs: '100%', sm: 'auto' },
                                    maxWidth: { xs: '100%', sm: '23.9vw', lg: '23.9vw' },
                                    px: { xs: 3, sm: 2.5, lg: 3.5 }, // more horizontal padding on xs
                                    py: { xs: 2.5, sm: 2, md: 1 },   // more vertical padding on xs
                                    mx: { xs: 0, sm: 1 },
                                    my: { xs: 1, sm: 0.5 },           // vertical margin for xs
                                    mb: 1,
                                    borderRadius: 3,
                                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                                    background: alpha(theme.palette.primary.main, 0.02),
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                                      borderColor: alpha(theme.palette.primary.main, 0.5),
                                      transform: 'translateY(-1px)'
                                    },
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: { xs: 32, sm: 44, lg: 54 } }}>
                                    <AddIcon color="primary" sx={{ fontSize: { xs: 22, sm: 24, lg: 26 } }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Typography variant="subtitle1" color="primary" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.05rem' } }}>
                                        Add as custom location
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '0.95rem' } }}>
                                        Use this location anyway
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              )}
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

          {/* Enhanced Footer */}
          
        </CardContent>
      </Card>
    </Grid>
  );
};

export default SuburbSelector