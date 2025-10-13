// src/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { debounce } from 'lodash';
import { notificationAPI } from '../api/notifications';
import useNotificationStore from '../stores/notificationStore';

// Query Keys
export const notificationKeys = {
  all: ['notifications'],
  lists: () => [...notificationKeys.all, 'list'],
  list: (filters) => [...notificationKeys.lists(), { filters }],
  details: () => [...notificationKeys.all, 'detail'],
  detail: (id) => [...notificationKeys.details(), id],
  unreadCount: () => [...notificationKeys.all, 'unreadCount'],
  recent: () => [...notificationKeys.all, 'recent'],
  stats: () => [...notificationKeys.all, 'stats'],
  poll: (since) => [...notificationKeys.all, 'poll', { since }]
};

// Custom hook for notification queries
export const useNotifications = (params = {}) => {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    type = null,
    since = null,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    enabled = true,
    refetchInterval = false,
    refetchOnWindowFocus = true
  } = params;

  return useQuery({
    queryKey: notificationKeys.list({
      page,
      limit,
      unreadOnly,
      type,
      since,
      sortBy,
      sortOrder
    }),
    queryFn: () => notificationAPI.getNotifications({
      page,
      limit,
      unreadOnly,
      type,
      since,
      sortBy,
      sortOrder
    }),
    enabled,
    staleTime: 10000, // 10 seconds - more frequent updates
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus,
    refetchOnMount: true,
    refetchInterval, // Support polling interval
    refetchIntervalInBackground: false
  });
};

// Hook for unread count with optimized real-time updates
export const useUnreadCount = (options = {}) => {
  const {
    refetchInterval = 30000, // 30 seconds default
    refetchIntervalInBackground = true,
    refetchOnWindowFocus = true,
    refetchOnMount = true,
    enabled = true
  } = options;

  const { setUnreadCount, setLastChecked } = useNotificationStore();

  const query = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationAPI.getUnreadCount,
    enabled,
    refetchInterval,
    refetchIntervalInBackground,
    refetchOnWindowFocus,
    refetchOnMount,
    staleTime: 0, // Always consider stale for real-time updates
    cacheTime: 60000, // Cache for 1 minute
    onSuccess: (data) => {
      setUnreadCount(data.data.unreadCount);
      setLastChecked(new Date());
    }
  });

  return query;
};

// Hook for recent notifications
export const useRecentNotifications = (options = {}) => {
  const {
    limit = 5,
    enabled = true
  } = options;

  const { setRecentNotifications } = useNotificationStore();

  const query = useQuery({
    queryKey: notificationKeys.recent(),
    queryFn: () => notificationAPI.getRecentNotifications(limit),
    enabled,
    staleTime: 10000, // 10 seconds
    cacheTime: 60000, // 1 minute
    onSuccess: (data) => {
      setRecentNotifications(data.data.notifications);
    }
  });

  return query;
};

// Hook for notification polling
export const useNotificationPolling = (options = {}) => {
  const {
    enabled = true,
    interval = 30000 // 30 seconds
  } = options;

  const { lastChecked, incrementUnreadCount, addRecentNotification } = useNotificationStore();

  const query = useQuery({
    queryKey: notificationKeys.poll(lastChecked),
    queryFn: () => notificationAPI.pollNotifications(lastChecked),
    enabled: enabled && !!lastChecked,
    refetchInterval: interval,
    refetchIntervalInBackground: true,
    staleTime: 0,
    cacheTime: 0,
    onSuccess: (data) => {
      const { notifications, hasNewNotifications } = data.data;
      
      if (hasNewNotifications && notifications.length > 0) {
        // Increment unread count for new notifications
        notifications.forEach(notification => {
          if (!notification.read) {
            incrementUnreadCount();
            addRecentNotification(notification);
          }
        });
      }
    }
  });

  return query;
};

// Hook for notification statistics
export const useNotificationStats = (options = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: notificationAPI.getNotificationStats,
    enabled,
    staleTime: 60000, // 1 minute
    cacheTime: 300000 // 5 minutes
  });
};

// Hook for notifications by type
export const useNotificationsByType = (type, params = {}) => {
  const {
    page = 1,
    limit = 20,
    unreadOnly = false,
    since = null,
    enabled = true
  } = params;

  return useQuery({
    queryKey: notificationKeys.list({ ...params, type }),
    queryFn: () => notificationAPI.getNotificationsByType(type, {
      page,
      limit,
      unreadOnly,
      since
    }),
    enabled: enabled && !!type,
    staleTime: 30000,
    cacheTime: 300000
  });
};

