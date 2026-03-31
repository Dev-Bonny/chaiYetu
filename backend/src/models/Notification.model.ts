import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'payment' | 'collection' | 'system' | 'alert' | 'prediction';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any; // Additional data for the notification
  read: boolean;
  readAt?: Date;
  action?: {
    label: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  };
  expiresAt?: Date;
  delivered: boolean;
  deliveryMethod?: ('push' | 'email' | 'sms' | 'in_app')[];
  deliveryStatus: {
    push?: { sent: boolean; error?: string };
    email?: { sent: boolean; error?: string };
    sms?: { sent: boolean; error?: string };
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['payment', 'collection', 'system', 'alert', 'prediction'],
      required: true,
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    action: {
      label: String,
      url: String,
      method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'] }
    },
    expiresAt: { type: Date },
    delivered: { type: Boolean, default: false, index: true },
    deliveryMethod: [{ type: String, enum: ['push', 'email', 'sms', 'in_app'] }],
    deliveryStatus: {
      push: { sent: Boolean, error: String },
      email: { sent: Boolean, error: String },
      sms: { sent: Boolean, error: String }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient querying
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if notification is unread
notificationSchema.virtual('isUnread').get(function() {
  return !this.read;
});

// Pre-save middleware
notificationSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set default expiration (30 days)
    if (!this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

export default mongoose.model<INotification>('Notification', notificationSchema);