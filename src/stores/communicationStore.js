/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT COMMUNICATION PREFERENCES STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Production-ready store for communication preferences management with proper
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
 * - Type-safe where possible
 * 
 * @module stores/communicationStore
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
 * Communication preferences data structure
 * @typedef {Object} CommunicationPreferences
 * @property {string} [preferredMethod] - 'email' | 'sms' | 'phone' | 'portal'
 * @property {string} [preferredLanguage] - Preferred language
 * @property {string[]} [accessibilityNeeds] - Array of accessibility needs
 * @property {string} [communicationNotes] - Additional notes
 */

/**
 * Query keys for TanStack Query
 */
export const COMMUNICATION_QUERY_KEYS = {
  all: ['clientProfile', 'communication'],
  detail: () => [...COMMUNICATION_QUERY_KEYS.all, 'detail'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE - UI STATE ONLY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Zustand store for UI state only
 * Does NOT duplicate server state - TanStack Query is the source of truth
 */
const useCommunicationUIStore = create(
  devtools(
    (set, get) => ({
      // ─── UI State ───────────────────────────────────────────────────────────
      isEditMode: false,
      draftValues: null, // Temporary form values before save
      accessibilityInput: '', // Temporary input for adding accessibility needs
      lastError: null, // Last error for UI display

      // ─── Actions ───────────────────────────────────────────────────────────
      setEditMode: (isEditMode) =>
        set({ isEditMode, draftValues: isEditMode ? get().draftValues : null }),

      setDraftValues: (values) => set({ draftValues: values }),

      setAccessibilityInput: (value) => set({ accessibilityInput: value }),

      setError: (error) => set({ lastError: error }),

      clearError: () => set({ lastError: null }),

      reset: () =>
        set({
          isEditMode: false,
          draftValues: null,
          accessibilityInput: '',
          lastError: null,
        }),
    }),
    { name: 'CommunicationUIStore' }
  )
);

// ═══════════════════════════════════════════════════════════════════════════════
// TANSTACK QUERY HOOKS - SERVER STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch communication preferences from server
 * Production-ready with proper caching and error handling
 */
const fetchCommunicationPreferences = async () => {
  const response = await clientProfileApi.getCommunication();
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch communication preferences');
  }

  // Normalize response - backend returns { contactPreferences: {...} }
  return response.data?.contactPreferences || null;
};

/**
 * Update communication preferences on server
 * @param {Partial<CommunicationPreferences>} updates - Partial update object
 * 
 * Backend validation schema expects: { contactPreferences: { preferredMethod, preferredLanguage, accessibilityNeeds, communicationNotes } }
 * However, the controller implementation may extract contactPreferences from the validated object.
 * We'll send the data in the format that matches the validation schema.
 */
const updateCommunicationPreferences = async (updates) => {
  // Validate that updates object has at least one field
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('At least one communication preference field must be provided'); 
  }

  // Prepare payload - ensure all fields are properly formatted
  // Clean and validate data before sending to backend
  const cleanedUpdates = {};
  
  // Handle preferredMethod (enum validation handled by backend)
  if (updates.preferredMethod !== undefined && updates.preferredMethod !== null) {
    cleanedUpdates.preferredMethod = updates.preferredMethod;
  }
  
  // Handle preferredLanguage (trim and validate)
  if (updates.preferredLanguage !== undefined && updates.preferredLanguage !== null) {
    const trimmed = String(updates.preferredLanguage).trim();
    if (trimmed) {
      cleanedUpdates.preferredLanguage = trimmed;
    }
  }
  
  // Handle accessibilityNeeds (array, filter empty values, trim strings)
  if (updates.accessibilityNeeds !== undefined) {
    if (Array.isArray(updates.accessibilityNeeds)) {
      // Filter out empty/null/undefined values and trim strings
      const cleaned = updates.accessibilityNeeds
        .filter(need => need != null && String(need).trim())
        .map(need => String(need).trim());
      cleanedUpdates.accessibilityNeeds = cleaned;
    } else {
      // If not an array, convert to empty array
      cleanedUpdates.accessibilityNeeds = [];
    }
  }
  
  // Handle communicationNotes (trim whitespace, allow empty string)
  if (updates.communicationNotes !== undefined) {
    cleanedUpdates.communicationNotes = updates.communicationNotes 
      ? String(updates.communicationNotes).trim() 
      : '';
  }

  // Wrap in contactPreferences object as expected by backend validation schema
  const payload = {
    contactPreferences: cleanedUpdates
  };

  // Validate payload structure before sending
  const hasFields = Object.keys(payload.contactPreferences).length > 0;
  if (!hasFields) {
    throw new Error('At least one communication preference field must be provided');
  }

  const response = await clientProfileApi.updateCommunication(payload);
  
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
    throw new Error(response.message || 'Failed to update communication preferences');
  }

  // Backend returns { success: true, data: { contactPreferences: {...} } }
  return response.data?.contactPreferences || null;
};

