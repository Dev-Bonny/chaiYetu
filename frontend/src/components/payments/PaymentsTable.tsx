'use client'

import { useState } from 'react'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  Smartphone,
  Building,
  Wallet,
  Filter,
  Download,
  Search,
  MoreVertical
} from 'lucide-react'
import { Payment } from '@/lib/payment-service'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PaymentsTableProps {
  payments: Payment[]
  onView: (payment: Payment) => void
  onProcess?: (payment: Payment) => void
  onRetry?: (payment: Payment) => void
  showActions?: boolean
}

export default function PaymentsTable({ 
  payments, 
  onView, 
  onProcess,
  onRetry,
  showActions = true 
}: PaymentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border border-blue-200',
      completed: 'bg-green-100 text-green-800 border border-green-200',
      failed: 'bg-red-100 text-red-800 border border-red-200'
    }

    const icons = {
      pending: <Clock size={14} />,
      processing: <Clock size={14} />,
      completed: <CheckCircle size={14} />,
      failed: <XCircle size={14} />
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status as keyof typeof variants]}`}>
        {icons[status as keyof typeof icons]}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    )
  }

  const getMethodBadge = (method: string) => {
    const variants = {
      mpesa: 'bg-green-50 text-green-700 border border-green-200',
      bank_transfer: 'bg-blue-50 text-blue-700 border border-blue-200',
      cash: 'bg-gray-50 text-gray-700 border border-gray-200'
    }

    const icons = {
      mpesa: <Smartphone size={14} />,
      bank_transfer: <Building size={14} />,
      cash: <Wallet size={14} />
    }

    const labels = {
      mpesa: 'M-Pesa',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${variants[method as keyof typeof variants]}`}>
        {icons[method as keyof typeof icons]}
        <span className="ml-1">{labels[method as keyof typeof labels]}</span>
      </span>
    )
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.farmer?.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.farmer?.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.mpesaReference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
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
                placeholder="Search payments..."
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
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tea-500"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                <option value="all">All Methods</option>
                <option value="mpesa">M-Pesa</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
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
                Payment ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Farmer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
              {showActions && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.paymentId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.farmer?.user?.firstName} {payment.farmer?.user?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.farmer?.farmerId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(payment.paymentDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(payment.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {payment.collections.length} collections
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getMethodBadge(payment.paymentMethod)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.mpesaReference || payment.bankReference || '-'}
                    </div>
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onView(payment)}
                          className="text-tea-600 hover:text-tea-900"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {payment.status === 'pending' && onProcess && (
                          <button
                            onClick={() => onProcess(payment)}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                            title="Process Payment"
                          >
                            Process
                          </button>
                        )}
                        
                        {payment.status === 'failed' && onRetry && (
                          <button
                            onClick={() => onRetry(payment)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            title="Retry Payment"
                          >
                            Retry
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
                    No payments found
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
          Showing {filteredPayments.length} of {payments.length} payments
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