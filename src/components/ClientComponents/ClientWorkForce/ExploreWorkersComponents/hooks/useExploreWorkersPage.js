/**
 * useExploreWorkersPage Hook
 * 
 * Main hook for Explore Workers page logic.
 * Handles state management, filters, and data fetching.
 */

import { useState, useEffect, useCallback } from 'react';
import { useWorkerDiscoveryStore } from '../../../../../stores/useWorkerDiscoveryStore';
import { 
  useWorkers,
  useMatchingStats,
  useActiveFiltersCount,
  usePrefetchWorker 
} from '../../../../../hooks/useWorkerDiscovery';

/**
 * Custom hook for Explore Workers page
 * 
 * @returns {Object} Page state and handlers
 */
export const useExploreWorkersPage = () => {
  // Local state
  const [topOffset, setTopOffset] = useState(64);

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

  return {
    // State
    topOffset,
    filters,
    searchQuery,
    showFilters,
    pagination,
    workers,
    stats,
    activeFiltersCount,
    
    // Loading states
    isLoading,
    isError,
    error,
    isFetching,
    statsLoading,
    
    // Handlers
    handleSkillToggle,
    handleFilterChange,
    handleSearchChange,
    handleClearFilters,
    handleToggleFilters,
    nextPage,
    prevPage,
    prefetchWorker
  };
};
