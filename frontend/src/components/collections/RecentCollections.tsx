// frontend/src/components/collections/RecentCollections.tsx
'use client'

import React, { useState, useEffect } from 'react'
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Scale,
  Star,
  User,
  Package,
  AlertCircle,
  Download,
  RefreshCw,
  MoreVertical,
  BarChart3,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { collectionService } from '@/lib/collection-service'
import { formatDate, formatCurrency, cn, getQualityLabel, getQualityColor } from '@/lib/utils'
import { Collection } from '@/lib/collection-service'

interface RecentCollectionsProps {
  collections?: Collection[]
  showFilters?: boolean
  showActions?: boolean
  limit?: number
  title?: string
  viewAllLink?: string
  onCollectionClick?: (collection: Collection) => void
  onRefresh?: () => void
  autoRefresh?: boolean
}

export default function RecentCollections({
  collections: initialCollections,
  showFilters = true,
  showActions = true,
  limit = 5,
  title = 'Recent Collections',
  viewAllLink,
  onCollectionClick,
  onRefresh,
  autoRefresh = false
}: RecentCollectionsProps) {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>(initialCollections || [])
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(!initialCollections)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'pending' | 'verified' | 'rejected' | 'paid',
    quality: 'all' as 'all' | 'grade1' | 'grade2' | 'grade3',
    dateRange: 'week' as 'today' | 'week' | 'month' | 'all'
  })
  const [sortBy, setSortBy] = useState<'date' | 'weight' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [stats, setStats] = useState({
    totalWeight: 0,
    totalAmount: 0,
    pendingCount: 0,
    averageQuality: 0
  })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchCollections = async () => {
    if (initialCollections) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await collectionService.getCollections({
        limit,
        status: filters.status !== 'all' ? filters.status : undefined
      })
      
      setCollections(response.collections || [])
    } catch (err: any) {
      console.error('Failed to fetch collections:', err)
      setError('Failed to load collections')
      
      // Fallback mock data for development
      setCollections(generateMockCollections())
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockCollections = (): Collection[] => {
    const mockCollections: Collection[] = []
    const now = new Date()
    
    for (let i = 0; i < limit; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      const weight = Math.floor(Math.random() * 50) + 10
      const quality = i % 3 === 0 ? 'grade1' : i % 3 === 1 ? 'grade2' : 'grade3'
      const pricePerKg = quality === 'grade1' ? 25 : quality === 'grade2' ? 20 : 15
      const totalAmount = weight * pricePerKg
      const statuses: Array<'pending' | 'verified' | 'rejected' | 'paid'> = ['pending', 'verified', 'rejected', 'paid']
      const status = statuses[i % 4]
      
      mockCollections.push({
        _id: `mock-${i}`,
        collectionId: `COL${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(i + 1).padStart(3, '0')}`,
        farmer: {
          _id: `farmer-${i}`,
          farmerId: `F${String(1000 + i).padStart(6, '0')}`,
          user: {
            firstName: ['John', 'Mary', 'Peter', 'Sarah', 'James'][i % 5],
            lastName: ['Kamau', 'Wanjiku', 'Omondi', 'Mwangi', 'Kiprop'][i % 5],
            phone: `+2547${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`
          }
        },
        collector: i % 3 === 0 ? {
          _id: `collector-${i}`,
          collectorId: `C${String(500 + i).padStart(6, '0')}`,
          user: {
            firstName: 'David',
            lastName: 'Kariuki',
            phone: '+254712345678'
          }
        } : undefined,
        collectionDate: date.toISOString(),
        weight,
        quality,
        pricePerKg,
        totalAmount,
        imageUrl: i % 4 === 0 ? '/images/tea-sample.jpg' : undefined,
        location: {
          coordinates: {
            lat: -1.2921 + (Math.random() - 0.5) * 0.1,
            lng: 36.8219 + (Math.random() - 0.5) * 0.1
          },
          address: `Farm ${i + 1}, Kiambu County, Kenya`
        },
        status,
        verifiedBy: status === 'verified' || status === 'rejected' ? {
          _id: 'admin-1',
          firstName: 'Admin',
          lastName: 'User'
        } : undefined,
        verificationDate: status === 'verified' || status === 'rejected' ? 
          new Date(date.getTime() + 3600000).toISOString() : undefined,
        notes: i % 5 === 0 ? 'Excellent quality, well processed leaves' : undefined,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString()
      })
    }
    
    return mockCollections
  }

  useEffect(() => {
    fetchCollections()
    
    let intervalId: NodeJS.Timeout
    if (autoRefresh) {
      intervalId = setInterval(fetchCollections, 30000) // Refresh every 30 seconds
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [autoRefresh])

  useEffect(() => {
    if (!collections.length) return
    
    // Apply filters
    let filtered = [...collections]
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status)
    }
    
    // Quality filter
    if (filters.quality !== 'all') {
      filtered = filtered.filter(c => c.quality === filters.quality)
    }
    
    // Date range filter
    const now = new Date()
    let startDate = new Date(0)
    
    switch (filters.dateRange) {
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
    
    if (filters.dateRange !== 'all') {
      filtered = filtered.filter(c => 
        new Date(c.collectionDate) >= startDate
      )
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.collectionDate).getTime()
          bValue = new Date(b.collectionDate).getTime()
          break
        case 'weight':
          aValue = a.weight
          bValue = b.weight
          break
        case 'amount':
          aValue = a.totalAmount
          bValue = b.totalAmount
          break
        default:
          aValue = new Date(a.collectionDate).getTime()
          bValue = new Date(b.collectionDate).getTime()
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    setFilteredCollections(filtered.slice(0, limit))
    
    // Calculate stats
    const totalWeight = filtered.reduce((sum, c) => sum + c.weight, 0)
    const totalAmount = filtered.reduce((sum, c) => sum + c.totalAmount, 0)
    const pendingCount = filtered.filter(c => c.status === 'pending').length
    const qualityScores = filtered.map(c => c.quality === 'grade1' ? 3 : c.quality === 'grade2' ? 2 : 1)
    const averageQuality = qualityScores.length > 0 
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
      : 0
    
    setStats({
      totalWeight,
      totalAmount,
      pendingCount,
      averageQuality
    })
  }, [collections, filters, sortBy, sortOrder, limit])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="text-green-500" size={16} />
      case 'rejected':
        return <XCircle className="text-red-500" size={16} />
      case 'paid':
        return <CheckCircle className="text-blue-500" size={16} />
      default:
        return <Clock className="text-yellow-500" size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getQualityIcon = (quality: string) => {
    const stars = quality === 'grade1' ? 3 : quality === 'grade2' ? 2 : 1
    return (
      <div className="flex items-center">
        {[...Array(3)].map((_, i) => (
          <Star
            key={i}
            size={12}
            className={i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
          />
        ))}
      </div>
    )
  }

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: status as any
    }))
  }

  const handleQualityFilter = (quality: string) => {
    setFilters(prev => ({
      ...prev,
      quality: quality as any
    }))
  }

  const handleDateRangeFilter = (range: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range as any
    }))
  }

  const handleSort = (field: 'date' | 'weight' | 'amount') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      fetchCollections()
    }
  }

  const handleExport = () => {
    const csvContent = [
      ['Collection ID', 'Farmer', 'Date', 'Weight (kg)', 'Quality', 'Amount', 'Status', 'Location'],
      ...filteredCollections.map(c => [
        c.collectionId,
        `${c.farmer?.user?.firstName} ${c.farmer?.user?.lastName}`,
        formatDate(c.collectionDate),
        c.weight,
        getQualityLabel(c.quality),
        formatCurrency(c.totalAmount),
        c.status,
        c.location.address
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `collections_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
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
                <div className="h-10 w-10 bg-gray-200 rounded-lg" />
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

  if (!filteredCollections.length) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Package className="text-gray-400" size={20} />
        </div>
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">No collections found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your filters or record a new collection
          </p>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="inline-block mt-4 text-tea-600 hover:text-tea-700 font-medium"
            >
              View all collections →
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Package className="text-tea-600" size={24} />
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-gray-600">
              {filteredCollections.length} collections • {stats.totalWeight.toFixed(1)} kg total
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

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Weight</span>
                <Scale className="text-blue-600" size={16} />
              </div>
              <p className="text-lg font-bold mt-1">{stats.totalWeight.toFixed(1)} kg</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Value</span>
                <TrendingUp className="text-green-600" size={16} />
              </div>
              <p className="text-lg font-bold mt-1">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <Clock className="text-yellow-600" size={16} />
              </div>
              <p className="text-lg font-bold mt-1">{stats.pendingCount}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Quality</span>
                <Star className="text-purple-600" size={16} />
              </div>
              <p className="text-lg font-bold mt-1">
                {stats.averageQuality.toFixed(1)}/3
              </p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            {/* Status Filters */}
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              {['all', 'pending', 'verified', 'rejected', 'paid'].map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm transition-colors capitalize',
                    filters.status === status
                      ? 'bg-tea-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {status === 'all' ? 'All Status' : status}
                </button>
              ))}
            </div>

            {/* Quality Filters */}
            <div className="flex items-center space-x-2">
              {['all', 'grade1', 'grade2', 'grade3'].map(quality => (
                <button
                  key={quality}
                  onClick={() => handleQualityFilter(quality)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1',
                    filters.quality === quality
                      ? getQualityColor(quality)
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {quality !== 'all' && getQualityIcon(quality)}
                  <span>{quality === 'all' ? 'All Quality' : getQualityLabel(quality)}</span>
                </button>
              ))}
            </div>

            {/* Date Range Filters */}
            <div className="flex items-center space-x-2">
              {(['today', 'week', 'month', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => handleDateRangeFilter(range)}
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

      {/* Collections List */}
      <div className="space-y-4">
        {filteredCollections.map(collection => (
          <div
            key={collection._id}
            className={cn(
              'border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer',
              expandedId === collection._id && 'bg-gray-50'
            )}
            onClick={() => onCollectionClick?.(collection)}
          >
            <div className="flex items-start space-x-3">
              {/* Collection Icon/Image */}
              <div className="relative">
                {collection.imageUrl ? (
                  <img
                    src={collection.imageUrl}
                    alt="Collection"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-tea-100 rounded-lg flex items-center justify-center">
                    <Package className="text-tea-600" size={24} />
                  </div>
                )}
                <div className="absolute -top-1 -right-1">
                  {getStatusIcon(collection.status)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{collection.collectionId}</h3>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(collection.status)
                      )}>
                        {collection.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                      <Calendar size={14} />
                      <span>{formatDate(collection.collectionDate)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-tea-600">
                      {formatCurrency(collection.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {collection.weight} kg • {getQualityLabel(collection.quality)}
                    </p>
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="text-gray-400" size={14} />
                      <div>
                        <p className="font-medium">
                          {collection.farmer?.user?.firstName} {collection.farmer?.user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {collection.farmer?.farmerId}
                        </p>
                      </div>
                    </div>
                    {collection.collector && (
                      <div className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        <span className="text-sm text-gray-600">
                          Collector: {collection.collector.user.firstName}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpand(collection._id)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                {/* Location */}
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span className="truncate">{collection.location.address}</span>
                </div>

                {/* Expanded Details */}
                {expandedId === collection._id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Details */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Collection Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price per kg:</span>
                            <span className="font-medium">
                              {formatCurrency(collection.pricePerKg)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recorded:</span>
                            <span>{formatDate(collection.createdAt)}</span>
                          </div>
                          {collection.verifiedBy && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Verified by:</span>
                              <span>
                                {collection.verifiedBy.firstName} {collection.verifiedBy.lastName}
                              </span>
                            </div>
                          )}
                          {collection.verificationDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Verified on:</span>
                              <span>{formatDate(collection.verificationDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {showActions && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/dashboard/collections/${collection._id}`)
                              }}
                              className="flex-1 px-3 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors text-sm"
                            >
                              View Details
                            </button>
                            {collection.status === 'pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle verification
                                }}
                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Verify
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {collection.notes && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {collection.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t">
        <div className="text-sm text-gray-600">
          Showing {filteredCollections.length} of {collections.length} collections
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
          >
            <Download size={16} />
            <span>Export</span>
          </button>
          <button
            onClick={() => router.push('/dashboard/record-collection')}
            className="px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors text-sm"
          >
            Record New Collection
          </button>
        </div>
      </div>
    </div>
  )
}