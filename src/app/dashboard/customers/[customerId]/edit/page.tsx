"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { User, Mail, ChevronRight, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  createDealerCustomerFormFieldsSchema,
  mapDealerCustomerFormToRequest,
  type CreateDealerCustomerFormValues,
} from "@/modules/customers/schemas/create-dealer-customer.schema";
import { dealerCustomerToFormValues } from "@/modules/customers/lib/customer-form-mapper";
import { useDealerCustomer } from "@/modules/customers/hooks/use-dealer-customer";
import { useUpdateDealerCustomer } from "@/modules/customers/hooks/use-update-dealer-customer";

const COUNTRY_CODES = [
  { value: "+966", label: "+966" },
  { value: "+971", label: "+971" },
  { value: "+965", label: "+965" },
  { value: "+963", label: "+963" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
] as const;

const emptyFormValues: CreateDealerCustomerFormValues = {
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

export default function EditCustomerPage() {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const params = useParams();
  const customerIdParam = params.customerId as string | undefined;

  const { data: customer, isPending, isError, error } = useDealerCustomer(customerIdParam);
  const updateCustomer = useUpdateDealerCustomer();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDealerCustomerFormValues>({
    resolver: zodResolver(createDealerCustomerFormFieldsSchema),
    defaultValues: emptyFormValues,
  });

  useEffect(() => {
    if (customer) {
      reset(dealerCustomerToFormValues(customer));
    }
  }, [customer, reset]);

  function onSubmit(data: CreateDealerCustomerFormValues) {
    console.log("[edit customer] form (raw RHF)", data);
    const idNum = customerIdParam != null ? Number(customerIdParam) : NaN;
    if (!Number.isFinite(idNum) || customer == null) return;
    const payload = mapDealerCustomerFormToRequest(data);
    console.log("[edit customer] body for PUT /v1/dealerCustomers/:id", payload);
    updateCustomer.mutate(
      { customerId: idNum, payload },
      {
        onSuccess: () => {
          toast.success(t("customerUpdatedSuccess"));
          router.push(ROUTES.DASHBOARD.CUSTOMERS);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : t("updateCustomerError"));
        },
      },
    );
  }

  const addrErr = errors.address;

  if (isPending) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="text-body-md text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-body-md text-muted-foreground">
          {error instanceof Error ? error.message : t("customerNotFound")}
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.DASHBOARD.CUSTOMERS}>{tCommon("cancel")}</Link>
        </Button>
      </div>
    );
  }

  const breadcrumbName = [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim();

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 overflow-hidden text-sm">
        <Link
          href={ROUTES.DASHBOARD.CUSTOMERS}
          className="min-w-0 truncate text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("title")}
        </Link>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 truncate text-muted-foreground">{breadcrumbName || customer.email}</span>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="shrink-0 font-medium text-foreground">{t("breadcrumbEdit")}</span>
      </nav>

      <div>
        <h1 className="text-headline-sm font-bold text-foreground">{t("editCustomer")}</h1>
        <p className="mt-2 text-body-md text-muted-foreground">{t("editCustomerSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="size-5 text-primary-dark" />
              {t("personalInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  placeholder={t("firstNamePlaceholder")}
                  aria-invalid={!!errors.firstName}
                  {...register("firstName")}
                />
                {errors.firstName ? (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  placeholder={t("lastNamePlaceholder")}
                  aria-invalid={!!errors.lastName}
                  {...register("lastName")}
                />
                {errors.lastName ? (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="phoneLocal">{t("phoneNumber")}</Label>
                <div className="flex min-w-0 overflow-hidden rounded-md border border-input bg-card shadow-xs">
                  <Controller
                    name="countryCode"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-10 w-[90px] shrink-0 rounded-none border-0 border-e border-input bg-surface-container/80 focus:ring-0 [&>span]:text-primary-dark">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_CODES.map(({ value, label }) => (
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
                    placeholder={t("phonePlaceholder")}
                    className={cn(
                      "h-10 min-w-0 flex-1 rounded-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                      "placeholder:text-primary-dark/70",
                    )}
                    aria-invalid={!!errors.phoneLocal}
                    {...register("phoneLocal")}
                  />
                </div>
                {errors.phoneLocal ? (
                  <p className="text-sm text-destructive">{errors.phoneLocal.message}</p>
                ) : null}
                {errors.countryCode ? (
                  <p className="text-sm text-destructive">{errors.countryCode.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("emailAddress")}</Label>
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
                {errors.email ? (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MapPin className="size-5 text-primary-dark" />
              {t("addressInformation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="address.countryId">{t("countryId")}</Label>
                <Input
                  id="address.countryId"
                  inputMode="numeric"
                  placeholder={t("idPlaceholder")}
                  aria-invalid={!!addrErr?.countryId}
                  {...register("address.countryId")}
                />
                {addrErr?.countryId ? (
                  <p className="text-sm text-destructive">{addrErr.countryId.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.stateId">{t("stateId")}</Label>
                <Input
                  id="address.stateId"
                  inputMode="numeric"
                  placeholder={t("idPlaceholder")}
                  aria-invalid={!!addrErr?.stateId}
                  {...register("address.stateId")}
                />
                {addrErr?.stateId ? (
                  <p className="text-sm text-destructive">{addrErr.stateId.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.cityId">{t("cityId")}</Label>
                <Input
                  id="address.cityId"
                  inputMode="numeric"
                  placeholder={t("idPlaceholder")}
                  aria-invalid={!!addrErr?.cityId}
                  {...register("address.cityId")}
                />
                {addrErr?.cityId ? (
                  <p className="text-sm text-destructive">{addrErr.cityId.message}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address.streetName">{t("streetName")}</Label>
                <Input
                  id="address.streetName"
                  placeholder={t("streetNamePlaceholder")}
                  aria-invalid={!!addrErr?.streetName}
                  {...register("address.streetName")}
                />
                {addrErr?.streetName ? (
                  <p className="text-sm text-destructive">{addrErr.streetName.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.streetNumber">{t("streetNumber")}</Label>
                <Input
                  id="address.streetNumber"
                  placeholder={t("streetNumberPlaceholder")}
                  aria-invalid={!!addrErr?.streetNumber}
                  {...register("address.streetNumber")}
                />
                {addrErr?.streetNumber ? (
                  <p className="text-sm text-destructive">{addrErr.streetNumber.message}</p>
                ) : null}
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
                {addrErr?.postalCode ? (
                  <p className="text-sm text-destructive">{addrErr.postalCode.message}</p>
                ) : null}
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
              <textarea
                id="address.specialInstructions"
                rows={3}
                placeholder={t("specialInstructionsPlaceholder")}
                className={cn(
                  "w-full rounded-md border border-input bg-card px-3 py-2 text-body-md shadow-xs outline-none",
                  "placeholder:text-muted-foreground",
                  "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                  "min-h-[80px] resize-y",
                )}
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
            className="w-full bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 sm:w-auto"
            disabled={updateCustomer.isPending}
          >
            {updateCustomer.isPending ? "…" : t("saveCustomer")}
          </Button>
        </div>
      </form>
    </div>
  );
}
