'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Filter, 
  Download, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Package,
  DollarSign,
  TrendingUp
} from 'lucide-react'
import FarmerTable from '@/components/farmers/FarmerTable'
import CreateFarmerModal from '@/components/farmers/CreateFarmerModal'
import { farmerService } from '@/lib/farmer-service'

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchFarmers()
  }, [])

  const fetchFarmers = async () => {
    try {
      const response = await farmerService.getFarmers()
      setFarmers(response.farmers || [])
    } catch (error) {
      console.error('Failed to fetch farmers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = {
    total: farmers.length,
    active: farmers.filter(f => f.status === 'active').length,
    totalCollections: farmers.reduce((sum, f) => sum + (f.totalCollections || 0), 0),
    totalEarnings: farmers.reduce((sum, f) => sum + (f.totalEarnings || 0), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farmers Management</h1>
          <p className="text-gray-600">Manage all tea farmers in the system</p>
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
            <span>Add Farmer</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Farmers</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <Users className="text-tea-600" size={28} />
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
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold">KES {stats.totalEarnings.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-600" size={28} />
          </div>
          <p className="text-xs text-gray-500 mt-2">All time</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg per Farmer</p>
              <p className="text-3xl font-bold">KES {(stats.totalEarnings / Math.max(stats.total, 1)).toLocaleString()}</p>
            </div>
            <TrendingUp className="text-purple-600" size={28} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Average earnings</p>
        </div>
      </div>

      {/* Farmer Table */}
      <FarmerTable 
        farmers={farmers}
        onRefresh={fetchFarmers}
      />

      {/* Modals */}
      <CreateFarmerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchFarmers}
      />
    </div>
  )
}