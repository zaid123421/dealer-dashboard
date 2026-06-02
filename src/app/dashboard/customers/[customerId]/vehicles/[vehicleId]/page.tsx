'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, Trash2, Car, Plus, CreditCard, Palette, Gauge, Package, Snowflake, Sun, Cloud, ChevronRight, Home } from 'lucide-react'
import { ErrorAlert } from '@/components/ui/error-alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import StyledTable from '@/components/ui/styled-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  VehicleDetailsBreadcrumbSkeleton,
  VehicleDetailsCardSkeleton,
  VehicleTireSetsSectionSkeleton,
} from '@/modules/vehicles/components/vehicle-details-skeleton'
import { useVehicleTireSets } from '@/modules/tire-sets/hooks/use-vehicle-tire-sets'
import { useVehicleDetails } from '@/modules/vehicles/hooks/use-vehicle-details'
import { useDealerCustomer } from '@/modules/customers/hooks/use-dealer-customer'
import { useTranslations } from 'next-intl'
import { AddTireSetModal } from '@/modules/tire-sets/components/add-tire-set-modal'
import { DealerQuotaNotice } from '@/modules/dealer/components/dealer-quota-notice'
import { DealerQuotaPanel } from '@/modules/dealer/components/dealer-quota-panel'
import { useDealerQuota } from '@/modules/dealer/hooks/use-dealer-quota'
import {
  formatOdometer,
  formatTableCell,
  formatVehicleLabel,
} from '@/lib/format-table-cell'

