'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { factoryService } from '@/lib/factory-service'
import { formatCurrency, formatWeight } from '@/lib/utils'
import FactoryProductionChart from '@/components/factory/FactoryProductionChart'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex gap-2 items-center">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
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

export default function AnalyticsPage() {
  const [period, setPeriod]     = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [days, setDays]         = useState(30)
  const [daily, setDaily]       = useState<any[]>([])
  const [weekly, setWeekly]     = useState<any[]>([])
  const [monthly, setMonthly]   = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [d, w, m] = await Promise.all([
          factoryService.getProductionTrend(days),
          factoryService.getWeeklyBreakdown(12),
          factoryService.getMonthlyBreakdown(12),
        ])
        setDaily(d.data  || [])
        setWeekly(w.data || [])
        setMonthly(m.data|| [])
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [days])

  const activeData = period === 'daily' ? daily : period === 'weekly' ? weekly : monthly
  const labelKey   = period === 'daily' ? 'date' : period === 'weekly' ? 'week' : 'month'

  const totalWeight  = activeData.reduce((s: number, d: any) => s + (d.weight  || 0), 0)
  const totalRevenue = activeData.reduce((s: number, d: any) => s + (d.revenue || 0), 0)
  const totalCount   = activeData.reduce((s: number, d: any) => s + (d.collections || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Production Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Detailed production trends, grades, and revenue breakdown</p>
      </div>

      {/* Controls */}
      <div className="card !p-4 flex items-center gap-4 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['daily','weekly','monthly'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === p ? 'bg-tea-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        {period === 'daily' && (
          <select className="input-field w-36 text-sm" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        )}
        <div className="ml-auto flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Total Weight</p>
            <p className="font-bold text-tea-700">{formatWeight(totalWeight)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Total Revenue</p>
            <p className="font-bold text-green-700">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Collections</p>
            <p className="font-bold text-blue-700">{totalCount}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tea-500" />
        </div>
      ) : (
        <>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Production Trend</h2>
            <FactoryProductionChart
              data={period === 'daily' ? daily : activeData.map((d: any) => ({
                date: d[labelKey], weight: d.weight, revenue: d.revenue, collections: d.collections
              }))}
              height={320}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Collections Count</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={activeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={labelKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="collections" name="Collections" fill="#5fa05f" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Revenue ({period})</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={activeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={labelKey} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="Revenue (KES)" fill="#3b82f6" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {monthly.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Monthly Summary</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['Month','Collections','Total Weight','Revenue','Avg Weight/Collection'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {monthly.map((m: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{m.month}</td>
                        <td className="px-4 py-3">{m.collections}</td>
                        <td className="px-4 py-3">{formatWeight(m.weight)}</td>
                        <td className="px-4 py-3 text-green-700 font-medium">{formatCurrency(m.revenue)}</td>
                        <td className="px-4 py-3">{formatWeight(m.collections > 0 ? m.weight / m.collections : 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-bold">Total</td>
                      <td className="px-4 py-3 font-bold">{monthly.reduce((s: number, m: any) => s + m.collections, 0)}</td>
                      <td className="px-4 py-3 font-bold">{formatWeight(monthly.reduce((s: number, m: any) => s + m.weight, 0))}</td>
                      <td className="px-4 py-3 font-bold text-green-700">{formatCurrency(monthly.reduce((s: number, m: any) => s + m.revenue, 0))}</td>
                      <td className="px-4 py-3 font-bold">—</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}