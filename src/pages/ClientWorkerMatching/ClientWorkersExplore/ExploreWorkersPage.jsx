/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EXPLORE WORKERS PAGE - Client Worker Discovery
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready worker discovery page with advanced filtering and sorting.
 * Follows existing codebase patterns for layout and styling.
 * 
 * Features:
 * - Real-time search and filtering
 * - Advanced multi-criteria sorting
 * - Responsive grid layout
 * - Infinite scroll / pagination
 * - Match score visualization
 * - Worker profile quick view
 * 
 * @module pages/ClientWorkerMatching/ClientWorkersExplore
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Button,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Collapse,
  Paper,
  Rating,
  LinearProgress,
  Tooltip,
  Badge,
  Stack,
  useTheme,
  useMediaQuery,
  alpha,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  LocationOn,
  Star,
  Verified,
  Close,
  ExpandMore,
  ExpandLess,
  TrendingUp,
  AttachMoney,
  Schedule,
  Person,
  KeyboardArrowRight,
  WorkOutline,
  Language,
  Email,
  Phone,
  CalendarToday
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar';
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout';
import { useWorkerDiscoveryStore } from '../../../stores/useWorkerDiscoveryStore';
import { 
  useWorkers,
  useWorker,
  useActiveFiltersCount, 
  useMatchingStats,
  usePrefetchWorker 
} from '../../../hooks/useWorkerDiscovery';

/**
 * Utility: Sanitize HTML content
 * Removes potentially dangerous tags and attributes while preserving formatting
 */
const sanitizeHTML = (html) => {
  if (!html) return '';
  
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove script tags and other dangerous elements
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'link', 'style'];
  dangerousTags.forEach(tag => {
    const elements = temp.getElementsByTagName(tag);
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
  });
  
  // Remove dangerous attributes
  const allElements = temp.getElementsByTagName('*');
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    const attributes = Array.from(element.attributes);
    attributes.forEach(attr => {
      if (attr.name.startsWith('on') || attr.name === 'formaction') {
        element.removeAttribute(attr.name);
      }
    });
  }
  
  return temp.innerHTML;
};

/**
 * Utility: Strip HTML tags for preview
 */
