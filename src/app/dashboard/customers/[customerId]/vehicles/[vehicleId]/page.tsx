'use client'

import { useParams, useRouter } from 'next/navigation'
import { Eye, Trash2, AlertCircle } from 'lucide-react'
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
import { useVehicleTireSets } from '@/modules/tire-sets/hooks/use-vehicle-tire-sets'

export default function VehicleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.customerId as string
  const vehicleId = params.vehicleId as string

  // Fetch tire sets from API
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
    switch (season.toLowerCase()) {
      case 'winter':
        return 'bg-blue-50 text-blue-900 border-blue-200'
      case 'summer':
        return 'bg-yellow-50 text-yellow-900 border-yellow-200'
      case 'all_season':
      case 'all season':
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
    <div className="flex flex-col gap-6">
      <h1 className="text-headline-sm font-bold text-foreground">Tire Sets</h1>

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
  )
}
