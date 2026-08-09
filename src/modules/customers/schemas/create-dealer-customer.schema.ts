import { z } from "zod";

export type DealerCustomerValidationMessages = {
  required: string;
  invalidEmail: string;
  invalidId: string;
};

const defaultValidationMessages: DealerCustomerValidationMessages = {
  required: "Required",
  invalidEmail: "Invalid email address",
  invalidId: "Please select a valid option",
};

function requiredRegionId(messages: DealerCustomerValidationMessages) {
  return z
    .string()
    .trim()
    .min(1, messages.required)
    .regex(/^\d+$/, messages.invalidId);
}

/** Form validation — email and phone are both required. */
export function createDealerCustomerFormFieldsSchema(
  messages: DealerCustomerValidationMessages = defaultValidationMessages,
) {
  return z.object({
    firstName: z.string().trim().min(1, messages.required),
    lastName: z.string().trim().min(1, messages.required),
    email: z
      .string()
      .trim()
      .min(1, messages.required)
      .email(messages.invalidEmail),
    countryCode: z.string().min(1),
    phoneLocal: z
      .string()
      .trim()
      .min(1, messages.required)
      .refine((val) => val.replace(/\D/g, "").length > 0, {
        message: messages.required,
      }),
    address: z.object({
      cityId: requiredRegionId(messages),
      countryId: requiredRegionId(messages),
      stateId: requiredRegionId(messages),
      streetName: z.string().trim().min(1, messages.required),
      streetNumber: z.string().trim(),
      postalCode: z.string().trim(),
      unitNumber: z.string().trim(),
      specialInstructions: z.string().trim(),
    }),
  });
}

export const dealerCustomerAddressRequestSchema = z.object({
  cityId: z.number().int().positive(),
  countryId: z.number().int().positive(),
  stateId: z.number().int().positive(),
  streetName: z.string().trim().min(1),
  streetNumber: z.string().optional(),
  postalCode: z.string().optional(),
  unitNumber: z.string().optional(),
  specialInstructions: z.string().optional(),
});

/** API body validation — email and phone are both required. */
export const createDealerCustomerRequestSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phoneNumber: z.string().trim().min(1),
  address: dealerCustomerAddressRequestSchema,
});

/** يحوّل قيم النموذج إلى body الـ API (بعد نجاح zodResolver على الحقول). */
export function mapDealerCustomerFormToRequest(
  data: CreateDealerCustomerFormValues,
): CreateDealerCustomerRequest {
  const streetNumber = data.address.streetNumber.trim();
  const postalCode = data.address.postalCode.trim();
  const unitNumber = data.address.unitNumber.trim();
  const specialInstructions = data.address.specialInstructions.trim();

  return createDealerCustomerRequestSchema.parse({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim(),
    phoneNumber: data.phoneLocal.replace(/\D/g, ""),
    address: {
      cityId: Number.parseInt(data.address.cityId, 10),
      countryId: Number.parseInt(data.address.countryId, 10),
      stateId: Number.parseInt(data.address.stateId, 10),
      streetName: data.address.streetName.trim(),
      ...(streetNumber ? { streetNumber } : {}),
      ...(postalCode ? { postalCode } : {}),
      ...(unitNumber ? { unitNumber } : {}),
      ...(specialInstructions ? { specialInstructions } : {}),
    },
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value);
  return undefined;
}

function pickRegionFromApi(
  raw: Record<string, unknown>,
  nameKey: string,
  idKeys: string[],
): { name: string; id?: number } {
  const direct = raw[nameKey];
  if (typeof direct === "string") return { name: direct };
  const nested = asRecord(direct);
  if (!nested) return { name: "" };

  const name = typeof nested.name === "string" ? nested.name : "";
  let id: number | undefined;
  for (const key of ["id", ...idKeys]) {
    const candidate = pickNumber(nested[key]);
    if (candidate != null) {
      id = candidate;
      break;
    }
  }
  return { name, id };
}

function normalizeDealerCustomerAddress(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const rec = raw as Record<string, unknown>;

  const country = pickRegionFromApi(rec, "country", ["countryId"]);
  const province = pickRegionFromApi(rec, "province", ["stateId", "provinceId"]);
  const state = pickRegionFromApi(rec, "state", ["stateId", "provinceId"]);
  const city = pickRegionFromApi(rec, "city", ["cityId"]);

  const provinceName =
    province.name || state.name || (typeof rec.province === "string" ? rec.province : "");
  const countryName =
    country.name || (typeof rec.country === "string" ? rec.country : "");
  const cityName = city.name || (typeof rec.city === "string" ? rec.city : "");

  return {
    ...rec,
    country: countryName,
    province: provinceName,
    city: cityName,
    countryId: pickNumber(rec.countryId) ?? country.id,
    stateId: pickNumber(rec.stateId) ?? pickNumber(rec.provinceId) ?? province.id ?? state.id,
    cityId: pickNumber(rec.cityId) ?? city.id,
  };
}

export const dealerCustomerAddressResponseSchema = z.preprocess(
  normalizeDealerCustomerAddress,
  z.object({
  id: z.number(),
  streetName: z.union([z.string(), z.null(), z.undefined()]).transform((v) => v ?? ""),
  streetNumber: z.union([z.string(), z.null(), z.undefined()]).transform((v) => v ?? ""),
  postalCode: z.union([z.string(), z.null(), z.undefined()]).transform((v) => v ?? ""),
  unitNumber: z.union([z.string(), z.null(), z.undefined()]).transform((v) => v ?? ""),
  city: z.union([z.string(), z.null(), z.undefined()]).transform((v) => v ?? ""),
  province: z.union([z.string(), z.null(), z.undefined()]).transform((v) => v ?? ""),
  country: z.union([z.string(), z.null(), z.undefined()]).transform((v) => v ?? ""),
  specialInstructions: z.union([z.string(), z.null(), z.undefined()]).transform((v) => v ?? ""),
  /** قد تُعاد من GET للعميل لتعبئة التعديل */
  cityId: z.number().optional(),
  countryId: z.number().optional(),
  stateId: z.number().optional(),
  }),
);

export const dealerCustomerResponseSchema = z
  .object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    address: dealerCustomerAddressResponseSchema.nullable(),
    phoneNumber: z.string(),
    dealerId: z.number(),
    dealerName: z.string(),
    dealerCustomerUniqueId: z.string(),
    archived: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    createdBy: z.string(),
    updatedBy: z.string().nullable(),
    totalTireSets: z.coerce.number().nullish(),
    totalTires: z.coerce.number().nullish(),
  })
  .passthrough();

export type CreateDealerCustomerRequest = z.infer<typeof createDealerCustomerRequestSchema>;
export type DealerCustomer = z.infer<typeof dealerCustomerResponseSchema>;
export type CreateDealerCustomerFormValues = z.infer<
  ReturnType<typeof createDealerCustomerFormFieldsSchema>
>;