const stripHTML = (html) => {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

/**
 * ExploreWorkersPage Component
 */
const ExploreWorkersPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // State management
  const [topOffset, setTopOffset] = useState(64);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Zustand store
  const {
    filters,
    searchQuery,
    showFilters,
    pagination,
    setFilter,
    setSearchQuery,
    toggleSkill,
    clearFilters,
    toggleFilters,
    goToPage,
    nextPage,
    prevPage
  } = useWorkerDiscoveryStore();

  // TanStack Query - Fetch workers
  const {
    workers,
    isLoading,
    isError,
    error,
    isFetching
  } = useWorkers();

  // Get matching statistics
  const { stats, isLoading: statsLoading } = useMatchingStats();

  // Get active filters count
  const activeFiltersCount = useActiveFiltersCount();

  // Prefetch hook for performance
  const prefetchWorker = usePrefetchWorker();

  // Common skills for filtering
  const availableSkills = [
    'Personal Care',
    'Meal Preparation',
    'Transportation',
    'Disability Support',
    'Companionship',
    'Medication Management',
    'Domestic Assistance',
    'Social Support'
  ];

  // Measure navbar height for sidebar positioning
  useEffect(() => {
    const measureNavbar = () => {
      const headerEl = document.querySelector('.wrk-dashboard-header');
      if (headerEl) {
        setTopOffset(headerEl.getBoundingClientRect().height || 64);
      }
    };
    measureNavbar();
    window.addEventListener('resize', measureNavbar);
    return () => window.removeEventListener('resize', measureNavbar);
  }, []);

  // Handlers
  const handleSkillToggle = useCallback((skill) => {
    toggleSkill(skill);
  }, [toggleSkill]);

  const handleFilterChange = useCallback((key, value) => {
    setFilter(key, value);
  }, [setFilter]);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, [setSearchQuery]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleToggleFilters = useCallback(() => {
    toggleFilters();
  }, [toggleFilters]);

  // Modal handlers
  const handleOpenModal = useCallback((workerId) => {
    setSelectedWorkerId(workerId);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => setSelectedWorkerId(null), 200); // Delay to allow fade out
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden'
    }}>
      <WorkerNavbar />

      {/* Layout container with sidebar */}
      <Box sx={{ display: 'flex', width: '100%' }}>
        <ClientSidebar topOffset={topOffset} navigate={navigate} />

        {/* Main content */}
        <Box sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${CLIENT_SIDEBAR_WIDTH}px)` },
          minWidth: 0,
          pt: { xs: 10, md: 8.7 },
          px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 },
          pb: 4
        }}>
          <Box sx={{
            maxWidth: { xs: '100%', lg: '1400px', xl: '1600px' },
            mx: 'auto',
            width: '100%'
          }}>
            {/* Page Header - Premium SaaS Design */}
            <Box sx={{ mb: { xs: 3, md: 4 } }}>
              {/* Breadcrumb / Tag */}
              <Chip
                label="Worker Discovery"
                size="small"
                sx={{
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 24,
                  borderRadius: '6px',
                  '& .MuiChip-label': {
                    px: 1.5
                  }
                }}
              />

              {/* Title with Gradient */}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 1.5,
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}
              >
                Find Your Perfect Support Worker
              </Typography>

              {/* Subtitle with Icon */}
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: 'primary.main'
                  }}
                />
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    fontWeight: 400,
                    letterSpacing: '-0.01em'
                  }}
                >
                  Connect with verified professionals tailored to your unique care requirements
                </Typography>
              </Stack>

              {/* Stats Bar */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 3 }}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.03),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Verified sx={{ fontSize: 18, color: 'success.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, fontSize: '1.1rem' }}>
                      {statsLoading ? '...' : (stats?.totalWorkers || pagination.totalResults || '0')}+
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Verified Workers
                    </Typography>
                  </Box>
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Star sx={{ fontSize: 18, color: 'warning.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, fontSize: '1.1rem' }}>
                      {statsLoading ? '...' : (stats?.averageRating?.toFixed(1) || '4.8')}/5
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Average Rating
                    </Typography>
                  </Box>
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 18, color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, fontSize: '1.1rem' }}>
                      {statsLoading ? '...' : (
                        stats?.highRatedWorkers && stats?.totalWorkers
                          ? `${Math.round((stats.highRatedWorkers / stats.totalWorkers) * 100)}%`
                          : '95%'
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Match Accuracy
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            {/* Search and Filter Bar */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                mb: { xs: 2, md: 2.5 },
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2
              }}
            >
              <Stack spacing={2}>
                {/* Search and Filter Toggle Row */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  {/* Search Field */}
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by skills, biography, or location..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => handleSearchChange('')}
                            edge="end"
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.default'
                      }
                    }}
                  />

                  {/* Filter Toggle Button */}
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                    onClick={handleToggleFilters}
                    sx={{
                      minWidth: { xs: '100%', sm: 'auto' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Filters
                    {activeFiltersCount > 0 && (
                      <Chip
                        label={activeFiltersCount}
                        size="small"
                        color="primary"
                        sx={{ ml: 1, height: 20, minWidth: 20 }}
                      />
                    )}
                  </Button>

                  {/* Sort Dropdown */}
                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 180 } }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      label="Sort By"
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <Sort sx={{ ml: 1, color: 'text.secondary' }} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="relevance">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TrendingUp fontSize="small" />
                          <span>Best Match</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="rating">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Star fontSize="small" />
                          <span>Highest Rated</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="rate">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AttachMoney fontSize="small" />
                          <span>Hourly Rate</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="newest">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Schedule fontSize="small" />
                          <span>Newest First</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                {/* Expandable Filters Section */}
                <Collapse in={showFilters}>
                  <Divider sx={{ my: 1 }} />

                  <Grid container spacing={2}>
                    {/* Skills Filter */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Skills
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {availableSkills.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            size="small"
                            onClick={() => handleSkillToggle(skill)}
                            color={filters.skills.includes(skill) ? 'primary' : 'default'}
                            variant={filters.skills.includes(skill) ? 'filled' : 'outlined'}
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </Grid>

                    {/* Location Filter */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Location
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter suburb or city"
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>

                    {/* Rating Filter */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Minimum Rating
                      </Typography>
                      <Box sx={{ px: 1 }}>
                        <Slider
                          value={filters.minRating}
                          onChange={(e, value) => handleFilterChange('minRating', value)}
                          min={0}
                          max={5}
                          step={0.5}
                          marks
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `${value}★`}
                        />
                      </Box>
                    </Grid>

                    {/* Hourly Rate Filter */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Max Hourly Rate (${filters.maxHourlyRate})
                      </Typography>
                      <Box sx={{ px: 1 }}>
                        <Slider
                          value={filters.maxHourlyRate}
                          onChange={(e, value) => handleFilterChange('maxHourlyRate', value)}
                          min={20}
                          max={100}
                          step={5}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => `$${value}`}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Clear Filters Button */}
                  {activeFiltersCount > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        startIcon={<Close />}
                        onClick={handleClearFilters}
                        sx={{ textTransform: 'none' }}
                      >
                        Clear All Filters
                      </Button>
                    </Box>
                  )}
                </Collapse>
              </Stack>
            </Paper>

            {/* Results Summary */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              px: 0.5
            }}>
              <Typography variant="body2" color="text.secondary">
                {isLoading || isFetching ? (
                  <Skeleton width={200} />
                ) : (
                  `Showing ${workers.length} of ${pagination.totalResults || 0} workers`
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {pagination.totalPages > 0 && `Page ${pagination.currentPage} of ${pagination.totalPages}`}
              </Typography>
            </Box>

            {/* Loading indicator for background fetches */}
            {isFetching && !isLoading && (
              <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
            )}

            {/* Workers Grid */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 6 }).map((_, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <WorkerCardSkeleton />
                  </Grid>
                ))
              ) : workers.length === 0 ? (
                // Empty state
                <Grid item xs={12}>
                  <EmptyState
                    hasFilters={activeFiltersCount > 0}
                    onClearFilters={handleClearFilters}
                  />
                </Grid>
              ) : (
                // Worker cards
                workers.map((worker) => (
                  <Grid item xs={12} sm={6} lg={4} key={worker._id}>
                    <WorkerCard 
                      worker={worker} 
                      onViewProfile={handleOpenModal}
                      onHover={prefetchWorker}
                    />
                  </Grid>
                ))
              )}
            </Grid>

            {/* Worker Detail Modal */}
            <WorkerDetailModal
              open={modalOpen}
              workerId={selectedWorkerId}
              onClose={handleCloseModal}
            />

            {/* Pagination */}
            {!isLoading && workers.length > 0 && pagination.totalPages > 1 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 4,
                gap: 2
              }}>
                <Button
                  variant="outlined"
                  disabled={pagination.currentPage === 1 || isFetching}
                  onClick={prevPage}
                >
                  Previous
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {pagination.currentPage} / {pagination.totalPages}
                </Typography>
                <Button
                  variant="outlined"
                  disabled={pagination.currentPage === pagination.totalPages || isFetching}
                  onClick={nextPage}
                >
                  Next
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Worker Card Component
 */
const WorkerCard = ({ worker, onViewProfile, onHover }) => {
  const theme = useTheme();

  return (
    <Card
      onMouseEnter={() => {
        // Prefetch worker data on hover for instant modal open
        if (onHover && worker._id) {
          onHover(worker._id);
        }
      }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          borderColor: theme.palette.primary.main
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
        {/* Header with Avatar and Match Score */}
        <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              worker.verificationStatus?.overall === 'Fully Verified' ? (
                <Verified sx={{ fontSize: 18, color: theme.palette.success.main }} />
              ) : null
            }
          >
            <Avatar
              src={worker.user?.profilePicture}
              alt={`${worker.user?.firstName} ${worker.user?.lastName}`}
              sx={{ width: 56, height: 56 }}
            >
              <Person />
            </Avatar>
          </Badge>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {worker.user?.firstName} {worker.user?.lastName?.[0]}.
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Rating
                value={worker.ratings?.average || 0}
                precision={0.1}
                size="small"
                readOnly
              />
              <Typography variant="caption" color="text.secondary">
                ({worker.ratings?.count || 0})
              </Typography>
            </Stack>
          </Box>

          {/* Match Score */}
          {worker.matchScore && (
            <Tooltip title="Match Score">
              <Box
                sx={{
                  minWidth: 44,
                  height: 44,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `2px solid ${theme.palette.primary.main}`
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                  {Math.round(worker.matchScore)}%
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Stack>

        {/* Biography */}
        <Box
          sx={{
            mb: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: 40,
            '& *': {
              fontSize: '0.875rem !important',
              lineHeight: '1.43 !important',
              color: theme.palette.text.secondary,
              margin: '0 !important',
              padding: '0 !important'
            },
            '& ol, & ul': {
              paddingLeft: '20px !important',
              margin: '0 !important'
            },
            '& li': {
              marginBottom: '2px !important'
            },
            '& strong, & b': {
              fontWeight: 600,
              color: theme.palette.text.primary
            }
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeHTML(worker.biography) || '<p style="color: rgba(0,0,0,0.6);">No biography available</p>'
          }}
        />

        {/* Skills */}
        <Box sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {worker.skillTags?.slice(0, 3).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 22,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  fontWeight: 500
                }}
              />
            ))}
            {worker.skillTags?.length > 3 && (
              <Chip
                label={`+${worker.skillTags.length - 3}`}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  height: 22,
                  bgcolor: alpha(theme.palette.grey[500], 0.08)
                }}
              />
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Info Row */}
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                ${worker.expectedHourlyRate}/hr
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={6}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {worker.availability?.suburb || 'N/A'}
              </Typography>
            </Stack>
          </Grid>
          {worker.languages?.[0] && (
            <Grid item xs={6}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Language sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {worker.languages[0].language}
                </Typography>
              </Stack>
            </Grid>
          )}
          <Grid item xs={6}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <WorkOutline sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {worker.profileCompleteness?.percentage || 0}% Complete
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {/* View Profile Button */}
        <Button
          fullWidth
          variant="outlined"
          size="small"
          endIcon={<KeyboardArrowRight />}
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile(worker._id);
          }}
          sx={{
            mt: 1.5,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

/**
 * Worker Card Skeleton
 */
const WorkerCardSkeleton = () => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
      <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
        <Skeleton variant="circular" width={56} height={56} />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton width="70%" />
          <Skeleton width="50%" />
        </Box>
        <Skeleton variant="circular" width={44} height={44} />
      </Stack>
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Box sx={{ my: 1.5 }}>
        <Stack direction="row" spacing={0.5}>
          <Skeleton variant="rounded" width={80} height={22} />
          <Skeleton variant="rounded" width={80} height={22} />
          <Skeleton variant="rounded" width={80} height={22} />
        </Stack>
      </Box>
      <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
    </CardContent>
  </Card>
);

/**
 * Empty State Component
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

/**
 * Worker Detail Modal Component
 */
const WorkerDetailModal = ({ open, workerId, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch worker data with live updates
  const { worker, isLoading, isError, error } = useWorker(workerId, { enabled: open && !!workerId });

  if (!workerId) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh'
        }
      }}
    >
      {/* Header with Close Button */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: { xs: 2, sm: 2.5 },
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Worker Profile
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: 'error.main'
            }
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={48} />
              <Typography variant="body2" color="text.secondary">
                Loading worker profile...
              </Typography>
            </Stack>
          </Box>
        )}

        {/* Error State */}
        {isError && (
          <Box sx={{ py: 4 }}>
            <Alert 
              severity="error" 
              sx={{ borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={onClose}>
                  Close
                </Button>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                Failed to load worker profile
              </Typography>
              <Typography variant="caption">
                {error?.response?.data?.message || error?.message || 'Please try again later'}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Success - Show Worker Data */}
        {!isLoading && !isError && worker && (
          <>
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            sx={{ mb: 2 }}
          >
            {/* Avatar */}
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                worker.verificationStatus?.overall === 'Fully Verified' ? (
                  <Verified sx={{ fontSize: 24, color: theme.palette.success.main }} />
                ) : null
              }
            >
              <Avatar
                src={worker.user?.profilePicture}
                alt={`${worker.user?.firstName} ${worker.user?.lastName}`}
                sx={{ width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 } }}
              >
                <Person sx={{ fontSize: { xs: 40, sm: 50 } }} />
              </Avatar>
            </Badge>

            {/* Name and Rating */}
            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                {worker.user?.firstName} {worker.user?.lastName}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ justifyContent: { xs: 'center', sm: 'flex-start' }, mb: 1 }}
              >
                <Rating value={worker.ratings?.average || 0} precision={0.1} size="small" readOnly />
                <Typography variant="body2" color="text.secondary">
                  {worker.ratings?.average?.toFixed(1) || '0.0'} ({worker.ratings?.count || 0} reviews)
                </Typography>
              </Stack>

              {/* Match Score Badge */}
              {worker.matchScore && (
                <Chip
                  label={`${Math.round(worker.matchScore)}% Match`}
                  color="primary"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>
          </Stack>

          {/* Biography */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              borderRadius: 1.5,
              '& *': {
                fontSize: '0.875rem !important',
                lineHeight: '1.7 !important',
                color: theme.palette.text.secondary
              },
              '& p': {
                marginBottom: '0.75em'
              },
              '& ol, & ul': {
                paddingLeft: '24px',
                marginTop: '0.5em',
                marginBottom: '0.75em'
              },
              '& li': {
                marginBottom: '0.5em'
              },
              '& strong, & b': {
                fontWeight: 600,
                color: theme.palette.text.primary
              },
              '& em, & i': {
                fontStyle: 'italic'
              },
              '& u': {
                textDecoration: 'underline'
              },
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontWeight: 600,
                color: theme.palette.text.primary,
                marginTop: '1em',
                marginBottom: '0.5em'
              },
              '& h1': { fontSize: '1.5rem !important' },
              '& h2': { fontSize: '1.25rem !important' },
              '& h3': { fontSize: '1.1rem !important' },
              '& blockquote': {
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                paddingLeft: '16px',
                marginLeft: 0,
                fontStyle: 'italic',
                color: theme.palette.text.secondary
              },
              '& code': {
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.85em !important'
              },
              '& pre': {
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                padding: '12px',
                borderRadius: '8px',
                overflow: 'auto',
                marginTop: '0.75em',
                marginBottom: '0.75em'
              },
              '& a': {
                color: theme.palette.primary.main,
                textDecoration: 'underline',
                '&:hover': {
                  color: theme.palette.primary.dark
                }
              },
              '& br': {
                display: 'block',
                content: '""',
                marginTop: '0.25em'
              }
            }}
            dangerouslySetInnerHTML={{
              __html: sanitizeHTML(worker.biography) || '<p style="color: rgba(0,0,0,0.6); font-style: italic;">No biography provided.</p>'
            }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Skills Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center' }}>
            <WorkOutline sx={{ mr: 1, fontSize: 20 }} />
            Skills & Expertise
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {worker.skillTags?.length > 0 ? (
              worker.skillTags.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No skills listed
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Details Grid */}
        <Grid container spacing={2.5}>
          {/* Hourly Rate */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AttachMoney sx={{ color: 'success.main', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Hourly Rate
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ${worker.expectedHourlyRate || 'N/A'}/hr
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Location */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LocationOn sx={{ color: 'info.main', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {worker.availability?.suburb || 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Languages */}
          {worker.languages?.[0] && (
            <Grid item xs={12} sm={6}>
              <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Language sx={{ color: 'warning.main', fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Languages
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {worker.languages.map(l => l.language).join(', ')}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          )}

          {/* Profile Completeness */}
          <Grid item xs={12} sm={6}>
            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
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
                  <Person sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Profile Complete
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LinearProgress
                      variant="determinate"
                      value={worker.profileCompleteness?.percentage || 0}
                      sx={{
                        flexGrow: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {worker.profileCompleteness?.percentage || 0}%
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Verification Status */}
        {worker.verificationStatus?.overall === 'Fully Verified' && (
          <>
            <Divider sx={{ my: 3 }} />
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.success.main, 0.08),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 1.5
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Verified sx={{ color: 'success.main', fontSize: 24 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                    Verified Professional
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Identity verified and background check completed
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </>
        )}
          </>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          p: { xs: 2, sm: 2.5 },
          gap: 1,
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          zIndex: 1
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth={isMobile}
          sx={{ textTransform: 'none', minWidth: 100 }}
        >
          Close
        </Button>
        <Button
          variant="contained"
          fullWidth={isMobile}
          disabled={isLoading || isError}
          sx={{ textTransform: 'none', minWidth: 120 }}
        >
          Contact Worker
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExploreWorkersPage;
