import { Request, Response } from 'express';
import factoryService from '../../../services/factory.service';
import { sendResponse } from '../../../utils/response.utils';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await factoryService.getDashboardStats();
    sendResponse(res, 200, true, 'Dashboard stats retrieved', stats);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getSystemStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await factoryService.getSystemStats();
    sendResponse(res, 200, true, 'System stats retrieved', stats);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getProductionTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const trend = await factoryService.getProductionTrend(days);
    sendResponse(res, 200, true, 'Production trend retrieved', trend);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getWeeklyBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const weeks = parseInt(req.query.weeks as string) || 12;
    const data = await factoryService.getWeeklyBreakdown(weeks);
    sendResponse(res, 200, true, 'Weekly breakdown retrieved', data);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getMonthlyBreakdown = async (req: Request, res: Response): Promise<void> => {
  try {
    const months = parseInt(req.query.months as string) || 12;
    const data = await factoryService.getMonthlyBreakdown(months);
    sendResponse(res, 200, true, 'Monthly breakdown retrieved', data);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getAllDeliveries = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1, limit = 20,
      status, startDate, endDate,
      collectorId, farmerId, quality,
    } = req.query;

    const result = await factoryService.getAllDeliveries({
      page:        parseInt(page as string),
      limit:       parseInt(limit as string),
      status:      status      as string,
      startDate:   startDate   as string,
      endDate:     endDate     as string,
      collectorId: collectorId as string,
      farmerId:    farmerId    as string,
      quality:     quality     as string,
    });

    sendResponse(res, 200, true, 'Deliveries retrieved', result);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const auditCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const auditorId = (req as any).user.userId;

    // 1. Validate the ID exists so TypeScript knows it is a string
    if (!id) {
      sendResponse(res, 400, false, 'Collection ID is required in the URL parameters');
      return;
    }

    // 2. Validate the action
    if (!['verified', 'rejected'].includes(action)) {
      sendResponse(res, 400, false, 'Action must be "verified" or "rejected"');
      return;
    }

    // 3. 'id' is now strictly a string, so the compiler is happy!
    const updated = await factoryService.auditCollection(id, action, auditorId, notes);
    sendResponse(res, 200, true, `Collection ${action} successfully`, updated);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const bulkAudit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionIds, action, notes } = req.body;
    const auditorId = (req as any).user.userId;

    if (!Array.isArray(collectionIds) || collectionIds.length === 0) {
      sendResponse(res, 400, false, 'collectionIds must be a non-empty array');
      return;
    }
    if (!['verified', 'rejected'].includes(action)) {
      sendResponse(res, 400, false, 'Action must be "verified" or "rejected"');
      return;
    }

    const result = await factoryService.bulkAudit(collectionIds, action, auditorId, notes);
    sendResponse(res, 200, true, `Bulk ${action}: ${result.modified} collections updated`, result);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getCollectorPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const result = await factoryService.getCollectorPerformance({
      page:      parseInt(page  as string),
      limit:     parseInt(limit as string),
      startDate: startDate as string,
      endDate:   endDate   as string,
    });
    sendResponse(res, 200, true, 'Collector performance retrieved', result);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getActiveFarmersSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const result = await factoryService.getActiveFarmersSummary({
      page:      parseInt(page  as string),
      limit:     parseInt(limit as string),
      startDate: startDate as string,
      endDate:   endDate   as string,
    });
    sendResponse(res, 200, true, 'Active farmers summary retrieved', result);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getFraudFlags = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 100, startDate, endDate } = req.query;
    const result = await factoryService.detectFraud({
      limit:     parseInt(limit as string),
      startDate: startDate as string,
      endDate:   endDate   as string,
    });
    sendResponse(res, 200, true, 'Fraud flags retrieved', result);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getRevenueForecast = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const result = await factoryService.getRevenueForecast(days);
    sendResponse(res, 200, true, 'Revenue forecast retrieved', result);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getOutputForecast = async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const result = await factoryService.getOutputForecast(days);
    sendResponse(res, 200, true, 'Output forecast retrieved', result);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};

export const getReportData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportType = 'monthly', startDate, endDate } = req.query;
    const result = await factoryService.getReportData({
      reportType: reportType as any,
      startDate:  startDate  as string,
      endDate:    endDate    as string,
    });
    sendResponse(res, 200, true, 'Report data retrieved', result);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message);
  }
};