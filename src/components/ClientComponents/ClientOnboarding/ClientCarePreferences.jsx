import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react'
import { 
  Box, Grid, TextField, MenuItem, Button, Divider, Stack, Typography, 
  LinearProgress, Snackbar, Alert, Paper, Accordion, AccordionSummary, 
  AccordionDetails, Checkbox, FormControlLabel, Chip, InputAdornment,
  IconButton, Popper, List, ListItem, ListItemIcon, ListItemText,
  Fade, ClickAwayListener, Skeleton, Collapse, Tooltip, alpha, useTheme,
  CircularProgress
} from '@mui/material'
import { 
  ExpandMore, Search as SearchIcon, Clear as ClearIcon, Add as AddIcon,
  Warning as WarningIcon, CheckCircle as CheckCircleIcon, 
  TravelExplore as ExploreIcon, Room as RoomIcon, Close as CloseIcon
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useClientProfileQuery, useUpsertClientStepMutation, useClientOnboarding } from '../../../stores/useClientOnboardingStore'
import suburbs from '../../../data/wa_suburbs.json'

const SUPPORT_CATEGORIES = ['core_supports', 'capacity_building', 'capital_supports', 'support_coordination', 'community_participation']
const PREFERRED_WORKER_GENDER = ['any', 'male', 'female', 'non-binary']
const PREFERRED_AGE_GROUP = ['any', '18-25', '26-40', '41-60', '60+']
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const TIME_SLOTS = ['morning', 'afternoon', 'evening']
const CONTACT_METHODS = ['email', 'phone', 'sms']

// Dietary Restrictions Options
// Used for matching workers with relevant dietary knowledge and meal planning
const DIETARY_RESTRICTIONS = [
  'vegetarian',
  'vegan',
  'halal',
  'kosher',
  'gluten_free',
  'dairy_free',
  'diabetic',
  'low_sodium',
  'no_seafood',
  'allergies',
  'other'
]

// Common Experience Areas for Workers
const COMMON_EXPERIENCE_AREAS = [
  'Disability Support',
  'Aged Care',
  'Mental Health Support',
  'Autism Spectrum Disorder',
  'Down Syndrome',
  'Intellectual Disability',
  'Physical Disability',
  'Cerebral Palsy',
  'Multiple Sclerosis',
  'Spinal Cord Injury',
  'Brain Injury',
  'Dementia Care',
  'Alzheimer\'s Care',
  'Palliative Care',
  'Respite Care',
  'Community Access',
  'Social Skills Development',
  'Personal Care',
  'Domestic Assistance',
  'Meal Preparation',
  'Medication Administration',
  'Transport Support',
  'Behavioral Support',
  'Communication Support',
  'Child Support',
  'Youth Support',
  'Family Support',
  'Crisis Intervention',
  'Trauma-Informed Care'
]

