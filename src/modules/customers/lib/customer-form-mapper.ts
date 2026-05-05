import type {
  CreateDealerCustomerFormValues,
  DealerCustomer,
} from "@/modules/customers/schemas/create-dealer-customer.schema";

/** أطوال البادئات من الأطول للأقصر لتفادي مطابقة جزئية خاطئة */
const DIAL_PREFIXES: { code: string; digits: string }[] = [
  { code: "+966", digits: "966" },
  { code: "+971", digits: "971" },
  { code: "+965", digits: "965" },
  { code: "+963", digits: "963" },
  { code: "+962", digits: "962" },
  { code: "+44", digits: "44" },
  { code: "+1", digits: "1" },
].sort((a, b) => b.digits.length - a.digits.length);

export function splitPhoneNumberForForm(raw: string): { countryCode: string; phoneLocal: string } {
  const digitsOnly = raw.replace(/\D/g, "");
  for (const { code, digits } of DIAL_PREFIXES) {
    if (digitsOnly.startsWith(digits) && digitsOnly.length > digits.length) {
      return { countryCode: code, phoneLocal: digitsOnly.slice(digits.length) };
    }
  }
  return { countryCode: "+966", phoneLocal: digitsOnly };
}

export function dealerCustomerToFormValues(c: DealerCustomer): CreateDealerCustomerFormValues {
  const { countryCode, phoneLocal } = splitPhoneNumberForForm(c.phoneNumber);
  const address = c.address;
  return {
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    countryCode,
    phoneLocal,
    address: {
      cityId: address?.cityId != null ? String(address.cityId) : "",
      countryId: address?.countryId != null ? String(address.countryId) : "",
      stateId: address?.stateId != null ? String(address.stateId) : "",
      streetName: address?.streetName ?? "",
      streetNumber: address?.streetNumber ?? "",
      postalCode: address?.postalCode ?? "",
      unitNumber: address?.unitNumber ?? "",
      specialInstructions: address?.specialInstructions ?? "",
    },
  };
}
