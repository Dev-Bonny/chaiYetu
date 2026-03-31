import { Request, Response } from 'express';
import paymentService from '../../../services/payment.service';
import { sendResponse } from '../../../utils/response.utils';

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const processedBy = (req as any).user.userId;
    const payment = await paymentService.createPayment({
      ...req.body,
      processedBy
    });
    sendResponse(res, 201, true, 'Payment created successfully', payment);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    const payments = await paymentService.getPayments({
      userRole: user.role,
      userId: user.userId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string
    });
    
    sendResponse(res, 200, true, 'Payments retrieved successfully', payments);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id as string);
    sendResponse(res, 200, true, 'Payment retrieved successfully', payment);
  } catch (error: any) {
    sendResponse(res, 404, false, error.message);
  }
};

export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await paymentService.processPayment(req.params.id as string, req.body);
    sendResponse(res, 200, true, 'Payment processed successfully', payment);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getFarmerPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const payments = await paymentService.getFarmerPayments(
      req.params.farmerId as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendResponse(res, 200, true, 'Farmer payments retrieved successfully', payments);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getPaymentSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { startDate, endDate } = req.query;
    
    const summary = await paymentService.getPaymentSummary(
      user.userId,
      user.role,
      startDate as string,
      endDate as string
    );
    
    sendResponse(res, 200, true, 'Payment summary retrieved successfully', summary);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const initiateMpesaPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId, phoneNumber } = req.body;
    const result = await paymentService.initiateMpesaPayment(paymentId, phoneNumber);
    sendResponse(res, 200, true, 'M-Pesa payment initiated successfully', result);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const mpesaCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    await paymentService.handleMpesaCallback(req.body);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error: any) {
    res.status(400).json({ ResultCode: 1, ResultDesc: error.message });
  }
};