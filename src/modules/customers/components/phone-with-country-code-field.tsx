"use client";

import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FIELD_GROUP_INNER_INPUT_CLASS,
  FIELD_GROUP_INNER_SELECT_CLASS,
  fieldGroupWrapperClass,
} from "@/lib/field-validation";
import type { CreateDealerCustomerFormValues } from "@/modules/customers/schemas/create-dealer-customer.schema";

const DEFAULT_COUNTRY_CODES = [
  { value: "+966", label: "+966" },
  { value: "+971", label: "+971" },
  { value: "+965", label: "+965" },
  { value: "+963", label: "+963" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
] as const;

type PhoneWithCountryCodeFieldProps = {
  control: Control<CreateDealerCustomerFormValues>;
  register: UseFormRegister<CreateDealerCustomerFormValues>;
  invalid?: boolean;
  phonePlaceholder: string;
  countryCodes?: readonly { value: string; label: string }[];
};

export function PhoneWithCountryCodeField({
  control,
  register,
  invalid = false,
  phonePlaceholder,
  countryCodes = DEFAULT_COUNTRY_CODES,
}: PhoneWithCountryCodeFieldProps) {
  return (
    <div
      data-slot="field-group"
      data-invalid={invalid ? "true" : undefined}
      className={fieldGroupWrapperClass(invalid)}
    >
      <Controller
        name="countryCode"
        control={control}
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger
              aria-invalid={invalid}
              className={FIELD_GROUP_INNER_SELECT_CLASS}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <Input
        id="phoneLocal"
        type="tel"
        placeholder={phonePlaceholder}
        aria-invalid={invalid}
        className={FIELD_GROUP_INNER_INPUT_CLASS}
        {...register("phoneLocal")}
      />
    </div>
  );
}
