import { useQuery } from "@tanstack/react-query";
import {
  fetchAddressCities,
  fetchAddressCountries,
  fetchAddressProvinces,
} from "@/modules/addresses/services/address-base.service";

export const addressLookupKeys = {
  root: ["addressLookups"] as const,
  countries: () => [...addressLookupKeys.root, "countries"] as const,
  provinces: (countryId: string) => [...addressLookupKeys.root, "provinces", countryId] as const,
  cities: (provinceId: string) => [...addressLookupKeys.root, "cities", provinceId] as const,
};

const STALE_COUNTRIES = 1000 * 60 * 60;
const STALE_REGIONS = 1000 * 60 * 15;

export function useAddressCountries() {
  return useQuery({
    queryKey: addressLookupKeys.countries(),
    queryFn: fetchAddressCountries,
    staleTime: STALE_COUNTRIES,
  });
}

export function useAddressProvinces(countryId: string | undefined) {
  const id = countryId?.trim() ?? "";
  const enabled = /^\d+$/.test(id);
  return useQuery({
    queryKey: addressLookupKeys.provinces(id),
    queryFn: () => fetchAddressProvinces(id),
    enabled,
    staleTime: STALE_REGIONS,
  });
}

export function useAddressCities(provinceId: string | undefined) {
  const id = provinceId?.trim() ?? "";
  const enabled = /^\d+$/.test(id);
  return useQuery({
    queryKey: addressLookupKeys.cities(id),
    queryFn: () => fetchAddressCities(id),
    enabled,
    staleTime: STALE_REGIONS,
  });
}
