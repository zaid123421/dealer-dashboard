'use client'

import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { TireSetDetail } from '@/modules/tire-sets/types'

interface TireSetHeaderProps {
  tireSet: TireSetDetail
  onBack: () => void
}

const seasonTypeStyles: Record<
  'Summer' | 'Winter' | 'All-Season',
  { badge: string; label: string }
> = {
  Summer: {
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    label: 'Summer',
  },
  Winter: {
    badge: 'bg-blue-100 text-blue-900 border-blue-200',
    label: 'Winter',
  },
  'All-Season': {
    badge: 'bg-gray-100 text-gray-800 border-gray-300',
    label: 'All Season',
  },
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

export function TireSetHeader({ tireSet, onBack }: TireSetHeaderProps) {
  const seasonStyle = seasonTypeStyles[tireSet.seasonType] || {
    badge: 'bg-gray-100 text-gray-800 border-gray-300',
    label: tireSet.seasonType,
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-semibold">{tireSet.brand}</h1>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Size</p>
              <p className="font-medium">{tireSet.size}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Season Type</p>
              <Badge className={`mt-1 ${seasonStyle.badge}`}>
                {seasonStyle.label}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tire Count</p>
              <p className="font-medium">{tireSet.tireCount} tires</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">{formatDate(tireSet.createdAt)}</p>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
