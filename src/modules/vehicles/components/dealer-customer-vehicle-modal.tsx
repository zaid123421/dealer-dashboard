"use client";

import { useEffect, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Car, Info, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldError, Label, RequiredMark } from "@/components/ui/label";
import {
  createVehicleFormFieldsSchema,
  mapVehicleFormToRequest,
  type CreateVehicleFormValues,
} from "@/modules/vehicles/schemas/create-vehicle.schema";
import { useCreateVehicleForCustomer } from "@/modules/vehicles/hooks/use-create-vehicle-for-customer";
import { useUpdateVehicleForCustomer } from "@/modules/vehicles/hooks/use-update-vehicle-for-customer";

const defaultFormValues: CreateVehicleFormValues = {
  vin: "",
  year: new Date().getFullYear(),
  make: "",
  model: "",
  plateNumber: "",
  color: "",
  odometerKm: 0,
};

export type VehicleToEdit = { id: number } & CreateVehicleFormValues;

export type DealerCustomerVehicleModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealerCustomerId: number;
  customerDisplayName: string;
  customerEmail: string;
  /** إن وُجدت — وضع التعديل (PUT) */
  vehicleToEdit?: VehicleToEdit | null;
};

export function DealerCustomerVehicleModal({
  open,
  onOpenChange,
  dealerCustomerId,
  customerDisplayName,
  customerEmail,
  vehicleToEdit = null,
}: DealerCustomerVehicleModalProps) {
  const t = useTranslations("customers");
  const tCommon = useTranslations("common");
  const tValidation = useTranslations("validation");
  const isEdit = vehicleToEdit != null;

  const formSchema = useMemo(
    () =>
      createVehicleFormFieldsSchema({
        required: tValidation("required"),
        invalidVin: tValidation("invalidVin"),
        invalidYear: tValidation("invalidYear"),
      }),
    [tValidation],
  );

  const createVehicle = useCreateVehicleForCustomer();
  const updateVehicle = useUpdateVehicleForCustomer();
  const mutationPending = createVehicle.isPending || updateVehicle.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateVehicleFormValues>({
    resolver: zodResolver(formSchema) as Resolver<CreateVehicleFormValues>,
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (!open) return;
    if (vehicleToEdit) {
      reset({
        vin: vehicleToEdit.vin,
        year: vehicleToEdit.year,
        make: vehicleToEdit.make,
        model: vehicleToEdit.model,
        plateNumber: vehicleToEdit.plateNumber,
        color: vehicleToEdit.color,
        odometerKm: vehicleToEdit.odometerKm,
      });
    } else {
      reset(defaultFormValues);
    }
  }, [open, vehicleToEdit, reset]);

  function onSubmit(data: CreateVehicleFormValues) {
    const payload = mapVehicleFormToRequest(data);
    if (isEdit && vehicleToEdit) {
      updateVehicle.mutate(
        {
          dealerCustomerId,
          vehicleId: vehicleToEdit.id,
          payload,
        },
        {
          onSuccess: () => {
            toast.success(t("vehicleUpdatedSuccess"));
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : t("updateVehicleError"));
          },
        },
      );
      return;
    }
    createVehicle.mutate(
      { dealerCustomerId, payload },
      {
        onSuccess: () => {
          toast.success(t("vehicleCreatedSuccess"));
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : t("createVehicleError"));
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(90vh,720px)] w-full max-w-2xl overflow-y-auto gap-0 overflow-hidden p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="px-6 pb-4 pt-6">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t("editVehicleTitle") : t("addVehicleTitle")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {isEdit ? t("editVehicleSubtitle") : t("addVehicleSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex min-w-0 items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-dark/15 text-primary-dark">
              <User className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold text-foreground">{customerDisplayName}</p>
              <p className="truncate text-label-sm text-muted-foreground">{customerEmail.toLowerCase()}</p>
            </div>
          </div>
        </div>

        <form id="dealer-customer-vehicle-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground">
              <Car className="size-4 shrink-0 text-primary-dark" />
              <span className="text-title-sm font-semibold">{t("vehicleInformation")}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modal-vin">
                {t("vinNumber")} <RequiredMark />
              </Label>
              <div className="relative">
                <Input
                  id="modal-vin"
                  placeholder={t("vinPlaceholder")}
                  maxLength={17}
                  className="pe-10"
                  aria-invalid={!!errors.vin}
                  disabled={mutationPending}
                  {...register("vin")}
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>
                  <Info className="size-4" />
                </span>
              </div>
              <FieldError>{errors.vin?.message}</FieldError>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="modal-year">
                  {t("year")} <RequiredMark />
                </Label>
                <Input
                  id="modal-year"
                  type="number"
                  min={1980}
                  max={2035}
                  placeholder={t("yearPlaceholder")}
                  aria-invalid={!!errors.year}
                  disabled={mutationPending}
                  {...register("year", { valueAsNumber: true })}
                />
                <FieldError>{errors.year?.message}</FieldError>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-make">{t("makeBrand")}</Label>
                <Input
                  id="modal-make"
                  placeholder={t("makeBrand")}
                  aria-invalid={!!errors.make}
                  disabled={mutationPending}
                  {...register("make")}
                />
                <FieldError>{errors.make?.message}</FieldError>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="modal-model">{t("model")}</Label>
                <Input
                  id="modal-model"
                  placeholder={t("modelPlaceholder")}
                  aria-invalid={!!errors.model}
                  disabled={mutationPending}
                  {...register("model")}
                />
                <FieldError>{errors.model?.message}</FieldError>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="modal-plate">{t("plateNumber")}</Label>
                <Input
                  id="modal-plate"
                  placeholder={t("plateNumberPlaceholder")}
                  aria-invalid={!!errors.plateNumber}
                  disabled={mutationPending}
                  {...register("plateNumber")}
                />
                <FieldError>{errors.plateNumber?.message}</FieldError>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-color">{t("color")}</Label>
                <Input
                  id="modal-color"
                  placeholder={t("colorPlaceholder")}
                  aria-invalid={!!errors.color}
                  disabled={mutationPending}
                  {...register("color")}
                />
                <FieldError>{errors.color?.message}</FieldError>
              </div>
            </div>

            <div className="space-y-2 sm:max-w-xs">
              <Label htmlFor="modal-odo">{t("odometerKm")}</Label>
              <Input
                id="modal-odo"
                type="number"
                min={0}
                step={1}
                placeholder={t("odometerKmPlaceholder")}
                aria-invalid={!!errors.odometerKm}
                disabled={mutationPending}
                {...register("odometerKm", { valueAsNumber: true })}
              />
              <FieldError>{errors.odometerKm?.message}</FieldError>
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 gap-2 sm:justify-end sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutationPending}
            className="w-full sm:w-auto"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            form="dealer-customer-vehicle-form"
            variant="brand"
            className="w-full sm:w-auto"
            disabled={mutationPending}
          >
            {mutationPending ? t("loading") : isEdit ? t("saveVehicleChanges") : t("saveVehicle")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
