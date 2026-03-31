'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  X, 
  DollarSign, 
  User, 
  Calendar, 
  Smartphone,
  Building,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Receipt,
  RefreshCw
} from 'lucide-react'
import { Payment, paymentService } from '@/lib/payment-service'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PaymentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  payment: Payment | null
  onRefresh?: () => void
}

export default function PaymentDetailModal({
  isOpen,
  onClose,
  payment,
  onRefresh
}: PaymentDetailModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showMpesaForm, setShowMpesaForm] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [mpesaLoading, setMpesaLoading] = useState(false)

  if (!payment) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={24} />
      case 'failed':
        return <XCircle className="text-red-500" size={24} />
      case 'processing':
        return <RefreshCw className="text-blue-500 animate-spin" size={24} />
      default:
        return <Clock className="text-yellow-500" size={24} />
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'mpesa':
        return <Smartphone className="text-green-600" />
      case 'bank_transfer':
        return <Building className="text-blue-600" />
      case 'cash':
        return <Wallet className="text-gray-600" />
      default:
        return <CreditCard />
    }
  }

  const handleCompletePayment = async () => {
    if (!confirm('Mark this payment as completed?')) return
    
    setIsProcessing(true)
    try {
      await paymentService.processPayment(payment._id, 'completed')
      alert('Payment marked as completed!')
      onRefresh?.()
      onClose()
    } catch (error) {
      alert('Failed to update payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInitiateMpesa = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid phone number')
      return
    }

    setMpesaLoading(true)
    try {
      await paymentService.initiateMpesaPayment(payment._id, phoneNumber)
      alert('M-Pesa payment initiated! Please check the farmer\'s phone.')
      setShowMpesaForm(false)
      onRefresh?.()
    } catch (error: any) {
      alert(error.message || 'Failed to initiate M-Pesa payment')
    } finally {
      setMpesaLoading(false)
    }
  }

  const handleRetryPayment = async () => {
    if (payment.paymentMethod === 'mpesa') {
      setShowMpesaForm(true)
    } else {
      handleCompletePayment()
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
                    <DollarSign className="text-tea-600" size={24} />
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Payment Details
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        ID: {payment.paymentId}
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
                  {/* Left Column - Payment Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(payment.status)}
                          <div>
                            <h4 className="font-semibold">Payment Status</h4>
                            <p className="text-sm text-gray-600 capitalize">{payment.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Processed by</p>
                          <p className="font-medium">
                            {payment.processedBy?.firstName} {payment.processedBy?.lastName}
                          </p>
                        </div>
                      </div>
                      
                      {/* Payment Actions */}
                      {payment.status === 'pending' && (
                        <div className="mt-4 space-y-3">
                          {payment.paymentMethod === 'mpesa' && !showMpesaForm ? (
                            <button
                              onClick={() => setShowMpesaForm(true)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                              Initiate M-Pesa Payment
                            </button>
                          ) : null}
                          
                          {payment.paymentMethod === 'mpesa' && showMpesaForm ? (
                            <div className="space-y-3">
                              <input
                                type="tel"
                                placeholder="Enter farmer's phone number (e.g., 0712345678)"
                                className="input-field"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleInitiateMpesa}
                                  disabled={mpesaLoading}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {mpesaLoading ? 'Initiating...' : 'Send Payment Request'}
                                </button>
                                <button
                                  onClick={() => setShowMpesaForm(false)}
                                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}
                          
                          {payment.paymentMethod !== 'mpesa' && (
                            <button
                              onClick={handleCompletePayment}
                              disabled={isProcessing}
                              className="w-full bg-tea-600 hover:bg-tea-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isProcessing ? 'Processing...' : 'Mark as Completed'}
                            </button>
                          )}
                        </div>
                      )}
                      
                      {payment.status === 'failed' && (
                        <div className="mt-4">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800">
                              <strong>Failure Reason:</strong> {payment.failureReason || 'Unknown error'}
                            </p>
                          </div>
                          <button
                            onClick={handleRetryPayment}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                          >
                            Retry Payment
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Payment Information */}
                    <div className="card">
                      <h4 className="font-semibold mb-4">Payment Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Farmer</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <User size={16} className="text-gray-400" />
                            <p className="font-medium">
                              {payment.farmer?.user?.firstName} {payment.farmer?.user?.lastName}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{payment.farmer?.farmerId}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Phone Number</label>
                          <p className="font-medium mt-1">{payment.farmer?.user?.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Payment Date</label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar size={16} className="text-gray-400" />
                            <p className="font-medium">{formatDate(payment.paymentDate)}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Payment Method</label>
                          <div className="flex items-center space-x-2 mt-1">
                            {getMethodIcon(payment.paymentMethod)}
                            <p className="font-medium capitalize">
                              {payment.paymentMethod.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Collections Included */}
                    <div className="card">
                      <h4 className="font-semibold mb-4">Collections Included</h4>
                      <div className="space-y-3">
                        {payment.collections.map((collection) => (
                          <div key={collection._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{collection.collectionId}</p>
                              <p className="text-sm text-gray-600">
                                {collection.weight}kg • {collection.quality.toUpperCase()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(collection.totalAmount)}</p>
                              <p className="text-xs text-gray-600">
                                {formatCurrency(collection.totalAmount / collection.weight)}/kg
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reference Information */}
                    {(payment.mpesaReference || payment.bankReference) && (
                      <div className="card">
                        <h4 className="font-semibold mb-4">Reference Information</h4>
                        <div className="space-y-2">
                          {payment.mpesaReference && (
                            <div className="flex items-center space-x-2">
                              <Smartphone size={16} className="text-green-600" />
                              <div>
                                <p className="text-sm text-gray-600">M-Pesa Reference</p>
                                <p className="font-medium">{payment.mpesaReference}</p>
                              </div>
                            </div>
                          )}
                          {payment.bankReference && (
                            <div className="flex items-center space-x-2">
                              <Building size={16} className="text-blue-600" />
                              <div>
                                <p className="text-sm text-gray-600">Bank Reference</p>
                                <p className="font-medium">{payment.bankReference}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Summary & Actions */}
                  <div className="space-y-6">
                    {/* Total Amount Card */}
                    <div className="card bg-gradient-to-r from-tea-50 to-green-50">
                      <h4 className="font-semibold mb-4">Payment Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="text-3xl font-bold text-tea-600">
                            {formatCurrency(payment.totalAmount)}
                          </span>
                        </div>
                        <div className="pt-3 border-t">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Collections</span>
                            <span>{payment.collections.length}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Created On</span>
                            <span>{formatDate(payment.createdAt)}</span>
                          </div>
                          {payment.processedAt && (
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-600">Processed On</span>
                              <span>{formatDate(payment.processedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card">
                      <h4 className="font-semibold mb-4">Quick Actions</h4>
                      <div className="space-y-2">
                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                          <Receipt size={18} />
                          <span>Generate Receipt</span>
                        </button>
                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                          <CreditCard size={18} />
                          <span>View Transaction History</span>
                        </button>
                        <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                          <User size={18} />
                          <span>View Farmer Profile</span>
                        </button>
                      </div>
                    </div>

                    {/* Payment History */}
                    <div className="card">
                      <h4 className="font-semibold mb-4">Recent Activity</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium">Payment Created</p>
                            <p className="text-xs text-gray-600">by System Admin</p>
                            <p className="text-xs text-gray-500">{formatDate(payment.createdAt)}</p>
                          </div>
                        </div>
                        {payment.processedAt && (
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm font-medium">Payment Processed</p>
                              <p className="text-xs text-gray-600">by {payment.processedBy?.firstName}</p>
                              <p className="text-xs text-gray-500">{formatDate(payment.processedAt)}</p>
                            </div>
                          </div>
                        )}
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