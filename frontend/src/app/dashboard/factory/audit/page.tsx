'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2, XCircle, Eye, ChevronLeft, ChevronRight,
  Search, RefreshCw, Layers
} from 'lucide-react'
import { factoryService } from '@/lib/factory-service'
import { formatDate, formatWeight, formatCurrency } from '@/lib/utils'

const qualityLabel: Record<string, string> = {
  grade1: 'Grade 1',
  grade2: 'Grade 2',
  grade3: 'Grade 3',
}

const statusColor: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  verified: 'bg-green-100  text-green-700',
  rejected: 'bg-red-100    text-red-700',
  paid:     'bg-blue-100   text-blue-700',
}

export default function AuditPage() {
  const [collections, setCollections] = useState<any[]>([])
  const [total, setTotal]             = useState(0)
  const [pages, setPages]             = useState(1)
  const [page, setPage]               = useState(1)
  const [isLoading, setIsLoading]     = useState(true)
  const [selected, setSelected]       = useState<Set<string>>(new Set())
  const [detail, setDetail]           = useState<any>(null)
  const [notes, setNotes]             = useState('')
  const [busy, setBusy]               = useState(false)
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null)

  const [status, setStatus]       = useState('pending')
  const [quality, setQuality]     = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [search, setSearch]       = useState('')

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCollections = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await factoryService.getAllDeliveries({
        page, limit: 20,
        status:    status    || undefined,
        quality:   quality   || undefined,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
      })
      setCollections(res.data?.collections || [])
      setTotal(res.data?.total || 0)
      setPages(res.data?.pages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }, [page, status, quality, startDate, endDate])

  useEffect(() => { fetchCollections() }, [fetchCollections])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === collections.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(collections.map(c => c._id)))
    }
  }

  const handleSingleAudit = async (id: string, action: 'verified' | 'rejected') => {
    setBusy(true)
    try {
      await factoryService.auditCollection(id, action, notes)
      showToast(`Collection ${action} successfully`)
      setDetail(null)
      setNotes('')
      fetchCollections()
    } catch (e: any) {
      showToast(e.message || 'Failed', false)
    } finally {
      setBusy(false)
    }
  }

  const handleBulkAudit = async (action: 'verified' | 'rejected') => {
    if (selected.size === 0) return
    setBusy(true)
    try {
      const res = await factoryService.bulkAudit(Array.from(selected), action)
      showToast(`${res.data?.modified || 0} collections ${action}`)
      setSelected(new Set())
      fetchCollections()
    } catch (e: any) {
      showToast(e.message || 'Failed', false)
    } finally {
      setBusy(false)
    }
  }

  const displayed = search
    ? collections.filter(c => {
        const farmerName    = `${c.farmer?.user?.firstName} ${c.farmer?.user?.lastName}`.toLowerCase()
        const collectorName = `${c.collector?.user?.firstName} ${c.collector?.user?.lastName}`.toLowerCase()
        const id            = c.collectionId?.toLowerCase() || ''
        const s             = search.toLowerCase()
        return farmerName.includes(s) || collectorName.includes(s) || id.includes(s)
      })
    : collections

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collection Audit</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve or reject collector entries</p>
        </div>
        <button onClick={fetchCollections} className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card !p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-9 text-sm"
              placeholder="Search farmer / collector…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field text-sm" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>
          <select className="input-field text-sm" value={quality} onChange={e => { setQuality(e.target.value); setPage(1) }}>
            <option value="">All Grades</option>
            <option value="grade1">Grade 1</option>
            <option value="grade2">Grade 2</option>
            <option value="grade3">Grade 3</option>
          </select>
          <input type="date" className="input-field text-sm" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1) }} />
          <input type="date" className="input-field text-sm" value={endDate}   onChange={e => { setEndDate(e.target.value);   setPage(1) }} />
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-tea-50 border border-tea-200 rounded-lg px-4 py-3">
          <Layers size={16} className="text-tea-600" />
          <span className="text-sm font-medium text-tea-700">{selected.size} selected</span>
          <div className="ml-auto flex gap-2">
            <button onClick={() => handleBulkAudit('verified')} disabled={busy}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg disabled:opacity-50">
              <CheckCircle2 size={14} /> Approve All
            </button>
            <button onClick={() => handleBulkAudit('rejected')} disabled={busy}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg disabled:opacity-50">
              <XCircle size={14} /> Reject All
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox"
                    checked={selected.size === collections.length && collections.length > 0}
                    onChange={toggleAll}
                    className="rounded"
                  />
                </th>
                {['Collection ID','Farmer','Collector','Date','Weight','Grade','Amount','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">Loading…</td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">No collections found</td></tr>
              ) : displayed.map(c => (
                <tr key={c._id} className={`hover:bg-gray-50 transition-colors ${selected.has(c._id) ? 'bg-tea-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(c._id)} onChange={() => toggleSelect(c._id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{c.collectionId}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.farmer?.user?.firstName} {c.farmer?.user?.lastName}</div>
                    <div className="text-xs text-gray-400">{c.farmer?.farmerId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{c.collector?.user?.firstName} {c.collector?.user?.lastName}</div>
                    <div className="text-xs text-gray-400">{c.collector?.collectorId}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.collectionDate)}</td>
                  <td className="px-4 py-3 font-medium">{formatWeight(c.weight)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.quality === 'grade1' ? 'bg-green-100 text-green-700' :
                      c.quality === 'grade2' ? 'bg-blue-100 text-blue-700'   :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {qualityLabel[c.quality]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-green-700">{formatCurrency(c.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status] || 'bg-gray-100 text-gray-600'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetail(c)} className="p-1.5 rounded hover:bg-blue-100 text-blue-600" title="View">
                        <Eye size={15} />
                      </button>
                      {c.status === 'pending' && (
                        <>
                          <button onClick={() => handleSingleAudit(c._id, 'verified')} disabled={busy}
                            className="p-1.5 rounded hover:bg-green-100 text-green-600 disabled:opacity-40" title="Approve">
                            <CheckCircle2 size={15} />
                          </button>
                          <button onClick={() => handleSingleAudit(c._id, 'rejected')} disabled={busy}
                            className="p-1.5 rounded hover:bg-red-100 text-red-600 disabled:opacity-40" title="Reject">
                            <XCircle size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
          <span>{total} total entries</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            <span>Page {page} of {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Collection Detail</h3>
            <div className="space-y-3 text-sm">
              {[
                ['ID',        detail.collectionId],
                ['Farmer',    `${detail.farmer?.user?.firstName} ${detail.farmer?.user?.lastName} (${detail.farmer?.farmerId})`],
                ['Collector', `${detail.collector?.user?.firstName} ${detail.collector?.user?.lastName}`],
                ['Date',      formatDate(detail.collectionDate)],
                ['Weight',    formatWeight(detail.weight)],
                ['Grade',     qualityLabel[detail.quality]],
                ['Price/kg',  formatCurrency(detail.pricePerKg)],
                ['Amount',    formatCurrency(detail.totalAmount)],
                ['Location',  detail.location?.address],
                ['Status',    detail.status],
                ['Notes',     detail.notes || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500 w-28 flex-shrink-0">{label}</span>
                  <span className="font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
            {detail.status === 'pending' && (
              <div className="mt-4">
                <textarea
                  className="input-field text-sm resize-none"
                  rows={2}
                  placeholder="Optional notes…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
                <div className="flex gap-3 mt-3">
                  <button onClick={() => handleSingleAudit(detail._id, 'verified')} disabled={busy}
                    className="flex-1 flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg disabled:opacity-50">
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button onClick={() => handleSingleAudit(detail._id, 'rejected')} disabled={busy}
                    className="flex-1 flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg disabled:opacity-50">
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => setDetail(null)} className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}