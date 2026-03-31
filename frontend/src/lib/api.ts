const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || ''

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const headers: any = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    // Only set Content-Type to application/json if body is not FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const config: RequestInit = {
      headers,
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }))
      const error = new Error(errorData.message || 'Something went wrong')
        ; (error as any).errors = errorData.errors
      throw error
    }

    return response.json()
  }

  async get(endpoint: string) {
    return this.request(endpoint)
  }

  async post(endpoint: string, data: any) {
    const isFormData = data instanceof FormData
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    })
  }

  async put(endpoint: string, data: any) {
    const isFormData = data instanceof FormData
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    })
  }

  async patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()