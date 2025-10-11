// src/api/notifications.js
import api from './axios';

// Notification API endpoints
export const notificationAPI = {
  // Get user notifications with pagination and filters
  getNotifications: async (params = {}) => {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type = null,
      since = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString(),
      sortBy,
      sortOrder
    });

    if (type) queryParams.append('type', type);
    if (since) queryParams.append('since', since.toISOString());

    const response = await api.get(`/notifications/user/notifications?${queryParams}`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await api.get('/notifications/user/unread-count');
    return response.data;
  },

  // Get recent notifications (for dropdown)
  getRecentNotifications: async (limit = 5) => {
    const response = await api.get(`/notifications/user/recent?limit=${limit}`);
    return response.data;
  },

  // Poll for new notifications since timestamp
  pollNotifications: async (since) => {
    const queryParams = new URLSearchParams();
    if (since) queryParams.append('since', since.toISOString());
    
    const response = await api.get(`/notifications/user/poll?${queryParams}`);
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    const response = await api.patch(`/notifications/user/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.patch('/notifications/user/notifications/read-all');
    return response.data;
  },

  // Mark single notification as unread
  markAsUnread: async (notificationId) => {
    const response = await api.patch(`/notifications/user/notifications/${notificationId}/unread`);
    return response.data;
  },

  // Delete single notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/user/notifications/${notificationId}`);
    return response.data;
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    const response = await api.delete('/notifications/user/notifications/delete-all');
    return response.data;
  },

  // Get notification statistics
  getNotificationStats: async () => {
    const response = await api.get('/notifications/user/stats');
    return response.data;
  },

  // Get notifications by type
  getNotificationsByType: async (type, params = {}) => {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      since = null
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString(),
      type
    });

    if (since) queryParams.append('since', since.toISOString());

    const response = await api.get(`/notifications/user/notifications?${queryParams}`);
    return response.data;
  }
};

export default notificationAPI;
