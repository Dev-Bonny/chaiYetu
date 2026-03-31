import { apiClient } from './api'

export interface FarmerData {
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }
  location: {
    county: string
    subCounty: string
    ward: string
    village: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  farmSize: number
  teaVariety: string
}

class FarmerService {
  async createFarmer(data: FarmerData) {
    return apiClient.post('/api/v1/farmers', data)
  }

  async getFarmers(params?: {
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
    
    return apiClient.get(`/api/v1/farmers?${queryParams.toString()}`)
  }

  async getFarmerById(id: string) {
    return apiClient.get(`/api/v1/farmers/${id}`)
  }

  async updateFarmer(id: string, data: Partial<FarmerData>) {
    return apiClient.put(`/api/v1/farmers/${id}`, data)
  }

  async deactivateFarmer(id: string) {
    return apiClient.patch(`/api/v1/farmers/${id}/deactivate`)
  }

  async getFarmerCollections(farmerId: string) {
    return apiClient.get(`/api/v1/farmers/${farmerId}/collections`)
  }

  async getFarmerPayments(farmerId: string) {
    return apiClient.get(`/api/v1/farmers/${farmerId}/payments`)
  }
}

export const farmerService = new FarmerService()