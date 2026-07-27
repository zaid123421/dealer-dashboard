'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useCallback } from 'react'
import { Home, ChevronRight, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react'
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
import { Dialog } from '@/components/ui/dialog'
import {
  ConfirmDialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/app-dialog'
import { useDealerCustomer } from '@/modules/customers/hooks/use-dealer-customer'
import { useVehicleDetails } from '@/modules/vehicles/hooks/use-vehicle-details'
import { formatVehicleLabel } from '@/lib/format-table-cell'
import { useTranslations } from 'next-intl'
import { useGuardWrite, useViewOnlyMode } from '@/modules/dealer/hooks/use-view-only-mode'

export default function TireDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('customers')
  const { isViewOnly } = useViewOnlyMode()
  const guardWrite = useGuardWrite()

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
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

  function onDeleteRequest() {
    if (!guardWrite()) return
    setDeleteConfirmOpen(true)
  }

  async function onDeleteConfirm() {
    if (!guardWrite()) return
    if (!customerId || !vehicleId || !tireSetId) return
    const cidNum = Number(customerId)
    const vidNum = Number(vehicleId)
    const tidNum = Number(tireSetId)
    if (Number.isNaN(cidNum) || Number.isNaN(vidNum) || Number.isNaN(tidNum)) return

    setIsDeleting(true)
    try {
      await deleteTireSetService(cidNum, vidNum, tidNum)
      toast.success(t('tireSetDetailDeleteSuccess'))
      setDeleteConfirmOpen(false)
      router.push(`/dashboard/customers/${customerId}/vehicles/${vehicleId}`)
    } catch (err) {
      toast.error(
        err instanceof Error && err.message.trim()
          ? err.message
          : t('tireSetDetailDeleteError'),
      )
    } finally {
      setIsDeleting(false)
    }
  }

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
        <div
          role="alert"
          className="flex items-start gap-4 rounded-lg border border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-950/30"
        >
          <AlertCircle className="size-5 text-yellow-600 flex-shrink-0 mt-0.5 dark:text-yellow-500" />
          <div className="flex-1">
            <h2 className="font-semibold text-yellow-900 dark:text-yellow-100">Tire Set Not Found</h2>
            <Button variant="outline" size="sm" onClick={handleBack} className="mt-4">
              <ArrowLeft className="size-4 mr-2" />
              {t('tireGoBack')}
            </Button>
          </div>
        </div>
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
        onDelete={isViewOnly ? undefined : onDeleteRequest}
        isDeleting={isDeleting}
      />

      <TireSetIndividualTiresTable tires={tires} />

      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteConfirmOpen(false)
        }}
      >
        <ConfirmDialogContent>
          <div className="space-y-2 text-start">
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {t('tireSetDetailDeleteConfirmTitle')}
            </DialogTitle>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {t('tireSetDetailDeleteConfirmDescription', { id: tireSet.id })}
            </DialogDescription>
          </div>
          <DialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isDeleting}
            >
              {t('tireSetDetailCancel')}
            </Button>
            <Button
              type="button"
              className="border-0 bg-[var(--color-error-main)] font-semibold text-white shadow-none hover:bg-[var(--color-error-main)]/90"
              disabled={isDeleting}
              onClick={() => void onDeleteConfirm()}
            >
              {isDeleting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t('tireSetDetailDeleting')}
                </span>
              ) : (
                t('tireSetDetailDeleteSet')
              )}
            </Button>
          </DialogFooter>
        </ConfirmDialogContent>
      </Dialog>
    </div>
  )
}
