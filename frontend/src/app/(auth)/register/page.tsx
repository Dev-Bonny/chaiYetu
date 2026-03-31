// frontend/src/app/(auth)/register/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { MapPin, Truck, Scale, Leaf, Package, Navigation } from 'lucide-react'

// Available counties in Kenya (you can expand this list)
const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet',
  'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado',
  'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga',
  'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia',
  'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit',
  'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
  'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu',
  'Vihiga', 'Wajir', 'West Pokot'
]

// Common tea varieties in Kenya
const TEA_VARIETIES = [
  'Clone TRFK 306/1',
  'Clone TRFK 371/3',
  'Clone TRFK 430/90',
  'Clone TRFK 6/8',
  'Clone BB 35',
  'Clone S15/10',
  'Clone EPK C12',
  'Clone EPK TN14-3',
  'Assamica',
  'Sinensis'
]

// Vehicle types
const VEHICLE_TYPES = [
  'Pickup Truck',
  'Motorcycle',
  'Three-Wheeler',
  'Van',
  'Truck',
  'Bicycle'
]

interface FarmerProfile {
  location: {
    county: string
    subCounty: string
    ward: string
    village: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  farmSize: number
  teaVariety: string
}

interface CollectorProfile {
  assignedArea: {
    county: string
    subCounty: string
    wards: string[] // Array of wards
  }
  vehicleDetails?: {
    type: string
    registration: string
    capacity: number
  }
}

interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: 'farmer' | 'collector' | 'admin' | 'factory_manager'
  farmerProfile?: FarmerProfile
  collectorProfile?: CollectorProfile
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'farmer',
    farmerProfile: {
      location: {
        county: '',
        subCounty: '',
        ward: '',
        village: ''
      },
      farmSize: 0,
      teaVariety: ''
    }
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [wardsInput, setWardsInput] = useState('')
  const { register } = useAuth()
  const router = useRouter()

