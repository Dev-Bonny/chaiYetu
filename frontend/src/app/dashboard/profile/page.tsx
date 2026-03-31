'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { apiClient } from '@/lib/api'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Shield,
  Package,
  Truck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  Camera,
  Key,
  LogOut
} from 'lucide-react'
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils'

interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: 'farmer' | 'collector' | 'admin' | 'factory_manager'
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

interface FarmerProfile {
  _id: string
  farmerId: string
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
  registrationDate: string
  status: 'active' | 'inactive' | 'suspended'
  collector?: {
    _id: string
    collectorId: string
    user: {
      firstName: string
      lastName: string
      phone: string
    }
  }
  bankDetails?: {
    bankName: string
    accountNumber: string
    accountName: string
  }
}

interface CollectorProfile {
  _id: string
  collectorId: string
  assignedArea: {
    county: string
    subCounty: string
    wards: string[]
  }
  vehicleDetails?: {
    type: string
    registration: string
    capacity: number
  }
  status: 'active' | 'inactive' | 'on_leave'
  totalCollections: number
  totalFarmers: number
}

interface StatsData {
  totalCollections: number
  totalWeight: number
  totalEarnings: number
  pendingPayments: number
  averageQuality: number
  collectionFrequency: number
  recentActivity: any[]
}

