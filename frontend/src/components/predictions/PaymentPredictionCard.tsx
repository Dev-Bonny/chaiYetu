'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { PaymentPrediction } from '@/lib/prediction-service'
import { formatCurrency } from '@/lib/utils'

interface PaymentPredictionCardProps {
  farmerId: string
  onRefresh?: () => void
}

export default function PaymentPredictionCard({ farmerId, onRefresh }: PaymentPredictionCardProps) {
  const [prediction, setPrediction] = useState<PaymentPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchPrediction()
  }, [farmerId, days])

  const fetchPrediction = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Mock data for demo - replace with actual API call
      const mockPrediction: PaymentPrediction = {
        predictedAmount: 12500,
        confidence: 0.78,
        expectedPayments: [
          { date: '2024-01-08', amount: 4500, confidence: 0.85 },
          { date: '2024-01-15', amount: 4200, confidence: 0.82 },
          { date: '2024-01-22', amount: 3800, confidence: 0.78 },
        ],
        factors: {
          collectionTrend: {
            direction: 'increasing',
            rate: 8.5
          },
          priceTrend: {
            direction: 'stable',
            rate: 0.2
          },
          seasonalFactor: 1.2
        },
        model_version: 'payment_rf_v1.5'
      }
      setPrediction(mockPrediction)
    } catch (error) {
      setError('Failed to load prediction')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendBadge = (trend: { direction: string; rate: number }) => {
    const color = trend.direction === 'increasing' ? 'green' : 
                  trend.direction === 'decreasing' ? 'red' : 'yellow'
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {trend.direction === 'increasing' ? <TrendingUp size={12} className="mr-1" /> :
         trend.direction === 'decreasing' ? <TrendingDown size={12} className="mr-1" /> :
         <Clock size={12} className="mr-1" />}
        {trend.direction} ({Math.abs(trend.rate).toFixed(1)}%)
      </span>
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tea-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center p-6">
          <AlertCircle className="mx-auto text-red-500" size={32} />
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={fetchPrediction}
            className="mt-4 px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!prediction) return null

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payment Forecast</h3>
          <div className="flex items-center space-x-2 mt-1">
            <DollarSign className="text-tea-600" size={16} />
            <p className="text-sm text-gray-600">AI-powered payment prediction</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
          >
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
          </select>
          <button
            onClick={fetchPrediction}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh prediction"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Main Prediction */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-600">Predicted Earnings</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-4xl font-bold text-gray-900">
                {formatCurrency(prediction.predictedAmount)}
              </p>
              <p className="text-lg text-gray-600">next {days} days</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
              {(prediction.confidence * 100).toFixed(0)}% Confidence
            </div>
            <p className="text-xs text-gray-500 mt-1">Model accuracy</p>
          </div>
        </div>
      </div>

      {/* Expected Payments */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Expected Payments</h4>
        <div className="space-y-3">
          {prediction.expectedPayments.map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-tea-100 rounded-full flex items-center justify-center">
                  <Calendar className="text-tea-600" size={16} />
                </div>
                <div>
                  <p className="font-medium">
                    {new Date(payment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-600">Expected payment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                <div className={`text-xs px-2 py-0.5 rounded-full ${payment.confidence >= 0.8 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {(payment.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Factors */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Market Factors</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Collection Trend</span>
              {getTrendBadge(prediction.factors.collectionTrend)}
            </div>
            <p className="text-xs text-gray-600">Based on historical patterns</p>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Price Trend</span>
              {getTrendBadge(prediction.factors.priceTrend)}
            </div>
            <p className="text-xs text-gray-600">Market price movements</p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Seasonal Factor</span>
              <span className="text-lg font-bold text-green-600">
                {prediction.factors.seasonalFactor.toFixed(1)}x
              </span>
            </div>
            <p className="text-xs text-gray-600">Seasonal adjustment</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">AI Insights</h4>
        <div className="space-y-2">
          <div className="flex items-start space-x-2 p-2 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-500 mt-0.5" size={16} />
            <p className="text-sm text-gray-700">
              Optimal payment schedule detected for maximum cash flow
            </p>
          </div>
          <div className="flex items-start space-x-2 p-2 bg-blue-50 rounded-lg">
            <CheckCircle className="text-blue-500 mt-0.5" size={16} />
            <p className="text-sm text-gray-700">
              Price stability expected to maintain current rates
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <BarChart3 size={12} />
            <span>Model: {prediction.model_version}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Target size={12} />
            <span>Accuracy: {(prediction.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}