'use client'

import { useState, useEffect } from 'react'
import { Users, ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react'
import { factoryService } from '@/lib/factory-service'
import { formatCurrency, formatWeight, formatDate } from '@/lib/utils'

export default function FarmersPage() {
  const [farmers, setFarmers]   = useState<any[]>([])
  const [total, setTotal]       = useState(0)
  const [pages, setPages]       = useState(1)
  const [page, setPage]         = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [search, setSearch]       = useState('')

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await factoryService.getActiveFarmersSummary({
        page, limit: 20,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
      })
      setFarmers(res.data?.farmers || [])
      setTotal(res.data?.total     || 0)
      setPages(res.data?.pages     || 1)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [page, startDate, endDate])

  const displayed = search
    ? farmers.filter(f => {
        const name = `${f.farmer?.user?.firstName} ${f.farmer?.user?.lastName}`.toLowerCase()
        const id   = f.farmer?.farmerId?.toLowerCase() || ''
        return name.includes(search.toLowerCase()) || id.includes(search.toLowerCase())
      })
    : farmers

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-purple-600" size={26} />
            Active Farmers Summary
          </h1>
          <p className="text-gray-500 text-sm mt-1">Farmers ranked by total tea delivered</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="card !p-4 flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input-field pl-9 text-sm" placeholder="Search farmer name or ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
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
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Rank','Farmer','Farmer ID','Collections','Total Weight','Revenue','Avg Weight','Last Delivery'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No farmers found</td></tr>
                ) : displayed.map((f: any, i: number) => {
                  const rank = (page - 1) * 20 + i + 1
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
                        <div className="font-medium">{f.farmer?.user?.firstName} {f.farmer?.user?.lastName}</div>
                        <div className="text-xs text-gray-400">{f.farmer?.user?.phone}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{f.farmer?.farmerId}</td>
                      <td className="px-4 py-3 font-medium">{f.totalCollections}</td>
                      <td className="px-4 py-3 font-medium">{formatWeight(f.totalWeight)}</td>
                      <td className="px-4 py-3 text-green-700 font-medium">{formatCurrency(f.totalRevenue)}</td>
                      <td className="px-4 py-3">{formatWeight(f.avgWeight)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(f.lastCollection)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-600">
            <span>{total} farmers</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16}/></button>
              <span>Page {page} of {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}