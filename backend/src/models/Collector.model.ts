import mongoose, { Document, Schema } from 'mongoose';

export interface ICollector extends Document {
  user: mongoose.Types.ObjectId;
  collectorId: string;
  assignedArea: {
    county: string;
    subCounty: string;
    wards: string[];
  };
  vehicleDetails?: {
    type: string;
    registration: string;
    capacity: number; // in kg
  };
  status: 'active' | 'inactive' | 'on_leave';
  totalCollections: number;
  totalFarmers: number;
}

const collectorSchema = new Schema<ICollector>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collectorId: { type: String, required: true, unique: true },
    assignedArea: {
      county: { type: String, required: true },
      subCounty: { type: String, required: true },
      wards: [{ type: String, required: true }]
    },
    vehicleDetails: {
      // 👇 FIX: "type" is a reserved word. We must define it like this:
      type: { type: String, required: true }, 
      registration: { type: String, required: true },
      capacity: { type: Number, required: true }
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'on_leave'], 
      default: 'active' 
    },
    totalCollections: { type: Number, default: 0 },
    totalFarmers: { type: Number, default: 0 }
  },
  { timestamps: true }
);

collectorSchema.pre('validate', async function(next) {
  // Check if ID is missing or empty string
  if (this.isNew && !this.collectorId) {
    const count = await mongoose.model('Collector').countDocuments();
    this.collectorId = `C${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model<ICollector>('Collector', collectorSchema);