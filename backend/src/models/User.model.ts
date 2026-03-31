import mongoose, { Document, Schema } from 'mongoose';
const bcrypt = require('bcryptjs');

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'farmer' | 'collector' | 'admin' | 'factory_manager';
  isActive: boolean;
  lastLogin?: Date;
  // New fields for password reset
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    password: { type: String, required: true, minlength: 6 },
    role: { 
      type: String, 
      enum: ['farmer', 'collector', 'admin', 'factory_manager'], 
      required: true 
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    // Added fields for password reset
    resetPasswordToken: { 
      type: String, 
      select: false // Security: Don't return this field in standard queries
    },
    resetPasswordExpire: { type: Date }
  },
  { timestamps: true }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

export default mongoose.model<IUser>('User', userSchema);