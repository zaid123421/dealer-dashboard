'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import { Home, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react'
import { ErrorAlert } from '@/components/ui/error-alert'
import { toast } from 'sonner'
import { useTireSetDetails } from '@/modules/tire-sets/hooks/use-tire-set-details'
import { validateUrlParams } from '@/modules/tire-sets/lib/validate-url-params'
import { TireSetHeader } from '@/modules/tire-sets/components/tire-set-header'
import { TireSetIndividualTiresTable } from '@/modules/tire-sets/components/tire-set-individual-tires-table'
import { TireSetDetailsPageSkeleton } from '@/modules/tire-sets/components/tire-set-details-skeleton'
import { deleteTireSetService } from '@/modules/tire-sets/services/tire-set.service'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useDealerCustomer } from '@/modules/customers/hooks/use-dealer-customer'
import { useVehicleDetails } from '@/modules/vehicles/hooks/use-vehicle-details'
import { formatVehicleLabel } from '@/lib/format-table-cell'
import { useTranslations } from 'next-intl'

export default function TireDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('customers')

  const [isDeleting, setIsDeleting] = useState(false)

  const customerId = params.customerId as string | undefined
  const vehicleId = params.vehicleId as string | undefined
  const tireSetId = params.tireSetId as string | undefined

  const validation = validateUrlParams(customerId, vehicleId, tireSetId)

  const { data: customer, isPending: customerLoading } = useDealerCustomer(customerId)
  const { vehicle, isLoading: vehicleLoading } = useVehicleDetails({
    customerId,
    vehicleId,
  })

  const { tireSet, tires, isLoading, error } = useTireSetDetails(customerId, vehicleId, tireSetId)

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const handleDelete = useCallback(async () => {
    if (!customerId || !vehicleId || !tireSetId) return
    const cidNum = Number(customerId)
    const vidNum = Number(vehicleId)
    const tidNum = Number(tireSetId)
    if (Number.isNaN(cidNum) || Number.isNaN(vidNum) || Number.isNaN(tidNum)) return

    setIsDeleting(true)
    try {
      await deleteTireSetService(cidNum, vidNum, tidNum)
      toast.success('Tire set deleted successfully.')
      router.push(`/dashboard/customers/${customerId}/vehicles/${vehicleId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete tire set.')
    } finally {
      setIsDeleting(false)
    }
  }, [customerId, vehicleId, tireSetId, router])

  const breadcrumbTireLabel =
    tireSet?.displayLabel?.trim() ||
    (tireSet ? t('tireSetDetailTitleFallback', { id: tireSet.id }) : '…')

  const customerHref = customerId ? `/dashboard/customers` : '#'
  const vehicleHref =
    customerId && vehicleId
      ? `/dashboard/customers/${customerId}/vehicles/${vehicleId}`
      : '#'

  if (!validation.isValid) {
    return (
      <div className="flex flex-col gap-6">
        <ErrorAlert message={validation.error ?? t('invalidPageParameters')} />
        <Button variant="outline" size="sm" onClick={handleBack} className="w-fit">
          <ArrowLeft className="size-4 mr-2" />
          {t('tireGoBack')}
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return <TireSetDetailsPageSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <ErrorAlert message={error.message || 'An error occurred while fetching tire data'} />
        <Button variant="outline" size="sm" onClick={handleBack} className="w-fit">
          <ArrowLeft className="size-4 mr-2" />
          {t('tireGoBack')}
        </Button>
      </div>
    )
  }

  if (!tireSet) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-semibold text-yellow-900">Tire Set Not Found</h2>
              <Button variant="outline" size="sm" onClick={handleBack} className="mt-4">
                <ArrowLeft className="size-4 mr-2" />
                {t('tireGoBack')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/dashboard/customers" className="hover:text-foreground transition-colors">
          <Home className="size-4 text-primary-dark" aria-hidden />
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
        {!customerLoading && customer ? (
          <Link
            href={customerHref}
            className="font-medium text-primary-dark hover:underline underline-offset-4 transition-colors"
          >
            {customer.firstName} {customer.lastName}
          </Link>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
        <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
        {!vehicleLoading && vehicle ? (
          <Link
            href={vehicleHref}
            className="font-medium text-primary-dark hover:text-primary underline-offset-4 hover:underline transition-colors"
          >
            {formatVehicleLabel(vehicle.make, vehicle.model, vehicle.year)}
          </Link>
        ) : (
          <Skeleton className="h-4 w-36" />
        )}
        <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
        <span className="font-medium text-white" aria-current="page">
          {breadcrumbTireLabel}
        </span>
      </nav>

      <TireSetHeader
        tireSet={tireSet}
        onBack={handleBack}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />

      <TireSetIndividualTiresTable tires={tires} />
    </div>
  )
}
