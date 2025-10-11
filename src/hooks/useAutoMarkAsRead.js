// src/hooks/useAutoMarkAsRead.js
import { useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import { useMarkAsRead, useMarkAllAsRead } from './useNotifications';

// Custom hook for automatic mark as read functionality
export const useAutoMarkAsRead = (markAsRead, markAllAsRead) => {
  const viewedNotifications = useRef(new Set());

  // Debounced function to mark notifications as read
  const debouncedMarkAsRead = useCallback(
    debounce((notificationIds) => {
      notificationIds.forEach(id => markAsRead(id));
    }, 1000), // 1 second debounce
    [markAsRead]
  );

  // Mark all visible notifications as read
  const markAllVisibleAsRead = useCallback((notifications) => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      const unreadIds = unreadNotifications.map(n => n._id);
      debouncedMarkAsRead(unreadIds);
    }
  }, [debouncedMarkAsRead]);

  // Mark notification as read on hover (immediate feedback)
  const markAsReadOnHover = useCallback((notificationId, isRead) => {
    if (!isRead && !viewedNotifications.current.has(notificationId)) {
      viewedNotifications.current.add(notificationId);
      markAsRead(notificationId);
    }
  }, [markAsRead]);

  // Clear viewed notifications cache
  const clearViewedCache = useCallback(() => {
    viewedNotifications.current.clear();
  }, []);

  return {
    markAllVisibleAsRead,
    markAsReadOnHover,
    clearViewedCache
  };
};

export default useAutoMarkAsRead;
