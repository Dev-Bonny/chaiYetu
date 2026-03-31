import { Request, Response } from 'express';
import authService from '../../../services/auth.service';
import { sendResponse } from '../../../utils/response.utils';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    sendResponse(res, 201, true, 'User registered successfully', result);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendResponse(res, 200, true, 'Login successful', result);
  } catch (error: any) {
    sendResponse(res, 401, false, error.message);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Get the token safely
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // 2. Check if token exists before using it
    if (!token) {
      sendResponse(res, 401, false, 'Authorization token is missing');
      return;
    }

    // 3. Now it's safe to call logout because we know token is a string
    await authService.logout(token);
    
    sendResponse(res, 200, true, 'Logout successful');
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    sendResponse(res, 200, true, 'Token refreshed successfully', result);
  } catch (error: any) {
    sendResponse(res, 401, false, error.message);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    sendResponse(res, 200, true, 'Password reset instructions sent to your email');
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    sendResponse(res, 200, true, 'Password reset successfully');
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};