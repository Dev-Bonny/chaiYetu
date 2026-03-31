import { Request, Response } from 'express';
import farmerService from '../../../services/farmer.service';
import Farmer from '../../../models/Farmer.model';
import { sendResponse } from '../../../utils/response.utils';

export const getFarmers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page, limit, search, county, status } = req.query;

        const result = await farmerService.getFarmers({
            page: page ? parseInt(page as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
            search: search as string,
            county: county as string,
            status: status as string
        });

        sendResponse(res, 200, true, 'Farmers retrieved successfully', result);
    } catch (error: any) {
        sendResponse(res, 400, false, error.message);
    }
};

export const getAssignedFarmers = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.userId;
        const result = await farmerService.getAssignedFarmers(userId);

        sendResponse(res, 200, true, 'Assigned farmers retrieved successfully', result);
    } catch (error: any) {
        sendResponse(res, 400, false, error.message);
    }
};

export const createFarmer = async (req: Request, res: Response): Promise<void> => {
    try {
        const creatorUserId = (req as any).user.userId;
        const farmerData = req.body;

        const result = await farmerService.createFarmer(farmerData, creatorUserId);

        sendResponse(res, 201, true, 'Farmer registered successfully', result);
    } catch (error: any) {
        sendResponse(res, 400, false, error.message);
    }
};
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.userId;
        const farmer = await Farmer.findOne({ user: userId }).populate('user', '-password');
        if (!farmer) {
            sendResponse(res, 404, false, 'Farmer profile not found for this user');
            return;
        }
        sendResponse(res, 200, true, 'Farmer profile retrieved successfully', farmer);
    } catch (error: any) {
        sendResponse(res, 400, false, error.message);
    }
};
