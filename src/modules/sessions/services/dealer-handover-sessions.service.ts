import axios from "axios";
import api from "@/lib/api";
import type { HandoverDirection } from "@/modules/shipment-requests/services/dealer-handover.service";
import {
  normalizeHandoverSessionDto,
  toHandoverSessionRow,
  type HandoverSessionRow,
} from "@/modules/sessions/lib/handover-session-dto";

export type HandoverSessionStatusFilter = "OPEN" | "CLOSED" | "CANCELLED";

export type DealerHandoverSessionsQuery = {
  direction: HandoverDirection;
  page?: number;
  size?: number;
  sortBy?: string;
  /** Sort order — API uses `sort`, not `direction` (direction is handover inbound/outbound). */
  sort?: "asc" | "desc";
  status?: HandoverSessionStatusFilter;
  dateFrom?: string;
  dateTo?: string;
  locale?: string;
};

export type DealerHandoverSessionsPagedMeta = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type DealerHandoverSessionsPagedResult = {
  rows: HandoverSessionRow[];
  meta: DealerHandoverSessionsPagedMeta;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

function buildQueryString(query: DealerHandoverSessionsQuery): string {
  const {
    direction,
    page = 0,
    size = 20,
    sortBy = "openedAt",
    sort = "desc",
    status,
    dateFrom,
    dateTo,
  } = query;
  const sp = new URLSearchParams();
  sp.set("direction", direction);
  sp.set("page", String(page));
  sp.set("size", String(size));
  sp.set("sortBy", sortBy);
  sp.set("sort", sort);
  if (status) sp.set("status", status);
  if (dateFrom?.trim()) sp.set("dateFrom", dateFrom.trim());
  if (dateTo?.trim()) sp.set("dateTo", dateTo.trim());
  return sp.toString();
}

/** GET /v1/dealer/handover/all — paginated handover sessions by direction. */
export async function listDealerHandoverSessionsPaged(
  query: DealerHandoverSessionsQuery,
): Promise<DealerHandoverSessionsPagedResult> {
  const qs = buildQueryString(query);
  const page = query.page ?? 0;
  const size = query.size ?? 20;
  const locale = query.locale ?? "en";

  try {
    const { data } = await api.get<unknown>(`/v1/dealer/handover/all?${qs}`);
    const root = asRecord(data);
    const items = root && Array.isArray(root.content) ? root.content : [];

    const rows: HandoverSessionRow[] = [];
    for (const item of items) {
      const normalized = normalizeHandoverSessionDto(item);
      if (normalized) rows.push(toHandoverSessionRow(normalized, locale));
    }

    if (root && Array.isArray(root.content)) {
      return {
        rows,
        meta: {
          page: num(root.number) ?? page,
          size: num(root.size) ?? size,
          totalPages: num(root.totalPages) ?? 1,
          totalElements: num(root.totalElements) ?? rows.length,
          numberOfElements: num(root.numberOfElements) ?? rows.length,
          first: Boolean(root.first ?? true),
          last: Boolean(root.last ?? true),
          empty: Boolean(root.empty ?? rows.length === 0),
        },
      };
    }

    return {
      rows,
      meta: {
        page,
        size,
        totalPages: 1,
        totalElements: rows.length,
        numberOfElements: rows.length,
        first: true,
        last: true,
        empty: rows.length === 0,
      },
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
