import mongoose, { Document, Schema } from 'mongoose';

export interface IPrediction extends Document {
  farmer: mongoose.Types.ObjectId;
  predictionDate: Date;
  predictionType: 'weight' | 'payment';
  predictedValue: number;
  confidence: number; // 0-1
  inputFeatures: {
    historicalData: any[];
    weatherData?: any;
    seasonalFactors?: any;
  };
  actualValue?: number;
  accuracy?: number;
  status: 'pending' | 'accurate' | 'inaccurate';
}

const predictionSchema = new Schema<IPrediction>(
  {
    farmer: { type: Schema.Types.ObjectId, ref: 'Farmer', required: true },
    predictionDate: { type: Date, required: true },
    predictionType: { 
      type: String, 
      enum: ['weight', 'payment'], 
      required: true 
    },
    predictedValue: { type: Number, required: true },
    confidence: { type: Number, required: true, min: 0, max: 1 },
    inputFeatures: {
      historicalData: [{ type: Schema.Types.Mixed }],
      weatherData: { type: Schema.Types.Mixed },
      seasonalFactors: { type: Schema.Types.Mixed }
    },
    actualValue: { type: Number },
    accuracy: { type: Number },
    status: { 
      type: String, 
      enum: ['pending', 'accurate', 'inaccurate'], 
      default: 'pending' 
    }
  },
  { timestamps: true }
);

// Index for efficient querying
predictionSchema.index({ farmer: 1, predictionDate: -1 });
predictionSchema.index({ predictionType: 1, status: 1 });

export default mongoose.model<IPrediction>('Prediction', predictionSchema);