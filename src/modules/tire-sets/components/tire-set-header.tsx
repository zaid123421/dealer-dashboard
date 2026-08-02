'use client'

import { useTranslations, useLocale } from 'next-intl'
import { formatLocaleDate } from '@/lib/format-locale'
import { ArrowLeft, CalendarDays, Hash, Loader2, Package, Ruler, Snowflake, Sun, Tags, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatTile } from '@/components/ui/stat-tile'
import type { TireSetDetail } from '@/modules/tire-sets/types'

interface TireSetHeaderProps {
  tireSet: TireSetDetail
  onBack: () => void
  onDelete?: () => void
  isDeleting?: boolean
}

export function TireSetHeader({
  tireSet,
  onBack,
  onDelete,
  isDeleting = false,
}: TireSetHeaderProps) {
  const t = useTranslations('customers')
  const locale = useLocale()

  const title =
    tireSet.displayLabel?.trim() !== ''
      ? tireSet.displayLabel.trim()
      : t('tireSetDetailTitleFallback', { id: tireSet.id })

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-start">
          {/* Icon */}
          <div className="flex size-12 sm:size-16 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary-dark mx-auto md:mx-0">
            <Package className="size-6 sm:size-8" />
          </div>

          <div className="min-w-0 flex-1 text-center md:text-left">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-2 -ms-2 hidden md:inline-flex"
            >
              <ArrowLeft className="me-2 size-4" />
              {t('tireGoBack')}
            </Button>
            <h1 className="text-lg font-bold text-foreground mb-2 sm:text-xl md:text-headline-sm">
              {title}
            </h1>
            <p className="text-sm font-mono text-muted-foreground mb-4 px-2 md:px-0">
              {tireSet.brand}
            </p>

            <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-4">
              <StatTile icon={Ruler} label={t('tireSize')} value={<span className="font-mono">{tireSet.size}</span>} />
              <StatTile
                icon={Tags}
                label={t('seasonType')}
                value={
                  <div className="flex items-center gap-1">
                    {tireSet.seasonType === 'Winter' && <Snowflake className="size-3 sm:size-4 text-blue-500 dark:text-blue-400" />}
                    {tireSet.seasonType === 'Summer' && <Sun className="size-3 sm:size-4 text-orange-500 dark:text-orange-400" />}
                    <span
                      className={
                        tireSet.seasonType === 'Winter'
                          ? 'text-blue-500 dark:text-blue-400'
                          : 'text-orange-500 dark:text-orange-400'
                      }
                    >
                      {tireSet.seasonType}
                    </span>
                  </div>
                }
              />
              <StatTile
                icon={Hash}
                label={t('tireSetDetailQty')}
                value={t('tireSetDetailQtyTires', { count: tireSet.tireCount })}
              />
              <StatTile
                icon={CalendarDays}
                label={t('tireSetDetailDateAdded')}
                value={<span className="font-mono">{formatLocaleDate(tireSet.createdAt, locale)}</span>}
              />
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
