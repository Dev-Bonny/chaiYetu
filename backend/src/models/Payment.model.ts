import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  paymentId: string;
  farmer: mongoose.Types.ObjectId;
  collections: mongoose.Types.ObjectId[];
  totalAmount: number;
  paymentDate: Date;
  paymentMethod: 'mpesa' | 'bank_transfer' | 'cash';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mpesaReference?: string;
  bankReference?: string;
  processedBy: mongoose.Types.ObjectId;
  processedAt?: Date;
  failureReason?: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    paymentId: { type: String, required: true, unique: true },
    farmer: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    collections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentDate: { type: Date, required: true },
    paymentMethod: { 
      type: String, 
      enum: ['mpesa', 'bank_transfer', 'cash'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    },
    mpesaReference: { type: String },
    bankReference: { type: String },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    processedAt: { type: Date },
    failureReason: { type: String }
  },
  { timestamps: true }
);

paymentSchema.pre('validate', async function(next) {
  if (this.isNew && !this.paymentId) {
    const count = await mongoose.model('Payment').countDocuments();
    this.paymentId = `PAY-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

export default mongoose.model<IPayment>('Payment', paymentSchema);