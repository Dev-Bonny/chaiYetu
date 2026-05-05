'use client'

import { useState } from 'react'
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { formatCurrency, formatWeight } from '@/lib/utils'

interface TrendPoint {
  date: string
  weight: number
  revenue: number
  collections: number
}

interface Props {
  data: TrendPoint[]
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-gray-600 capitalize">{p.name}:</span>
          <span className="font-medium">
            {p.dataKey === 'revenue' ? formatCurrency(p.value) :
             p.dataKey === 'weight'  ? formatWeight(p.value)   :
             p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function FactoryProductionChart({ data, height = 300 }: Props) {
  const [metric, setMetric] = useState<'weight' | 'revenue' | 'both'>('both')

  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-200 p-1 gap-1">
          {(['weight', 'revenue', 'both'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${
                metric === m
                  ? 'bg-tea-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {m === 'both' ? 'Both' : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#888', fontSize: 11 }}
          />

          {(metric === 'weight' || metric === 'both') && (
            <YAxis
              yAxisId="weight"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 11 }}
              tickFormatter={v => `${v}kg`}
            />
          )}

          {(metric === 'revenue' || metric === 'both') && (
            <YAxis
              yAxisId="revenue"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 11 }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            />
          )}

          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />

          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#5fa05f" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#5fa05f" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>

          {(metric === 'weight' || metric === 'both') && (
            <Area
              yAxisId="weight"
              type="monotone"
              dataKey="weight"
              name="weight"
              stroke="#5fa05f"
              strokeWidth={2.5}
              fill="url(#weightGrad)"
              dot={false}
              activeDot={{ r: 5 }}
            />
          )}

          {(metric === 'revenue' || metric === 'both') && (
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={false}
              activeDot={{ r: 5 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="text-center p-3 bg-tea-50 rounded-lg">
            <p className="text-xs text-gray-500">Total Weight</p>
            <p className="font-bold text-tea-700">{formatWeight(data.reduce((s, d) => s + d.weight, 0))}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="font-bold text-blue-700">{formatCurrency(data.reduce((s, d) => s + d.revenue, 0))}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-500">Collections</p>
            <p className="font-bold text-purple-700">{data.reduce((s, d) => s + d.collections, 0)}</p>
          </div>
        </div>
      )}
    </div>
  )
}