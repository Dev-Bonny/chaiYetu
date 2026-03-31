'use client'

import { useState } from 'react'
import { 
  Eye, 
  Edit, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FarmerTableProps {
  farmers: any[]
  onRefresh: () => void
}

export default function FarmerTable({ farmers, onRefresh }: FarmerTableProps) {
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${variants[status as keyof typeof variants]}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collections</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earnings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {farmers.map((farmer) => (
              <tr key={farmer._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-tea-100 rounded-full flex items-center justify-center">
                      <User className="text-tea-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {farmer.user?.firstName} {farmer.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{farmer.farmerId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-sm">{farmer.user?.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-sm">{farmer.user?.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-sm">
                      {farmer.location?.village}, {farmer.location?.ward}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <Package size={14} className="text-blue-500" />
                    <span className="font-medium">{farmer.totalCollections || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={14} className="text-green-500" />
                    <span className="font-medium">{formatCurrency(farmer.totalEarnings || 0)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(farmer.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedFarmer(farmer)}
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