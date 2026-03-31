'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Upload,
  MapPin,
  Scale,
  Star,
  Camera,
  X,
  CheckCircle
} from 'lucide-react'
import { collectionService, CollectionData } from '@/lib/collection-service'
import { apiClient } from '@/lib/api'

const collectionSchema = z.object({
  farmer: z.string().min(1, 'Farmer is required'),
  collectionDate: z.string().min(1, 'Collection date is required'),
  weight: z.number()
    .min(0.1, 'Weight must be at least 0.1 kg')
    .max(1000, 'Weight cannot exceed 1000 kg'),
  quality: z.enum(['grade1', 'grade2', 'grade3']),
  location: z.object({
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180)
    }),
    address: z.string().min(1, 'Address is required')
  }),
  notes: z.string().max(500).optional()
})

interface RecordCollectionFormProps {
  onSuccess?: () => void
  initialData?: Partial<CollectionData>
}

export default function RecordCollectionForm({
  onSuccess,
  initialData
}: RecordCollectionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [farmers, setFarmers] = useState<any[]>([])
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [recordedCollection, setRecordedCollection] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CollectionData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      collectionDate: new Date().toISOString().split('T')[0],
      quality: 'grade1',
      location: {
        coordinates: { lat: 0, lng: 0 },
        address: ''
      },
      ...initialData
    }
  })

  useEffect(() => {
    fetchFarmers()
    getCurrentLocation()
  }, [])

  const fetchFarmers = async () => {
    try {
      // Fetch assigned farmers for the collector
      const response = await apiClient.get('/api/v1/farmers/assigned')
      if (response && response.data && response.data.farmers) {
        setFarmers(response.data.farmers)
      } else if (response && response.farmers) {
        setFarmers(response.farmers)
      }
    } catch (error) {
      console.error('Failed to fetch farmers:', error)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(location)
          setValue('location.coordinates', location)

          // Reverse geocode to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json`)
            .then(response => response.json())
            .then(data => {
              setValue('location.address', data.display_name || 'Current Location')
            })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
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

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const onSubmit = async (data: CollectionData) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const collectionData = {
        ...data,
        image: selectedImage || undefined
      }

      await collectionService.createCollection(collectionData)

      if (onSuccess) {
        onSuccess()
      }

      reset()
      setSelectedImage(null)
      setImagePreview(null)

      setShowSuccess(true)
    } catch (error: any) {
      console.error('Submit error:', error)
      const msg = error.errors && error.errors.length > 0
        ? `${error.message}: ${error.errors.join(', ')}`
        : error.message || 'Failed to record collection'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Record New Collection</h2>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Farmer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Farmer
            </label>
            <select
              {...register('farmer')}
              className="input-field"
            >
              <option value="">Select a farmer</option>
              {farmers.map(farmer => (
                <option key={farmer._id} value={farmer._id}>
                  {farmer.farmerId} - {farmer.user.firstName} {farmer.user.lastName}
                </option>
              ))}
            </select>
            {errors.farmer && (
              <p className="mt-1 text-sm text-red-600">{errors.farmer.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Collection Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Date
              </label>
              <input
                type="date"
                {...register('collectionDate')}
                className="input-field"
              />
              {errors.collectionDate && (
                <p className="mt-1 text-sm text-red-600">{errors.collectionDate.message}</p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  {...register('weight', { valueAsNumber: true })}
                  className="input-field pl-10"
                  placeholder="0.0"
                />
                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              {errors.weight && (
                <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
              )}
            </div>
          </div>

          {/* Quality Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tea Quality
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'grade1', label: 'Grade 1', color: 'bg-green-100 text-green-800 border-green-300' },
                { value: 'grade2', label: 'Grade 2', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
                { value: 'grade3', label: 'Grade 3', color: 'bg-orange-100 text-orange-800 border-orange-300' }
              ].map((quality) => (
                <label
                  key={quality.value}
                  className={`cursor-pointer border-2 rounded-lg p-4 flex items-center justify-center space-x-2 transition-all ${watch('quality') === quality.value
                    ? quality.color
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    {...register('quality')}
                    value={quality.value}
                    className="hidden"
                  />
                  <Star className={quality.value === 'grade1' ? 'text-green-600' :
                    quality.value === 'grade2' ? 'text-yellow-600' :
                      'text-orange-600'} />
                  <span className="font-medium">{quality.label}</span>
                </label>
              ))}
            </div>
            {errors.quality && (
              <p className="mt-1 text-sm text-red-600">{errors.quality.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Location
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MapPin size={18} />
                  <span>Use Current Location</span>
                </button>
                <div className="text-sm text-gray-600">
                  {currentLocation ? (
                    <span>Location detected</span>
                  ) : (
                    <span>Click to detect location</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('location.coordinates.lat', { valueAsNumber: true })}
                    className="input-field"
                    placeholder="e.g., -1.2921"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    {...register('location.coordinates.lng', { valueAsNumber: true })}
                    className="input-field"
                    placeholder="e.g., 36.8219"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  {...register('location.address')}
                  className="input-field min-h-[80px]"
                  placeholder="Detailed address..."
                  rows={3}
                />
                {errors.location?.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection Photo (Optional)
            </label>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Collection preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-tea-500 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload photo of collected tea
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    capture="environment"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              {...register('notes')}
              className="input-field min-h-[100px]"
              placeholder="Any additional information about this collection..."
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => reset()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Recording...</span>
                </span>
              ) : (
                'Record Collection'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 text-center shadow-xl transform transition-all">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">
              Collection recorded successfully. The farmer has been notified.
            </p>
            <button
              onClick={handleCloseSuccess}
              className="w-full py-2.5 bg-tea-600 text-white rounded-lg hover:bg-tea-700 font-medium transition-colors"
            >
              Record Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}