import Prediction, { IPrediction } from '../models/Prediction.model';
import Collection from '../models/Collection.model';
import Payment from '../models/Payment.model';
import Farmer from '../models/Farmer.model';
import User from '../models/User.model';
import axios from 'axios';
const logger = require('../utils/logger.utils');

interface WeightPrediction {
  predictedWeight: number;
  confidence: number;
  historicalData: any[];
  factors: {
    weather: any;
    season: string;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  recommendations: string[];
}

interface PaymentPrediction {
  predictedAmount: number;
  confidence: number;
  expectedPayments: any[];
  factors: {
    collectionTrend: any;
    priceTrend: any;
    seasonalFactor: number;
  };
}

class PredictionService {
  async getWeightPrediction(farmerId: string, days: number, user: any): Promise<WeightPrediction> {
    // Authorization check
    if (user.role === 'farmer') {
      const farmer = await Farmer.findOne({ user: user.userId });
      if (!farmer || farmer._id.toString() !== farmerId) {
        throw new Error('Access denied to this farmer data');
      }
    }

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      throw new Error('Farmer not found');
    }

    try {
      // Get historical data for ML service
      const historicalData = await this.getFarmerHistoricalData(farmerId, 90); // Last 90 days

      // Call ML service for prediction
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/api/v1/predict/weight`, {
        farmer_id: farmerId,
        historical_data: historicalData,
        prediction_days: days
      });

      // Save prediction to database
      const prediction = await Prediction.create({
        farmer: farmerId,
        predictionDate: new Date(),
        predictionType: 'weight',
        predictedValue: mlResponse.data.predicted_weight,
        confidence: mlResponse.data.confidence,
        inputFeatures: {
          historicalData,
          weatherData: mlResponse.data.weather_factors,
          seasonalFactors: mlResponse.data.seasonal_factors
        }
      });

      return {
        predictedWeight: mlResponse.data.predicted_weight,
        confidence: mlResponse.data.confidence,
        historicalData: historicalData.slice(-10), // Last 10 entries
        factors: {
          weather: mlResponse.data.weather_factors,
          season: this.getCurrentSeason(),
          trend: this.analyzeTrend(historicalData)
        },
        recommendations: this.generateWeightRecommendations(mlResponse.data)
      };
    } catch (error) {
      logger.error('ML service error, using fallback prediction:', error);
      return this.getFallbackWeightPrediction(farmerId, days);
    }
  }

  async getPaymentPrediction(farmerId: string, days: number, user: any): Promise<PaymentPrediction> {
    // Authorization check
    if (user.role === 'farmer') {
      const farmer = await Farmer.findOne({ user: user.userId });
      if (!farmer || farmer._id.toString() !== farmerId) {
        throw new Error('Access denied to this farmer data');
      }
    }

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      throw new Error('Farmer not found');
    }

    try {
      // Get collection and payment history
      const collectionData = await this.getFarmerCollectionData(farmerId, 180); // Last 180 days
      const paymentData = await this.getFarmerPaymentData(farmerId, 180);

      // Call ML service for payment prediction
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL}/api/v1/predict/payment`, {
        farmer_id: farmerId,
        collection_data: collectionData,
        payment_data: paymentData,
        prediction_days: days
      });

      // Save prediction to database
      const prediction = await Prediction.create({
        farmer: farmerId,
        predictionDate: new Date(),
        predictionType: 'payment',
        predictedValue: mlResponse.data.predicted_amount,
        confidence: mlResponse.data.confidence,
        inputFeatures: {
          historicalData: [...collectionData, ...paymentData],
          seasonalFactors: mlResponse.data.seasonal_factors
        }
      });

