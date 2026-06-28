/**
 * استخراج موحّد لرسالة الخطأ من جسم استجابة الـ API.
 * يدعم `{ message }` و `{ errors: [{ message }] }`.
 */
export function getApiErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  const errors = rec.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const first = errors[0];
    if (first && typeof first === "object" && "message" in first) {
      const m = (first as { message?: unknown }).message;
      if (typeof m === "string" && m.trim()) return m;
    }
  }
  return undefined;
}
