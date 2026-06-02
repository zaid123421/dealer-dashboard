"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  Package,
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePickupSuggestions, useCombinePickupMutation } from "@/modules/shipment-requests/hooks/use-pickup-suggestions";
import type { NormalizedPickupCandidate } from "@/modules/shipment-requests/lib/pickup-suggestion-dto";
import { COMBINE_PICKUP_DELIVERY_VERSION_FALLBACK } from "@/modules/shipment-requests/services/dealer-pickup-suggestion.service";
import { PRIMARY_BUTTON_RESPONSIVE } from "@/lib/primary-button-styles";
import { cn } from "@/lib/utils";

export type PickupSuggestionsStepProps = {
  deliveryId: number;
  deliveryVersion?: number | null;
  onFinish: () => void;
};

function formatDateTime(iso: string | null, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function StepperHeader({
  active,
  tc,
}: {
  active: 1 | 2;
  tc: (k: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 px-4 pb-2 pt-4 sm:gap-3 sm:px-6 sm:pt-6">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-label-sm font-bold transition-colors sm:size-8 sm:text-label-md",
            active === 1 ? "bg-amber-500 text-black" : "bg-emerald-500 text-white",
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
      <div className="h-px w-6 shrink-0 bg-transparent sm:w-12" aria-hidden />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-label-sm font-bold transition-colors sm:size-8 sm:text-label-md",
            active === 2 ? "bg-amber-500 text-black" : "bg-muted text-muted-foreground",
          )}
          aria-current={active === 2 ? "step" : undefined}
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

function CardSkeleton() {
  return (
    <div className="rounded-lg border-2 border-border/60 bg-card p-3 shadow-sm sm:p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="size-6 rounded-full" />
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  selected,
  onToggle,
  tc,
}: {
  candidate: NormalizedPickupCandidate;
  selected: boolean;
  onToggle: () => void;
  tc: (k: string, vals?: Record<string, number | string>) => string;
}) {
  const subtitle = [candidate.brand, candidate.size].filter(Boolean).join(" · ");

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        "group relative w-full overflow-hidden rounded-lg border-2 bg-card p-3 text-start shadow-sm sm:p-4",
        "transition-all duration-[var(--duration-normal)]",
        "hover:border-amber-400/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60",
        selected
          ? "border-amber-500 bg-amber-50/60 ring-1 ring-amber-500/40 dark:bg-amber-950/20"
          : "border-border/70",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 start-0 w-1 transition-colors",
          selected ? "bg-amber-500" : "bg-transparent",
        )}
        aria-hidden
      />

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors sm:size-10",
            selected
              ? "bg-amber-500 text-black"
              : "bg-muted text-muted-foreground group-hover:bg-amber-100 group-hover:text-amber-700 dark:group-hover:bg-amber-900/40 dark:group-hover:text-amber-300",
          )}
          aria-hidden
        >
          <Package className="size-4 sm:size-5" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-body-md font-bold leading-snug text-foreground">{candidate.label}</p>
          {subtitle ? (
            <p className="mt-0.5 text-body-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {candidate.seasonType ? (
              <Badge className="border-0 bg-muted px-2 py-0.5 text-label-sm font-semibold text-muted-foreground shadow-none">
                {candidate.seasonType}
              </Badge>
            ) : null}
            <Badge className="border-0 bg-blue-100 px-2 py-0.5 text-label-sm font-semibold text-blue-700 shadow-none dark:bg-blue-950/40 dark:text-blue-300">
              {tc("cardTiresCount", { count: candidate.tireCount })}
            </Badge>
            <Badge className="border-0 bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground shadow-none">
              #{candidate.setId}
            </Badge>
          </div>
        </div>

        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            selected
              ? "border-amber-500 bg-amber-500 text-black"
              : "border-border bg-card text-transparent",
          )}
          aria-hidden
        >
          <Check className="size-4" strokeWidth={3} />
        </div>
      </div>
    </button>
  );
}

