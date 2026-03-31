'use client'

import React from 'react'
import FarmerRegistrationForm from '@/components/farmers/FarmerRegistrationForm'

export default function RegisterFarmerPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Register Farmer</h1>
                    <p className="text-gray-600">Add a new farmer to your collection list</p>
                </div>
            </div>

            <FarmerRegistrationForm />
        </div>
    )
}
