import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Box, TextField, Chip, InputAdornment, IconButton, Popper, List, ListItem,
  ListItemIcon, ListItemText, Fade, ClickAwayListener, alpha, useTheme,
  Typography, Paper, Skeleton, Collapse, Divider
} from '@mui/material'
import {
  Search as SearchIcon, Clear as ClearIcon, Add as AddIcon,
  Warning as WarningIcon, CheckCircle as CheckCircleIcon,
  TravelExplore as ExploreIcon, Room as RoomIcon
} from '@mui/icons-material'
import suburbs from '../../../../data/wa_suburbs.json'

const MultiLocationSelector = ({ value = [], onChange, error }) => {
  const theme = useTheme()
  const [searchInput, setSearchInput] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [filteredSuburbs, setFilteredSuburbs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customLocation, setCustomLocation] = useState('')
  
  const inputRef = useRef(null)
  const customInputRef = useRef(null)
  
  const selectedRegions = Array.isArray(value) ? value : []
  
  const isLocationSelected = (location) => {
    return selectedRegions.some(region => {
      if (typeof location === 'object') {
        const locationStr = `${location.place_name}, ${location.postcode}`
        return region === locationStr || region === location.place_name
      }
      return region === location || region === `${location}`
    })
  }
  
  const debounceSearch = useCallback((searchValue) => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      if (!searchValue || searchValue.trim() === '') {
        setFilteredSuburbs(suburbs.slice(0, 10))
      } else {
        const filtered = suburbs.filter((suburb) =>
          suburb.place_name.toLowerCase().includes(searchValue.toLowerCase()) ||
          suburb.postcode.toString().includes(searchValue) ||
          suburb.state_name.toLowerCase().includes(searchValue.toLowerCase())
        ).slice(0, 10)
        setFilteredSuburbs(filtered)
      }
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    const cleanup = debounceSearch(searchInput)
    return cleanup
  }, [searchInput, debounceSearch])
  
  useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      customInputRef.current.focus()
    }
  }, [showCustomInput])
  
  const handleLocationSelect = (location) => {
    const locationStr = typeof location === 'object' 
      ? `${location.place_name}, ${location.postcode}`
      : location
    
    if (!isLocationSelected(location)) {
      onChange([...selectedRegions, locationStr])
    }
    setSearchInput('')
    setDropdownOpen(false)
    setShowCustomInput(false)
    setFocusedIndex(-1)
    inputRef.current?.blur()
  }
  
  const handleRemoveLocation = (locationToRemove) => {
    onChange(selectedRegions.filter(loc => loc !== locationToRemove))
  }
  
  const handleCustomLocationAdd = () => {
    if (customLocation.trim() && !isLocationSelected(customLocation.trim())) {
      onChange([...selectedRegions, customLocation.trim()])
      setCustomLocation('')
      setShowCustomInput(false)
      setSearchInput('')
      setDropdownOpen(false)
    }
  }
  
  const handleKeyDown = (e) => {
    if (!dropdownOpen) return
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => prev < filteredSuburbs.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < filteredSuburbs.length) {
          handleLocationSelect(filteredSuburbs[focusedIndex])
        } else if (filteredSuburbs.length === 0 && searchInput.trim()) {
          setShowCustomInput(true)
          setCustomLocation(searchInput)
        }
        break
      case 'Escape':
        setDropdownOpen(false)
        setFocusedIndex(-1)
        break
    }
  }
  
  const hasResults = filteredSuburbs.length > 0
  const showNoResults = !hasResults && searchInput.length > 0 && !isLoading
  
  return (
    <Box>
      {/* Selected Locations Chips */}
      {selectedRegions.length > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {selectedRegions.map((region, index) => (
            <Chip
              key={index}
              label={region}
              onDelete={() => handleRemoveLocation(region)}
              deleteIcon={<ClearIcon />}
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 500,
                '& .MuiChip-deleteIcon': {
                  fontSize: 18
                }
              }}
            />
          ))}
        </Box>
      )}
      
      {/* Search Input */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search and add locations (suburb, city or postcode)"
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value)
          setShowCustomInput(false)
          setFocusedIndex(-1)
          if (e.target.value.length > 0) {
            setDropdownOpen(true)
            setAnchorEl(e.currentTarget)
          } else {
            setDropdownOpen(false)
          }
        }}
        onFocus={(e) => {
          if (searchInput.length > 0) {
            setDropdownOpen(true)
            setAnchorEl(e.currentTarget)
          }
        }}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        error={Boolean(error)}
        helperText={error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon 
                sx={{ 
                  fontSize: 20,
                  color: dropdownOpen ? theme.palette.primary.main : 'action.active'
                }} 
              />
            </InputAdornment>
          ),
          endAdornment: searchInput && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  setSearchInput('')
                  setDropdownOpen(false)
                  inputRef.current?.focus()
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main
              }
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2
              }
            }
          }
        }}
      />
      
      {/* Dropdown */}
      <Popper
        open={dropdownOpen}
        anchorEl={anchorEl}
        placement="bottom-start"
        transition
        sx={{
          zIndex: 1300,
          width: anchorEl?.offsetWidth || '100%',
          minWidth: 320,
          maxWidth: 700,
          mt: 1
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={300}>
            <Paper
              elevation={8}
              sx={{
                width: '100%',
                borderRadius: 2,
                background: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                maxHeight: 400,
                overflow: 'hidden',
                boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`
              }}
            >
              <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
                <Box>
                  {/* Results Header */}
                  <Box sx={{ 
                    p: 2,
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
                    dense
                    disablePadding
                    sx={{ 
                      maxHeight: 300,
                      overflowY: 'auto',
                      py: 1,
                      '&::-webkit-scrollbar': { width: 8 },
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
                    {!isLoading && hasResults && filteredSuburbs.map((suburbItem, idx) => {
                      const isFocused = idx === focusedIndex
                      const isSelected = isLocationSelected(suburbItem)
                      
                      return (
                        <ListItem
                          key={`${suburbItem.place_name}-${suburbItem.postcode}`}
                          button
                          onClick={() => !isSelected && handleLocationSelect(suburbItem)}
                          disabled={isSelected}
                          sx={{
                            px: 2,
                            py: 1.5,
                            mx: 1,
                            mb: 0.5,
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            background: isFocused 
                              ? alpha(theme.palette.primary.main, 0.08)
                              : isSelected
                              ? alpha(theme.palette.success.main, 0.1)
                              : 'transparent',
                            border: isFocused || isSelected
                              ? `1px solid ${alpha(isSelected ? theme.palette.success.main : theme.palette.primary.main, 0.2)}`
                              : '1px solid transparent',
                            opacity: isSelected ? 0.6 : 1,
                            '&:hover': !isSelected && {
                              backgroundColor: alpha(theme.palette.primary.main, 0.06),
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {isSelected ? (
                              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                            ) : (
                              <RoomIcon sx={{ color: isFocused ? 'primary.main' : 'action.active', fontSize: 20 }} />
                            )}
                          </ListItemIcon>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={600} noWrap>
                              {suburbItem.place_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {suburbItem.state_name}
                            </Typography>
                          </Box>
                          <Chip
                            label={suburbItem.postcode}
                            size="small"
                            variant="outlined"
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: 'primary.main',
                              fontWeight: 600,
                              fontSize: '0.75rem'
                            }}
                          />
                        </ListItem>
                      )
                    })}
                    
                    {/* No Results */}
                    {showNoResults && (
                      <>
                        <ListItem sx={{ py: 4, flexDirection: 'column', alignItems: 'center' }}>
                          <WarningIcon sx={{ fontSize: 48, mb: 2, color: alpha(theme.palette.warning.main, 0.7) }} />
                          <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                            No results found
                          </Typography>
                          <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                            We couldn't find "{searchInput}" in our location database
                          </Typography>
                        </ListItem>
                        
                        <Divider sx={{ mx: 2, mb: 1 }} />
                        
                        <Collapse in={showCustomInput}>
                          <ListItem sx={{ px: 2, py: 2, flexDirection: 'column', alignItems: 'stretch' }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom fontWeight={600}>
                              <AddIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                              Add Custom Location
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center">
                              <TextField
                                fullWidth
                                size="small"
                                value={customLocation}
                                onChange={(e) => setCustomLocation(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleCustomLocationAdd()
                                  } else if (e.key === 'Escape') {
                                    setShowCustomInput(false)
                                  }
                                }}
                                placeholder="Enter custom location"
                                inputRef={customInputRef}
                              />
                              <IconButton
                                onClick={handleCustomLocationAdd}
                                disabled={!customLocation.trim()}
                                color="primary"
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                        </Collapse>
                        
                        {!showCustomInput && (
                          <ListItem
                            button
                            onClick={() => {
                              setShowCustomInput(true)
                              setCustomLocation(searchInput)
                            }}
                            sx={{
                              px: 2,
                              py: 2,
                              mx: 1,
                              mb: 1,
                              borderRadius: 2,
                              border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                              background: alpha(theme.palette.primary.main, 0.02),
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                                borderColor: alpha(theme.palette.primary.main, 0.5)
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              <AddIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" color="primary" fontWeight={600}>
                                  Add as custom location
                                </Typography>
                              }
                              secondary={
                                <Typography variant="body2" color="text.secondary">
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
  )
}

export default MultiLocationSelector

