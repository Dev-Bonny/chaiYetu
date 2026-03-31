'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface RevenueChartProps {
  data: Array<{
    date: string
    amount: number
  }>
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-tea-600 font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }))

  return (
    <div>
      {/* Chart Controls */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === mode
                  ? 'bg-tea-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="formattedDate"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666' }}
              tickFormatter={(value) => `KES ${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#22c55e"
              strokeWidth={3}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 bg-tea-50 rounded-lg">
          <p className="text-sm text-gray-600">Highest Day</p>
          <p className="text-xl font-bold text-tea-700">
            {formatCurrency(Math.max(...data.map(d => d.amount)))}
          </p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Average Daily</p>
          <p className="text-xl font-bold text-blue-700">
            {formatCurrency(data.reduce((sum, d) => sum + d.amount, 0) / data.length)}
          </p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-xl font-bold text-green-700">
            {formatCurrency(data.reduce((sum, d) => sum + d.amount, 0))}
          </p>
        </div>
      </div>
    </div>
  )
}