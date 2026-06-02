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
});

export type CreateDealerCustomerRequest = z.infer<typeof createDealerCustomerRequestSchema>;
export type DealerCustomer = z.infer<typeof dealerCustomerResponseSchema>;
export type CreateDealerCustomerFormValues = z.infer<
  ReturnType<typeof createDealerCustomerFormFieldsSchema>
>;
