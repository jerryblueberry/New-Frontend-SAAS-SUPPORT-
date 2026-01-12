/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CLIENT PROFILE MANAGEMENT STORE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * ⚠️ USAGE: This store is for client profile management pages (/client/profile/*)
 * 
 * For onboarding flow (/client-onboarding), use useClientOnboardingStore instead.
 * 
 * Production-ready Zustand store for client profile management:
 * - Minimal API calls with PATCH support for partial updates
 * - TanStack Query integration for efficient caching
 * - Optimistic updates for better UX
 * - Centralized state management for all profile sections
 * 
 * Design Philosophy:
 * - Separate stores for different concerns (onboarding vs. profile management)
 * - Optimistic updates for instant feedback
 * - Automatic cache invalidation on mutations
 * - Error handling with user-friendly messages
 * 
 * Used in:
 * - BasicInformation.jsx (/client/profile)
 * - Preferences.jsx (/client/profile/preferences)
 * - CarePlan.jsx (/client/profile/care-plan)
 * - Communication.jsx (/client/profile/communication)
 * - BillingPreferences.jsx (/client/billing/preferences)
 * - Invoices.jsx (/client/billing/invoices)
 * - ClientProfile.jsx (main profile display page)
 * 
 * NOT used in:
 * - ClientOnboarding.jsx (uses useClientOnboardingStore)
 * 
 * @module stores/useClientProfileStore
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as clientProfileApi from '../api/clientProfile';
import { formatApiError } from '../utils/errorFormatter';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════════════════

const useClientProfileStore = create(
  devtools(
    (set, get) => ({
      // ─── State ───────────────────────────────────────────────────────────
      isLoading: false,
      error: null,
      
      // Profile sections cache
      sections: {
        basic: null,
        preferences: null,
        carePlan: null,
        communication: null,
        billing: null,
        documents: [],
        team: [],
        analytics: null,
        settings: {
          consents: null,
          locale: null,
        },
      },
      
      // ─── Actions ─────────────────────────────────────────────────────────
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      updateSection: (section, data) => set((state) => ({
        sections: {
          ...state.sections,
          [section]: data,
        },
      })),
      
      clearError: () => set({ error: null }),
    }),
    { name: 'ClientProfileStore' }
  )
);

// ═══════════════════════════════════════════════════════════════════════════════
// TANSTACK QUERY HOOKS - PROFILE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get full client profile (all sections)
 * Production-ready hook with proper error handling and caching
 */
export const useClientProfile = () => {
  return useQuery({
    queryKey: ['clientProfile', 'full'],
    queryFn: async () => {
      const response = await clientProfileApi.getClientProfile();
      // Axios wraps response in .data, backend returns { profile }
      if (response.data?.profile) {
        return response.data.profile;
      }
      // Handle case where profile is null (first-time user)
      if (response.data?.message === 'No profile found. Please complete your onboarding.') {
        return null;
      }
      // Handle deleted profile
      if (response.data?.code === 'PROFILE_DELETED') {
        throw new Error(response.data.message || 'Your profile has been deactivated');
      }
      throw new Error(response.data?.message || 'Failed to fetch client profile');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Get basic information
 */
export const useBasicInfo = () => {
  const queryClient = useQueryClient();
  const { updateSection } = useClientProfileStore();
  
  const query = useQuery({
    queryKey: ['clientProfile', 'basic'],
    queryFn: async () => {
      const response = await clientProfileApi.getBasicInfo();
      if (response.success) {
        updateSection('basic', response.data);
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch basic info');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
  
  const mutation = useMutation({
    mutationFn: async (updates) => {
      try {
        const response = await clientProfileApi.updateBasicInfo(updates);
        // Axios returns response.data directly, which contains { success, data, message }
        if (response.success) {
          return response.data;
        }
        // If response has success: false, create error with proper structure
        const error = new Error(response.message || 'Failed to update basic info');
        error.response = { data: response };
        throw error;
      } catch (error) {
        // Axios errors already have error.response.data structure
        // Just re-throw to preserve the structure
        throw error;
      }
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['clientProfile', 'basic'] });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['clientProfile', 'basic']);
      
      // Optimistically update only always-editable fields
      // Don't optimistically update restricted fields to avoid UI inconsistencies
      const alwaysEditableFields = ['ndisNumber', 'address', 'emergencyContact'];
      const optimisticUpdates = {};
      Object.keys(updates).forEach(key => {
        if (alwaysEditableFields.includes(key)) {
          optimisticUpdates[key] = updates[key];
        }
      });
      
      if (Object.keys(optimisticUpdates).length > 0) {
        queryClient.setQueryData(['clientProfile', 'basic'], (old) => ({
          ...old,
          ...optimisticUpdates,
        }));
      }
      
      return { previous };
    },
    onError: (error, updates, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['clientProfile', 'basic'], context.previous);
      }
      // Error message is handled in the component for better UX
      // Don't show toast here as component handles it with more context
    },
    onSuccess: (data) => {
      updateSection('basic', data);
      // Success toast is handled in component for consistency
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'basic'] });
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'full'] }); // Also invalidate full profile
    },
  });
  
  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

