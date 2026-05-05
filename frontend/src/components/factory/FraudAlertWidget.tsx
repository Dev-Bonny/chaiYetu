'use client'

import { Copy, Zap, Shield, Clock } from 'lucide-react'

interface FraudFlag {
  type: 'duplicate_entry' | 'weight_spike' | 'suspicious_collector' | 'off_hours_collection'
  severity: 'low' | 'medium' | 'high'
  collectionId: string
  description: string
  collectorId?: string
  farmerId?: string
  detectedAt: string
  data: any
}

interface Props {
  flags: FraudFlag[]
  compact?: boolean
}

const typeConfig = {
  duplicate_entry: {
    icon: <Copy size={16} />,
    label: 'Duplicate Entry',
    bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700',
  },
  weight_spike: {
    icon: <Zap size={16} />,
    label: 'Weight Spike',
    bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700',
  },
  suspicious_collector: {
    icon: <Shield size={16} />,
    label: 'Suspicious Collector',
    bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700',
  },
  off_hours_collection: {
    icon: <Clock size={16} />,
    label: 'Off-Hours Collection',
    bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700',
  },
}

const severityBadge: Record<string, string> = {
  high:   'bg-red-100    text-red-700    border-red-200',
  medium: 'bg-orange-100 text-orange-700 border-orange-200',
  low:    'bg-gray-100   text-gray-600   border-gray-200',
}

export default function FraudAlertWidget({ flags, compact = false }: Props) {
  if (!flags || flags.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <Shield size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">No anomalies detected</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {flags.map((flag, i) => {
        const cfg = typeConfig[flag.type] ?? typeConfig.off_hours_collection
        return (
          <div key={i} className={`border rounded-lg p-3 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 ${cfg.text} flex-shrink-0`}>{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${severityBadge[flag.severity]}`}>
                    {flag.severity.toUpperCase()}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${cfg.text} opacity-90 ${compact ? 'line-clamp-2' : ''}`}>
                  {flag.description}
                </p>
                {!compact && flag.detectedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(flag.detectedAt).toLocaleString('en-KE')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}