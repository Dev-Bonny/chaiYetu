'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, 
  Filter, 
  Download, 
  Plus, 
  Users, 
  MapPin, 
  Package,
  TrendingUp,
  Clock
} from 'lucide-react'
import CollectorTable from '@/components/collectors/CollectorTable'
import CreateCollectorModal from '@/components/collectors/CreateCollectorModal'

export default function CollectorsPage() {
  const [collectors, setCollectors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchCollectors()
  }, [])

  const fetchCollectors = async () => {
    try {
      // Mock data - replace with API call
      setCollectors([
        {
          _id: '1',
          collectorId: 'C000001',
          user: { firstName: 'David', lastName: 'Mugo', phone: '+254712345678' },
          assignedArea: { county: 'Kirinyaga', subCounty: 'Kirinyaga Central' },
          status: 'active',
          totalCollections: 145,
          assignedFarmers: 12,
          vehicleDetails: { type: 'Pickup', capacity: 1000 }
        },
        {
          _id: '2',
          collectorId: 'C000002',
          user: { firstName: 'Jane', lastName: 'Nyambura', phone: '+254723456789' },
          assignedArea: { county: 'Nyeri', subCounty: 'Nyeri South' },
          status: 'active',
          totalCollections: 98,
          assignedFarmers: 8,
          vehicleDetails: { type: 'Van', capacity: 800 }
        }
      ])
    } catch (error) {
      console.error('Failed to fetch collectors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = {
    total: collectors.length,
    active: collectors.filter(c => c.status === 'active').length,
    totalCollections: collectors.reduce((sum, c) => sum + (c.totalCollections || 0), 0),
    assignedFarmers: collectors.reduce((sum, c) => sum + (c.assignedFarmers || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collectors Management</h1>
          <p className="text-gray-600">Manage tea collection personnel</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700"
          >
            <Plus size={18} />
            <span>Add Collector</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Collectors</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Truck className="text-tea-600" size={28} />
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.active} active</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Collections</p>
              <p className="text-3xl font-bold">{stats.totalCollections}</p>
            </div>
            <Package className="text-blue-600" size={28} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Total recorded</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Assigned Farmers</p>
              <p className="text-3xl font-bold">{stats.assignedFarmers}</p>
            </div>
            <Users className="text-green-600" size={28} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Total farmers assigned</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg per Collector</p>
              <p className="text-3xl font-bold">{Math.round(stats.totalCollections / Math.max(stats.total, 1))}</p>
            </div>
            <TrendingUp className="text-purple-600" size={28} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Average collections</p>
        </div>
      </div>

      {/* Collector Table */}
      <CollectorTable 
        collectors={collectors}
        onRefresh={fetchCollectors}
      />

      {/* Modals */}
      <CreateCollectorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchCollectors}
      />
    </div>
  )
}