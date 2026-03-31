// frontend/src/components/predictions/PredictionCard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  BarChart3,
  LineChart,
  PieChart,
  Info,
  Download,
  Share2,
  Star,
  MapPin,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  Moon,
  CloudSun,
  Zap,
  Shield,
  Eye,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import {
  formatDate,
  formatCurrency,
  cn,
  getCurrentSeason,
  formatWeight
} from '@/lib/utils'

interface Prediction {
  id: string
  type: 'weight' | 'payment' | 'quality' | 'yield'
  farmerId: string
  farmerName: string
  predictionDate: string
  predictedValue: number
  confidence: number // 0-1
  actualValue?: number
  accuracy?: number
  status: 'pending' | 'accurate' | 'inaccurate'
  timeframe: {
    start: string
    end: string
    unit: 'days' | 'weeks' | 'months'
  }
  factors: {
    weather: {
      temperature: number
      rainfall: number
      humidity: number
      condition: 'sunny' | 'cloudy' | 'rainy' | 'mixed'
    }
    season: string
    historicalTrend: 'increasing' | 'decreasing' | 'stable'
    soilMoisture?: number
    fertilizerApplied?: boolean
    pruningSchedule?: 'recent' | 'due' | 'upcoming'
  }
  recommendations: Array<{
    id: string
    type: 'warning' | 'suggestion' | 'optimization'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    action?: string
  }>
  historicalComparison?: {
    previousValue: number
    percentageChange: number
    trendDirection: 'up' | 'down' | 'same'
  }
  riskAssessment?: {
    level: 'low' | 'medium' | 'high'
    factors: string[]
    mitigation: string[]
  }
  createdAt: string
  updatedAt: string
}

interface PredictionCardProps {
  prediction?: Prediction
  farmerId?: string
  type?: 'weight' | 'payment'
  showDetails?: boolean
  showActions?: boolean
  showRecommendations?: boolean
  autoRefresh?: boolean
  onRefresh?: () => void
  onExpand?: () => void
  expanded?: boolean
}

