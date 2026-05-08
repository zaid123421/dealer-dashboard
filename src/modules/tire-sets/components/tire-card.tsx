'use client'

import { TireDetail } from '../types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getTireStatusBadgeClass } from '../lib/tire-display'

interface TireCardProps {
  tire: TireDetail
  onSelect?: (tire: TireDetail) => void
}

export function TireCard({ tire, onSelect }: TireCardProps) {
  const handleClick = () => {
    onSelect?.(tire)
  }

  const statusColor = getTireStatusBadgeClass(tire.status)

  return (
    <Button
      variant="ghost"
      className="h-auto p-0 justify-start"
      onClick={handleClick}
    >
      <Card className="w-full cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header with position and status */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{tire.wheelPosition || 'Position N/A'}</h3>
                <p className="text-sm text-muted-foreground">
                  {tire.brand} {tire.model || ''}
                </p>
              </div>
              <Badge className={statusColor}>{tire.status}</Badge>
            </div>

            {/* Tire size */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Size</p>
              <p className="text-base">{tire.size}</p>
            </div>

            {/* Mileage and tread condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Mileage
                </p>
                <p className="text-base">
                  {tire.mileage ? `${tire.mileage.toLocaleString()} km` : '—'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tread
                </p>
                <p className="text-base">{tire.treadCondition || '—'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Button>
  )
}
