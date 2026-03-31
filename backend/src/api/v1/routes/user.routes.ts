import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  getUsers, 
  getUserById, 
  updateUser, 
  deactivateUser,
  changePassword,
  createUser // <--- Added this, it was missing in your import!
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { 
  updateProfileValidator, 
  createUserValidator, 
  updateUserValidator, 
  changePasswordValidator,
  userIdValidator,
  userQueryValidator
} from '../validators/user.validator';

const router = Router();

// User profile routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validateRequest(updateProfileValidator), updateProfile);
router.patch('/change-password', authMiddleware, validateRequest(changePasswordValidator), changePassword);

// Admin user management routes
router.get('/', authMiddleware, authorize(['admin', 'factory_manager']), validateRequest(userQueryValidator), getUsers);
router.post('/', authMiddleware, authorize(['admin']), validateRequest(createUserValidator), createUser);
router.get('/:id', authMiddleware, authorize(['admin', 'factory_manager']), validateRequest(userIdValidator), getUserById);
router.put('/:id', authMiddleware, authorize(['admin', 'factory_manager']), validateRequest(updateUserValidator), updateUser);
router.patch('/:id/deactivate', authMiddleware, authorize(['admin']), validateRequest(userIdValidator), deactivateUser);

export default router;