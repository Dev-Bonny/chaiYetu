import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: string | React.ReactNode
  valueSuffix?: string
}

export default function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  valueSuffix 
}: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 font-medium">{title}</h3>
        <div className="p-2 bg-gray-100 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">
          {value}
          {valueSuffix && <span className="text-lg font-normal text-gray-600">{valueSuffix}</span>}
        </p>
      </div>
      {change && (
        <p className="text-sm text-gray-600">
          {typeof change === 'string' ? change : change}
        </p>
      )}
    </div>
  )
}