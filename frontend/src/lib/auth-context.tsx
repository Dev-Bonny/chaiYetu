// frontend/src/lib/auth-context.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from './auth-service'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'farmer' | 'collector' | 'admin' | 'factory_manager'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await authService.getCurrentUser()
        // FIX 1: Handle Profile Response (usually response.data is the user)
        if (response.success && response.data) {
          setUser(response.data)
        }
      }
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    // Note: Ensure you kept the fix from the previous step (passing object)
    const response = await authService.login({ email, password })
    
    // FIX 2: Access nested data
    if (response.success && response.data) {
      setUser(response.data.user)
      localStorage.setItem('token', response.data.token)
    }
  }

  const register = async (userData: any) => {
    const response = await authService.register(userData)
    
    // FIX 3: Access nested data here too
    if (response.success && response.data) {
      setUser(response.data.user)
      localStorage.setItem('token', response.data.token)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    authService.logout()
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}