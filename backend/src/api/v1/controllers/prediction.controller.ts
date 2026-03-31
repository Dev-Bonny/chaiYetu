import { Request, Response } from 'express';
import predictionService from '../../../services/prediction.service';
import { sendResponse } from '../../../utils/response.utils';

export const getWeightPrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmerId, days = 7 } = req.query;
    const user = (req as any).user;
    
    const prediction = await predictionService.getWeightPrediction(
      farmerId as string,
      parseInt(days as string),
      user
    );
    
    sendResponse(res, 200, true, 'Weight prediction retrieved successfully', prediction);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getPaymentPrediction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmerId, days = 30 } = req.query;
    const user = (req as any).user;
    
    const prediction = await predictionService.getPaymentPrediction(
      farmerId as string,
      parseInt(days as string),
      user
    );
    
    sendResponse(res, 200, true, 'Payment prediction retrieved successfully', prediction);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getFarmerPredictions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const predictions = await predictionService.getFarmerPredictions(
      req.params.farmerId as string,
      parseInt(page as string),
      parseInt(limit as string)
    );
    
    sendResponse(res, 200, true, 'Farmer predictions retrieved successfully', predictions);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const getPredictionAccuracy = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const accuracy = await predictionService.getPredictionAccuracy(parseInt(days as string));
    sendResponse(res, 200, true, 'Prediction accuracy retrieved successfully', accuracy);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};

export const trainModels = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await predictionService.trainModels();
    sendResponse(res, 200, true, 'Models training initiated successfully', result);
  } catch (error: any) {
    sendResponse(res, 400, false, error.message);
  }
};