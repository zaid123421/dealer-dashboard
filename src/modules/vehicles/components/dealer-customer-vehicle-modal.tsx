"use client";

import { useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  createVehicleFormSchema,
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
  const isEdit = vehicleToEdit != null;

  const createVehicle = useCreateVehicleForCustomer();
  const updateVehicle = useUpdateVehicleForCustomer();
  const mutationPending = createVehicle.isPending || updateVehicle.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateVehicleFormValues>({
    resolver: zodResolver(createVehicleFormSchema) as Resolver<CreateVehicleFormValues>,
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
        className="max-h-[min(90vh,720px)] w-full max-w-2xl overflow-y-auto gap-0 p-0 sm:rounded-xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b px-6 pb-4 pt-6">
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
              <Label htmlFor="modal-vin">{t("vinNumber")}</Label>
              <div className="relative">
                <Input
                  id="modal-vin"
                  placeholder={t("vinPlaceholder")}
                  maxLength={17}
                  className={cn("pe-10", errors.vin && "border-destructive")}
                  disabled={mutationPending}
                  {...register("vin")}
                />
                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden>
                  <Info className="size-4" />
                </span>
              </div>
              {errors.vin ? (
                <p className="text-label-sm text-destructive">{errors.vin.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="modal-year">{t("year")}</Label>
                <Input
                  id="modal-year"
                  type="number"
                  min={1980}
                  max={2035}
                  placeholder={t("yearPlaceholder")}
                  className={cn(errors.year && "border-destructive")}
                  disabled={mutationPending}
                  {...register("year", { valueAsNumber: true })}
                />
                {errors.year ? (
                  <p className="text-label-sm text-destructive">{errors.year.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-make">{t("makeBrand")}</Label>
                <Input
                  id="modal-make"
                  placeholder={t("makeBrand")}
                  className={cn(errors.make && "border-destructive")}
                  disabled={mutationPending}
                  {...register("make")}
                />
                {errors.make ? (
                  <p className="text-label-sm text-destructive">{errors.make.message}</p>
                ) : null}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="modal-model">{t("model")}</Label>
                <Input
                  id="modal-model"
                  placeholder={t("modelPlaceholder")}
                  className={cn(errors.model && "border-destructive")}
                  disabled={mutationPending}
                  {...register("model")}
                />
                {errors.model ? (
                  <p className="text-label-sm text-destructive">{errors.model.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="modal-plate">{t("plateNumber")}</Label>
                <Input
                  id="modal-plate"
                  placeholder={t("plateNumberPlaceholder")}
                  className={cn(errors.plateNumber && "border-destructive")}
                  disabled={mutationPending}
                  {...register("plateNumber")}
                />
                {errors.plateNumber ? (
                  <p className="text-label-sm text-destructive">{errors.plateNumber.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-color">{t("color")}</Label>
                <Input
                  id="modal-color"
                  placeholder={t("colorPlaceholder")}
                  className={cn(errors.color && "border-destructive")}
                  disabled={mutationPending}
                  {...register("color")}
                />
                {errors.color ? (
                  <p className="text-label-sm text-destructive">{errors.color.message}</p>
                ) : null}
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
                className={cn(errors.odometerKm && "border-destructive")}
                disabled={mutationPending}
                {...register("odometerKm", { valueAsNumber: true })}
              />
              {errors.odometerKm ? (
                <p className="text-label-sm text-destructive">{errors.odometerKm.message}</p>
              ) : null}
            </div>
          </div>
        </form>

        <DialogFooter className="border-t px-6 py-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutationPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            form="dealer-customer-vehicle-form"
            className="bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90"
            disabled={mutationPending}
          >
            {mutationPending ? t("loading") : isEdit ? t("saveVehicleChanges") : t("saveVehicle")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