// Multi-Select Experience Areas Component
const MultiExperienceAreaSelector = ({ value = [], onChange, error }) => {
  const theme = useTheme()
  const [inputValue, setInputValue] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [filteredAreas, setFilteredAreas] = useState(COMMON_EXPERIENCE_AREAS)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  const inputRef = useRef(null)
  
  const selectedAreas = Array.isArray(value) ? value : []
  
  // Filter experience areas based on input
  useEffect(() => {
    if (!inputValue || inputValue.trim() === '') {
      setFilteredAreas(COMMON_EXPERIENCE_AREAS)
    } else {
      const filtered = COMMON_EXPERIENCE_AREAS.filter(area =>
        area.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredAreas(filtered)
    }
  }, [inputValue])
  
  const isAreaSelected = (area) => {
    return selectedAreas.some(selected => 
      selected.toLowerCase() === area.toLowerCase()
    )
  }
  
  const handleAddArea = (area) => {
    if (!isAreaSelected(area)) {
      onChange([...selectedAreas, area])
      setInputValue('')
      setDropdownOpen(false)
      setFocusedIndex(-1)
      inputRef.current?.blur()
    }
  }
  
  const handleRemoveArea = (areaToRemove) => {
    onChange(selectedAreas.filter(area => area !== areaToRemove))
  }
  
  const handleAddCustom = () => {
    const customArea = inputValue.trim()
    if (customArea && !isAreaSelected(customArea)) {
      onChange([...selectedAreas, customArea])
      setInputValue('')
      setDropdownOpen(false)
      inputRef.current?.blur()
    }
  }
  
  const handleKeyDown = (e) => {
    if (!dropdownOpen) {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault()
        handleAddCustom()
      }
      return
    }
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => prev < filteredAreas.length - 1 ? prev + 1 : prev)
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && focusedIndex < filteredAreas.length) {
          handleAddArea(filteredAreas[focusedIndex])
        } else if (inputValue.trim()) {
          handleAddCustom()
        }
        break
      case 'Escape':
        setDropdownOpen(false)
        setFocusedIndex(-1)
        break
    }
  }
  
  const hasCustomOption = inputValue.trim() && 
    !filteredAreas.some(area => area.toLowerCase() === inputValue.trim().toLowerCase()) &&
    !isAreaSelected(inputValue.trim())
  
  return (
    <Box>
      {/* Selected Experience Areas Chips */}
      {selectedAreas.length > 0 && (
        <Paper 
          variant="outlined" 
          sx={{ 
            mb: 2, 
            p: 1.5, 
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            borderColor: alpha(theme.palette.primary.main, 0.2)
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 18 }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              Selected Experience Areas ({selectedAreas.length})
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedAreas.map((area, index) => (
              <Chip
                key={index}
                label={area}
                onDelete={() => handleRemoveArea(area)}
                deleteIcon={<CloseIcon />}
                color="primary"
                variant="filled"
                sx={{
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '& .MuiChip-deleteIcon': {
                    fontSize: 16,
                    color: 'inherit',
                    '&:hover': {
                      color: 'error.main'
                    }
                  }
                }}
              />
            ))}
          </Box>
        </Paper>
      )}
      
      {/* Input Field */}
      <TextField
        fullWidth
        size="small"
        placeholder={selectedAreas.length > 0 
          ? "Search or add more experience areas..." 
          : "Search or type to add experience areas (e.g., Disability Support, Mental Health)"}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setFocusedIndex(-1)
          if (e.target.value.length > 0) {
            setDropdownOpen(true)
            setAnchorEl(e.currentTarget)
          } else {
            setDropdownOpen(false)
          }
        }}
        onFocus={(e) => {
          setDropdownOpen(true)
          setAnchorEl(e.currentTarget)
        }}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        error={Boolean(error)}
        helperText={error || (selectedAreas.length === 0 && 'Add at least one experience area to help match you with the right workers')}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon 
                sx={{ 
                  fontSize: 20,
                  color: dropdownOpen ? theme.palette.primary.main : 'action.active',
                  transition: 'color 0.2s ease'
                }} 
              />
            </InputAdornment>
          ),
          endAdornment: inputValue && (
            <InputAdornment position="end">
              <Stack direction="row" spacing={0.5}>
                {hasCustomOption && (
                  <Tooltip title="Press Enter or click to add" arrow placement="top">
                    <IconButton
                      size="small"
                      onClick={handleAddCustom}
                      sx={{
                        color: 'primary.main',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.2)
                        }
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton
                  size="small"
                  onClick={() => {
                    setInputValue('')
                    setDropdownOpen(false)
                    inputRef.current?.focus()
                  }}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'error.main',
                      bgcolor: alpha(theme.palette.error.main, 0.1)
                    }
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Stack>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
                borderWidth: 1.5
              }
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2
              },
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`
            }
          }
        }}
      />
      
      {/* Dropdown Suggestions */}
      <Popper
        open={dropdownOpen}
        anchorEl={anchorEl}
        placement="bottom-start"
        transition
        sx={{
          zIndex: 1300,
          width: anchorEl?.offsetWidth || '100%',
          minWidth: 400,
          maxWidth: 700,
          mt: 0.5
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={12}
              sx={{
                width: '100%',
                borderRadius: 2,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                maxHeight: 400,
                overflow: 'hidden',
                boxShadow: `0 12px 48px ${alpha(theme.palette.common.black, 0.15)}`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.light})`
                }
              }}
            >
              <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
                <Box>
                  {/* Enhanced Header */}
                  <Box sx={{ 
                    p: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
                  }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <ExploreIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600} color="primary">
                          {inputValue.trim() 
                            ? `Searching for "${inputValue.trim()}"`
                            : 'Browse Experience Areas'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {filteredAreas.length > 0 
                            ? `${filteredAreas.length} suggestion${filteredAreas.length !== 1 ? 's' : ''} available. Click to add or type custom.`
                            : 'No matches found. Type and press Enter to add custom.'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Box sx={{ 
                    maxHeight: 320,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: 10 },
                    '&::-webkit-scrollbar-track': {
                      background: alpha(theme.palette.grey[200], 0.5),
                      borderRadius: 5
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: alpha(theme.palette.primary.main, 0.3),
                      borderRadius: 5,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.5)
                      }
                    }
                  }}>
                    {/* Suggested Areas */}
                    {filteredAreas.length > 0 && (
                      <Box sx={{ py: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            px: 2, 
                            py: 1, 
                            display: 'block',
                            fontWeight: 600,
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            fontSize: '0.7rem'
                          }}
                        >
                          Common Experience Areas
                        </Typography>
                        {filteredAreas.map((area, idx) => {
                          const isFocused = idx === focusedIndex
                          const isSelected = isAreaSelected(area)
                          
                          return (
                            <ListItem
                              key={area}
                              button
                              onClick={() => !isSelected && handleAddArea(area)}
                              disabled={isSelected}
                              sx={{
                                px: 2.5,
                                py: 1.5,
                                mx: 1,
                                mb: 0.5,
                                borderRadius: 2,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: isFocused 
                                  ? alpha(theme.palette.primary.main, 0.1)
                                  : isSelected
                                  ? alpha(theme.palette.success.main, 0.08)
                                  : 'transparent',
                                border: isFocused || isSelected
                                  ? `2px solid ${isSelected ? theme.palette.success.main : theme.palette.primary.main}`
                                  : '2px solid transparent',
                                opacity: isSelected ? 0.7 : 1,
                                '&:hover': !isSelected && {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                  transform: 'translateX(4px)',
                                  borderColor: alpha(theme.palette.primary.main, 0.3)
                                },
                                '&.Mui-disabled': {
                                  opacity: 0.5
                                }
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 44 }}>
                                {isSelected ? (
                                  <CheckCircleIcon 
                                    sx={{ 
                                      color: 'success.main', 
                                      fontSize: 22,
                                      animation: 'pulse 0.3s ease'
                                    }} 
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      bgcolor: isFocused 
                                        ? theme.palette.primary.main 
                                        : alpha(theme.palette.primary.main, 0.3),
                                      transition: 'all 0.2s ease',
                                      border: `2px solid ${isFocused ? theme.palette.primary.main : 'transparent'}`
                                    }}
                                  />
                                )}
                              </ListItemIcon>
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  fontWeight={isFocused || isSelected ? 600 : 500}
                                  sx={{
                                    color: isSelected ? 'success.main' : 'text.primary',
                                    textDecoration: isSelected ? 'none' : 'none'
                                  }}
                                >
                                  {area}
                                </Typography>
                                {isSelected && (
                                  <Typography variant="caption" color="success.main" sx={{ fontSize: '0.7rem' }}>
                                    Already added
                                  </Typography>
                                )}
                              </Box>
                              {!isSelected && (
                                <Chip
                                  label="Add"
                                  size="small"
                                  sx={{
                                    height: 24,
                                    fontSize: '0.7rem',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.2)
                                    }
                                  }}
                                />
                              )}
                            </ListItem>
                          )
                        })}
                      </Box>
                    )}
                    
                    {/* Custom Add Option - Enhanced */}
                    {hasCustomOption && (
                      <>
                        <Divider sx={{ mx: 2, my: 1 }} />
                        <Box sx={{ px: 2, pb: 2 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: theme.palette.primary.main,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                              }
                            }}
                          >
                            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                              <Box
                                sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <AddIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600} color="primary">
                                  Add Custom Experience Area
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  "{inputValue.trim()}"
                                </Typography>
                              </Box>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={handleAddCustom}
                                sx={{
                                  textTransform: 'none',
                                  borderRadius: 1.5,
                                  px: 2,
                                  fontWeight: 600,
                                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                                }}
                              >
                                Add This Area
                              </Button>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                or press <Chip label="Enter" size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                              </Typography>
                            </Stack>
                          </Paper>
                        </Box>
                      </>
                    )}
                    
                    {/* Empty State */}
                    {filteredAreas.length === 0 && !hasCustomOption && inputValue.trim() && (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <WarningIcon 
                          sx={{ 
                            fontSize: 56, 
                            mb: 2,
                            color: alpha(theme.palette.warning.main, 0.6)
                          }} 
                        />
                        <Typography variant="h6" color="text.secondary" fontWeight={600} gutterBottom>
                          No matches found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 300, mx: 'auto' }}>
                          We couldn't find "{inputValue.trim()}" in common experience areas.
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleAddCustom}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2
                            }
                          }}
                        >
                          Add as Custom Area
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  )
}