      return {
        predictedAmount: mlResponse.data.predicted_amount,
        confidence: mlResponse.data.confidence,
        expectedPayments: mlResponse.data.expected_payments,
        factors: {
          collectionTrend: mlResponse.data.collection_trend,
          priceTrend: mlResponse.data.price_trend,
          seasonalFactor: mlResponse.data.seasonal_factor
        }
      };
    } catch (error) {
      logger.error('ML service error, using fallback payment prediction:', error);
      return this.getFallbackPaymentPrediction(farmerId, days);
    }
  }

  async getFarmerPredictions(farmerId: string, page: number, limit: number): Promise<{ predictions: IPrediction[]; total: number; page: number; pages: number }> {
    const skip = (page - 1) * limit;

    const [predictions, total] = await Promise.all([
      Prediction.find({ farmer: farmerId })
        .sort({ predictionDate: -1 })
        .skip(skip)
        .limit(limit),
      Prediction.countDocuments({ farmer: farmerId })
    ]);

    return {
      predictions,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getPredictionAccuracy(days: number): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const predictions = await Prediction.find({
      predictionDate: { $gte: cutoffDate },
      actualValue: { $exists: true }
    });

    const weightPredictions = predictions.filter(p => p.predictionType === 'weight');
    const paymentPredictions = predictions.filter(p => p.predictionType === 'payment');

    const calculateAccuracy = (preds: IPrediction[]) => {
      if (preds.length === 0) return { mae: 0, rmse: 0, accuracy: 0 };

      const errors = preds.map(p => Math.abs(p.predictedValue - p.actualValue!));
      const mae = errors.reduce((sum, error) => sum + error, 0) / errors.length;
      const rmse = Math.sqrt(errors.reduce((sum, error) => sum + error * error, 0) / errors.length);
      
      const avgActual = preds.reduce((sum, p) => sum + p.actualValue!, 0) / preds.length;
      const accuracy = Math.max(0, 100 - (mae / avgActual) * 100);

      return { mae, rmse, accuracy };
    };

    return {
      weight: {
        ...calculateAccuracy(weightPredictions),
        totalPredictions: weightPredictions.length
      },
      payment: {
        ...calculateAccuracy(paymentPredictions),
        totalPredictions: paymentPredictions.length
      },
      overall: {
        totalPredictions: predictions.length,
        period: `${days} days`
      }
    };
  }

  async trainModels(): Promise<{ status: string; message: string }> {
    try {
      // Get training data
      const trainingData = await this.getTrainingData();

      // Call ML service to train models
      const response = await axios.post(`${process.env.ML_SERVICE_URL}/api/v1/train`, {
        training_data: trainingData,
        models: ['weight_lstm', 'payment_linear']
      });

      logger.info('Models training completed successfully');

      return {
        status: 'success',
        message: 'Models training completed successfully'
      };
    } catch (error) {
      logger.error('Model training failed:', error);
      throw new Error('Model training failed');
    }
  }

  private async getFarmerHistoricalData(farmerId: string, days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const collections = await Collection.find({
      farmer: farmerId,
      collectionDate: { $gte: cutoffDate },
      status: 'verified'
    }).sort({ collectionDate: 1 });

    return collections.map(collection => ({
      date: collection.collectionDate,
      weight: collection.weight,
      quality: collection.quality,
      price: collection.pricePerKg,
      amount: collection.totalAmount
    }));
  }

  private async getFarmerCollectionData(farmerId: string, days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const collections = await Collection.aggregate([
      {
        $match: {
          farmer: new (require('mongoose').Types.ObjectId)(farmerId),
          collectionDate: { $gte: cutoffDate },
          status: 'verified'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$collectionDate' },
            month: { $month: '$collectionDate' },
            day: { $dayOfMonth: '$collectionDate' }
          },
          totalWeight: { $sum: '$weight' },
          totalAmount: { $sum: '$totalAmount' },
          avgQuality: { $avg: { $switch: {
            branches: [
              { case: { $eq: ['$quality', 'grade1'] }, then: 1 },
              { case: { $eq: ['$quality', 'grade2'] }, then: 2 },
              { case: { $eq: ['$quality', 'grade3'] }, then: 3 }
            ],
            default: 2
          }}}
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return collections;
  }

  private async getFarmerPaymentData(farmerId: string, days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const payments = await Payment.find({
      farmer: farmerId,
      paymentDate: { $gte: cutoffDate },
      status: 'completed'
    }).sort({ paymentDate: 1 });

    return payments.map(payment => ({
      date: payment.paymentDate,
      amount: payment.totalAmount,
      method: payment.paymentMethod,
      collections: payment.collections.length
    }));
  }

  private async getTrainingData(): Promise<any> {
    // Get comprehensive training data from the database
    const [collections, payments, farmers] = await Promise.all([
      Collection.find({ status: 'verified' })
        .populate('farmer')
        .sort({ collectionDate: 1 })
        .limit(10000), // Limit for performance
      Payment.find({ status: 'completed' })
        .populate('farmer')
        .sort({ paymentDate: 1 })
        .limit(10000),
      Farmer.find().populate('user')
    ]);

    return {
      collections: collections.map(c => ({
        farmer_id: c.farmer._id,
        date: c.collectionDate,
        weight: c.weight,
        quality: c.quality,
        price: c.pricePerKg,
        location: c.location,
        weather: this.getSimulatedWeatherData(c.collectionDate)
      })),
      payments: payments.map(p => ({
        farmer_id: p.farmer._id,
        date: p.paymentDate,
        amount: p.totalAmount,
        method: p.paymentMethod,
        collection_count: p.collections.length
      })),
      farmers: farmers.map(f => ({
        farmer_id: f._id,
        farm_size: f.farmSize,
        tea_variety: f.teaVariety,
        location: f.location,
        registration_date: f.registrationDate
      }))
    };
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'long_rains';
    if (month >= 5 && month <= 8) return 'cold_season';
    if (month >= 9 && month <= 11) return 'short_rains';
    return 'dry_season';
  }

  private analyzeTrend(historicalData: any[]): 'increasing' | 'decreasing' | 'stable' {
    if (historicalData.length < 5) return 'stable';
    
    const recent = historicalData.slice(-5);
    const weights = recent.map(d => d.weight);
    const trend = weights[weights.length - 1] - weights[0];
    
    if (trend > 2) return 'increasing';
    if (trend < -2) return 'decreasing';
    return 'stable';
  }

  private generateWeightRecommendations(predictionData: any): string[] {
    const recommendations: string[] = [];
    
    if (predictionData.confidence < 0.7) {
      recommendations.push('Low prediction confidence. Consider manual inspection.');
    }
    
    if (predictionData.predicted_weight < 10) {
      recommendations.push('Low predicted yield. Check soil moisture and fertilizer application.');
    }
    
    if (predictionData.seasonal_factors?.rainfall_expected) {
      recommendations.push('Rain expected. Plan collection accordingly.');
    }
    
    recommendations.push('Maintain regular pruning schedule for optimal yield.');
    
    return recommendations;
  }

  private getSimulatedWeatherData(date: Date): any {
    // Simulate weather data - in production, integrate with weather API
    return {
      rainfall: Math.random() * 10,
      temperature: 20 + Math.random() * 10,
      humidity: 60 + Math.random() * 30
    };
  }

  private async getFallbackWeightPrediction(farmerId: string, days: number): Promise<WeightPrediction> {
    // Simple fallback prediction based on historical average
    const historicalData = await this.getFarmerHistoricalData(farmerId, 30);
    const avgWeight = historicalData.reduce((sum, data) => sum + data.weight, 0) / historicalData.length || 15;

    return {
      predictedWeight: avgWeight,
      confidence: 0.5,
      historicalData: historicalData.slice(-5),
      factors: {
        weather: { rainfall: 0, temperature: 0, humidity: 0 },
        season: this.getCurrentSeason(),
        trend: 'stable'
      },
      recommendations: ['Using fallback prediction. ML service unavailable.']
    };
  }

  private async getFallbackPaymentPrediction(farmerId: string, days: number): Promise<PaymentPrediction> {
    // Simple fallback prediction based on recent payments
    const paymentData = await this.getFarmerPaymentData(farmerId, 30);
    const avgPayment = paymentData.reduce((sum, data) => sum + data.amount, 0) / paymentData.length || 1000;

    return {
      predictedAmount: avgPayment,
      confidence: 0.5,
      expectedPayments: [],
      factors: {
        collectionTrend: { direction: 'stable', rate: 0 },
        priceTrend: { direction: 'stable', rate: 0 },
        seasonalFactor: 1.0
      }
    };
  }
}

export default new PredictionService();