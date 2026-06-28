import type { NormalizedShipmentRequestDetailSetRow } from "@/modules/shipment-requests/lib/shipment-request-detail-dto";

export function formatDraftAppointment(iso: string | null | undefined, locale: string): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function formatDraftTimeWindow(iso: string | null | undefined, locale: string): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
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
