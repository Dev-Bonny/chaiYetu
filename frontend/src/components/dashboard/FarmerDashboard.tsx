'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import StatCard from '@/components/ui/StatCard'
import RecentCollections from '@/components/collections/RecentCollections'
import PredictionCard from '@/components/predictions/PredictionCard'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function FarmerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentCollections, setRecentCollections] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch the logged-in farmer's real profile first to get the actual _id
      const farmerProfile = await apiClient.get('/api/v1/farmers/me')
      // Backend wraps the farmer under { success, message, data: <farmer> }
      const farmerData = farmerProfile.data ?? farmerProfile
      const farmerId = farmerData?._id as string | undefined

      const [statsData, collectionsData, predictionsData] = await Promise.all([
        apiClient.get('/api/v1/collections/summary'),
        apiClient.get('/api/v1/collections?limit=5'),
        farmerId
          ? apiClient.get(`/api/v1/predictions/weight?farmerId=${farmerId}&days=7`)
          : Promise.resolve(null)
      ])

      setStats(statsData)
      setRecentCollections(collectionsData.collections || [])
      setPredictions(predictionsData)
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
      <div className="bg-gradient-to-r from-tea-500 to-tea-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-tea-100 mt-2">
          Track your tea collections, payments, and predictions in one place.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Collections"
          value={stats?.totalCollections || 0}
          icon={<Package className="text-tea-600" />}
          change="+12% from last month"
        />
        <StatCard
          title="Total Weight"
          value={`${stats?.totalWeight || 0} kg`}
          icon={<TrendingUp className="text-green-600" />}
          change="+8% from last month"
        />
        <StatCard
          title="Total Earnings"
          value={formatCurrency(stats?.totalEarnings || 0)}
          icon={<DollarSign className="text-yellow-600" />}
          change="+15% from last month"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(stats?.pendingPayments || 0)}
          icon={<AlertCircle className="text-orange-600" />}
          change="2 payments pending"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Collections */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Collections</h2>
              <button className="text-tea-600 hover:text-tea-700 text-sm font-medium">
                View All →
              </button>
            </div>
            <RecentCollections collections={recentCollections} />
          </div>

          {/* Upcoming Collections */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Upcoming Collection Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-tea-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-tea-600" />
                  <div>
                    <p className="font-medium">Morning Collection</p>
                    <p className="text-sm text-gray-600">Tomorrow, 8:00 AM</p>
                  </div>
                </div>
                <CheckCircle className="text-green-500" />
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="text-orange-600" />
                  <div>
                    <p className="font-medium">Afternoon Collection</p>
                    <p className="text-sm text-gray-600">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
                <AlertCircle className="text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* AI Predictions */}
          <PredictionCard prediction={predictions} />

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full btn-primary">
                Record New Collection
              </button>
              <button className="w-full btn-secondary">
                View Payment History
              </button>
              <button className="w-full btn-secondary">
                Request Payment
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium">Payment Processed</p>
                <p className="text-sm text-gray-600">KES 5,250 for last week's collections</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium">Collection Verified</p>
                <p className="text-sm text-gray-600">45kg of Grade 1 tea verified</p>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}