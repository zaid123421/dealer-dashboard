"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Car, CircleX, Clock, FileText, Layers, Loader2, Mail, Search, User, X } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatTile, StatTileBox } from "@/components/ui/stat-tile";
import { Dialog } from "@/components/ui/dialog";
import {
  ConfirmDialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/app-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useViewOnlyMode } from "@/modules/dealer/hooks/use-view-only-mode";
import { useDealerInboundEmails } from "@/modules/inbound-emails/hooks/use-dealer-inbound-emails";
import { useInboundEmailDraft } from "@/modules/inbound-emails/hooks/use-inbound-email-draft";
import {
  formatDraftAppointment,
  formatDraftTireSets,
  formatDraftTimeWindow,
  formatDraftVehicle,
  formatInboundEmailBody,
} from "@/modules/inbound-emails/lib/inbound-email-draft-display";
import type { InboundStatusTone } from "@/modules/inbound-emails/lib/inbound-email-dto";
import {
  getInboundStatusTone,
  isInboundStatusFailed,
} from "@/modules/inbound-emails/lib/inbound-email-dto";
import { removeInboundEmailFromListCache } from "@/modules/inbound-emails/lib/inbound-emails-cache";
import type { DealerInboundEmailsQuery } from "@/modules/inbound-emails/services/dealer-inbound-emails.service";
import { useRejectShipmentRequest } from "@/modules/shipment-requests/hooks/use-reject-shipment-request";
import { useMoveShipmentRequestToCart } from "@/modules/shipment-requests/hooks/use-move-shipment-request-to-cart";

function EmailListItemSkeleton() {
  return (
    <div
      className="relative flex w-full min-w-0 items-start gap-2 rounded-md border border-transparent bg-muted/20 p-3 dark:bg-surface-container sm:gap-3 sm:p-4"
      aria-hidden
    >
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">
        <Skeleton className="h-3.5 w-[60%]" />
        <Skeleton className="h-4 w-[85%]" />
        <Skeleton className="h-3 w-[30%]" />
      </div>
      <Skeleton className="h-6 w-16 shrink-0 rounded-md" />
    </div>
  );
}

function EmailDetailCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
          <Skeleton className="mx-auto size-12 shrink-0 rounded-full sm:size-16 lg:mx-0" />
          <div className="min-w-0 flex-1">
            <div className="mb-4 space-y-2 text-center lg:text-left">
              <Skeleton className="mx-auto h-6 w-[58%] max-w-xs lg:mx-0" />
              <Skeleton className="mx-auto h-4 w-[42%] max-w-[14rem] lg:mx-0" />
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-0">
                  <Skeleton className="mb-2 h-3 w-24" />
                  <Skeleton className="h-10 w-full rounded-lg sm:h-12" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 lg:w-auto">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-border/60">
          <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3">
            <Skeleton className="size-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="space-y-3 px-4 py-5">
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[78%]" />
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function statusBadgeClass(tone: InboundStatusTone): string {
  switch (tone) {
    case "success":
      return "border-0 bg-success-dark text-success-onContainer shadow-none";
    case "warning":
      return "border-0 bg-warning-dark/90 text-warning-onContainer shadow-none";
    case "error":
      return "border-0 bg-error-main text-destructive-foreground shadow-none";
    case "info":
      return "border-0 bg-info-main text-white shadow-none";
    default:
      return "border-0 bg-secondary text-secondary-foreground shadow-none";
  }
}

