'use client'

import { TireDetail } from '../types'
import { TireCard } from './tire-card'
import { Card, CardContent } from '@/components/ui/card'

interface TireGridProps {
  tires: TireDetail[]
  viewMode?: 'grid' | 'list'
  onTireSelect?: (tire: TireDetail) => void
}

export function TireGrid({
  tires,
  viewMode = 'grid',
  onTireSelect,
}: TireGridProps) {
  // Handle empty tire set case
  if (tires.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">
              No tires found for this set
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This tire set doesn't contain any tires yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid layout (2 columns on desktop, 1 on mobile)
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {tires.map((tire) => (
          <TireCard
            key={tire.id}
            tire={tire}
            onSelect={onTireSelect}
          />
        ))}
      </div>
    )
  }

  // List layout
  return (
    <div className="space-y-3">
      {tires.map((tire) => (
        <TireCard
          key={tire.id}
          tire={tire}
          onSelect={onTireSelect}
        />
      ))}
    </div>
  )
}
