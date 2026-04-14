"use client";

import { useMemo } from "react";
import {
  Control,
  Controller,
  type FieldErrors,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import {
  useAddressCities,
  useAddressCountries,
  useAddressProvinces,
} from "@/modules/addresses/hooks/use-address-lookups";
import type { CreateDealerCustomerFormValues } from "@/modules/customers/schemas/create-dealer-customer.schema";

type AddressErrors = FieldErrors<CreateDealerCustomerFormValues>["address"];

type Props = {
  control: Control<CreateDealerCustomerFormValues>;
  setValue: UseFormSetValue<CreateDealerCustomerFormValues>;
  errors?: AddressErrors;
};

const selectValue = (v: string) => (v && v.length > 0 ? v : undefined);

/** Cascading country / province / city with search; stores numeric ids as strings for the API mapper. */
export function DealerCustomerAddressRegionFields({ control, setValue, errors }: Props) {
  const t = useTranslations("customers");

  const countryId = useWatch({ control, name: "address.countryId" });
  const provinceId = useWatch({ control, name: "address.stateId" });

  const countriesQ = useAddressCountries();
  const provincesQ = useAddressProvinces(countryId);
  const citiesQ = useAddressCities(provinceId);

  const countryOptions = useMemo(
    () =>
      (countriesQ.data ?? []).map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [countriesQ.data],
  );

  const provinceOptions = useMemo(
    () =>
      (provincesQ.data ?? []).map((p) => ({
        value: String(p.id),
        label: p.name,
      })),
    [provincesQ.data],
  );

  const cityOptions = useMemo(
    () =>
      (citiesQ.data ?? []).map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    [citiesQ.data],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label htmlFor="address.countryId">{t("addressCountry")}</Label>
        <Controller
          name="address.countryId"
          control={control}
          render={({ field }) => (
            <SearchableCombobox
              id="address.countryId"
              value={selectValue(field.value)}
              onValueChange={(v) => {
                field.onChange(v);
                setValue("address.stateId", "", { shouldValidate: true, shouldDirty: true });
                setValue("address.cityId", "", { shouldValidate: true, shouldDirty: true });
              }}
              options={countryOptions}
              placeholder={t("addressSelectCountry")}
              searchPlaceholder={t("addressSearchPlaceholder")}
              emptyText={t("addressNoResults")}
              disabled={countriesQ.isPending}
              aria-invalid={!!errors?.countryId}
            />
          )}
        />
        {countriesQ.isError ? (
          <p className="text-sm text-destructive">{t("addressOptionsError")}</p>
        ) : null}
        {errors?.countryId ? (
          <p className="text-sm text-destructive">{errors.countryId.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address.stateId">{t("addressProvince")}</Label>
        <Controller
          name="address.stateId"
          control={control}
          render={({ field }) => (
            <SearchableCombobox
              id="address.stateId"
              value={selectValue(field.value)}
              onValueChange={(v) => {
                field.onChange(v);
                setValue("address.cityId", "", { shouldValidate: true, shouldDirty: true });
              }}
              options={provinceOptions}
              placeholder={
                !countryId || !/^\d+$/.test(countryId.trim())
                  ? t("addressSelectCountryFirst")
                  : t("addressSelectProvince")
              }
              searchPlaceholder={t("addressSearchPlaceholder")}
              emptyText={t("addressNoResults")}
              disabled={
                !countryId ||
                !/^\d+$/.test(countryId.trim()) ||
                provincesQ.isPending
              }
              aria-invalid={!!errors?.stateId}
            />
          )}
        />
        {countryId && /^\d+$/.test(countryId.trim()) && provincesQ.isError ? (
          <p className="text-sm text-destructive">{t("addressOptionsError")}</p>
        ) : null}
        {errors?.stateId ? (
          <p className="text-sm text-destructive">{errors.stateId.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address.cityId">{t("addressCity")}</Label>
        <Controller
          name="address.cityId"
          control={control}
          render={({ field }) => (
            <SearchableCombobox
              id="address.cityId"
              value={selectValue(field.value)}
              onValueChange={field.onChange}
              options={cityOptions}
              placeholder={
                !provinceId || !/^\d+$/.test(provinceId.trim())
                  ? t("addressSelectProvinceFirst")
                  : t("addressSelectCity")
              }
              searchPlaceholder={t("addressSearchPlaceholder")}
              emptyText={t("addressNoResults")}
              disabled={
                !provinceId ||
                !/^\d+$/.test(provinceId.trim()) ||
                citiesQ.isPending
              }
              aria-invalid={!!errors?.cityId}
            />
          )}
        />
        {provinceId &&
        /^\d+$/.test(provinceId.trim()) &&
        citiesQ.isError ? (
          <p className="text-sm text-destructive">{t("addressOptionsError")}</p>
        ) : null}
        {errors?.cityId ? (
          <p className="text-sm text-destructive">{errors.cityId.message}</p>
        ) : null}
      </div>
    </div>
  );
}
