"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogTitle,
  FormDialogContent,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/ui/app-dialog";
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
import { cn } from "@/lib/utils";
import { formatLocaleDate } from "@/lib/format-locale";
import { CART_MODAL_SUBMIT_RESPONSIVE } from "@/lib/dialog-styles";
import { DIALOG_FOOTER_BUTTON_CLASS } from "@/lib/radius";
import { useDealerId, useDealerProfile } from "@/shared/hooks/use-can-access";
import { useClientNowMs } from "@/shared/hooks/use-client-now-ms";
import {
  normalizeServiceDays,
  type WeekDay,
} from "@/modules/dealer/lib/service-days";
import { useDealerCustomersInfinite } from "@/modules/customers/hooks/use-my-dealer-customers";
import { useCustomerVehicles } from "@/modules/vehicles/hooks/use-customer-vehicles";
import { useVehicleTireSets } from "@/modules/tire-sets/hooks/use-vehicle-tire-sets";
import { createDeliveryRequest } from "@/modules/shipment-requests/services/dealer-cart.service";
import { getDealerShipmentRequestDetail } from "@/modules/shipment-requests/services/dealer-shipment-request-detail.service";
import { COMBINE_PICKUP_DELIVERY_VERSION_FALLBACK } from "@/modules/shipment-requests/services/dealer-pickup-suggestion.service";
import { PickupSuggestionsStep } from "@/modules/shipment-requests/components/pickup-suggestions-step";

const PREFERRED_DAY_NONE = "__none__";

function swapLocalInputToIso(local: string): string | null {
  if (!local.trim()) return null;
  const ms = new Date(local).getTime();
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

type WizardStep = "form" | "suggestions";

interface AddDeliveryItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

function MiniStepperHeader({
  active,
  tc,
}: {
  active: 1 | 2;
  tc: (k: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:gap-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-label-sm font-bold transition-colors sm:size-8 sm:text-label-md",
            active === 1
              ? "bg-primary-dark text-primary-onContainer"
              : "bg-emerald-500 text-white",
          )}
          aria-current={active === 1 ? "step" : undefined}
        >
          {active === 1 ? "1" : <Check className="size-4" strokeWidth={3} />}
        </div>
        <span
          className={cn(
            "text-xs font-semibold sm:text-body-sm",
            active === 1 ? "text-foreground" : "text-emerald-600 dark:text-emerald-400",
          )}
        >
          {tc("stepDelivery")}
        </span>
      </div>
      <div className="h-px w-6 shrink-0 bg-border sm:w-12" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-label-sm font-bold transition-colors sm:size-8 sm:text-label-md",
            active === 2
              ? "bg-primary-dark text-primary-onContainer"
              : "bg-muted text-muted-foreground",
          )}
        >
          2
        </div>
        <span
          className={cn(
            "text-xs font-semibold sm:text-body-sm",
            active === 2 ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {tc("stepCombine")}
        </span>
      </div>
    </div>
  );
}

