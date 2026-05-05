import { apiClient } from './api'

export interface FraudFlag {
  type: 'duplicate_entry' | 'weight_spike' | 'suspicious_collector' | 'off_hours_collection'
  severity: 'low' | 'medium' | 'high'
  collectionId: string
  description: string
  collectorId?: string
  farmerId?: string
  detectedAt: string
  data: any
}

export interface ProductionStats {
  totalWeight: number
  totalRevenue: number
  totalCollections: number
  avgWeightPerCollection: number
  gradeBreakdown: { grade1: number; grade2: number; grade3: number }
  statusBreakdown: { pending: number; verified: number; rejected: number; paid: number }
}

export interface TrendPoint {
  date: string
  weight: number
  revenue: number
  collections: number
}

export interface ForecastPoint {
  date: string
  revenue: number
  weight: number
  confidence: number
  lower?: number
  upper?: number
}

class FactoryService {

  async getDashboardStats() {
    return apiClient.get('/api/v1/factory/dashboard')
  }

  async getSystemStats() {
    return apiClient.get('/api/v1/factory/system-stats')
  }

  async getProductionTrend(days = 30) {
    return apiClient.get(`/api/v1/factory/production/trend?days=${days}`)
  }

  async getWeeklyBreakdown(weeks = 12) {
    return apiClient.get(`/api/v1/factory/production/weekly?weeks=${weeks}`)
  }

  async getMonthlyBreakdown(months = 12) {
    return apiClient.get(`/api/v1/factory/production/monthly?months=${months}`)
  }

  async getAllDeliveries(params?: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
    collectorId?: string
    farmerId?: string
    quality?: string
  }) {
    const q = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => { if (v) q.append(k, String(v)) })
    }
    return apiClient.get(`/api/v1/factory/deliveries?${q.toString()}`)
  }

  async auditCollection(id: string, action: 'verified' | 'rejected', notes?: string) {
    return apiClient.patch(`/api/v1/factory/deliveries/${id}/audit`, { action, notes })
  }

  async bulkAudit(collectionIds: string[], action: 'verified' | 'rejected', notes?: string) {
    return apiClient.post('/api/v1/factory/deliveries/bulk-audit', { collectionIds, action, notes })
  }

  async getCollectorPerformance(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }) {
    const q = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => { if (v) q.append(k, String(v)) })
    }
    return apiClient.get(`/api/v1/factory/collectors/performance?${q.toString()}`)
  }

  async getActiveFarmersSummary(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }) {
    const q = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => { if (v) q.append(k, String(v)) })
    }
    return apiClient.get(`/api/v1/factory/farmers/summary?${q.toString()}`)
  }

  async getFraudFlags(params?: {
    limit?: number
    startDate?: string
    endDate?: string
  }) {
    const q = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => { if (v) q.append(k, String(v)) })
    }
    return apiClient.get(`/api/v1/factory/fraud/flags?${q.toString()}`)
  }

  async getRevenueForecast(days = 30) {
    return apiClient.get(`/api/v1/factory/forecast/revenue?days=${days}`)
  }

  async getOutputForecast(days = 30) {
    return apiClient.get(`/api/v1/factory/forecast/output?days=${days}`)
  }

  async getReportData(params?: {
    reportType?: 'daily' | 'weekly' | 'monthly' | 'custom'
    startDate?: string
    endDate?: string
  }) {
    const q = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([k, v]) => { if (v) q.append(k, String(v)) })
    }
    return apiClient.get(`/api/v1/factory/reports?${q.toString()}`)
  }
}

export const factoryService = new FactoryService()