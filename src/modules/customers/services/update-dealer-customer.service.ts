import axios from "axios";
import api from "@/lib/api";
import type { CreateDealerCustomerRequest } from "@/modules/customers/schemas/create-dealer-customer.schema";
import { createDealerCustomerRequestSchema } from "@/modules/customers/schemas/create-dealer-customer.schema";

function messageFromResponseData(data: unknown): string | undefined {
  if (data == null) return undefined;
  if (typeof data === "string" && data.trim()) return data.slice(0, 800);
  if (typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  for (const key of ["message", "detail", "title", "error"] as const) {
    const v = rec[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  const errs = rec.errors;
  if (errs && typeof errs === "object" && !Array.isArray(errs)) {
    for (const v of Object.values(errs)) {
      if (Array.isArray(v) && typeof v[0] === "string") return v[0];
      if (typeof v === "string") return v;
    }
  }
  return undefined;
}

export async function updateDealerCustomerService(
  customerId: number,
  payload: CreateDealerCustomerRequest,
): Promise<void> {
  const body = createDealerCustomerRequestSchema.parse(payload);
  try {
    await api.put(`/v1/dealerCustomers/${customerId}`, body);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (process.env.NODE_ENV === "development" && err.response) {
        console.error("[updateDealerCustomer] failed", {
          status: err.response.status,
          url: err.config?.url,
          fullURL: `${api.defaults.baseURL ?? ""}${err.config?.url ?? ""}`,
          requestBody: err.config?.data,
          data: err.response.data,
        });
      }
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
