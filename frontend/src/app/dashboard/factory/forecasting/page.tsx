'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw, Factory } from 'lucide-react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { factoryService } from '@/lib/factory-service'
import { formatCurrency, formatWeight } from '@/lib/utils'

const CustomTooltip = ({ active, payload, label, mode }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex gap-2 items-center mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-medium">
            {mode === 'revenue' ? formatCurrency(p.value) : formatWeight(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

const TrendBadge = ({ trend }: { trend: string }) => {
  if (trend === 'increasing') return (
    <span className="inline-flex items-center gap-1 text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium">
      <TrendingUp size={12} /> Upward trend
    </span>
  )
  if (trend === 'decreasing') return (
    <span className="inline-flex items-center gap-1 text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-xs font-medium">
      <TrendingDown size={12} /> Downward trend
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
      <Minus size={12} /> Stable
    </span>
  )
}

export default function ForecastingPage() {
  const [days, setDays]           = useState(30)
  const [revData, setRevData]     = useState<any>(null)
  const [outData, setOutData]     = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'revenue' | 'output'>('revenue')

  const load = async () => {
    setIsLoading(true)
    try {
      const [rev, out] = await Promise.all([
        factoryService.getRevenueForecast(days),
        factoryService.getOutputForecast(days),
      ])
      setRevData(rev.data)
      setOutData(out.data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [days])

  const buildChartData = (historical: any[], forecast: any[], mode: 'revenue' | 'output') => {
    const hist = (historical || []).slice(-30).map((d: any) => ({
      date:   d.date,
      label:  new Date(d.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      actual: mode === 'revenue' ? d.revenue : d.rawLeaf,
    }))
    const fore = (forecast || []).map((d: any) => ({
      date:       d.date,
      label:      new Date(d.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
      forecast:   mode === 'revenue' ? d.revenue  : d.rawLeaf,
      lower:      mode === 'revenue' ? d.lower     : d.rawLeaf * 0.85,
      upper:      mode === 'revenue' ? d.upper     : d.rawLeaf * 1.15,
      confidence: d.confidence,
    }))
    return [...hist, ...fore]
  }

  const revenueChart = revData ? buildChartData(revData.historical, revData.forecast, 'revenue') : []
  const outputChart  = outData ? buildChartData([], outData.forecast, 'output') : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={26} />
            Forecasting & Predictions
          </h1>
          <p className="text-gray-500 text-sm mt-1">AI-powered revenue and factory output forecasting</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input-field w-36 text-sm" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={7}>Next 7 days</option>
            <option value={14}>Next 14 days</option>
            <option value={30}>Next 30 days</option>
            <option value={60}>Next 60 days</option>
            <option value={90}>Next 90 days</option>
          </select>
          <button onClick={load} className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        {(['revenue','output'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-tea-600 text-tea-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'revenue' ? '💰 Revenue Forecast' : '🏭 Output Forecast'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tea-500" />
        </div>
      ) : activeTab === 'revenue' && revData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card !p-4 bg-green-50 border-green-200">
              <p className="text-xs text-gray-500">Forecasted Revenue</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(revData.summary?.forecastedRevenue || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Next {days} days</p>
            </div>
            <div className="card !p-4 bg-blue-50 border-blue-200">
              <p className="text-xs text-gray-500">Recent Actual Revenue</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(revData.summary?.recentActualRevenue || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
            </div>
            <div className="card !p-4">
              <p className="text-xs text-gray-500">Trend</p>
              <div className="mt-2"><TrendBadge trend={revData.summary?.trend || 'stable'} /></div>
            </div>
            <div className="card !p-4">
              <p className="text-xs text-gray-500">Avg Confidence</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {Math.round((revData.summary?.avgConfidence || 0) * 100)}%
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-1">Revenue Forecast</h2>
            <p className="text-xs text-gray-400 mb-4">Solid line = actual history | Dashed = forecast | Shaded = confidence band</p>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={revenueChart} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} interval={Math.floor(revenueChart.length / 8)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip mode="revenue" />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <defs>
                  <linearGradient id="confBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area dataKey="upper" name="Upper bound" fill="url(#confBand)" stroke="none" legendType="none" />
                <Area dataKey="lower" name="Lower bound" fill="white"          stroke="none" legendType="none" />
                <Line dataKey="actual"   name="Actual"   stroke="#22c55e" strokeWidth={2.5} dot={false} connectNulls />
                <Line dataKey="forecast" name="Forecast" stroke="#a855f7" strokeWidth={2.5} strokeDasharray="6 3" dot={false} connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Detailed Forecast</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Date','Forecasted Revenue','Lower Bound','Upper Bound','Confidence'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(revData.forecast || []).slice(0, 14).map((f: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium">
                        {new Date(f.date).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-2.5 text-green-700 font-medium">{formatCurrency(f.revenue)}</td>
                      <td className="px-4 py-2.5 text-gray-500">{formatCurrency(f.lower)}</td>
                      <td className="px-4 py-2.5 text-gray-500">{formatCurrency(f.upper)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${f.confidence * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{Math.round(f.confidence * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'output' && outData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card !p-4 bg-tea-50 border-tea-200">
              <p className="text-xs text-gray-500">Forecasted Raw Leaf</p>
              <p className="text-2xl font-bold text-tea-700 mt-1">{formatWeight(outData.summary?.forecastedRawLeaf || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">Next {days} days</p>
            </div>
            <div className="card !p-4 bg-amber-50 border-amber-200">
              <p className="text-xs text-gray-500">Forecasted Made Tea</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{formatWeight(outData.summary?.forecastedMadeTea || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">At {outData.summary?.processingRatio}:1 ratio</p>
            </div>
            <div className="card !p-4">
              <p className="text-xs text-gray-500">Processing Ratio</p>
              <p className="text-2xl font-bold text-gray-700 mt-1">{outData.summary?.processingRatio}:1</p>
              <p className="text-xs text-gray-400 mt-1">kg green leaf per kg made tea</p>
            </div>
            <div className="card !p-4">
              <p className="text-xs text-gray-500">Trend</p>
              <div className="mt-2"><TrendBadge trend={outData.summary?.trend || 'stable'} /></div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Factory Output Forecast</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={(outData.forecast || []).map((d: any) => ({
                ...d,
                label: new Date(d.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' }),
              }))} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} interval={Math.floor((outData.forecast?.length || 1) / 8)} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `${v}kg`} />
                <Tooltip content={<CustomTooltip mode="output" />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="rawLeaf" name="Raw Leaf (kg)" fill="#dcfce7" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="madeTea" name="Made Tea (kg)" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="card bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <Factory size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">About the Processing Ratio</p>
                <p className="text-sm text-amber-700 mt-1">
                  The standard Kenya tea processing ratio is <strong>{outData.summary?.processingRatio} kg</strong> of green
                  leaf to produce <strong>1 kg</strong> of made tea. This forecast is based on linear regression
                  of historical collection data with seasonal adjustments.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}