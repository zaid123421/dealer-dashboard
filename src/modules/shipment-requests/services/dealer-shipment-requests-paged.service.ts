import axios from "axios";
import api from "@/lib/api";
import {
  extractShipmentRequestListPayload,
  normalizeShipmentRequestDto,
  type NormalizedDeliveryOrderRow,
} from "@/modules/shipment-requests/lib/shipment-request-dto";

export type DealerShipmentRequestsPagedQuery = {
  statuses: string | string[];
  direction: "DELIVERY" | "PICKUP";
  page?: number;
  size?: number;
  sortBy?: string;
};

export type DealerShipmentRequestsPagedMeta = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type DealerShipmentRequestsPagedResult = {
  rows: NormalizedDeliveryOrderRow[];
  meta: DealerShipmentRequestsPagedMeta;
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

function buildQueryString(query: DealerShipmentRequestsPagedQuery): string {
  const { statuses, direction, page = 0, size = 20, sortBy = "createdAt" } = query;
  const sp = new URLSearchParams();
  const list = Array.isArray(statuses) ? statuses : [statuses];
  for (const s of list) {
    if (s) sp.append("statuses", s);
  }
  sp.set("direction", direction);
  sp.set("page", String(page));
  sp.set("size", String(size));
  sp.set("sortBy", sortBy);
  return sp.toString();
}

/**
 * GET /v1/dealer/shipment-requests — قائمة مموّجة (statuses وdirection وpage…).
 */
export async function listDealerShipmentRequestsPaged(
  query: DealerShipmentRequestsPagedQuery,
): Promise<DealerShipmentRequestsPagedResult> {
  const qs = buildQueryString(query);
  const page = query.page ?? 0;
  const size = query.size ?? 20;
  try {
    const { data } = await api.get<unknown>(`/v1/dealer/shipment-requests?${qs}`);
    const root = asRecord(data);

    let items: unknown[] = [];
    if (root && Array.isArray(root.content)) {
      items = root.content;
    } else {
      items = extractShipmentRequestListPayload(data);
    }

    const rows: NormalizedDeliveryOrderRow[] = [];
    for (const item of items) {
      const row = normalizeShipmentRequestDto(item);
      if (row) rows.push(row);
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
