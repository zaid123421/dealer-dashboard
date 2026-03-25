import { z } from "zod";

export const dealerCustomerVehicleSchema = z.object({
  id: z.number(),
  dealerCustomerId: z.number(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  plateNumber: z.string(),
  vin: z.string(),
  color: z.string(),
  odometerKm: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DealerCustomerVehicle = z.infer<typeof dealerCustomerVehicleSchema>;
