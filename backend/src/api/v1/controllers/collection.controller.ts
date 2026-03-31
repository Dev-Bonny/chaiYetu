import { Request, Response } from 'express';
import collectionService from '../../../services/collection.service';
import { sendResponse } from '../../../utils/response.utils';

export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const collectorId = (req as any).user.userId;
    const collectionData = {
      ...req.body,
      collector: collectorId,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : undefined
    };

    const collection = await collectionService.createCollection(collectionData);
    sendResponse(res, 201, true, 'Collection recorded successfully', collection);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const collections = await collectionService.getCollections({
      userRole: user.role,
      userId: user.userId,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string
    });

    sendResponse(res, 200, true, 'Collections retrieved successfully', collections);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getCollectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const collection = await collectionService.getCollectionById(req.params.id as string);
    sendResponse(res, 200, true, 'Collection retrieved successfully', collection);
  } catch (error: any) {
    sendResponse(res, 404, false, error.message);
  }
};

export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const collection = await collectionService.updateCollection(req.params.id as string, req.body);
    sendResponse(res, 200, true, 'Collection updated successfully', collection);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const verifyCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const verifiedBy = (req as any).user.userId;
    const { status, notes } = req.body;

    const collection = await collectionService.verifyCollection(req.params.id as string, status, verifiedBy, notes);
    sendResponse(res, 200, true, 'Collection verified successfully', collection);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getFarmerCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const collections = await collectionService.getFarmerCollections(
      req.params.farmerId as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendResponse(res, 200, true, 'Farmer collections retrieved successfully', collections);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getCollectorCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const collections = await collectionService.getCollectorCollections(
      req.params.collectorId as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    sendResponse(res, 200, true, 'Collector collections retrieved successfully', collections);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getCollectionSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const summary = await collectionService.getCollectionSummary(user.role, user.userId);
    sendResponse(res, 200, true, 'Collection summary retrieved successfully', summary);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};
