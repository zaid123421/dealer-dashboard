/**
 * تنسيق عرض الإطار في الجداول والتفاصيل (قيم API خام).
 */

const WHEEL_LABELS: Record<string, string> = {
  FL: 'Front Left',
  FR: 'Front Right',
  RL: 'Rear Left',
  RR: 'Rear Right',
}

const STATUS_BADGE: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-800 border-gray-200',
  GOOD: 'bg-green-100 text-green-800 border-green-200',
  FAIR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  POOR: 'bg-orange-100 text-orange-800 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  STORED: 'bg-blue-100 text-blue-900 border-blue-200',
  SHIPPED: 'bg-orange-100 text-orange-900 border-orange-200',
}

export function getTireStatusBadgeClass(status: string): string {
  const key = status.trim().toUpperCase().replace(/\s+/g, '_')
  return STATUS_BADGE[key] ?? 'bg-muted text-muted-foreground border-border'
}

export function formatWheelPositionDisplay(position: string | null): string {
  if (!position?.trim()) return '—'
  const code = position.trim().toUpperCase()
  const label = WHEEL_LABELS[code]
  return label ? `${code} — ${label}` : code
}

/** عرض عمق المداس: إن وُجد رقم صريح يُعرض بالمليمتر، وإلا النص الخام أو شرطة */
export function formatTreadDepthDisplay(treadCondition: string | null): string {
  if (treadCondition == null || !String(treadCondition).trim()) return '—'
  const s = String(treadCondition).trim()
  const num = /^(\d+(?:\.\d+)?)\s*(?:mm)?$/i.exec(s)
  if (num) return `${num[1]} mm`
  if (/^\d+(\.\d+)?$/.test(s)) return `${s} mm`
  return s
}

/** الوصف الخام من حقل description، أو شرطة إن لم يكن موجوداً */
export function formatTireDescription(description: string | null): string {
  const s = description?.trim()
  return s ? s : '—'
}
