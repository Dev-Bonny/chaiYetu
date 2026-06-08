// frontend/src/components/farmers/FarmerList.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  User,
  MapPin,
  Phone,
  Calendar,
  Scale,
  Leaf,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  UserPlus,
  Mail,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  AlertCircle,
  BarChart3,
  FileText,
  Shield,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import {
  formatDate,
  formatPhoneNumber,
  cn,
  getStatusColor,
  getStatusLabel,
  formatFarmerId
} from '@/lib/utils'

interface Farmer {
  _id: string
  farmerId: string
  user: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
    isActive: boolean
  }
  location: {
    county: string
    subCounty: string
    ward: string
    village: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  farmSize: number
  teaVariety: string
  registrationDate: string
  status: 'active' | 'inactive' | 'suspended'
  collector?: {
    _id: string
    collectorId: string
    user: {
      firstName: string
      lastName: string
    }
  }
  bankDetails?: {
    bankName: string
    accountNumber: string
    accountName: string
  }
  statistics?: {
    totalCollections: number
    totalWeight: number
    totalEarnings: number
    lastCollectionDate?: string
    averageMonthlyWeight: number
  }
  createdAt: string
  updatedAt: string
}

interface FarmerListProps {
  farmers?: Farmer[]
  showFilters?: boolean
  showActions?: boolean
  showStats?: boolean
  limit?: number
  title?: string
  viewAllLink?: string
  onFarmerClick?: (farmer: Farmer) => void
  onRefresh?: () => void
  autoRefresh?: boolean
  compact?: boolean
  endpoint?: string
}

