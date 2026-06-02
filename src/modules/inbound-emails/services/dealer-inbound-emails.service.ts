import axios from "axios";
import api from "@/lib/api";
import {
  inboundEmailToSuggestion,
  normalizeInboundEmailDto,
  type EmailSuggestion,
} from "@/modules/inbound-emails/lib/inbound-email-dto";

export type DealerInboundEmailsQuery = {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
  locale?: string;
};

export type DealerInboundEmailsPagedMeta = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type DealerInboundEmailsPagedResult = {
  rows: EmailSuggestion[];
  meta: DealerInboundEmailsPagedMeta;
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

function buildQueryString(query: DealerInboundEmailsQuery): string {
  const { page = 0, size = 20, sortBy = "receivedAt", direction = "desc" } = query;
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  sp.set("size", String(size));
  sp.set("sortBy", sortBy);
  sp.set("direction", direction);
  return sp.toString();
}

/**
 * GET /v1/dealer/inbound-emails — paginated inbound email log.
 */
export async function listDealerInboundEmailsPaged(
  query: DealerInboundEmailsQuery = {},
): Promise<DealerInboundEmailsPagedResult> {
  const qs = buildQueryString(query);
  const page = query.page ?? 0;
  const size = query.size ?? 20;
  const locale = query.locale ?? "en";

  try {
    const { data } = await api.get<unknown>(`/v1/dealer/inbound-emails?${qs}`);
    const root = asRecord(data);
    const items = root && Array.isArray(root.content) ? root.content : [];

    const rows: EmailSuggestion[] = [];
    for (const item of items) {
      const normalized = normalizeInboundEmailDto(item);
      if (normalized) rows.push(inboundEmailToSuggestion(normalized, locale));
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
