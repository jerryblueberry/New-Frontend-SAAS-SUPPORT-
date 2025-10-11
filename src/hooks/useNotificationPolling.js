import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// API functions
const fetchUnreadCount = async () => {
  const response = await fetch('/api/v1/notifications/user/unread-count', {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Failed to fetch unread count');
  return response.json();
};

const pollNotifications = async (since) => {
  const params = new URLSearchParams();
  if (since) params.append('since', since.toISOString());
  
  const response = await fetch(`/api/v1/notifications/user/poll?${params}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Failed to poll notifications');
  return response.json();
};

/**
 * Custom hook for notification polling
 * Provides real-time notification updates with efficient polling
 */
const useNotificationPolling = (options = {}) => {
  const {
    pollInterval = 30000, // 30 seconds
    enablePolling = true,
    showToast = true,
    onNewNotification = null
  } = options;

  const [lastPollTime, setLastPollTime] = useState(new Date());
  const [isPolling, setIsPolling] = useState(false);
  const queryClient = useQueryClient();
  const intervalRef = useRef(null);
  const previousUnreadCount = useRef(0);

  // Fetch unread count
  const { 
    data: unreadData, 
    isLoading: unreadLoading,
    error: unreadError 
  } = useQuery({
    queryKey: ['notificationUnreadCount'],
    queryFn: fetchUnreadCount,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: true,
    enabled: enablePolling,
  });

  // Poll for new notifications
  const pollForNotifications = useCallback(async () => {
    if (!enablePolling || isPolling) return;

    try {
      setIsPolling(true);
      const result = await pollNotifications(lastPollTime);
      
      if (result.data?.hasNewNotifications && result.data?.notifications?.length > 0) {
        // Update cache with new notifications
        queryClient.setQueryData(['recentNotifications'], (oldData) => {
          if (!oldData) return result;
          
          const existingIds = new Set(oldData.data.notifications.map(n => n._id));
          const newNotifications = result.data.notifications.filter(n => !existingIds.has(n._id));
          
          return {
            ...result,
            data: {
              ...result.data,
              notifications: [...newNotifications, ...oldData.data.notifications].slice(0, 10)
            }
          };
        });

        // Show toast for new notifications
        if (showToast && newNotifications.length > 0) {
          newNotifications.forEach(notification => {
            toast.success(notification.title, {
              duration: 4000,
              position: 'top-right',
            });
          });
        }

        // Call custom handler
        if (onNewNotification) {
          onNewNotification(result.data.notifications);
        }
      }

      setLastPollTime(new Date());
    } catch (error) {
      console.error('Error polling notifications:', error);
    } finally {
      setIsPolling(false);
    }
  }, [enablePolling, isPolling, lastPollTime, queryClient, showToast, onNewNotification]);

  // Set up polling interval
  useEffect(() => {
    if (!enablePolling) return;

    intervalRef.current = setInterval(pollForNotifications, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enablePolling, pollInterval, pollForNotifications]);

  // Track unread count changes
  useEffect(() => {
    if (unreadData?.data?.unreadCount !== undefined) {
      const currentCount = unreadData.data.unreadCount;
      const previousCount = previousUnreadCount.current;

      // If count increased, we have new notifications
      if (currentCount > previousCount && previousCount > 0) {
        const newCount = currentCount - previousCount;
        if (showToast) {
          toast.success(`${newCount} new notification${newCount > 1 ? 's' : ''}`, {
            duration: 3000,
            position: 'top-right',
          });
        }
      }

      previousUnreadCount.current = currentCount;
    }
  }, [unreadData?.data?.unreadCount, showToast]);

  // Manual refresh function
  const refreshNotifications = useCallback(() => {
    queryClient.invalidateQueries(['notificationUnreadCount']);
    queryClient.invalidateQueries(['recentNotifications']);
    setLastPollTime(new Date());
  }, [queryClient]);

  // Force poll for new notifications
  const forcePoll = useCallback(() => {
    pollForNotifications();
  }, [pollForNotifications]);

  return {
    // Data
    unreadCount: unreadData?.data?.unreadCount || 0,
    lastChecked: unreadData?.data?.lastChecked,
    isLoading: unreadLoading,
    error: unreadError,
    
    // State
    isPolling,
    lastPollTime,
    
    // Actions
    refreshNotifications,
    forcePoll,
    
    // Utils
    hasUnreadNotifications: (unreadData?.data?.unreadCount || 0) > 0
  };
};

export default useNotificationPolling;
