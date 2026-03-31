import { Response } from 'express';

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any,
  meta?: any
): void => {
  const response: any = {
    success,
    message,
    timestamp: new Date().toISOString()
  };

  if (data) response.data = data;
  if (meta) response.meta = meta;

  res.status(statusCode).json(response);
};