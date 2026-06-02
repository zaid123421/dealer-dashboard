import { z } from "zod";

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

export type VehicleValidationMessages = {
  required: string;
  invalidVin: string;
  invalidYear: string;
};

const defaultValidationMessages: VehicleValidationMessages = {
  required: "This field is required",
  invalidVin: "VIN must be exactly 17 characters (letters and numbers, no I, O, or Q)",
  invalidYear: "Enter a valid year between 1980 and 2035",
};

/** Form validation — VIN and year are required (matches VehicleRequestDTO). */
export function createVehicleFormFieldsSchema(
  messages: VehicleValidationMessages = defaultValidationMessages,
) {
  return z.object({
    vin: z
      .string()
      .trim()
      .min(1, messages.required)
      .length(17, messages.invalidVin)
      .regex(VIN_PATTERN, messages.invalidVin),
    year: z.preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const n = typeof val === "number" ? val : Number(val);
        return Number.isNaN(n) ? undefined : n;
      },
      z
        .number({ message: messages.required })
        .int(messages.invalidYear)
        .min(1980, messages.invalidYear)
        .max(2035, messages.invalidYear),
    ),
    make: z.string().trim(),
    model: z.string().trim(),
    plateNumber: z.string().trim(),
    color: z.string().trim(),
    odometerKm: z.preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return 0;
        const n = typeof val === "number" ? val : Number(val);
        return Number.isNaN(n) ? 0 : n;
      },
      z.coerce.number().int().min(0),
    ),
  });
}

/** @deprecated Use createVehicleFormFieldsSchema with translated messages. */
export const createVehicleFormSchema = createVehicleFormFieldsSchema();

export const createVehicleRequestSchema = z.object({
  vin: z.string().trim().length(17).regex(VIN_PATTERN),
  year: z.number().int(),
  make: z.string().trim().optional(),
  model: z.string().trim().optional(),
  plateNumber: z.string().trim().optional(),
  color: z.string().trim().optional(),
  odometerKm: z.number().int().min(0).optional(),
});

export type CreateVehicleFormValues = z.infer<
  ReturnType<typeof createVehicleFormFieldsSchema>
>;
export type CreateVehicleRequest = z.infer<typeof createVehicleRequestSchema>;

export function mapVehicleFormToRequest(values: CreateVehicleFormValues): CreateVehicleRequest {
  const make = values.make.trim();
  const model = values.model.trim();
  const plateNumber = values.plateNumber.trim();
  const color = values.color.trim();

  return createVehicleRequestSchema.parse({
    vin: values.vin.trim().toUpperCase(),
    year: values.year,
    ...(make ? { make } : {}),
    ...(model ? { model } : {}),
    ...(plateNumber ? { plateNumber } : {}),
    ...(color ? { color } : {}),
    ...(values.odometerKm > 0 ? { odometerKm: values.odometerKm } : {}),
  });
}
