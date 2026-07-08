/** Map next-intl locale codes to stable BCP-47 tags for SSR/client parity. */
export function toIntlLocale(locale: string): string {
  if (locale === "ar") return "ar-SA";
  if (locale === "en") return "en-US";
  return locale;
}

const EMPTY_VALUE = "—";

export function formatLocaleDate(
  value: string | Date | null | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value == null || value === "") return EMPTY_VALUE;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : EMPTY_VALUE;
  }

  try {
    return date.toLocaleDateString(toIntlLocale(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    });
  } catch {
    return EMPTY_VALUE;
  }
}

export function formatLocaleDateTime(
  value: string | Date | null | undefined,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value == null || value === "") return EMPTY_VALUE;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : EMPTY_VALUE;
  }

  try {
    return date.toLocaleString(toIntlLocale(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    });
  } catch {
    return EMPTY_VALUE;
  }
}

export function formatLocaleNumber(
  value: number | null | undefined,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  if (value == null || Number.isNaN(value)) return EMPTY_VALUE;

  try {
    return value.toLocaleString(toIntlLocale(locale), options);
  } catch {
    return String(value);
  }
}