/**
 * Get preferences
 */
export const usePreferences = () => {
  const queryClient = useQueryClient();
  const { updateSection } = useClientProfileStore();
  
  const query = useQuery({
    queryKey: ['clientProfile', 'preferences'],
    queryFn: async () => {
      const response = await clientProfileApi.getPreferences();
      if (response.success) {
        updateSection('preferences', response.data.preferences);
        return response.data.preferences;
      }
      throw new Error(response.message || 'Failed to fetch preferences');
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  
  const mutation = useMutation({
    mutationFn: async (updates) => {
      try {
        const response = await clientProfileApi.updatePreferences(updates);
        if (!response.success) {
          // Create error with response message for better formatting
          const error = new Error(response.message || 'Failed to update preferences');
          error.response = {
            data: response,
            status: 400,
          };
          throw error;
        }
        // Return both preferences data and metadata
        return {
          preferences: response.data.preferences,
          fieldsUpdated: response.fieldsUpdated || [],
          changes: response.changes || 0,
        };
      } catch (error) {
        // Preserve original error structure for formatApiError
        if (error.response) {
          throw error;
        }
        // Wrap network/unknown errors
        const wrappedError = new Error(error.message || 'Failed to update preferences');
        wrappedError.response = error.response || {
          data: { message: error.message },
          status: error.status || 500,
        };
        throw wrappedError;
      }
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['clientProfile', 'preferences'] });
      
      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData(['clientProfile', 'preferences']);
      
      // Optimistically update cache
      queryClient.setQueryData(['clientProfile', 'preferences'], (old) => {
        if (!old) return updates;
        return {
          ...old,
          ...updates,
          // Deep merge nested objects
          workerPreferences: updates.workerPreferences 
            ? { ...old.workerPreferences, ...updates.workerPreferences }
            : old.workerPreferences,
          serviceDelivery: updates.serviceDelivery
            ? { ...old.serviceDelivery, ...updates.serviceDelivery }
            : old.serviceDelivery,
        };
      });
      
      return { previous };
    },
    onError: (error, updates, context) => {
      // Rollback optimistic update on error
      if (context?.previous) {
        queryClient.setQueryData(['clientProfile', 'preferences'], context.previous);
      }
      
      // Format and show error message
      const message = formatApiError(error);
      toast.error(message, {
        id: 'preferences-update-error',
        duration: 6000,
        icon: '❌',
        style: {
          borderRadius: '8px',
          background: '#d32f2f',
          color: '#fff',
          maxWidth: '500px',
          whiteSpace: 'pre-line',
        },
      });
    },
    onSuccess: (data, variables, context) => {
      // Update store with server response
      updateSection('preferences', data.preferences);
      
      // Show success message with field count if available
      const fieldsCount = data.fieldsUpdated?.length || 0;
      const successMessage = fieldsCount > 0
        ? `Preferences updated successfully (${fieldsCount} field${fieldsCount > 1 ? 's' : ''} changed)`
        : 'Preferences updated successfully';
      
      toast.success(successMessage, {
        id: 'preferences-update-success',
        duration: 4000,
        icon: '✅',
        style: {
          borderRadius: '8px',
          background: '#2e7d32',
          color: '#fff',
        },
      });
    },
    onSettled: () => {
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'preferences'] });
    },
  });
  
  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

/**
 * Get care plan
 */
