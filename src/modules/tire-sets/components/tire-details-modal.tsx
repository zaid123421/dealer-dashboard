'use client'

import { TireDetail } from '../types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { getTireStatusBadgeClass } from '../lib/tire-display'

interface TireDetailsModalProps {
  tire: TireDetail | null
  isOpen: boolean
  onClose: () => void
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

function formatDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

export function TireDetailsModal({
  tire,
  isOpen,
  onClose,
}: TireDetailsModalProps) {
  if (!tire) return null

  const statusColor = getTireStatusBadgeClass(tire.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between w-full">
            <div>
              <DialogTitle className="text-2xl">
                {tire.brand} {tire.model || ''}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Position: {tire.wheelPosition || 'N/A'}
              </p>
            </div>
            <Badge className={statusColor}>{tire.status}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tire ID
                  </p>
                  <p className="text-sm break-all">{tire.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Unique ID
                  </p>
                  <p className="text-sm break-all">{tire.tireUniqueId || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Wheel Position
                  </p>
                  <p className="text-sm">{tire.wheelPosition || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Version
                  </p>
                  <p className="text-sm">{tire.version}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tire Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tire Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Type
                  </p>
                  <p className="text-sm">{tire.tireType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Size
                  </p>
                  <p className="text-sm">{tire.size}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tread Width
                  </p>
                  <p className="text-sm">{tire.treadWidth || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Aspect Ratio
                  </p>
                  <p className="text-sm">{tire.aspectRatio || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Construction
                  </p>
                  <p className="text-sm">{tire.construction || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Diameter
                  </p>
                  <p className="text-sm">{tire.diameter || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Composition
                  </p>
                  <p className="text-sm">{tire.composition || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Condition Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Condition Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tread Condition
                  </p>
                  <p className="text-sm">{tire.treadCondition || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Mileage
                  </p>
                  <p className="text-sm">{tire.mileage ? `${tire.mileage.toLocaleString()} km` : '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge className={statusColor}>{tire.status}</Badge>
                </div>
              </div>
              {tire.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm">{tire.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Added Date
                  </p>
                  <p className="text-sm">{formatDate(tire.addedDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Updated Date
                  </p>
                  <p className="text-sm">{tire.updatedDate ? formatDate(tire.updatedDate) : '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="text-sm">{formatDateTime(tire.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Updated At
                  </p>
                  <p className="text-sm">{formatDateTime(tire.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scan Metadata */}
          {tire.scanMetadata && Object.keys(tire.scanMetadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scan Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded text-xs overflow-auto max-h-48">
                  {JSON.stringify(tire.scanMetadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
