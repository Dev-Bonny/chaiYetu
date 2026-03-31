'use client'

import { useState } from 'react'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Download,
  MoreVertical,
  Search
} from 'lucide-react'
import { Collection } from '@/lib/collection-service'
import { formatCurrency, formatDate } from '@/lib/utils'

interface CollectionsTableProps {
  collections: Collection[]
  onView: (collection: Collection) => void
  onVerify?: (collection: Collection) => void
  onEdit?: (collection: Collection) => void
  showActions?: boolean
}

export default function CollectionsTable({ 
  collections, 
  onView, 
  onVerify, 
  onEdit,
  showActions = true 
}: CollectionsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [qualityFilter, setQualityFilter] = useState<string>('all')

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-blue-100 text-blue-800'
    }

    const icons = {
      pending: <Clock size={14} />,
      verified: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />,
      paid: <CheckCircle size={14} />
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status as keyof typeof variants]}`}>
        {icons[status as keyof typeof icons]}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    )
  }

  const getQualityBadge = (quality: string) => {
    const variants = {
      grade1: 'bg-green-100 text-green-800 border border-green-200',
      grade2: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      grade3: 'bg-orange-100 text-orange-800 border border-orange-200'
    }

    const labels = {
      grade1: 'Grade 1',
      grade2: 'Grade 2',
      grade3: 'Grade 3'
    }

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${variants[quality as keyof typeof variants]}`}>
        {labels[quality as keyof typeof labels]}
      </span>
    )
  }

  const filteredCollections = collections.filter(collection => {
    const matchesSearch = 
      collection.collectionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.farmer?.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.farmer?.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || collection.status === statusFilter
    const matchesQuality = qualityFilter === 'all' || collection.quality === qualityFilter

    return matchesSearch && matchesStatus && matchesQuality
  })

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Table Header with Filters */}
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search collections..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-tea-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value)}
              >
                <option value="all">All Quality</option>
                <option value="grade1">Grade 1</option>
                <option value="grade2">Grade 2</option>
                <option value="grade3">Grade 3</option>
              </select>
            </div>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors">
              <Download size={18} />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Collection ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Farmer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight (kg)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quality
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {showActions && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCollections.length > 0 ? (
              filteredCollections.map((collection) => (
                <tr key={collection._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {collection.collectionId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {collection.farmer?.user?.firstName} {collection.farmer?.user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {collection.farmer?.farmerId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(collection.collectionDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {collection.weight} kg
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getQualityBadge(collection.quality)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(collection.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(collection.pricePerKg)}/kg
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(collection.status)}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onView(collection)}
                          className="text-tea-600 hover:text-tea-900"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {collection.status === 'pending' && onEdit && (
                          <button
                            onClick={() => onEdit(collection)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            Edit
                          </button>
                        )}
                        
                        {onVerify && collection.status === 'pending' && (
                          <button
                            onClick={() => onVerify(collection)}
                            className="text-green-600 hover:text-green-900"
                            title="Verify"
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showActions ? 8 : 7} className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    No collections found
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-4 border-t flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {filteredCollections.length} of {collections.length} collections
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Previous
          </button>
          <span className="px-3 py-1 bg-tea-600 text-white rounded-md text-sm">
            1
          </span>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}