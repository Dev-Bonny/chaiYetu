import { Request, Response } from 'express';
import userService from '../../../services/user.service';
import { sendResponse } from '../../../utils/response.utils';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = await userService.getUserProfile(userId);
    sendResponse(res, 200, true, 'Profile retrieved successfully', user);
  } catch (error: any) {
    sendResponse(res, 404, false, error.message);
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = await userService.updateUserProfile(userId, req.body);
    sendResponse(res, 200, true, 'Profile updated successfully', user);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const users = await userService.getUsers({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      role: role as string,
      search: search as string
    });
    sendResponse(res, 200, true, 'Users retrieved successfully', users);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params.id as string);
    sendResponse(res, 200, true, 'User retrieved successfully', user);
  } catch (error: any) {
    sendResponse(res, 404, false, error.message);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await userService.updateUser(req.params.id as string, req.body);
    sendResponse(res, 200, true, 'User updated successfully', user);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await userService.deactivateUser(req.params.id as string);
    sendResponse(res, 200, true, 'User deactivated successfully');
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};
// Add these to the bottom of user.controller.ts

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: You might need to add createUser to your userService if it doesn't exist yet
    const user = await userService.createUser(req.body); 
    sendResponse(res, 201, true, 'User created successfully', user);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;
    
    // Note: You might need to add changePassword to your userService if it doesn't exist yet
    await userService.changePassword(userId, currentPassword, newPassword);
    sendResponse(res, 200, true, 'Password changed successfully');
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};