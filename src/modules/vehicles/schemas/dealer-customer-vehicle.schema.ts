import { z } from "zod";

/** API may return null for optional vehicle fields — normalize for the UI. */
function apiOptionalString() {
  return z.preprocess(
    (val) => (val == null ? "" : val),
    z.string(),
  );
}

function apiNullableNumber() {
  return z.union([z.number(), z.null()]);
}

export const dealerCustomerVehicleSchema = z.object({
  id: z.number(),
  dealerCustomerId: z.number(),
  make: apiOptionalString(),
  model: apiOptionalString(),
  year: apiNullableNumber(),
  plateNumber: apiOptionalString(),
  vin: apiOptionalString(),
  color: apiOptionalString(),
  odometerKm: apiNullableNumber(),
  createdAt: apiOptionalString(),
  updatedAt: apiOptionalString(),
});

export type DealerCustomerVehicle = z.infer<typeof dealerCustomerVehicleSchema>;

/** GET /dealerCustomers/:id/vehicles/:vehicleId — same shape as list items */
export const vehicleDetailsSchema = dealerCustomerVehicleSchema;
export type VehicleDetails = DealerCustomerVehicle;
