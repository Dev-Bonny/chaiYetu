'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Download } from 'lucide-react'
import CollectionsTable from '@/components/collections/CollectionsTable'
import CollectionDetailModal from '@/components/collections/CollectionDetailModal'
import RecordCollectionForm from '@/components/collections/RecordCollectionForm'
import { collectionService, Collection } from '@/lib/collection-service'
import { useAuth } from '@/lib/auth-context'

export default function CollectionsPage() {
  const { user } = useAuth()
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'record'>('list')
  const [stats, setStats] = useState<any>(null)

  // Only collectors, admins, and factory managers can verify
  const canVerify = user?.role && ['collector', 'admin', 'factory_manager'].includes(user.role)

  useEffect(() => {
    fetchCollections()
    fetchStats()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await collectionService.getCollections({ limit: 50 })
      if (response && response.data && response.data.collections) {
        setCollections(response.data.collections)
      } else if (response && response.collections) {
        setCollections(response.collections)
      } else {
        setCollections([])
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await collectionService.getSummary()
      if (response && response.data) {
        setStats(response.data)
      } else {
        setStats(response)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleViewCollection = (collection: Collection) => {
    setSelectedCollection(collection)
  }

  const handleVerifyCollection = async (collectionId: string, status: string, notes?: string) => {
    try {
      await collectionService.verifyCollection(collectionId, status as 'verified' | 'rejected', notes)
      alert(`Collection ${status} successfully!`)
      fetchCollections()
      setSelectedCollection(null)
    } catch (error) {
      alert(`Failed to ${status} collection`)
    }
  }

  const handleCollectionSuccess = () => {
    setViewMode('list')
    fetchCollections()
    fetchStats()
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-gray-600">Manage and track tea collections</p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter size={18} />
            <span>Filters</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setViewMode('record')}
            className="flex items-center space-x-2 px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700"
          >
            <Plus size={18} />
            <span>Record Collection</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Collections</p>
          <p className="text-2xl font-bold">{stats?.totalCollections || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Weight</p>
          <p className="text-2xl font-bold">{stats?.totalWeight || 0} kg</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Pending Verification</p>
          <p className="text-2xl font-bold text-yellow-600">{stats?.pendingVerification || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-2xl font-bold text-green-600">KES {stats?.totalValue || 0}</p>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <CollectionsTable
          collections={collections}
          onView={handleViewCollection}
          onVerify={canVerify ? (collection) => handleVerifyCollection(collection._id, 'verified') : undefined}
          showActions
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Record New Collection</h2>
            <button
              onClick={() => setViewMode('list')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to List
            </button>
          </div>
          <RecordCollectionForm onSuccess={handleCollectionSuccess} />
        </div>
      )}

      {/* Modals */}
      <CollectionDetailModal
        isOpen={!!selectedCollection}
        onClose={() => setSelectedCollection(null)}
        collection={selectedCollection}
        onVerify={canVerify ? (status, notes) => selectedCollection && handleVerifyCollection(selectedCollection._id, status, notes) : undefined}
      />
    </div>
  )
}