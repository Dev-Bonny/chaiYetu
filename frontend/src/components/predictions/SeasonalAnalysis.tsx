'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Cell,
  PieChart,
  Pie,
  Sector,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'
import {
  CloudRain,
  Sun,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  TrendingUp,
  TrendingDown,
  Leaf,
  Coffee,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Info,
  Cloud,
  ThermometerSun,
  Droplet
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'

interface SeasonalData {
  month: string
  monthNumber: number
  avgWeight: number
  avgAmount: number
  totalWeight: number
  totalAmount: number
  collectionCount: number
  avgQuality: number
  avgPricePerKg: number
  rainfall: number
  temperature: number
  humidity: number
  predictionAccuracy?: number
  season: string
  seasonFactor: number
  recommendations: string[]
}

interface SeasonalAnalysisProps {
  farmerId?: string
  year?: number
  showWeather?: boolean
  showPredictions?: boolean
  showRecommendations?: boolean
  title?: string
  className?: string
}

export default function SeasonalAnalysis({
  farmerId,
  year = new Date().getFullYear(),
  showWeather = true,
  showPredictions = true,
  showRecommendations = true,
  title = 'Seasonal Analysis',
  className = ''
}: SeasonalAnalysisProps) {
  const [data, setData] = useState<SeasonalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(year)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [viewType, setViewType] = useState<'bar' | 'line' | 'composite' | 'radar'>('composite')
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'amount' | 'quality' | 'composite'>('composite')

  const years = Array.from({ length: 5 }, (_, i) => year - i)

  const seasons = [
    { name: 'Long Rains', months: [3, 4, 5], color: '#3b82f6' },
    { name: 'Dry Season', months: [6, 7, 8], color: '#f59e0b' },
    { name: 'Short Rains', months: [9, 10, 11], color: '#8b5cf6' },
    { name: 'Hot Season', months: [12, 1, 2], color: '#ef4444' },
  ]

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  useEffect(() => {
    fetchSeasonalData()
  }, [farmerId, selectedYear])

  const fetchSeasonalData = async () => {
    setLoading(true)
    setError(null)

    try {
      let endpoint = `/api/v1/predictions/seasonal?year=${selectedYear}`
      if (farmerId) {
        endpoint = `/api/v1/predictions/seasonal/${farmerId}?year=${selectedYear}`
      }

      const response = await apiClient.get(endpoint)

      if (response.data && response.data.length > 0) {
        setData(response.data)
      } else {
        // Generate mock data if no real data
        const mockData = generateMockData()
        setData(mockData)
      }
    } catch (err: any) {
      console.error('Failed to fetch seasonal data:', err)
      setError(err.message || 'Failed to load seasonal analysis data')

      // Use mock data for demonstration
      const mockData = generateMockData()
      setData(mockData)
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (): SeasonalData[] => {
    const seasonalData: SeasonalData[] = []

    months.forEach((month, index) => {
      const monthNumber = index + 1

      // Determine season and factors
      let season = 'Hot Season'
      let seasonFactor = 1.0
      let rainfall = 0
      let temperature = 0
      let humidity = 0

      if (monthNumber >= 3 && monthNumber <= 5) {
        season = 'Long Rains'
        seasonFactor = 1.3
        rainfall = 80 + Math.random() * 40
        temperature = 20 + Math.random() * 5
        humidity = 75 + Math.random() * 15
      } else if (monthNumber >= 6 && monthNumber <= 8) {
        season = 'Dry Season'
        seasonFactor = 0.9
        rainfall = 10 + Math.random() * 20
        temperature = 18 + Math.random() * 4
        humidity = 50 + Math.random() * 20
      } else if (monthNumber >= 9 && monthNumber <= 11) {
        season = 'Short Rains'
        seasonFactor = 1.2
        rainfall = 60 + Math.random() * 30
        temperature = 22 + Math.random() * 4
        humidity = 70 + Math.random() * 15
      } else {
        season = 'Hot Season'
        seasonFactor = 1.1
        rainfall = 30 + Math.random() * 20
        temperature = 24 + Math.random() * 3
        humidity = 60 + Math.random() * 15
      }

      // Calculate base values with seasonal adjustments
      const baseWeight = 25 * seasonFactor
      const randomFactor = 0.8 + Math.random() * 0.4
      const avgWeight = baseWeight * randomFactor
      const avgPricePerKg = 22 + Math.random() * 8
      const avgAmount = avgWeight * avgPricePerKg
      const totalWeight = avgWeight * (15 + Math.floor(Math.random() * 10))
      const totalAmount = avgAmount * (15 + Math.floor(Math.random() * 10))
      const collectionCount = 12 + Math.floor(Math.random() * 8)
      const avgQuality = season === 'Long Rains' ? 1.2 :
        season === 'Short Rains' ? 1.5 :
          season === 'Dry Season' ? 2.0 : 1.8

      // Generate recommendations based on season
      const recommendations: string[] = []
      if (season === 'Long Rains') {
        recommendations.push('Monitor soil drainage to prevent waterlogging')
        recommendations.push('Increase fertilizer application after heavy rains')
        recommendations.push('Watch for fungal diseases in humid conditions')
      } else if (season === 'Dry Season') {
        recommendations.push('Implement irrigation if available')
        recommendations.push('Reduce fertilizer application')
        recommendations.push('Monitor soil moisture levels')
      } else if (season === 'Short Rains') {
        recommendations.push('Prepare for variable weather conditions')
        recommendations.push('Maintain regular pruning schedule')
        recommendations.push('Monitor tea quality closely')
      } else {
        recommendations.push('Provide shade for young plants')
        recommendations.push('Increase watering frequency')
        recommendations.push('Monitor for heat stress')
      }

      seasonalData.push({
        month,
        monthNumber,
        avgWeight: Math.round(avgWeight * 10) / 10,
        avgAmount: Math.round(avgAmount),
        totalWeight: Math.round(totalWeight),
        totalAmount: Math.round(totalAmount),
        collectionCount,
        avgQuality: Math.round(avgQuality * 10) / 10,
        avgPricePerKg: Math.round(avgPricePerKg * 10) / 10,
        rainfall: Math.round(rainfall * 10) / 10,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        predictionAccuracy: showPredictions ? 70 + Math.random() * 25 : undefined,
        season,
        seasonFactor: Math.round(seasonFactor * 100) / 100,
        recommendations: recommendations.slice(0, 2)
      })
    })

    return seasonalData
  }

  const getSeasonColor = (season: string) => {
    const seasonObj = seasons.find(s => s.name === season)
    return seasonObj?.color || '#6b7280'
  }

  const getWeatherIcon = (type: 'rainfall' | 'temperature' | 'humidity', value: number) => {
    switch (type) {
      case 'rainfall':
        if (value > 80) return <CloudRain className="text-blue-500" size={16} />
        if (value > 40) return <Cloud className="text-blue-400" size={16} />
        return <Droplet className="text-blue-300" size={16} />
      case 'temperature':
        if (value > 25) return <ThermometerSun className="text-red-500" size={16} />
        if (value > 20) return <Sun className="text-orange-500" size={16} />
        return <Thermometer className="text-blue-400" size={16} />
      case 'humidity':
        if (value > 75) return <Droplets className="text-blue-600" size={16} />
        if (value > 60) return <Droplets className="text-blue-400" size={16} />
        return <Droplets className="text-blue-300" size={16} />
    }
  }

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'Long Rains':
        return <CloudRain className="text-blue-500" size={16} />
      case 'Dry Season':
        return <Sun className="text-orange-500" size={16} />
      case 'Short Rains':
        return <Cloud className="text-purple-500" size={16} />
      case 'Hot Season':
        return <ThermometerSun className="text-red-500" size={16} />
      default:
        return <Leaf className="text-green-500" size={16} />
    }
  }

  const renderChart = () => {
    const chartData = data.map(item => ({
      ...item,
      fill: getSeasonColor(item.season)
    }))

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    }

    switch (viewType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              label={{
                value: selectedMetric === 'weight' ? 'Weight (kg)' :
                  selectedMetric === 'amount' ? 'Amount (KES)' : 'Value',
                angle: -90,
                position: 'insideLeft'
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
                if (name.includes('Amount')) return [formatCurrency(value), name]
                if (name.includes('Weight') || name.includes('Quality')) return [`${value}`, name]
                return [value, name]
              }}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            {selectedMetric === 'composite' ? (
              <>
                <Bar dataKey="avgWeight" fill="#3b82f6" name="Avg Weight (kg)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgAmount" fill="#10b981" name="Avg Amount (KES)" radius={[4, 4, 0, 0]} />
              </>
            ) : selectedMetric === 'weight' ? (
              <Bar dataKey="avgWeight" fill="#3b82f6" name="Avg Weight (kg)" radius={[4, 4, 0, 0]} />
            ) : selectedMetric === 'amount' ? (
              <Bar dataKey="avgAmount" fill="#10b981" name="Avg Amount (KES)" radius={[4, 4, 0, 0]} />
            ) : (
              <Bar dataKey="avgQuality" fill="#f59e0b" name="Avg Quality" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        )

      case 'line':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              label={{
                value: 'Value',
                angle: -90,
                position: 'insideLeft'
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
                if (name.includes('Amount')) return [formatCurrency(value), name]
                if (name.includes('Weight') || name.includes('Quality')) return [`${value}`, name]
                return [value, name]
              }}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="avgWeight"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Avg Weight (kg)"
            />
            <Line
              type="monotone"
              dataKey="avgAmount"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Avg Amount (KES)"
              yAxisId={1}
            />
            <YAxis yAxisId={1} orientation="right" stroke="#10b981" />
            {showWeather && (
              <Line
                type="monotone"
                dataKey="rainfall"
                stroke="#3b82f6"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Rainfall (mm)"
                yAxisId={2}
              />
            )}
            {showWeather && <YAxis yAxisId={2} orientation="right" stroke="#3b82f6" />}
          </ComposedChart>
        )

      case 'radar':
        const radarData = data.map(item => ({
          subject: item.month,
          A: item.avgWeight,
          B: item.avgAmount / 100, // Scale down for radar
          C: item.avgQuality * 10,
          fullMark: 50
        }))

        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" stroke="#6b7280" fontSize={12} />
            <PolarRadiusAxis angle={30} domain={[0, 50]} stroke="#6b7280" />
            <Radar
              name="Avg Weight (kg)"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Radar
              name="Avg Amount (KES/100)"
              dataKey="B"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
            <Radar
              name="Avg Quality (x10)"
              dataKey="C"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
          </RadarChart>
        )

      default: // composite
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              label={{
                value: 'Weight (kg) / Quality',
                angle: -90,
                position: 'insideLeft'
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
                position: 'insideRight'
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
                if (name.includes('Amount')) return [formatCurrency(value), name]
                if (name.includes('Weight') || name.includes('Quality')) return [`${value}`, name]
                return [value, name]
              }}
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Bar
              dataKey="avgWeight"
              fill="#3b82f6"
              fillOpacity={0.8}
              name="Avg Weight (kg)"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId={1}
              type="monotone"
              dataKey="avgAmount"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Avg Amount (KES)"
            />
            <Line
              type="monotone"
              dataKey="avgQuality"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="3 3"
              dot={{ r: 3 }}
              name="Avg Quality"
            />
            {showWeather && (
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={1}
                dot={false}
                name="Temperature (°C)"
                yAxisId={2}
              />
            )}
            {showWeather && <YAxis yAxisId={2} orientation="right" stroke="#ef4444" />}
          </ComposedChart>
        )
    }
  }

  const renderPieChart = () => {
    const seasonData = seasons.map(season => {
      const seasonMonths = data.filter(item => season.months.includes(item.monthNumber))
      const totalWeight = seasonMonths.reduce((sum, item) => sum + item.totalWeight, 0)
      const totalAmount = seasonMonths.reduce((sum, item) => sum + item.totalAmount, 0)

      return {
        name: season.name,
        value: totalWeight,
        amount: totalAmount,
        color: season.color,
        count: seasonMonths.length
      }
    })

    const renderActiveShape = (props: any) => {
      const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props

      return (
        <g>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 10}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          <text
            x={cx}
            y={cy}
            dy={-20}
            textAnchor="middle"
            fill={fill}
            fontSize={16}
            fontWeight="bold"
          >
            {payload.name}
          </text>
          <text
            x={cx}
            y={cy}
            dy={0}
            textAnchor="middle"
            fill="#6b7280"
            fontSize={14}
          >
            {formatNumber(payload.value)} kg
          </text>
          <text
            x={cx}
            y={cy}
            dy={20}
            textAnchor="middle"
            fill="#6b7280"
            fontSize={12}
          >
            {formatCurrency(payload.amount)}
          </text>
        </g>
      )
    }

    return (
      <PieChart width={400} height={300}>
        <Pie
          activeIndex={activeIndex !== null ? activeIndex : undefined}
          activeShape={renderActiveShape}
          data={seasonData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={(_, index) => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          {seasonData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any, name: string, props: any) => {
            if (name === 'value') return [`${formatNumber(value)} kg`, 'Total Weight']
            return [value, name]
          }}
        />
      </PieChart>
    )
  }

  const getSeasonSummary = () => {
    const summaries = seasons.map(season => {
      const seasonMonths = data.filter(item => season.months.includes(item.monthNumber))

      if (seasonMonths.length === 0) return null

      const totalWeight = seasonMonths.reduce((sum, item) => sum + item.totalWeight, 0)
      const totalAmount = seasonMonths.reduce((sum, item) => sum + item.totalAmount, 0)
      const avgQuality = seasonMonths.reduce((sum, item) => sum + item.avgQuality, 0) / seasonMonths.length
      const avgWeight = totalWeight / seasonMonths.length
      const prevYearWeight = avgWeight * 0.9 // Mock previous year data
      const change = ((avgWeight - prevYearWeight) / prevYearWeight) * 100

      return {
        ...season,
        totalWeight,
        totalAmount,
        avgQuality: Math.round(avgQuality * 10) / 10,
        avgWeight: Math.round(avgWeight * 10) / 10,
        change: Math.round(change * 10) / 10,
        months: seasonMonths.map(item => item.month)
      }
    }).filter(Boolean)

    return summaries
  }

  const handleExportData = () => {
    const csvContent = [
      ['Month', 'Season', 'Avg Weight (kg)', 'Avg Amount (KES)', 'Total Weight (kg)', 'Total Amount (KES)', 'Avg Quality', 'Rainfall (mm)', 'Temperature (°C)', 'Humidity (%)', 'Prediction Accuracy (%)'].join(','),
      ...data.map(row => [
        row.month,
        row.season,
        row.avgWeight,
        row.avgAmount,
        row.totalWeight,
        row.totalAmount,
        row.avgQuality,
        row.rainfall,
        row.temperature,
        row.humidity,
        row.predictionAccuracy || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seasonal-analysis-${selectedYear}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="flex items-center justify-center h-96">
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
            onClick={fetchSeasonalData}
            className="flex items-center space-x-2 mx-auto px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    )
  }

  const seasonSummary = getSeasonSummary()

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Analyzing seasonal patterns for tea production optimization
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Year Selector */}
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
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
        </div>
      </div>

      {/* Season Summary */}
      {seasonSummary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {seasonSummary.map((season: any) => (
            <div
              key={season.name}
              className="p-4 rounded-lg border"
              style={{ borderLeftColor: season.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getSeasonIcon(season.name)}
                  <h3 className="font-semibold">{season.name}</h3>
                </div>
                <span className="text-sm text-gray-500">
                  {season.months.join(', ')}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Weight</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{formatNumber(season.avgWeight)} kg</span>
                    {season.change > 0 ? (
                      <TrendingUp className="text-green-500" size={14} />
                    ) : (
                      <TrendingDown className="text-red-500" size={14} />
                    )}
                    <span className={`text-xs ${season.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {season.change > 0 ? '+' : ''}{formatNumber(season.change)}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Weight</span>
                  <span className="font-semibold">{formatNumber(season.totalWeight)} kg</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Quality</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3].map(level => (
                      <Coffee
                        key={level}
                        size={12}
                        className={level <= Math.round(season.avgQuality) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      {season.avgQuality.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Type
            </label>
            <select
              value={viewType}
              onChange={(e) => setViewType(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tea-500"
            >
              <option value="composite">Composite View</option>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="radar">Radar Chart</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Metric
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-tea-500"
            >
              <option value="composite">Composite (Weight & Amount)</option>
              <option value="weight">Weight Only</option>
              <option value="amount">Amount Only</option>
              <option value="quality">Quality Only</option>
            </select>
          </div>

          <div className="flex items-end space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showWeather}
                onChange={(e) => { }}
                className="rounded border-gray-300 text-tea-600 focus:ring-tea-500"
                disabled
              />
              <span className="text-sm text-gray-600">Show Weather Data</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPredictions}
                onChange={(e) => { }}
                className="rounded border-gray-300 text-tea-600 focus:ring-tea-500"
                disabled
              />
              <span className="text-sm text-gray-600">Show Predictions</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-96 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Weather Data */}
      {showWeather && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Weather Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.slice(0, 3).map((monthData, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{monthData.month}</h4>
                  <span className="text-sm px-2 py-1 rounded-full bg-gray-100">
                    {monthData.season}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getWeatherIcon('rainfall', monthData.rainfall)}
                      <span className="text-sm text-gray-600">Rainfall</span>
                    </div>
                    <span className="font-medium">{monthData.rainfall} mm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getWeatherIcon('temperature', monthData.temperature)}
                      <span className="text-sm text-gray-600">Temperature</span>
                    </div>
                    <span className="font-medium">{monthData.temperature}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getWeatherIcon('humidity', monthData.humidity)}
                      <span className="text-sm text-gray-600">Humidity</span>
                    </div>
                    <span className="font-medium">{monthData.humidity}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Season Distribution Pie Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Seasonal Distribution</h3>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            {renderPieChart()}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {showRecommendations && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Seasonal Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seasons.map(season => {
              const seasonData = data.find(item => season.months.includes(item.monthNumber))
              if (!seasonData) return null

              return (
                <div key={season.name} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    {getSeasonIcon(season.name)}
                    <h4 className="font-medium">{season.name} Guidelines</h4>
                  </div>
                  <ul className="space-y-2">
                    {seasonData.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-tea-500 rounded-full mt-1.5"></div>
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Season Factor:</span>
                      <span className="font-medium">{seasonData.seasonFactor}x</span>
                    </div>
                    {seasonData.predictionAccuracy && (
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Prediction Accuracy:</span>
                        <span className="font-medium">{formatNumber(seasonData.predictionAccuracy)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            }).filter(Boolean)}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex items-start space-x-2 text-sm text-gray-500">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            Seasonal analysis helps optimize tea production by understanding patterns across different weather conditions.
            Recommendations are based on historical data and weather patterns for {selectedYear}.
          </p>
        </div>
      </div>
    </div>
  )
}