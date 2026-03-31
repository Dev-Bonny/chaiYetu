'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, // <--- CHANGED FROM TrendingRight
  CloudRain,
  Thermometer,
  Droplets,
  Leaf,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { WeightPrediction } from '@/lib/prediction-service'

interface WeightPredictionCardProps {
  farmerId: string
  onRefresh?: () => void
}

export default function WeightPredictionCard({ farmerId, onRefresh }: WeightPredictionCardProps) {
  const [prediction, setPrediction] = useState<WeightPrediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(7)

  useEffect(() => {
    fetchPrediction()
  }, [farmerId, days])

  const fetchPrediction = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Mock data for demo - replace with actual API call
      // In a real app, you would call your API here
      // const data = await predictionService.getWeightPrediction(farmerId, days)
      
      const mockPrediction: WeightPrediction = {
        predictedWeight: 42.5,
        confidence: 0.82,
        historicalData: [
          { date: '2024-01-01', weight: 38.2, quality: 'grade1' },
          { date: '2024-01-02', weight: 39.5, quality: 'grade1' },
          { date: '2024-01-03', weight: 40.1, quality: 'grade2' },
          { date: '2024-01-04', weight: 41.3, quality: 'grade1' },
          { date: '2024-01-05', weight: 42.0, quality: 'grade1' },
        ],
        factors: {
          weather: {
            rainfall_expected: true,
            temperature: 22.5,
            humidity: 75
          },
          season: 'long_rains',
          trend: 'increasing'
        },
        recommendations: [
          'Optimal conditions for growth expected',
          'Consider early morning collection',
          'Monitor soil moisture levels'
        ],
        model_version: 'weight_lstm_v2.1'
      }
      setPrediction(mockPrediction)
    } catch (error) {
      setError('Failed to load prediction')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="text-green-500" size={20} />
      case 'decreasing':
        return <TrendingDown className="text-red-500" size={20} />
      default:
        // CHANGED FROM TrendingRight TO ArrowRight
        return <ArrowRight className="text-yellow-500" size={20} />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceBadge = (confidence: number) => {
    let level = 'Low'
    let color = 'bg-red-100 text-red-800'
    
    if (confidence >= 0.8) {
      level = 'High'
      color = 'bg-green-100 text-green-800'
    } else if (confidence >= 0.6) {
      level = 'Medium'
      color = 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
        {level} Confidence
      </span>
    )
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
          <h3 className="text-lg font-semibold text-gray-900">Weight Prediction</h3>
          <div className="flex items-center space-x-2 mt-1">
            <Target className="text-tea-600" size={16} />
            <p className="text-sm text-gray-600">AI-powered forecast</p>
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
            <RefreshIcon /> 
          </button>
        </div>
      </div>

      {/* Main Prediction */}
      <div className="mb-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-600">Predicted Weight</p>
            <div className="flex items-baseline space-x-2 mt-1">
              <p className="text-4xl font-bold text-gray-900">
                {prediction.predictedWeight.toFixed(1)}
              </p>
              <p className="text-lg text-gray-600">kg</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              {getTrendIcon(prediction.factors.trend)}
              <span className="text-sm text-gray-600 capitalize">
                {prediction.factors.trend} trend
              </span>
            </div>
            <div className={`text-lg font-bold mt-1 ${getConfidenceColor(prediction.confidence)}`}>
              {(prediction.confidence * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500">Confidence</p>
          </div>
        </div>
        <div className="mt-4">
          {getConfidenceBadge(prediction.confidence)}
        </div>
      </div>

      {/* Factors */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Influencing Factors</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <CloudRain className="text-blue-600" size={16} />
              <span className="text-sm font-medium">Rainfall</span>
            </div>
            <p className="text-xs text-gray-600">
              {prediction.factors.weather.rainfall_expected ? 'Expected' : 'Not Expected'}
            </p>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Thermometer className="text-orange-600" size={16} />
              <span className="text-sm font-medium">Temperature</span>
            </div>
            <p className="text-xs text-gray-600">
              {prediction.factors.weather.temperature}°C
            </p>
          </div>
          
          <div className="bg-cyan-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Droplets className="text-cyan-600" size={16} />
              <span className="text-sm font-medium">Humidity</span>
            </div>
            <p className="text-xs text-gray-600">
              {prediction.factors.weather.humidity}%
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Leaf className="text-green-600" size={16} />
              <span className="text-sm font-medium">Season</span>
            </div>
            <p className="text-xs text-gray-600 capitalize">
              {prediction.factors.season.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">AI Recommendations</h4>
        <div className="space-y-2">
          {prediction.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg">
              <CheckCircle className="text-green-500 mt-0.5" size={16} />
              <p className="text-sm text-gray-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <BarChart3 size={12} />
            <span>Model: {prediction.model_version}</span>
          </div>
          <span>Updated just now</span>
        </div>
      </div>
    </div>
  )
}

// Simple refresh icon component since I noticed the original was just a Unicode character
function RefreshIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  )
}