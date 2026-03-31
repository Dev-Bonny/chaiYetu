import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  forgotPassword, 
  resetPassword 
} from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  registerValidator, 
  loginValidator, 
  forgotPasswordValidator, 
  resetPasswordValidator 
} from '../validators/auth.validator';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', validateRequest(registerValidator), register);
router.post('/login', validateRequest(loginValidator), login);
router.post('/logout', authMiddleware, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validateRequest(forgotPasswordValidator), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordValidator), resetPassword);

export default router;