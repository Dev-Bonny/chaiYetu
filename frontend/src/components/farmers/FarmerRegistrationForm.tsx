'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Save, Loader, AlertCircle, ArrowLeft } from 'lucide-react'
import { apiClient } from '@/lib/api'

// Validation Schema
const farmerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    phone: z.string().min(10, 'Valid phone number is required'), // Simple check
    email: z.string().email('Valid email is required').optional().or(z.literal('')),
    location: z.object({
        county: z.string().min(2, 'County is required'),
        subCounty: z.string().min(2, 'Sub-county is required'),
        ward: z.string().min(2, 'Ward is required'),
        village: z.string().min(2, 'Village is required'),
    }),
    farmSize: z.number().min(0.1, 'Farm size must be greater than 0'),
    teaVariety: z.string().min(2, 'Tea variety is required'),
})

type FarmerData = z.infer<typeof farmerSchema>

export default function FarmerRegistrationForm() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FarmerData>({
        resolver: zodResolver(farmerSchema),
        defaultValues: {
            location: { county: '', subCounty: '', ward: '', village: '' }
        }
    })

    // Counties for dropdown (simplified lists)
    const counties = ['Kiambu', 'Muranga', 'Nyeri', 'Kirinyaga', 'Meru', 'Embu', 'Tharaka Nithi']
    const teaVarieties = ['Clone TRFK 306', 'Clone TRFK 371', 'Clone TRFK 430', 'Clone TRFK 6/8', 'Clone BB 35']

    const [showSuccess, setShowSuccess] = useState(false)
    const [createdFarmerName, setCreatedFarmerName] = useState('')

    const onSubmit = async (data: FarmerData) => {
        setIsSubmitting(true)
        setError(null)

        try {
            await apiClient.post('/api/v1/farmers', data)
            setCreatedFarmerName(`${data.firstName} ${data.lastName}`)
            setShowSuccess(true)
            // Redirect happens after closing popup or after a delay
        } catch (err: any) {
            console.error('Registration failed:', err)
            setError(err.message || 'Failed to register farmer. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCloseSuccess = () => {
        setShowSuccess(false)
        router.push('/dashboard/farmers')
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-semibold mb-1">New Farmer Registration</h2>
                    <p className="text-sm text-gray-500">Enter farmer details to create a new profile</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center text-red-600">
                    <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input
                                {...register('firstName')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                                placeholder="e.g. John"
                            />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input
                                {...register('lastName')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                                placeholder="e.g. Kamau"
                            />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                            <input
                                {...register('phone')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                                placeholder="e.g. 0712345678"
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                                placeholder="e.g. john@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Location Details */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Location Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
                            <select
                                {...register('location.county')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                            >
                                <option value="">Select County</option>
                                {counties.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.location?.county && <p className="text-red-500 text-xs mt-1">{errors.location.county.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-County *</label>
                            <input
                                {...register('location.subCounty')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                                placeholder="e.g. Githunguri"
                            />
                            {errors.location?.subCounty && <p className="text-red-500 text-xs mt-1">{errors.location.subCounty.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ward *</label>
                            <input
                                {...register('location.ward')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                                placeholder="e.g. Ikinu"
                            />
                            {errors.location?.ward && <p className="text-red-500 text-xs mt-1">{errors.location.ward.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Village *</label>
                            <input
                                {...register('location.village')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                                placeholder="e.g. Kambaa"
                            />
                            {errors.location?.village && <p className="text-red-500 text-xs mt-1">{errors.location.village.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Farm Details */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Farm Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (Acres) *</label>
                            <input
                                {...register('farmSize', { valueAsNumber: true })}
                                type="number"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                                placeholder="e.g. 2.5"
                            />
                            {errors.farmSize && <p className="text-red-500 text-xs mt-1">{errors.farmSize.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tea Variety *</label>
                            <select
                                {...register('teaVariety')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tea-500 focus:border-transparent"
                            >
                                <option value="">Select Variety</option>
                                {teaVarieties.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                            {errors.teaVariety && <p className="text-red-500 text-xs mt-1">{errors.teaVariety.message}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center px-6 py-2.5 bg-tea-600 text-white rounded-lg hover:bg-tea-700 focus:ring-4 focus:ring-tea-200 transition-all disabled:opacity-70 font-medium"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="animate-spin mr-2" size={20} />
                                Registering...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2" size={20} />
                                Register Farmer
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 text-center shadow-xl transform transition-all">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Save className="text-green-600 w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                        <p className="text-gray-600 mb-6">
                            Farmer <span className="font-semibold text-gray-900">{createdFarmerName}</span> created successfully.
                        </p>
                        <button
                            onClick={handleCloseSuccess}
                            className="w-full py-2.5 bg-tea-600 text-white rounded-lg hover:bg-tea-700 font-medium transition-colors"
                        >
                            Return to Farmers List
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
