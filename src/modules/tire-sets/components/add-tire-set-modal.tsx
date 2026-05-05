"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
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
import { Controller } from "react-hook-form";

const createTireSetSchema = z.object({
  tireCount: z.number().min(1, "At least 1 tire is required").max(8, "Maximum 8 tires allowed"),
  minimum: z.number().min(1, "Minimum must be at least 1"),
  seasonType: z.enum(["Winter", "Summer", "All-Season"]),
  brand: z.string().min(1, "Brand is required"),
  size: z.string().min(1, "Size is required"),
  displayLabel: z.string().optional(),
});

type CreateTireSetFormValues = z.infer<typeof createTireSetSchema>;

interface AddTireSetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  vehicleId: string;
}

export function AddTireSetModal({ open, onOpenChange, customerId, vehicleId }: AddTireSetModalProps) {
  const t = useTranslations("common");
  const tCustomers = useTranslations("customers");

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
      minimum: 1,
      seasonType: "All-Season",
      brand: "",
      size: "",
      displayLabel: "",
    },
  });

  const onSubmit = async (data: CreateTireSetFormValues) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/dealerCustomers/${customerId}/vehicles/${vehicleId}/tire-sets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create tire set');
      }

      toast.success(tCustomers("tireSetCreatedSuccess") || "Tire set created successfully");
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create tire set");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tire Set</DialogTitle>
          <DialogDescription>
            Add a new tire set to this vehicle
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tireCount">Number of Tires</Label>
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
                <Label htmlFor="minimum">Minimum</Label>
                <Input
                  id="minimum"
                  type="number"
                  min="1"
                  {...register("minimum", { valueAsNumber: true })}
                  className={errors.minimum ? "border-red-500" : ""}
                />
                {errors.minimum && (
                  <p className="text-sm text-red-500">{errors.minimum.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seasonType">Season Type</Label>
              <Controller
                name="seasonType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className={errors.seasonType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select season" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Winter">Winter</SelectItem>
                      <SelectItem value="Summer">Summer</SelectItem>
                      <SelectItem value="All-Season">All Seasons</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.seasonType && (
                <p className="text-sm text-red-500">{errors.seasonType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="Enter tire brand"
                {...register("brand")}
                className={errors.brand ? "border-red-500" : ""}
              />
              {errors.brand && (
                <p className="text-sm text-red-500">{errors.brand.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Input
                id="size"
                placeholder="e.g. 225/45R17"
                {...register("size")}
                className={errors.size ? "border-red-500" : ""}
              />
              {errors.size && (
                <p className="text-sm text-red-500">{errors.size.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayLabel">Display Label (Optional)</Label>
              <Input
                id="displayLabel"
                placeholder="Optional display label"
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
              Add Tire Set
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