export default function FarmerList({
  farmers: initialFarmers,
  showFilters = true,
  showActions = true,
  showStats = true,
  limit = 10,
  title = 'Farmers',
  viewAllLink,
  onFarmerClick,
  onRefresh,
  autoRefresh = false,
  compact = false,
  endpoint = '/api/v1/farmers'
}: FarmerListProps) {
  const router = useRouter()
  const [farmers, setFarmers] = useState<Farmer[]>(initialFarmers || [])
  const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([])
  const [isLoading, setIsLoading] = useState(!initialFarmers)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'active' | 'inactive' | 'suspended',
    county: 'all' as string,
    teaVariety: 'all' as string,
    dateRange: 'all' as 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'
  })
  const [sortBy, setSortBy] = useState<'name' | 'registrationDate' | 'farmSize' | 'totalEarnings'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [stats, setStats] = useState({
    totalFarmers: 0,
    activeFarmers: 0,
    totalFarmSize: 0,
    totalEarnings: 0,
    averageFarmSize: 0
  })
  const [expandedFarmer, setExpandedFarmer] = useState<string | null>(null)
  const [selectedFarmers, setSelectedFarmers] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const counties = ['All', 'Kiambu', 'Muranga', 'Nyeri', 'Kirinyaga', 'Meru', 'Embu', 'Tharaka Nithi']
  const teaVarieties = ['All', 'Clone TRFK 306', 'Clone TRFK 371', 'Clone TRFK 430', 'Clone TRFK 6/8', 'Clone BB 35']

  const fetchFarmers = async () => {
    if (initialFarmers) return

    setIsLoading(true)
    setError(null)

    try {
      const separator = endpoint.includes('?') ? '&' : '?'
      const fetchUrl = `${endpoint}${separator}limit=${limit}`
      const response = await apiClient.get(fetchUrl)
      
      const fetchedFarmers = response.data?.farmers || response.farmers || []
      setFarmers(fetchedFarmers)
    } catch (err: any) {
      console.error('Failed to fetch farmers:', err)
      setError('Failed to load farmers')
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockFarmers = (): Farmer[] => {
    const mockFarmers: Farmer[] = []
    const now = new Date()

    for (let i = 0; i < limit; i++) {
      const registrationDate = new Date(now)
      registrationDate.setMonth(registrationDate.getMonth() - Math.floor(Math.random() * 12))

      const totalCollections = Math.floor(Math.random() * 50) + 10
      const totalWeight = totalCollections * (Math.random() * 20 + 15)
      const totalEarnings = totalWeight * (Math.random() * 5 + 20)
      const lastCollectionDate = new Date(now)
      lastCollectionDate.setDate(lastCollectionDate.getDate() - Math.floor(Math.random() * 7))

      const farmer: Farmer = {
        _id: `farmer-${i}`,
        farmerId: `F${String(1000 + i).padStart(6, '0')}`,
        user: {
          _id: `user-${i}`,
          firstName: ['John', 'Mary', 'Peter', 'Sarah', 'James', 'Elizabeth', 'David', 'Grace', 'Michael', 'Ruth'][i % 10],
          lastName: ['Kamau', 'Wanjiku', 'Omondi', 'Mwangi', 'Kiprop', 'Njeri', 'Kariuki', 'Akinyi', 'Odhiambo', 'Atieno'][i % 10],
          email: `farmer${i}@example.com`,
          phone: `+2547${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
          role: 'farmer',
          isActive: i % 10 !== 0 // 90% active
        },
        location: {
          county: counties[(i % (counties.length - 1)) + 1], // Skip "All"
          subCounty: ['Gatundu', 'Kigumo', 'Mathira', 'Mwea', 'Imenti', 'Runyenjes', 'Chuka'][i % 7],
          ward: ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'][i % 5],
          village: `Village ${String.fromCharCode(65 + (i % 26))}`,
          coordinates: {
            lat: -1.2921 + (Math.random() - 0.5) * 0.2,
            lng: 36.8219 + (Math.random() - 0.5) * 0.2
          }
        },
        farmSize: Math.floor(Math.random() * 20) + 2,
        teaVariety: teaVarieties[(i % (teaVarieties.length - 1)) + 1],
        registrationDate: registrationDate.toISOString(),
        status: i % 20 === 0 ? 'suspended' : i % 10 === 0 ? 'inactive' : 'active',
        collector: i % 3 === 0 ? {
          _id: `collector-${i}`,
          collectorId: `C${String(500 + i).padStart(6, '0')}`,
          user: {
            firstName: 'Collector',
            lastName: ['Maina', 'Wairimu', 'Kiptoo'][i % 3]
          }
        } : undefined,
        bankDetails: i % 2 === 0 ? {
          bankName: ['Equity Bank', 'KCB', 'Cooperative Bank', 'Standard Chartered'][i % 4],
          accountNumber: `001${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}`,
          accountName: `Farm Account ${i}`
        } : undefined,
        statistics: {
          totalCollections,
          totalWeight: parseFloat(totalWeight.toFixed(1)),
          totalEarnings: parseFloat(totalEarnings.toFixed(2)),
          lastCollectionDate: lastCollectionDate.toISOString(),
          averageMonthlyWeight: parseFloat((totalWeight / 12).toFixed(1))
        },
        createdAt: registrationDate.toISOString(),
        updatedAt: new Date(registrationDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      mockFarmers.push(farmer)
    }

    return mockFarmers
  }

  useEffect(() => {
    fetchFarmers()

    let intervalId: NodeJS.Timeout
    if (autoRefresh) {
      intervalId = setInterval(fetchFarmers, 60000) // Refresh every minute
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [autoRefresh, limit])

  useEffect(() => {
    if (!farmers.length) return

    // Apply filters
    let filtered = [...farmers]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(farmer =>
        farmer.user.firstName.toLowerCase().includes(term) ||
        farmer.user.lastName.toLowerCase().includes(term) ||
        farmer.farmerId.toLowerCase().includes(term) ||
        farmer.user.phone.includes(term) ||
        farmer.location.county.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(farmer => farmer.status === filters.status)
    }

    // County filter
    if (filters.county !== 'all') {
      filtered = filtered.filter(farmer => farmer.location.county === filters.county)
    }

    // Tea variety filter
    if (filters.teaVariety !== 'all') {
      filtered = filtered.filter(farmer => farmer.teaVariety === filters.teaVariety)
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()

      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter(farmer =>
        new Date(farmer.registrationDate) >= startDate
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'name':
          aValue = `${a.user.firstName} ${a.user.lastName}`.toLowerCase()
          bValue = `${b.user.firstName} ${b.user.lastName}`.toLowerCase()
          break
        case 'registrationDate':
          aValue = new Date(a.registrationDate).getTime()
          bValue = new Date(b.registrationDate).getTime()
          break
        case 'farmSize':
          aValue = a.farmSize
          bValue = b.farmSize
          break
        case 'totalEarnings':
          aValue = a.statistics?.totalEarnings || 0
          bValue = b.statistics?.totalEarnings || 0
          break
        default:
          aValue = `${a.user.firstName} ${a.user.lastName}`.toLowerCase()
          bValue = `${b.user.firstName} ${b.user.lastName}`.toLowerCase()
      }

      return sortOrder === 'asc' ?
        (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) :
        (aValue > bValue ? -1 : aValue < bValue ? 1 : 0)
    })

    setFilteredFarmers(filtered.slice(0, limit))

    // Calculate stats
    const totalFarmers = filtered.length
    const activeFarmers = filtered.filter(f => f.status === 'active').length
    const totalFarmSize = filtered.reduce((sum, f) => sum + f.farmSize, 0)
    const totalEarnings = filtered.reduce((sum, f) => sum + (f.statistics?.totalEarnings || 0), 0)

    setStats({
      totalFarmers,
      activeFarmers,
      totalFarmSize: parseFloat(totalFarmSize.toFixed(1)),
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      averageFarmSize: totalFarmers > 0 ? parseFloat((totalFarmSize / totalFarmers).toFixed(1)) : 0
    })
  }, [farmers, searchTerm, filters, sortBy, sortOrder, limit])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-500" size={16} />
      case 'inactive':
        return <Clock className="text-yellow-500" size={16} />
      case 'suspended':
        return <XCircle className="text-red-500" size={16} />
      default:
        return <Clock className="text-gray-500" size={16} />
    }
  }

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      fetchFarmers()
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Farmer ID', 'Name', 'Phone', 'Email', 'County', 'Farm Size (acres)', 'Tea Variety', 'Status', 'Registration Date', 'Total Collections', 'Total Weight (kg)', 'Total Earnings'],
      ...filteredFarmers.map(farmer => [
        farmer.farmerId,
        `${farmer.user.firstName} ${farmer.user.lastName}`,
        farmer.user.phone,
        farmer.user.email,
        farmer.location.county,
        farmer.farmSize,
        farmer.teaVariety,
        farmer.status,
        formatDate(farmer.registrationDate),
        farmer.statistics?.totalCollections || 0,
        farmer.statistics?.totalWeight || 0,
        farmer.statistics?.totalEarnings || 0
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `farmers_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleFarmerSelection = (farmerId: string) => {
    setSelectedFarmers(prev =>
      prev.includes(farmerId)
        ? prev.filter(id => id !== farmerId)
        : [...prev, farmerId]
    )
  }

  const toggleExpand = (farmerId: string) => {
    setExpandedFarmer(expandedFarmer === farmerId ? null : farmerId)
  }

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'assign' | 'export') => {
    if (selectedFarmers.length === 0) return

    switch (action) {
      case 'activate':
        // Activate selected farmers
        console.log('Activating farmers:', selectedFarmers)
        break
      case 'deactivate':
        // Deactivate selected farmers
        console.log('Deactivating farmers:', selectedFarmers)
        break
      case 'assign':
        // Assign collector to selected farmers
        console.log('Assigning collector to farmers:', selectedFarmers)
        break
      case 'export':
        handleExport()
        break
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-tea-500" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
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

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <AlertCircle className="text-red-500" size={20} />
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!filteredFarmers.length) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Users className="text-gray-400" size={20} />
        </div>
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">No farmers found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your filters or register a new farmer
          </p>
          <div className="mt-6 space-x-3">
            <button
              onClick={() => setFilters({ status: 'all', county: 'all', teaVariety: 'all', dateRange: 'all' })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
            <Link
              href="/dashboard/farmers/register"
              className="inline-block px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors"
            >
              <UserPlus size={16} className="inline mr-2" />
              Register Farmer
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="text-tea-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-gray-600">
              {filteredFarmers.length} farmers • {stats.activeFarmers} active • {stats.totalFarmSize} acres total
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="size-5" />
          </button>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="text-tea-600 hover:text-tea-700 text-sm font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <Eye size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedFarmers.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="text-blue-600" size={20} />
              <div>
                <p className="font-medium">{selectedFarmers.length} farmers selected</p>
                <p className="text-sm text-blue-600">Perform bulk actions on selected farmers</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('assign')}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Assign Collector
              </button>
              <button
                onClick={() => setSelectedFarmers([])}
                className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          {/* Search and Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search farmers by name, ID, phone, or county..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tea-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Quick Stats */}
            {showStats && (
              <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Farmers</span>
                    <Users className="text-blue-600" size={16} />
                  </div>
                  <p className="text-lg font-bold mt-1">{stats.totalFarmers}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <TrendingUp className="text-green-600" size={16} />
                  </div>
                  <p className="text-lg font-bold mt-1">
                    {stats.activeFarmers} ({((stats.activeFarmers / stats.totalFarmers) * 100).toFixed(1)}%)
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Farm Size</span>
                    <Scale className="text-yellow-600" size={16} />
                  </div>
                  <p className="text-lg font-bold mt-1">{stats.averageFarmSize} acres</p>
                </div>
                <div className="p-3 bg-teal-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Earnings</span>
                    <BarChart3 className="text-teal-600" size={16} />
                  </div>
                  <p className="text-lg font-bold mt-1">
                    KES {stats.totalEarnings.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              {['all', 'active', 'inactive', 'suspended'].map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('status', status)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm transition-colors capitalize',
                    filters.status === status
                      ? getStatusColor(status)
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {status === 'all' ? 'All Status' : status}
                </button>
              ))}
            </div>

            {/* County Filter */}
            <select
              value={filters.county}
              onChange={(e) => handleFilterChange('county', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
            >
              <option value="all">All Counties</option>
              {counties.slice(1).map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>

            {/* Tea Variety Filter */}
            <select
              value={filters.teaVariety}
              onChange={(e) => handleFilterChange('teaVariety', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
            >
              <option value="all">All Tea Varieties</option>
              {teaVarieties.slice(1).map(variety => (
                <option key={variety} value={variety}>{variety}</option>
              ))}
            </select>

            {/* Date Range Filter */}
            <div className="flex items-center space-x-2">
              {(['all', 'today', 'week', 'month', 'quarter', 'year'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => handleFilterChange('dateRange', range)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm transition-colors capitalize',
                    filters.dateRange === range
                      ? 'bg-tea-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sorting Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Sort by:
          <button
            onClick={() => handleSort('name')}
            className={cn('ml-2 px-2 py-1 rounded', sortBy === 'name' && 'bg-tea-100 text-tea-700')}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('registrationDate')}
            className={cn('ml-2 px-2 py-1 rounded', sortBy === 'registrationDate' && 'bg-tea-100 text-tea-700')}
          >
            Registration Date {sortBy === 'registrationDate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('farmSize')}
            className={cn('ml-2 px-2 py-1 rounded', sortBy === 'farmSize' && 'bg-tea-100 text-tea-700')}
          >
            Farm Size {sortBy === 'farmSize' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('totalEarnings')}
            className={cn('ml-2 px-2 py-1 rounded', sortBy === 'totalEarnings' && 'bg-tea-100 text-tea-700')}
          >
            Total Earnings {sortBy === 'totalEarnings' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </button>
        </div>
      </div>

      {/* Farmers List/Grid */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredFarmers.map(farmer => (
            <div
              key={farmer._id}
              className={cn(
                'border rounded-lg p-4 hover:shadow-sm transition-all',
                expandedFarmer === farmer._id && 'bg-gray-50',
                selectedFarmers.includes(farmer._id) && 'border-tea-500 bg-tea-50'
              )}
            >
              <div className="flex items-start space-x-3">
                {/* Selection Checkbox */}
                {showActions && (
                  <input
                    type="checkbox"
                    checked={selectedFarmers.includes(farmer._id)}
                    onChange={() => toggleFarmerSelection(farmer._id)}
                    className="mt-1 h-4 w-4 text-tea-600 rounded focus:ring-tea-500"
                  />
                )}

                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-tea-100 flex items-center justify-center">
                  <span className="text-tea-600 font-bold text-lg">
                    {farmer.user.firstName.charAt(0)}{farmer.user.lastName.charAt(0)}
                  </span>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3
                          className="font-semibold hover:text-tea-600 cursor-pointer"
                          onClick={() => onFarmerClick?.(farmer)}
                        >
                          {farmer.user.firstName} {farmer.user.lastName}
                        </h3>
                        {getStatusIcon(farmer.status)}
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(farmer.status)
                        )}>
                          {getStatusLabel(farmer.status)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <User size={12} />
                          <span>{farmer.farmerId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone size={12} />
                          <span>{formatPhoneNumber(farmer.user.phone)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>Joined {formatDate(farmer.registrationDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-tea-600">
                        {formatFarmerId(farmer.farmerId)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {farmer.farmSize} acres • {farmer.location.county}
                      </p>
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="text-gray-400" size={14} />
                      <div>
                        <p className="text-sm font-medium">{farmer.location.village}</p>
                        <p className="text-xs text-gray-500">
                          {farmer.location.ward}, {farmer.location.subCounty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Leaf className="text-gray-400" size={14} />
                      <div>
                        <p className="text-sm font-medium">{farmer.teaVariety}</p>
                        <p className="text-xs text-gray-500">Tea Variety</p>
                      </div>
                    </div>
                    {farmer.collector && (
                      <div className="flex items-center space-x-2">
                        <Users className="text-gray-400" size={14} />
                        <div>
                          <p className="text-sm font-medium">
                            {farmer.collector.user?.firstName} {farmer.collector.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">Assigned Collector</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  {showStats && farmer.statistics && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center">
                          <p className="text-lg font-bold">{farmer.statistics.totalCollections}</p>
                          <p className="text-xs text-gray-600">Collections</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{farmer.statistics.totalWeight} kg</p>
                          <p className="text-xs text-gray-600">Total Weight</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">
                            KES {farmer.statistics.totalEarnings.toLocaleString('en-KE', { maximumFractionDigits: 0 })}
                          </p>
                          <p className="text-xs text-gray-600">Total Earnings</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold">{farmer.statistics.averageMonthlyWeight} kg</p>
                          <p className="text-xs text-gray-600">Avg Monthly</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {showActions && (
                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {farmer.bankDetails && (
                          <span className="flex items-center space-x-1">
                            <Shield size={12} />
                            <span>Bank: {farmer.bankDetails.bankName}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onFarmerClick?.(farmer)}
                          className="px-3 py-1 text-sm bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => toggleExpand(farmer._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedFarmer === farmer._id && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Information */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail size={14} className="text-gray-400" />
                          <span>{farmer.user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone size={14} className="text-gray-400" />
                          <span>{formatPhoneNumber(farmer.user.phone)}</span>
                        </div>
                        {farmer.bankDetails && (
                          <div className="mt-3">
                            <h5 className="text-xs font-medium text-gray-700 mb-1">Bank Details</h5>
                            <div className="bg-gray-50 p-2 rounded">
                              <p className="text-xs">Bank: {farmer.bankDetails.bankName}</p>
                              <p className="text-xs">Account: {farmer.bankDetails.accountNumber}</p>
                              <p className="text-xs">Name: {farmer.bankDetails.accountName}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/farmers/${farmer._id}`)}
                          className="px-3 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors text-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/farmers/${farmer._id}/edit`)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/collections?farmer=${farmer._id}`)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          View Collections
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/payments?farmer=${farmer._id}`)}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          View Payments
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.map(farmer => (
            <div
              key={farmer._id}
              className={cn(
                'border rounded-lg p-4 hover:shadow-sm transition-all',
                selectedFarmers.includes(farmer._id) && 'border-tea-500 bg-tea-50'
              )}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-tea-100 flex items-center justify-center">
                      <span className="text-tea-600 font-bold">
                        {farmer.user.firstName.charAt(0)}{farmer.user.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold hover:text-tea-600 cursor-pointer"
                        onClick={() => onFarmerClick?.(farmer)}>
                        {farmer.user.firstName} {farmer.user.lastName}
                      </h3>
                      <p className="text-xs text-gray-500">{farmer.farmerId}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(farmer.status)}
                    {showActions && (
                      <input
                        type="checkbox"
                        checked={selectedFarmers.includes(farmer._id)}
                        onChange={() => toggleFarmerSelection(farmer._id)}
                        className="h-4 w-4 text-tea-600 rounded focus:ring-tea-500"
                      />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="truncate">{farmer.location.county}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Scale size={12} className="text-gray-400" />
                    <span>{farmer.farmSize} acres</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Leaf size={12} className="text-gray-400" />
                    <span className="truncate">{farmer.teaVariety}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={12} className="text-gray-400" />
                    <span>{formatPhoneNumber(farmer.user.phone).substring(0, 15)}...</span>
                  </div>
                </div>

                {/* Stats Preview */}
                {showStats && farmer.statistics && (
                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="font-bold">{farmer.statistics.totalCollections}</p>
                        <p className="text-xs text-gray-600">Collections</p>
                      </div>
                      <div>
                        <p className="font-bold">{farmer.statistics.totalWeight}kg</p>
                        <p className="text-xs text-gray-600">Weight</p>
                      </div>
                      <div>
                        <p className="font-bold">
                          KES {(farmer.statistics.totalEarnings / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-gray-600">Earnings</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {showActions && (
                  <div className="pt-3 border-t">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onFarmerClick?.(farmer)}
                        className="flex-1 px-2 py-1 text-xs bg-tea-600 text-white rounded hover:bg-tea-700 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/farmers/${farmer._id}/edit`)}
                        className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t">
        <div className="text-sm text-gray-600">
          Showing {filteredFarmers.length} of {farmers.length} farmers
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <Link
            href="/dashboard/farmers/register"
            className="px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors flex items-center space-x-2"
          >
            <UserPlus size={16} />
            <span>Register Farmer</span>
          </Link>
        </div>
      </div>
    </div>
  )
}