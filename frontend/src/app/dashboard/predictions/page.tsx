'use client'

import { useState, useEffect } from 'react'
import { 
  Brain,
  TrendingUp,
  BarChart3,
  Target,
  RefreshCw,
  Download,
  Filter,
  Users,
  MapPin,
  DollarSign
} from 'lucide-react'
import WeightPredictionCard from '@/components/predictions/WeightPredictionCard'
import PaymentPredictionCard from '@/components/predictions/PaymentPredictionCard'
import PredictionAccuracyChart from '@/components/predictions/PredictionAccuracyChart'
import HistoricalTrendChart from '@/components/predictions/HistoricalTrendChart'
import SeasonalAnalysis from '@/components/predictions/SeasonalAnalysis'
import { predictionService } from '@/lib/prediction-service'

export default function PredictionsPage() {
  const [selectedFarmer, setSelectedFarmer] = useState<string>('current')
  const [farmers, setFarmers] = useState<any[]>([])
  const [accuracyMetrics, setAccuracyMetrics] = useState<any>(null)
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [seasonalData, setSeasonalData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'accuracy' | 'trends'>('overview')

  useEffect(() => {
    fetchPredictionData()
  }, [])

  const fetchPredictionData = async () => {
    setIsLoading(true)
    try {
      const [accuracyData, seasonalData] = await Promise.all([
        predictionService.getPredictionAccuracy(),
        predictionService.getSeasonalTrends()
      ])

      setAccuracyMetrics(accuracyData)
      setSeasonalData(seasonalData)

      // Mock historical data
      const mockHistorical = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actual: 35 + Math.random() * 15,
        predicted: 35 + Math.random() * 15 + (Math.random() - 0.5) * 5,
        confidence: 0.7 + Math.random() * 0.25
      }))
      setHistoricalData(mockHistorical)

      // Mock farmers data
      setFarmers([
        { _id: '1', farmerId: 'F000001', user: { firstName: 'John', lastName: 'Kamau' }, location: { county: 'Kirinyaga' } },
        { _id: '2', farmerId: 'F000002', user: { firstName: 'Mary', lastName: 'Wanjiku' }, location: { county: 'Nyeri' } },
        { _id: '3', farmerId: 'F000003', user: { firstName: 'Peter', lastName: 'Maina' }, location: { county: 'Muranga' } },
      ])
    } catch (error) {
      console.error('Failed to fetch prediction data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetrainModels = async () => {
    if (confirm('Retrain AI models? This may take a few minutes.')) {
      try {
        await predictionService.trainModels()
        alert('Models retraining initiated!')
        fetchPredictionData()
      } catch (error) {
        alert('Failed to retrain models')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center space-x-3">
            <Brain className="text-tea-600" size={28} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Predictions</h1>
              <p className="text-gray-600">Powered by machine learning algorithms</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={selectedFarmer}
              onChange={(e) => setSelectedFarmer(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
            >
              <option value="current">My Predictions</option>
              {farmers.map(farmer => (
                <option key={farmer._id} value={farmer._id}>
                  {farmer.farmerId} - {farmer.user.firstName} {farmer.user.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={handleRetrainModels}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <RefreshCw size={18} />
            <span>Retrain Models</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'accuracy', label: 'Accuracy', icon: BarChart3 },
            { id: 'trends', label: 'Trends', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-tea-500 text-tea-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Weight Accuracy</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {accuracyMetrics?.weight?.accuracy?.toFixed(1) || 0}%
                  </p>
                </div>
                <Target className="text-green-500" size={28} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Based on {accuracyMetrics?.weight?.totalPredictions || 0} predictions</p>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Payment Accuracy</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {accuracyMetrics?.payment?.accuracy?.toFixed(1) || 0}%
                  </p>
                </div>
                <DollarSign className="text-blue-500" size={28} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Based on {accuracyMetrics?.payment?.totalPredictions || 0} predictions</p>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Confidence</p>
                  <p className="text-3xl font-bold text-gray-900">82.5%</p>
                </div>
                <BarChart3 className="text-purple-500" size={28} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Current prediction confidence</p>
            </div>
            
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Model Version</p>
                  <p className="text-xl font-bold text-gray-900">v2.1.4</p>
                </div>
                <Brain className="text-tea-500" size={28} />
              </div>
              <p className="text-xs text-gray-500 mt-2">Last updated: 2 days ago</p>
            </div>
          </div>

          {/* Prediction Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeightPredictionCard farmerId={selectedFarmer} />
            <PaymentPredictionCard farmerId={selectedFarmer} />
          </div>

          {/* Farmer Insights */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Farmer Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="text-blue-600" />
                  <h4 className="font-medium">Top Performers</h4>
                </div>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>John Kamau</span>
                    <span className="font-bold text-green-600">+12%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Mary Wanjiku</span>
                    <span className="font-bold text-green-600">+8%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Peter Maina</span>
                    <span className="font-bold text-green-600">+6%</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="text-green-600" />
                  <h4 className="font-medium">Growth Trends</h4>
                </div>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Weekly Growth</span>
                    <span className="font-bold">+5.2%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Monthly Growth</span>
                    <span className="font-bold">+18.7%</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Quarterly Growth</span>
                    <span className="font-bold">+42.3%</span>
                  </li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="text-purple-600" />
                  <h4 className="font-medium">Regional Analysis</h4>
                </div>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Kirinyaga</span>
                    <span className="font-bold">Best Yield</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Nyeri</span>
                    <span className="font-bold">Best Quality</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Muranga</span>
                    <span className="font-bold">Most Consistent</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Accuracy Tab */}
      {activeTab === 'accuracy' && (
        <div className="space-y-6">
          <PredictionAccuracyChart metrics={accuracyMetrics} />
          <HistoricalTrendChart data={historicalData} />
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <SeasonalAnalysis data={seasonalData} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Weather Impact</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Rainfall</span>
                    <span className="font-medium">+15% yield impact</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Temperature</span>
                    <span className="font-medium">Optimal 20-25°C</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Humidity</span>
                    <span className="font-medium">Ideal 70-80%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Market Trends</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Tea Price Index</p>
                    <p className="text-sm text-gray-600">Current market rates</p>
                  </div>
                  <span className="text-xl font-bold text-green-600">+2.3%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Demand Forecast</p>
                    <p className="text-sm text-gray-600">Next 30 days</p>
                  </div>
                  <span className="text-xl font-bold text-blue-600">Stable</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Supply Prediction</p>
                    <p className="text-sm text-gray-600">Regional outlook</p>
                  </div>
                  <span className="text-xl font-bold text-orange-600">-1.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export & Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="text-sm text-gray-500">
          Predictions are updated daily at 2:00 AM
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={18} />
            <span>Export Data</span>
          </button>
          <button
            onClick={fetchPredictionData}
            className="flex items-center space-x-2 px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700"
          >
            <RefreshCw size={18} />
            <span>Refresh Predictions</span>
          </button>
        </div>
      </div>
    </div>
  )
}