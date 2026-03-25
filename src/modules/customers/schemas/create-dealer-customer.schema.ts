import { z } from "zod";

export const createDealerCustomerFormFieldsSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  countryCode: z.string().min(1),
  phoneLocal: z.string().trim().min(1),
  address: z.object({
    cityId: z
      .string()
      .trim()
      .regex(/^\d+$/, "invalidId"),
    countryId: z
      .string()
      .trim()
      .regex(/^\d+$/, "invalidId"),
    stateId: z
      .string()
      .trim()
      .regex(/^\d+$/, "invalidId"),
    streetName: z.string().trim().min(1),
    streetNumber: z.string().trim().min(1),
    postalCode: z.string().trim().min(1),
    unitNumber: z.string().trim(),
    specialInstructions: z.string().trim(),
  }),
});

export const createDealerCustomerRequestSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  address: z.object({
    cityId: z.number().int().positive(),
    countryId: z.number().int().positive(),
    stateId: z.number().int().positive(),
    streetName: z.string().min(1),
    streetNumber: z.string().min(1),
    postalCode: z.string().min(1),
    unitNumber: z.string(),
    specialInstructions: z.string(),
  }),
  phoneNumber: z.string().trim().min(1),
});

/** يحوّل قيم النموذج إلى body الـ API (بعد نجاح zodResolver على الحقول). */
export function mapDealerCustomerFormToRequest(
  data: CreateDealerCustomerFormValues,
): CreateDealerCustomerRequest {
  return createDealerCustomerRequestSchema.parse({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneLocal.replace(/\D/g, ""),
    address: {
      cityId: Number.parseInt(data.address.cityId, 10),
      countryId: Number.parseInt(data.address.countryId, 10),
      stateId: Number.parseInt(data.address.stateId, 10),
      streetName: data.address.streetName,
      streetNumber: data.address.streetNumber,
      postalCode: data.address.postalCode,
      unitNumber: data.address.unitNumber.trim(),
      specialInstructions: data.address.specialInstructions.trim(),
    },
  });
}

export const dealerCustomerAddressResponseSchema = z.object({
  id: z.number(),
  streetName: z.string(),
  streetNumber: z.string(),
  postalCode: z.string(),
  unitNumber: z.string().nullish(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  specialInstructions: z.string().nullish(),
  /** قد تُعاد من GET للعميل لتعبئة التعديل */
  cityId: z.number().optional(),
  countryId: z.number().optional(),
  stateId: z.number().optional(),
});

export const dealerCustomerResponseSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  address: dealerCustomerAddressResponseSchema,
  phoneNumber: z.string(),
  dealerId: z.number(),
  dealerName: z.string(),
  dealerCustomerUniqueId: z.string(),
  archived: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string(),
  updatedBy: z.string(),
});

export type CreateDealerCustomerRequest = z.infer<typeof createDealerCustomerRequestSchema>;
export type DealerCustomer = z.infer<typeof dealerCustomerResponseSchema>;
export type CreateDealerCustomerFormValues = z.infer<typeof createDealerCustomerFormFieldsSchema>;