export default function VehicleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("customers")
  const customerId = params.customerId as string
  const vehicleId = params.vehicleId as string
  const [isAddTireSetModalOpen, setIsAddTireSetModalOpen] = useState(false)
  const { snapshot, canAddTires } = useDealerQuota()
  const canAddTireSet = canAddTires(1)

  // Fetch vehicle details and tire sets from API
  const { vehicle, isLoading: vehicleLoading, isError: vehicleError } = useVehicleDetails({
    customerId,
    vehicleId,
  })
  
  const { data: customer } = useDealerCustomer(customerId)
  
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
        return 'text-blue-500 px-3 py-1 min-w-[80px]'
      case 'Summer':
        return 'text-orange-500 px-3 py-1 min-w-[80px]'
      case 'All-Season':
        return 'text-gray-500 px-3 py-1 min-w-[80px]'
      default:
        return 'text-gray-500 px-3 py-1 min-w-[80px]'
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
      {/* Breadcrumbs */}
      {vehicleLoading ? (
        <VehicleDetailsBreadcrumbSkeleton />
      ) : (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/dashboard/customers" className="hover:text-foreground transition-colors">
            <Home className="size-4 text-primary-dark" />
          </Link>
          <ChevronRight className="size-4" />
          {!vehicleError && customer && (
            <Link
              href="/dashboard/customers"
              className="font-medium text-primary-dark hover:underline underline-offset-4 transition-colors"
            >
              {customer?.firstName} {customer?.lastName}
            </Link>
          )}
          {!vehicleError && customer && <ChevronRight className="size-4" />}
          {!vehicleError && vehicle && (
            <span className="font-medium text-white">
              {formatVehicleLabel(vehicle.make, vehicle.model, vehicle.year)}
            </span>
          )}
        </nav>
      )}

      {/* Vehicle Details Card */}
      {vehicleLoading ? (
        <VehicleDetailsCardSkeleton />
      ) : vehicleError ? (
        <ErrorAlert message="An error occurred while fetching vehicle details" />
      ) : vehicle ? (
        <>
        <DealerQuotaPanel filter="tires" variant="compact" className="mb-2" />
        {!canAddTireSet && snapshot.isLoaded ? (
          !snapshot.hasActiveSubscription ? (
            <DealerQuotaNotice variant="subscription" className="mb-2" />
          ) : snapshot.tires ? (
            <DealerQuotaNotice variant="tires" tireQuota={snapshot.tires} className="mb-2" />
          ) : null
        ) : null}
        <Card className="border-0 bg-surface-container rounded-lg">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start">
              <div className="flex size-12 sm:size-16 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary-dark mx-auto md:mx-0">
                <Car className="size-6 sm:size-8" />
              </div>
              <div className="min-w-0 flex-1 text-center md:text-left">
                <h1 className="text-lg font-bold text-onSurface mb-2 sm:text-xl md:text-headline-sm">
                  {formatVehicleLabel(vehicle.make, vehicle.model, vehicle.year)}
                </h1>
                <p className="text-sm font-mono text-secondary-on-surface mb-4 px-2 md:px-0 overflow-hidden truncate">
                  VIN: {formatTableCell(vehicle.vin)}
                </p>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  <div className="group">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="size-4 text-white" />
                      <span className="text-sm font-medium text-secondary-on-surface">Plate Number</span>
                    </div>
                    <div className="bg-surface-bright border-2 border-surface-high rounded-lg p-2 sm:p-3 transition-all group-hover:border-primary-dark group-hover:shadow-md">
                      <p className="text-body-md font-semibold text-onSurface font-mono text-sm sm:text-base">{formatTableCell(vehicle.plateNumber)}</p>
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex items-center gap-2 mb-2">
                      <Palette className="size-3 sm:size-4 text-tertiary-main" />
                      <span className="text-xs sm:text-sm font-medium text-secondary-on-surface">Color</span>
                    </div>
                    <div className="bg-surface-bright border-2 border-surface-high rounded-lg p-2 sm:p-3 transition-all group-hover:border-primary-dark group-hover:shadow-md">
                      <p className="text-body-md font-semibold text-onSurface text-sm sm:text-base">{formatTableCell(vehicle.color)}</p>
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="size-3 sm:size-4 text-primary-main" />
                      <span className="text-xs sm:text-sm font-medium text-secondary-on-surface">Odometer</span>
                    </div>
                    <div className="bg-surface-bright border-2 border-surface-high rounded-lg p-2 sm:p-3 transition-all group-hover:border-primary-dark group-hover:shadow-md">
                      <p className="text-body-md font-semibold text-onSurface text-sm sm:text-base">{formatOdometer(vehicle.odometerKm)}</p>
                    </div>
                  </div>
                  <div className="group">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="size-3 sm:size-4 text-success-main" />
                      <span className="text-xs sm:text-sm font-medium text-secondary-on-surface">Tire Sets</span>
                    </div>
                    <div className="bg-surface-bright border-2 border-surface-high rounded-lg p-2 sm:p-3 transition-all group-hover:border-primary-dark group-hover:shadow-md">
                      <p className="text-body-md font-semibold text-onSurface text-sm sm:text-base">{tireSets.length} sets</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="shrink-0 sm:mt-0 mt-4 text-center sm:text-left">
                <Button
                  type="button"
                  variant="brand"
                  className="w-full sm:w-auto"
                  disabled={!canAddTireSet}
                  onClick={() => setIsAddTireSetModalOpen(true)}
                >
                  <Plus className="me-2 size-4 shrink-0" />
                  {t("addTireSet")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
      ) : null}

      {/* Tire Sets Section */}
      {isLoading ? (
        <VehicleTireSetsSectionSkeleton />
      ) : (
        <div className="mt-8">
          <h2 className="text-title-lg font-semibold text-foreground mb-6">Tire Sets</h2>

          {isError && (
            <ErrorAlert
              message={error?.message || 'An error occurred while fetching tire sets'}
              onRetry={() => refetch()}
            />
          )}

          {!isError && (
            <StyledTable
              isLoading={false}
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
                    {tireSet.seasonType === 'Winter' && <Snowflake className="inline size-3 me-1" />}
                    {tireSet.seasonType === 'Summer' && <Sun className="inline size-3 me-1" />}
                    {tireSet.seasonType === 'All-Season' && <Cloud className="inline size-3 me-1" />}
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
                      className="h-9 w-9 rounded-md border border-[var(--color-tertiary-main-light)] bg-transparent text-[var(--color-tertiary-main-light)] 
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
                      className="h-9 w-9 rounded-md border border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] 
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
      )}

      {/* Add Tire Set Modal */}
      <AddTireSetModal
        open={isAddTireSetModalOpen}
        onOpenChange={setIsAddTireSetModalOpen}
        customerId={customerId}
        vehicleId={vehicleId}
        onCreated={() => refetch()}
      />
    </div>
  )
}
