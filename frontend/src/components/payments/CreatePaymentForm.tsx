'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Users,
  Calendar,
  DollarSign,
  Smartphone,
  Building,
  Wallet,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { paymentService, PaymentData } from '@/lib/payment-service'
import { collectionService } from '@/lib/collection-service'
import { formatCurrency } from '@/lib/utils'

const paymentSchema = z.object({
  farmer: z.string().min(1, 'Farmer is required'),
  collections: z.array(z.string()).min(1, 'At least one collection is required'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(['mpesa', 'bank_transfer', 'cash'])
})

interface CreatePaymentFormProps {
  onSuccess?: () => void
  initialData?: Partial<PaymentData>
}

export default function CreatePaymentForm({
  onSuccess,
  initialData
}: CreatePaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [farmers, setFarmers] = useState<any[]>([])
  const [selectedFarmer, setSelectedFarmer] = useState<string>('')
  const [availableCollections, setAvailableCollections] = useState<any[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [totalAmount, setTotalAmount] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'mpesa',
      ...initialData
    }
  })

  const paymentMethod = watch('paymentMethod')

  useEffect(() => {
    fetchFarmers()
  }, [])

  useEffect(() => {
    if (selectedFarmer) {
      fetchFarmerCollections(selectedFarmer)
    }
  }, [selectedFarmer])

  useEffect(() => {
    calculateTotal()
  }, [selectedCollections, availableCollections])

  const fetchFarmers = async () => {
    try {
      // In production, fetch from farmers endpoint
      const response = await paymentService.getPayments({ limit: 1 })
      // Mock data for demo
      setFarmers([
        { _id: '1', farmerId: 'F000001', user: { firstName: 'John', lastName: 'Kamau', phone: '+254712345678' } },
        { _id: '2', farmerId: 'F000002', user: { firstName: 'Mary', lastName: 'Wanjiku', phone: '+254723456789' } },
      ])
    } catch (error) {
      console.error('Failed to fetch farmers:', error)
    }
  }

  const fetchFarmerCollections = async (farmerId: string) => {
    try {
      const response = await collectionService.getFarmerCollections(farmerId)
      const pendingCollections = response.collections?.filter((c: any) =>
        c.status === 'verified' || c.status === 'pending'
      ) || []
      setAvailableCollections(pendingCollections)
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    }
  }

  const calculateTotal = () => {
    const total = selectedCollections.reduce((sum, collectionId) => {
      const collection = availableCollections.find(c => c._id === collectionId)
      return sum + (collection?.totalAmount || 0)
    }, 0)
    setTotalAmount(total)
  }

  const handleFarmerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const farmerId = e.target.value
    setSelectedFarmer(farmerId)
    setValue('farmer', farmerId)
    setSelectedCollections([])
    setValue('collections', [])
  }

  const toggleCollection = (collectionId: string) => {
    let newSelected: string[]
    if (selectedCollections.includes(collectionId)) {
      newSelected = selectedCollections.filter(id => id !== collectionId)
    } else {
      newSelected = [...selectedCollections, collectionId]
    }
    setSelectedCollections(newSelected)
    setValue('collections', newSelected)
  }

  const onSubmit = async (data: PaymentData) => {
    setIsSubmitting(true)

    try {
      await paymentService.createPayment(data)

      if (onSuccess) {
        onSuccess()
      }

      alert('Payment created successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to create payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Create New Payment</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Farmer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Farmer
            </label>
            <div className="relative">
              <select
                value={selectedFarmer}
                onChange={handleFarmerChange}
                className="input-field pl-10"
              >
                <option value="">Select a farmer</option>
                {farmers.map(farmer => (
                  <option key={farmer._id} value={farmer._id}>
                    {farmer.farmerId} - {farmer.user.firstName} {farmer.user.lastName}
                  </option>
                ))}
              </select>
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            {errors.farmer && (
              <p className="mt-1 text-sm text-red-600">{errors.farmer.message}</p>
            )}
          </div>

          {/* Collections Selection */}
          {selectedFarmer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Collections to Pay
              </label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {availableCollections.length > 0 ? (
                  <div className="space-y-3">
                    {availableCollections.map((collection) => (
                      <label
                        key={collection._id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${selectedCollections.includes(collection._id)
                            ? 'border-tea-500 bg-tea-50'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCollections.includes(collection._id)}
                            onChange={() => toggleCollection(collection._id)}
                            className="h-4 w-4 text-tea-600 rounded"
                          />
                          <div>
                            <p className="font-medium">{collection.collectionId}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(collection.collectionDate)} • {collection.weight}kg • {formatCurrency(collection.totalAmount)}
                            </p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${collection.status === 'verified'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {collection.status}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No collections available for payment
                  </p>
                )}
              </div>
              {errors.collections && (
                <p className="mt-1 text-sm text-red-600">{errors.collections.message}</p>
              )}
            </div>
          )}

          {/* Total Amount Display */}
          {selectedCollections.length > 0 && (
            <div className="bg-tea-50 border border-tea-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-tea-700">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{selectedCollections.length} collections</p>
                  <p className="text-tea-600 font-medium">Ready for payment</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register('paymentDate')}
                  className="input-field pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {errors.paymentDate && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentDate.message}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'mpesa', icon: Smartphone, label: 'M-Pesa', color: 'bg-green-100 text-green-800 border-green-300' },
                  { value: 'bank_transfer', icon: Building, label: 'Bank', color: 'bg-blue-100 text-blue-800 border-blue-300' },
                  { value: 'cash', icon: Wallet, label: 'Cash', color: 'bg-gray-100 text-gray-800 border-gray-300' }
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`cursor-pointer border-2 rounded-lg p-4 flex flex-col items-center justify-center space-y-2 transition-all ${paymentMethod === method.value
                        ? method.color
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value={method.value}
                      className="hidden"
                    />
                    <method.icon size={24} />
                    <span className="text-sm font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
              )}
            </div>
          </div>

          {/* Payment Method Details */}
          {paymentMethod === 'mpesa' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Smartphone className="text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-800">M-Pesa Payment Instructions</h4>
                  <ul className="mt-2 space-y-1 text-sm text-blue-700">
                    <li>• Payment will be initiated via STK Push</li>
                    <li>• Ensure the farmer's phone is switched on</li>
                    <li>• Farmer will receive a prompt to enter PIN</li>
                    <li>• Transaction will be completed automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Reference Number
              </label>
              <input
                type="text"
                placeholder="Enter bank reference number"
                className="input-field"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => {
                setSelectedFarmer('')
                setSelectedCollections([])
                setValue('farmer', '')
                setValue('collections', [])
              }}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedCollections.length === 0}
              className="px-6 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Payment...</span>
                </span>
              ) : (
                'Create Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}