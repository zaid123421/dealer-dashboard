"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CircleX, Loader2, Mail, X } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DIALOG_SHELL_CLASS } from "@/lib/radius";
import { useDealerInboundEmails } from "@/modules/inbound-emails/hooks/use-dealer-inbound-emails";
import type { EmailSuggestion, ParseStatus } from "@/modules/inbound-emails/lib/inbound-email-dto";
import { MOCK_EMAIL_SUGGESTIONS } from "@/modules/inbound-emails/lib/inbound-email-mock";
import { useRejectShipmentRequest } from "@/modules/shipment-requests/hooks/use-reject-shipment-request";
import { useMoveShipmentRequestToCart } from "@/modules/shipment-requests/hooks/use-move-shipment-request-to-cart";

function parseStatusCopy(t: (key: string) => string, status: ParseStatus): string {
  switch (status) {
    case "matched":
      return t("emailInboxStatusMatched");
    case "window_too_short":
      return t("emailInboxStatusWindowTooShort");
    case "parse_failed":
      return t("emailInboxStatusParseFailed");
    case "no_tires_stored":
      return t("emailInboxStatusNoTiresStored");
    default:
      return "—";
  }
}

function statusBadgeClass(status: ParseStatus): string {
  switch (status) {
    case "matched":
      return "border-0 bg-success-dark text-success-onContainer shadow-none";
    case "window_too_short":
      return "border-0 bg-warning-dark/90 text-warning-onContainer shadow-none";
    case "parse_failed":
      return "border-0 bg-error-main text-destructive-foreground shadow-none";
    case "no_tires_stored":
      return "border-0 bg-info-main text-white shadow-none";
    default:
      return "border-0 bg-secondary text-secondary-foreground shadow-none";
  }
}

