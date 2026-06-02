/**
 * Normalizer for pickup-suggestion endpoint:
 * GET /v1/dealer/shipment-requests/{deliveryId}/pickup-suggestion
 */

export type NormalizedPickupCandidate = {
  setId: number;
  tireCount: number;
  seasonType: string;
  displayLabel: string;
  brand: string;
  model: string | null;
  size: string;
  /** Resolved label for UI (displayLabel or brand + size + season). */
  label: string;
};

export type NormalizedPickupSuggestionResult = {
  deliveryOrderId: number;
  windowStart: string | null;
  windowEnd: string | null;
  candidates: NormalizedPickupCandidate[];
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function str(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) return v.trim();
  return undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t) return undefined;
    const n = Number(t);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const found = str(obj[k]);
    if (found) return found;
  }
  return undefined;
}

function buildCandidateLabel(raw: Record<string, unknown>): string {
  const displayLabel = str(raw.displayLabel);
  if (displayLabel) return displayLabel;

  const brand = str(raw.brand) ?? "";
  const size = str(raw.size) ?? "";
  const seasonType = str(raw.seasonType) ?? "";
  const model = str(raw.model);
  const parts = [brand, model, size, seasonType].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");
  const setId = num(raw.setId);
  return setId != null ? `Set #${setId}` : "Tire set";
}

/** Normalize one item from `candidates[]`. */
export function normalizePickupCandidate(rawUnknown: unknown, idx: number): NormalizedPickupCandidate | null {
  const raw = asRecord(rawUnknown);
  if (!raw) return null;

  const setId = num(raw.setId ?? raw.tireSetId ?? raw.id);
  if (setId == null) return null;

  const brand = str(raw.brand) ?? "";
  const size = str(raw.size) ?? "";
  const seasonType = str(raw.seasonType ?? raw.season) ?? "";
  const model = str(raw.model) ?? null;

  return {
    setId,
    tireCount: num(raw.tireCount ?? raw.tiresCount ?? raw.quantity) ?? 0,
    seasonType,
    displayLabel: str(raw.displayLabel) ?? "",
    brand,
    model,
    size,
    label: buildCandidateLabel(raw) || `Set ${idx + 1}`,
  };
}

/** Accepts GET /v1/dealer/shipment-requests/{id}/pickup-suggestion body. */
export function normalizePickupSuggestionResponse(
  rawUnknown: unknown,
  fallbackDeliveryId?: number,
): NormalizedPickupSuggestionResult {
  const root = asRecord(rawUnknown);
  const empty: NormalizedPickupSuggestionResult = {
    deliveryOrderId: fallbackDeliveryId ?? 0,
    windowStart: null,
    windowEnd: null,
    candidates: [],
  };
  if (!root) return empty;

  const deliveryOrderId =
    num(root.deliveryOrderId ?? root.deliveryRequestId ?? root.id) ??
    fallbackDeliveryId ??
    0;

  const windowStart = pickString(root, ["windowStart", "suggestedWindowStart"]) ?? null;
  const windowEnd = pickString(root, ["windowEnd", "suggestedWindowEnd"]) ?? null;

  const candidateItems = Array.isArray(root.candidates)
    ? root.candidates
    : Array.isArray(root.content)
      ? root.content
      : [];

  const candidates: NormalizedPickupCandidate[] = [];
  for (let i = 0; i < candidateItems.length; i++) {
    const row = normalizePickupCandidate(candidateItems[i], i);
    if (row) candidates.push(row);
  }

  return {
    deliveryOrderId,
    windowStart,
    windowEnd,
    candidates,
  };
}
