import { apiClient } from './api'

export interface CollectionData {
  farmer: string
  collectionDate: string
  weight: number
  quality: 'grade1' | 'grade2' | 'grade3'
  location: {
    coordinates: {
      lat: number
      lng: number
    }
    address: string
  }
  notes?: string
  image?: File
}

export interface Collection {
  _id: string
  collectionId: string
  farmer: {
    _id: string
    farmerId: string
    user: {
      firstName: string
      lastName: string
      phone: string
    }
  }
  collector?: {
    _id: string
    collectorId: string
    user: {
      firstName: string
      lastName: string
    }
  }
  collectionDate: string
  weight: number
  quality: 'grade1' | 'grade2' | 'grade3'
  pricePerKg: number
  totalAmount: number
  imageUrl?: string
  location: {
    coordinates: {
      lat: number
      lng: number
    }
    address: string
  }
  status: 'pending' | 'verified' | 'rejected' | 'paid'
  verifiedBy?: any
  verificationDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

class CollectionService {
  async createCollection(collectionData: CollectionData) {
    const formData = new FormData()

    // Append all fields to formData, skipping undefined/null values
    Object.entries(collectionData).forEach(([key, value]) => {
      // Skip undefined or null values
      if (value === undefined || value === null) {
        return
      }

      if (key === 'image' && value instanceof File) {
        formData.append('image', value)
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    })

    return apiClient.post('/api/v1/collections', formData)
  }

  async getCollections(params?: {
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

    return apiClient.get(`/api/v1/collections?${queryParams.toString()}`)
  }

  async getCollectionById(id: string) {
    return apiClient.get(`/api/v1/collections/${id}`)
  }

  async updateCollection(id: string, data: Partial<CollectionData>) {
    return apiClient.put(`/api/v1/collections/${id}`, data)
  }

  async verifyCollection(id: string, status: 'verified' | 'rejected', notes?: string) {
    return apiClient.patch(`/api/v1/collections/${id}/verify`, { status, notes })
  }

  async getFarmerCollections(farmerId: string, params?: {
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value))
      })
    }

    return apiClient.get(`/api/v1/collections/farmer/${farmerId}?${queryParams.toString()}`)
  }

  async getSummary() {
    return apiClient.get('/api/v1/collections/summary')
  }

  async getQualityStats() {
    return apiClient.get('/api/v1/collections/quality-stats')
  }
}

export const collectionService = new CollectionService()