import webPush from 'web-push';
import logger from './logger.utils';

class VapidManager {
  private publicKey: string;
  private privateKey: string;

  constructor() {
    this.publicKey = process.env.VAPID_PUBLIC_KEY || '';
    this.privateKey = process.env.VAPID_PRIVATE_KEY || '';
    
    this.initialize();
  }

  private initialize(): void {
    if (!this.publicKey || !this.privateKey) {
      logger.warn('VAPID keys not found in environment variables. Push notifications will not work.');
      return;
    }

    try {
      webPush.setVapidDetails(
        'mailto:notifications@chaiyetu.com', // Contact email
        this.publicKey,
        this.privateKey
      );
      logger.info('VAPID keys initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize VAPID keys:', error);
    }
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  getPrivateKey(): string {
    return this.privateKey;
  }

  areKeysValid(): boolean {
    return !!(this.publicKey && this.privateKey);
  }

  // Generate new keys (for development/testing)
  generateNewKeys(): { publicKey: string; privateKey: string } {
    const vapidKeys = webPush.generateVAPIDKeys();
    return {
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey
    };
  }

  // Send push notification
  async sendPushNotification(subscription: any, payload: any): Promise<void> {
    if (!this.areKeysValid()) {
      throw new Error('VAPID keys not configured');
    }

    try {
      await webPush.sendNotification(subscription, JSON.stringify(payload));
      logger.info('Push notification sent successfully');
    } catch (error: any) {
      logger.error('Failed to send push notification:', error);
      
      // Handle specific errors
      if (error.statusCode === 410) {
        // Subscription expired
        throw new Error('Subscription expired');
      } else if (error.statusCode === 404) {
        // Subscription not found
        throw new Error('Subscription not found');
      } else {
        throw error;
      }
    }
  }
}

export const vapidManager = new VapidManager();