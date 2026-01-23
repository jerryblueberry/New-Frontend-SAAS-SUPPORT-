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

import React from 'react';
import {
  Box,
  Grid,
  Typography,
  LinearProgress,
  Skeleton,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import WorkerNavbar from '../../../components/Navbar/WorkerNavbar';
import ClientSidebar from '../../../components/ClientComponents/ClientSidebar/ClientSidebar';
import { CLIENT_SIDEBAR_WIDTH } from '../../../constants/layout';
import {
  useExploreWorkersPage,
  useWorkerModal
} from '../../../components/ClientComponents/ClientWorkForce/ExploreWorkersComponents/hooks';
import {
  PageHeader,
  SearchAndFilterBar,
  WorkerCard,
  WorkerCardSkeleton,
  EmptyState,
  WorkerDetailModal
} from '../../../components/ClientComponents/ClientWorkForce/ExploreWorkersComponents/components';
import { SKELETON_COUNT } from '../../../components/ClientComponents/ClientWorkForce/ExploreWorkersComponents/utils';

/**
 * ExploreWorkersPage Component
 */
const ExploreWorkersPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Custom hooks for page logic
  const {
    topOffset,
    filters,
    searchQuery,
    showFilters,
    pagination,
    workers,
    stats,
    activeFiltersCount,
    isLoading,
    isError,
    error,
    isFetching,
    statsLoading,
    handleSkillToggle,
    handleFilterChange,
    handleSearchChange,
    handleClearFilters,
    handleToggleFilters,
    nextPage,
    prevPage,
    prefetchWorker
  } = useExploreWorkersPage();

  // Modal management hook
  const {
    selectedWorkerId,
    modalOpen,
    handleOpenModal,
    handleCloseModal
  } = useWorkerModal();

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
            {/* Page Header */}
            <PageHeader
              stats={stats}
              statsLoading={statsLoading}
              pagination={pagination}
            />

            {/* Search and Filter Bar */}
            <SearchAndFilterBar
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              showFilters={showFilters}
              onToggleFilters={handleToggleFilters}
              filters={filters}
              onFilterChange={handleFilterChange}
              onSkillToggle={handleSkillToggle}
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount}
            />

            {/* Results Summary - Fixed Display */}
            {!isLoading && !isFetching && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                px: 0.5
              }}>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.813rem', sm: '0.875rem' },
                    fontWeight: 500
                  }}
                >
                  {workers.length > 0 ? (
                    pagination.totalResults && pagination.totalResults > 0 ? (
                      `Showing ${workers.length} of ${pagination.totalResults} ${pagination.totalResults === 1 ? 'worker' : 'workers'}`
                    ) : (
                      `Showing ${workers.length} ${workers.length === 1 ? 'worker' : 'workers'}`
                    )
                  ) : (
                    'No workers found'
                  )}
                </Typography>
                {pagination.totalPages > 0 && (
                  <Typography 
                    variant="caption" 
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: '0.688rem', sm: '0.75rem' },
                      fontWeight: 500
                    }}
                  >
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </Typography>
                )}
              </Box>
            )}

            {/* Loading indicator for background fetches */}
            {isFetching && !isLoading && (
              <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />
            )}

            {/* Workers Grid */}
            <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: SKELETON_COUNT }).map((_, index) => (
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


export default ExploreWorkersPage;
