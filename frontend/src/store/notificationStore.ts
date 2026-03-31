import { create } from 'zustand';
import { Notification, NotificationPreferences } from '@/lib/notification-service';
import { notificationService } from '@/lib/notification-service';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  isWebSocketConnected: boolean;
  
  // Actions
  fetchNotifications: (params?: any) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (type?: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  connectWebSocket: (userId: string, token: string) => void;
  disconnectWebSocket: () => void;
  addNotification: (notification: Notification) => void;
  updateUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  preferences: null,
  isLoading: false,
  isWebSocketConnected: false,

  fetchNotifications: async (params) => {
    set({ isLoading: true });
    try {
      const response = await notificationService.getNotifications(params);
      set({ notifications: response.data.notifications, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      set({ unreadCount: response.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  fetchPreferences: async () => {
    try {
      const response = await notificationService.getNotificationPreferences();
      set({ preferences: response.data });
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set(state => ({
        notifications: state.notifications.map(n =>
          n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async (type?: string) => {
    try {
      await notificationService.markAllAsRead(type);
      set(state => ({
        notifications: state.notifications.map(n => 
          (!type || n.type === type) ? { ...n, read: true, readAt: new Date().toISOString() } : n
        ),
        unreadCount: type ? 
          state.notifications.filter(n => n.type !== type && !n.read).length : 
          0
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      const notification = get().notifications.find(n => n._id === id);
      set(state => ({
        notifications: state.notifications.filter(n => n._id !== id),
        unreadCount: notification && !notification.read ? 
          Math.max(0, state.unreadCount - 1) : 
          state.unreadCount
      }));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  },

  updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
    try {
      const response = await notificationService.updateNotificationPreferences(preferences);
      set({ preferences: response.data });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  },

  connectWebSocket: (userId: string, token: string) => {
    notificationService.connectWebSocket(userId, token);
    
    // Subscribe to real-time notifications
    const unsubscribeNotification = notificationService.onNotification((notification) => {
      set(state => ({
        notifications: [notification, ...state.notifications],
        unreadCount: !notification.read ? state.unreadCount + 1 : state.unreadCount
      }));
    });

    // Subscribe to unread count changes
    const unsubscribeCount = notificationService.onUnreadCountChange((count) => {
      set({ unreadCount: count });
    });

    set({ isWebSocketConnected: true });
  },

  disconnectWebSocket: () => {
    notificationService.disconnectWebSocket();
    set({ isWebSocketConnected: false });
  },

  addNotification: (notification: Notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: !notification.read ? state.unreadCount + 1 : state.unreadCount
    }));
  },

  updateUnreadCount: (count: number) => {
    set({ unreadCount: count });
  }
}));