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
 * يفترض: PUT /v1/dealerCustomers/:customerId/vehicles/:vehicleId
 * عدّل المسار إن اختلف الـ OpenAPI.
 */
export async function updateVehicleForCustomerService(
  dealerCustomerId: number,
  vehicleId: number,
  payload: CreateVehicleRequest,
): Promise<void> {
  const body = createVehicleRequestSchema.parse(payload);
  try {
    await api.put(`/v1/dealerCustomers/${dealerCustomerId}/vehicles/${vehicleId}`, body);
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