/**
 * Main hook for communication preferences
 * Combines TanStack Query (server state) with Zustand (UI state)
 * 
 * @returns {Object} Combined query and mutation state
 */
export const useCommunication = () => {
  const queryClient = useQueryClient();
  const {
    isEditMode,
    draftValues,
    setEditMode,
    setDraftValues,
    accessibilityInput,
    setAccessibilityInput,
    lastError,
    setError,
    clearError,
    reset: resetUI,
  } = useCommunicationUIStore();

  // ─── Query: Fetch communication preferences ──────────────────────────────────
  const query = useQuery({
    queryKey: COMMUNICATION_QUERY_KEYS.detail(),
    queryFn: fetchCommunicationPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes - communication prefs don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    retry: (failureCount, error) => {
      // Don't retry on 404 (profile not found) or 403 (deleted)
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on reconnect
  });

  // ─── Mutation: Update communication preferences ─────────────────────────────
  const mutation = useMutation({
    mutationFn: updateCommunicationPreferences,
    
    // Optimistic update for instant feedback
    onMutate: async (updates) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: COMMUNICATION_QUERY_KEYS.detail() });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData(COMMUNICATION_QUERY_KEYS.detail());

      // Optimistically update cache
      queryClient.setQueryData(COMMUNICATION_QUERY_KEYS.detail(), (old) => {
        if (!old) return updates;
        return { ...old, ...updates };
      });

      // Return context for rollback
      return { previousData };
    },

    // On error, rollback optimistic update
    onError: (error, updates, context) => {
      // Rollback to previous value
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(COMMUNICATION_QUERY_KEYS.detail(), context.previousData);
      }

      // Set error in UI store
      const errorMessage = formatApiError(error);
      setError(errorMessage);
      toast.error(errorMessage, {
        id: 'communication-update-error',
        duration: 5000,
      });
    },

    // On success, update UI state and show success message
    onSuccess: (data) => {
      // Ensure cache is updated with server response
      queryClient.setQueryData(COMMUNICATION_QUERY_KEYS.detail(), data);
      
      // Reset UI state
      resetUI();
      
      // Invalidate profile completeness queries to trigger recalculation
      // Communication preferences affect "Other Details" section (10% weight)
      queryClient.invalidateQueries({
        queryKey: ['clientProfile', 'full'],
        refetchType: 'none', // Background refetch
      });
      
      toast.success('Communication preferences updated successfully', {
        id: 'communication-update-success',
        duration: 3000,
      });
    },

    // Always invalidate to ensure consistency (even though optimistic update is in place)
    onSettled: () => {
      // Invalidate communication query to mark as stale
      queryClient.invalidateQueries({
        queryKey: COMMUNICATION_QUERY_KEYS.detail(),
        refetchType: 'none', // Don't refetch immediately, just mark as stale
      });
      
      // Invalidate full profile to ensure completeness is recalculated
      // Backend automatically recalculates completeness on save via pre-save hook
      queryClient.invalidateQueries({
        queryKey: ['clientProfile', 'full'],
        refetchType: 'none', // Background refetch
      });
    },
  });

  // ─── Helper functions ────────────────────────────────────────────────────────

  /**
   * Update communication preferences
   * @param {Partial<CommunicationPreferences>} updates - Partial update object
   * @param {Object} options - Mutation options
   */
  const update = (updates, options = {}) => {
    clearError(); // Clear any previous errors
    mutation.mutate(updates, options);
  };

  /**
   * Update communication preferences (async version)
   * @param {Partial<CommunicationPreferences>} updates - Partial update object
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
    setAccessibilityInput('');
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
    isError: mutation.isError,
    mutationError: mutation.error,

    // UI state (from Zustand)
    isEditMode,
    draftValues,
    accessibilityInput,
    setAccessibilityInput,
    lastError,

    // UI actions (from Zustand)
    enterEditMode,
    exitEditMode,
    resetToServerData,
    clearError,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook to prefetch communication preferences
 * Useful for prefetching on hover or route preloading
 */
export const usePrefetchCommunication = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: COMMUNICATION_QUERY_KEYS.detail(),
      queryFn: fetchCommunicationPreferences,
      staleTime: 5 * 60 * 1000,
    });
  };
};

/**
 * Hook to invalidate communication cache
 * Useful when you know data has changed externally
 */
export const useInvalidateCommunication = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: COMMUNICATION_QUERY_KEYS.all,
    });
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default useCommunication;