export const useCarePlan = () => {
  const queryClient = useQueryClient();
  const { updateSection } = useClientProfileStore();
  
  const query = useQuery({
    queryKey: ['clientProfile', 'carePlan'],
    queryFn: async () => {
      const response = await clientProfileApi.getCarePlan();
      if (response.success) {
        updateSection('carePlan', response.data.carePlanSummary);
        return response.data.carePlanSummary;
      }
      throw new Error(response.message || 'Failed to fetch care plan');
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  
  const mutation = useMutation({
    mutationFn: async (updates) => {
      try {
        const response = await clientProfileApi.updateCarePlan(updates);
        if (!response.success) {
          // Create error with response message for better formatting
          const error = new Error(response.message || 'Failed to update care plan');
          error.response = {
            data: response,
            status: 400,
          };
          throw error;
        }
        // Return both care plan data and metadata
        return {
          carePlanSummary: response.data.carePlanSummary,
          fieldsUpdated: response.fieldsUpdated || [],
          changes: response.changes || 0,
        };
      } catch (error) {
        // Preserve original error structure for formatApiError
        if (error.response) {
          throw error;
        }
        // Wrap network/unknown errors
        const wrappedError = new Error(error.message || 'Failed to update care plan');
        wrappedError.response = error.response || {
          data: { message: error.message },
          status: error.status || 500,
        };
        throw wrappedError;
      }
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['clientProfile', 'carePlan'] });
      
      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData(['clientProfile', 'carePlan']);
      
      // Optimistically update cache
      queryClient.setQueryData(['clientProfile', 'carePlan'], (old) => {
        if (!old) return updates;
        return {
          ...old,
          ...updates,
          // Handle date strings - convert to ISO strings if needed
          planStartDate: updates.planStartDate || old.planStartDate,
          planEndDate: updates.planEndDate || old.planEndDate,
          // Merge goals array properly
          goals: updates.goals !== undefined ? updates.goals : old.goals,
        };
      });
      
      return { previous };
    },
    onError: (error, updates, context) => {
      // Rollback optimistic update on error
      if (context?.previous) {
        queryClient.setQueryData(['clientProfile', 'carePlan'], context.previous);
      }
      
      // Format and show error message
      const message = formatApiError(error);
      toast.error(message, {
        id: 'care-plan-update-error',
        duration: 6000,
        icon: '❌',
        style: {
          borderRadius: '8px',
          background: '#d32f2f',
          color: '#fff',
          maxWidth: '500px',
          whiteSpace: 'pre-line',
        },
      });
    },
    onSuccess: (data, variables, context) => {
      // Update store with server response
      updateSection('carePlan', data.carePlanSummary);
      
      // Show success message with field count if available
      const fieldsCount = data.fieldsUpdated?.length || 0;
      const successMessage = fieldsCount > 0
        ? `Care plan updated successfully (${fieldsCount} field${fieldsCount > 1 ? 's' : ''} changed)`
        : 'Care plan updated successfully';
      
      toast.success(successMessage, {
        id: 'care-plan-update-success',
        duration: 4000,
        icon: '✅',
        style: {
          borderRadius: '8px',
          background: '#2e7d32',
          color: '#fff',
        },
      });
    },
    onSettled: () => {
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'carePlan'] });
    },
  });
  
  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

/**
 * Get communication preferences
 */
export const useCommunication = () => {
  const queryClient = useQueryClient();
  const { updateSection } = useClientProfileStore();
  
  const query = useQuery({
    queryKey: ['clientProfile', 'communication'],
    queryFn: async () => {
      const response = await clientProfileApi.getCommunication();
      if (response.success) {
        updateSection('communication', response.data.contactPreferences);
        return response.data.contactPreferences;
      }
      throw new Error(response.message || 'Failed to fetch communication preferences');
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  
  const mutation = useMutation({
    mutationFn: async (updates) => {
      const response = await clientProfileApi.updateCommunication(updates);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update communication preferences');
      }
      return response.data.contactPreferences;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['clientProfile', 'communication'] });
      const previous = queryClient.getQueryData(['clientProfile', 'communication']);
      queryClient.setQueryData(['clientProfile', 'communication'], (old) => ({
        ...old,
        ...updates,
      }));
      return { previous };
    },
    onError: (error, updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['clientProfile', 'communication'], context.previous);
      }
      const message = formatApiError(error);
      toast.error(message, { id: 'communication-update-error' });
    },
    onSuccess: (data) => {
      updateSection('communication', data);
      toast.success('Communication preferences updated successfully', { id: 'communication-update-success' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'communication'] });
    },
  });
  
  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTS HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * List documents with filters
 */
