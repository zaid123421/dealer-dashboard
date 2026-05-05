'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTireSetDetails } from '@/modules/tire-sets/hooks/use-tire-set-details'
import { validateUrlParams } from '@/modules/tire-sets/lib/validate-url-params'
import { TireSetHeader } from '@/modules/tire-sets/components/tire-set-header'
import { TireGrid } from '@/modules/tire-sets/components/tire-grid'
import { TireDetailsModal } from '@/modules/tire-sets/components/tire-details-modal'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import type { TireDetail } from '@/modules/tire-sets/types'

export default function TireDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedTire, setSelectedTire] = useState<TireDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Extract parameters from URL
  const customerId = params.customerId as string | undefined
  const vehicleId = params.vehicleId as string | undefined
  const tireSetId = params.tireSetId as string | undefined

  // Validate URL parameters
  const validation = validateUrlParams(customerId, vehicleId, tireSetId)

  // Fetch tire set details
  const { tireSet, tires, isLoading, error } = useTireSetDetails(
    customerId,
    vehicleId,
    tireSetId,
  )

  // Handle back navigation
  const handleBack = () => {
    router.back()
  }

  // Handle tire selection
  const handleTireSelect = (tire: TireDetail) => {
    setSelectedTire(tire)
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTire(null)
  }

  // Display validation error
  if (!validation.isValid) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold text-red-900">Invalid URL Parameters</h2>
              <p className="text-sm text-red-800 mt-1">{validation.error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="mt-4"
              >
                <ArrowLeft className="size-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header skeleton */}
        <Card className="mb-6">
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </Card>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Display error state
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold text-red-900">Failed to Load Tire Details</h2>
              <p className="text-sm text-red-800 mt-1">
                {error.message || 'An error occurred while fetching tire data'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="mt-4"
              >
                <ArrowLeft className="size-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Display success state
  if (!tireSet) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold text-yellow-900">Tire Set Not Found</h2>
              <p className="text-sm text-yellow-800 mt-1">
                The requested tire set could not be found
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="mt-4"
              >
                <ArrowLeft className="size-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tire Set Header */}
      <TireSetHeader tireSet={tireSet} onBack={handleBack} />

      {/* Tire Grid */}
      <TireGrid tires={tires} viewMode="grid" onTireSelect={handleTireSelect} />

      {/* Tire Details Modal */}
      <TireDetailsModal
        tire={selectedTire}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  )
}
