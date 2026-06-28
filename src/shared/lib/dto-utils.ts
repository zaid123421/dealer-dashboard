/**
 * أدوات تطبيع مشتركة لاستجابات الـ API.
 * استُخرجت من النسخ المكررة في use-cases و DTO normalizers.
 */

/** يرجع الكائن كـ Record أو null إن لم يكن كائناً عادياً. */
export function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

/** نص مُشذّب أو "" إن لم يكن نصاً. */
export function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** رقم محدود أو 0 (يقبل النص الرقمي). */
export function num(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

/** true فقط عند القيمة المنطقية true. */
export function bool(v: unknown): boolean {
  return v === true;
}

/** نص غير فارغ من مفتاح داخل كائن، وإلا undefined (يحافظ على القيمة بدون تشذيب). */
export function pickString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" && v.trim() ? v : undefined;
}

/** رقم من مفتاح داخل كائن، وإلا 0. */
export function pickNumber(obj: Record<string, unknown>, key: string): number {
  return num(obj[key]);
}

/** يفك تغليف `{ data: {...} }` ويعيد الجسم الفعلي كـ Record. */
export function unwrapPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") return {};
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return root;
}
