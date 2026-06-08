// frontend/src/components/admin/RecentActivities.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  UserPlus,
  UserMinus,
  Package,
  DollarSign,
  Shield,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Eye,
  Download,
  MoreVertical,
  MapPin,
  Bell,
  FileText,
  TrendingUp,
  UserCheck,
  Truck,
  RefreshCw
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { formatDate, timeAgo, cn, getStatusColor } from '@/lib/utils'

interface Activity {
  id: string
  type: ActivityType
  user: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  description: string
  details?: string
  timestamp: string
  status?: 'success' | 'warning' | 'error' | 'info'
  ipAddress?: string
  location?: string
  metadata?: Record<string, any>
}

type ActivityType = 
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'login'
  | 'logout'
  | 'collection_recorded'
  | 'collection_verified'
  | 'collection_rejected'
  | 'payment_processed'
  | 'payment_failed'
  | 'system_config_updated'
  | 'permission_changed'
  | 'notification_sent'
  | 'report_generated'
  | 'farmer_registered'
  | 'collector_assigned'
  | 'password_reset'
  | 'api_call'
  | 'backup_completed'
  | 'maintenance_mode'

interface RecentActivitiesProps {
  showFilters?: boolean
  showSearch?: boolean
  limit?: number
  autoRefresh?: boolean
  onActivityClick?: (activity: Activity) => void
}