// Mutation hooks - Mark single notification as read (silent, no toast)
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { decrementUnreadCount, updateRecentNotification } = useNotificationStore();

  return useMutation({
    mutationFn: notificationAPI.markAsRead,
    onSuccess: (data, notificationId) => {
      // Invalidate related queries for UI update
      queryClient.invalidateQueries(notificationKeys.unreadCount());
      queryClient.invalidateQueries(notificationKeys.recent());
      queryClient.invalidateQueries(notificationKeys.lists());
      
      // Update local state
      decrementUnreadCount();
      updateRecentNotification(notificationId, { read: true, readAt: new Date() });
      
      // No toast for individual mark as read (better UX)
    },
    onError: (error) => {
      // Only show error toast if there's an actual error
      console.error('Failed to mark notification as read:', error);
    }
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { resetUnreadCount, updateRecentNotification } = useNotificationStore();

  return useMutation({
    mutationFn: notificationAPI.markAllAsRead,
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries(notificationKeys.all);
      
      // Update local state
      resetUnreadCount();
      
      toast.success('All notifications marked as read');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark all notifications as read');
    }
  });
};

export const useMarkAsUnread = () => {
  const queryClient = useQueryClient();
  const { incrementUnreadCount, updateRecentNotification } = useNotificationStore();

  return useMutation({
    mutationFn: notificationAPI.markAsUnread,
    onSuccess: (data, notificationId) => {
      queryClient.invalidateQueries(notificationKeys.unreadCount());
      queryClient.invalidateQueries(notificationKeys.recent());
      
      incrementUnreadCount();
      updateRecentNotification(notificationId, { read: false, readAt: null });
      
      toast.success('Notification marked as unread');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark notification as unread');
    }
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { decrementUnreadCount, removeRecentNotification } = useNotificationStore();

  return useMutation({
    mutationFn: notificationAPI.deleteNotification,
    onSuccess: (data, notificationId) => {
      queryClient.invalidateQueries(notificationKeys.all);
      
      decrementUnreadCount();
      removeRecentNotification(notificationId);
      
      toast.success('Notification deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete notification');
    }
  });
};

export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  const { clearAllNotifications } = useNotificationStore();

  return useMutation({
    mutationFn: notificationAPI.deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.all);
      clearAllNotifications();
      
      toast.success('All notifications deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete all notifications');
    }
  });
};

// Hook for automatic mark as read functionality
export const useAutoMarkAsRead = () => {
  const markAsReadMutation = useMarkAsRead();
  const { addRecentNotification, updateRecentNotification } = useNotificationStore();

  // Debounced mark as read to avoid too many API calls
  const debouncedMarkAsRead = useCallback(
    debounce((notificationId) => {
      markAsReadMutation.mutate(notificationId, {
        onSuccess: (data, notificationId) => {
          // Update local state immediately for better UX
          updateRecentNotification(notificationId, { 
            read: true, 
            readAt: new Date() 
          });
        }
      });
    }, 1000), // 1 second debounce
    [markAsReadMutation]
  );

  // Mark notification as read when viewed
  const markAsReadOnView = useCallback((notificationId) => {
    // Check if notification is already read to avoid unnecessary API calls
    const notification = useNotificationStore.getState().getNotificationById(notificationId);
    if (notification && !notification.read) {
      debouncedMarkAsRead(notificationId);
    }
  }, [debouncedMarkAsRead]);

  // Mark multiple notifications as read when viewed
  const markMultipleAsReadOnView = useCallback((notificationIds) => {
    notificationIds.forEach(id => {
      const notification = useNotificationStore.getState().getNotificationById(id);
      if (notification && !notification.read) {
        debouncedMarkAsRead(id);
      }
    });
  }, [debouncedMarkAsRead]);

  return {
    markAsReadOnView,
    markMultipleAsReadOnView,
    isMarkingAsRead: markAsReadMutation.isLoading
  };
};

// Combined hook for notification management
export const useNotificationManagement = () => {
  const unreadCountQuery = useUnreadCount();
  const recentQuery = useRecentNotifications();
  const pollingQuery = useNotificationPolling();
  
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const markAsUnreadMutation = useMarkAsUnread();
  const deleteNotificationMutation = useDeleteNotification();
  const deleteAllNotificationsMutation = useDeleteAllNotifications();

  return {
    // Queries
    unreadCount: unreadCountQuery.data?.data?.unreadCount || 0,
    recentNotifications: recentQuery.data?.data?.notifications || [],
    isPolling: pollingQuery.isFetching,
    
    // Loading states
    isLoadingUnreadCount: unreadCountQuery.isLoading,
    isLoadingRecent: recentQuery.isLoading,
    
    // Mutations
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    markAsUnread: markAsUnreadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    deleteAllNotifications: deleteAllNotificationsMutation.mutate,
    
    // Mutation states
    isMarkingAsRead: markAsReadMutation.isLoading,
    isMarkingAllAsRead: markAllAsReadMutation.isLoading,
    isMarkingAsUnread: markAsUnreadMutation.isLoading,
    isDeleting: deleteNotificationMutation.isLoading,
    isDeletingAll: deleteAllNotificationsMutation.isLoading,
    
    // Refetch functions
    refetchUnreadCount: unreadCountQuery.refetch,
    refetchRecent: recentQuery.refetch,
    refetchPolling: pollingQuery.refetch
  };
};

export default useNotificationManagement;
