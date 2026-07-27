export type NormalizedHandoverScan = {
  id: string;
  label: string;
  detail: string | null;
  scannedAt: string | null;
};

export type NormalizedHandoverSessionState = {
  sessionId: number;
  status: string;
  matched: number;
  total: number;
  discrepancies: number;
  newScans: NormalizedHandoverScan[];
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
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function normalizeScan(raw: unknown, index: number): NormalizedHandoverScan {
  if (typeof raw === "string" && raw.trim()) {
    return { id: `scan-${index}`, label: raw.trim(), detail: null, scannedAt: null };
  }

  const obj = asRecord(raw);
  if (!obj) {
    return { id: `scan-${index}`, label: "—", detail: null, scannedAt: null };
  }

  const label =
    str(obj.barcode) ??
    str(obj.code) ??
    str(obj.uid) ??
    str(obj.uniqueId) ??
    str(obj.label) ??
    str(obj.tireId) ??
    (num(obj.tireId) != null ? String(num(obj.tireId)) : undefined) ??
    "—";

  const detailParts = [
    str(obj.tireSetLabel),
    str(obj.position),
    str(obj.customerDisplayName),
  ].filter(Boolean);

  return {
    id: str(obj.id) ?? `scan-${index}-${label}`,
    label,
    detail: detailParts.length > 0 ? detailParts.join(" · ") : null,
    scannedAt: str(obj.scannedAt) ?? str(obj.createdAt) ?? null,
  };
}

/** Accepts GET /v1/dealer/handover/{id}/state payload (or `{ data: ... }`). */
export function normalizeHandoverSessionState(raw: unknown): NormalizedHandoverSessionState | null {
  if (!raw || typeof raw !== "object") return null;
  const root = raw as Record<string, unknown>;
  const obj =
    root.data && typeof root.data === "object" && !Array.isArray(root.data)
      ? (root.data as Record<string, unknown>)
      : root;

  const sessionId = num(obj.sessionId ?? obj.id);
  if (sessionId == null) return null;

  const newScans: NormalizedHandoverScan[] = [];
  if (Array.isArray(obj.newScans)) {
    obj.newScans.forEach((item, index) => {
      newScans.push(normalizeScan(item, index));
    });
  }

  return {
    sessionId,
    status: str(obj.status)?.toUpperCase() ?? "OPEN",
    matched: num(obj.matched) ?? 0,
    total: num(obj.total) ?? 0,
    discrepancies: num(obj.discrepancies) ?? 0,
    newScans,
  };
}