export default function RecentActivities({
  showFilters = true,
  showSearch = true,
  limit = 10,
  autoRefresh = true,
  onActivityClick
}: RecentActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const activityTypes: { value: ActivityType; label: string; icon: React.ReactNode }[] = [
    { value: 'user_created', label: 'User Created', icon: <UserPlus size={16} /> },
    { value: 'user_updated', label: 'User Updated', icon: <UserCheck size={16} /> },
    { value: 'user_deleted', label: 'User Deleted', icon: <UserMinus size={16} /> },
    { value: 'login', label: 'Login', icon: <Shield size={16} /> },
    { value: 'logout', label: 'Logout', icon: <Shield size={16} /> },
    { value: 'collection_recorded', label: 'Collection Recorded', icon: <Package size={16} /> },
    { value: 'collection_verified', label: 'Collection Verified', icon: <CheckCircle size={16} /> },
    { value: 'collection_rejected', label: 'Collection Rejected', icon: <XCircle size={16} /> },
    { value: 'payment_processed', label: 'Payment Processed', icon: <DollarSign size={16} /> },
    { value: 'payment_failed', label: 'Payment Failed', icon: <AlertCircle size={16} /> },
    { value: 'farmer_registered', label: 'Farmer Registered', icon: <UserPlus size={16} /> },
    { value: 'collector_assigned', label: 'Collector Assigned', icon: <Truck size={16} /> },
    { value: 'system_config_updated', label: 'Config Updated', icon: <Settings size={16} /> },
    { value: 'notification_sent', label: 'Notification Sent', icon: <Bell size={16} /> },
    { value: 'report_generated', label: 'Report Generated', icon: <FileText size={16} /> },
  ]

  const userRoles = ['admin', 'farmer', 'collector', 'factory_manager']
  const statusOptions = ['success', 'warning', 'error', 'info']

  const getActivityIcon = (type: ActivityType) => {
    const typeConfig = activityTypes.find(t => t.value === type)
    return typeConfig?.icon || <Clock size={16} />
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={16} />
      case 'error':
        return <XCircle className="text-red-500" size={16} />
      case 'info':
        return <Bell className="text-blue-500" size={16} />
      default:
        return <Clock className="text-gray-500" size={16} />
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'success':
        return 'Success'
      case 'warning':
        return 'Warning'
      case 'error':
        return 'Error'
      case 'info':
        return 'Info'
      default:
        return 'Unknown'
    }
  }

  const getActivityColor = (type: ActivityType) => {
    const colorMap: Record<string, string> = {
      user_created: 'bg-green-100 text-green-800 border-green-200',
      user_updated: 'bg-blue-100 text-blue-800 border-blue-200',
      user_deleted: 'bg-red-100 text-red-800 border-red-200',
      login: 'bg-teal-100 text-teal-800 border-teal-200',
      logout: 'bg-gray-100 text-gray-800 border-gray-200',
      collection_recorded: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      collection_verified: 'bg-green-100 text-green-800 border-green-200',
      collection_rejected: 'bg-red-100 text-red-800 border-red-200',
      payment_processed: 'bg-green-100 text-green-800 border-green-200',
      payment_failed: 'bg-red-100 text-red-800 border-red-200',
      farmer_registered: 'bg-purple-100 text-purple-800 border-purple-200',
      collector_assigned: 'bg-orange-100 text-orange-800 border-orange-200',
      system_config_updated: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      notification_sent: 'bg-blue-100 text-blue-800 border-blue-200',
      report_generated: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    }
    return colorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      // In production, this would call your backend API
      // const data = await apiClient.get('/api/v1/admin/activities', {
      //   params: { limit, dateRange }
      // })
      
      // Mock data for development
      const mockActivities: Activity[] = [
        {
          id: '1',
          type: 'collection_recorded',
          user: {
            id: '101',
            name: 'John Kamau',
            role: 'collector'
          },
          description: 'Recorded new tea collection',
          details: '45kg of Grade 1 tea from farmer F000123',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'success',
          ipAddress: '192.168.1.100',
          location: 'Nairobi, Kenya',
          metadata: {
            farmerId: 'F000123',
            weight: 45,
            quality: 'grade1',
            collectionId: 'COL20231215001'
          }
        },
        {
          id: '2',
          type: 'payment_processed',
          user: {
            id: '201',
            name: 'Sarah Mwangi',
            role: 'admin'
          },
          description: 'Processed payment to farmer',
          details: 'KES 12,500 via M-Pesa',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'success',
          ipAddress: '192.168.1.101',
          location: 'Mombasa, Kenya',
          metadata: {
            farmerId: 'F000123',
            amount: 12500,
            method: 'mpesa',
            reference: 'MPE123456789'
          }
        },
        {
          id: '3',
          type: 'farmer_registered',
          user: {
            id: '301',
            name: 'Peter Omondi',
            role: 'admin'
          },
          description: 'Registered new farmer',
          details: 'James Mwangi from Kiambu County',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          status: 'success',
          ipAddress: '192.168.1.102',
          location: 'Kiambu, Kenya'
        },
        {
          id: '4',
          type: 'collection_rejected',
          user: {
            id: '401',
            name: 'Mary Wanjiku',
            role: 'factory_manager'
          },
          description: 'Rejected collection verification',
          details: 'Quality check failed for collection COL20231214005',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'error',
          ipAddress: '192.168.1.103',
          location: 'Nyeri, Kenya',
          metadata: {
            collectionId: 'COL20231214005',
            reason: 'Quality standards not met'
          }
        },
        {
          id: '5',
          type: 'login',
          user: {
            id: '501',
            name: 'David Kiprop',
            role: 'farmer'
          },
          description: 'User logged in from new device',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          status: 'warning',
          ipAddress: '41.90.34.56',
          location: 'Eldoret, Kenya'
        },
        {
          id: '6',
          type: 'system_config_updated',
          user: {
            id: '201',
            name: 'Sarah Mwangi',
            role: 'admin'
          },
          description: 'Updated system configuration',
          details: 'Changed tea price rates for Grade 1',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          status: 'info',
          ipAddress: '192.168.1.101',
          metadata: {
            configKey: 'tea_prices',
            oldValue: 20,
            newValue: 25
          }
        },
        {
          id: '7',
          type: 'notification_sent',
          user: {
            id: '601',
            name: 'System Bot',
            role: 'system'
          },
          description: 'Bulk SMS notification sent',
          details: 'Payment alerts to 150 farmers',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          metadata: {
            notificationType: 'sms',
            recipients: 150,
            message: 'Your payment has been processed'
          }
        },
        {
          id: '8',
          type: 'collector_assigned',
          user: {
            id: '301',
            name: 'Peter Omondi',
            role: 'admin'
          },
          description: 'Assigned collector to farmer group',
          details: 'Collector C000045 assigned to 15 farmers in Muranga',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          ipAddress: '192.168.1.102'
        },
        {
          id: '9',
          type: 'payment_failed',
          user: {
            id: '201',
            name: 'Sarah Mwangi',
            role: 'admin'
          },
          description: 'Payment processing failed',
          details: 'M-Pesa payment to F000078 failed due to insufficient funds',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          status: 'error',
          metadata: {
            farmerId: 'F000078',
            amount: 8500,
            error: 'Insufficient funds'
          }
        },
        {
          id: '10',
          type: 'report_generated',
          user: {
            id: '401',
            name: 'Mary Wanjiku',
            role: 'factory_manager'
          },
          description: 'Monthly report generated',
          details: 'December 2023 production and sales report',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'success',
          metadata: {
            reportType: 'monthly',
            period: 'December 2023',
            downloadUrl: '/reports/2023-12.pdf'
          }
        }
      ]

      setActivities(mockActivities)
      setFilteredActivities(mockActivities.slice(0, limit))
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
    
    let intervalId: NodeJS.Timeout
    if (autoRefresh) {
      intervalId = setInterval(fetchActivities, 60000) // Refresh every minute
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [autoRefresh, limit])

  useEffect(() => {
    let filtered = [...activities]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(activity =>
        activity.description.toLowerCase().includes(term) ||
        activity.user.name.toLowerCase().includes(term) ||
        (activity.details && activity.details.toLowerCase().includes(term))
      )
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(activity => selectedTypes.includes(activity.type))
    }

    // Apply role filter
    if (selectedRoles.length > 0) {
      filtered = filtered.filter(activity => selectedRoles.includes(activity.user.role))
    }

    // Apply status filter
    if (selectedStatus.length > 0) {
      filtered = filtered.filter(activity => 
        activity.status && selectedStatus.includes(activity.status)
      )
    }

    // Apply date range filter
    const now = new Date()
    let startDate = new Date(0) // Beginning of time

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
    }

    if (dateRange !== 'all') {
      filtered = filtered.filter(activity => 
        new Date(activity.timestamp) >= startDate
      )
    }

    setFilteredActivities(filtered.slice(0, limit))
  }, [activities, searchTerm, selectedTypes, selectedRoles, selectedStatus, dateRange, limit])

  const handleTypeToggle = (type: ActivityType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  const handleStatusToggle = (status: string) => {
    setSelectedStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const handleExport = () => {
    // In production, this would trigger a download
    const csvContent = [
      ['ID', 'Type', 'User', 'Role', 'Description', 'Timestamp', 'Status', 'IP Address', 'Location'],
      ...filteredActivities.map(activity => [
        activity.id,
        activity.type,
        activity.user.name,
        activity.user.role,
        activity.description,
        formatDate(activity.timestamp),
        activity.status || '',
        activity.ipAddress || '',
        activity.location || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activities_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleActivityExpansion = (id: string) => {
    setExpandedActivity(expandedActivity === id ? null : id)
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Activities</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tea-500" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="text-tea-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold">Recent Activities</h2>
            <p className="text-sm text-gray-600">
              {filteredActivities.length} activities in the last {dateRange}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={`Switch to ${viewMode === 'list' ? 'grid' : 'list'} view`}
          >
            {viewMode === 'list' ? 'Grid' : 'List'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search activities..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Date Range */}
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              {(['today', 'week', 'month', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm transition-colors capitalize',
                    dateRange === range
                      ? 'bg-tea-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusToggle(status)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1',
                    selectedStatus.includes(status)
                      ? getStatusColor(status)
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {getStatusIcon(status)}
                  <span className="capitalize">{status}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {activityTypes.slice(0, 8).map(type => (
              <button
                key={type.value}
                onClick={() => handleTypeToggle(type.value)}
                className={cn(
                  'px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-2',
                  selectedTypes.includes(type.value)
                    ? getActivityColor(type.value)
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">No activities found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your filters or search term
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredActivities.map(activity => (
            <div
              key={activity.id}
              className={cn(
                'border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer',
                expandedActivity === activity.id && 'bg-gray-50'
              )}
              onClick={() => onActivityClick?.(activity)}
            >
              <div className="flex items-start space-x-3">
                {/* Activity Icon */}
                <div className={cn(
                  'p-2 rounded-lg',
                  getActivityColor(activity.type)
                )}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      {activity.details && (
                        <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {activity.status && getStatusIcon(activity.status)}
                      <span className="text-sm text-gray-500">
                        {timeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-tea-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-tea-600">
                            {activity.user.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{activity.user.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                          {activity.user.role}
                        </span>
                      </div>
                      {activity.ipAddress && (
                        <span className="text-xs text-gray-500">
                          IP: {activity.ipAddress}
                        </span>
                      )}
                      {activity.location && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin size={12} />
                          <span>{activity.location}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleActivityExpansion(activity.id)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedActivity === activity.id && activity.metadata && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Additional Details</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredActivities.map(activity => (
            <div
              key={activity.id}
              className="border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => onActivityClick?.(activity)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={cn(
                    'p-2 rounded-lg',
                    getActivityColor(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex items-center space-x-2">
                    {activity.status && getStatusIcon(activity.status)}
                    <span className="text-xs text-gray-500">
                      {timeAgo(activity.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <p className="font-medium line-clamp-2">{activity.description}</p>
                  {activity.details && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.details}</p>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-tea-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-tea-600">
                          {activity.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium">{activity.user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{activity.user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleActivityExpansion(activity.id)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t">
        <div className="text-sm text-gray-600">
          Showing {filteredActivities.length} of {activities.length} activities
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTypes([])}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={fetchActivities}
            className="px-3 py-1 text-sm bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors flex items-center space-x-1"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  )
}