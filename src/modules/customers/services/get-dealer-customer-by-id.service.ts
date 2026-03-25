import axios from "axios";
import api from "@/lib/api";
import {
  dealerCustomerResponseSchema,
  type DealerCustomer,
} from "@/modules/customers/schemas/create-dealer-customer.schema";

function unwrapPayload(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object") return {};
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return root;
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

export async function getDealerCustomerByIdService(customerId: number): Promise<DealerCustomer> {
  try {
    const { data } = await api.get<unknown>(`/v1/dealerCustomers/${customerId}`);
    const raw = unwrapPayload(data);
    return dealerCustomerResponseSchema.parse(raw);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