export default function EmailInboxPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { data, isLoading, isError } = useDealerInboundEmails({
    page: 0,
    size: 20,
    sortBy: "receivedAt",
    direction: "desc",
    locale,
  });

  const apiRows = data?.rows ?? [];
  const usingMockFallback = !isLoading && (isError || apiRows.length === 0);
  const suggestions = useMemo<EmailSuggestion[]>(
    () => (usingMockFallback ? MOCK_EMAIL_SUGGESTIONS : apiRows),
    [apiRows, usingMockFallback],
  );

  const [selectedId, setSelectedId] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const rejectMutation = useRejectShipmentRequest();
  const moveToCartMutation = useMoveShipmentRequestToCart();

  const selected = suggestions.find((s) => s.id === selectedId) ?? suggestions[0];
  const canActOnShipmentRequest = Boolean(selected?.shipmentRequestId);
  const actionPending = rejectMutation.isPending || moveToCartMutation.isPending;

  function handleRejectConfirm() {
    const shipmentRequestId = selected?.shipmentRequestId;
    if (shipmentRequestId == null) {
      toast.error(t("emailInboxRejectMissingRequest"));
      return;
    }

    rejectMutation.mutate(shipmentRequestId, {
      onSuccess: () => {
        toast.success(t("emailInboxRejectSuccess"));
        setRejectOpen(false);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("emailInboxRejectError"));
      },
    });
  }

  function handleApproveCart() {
    const shipmentRequestId = selected?.shipmentRequestId;
    if (shipmentRequestId == null) {
      toast.error(t("emailInboxRejectMissingRequest"));
      return;
    }

    moveToCartMutation.mutate(shipmentRequestId, {
      onSuccess: () => {
        toast.success(t("emailInboxApproveCartSuccess"));
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : t("emailInboxApproveCartError"));
      },
    });
  }

  useEffect(() => {
    if (suggestions.length === 0) {
      setSelectedId("");
      return;
    }
    setSelectedId((current) =>
      current && suggestions.some((s) => s.id === current) ? current : suggestions[0].id,
    );
  }, [suggestions]);

  const pendingCount = suggestions.filter((s) => s.status !== "parse_failed").length;
  const lastSyncedTime = usingMockFallback
    ? t("emailInboxMockLastSyncedTime")
    : suggestions[0]?.receivedAt ?? "—";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-headline-sm font-bold text-foreground">{t("emailInboxTitle")}</h1>
          <p className="text-body-md text-subtle">{t("emailInboxIntro")}</p>
        </div>
        <Badge className="shrink-0 self-start border-0 bg-primary-dark px-3 py-1.5 text-label-md font-semibold text-primary-onContainer shadow-none sm:self-auto">
          {t("emailInboxPendingSuggestions", { count: pendingCount })}
        </Badge>
      </div>

      {/* ── Info alert (matches delivery-cart warning style) ── */}
      <div className="flex gap-3 rounded-lg border border-amber-400/60 bg-amber-50 px-4 py-3 dark:border-amber-500/40 dark:bg-amber-950/30">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden />
        <p className="min-w-0 flex-1 text-body-sm leading-relaxed text-amber-900 dark:text-amber-200">
          {t("emailInboxAlert")}
        </p>
      </div>

      {/* ── Error state ── */}
      {isError ? <ErrorAlert message={t("emailInboxLoadError")} className="shrink-0" /> : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 items-stretch gap-4 lg:auto-rows-fr lg:grid-cols-2 lg:gap-6">
        <Card className="flex min-h-[280px] flex-col gap-0 py-0 shadow-sm lg:max-h-[min(680px,calc(100dvh-13rem))]">
          <CardHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
            <CardTitle className="text-title-md">{t("emailInboxParsedEmails")}</CardTitle>
            <CardDescription className="text-body-md">
              {isLoading ? (
                <Skeleton className="mt-1 h-4 w-[55%]" />
              ) : (
                t("emailInboxLastSynced", { time: lastSyncedTime })
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-0 pb-4">
            {isLoading ? (
              <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pt-3 max-sm:max-h-[min(52vh,440px)] sm:px-4" aria-busy="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="rounded-md border border-transparent bg-muted/20 p-3 dark:bg-surface-container">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1 space-y-2 ps-1">
                        <Skeleton className="h-3.5 w-[60%]" />
                        <Skeleton className="h-4 w-[85%]" />
                        <Skeleton className="h-3 w-[30%]" />
                      </div>
                      <Skeleton className="h-6 w-16 shrink-0 rounded-md" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : suggestions.length === 0 ? (
              <p className="px-4 py-8 text-center text-body-md text-muted-foreground">
                {t("emailInboxEmpty")}
              </p>
            ) : (
              <ul
                className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pt-3 max-sm:max-h-[min(52vh,440px)] sm:px-4"
                role="list"
              >
                {suggestions.map((row) => {
                  const active = selected?.id === row.id;
                  return (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className={cn(
                          "relative flex w-full flex-col gap-2 overflow-hidden rounded-md border p-3 text-start transition-colors",
                          "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-primary-dark bg-primary-container/20 dark:bg-[#231f1a]"
                            : "border-transparent bg-muted/20 dark:bg-surface-container",
                        )}
                      >
                        {active && (
                          <span
                            className="absolute start-0 top-0 h-full w-1.5 rounded-full bg-primary-dark"
                            aria-hidden
                          />
                        )}
                        <div className="flex items-start gap-2 ps-1 rtl:flex-row-reverse">
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <span className="block text-label-md leading-snug text-muted-foreground">
                              <span>{t("emailInboxLabelFrom")}: </span>
                              <span className="break-all font-medium text-foreground">{row.from}</span>
                            </span>
                            <span className="block text-title-sm font-semibold leading-snug text-foreground">
                              {row.subject}
                            </span>
                            <span className="text-label-sm text-muted-foreground">{row.receivedAt}</span>
                          </div>
                          <Badge className={cn("shrink-0 text-label-sm", statusBadgeClass(row.status))}>
                            {parseStatusCopy(t, row.status)}
                          </Badge>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col gap-0 py-0 shadow-sm lg:max-h-[min(680px,calc(100dvh-13rem))]">
          <CardHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-dark/10 text-primary-dark">
                <Mail className="size-4" strokeWidth={2} />
              </span>
              <CardTitle className="text-title-md">{t("emailInboxSuggestionDetail")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6">
            {isLoading ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="group min-w-0">
                      <Skeleton className="mb-2 h-3.5 w-[40%]" />
                      <Skeleton className="h-[3.25rem] w-full rounded-lg" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-3.5 w-[30%]" />
                  <Skeleton className="h-32 w-full rounded-md" />
                </div>
              </>
            ) : selected ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3">
                  <DetailItem label={t("emailInboxCustomerName")} value={selected.customerName} />
                  <DetailItem label={t("emailInboxAppointmentDate")} value={selected.appointmentDate} />
                  <DetailItem label={t("emailInboxEmailAddress")} value={selected.email} />
                  <DetailItem label={t("emailInboxTireSet")} value={selected.tireSet} />
                  <DetailItem label={t("emailInboxVehicle")} value={selected.vehicle} />
                  <div className="flex flex-col gap-1">
                    <span className="text-label-md text-muted-foreground">{t("emailInboxTimeWindow")}</span>
                    <span className="flex flex-wrap items-center gap-2 text-body-md text-foreground">
                      <span>{selected.timeWindow}</span>
                      {selected.windowOk ? (
                        <Badge className="border-0 bg-success-dark text-success-onContainer shadow-none">
                          {t("emailInboxWindowOk")}
                        </Badge>
                      ) : null}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-label-md text-muted-foreground">{t("emailInboxParsedPreview")}</p>
                  <pre className="max-h-48 overflow-auto rounded-md border border-border bg-muted/50 p-3 font-mono text-label-md leading-relaxed whitespace-pre-wrap text-foreground">
                    {selected.preview}
                  </pre>
                </div>
              </>
            ) : null}
          </CardContent>
          <CardFooter className="mt-auto shrink-0 flex-col gap-2 border-t px-4 py-4 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-2 sm:px-6">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading || !selected || !canActOnShipmentRequest || actionPending}
              onClick={() => setRejectOpen(true)}
              className="w-full border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] transition-all duration-[var(--duration-normal)] hover:border-[var(--color-error-main)] hover:bg-[var(--color-error-main)] hover:text-white sm:w-auto"
            >
              {t("emailInboxReject")}
            </Button>
            <Button
              type="button"
              disabled={isLoading || !selected || !canActOnShipmentRequest || actionPending}
              onClick={handleApproveCart}
              variant="brand"
              className="w-full sm:w-auto"
            >
              {moveToCartMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("emailInboxAddingToCart")}
                </span>
              ) : (
                t("emailInboxApproveCart")
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className={cn("max-w-md", DIALOG_SHELL_CLASS)}>
          <DialogHeader className="flex flex-row items-center gap-2 space-y-0 pe-10 text-start">
            <CircleX className="size-5 shrink-0 text-destructive" aria-hidden />
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {t("emailInboxRejectModalTitle")}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 flex flex-col items-center gap-4 pb-6 text-center">
            <span
              className="flex size-[4.25rem] items-center justify-center rounded-full bg-[var(--color-error-main)] shadow-inner"
              aria-hidden
            >
              <X className="size-9 stroke-[3] text-black" />
            </span>
            <p className="text-title-sm font-bold text-foreground">{t("emailInboxRejectModalHeadline")}</p>
            <DialogDescription className="text-body-sm leading-relaxed text-muted-foreground">
              {t("emailInboxRejectModalDescription")}
            </DialogDescription>
          </div>

          {selected ? (
            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 dark:bg-muted/15">
              <RejectSummaryRow label={t("emailInboxCustomerName")} value={selected.customerName} />
              <RejectSummaryRow label={t("emailInboxAppointmentDate")} value={selected.appointmentDate} />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-label-md font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("emailInboxRejectModalReasonFlagged")}
                </span>
                <Badge
                  className={cn(
                    "w-fit shrink-0 border-0 px-3 py-1 text-label-sm font-semibold shadow-none sm:ms-auto",
                    statusBadgeClass(selected.status),
                  )}
                >
                  {parseStatusCopy(t, selected.status)}
                </Badge>
              </div>
            </div>
          ) : null}

          <DialogFooter className="mt-6 flex-col-reverse gap-[12px] sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
              {t("emailInboxRejectModalCancel")}
            </Button>
            <Button
              type="button"
              className="border-0 bg-[var(--color-error-main)] font-semibold text-white shadow-none hover:bg-[var(--color-error-main)]/90 hover:text-white dark:hover:bg-[var(--color-error-main)]/90"
              disabled={!canActOnShipmentRequest || actionPending}
              onClick={handleRejectConfirm}
            >
              {rejectMutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t("emailInboxRejecting")}
                </span>
              ) : (
                t("emailInboxRejectModalConfirm")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RejectSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="shrink-0 text-label-md font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 break-words text-body-md font-semibold text-foreground sm:text-end">{value}</span>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="group min-w-0">
      <div className="mb-1.5 flex min-w-0 items-center gap-1.5">
        <span className="min-w-0 truncate text-label-md font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="min-w-0 rounded-lg border-2 border-surface-high bg-surface-bright p-2 transition-all group-hover:border-primary-dark group-hover:shadow-md sm:p-3">
        <span className="block min-w-0 break-words text-body-md font-semibold text-onSurface">{value}</span>
      </div>
    </div>
  );
}
