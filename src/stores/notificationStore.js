// src/stores/notificationStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useNotificationStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        unreadCount: 0,
        lastChecked: null,
        isPolling: false,
        pollInterval: 30000, // 30 seconds
        recentNotifications: [],
        notificationSettings: {
          enablePush: true,
          enableEmail: true,
          enableInApp: true,
          pollInterval: 30000,
          maxRecentNotifications: 5
        },

        // Actions
        setUnreadCount: (count) => 
          set({ unreadCount: count }, false, 'setUnreadCount'),

        setLastChecked: (timestamp) => 
          set({ lastChecked: timestamp }, false, 'setLastChecked'),

        setIsPolling: (isPolling) => 
          set({ isPolling }, false, 'setIsPolling'),

        setPollInterval: (interval) => 
          set({ pollInterval: interval }, false, 'setPollInterval'),

        setRecentNotifications: (notifications) => 
          set({ recentNotifications: notifications }, false, 'setRecentNotifications'),

        updateNotificationSettings: (settings) => 
          set((state) => ({
            notificationSettings: { ...state.notificationSettings, ...settings }
          }), false, 'updateNotificationSettings'),

        // Increment unread count (for real-time updates)
        incrementUnreadCount: () => 
          set((state) => ({ 
            unreadCount: state.unreadCount + 1 
          }), false, 'incrementUnreadCount'),

        // Decrement unread count (when marking as read)
        decrementUnreadCount: () => 
          set((state) => ({ 
            unreadCount: Math.max(0, state.unreadCount - 1) 
          }), false, 'decrementUnreadCount'),

        // Reset unread count (when marking all as read)
        resetUnreadCount: () => 
          set({ unreadCount: 0 }, false, 'resetUnreadCount'),

        // Add notification to recent list
        addRecentNotification: (notification) => 
          set((state) => {
            const maxRecent = state.notificationSettings.maxRecentNotifications;
            const updatedRecent = [notification, ...state.recentNotifications]
              .slice(0, maxRecent);
            return { recentNotifications: updatedRecent };
          }, false, 'addRecentNotification'),

        // Remove notification from recent list
        removeRecentNotification: (notificationId) => 
          set((state) => ({
            recentNotifications: state.recentNotifications.filter(
              notification => notification._id !== notificationId
            )
          }), false, 'removeRecentNotification'),

        // Update notification in recent list
        updateRecentNotification: (notificationId, updates) => 
          set((state) => ({
            recentNotifications: state.recentNotifications.map(notification =>
              notification._id === notificationId
                ? { ...notification, ...updates }
                : notification
            )
          }), false, 'updateRecentNotification'),

        // Clear all notifications
        clearAllNotifications: () => 
          set({
            unreadCount: 0,
            recentNotifications: [],
            lastChecked: new Date()
          }, false, 'clearAllNotifications'),

        // Get notification by ID from recent list
        getNotificationById: (notificationId) => {
          const state = get();
          return state.recentNotifications.find(
            notification => notification._id === notificationId
          );
        },

        // Check if notification exists in recent list
        hasNotification: (notificationId) => {
          const state = get();
          return state.recentNotifications.some(
            notification => notification._id === notificationId
          );
        },

        // Get notifications by type from recent list
        getNotificationsByType: (type) => {
          const state = get();
          return state.recentNotifications.filter(
            notification => notification.type === type
          );
        },

        // Get unread notifications from recent list
        getUnreadRecentNotifications: () => {
          const state = get();
          return state.recentNotifications.filter(
            notification => !notification.read
          );
        },

        // Reset store to initial state
        reset: () => 
          set({
            unreadCount: 0,
            lastChecked: null,
            isPolling: false,
            pollInterval: 30000,
            recentNotifications: [],
            notificationSettings: {
              enablePush: true,
              enableEmail: true,
              enableInApp: true,
              pollInterval: 30000,
              maxRecentNotifications: 5
            }
          }, false, 'reset')
      }),
      {
        name: 'notification-store',
        partialize: (state) => ({
          notificationSettings: state.notificationSettings,
          pollInterval: state.pollInterval
        })
      }
    ),
    {
      name: 'notification-store'
    }
  )
);

export default useNotificationStore;
