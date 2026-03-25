import axios from "axios";
import api from "@/lib/api";
import {
  createVehicleRequestSchema,
  type CreateVehicleRequest,
} from "@/modules/vehicles/schemas/create-vehicle.schema";

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

/**
 * يفترض: POST /v1/dealerCustomers/:dealerCustomerId/vehicles
 * عدّل المسار إن كان الـ OpenAPI عندكم مختلفاً.
 */
export async function createVehicleForCustomerService(
  dealerCustomerId: number,
  payload: CreateVehicleRequest,
): Promise<void> {
  const body = createVehicleRequestSchema.parse(payload);
  try {
    await api.post(`/v1/dealerCustomers/${dealerCustomerId}/vehicles`, body);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
