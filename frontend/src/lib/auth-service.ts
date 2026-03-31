import { apiClient } from './api'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: 'farmer' | 'collector' | 'admin' | 'factory_manager'
  farmerProfile?: any
  collectorProfile?: any
}

class AuthService {
  async login(loginData: LoginData) {
    return apiClient.post('/api/v1/auth/login', loginData)
  }

  async register(registerData: RegisterData) {
    return apiClient.post('/api/v1/auth/register', registerData)
  }

  async getCurrentUser() {
    return apiClient.get('/api/v1/users/profile')
  }

  async logout() {
    // Client-side cleanup
    localStorage.removeItem('token')
  }

  async forgotPassword(email: string) {
    return apiClient.post('/api/v1/auth/forgot-password', { email })
  }

  async resetPassword(token: string, newPassword: string) {
    return apiClient.post('/api/v1/auth/reset-password', { token, newPassword })
  }
}

export const authService = new AuthService()