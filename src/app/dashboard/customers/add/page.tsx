"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { User, Mail, ChevronRight, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label, RequiredMark, FieldError } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import {
  createDealerCustomerFormFieldsSchema,
  mapDealerCustomerFormToRequest,
  type CreateDealerCustomerFormValues,
} from "@/modules/customers/schemas/create-dealer-customer.schema";
import { useCreateDealerCustomer } from "@/modules/customers/hooks/use-create-dealer-customer";
import { DealerCustomerAddressRegionFields } from "@/modules/customers/components/dealer-customer-address-region-fields";
import { PhoneWithCountryCodeField } from "@/modules/customers/components/phone-with-country-code-field";

const defaultFormValues: CreateDealerCustomerFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  countryCode: "+966",
  phoneLocal: "",
  address: {
    cityId: "",
    countryId: "",
    stateId: "",
    streetName: "",
    streetNumber: "",
    postalCode: "",
    unitNumber: "",
    specialInstructions: "",
  },
};

export default function AddCustomerPage() {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const createCustomer = useCreateDealerCustomer();

  const formSchema = useMemo(
    () =>
      createDealerCustomerFormFieldsSchema({
        required: tValidation("required"),
        invalidEmail: tValidation("invalidEmail"),
        invalidId: tValidation("invalidId"),
      }),
    [tValidation],
  );

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDealerCustomerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  function onSubmit(data: CreateDealerCustomerFormValues) {
    createCustomer.mutate(mapDealerCustomerFormToRequest(data), {
      onSuccess: () => {
        toast.success(t("customerCreatedSuccess"));
        router.push(ROUTES.DASHBOARD.CUSTOMERS);
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : t("createCustomerError");
        toast.error(msg || t("createCustomerError"));
      },
    });
  }

  const addrErr = errors.address;
  const phoneFieldInvalid = !!errors.phoneLocal;

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 overflow-hidden text-sm">
        <Link
          href={ROUTES.DASHBOARD.CUSTOMERS}
          className="min-w-0 truncate text-primary-dark transition-colors hover:text-primary-dark/80"
        >
          {t("title")}
        </Link>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        <span className="shrink-0 font-medium text-foreground">{t("breadcrumbAdd")}</span>
      </nav>

      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("addNewCustomer")}</h1>
        <p className="mt-2 text-body-md text-subtle">{t("addCustomerSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-0 bg-[var(--card)] shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="size-5 text-primary-dark" />
              {t("personalInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {t("firstName")} <RequiredMark />
                </Label>
                <Input
                  id="firstName"
                  placeholder={t("firstNamePlaceholder")}
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                <FieldError>{errors.firstName?.message}</FieldError>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  {t("lastName")} <RequiredMark />
                </Label>
                <Input
                  id="lastName"
                  placeholder={t("lastNamePlaceholder")}
                  aria-invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                <FieldError>{errors.lastName?.message}</FieldError>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="phoneLocal">
                  {t("phoneNumber")} <RequiredMark />
                </Label>
                <PhoneWithCountryCodeField
                  control={control}
                  register={register}
                  invalid={phoneFieldInvalid}
                  phonePlaceholder={t("phonePlaceholder")}
                />
                <FieldError>{errors.phoneLocal?.message}</FieldError>
                <FieldError>{errors.countryCode?.message}</FieldError>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("emailAddress")} <RequiredMark />
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    className="ps-9"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </div>
                <FieldError>{errors.email?.message}</FieldError>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-[var(--card)] shadow-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MapPin className="size-5 text-primary-dark" />
              {t("addressInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DealerCustomerAddressRegionFields
              control={control}
              setValue={setValue}
              errors={addrErr}
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address.streetName">
                  {t("streetName")} <RequiredMark />
                </Label>
                <Input
                  id="address.streetName"
                  placeholder={t("streetNamePlaceholder")}
                  aria-invalid={!!addrErr?.streetName}
                  {...register("address.streetName")}
                />
                <FieldError>{addrErr?.streetName?.message}</FieldError>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.streetNumber">{t("streetNumber")}</Label>
                <Input
                  id="address.streetNumber"
                  placeholder={t("streetNumberPlaceholder")}
                  aria-invalid={!!addrErr?.streetNumber}
                  {...register("address.streetNumber")}
                />
                <FieldError>{addrErr?.streetNumber?.message}</FieldError>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address.postalCode">{t("postalCode")}</Label>
                <Input
                  id="address.postalCode"
                  placeholder={t("postalCodePlaceholder")}
                  aria-invalid={!!addrErr?.postalCode}
                  {...register("address.postalCode")}
                />
                <FieldError>{addrErr?.postalCode?.message}</FieldError>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.unitNumber">{t("unitNumber")}</Label>
                <Input
                  id="address.unitNumber"
                  placeholder={t("unitNumberPlaceholder")}
                  {...register("address.unitNumber")}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="address.specialInstructions">{t("specialInstructions")}</Label>
              <Textarea
                id="address.specialInstructions"
                rows={3}
                placeholder={t("specialInstructionsPlaceholder")}
                {...register("address.specialInstructions")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
            <Link href={ROUTES.DASHBOARD.CUSTOMERS}>{tCommon("cancel")}</Link>
          </Button>
          <Button
            type="submit"
            variant="brand"
            className="w-full sm:w-auto"
            disabled={createCustomer.isPending}
          >
            {createCustomer.isPending ? "…" : t("saveCustomer")}
          </Button>
        </div>
      </form>
    </div>
  );
}
