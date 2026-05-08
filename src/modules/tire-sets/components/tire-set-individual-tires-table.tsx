'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import StyledTable from '@/components/ui/styled-table'
import { cn } from '@/lib/utils'
import type { TireDetail } from '../types'
import {
  getTireStatusBadgeClass,
  formatWheelPositionDisplay,
  formatTreadDepthDisplay,
  formatTireDescription,
} from '../lib/tire-display'

interface TireSetIndividualTiresTableProps {
  tires: TireDetail[]
}

export function TireSetIndividualTiresTable({ tires }: TireSetIndividualTiresTableProps) {
  const t = useTranslations('customers')

  const STATUS_BADGE: Record<string, string> = {
    CREATED: 'bg-gray-500 text-white border-gray-500',
    GOOD: 'bg-green-500 text-white border-green-500',
    FAIR: 'bg-yellow-500 text-white border-yellow-500',
    POOR: 'bg-purple-500 text-white border-purple-500',
    CRITICAL: 'bg-red-500 text-white border-red-500',
    STORED: 'bg-blue-500 text-white border-blue-500',
    SHIPPED: 'bg-orange-500 text-white border-orange-500',
  }

  const rowsWithIndex = tires.map((tire, index) => ({ tire, index }))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-title-md font-semibold text-foreground">
          {t('tireSetDetailIndividualTires')}
        </h2>
        <Badge variant="secondary" className="rounded-full px-2.5">
          {tires.length}
        </Badge>
      </div>

      <StyledTable
        isLoading={false}
        rows={rowsWithIndex}
        keyProp={(row) => row.tire.id}
        emptyText={t('tireSetDetailNoTiresInSet')}
        columns={[
          {
            header: t('tireSetDetailColTireNum'),
            render: ({ index }) => (
              <span className="font-medium">{t('tireSetDetailTireRow', { number: index + 1 })}</span>
            ),
          },
          {
            header: t('tireSetDetailColUniqueId'),
            render: ({ tire }) => (
              <span className="font-mono text-sm break-all">{tire.tireUniqueId ?? '—'}</span>
            ),
          },
          {
            header: t('tireSetDetailColPosition'),
            render: ({ tire }) => (
              <span className="text-sm">{formatWheelPositionDisplay(tire.wheelPosition)}</span>
            ),
          },
          {
            header: t('tireSetDetailColStatus'),
            render: ({ tire }) => {
              const key = tire.status.trim().toUpperCase().replace(/\s+/g, '_')
              const badgeClass = STATUS_BADGE[key] ?? 'bg-muted text-muted-foreground border-border'
              return (
                <Badge
                  className={cn(
                    'inline-flex items-center gap-1.5 font-medium border rounded-xl',
                    badgeClass,
                  )}
                >
                  {tire.status}
                </Badge>
              )
            },
            align: 'center',
          },
          {
            header: t('tireSetDetailColTreadDepth'),
            render: ({ tire }) => (
              <span className="font-mono text-sm">{formatTreadDepthDisplay(tire.treadCondition)}</span>
            ),
            align: 'center',
          },
          {
            header: t('tireSetDetailColCondition'),
            render: ({ tire }) => (
              <span className="text-sm text-muted-foreground">
                {formatTireDescription(tire.description)}
              </span>
            ),
            align: 'center',
          },
        ]}
      />
    </div>
  )
}
