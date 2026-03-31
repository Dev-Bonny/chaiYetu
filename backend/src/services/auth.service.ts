import User from '../models/User.model';
import Farmer from '../models/Farmer.model';
import Collector from '../models/Collector.model';

// For utilities that might not have types, require is okay, 
// but import is better if they are .ts files too.
import { generateToken } from '../utils/jwt.utils'; 
import crypto from 'crypto';
// If logger doesn't have a default export, use * as logger or { logger }
import logger from '../utils/logger.utils';

class AuthService {
  async register(userData: any): Promise<{ user: any; token: string; refreshToken: string }> {
    const { role, ...userFields } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: userFields.email }, { phone: userFields.phone }]
    });

    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    // Create user
    const user = await User.create({ ...userFields, role });

    // Create role-specific profile
    if (role === 'farmer') {
      await Farmer.create({ user: user._id, ...userData.farmerProfile });
    } else if (role === 'collector') {
      await Collector.create({ user: user._id, ...userData.collectorProfile });
    }

    // Generate tokens
    const token = generateToken({ userId: user._id, email: user.email, role: user.role });
    const refreshToken = crypto.randomBytes(40).toString('hex');

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  async login(email: string, password: string): Promise<{ user: any; token: string; refreshToken: string }> {
    const user = await User.findOne({ email, isActive: true });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken({ userId: user._id, email: user.email, role: user.role });
    const refreshToken = crypto.randomBytes(40).toString('hex');

    logger.info(`User ${user.email} logged in successfully`);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  async logout(token: string): Promise<void> {
    logger.info('User logged out');
  }

  async refreshToken(oldRefreshToken: string): Promise<{ token: string }> {
    if (!oldRefreshToken) {
      throw new Error('Invalid refresh token');
    }
    throw new Error("Refresh token logic requires DB implementation");
  }

  async forgotPassword(email: string): Promise<void> {
    // 1. Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      // Security: Don't reveal if user doesn't exist, just return
      return; 
    }

    // 2. Generate Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 3. Hash token and save to database
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.save();

    // 4. Send email (Mocked)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    logger.info(`Password reset token for ${email}: ${resetToken}`);
    logger.info(`Reset URL: ${resetUrl}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // 1. Hash the incoming token to match the one in DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 2. Find user with valid token and non-expired time
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // 3. Set new password
    user.password = newPassword;
    
    // 4. Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    
    logger.info(`Password reset successful for user ${user.email}`);
  }
}

export default new AuthService();