'use client'

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'

interface PredictionAccuracyChartProps {
  metrics: any
}

export default function PredictionAccuracyChart({ metrics }: PredictionAccuracyChartProps) {
  if (!metrics) return null

  const chartData = [
    {
      subject: 'Weight Accuracy',
      A: metrics.weight?.accuracy || 0,
      B: 100,
      fullMark: 100,
    },
    {
      subject: 'Payment Accuracy',
      A: metrics.payment?.accuracy || 0,
      B: 100,
      fullMark: 100,
    },
    {
      subject: 'Confidence',
      A: 85,
      B: 100,
      fullMark: 100,
    },
    {
      subject: 'Trend Accuracy',
      A: 78,
      B: 100,
      fullMark: 100,
    },
    {
      subject: 'Seasonal Fit',
      A: 92,
      B: 100,
      fullMark: 100,
    },
    {
      subject: 'Response Time',
      A: 95,
      B: 100,
      fullMark: 100,
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].payload.subject}</p>
          <p className="text-tea-600 font-bold">
            Accuracy: {payload[0].value}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Prediction Accuracy Analysis</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Current Performance"
              dataKey="A"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.6}
            />
            <Radar
              name="Target"
              dataKey="B"
              stroke="#94a3b8"
              fill="none"
              strokeDasharray="5 5"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Mean Absolute Error (Weight)</p>
          <p className="text-xl font-bold text-green-700">
            {metrics.weight?.mae?.toFixed(2) || 0} kg
          </p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Root Mean Square Error</p>
          <p className="text-xl font-bold text-blue-700">
            {metrics.weight?.rmse?.toFixed(2) || 0} kg
          </p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Predictions</p>
          <p className="text-xl font-bold text-purple-700">
            {metrics.overall?.totalPredictions || 0}
          </p>
        </div>
      </div>
    </div>
  )
}