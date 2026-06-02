/** Placeholder for empty / null table cells — matches the rest of the app. */
export const TABLE_EMPTY_VALUE = "—";

export function formatTableCell(value: string | number | null | undefined): string {
  if (value == null) return TABLE_EMPTY_VALUE;
  if (typeof value === "string" && value.trim() === "") return TABLE_EMPTY_VALUE;
  return String(value);
}

export function formatOdometer(km: number | null | undefined): string {
  if (km == null) return TABLE_EMPTY_VALUE;
  return `${km.toLocaleString()} km`;
}

export function formatVehicleLabel(
  make: string | null | undefined,
  model: string | null | undefined,
  year: number | null | undefined,
): string {
  const parts: string[] = [];
  if (make?.trim()) parts.push(make.trim());
  if (model?.trim()) parts.push(model.trim());
  const name = parts.join(" ");
  if (year != null) {
    return name ? `${name} (${year})` : String(year);
  }
  return name || TABLE_EMPTY_VALUE;
}
