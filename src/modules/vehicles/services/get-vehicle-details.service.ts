import axios from "axios";
import { z } from "zod";
import api from "@/lib/api";
import {
  vehicleDetailsSchema,
  type VehicleDetails,
} from "@/modules/vehicles/schemas/dealer-customer-vehicle.schema";

function unwrapVehiclePayload(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner;
  }
  return data;
}

function messageFromResponseData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  if (typeof rec.message === "string" && rec.message.trim()) return rec.message;
  return undefined;
}

export async function getVehicleDetailsService(
  customerId: number,
  vehicleId: number,
): Promise<VehicleDetails> {
  try {
    const { data } = await api.get<unknown>(
      `/v1/dealerCustomers/${customerId}/vehicles/${vehicleId}`,
    );
    const raw = unwrapVehiclePayload(data);
    return vehicleDetailsSchema.parse(raw);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      throw new Error("Invalid vehicle details response from API");
    }
    if (axios.isAxiosError(err)) {
      const msg =
        messageFromResponseData(err.response?.data) ?? err.message ?? "Request failed";
      throw new Error(msg);
    }
    throw err;
  }
}