// Multi-Select Location Selector Component
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
  
  // Convert selected regions to display format
  const selectedRegions = Array.isArray(value) ? value : []
  
  // Check if location is already selected
  const isLocationSelected = (location) => {
    return selectedRegions.some(region => {
      if (typeof location === 'object') {
        const locationStr = `${location.place_name}, ${location.postcode}`
        return region === locationStr || region === location.place_name
      }
      return region === location || region === `${location}`
    })
  }
  
  // Debounced search
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
              deleteIcon={<CloseIcon />}
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

export default function ClientCarePreferences() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data: profile } = useClientProfileQuery()
  const upsert = useUpsertClientStepMutation()
  const store = useClientOnboarding()
  const [snack, setSnack] = React.useState({ open: false, message: '', severity: 'success' })
  const [isSaving, setIsSaving] = useState(false)
  
  const isStepComplete = profile?.profileCompleteness?.completedSteps?.preferences
  const isProfileComplete = profile?.profileCompleteness?.percentage === 100

  const defaultValues = useMemo(() => ({
    supportCategories: profile?.preferences?.supportCategories || [],
    serviceRegions: profile?.preferences?.serviceRegions || [],
    specialRequirements: profile?.preferences?.specialRequirements || '',
    communicationPreferences: {
      preferredContactMethod: profile?.preferences?.communicationPreferences?.preferredContactMethod || '',
      language: profile?.preferences?.communicationPreferences?.language || '',
      requireInterpreter: profile?.preferences?.communicationPreferences?.requireInterpreter || false,
      communicationNotes: profile?.preferences?.communicationPreferences?.communicationNotes || '',
    },
    workerPreferences: {
      preferredGender: profile?.preferences?.workerPreferences?.preferredGender || 'any',
      preferredAgeGroup: profile?.preferences?.workerPreferences?.preferredAgeGroup || 'any',
      preferredExperienceAreas: profile?.preferences?.workerPreferences?.preferredExperienceAreas || [],
      notes: profile?.preferences?.workerPreferences?.notes || '',
    },
    availability: profile?.preferences?.availability || [],
    culturalPreferences: {
      dietaryRequirements: {
        restrictions: profile?.preferences?.culturalPreferences?.dietaryRequirements?.restrictions || [],
        allergyDetails: profile?.preferences?.culturalPreferences?.dietaryRequirements?.allergyDetails || '',
        notes: profile?.preferences?.culturalPreferences?.dietaryRequirements?.notes || '',
      },
      religiousConsiderations: {
        faith: profile?.preferences?.culturalPreferences?.religiousConsiderations?.faith || '',
        observances: profile?.preferences?.culturalPreferences?.religiousConsiderations?.observances || [],
        genderSensitivity: profile?.preferences?.culturalPreferences?.religiousConsiderations?.genderSensitivity || false,
        notes: profile?.preferences?.culturalPreferences?.religiousConsiderations?.notes || '',
      },
      lifestyleNotes: {
        habits: profile?.preferences?.culturalPreferences?.lifestyleNotes?.habits || [],
        interests: profile?.preferences?.culturalPreferences?.lifestyleNotes?.interests || [],
        values: profile?.preferences?.culturalPreferences?.lifestyleNotes?.values || [],
        notes: profile?.preferences?.culturalPreferences?.lifestyleNotes?.notes || '',
      },
    },
    serviceDelivery: {
      inPerson: profile?.preferences?.serviceDelivery?.inPerson ?? true,
      remote: profile?.preferences?.serviceDelivery?.remote ?? false,
      preferredStartDate: profile?.preferences?.serviceDelivery?.preferredStartDate || '',
      sessionDurationMins: profile?.preferences?.serviceDelivery?.sessionDurationMins || 60,
    },
  }), [profile])

  const { register, handleSubmit, control, watch, reset } = useForm({ defaultValues })

  useEffect(() => {
    if (profile?.preferences) reset(defaultValues)
  }, [profile, reset, defaultValues])

  const localPct = useMemo(() => {
    const vals = watch()
    let done = 0
    let total = 3 // supportCategories, serviceRegions, availability
    if (Array.isArray(vals.supportCategories) && vals.supportCategories.length > 0) done++
    if (Array.isArray(vals.serviceRegions) && vals.serviceRegions.length > 0) done++
    if (Array.isArray(vals.availability) && vals.availability.length > 0) done++
    return Math.round((done / total) * 100)
  }, [watch])

  // Helper function to format validation errors into user-friendly messages
  const formatValidationErrors = (errors) => {
    if (!Array.isArray(errors)) {
      return 'Please fill in all required fields correctly.'
    }

    const errorMap = {
      'supportCategories': 'Support Categories',
      'serviceRegions': 'Service Regions (Locations)',
      'availability': 'Availability'
    }

    const messages = errors.map((error) => {
      const field = error.path?.[error.path.length - 1]
      const fieldName = errorMap[field] || field || 'Field'
      
      if (error.code === 'invalid_type' && error.expected === 'array') {
        return `${fieldName} is required. Please select at least one option.`
      }
      if (error.message) {
        return `${fieldName}: ${error.message}`
      }
      return `${fieldName} is invalid.`
    })

    if (messages.length === 1) {
      return messages[0]
    }
    return `Please complete the following:\n• ${messages.join('\n• ')}`
  }

  // Form submission handler
  // Cleans up empty values and nested objects before sending to backend
  const onSubmit = (values) => {
    setIsSaving(true)
    
    // Ensure required arrays are always arrays (not undefined)
    const sanitizedValues = {
      ...values,
      supportCategories: Array.isArray(values.supportCategories) ? values.supportCategories : [],
      serviceRegions: Array.isArray(values.serviceRegions) ? values.serviceRegions : [],
      availability: Array.isArray(values.availability) ? values.availability : []
    }

    // Helper function to prune empty values and nested empty objects
    const pruneEmptyValues = (obj) => {
      if (!obj || typeof obj !== 'object') return obj
      if (Array.isArray(obj)) {
        const filtered = obj.filter(item => item !== '' && item !== null && item !== undefined)
        return filtered.length > 0 ? filtered : undefined
      }
      const cleaned = {}
      Object.keys(obj).forEach((key) => {
        const value = obj[key]
        if (value === '' || value === null || value === undefined) return
        if (Array.isArray(value) && value.length === 0) return
        if (typeof value === 'object' && !Array.isArray(value)) {
          const nested = pruneEmptyValues(value)
          if (nested && Object.keys(nested).length > 0) {
            cleaned[key] = nested
          }
        } else {
          cleaned[key] = value
        }
      })
      return Object.keys(cleaned).length > 0 ? cleaned : undefined
    }

    // Clean up cultural preferences nested structure
    const cleanedCulturalPreferences = pruneEmptyValues(sanitizedValues.culturalPreferences)
    
    const payload = { 
      preferences: {
        ...sanitizedValues,
        culturalPreferences: cleanedCulturalPreferences
      }
    }
    
    const wasComplete = profile?.profileCompleteness?.percentage === 100
    
    upsert.mutate({ step: 2, payload }, {
      onSuccess: (data) => {
        setIsSaving(false)
        const isStepComplete = data?.profileCompleteness?.completedSteps?.preferences
        const isNowComplete = data?.profileCompleteness?.percentage === 100
        
        // Show appropriate message
        if (isNowComplete && !wasComplete) {
          // First time completion
          setSnack({ 
            open: true, 
            message: 'Onboarding complete! Your profile has been submitted for review. Redirecting to dashboard...', 
            severity: 'success',
            autoHideDuration: 2000
          })
          // Navigate to dashboard on first completion
          setTimeout(() => {
            navigate('/client-dashboard', { replace: true })
          }, 2000)
        } else if (wasComplete) {
          // Already complete, just updating
          setSnack({ 
            open: true, 
            message: 'Preferences updated successfully!', 
            severity: 'success',
            autoHideDuration: 3000
          })
        } else {
          // Partial save
          setSnack({ 
            open: true, 
            message: 'Preferences saved successfully!', 
            severity: 'success',
            autoHideDuration: 3000
          })
        }
      },
      onError: (error) => {
        setIsSaving(false)
        
        // Handle validation errors from backend
        let errorMessage = 'Save failed. Please try again.'
        
        if (error?.response?.data?.errors) {
          // Zod validation errors
          errorMessage = formatValidationErrors(error.response.data.errors)
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error?.message) {
          errorMessage = error.message
        }
        
        setSnack({ 
          open: true, 
          message: errorMessage, 
          severity: 'error',
          autoHideDuration: 6000
        })
      }
    })
  }

  // Helper to add/remove availability entries
  const availability = watch('availability') || []
  const addAvailability = () => {
    const current = watch('availability') || []
    reset({ ...watch(), availability: [...current, { day: '', timeSlots: [] }] })
  }
  const removeAvailability = (index) => {
    const current = watch('availability') || []
    reset({ ...watch(), availability: current.filter((_, i) => i !== index) })
  }

  return (
    <Box 
      component="form" 
      onSubmit={handleSubmit(onSubmit)} 
      noValidate
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', md: '1200px', lg: '1400px' },
        mx: 'auto',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* Progress Header */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: { xs: 2, sm: 3 },
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700} color="primary">
              Step 2: Care Preferences
            </Typography>
            {isStepComplete && (
              <Chip 
                label="Saved" 
                color="success" 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
          <Chip 
            label={`${localPct}% Complete`} 
            size="small" 
            color={localPct === 100 ? 'success' : 'primary'}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={localPct} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: localPct === 100 
                ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
            }
          }} 
        />
      </Paper>
      
      {isProfileComplete && isStepComplete && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          Your preferences data is loaded from the database. You can review and make changes without needing to save to navigate.
        </Alert>
      )}

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {/* Basic Preferences */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: theme.palette.background.paper,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
                borderColor: alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="h6" color="primary" fontWeight={700}>1</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Basic Preferences
              </Typography>
      </Stack>
            
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                  Support Categories *
                </Typography>
          <Controller
            name="supportCategories"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                      size="medium"
                      label="Select support categories"
                      SelectProps={{ 
                        multiple: true, 
                        renderValue: (sel) => sel.join(', ') 
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover': {
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: theme.palette.primary.main,
                            }
                          }
                        }
                      }}
                {...field}
              >
                      {SUPPORT_CATEGORIES.map((v) => (
                        <MenuItem key={v} value={v}>
                          {v.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </MenuItem>
                      ))}
              </TextField>
            )}
          />
        </Grid>
              
        <Grid item xs={12}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Service Regions (Locations) *
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                  Search and select locations where you need service support. You can add multiple locations.
                </Typography>
          <Controller
            name="serviceRegions"
            control={control}
                  render={({ field, fieldState }) => (
                    <MultiLocationSelector
                      value={field.value || []}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
              <TextField
                fullWidth
                  size="medium" 
                  multiline 
                  rows={3} 
                  label="Special Requirements (optional)" 
                  placeholder="Any special requirements or additional information..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        }
                      }
                    }
                  }}
                  {...register('specialRequirements')} 
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Communication Preferences */}
        <Grid item xs={12}>
          <Accordion
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&:before': { display: 'none' },
              '&.Mui-expanded': {
                margin: 0,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`
              }
            }}
          >
            <AccordionSummary 
              expandIcon={
                <ExpandMore sx={{ color: 'primary.main', fontSize: 28 }} />
              }
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                minHeight: 64,
                '&.Mui-expanded': {
                  minHeight: 64,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2" color="info.main" fontWeight={700}>2</Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Communication Preferences
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
              <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                <Grid item xs={12} md={6}>
                  <TextField 
                    select 
                    fullWidth 
                    size="medium" 
                    label="Preferred Contact Method" 
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        }
                      }
                    }}
                    {...register('communicationPreferences.preferredContactMethod')}
                  >
                    {CONTACT_METHODS.map(v => (
                      <MenuItem key={v} value={v}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    size="medium" 
                    label="Language" 
                    placeholder="e.g., English, Spanish, Mandarin"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        }
                      }
                    }}
                    {...register('communicationPreferences.language')} 
          />
        </Grid>
                <Grid item xs={12}>
                  <FormControlLabel 
                    control={<Checkbox {...register('communicationPreferences.requireInterpreter')} />} 
                    label="Require Interpreter" 
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    size="medium" 
                    multiline 
                    rows={3} 
                    label="Communication Notes" 
                    placeholder="Additional communication preferences or requirements..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        }
                      }
                    }}
                    {...register('communicationPreferences.communicationNotes')} 
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Worker Preferences */}
        <Grid item xs={12}>
          <Accordion
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&:before': { display: 'none' },
              '&.Mui-expanded': {
                margin: 0,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`
              }
            }}
          >
            <AccordionSummary 
              expandIcon={
                <ExpandMore sx={{ color: 'primary.main', fontSize: 28 }} />
              }
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                minHeight: 64,
                '&.Mui-expanded': {
                  minHeight: 64,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.secondary?.main || theme.palette.warning.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2" color="secondary.main" fontWeight={700}>3</Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Worker Preferences
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
              <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        <Grid item xs={12} md={6}>
                  <TextField 
                    select 
                    fullWidth 
                    size="medium" 
                    label="Preferred Gender" 
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        }
                      }
                    }}
                    {...register('workerPreferences.preferredGender')}
                  >
                    {PREFERRED_WORKER_GENDER.map(v => (
                      <MenuItem key={v} value={v}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </MenuItem>
                    ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
                  <TextField 
                    select 
                    fullWidth 
                    size="medium" 
                    label="Preferred Age Group" 
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        }
                      }
                    }}
                    {...register('workerPreferences.preferredAgeGroup')}
                  >
                    {PREFERRED_AGE_GROUP.map(v => (
                      <MenuItem key={v} value={v}>
                        {v === 'any' ? 'Any Age' : v === '60+' ? '60+ Years' : `${v} Years`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                    Preferred Experience Areas
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    Select or add experience areas you prefer in support workers. You can add multiple areas.
                  </Typography>
          <Controller
                    name="workerPreferences.preferredExperienceAreas"
                    control={control}
                    render={({ field, fieldState }) => (
                      <MultiExperienceAreaSelector
                        value={field.value || []}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    size="medium" 
                    multiline 
                    rows={3} 
                    label="Worker Preference Notes" 
                    placeholder="Additional notes about worker preferences..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          }
                        }
                      }
                    }}
                    {...register('workerPreferences.notes')} 
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Availability */}
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: theme.palette.background.paper,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
                borderColor: alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              justifyContent="space-between" 
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h6" color="success.main" fontWeight={700}>4</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="text.primary">
                    Availability *
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    When are you available for support services?
                  </Typography>
                </Box>
              </Stack>
              <Button 
                variant="contained"
                size="medium"
                startIcon={<AddIcon />}
                onClick={addAvailability} 
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 600,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                Add Day
              </Button>
            </Stack>
            
            {availability.map((entry, index) => (
              <Paper 
                key={index} 
                elevation={0}
                sx={{ 
                  p: { xs: 2, sm: 2.5 }, 
                  mb: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }}
              >
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between" 
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={1.5}
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip 
                      label={`Day ${index + 1}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      Availability Entry
                    </Typography>
                  </Stack>
                  {availability.length > 1 && (
                    <Button 
                      size="small" 
                      color="error" 
                      variant="outlined"
                      startIcon={<CloseIcon />}
                      onClick={() => removeAvailability(index)} 
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: 1.5,
                        fontWeight: 600
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
                <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                  <Grid item xs={12} md={4}>
                    <Controller
                      name={`availability.${index}.day`}
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          select 
                          fullWidth 
                          size="medium" 
                          label="Day" 
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: theme.palette.primary.main,
                                }
                              }
                            }
                          }}
                          {...field}
                        >
                          {DAYS.map(v => (
                            <MenuItem key={v} value={v}>
                              {v.charAt(0).toUpperCase() + v.slice(1)}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Controller
                      name={`availability.${index}.timeSlots`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          fullWidth
                          size="medium"
                          label="Time Slots"
                          SelectProps={{ 
                            multiple: true, 
                            renderValue: (sel) => sel.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ')
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover': {
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: theme.palette.primary.main,
                                }
                              }
                            }
                          }}
                          {...field}
                        >
                          {TIME_SLOTS.map(v => (
                            <MenuItem key={v} value={v}>
                              {v.charAt(0).toUpperCase() + v.slice(1)}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            
            {availability.length === 0 && (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  px: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.04),
                  border: `2px dashed ${alpha(theme.palette.grey[400], 0.5)}`
                }}
              >
                <RoomIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500} gutterBottom>
                  No availability added yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click "Add Day" above to add your availability
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Cultural Preferences */}
        {/* 
          Enhanced Cultural Preferences Structure:
          - Dietary Requirements: Structured restrictions, allergy details, and notes
          - Religious Considerations: Faith, observances, gender sensitivity, and notes
          - Lifestyle Notes: Habits, interests, values, and general notes
          
          This structure enables better client-worker matching by capturing detailed
          information about dietary needs, religious requirements, and lifestyle preferences.
        */}
        <Grid item xs={12}>
          <Accordion
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&:before': { display: 'none' },
              '&.Mui-expanded': {
                margin: 0,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`
              }
            }}
          >
            <AccordionSummary 
              expandIcon={
                <ExpandMore sx={{ color: 'primary.main', fontSize: 28 }} />
              }
              sx={{
                px: { xs: 2, sm: 3 },
                py: 2,
                minHeight: 64,
                '&.Mui-expanded': {
                  minHeight: 64,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2" color="warning.main" fontWeight={700}>5</Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  Cultural Preferences
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
              <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                {/* Dietary Requirements */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: { xs: 2, sm: 2.5 }, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
                      Dietary Requirements
                    </Typography>
                    <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Select dietary restrictions (optional)
                        </Typography>
                        <Controller
                          name="culturalPreferences.dietaryRequirements.restrictions"
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                size="small"
                              SelectProps={{
                                multiple: true,
                                renderValue: (selected) => selected.map(val => {
                                  const label = val.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                  return label
                                }).join(', ')
                              }}
                {...field}
                              value={field.value || []}
                            >
                              {DIETARY_RESTRICTIONS.map((restriction) => {
                                const label = restriction.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                return (
                                  <MenuItem key={restriction} value={restriction}>
                                    {label}
                                  </MenuItem>
                                )
                              })}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Allergy Details"
                          placeholder="e.g., Peanuts, Shellfish, Dairy"
                          {...register('culturalPreferences.dietaryRequirements.allergyDetails')}
                        />
        </Grid>
        <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          label="Dietary Notes"
                          placeholder="Additional dietary information or preferences"
                          {...register('culturalPreferences.dietaryRequirements.notes')}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Religious Considerations */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: { xs: 2, sm: 2.5 }, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.info.main, 0.02),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
                      Religious Considerations
                    </Typography>
                    <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Faith"
                          placeholder="e.g., Christian, Muslim, Jewish, Hindu, Buddhist"
                          {...register('culturalPreferences.religiousConsiderations.faith')}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...register('culturalPreferences.religiousConsiderations.genderSensitivity')}
                            />
                          }
                          label="Gender Sensitivity Required"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Religious Observances (optional)
                        </Typography>
                        <Controller
                          name="culturalPreferences.religiousConsiderations.observances"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="e.g., Friday prayers, Ramadan, Sabbath"
                              value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                              onChange={(e) => {
                                const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                field.onChange(arr)
                              }}
                              helperText="Separate multiple observances with commas"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          label="Religious Notes"
                          placeholder="Additional religious considerations or requirements"
                          {...register('culturalPreferences.religiousConsiderations.notes')}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Lifestyle Notes */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: { xs: 2, sm: 2.5 }, 
                      borderRadius: 2, 
                      bgcolor: alpha(theme.palette.success.main, 0.02),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>
                      Lifestyle Notes
                    </Typography>
                    <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Habits (optional)
                        </Typography>
                        <Controller
                          name="culturalPreferences.lifestyleNotes.habits"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="e.g., Early riser, Active lifestyle"
                              value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                              onChange={(e) => {
                                const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                field.onChange(arr)
                              }}
                              helperText="Separate with commas"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Interests (optional)
                        </Typography>
                        <Controller
                          name="culturalPreferences.lifestyleNotes.interests"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="e.g., Reading, Gardening, Music"
                              value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                              onChange={(e) => {
                                const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                field.onChange(arr)
                              }}
                              helperText="Separate with commas"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Values (optional)
                        </Typography>
                        <Controller
                          name="culturalPreferences.lifestyleNotes.values"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="e.g., Independence, Family time"
                              value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                              onChange={(e) => {
                                const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                field.onChange(arr)
                              }}
                              helperText="Separate with commas"
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          label="Lifestyle Notes"
                          placeholder="General lifestyle notes or preferences"
                          {...register('culturalPreferences.lifestyleNotes.notes')}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Service Delivery - Hidden for now, will be enabled later when needed */}
        {/* 
          Service Delivery Fields Explanation:
          
          1. inPerson/remote: 
             - inPerson: Face-to-face services at client's location
             - remote: Virtual/telehealth services
             - Used for: Matching workers, scheduling, service planning
          
          2. preferredStartDate:
             - When the client wants to begin receiving services
             - Used for: Scheduling first appointments, worker onboarding timeline, 
                         NDIS plan activation coordination
          
          3. sessionDurationMins (default: 60 minutes):
             - Typical length of a support session
             - Used for: 
               * Scheduling appointments (block time slots)
               * Calculating NDIS funding hours
               * Worker scheduling and availability matching
               * Resource planning and service delivery optimization
             - Best practice: Default to 60 minutes (1 hour), but allow flexibility
               for different support types (e.g., 30 min check-ins, 2 hour outings)
        */}
        {/* 
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2" fontWeight={600}>Service Delivery</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel 
                    control={<Checkbox {...register('serviceDelivery.inPerson')} defaultChecked />} 
                    label="In-Person Service" 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel 
                    control={<Checkbox {...register('serviceDelivery.remote')} />} 
                    label="Remote Service" 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    type="date" 
                    label="Preferred Start Date" 
                    InputLabelProps={{ shrink: true }}
                    {...register('serviceDelivery.preferredStartDate')} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    type="number" 
                    label="Session Duration (minutes)" 
                    {...register('serviceDelivery.sessionDurationMins', { valueAsNumber: true })} 
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        */}

        {/* Navigation Buttons */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              mt: { xs: 2, sm: 3 },
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              justifyContent="space-between" 
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={2}
            >
              <Button 
                variant="outlined" 
                onClick={() => store.goPrev()} 
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  minWidth: { xs: '100%', sm: 120 }
                }}
                disabled={upsert.isLoading || isSaving}
              >
                Back
              </Button>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1.5}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <Button 
                  onClick={() => reset(defaultValues)} 
                  variant="text" 
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontWeight: 600,
                    minWidth: { xs: '100%', sm: 100 }
                  }} 
                  disabled={upsert.isLoading || isSaving}
                >
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    minWidth: { xs: '100%', sm: 180 },
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }} 
                  disabled={upsert.isLoading || isSaving}
                  startIcon={
                    (upsert.isLoading || isSaving) ? (
                      <CircularProgress size={18} sx={{ color: 'inherit' }} />
                    ) : null
                  }
                >
                  {(upsert.isLoading || isSaving) 
                    ? 'Saving...' 
                    : localPct === 100 
                      ? 'Save & Complete' 
                      : 'Save & Continue'}
                </Button>
            </Stack>
          </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar 
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
        open={snack.open} 
        autoHideDuration={snack.autoHideDuration || 3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      >
        <Alert 
          onClose={() => setSnack(s => ({ ...s, open: false }))} 
          severity={snack.severity} 
          sx={{ 
            width: '100%',
            whiteSpace: 'pre-line', // Allow line breaks in error messages
            '& .MuiAlert-message': {
              maxWidth: 400
            }
          }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
