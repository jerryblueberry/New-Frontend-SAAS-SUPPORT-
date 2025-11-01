// src/hooks/useReferences.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { referenceAPI } from '../api/references';

// Query Keys
export const referenceKeys = {
  all: ['references'],
  lists: () => [...referenceKeys.all, 'list'],
  list: (filters) => [...referenceKeys.lists(), { filters }],
  details: () => [...referenceKeys.all, 'detail'],
  detail: (id) => [...referenceKeys.details(), id],
  token: (token) => [...referenceKeys.all, 'token', token],
  worker: (workerId) => [...referenceKeys.all, 'worker', workerId],
  stats: () => [...referenceKeys.all, 'stats'],
  completionStats: (dateRange) => [...referenceKeys.all, 'completionStats', dateRange]
};

// Custom hook for reference queries
export const useReferences = (params = {}) => {
  const {
    page = 1,
    limit = 20,
    status = null,
    workerId = null,
    search = null,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    dateFrom = null,
    dateTo = null,
    enabled = true,
    refetchInterval = false,
    refetchOnWindowFocus = true
  } = params;

  // Development-only logging
  if (process.env.NODE_ENV === 'development') {
    if (!enabled) {
      console.debug('useReferences query is disabled');
    }
  }

  const queryKey = referenceKeys.list({
    page,
    limit,
    status,
    workerId,
    search,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo
  });

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const result = await referenceAPI.getAllReferences({
          page,
          limit,
          status,
          workerId,
          search,
          sortBy,
          sortOrder,
          dateFrom,
          dateTo
        });
        return result;
      } catch (error) {
        // Error is already logged in API layer
        throw error;
      }
    },
    enabled,
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus,
    refetchOnMount: true,
    refetchInterval,
    refetchIntervalInBackground: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      // Errors are handled by React Query and logged in API layer
      if (process.env.NODE_ENV === 'development') {
        console.debug('useReferences query error:', error.message);
      }
    }
  });
};

// Hook for reference by ID
export const useReferenceById = (id, options = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: referenceKeys.detail(id),
    queryFn: () => referenceAPI.getReferenceById(id),
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
    cacheTime: 300000 // 5 minutes
  });
};

// Hook for reference by token (public access)
export const useReferenceByToken = (token, options = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: referenceKeys.token(token),
    queryFn: () => referenceAPI.getReferenceByToken(token),
    enabled: enabled && !!token,
    staleTime: 30000,
    cacheTime: 300000
  });
};

// Hook for worker references
export const useWorkerReferences = (workerId, options = {}) => {
  const { enabled = true, ...restOptions } = options;

  return useQuery({
    queryKey: referenceKeys.worker(workerId),
    queryFn: async () => {
      try {
        const response = await referenceAPI.getWorkerReferences(workerId);
        return response;
      } catch (error) {
        // Log error in development only
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching worker references:', error);
        }
        throw error;
      }
    },
    enabled: enabled && !!workerId,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...restOptions
  });
};

// Hook for reference statistics
export const useReferenceStats = (options = {}) => {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: referenceKeys.stats(),
    queryFn: referenceAPI.getReferenceStats,
    enabled,
    staleTime: 60000, // 1 minute
    cacheTime: 300000 // 5 minutes
  });

  return {
    ...query,
    data: query.data?.data?.data || {}
  };
};

// Hook for completion statistics
export const useCompletionStats = (dateRange = null, options = {}) => {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: referenceKeys.completionStats(dateRange),
    queryFn: () => referenceAPI.getCompletionStats(dateRange),
    enabled,
    staleTime: 60000,
    cacheTime: 300000
  });

  return {
    ...query,
    data: query.data?.data?.data || {}
  };
};

// Mutation hooks
export const useSendReferenceEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: referenceAPI.sendReferenceEmail,
    onSuccess: (data, referenceId) => {
      // Invalidate related queries
      queryClient.invalidateQueries(referenceKeys.detail(referenceId));
      queryClient.invalidateQueries(referenceKeys.lists());
      queryClient.invalidateQueries(referenceKeys.stats());
      
      toast.success('Reference check email sent successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send reference email');
    }
  });
};

export const useResendReferenceEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: referenceAPI.resendReferenceEmail,
    onSuccess: (data, referenceId) => {
      queryClient.invalidateQueries(referenceKeys.detail(referenceId));
      queryClient.invalidateQueries(referenceKeys.lists());
      
      toast.success('Reference email resent successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to resend reference email');
    }
  });
};

