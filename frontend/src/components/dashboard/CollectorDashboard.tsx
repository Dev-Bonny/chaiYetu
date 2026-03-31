'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  Users,
  Package,
  DollarSign,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import StatCard from '@/components/ui/StatCard'
import RecentCollections from '@/components/collections/RecentCollections'
import FarmerList from '@/components/farmers/FarmerList'
import { formatCurrency } from '@/lib/utils'

export default function CollectorDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [todayCollections, setTodayCollections] = useState<any[]>([])
  const [assignedFarmers, setAssignedFarmers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsData, collectionsData, farmersData] = await Promise.all([
        apiClient.get('/api/v1/collections/summary?today=true'),
        apiClient.get('/api/v1/collections?limit=5&today=true'),
        apiClient.get('/api/v1/farmers/assigned')
      ])

      setStats(statsData)
      setTodayCollections(collectionsData.collections || [])
      setAssignedFarmers(farmersData.farmers || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Collector Dashboard</h1>
        <p className="text-blue-100 mt-2">
          Manage your collections and assigned farmers efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Collections"
          value={stats?.todayCollections || 0}
          icon={<Truck className="text-blue-600" />}
          change={`${stats?.todayWeight || 0} kg collected`}
        />
        <StatCard
          title="Assigned Farmers"
          value={stats?.assignedFarmers || 0}
          icon={<Users className="text-purple-600" />}
          change="5 active today"
        />
        <StatCard
          title="Today's Weight"
          value={`${stats?.totalWeight || 0} kg`}
          icon={<Package className="text-green-600" />}
          change="On track for target"
        />
        <StatCard
          title="Today's Value"
          value={formatCurrency(stats?.totalValue || 0)}
          icon={<DollarSign className="text-yellow-600" />}
          change={formatCurrency(stats?.avgPerKg || 0) + '/kg'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Collections */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Today's Collections</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Record New →
              </button>
            </div>
            <RecentCollections collections={todayCollections} />
          </div>

          {/* Collection Route */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Today's Collection Route</h2>
            <div className="space-y-4">
              {assignedFarmers.slice(0, 3).map((farmer, index) => (
                <div key={farmer._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{farmer.user?.firstName} {farmer.user?.lastName}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{farmer.location?.village}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{farmer.expectedWeight || 0} kg</p>
                      <p className="text-sm text-gray-600">Expected</p>
                    </div>
                    <Clock className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Assigned Farmers */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Assigned Farmers</h2>
              <span className="text-sm text-gray-500">{assignedFarmers.length} total</span>
            </div>
            <FarmerList farmers={assignedFarmers.slice(0, 5)} />
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Record Collection
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Submit Daily Report
              </button>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                View Route Map
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="card border-l-4 border-orange-500">
            <div className="flex items-start space-x-3">
              <AlertCircle className="text-orange-500 mt-1" />
              <div>
                <h3 className="font-semibold">Collection Reminders</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    <span>2 farmers pending collection today</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>Quality check required for 3 collections</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    <span>Vehicle maintenance due next week</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}