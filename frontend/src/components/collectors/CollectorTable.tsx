'use client'

import { useState } from 'react'
import { 
  Eye, 
  Edit, 
  Truck, 
  MapPin, 
  Phone, 
  Users,
  Package,
  TrendingUp,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react'

interface CollectorTableProps {
  collectors: any[]
  onRefresh: () => void
}

export default function CollectorTable({ collectors, onRefresh }: CollectorTableProps) {
  const [selectedCollector, setSelectedCollector] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      on_leave: 'bg-yellow-100 text-yellow-800'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${variants[status as keyof typeof variants]}`}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Area</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collections</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmers</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {collectors.map((collector) => (
              <tr key={collector._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {collector.user?.firstName} {collector.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{collector.collectorId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-sm">{collector.user?.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-sm">
                      {collector.assignedArea?.subCounty}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium">{collector.vehicleDetails?.type}</p>
                    <p className="text-gray-600">{collector.vehicleDetails?.capacity}kg capacity</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Package size={14} className="text-blue-500" />
                    <span className="font-medium">{collector.totalCollections || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Users size={14} className="text-green-500" />
                    <span className="font-medium">{collector.assignedFarmers || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(collector.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedCollector(collector)}
                      className="text-tea-600 hover:text-tea-900"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => {/* Edit logic */}}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}