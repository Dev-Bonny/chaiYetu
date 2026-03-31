import Notification, { INotification } from '../models/Notification.model';
import User from '../models/User.model';
import cache from '../utils/cache.utils';
import { vapidManager } from '../utils/vapid.utils'; // Add this import
import logger from '../utils/logger.utils';
import { Types } from 'mongoose';

interface CreateNotificationData {
  userId: string | Types.ObjectId;
  title: string;
  message: string;
  type: 'payment' | 'collection' | 'system' | 'alert' | 'prediction';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  action?: {
    label: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  };
  deliveryMethod?: ('push' | 'email' | 'sms' | 'in_app')[];
  expiresAt?: Date;
}

interface GetNotificationsParams {
  userId: string;
  page: number;
  limit: number;
  type?: string;
  read?: boolean;
  priority?: string;
}

interface NotificationPreferences {
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

class NotificationService {
  private pushNotificationsEnabled: boolean;
  private emailNotificationsEnabled: boolean;
  private smsNotificationsEnabled: boolean;

  constructor() {
    // Initialize notification settings from environment variables
    this.pushNotificationsEnabled = process.env.PUSH_NOTIFICATION_ENABLED === 'true';
    this.emailNotificationsEnabled = process.env.EMAIL_NOTIFICATION_ENABLED === 'true';
    this.smsNotificationsEnabled = process.env.SMS_NOTIFICATION_ENABLED === 'true';

    // Log notification configuration
    if (vapidManager.areKeysValid() && this.pushNotificationsEnabled) {
      logger.info('✅ Push notifications enabled with VAPID');
    } else if (this.pushNotificationsEnabled) {
      logger.warn('⚠️ Push notifications enabled but VAPID keys not configured');
    } else {
      logger.info('📱 Push notifications disabled');
    }

    if (this.emailNotificationsEnabled) {
      logger.info('📧 Email notifications enabled');
    } else {
      logger.info('📧 Email notifications disabled');
    }

    if (this.smsNotificationsEnabled) {
      logger.info('📱 SMS notifications enabled');
    } else {
      logger.info('📱 SMS notifications disabled');
    }
  }

