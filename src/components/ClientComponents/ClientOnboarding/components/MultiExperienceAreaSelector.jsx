import React, { useState, useRef, useEffect } from 'react'
import {
  Box, TextField, Chip, InputAdornment, IconButton, Popper, List, ListItem,
  ListItemIcon, ListItemText, Fade, ClickAwayListener, Tooltip, alpha, useTheme,
  Typography, Paper, Stack, Button, Divider
} from '@mui/material'
import {
  Search as SearchIcon, Clear as ClearIcon, Add as AddIcon,
  Warning as WarningIcon, CheckCircle as CheckCircleIcon,
  TravelExplore as ExploreIcon
} from '@mui/icons-material'
import { COMMON_EXPERIENCE_AREAS } from '../constants'

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
                deleteIcon={<ClearIcon />}
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
                    
                    {/* Custom Add Option */}
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

export default MultiExperienceAreaSelector

