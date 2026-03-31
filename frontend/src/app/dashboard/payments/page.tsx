'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Download, TrendingUp, BarChart3 } from 'lucide-react'
import PaymentsTable from '@/components/payments/PaymentsTable'
import PaymentDetailModal from '@/components/payments/PaymentDetailModal'
import CreatePaymentForm from '@/components/payments/CreatePaymentForm'
import RevenueChart from '@/components/charts/RevenueChart'
import { paymentService, Payment, PaymentSummary } from '@/lib/payment-service'
import { formatCurrency } from '@/lib/utils'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list')
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    completedPayments: 0,
    failedPayments: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [paymentsData, summaryData, revenueData] = await Promise.all([
        paymentService.getPayments({ limit: 50 }),
        paymentService.getPaymentSummary(),
        paymentService.getRevenueTrend(30)
      ])

      setPayments(paymentsData.payments || [])
      setSummary(summaryData)
      setRevenueData(revenueData)
      
      // Calculate stats
      const completed = paymentsData.payments?.filter(p => p.status === 'completed') || []
      const failed = paymentsData.payments?.filter(p => p.status === 'failed') || []
      const pending = paymentsData.payments?.filter(p => p.status === 'pending') || []
      
      setStats({
        totalPaid: completed.reduce((sum, p) => sum + p.totalAmount, 0),
        totalPending: pending.reduce((sum, p) => sum + p.totalAmount, 0),
        completedPayments: completed.length,
        failedPayments: failed.length
      })
    } catch (error) {
      console.error('Failed to fetch payments data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment)
  }

  const handleProcessPayment = async (payment: Payment) => {
    setSelectedPayment(payment)
  }

  const handleRetryPayment = async (payment: Payment) => {
    try {
      await paymentService.processPayment(payment._id, 'pending')
      alert('Payment retry initiated!')
      fetchDashboardData()
    } catch (error) {
      alert('Failed to retry payment')
    }
  }

  const handlePaymentSuccess = () => {
    setViewMode('list')
    fetchDashboardData()
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
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Manage and track tea payments</p>
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
            onClick={() => setViewMode('create')}
            className="flex items-center space-x-2 px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700"
          >
            <Plus size={18} />
            <span>Create Payment</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalPaid)}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.completedPayments} payments</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.totalPending)}
              </p>
            </div>
            <BarChart3 className="text-yellow-500" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Awaiting processing</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.completedPayments}
              </p>
            </div>
            <TrendingUp className="text-blue-500" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Successful payments</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.failedPayments}
              </p>
            </div>
            <BarChart3 className="text-red-500" size={24} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Require attention</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Revenue Trend (Last 30 Days)</h2>
        </div>
        <RevenueChart data={revenueData} />
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <PaymentsTable
          payments={payments}
          onView={handleViewPayment}
          onProcess={handleProcessPayment}
          onRetry={handleRetryPayment}
          showActions
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Create New Payment</h2>
            <button
              onClick={() => setViewMode('list')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to List
            </button>
          </div>
          <CreatePaymentForm onSuccess={handlePaymentSuccess} />
        </div>
      )}

      {/* Modals */}
      <PaymentDetailModal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        payment={selectedPayment}
        onRefresh={fetchDashboardData}
      />
    </div>
  )
}