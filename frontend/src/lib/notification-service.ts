import { apiClient } from './api';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'payment' | 'collection' | 'system' | 'alert' | 'prediction';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  read: boolean;
  readAt?: string;
  action?: {
    label: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  };
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  isUnread: boolean;
}

export interface NotificationPreferences {
  email: {
    payment: boolean;
    collection: boolean;
    system: boolean;
    alert: boolean;
    prediction: boolean;
  };
  push: {
    payment: boolean;
    collection: boolean;
    system: boolean;
    alert: boolean;
    prediction: boolean;
  };
  sms: {
    payment: boolean;
    collection: boolean;
    system: boolean;
    alert: boolean;
    prediction: boolean;
  };
  in_app: {
    payment: boolean;
    collection: boolean;
    system: boolean;
    alert: boolean;
    prediction: boolean;
  };
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  private socket: WebSocket | null = null;
  private notificationCallbacks: ((notification: Notification) => void)[] = [];
  private countCallbacks: ((count: number) => void)[] = [];

  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
    priority?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, String(value));
      });
    }
    return apiClient.get(`/api/v1/notifications?${queryParams.toString()}`);
  }

  async getNotificationById(id: string) {
    return apiClient.get(`/api/v1/notifications/${id}`);
  }

  async markAsRead(id: string) {
    return apiClient.patch(`/api/v1/notifications/${id}/read`, {});
  }

  async markAllAsRead(type?: string) {
    const queryParams = type ? `?type=${type}` : '';
    return apiClient.patch(`/api/v1/notifications/read-all${queryParams}`, {});
  }

  async deleteNotification(id: string) {
    return apiClient.delete(`/api/v1/notifications/${id}`);
  }

  async getUnreadCount() {
    return apiClient.get('/api/v1/notifications/count/unread');
  }

  async getNotificationPreferences() {
    return apiClient.get('/api/v1/notifications/preferences');
  }

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>) {
    return apiClient.put('/api/v1/notifications/preferences', preferences);
  }

  async subscribeToPush(subscription: PushSubscription) {
    return apiClient.post('/api/v1/notifications/push/subscribe', subscription);
  }

  async unsubscribeFromPush() {
    return apiClient.post('/api/v1/notifications/push/unsubscribe', {});
  }

  // Real-time notification methods
  async connectWebSocket(userId: string, token: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:5000`;
    this.socket = new WebSocket(`${wsUrl}?userId=${userId}&token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connected for notifications');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          this.notificationCallbacks.forEach(callback => callback(data.notification));
        } else if (data.type === 'unread_count') {
          this.countCallbacks.forEach(callback => callback(data.count));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        this.connectWebSocket(userId, token);
      }, 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnectWebSocket() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  onNotification(callback: (notification: Notification) => void) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  onUnreadCountChange(callback: (count: number) => void) {
    this.countCallbacks.push(callback);
    return () => {
      this.countCallbacks = this.countCallbacks.filter(cb => cb !== callback);
    };
  }

  // Push notification registration
  async registerPushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      // Get push subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      // Send subscription to server
      await this.subscribeToPush(subscription.toJSON() as PushSubscription);
      
      return true;
    } catch (error) {
      console.error('Failed to register push notifications:', error);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Show browser notification
  showBrowserNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    new Notification(title, {
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge.png',
      ...options
    });
  }
}

export const notificationService = new NotificationService();