export const useUpdateReferenceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }) => referenceAPI.updateReferenceStatus(id, status, notes),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries(referenceKeys.detail(id));
      queryClient.invalidateQueries(referenceKeys.lists());
      queryClient.invalidateQueries(referenceKeys.stats());
      
      toast.success('Reference status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update reference status');
    }
  });
};

export const useAddAdminNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note, isPrivate }) => referenceAPI.addAdminNote(id, note, isPrivate),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries(referenceKeys.detail(id));
      
      toast.success('Admin note added successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add admin note');
    }
  });
};

export const useDeleteReference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: referenceAPI.deleteReference,
    onSuccess: (data, referenceId) => {
      queryClient.invalidateQueries(referenceKeys.all);
      
      toast.success('Reference deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete reference');
    }
  });
};

export const useSyncReferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workerProfileId, questionnaireId }) => 
      referenceAPI.syncReferences(workerProfileId, questionnaireId),
    onSuccess: (data) => {
      queryClient.invalidateQueries(referenceKeys.lists());
      queryClient.invalidateQueries(referenceKeys.stats());
      
      toast.success('References synced successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to sync references');
    }
  });
};

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status, notes }) => referenceAPI.bulkUpdateStatus(ids, status, notes),
    onSuccess: (data, { ids }) => {
      // Invalidate all affected references
      ids.forEach(id => {
        queryClient.invalidateQueries(referenceKeys.detail(id));
      });
      queryClient.invalidateQueries(referenceKeys.lists());
      queryClient.invalidateQueries(referenceKeys.stats());
      
      toast.success(`${ids.length} references updated successfully`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update references');
    }
  });
};

export const useBulkSendEmails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids }) => referenceAPI.bulkSendEmails(ids),
    onSuccess: (data, { ids }) => {
      ids.forEach(id => {
        queryClient.invalidateQueries(referenceKeys.detail(id));
      });
      queryClient.invalidateQueries(referenceKeys.lists());
      
      toast.success(`${ids.length} reference emails sent successfully`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send reference emails');
    }
  });
};

export const useExportReferences = () => {
  return useMutation({
    mutationFn: referenceAPI.exportReferences,
    onSuccess: (data, params) => {
      // Create download link for the blob
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `references-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('References exported successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to export references');
    }
  });
};

// Combined hook for reference management
export const useReferenceManagement = (params = {}) => {
  const referencesQuery = useReferences(params);
  const statsQuery = useReferenceStats();
  
  const sendEmailMutation = useSendReferenceEmail();
  const resendEmailMutation = useResendReferenceEmail();
  const updateStatusMutation = useUpdateReferenceStatus();
  const addNoteMutation = useAddAdminNote();
  const deleteMutation = useDeleteReference();
  const syncMutation = useSyncReferences();
  const bulkUpdateMutation = useBulkUpdateStatus();
  const bulkSendMutation = useBulkSendEmails();
  const exportMutation = useExportReferences();

  return {
    // Queries
    references: referencesQuery.data?.data?.data?.references || [],
    totalReferences: referencesQuery.data?.data?.data?.total || 0,
    totalPages: referencesQuery.data?.data?.data?.totalPages || 0,
    currentPage: referencesQuery.data?.data?.data?.currentPage || 1,
    stats: statsQuery.data?.data?.data || {},
    
    // Loading states
    isLoading: referencesQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    
    // Mutations
    sendEmail: sendEmailMutation.mutate,
    resendEmail: resendEmailMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    addNote: addNoteMutation.mutate,
    deleteReference: deleteMutation.mutate,
    syncReferences: syncMutation.mutate,
    bulkUpdateStatus: bulkUpdateMutation.mutate,
    bulkSendEmails: bulkSendMutation.mutate,
    exportReferences: exportMutation.mutate,
    
    // Mutation states
    isSendingEmail: sendEmailMutation.isLoading,
    isResendingEmail: resendEmailMutation.isLoading,
    isUpdatingStatus: updateStatusMutation.isLoading,
    isAddingNote: addNoteMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isSyncing: syncMutation.isLoading,
    isBulkUpdating: bulkUpdateMutation.isLoading,
    isBulkSending: bulkSendMutation.isLoading,
    isExporting: exportMutation.isLoading,
    
    // Refetch functions
    refetch: referencesQuery.refetch,
    refetchStats: statsQuery.refetch
  };
};

export default useReferenceManagement;