export default function PredictionCard({
  prediction: initialPrediction,
  farmerId,
  type = 'weight',
  showDetails = true,
  showActions = true,
  showRecommendations = true,
  autoRefresh = false,
  onRefresh,
  onExpand,
  expanded = false
}: PredictionCardProps) {
  const router = useRouter()
  const [prediction, setPrediction] = useState<Prediction | null>(initialPrediction || null)
  const [isLoading, setIsLoading] = useState(!initialPrediction)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'charts'>('summary')
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d')

  const fetchPrediction = async () => {
    if (refreshing || !farmerId) return
    
    setRefreshing(true)
    setError(null)
    
    try {
      // In production, this would call your backend API
      // const response = await apiClient.get(`/api/v1/predictions/${type}`, {
      //   params: { farmerId, days: timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90 }
      // })
      
      // Mock data for development
      const mockPrediction = generateMockPrediction(farmerId, type, timeframe)
      setPrediction(mockPrediction)
    } catch (err: any) {
      console.error('Failed to fetch prediction:', err)
      setError('Failed to load prediction data')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const generateMockPrediction = (farmerId: string, type: 'weight' | 'payment', timeframe: string): Prediction => {
    const now = new Date()
    const startDate = new Date(now)
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
    startDate.setDate(startDate.getDate() + days)
    
    const predictedValue = type === 'weight' 
      ? (Math.random() * 100 + 50) // 50-150 kg
      : (Math.random() * 50000 + 10000) // 10,000-60,000 KES
    
    const confidence = 0.6 + Math.random() * 0.3 // 60-90%
    const accuracy = 0.7 + Math.random() * 0.2 // 70-90%
    
    const historicalComparison = {
      previousValue: predictedValue * (0.8 + Math.random() * 0.4), // 80-120% of predicted
      percentageChange: (Math.random() - 0.5) * 20, // -10% to +10%
      trendDirection: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'same'
    }
    
    const weatherConditions: Array<'sunny' | 'cloudy' | 'rainy' | 'mixed'> = ['sunny', 'cloudy', 'rainy', 'mixed']
    
    return {
      id: `pred-${Date.now()}`,
      type,
      farmerId,
      farmerName: 'John Kamau',
      predictionDate: now.toISOString(),
      predictedValue,
      confidence,
      accuracy,
      status: Math.random() > 0.3 ? 'accurate' : Math.random() > 0.5 ? 'inaccurate' : 'pending',
      timeframe: {
        start: now.toISOString(),
        end: startDate.toISOString(),
        unit: days <= 7 ? 'days' : days <= 30 ? 'weeks' : 'months'
      },
      factors: {
        weather: {
          temperature: 20 + Math.random() * 10,
          rainfall: Math.random() * 20,
          humidity: 60 + Math.random() * 30,
          condition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
        },
        season: getCurrentSeason(),
        historicalTrend: Math.random() > 0.6 ? 'increasing' : Math.random() > 0.6 ? 'decreasing' : 'stable',
        soilMoisture: 40 + Math.random() * 40,
        fertilizerApplied: Math.random() > 0.5,
        pruningSchedule: Math.random() > 0.7 ? 'recent' : Math.random() > 0.5 ? 'due' : 'upcoming'
      },
      recommendations: [
        {
          id: 'rec-1',
          type: 'suggestion',
          priority: 'medium',
          title: 'Optimize Irrigation',
          description: 'Adjust watering schedule based on predicted rainfall',
          action: 'Review irrigation plan'
        },
        {
          id: 'rec-2',
          type: 'warning',
          priority: 'high',
          title: 'Fertilizer Application Due',
          description: 'Soil analysis indicates need for nitrogen-rich fertilizer',
          action: 'Schedule fertilization'
        },
        {
          id: 'rec-3',
          type: 'optimization',
          priority: 'low',
          title: 'Pruning Recommended',
          description: 'Regular pruning can increase yield by 15-20%',
          action: 'Plan pruning schedule'
        }
      ],
      historicalComparison,
      riskAssessment: {
        level: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
        factors: ['Weather variability', 'Pest risk', 'Market price fluctuations'],
        mitigation: ['Diversify crop varieties', 'Implement IPM strategies', 'Consider forward contracts']
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  }

  useEffect(() => {
    if (farmerId && !initialPrediction) {
      fetchPrediction()
    }
    
    let intervalId: NodeJS.Timeout
    if (autoRefresh) {
      intervalId = setInterval(fetchPrediction, 300000) // Refresh every 5 minutes
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [farmerId, timeframe, autoRefresh])

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'weight':
        return <Package className="text-blue-600" size={24} />
      case 'payment':
        return <DollarSign className="text-green-600" size={24} />
      case 'quality':
        return <Star className="text-yellow-600" size={24} />
      case 'yield':
        return <TrendingUp className="text-purple-600" size={24} />
      default:
        return <Target className="text-gray-600" size={24} />
    }
  }

  const getPredictionTitle = (type: string) => {
    switch (type) {
      case 'weight':
        return 'Weight Prediction'
      case 'payment':
        return 'Payment Forecast'
      case 'quality':
        return 'Quality Assessment'
      case 'yield':
        return 'Yield Projection'
      default:
        return 'AI Prediction'
    }
  }

  const getPredictionUnit = (type: string) => {
    switch (type) {
      case 'weight':
        return 'kg'
      case 'payment':
        return 'KES'
      case 'quality':
        return '/10'
      case 'yield':
        return 'kg/ha'
      default:
        return ''
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accurate':
        return <CheckCircle className="text-green-500" size={16} />
      case 'inaccurate':
        return <AlertCircle className="text-red-500" size={16} />
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />
      default:
        return <Info className="text-gray-500" size={16} />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-green-500" size={16} />
      case 'down':
        return <TrendingDown className="text-red-500" size={16} />
      case 'same':
        return <Minus className="text-gray-500" size={16} /> // <--- UPDATED
      default:
        return <Minus className="text-gray-500" size={16} /> // <--- UPDATED
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny':
        return <Sun className="text-yellow-500" size={16} />
      case 'cloudy':
        return <Cloud className="text-gray-500" size={16} />
      case 'rainy':
        return <CloudRain className="text-blue-500" size={16} />
      case 'mixed':
        return <CloudSun className="text-orange-500" size={16} />
      default:
        return <Cloud className="text-gray-500" size={16} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="text-red-500" size={16} />
      case 'suggestion':
        return <Info className="text-blue-500" size={16} />
      case 'optimization':
        return <Zap className="text-green-500" size={16} />
      default:
        return <Info className="text-gray-500" size={16} />
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      fetchPrediction()
    }
  }

  const handleTimeframeChange = (newTimeframe: '7d' | '30d' | '90d') => {
    setTimeframe(newTimeframe)
    if (farmerId) {
      fetchPrediction()
    }
  }

  const formatPredictionValue = (value: number, type: string) => {
    if (type === 'weight') {
      return formatWeight(value)
    } else if (type === 'payment') {
      return formatCurrency(value)
    }
    return value.toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tea-500" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-2 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card border-red-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">AI Prediction</h2>
          <AlertCircle className="text-red-500" size={20} />
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">AI Prediction</h2>
          <Target className="text-gray-400" size={20} />
        </div>
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">No prediction available</p>
          <p className="text-sm text-gray-500 mt-1">
            Select a farmer to generate predictions
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'card',
      expanded && 'border-tea-500 shadow-lg'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          {getPredictionIcon(prediction.type)}
          <div>
            <h2 className="text-xl font-semibold">{getPredictionTitle(prediction.type)}</h2>
            <p className="text-sm text-gray-600">
              {prediction.farmerName} • Updated {formatDate(prediction.updatedAt, { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showActions && onExpand && (
            <button
              onClick={onExpand}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={expanded ? 'Minimize' : 'Expand'}
            >
              {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              'p-2 rounded-lg transition-colors',
              refreshing ? 'text-gray-400' : 'text-gray-600 hover:bg-gray-100'
            )}
            title="Refresh"
          >
            <RefreshCw className={cn('size-5', refreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Prediction Timeframe</h3>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Calendar size={14} />
            <span>
              {formatDate(prediction.timeframe.start, { day: 'numeric', month: 'short' })} - 
              {formatDate(prediction.timeframe.end, { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                timeframe === tf
                  ? 'bg-tea-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prediction Display */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-tea-50 to-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Predicted {prediction.type === 'weight' ? 'Weight' : 'Amount'}</h3>
              <p className="text-sm text-gray-600">Based on historical data and current factors</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(prediction.status)}
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium capitalize',
                prediction.status === 'accurate' ? 'bg-green-100 text-green-800' :
                prediction.status === 'inaccurate' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              )}>
                {prediction.status}
              </span>
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-tea-600 mb-1">
                {formatPredictionValue(prediction.predictedValue, prediction.type)}
              </p>
              <p className="text-gray-600">
                {prediction.type === 'weight' ? 'Expected tea weight' : 'Projected payment amount'}
              </p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="text-gray-400" size={16} />
                <span className="text-sm text-gray-600">Confidence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      getConfidenceColor(prediction.confidence).replace('text-', 'bg-')
                    )}
                    style={{ width: `${prediction.confidence * 100}%` }}
                  />
                </div>
                <span className={cn(
                  'font-bold',
                  getConfidenceColor(prediction.confidence)
                )}>
                  {(prediction.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {getConfidenceLabel(prediction.confidence)} confidence
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Comparison */}
      {prediction.historicalComparison && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Historical Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {getTrendIcon(prediction.historicalComparison.trendDirection)}
                <span className="font-medium">Previous Average</span>
              </div>
              <p className="text-2xl font-bold">
                {formatPredictionValue(prediction.historicalComparison.previousValue, prediction.type)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="text-blue-500" size={16} />
                <span className="font-medium">Change</span>
              </div>
              <p className={cn(
                'text-2xl font-bold',
                prediction.historicalComparison.percentageChange > 0 ? 'text-green-600' :
                prediction.historicalComparison.percentageChange < 0 ? 'text-red-600' :
                'text-gray-600'
              )}>
                {prediction.historicalComparison.percentageChange > 0 ? '+' : ''}
                {prediction.historicalComparison.percentageChange.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="text-purple-500" size={16} />
                <span className="font-medium">Model Accuracy</span>
              </div>
              <p className="text-2xl font-bold text-tea-600">
                {prediction.accuracy ? `${(prediction.accuracy * 100).toFixed(0)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Factors Influencing Prediction */}
      {showDetails && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Factors Influencing Prediction</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Weather */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {getWeatherIcon(prediction.factors.weather.condition)}
                <span className="font-medium">Weather</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-medium capitalize">{prediction.factors.weather.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rainfall:</span>
                  <span className="font-medium">{prediction.factors.weather.rainfall.toFixed(1)}mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temp:</span>
                  <span className="font-medium">{prediction.factors.weather.temperature.toFixed(1)}°C</span>
                </div>
              </div>
            </div>

            {/* Season */}
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="text-green-600" size={16} />
                <span className="font-medium">Season</span>
              </div>
              <p className="text-lg font-bold text-green-700 mb-1">{prediction.factors.season}</p>
              <p className="text-xs text-gray-600">Current growing season</p>
            </div>

            {/* Historical Trend */}
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {getTrendIcon(prediction.factors.historicalTrend)}
                <span className="font-medium">Trend</span>
              </div>
              <p className="text-lg font-bold text-yellow-700 mb-1 capitalize">
                {prediction.factors.historicalTrend}
              </p>
              <p className="text-xs text-gray-600">Historical performance</p>
            </div>

            {/* Soil & Farm */}
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="text-purple-600" size={16} />
                <span className="font-medium">Farm Status</span>
              </div>
              <div className="space-y-1 text-sm">
                {prediction.factors.soilMoisture && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Soil Moisture:</span>
                    <span className="font-medium">{prediction.factors.soilMoisture.toFixed(0)}%</span>
                  </div>
                )}
                {prediction.factors.fertilizerApplied !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fertilizer:</span>
                    <span className={cn(
                      'font-medium',
                      prediction.factors.fertilizerApplied ? 'text-green-600' : 'text-red-600'
                    )}>
                      {prediction.factors.fertilizerApplied ? 'Applied' : 'Pending'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && prediction.recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">AI Recommendations</h3>
            <span className="text-sm text-gray-600">
              {prediction.recommendations.length} suggestions
            </span>
          </div>
          <div className="space-y-3">
            {prediction.recommendations.map(rec => (
              <div
                key={rec.id}
                className={cn(
                  'border rounded-lg p-3',
                  rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                  rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                )}
              >
                <div className="flex items-start space-x-3">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{rec.title}</h4>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        getPriorityColor(rec.priority)
                      )}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                    {rec.action && (
                      <button className="mt-2 text-sm text-tea-600 hover:text-tea-700 font-medium">
                        {rec.action} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Assessment */}
      {prediction.riskAssessment && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Risk Assessment</h3>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-orange-500" size={20} />
                <span className="font-medium">Risk Level</span>
              </div>
              <span className={cn(
                'px-3 py-1 rounded-full text-sm font-medium capitalize',
                getRiskColor(prediction.riskAssessment.level)
              )}>
                {prediction.riskAssessment.level} Risk
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Factors</h4>
                <ul className="space-y-1">
                  {prediction.riskAssessment.factors.map((factor, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Mitigation Strategies</h4>
                <ul className="space-y-1">
                  {prediction.riskAssessment.mitigation.map((strategy, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="text-green-500" size={12} />
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Eye size={12} />
              <span>Last updated: {formatDate(prediction.updatedAt, { hour: '2-digit', minute: '2-digit' })}</span>
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'summary' ? 'detailed' : viewMode === 'detailed' ? 'charts' : 'summary')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
            >
              {viewMode === 'summary' ? 'Detailed View' : viewMode === 'detailed' ? 'Charts' : 'Summary'}
            </button>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors text-sm flex items-center space-x-1"
            >
              <RefreshCw size={14} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}