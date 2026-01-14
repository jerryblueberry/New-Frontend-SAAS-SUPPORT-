/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WORKER DISCOVERY HOOKS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * TanStack Query hooks for worker discovery.
 * Handles data fetching, caching, and synchronization with Zustand store.
 * 
 * @module hooks/useWorkerDiscovery
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkerDiscoveryStore } from '../stores/useWorkerDiscoveryStore';
import {
  getWorkers,
  getWorkerById,
  getMatchingStats,
  addToFavorites,
  removeFromFavorites,
  saveSearchPreferences
} from '../api/workerMatching';

/**
 * Query key factory for worker discovery
 */
export const workerKeys = {
  all: ['workers'],
  lists: () => [...workerKeys.all, 'list'],
  list: (filters) => [...workerKeys.lists(), filters],
  details: () => [...workerKeys.all, 'detail'],
  detail: (id) => [...workerKeys.details(), id],
  stats: () => [...workerKeys.all, 'stats']
};

/**
 * Hook to fetch workers with filters
 * Automatically syncs with Zustand store
 */
export const useWorkers = () => {
  // Select individual state slices to avoid unnecessary re-renders
  const filters = useWorkerDiscoveryStore((state) => state.filters);
  const searchQuery = useWorkerDiscoveryStore((state) => state.searchQuery);
  const pagination = useWorkerDiscoveryStore((state) => state.pagination);

  // Memoize query params to prevent infinite loops
  const queryParams = useMemo(() => ({
    page: pagination.currentPage,
    limit: pagination.limit,
    search: searchQuery || undefined,
    skills: filters.skills.length > 0 ? filters.skills : undefined,
    location: filters.location || undefined,
    minRating: filters.minRating > 0 ? filters.minRating : undefined,
    maxHourlyRate: filters.maxHourlyRate < 100 ? filters.maxHourlyRate : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder
  }), [
    pagination.currentPage,
    pagination.limit,
    searchQuery,
    filters.skills,
    filters.location,
    filters.minRating,
    filters.maxHourlyRate,
    filters.sortBy,
    filters.sortOrder
  ]);

  const query = useQuery({
    queryKey: workerKeys.list(queryParams),
    queryFn: async () => {
      const response = await getWorkers(queryParams);
      return response;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true, // Keep previous data while fetching new
    refetchOnWindowFocus: false,
    retry: 1
  });

  return {
    workers: query.data?.data?.workers || [],
    pagination: query.data?.data?.pagination || {},
    filters: query.data?.data?.filters || {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch
  };
};

/**
 * Hook to fetch single worker by ID
 */
export const useWorker = (workerId, options = {}) => {
  const addToRecentlyViewed = useWorkerDiscoveryStore((state) => state.addToRecentlyViewed);

  const query = useQuery({
    queryKey: workerKeys.detail(workerId),
    queryFn: async () => {
      const response = await getWorkerById(workerId);
      
      // Add to recently viewed
      if (response.success && response.data?.worker) {
        addToRecentlyViewed(workerId);
      }

      return response;
    },
    enabled: !!workerId && (options.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });

  return {
    worker: query.data?.data?.worker || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
};

/**
 * Hook to fetch matching statistics
 */
export const useMatchingStats = () => {
  const query = useQuery({
    queryKey: workerKeys.stats(),
    queryFn: async () => {
      const response = await getMatchingStats();
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 1
  });

  return {
    stats: query.data?.data || {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  };
};

/**
 * Hook to add/remove favorites
 */
export const useFavorites = () => {
  const queryClient = useQueryClient();
  const addFavoriteStore = useWorkerDiscoveryStore((state) => state.addFavorite);
  const removeFavoriteStore = useWorkerDiscoveryStore((state) => state.removeFavorite);

  const addMutation = useMutation({
    mutationFn: addToFavorites,
    onMutate: async (workerId) => {
      // Optimistic update
      addFavoriteStore(workerId);
    },
    onError: (error, workerId) => {
      // Rollback on error
      removeFavoriteStore(workerId);
      console.error('Failed to add favorite:', error);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries(['favorites']);
    }
  });

  const removeMutation = useMutation({
    mutationFn: removeFromFavorites,
    onMutate: async (workerId) => {
      // Optimistic update
      removeFavoriteStore(workerId);
    },
    onError: (error, workerId) => {
      // Rollback on error
      addFavoriteStore(workerId);
      console.error('Failed to remove favorite:', error);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries(['favorites']);
    }
  });

  return {
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    isAdding: addMutation.isLoading,
    isRemoving: removeMutation.isLoading
  };
};

/**
 * Hook to save search preferences
 */
export const useSearchPreferences = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: saveSearchPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries(['searchPreferences']);
    },
    onError: (error) => {
      console.error('Failed to save search preferences:', error);
    }
  });

  return {
    savePreferences: mutation.mutate,
    isSaving: mutation.isLoading,
    isError: mutation.isError,
    error: mutation.error
  };
};

/**
 * Hook to prefetch worker details
 * Useful for improving perceived performance
 */
export const usePrefetchWorker = () => {
  const queryClient = useQueryClient();

  return (workerId) => {
    queryClient.prefetchQuery({
      queryKey: workerKeys.detail(workerId),
      queryFn: () => getWorkerById(workerId),
      staleTime: 5 * 60 * 1000
    });
  };
};

/**
 * Hook to get active filters count
 */
export const useActiveFiltersCount = () => {
  const filters = useWorkerDiscoveryStore((state) => state.filters);
  const searchQuery = useWorkerDiscoveryStore((state) => state.searchQuery);

  return useMemo(() => {
    let count = 0;
    if (filters.skills.length > 0) count++;
    if (filters.location) count++;
    if (filters.minRating > 0) count++;
    if (filters.maxHourlyRate < 100) count++;
    if (searchQuery) count++;
    return count;
  }, [filters, searchQuery]);
};

/**
 * Hook to check if worker is favorited
 */
export const useIsFavorite = (workerId) => {
  return useWorkerDiscoveryStore((state) => state.isFavorite(workerId));
};

/**
 * Hook to get recently viewed workers
 */
export const useRecentlyViewed = () => {
  return useWorkerDiscoveryStore((state) => state.recentlyViewed);
};