export function PickupSuggestionsStep({
  deliveryId,
  deliveryVersion,
  onFinish,
}: PickupSuggestionsStepProps) {
  const tc = useTranslations("combinePickup");
  const locale = useLocale();
  const [selectedSetIds, setSelectedSetIds] = useState<Set<number>>(new Set());

  const { data, isPending, isError, isFetching, refetch } = usePickupSuggestions(deliveryId);
  const combineMutation = useCombinePickupMutation(deliveryId);

  const candidates = data?.candidates ?? [];
  const loading = isPending || (isFetching && candidates.length === 0);
  const resolvedDeliveryVersion =
    deliveryVersion ?? COMBINE_PICKUP_DELIVERY_VERSION_FALLBACK;

  const selectionStats = useMemo(() => {
    let tires = 0;
    const setIds: number[] = [];
    for (const c of candidates) {
      if (selectedSetIds.has(c.setId)) {
        tires += c.tireCount;
        setIds.push(c.setId);
      }
    }
    return { sets: setIds.length, tires, setIds };
  }, [candidates, selectedSetIds]);

  function toggle(setId: number) {
    setSelectedSetIds((prev) => {
      const next = new Set(prev);
      if (next.has(setId)) next.delete(setId);
      else next.add(setId);
      return next;
    });
  }

  function selectAll() {
    setSelectedSetIds(new Set(candidates.map((c) => c.setId)));
  }

  function clearAll() {
    setSelectedSetIds(new Set());
  }

  async function handleConfirm() {
    if (selectionStats.setIds.length === 0) return;
    try {
      await combineMutation.mutateAsync({
        setIds: selectionStats.setIds,
        deliveryVersion: resolvedDeliveryVersion,
      });
      toast.success(
        tc("successCombined", {
          count: selectionStats.sets,
        }),
      );
      onFinish();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tc("errorCombining"));
    }
  }

  const isMutating = combineMutation.isPending;
  const windowLabel =
    data?.windowStart || data?.windowEnd
      ? tc("serviceWindow", {
          start: formatDateTime(data?.windowStart ?? null, locale),
          end: formatDateTime(data?.windowEnd ?? null, locale),
        })
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StepperHeader active={2} tc={tc} />

      <div className="px-4 pb-2 sm:px-6">
        <h2 className="text-title-md font-bold text-foreground sm:text-headline-sm">{tc("title")}</h2>
        <p className="mt-1 text-body-sm text-muted-foreground">{tc("subtitle")}</p>
        {windowLabel ? (
          <p className="mt-2 flex items-start gap-1.5 text-body-sm text-muted-foreground">
            <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{windowLabel}</span>
          </p>
        ) : null}
      </div>

      <div className="mx-4 my-3 flex gap-3 rounded-lg border border-amber-400/60 bg-amber-50 px-3 py-3 sm:mx-6 sm:px-4 dark:border-amber-500/40 dark:bg-amber-950/20">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden />
        <div className="text-body-sm text-amber-900 dark:text-amber-200">
          <p className="font-bold">{tc("bannerTitle")}</p>
          <p className="mt-0.5 leading-relaxed">{tc("bannerBody")}</p>
        </div>
      </div>

      {!loading && !isError && candidates.length > 0 ? (
        <div className="flex flex-col gap-2 px-4 pb-2 pt-1 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-body-sm text-muted-foreground">
            {tc("countAvailable", { count: candidates.length })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-body-sm font-medium"
              onClick={selectAll}
              disabled={selectedSetIds.size === candidates.length}
            >
              {tc("selectAll")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-body-sm font-medium"
              onClick={clearAll}
              disabled={selectedSetIds.size === 0}
            >
              {tc("clearSelection")}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2 sm:px-6">
        {loading ? (
          <div className="flex flex-col gap-3 pb-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : isError ? (
          <ErrorAlert
            message={tc("error")}
            onRetry={() => void refetch()}
            retryLabel={tc("retry")}
            className="py-6"
          />
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center">
            <div
              className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
              aria-hidden
            >
              <Package className="size-6" />
            </div>
            <p className="text-body-md font-semibold text-foreground">{tc("empty")}</p>
            <p className="max-w-xs text-body-sm text-muted-foreground">{tc("emptyHint")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.setId}
                candidate={candidate}
                selected={selectedSetIds.has(candidate.setId)}
                onToggle={() => toggle(candidate.setId)}
                tc={tc}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 bg-card/60 px-4 py-3 sm:px-6 sm:py-4 dark:bg-black/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-body-sm">
            {selectionStats.sets > 0 ? (
              <p className="font-semibold text-foreground">
                {tc("footerSelectionSets", {
                  sets: selectionStats.sets,
                  tires: selectionStats.tires,
                })}
              </p>
            ) : (
              <p className="text-muted-foreground">{tc("footerNoSelection")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg border-border/80 bg-transparent font-medium shadow-none sm:w-auto"
              onClick={onFinish}
              disabled={isMutating}
            >
              {tc("skip")}
            </Button>
            <Button
              type="button"
              variant="brand"
              size="lg"
              className={cn("h-11 rounded-lg", PRIMARY_BUTTON_RESPONSIVE)}
              onClick={() => void handleConfirm()}
              disabled={selectionStats.sets === 0 || isMutating}
            >
              {isMutating
                ? tc("combining")
                : tc("confirmCombineSets", { count: selectionStats.sets })}
              {!isMutating ? <ArrowRight className="size-4 shrink-0" aria-hidden /> : null}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
