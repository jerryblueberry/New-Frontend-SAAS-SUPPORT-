/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT PREFERENCES STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready store for client preferences management with proper
 * separation of concerns between Zustand (UI state) and TanStack Query (server state).
 * 
 * Architecture:
 * - Zustand: Manages UI-only state (edit mode, form drafts, temporary UI state)
 * - TanStack Query: Manages all server state (fetching, caching, mutations, optimistic updates)
 * 
 * Best Practices:
 * - Server state lives in TanStack Query cache (single source of truth)
 * - UI state lives in Zustand (component-specific, doesn't need server sync)
 * - Optimistic updates for instant feedback
 * - Proper error handling and rollback
 * - Cache invalidation strategies
 * - Handles complex nested structures (workerPreferences, culturalPreferences, etc.)
 * 
 * @module stores/preferencesStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as clientProfileApi from '../api/clientProfile';
import { formatApiError } from '../utils/errorFormatter';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Query keys for TanStack Query
 */
export const PREFERENCES_QUERY_KEYS = {
  all: ['clientProfile', 'preferences'],
  detail: () => [...PREFERENCES_QUERY_KEYS.all, 'detail'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE - UI STATE ONLY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Zustand store for UI state only
 * Does NOT duplicate server state - TanStack Query is the source of truth
 */
const usePreferencesUIStore = create(
  devtools(
    (set, get) => ({
      // ─── UI State ───────────────────────────────────────────────────────────
      isEditMode: false,
      draftValues: null, // Temporary form values before save
      lastError: null, // Last error for UI display
      activeSection: null, // Currently active/expanded section

      // ─── Actions ───────────────────────────────────────────────────────────
      setEditMode: (isEditMode) =>
        set({ isEditMode, draftValues: isEditMode ? get().draftValues : null }),

      setDraftValues: (values) => set({ draftValues: values }),

      setActiveSection: (section) => set({ activeSection: section }),

      setError: (error) => set({ lastError: error }),

      clearError: () => set({ lastError: null }),

      reset: () =>
        set({
          isEditMode: false,
          draftValues: null,
          activeSection: null,
          lastError: null,
        }),
    }),
    { name: 'PreferencesUIStore' }
  )
);

// ═══════════════════════════════════════════════════════════════════════════════
// TANSTACK QUERY HOOKS - SERVER STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch preferences from server
 * Production-ready with proper caching and error handling
 */
const fetchPreferences = async () => {
  const response = await clientProfileApi.getPreferences();
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch preferences');
  }

  // Backend returns { preferences: {...} }
  return response.data?.preferences || null;
};

/**
 * Clean and prepare preferences payload for backend
 * Handles complex nested structures and data validation
 */
const cleanPreferencesPayload = (updates) => {
  const cleaned = {};

  // Handle supportCategories (array of enums)
  if (updates.supportCategories !== undefined) {
    if (Array.isArray(updates.supportCategories)) {
      cleaned.supportCategories = updates.supportCategories.filter(Boolean);
    } else {
      cleaned.supportCategories = [];
    }
  }

  // Handle serviceRegions (array of strings)
  if (updates.serviceRegions !== undefined) {
    if (Array.isArray(updates.serviceRegions)) {
      cleaned.serviceRegions = updates.serviceRegions
        .map(region => String(region).trim())
        .filter(Boolean);
    } else {
      cleaned.serviceRegions = [];
    }
  }

  // Handle specialRequirements (string)
  if (updates.specialRequirements !== undefined) {
    cleaned.specialRequirements = updates.specialRequirements 
      ? String(updates.specialRequirements).trim() 
      : '';
  }

  // Handle workerPreferences (nested object)
  if (updates.workerPreferences !== undefined) {
    const wp = updates.workerPreferences;
    cleaned.workerPreferences = {};
    
    if (wp.preferredGender !== undefined && wp.preferredGender !== null) {
      cleaned.workerPreferences.preferredGender = wp.preferredGender;
    }
    if (wp.preferredAgeGroup !== undefined && wp.preferredAgeGroup !== null) {
      cleaned.workerPreferences.preferredAgeGroup = wp.preferredAgeGroup;
    }
    if (wp.preferredExperienceAreas !== undefined) {
      if (Array.isArray(wp.preferredExperienceAreas)) {
        cleaned.workerPreferences.preferredExperienceAreas = wp.preferredExperienceAreas
          .map(area => String(area).trim())
          .filter(Boolean);
      } else {
        cleaned.workerPreferences.preferredExperienceAreas = [];
      }
    }
    if (wp.notes !== undefined) {
      cleaned.workerPreferences.notes = wp.notes ? String(wp.notes).trim() : '';
    }
  }

  // Handle culturalPreferences (deeply nested object)
  if (updates.culturalPreferences !== undefined) {
    const cp = updates.culturalPreferences;
    cleaned.culturalPreferences = {};

    // Dietary requirements
    if (cp.dietaryRequirements !== undefined) {
      cleaned.culturalPreferences.dietaryRequirements = {};
      const dr = cp.dietaryRequirements;
      
      if (dr.restrictions !== undefined) {
        if (Array.isArray(dr.restrictions)) {
          cleaned.culturalPreferences.dietaryRequirements.restrictions = dr.restrictions.filter(Boolean);
        } else {
          cleaned.culturalPreferences.dietaryRequirements.restrictions = [];
        }
      }
      if (dr.allergyDetails !== undefined) {
        cleaned.culturalPreferences.dietaryRequirements.allergyDetails = dr.allergyDetails 
          ? String(dr.allergyDetails).trim() 
          : '';
      }
      if (dr.notes !== undefined) {
        cleaned.culturalPreferences.dietaryRequirements.notes = dr.notes 
          ? String(dr.notes).trim() 
          : '';
      }
    }

    // Religious considerations
    if (cp.religiousConsiderations !== undefined) {
      cleaned.culturalPreferences.religiousConsiderations = {};
      const rc = cp.religiousConsiderations;
      
      if (rc.faith !== undefined) {
        cleaned.culturalPreferences.religiousConsiderations.faith = rc.faith 
          ? String(rc.faith).trim() 
          : '';
      }
      if (rc.observances !== undefined) {
        if (Array.isArray(rc.observances)) {
          cleaned.culturalPreferences.religiousConsiderations.observances = rc.observances
            .map(obs => String(obs).trim())
            .filter(Boolean);
        } else {
          cleaned.culturalPreferences.religiousConsiderations.observances = [];
        }
      }
      if (rc.genderSensitivity !== undefined) {
        cleaned.culturalPreferences.religiousConsiderations.genderSensitivity = Boolean(rc.genderSensitivity);
      }
      if (rc.notes !== undefined) {
        cleaned.culturalPreferences.religiousConsiderations.notes = rc.notes 
          ? String(rc.notes).trim() 
          : '';
      }
    }

    // Lifestyle notes
    if (cp.lifestyleNotes !== undefined) {
      cleaned.culturalPreferences.lifestyleNotes = {};
      const ln = cp.lifestyleNotes;
      
      if (ln.habits !== undefined) {
        if (Array.isArray(ln.habits)) {
          cleaned.culturalPreferences.lifestyleNotes.habits = ln.habits
            .map(habit => String(habit).trim())
            .filter(Boolean);
        } else {
          cleaned.culturalPreferences.lifestyleNotes.habits = [];
        }
      }
      if (ln.interests !== undefined) {
        if (Array.isArray(ln.interests)) {
          cleaned.culturalPreferences.lifestyleNotes.interests = ln.interests
            .map(interest => String(interest).trim())
            .filter(Boolean);
        } else {
          cleaned.culturalPreferences.lifestyleNotes.interests = [];
        }
      }
      if (ln.values !== undefined) {
        if (Array.isArray(ln.values)) {
          cleaned.culturalPreferences.lifestyleNotes.values = ln.values
            .map(value => String(value).trim())
            .filter(Boolean);
        } else {
          cleaned.culturalPreferences.lifestyleNotes.values = [];
        }
      }
      if (ln.notes !== undefined) {
        cleaned.culturalPreferences.lifestyleNotes.notes = ln.notes 
          ? String(ln.notes).trim() 
          : '';
      }
    }
  }

  // Handle availability (array of objects)
  if (updates.availability !== undefined) {
    if (Array.isArray(updates.availability)) {
      cleaned.availability = updates.availability
        .filter(avail => avail && avail.day && avail.timeSlots && Array.isArray(avail.timeSlots))
        .map(avail => ({
          day: avail.day,
          timeSlots: avail.timeSlots.filter(Boolean),
        }));
    } else {
      cleaned.availability = [];
    }
  }

  // Handle serviceDelivery (nested object with dates)
  if (updates.serviceDelivery !== undefined) {
    const sd = updates.serviceDelivery;
    cleaned.serviceDelivery = {};
    
    if (sd.inPerson !== undefined) {
      cleaned.serviceDelivery.inPerson = Boolean(sd.inPerson);
    }
    if (sd.remote !== undefined) {
      cleaned.serviceDelivery.remote = Boolean(sd.remote);
    }
    if (sd.preferredStartDate !== undefined) {
      // Handle date strings or Date objects
      if (sd.preferredStartDate) {
        const date = sd.preferredStartDate instanceof Date 
          ? sd.preferredStartDate 
          : new Date(sd.preferredStartDate);
        if (!isNaN(date.getTime())) {
          cleaned.serviceDelivery.preferredStartDate = date.toISOString();
        }
      }
    }
    if (sd.sessionDurationMins !== undefined && sd.sessionDurationMins !== null) {
      const duration = Number(sd.sessionDurationMins);
      if (!isNaN(duration) && duration > 0) {
        cleaned.serviceDelivery.sessionDurationMins = duration;
      }
    }
  }

  return cleaned;
};

/**
 * Update preferences on server
 * @param {Object} updates - Partial update object
 */
const updatePreferences = async (updates) => {
  // Validate that updates object has at least one field
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('At least one preference field must be provided');
  }

  // Clean and prepare payload
  const cleanedPayload = cleanPreferencesPayload(updates);

  // Validate payload structure before sending
  const hasFields = Object.keys(cleanedPayload).length > 0;
  if (!hasFields) {
    throw new Error('At least one preference field must be provided');
  }

  // Backend accepts flat structure: { supportCategories, serviceRegions, ... }
  // or nested: { preferences: { ... } }
  // We'll send flat structure as backend normalizes it
  const response = await clientProfileApi.updatePreferences(cleanedPayload);
  
  if (!response.success) {
    // Handle validation errors from backend (Zod errors)
    if (response.errors && Array.isArray(response.errors)) {
      const validationErrors = response.errors
        .map((err) => {
          const path = err.path?.join('.') || 'field';
          return `${path}: ${err.message}`;
        })
        .join(', ');
      throw new Error(`Validation failed: ${validationErrors}`);
    }
    throw new Error(response.message || 'Failed to update preferences');
  }

  // Backend returns { success: true, data: { preferences: {...} } }
  return response.data?.preferences || null;
};

/**
 * Main hook for preferences
 * Combines TanStack Query (server state) with Zustand (UI state)
 * 
 * @returns {Object} Combined query and mutation state
 */
export const usePreferences = () => {
  const queryClient = useQueryClient();
  const {
    isEditMode,
    draftValues,
    activeSection,
    setEditMode,
    setDraftValues,
    setActiveSection,
    lastError,
    setError,
    clearError,
    reset: resetUI,
  } = usePreferencesUIStore();

  // ─── Query: Fetch preferences ──────────────────────────────────────────────────
  const query = useQuery({
    queryKey: PREFERENCES_QUERY_KEYS.detail(),
    queryFn: fetchPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes - preferences don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: (failureCount, error) => {
      // Don't retry on 404 (profile not found) or 403 (deleted/forbidden)
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on reconnect
  });

  // ─── Mutation: Update preferences ─────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: updatePreferences,
    
    // Optimistic update for instant feedback
    onMutate: async (updates) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: PREFERENCES_QUERY_KEYS.detail() });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData(PREFERENCES_QUERY_KEYS.detail());

      // Optimistically update cache with deep merge for nested objects
      queryClient.setQueryData(PREFERENCES_QUERY_KEYS.detail(), (old) => {
        if (!old) return updates;
        
        // Deep merge for nested structures
        const merged = {
          ...old,
          ...updates,
        };

        // Deep merge workerPreferences
        if (updates.workerPreferences) {
          merged.workerPreferences = {
            ...(old.workerPreferences || {}),
            ...updates.workerPreferences,
          };
        }

        // Deep merge culturalPreferences
        if (updates.culturalPreferences) {
          merged.culturalPreferences = {
            ...(old.culturalPreferences || {}),
            ...updates.culturalPreferences,
          };
          
          // Deep merge nested cultural preference objects
          if (updates.culturalPreferences.dietaryRequirements) {
            merged.culturalPreferences.dietaryRequirements = {
              ...(old.culturalPreferences?.dietaryRequirements || {}),
              ...updates.culturalPreferences.dietaryRequirements,
            };
          }
          if (updates.culturalPreferences.religiousConsiderations) {
            merged.culturalPreferences.religiousConsiderations = {
              ...(old.culturalPreferences?.religiousConsiderations || {}),
              ...updates.culturalPreferences.religiousConsiderations,
            };
          }
          if (updates.culturalPreferences.lifestyleNotes) {
            merged.culturalPreferences.lifestyleNotes = {
              ...(old.culturalPreferences?.lifestyleNotes || {}),
              ...updates.culturalPreferences.lifestyleNotes,
            };
          }
        }

        // Deep merge serviceDelivery
        if (updates.serviceDelivery) {
          merged.serviceDelivery = {
            ...(old.serviceDelivery || {}),
            ...updates.serviceDelivery,
          };
        }

        return merged;
      });

      // Return context for rollback
      return { previousData };
    },

    // On error, rollback optimistic update
    onError: (error, updates, context) => {
      // Rollback to previous value
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(PREFERENCES_QUERY_KEYS.detail(), context.previousData);
      }

      // Set error in UI store
      const errorMessage = formatApiError(error);
      setError(errorMessage);
      toast.error(errorMessage, {
        id: 'preferences-update-error',
        duration: 5000,
      });
    },

    // On success, update UI state
    // Toast notification is handled in component for better UX with changed fields info
    onSuccess: (data, variables, context) => {
      // Ensure cache is updated with server response
      queryClient.setQueryData(PREFERENCES_QUERY_KEYS.detail(), data);
      
      // Reset UI state
      resetUI();
      
      // Invalidate profile completeness queries to trigger recalculation
      // Preferences don't directly affect completeness but may affect other calculations
      queryClient.invalidateQueries({
        queryKey: ['clientProfile', 'full'],
        refetchType: 'none', // Background refetch
      });
      
      // Default toast (can be overridden by component's onSuccess callback)
      // Component will handle toast with changed fields information
    },

    // Always invalidate to ensure consistency
    onSettled: () => {
      // Invalidate preferences query to mark as stale
      queryClient.invalidateQueries({
        queryKey: PREFERENCES_QUERY_KEYS.detail(),
        refetchType: 'none', // Don't refetch immediately, just mark as stale
      });
      
      // Invalidate full profile to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['clientProfile', 'full'],
        refetchType: 'none', // Background refetch
      });
    },
  });

  // ─── Helper functions ────────────────────────────────────────────────────────

  /**
   * Update preferences
   * @param {Object} updates - Partial update object
   * @param {Object} options - Mutation options
   */
  const update = (updates, options = {}) => {
    clearError(); // Clear any previous errors
    mutation.mutate(updates, options);
  };

  /**
   * Update preferences (async version)
   * @param {Object} updates - Partial update object
   * @param {Object} options - Mutation options
   * @returns {Promise} Promise that resolves with updated data
   */
  const updateAsync = (updates, options = {}) => {
    clearError();
    return mutation.mutateAsync(updates, options);
  };

  /**
   * Reset form to server data
   */
  const resetToServerData = () => {
    if (query.data) {
      setDraftValues(query.data);
    }
    clearError();
  };

  /**
   * Enter edit mode
   */
  const enterEditMode = () => {
    if (query.data) {
      setDraftValues(query.data);
    }
    setEditMode(true);
    clearError();
  };

  /**
   * Exit edit mode and discard changes
   */
  const exitEditMode = () => {
    setEditMode(false);
    setDraftValues(null);
    clearError();
  };

  // ─── Return combined state ───────────────────────────────────────────────────
  return {
    // Query state (from TanStack Query)
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    refetch: query.refetch,

    // Mutation state (from TanStack Query)
    update,
    updateAsync,
    isUpdating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    mutationError: mutation.error,

    // UI state (from Zustand)
    isEditMode,
    draftValues,
    activeSection,
    lastError,

    // UI actions (from Zustand)
    enterEditMode,
    exitEditMode,
    resetToServerData,
    setActiveSection,
    clearError,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook to prefetch preferences
 * Useful for prefetching on hover or route preloading
 */
export const usePrefetchPreferences = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: PREFERENCES_QUERY_KEYS.detail(),
      queryFn: fetchPreferences,
      staleTime: 5 * 60 * 1000,
    });
  };
};

/**
 * Hook to invalidate preferences cache
 * Useful when you know data has changed externally
 */
export const useInvalidatePreferences = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: PREFERENCES_QUERY_KEYS.all,
    });
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default usePreferences;
