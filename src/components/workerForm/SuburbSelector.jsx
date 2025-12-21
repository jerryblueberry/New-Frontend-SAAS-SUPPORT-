import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Popper,
  Fade,
  Paper,
  useTheme,
  ClickAwayListener,
  useMediaQuery,
  Button,
  Dialog,
  Slide,
} from '@mui/material';
import { Search, X, MapPin, Plus, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { alpha } from '@mui/material/styles';
import suburbs from '../../data/wa_suburbs.json';

// Slide transition for mobile dialog
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SuburbSelector = ({
  suburbInput,
  setSuburbInput,
  updateAvailability,
  errors,
  setErrors,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSuburb, setSelectedSuburb] = useState(null);
  const [customSuburb, setCustomSuburb] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [filteredSuburbs, setFilteredSuburbs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [mobileSearch, setMobileSearch] = useState('');

  const inputRef = useRef(null);
  const customInputRef = useRef(null);
  const listRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Normalize suburbInput
  const normalizedSuburbInput = useMemo(() => {
    if (typeof suburbInput === 'string') return suburbInput;
    if (suburbInput && typeof suburbInput === 'object') {
      return suburbInput.suburb || suburbInput.place_name || '';
    }
    return '';
  }, [suburbInput]);

  // Sync normalized value
  useEffect(() => {
    if (suburbInput && typeof suburbInput === 'object' && typeof setSuburbInput === 'function') {
      const normalized = suburbInput.suburb || suburbInput.place_name || '';
      if (normalized) setSuburbInput(normalized);
    }
  }, [suburbInput, setSuburbInput]);

  // Sync mobile search with main input when dialog opens
  useEffect(() => {
    if (dropdownOpen && isMobile) {
      setMobileSearch(normalizedSuburbInput);
    }
  }, [dropdownOpen, isMobile, normalizedSuburbInput]);

  // Search term for filtering (mobile uses local state, desktop uses main input)
  const searchTerm = isMobile && dropdownOpen ? mobileSearch : normalizedSuburbInput;

  // Debounced search
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (!searchTerm || searchTerm.trim() === '') {
        setFilteredSuburbs([]);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = suburbs.filter((suburb) =>
          suburb.place_name.toLowerCase().includes(term) ||
          suburb.postcode.toString().includes(searchTerm) ||
          suburb.state_name.toLowerCase().includes(term)
        ).slice(0, 100);
        setFilteredSuburbs(filtered);
      }
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [showCustomInput]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-suburb-item]');
      if (items[focusedIndex]) {
        items[focusedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value || '';
    setSuburbInput(value);
    setShowCustomInput(false);
    setFocusedIndex(-1);
    if (errors?.suburb) setErrors((prev) => ({ ...prev, suburb: null }));
    if (value.length > 0) {
      setDropdownOpen(true);
      setAnchorEl(e.currentTarget);
    } else {
      setDropdownOpen(false);
      setSelectedSuburb(null);
      updateAvailability({ suburb: '' });
    }
  }, [errors?.suburb, setSuburbInput, setErrors, updateAvailability]);

  const handleMobileSearchChange = useCallback((e) => {
    setMobileSearch(e.target.value || '');
    setFocusedIndex(-1);
    setShowCustomInput(false);
  }, []);

  const handleSelect = useCallback((suburbItem) => {
    const fullSuburb = `${suburbItem.place_name}, ${suburbItem.postcode}`;
    setSuburbInput(fullSuburb);
    setSelectedSuburb(suburbItem);
    setDropdownOpen(false);
    setFocusedIndex(-1);
    setMobileSearch('');
    updateAvailability({ suburb: fullSuburb });
    setErrors?.((prev) => ({ ...prev, suburb: null }));
    inputRef.current?.blur();
  }, [setSuburbInput, updateAvailability, setErrors]);

  const handleCustomAdd = useCallback(() => {
    if (customSuburb.trim()) {
      const trimmed = customSuburb.trim();
      setSuburbInput(trimmed);
      setSelectedSuburb({ place_name: trimmed, custom: true });
      setDropdownOpen(false);
      setShowCustomInput(false);
      setCustomSuburb('');
      setMobileSearch('');
      updateAvailability({ suburb: trimmed });
      setErrors?.((prev) => ({ ...prev, suburb: null }));
    }
  }, [customSuburb, setSuburbInput, updateAvailability, setErrors]);

  const handleClear = useCallback(() => {
    setSuburbInput('');
    setSelectedSuburb(null);
    setCustomSuburb('');
    setShowCustomInput(false);
    setFocusedIndex(-1);
    setMobileSearch('');
    updateAvailability({ suburb: '' });
    setDropdownOpen(false);
    setErrors?.((prev) => ({ ...prev, suburb: null }));
    inputRef.current?.focus();
  }, [setSuburbInput, updateAvailability, setErrors]);

  const handleKeyDown = useCallback((e) => {
    if (!dropdownOpen) return;
    const maxIndex = filteredSuburbs.length - 1;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, maxIndex));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredSuburbs.length) {
          handleSelect(filteredSuburbs[focusedIndex]);
        } else if (filteredSuburbs.length === 0 && searchTerm.trim()) {
          setShowCustomInput(true);
          setCustomSuburb(searchTerm);
        }
        break;
      case 'Escape':
        setDropdownOpen(false);
        setFocusedIndex(-1);
        break;
      default:
        break;
    }
  }, [dropdownOpen, filteredSuburbs, focusedIndex, handleSelect, searchTerm]);

  const hasResults = filteredSuburbs.length > 0;
  const showNoResults = !hasResults && searchTerm.length > 0 && !isLoading;

  // Location item component - responsive sizes
  const LocationItem = ({ item, idx }) => {
    const isFocused = idx === focusedIndex;
    return (
      <Box
        data-suburb-item
        onClick={() => handleSelect(item)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.25, sm: 1.5 },
          px: { xs: 1.5, sm: 2 },
          py: { xs: 1.25, sm: 1.5 },
          cursor: 'pointer',
          bgcolor: isFocused ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
          transition: 'background-color 0.1s ease',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
          '&:active': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
          '&:last-child': { borderBottom: 'none' },
        }}
      >
        <Box
          sx={{
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            borderRadius: { xs: '10px', sm: '12px' },
            bgcolor: isFocused ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.grey[100], 0.8),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MapPin size={isMobile ? 16 : 18} color={isFocused ? theme.palette.primary.main : theme.palette.text.secondary} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: '0.875rem', sm: '0.938rem' },
              fontWeight: 600,
              color: isFocused ? 'primary.main' : 'text.primary',
              lineHeight: 1.4,
            }}
            noWrap
          >
            {item.place_name}
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' }, color: 'text.secondary', lineHeight: 1.3 }}>
            {item.state_name}
          </Typography>
        </Box>
        <Box
          sx={{
            px: { xs: 1, sm: 1.25 },
            py: { xs: 0.375, sm: 0.5 },
            borderRadius: { xs: '6px', sm: '8px' },
            bgcolor: isFocused ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.grey[100], 0.8),
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.813rem' }, fontWeight: 600, color: isFocused ? 'primary.main' : 'text.secondary' }}>
            {item.postcode}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Desktop Dropdown content
  const DropdownContent = ({ forMobile = false }) => (
    <Box>
      {/* Results Header */}
      {hasResults && (
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1, sm: 1.25 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
            bgcolor: alpha(theme.palette.grey[50], 0.5),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: { xs: '0.688rem', sm: '0.75rem' }, fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {filteredSuburbs.length} location{filteredSuburbs.length !== 1 ? 's' : ''}
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.625rem', sm: '0.688rem' }, color: 'text.disabled' }}>
            Scroll to browse
          </Typography>
        </Box>
      )}

      {/* Loading */}
      {isLoading && (
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          {[...Array(4)].map((_, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1.25, sm: 1.5 },
                py: { xs: 0.75, sm: 1 },
                opacity: 1 - i * 0.2,
              }}
            >
              <Box sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, borderRadius: { xs: '10px', sm: '12px' }, bgcolor: alpha(theme.palette.grey[200], 0.8) }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ width: '65%', height: { xs: 12, sm: 14 }, borderRadius: 1, bgcolor: alpha(theme.palette.grey[200], 0.8), mb: 0.5 }} />
                <Box sx={{ width: '40%', height: { xs: 10, sm: 12 }, borderRadius: 1, bgcolor: alpha(theme.palette.grey[200], 0.5) }} />
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Results List - Scrollable */}
      {!isLoading && hasResults && (
        <Box
          ref={forMobile ? null : listRef}
          sx={{
            maxHeight: forMobile ? 'none' : 340,
            overflowY: forMobile ? 'visible' : 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.grey[400], 0.4),
              borderRadius: 3,
              '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.5) },
            },
          }}
        >
          {filteredSuburbs.map((item, idx) => (
            <LocationItem key={`${item.place_name}-${item.postcode}`} item={item} idx={idx} />
          ))}
        </Box>
      )}

      {/* No Results */}
      {showNoResults && (
        <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: { xs: '14px', sm: '16px' },
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <AlertCircle size={isMobile ? 22 : 26} color={theme.palette.warning.main} />
          </Box>
          <Typography sx={{ fontSize: { xs: '0.938rem', sm: '1rem' }, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            No locations found
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, color: 'text.secondary', mb: 2.5 }}>
            Could not find "{searchTerm}"
          </Typography>

          {showCustomInput ? (
            <Box sx={{ display: 'flex', gap: 1.25 }}>
              <TextField
                fullWidth
                size="small"
                value={customSuburb}
                onChange={(e) => setCustomSuburb(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCustomAdd();
                  if (e.key === 'Escape') setShowCustomInput(false);
                }}
                placeholder="Enter custom location"
                inputRef={customInputRef}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    fontSize: { xs: '0.875rem', sm: '0.938rem' },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleCustomAdd}
                disabled={!customSuburb.trim()}
                sx={{
                  minWidth: { xs: 48, sm: 56 },
                  borderRadius: '10px',
                  bgcolor: theme.palette.primary.main,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' },
                }}
              >
                <Plus size={isMobile ? 18 : 22} />
              </Button>
            </Box>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Plus size={isMobile ? 16 : 18} />}
              onClick={() => {
                setShowCustomInput(true);
                setCustomSuburb(searchTerm);
              }}
              sx={{
                borderRadius: '10px',
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: 'primary.main',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.938rem' },
                py: { xs: 1.25, sm: 1.5 },
                textTransform: 'none',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              Add custom location
            </Button>
          )}
        </Box>
      )}

      {/* Empty state - no search */}
      {!isLoading && !hasResults && !showNoResults && (
        <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: { xs: '14px', sm: '16px' },
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Search size={isMobile ? 22 : 26} color={theme.palette.primary.main} />
          </Box>
          <Typography sx={{ fontSize: { xs: '0.938rem', sm: '1rem' }, fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            Search for a location
          </Typography>
          <Typography sx={{ fontSize: { xs: '0.813rem', sm: '0.875rem' }, color: 'text.secondary' }}>
            Type a suburb name or postcode
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Search Input */}
      <TextField
        fullWidth
        value={normalizedSuburbInput}
        onChange={handleInputChange}
        onFocus={(e) => {
          if (isMobile) {
            // On mobile, always open the dialog
            setDropdownOpen(true);
          } else if (normalizedSuburbInput.length > 0) {
            setDropdownOpen(true);
            setAnchorEl(e.currentTarget);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search suburb or postcode..."
        inputRef={inputRef}
        error={Boolean(errors?.suburb)}
        helperText={errors?.suburb}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {selectedSuburb ? (
                <Check size={isMobile ? 18 : 20} color="#10b981" strokeWidth={2.5} />
              ) : (
                <Search size={isMobile ? 18 : 20} color={theme.palette.text.disabled} />
              )}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {normalizedSuburbInput ? (
                <IconButton
                  size="small"
                  onClick={handleClear}
                  sx={{ p: 0.5, color: 'text.disabled', '&:hover': { color: 'text.secondary' } }}
                >
                  <X size={isMobile ? 16 : 18} />
                </IconButton>
              ) : (
                <ChevronDown size={isMobile ? 16 : 18} color={theme.palette.text.disabled} />
              )}
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: alpha(theme.palette.grey[100], 0.5),
            fontSize: { xs: '0.875rem', sm: '0.938rem' },
            '& fieldset': { borderColor: 'transparent' },
            '&:hover': {
              bgcolor: alpha(theme.palette.grey[100], 0.8),
              '& fieldset': { borderColor: 'transparent' },
            },
            '&.Mui-focused': {
              bgcolor: 'background.paper',
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.15)}`,
              '& fieldset': { borderColor: theme.palette.primary.main, borderWidth: 1 },
            },
          },
          '& .MuiInputBase-input': {
            py: { xs: 1.25, sm: 1.5 },
            fontWeight: 500,
            '&::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
          },
        }}
      />

      {/* Desktop: Popper Dropdown */}
      {!isMobile && (
        <Popper
          open={dropdownOpen && (hasResults || showNoResults || isLoading)}
          anchorEl={anchorEl}
          placement="bottom-start"
          transition
          modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
          sx={{ zIndex: 1400, width: anchorEl?.offsetWidth || '100%' }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={150}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  boxShadow: '0 16px 48px -12px rgba(0, 0, 0, 0.15), 0 6px 16px -4px rgba(0, 0, 0, 0.08)',
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                }}
              >
                <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
                  <Box>
                    <DropdownContent />
                  </Box>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      )}

      {/* Mobile: Full Screen Dialog - Premium SaaS Design */}
      {isMobile && (
        <Dialog
          open={dropdownOpen}
          onClose={() => {
            setDropdownOpen(false);
            setMobileSearch('');
          }}
          fullScreen
          TransitionComponent={SlideTransition}
          transitionDuration={{ enter: 300, exit: 200 }}
          PaperProps={{
            sx: {
              bgcolor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {/* Header - Fixed */}
          <Box
            sx={{
              px: 2,
              pt: 'max(env(safe-area-inset-top), 16px)',
              pb: 2,
              bgcolor: '#ffffff',
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              flexShrink: 0,
            }}
          >
            {/* Top Row - Title & Close */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 2,
                minHeight: 44,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={22} color={theme.palette.primary.main} strokeWidth={2} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography 
                    sx={{ 
                      fontSize: '1.0625rem', 
                      fontWeight: 700, 
                      color: 'text.primary', 
                      lineHeight: 1.25,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Find Location
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: '0.8125rem', 
                      color: 'text.secondary', 
                      lineHeight: 1.35,
                      mt: 0.125,
                    }}
                  >
                    Search suburb or postcode
                  </Typography>
                </Box>
              </Box>
              
              {/* Close Button - Large touch target */}
              <Box
                component="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setMobileSearch('');
                }}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.grey[100], 0.8),
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  ml: 1,
                  transition: 'all 0.15s ease',
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.grey[200], 0.8),
                  },
                  '&:active': {
                    bgcolor: alpha(theme.palette.grey[300], 0.8),
                    transform: 'scale(0.96)',
                  },
                }}
              >
                <X size={22} color={theme.palette.text.secondary} strokeWidth={2} />
              </Box>
            </Box>

            {/* Search Input */}
            <TextField
              fullWidth
              value={mobileSearch}
              onChange={handleMobileSearchChange}
              placeholder="Search..."
              autoFocus
              inputRef={mobileSearchRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search 
                      size={20} 
                      color={mobileSearch ? theme.palette.primary.main : theme.palette.text.disabled} 
                      strokeWidth={2} 
                    />
                  </InputAdornment>
                ),
                endAdornment: mobileSearch && (
                  <InputAdornment position="end">
                    <Box
                      component="button"
                      onClick={() => setMobileSearch('')}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        bgcolor: alpha(theme.palette.grey[200], 0.8),
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:active': { transform: 'scale(0.92)' },
                      }}
                    >
                      <X size={16} color={theme.palette.text.secondary} strokeWidth={2.5} />
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.grey[100], 0.6),
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  '& fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused': {
                    bgcolor: '#ffffff',
                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.15)}`,
                    '& fieldset': { borderColor: theme.palette.primary.main, borderWidth: 1.5 },
                  },
                },
                '& .MuiInputBase-input': {
                  py: 1.5,
                  fontWeight: 500,
                  '&::placeholder': { color: theme.palette.text.disabled, opacity: 1 },
                },
              }}
            />
          </Box>

          {/* Content - Scrollable */}
          <Box
            ref={listRef}
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
              p: 2,
              pb: 'max(env(safe-area-inset-bottom), 24px)',
            }}
          >
            {/* Results container */}
            <Box
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '14px',
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                boxShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.04)}`,
                overflow: 'hidden',
              }}
            >
              <DropdownContent forMobile />
            </Box>
          </Box>
        </Dialog>
      )}
    </Box>
  );
};

export default React.memo(SuburbSelector);