interface EditFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null)
  const [collectorProfile, setCollectorProfile] = useState<CollectorProfile | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'activity'>('overview')
  const [editForm, setEditForm] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 1. Fetch User Profile
      const profileResponse = await apiClient.get('/api/v1/users/profile')
      
      // 2. Fetch Stats (Handle gracefully if this endpoint isn't ready yet)
      let statsData = null
      try {
        const statsResponse = await apiClient.get('/api/v1/collections/summary')
        statsData = statsResponse.data
      } catch (statsErr) {
        console.warn('Stats endpoint not ready yet', statsErr)
      }

      const { user, farmerProfile, collectorProfile } = profileResponse.data

      setProfile(user)
      
      if (farmerProfile) setFarmerProfile(farmerProfile)
      if (collectorProfile) setCollectorProfile(collectorProfile)
      if (statsData) setStats(statsData)

      // Initialize edit form with real data
      if (user) {
        setEditForm({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (err: any) {
      console.error('Failed to fetch profile data:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  

  const handleEditToggle = () => {
    if (editing) {
      // Reset form when cancelling
      if (profile) {
        setEditForm({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
      setImagePreview(null)
      setSelectedImage(null)
    }
    setEditing(!editing)
    setError(null)
    setSuccess(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = async () => {
    setError(null)
    setSuccess(null)
    
    // Validate form
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setError('First name and last name are required')
      return
    }
    
    if (!editForm.email.trim()) {
      setError('Email is required')
      return
    }
    
    if (!editForm.phone.trim()) {
      setError('Phone number is required')
      return
    }
    
    // Password change validation
    if (editForm.newPassword || editForm.confirmPassword) {
      if (!editForm.currentPassword) {
        setError('Current password is required to change password')
        return
      }
      
      if (editForm.newPassword !== editForm.confirmPassword) {
        setError('New passwords do not match')
        return
      }
      
      if (editForm.newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return
      }
    }
    
    setSaving(true)
    
    try {
      const formData = new FormData()
      
      // Add profile data
      const profileData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
        phone: editForm.phone,
        ...(editForm.newPassword && {
          currentPassword: editForm.currentPassword,
          newPassword: editForm.newPassword
        })
      }
      
      formData.append('data', JSON.stringify(profileData))
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage)
      }
      
      await apiClient.put('/api/v1/users/profile', formData)
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          phone: editForm.phone,
          updatedAt: new Date().toISOString()
        })
      }
      
      setSuccess('Profile updated successfully')
      setEditing(false)
      setSelectedImage(null)
      setImagePreview(null)
      
      // Clear password fields
      setEditForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      farmer: 'bg-green-100 text-green-800',
      collector: 'bg-blue-100 text-blue-800',
      admin: 'bg-purple-100 text-purple-800',
      factory_manager: 'bg-orange-100 text-orange-800'
    }
    
    const labels = {
      farmer: 'Farmer',
      collector: 'Collector',
      admin: 'Administrator',
      factory_manager: 'Factory Manager'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[role as keyof typeof variants]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      on_leave: 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${variants[status as keyof typeof variants] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tea-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="card">
              {/* Profile Header */}
              <div className="flex flex-col items-center text-center mb-6">
                {/* Profile Image */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full bg-tea-100 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={48} className="text-tea-600" />
                    )}
                  
                    {editing && (
                      <label className="absolute bottom-0 right-0 p-2 bg-tea-600 text-white rounded-full cursor-pointer hover:bg-tea-700 transition-colors">
                        <Camera size={16} />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                {/* User Info */}
                <h2 className="text-xl font-semibold">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-gray-600 mt-1">{profile?.email}</p>
                <div className="mt-2">{getRoleBadge(profile?.role || 'farmer')}</div>
                
                {/* Status */}
                {farmerProfile && (
                  <div className="mt-3">
                    {getStatusBadge(farmerProfile.status)}
                  </div>
                )}
                {collectorProfile && (
                  <div className="mt-3">
                    {getStatusBadge(collectorProfile.status)}
                  </div>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-gray-400" />
                  <span className="text-gray-700">{profile?.phone}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail size={18} className="text-gray-400" />
                  <span className="text-gray-700">{profile?.email}</span>
                </div>
                
                {farmerProfile && (
                  <div className="flex items-start space-x-3">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-gray-700 block">
                        {farmerProfile.location.village}, {farmerProfile.location.ward}
                      </span>
                      <span className="text-sm text-gray-500">
                        {farmerProfile.location.subCounty}, {farmerProfile.location.county}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-3">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-gray-700">
                    Member since {formatDate(profile?.createdAt || '', 'medium')}
                  </span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                {editing ? (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center space-x-2 bg-tea-600 text-white py-2 px-4 rounded-lg hover:bg-tea-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X size={16} />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="w-full flex items-center justify-center space-x-2 border border-tea-600 text-tea-600 py-2 px-4 rounded-lg hover:bg-tea-50 transition-colors"
                  >
                    <Edit2 size={16} />
                    <span>Edit Profile</span>
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 border border-red-600 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            
            {/* Role-Specific Info */}
            {farmerProfile && (
              <div className="card mt-6">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <Package size={18} />
                  <span>Farm Information</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farm Size</span>
                    <span className="font-medium">{farmerProfile.farmSize} acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tea Variety</span>
                    <span className="font-medium">{farmerProfile.teaVariety}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Farmer ID</span>
                    <span className="font-medium">{farmerProfile.farmerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Registration Date</span>
                    <span className="font-medium">{formatDate(farmerProfile.registrationDate, 'short')}</span>
                  </div>
                </div>
                
                {farmerProfile.collector && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2 flex items-center space-x-2">
                      <Truck size={16} />
                      <span>Assigned Collector</span>
                    </h4>
                    <div className="space-y-2">
                      <p className="font-medium">
                        {farmerProfile.collector.user.firstName} {farmerProfile.collector.user.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{farmerProfile.collector.collectorId}</p>
                      <p className="text-sm text-gray-600">{farmerProfile.collector.user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {collectorProfile && (
              <div className="card mt-6">
                <h3 className="font-semibold mb-4 flex items-center space-x-2">
                  <Truck size={18} />
                  <span>Collector Information</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Collector ID</span>
                    <span className="font-medium">{collectorProfile.collectorId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned Farmers</span>
                    <span className="font-medium">{collectorProfile.totalFarmers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Collections</span>
                    <span className="font-medium">{collectorProfile.totalCollections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area</span>
                    <span className="font-medium text-right">
                      {collectorProfile.assignedArea.subCounty}, {collectorProfile.assignedArea.county}
                    </span>
                  </div>
                </div>
                
                {collectorProfile.vehicleDetails && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Vehicle Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium">{collectorProfile.vehicleDetails.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration</span>
                        <span className="font-medium">{collectorProfile.vehicleDetails.registration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity</span>
                        <span className="font-medium">{collectorProfile.vehicleDetails.capacity} kg</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-6 border-b">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-tea-600 text-tea-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'security'
                      ? 'border-tea-600 text-tea-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`py-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'activity'
                      ? 'border-tea-600 text-tea-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Recent Activity
                </button>
              </nav>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <Package className="text-blue-500" size={24} />
                        <span className="text-sm text-gray-500">Total</span>
                      </div>
                      <p className="text-3xl font-bold">{stats.totalCollections}</p>
                      <p className="text-sm text-gray-600 mt-1">Collections</p>
                    </div>
                    
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="text-green-500" size={24} />
                        <span className="text-sm text-gray-500">Total</span>
                      </div>
                      <p className="text-3xl font-bold">{formatNumber(stats.totalWeight)} kg</p>
                      <p className="text-sm text-gray-600 mt-1">Weight Collected</p>
                    </div>
                    
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <DollarSign className="text-yellow-500" size={24} />
                        <span className="text-sm text-gray-500">Total</span>
                      </div>
                      <p className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                      <p className="text-sm text-gray-600 mt-1">Earnings</p>
                    </div>
                    
                    {stats.pendingPayments > 0 && (
                      <div className="card">
                        <div className="flex items-center justify-between mb-4">
                          <Clock className="text-orange-500" size={24} />
                          <span className="text-sm text-gray-500">Pending</span>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(stats.pendingPayments)}</p>
                        <p className="text-sm text-gray-600 mt-1">Payments</p>
                      </div>
                    )}
                    
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex">
                          {[1, 2, 3].map(star => (
                            <Package
                              key={star}
                              size={16}
                              className={`${star <= Math.round(stats.averageQuality) ? 'text-yellow-500' : 'text-gray-300'} ${star > 1 ? 'ml-1' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">Average</span>
                      </div>
                      <p className="text-3xl font-bold">{stats.averageQuality.toFixed(1)}</p>
                      <p className="text-sm text-gray-600 mt-1">Quality Score</p>
                    </div>
                    
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <Calendar className="text-purple-500" size={24} />
                        <span className="text-sm text-gray-500">Per Week</span>
                      </div>
                      <p className="text-3xl font-bold">{stats.collectionFrequency.toFixed(1)}</p>
                      <p className="text-sm text-gray-600 mt-1">Collection Frequency</p>
                    </div>
                  </div>
                )}

                {/* Edit Form (when editing) */}
                {editing && (
                  <div className="card">
                    <h3 className="font-semibold mb-4">Edit Profile Information</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={editForm.firstName}
                            onChange={handleFormChange}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={editForm.lastName}
                            onChange={handleFormChange}
                            className="input-field"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleFormChange}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleFormChange}
                          className="input-field"
                        />
                      </div>
                      
                      {/* Bank Details for Farmers */}
                      {farmerProfile && editing && (
                        <div className="pt-4 border-t">
                          <h4 className="font-medium mb-4">Bank Details (Optional)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Name
                              </label>
                              <input
                                type="text"
                                defaultValue={farmerProfile.bankDetails?.bankName || ''}
                                className="input-field"
                                placeholder="e.g., Equity Bank"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Number
                              </label>
                              <input
                                type="text"
                                defaultValue={farmerProfile.bankDetails?.accountNumber || ''}
                                className="input-field"
                                placeholder="e.g., 1234567890"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Details Display (for farmers) */}
                {farmerProfile?.bankDetails && !editing && (
                  <div className="card">
                    <h3 className="font-semibold mb-4">Bank Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bank Name</span>
                        <span className="font-medium">{farmerProfile.bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Number</span>
                        <span className="font-medium">{farmerProfile.bankDetails.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account Name</span>
                        <span className="font-medium">{farmerProfile.bankDetails.accountName}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-semibold mb-6 flex items-center space-x-2">
                    <Shield size={20} />
                    <span>Change Password</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          name="currentPassword"
                          value={editForm.currentPassword}
                          onChange={handleFormChange}
                          className="input-field pr-10"
                          placeholder="Enter current password"
                        />
                        <Key size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={editForm.newPassword}
                          onChange={handleFormChange}
                          className="input-field"
                          placeholder="Enter new password"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={editForm.confirmPassword}
                          onChange={handleFormChange}
                          className="input-field"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving || (!editForm.currentPassword && !editForm.newPassword && !editForm.confirmPassword)}
                        className="w-full md:w-auto bg-tea-600 text-white py-2 px-6 rounded-lg hover:bg-tea-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Updating Password...' : 'Update Password'}
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Leave blank if you don't want to change your password
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Enable
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Active Sessions</p>
                        <p className="text-sm text-gray-600">Manage your active login sessions</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        View Sessions
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Login History</p>
                        <p className="text-sm text-gray-600">View your recent login activity</p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        View History
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && stats?.recentActivity && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-3 border rounded-lg">
                        <div className="p-2 bg-tea-100 rounded-lg">
                          {activity.type === 'collection' && <Package size={20} className="text-tea-600" />}
                          {activity.type === 'payment' && <DollarSign size={20} className="text-green-600" />}
                          {activity.type === 'verification' && <CheckCircle size={20} className="text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">
                              {activity.type === 'collection' && 'New Collection Recorded'}
                              {activity.type === 'payment' && 'Payment Processed'}
                              {activity.type === 'verification' && 'Collection Verified'}
                            </p>
                            <span className="text-sm text-gray-500">
                              {formatDate(activity.date, 'relative')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.type === 'collection' && `${activity.weight} kg collected`}
                            {activity.type === 'payment' && `${formatCurrency(activity.amount)} received`}
                            {activity.type === 'verification' && `Status: ${activity.status}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-4">Account Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Created</span>
                      <span className="font-medium">
                        {formatDate(profile?.createdAt || '', 'medium')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">
                        {formatDate(profile?.updatedAt || '', 'medium')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Login</span>
                      <span className="font-medium">
                        {profile?.lastLogin ? formatDate(profile.lastLogin, 'medium') : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Status</span>
                      <span className="font-medium text-green-600">
                        {profile?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}