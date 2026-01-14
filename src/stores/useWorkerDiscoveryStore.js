/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WORKER DISCOVERY STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Zustand store for managing worker discovery state.
 * Handles filters, sorting, pagination, and UI state.
 * 
 * @module stores/useWorkerDiscoveryStore
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

/**
 * Worker Discovery Store
 */
export const useWorkerDiscoveryStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ============================================================
        // STATE
        // ============================================================

        // Filters
        filters: {
          skills: [],
          location: '',
          minRating: 0,
          maxHourlyRate: 100,
          sortBy: 'relevance',
          sortOrder: 'desc'
        },

        // Search
        searchQuery: '',

        // Pagination
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 0,
          limit: 20
        },

        // UI State
        showFilters: true,
        viewMode: 'grid', // 'grid' or 'list'

        // Favorites (cached)
        favorites: [],

        // Recently viewed workers
        recentlyViewed: [],

        // ============================================================
        // FILTER ACTIONS
        // ============================================================

        /**
         * Set a specific filter
         */
        setFilter: (key, value) => {
          set((state) => ({
            filters: {
              ...state.filters,
              [key]: value
            },
            pagination: {
              ...state.pagination,
              currentPage: 1 // Reset to page 1 when filters change
            }
          }));
        },

        /**
         * Set multiple filters at once
         */
        setFilters: (newFilters) => {
          set((state) => ({
            filters: {
              ...state.filters,
              ...newFilters
            },
            pagination: {
              ...state.pagination,
              currentPage: 1
            }
          }));
        },

        /**
         * Toggle skill filter
         */
        toggleSkill: (skill) => {
          set((state) => {
            const skills = state.filters.skills.includes(skill)
              ? state.filters.skills.filter((s) => s !== skill)
              : [...state.filters.skills, skill];

            return {
              filters: {
                ...state.filters,
                skills
              },
              pagination: {
                ...state.pagination,
                currentPage: 1
              }
            };
          });
        },

        /**
         * Clear all filters
         */
        clearFilters: () => {
          set({
            filters: {
              skills: [],
              location: '',
              minRating: 0,
              maxHourlyRate: 100,
              sortBy: 'relevance',
              sortOrder: 'desc'
            },
            searchQuery: '',
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalResults: 0,
              limit: 20
            }
          });
        },

        // ============================================================
        // SEARCH ACTIONS
        // ============================================================

        /**
         * Set search query
         */
        setSearchQuery: (query) => {
          set({
            searchQuery: query,
            pagination: {
              ...get().pagination,
              currentPage: 1
            }
          });
        },

        /**
         * Clear search query
         */
        clearSearch: () => {
          set({
            searchQuery: '',
            pagination: {
              ...get().pagination,
              currentPage: 1
            }
          });
        },

        // ============================================================
        // PAGINATION ACTIONS
        // ============================================================

        /**
         * Set pagination data (from API response)
         */
        setPagination: (paginationData) => {
          set({
            pagination: {
              ...get().pagination,
              ...paginationData
            }
          });
        },

        /**
         * Go to specific page
         */
        goToPage: (page) => {
          set((state) => ({
            pagination: {
              ...state.pagination,
              currentPage: page
            }
          }));
        },

        /**
         * Go to next page
         */
        nextPage: () => {
          set((state) => {
            const { currentPage, totalPages } = state.pagination;
            if (currentPage < totalPages) {
              return {
                pagination: {
                  ...state.pagination,
                  currentPage: currentPage + 1
                }
              };
            }
            return state;
          });
        },

        /**
         * Go to previous page
         */
        prevPage: () => {
          set((state) => {
            const { currentPage } = state.pagination;
            if (currentPage > 1) {
              return {
                pagination: {
                  ...state.pagination,
                  currentPage: currentPage - 1
                }
              };
            }
            return state;
          });
        },

        // ============================================================
        // UI ACTIONS
        // ============================================================

        /**
         * Toggle filters visibility
         */
        toggleFilters: () => {
          set((state) => ({
            showFilters: !state.showFilters
          }));
        },

        /**
         * Set view mode
         */
        setViewMode: (mode) => {
          set({ viewMode: mode });
        },

        // ============================================================
        // FAVORITES ACTIONS
        // ============================================================

        /**
         * Add worker to favorites
         */
        addFavorite: (workerId) => {
          set((state) => ({
            favorites: [...new Set([...state.favorites, workerId])]
          }));
        },

        /**
         * Remove worker from favorites
         */
        removeFavorite: (workerId) => {
          set((state) => ({
            favorites: state.favorites.filter((id) => id !== workerId)
          }));
        },

        /**
         * Check if worker is favorited
         */
        isFavorite: (workerId) => {
          return get().favorites.includes(workerId);
        },

        /**
         * Set all favorites (from API)
         */
        setFavorites: (workerIds) => {
          set({ favorites: workerIds });
        },

        // ============================================================
        // RECENTLY VIEWED ACTIONS
        // ============================================================

        /**
         * Add worker to recently viewed
         */
        addToRecentlyViewed: (workerId) => {
          set((state) => {
            const recentlyViewed = [
              workerId,
              ...state.recentlyViewed.filter((id) => id !== workerId)
            ].slice(0, 10); // Keep only last 10

            return { recentlyViewed };
          });
        },

        /**
         * Clear recently viewed
         */
        clearRecentlyViewed: () => {
          set({ recentlyViewed: [] });
        },

        // ============================================================
        // UTILITY ACTIONS
        // ============================================================

        /**
         * Get active filters count
         */
        getActiveFiltersCount: () => {
          const { filters, searchQuery } = get();
          let count = 0;

          if (filters.skills.length > 0) count++;
          if (filters.location) count++;
          if (filters.minRating > 0) count++;
          if (filters.maxHourlyRate < 100) count++;
          if (searchQuery) count++;

          return count;
        },

        /**
         * Get query params for API call
         */
        getQueryParams: () => {
          const { filters, searchQuery, pagination } = get();

          return {
            page: pagination.currentPage,
            limit: pagination.limit,
            search: searchQuery || undefined,
            skills: filters.skills.length > 0 ? filters.skills : undefined,
            location: filters.location || undefined,
            minRating: filters.minRating > 0 ? filters.minRating : undefined,
            maxHourlyRate: filters.maxHourlyRate < 100 ? filters.maxHourlyRate : undefined,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder
          };
        },

        /**
         * Reset entire store
         */
        reset: () => {
          set({
            filters: {
              skills: [],
              location: '',
              minRating: 0,
              maxHourlyRate: 100,
              sortBy: 'relevance',
              sortOrder: 'desc'
            },
            searchQuery: '',
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalResults: 0,
              limit: 20
            },
            showFilters: true,
            viewMode: 'grid',
            favorites: [],
            recentlyViewed: []
          });
        }
      }),
      {
        name: 'worker-discovery-storage',
        // Only persist certain fields
        partialize: (state) => ({
          favorites: state.favorites,
          recentlyViewed: state.recentlyViewed,
          viewMode: state.viewMode,
          showFilters: state.showFilters
        })
      }
    ),
    { name: 'WorkerDiscoveryStore' }
  )
);

export default useWorkerDiscoveryStore;
