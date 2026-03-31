'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Truck, 
  Package, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import StatCard from '@/components/ui/StatCard'
import RevenueChart from '@/components/charts/RevenueChart'
import SystemHealth from '@/components/admin/SystemHealth'
import RecentActivities from '@/components/admin/RecentActivities'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsData, revenueData, healthData, activitiesData] = await Promise.all([
        apiClient.get('/api/v1/admin/stats'),
        apiClient.get('/api/v1/payments/revenue-trend?days=30'),
        apiClient.get('/api/v1/admin/health'),
        apiClient.get('/api/v1/admin/activities')
      ])

      setStats(statsData)
      setRevenueData(revenueData)
      setSystemHealth(healthData)
      setRecentActivities(activitiesData)
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
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-purple-100 mt-2">
              Monitor system performance and manage operations.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Last Updated</p>
            <p className="font-medium">Just now</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Farmers"
          value={stats?.totalFarmers || 0}
          icon={<Users className="text-purple-600" />}
          change={
            stats?.farmerGrowth > 0 ? (
              <span className="text-green-600 flex items-center">
                <TrendingUp size={16} className="mr-1" />
                +{stats.farmerGrowth}% this month
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <TrendingDown size={16} className="mr-1" />
                {stats?.farmerGrowth}% this month
              </span>
            )
          }
        />
        <StatCard
          title="Active Collectors"
          value={stats?.activeCollectors || 0}
          icon={<Truck className="text-blue-600" />}
          change={`${stats?.collectorUtilization || 0}% utilization`}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          icon={<DollarSign className="text-green-600" />}
          change={
            stats?.revenueGrowth > 0 ? (
              <span className="text-green-600">+{stats.revenueGrowth}% vs last month</span>
            ) : (
              <span className="text-red-600">{stats?.revenueGrowth}% vs last month</span>
            )
          }
        />
        <StatCard
          title="Collections Today"
          value={stats?.todayCollections || 0}
          icon={<Package className="text-orange-600" />}
          valueSuffix={` (${stats?.todayWeight || 0} kg)`}
          change={`${stats?.collectionCompletion || 0}% of target`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Revenue Trend (Last 30 Days)</h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg">Daily</button>
                <button className="px-3 py-1 text-sm bg-tea-100 text-tea-700 rounded-lg">Weekly</button>
                <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg">Monthly</button>
              </div>
            </div>
            <RevenueChart data={revenueData} />
          </div>

          {/* System Overview */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Collection Performance</h3>
                  <span className="text-2xl font-bold text-blue-600">
                    {stats?.collectionEfficiency || 0}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Average processing time: 2.3 hours</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Payment Processing</h3>
                  <span className="text-2xl font-bold text-green-600">
                    {stats?.paymentEfficiency || 0}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Avg. completion: 1.5 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* System Health */}
          <SystemHealth health={systemHealth} />

          {/* Recent Activities */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Activities</h2>
              <button className="text-tea-600 hover:text-tea-700 text-sm font-medium">
                View All →
              </button>
            </div>
            <RecentActivities activities={recentActivities} />
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="text-green-500" />
                  <span>Verified Collections</span>
                </div>
                <span className="font-semibold">{stats?.verifiedCollections || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="text-orange-500" />
                  <span>Pending Verification</span>
                </div>
                <span className="font-semibold">{stats?.pendingVerification || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="text-red-500" />
                  <span>Rejected Collections</span>
                </div>
                <span className="font-semibold">{stats?.rejectedCollections || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="text-yellow-500" />
                  <span>Pending Payments</span>
                </div>
                <span className="font-semibold">{stats?.pendingPayments || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}