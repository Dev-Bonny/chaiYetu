'use client'

import { useState, useEffect } from 'react'
import { ShieldAlert, RefreshCw, AlertTriangle, Copy, Zap, Shield, Clock } from 'lucide-react'
import { factoryService, FraudFlag } from '@/lib/factory-service'

const typeConfig: Record<string, { icon: React.ReactNode; label: string; bg: string; border: string; text: string }> = {
  duplicate_entry: {
    icon: <Copy size={20} />,
    label: 'Duplicate Entry',
    bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700',
  },
  weight_spike: {
    icon: <Zap size={20} />,
    label: 'Unusual Weight Spike',
    bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700',
  },
  suspicious_collector: {
    icon: <Shield size={20} />,
    label: 'Suspicious Collector Activity',
    bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700',
  },
  off_hours_collection: {
    icon: <Clock size={20} />,
    label: 'Off-Hours Collection',
    bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700',
  },
}

const severityStyles: Record<string, string> = {
  high:   'bg-red-600 text-white',
  medium: 'bg-orange-500 text-white',
  low:    'bg-gray-200 text-gray-700',
}

export default function FraudPage() {
  const [flags, setFlags]     = useState<FraudFlag[]>([])
  const [summary, setSummary] = useState<{ low: number; medium: number; high: number } | null>(null)
  const [total, setTotal]     = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter]   = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [startDate, setStartDate]   = useState('')
  const [endDate, setEndDate]       = useState('')

  const load = async () => {
    setIsLoading(true)
    try {
      const res = await factoryService.getFraudFlags({
        limit:     200,
        startDate: startDate || undefined,
        endDate:   endDate   || undefined,
      })
      setFlags(res.data?.flags   || [])
      setSummary(res.data?.summary || null)
      setTotal(res.data?.total   || 0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [startDate, endDate])

  const displayed = flags.filter(f => {
    if (filter !== 'all' && f.severity !== filter) return false
    if (typeFilter !== 'all' && f.type !== typeFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={26} />
            Fraud & Anomaly Detection
          </h1>
          <p className="text-gray-500 text-sm mt-1">Automatically detected suspicious patterns in collection data</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Flags',    value: total,          bg: 'bg-gray-100',    text: 'text-gray-800'    },
            { label: 'High Severity',  value: summary.high,   bg: 'bg-red-100',     text: 'text-red-700'     },
            { label: 'Medium',         value: summary.medium, bg: 'bg-orange-100',  text: 'text-orange-700'  },
            { label: 'Low',            value: summary.low,    bg: 'bg-blue-50',     text: 'text-blue-700'    },
          ].map(({ label, value, bg, text }) => (
            <div key={label} className={`card !p-4 ${bg}`}>
              <p className={`text-3xl font-bold ${text}`}>{value}</p>
              <p className="text-sm text-gray-600 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card !p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select className="input-field text-sm" value={filter} onChange={e => setFilter(e.target.value as any)}>
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select className="input-field text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="duplicate_entry">Duplicate Entry</option>
            <option value="weight_spike">Weight Spike</option>
            <option value="suspicious_collector">Suspicious Collector</option>
            <option value="off_hours_collection">Off-Hours Collection</option>
          </select>
          <input type="date" className="input-field text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input type="date" className="input-field text-sm" value={endDate}   onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tea-500" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Shield size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No anomalies found</p>
          <p className="text-sm mt-1">The system is clean based on current filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((flag, i) => {
            const cfg = typeConfig[flag.type] || typeConfig.off_hours_collection
            return (
              <div key={i} className={`border rounded-xl p-4 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-start gap-3">
                  <div className={`${cfg.text} mt-0.5 flex-shrink-0`}>{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className={`font-semibold ${cfg.text}`}>{cfg.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${severityStyles[flag.severity]}`}>
                        {flag.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className={`text-sm ${cfg.text} mb-3`}>{flag.description}</p>
                    <div className="bg-white/60 rounded-lg p-3 text-xs space-y-1">
                      {flag.collectionId && (
                        <div className="flex gap-2">
                          <span className="text-gray-500 w-28 flex-shrink-0">Collection ID:</span>
                          <span className="font-mono font-medium">{flag.collectionId.slice(-8)}</span>
                        </div>
                      )}
                      {flag.collectorId && (
                        <div className="flex gap-2">
                          <span className="text-gray-500 w-28 flex-shrink-0">Collector ID:</span>
                          <span className="font-mono font-medium">{flag.collectorId.slice(-8)}</span>
                        </div>
                      )}
                      {flag.farmerId && (
                        <div className="flex gap-2">
                          <span className="text-gray-500 w-28 flex-shrink-0">Farmer ID:</span>
                          <span className="font-mono font-medium">{flag.farmerId.slice(-8)}</span>
                        </div>
                      )}
                      {flag.data && Object.entries(flag.data).slice(0, 4).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-gray-500 w-28 flex-shrink-0 capitalize">{k.replace(/_/g, ' ')}:</span>
                          <span className="font-medium">{String(v)}</span>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-1 pt-1 border-t border-gray-100">
                        <span className="text-gray-400 w-28 flex-shrink-0">Detected:</span>
                        <span className="text-gray-500">{new Date(flag.detectedAt).toLocaleString('en-KE')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="card !p-4">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-orange-500" /> Detection Methods
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <div key={key} className={`p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
              <div className={`flex items-center gap-2 font-medium ${cfg.text} mb-1`}>
                {cfg.icon} {cfg.label}
              </div>
              <p className="text-gray-600 text-xs">
                {key === 'duplicate_entry'     && 'Same farmer + collector on same day with similar weight (±2 kg)'}
                {key === 'weight_spike'         && "Weight > 2.5× the farmer's 60-day rolling average"}
                {key === 'suspicious_collector' && 'Collector rejection rate > 40% in the past 30 days'}
                {key === 'off_hours_collection' && 'Collections recorded between 10 PM and 5 AM'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}