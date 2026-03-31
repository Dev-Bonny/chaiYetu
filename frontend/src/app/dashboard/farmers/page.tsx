'use client'

import FarmerList from '@/components/farmers/FarmerList'
import { useAuth } from '@/lib/auth-context'

export default function FarmersPage() {
    const { user } = useAuth()

    // Determine endpoint based on role
    // If role is collector, fetch assigned farmers
    // Otherwise fetch all farmers (admin/manager view)
    const endpoint = user?.role === 'collector' ? '/api/v1/farmers/assigned' : '/api/v1/farmers'

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Farmers</h1>
                    <p className="text-gray-600">Manage {user?.role === 'collector' ? 'Assigned' : 'All'} Farmers</p>
                </div>
            </div>

            <FarmerList showFilters showStats showActions endpoint={endpoint} />
        </div>
    )
}
