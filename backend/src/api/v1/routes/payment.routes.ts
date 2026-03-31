import { Router } from 'express';
import {
  createPayment,
  getPayments,
  getPaymentById,
  processPayment,
  getFarmerPayments,
  getPaymentSummary,
  initiateMpesaPayment,
  mpesaCallback
} from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { createPaymentValidator, processPaymentValidator } from '../validators/payment.validator';

const router = Router();

router.post('/', authMiddleware, authorize(['admin', 'factory_manager']), validateRequest(createPaymentValidator), createPayment);
router.get('/', authMiddleware, getPayments);
router.get('/summary', authMiddleware, getPaymentSummary);
router.get('/farmer/:farmerId', authMiddleware, getFarmerPayments);
router.get('/:id', authMiddleware, getPaymentById);
router.post('/:id/process', authMiddleware, authorize(['admin', 'factory_manager']), validateRequest(processPaymentValidator), processPayment);
router.post('/mpesa/initiate', authMiddleware, authorize(['admin', 'factory_manager']), initiateMpesaPayment);
router.post('/mpesa/callback', mpesaCallback);

export default router;