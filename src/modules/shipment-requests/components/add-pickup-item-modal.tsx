"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DialogTitle, FormDialogContent, FormDialogHeader } from "@/components/ui/app-dialog";
import { FormField } from "@/components/ui/form-field";
import { FieldHint } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  SearchableCombobox,
  type SearchableComboboxOption,
} from "@/components/ui/searchable-combobox";
import { useDealerId } from "@/shared/hooks/use-can-access";
import { useDealerCustomersInfinite } from "@/modules/customers/hooks/use-my-dealer-customers";
import { useCustomerVehicles } from "@/modules/vehicles/hooks/use-customer-vehicles";
import { useVehicleTireSets } from "@/modules/tire-sets/hooks/use-vehicle-tire-sets";
import { CART_MODAL_SUBMIT_RESPONSIVE } from "@/lib/dialog-styles";
import { createPickupRequest } from "@/modules/shipment-requests/services/dealer-cart.service";

const WEEK_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const PREFERRED_DAY_NONE = "__none__";

interface AddPickupItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function AddPickupItemModal({
  open,
  onOpenChange,
  onCreated,
}: AddPickupItemModalProps) {
  const tc = useTranslations("deliveryCart");
  const tp = useTranslations("pickupCart");
  const tCommon = useTranslations("common");
  const dealerId = useDealerId();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [tireSetId, setTireSetId] = useState("");
  const [preferredDispatchDay, setPreferredDispatchDay] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setCustomerId("");
      setVehicleId("");
      setTireSetId("");
      setPreferredDispatchDay("");
      setNotes("");
    }
  }, [open]);

  const { data: customersData } = useDealerCustomersInfinite({
    dealerId,
    searchTerm: "",
    size: 50,
    sortBy: "firstName",
    direction: "asc",
    includeArchived: false,
  });

  const customerOptions = useMemo<SearchableComboboxOption[]>(() => {
    const pages = customersData?.pages ?? [];
    return pages.flatMap((p) =>
      p.content.map((c) => ({
        value: String(c.id),
        label: `${c.firstName} ${c.lastName}`.trim(),
      })),
    );
  }, [customersData]);

  const { data: vehicles = [] } = useCustomerVehicles(
    customerId ? Number(customerId) : null,
  );

  const vehicleOptions = useMemo<SearchableComboboxOption[]>(
    () =>
      vehicles.map((v) => ({
        value: String(v.id),
        label: `${v.make} ${v.model} ${v.year} — ${v.plateNumber}`,
      })),
    [vehicles],
  );

  const { tireSets } = useVehicleTireSets({
    customerId: customerId || undefined,
    vehicleId: vehicleId || undefined,
  });

  const tireSetOptions = useMemo<SearchableComboboxOption[]>(
    () =>
      tireSets.map((ts) => ({
        value: String(ts.id),
        label:
          ts.displayLabel?.trim() ||
          `${ts.brand} ${ts.size} (${ts.seasonType})`,
      })),
    [tireSets],
  );

  function handleCustomerChange(val: string) {
    setCustomerId(val);
    setVehicleId("");
    setTireSetId("");
  }

  function handleVehicleChange(val: string) {
    setVehicleId(val);
    setTireSetId("");
  }

  async function handleSubmit() {
    if (!customerId || !vehicleId || !tireSetId) {
      toast.error(tp("addItemValidation"));
      return;
    }
    setIsSubmitting(true);
    try {
      await createPickupRequest({
        dealerCustomerId: Number(customerId),
        vehicleId: Number(vehicleId),
        setIds: [Number(tireSetId)],
        ...(preferredDispatchDay.trim()
          ? { preferredDispatchDay: preferredDispatchDay.trim() }
          : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      toast.success(tp("addItemSuccess"));
      onCreated?.();
      void queryClient.invalidateQueries();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("addItemError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const weekDayLabels = useMemo(
    () => ({
      MONDAY: tc("weekDay.MONDAY"),
      TUESDAY: tc("weekDay.TUESDAY"),
      WEDNESDAY: tc("weekDay.WEDNESDAY"),
      THURSDAY: tc("weekDay.THURSDAY"),
      FRIDAY: tc("weekDay.FRIDAY"),
      SATURDAY: tc("weekDay.SATURDAY"),
      SUNDAY: tc("weekDay.SUNDAY"),
    }),
    [tc],
  );

  const preferredDaySelectValue =
    preferredDispatchDay && preferredDispatchDay !== ""
      ? preferredDispatchDay
      : PREFERRED_DAY_NONE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <DialogTitle>{tp("addPickupItem")}</DialogTitle>
        </FormDialogHeader>

        <div className="flex flex-col gap-4 px-6 py-4">
          <FormField id="pickup-customer" label={tc("fieldCustomer")} required>
            <SearchableCombobox
              id="pickup-customer"
              value={customerId}
              onValueChange={handleCustomerChange}
              options={customerOptions}
              placeholder={tc("customerPlaceholder")}
              searchPlaceholder={tc("customerSearchPlaceholder")}
              emptyText={tc("noCustomers")}
              disabled={dealerId == null}
            />
          </FormField>

          <FormField id="pickup-vehicle" label={tc("fieldVehicle")} required>
            <SearchableCombobox
              id="pickup-vehicle"
              value={vehicleId}
              onValueChange={handleVehicleChange}
              options={vehicleOptions}
              placeholder={tc("vehiclePlaceholder")}
              searchPlaceholder={tc("vehicleSearchPlaceholder")}
              emptyText={tc("noVehiclesFound")}
              disabled={!customerId}
            />
          </FormField>

          <FormField id="pickup-tire-set" label={tc("fieldTireSet")} required>
            {!vehicleId ? (
              <FieldHint>{tc("tireSetsHintSelectVehicle")}</FieldHint>
            ) : tireSets.length === 0 ? (
              <FieldHint>{tc("noTireSets")}</FieldHint>
            ) : (
              <SearchableCombobox
                id="pickup-tire-set"
                value={tireSetId}
                onValueChange={setTireSetId}
                options={tireSetOptions}
                placeholder={tc("tireSetPlaceholder")}
                searchPlaceholder={tc("tireSetSearchPlaceholder")}
                emptyText={tc("noTireSets")}
                disabled={!vehicleId}
              />
            )}
          </FormField>

          <FormField
            id="pickup-preferred-day"
            label={tp("fieldPreferredDispatchDay")}
            optional={`(${tc("optional")})`}
          >
            <Select
              value={preferredDaySelectValue}
              onValueChange={(v) =>
                setPreferredDispatchDay(v === PREFERRED_DAY_NONE ? "" : v)
              }
            >
              <SelectTrigger id="pickup-preferred-day">
                <SelectValue placeholder={tc("preferredDayNone")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PREFERRED_DAY_NONE}>
                  {tc("preferredDayNone")}
                </SelectItem>
                {WEEK_DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {weekDayLabels[day]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="pickup-notes"
            label={tc("fieldNotesModal")}
            optional={`(${tc("optional")})`}
          >
            <Textarea
              id="pickup-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tc("notesPlaceholder")}
              rows={3}
              className="resize-none"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 border-t border-[var(--border)] px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            variant="brand"
            className={CART_MODAL_SUBMIT_RESPONSIVE}
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? tc("addingToCart") : tc("addToCart")}
          </Button>
        </div>
      </FormDialogContent>
    </Dialog>
  );
}
