import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, getClientById, updateClient, deleteClient, exportClients } from '../services/adminClientService';
import { toast } from 'react-toastify';

// Query keys
export const clientKeys = {
  all: ['clients'],
  lists: () => [...clientKeys.all, 'list'],
  list: (filters) => [...clientKeys.lists(), filters],
  details: () => [...clientKeys.all, 'detail'],
  detail: (id) => [...clientKeys.details(), id],
};

/**
 * Hook for fetching clients list with filters, pagination, sorting
 */
export const useClients = (params = {}, options = {}) => {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => getClients(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    retry: 1,
    ...options,
  });
};

/**
 * Hook for fetching single client details
 */
export const useClientDetails = (id, options = {}) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClientById(id, options),
    enabled: !!id,
    staleTime: 30000, // 30 seconds - shorter for real-time updates
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Auto-refetch when window regains focus
    refetchInterval: 60000, // Auto-refetch every 60 seconds when page is visible
    refetchIntervalInBackground: false, // Don't refetch in background
    retry: 1,
  });
};

/**
 * Hook for updating client with optimistic updates
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateClient(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: clientKeys.detail(id) });
      
      // Snapshot previous value
      const previousClient = queryClient.getQueryData(clientKeys.detail(id));
      
      // Optimistically update to the new value
      if (previousClient) {
        queryClient.setQueryData(clientKeys.detail(id), (old) => ({
          ...old,
          data: {
            ...old.data,
            ...data,
            updatedAt: new Date().toISOString(),
          },
        }));
      }
      
      return { previousClient };
    },
    onSuccess: (responseData, variables) => {
      // Update with actual server response
      queryClient.setQueryData(clientKeys.detail(variables.id), responseData);
      
      // Invalidate list queries to refresh table
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      
      toast.success('Client updated successfully');
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousClient) {
        queryClient.setQueryData(clientKeys.detail(variables.id), context.previousClient);
      }
      
      const message = error.response?.data?.message || 'Failed to update client';
      toast.error(message);
    },
    // Always refetch after error or success
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook for deleting client (soft delete)
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteClient(id),
    onSuccess: (data, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) });
      toast.success('Client deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete client';
      toast.error(message);
    },
  });
};

/**
 * Hook for exporting clients as CSV
 */
export const useExportClients = () => {
  return useMutation({
    mutationFn: (params) => exportClients(params),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `clients_export_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Clients exported successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to export clients';
      toast.error(message);
    },
  });
};

