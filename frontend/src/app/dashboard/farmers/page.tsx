'use client'

import React, { useState } from 'react'
import FarmerList from '@/components/farmers/FarmerList'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

export default function FarmersPage() {
    const { user } = useAuth()
    const [viewMode, setViewMode] = useState<'assigned' | 'all'>('assigned')

    const isCollector = user?.role === 'collector'

    // Determine endpoint based on role and selected viewMode
    const endpoint = isCollector && viewMode === 'assigned' 
        ? '/api/v1/farmers/assigned' 
        : '/api/v1/farmers'

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Farmers</h1>
                    <p className="text-gray-600">
                        Manage {isCollector ? (viewMode === 'assigned' ? 'Assigned' : 'All') : 'All'} Farmers
                    </p>
                </div>
                
                {isCollector && (
                    <div className="flex p-1 space-x-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setViewMode('assigned')}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                                viewMode === 'assigned' 
                                    ? 'bg-white text-tea-700 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            My Assigned Farmers
                        </button>
                        <button
                            onClick={() => setViewMode('all')}
                            className={cn(
                                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                                viewMode === 'all' 
                                    ? 'bg-white text-tea-700 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            All Registered Farmers
                        </button>
                    </div>
                )}
            </div>

            <FarmerList key={endpoint} showFilters showStats showActions endpoint={endpoint} />
        </div>
    )
}
