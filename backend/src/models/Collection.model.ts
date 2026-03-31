import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  collectionId: string;
  farmer: mongoose.Types.ObjectId;
  collector: mongoose.Types.ObjectId;
  collectionDate: Date;
  weight: number; // in kg
  quality: 'grade1' | 'grade2' | 'grade3';
  pricePerKg: number;
  totalAmount: number;
  imageUrl?: string;
  location: {
    coordinates: {
      lat: number;
      lng: number;
    };
    address: string;
  };
  status: 'pending' | 'verified' | 'rejected' | 'paid';
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  notes?: string;
}

const collectionSchema = new Schema<ICollection>(
  {
    collectionId: { type: String, required: true, unique: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    collector: { type: Schema.Types.ObjectId, ref: 'Collector', required: true },
    collectionDate: { type: Date, required: true },
    weight: { type: Number, required: true, min: 0 },
    quality: { 
      type: String, 
      enum: ['grade1', 'grade2', 'grade3'], 
      required: true 
    },
    pricePerKg: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    imageUrl: { type: String },
    location: {
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      },
      address: { type: String, required: true }
    },
    status: { 
      type: String, 
      enum: ['pending', 'verified', 'rejected', 'paid'], 
      default: 'pending' 
    },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verificationDate: { type: Date },
    notes: { type: String }
  },
  { timestamps: true }
);

// Calculate total amount before saving
collectionSchema.pre('save', function(next) {
  this.totalAmount = this.weight * this.pricePerKg;
  next();
});

// Generate collection ID
collectionSchema.pre('validate', async function(next) {
  if (this.isNew && !this.collectionId) {
    const count = await mongoose.model('Collection').countDocuments();
    // Format: COL-YYYYMMDD-XXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    this.collectionId = `COL-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

export default mongoose.model<ICollection>('Collection', collectionSchema);