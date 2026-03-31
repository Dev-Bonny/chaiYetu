import { Router } from 'express';
import {
  getWeightPrediction,
  getPaymentPrediction,
  getFarmerPredictions,
  trainModels,
  getPredictionAccuracy
} from '../controllers/prediction.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { predictionQueryValidator } from '../validators/prediction.validator';

const router = Router();

router.get('/weight', authMiddleware, validateRequest(predictionQueryValidator), getWeightPrediction);
router.get('/payment', authMiddleware, validateRequest(predictionQueryValidator), getPaymentPrediction);
router.get('/farmer/:farmerId', authMiddleware, getFarmerPredictions);
router.get('/accuracy', authMiddleware, authorize(['admin', 'factory_manager']), getPredictionAccuracy);
router.post('/train', authMiddleware, authorize(['admin']), trainModels);

export default router;