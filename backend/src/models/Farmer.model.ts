import mongoose, { Document, Schema } from 'mongoose';

export interface IFarmer extends Document {
  user: mongoose.Types.ObjectId;
  farmerId: string;
  location: {
    county: string;
    subCounty: string;
    ward: string;
    village: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  farmSize: number; // in acres
  teaVariety: string;
  registrationDate: Date;
  status: 'active' | 'inactive' | 'suspended';
  collector?: mongoose.Types.ObjectId;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

const farmerSchema = new Schema<IFarmer>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    farmerId: { type: String, required: true, unique: true },
    location: {
      county: { type: String, required: true },
      subCounty: { type: String, required: true },
      ward: { type: String, required: true },
      village: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    farmSize: { type: Number, required: true, min: 0 },
    teaVariety: { type: String, required: true },
    registrationDate: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'suspended'], 
      default: 'active' 
    },
    collector: { type: Schema.Types.ObjectId, ref: 'Collector' },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountName: String
    }
  },
  { timestamps: true }
);

// Generate farmer ID before saving
farmerSchema.pre('validate', async function(next) {
  if (this.isNew && !this.farmerId) {
    const count = await mongoose.model('Farmer').countDocuments();
    this.farmerId = `F${String(count + 1).padStart(6, '0')}`;
  }
  next();
});
export default mongoose.model<IFarmer>('Farmer', farmerSchema);