export default function EmailInboxPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const inboundEmailsQuery = useMemo<DealerInboundEmailsQuery>(
    () => ({
      page: 0,
      size: 20,
      sortBy: "receivedAt",
      direction: "desc",
      view: "ACTIONABLE",
      locale,
    }),
    [locale],
  );
  const { data, isLoading, isError } = useDealerInboundEmails(inboundEmailsQuery);

  const suggestions = useMemo(() => data?.rows ?? [], [data?.rows]);
  const [dismissedEmailIds, setDismissedEmailIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const visibleSuggestions = useMemo(
    () => {
      const base = suggestions.filter((row) => !dismissedEmailIds.includes(row.id));
      const q = searchQuery.trim().toLowerCase();
      if (!q) return base;
      return base.filter((row) => {
        const hay = [row.from, row.subject, row.status, row.receivedAt, row.email, row.preview]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    },
    [dismissedEmailIds, suggestions, searchQuery],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const resolvedSelectedId = useMemo(() => {
    if (visibleSuggestions.length === 0) return null;
    if (selectedId && visibleSuggestions.some((row) => row.id === selectedId)) {
      return selectedId;
    }
    return visibleSuggestions[0]?.id ?? null;
  }, [selectedId, visibleSuggestions]);

  const [rejectOpen, setRejectOpen] = useState(false);
  const rejectMutation = useRejectShipmentRequest();
  const moveToCartMutation = useMoveShipmentRequestToCart();
  const { isViewOnly } = useViewOnlyMode();

  const selected =
    resolvedSelectedId == null
      ? undefined
      : visibleSuggestions.find((row) => row.id === resolvedSelectedId);
  const {
    data: draft,
    isLoading: isDraftLoading,
    isError: isDraftError,
  } = useInboundEmailDraft(selected?.id);

  const draftVersion = draft?.version ?? 0;
  const canActOnShipmentRequest = Boolean(draft?.id && draft.status === "DRAFT");
  const actionPending = isViewOnly || rejectMutation.isPending || moveToCartMutation.isPending;
  const emailBodyText = formatInboundEmailBody(draft?.body);

  function dismissInboundEmail(inboundEmailId: string) {
    setDismissedEmailIds((current) =>
      current.includes(inboundEmailId) ? current : [...current, inboundEmailId],
    );
    removeInboundEmailFromListCache(queryClient, inboundEmailId, inboundEmailsQuery);
    if (selectedId === inboundEmailId) {
      setSelectedId(null);
    }
  }

  function handleRejectConfirm() {
    if (!draft?.id) {
      toast.error(t("emailInboxRejectMissingRequest"));
      return;
    }

    rejectMutation.mutate(
      { shipmentRequestId: draft.id, version: draftVersion },
      {
        onSuccess: () => {
          if (selected?.id) dismissInboundEmail(selected.id);
          toast.success(t("emailInboxRejectSuccess"));
          setRejectOpen(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : t("emailInboxRejectError"));
        },
      },
    );
  }

  function handleApproveCart() {
    if (!draft?.id) {
      toast.error(t("emailInboxRejectMissingRequest"));
      return;
    }

    moveToCartMutation.mutate(
      { shipmentRequestId: draft.id, version: draftVersion },
      {
        onSuccess: () => {
          if (selected?.id) dismissInboundEmail(selected.id);
          toast.success(t("emailInboxApproveCartSuccess"));
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : t("emailInboxApproveCartError"));
        },
      },
    );
  }

  const pendingCount = visibleSuggestions.filter((s) => !isInboundStatusFailed(s.status)).length;
  const lastSyncedTime = visibleSuggestions[0]?.receivedAt ?? "—";

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

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto lg:grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)]">
        <div className="flex min-h-[200px] flex-col gap-2 overflow-hidden rounded-lg bg-muted/40 p-2 dark:bg-surface-container sm:min-h-0 lg:max-h-[min(680px,calc(100dvh-13rem))]">
          <div className="shrink-0 space-y-3 px-2 pt-1">
            <h2 className="text-title-md font-semibold text-foreground">{t("emailInboxParsedEmails")}</h2>
            <div className="text-body-md text-muted-foreground">
              {isLoading ? (
                <Skeleton className="mt-1 h-4 w-[55%]" />
              ) : (
                t("emailInboxLastSynced", { time: lastSyncedTime })
              )}
            </div>
            <div className="relative">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("emailInboxSearchPlaceholder")}
                className="w-full ps-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={t("emailInboxSearchPlaceholder")}
              />
            </div>
          </div>
          <div className="scrollbar-custom min-h-0 flex-1 overflow-auto space-y-3">
            {isLoading ? (
              <div className="space-y-3" aria-busy="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <EmailListItemSkeleton key={i} />
                ))}
              </div>
            ) : visibleSuggestions.length === 0 ? (
              <p className="p-4 text-center text-body-md text-muted-foreground">{t("emailInboxEmpty")}</p>
            ) : (
              visibleSuggestions.map((row) => {
                const active = selected?.id === row.id;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    className={cn(
                      "relative flex w-full min-w-0 items-start gap-2 rounded-md p-3 text-start transition-colors hover:bg-accent/50 sm:gap-3 sm:p-4",
                      active
                        ? "border border-primary-dark bg-primary-container/20 dark:bg-[#231f1a]"
                        : "border border-transparent bg-muted/20 dark:bg-surface-container",
                    )}
                  >
                    {active && (
                      <span
                        className="absolute start-0 top-0 h-full w-2 rounded-full bg-primary-dark"
                        aria-hidden
                      />
                    )}
                    <div className="min-w-0 flex-1 space-y-0.5 ps-1">
                      <span className="block text-label-md leading-snug text-muted-foreground">
                        <span>{t("emailInboxLabelFrom")}: </span>
                        <span className="break-all font-medium text-foreground">{row.from}</span>
                      </span>
                      <span className="block font-bold leading-snug text-foreground">{row.subject}</span>
                      <span className="text-label-sm text-muted-foreground">{row.receivedAt}</span>
                    </div>
                    <Badge
                      className={cn(
                        "shrink-0 text-label-sm",
                        statusBadgeClass(getInboundStatusTone(row.status)),
                      )}
                    >
                      {row.status}
                    </Badge>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="scrollbar-custom flex min-h-[280px] min-w-0 flex-col gap-4 overflow-y-auto sm:min-h-0 lg:max-h-[min(680px,calc(100dvh-13rem))]">
          {isLoading || (selected && isDraftLoading) ? (
            <EmailDetailCardSkeleton />
          ) : isDraftError ? (
            <ErrorAlert message={t("emailInboxDraftLoadError")} />
          ) : selected && draft ? (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-dark/10 text-primary-dark transition-all duration-200 hover:scale-105 sm:size-16 lg:mx-0">
                    <Mail className="size-6 sm:size-7" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1 text-center lg:text-left">
                    <h2 className="mb-2 line-clamp-2 text-lg font-bold text-foreground sm:text-xl md:text-headline-sm">
                      {selected.subject}
                    </h2>
                    <p className="mb-4 truncate px-2 text-sm text-muted-foreground lg:px-0">
                      {selected.from}
                    </p>
                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:gap-4">
                      <StatTile
                        icon={User}
                        label={t("emailInboxCustomerName")}
                        value={draft.customerDisplayName}
                      />
                      <StatTile
                        icon={Calendar}
                        label={t("emailInboxAppointmentDate")}
                        value={formatDraftAppointment(draft.swapAppointment, locale)}
                      />
                      <StatTile
                        icon={Mail}
                        label={t("emailInboxEmailAddress")}
                        value={selected.email}
                        valueClassName="break-all"
                      />
                      <StatTile
                        icon={Layers}
                        label={t("emailInboxTireSet")}
                        value={formatDraftTireSets(draft.sets)}
                      />
                      <StatTile
                        icon={Car}
                        label={t("emailInboxVehicle")}
                        value={formatDraftVehicle(draft.vehiclePlate, draft.vehicleVin)}
                      />
                      <div className="min-w-0">
                        <div className="mb-2 flex min-w-0 items-center gap-2">
                          <Clock className="size-3 text-primary-dark sm:size-4" />
                          <span className="min-w-0 truncate whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm">
                            {t("emailInboxTimeWindow")}
                          </span>
                        </div>
                        <StatTileBox className="flex min-h-10 flex-wrap items-center gap-2 p-2 sm:min-h-12 sm:p-3">
                          <span className="text-sm font-semibold text-foreground sm:text-base">
                            {formatDraftTimeWindow(draft.swapAppointment, locale)}
                          </span>
                          {draft.swapAppointment ? (
                            <Badge className="border-0 bg-success-dark text-success-onContainer shadow-none">
                              {t("emailInboxWindowOk")}
                            </Badge>
                          ) : null}
                        </StatTileBox>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full shrink-0 flex-wrap justify-center gap-2 lg:w-auto lg:flex-col lg:items-stretch">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!canActOnShipmentRequest || actionPending}
                      onClick={() => setRejectOpen(true)}
                      className="h-9 flex-1 border-[var(--color-error-main)] bg-transparent text-[var(--color-error-main)] transition-all duration-[var(--duration-normal)] hover:border-[var(--color-error-main)] hover:bg-[var(--color-error-main)] hover:text-white sm:flex-initial lg:w-full"
                    >
                      {t("emailInboxReject")}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={!canActOnShipmentRequest || actionPending}
                      onClick={handleApproveCart}
                      variant="brand"
                      className="h-9 flex-1 sm:flex-initial lg:w-full"
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
                  </div>
                </div>

                <div className="mt-5 overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-muted/35 to-muted/10 dark:from-surface-container/80 dark:to-surface-container/40">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-surface-light/70 px-4 py-3 dark:bg-surface-bright/40">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-dark/10 text-primary-dark">
                        <FileText className="size-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-label-md font-semibold text-foreground">
                          {t("emailInboxEmailBody")}
                        </p>
                        <p className="truncate text-label-sm text-muted-foreground">
                          {t("emailInboxEmailBodyMeta", {
                            from: selected.from,
                            time: selected.receivedAt,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-auto px-4 py-4 sm:px-5 sm:py-5">
                    {emailBodyText ? (
                      <div className="space-y-3 text-start">
                        {emailBodyText.split(/\n{2,}/).map((paragraph, index) => (
                          <p
                            key={index}
                            className="whitespace-pre-wrap text-body-sm leading-7 text-foreground/90"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-body-sm text-muted-foreground">
                        {t("emailInboxEmailBodyEmpty")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : selected ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-body-md text-muted-foreground sm:p-12">
              {t("emailInboxDraftLoading")}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-body-md text-muted-foreground sm:p-12">
              {t("emailInboxEmpty")}
            </div>
          )}
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <ConfirmDialogContent>
          <div className="flex flex-row items-center gap-2 pe-10 text-start">
            <CircleX className="size-5 shrink-0 text-destructive" aria-hidden />
            <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
              {t("emailInboxRejectModalTitle")}
            </DialogTitle>
          </div>

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

          {selected && draft ? (
            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 dark:bg-muted/15">
              <RejectSummaryRow label={t("emailInboxCustomerName")} value={draft.customerDisplayName} />
              <RejectSummaryRow
                label={t("emailInboxAppointmentDate")}
                value={formatDraftAppointment(draft.swapAppointment, locale)}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-label-md font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("emailInboxRejectModalReasonFlagged")}
                </span>
                <Badge
                  className={cn(
                    "w-fit shrink-0 border-0 px-3 py-1 text-label-sm font-semibold shadow-none sm:ms-auto",
                    statusBadgeClass(getInboundStatusTone(selected.status)),
                  )}
                >
                  {selected.status}
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
        </ConfirmDialogContent>
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
