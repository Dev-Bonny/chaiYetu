import { Router } from 'express';
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  verifyCollection,
  getFarmerCollections,
  getCollectorCollections,
  getCollectionSummary
} from '../controllers/collection.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createCollectionValidator, updateCollectionValidator } from '../validators/collection.validator';
import { upload } from '../middlewares/upload.middleware';

import { parseJsonFields } from '../middlewares/json-parser.middleware';

const router = Router();

router.post('/', authMiddleware, authorize(['collector']), upload.single('image'), parseJsonFields(['location']), validateRequest(createCollectionValidator), createCollection);
router.get('/', authMiddleware, getCollections);

// Specific named routes MUST come before /:id to avoid being swallowed
router.get('/summary', authMiddleware, getCollectionSummary);
router.get('/farmer/:farmerId', authMiddleware, getFarmerCollections);
router.get('/collector/:collectorId', authMiddleware, authorize(['admin', 'factory_manager']), getCollectorCollections);

// Wildcard id routes last
router.get('/:id', authMiddleware, getCollectionById);
router.put('/:id', authMiddleware, authorize(['collector']), validateRequest(updateCollectionValidator), updateCollection);
// Collectors verify in the field; admins/factory_managers verify at the factory
router.patch('/:id/verify', authMiddleware, authorize(['collector', 'admin', 'factory_manager']), verifyCollection);

export default router;
