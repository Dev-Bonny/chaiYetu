import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../../utils/jwt.utils';
import User from '../../../models/User.model';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
      return;
    }

    // In production, check token blacklist in Redis
    // const isBlacklisted = await redis.get(`blacklist:${token}`);
    // if (isBlacklisted) {
    //   res.status(401).json({ success: false, message: 'Token has been invalidated' });
    //   return;
    // }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User not found or inactive' });
      return;
    }

    (req as any).user = { ...decoded, user };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};