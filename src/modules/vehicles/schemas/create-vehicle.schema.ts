import { z } from "zod";

/** حقول POST /v1/dealerCustomers/:customerId/vehicles */
export const createVehicleFormSchema = z.object({
  vin: z.string().trim().min(1).max(17),
  year: z.coerce.number().int().min(1980).max(2035),
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  plateNumber: z.string().trim().min(1),
  color: z.string().trim().min(1),
  odometerKm: z.coerce.number().int().min(0),
});

export const createVehicleRequestSchema = z.object({
  vin: z.string().trim().min(1).max(17),
  year: z.number().int(),
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  plateNumber: z.string().trim().min(1),
  color: z.string().trim().min(1),
  odometerKm: z.number().int().min(0),
});

export type CreateVehicleFormValues = z.infer<typeof createVehicleFormSchema>;
export type CreateVehicleRequest = z.infer<typeof createVehicleRequestSchema>;

export function mapVehicleFormToRequest(values: CreateVehicleFormValues): CreateVehicleRequest {
  return createVehicleRequestSchema.parse({
    vin: values.vin.trim().toUpperCase(),
    year: values.year,
    make: values.make.trim(),
    model: values.model.trim(),
    plateNumber: values.plateNumber.trim(),
    color: values.color.trim(),
    odometerKm: values.odometerKm,
  });
}
