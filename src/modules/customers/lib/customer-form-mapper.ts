import {
  fetchAddressCities,
  fetchAddressCountries,
  fetchAddressProvinces,
} from "@/modules/addresses/services/address-base.service";
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

function normalizeRegionName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function findRegionByName<T extends { id: number; name: string }>(
  items: T[],
  name: string | undefined,
): T | undefined {
  if (!name?.trim()) return undefined;
  const target = normalizeRegionName(name);
  if (!target) return undefined;
  return (
    items.find((item) => normalizeRegionName(item.name) === target) ??
    items.find((item) => {
      const candidate = normalizeRegionName(item.name);
      return candidate.includes(target) || target.includes(candidate);
    })
  );
}

async function resolveAddressRegionIds(
  address: NonNullable<DealerCustomer["address"]>,
  current: CreateDealerCustomerFormValues["address"],
): Promise<CreateDealerCustomerFormValues["address"]> {
  const next = { ...current };
  const hasAllIds =
    /^\d+$/.test(next.countryId) && /^\d+$/.test(next.stateId) && /^\d+$/.test(next.cityId);
  if (hasAllIds) return next;

  try {
    const countries = await fetchAddressCountries();
    const country =
      findRegionByName(countries, address.country) ??
      (next.countryId ? countries.find((c) => String(c.id) === next.countryId) : undefined);
    if (!country) return next;
    next.countryId = String(country.id);

    const provinces = await fetchAddressProvinces(String(country.id));
    const province =
      findRegionByName(provinces, address.province) ??
      (next.stateId ? provinces.find((p) => String(p.id) === next.stateId) : undefined);
    if (!province) return next;
    next.stateId = String(province.id);

    const cities = await fetchAddressCities(String(province.id));
    const city =
      findRegionByName(cities, address.city) ??
      (next.cityId ? cities.find((c) => String(c.id) === next.cityId) : undefined);
    if (city) next.cityId = String(city.id);
  } catch {
    // Keep street fields even if lookups fail.
  }

  return next;
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

/** Resolves country/province/city ids from API name fields when ids are missing. */
export async function dealerCustomerToFormValuesAsync(
  c: DealerCustomer,
): Promise<CreateDealerCustomerFormValues> {
  const base = dealerCustomerToFormValues(c);
  if (!c.address) return base;
  return {
    ...base,
    address: await resolveAddressRegionIds(c.address, base.address),
  };
}
