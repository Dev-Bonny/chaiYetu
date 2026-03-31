'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'

interface HistoricalTrendData {
  date: string
  weight?: number
  amount?: number
  predictedWeight?: number
  predictedAmount?: number
  quality?: number // 1-3 scale
  pricePerKg?: number
  confidence?: number
  actualWeight?: number
  actualAmount?: number
}

interface HistoricalTrendChartProps {
  farmerId?: string
  type?: 'weight' | 'payment' | 'composite'
  days?: number
  showPredictions?: boolean
  showQuality?: boolean
  title?: string
  className?: string
  onDataLoaded?: (data: HistoricalTrendData[]) => void
}

export default function HistoricalTrendChart({
  farmerId,
  type = 'composite',
  days = 30,
  showPredictions = true,
  showQuality = true,
  title = 'Historical Trends',
  className = '',
  onDataLoaded
}: HistoricalTrendChartProps) {
  const [data, setData] = useState<HistoricalTrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30')
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area')
  const [showGrid, setShowGrid] = useState(true)
  const [trendStats, setTrendStats] = useState<{
    avgWeight: number
    avgAmount: number
    weightChange: number
    amountChange: number
    totalWeight: number
    totalAmount: number
  } | null>(null)

  const periods = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '3 Months' },
    { value: '180', label: '6 Months' },
    { value: '365', label: '1 Year' },
  ]

  useEffect(() => {
    fetchHistoricalData()
  }, [farmerId, selectedPeriod])

  const fetchHistoricalData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      let endpoint = '/api/v1/collections/historical'
      if (farmerId) {
        endpoint = `/api/v1/collections/farmer/${farmerId}/historical`
      }
      
      const response = await apiClient.get(`${endpoint}?days=${selectedPeriod}`)
      const historicalData = response.data || []
      
      // Calculate statistics
      calculateStatistics(historicalData)
      
      // Transform data for chart
      const chartData = transformDataForChart(historicalData)
      setData(chartData)
      
      if (onDataLoaded) {
        onDataLoaded(chartData)
      }
    } catch (err: any) {
      console.error('Failed to fetch historical data:', err)
      setError(err.message || 'Failed to load historical data')
      
      // Use mock data for demonstration
      const mockData = generateMockData()
      setData(mockData)
      calculateStatistics(mockData)
    } finally {
      setLoading(false)
    }
  }

  const transformDataForChart = (rawData: any[]): HistoricalTrendData[] => {
    return rawData.map(item => ({
      date: formatDate(item.date || item.collectionDate, 'short'),
      weight: item.weight,
      amount: item.totalAmount || item.amount,
      quality: item.quality === 'grade1' ? 1 : item.quality === 'grade2' ? 2 : 3,
      pricePerKg: item.pricePerKg || item.price,
      predictedWeight: item.predictedWeight,
      predictedAmount: item.predictedAmount,
      confidence: item.confidence,
      actualWeight: item.actualWeight,
      actualAmount: item.actualAmount,
    }))
  }

  const generateMockData = (): HistoricalTrendData[] => {
    const mockData: HistoricalTrendData[] = []
    const now = new Date()
    const daysCount = parseInt(selectedPeriod)
    
    // Base values
    let baseWeight = 25
    let baseAmount = 1500
    let seasonalFactor = 1.0
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // Seasonal adjustment
      const month = date.getMonth()
      if (month >= 2 && month <= 4) seasonalFactor = 1.2 // Long rains
      else if (month >= 9 && month <= 11) seasonalFactor = 1.1 // Short rains
      else seasonalFactor = 0.9 // Dry season
      
      // Random variation
      const randomVariation = 0.8 + Math.random() * 0.4
      const weight = baseWeight * seasonalFactor * randomVariation
      const amount = weight * (20 + Math.random() * 10)
      
      // Add prediction data for some days
      const hasPrediction = i < daysCount * 0.3
      const predictionError = 0.9 + Math.random() * 0.2
      
      mockData.push({
        date: formatDate(date.toISOString(), 'short'),
        weight: Math.round(weight * 10) / 10,
        amount: Math.round(amount),
        quality: i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3,
        pricePerKg: 20 + Math.random() * 10,
        predictedWeight: hasPrediction ? Math.round(weight * predictionError * 10) / 10 : undefined,
        predictedAmount: hasPrediction ? Math.round(amount * predictionError) : undefined,
        confidence: hasPrediction ? 0.7 + Math.random() * 0.25 : undefined,
        actualWeight: hasPrediction ? Math.round(weight * 10) / 10 : undefined,
        actualAmount: hasPrediction ? Math.round(amount) : undefined,
      })
    }
    
    return mockData
  }

  const calculateStatistics = (data: HistoricalTrendData[]) => {
    if (data.length === 0) {
      setTrendStats(null)
      return
    }
    
    const weights = data.filter(d => d.weight).map(d => d.weight!)
    const amounts = data.filter(d => d.amount).map(d => d.amount!)
    
    if (weights.length < 2 || amounts.length < 2) {
      setTrendStats(null)
      return
    }
    
    const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length
    const avgAmount = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    
    // Calculate trend (first half vs second half)
    const firstHalfWeight = weights.slice(0, Math.floor(weights.length / 2))
    const secondHalfWeight = weights.slice(Math.floor(weights.length / 2))
    const firstHalfAmount = amounts.slice(0, Math.floor(amounts.length / 2))
    const secondHalfAmount = amounts.slice(Math.floor(amounts.length / 2))
    
    const avgFirstWeight = firstHalfWeight.reduce((sum, w) => sum + w, 0) / firstHalfWeight.length
    const avgSecondWeight = secondHalfWeight.reduce((sum, w) => sum + w, 0) / secondHalfWeight.length
    const avgFirstAmount = firstHalfAmount.reduce((sum, a) => sum + a, 0) / firstHalfAmount.length
    const avgSecondAmount = secondHalfAmount.reduce((sum, a) => sum + a, 0) / secondHalfAmount.length
    
    const weightChange = ((avgSecondWeight - avgFirstWeight) / avgFirstWeight) * 100
    const amountChange = ((avgSecondAmount - avgFirstAmount) / avgFirstAmount) * 100
    
    setTrendStats({
      avgWeight,
      avgAmount,
      weightChange,
      amountChange,
      totalWeight: weights.reduce((sum, w) => sum + w, 0),
      totalAmount: amounts.reduce((sum, a) => sum + a, 0),
    })
  }

  const getTrendIcon = (value: number) => {
    if (value > 5) return <TrendingUp className="text-green-500" size={16} />
    if (value < -5) return <TrendingDown className="text-red-500" size={16} />
    return <Minus className="text-gray-500" size={16} />
  }

  const getTrendColor = (value: number) => {
    if (value > 5) return 'text-green-600'
    if (value < -5) return 'text-red-600'
    return 'text-gray-600'
  }

  const getQualityColor = (value: number) => {
    switch (value) {
      case 1: return '#10b981' // Green
      case 2: return '#f59e0b' // Yellow
      case 3: return '#f97316' // Orange
      default: return '#6b7280' // Gray
    }
  }

  const getChartComponent = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 10 }
    }

    const renderLine = (dataKey: string, color: string, strokeWidth = 2, strokeDasharray?: string) => (
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        dot={{ r: 3 }}
        activeDot={{ r: 6 }}
      />
    )

    const renderArea = (dataKey: string, color: string, opacity = 0.2) => (
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        fill={color}
        fillOpacity={opacity}
        strokeWidth={2}
      />
    )

    const renderBar = (dataKey: string, color: string) => (
      <Bar
        dataKey={dataKey}
        fill={color}
        radius={[4, 4, 0, 0]}
      />
    )

    switch (type) {
      case 'weight':
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              label={{ 
                value: 'Weight (kg)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' }
              }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => {
                if (name.includes('Weight')) return [`${value} kg`, name]
                if (name.includes('Amount')) return [formatCurrency(value), name]
                return [value, name]
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            
            {/* Actual Weight */}
            {renderArea('weight', '#3b82f6', 0.3)}
            {renderLine('weight', '#1d4ed8', 3)}
            
            {/* Predicted Weight */}
            {showPredictions && data.some(d => d.predictedWeight) && (
              <>
                {renderLine('predictedWeight', '#8b5cf6', 2, '5 5')}
                {data.some(d => d.actualWeight) && renderLine('actualWeight', '#10b981', 2)}
              </>
            )}
            
            {/* Quality as reference line */}
            {showQuality && (
              <ReferenceLine
                y={data.reduce((sum, d) => sum + (d.quality || 0), 0) / data.length}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{
                  value: 'Avg Quality',
                  position: 'insideTopRight',
                  fill: '#f59e0b'
                }}
              />
            )}
          </ComposedChart>
        )

      case 'payment':
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              label={{ 
                value: 'Amount (KES)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' }
              }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any) => [formatCurrency(value), 'Amount']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            
            {/* Amount Bars */}
            {renderBar('amount', '#10b981')}
            
            {/* Predicted Amount */}
            {showPredictions && data.some(d => d.predictedAmount) && (
              <>
                {renderLine('predictedAmount', '#8b5cf6', 2, '5 5')}
                {data.some(d => d.actualAmount) && renderLine('actualAmount', '#3b82f6', 2)}
              </>
            )}
            
            {/* Price per kg line */}
            <Line
              type="monotone"
              dataKey="pricePerKg"
              stroke="#f59e0b"
              strokeWidth={2}
              yAxisId={1}
              dot={false}
              name="Price per kg"
            />
            <YAxis 
              yAxisId={1}
              orientation="right"
              stroke="#f59e0b"
              fontSize={12}
              label={{ 
                value: 'Price/kg', 
                angle: -90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#f59e0b' }
              }}
            />
          </ComposedChart>
        )

      default: // composite
        return (
          <ComposedChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              yAxisId={0}
              stroke="#6b7280"
              fontSize={12}
              label={{ 
                value: 'Weight (kg)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6b7280' }
              }}
            />
            <YAxis 
              yAxisId={1}
              orientation="right"
              stroke="#10b981"
              fontSize={12}
              label={{ 
                value: 'Amount (KES)', 
                angle: -90, 
                position: 'insideRight',
                style: { textAnchor: 'middle', fill: '#10b981' }
              }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: string) => {
                if (name.includes('Weight')) return [`${value} kg`, name]
                if (name.includes('Amount') || name.includes('price')) return [formatCurrency(value), name]
                return [value, name]
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            
            {/* Weight Area */}
            <Area
              yAxisId={0}
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
              name="Weight"
            />
            
            {/* Amount Bars */}
            <Bar
              yAxisId={1}
              dataKey="amount"
              fill="#10b981"
              fillOpacity={0.7}
              radius={[4, 4, 0, 0]}
              name="Amount"
            />
            
            {/* Quality as dots */}
            {showQuality && (
              <Line
                yAxisId={0}
                type="monotone"
                dataKey="quality"
                stroke="#f59e0b"
                strokeWidth={0}
                dot={(props: any) => {
                  const { cx, cy, payload } = props
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={getQualityColor(payload.quality || 2)}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  )
                }}
                name="Quality"
              />
            )}
            
            {/* Confidence line */}
            {showPredictions && data.some(d => d.confidence) && (
              <Line
                yAxisId={0}
                type="monotone"
                dataKey="confidence"
                stroke="#8b5cf6"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Prediction Confidence"
              />
            )}
          </ComposedChart>
        )
    }
  }

  const handleExportData = () => {
    const csvContent = [
      ['Date', 'Weight (kg)', 'Amount (KES)', 'Quality', 'Price/kg', 'Predicted Weight', 'Predicted Amount', 'Confidence'].join(','),
      ...data.map(row => [
        row.date,
        row.weight || '',
        row.amount || '',
        row.quality || '',
        row.pricePerKg || '',
        row.predictedWeight || '',
        row.predictedAmount || '',
        row.confidence || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historical-trend-${type}-${selectedPeriod}days.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`card ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">Error loading data</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchHistoricalData}
            className="flex items-center space-x-2 mx-auto px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {farmerId ? 'Farmer-specific historical data' : 'Overall system historical trends'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Export Button */}
          <button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Export as CSV"
          >
            <Download size={16} />
            <span className="hidden md:inline">Export</span>
          </button>
          
          {/* Refresh Button */}
          <button
            onClick={fetchHistoricalData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Statistics */}
      {trendStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg. Weight</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-2xl font-bold">{formatNumber(trendStats.avgWeight)} kg</p>
              {getTrendIcon(trendStats.weightChange)}
              <span className={`text-sm ${getTrendColor(trendStats.weightChange)}`}>
                {trendStats.weightChange > 0 ? '+' : ''}{formatNumber(trendStats.weightChange)}%
              </span>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg. Amount</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-2xl font-bold">{formatCurrency(trendStats.avgAmount)}</p>
              {getTrendIcon(trendStats.amountChange)}
              <span className={`text-sm ${getTrendColor(trendStats.amountChange)}`}>
                {trendStats.amountChange > 0 ? '+' : ''}{formatNumber(trendStats.amountChange)}%
              </span>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Weight</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(trendStats.totalWeight)} kg</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(trendStats.totalAmount)}</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {getChartComponent()}
        </ResponsiveContainer>
      </div>

      {/* Legend & Controls */}
      <div className="mt-6 pt-6 border-t flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Weight (kg)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Amount (KES)</span>
          </div>
          {showQuality && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Quality</span>
            </div>
          )}
          {showPredictions && data.some(d => d.predictedWeight || d.predictedAmount) && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full border border-dashed border-purple-700"></div>
              <span className="text-sm text-gray-600">Predictions</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Chart Type:</span>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
            >
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="bar">Bar</option>
            </select>
          </div>
          
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="rounded border-gray-300 text-tea-600 focus:ring-tea-500"
            />
            <span className="text-sm text-gray-600">Show Grid</span>
          </label>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-6 border-t">
        <div className="flex items-start space-x-2 text-sm text-gray-500">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            {type === 'weight' ? 'Weight trend shows daily collection amounts' :
             type === 'payment' ? 'Payment trend shows earnings over time' :
             'Composite view shows both weight and payment trends with quality indicators'}
          </p>
        </div>
      </div>
    </div>
  )
}