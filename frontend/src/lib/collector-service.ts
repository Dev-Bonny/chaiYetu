import { apiClient } from './api'

export interface CollectorData {
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }
  assignedArea: {
    county: string
    subCounty: string
    wards: string[]
  }
  vehicleDetails?: {
    type: string
    registration: string
    capacity: number
  }
}

class CollectorService {
  async createCollector(data: CollectorData) {
    return apiClient.post('/api/v1/collectors', data)
  }

  async getCollectors(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value))
      })
    }
    
    return apiClient.get(`/api/v1/collectors?${queryParams.toString()}`)
  }

  async getCollectorById(id: string) {
    return apiClient.get(`/api/v1/collectors/${id}`)
  }

  async updateCollector(id: string, data: Partial<CollectorData>) {
    return apiClient.put(`/api/v1/collectors/${id}`, data)
  }

  async assignFarmer(collectorId: string, farmerId: string) {
    return apiClient.post(`/api/v1/collectors/${collectorId}/assign-farmer`, { farmerId })
  }

  async getAssignedFarmers(collectorId: string) {
    return apiClient.get(`/api/v1/collectors/${collectorId}/farmers`)
  }

  async getCollectorCollections(collectorId: string) {
    return apiClient.get(`/api/v1/collectors/${collectorId}/collections`)
  }
}

export const collectorService = new CollectorService()