'use client'

import { useAuth } from '@/lib/auth-context'
import FarmerDashboard from '@/components/dashboard/FarmerDashboard'
import CollectorDashboard from '@/components/dashboard/CollectorDashboard'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import FactoryDashboard from '@/components/factory/FactoryDashboard'

export default function DashboardPage() {
  const { user } = useAuth()

  const renderDashboard = () => {
    switch (user?.role) {
      case 'farmer':
        return <FarmerDashboard />
      case 'collector':
        return <CollectorDashboard />
      case 'factory_manager':
        return <FactoryDashboard />
      case 'admin':
        return <AdminDashboard />
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p>Unknown user role</p>
          </div>
        )
    }
  }

  return (
    <div className="p-6">
      {renderDashboard()}
    </div>
  )
}