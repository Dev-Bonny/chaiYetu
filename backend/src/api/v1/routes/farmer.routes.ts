import { Router } from 'express';
import { getFarmers, getAssignedFarmers, createFarmer, getMyProfile } from '../controllers/farmer.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';

const router = Router();

router.post('/', authMiddleware, authorize(['collector', 'admin']), createFarmer);
router.get('/me', authMiddleware, getMyProfile);
router.get('/', authMiddleware, getFarmers);
router.get('/assigned', authMiddleware, authorize(['collector']), getAssignedFarmers);

export default router;