  async createNotification(data: CreateNotificationData): Promise<INotification> {
    try {
      const notification = await Notification.create({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'medium',
        data: data.data,
        action: data.action,
        deliveryMethod: data.deliveryMethod || ['in_app'],
        expiresAt: data.expiresAt
      });

      // Get user preferences
      const user = await User.findById(data.userId);
      if (user) {
        const preferences = await this.getNotificationPreferences(data.userId.toString());
        
        // Always deliver in-app notifications (they're required)
        await this.deliverInAppNotification(notification);

        // Send other notifications based on preferences and configuration
        if (this.pushNotificationsEnabled && preferences.push[data.type] && 
            notification.deliveryMethod?.includes('push')) {
          await this.sendPushNotification(notification, user);
        }

        if (this.emailNotificationsEnabled && preferences.email[data.type] && 
            notification.deliveryMethod?.includes('email')) {
          await this.sendEmailNotification(notification, user);
        }

        if (this.smsNotificationsEnabled && preferences.sms[data.type] && 
            notification.deliveryMethod?.includes('sms')) {
          await this.sendSMSNotification(notification, user);
        }
      } else {
        // Still deliver in-app notification even if user not found
        await this.deliverInAppNotification(notification);
      }

      // Emit real-time notification via Socket.IO
      await this.emitRealTimeNotification(notification);

      // Update unread count cache
      await this.updateUnreadCountCache(data.userId.toString());

      logger.info(`📨 Notification created for user ${data.userId}: ${data.title}`);

      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getNotifications(params: GetNotificationsParams): Promise<{
    notifications: INotification[];
    total: number;
    page: number;
    pages: number;
  }> {
    const { userId, page, limit, type, read, priority } = params;
    const skip = (page - 1) * limit;

    const query: any = { userId };

    if (type) query.type = type;
    if (read !== undefined) query.read = read;
    if (priority) query.priority = priority;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(query)
    ]);

    return {
      notifications,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getNotificationById(notificationId: string, userId: string): Promise<INotification> {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    // Update unread count cache
    await this.updateUnreadCountCache(userId);

    return notification;
  }

  async markAllAsRead(userId: string, type?: string): Promise<{ modifiedCount: number }> {
    const query: any = { userId, read: false };
    if (type) query.type = type;

    const result = await Notification.updateMany(
      query,
      { read: true, readAt: new Date() }
    );

    // Update unread count cache
    await this.updateUnreadCountCache(userId);

    return { modifiedCount: result.modifiedCount };
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await Notification.deleteOne({ _id: notificationId, userId });

    if (result.deletedCount === 0) {
      throw new Error('Notification not found');
    }

    // Update unread count cache
    await this.updateUnreadCountCache(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    // Try to get from cache first
    const cacheKey = `notifications:unread:${userId}`;
    const cachedCount = await cache.get<string>(cacheKey);

    if (cachedCount !== null) {
      return parseInt(cachedCount);
    }

    // Get from database
    const count = await Notification.countDocuments({ userId, read: false });

    // Cache for 5 minutes (300 seconds)
    await cache.setex(cacheKey, 300, count.toString());

    return count;
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const cacheKey = `notifications:preferences:${userId}`;
    const cached = await cache.get<string>(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Default preferences based on user role
    const user = await User.findById(userId);
    const role = user?.role || 'farmer';
    
    // Different defaults based on role
    const defaultPreferences: NotificationPreferences = {
      email: {
        payment: true,
        collection: role === 'farmer',
        system: role === 'admin' || role === 'factory_manager',
        alert: true,
        prediction: role === 'farmer'
      },
      push: {
        payment: true,
        collection: role === 'farmer' || role === 'collector',
        system: false,
        alert: true,
        prediction: role === 'farmer'
      },
      sms: {
        payment: true,
        collection: false,
        system: false,
        alert: role === 'farmer', // SMS alerts for farmers
        prediction: false
      },
      in_app: {
        payment: true,
        collection: true,
        system: true,
        alert: true,
        prediction: true
      }
    };

    // Cache for 1 hour (3600 seconds)
    await cache.setex(cacheKey, 3600, JSON.stringify(defaultPreferences));

    return defaultPreferences;
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const currentPreferences = await this.getNotificationPreferences(userId);
    const updatedPreferences = { ...currentPreferences, ...preferences };

    const cacheKey = `notifications:preferences:${userId}`;
    await cache.setex(cacheKey, 3600, JSON.stringify(updatedPreferences));

    return updatedPreferences;
  }

  async subscribeToPush(userId: string, subscription: any): Promise<void> {
    const key = `push:subscription:${userId}`;
    await cache.setex(key, 86400 * 90, JSON.stringify(subscription)); // Store for 90 days
    logger.info(`Push subscription stored for user ${userId}`);
  }

  async unsubscribeFromPush(userId: string): Promise<void> {
    const key = `push:subscription:${userId}`;
    await cache.del(key);
    logger.info(`Push subscription removed for user ${userId}`);
  }

  private async sendPushNotification(notification: INotification, user: any): Promise<void> {
    try {
      // Check if VAPID is configured
      if (!vapidManager.areKeysValid()) {
        logger.warn(`Push notification skipped for user ${user._id}: VAPID keys not configured`);
        return;
      }

      const key = `push:subscription:${notification.userId}`;
      const subscriptionJson = await cache.get<string>(key);

      if (!subscriptionJson) {
        logger.debug(`No push subscription found for user ${notification.userId}`);
        return;
      }

      const subscription = JSON.parse(subscriptionJson);

      const payload = {
        title: notification.title,
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge.png',
        data: {
          url: notification.action?.url || '/dashboard',
          notificationId: notification._id.toString(),
          type: notification.type,
          userId: notification.userId.toString()
        },
        actions: notification.action ? [{
          action: 'view',
          title: notification.action.label
        }] : []
      };

      await vapidManager.sendPushNotification(subscription, payload);

      // Update delivery status
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.push': { sent: true },
        delivered: true
      });

      logger.info(`✅ Push notification sent to user ${notification.userId}`);
    } catch (error: any) {
      logger.error('Failed to send push notification:', error);
      
      // Update delivery status with error
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.push': { 
          sent: false, 
          error: error.message 
        }
      });

      // If subscription is expired/invalid, remove it
      if (error.message.includes('expired') || error.message.includes('not found')) {
        const key = `push:subscription:${notification.userId}`;
        await cache.del(key);
        logger.info(`Removed invalid push subscription for user ${notification.userId}`);
      }
    }
  }