export const useDocuments = (params = {}) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['clientProfile', 'documents', params],
    queryFn: async () => {
      const response = await clientProfileApi.listDocuments(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch documents');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
  
  const uploadMutation = useMutation({
    mutationFn: clientProfileApi.uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'documents'] });
      toast.success('Document uploaded successfully', { id: 'document-upload-success' });
    },
    onError: (error) => {
      const message = formatApiError(error);
      toast.error(message, { id: 'document-upload-error' });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => clientProfileApi.updateDocument(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'documents'] });
      toast.success('Document updated successfully', { id: 'document-update-success' });
    },
    onError: (error) => {
      const message = formatApiError(error);
      toast.error(message, { id: 'document-update-error' });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: clientProfileApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'documents'] });
      toast.success('Document deleted successfully', { id: 'document-delete-success' });
    },
    onError: (error) => {
      const message = formatApiError(error);
      toast.error(message, { id: 'document-delete-error' });
    },
  });
  
  return {
    ...query,
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    update: updateMutation.mutate,
    updateAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    remove: deleteMutation.mutate,
    removeAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get billing preferences
 */
export const useBilling = () => {
  const queryClient = useQueryClient();
  const { updateSection } = useClientProfileStore();
  
  const query = useQuery({
    queryKey: ['clientProfile', 'billing'],
    queryFn: async () => {
      const response = await clientProfileApi.getBillingPreferences();
      if (response.success) {
        updateSection('billing', response.data.billingPreferences);
        return response.data.billingPreferences;
      }
      throw new Error(response.message || 'Failed to fetch billing preferences');
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  
  const mutation = useMutation({
    mutationFn: async (updates) => {
      try {
        const response = await clientProfileApi.updateBillingPreferences(updates);
        if (!response.success) {
          // Create error with response message for better formatting
          const error = new Error(response.message || 'Failed to update billing preferences');
          error.response = {
            data: response,
            status: 400,
          };
          throw error;
        }
        // Return both billing data and metadata
        return {
          billingPreferences: response.data.billingPreferences,
          fieldsUpdated: response.fieldsUpdated || [],
          changes: response.changes || 0,
        };
      } catch (error) {
        // Preserve original error structure for formatApiError
        if (error.response) {
          throw error;
        }
        // Wrap network/unknown errors
        const wrappedError = new Error(error.message || 'Failed to update billing preferences');
        wrappedError.response = error.response || {
          data: { message: error.message },
          status: error.status || 500,
        };
        throw wrappedError;
      }
    },
    onMutate: async (updates) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['clientProfile', 'billing'] });
      
      // Snapshot previous value for rollback
      const previous = queryClient.getQueryData(['clientProfile', 'billing']);
      
      // Optimistically update cache
      queryClient.setQueryData(['clientProfile', 'billing'], (old) => {
        if (!old) return updates;
        return {
          ...old,
          ...updates,
          // Deep merge nested objects
          billingAddress: updates.billingAddress
            ? { ...old.billingAddress, ...updates.billingAddress }
            : old.billingAddress,
        };
      });
      
      return { previous };
    },
    onError: (error, updates, context) => {
      // Rollback optimistic update on error
      if (context?.previous) {
        queryClient.setQueryData(['clientProfile', 'billing'], context.previous);
      }
      
      // Format and show error message
      const message = formatApiError(error);
      toast.error(message, {
        id: 'billing-update-error',
        duration: 6000,
        icon: '❌',
        style: {
          borderRadius: '8px',
          background: '#d32f2f',
          color: '#fff',
          maxWidth: '500px',
          whiteSpace: 'pre-line',
        },
      });
    },
    onSuccess: (data, variables, context) => {
      // Update store with server response
      if (data.billingPreferences) {
        updateSection('billing', data.billingPreferences);
      }
      
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'billing'] });
      
      // Show success message with change count
      const changeCount = data.changes || 0;
      const message = changeCount > 0
        ? `Billing preferences updated successfully (${changeCount} ${changeCount === 1 ? 'field' : 'fields'} changed)`
        : 'Billing preferences updated successfully';
      
      toast.success(message, {
        id: 'billing-update-success',
        duration: 4000,
        icon: '✅',
        style: {
          borderRadius: '8px',
          background: '#2e7d32',
          color: '#fff',
          maxWidth: '500px',
        },
      });
    },
  });
  
  return {
    ...query,
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// INVOICE HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * List invoices with filtering and pagination
 */
export const useInvoices = (params = {}) => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['clientProfile', 'invoices', params],
    queryFn: async () => {
      const response = await clientProfileApi.listInvoices(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch invoices');
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
  
  const downloadMutation = useMutation({
    mutationFn: async (invoiceId) => {
      const response = await clientProfileApi.downloadInvoice(invoiceId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to download invoice');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Open PDF in new tab
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
        toast.success('Invoice opened in new tab', {
          id: 'invoice-download-success',
          duration: 3000,
        });
      } else {
        toast.error('PDF URL not available', {
          id: 'invoice-download-error',
        });
      }
    },
    onError: (error) => {
      const message = formatApiError(error);
      toast.error(message, {
        id: 'invoice-download-error',
        duration: 6000,
      });
    },
  });
  
  return {
    ...query,
    invoices: query.data?.invoices || [],
    pagination: query.data?.pagination || null,
    download: downloadMutation.mutate,
    downloadAsync: downloadMutation.mutateAsync,
    isDownloading: downloadMutation.isPending,
  };
};

/**
 * Get single invoice by ID
 */
export const useInvoice = (invoiceId) => {
  return useQuery({
    queryKey: ['clientProfile', 'invoices', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      const response = await clientProfileApi.getInvoice(invoiceId);
      if (response.success) {
        return response.data.invoice;
      }
      throw new Error(response.message || 'Failed to fetch invoice');
    },
    enabled: !!invoiceId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get engagement metrics
 */
export const useEngagementMetrics = () => {
  return useQuery({
    queryKey: ['clientProfile', 'analytics', 'engagement'],
    queryFn: async () => {
      const response = await clientProfileApi.getEngagementMetrics();
      if (response.success) {
        return response.data.engagementMetrics;
      }
      throw new Error(response.message || 'Failed to fetch engagement metrics');
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

/**
 * Get activity history
 */
export const useActivityHistory = (params = {}) => {
  return useQuery({
    queryKey: ['clientProfile', 'analytics', 'activity', params],
    queryFn: async () => {
      const response = await clientProfileApi.getActivityHistory(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch activity history');
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

/**
 * Get audit log
 */
export const useAuditLog = (params = {}) => {
  return useQuery({
    queryKey: ['clientProfile', 'analytics', 'auditLog', params],
    queryFn: async () => {
      const response = await clientProfileApi.getAuditLog(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch audit log');
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get and update consents
 */
export const useConsents = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['clientProfile', 'settings', 'consents'],
    queryFn: async () => {
      const response = await clientProfileApi.getConsents();
      if (response.success) {
        return response.data.consents;
      }
      throw new Error(response.message || 'Failed to fetch consents');
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  
  const mutation = useMutation({
    mutationFn: async (updates) => {
      const response = await clientProfileApi.updateConsents(updates);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update consents');
      }
      return response.data.consents;
    },
    onSuccess: () => {
      toast.success('Consents updated successfully', { id: 'consents-update-success' });
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'settings', 'consents'] });
    },
    onError: (error) => {
      const message = formatApiError(error);
      toast.error(message, { id: 'consents-update-error' });
    },
  });
  
  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

/**
 * Get and update locale settings
 */
export const useLocaleSettings = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['clientProfile', 'settings', 'locale'],
    queryFn: async () => {
      const response = await clientProfileApi.getLocaleSettings();
      if (response.success) {
        return response.data.localeSettings;
      }
      throw new Error(response.message || 'Failed to fetch locale settings');
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  
  const mutation = useMutation({
    mutationFn: async (updates) => {
      const response = await clientProfileApi.updateLocaleSettings(updates);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update locale settings');
      }
      return response.data.localeSettings;
    },
    onSuccess: () => {
      toast.success('Locale settings updated successfully', { id: 'locale-update-success' });
      queryClient.invalidateQueries({ queryKey: ['clientProfile', 'settings', 'locale'] });
    },
    onError: (error) => {
      const message = formatApiError(error);
      toast.error(message, { id: 'locale-update-error' });
    },
  });
  
  return {
    ...query,
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
};

// ────────────────────────────────────────────────────────────
// Export store
// ────────────────────────────────────────────────────────────

export default useClientProfileStore;

