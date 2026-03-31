import { Router } from 'express';
import {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  getNotificationPreferences,
  updateNotificationPreferences,
  subscribeToPush,
  unsubscribeFromPush
} from '../controllers/notification.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
  notificationPreferencesValidator,
  pushSubscriptionValidator
} from '../validators/notification.validator';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/', getNotifications);
router.get('/count/unread', getUnreadCount);
router.get('/:id', getNotificationById);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

// Notification preferences
router.get('/preferences', getNotificationPreferences);
router.put('/preferences', validateRequest(notificationPreferencesValidator), updateNotificationPreferences);

// Push notification subscriptions
router.post('/push/subscribe', validateRequest(pushSubscriptionValidator), subscribeToPush);
router.post('/push/unsubscribe', unsubscribeFromPush);

export default router;