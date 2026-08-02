"use client";

import { useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogDescription,
  DialogTitle,
  FormDialogContent,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/ui/app-dialog";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";

import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { dealerTireSetsOverviewQueryKey } from "../hooks/use-dealer-tire-sets-overview";
import { DealerQuotaNotice } from "@/modules/dealer/components/dealer-quota-notice";
import { useDealerQuota } from "@/modules/dealer/hooks/use-dealer-quota";
import { invalidateDealerMe } from "@/modules/dealer/lib/invalidate-dealer-me";

type CreateTireSetFormValues = {
  tireCount: number;
  seasonType: "Winter" | "Summer";
  brand: string;
  size: string;
  displayLabel?: string;
};

interface AddTireSetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  vehicleId: string;
  /** يُستدعى بعد إنشاء المجموعة بنجاح (مثلاً لإعادة جلب القائمة) */
  onCreated?: () => void;
}

export function AddTireSetModal({ open, onOpenChange, customerId, vehicleId, onCreated }: AddTireSetModalProps) {
  const t = useTranslations("common");
  const tCustomers = useTranslations("customers");
  const tQuota = useTranslations("quota");
  const queryClient = useQueryClient();
  const { snapshot, canAddTires } = useDealerQuota();

  const createTireSetSchema = useMemo(
    () =>
      z.object({
        tireCount: z
          .number()
          .min(1, tCustomers("tireSetTireCountMinError"))
          .max(8, tCustomers("tireSetTireCountMaxError")),
        seasonType: z.enum(["Winter", "Summer"]),
        brand: z.string().min(1, tCustomers("tireSetBrandRequiredError")),
        size: z.string().min(1, tCustomers("tireSetSizeRequiredError")),
        displayLabel: z.string().optional(),
      }),
    [tCustomers],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<CreateTireSetFormValues>({
    resolver: zodResolver(createTireSetSchema),
    defaultValues: {
      tireCount: 4,
      seasonType: "Summer",
      brand: "",
      size: "",
      displayLabel: "",
    },
  });

  const tireCount = useWatch({ control, name: "tireCount" }) ?? 4;
  const tiresAllowed = canAddTires(tireCount);
  const tireQuota = snapshot.tires;

  const onSubmit = async (data: CreateTireSetFormValues) => {
    if (!canAddTires(data.tireCount)) {
      if (!snapshot.hasActiveSubscription) {
        toast.error(tQuota("noActiveSubscription"));
        return;
      }
      if (tireQuota && tireQuota.remaining <= 0) {
        toast.error(
          tQuota("tireLimitReached", {
            current: tireQuota.current,
            max: tireQuota.max,
            remaining: tireQuota.remaining,
          }),
        );
        return;
      }
      toast.error(
        tQuota("tiresInsufficientSlots", {
          requested: data.tireCount,
          remaining: tireQuota?.remaining ?? 0,
          max: tireQuota?.max ?? 0,
        }),
      );
      return;
    }

    try {
      await api.post(
        `/v1/dealerCustomers/${customerId}/vehicles/${vehicleId}/tire-sets`,
        data,
      );

      toast.success(tCustomers("tireSetCreatedSuccess"));
      onCreated?.();
      void queryClient.invalidateQueries({ queryKey: dealerTireSetsOverviewQueryKey });
      void invalidateDealerMe(queryClient);
      onOpenChange(false);
      reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const body = error.response?.data as { message?: string } | undefined;
        const apiMessage =
          typeof body?.message === "string" ? body.message : error.message;
        toast.error(apiMessage || tCustomers("tireSetCreateError"));
        return;
      }
      toast.error(error instanceof Error ? error.message : tCustomers("tireSetCreateError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <DialogTitle>{tCustomers("addTireSet")}</DialogTitle>
          <DialogDescription>{tCustomers("addTireSetModalDescription")}</DialogDescription>
        </FormDialogHeader>

        <form id="add-tire-set-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
          <div className="grid gap-4">
            {open ? (
              <div className="space-y-3">
                {tireQuota ? (
                  <p className="text-body-sm text-muted-foreground">
                    {tiresAllowed
                      ? tQuota("remainingSlots", {
                          remaining: tireQuota.remaining,
                          max: tireQuota.max,
                        })
                      : tQuota("limitFull", { max: tireQuota.max })}
                  </p>
                ) : null}
                {!snapshot.hasActiveSubscription ? (
                  <DealerQuotaNotice variant="subscription" />
                ) : null}
                {tireQuota && !tireQuota.canAdd ? (
                  <DealerQuotaNotice variant="tires" tireQuota={tireQuota} />
                ) : null}
                {tireQuota?.canAdd && !tiresAllowed ? (
                  <DealerQuotaNotice
                    variant="tiresInsufficient"
                    tireQuota={tireQuota}
                    requestedTireCount={tireCount}
                  />
                ) : null}
              </div>
            ) : null}

            <FormField
              id="tireCount"
              label={tCustomers("numberOfTires")}
              required
              error={errors.tireCount?.message}
            >
              <Input
                id="tireCount"
                type="number"
                min="1"
                max="8"
                aria-invalid={!!errors.tireCount}
                {...register("tireCount", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              id="seasonType"
              label={tCustomers("seasonType")}
              required
              error={errors.seasonType?.message}
            >
              <Controller
                name="seasonType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="seasonType" aria-invalid={!!errors.seasonType}>
                      <SelectValue placeholder={tCustomers("tireSetSeasonPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Winter">{tCustomers("winter")}</SelectItem>
                      <SelectItem value="Summer">{tCustomers("summer")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              id="brand"
              label={tCustomers("tireBrand")}
              required
              error={errors.brand?.message}
            >
              <Input
                id="brand"
                placeholder={tCustomers("tireBrandPlaceholder")}
                aria-invalid={!!errors.brand}
                {...register("brand")}
              />
            </FormField>

            <FormField
              id="size"
              label={tCustomers("tireSize")}
              required
              error={errors.size?.message}
            >
              <Input
                id="size"
                placeholder={tCustomers("tireSizePlaceholder")}
                aria-invalid={!!errors.size}
                {...register("size")}
              />
            </FormField>

            <FormField
              id="displayLabel"
              label={tCustomers("tireDisplayLabelOptional")}
              error={errors.displayLabel?.message}
            >
              <Input
                id="displayLabel"
                placeholder={tCustomers("tireDisplayLabelPlaceholder")}
                aria-invalid={!!errors.displayLabel}
                {...register("displayLabel")}
              />
            </FormField>
          </div>
        </form>

        <FormDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="add-tire-set-form"
            variant="brand"
            className="w-full sm:w-auto"
            disabled={!tiresAllowed}
          >
            {tCustomers("addTireSet")}
          </Button>
        </FormDialogFooter>
      </FormDialogContent>
    </Dialog>
  );
}
