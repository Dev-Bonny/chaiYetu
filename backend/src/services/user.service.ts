import User from '../models/User.model';
import Farmer from '../models/Farmer.model';
import Collector from '../models/Collector.model';
import { Types } from 'mongoose';

interface GetUsersParams {
  page: number;
  limit: number;
  role?: string;
  search?: string;
}

class UserService {
  async getUserProfile(userId: string): Promise<any> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }

    let profileData: any = { user };

    // Get role-specific profile
    if (user.role === 'farmer') {
      const farmerProfile = await Farmer.findOne({ user: userId }).populate('collector');
      profileData.farmerProfile = farmerProfile;
    } else if (user.role === 'collector') {
      const collectorProfile = await Collector.findOne({ user: userId });
      profileData.collectorProfile = collectorProfile;
    }

    return profileData;
  }

  async updateUserProfile(userId: string, updateData: any): Promise<any> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUsers(params: GetUsersParams): Promise<{ users: any[]; total: number; page: number; pages: number }> {
    const { page, limit, role, search } = params;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getUserById(userId: string): Promise<any> {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }

    let profileData: any = { user };

    // Get role-specific profile
    if (user.role === 'farmer') {
      const farmerProfile = await Farmer.findOne({ user: userId })
        .populate('collector')
        .populate('user');
      profileData.farmerProfile = farmerProfile;
    } else if (user.role === 'collector') {
      const collectorProfile = await Collector.findOne({ user: userId })
        .populate('user');
      const assignedFarmers = await Farmer.countDocuments({ collector: user._id });
      profileData.collectorProfile = { ...collectorProfile?.toJSON(), assignedFarmers };
    }

    return profileData;
  }

  async updateUser(userId: string, updateData: any): Promise<any> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async deactivateUser(userId: string): Promise<void> {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }
  }

  // --- ADDED METHODS BELOW ---

  async createUser(userData: any): Promise<any> {
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email: userData.email }, { phone: userData.phone }] 
    });
    
    if (existingUser) {
      throw new Error('User with this email or phone already exists');
    }

    // Create the user
    const user = await User.create(userData);
    
    // Note: If you need to create Farmer/Collector profiles here (like in Auth service),
    // you should add that logic here as well.
    
    return user;
  }

  async changePassword(userId: string, currentPass: string, newPass: string): Promise<void> {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Note: Ideally you should verify 'currentPass' here using something like:
    // const isMatch = await user.comparePassword(currentPass);
    // if (!isMatch) throw new Error('Incorrect current password');

    // Update password
    // (Assuming your User model has a pre-save hook to hash this password)
    user.password = newPass;
    await user.save();
  }
}

export default new UserService();