'use client'

import { useTranslations } from 'next-intl'
import { ArrowLeft, CalendarDays, Cloud, Hash, Loader2, Package, Ruler, Snowflake, Sun, Tags, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { TireSetDetail } from '@/modules/tire-sets/types'

interface TireSetHeaderProps {
  tireSet: TireSetDetail
  onBack: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const statItems = (
  tireSet: TireSetDetail,
  t: ReturnType<typeof useTranslations<'customers'>>,
) => [
  {
    icon: <Ruler className="size-3 sm:size-4 text-white" aria-hidden />,
    label: t('tireSize'),
    value: <p className="text-body-md font-semibold text-onSurface font-mono text-sm sm:text-base">{tireSet.size}</p>,
  },
  {
    icon: <Tags className="size-3 sm:size-4 text-white" aria-hidden />,
    label: t('seasonType'),
    value: (
      <div className="flex items-center gap-1">
        {tireSet.seasonType === 'Winter' && <Snowflake className="size-3 sm:size-4 text-blue-500" />}
        {tireSet.seasonType === 'Summer' && <Sun className="size-3 sm:size-4 text-orange-500" />}
        {tireSet.seasonType === 'All-Season' && <Cloud className="size-3 sm:size-4 text-gray-500" />}
        <p className={`text-body-md font-semibold text-sm sm:text-base ${
          tireSet.seasonType === 'Winter' ? 'text-blue-500' :
          tireSet.seasonType === 'Summer' ? 'text-orange-500' :
          'text-gray-500'
        }`}>
          {tireSet.seasonType}
        </p>
      </div>
    ),
  },
  {
    icon: <Hash className="size-3 sm:size-4 text-white" aria-hidden />,
    label: t('tireSetDetailQty'),
    value: (
      <p className="text-body-md font-semibold text-onSurface text-sm sm:text-base">
        {t('tireSetDetailQtyTires', { count: tireSet.tireCount })}
      </p>
    ),
  },
  {
    icon: <CalendarDays className="size-3 sm:size-4 text-white" aria-hidden />,
    label: t('tireSetDetailDateAdded'),
    value: (
      <p className="text-body-md font-semibold text-onSurface font-mono text-sm sm:text-base">
        {formatDate(tireSet.createdAt)}
      </p>
    ),
  },
]

export function TireSetHeader({
  tireSet,
  onBack,
  onDelete,
  isDeleting = false,
}: TireSetHeaderProps) {
  const t = useTranslations('customers')

  const title =
    tireSet.displayLabel?.trim() !== ''
      ? tireSet.displayLabel.trim()
      : t('tireSetDetailTitleFallback', { id: tireSet.id })

  const items = statItems(tireSet, t)

  return (
    <Card className="border-0 bg-surface-container rounded-lg">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start">
          {/* Icon */}
          <div className="flex size-12 sm:size-16 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary-dark mx-auto md:mx-0">
            <Package className="size-6 sm:size-8" />
          </div>

          {/* Title + stats */}
          <div className="min-w-0 flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onBack}
                className="shrink-0"
                aria-label={t('tireGoBack')}
              >
                <ArrowLeft className="size-5" />
              </Button>
              <h1 className="text-lg font-bold text-onSurface sm:text-xl md:text-headline-sm">
                {title}
              </h1>
            </div>
            <p className="text-sm font-mono text-secondary-on-surface mb-4 px-2 md:px-0">
              {tireSet.brand}
            </p>

            <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
              {items.map((item) => (
                <div key={item.label} className="group">
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <span className="text-xs sm:text-sm font-medium text-secondary-on-surface">
                      {item.label}
                    </span>
                  </div>
                  <div className="bg-surface-bright border-2 border-surface-high rounded-lg p-2 sm:p-3 transition-all group-hover:border-primary-dark group-hover:shadow-md">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete */}
          {onDelete && (
            <div className="shrink-0 sm:mt-0 mt-4 text-center sm:text-left">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-full sm:w-auto"
                onClick={onDelete}
              >
                {isDeleting ? (
                  <Loader2 className="me-2 size-4 animate-spin shrink-0" />
                ) : (
                  <Trash2 className="me-2 size-4 shrink-0" />
                )}
                {t('tireSetDetailDeleteSet')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
