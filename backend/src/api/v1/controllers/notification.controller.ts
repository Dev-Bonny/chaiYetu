import { Request, Response } from 'express';
import notificationService from '../../../services/notification.service';
import { sendResponse } from '../../../utils/response.utils';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { 
      page = 1, 
      limit = 20, 
      type, 
      read, 
      priority 
    } = req.query;

    const notifications = await notificationService.getNotifications({
      userId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      type: type as string,
      read: read === 'true' ? true : read === 'false' ? false : undefined,
      priority: priority as string
    });

    sendResponse(res, 200, true, 'Notifications retrieved successfully', notifications);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getNotificationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const notification = await notificationService.getNotificationById(req.params.id as string, userId);
    sendResponse(res, 200, true, 'Notification retrieved successfully', notification);
  } catch (error: any) {
    sendResponse(res, 404, false, error.message);
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const notification = await notificationService.markAsRead(req.params.id as string, userId);
    sendResponse(res, 200, true, 'Notification marked as read', notification);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { type } = req.query;
    const result = await notificationService.markAllAsRead(userId, type as string);
    sendResponse(res, 200, true, 'All notifications marked as read', result);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    await notificationService.deleteNotification(req.params.id as string, userId);
    sendResponse(res, 200, true, 'Notification deleted successfully');
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const count = await notificationService.getUnreadCount(userId);
    sendResponse(res, 200, true, 'Unread count retrieved successfully', { count });
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const preferences = await notificationService.getNotificationPreferences(userId);
    sendResponse(res, 200, true, 'Notification preferences retrieved successfully', preferences);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const preferences = await notificationService.updateNotificationPreferences(userId, req.body);
    sendResponse(res, 200, true, 'Notification preferences updated successfully', preferences);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const subscribeToPush = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const subscription = await notificationService.subscribeToPush(userId, req.body);
    sendResponse(res, 200, true, 'Push notification subscription successful', subscription);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const unsubscribeFromPush = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    await notificationService.unsubscribeFromPush(userId);
    sendResponse(res, 200, true, 'Push notification unsubscribed successfully');
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};