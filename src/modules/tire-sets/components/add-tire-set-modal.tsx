"use client";

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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

type CreateTireSetFormValues = {
  tireCount: number;
  seasonType: "Winter" | "Summer" | "All-Season";
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
  const queryClient = useQueryClient();

  const createTireSetSchema = useMemo(
    () =>
      z.object({
        tireCount: z
          .number()
          .min(1, tCustomers("tireSetTireCountMinError"))
          .max(8, tCustomers("tireSetTireCountMaxError")),
        seasonType: z.enum(["Winter", "Summer", "All-Season"]),
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
      seasonType: "All-Season",
      brand: "",
      size: "",
      displayLabel: "",
    },
  });

  const onSubmit = async (data: CreateTireSetFormValues) => {
    try {
      await api.post(
        `/v1/dealerCustomers/${customerId}/vehicles/${vehicleId}/tire-sets`,
        data,
      );

      toast.success(tCustomers("tireSetCreatedSuccess"));
      onCreated?.();
      void queryClient.invalidateQueries({ queryKey: dealerTireSetsOverviewQueryKey });
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tCustomers("addTireSet")}</DialogTitle>
          <DialogDescription>{tCustomers("addTireSetModalDescription")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tireCount">{tCustomers("numberOfTires")}</Label>
              <Input
                id="tireCount"
                type="number"
                min="1"
                max="8"
                {...register("tireCount", { valueAsNumber: true })}
                className={errors.tireCount ? "border-red-500" : ""}
              />
              {errors.tireCount && (
                <p className="text-sm text-red-500">{errors.tireCount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seasonType">{tCustomers("seasonType")}</Label>
              <Controller
                name="seasonType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={errors.seasonType ? "border-red-500" : ""}>
                      <SelectValue placeholder={tCustomers("tireSetSeasonPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Winter">{tCustomers("winter")}</SelectItem>
                      <SelectItem value="Summer">{tCustomers("summer")}</SelectItem>
                      <SelectItem value="All-Season">{tCustomers("allSeason")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.seasonType && (
                <p className="text-sm text-red-500">{errors.seasonType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">{tCustomers("tireBrand")}</Label>
              <Input
                id="brand"
                placeholder={tCustomers("tireBrandPlaceholder")}
                {...register("brand")}
                className={errors.brand ? "border-red-500" : ""}
              />
              {errors.brand && (
                <p className="text-sm text-red-500">{errors.brand.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">{tCustomers("tireSize")}</Label>
              <Input
                id="size"
                placeholder={tCustomers("tireSizePlaceholder")}
                {...register("size")}
                className={errors.size ? "border-red-500" : ""}
              />
              {errors.size && (
                <p className="text-sm text-red-500">{errors.size.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayLabel">{tCustomers("tireDisplayLabelOptional")}</Label>
              <Input
                id="displayLabel"
                placeholder={tCustomers("tireDisplayLabelPlaceholder")}
                {...register("displayLabel")}
                className={errors.displayLabel ? "border-red-500" : ""}
              />
              {errors.displayLabel && (
                <p className="text-sm text-red-500">{errors.displayLabel.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 py-4 gap-2 sm:justify-end sm:gap-0">
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
              className="bg-primary-dark text-primary-onContainer font-bold hover:bg-primary-dark/90 w-full sm:w-auto"
            >
              {tCustomers("addTireSet")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
