'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  X, 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Camera
} from 'lucide-react'
import { Collection } from '@/lib/collection-service'
import { formatCurrency, formatDate } from '@/lib/utils'

interface CollectionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  collection: Collection | null
  onVerify?: (status: 'verified' | 'rejected', notes?: string) => void
}

export default function CollectionDetailModal({
  isOpen,
  onClose,
  collection,
  onVerify
}: CollectionDetailModalProps) {
  if (!collection) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="text-green-500" size={24} />
      case 'rejected':
        return <XCircle className="text-red-500" size={24} />
      case 'paid':
        return <DollarSign className="text-blue-500" size={24} />
      default:
        return <Clock className="text-yellow-500" size={24} />
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'grade1':
        return 'text-green-600 bg-green-100'
      case 'grade2':
        return 'text-yellow-600 bg-yellow-100'
      case 'grade3':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Package className="text-tea-600" size={24} />
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Collection Details
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        ID: {collection.collectionId}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Collection Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(collection.status)}
                          <div>
                            <h4 className="font-semibold">Collection Status</h4>
                            <p className="text-sm text-gray-600 capitalize">{collection.status}</p>
                          </div>
                        </div>
                        {collection.verifiedBy && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Verified by</p>
                            <p className="font-medium">
                              {collection.verifiedBy?.firstName} {collection.verifiedBy?.lastName}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="card">
                      <h4 className="font-semibold mb-4">Collection Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Farmer</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <User size={16} className="text-gray-400" />
                            <p className="font-medium">
                              {collection.farmer?.user?.firstName} {collection.farmer?.user?.lastName}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Farmer ID</label>
                          <p className="font-medium mt-1">{collection.farmer?.farmerId}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Collection Date</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar size={16} className="text-gray-400" />
                            <p className="font-medium">{formatDate(collection.collectionDate)}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Recorded On</label>
                          <p className="font-medium mt-1">{formatDate(collection.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quality & Weight */}
                    <div className="card">
                      <h4 className="font-semibold mb-4">Tea Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Weight</label>
                          <p className="text-2xl font-bold mt-1">{collection.weight} kg</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Quality</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`px-3 py-1 rounded-full ${getQualityColor(collection.quality)}`}>
                              <span className="flex items-center space-x-1">
                                <Star size={14} />
                                <span className="font-medium">
                                  {collection.quality.toUpperCase().replace('GRADE', 'Grade ')}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Price per kg</label>
                          <p className="text-xl font-bold mt-1">
                            {formatCurrency(collection.pricePerKg)}/kg
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="card">
                      <h4 className="font-semibold mb-4">Location Information</h4>
                      <div className="flex items-start space-x-3">
                        <MapPin className="text-gray-400 mt-1" />
                        <div>
                          <p className="font-medium">{collection.location.address}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Coordinates: {collection.location.coordinates.lat.toFixed(6)}, {collection.location.coordinates.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {collection.notes && (
                      <div className="card">
                        <h4 className="font-semibold mb-4">Additional Notes</h4>
                        <p className="text-gray-700">{collection.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Payment & Actions */}
                  <div className="space-y-6">
                    {/* Payment Summary */}
                    <div className="card bg-gradient-to-r from-tea-50 to-green-50">
                      <h4 className="font-semibold mb-4">Payment Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Weight</span>
                          <span className="font-medium">{collection.weight} kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Rate</span>
                          <span className="font-medium">{formatCurrency(collection.pricePerKg)}/kg</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Total Amount</span>
                            <span className="text-2xl font-bold text-tea-600">
                              {formatCurrency(collection.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {collection.imageUrl && (
                      <div className="card">
                        <h4 className="font-semibold mb-4 flex items-center space-x-2">
                          <Camera size={18} />
                          <span>Collection Photo</span>
                        </h4>
                        <img
                          src={collection.imageUrl}
                          alt="Collection"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Verification Actions */}
                    {onVerify && collection.status === 'pending' && (
                      <div className="card">
                        <h4 className="font-semibold mb-4">Verification Actions</h4>
                        <div className="space-y-3">
                          <button
                            onClick={() => onVerify('verified')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            Verify Collection
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Please provide reason for rejection:')
                              if (notes) onVerify('rejected', notes)
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            Reject Collection
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Additional Actions */}
                    <div className="card">
                      <h4 className="font-semibold mb-4">Quick Actions</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg">
                          View Farmer Profile
                        </button>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg">
                          Generate Receipt
                        </button>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-red-600">
                          Flag for Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}