'use client'

import { useState, useEffect } from 'react'
import { Truck, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { factoryService } from '@/lib/factory-service'
import { formatCurrency, formatWeight } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

export default function CollectorsPage() {
  const [performers, setPerformers] = useState<any[]>([])
  const [total, setTotal]   = useState(0)
  const [pages, setPages]   = useState(1)
  const [page, setPage]     = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await factoryService.getCollectorPerformance({
        page, limit: 20,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
      })
      setPerformers(res.data?.performers || [])
      setTotal(res.data?.total           || 0)
      setPages(res.data?.pages           || 1)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [page, startDate, endDate])

  const chartData = performers.slice(0, 10).map((p: any) => ({
    name: p.collector
      ? `${p.collector.user?.firstName?.slice(0, 8)} ${p.collector.user?.lastName?.slice(0, 1)}.`
      : 'Unknown',
    weight:     p.totalWeight,
    collections: p.totalCollections,
    rejection:  parseFloat(p.rejectionRate || 0),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="text-blue-600" size={26} />
            Collector Performance
          </h1>
          <p className="text-gray-500 text-sm mt-1">Tea weight collected, rejection rates, and farmer coverage</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="card !p-4 flex gap-3 flex-wrap items-center">
        <span className="text-sm text-gray-600 font-medium">Period:</span>
        <input type="date" className="input-field w-40 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <span className="text-gray-400">—</span>
        <input type="date" className="input-field w-40 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
        {(startDate || endDate) && (
          <button onClick={() => { setStartDate(''); setEndDate('') }} className="text-sm text-red-500 hover:text-red-700">Clear</button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tea-500" />
        </div>
      ) : (
        <>
          {chartData.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Top 10 Collectors — Weight Collected</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} angle={-30} textAnchor="end" />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} tickFormatter={v => `${v}kg`} />
                  <Tooltip formatter={(v: any, name: string) =>
                    name === 'weight' ? formatWeight(v) :
                    name === 'rejection' ? `${v}%` : v
                  } />
                  <Bar dataKey="weight" name="Weight" fill="#5fa05f" radius={[4,4,0,0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i < 3 ? '#22c55e' : '#5fa05f'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Rank','Collector','Collections','Total Weight','Revenue','Farmers','Avg Weight','Rejection Rate'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {performers.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">No data for selected period</td></tr>
                  ) : performers.map((p: any, i: number) => {
                    const rank    = (page - 1) * 20 + i + 1
                    const rejRate = parseFloat(p.rejectionRate || 0)
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {rank <= 3 ? (
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${
                              rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-orange-400'
                            }`}>{rank}</span>
                          ) : (
                            <span className="text-gray-500 w-7 inline-block text-center">{rank}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{p.collector?.user?.firstName} {p.collector?.user?.lastName}</div>
                          <div className="text-xs text-gray-400">{p.collector?.collectorId}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">{p.totalCollections}</td>
                        <td className="px-4 py-3 font-medium">{formatWeight(p.totalWeight)}</td>
                        <td className="px-4 py-3 text-green-700 font-medium">{formatCurrency(p.totalRevenue)}</td>
                        <td className="px-4 py-3">{p.farmerCount}</td>
                        <td className="px-4 py-3">{formatWeight(p.avgWeight)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
                              <div className={`h-full rounded-full ${rejRate > 40 ? 'bg-red-500' : rejRate > 20 ? 'bg-orange-400' : 'bg-green-500'}`}
                                style={{ width: `${Math.min(100, rejRate)}%` }} />
                            </div>
                            <span className={`text-xs font-medium ${rejRate > 40 ? 'text-red-600' : rejRate > 20 ? 'text-orange-600' : 'text-green-600'}`}>
                              {rejRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-600">
              <span>{total} collectors</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16}/></button>
                <span>Page {page} of {pages}</span>
                <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16}/></button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}