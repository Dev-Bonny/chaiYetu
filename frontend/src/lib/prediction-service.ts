import { apiClient } from './api'

export interface WeightPrediction {
  predictedWeight: number
  confidence: number
  historicalData: Array<{
    date: string
    weight: number
    quality: string
  }>
  factors: {
    weather: {
      rainfall_expected: boolean
      temperature: number
      humidity: number
    }
    season: string
    trend: 'increasing' | 'decreasing' | 'stable'
  }
  recommendations: string[]
  model_version: string
}

export interface PaymentPrediction {
  predictedAmount: number
  confidence: number
  expectedPayments: Array<{
    date: string
    amount: number
    confidence: number
  }>
  factors: {
    collectionTrend: {
      direction: string
      rate: number
    }
    priceTrend: {
      direction: string
      rate: number
    }
    seasonalFactor: number
  }
  model_version: string
}

export interface PredictionMetrics {
  weight: {
    mae: number
    rmse: number
    accuracy: number
    totalPredictions: number
  }
  payment: {
    mae: number
    rmse: number
    accuracy: number
    totalPredictions: number
  }
  overall: {
    totalPredictions: number
    period: string
  }
}

class PredictionService {
  async getWeightPrediction(farmerId: string, days: number = 7) {
    return apiClient.get(`/api/v1/predictions/weight?farmerId=${farmerId}&days=${days}`)
  }

  async getPaymentPrediction(farmerId: string, days: number = 30) {
    return apiClient.get(`/api/v1/predictions/payment?farmerId=${farmerId}&days=${days}`)
  }

  async getFarmerPredictions(farmerId: string, params?: {
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value))
      })
    }
    
    return apiClient.get(`/api/v1/predictions/farmer/${farmerId}?${queryParams.toString()}`)
  }

  async getPredictionAccuracy(days: number = 30) {
    return apiClient.get(`/api/v1/predictions/accuracy?days=${days}`)
  }

  async trainModels() {
    return apiClient.post('/api/v1/predictions/train')
  }

  async getHistoricalPredictions(farmerId: string) {
    // Get historical predictions vs actual for accuracy analysis
    return apiClient.get(`/api/v1/predictions/historical/${farmerId}`)
  }

  async getSeasonalTrends() {
    return apiClient.get('/api/v1/predictions/seasonal-trends')
  }

  async getPredictionsByRegion(region: string) {
    return apiClient.get(`/api/v1/predictions/region/${region}`)
  }
}

export const predictionService = new PredictionService()