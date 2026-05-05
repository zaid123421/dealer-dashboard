'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, Trash2, AlertCircle, Car, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import StyledTable from '@/components/ui/styled-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { useVehicleTireSets } from '@/modules/tire-sets/hooks/use-vehicle-tire-sets'
import { useVehicleDetails } from '@/modules/vehicles/hooks/use-vehicle-details'
import { useTranslations } from 'next-intl'
import { AddTireSetModal } from '@/modules/tire-sets/components/add-tire-set-modal'

export default function VehicleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("customers")
  const customerId = params.customerId as string
  const vehicleId = params.vehicleId as string
  const [isAddTireSetModalOpen, setIsAddTireSetModalOpen] = useState(false)

  // Fetch vehicle details and tire sets from API
  const { vehicle, isLoading: vehicleLoading, isError: vehicleError } = useVehicleDetails({
    customerId,
    vehicleId,
  })
  
  const { tireSets, isLoading, isError, error, refetch } = useVehicleTireSets({
    customerId,
    vehicleId,
  })

  const handleViewTireDetails = (tireSetId: number) => {
    router.push(
      `/dashboard/customers/${customerId}/vehicles/${vehicleId}/tire-sets/${tireSetId}`
    )
  }

  const getSeasonBadgeColor = (season: string) => {
    switch (season) {
      case 'Winter':
        return 'bg-blue-50 text-blue-900 border-blue-200'
      case 'Summer':
        return 'bg-yellow-50 text-yellow-900 border-yellow-200'
      case 'All-Season':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Vehicle Details Card */}
      {vehicleLoading ? (
        <div className="rounded-lg border p-6">
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      ) : vehicleError ? (
        <div className="flex items-start gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="font-semibold text-red-900">Failed to Load Vehicle Details</h2>
            <p className="text-sm text-red-800 mt-1">
              An error occurred while fetching vehicle details
            </p>
          </div>
        </div>
      ) : vehicle ? (
        <Card className="border-2 border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-dark/15 text-primary-dark">
                  <Car className="size-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-headline-sm font-bold text-foreground mb-4">
                    {vehicle.make} {vehicle.model} ({vehicle.year})
                  </h1>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">VIN</p>
                      <p className="text-sm font-mono">{vehicle.vin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Plate Number</p>
                      <p className="text-sm font-mono">{vehicle.plateNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Color</p>
                      <p className="text-sm">{vehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Odometer</p>
                      <p className="text-sm">{vehicle.odometerKm.toLocaleString()} km</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <Button
                  type="button"
                  className="bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90"
                  onClick={() => setIsAddTireSetModalOpen(true)}
                >
                  <Plus className="me-2 size-4 shrink-0" />
                  {t("addTireSet")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Tire Sets Section */}
      <div className="mt-8">
        <h2 className="text-title-lg font-semibold text-foreground mb-6">Tire Sets</h2>

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-lg border p-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="flex items-start gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold text-red-900">Failed to Load Tire Sets</h2>
              <p className="text-sm text-red-800 mt-1">
                {error?.message || 'An error occurred while fetching tire sets'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-3"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Tire Sets Table */}
        {!isLoading && !isError && (
          <StyledTable
            isLoading={isLoading}
            rows={tireSets}
            keyProp={(tireSet) => tireSet.id}
            emptyText="No tire sets found for this vehicle"
            columns={[
              {
                header: "Set ID",
                render: (tireSet) => (
                  <span className="font-medium">#{tireSet.id}</span>
                ),
                align: "center",
              },
              {
                header: "Brand",
                render: (tireSet) => tireSet.brand || "—",
                align: "center",
              },
              {
                header: "Tire Size",
                render: (tireSet) => tireSet.size || "—",
                align: "center",
              },
              {
                header: "Season",
                render: (tireSet) => (
                  <Badge className={getSeasonBadgeColor(tireSet.seasonType)}>
                    {tireSet.seasonType}
                  </Badge>
                ),
                align: "center",
              },
              {
                header: "Tire Count",
                render: (tireSet) => `${tireSet.tireCount} tires`,
                align: "center",
              },
              {
                header: "Display Label",
                render: (tireSet) => tireSet.displayLabel || "—",
                align: "center",
              },
              {
                header: "Date Added",
                render: (tireSet) => formatDate(tireSet.createdAt),
                align: "center",
              },
              {
                header: "Actions",
                className: "min-w-[220px]",
                render: (tireSet) => (
                  <div className="flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
                                hover:bg-[var(--color-tertiary-main-dark)] hover:text-white hover:border-[var(--color-tertiary-main-dark)] 
                                transition-all duration-[var(--duration-normal)]"
                      onClick={() => handleViewTireDetails(tireSet.id)}
                      title="View tire details"
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-[var(--radius-md)] border border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] 
                                hover:bg-[var(--color-error-main)] hover:text-white hover:border-[var(--color-error-main)] 
                                transition-all duration-[var(--duration-normal)]"
                      title="Delete tire set"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>

      {/* Add Tire Set Modal */}
      <AddTireSetModal
        open={isAddTireSetModalOpen}
        onOpenChange={setIsAddTireSetModalOpen}
        customerId={customerId}
        vehicleId={vehicleId}
      />
    </div>
  )
}
