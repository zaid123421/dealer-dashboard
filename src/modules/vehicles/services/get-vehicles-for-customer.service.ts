import axios from "axios";
import api from "@/lib/api";
import { z } from "zod";
import {
  dealerCustomerVehicleSchema,
  type DealerCustomerVehicle,
} from "@/modules/vehicles/schemas/dealer-customer-vehicle.schema";

function unwrapArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "data" in data) {
    const inner = (data as { data: unknown }).data;
    if (Array.isArray(inner)) return inner;
  }
  return [];
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

export async function getVehiclesForCustomerService(
  customerId: number,
): Promise<DealerCustomerVehicle[]> {
  try {
    const { data } = await api.get<unknown>(`/v1/dealerCustomers/${customerId}/vehicles`);
    const raw = unwrapArray(data);
    return z.array(dealerCustomerVehicleSchema).parse(raw);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
