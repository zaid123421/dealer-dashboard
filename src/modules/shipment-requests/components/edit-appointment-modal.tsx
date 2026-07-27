"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogDescription,
  DialogTitle,
  FormDialogContent,
  FormDialogFooter,
  FormDialogHeader,
} from "@/components/ui/app-dialog";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatLocaleDate } from "@/lib/format-locale";
import { CART_MODAL_SUBMIT_RESPONSIVE } from "@/lib/dialog-styles";
import { useDealerProfile } from "@/shared/hooks/use-can-access";
import { useClientNowMs } from "@/shared/hooks/use-client-now-ms";
import {
  normalizeServiceDays,
  type WeekDay,
} from "@/modules/dealer/lib/service-days";
import { getDealerShipmentRequestDetail } from "@/modules/shipment-requests/services/dealer-shipment-request-detail.service";
import { SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK } from "@/modules/shipment-requests/services/dealer-shipment-request-submit.service";
import { useUpdateShipmentRequestAppointment } from "@/modules/shipment-requests/hooks/use-update-shipment-request-appointment";
import type { NormalizedDeliveryOrderRow } from "@/modules/shipment-requests/lib/shipment-request-dto";

const PREFERRED_DAY_NONE = "__none__";

function swapLocalInputToIso(local: string): string | null {
  if (!local.trim()) return null;
  const ms = new Date(local).getTime();
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

function dateToDatetimeLocal(date: Date | null): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface EditAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: NormalizedDeliveryOrderRow | null;
}

export function EditAppointmentModal({
  open,
  onOpenChange,
  row,
}: EditAppointmentModalProps) {
  const tc = useTranslations("deliveryCart");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const profile = useDealerProfile();
  const nowMs = useClientNowMs();
  const updateMutation = useUpdateShipmentRequestAppointment();

  const serviceDays = useMemo(
    () => normalizeServiceDays(profile?.activeSubscription?.serviceDays),
    [profile?.activeSubscription?.serviceDays],
  );

  const [swapAppointmentLocal, setSwapAppointmentLocal] = useState("");
  const [preferredDeliveryDay, setPreferredDeliveryDay] = useState("");
  const [version, setVersion] = useState(SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !row) {
      setSwapAppointmentLocal("");
      setPreferredDeliveryDay("");
      setVersion(SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK);
      setLoadingDetail(false);
      setDetailError(null);
      return;
    }

    setSwapAppointmentLocal(dateToDatetimeLocal(row.appointmentDate));
    setPreferredDeliveryDay("");
    setVersion(row.version ?? SUBMIT_SHIPMENT_REQUEST_VERSION_FALLBACK);
    setDetailError(null);
    setLoadingDetail(true);

    let cancelled = false;
    void (async () => {
      try {
        const detail = await getDealerShipmentRequestDetail(row.id);
        if (cancelled) return;
        if (detail.swapAppointment) {
          const d = new Date(detail.swapAppointment);
          if (!Number.isNaN(d.getTime())) {
            setSwapAppointmentLocal(dateToDatetimeLocal(d));
          }
        }
        if (detail.preferredDeliveryDay?.trim()) {
          setPreferredDeliveryDay(detail.preferredDeliveryDay.trim());
        }
        if (detail.version != null) {
          setVersion(detail.version);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : tc("editAppointmentLoadError");
        setDetailError(msg);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, row, tc]);

  useEffect(() => {
    if (preferredDeliveryDay && !serviceDays.includes(preferredDeliveryDay as WeekDay)) {
      setPreferredDeliveryDay("");
    }
  }, [preferredDeliveryDay, serviceDays]);

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

  const isSaving = updateMutation.isPending;
  const formDisabled = loadingDetail || isSaving || !row;

  async function handleSave() {
    if (!row) return;
    const swapAppointment = swapLocalInputToIso(swapAppointmentLocal);
    if (!swapAppointment) {
      toast.error(tc("addItemValidation"));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: row.id,
        swapAppointment,
        version,
        ...(preferredDeliveryDay.trim()
          ? { preferredDeliveryDay: preferredDeliveryDay.trim() }
          : {}),
      });
      toast.success(tc("editAppointmentSuccess"));
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tc("editAppointmentError");
      toast.error(msg || tc("editAppointmentError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FormDialogContent size="md">
        <FormDialogHeader>
          <DialogTitle>{tc("editAppointmentTitle")}</DialogTitle>
          {row ? (
            <DialogDescription>{row.orderLabel}</DialogDescription>
          ) : null}
          {loadingDetail ? (
            <p className="mt-2 flex items-center gap-2 text-body-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              {tc("editAppointmentLoading")}
            </p>
          ) : null}
        </FormDialogHeader>

        <div className="flex flex-col gap-4 px-6 py-4">
          {detailError ? (
            <p className="rounded-lg border border-amber-400/60 bg-amber-50 px-3 py-2 text-body-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/20 dark:text-amber-200">
              {detailError}
            </p>
          ) : null}

          <FormField id="edit-swap-appointment" label={tc("fieldSwapAppointment")} required>
            <Input
              id="edit-swap-appointment"
              type="datetime-local"
              value={swapAppointmentLocal}
              onChange={(e) => setSwapAppointmentLocal(e.target.value)}
              disabled={formDisabled}
              className="h-10 min-w-0 w-full max-w-full text-body-md shadow-xs"
            />
          </FormField>

          <FormField
            id="edit-preferred-day"
            label={tc("fieldPreferredDeliveryDay")}
            optional={`(${tc("optional")})`}
          >
            <Select
              value={preferredDaySelectValue}
              onValueChange={(v) =>
                setPreferredDeliveryDay(v === PREFERRED_DAY_NONE ? "" : v)
              }
              disabled={formDisabled}
            >
              <SelectTrigger id="edit-preferred-day">
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
        </div>

        <FormDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="button"
            variant="brand"
            className={CART_MODAL_SUBMIT_RESPONSIVE}
            onClick={() => void handleSave()}
            disabled={formDisabled}
          >
            {isSaving ? tc("savingAppointment") : tc("saveAppointment")}
          </Button>
        </FormDialogFooter>
      </FormDialogContent>
    </Dialog>
  );
}