  private async deliverInAppNotification(notification: INotification): Promise<void> {
    // In-app delivery is automatically handled by the notification being saved
    // This method updates the delivery status
    await Notification.findByIdAndUpdate(notification._id, {
      'deliveryStatus.in_app': { delivered: true },
      delivered: true
    });
  }

  private async sendEmailNotification(notification: INotification, user: any): Promise<void> {
    try {
      // TODO: Implement actual email sending logic
      // For now, just log it
      logger.info(`[EMAIL] Would send to ${user.email}: ${notification.title}`);
      
      // Update delivery status as if sent (in real implementation, check actual result)
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.email': { sent: true }
      });
    } catch (error: any) {
      logger.error('Failed to send email notification:', error);
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.email': { 
          sent: false, 
          error: error.message 
        }
      });
    }
  }

  private async sendSMSNotification(notification: INotification, user: any): Promise<void> {
    try {
      // TODO: Implement actual SMS sending logic
      // For now, just log it
      logger.info(`[SMS] Would send to ${user.phone}: ${notification.title}`);
      
      // Update delivery status as if sent
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.sms': { sent: true }
      });
    } catch (error: any) {
      logger.error('Failed to send SMS notification:', error);
      await Notification.findByIdAndUpdate(notification._id, {
        'deliveryStatus.sms': { 
          sent: false, 
          error: error.message 
        }
      });
    }
  }

  private async emitRealTimeNotification(notification: INotification): Promise<void> {
    try {
      const io = (global as any).io; // Socket.IO instance from server.ts
      if (io) {
        io.to(`user:${notification.userId}`).emit('notification:new', {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          createdAt: notification.createdAt,
          action: notification.action,
          read: notification.read
        });

        // Also emit unread count update
        const unreadCount = await this.getUnreadCount(notification.userId.toString());
        io.to(`user:${notification.userId}`).emit('notification:unread-count', {
          count: unreadCount
        });
      }
    } catch (error) {
      logger.error('Failed to emit real-time notification:', error);
    }
  }

  private async updateUnreadCountCache(userId: string): Promise<void> {
    const cacheKey = `notifications:unread:${userId}`;
    const count = await Notification.countDocuments({ userId, read: false });
    await cache.setex(cacheKey, 300, count.toString()); // Cache for 5 minutes
  }

  // Helper methods to create specific types of notifications
  async createPaymentNotification(userId: string, paymentData: any): Promise<INotification> {
    const deliveryMethods: ('push' | 'email' | 'sms' | 'in_app')[] = ['in_app'];
    
    // Add push if enabled
    if (this.pushNotificationsEnabled) deliveryMethods.push('push');
    // Add email if enabled
    if (this.emailNotificationsEnabled) deliveryMethods.push('email');
    // Add SMS if enabled (for payment notifications)
    if (this.smsNotificationsEnabled) deliveryMethods.push('sms');
    
    return this.createNotification({
      userId,
      title: 'Payment Processed',
      message: `Your payment of KES ${paymentData.amount} has been ${paymentData.status}`,
      type: 'payment',
      priority: 'high',
      data: paymentData,
      action: {
        label: 'View Payment',
        url: `/dashboard/payments/${paymentData._id}`,
        method: 'GET'
      },
      deliveryMethod: deliveryMethods
    });
  }

  async createCollectionNotification(userId: string, collectionData: any): Promise<INotification> {
    const deliveryMethods: ('push' | 'email' | 'sms' | 'in_app')[] = ['in_app'];
    
    if (this.pushNotificationsEnabled) deliveryMethods.push('push');
    if (this.emailNotificationsEnabled) deliveryMethods.push('email');
    
    return this.createNotification({
      userId,
      title: 'Collection Recorded',
      message: `Your collection of ${collectionData.weight}kg has been ${collectionData.status}`,
      type: 'collection',
      priority: collectionData.status === 'verified' ? 'medium' : 'low',
      data: collectionData,
      action: {
        label: 'View Collection',
        url: `/dashboard/collections/${collectionData._id}`,
        method: 'GET'
      },
      deliveryMethod: deliveryMethods
    });
  }

  async createPredictionNotification(userId: string, predictionData: any): Promise<INotification> {
    const deliveryMethods: ('push' | 'email' | 'sms' | 'in_app')[] = ['in_app'];
    
    if (this.pushNotificationsEnabled) deliveryMethods.push('push');
    if (this.emailNotificationsEnabled) deliveryMethods.push('email');
    
    return this.createNotification({
      userId,
      title: 'New Prediction Available',
      message: `Your ${predictionData.type} prediction for next week is ready`,
      type: 'prediction',
      priority: 'medium',
      data: predictionData,
      action: {
        label: 'View Prediction',
        url: `/dashboard/predictions`,
        method: 'GET'
      },
      deliveryMethod: deliveryMethods
    });
  }

  async createSystemAlert(userId: string, alertData: any): Promise<INotification> {
    const deliveryMethods: ('push' | 'email' | 'sms' | 'in_app')[] = ['in_app'];
    
    // System alerts should use all available channels
    if (this.pushNotificationsEnabled) deliveryMethods.push('push');
    if (this.emailNotificationsEnabled) deliveryMethods.push('email');
    if (this.smsNotificationsEnabled) deliveryMethods.push('sms');
    
    return this.createNotification({
      userId,
      title: alertData.title,
      message: alertData.message,
      type: 'alert',
      priority: alertData.priority || 'high',
      data: alertData,
      action: alertData.action,
      deliveryMethod: deliveryMethods
    });
  }

  // Add this method to clean up cache (useful for testing)
  async clearCacheForUser(userId: string): Promise<void> {
    const unreadKey = `notifications:unread:${userId}`;
    const prefKey = `notifications:preferences:${userId}`;
    const pushKey = `push:subscription:${userId}`;
    
    await Promise.all([
      cache.del(unreadKey),
      cache.del(prefKey),
      cache.del(pushKey)
    ]);
    
    logger.info(`Cleared cache for user ${userId}`);
  }

  // New method: Get VAPID public key for frontend
  getVapidPublicKey(): string | null {
    return vapidManager.getPublicKey();
  }

  // New method: Check if push notifications are available
  isPushAvailable(): boolean {
    return vapidManager.areKeysValid() && this.pushNotificationsEnabled;
  }

  // New method: Get user's push subscription
  async getUserPushSubscription(userId: string): Promise<any | null> {
    const key = `push:subscription:${userId}`;
    const subscriptionJson = await cache.get<string>(key);
    return subscriptionJson ? JSON.parse(subscriptionJson) : null;
  }

  // New method: Send test push notification
  async sendTestPushNotification(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getUserPushSubscription(userId);
      if (!subscription) {
        throw new Error('User has no push subscription');
      }

      const testPayload = {
        title: 'Test Notification',
        body: 'This is a test push notification from ChaiYetu',
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge.png',
        data: {
          url: '/dashboard',
          notificationId: 'test',
          type: 'system',
          userId: userId
        }
      };

      await vapidManager.sendPushNotification(subscription, testPayload);
      logger.info(`Test push notification sent to user ${userId}`);
      return true;
    } catch (error: any) {
      logger.error('Failed to send test push notification:', error);
      return false;
    }
  }
}

export default new NotificationService();