export function AddDeliveryItemModal({
  open,
  onOpenChange,
  onCreated,
}: AddDeliveryItemModalProps) {
  const tc = useTranslations("deliveryCart");
  const tStep = useTranslations("combinePickup");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const dealerId = useDealerId();
  const profile = useDealerProfile();
  const nowMs = useClientNowMs();
  const queryClient = useQueryClient();

  const serviceDays = useMemo(
    () => normalizeServiceDays(profile?.activeSubscription?.serviceDays),
    [profile?.activeSubscription?.serviceDays],
  );

  const [step, setStep] = useState<WizardStep>("form");
  const [createdDeliveryId, setCreatedDeliveryId] = useState<number | null>(null);
  const [createdDeliveryVersion, setCreatedDeliveryVersion] = useState<number | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [tireSetId, setTireSetId] = useState("");
  const [swapAppointmentLocal, setSwapAppointmentLocal] = useState("");
  const [preferredDeliveryDay, setPreferredDeliveryDay] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("form");
      setCreatedDeliveryId(null);
      setCreatedDeliveryVersion(null);
      setCustomerId("");
      setVehicleId("");
      setTireSetId("");
      setSwapAppointmentLocal("");
      setPreferredDeliveryDay("");
      setNotes("");
    }
  }, [open]);

  useEffect(() => {
    if (preferredDeliveryDay && !serviceDays.includes(preferredDeliveryDay as WeekDay)) {
      setPreferredDeliveryDay("");
    }
  }, [preferredDeliveryDay, serviceDays]);

  /* ── Customers ── */
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

  /* ── Vehicles ── */
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

  /* ── Tire set (optional single id → `setIds` array of one) ── */
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

  /* ── Window info (from swap appointment) ── */
  const windowInfo = useMemo(() => {
    if (nowMs == null) return null;
    const iso = swapLocalInputToIso(swapAppointmentLocal);
    if (!iso) return null;
    const apptMs = new Date(iso).getTime();
    if (Number.isNaN(apptMs)) return null;
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const deadlineMs = apptMs - WEEK_MS;
    const daysUntilDeadline = Math.floor(
      (deadlineMs - nowMs) / (1000 * 60 * 60 * 24),
    );
    return {
      apptDisplay: formatLocaleDate(new Date(apptMs), locale),
      deadlineDisplay: formatLocaleDate(new Date(deadlineMs), locale),
      daysUntilDeadline,
      isOk: daysUntilDeadline > 0,
    };
  }, [swapAppointmentLocal, locale, nowMs]);

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
    const swapAppointment = swapLocalInputToIso(swapAppointmentLocal);
    if (!customerId || !vehicleId || !swapAppointment) {
      toast.error(tc("addItemValidation"));
      return;
    }
    setIsSubmitting(true);
    try {
      const { id } = await createDeliveryRequest({
        dealerCustomerId: Number(customerId),
        vehicleId: Number(vehicleId),
        swapAppointment,
        ...(preferredDeliveryDay.trim()
          ? { preferredDeliveryDay: preferredDeliveryDay.trim() }
          : {}),
        ...(tireSetId ? { setIds: [Number(tireSetId)] } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      toast.success(tc("addItemSuccess"));
      onCreated?.();
      void queryClient.invalidateQueries();

      let deliveryVersion = COMBINE_PICKUP_DELIVERY_VERSION_FALLBACK;
      try {
        const detail = await getDealerShipmentRequestDetail(id);
        if (detail.version != null) deliveryVersion = detail.version;
      } catch {
        /* use fallback */
      }

      setCreatedDeliveryId(id);
      setCreatedDeliveryVersion(deliveryVersion);
      setStep("suggestions");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("addItemError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFinishSuggestions() {
    void queryClient.invalidateQueries();
    onOpenChange(false);
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
    preferredDeliveryDay && preferredDeliveryDay !== ""
      ? preferredDeliveryDay
      : PREFERRED_DAY_NONE;

  const isSuggestionsStep = step === "suggestions";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isSuggestionsStep && createdDeliveryId != null ? (
        <FormDialogContent size="lg">
          <DialogTitle className="sr-only">{tStep("title")}</DialogTitle>
          <PickupSuggestionsStep
            deliveryId={createdDeliveryId}
            deliveryVersion={createdDeliveryVersion}
            onFinish={handleFinishSuggestions}
          />
        </FormDialogContent>
      ) : (
        <FormDialogContent size="md">
          <FormDialogHeader>
            <DialogTitle>{tc("addDeliveryItem")}</DialogTitle>
            <div className="pt-3">
              <MiniStepperHeader active={1} tc={tStep} />
            </div>
          </FormDialogHeader>

          <div className="flex flex-col gap-4 px-6 py-4 max-sm:px-4">
            <FormField id="delivery-customer" label={tc("fieldCustomer")} required>
              <SearchableCombobox
                id="delivery-customer"
                value={customerId}
                onValueChange={handleCustomerChange}
                options={customerOptions}
                placeholder={tc("customerPlaceholder")}
                searchPlaceholder={tc("customerSearchPlaceholder")}
                emptyText={tc("noCustomers")}
                disabled={dealerId == null}
              />
            </FormField>

            <FormField id="delivery-vehicle" label={tc("fieldVehicle")} required>
              <SearchableCombobox
                id="delivery-vehicle"
                value={vehicleId}
                onValueChange={handleVehicleChange}
                options={vehicleOptions}
                placeholder={tc("vehiclePlaceholder")}
                searchPlaceholder={tc("vehicleSearchPlaceholder")}
                emptyText={tc("noVehiclesFound")}
                disabled={!customerId}
              />
            </FormField>

            <FormField
              id="delivery-swap-appointment"
              label={tc("fieldSwapAppointment")}
              required
            >
              <Input
                id="delivery-swap-appointment"
                type="datetime-local"
                value={swapAppointmentLocal}
                onChange={(e) => setSwapAppointmentLocal(e.target.value)}
                className="h-10 min-w-0 w-full max-w-full text-body-md shadow-xs"
              />
            </FormField>

            <FormField
              id="delivery-preferred-day"
              label={tc("fieldPreferredDeliveryDay")}
              optional={`(${tc("optional")})`}
            >
              <Select
                value={preferredDaySelectValue}
                onValueChange={(v) =>
                  setPreferredDeliveryDay(v === PREFERRED_DAY_NONE ? "" : v)
                }
              >
                <SelectTrigger id="delivery-preferred-day">
                  <SelectValue placeholder={tc("preferredDayNone")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PREFERRED_DAY_NONE}>
                    {tc("preferredDayNone")}
                  </SelectItem>
                  {serviceDays.map((day) => (
                    <SelectItem key={day} value={day}>
                      {weekDayLabels[day]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              id="delivery-tire-set"
              label={tc("fieldTireSet")}
              optional={`(${tc("optional")})`}
            >
              {!vehicleId ? (
                <FieldHint>{tc("tireSetsHintSelectVehicle")}</FieldHint>
              ) : tireSets.length === 0 ? (
                <FieldHint>{tc("noTireSets")}</FieldHint>
              ) : (
                <SearchableCombobox
                  id="delivery-tire-set"
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
              id="delivery-notes"
              label={tc("fieldNotesModal")}
              optional={`(${tc("optional")})`}
            >
              <Textarea
                id="delivery-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tc("notesPlaceholder")}
                rows={3}
                className="resize-none"
              />
            </FormField>

            {windowInfo ? (
              <div className="rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-3 dark:border-amber-500/40 dark:bg-amber-950/20">
                <p className="text-body-sm text-amber-900 dark:text-amber-200">
                  <CalendarIcon
                    className="mb-0.5 me-1.5 inline size-3.5"
                    aria-hidden
                  />
                  {tc("appointmentInfo", {
                    date: windowInfo.apptDisplay,
                    deadline: windowInfo.deadlineDisplay,
                  })}
                </p>
                <p
                  className={cn(
                    "mt-1 flex items-center gap-1.5 text-body-sm font-medium",
                    windowInfo.isOk
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      windowInfo.isOk ? "bg-emerald-500" : "bg-destructive",
                    )}
                  />
                  {windowInfo.isOk
                    ? tc("windowOkInfo", { days: windowInfo.daysUntilDeadline })
                    : tc("windowExpiredInfo")}
                </p>
              </div>
            ) : null}

            <div className="flex items-start gap-3 rounded-lg border border-primary-dark/25 bg-primary-dark/10 px-4 py-3 dark:border-primary/30 dark:bg-primary/10">
              <div
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-dark text-primary-onContainer"
                aria-hidden
              >
                <Check className="size-3.5" strokeWidth={3} />
              </div>
              <div className="text-body-sm text-foreground">
                <p className="font-semibold">{tStep("nextStepHintTitle")}</p>
                <p className="mt-0.5 leading-relaxed text-muted-foreground">
                  {tStep("nextStepHintBody")}
                </p>
              </div>
            </div>
          </div>

          <FormDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className={cn(DIALOG_FOOTER_BUTTON_CLASS, "w-full sm:w-auto")}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="brand"
              className={cn(CART_MODAL_SUBMIT_RESPONSIVE, DIALOG_FOOTER_BUTTON_CLASS)}
              onClick={() => void handleSubmit()}
              disabled={isSubmitting}
            >
              {isSubmitting ? tc("addingToCart") : tc("addToCart")}
            </Button>
          </FormDialogFooter>
        </FormDialogContent>
      )}
    </Dialog>
  );
}
