'use client'

import { useRouter } from 'next/navigation'
import RecordCollectionForm from '@/components/collections/RecordCollectionForm'

export default function RecordCollectionPage() {
  const router = useRouter()

  const handleSuccess = () => {
    // Navigate to collections list or show success message
    router.push('/dashboard/collections')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Record Collection</h1>
        <p className="text-gray-600">Enter details for new tea collection</p>
      </div>

      <RecordCollectionForm onSuccess={handleSuccess} />
    </div>
  )
}
