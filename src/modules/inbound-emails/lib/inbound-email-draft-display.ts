import type { NormalizedShipmentRequestDetailSetRow } from "@/modules/shipment-requests/lib/shipment-request-detail-dto";
import { APP_TIME_ZONE, formatLocaleDateTime, toIntlLocale } from "@/lib/format-locale";

export function formatDraftAppointment(iso: string | null | undefined, locale: string): string {
  if (!iso?.trim()) return "—";
  return formatLocaleDateTime(iso, locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDraftTimeWindow(iso: string | null | undefined, locale: string): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleTimeString(toIntlLocale(locale), {
      hour: "numeric",
      minute: "2-digit",
      timeZone: APP_TIME_ZONE,
    });
  } catch {
    return "—";
  }
}

export function formatDraftVehicle(vehiclePlate: string, vehicleVin: string): string {
  const parts = [
    vehiclePlate && vehiclePlate !== "—" ? `Plate ${vehiclePlate}` : null,
    vehicleVin && vehicleVin !== "—" ? vehicleVin : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

export function formatDraftTireSets(sets: NormalizedShipmentRequestDetailSetRow[]): string {
  if (sets.length === 0) return "—";

  return sets
    .map((set) => {
      const label = set.displayLabel?.trim();
      if (label) return label;

      const season =
        set.seasonType.trim().length > 0
          ? `${set.seasonType.charAt(0)}${set.seasonType.slice(1).toLowerCase()} set`
          : "Tire set";
      const count = set.tireCount > 0 ? `(${set.tireCount} tires)` : null;
      const spec = [set.brand, set.size].filter(Boolean).join(" ");
      return [season, count, spec].filter(Boolean).join(" ");
    })
    .join("; ");
}

/** Prefer plain-text portion of inbound email body; strip HTML when needed. */
export function formatInboundEmailBody(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";

  const htmlStart = raw.search(/<\s*(?:html|div|p|br|span|table|body)\b/i);
  const candidate = (htmlStart > 0 ? raw.slice(0, htmlStart) : raw)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (candidate && !/<[a-z]/i.test(candidate)) return candidate;

  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
