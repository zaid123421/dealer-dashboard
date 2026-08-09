export type NormalizedHandoverScan = {
  /** React list key (string form of API id, or synthetic fallback). */
  id: string;
  /** Numeric API scan id for dismiss; null when not available. */
  scanId: number | null;
  label: string;
  /** Scan outcome from API (`result`), e.g. MATCH / DISMISSED. */
  result: string | null;
  detail: string | null;
  scannedAt: string | null;
};

const DISMISSIBLE_SCAN_RESULTS = new Set([
  "UNKNOWN_TIRE",
  "NOT_IN_MANIFEST",
]);

export function isDismissibleScanResult(result: string | null | undefined): boolean {
  if (!result) return false;
  return DISMISSIBLE_SCAN_RESULTS.has(result.trim().toUpperCase());
}

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
    return {
      id: `scan-${index}`,
      scanId: null,
      label: raw.trim(),
      result: null,
      detail: null,
      scannedAt: null,
    };
  }

  const obj = asRecord(raw);
  if (!obj) {
    return {
      id: `scan-${index}`,
      scanId: null,
      label: "—",
      result: null,
      detail: null,
      scannedAt: null,
    };
  }

  const label =
    str(obj.rawCode) ??
    (num(obj.rawCode) != null ? String(num(obj.rawCode)) : undefined) ??
    str(obj.barcode) ??
    str(obj.code) ??
    "—";

  const result = str(obj.result)?.toUpperCase() ?? null;
  const scanId = num(obj.id) ?? null;

  return {
    id: scanId != null ? String(scanId) : `scan-${index}-${label}`,
    scanId,
    label,
    result,
    detail:
      num(obj.resolvedTireId) != null
        ? `Tire #${num(obj.resolvedTireId)}`
        : null,
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

  const scanSource = Array.isArray(obj.newScans) ? obj.newScans : [];
  const newScans = scanSource.map((item, index) => normalizeScan(item, index));

  return {
    sessionId,
    status: str(obj.status)?.toUpperCase() ?? "OPEN",
    matched: num(obj.matched) ?? 0,
    total: num(obj.total) ?? 0,
    discrepancies: num(obj.discrepancies) ?? 0,
    newScans,
  };
}

/** Badge colors for scan `result` values from handover state. */
export function scanResultBadgeClass(result: string | null | undefined): string {
  switch ((result ?? "").trim().toUpperCase()) {
    case "MATCH":
      return "border-0 bg-emerald-600 text-white shadow-none";
    case "UNKNOWN_TIRE":
      return "border-0 bg-amber-500 text-white shadow-none";
    case "NOT_IN_MANIFEST":
      return "border-0 bg-destructive text-destructive-foreground shadow-none";
    case "DUPLICATE":
      return "border-0 bg-violet-600 text-white shadow-none";
    case "DISMISSED":
      return "border-0 bg-slate-500 text-white shadow-none";
    default:
      return result
        ? "border-0 bg-slate-600 text-white shadow-none"
        : "border-0 bg-muted text-muted-foreground shadow-none";
  }
}

/** Fallback label when no i18n key exists for a result code. */
export function formatScanResultLabel(result: string | null | undefined): string {
  const key = (result ?? "").trim();
  if (!key) return "—";
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
