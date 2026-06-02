"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldHint, Label, OptionalMark, RequiredMark } from "@/components/ui/label";
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
import { CART_MODAL_CONTENT_CLASS } from "@/lib/cart-modal-styles";
import { PRIMARY_BUTTON_RESPONSIVE } from "@/lib/primary-button-styles";
import { useDealerId } from "@/shared/hooks/use-can-access";
import { useDealerCustomersInfinite } from "@/modules/customers/hooks/use-my-dealer-customers";
import { useCustomerVehicles } from "@/modules/vehicles/hooks/use-customer-vehicles";
import { useVehicleTireSets } from "@/modules/tire-sets/hooks/use-vehicle-tire-sets";
import { createDeliveryRequest } from "@/modules/shipment-requests/services/dealer-cart.service";
import { getDealerShipmentRequestDetail } from "@/modules/shipment-requests/services/dealer-shipment-request-detail.service";
import { COMBINE_PICKUP_DELIVERY_VERSION_FALLBACK } from "@/modules/shipment-requests/services/dealer-pickup-suggestion.service";
import { PickupSuggestionsStep } from "@/modules/shipment-requests/components/pickup-suggestions-step";

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
            active === 1 ? "bg-amber-500 text-black" : "bg-emerald-500 text-white",
          )}
          aria-current={active === 1 ? "step" : undefined}
        >
          1
        </div>
        <span className="text-xs font-semibold text-foreground sm:text-body-sm">{tc("stepDelivery")}</span>
      </div>
      <div className="h-px w-6 shrink-0 bg-transparent sm:w-12" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-label-sm font-bold transition-colors sm:size-8 sm:text-label-md",
            active === 2 ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground",
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
  const queryClient = useQueryClient();

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
    const iso = swapLocalInputToIso(swapAppointmentLocal);
    if (!iso) return null;
    const apptMs = new Date(iso).getTime();
    if (Number.isNaN(apptMs)) return null;
    const now = Date.now();
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const deadlineMs = apptMs - WEEK_MS;
    const daysUntilDeadline = Math.floor(
      (deadlineMs - now) / (1000 * 60 * 60 * 24),
    );
    const fmt = (ms: number) => {
      try {
        return new Date(ms).toLocaleDateString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return "";
      }
    };
    return {
      apptDisplay: fmt(apptMs),
      deadlineDisplay: fmt(deadlineMs),
      daysUntilDeadline,
      isOk: daysUntilDeadline > 0,
    };
  }, [swapAppointmentLocal, locale]);

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
      <DialogContent
        className={cn(
          "flex w-[calc(100%-1rem)] max-h-[min(100dvh-0.75rem,920px)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden border-0 p-0 sm:w-full",
          CART_MODAL_CONTENT_CLASS,
          isSuggestionsStep ? "sm:max-w-2xl" : "sm:max-w-lg",
        )}
      >
        {isSuggestionsStep && createdDeliveryId != null ? (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Hidden accessible title for the dialog (the visible heading lives inside the step). */}
            <DialogTitle className="sr-only">{tStep("title")}</DialogTitle>
            <PickupSuggestionsStep
              deliveryId={createdDeliveryId}
              deliveryVersion={createdDeliveryVersion}
              onFinish={handleFinishSuggestions}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 space-y-3 px-4 pb-4 pt-4 pe-12 sm:px-6 sm:pt-6">
              <DialogHeader>
                <DialogTitle className="text-start text-base leading-snug sm:text-lg">
                  {tc("addDeliveryItem")}
                </DialogTitle>
              </DialogHeader>

              <MiniStepperHeader active={1} tc={tStep} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4">
              {/* dealerCustomerId */}
              <div className="space-y-1.5">
                <Label className="text-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {tc("fieldCustomer")} <RequiredMark />
                </Label>
                <SearchableCombobox
                  value={customerId}
                  onValueChange={handleCustomerChange}
                  options={customerOptions}
                  placeholder={tc("customerPlaceholder")}
                  searchPlaceholder={tc("customerSearchPlaceholder")}
                  emptyText={tc("noCustomers")}
                  disabled={dealerId == null}
                />
              </div>

              {/* vehicleId */}
              <div className="space-y-1.5">
                <Label className="text-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {tc("fieldVehicle")} <RequiredMark />
                </Label>
                <SearchableCombobox
                  value={vehicleId}
                  onValueChange={handleVehicleChange}
                  options={vehicleOptions}
                  placeholder={tc("vehiclePlaceholder")}
                  searchPlaceholder={tc("vehicleSearchPlaceholder")}
                  emptyText={tc("noVehiclesFound")}
                  disabled={!customerId}
                />
              </div>

              {/* swapAppointment */}
              <div className="space-y-1.5">
                <Label className="text-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {tc("fieldSwapAppointment")} <RequiredMark />
                </Label>
                <Input
                  type="datetime-local"
                  value={swapAppointmentLocal}
                  onChange={(e) => setSwapAppointmentLocal(e.target.value)}
                  className="h-10 min-w-0 w-full max-w-full text-body-md shadow-xs"
                />
              </div>

              {/* preferredDeliveryDay (optional) */}
              <div className="space-y-1.5">
                <Label className="text-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {tc("fieldPreferredDeliveryDay")}{" "}
                  <OptionalMark>({tc("optional")})</OptionalMark>
                </Label>
                <Select
                  value={preferredDaySelectValue}
                  onValueChange={(v) =>
                    setPreferredDeliveryDay(v === PREFERRED_DAY_NONE ? "" : v)
                  }
                >
                  <SelectTrigger>
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
              </div>

              {/* setIds: one tire set chosen from vehicle (optional) */}
              <div className="space-y-1.5">
                <Label className="text-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {tc("fieldTireSet")}{" "}
                  <OptionalMark>({tc("optional")})</OptionalMark>
                </Label>
                {!vehicleId ? (
                  <FieldHint>{tc("tireSetsHintSelectVehicle")}</FieldHint>
                ) : tireSets.length === 0 ? (
                  <FieldHint>{tc("noTireSets")}</FieldHint>
                ) : (
                  <SearchableCombobox
                    value={tireSetId}
                    onValueChange={setTireSetId}
                    options={tireSetOptions}
                    placeholder={tc("tireSetPlaceholder")}
                    searchPlaceholder={tc("tireSetSearchPlaceholder")}
                    emptyText={tc("noTireSets")}
                    disabled={!vehicleId}
                  />
                )}
              </div>

              {/* notes (optional) */}
              <div className="space-y-1.5">
                <Label className="text-label-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {tc("fieldNotesModal")}{" "}
                  <OptionalMark>({tc("optional")})</OptionalMark>
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={tc("notesPlaceholder")}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Window info box */}
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

              {/* Hint about the next step (combine pickup) */}
              <div className="flex items-start gap-3 rounded-lg border border-amber-400/40 bg-amber-50/60 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-950/10">
                <div
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-black"
                  aria-hidden
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <div className="text-body-sm text-amber-900 dark:text-amber-200">
                  <p className="font-bold">{tStep("nextStepHintTitle")}</p>
                  <p className="mt-0.5 leading-relaxed">{tStep("nextStepHintBody")}</p>
                </div>
              </div>
            </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-2 bg-card px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="button"
                variant="brand"
                className={PRIMARY_BUTTON_RESPONSIVE}
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? tc("addingToCart") : tc("addToCart")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