  // Initialize form based on role
  useEffect(() => {
    if (formData.role === 'farmer') {
      setFormData(prev => ({
        ...prev,
        collectorProfile: undefined,
        farmerProfile: {
          location: {
            county: '',
            subCounty: '',
            ward: '',
            village: ''
          },
          farmSize: 0,
          teaVariety: ''
        }
      }))
      setWardsInput('')
    } else if (formData.role === 'collector') {
      setFormData(prev => ({
        ...prev,
        farmerProfile: undefined,
        collectorProfile: {
          assignedArea: {
            county: '',
            subCounty: '',
            wards: []
          },
          vehicleDetails: {
            type: '',
            registration: '',
            capacity: 0
          }
        }
      }))
    }
    setFormErrors({})
  }, [formData.role])

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleFarmerProfileChange = (field: keyof FarmerProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      farmerProfile: {
        ...prev.farmerProfile!,
        [field]: value
      }
    }))
  }

  const handleLocationChange = (field: keyof FarmerProfile['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      farmerProfile: {
        ...prev.farmerProfile!,
        location: {
          ...prev.farmerProfile!.location,
          [field]: value
        }
      }
    }))
  }

  const handleCollectorProfileChange = (field: keyof CollectorProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      collectorProfile: {
        ...prev.collectorProfile!,
        [field]: value
      }
    }))
  }

  const handleAssignedAreaChange = (field: keyof CollectorProfile['assignedArea'], value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      collectorProfile: {
        ...prev.collectorProfile!,
        assignedArea: {
          ...prev.collectorProfile!.assignedArea,
          [field]: value
        }
      }
    }))
  }

  const handleVehicleDetailsChange = (field: keyof NonNullable<CollectorProfile['vehicleDetails']>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      collectorProfile: {
        ...prev.collectorProfile!,
        vehicleDetails: {
          ...prev.collectorProfile!.vehicleDetails!,
          [field]: value
        }
      }
    }))
  }

  const handleWardsInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setWardsInput(value)
    
    // Convert comma-separated string to array
    const wardsArray = value.split(',').map(ward => ward.trim()).filter(ward => ward.length > 0)
    handleAssignedAreaChange('wards', wardsArray)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Basic validation
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match'

    // Role-specific validation
    if (formData.role === 'farmer') {
      const farmer = formData.farmerProfile
      if (!farmer) {
        errors.farmerProfile = 'Farmer profile is required'
      } else {
        if (!farmer.location.county) errors['farmerProfile.location.county'] = 'County is required'
        if (!farmer.location.subCounty) errors['farmerProfile.location.subCounty'] = 'Sub-county is required'
        if (!farmer.location.ward) errors['farmerProfile.location.ward'] = 'Ward is required'
        if (!farmer.location.village) errors['farmerProfile.location.village'] = 'Village is required'
        if (!farmer.farmSize || farmer.farmSize <= 0) errors['farmerProfile.farmSize'] = 'Valid farm size is required'
        if (!farmer.teaVariety) errors['farmerProfile.teaVariety'] = 'Tea variety is required'
      }
    } else if (formData.role === 'collector') {
      const collector = formData.collectorProfile
      if (!collector) {
        errors.collectorProfile = 'Collector profile is required'
      } else {
        if (!collector.assignedArea.county) errors['collectorProfile.assignedArea.county'] = 'County is required'
        if (!collector.assignedArea.subCounty) errors['collectorProfile.assignedArea.subCounty'] = 'Sub-county is required'
        if (!collector.assignedArea.wards || collector.assignedArea.wards.length === 0) {
          errors['collectorProfile.assignedArea.wards'] = 'At least one ward is required'
        }
        
        // Vehicle details are optional, but if provided, validate
        if (collector.vehicleDetails) {
          if (!collector.vehicleDetails.type) errors['collectorProfile.vehicleDetails.type'] = 'Vehicle type is required'
          if (!collector.vehicleDetails.registration) errors['collectorProfile.vehicleDetails.registration'] = 'Registration number is required'
          if (!collector.vehicleDetails.capacity || collector.vehicleDetails.capacity <= 0) {
            errors['collectorProfile.vehicleDetails.capacity'] = 'Valid capacity is required'
          }
        }
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFormErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Prepare the registration data according to backend validation
      const { confirmPassword, ...registerData } = formData

      // Clean up the data before sending
      const cleanRegisterData = {
        ...registerData,
        phone: registerData.phone.replace(/\s+/g, ''), // Remove spaces from phone
        farmerProfile: registerData.role === 'farmer' ? registerData.farmerProfile : undefined,
        collectorProfile: registerData.role === 'collector' ? registerData.collectorProfile : undefined
      }

      await register(cleanRegisterData)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldError = (fieldName: string): string | undefined => {
    return formErrors[fieldName]
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join ChaiYetu tea management system
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Personal Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={`input-field ${getFieldError('firstName') ? 'border-red-500' : ''}`}
                  value={formData.firstName}
                  onChange={handleBasicChange}
                />
                {getFieldError('firstName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('firstName')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={`input-field ${getFieldError('lastName') ? 'border-red-500' : ''}`}
                  value={formData.lastName}
                  onChange={handleBasicChange}
                />
                {getFieldError('lastName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('lastName')}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`input-field ${getFieldError('email') ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={handleBasicChange}
                placeholder="example@domain.com"
              />
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className={`input-field ${getFieldError('phone') ? 'border-red-500' : ''}`}
                value={formData.phone}
                onChange={handleBasicChange}
                placeholder="+254 712 345 678"
              />
              <p className="mt-1 text-xs text-gray-500">Format: +254XXXXXXXXX or 07XXXXXXXX</p>
              {getFieldError('phone') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('phone')}</p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Register as *
              </label>
              <select
                id="role"
                name="role"
                required
                className={`input-field ${getFieldError('role') ? 'border-red-500' : ''}`}
                value={formData.role}
                onChange={handleBasicChange}
              >
                <option value="farmer">🌱 Farmer</option>
                <option value="collector">🚚 Collector</option>
              </select>
              {getFieldError('role') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('role')}</p>
              )}
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Security</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={`input-field ${getFieldError('password') ? 'border-red-500' : ''}`}
                  value={formData.password}
                  onChange={handleBasicChange}
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                {getFieldError('password') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={`input-field ${getFieldError('confirmPassword') ? 'border-red-500' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleBasicChange}
                />
                {getFieldError('confirmPassword') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('confirmPassword')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Farmer Profile Section */}
          {formData.role === 'farmer' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-tea-200">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="text-tea-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Farmer Profile</h3>
              </div>
              
              {/* Location Details */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                  <Navigation size={16} />
                  <span>Location Details</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County *
                    </label>
                    <select
                      className={`input-field ${getFieldError('farmerProfile.location.county') ? 'border-red-500' : ''}`}
                      value={formData.farmerProfile?.location.county || ''}
                      onChange={(e) => handleLocationChange('county', e.target.value)}
                    >
                      <option value="">Select County</option>
                      {KENYA_COUNTIES.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                    {getFieldError('farmerProfile.location.county') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('farmerProfile.location.county')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-County *
                    </label>
                    <input
                      type="text"
                      className={`input-field ${getFieldError('farmerProfile.location.subCounty') ? 'border-red-500' : ''}`}
                      value={formData.farmerProfile?.location.subCounty || ''}
                      onChange={(e) => handleLocationChange('subCounty', e.target.value)}
                      placeholder="e.g., Gatundu South"
                    />
                    {getFieldError('farmerProfile.location.subCounty') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('farmerProfile.location.subCounty')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ward *
                    </label>
                    <input
                      type="text"
                      className={`input-field ${getFieldError('farmerProfile.location.ward') ? 'border-red-500' : ''}`}
                      value={formData.farmerProfile?.location.ward || ''}
                      onChange={(e) => handleLocationChange('ward', e.target.value)}
                      placeholder="e.g., Kiganjo"
                    />
                    {getFieldError('farmerProfile.location.ward') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('farmerProfile.location.ward')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Village *
                    </label>
                    <input
                      type="text"
                      className={`input-field ${getFieldError('farmerProfile.location.village') ? 'border-red-500' : ''}`}
                      value={formData.farmerProfile?.location.village || ''}
                      onChange={(e) => handleLocationChange('village', e.target.value)}
                      placeholder="e.g., Kiria-ini"
                    />
                    {getFieldError('farmerProfile.location.village') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('farmerProfile.location.village')}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Farm Details */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                  <Leaf size={16} />
                  <span>Farm Details</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm Size (acres) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        className={`input-field pl-10 ${getFieldError('farmerProfile.farmSize') ? 'border-red-500' : ''}`}
                        value={formData.farmerProfile?.farmSize || ''}
                        onChange={(e) => handleFarmerProfileChange('farmSize', parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 2.5"
                      />
                      <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    {getFieldError('farmerProfile.farmSize') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('farmerProfile.farmSize')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tea Variety *
                    </label>
                    <select
                      className={`input-field ${getFieldError('farmerProfile.teaVariety') ? 'border-red-500' : ''}`}
                      value={formData.farmerProfile?.teaVariety || ''}
                      onChange={(e) => handleFarmerProfileChange('teaVariety', e.target.value)}
                    >
                      <option value="">Select Tea Variety</option>
                      {TEA_VARIETIES.map(variety => (
                        <option key={variety} value={variety}>{variety}</option>
                      ))}
                    </select>
                    {getFieldError('farmerProfile.teaVariety') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('farmerProfile.teaVariety')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Collector Profile Section */}
          {formData.role === 'collector' && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">Collector Profile</h3>
              </div>
              
              {/* Assigned Area */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>Assigned Area</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County *
                    </label>
                    <select
                      className={`input-field ${getFieldError('collectorProfile.assignedArea.county') ? 'border-red-500' : ''}`}
                      value={formData.collectorProfile?.assignedArea.county || ''}
                      onChange={(e) => handleAssignedAreaChange('county', e.target.value)}
                    >
                      <option value="">Select County</option>
                      {KENYA_COUNTIES.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                    {getFieldError('collectorProfile.assignedArea.county') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('collectorProfile.assignedArea.county')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sub-County *
                    </label>
                    <input
                      type="text"
                      className={`input-field ${getFieldError('collectorProfile.assignedArea.subCounty') ? 'border-red-500' : ''}`}
                      value={formData.collectorProfile?.assignedArea.subCounty || ''}
                      onChange={(e) => handleAssignedAreaChange('subCounty', e.target.value)}
                      placeholder="e.g., Gatundu South"
                    />
                    {getFieldError('collectorProfile.assignedArea.subCounty') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('collectorProfile.assignedArea.subCounty')}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Wards (comma-separated) *
                    </label>
                    <input
                      type="text"
                      className={`input-field ${getFieldError('collectorProfile.assignedArea.wards') ? 'border-red-500' : ''}`}
                      value={wardsInput}
                      onChange={handleWardsInputChange}
                      placeholder="e.g., Kiganjo, Kamae, Kiamwangi"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter ward names separated by commas</p>
                    {getFieldError('collectorProfile.assignedArea.wards') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('collectorProfile.assignedArea.wards')}</p>
                    )}
                    {formData.collectorProfile?.assignedArea.wards && formData.collectorProfile.assignedArea.wards.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.collectorProfile.assignedArea.wards.map((ward, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {ward}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicle Details (Optional) */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
                  <Package size={16} />
                  <span>Vehicle Details (Optional)</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      className={`input-field ${getFieldError('collectorProfile.vehicleDetails.type') ? 'border-red-500' : ''}`}
                      value={formData.collectorProfile?.vehicleDetails?.type || ''}
                      onChange={(e) => handleVehicleDetailsChange('type', e.target.value)}
                    >
                      <option value="">Select Type</option>
                      {VEHICLE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {getFieldError('collectorProfile.vehicleDetails.type') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('collectorProfile.vehicleDetails.type')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      className={`input-field ${getFieldError('collectorProfile.vehicleDetails.registration') ? 'border-red-500' : ''}`}
                      value={formData.collectorProfile?.vehicleDetails?.registration || ''}
                      onChange={(e) => handleVehicleDetailsChange('registration', e.target.value.toUpperCase())}
                      placeholder="e.g., KAA 123A"
                    />
                    {getFieldError('collectorProfile.vehicleDetails.registration') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('collectorProfile.vehicleDetails.registration')}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        className={`input-field pl-10 ${getFieldError('collectorProfile.vehicleDetails.capacity') ? 'border-red-500' : ''}`}
                        value={formData.collectorProfile?.vehicleDetails?.capacity || ''}
                        onChange={(e) => handleVehicleDetailsChange('capacity', parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 500"
                      />
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    {getFieldError('collectorProfile.vehicleDetails.capacity') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('collectorProfile.vehicleDetails.capacity')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-tea-600 to-green-600 hover:from-tea-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tea-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </span>
              ) : 'Create Account'}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-tea-600 hover:text-tea-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}