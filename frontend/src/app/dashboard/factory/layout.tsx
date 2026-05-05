'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function FactoryLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && user.role !== 'factory_manager' && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) return null
  if (!user) return null

  return <>{children}</>
}