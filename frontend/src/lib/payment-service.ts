import { apiClient } from './api'

export interface PaymentData {
  farmer: string
  collections: string[]
  paymentDate: string
  paymentMethod: 'mpesa' | 'bank_transfer' | 'cash'
}

export interface Payment {
  _id: string
  paymentId: string
  farmer: {
    _id: string
    farmerId: string
    user: {
      firstName: string
      lastName: string
      phone: string
    }
  }
  collections: Array<{
    _id: string
    collectionId: string
    weight: number
    quality: string
    totalAmount: number
  }>
  totalAmount: number
  paymentDate: string
  paymentMethod: 'mpesa' | 'bank_transfer' | 'cash'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  mpesaReference?: string
  bankReference?: string
  processedBy: {
    _id: string
    firstName: string
    lastName: string
  }
  processedAt?: string
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentSummary {
  totalPaid: number
  totalPending: number
  totalPayments: number
  recentPayments: Payment[]
  monthlyTrend: Array<{
    month: string
    amount: number
  }>
}

class PaymentService {
  async createPayment(paymentData: PaymentData) {
    return apiClient.post('/api/v1/payments', paymentData)
  }

  async getPayments(params?: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value))
      })
    }
    
    return apiClient.get(`/api/v1/payments?${queryParams.toString()}`)
  }

  async getPaymentById(id: string) {
    return apiClient.get(`/api/v1/payments/${id}`)
  }

  async getPaymentSummary() {
    return apiClient.get('/api/v1/payments/summary')
  }

  async getFarmerPayments(farmerId: string, params?: {
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value))
      })
    }
    
    return apiClient.get(`/api/v1/payments/farmer/${farmerId}?${queryParams.toString()}`)
  }

  async processPayment(id: string, status: 'completed' | 'failed', data?: {
    mpesaReference?: string
    bankReference?: string
    failureReason?: string
  }) {
    return apiClient.post(`/api/v1/payments/${id}/process`, {
      status,
      ...data
    })
  }

  async initiateMpesaPayment(paymentId: string, phoneNumber: string) {
    return apiClient.post('/api/v1/payments/mpesa/initiate', {
      paymentId,
      phoneNumber
    })
  }

  async getRevenueTrend(days: number = 30) {
    return apiClient.get(`/api/v1/payments/revenue-trend?days=${days}`)
  }
}

export const paymentService = new PaymentService()